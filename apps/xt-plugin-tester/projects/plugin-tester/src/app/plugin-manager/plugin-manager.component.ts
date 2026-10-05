import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject, linkedSignal,
  OnDestroy,
  OnInit,
  resource,
  signal
} from '@angular/core';
import { XtComponentInfo, XtPluginInfo, XtResolverService } from 'xt-components';
import { Button } from 'primeng/button';
import { PrimeIcons } from 'primeng/api';
import { XtTypeDetail, XtTypeInfo, isTypeDetail } from 'xt-type';
import { Card } from 'primeng/card';
import { DOCUMENT, JsonPipe } from '@angular/common';
import { Panel } from 'primeng/panel';
import { Fieldset } from 'primeng/fieldset';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { Subscription } from 'rxjs';
import { FormErrorDisplayerComponent } from '../form-error-displayer/form-error-displayer.component';
import { httpResource } from '@angular/common/http';
import { loadRemoteModule } from '@angular-architects/native-federation';

type PluginInfo ={
  plugin: string;
  urls: Array<string>;
}

@Component({
  selector: 'app-plugin-manager',
  imports: [
    Button,
    Card,
    JsonPipe,
    Panel,
    Fieldset,
    FormsModule,
    AutoComplete,
    ReactiveFormsModule,
    FormErrorDisplayerComponent
  ],
  templateUrl: './plugin-manager.component.html',
  styleUrl: './plugin-manager.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginManagerComponent implements OnDestroy, OnInit {

  subscriptions = new Subscription();
  resolverService = inject(XtResolverService);
  fb = inject(FormBuilder);
  errorHandler = inject (ErrorHandlerService);
  formValid = signal(false);
  private document = inject(DOCUMENT);

  listPlugins=computed<PluginDisplayInfo[]>( () => {
    return this.transform(this.resolverService.listPlugins());
  });

  form=this.fb.group({
    pluginUrl: ['', [Validators.required, Validators.pattern("(ftp|ftps|http|https):\\/\\/[^ \"]+")]],
  });

  loadedListUrls = httpResource<PluginInfo[]> (() => 'assets/config/plugin-urls.json');
  // fullListUrls = signal<Set<PluginInfo>>(new Set());
  suggestedUrls = signal<PluginInfo[]>([]);

  constructor () {
    this.subscriptions.add(this.form.statusChanges.subscribe({
      next: (status) => {
        this.formValid.set((status == 'VALID'));
      }
    }));
  }

  ngOnInit(): void {
        // Loads the default urls

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  transform(plugins:XtPluginInfo[]): PluginDisplayInfo[] {
    const ret = new Array<PluginDisplayInfo>();
    for (const plugin of plugins) {
      ret.push(new PluginDisplayInfo(plugin));
    }
    return ret;
  }

  detailButtonClicked (plugin:PluginDisplayInfo) {
    plugin.isOpen.set(!plugin.isOpen());
  }

  detailButtonIcon(plugin: PluginDisplayInfo) {
    return plugin.isOpen()?PrimeIcons.CHEVRON_UP:PrimeIcons.CHEVRON_DOWN;
  }

  protected readonly ComponentDisplayInfo = ComponentDisplayInfo;

  listSuggestions(event: AutoCompleteCompleteEvent) {
    const listPlugins = this.loadedListUrls.value();
    if (listPlugins==null) {
      this.suggestedUrls.set([]);
      return;
    }
    const selected: PluginInfo[]=[];
    for (const plugin of listPlugins) {
      const filtered=plugin.urls.filter((url) => {
        return url.indexOf(event.query)!=-1;
      });
      if (filtered.length>0){
        selected.push({plugin:plugin.plugin, urls:filtered});
      }
    }
    this.suggestedUrls.set(selected);
  }

  private getBaseUrl(remoteEntryUrl: string): string {
    const lastSlash = remoteEntryUrl.lastIndexOf('/');
    return lastSlash >= 0 ? remoteEntryUrl.substring(0, lastSlash + 1) : remoteEntryUrl + '/';
  }

  private hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  private applyPluginCss(pluginName: string, baseUrl: string, cssUrls?: string[]) {
    if (!cssUrls || cssUrls.length === 0) return;
    for (const css of cssUrls) {
      try {
        const href = css.startsWith('http://') || css.startsWith('https://') || css.startsWith('//')
          ? css
          : new URL(css, baseUrl).toString();
        const safeName = pluginName.replace(/[^a-zA-Z0-9_-]/g, '_');
        const id = `plugin-css-${safeName}-${this.hash(href)}`;
        if (this.document.getElementById(id)) continue; // already loaded
        const link = this.document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute('data-plugin', pluginName);
        this.document.head.appendChild(link);
      } catch (e) {
        console.warn(`Failed to load plugin CSS for ${pluginName}: ${css}`, e);
      }
    }
  }

  async loadPlugin() {
    if( !this.formValid()) {
      this.errorHandler.errorOccurred(new Error("Form is not valid"), "Form is not valid");
    } else {
        // Adds the typed url to the list
      try {
        let url = this.form.value['pluginUrl']!;
        if (!url.endsWith("remoteEntry.json")) {
          url = url+(url.endsWith('/')?'':'/')+'remoteEntry.json';
        }
        const module = await loadRemoteModule({
          remoteEntry: url,
          exposedModule: './Register'
        });

        const pluginName = this.resolverService.registerPluginModule(module, url) as string | null;
        if (pluginName) {
          // apply CSS if declared
          const baseUrl = this.getBaseUrl(url);
          const pluginInfo = this.resolverService.listPlugins().find(p => p.name === pluginName);
          this.applyPluginCss(pluginName, baseUrl, pluginInfo?.cssUrls);
        }

        this.resolverService.resolvePendingReferences();
      } catch (error) {
        this.errorHandler.errorOccurred(error, "Error while resolving pending references.");
      }
    }
  }

}

class PluginDisplayInfo {
  isOpen= signal(false);
  name:string;
  category:string='UI';
  logoUrl:string;
  details?: {
    components:ComponentDisplayInfo[],
    types:TypeDisplayInfo[]
  }

  constructor (public plugin:XtPluginInfo) {
    this.name=plugin.name;
    this.details={
      components:new Array<ComponentDisplayInfo>(),
      types:new Array<TypeDisplayInfo>()
    };
    this.logoUrl=plugin.uriLogo??'assets/plugin-default-img.jpg';
    for (const comp of plugin.components||[]) {
      this.details.components.push(new ComponentDisplayInfo(comp));
    }
    for (const type in plugin.types||{}) {
      this.details.types.push(new TypeDisplayInfo(type, plugin.types![type]));
    }
  }
}

class ComponentDisplayInfo{
  name:string;
  className: string;
  types:string[];

  constructor(comp:XtComponentInfo<any>) {
    this.name = comp.componentName;
    this.className=comp.componentClass.name;
    this.types=comp.typesHandled;
  }

  typesAsString() {
    let first=true;
    let ret= "";
    for (const type of this.types) {
      if (!first) ret+=", ";
      else first=false;
      ret+=type;
    }
    return ret;
  }
}

class TypeDisplayInfo {
  name:string;
  typeName?: string;

  constructor(name:string, type:XtTypeInfo|XtTypeDetail|string) {
    this.name=name;
    if (typeof type == 'string') {
      this.typeName = type;
    }
  }
}
