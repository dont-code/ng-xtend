import { computed, inject, Injectable, Type } from '@angular/core';
import { XtContext } from '../xt-context';
import { XtRegistryResolver } from '../resolver/xt-registry-resolver';
import { XT_REGISTRY_TOKEN, XT_RESOLVER_TOKEN, XT_TYPE_RESOLVER_TOKEN } from './xt-tokens';
import { XtResolvedComponent } from '../xt-resolved-component';
import { ManagedDataHandler, XtTypeHandler, XtTypeInfo, xtTypeManager, XtTypeResolver, XtUpdatableTypeResolver } from 'xt-type';
import { XtComponentInfo, XtPluginInfo, XtTypeHandlerInfo } from '../plugin/xt-plugin-info';
import { XtResolver } from '../resolver/xt-resolver';
import { XtComponent } from '../xt-component';
import { loadRemoteModule } from '@angular-architects/native-federation';

@Injectable({
  providedIn: 'root'
})
export class XtResolverService {

  pluginRegistry = inject (XT_REGISTRY_TOKEN);

  protected baseResolver = inject (XT_RESOLVER_TOKEN, {optional:true});
  protected baseTypeResolver = inject (XT_TYPE_RESOLVER_TOKEN, {optional:true});

  resolver:XtResolver;
  typeResolver:XtTypeResolver;

  constructor() {
    if (this.baseTypeResolver==null) {
      this.typeResolver = xtTypeManager();
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

  findTypeOf<T> (baseContext:XtContext<T>, subName?:string, value?:T): string | null | undefined {
    const ret = this.typeResolver.findTypeName (baseContext.valueType, subName, value);
    return ret;
  }

  findTypeHandlerOf<T> (baseContext:XtContext<T>, subName?:string, value?:T): {typeName?:string | null, handler?:XtTypeHandler<any>} {
    const ret = this.typeResolver.findTypeHandler(baseContext.valueType, subName, value);
    return ret;
  }

  listSubNamesOf<T> (baseContext:XtContext<T>, value?:T): string[] {
    return this.typeResolver.listSubNames(baseContext.valueType, value);
  }

  registerPlugin (info:XtPluginInfo) {
    this.pluginRegistry.registerPlugin (info);
    this.registerTypes (info.types, info.typeHandlers);
  }

  registerTypes (types:XtTypeInfo|undefined, handlers?:XtTypeHandlerInfo<any>[]): void {
    if ((types !=null) && (this.typeResolver.canUpdate())) {
      for (const newType in types) {
        let handler=this.handlerDefinedFor (newType, handlers);
        if (handler==null) {
          handler = new ManagedDataHandler();
        }
        (this.typeResolver as XtUpdatableTypeResolver).addRootType (newType, types[newType], handler);
      }
    }
  }

  protected handlerDefinedFor(newType: string, handlers: XtTypeHandlerInfo<any>[] | undefined):any {
        for (const handler of handlers ?? []) {
          if (handler.typesHandled.includes(newType)) {
            return new handler.handlerClass ();
          }
        }
        return null;
    }

  getComponentInfo<T>(type: Type<XtComponent<T>>):XtResolvedComponent {
    return XtResolvedComponent.from(this.pluginRegistry.getComponentInfo (type));
  }

  findComponentInfo<T>(type: Type<XtComponent<T>>):XtResolvedComponent|null {
    const ret=this.pluginRegistry.findComponentInfo (type);
    if (ret==null) return null;
    else return XtResolvedComponent.from(ret);
  }

  public listComponents = computed<Array<XtComponentInfo<any>>>(() => {
    return this.pluginRegistry.listComponents();
  });

  public listPlugins = computed<Array<XtPluginInfo>>(() => {
    return this.pluginRegistry.listPlugins();
  });

  /**
   * Dynamically load a register a plugin from the given url
   * The plugin must export at least a Register entrypoint that will be called right after loading..
   * @param url
   * @returns a Promise with the module loaded and already registered.
   */
  loadPlugin (url:URL|string):Promise<any> {
    return loadRemoteModule({
      remoteEntry: url.toString(),
      exposedModule: './Register'
    }).then((module:any) => {
      module.registerPlugin(this);
      return module;
    });

  }

}
