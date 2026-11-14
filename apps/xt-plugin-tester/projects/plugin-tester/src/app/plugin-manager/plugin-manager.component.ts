import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { XtComponentInfo, XtPluginInfo, XtResolverService } from 'xt-components';
import { Button } from '@openng/optimus-ui/button';
import { ConfirmationService, PrimeIcons } from '@openng/optimus-ui/api';
import { XtTypeDetail, XtTypeInfo, isTypeDetail } from 'xt-type';
import { Card } from '@openng/optimus-ui/card';
import { Panel } from '@openng/optimus-ui/panel';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent } from '@openng/optimus-ui/autocomplete';
import { Chip } from '@openng/optimus-ui/chip';
import { Tag } from '@openng/optimus-ui/tag';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { Subscription } from 'rxjs';
import { FormErrorDisplayerComponent } from '../form-error-displayer/form-error-displayer.component';
import { httpResource } from '@angular/common/http';
import { TesterSessionService, LoadedPlugin } from '../core/tester-session.service';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@openng/optimus-ui/tabs';

type PluginInfo = {
  plugin: string;
  urls: Array<string>;
};

@Component({
  selector: 'app-plugin-manager',
  imports: [
    Button,
    Card,
    Panel,
    FormsModule,
    AutoComplete,
    ReactiveFormsModule,
    FormErrorDisplayerComponent,
    Chip,
    Tag,
    Tooltip,
    PageHeaderComponent,
    Tabs,
    Tab, TabList, TabPanel, TabPanels
  ],
  templateUrl: './plugin-manager.component.html',
  styleUrl: './plugin-manager.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PluginManagerComponent implements OnDestroy {
  private readonly subscriptions = new Subscription();
  readonly resolverService = inject(XtResolverService);
  readonly session = inject(TesterSessionService);
  readonly fb = inject(FormBuilder);
  readonly errorHandler = inject(ErrorHandlerService);
  private readonly confirmation = inject(ConfirmationService);

  readonly formValid = signal(false);

  /** Plugins registered in the resolver, wrapped for display. */
  listPlugins = computed<PluginDisplayInfo[]>(() => {
    return this.transform(this.resolverService.listPlugins());
  });

  /** Plugins whose last load attempt failed (they are not in the resolver). */
  failedPlugins = computed<LoadedPlugin[]>(() => {
    return this.session.loadedPlugins().filter((p) => p.error != null);
  });

  form = this.fb.group({
    pluginUrl: ['', [Validators.required, Validators.pattern('(ftp|ftps|http|https):\\/\\/[^ "]+')]],
  });

  loadedListUrls = httpResource<PluginInfo[]>(() => 'assets/config/plugin-urls.json');

  /** The list of known plugins suggested to the user, guarded against unexpected payloads. */
  knownPlugins = computed<PluginInfo[]>(() => {
    const value = this.loadedListUrls.value();
    return Array.isArray(value) ? value : [];
  });

  knownPluginSources = computed<string[]>(() => {
    const pluginInfos = this.loadedListUrls.value();
    if (pluginInfos!=null) {
      return ['Local','Latest','Next', 'Others'];
    }
    return [];
  });

  /** The currently selected quick load source tab. */
  readonly activeSource = signal<string | number | undefined>('Local');

  suggestedUrls = signal<PluginInfo[]>([]);

  constructor() {
    this.subscriptions.add(
      this.form.statusChanges.subscribe({
        next: (status) => {
          this.formValid.set(status === 'VALID');
        },
      })
    );
  }

  knownPluginsPerSource (source: string) :PluginInfo[]{
    const ret:PluginInfo[]=[];
    const value = this.loadedListUrls.value();
    if( value!=null) {
      let newInfo:PluginInfo;
      for (const pluginInfo of value) {
        if( source=='Local'|| source=='Next' || source=='Latest') {
          newInfo = { plugin: pluginInfo.plugin, urls:pluginInfo.urls.filter((url)=> {
            const toSearch=(source=='Local')?'//localhost':'/'+source.toLowerCase()+'/';
            return url.indexOf(toSearch)!=-1;
          }) };
        } else {
          newInfo = { plugin: pluginInfo.plugin, urls:pluginInfo.urls.filter((url)=> {
              return url.indexOf('//localhost')==-1 && url.indexOf('/next/')==-1 && url.indexOf('/latest/')==-1;
            }) };
        }
        if (newInfo.urls.length>0) {
          ret.push(newInfo);
        }
     }
    }
    return ret;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  transform(plugins: XtPluginInfo[]): PluginDisplayInfo[] {
    const ret = new Array<PluginDisplayInfo>();
    for (const plugin of plugins) {
      ret.push(new PluginDisplayInfo(plugin));
    }
    return ret;
  }

  /** The session record (url, builtin flag, errors) for a plugin name. */
  recordFor(plugin: PluginDisplayInfo): LoadedPlugin | undefined {
    return this.session.loadedPlugins().find((p) => p.name === plugin.name);
  }

  componentCount(plugin: PluginDisplayInfo): number {
    return plugin.details?.components?.length ?? 0;
  }

  typeCount(plugin: PluginDisplayInfo): number {
    return plugin.details?.types?.length ?? 0;
  }

  detailButtonClicked(plugin: PluginDisplayInfo): void {
    plugin.isOpen.set(!plugin.isOpen());
  }

  detailButtonIcon(plugin: PluginDisplayInfo): string {
    return plugin.isOpen() ? PrimeIcons.CHEVRON_UP : PrimeIcons.CHEVRON_DOWN;
  }

  listSuggestions(event: AutoCompleteCompleteEvent): void {
    const listPlugins = this.knownPlugins();
    const query = event.query ?? '';
    const selected: PluginInfo[] = [];
    for (const plugin of listPlugins) {
      const filtered = plugin.urls?.filter((url) => url.indexOf(query) !== -1) ?? [];
      if (filtered.length > 0) {
        selected.push({ plugin: plugin.plugin, urls: filtered });
      } else if (plugin.plugin?.toLowerCase().includes(query.toLowerCase())) {
        // Also match on the plugin name, not only the url.
        selected.push({ plugin: plugin.plugin, urls: plugin.urls ?? [] });
      }
    }
    this.suggestedUrls.set(selected);
  }

  /** Quick load a url coming from the known plugins list. */
  quickLoad(url: string): void {
    this.form.patchValue({ pluginUrl: url });
    void this.session.loadPlugin(url);
  }

  async loadPlugin(): Promise<void> {
    if (!this.formValid()) {
      this.errorHandler.errorOccurred(new Error('Form is not valid'), 'Form is not valid');
      return;
    }
    const url = this.form.value['pluginUrl']!;
    await this.session.loadPlugin(url);
  }

  reload(plugin: PluginDisplayInfo): void {
    const record = this.recordFor(plugin);
    if (record) void this.session.reloadPlugin(record);
  }

  confirmRemove(plugin: PluginDisplayInfo): void {
    const record = this.recordFor(plugin);
    if (record == null || record.builtin) return;
    this.confirmation.confirm({
      message: `Remove the plugin "${plugin.name}" from the tester?`,
      header: 'Remove plugin',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Remove', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', text: true },
      accept: () => this.session.removePlugin(record),
    });
  }

  removeFailed(plugin: LoadedPlugin): void {
    this.session.removePlugin(plugin);
  }

  confirmClearAll(): void {
    const count = this.session.loadedPlugins().filter((p) => !p.builtin).length;
    if (count === 0) return;
    this.confirmation.confirm({
      message: `Remove all ${count} loaded plugin(s)?`,
      header: 'Clear all plugins',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Clear all', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', text: true },
      accept: () => this.session.clearPlugins(),
    });
  }
}

