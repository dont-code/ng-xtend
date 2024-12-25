import { computed, inject, Injectable, signal } from '@angular/core';
import { XtContext } from '../xt-context';
import { XtRegistryResolver } from '../resolver/xt-registry-resolver';
import { XT_REGISTRY_TOKEN, XT_RESOLVER_TOKEN, XT_TYPE_RESOLVER_TOKEN } from './xt-tokens';
import { XtResolvedComponent } from '../xt-resolved-component';
import { XtTypeHierarchyResolver, XtTypeResolver, XtUpdatableTypeResolver } from '../type/xt-type-resolver';
import { XtComponentInfo, XtPluginInfo, XtTypeInfo } from '../plugin/xt-plugin-info';
import { XtResolver } from '../resolver/xt-resolver';
import { XtComponent } from '../xt-component';

@Injectable({
  providedIn: 'root'
})
export class XtResolverService {

  pluginRegistry = inject (XT_REGISTRY_TOKEN);

  protected baseResolver = inject (XT_RESOLVER_TOKEN, {optional:true});
  protected baseTypeResolver = inject (XT_TYPE_RESOLVER_TOKEN, {optional:true});

  public listComponents = computed<Array<XtComponentInfo<any>>>(() => {
    return this.pluginRegistry.listComponents();
  });

  resolver:XtResolver;
  typeResolver:XtTypeResolver<any>;

  constructor() {

    if (this.baseTypeResolver==null) {
      this.typeResolver = new XtTypeHierarchyResolver ();
    } else this.typeResolver=this.baseTypeResolver;

    if (this.baseResolver==null) {
      this.resolver=new XtRegistryResolver (this.pluginRegistry, this.typeResolver);
    } else this.resolver=this.baseResolver;

  }

  findBestComponent<T> (baseContext: XtContext<T>, subName?:string) : XtResolvedComponent{
    const ret= this.resolver.resolve(baseContext, subName);
    if (ret!=null) return ret;
    else throw new Error ("No components found for this context "+ baseContext.toString());
  }

  findTypeOf<T> (baseContext:XtContext<T>, subName?:string, value?:T): any | undefined {
    const ret = this.typeResolver.findType (baseContext, subName, value);
    return ret;
  }

  registerPlugin (info:XtPluginInfo) {
    this.pluginRegistry.registerPlugin (info);
    this.registerTypes (info.types);
  }

  registerTypes (types:XtTypeInfo|undefined) {
    if ((types !=null) && (this.typeResolver.canUpdate())) {
      for (const newType in types) {
        (this.typeResolver as XtUpdatableTypeResolver<string>).addType (newType, types[newType]);
      }
    }
  }

}
