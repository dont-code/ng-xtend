import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { XtComponentInfo, XtPluginInfo, XtResolverService } from 'xt-components';
import { Button } from 'primeng/button';
import { PrimeIcons } from 'primeng/api';
import { XtTypeInfo } from 'xt-type';
import { Card } from 'primeng/card';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-plugin-manager',
  imports: [
    Button,
    Card,
    JsonPipe
  ],
  templateUrl: './plugin-manager.component.html',
  styleUrl: './plugin-manager.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginManagerComponent {

  resolverService = inject(XtResolverService);

  listPlugins=computed<PluginDisplayInfo[]>( () => {
    return this.transform(this.resolverService.listPlugins());
  });

  constructor () {
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
    this.logoUrl='assets/plugin-default-img.jpg';
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
