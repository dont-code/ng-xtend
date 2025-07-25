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
import { XtTypeInfo } from 'xt-type';
import { Card } from 'primeng/card';
import { JsonPipe } from '@angular/common';
import { Panel } from 'primeng/panel';
import { Fieldset } from 'primeng/fieldset';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { Subscription } from 'rxjs';
import { FormErrorDisplayerComponent } from '../form-error-displayer/form-error-displayer.component';
import { httpResource } from '@angular/common/http';

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

  listPlugins=computed<PluginDisplayInfo[]>( () => {
    return this.transform(this.resolverService.listPlugins());
  });

  form=this.fb.group({
    pluginUrl: ['', [Validators.required, Validators.pattern("(ftp|ftps|http|https):\\/\\/[^ \"]+")]],
  });

  loadlistUrl = httpResource (() => 'assets/config/plugin-urls.json');

  listUrls=linkedSignal<Set<string>>(() => {
    const ret = new Set<string>();
    if (this.loadlistUrl.hasValue()) {
      const loaded = this.loadlistUrl.value() as any;
      for (const plugin in loaded) {
        const urls = loaded[plugin] as Array<string>;
        for (const url of urls) {
          ret.add(url);
        }
      }
    }
    return ret;
  });
  suggestedUrls = signal<string[]>([]);

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
    this.suggestedUrls.set(Array.from(this.listUrls().values()).filter((item)=> {
      return item.startsWith(event.query);
    }));
  }

  loadPlugin() {
    if( !this.formValid()) {
      this.errorHandler.errorOccurred(new Error("Form is not valid"), "Form is not valid");
    } else {
      let url = this.form.value['pluginUrl']!;
      this.listUrls.update((oldList) => {
        oldList.add(url);
        return new Set(oldList.values());
      });
      if (!url.endsWith("remoteEntry.json")) {
        url = url+(url.endsWith('/')?'':'/')+'remoteEntry.json';
      }

      this.resolverService.loadPlugin(url).catch((error) => {
        this.errorHandler.errorOccurred(error, "Error while loading plugin.");
      });
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

  constructor(name:string, type:XtTypeInfo|string) {
    this.name=name;
    if (typeof type == 'string') {
      this.typeName = type;
    }
  }
}
