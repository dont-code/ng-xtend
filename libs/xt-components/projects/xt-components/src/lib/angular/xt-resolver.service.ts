import { computed, inject, Injectable, Type } from '@angular/core';
import { XtContext } from '../xt-context';
import { XtRegistryResolver } from '../resolver/xt-registry-resolver';
import { XT_REGISTRY_TOKEN, XT_RESOLVER_TOKEN, XT_TYPE_RESOLVER_TOKEN } from './xt-tokens';
import { XtResolvedComponent } from '../xt-resolved-component';
import {
  ManagedDataHandler,
  MappingHelper,
  XtTypeHandler,
  XtTypeInfo,
  xtTypeManager,
  XtTypeResolver,
  XtUpdatableTypeResolver
} from 'xt-type';
import { XtComponentInfo, XtPluginInfo, XtTypeHandlerInfo } from '../plugin/xt-plugin-info';
import { XtResolver } from '../resolver/xt-resolver';
import { XtComponent } from '../xt-component';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { XtAction } from '../action/xt-action';
import { XtActionHandler, XtActionResult } from '../action/xt-action-handler';
import { IStoreManager, StoreSupport } from '../store/store-support';
import { firstValueFrom, Observable } from 'rxjs';

/**
 * An all in one helper class, enabling manipulation of the context, with data and type associated with it.
 */
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
    const ret = this.typeResolver.findTypeHandler(baseContext.valueType, false, subName, value);
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
   */
  async runAction<T> (context: XtContext<T>, actionName:string, storeMgr?:any): Promise<XtActionResult<any>> {
    let handler: XtActionHandler<T> |null = null;
    for (const action of this.possibleActions(context,false)) {
      if (action.name==actionName) {
        const handlerClass=action.info.handlerClass;
          handler=new handlerClass ();
        break;
      }
    }

    if (handler!=null) {
      return handler.runAction(context, actionName, this, storeMgr);
    } else {
      // Couldn't find the handler, let's see if we can have that up the context chain
      if (context.parentContext!=null) {
        return this.runAction(context.parentContext, actionName); // Run the parent without any store indication, as it most probably is different
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

  /**
   * Based on the type & value of the element, find which property is on its type and returns it's value
   * @param context
   * @param subPropertyType
   * @param value
   */
  findSubPropertyWithType<T> (context: XtContext<T>, subPropertyType:string, value:T): any {
    const subKeys = this.typeResolver.findSubPropertiesWithType (context.valueType, subPropertyType);
    if ((subKeys!=null)&&(subKeys.length==1)) {
      return value[subKeys[0] as keyof T];
    } else if (subKeys.length>1) {
        // Let's pickup the first
      return value[subKeys[0] as keyof T];
    } else {
      return undefined;
    }
  }

  /**
   * Creates a duplicate of an object, using our knowledge on its type given by the context
   * @param context
   * @param value
   */
  safeDuplicate<T> (context: XtContext<T>, value:T): T {

    const typeHandler = this.typeResolver.findTypeHandler(context.valueType, false, undefined, value);

    if (typeHandler.handler!=null) {
      return typeHandler.handler.safeDuplicate (value);
    }
    return structuredClone(value);
  }

  resolveMappingOf<U, T> (context: XtContext<T>, targetType:string, value?:T): MappingHelper<U, T> | undefined {
    if (context.valueType!=null) {
      const typeHandler = this.typeResolver.findTypeHandler<T>(targetType, false, undefined, value);

      if (typeHandler.handler!=null) {
        const ret = typeHandler.handler.getOrCreateMappingFrom<U>(context.valueType, this.typeResolver);
        if( ret != null) {
          return ret;
        }
      }
    }
    return undefined;
  }

  async resolveReferencedValue<T,U> (context: XtContext<T>, storeMgr: IStoreManager): Promise<U | U[] | null | undefined> {
    if (!context.isReference()) return undefined;
    const ref= context.reference!;
    const storeProvider = storeMgr.getProvider<U> (ref.type);
    if (storeProvider == null) {
      throw new Error ('No Store provider found for type '+ref.type);
    }

    const ret= await firstValueFrom(storeProvider.searchEntities(ref.toType, storeMgr.newStoreCriteria(ref.field, context.value(),'=')));
    if (ret.length == 0) return null;
      if (ref.referenceType=='MANY-TO-ONE') {
        if (ret.length > 1) throw new Error('Multiple values for many to one relation between ' + context.valueType + ' and ' + ref.type + ' with value ' + context.value());
        return ret[0];
      } else if (ref.referenceType=='ONE-TO-MANY') {
        return ret;
      }
    return undefined;
  }

  resolvePendingReferences () {
    (this.typeResolver as XtUpdatableTypeResolver).resolveAllTypeReferences();
  }

  /**
   * Calculates the values that can be referenced by the reference & value of this context
   * @param context
   */
  findPossibleReferences<T, U> (context:XtContext<T>): Observable<U[]> {
    if (!context.isReference()) throw new Error('Cannot find possible references of this non reference context'+context.toString());
    const reference = context.reference!;
    const store =StoreSupport.getStoreManager().getProviderSafe<U>(reference.toType);
    return store.searchEntities(reference.toType );
  }

/*  async loadAllReferencesForContext<T> (context:XtContext<T>, storeMgr: IStoreManager): Promise<void> {
    const refs  =this.typeResolver.listReferences(context.valueType);
    const promises:Promise<void>[]=[];
    for (const ref of Object.keys(refs)) {
      const subContext= context.subContext(ref, undefined, this.typeResolver);
      promises.push(this.resolveReferencedValue(subContext, storeMgr).then ((value) => {
        subContext.updateReferencedContext(value);
      }));
    }

    if( promises.length>0) {
      return Promise.all(promises).then((values) => {
        context.subReferencesResolved.set(true);
        return;
      });
    } else {
      return Promise.resolve().then (() => {
        context.subReferencesResolved.set(true);
      });
    }

  }
*/

}