class PluginDisplayInfo {
  isOpen = signal(false);
  name: string;
  category = 'UI';
  logoUrl: string;
  details?: {
    components: ComponentDisplayInfo[];
    types: TypeDisplayInfo[];
  };

  constructor(public plugin: XtPluginInfo) {
    this.name = plugin.name;
    this.details = {
      components: new Array<ComponentDisplayInfo>(),
      types: new Array<TypeDisplayInfo>(),
    };
    this.logoUrl = plugin.uriLogo ?? 'assets/plugin-default-img.jpg';
    for (const comp of plugin.components || []) {
      this.details.components.push(new ComponentDisplayInfo(comp));
    }
    for (const type in plugin.types || {}) {
      this.details.types.push(new TypeDisplayInfo(type, plugin.types![type]));
    }
  }
}

class ComponentDisplayInfo {
  name: string;
  className: string;
  types: string[];

  constructor(comp: XtComponentInfo<any>) {
    this.name = comp.componentName;
    this.className = comp.componentClass?.name ?? '';
    this.types = comp.typesHandled ?? [];
  }

  typesAsString(): string {
    return this.types.join(', ');
  }
}

class TypeDisplayInfo {
  name: string;
  typeName?: string;
  properties?: string[];

  constructor(name: string, type: XtTypeInfo | XtTypeDetail | string) {
    this.name = name;
    if (typeof type === 'string') {
      this.typeName = type;
    } else if (type != null && typeof type === 'object' && !isTypeDetail(type)) {
      this.properties = Object.keys(type);
    }
  }

  /** A short human readable summary of the type. */
  get description(): string {
    if (this.typeName != null) return this.typeName;
    if (this.properties != null) {
      return this.properties.length === 1 ? '1 property' : `${this.properties.length} properties`;
    }
    return 'detailed type';
  }
}
