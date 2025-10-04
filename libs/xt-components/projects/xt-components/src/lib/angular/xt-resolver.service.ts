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
import { XtAction } from '../action/XtAction';
import { IStoreProvider } from '../store/store-support';
import { XtActionHandler, XtActionResult } from '../action/xt-action-handler';

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

  listSubNamesOfType<T> (valueType:string, value?:T): string[] {
    return this.typeResolver.listSubNames(valueType, value);
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


  /**
   * Calculates all the possible actions for a given context
   * @param context
   * @param onlyVisible
   */
  possibleActions<T> (context:XtContext<T>, onlyVisible:boolean=true): Array<XtAction<T>> {
    const existingActions = context.listActions();
    if (existingActions!=null) {
      return existingActions;
    }

    if (context.valueType!=null) {
      const actionInfos = this.pluginRegistry.listActionInfos<T>(context.valueType);
      const actions = actionInfos.map((info) => {
        const ret = new XtAction(info.name,info.info, true);
        return ret;
      });
      context.listActions.set(actions);
      return actions;
    }
    return [];
  }

  /**
   * Finds the possible action with the given name for the current type, and runs it in the current value.
   * If the action is not possible in this context, try a parent context
   * @param actionName
   * @param store
   */
  async runAction<T> (context: XtContext<T>, actionName:string,  store?:IStoreProvider<T>): Promise<XtActionResult<any>> {
    let handler: XtActionHandler<T> |null = null;
    for (const action of this.possibleActions(context,false)) {
      if (action.name==actionName) {
        const handlerClass=action.info.handlerClass;
        handler=new handlerClass ();
        break;
      }
    }

    if (handler!=null) {
      return handler.runAction(context, actionName, store);
    } else {
      // Couldn't find the handler, let's see if we can have that up the context chain
      if (context.parentContext!=null) {
        return this.runAction(context.parentContext, actionName, undefined); // Run the parent without any store indication, as it most probably is different
      } else {
        return Promise.reject("Cannot find action "+actionName+" for context "+this.toString());
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
      const pluginName = module.registerPlugin(this);
      // Transform the configured Uris to real urls
      const pluginConfig=this.pluginRegistry.pluginRegistry.get(pluginName);
      if (pluginConfig?.uriLogo!=null) {
        let urlString = url.toString();
        const lastSlash = urlString.lastIndexOf('/');
        urlString = urlString.substring(0, lastSlash+1)+pluginConfig?.uriLogo;
        pluginConfig.uriLogo=urlString;
      }
      return module;
    });

  }

}
