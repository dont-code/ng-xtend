import { XtTypeHandler } from '../handler/xt-type-handler';

/**
 * Determines the type of elements based on a hierarchy of type
 */
export type XtTypeResolver = {

  findTypeName (typeName:string|null|undefined, subName?:string, value?:any):string|null|undefined;
  findTypeHandler<Type> (typeName:string|null|undefined, subName?:string, value?:Type): {typeName?:string|null, handler?:XtTypeHandler<Type> };

  listSubNames (typeName: string | null | undefined, value?: any):string[];

  canUpdate (): boolean;

}

export type XtUpdatableTypeResolver = XtTypeResolver & {
  addRootType<Type> (typeName:string, type:XtTypeInfo|string, handler?:XtTypeHandler<Type>):void;
  setHandler<Type> (typeName:string, handler:XtTypeHandler<Type>):void;
}

export class XtTypeHierarchyResolver implements XtUpdatableTypeResolver {
    types= new Map<string, XtTypeHierarchy> ();

    addRootType<Type> (typeName:string, type:XtTypeInfo|string, handler?:XtTypeHandler<Type>):void {
      if (handler==null) {
          handler = this.findTypeHandler<Type>(typeName)?.handler;
      }
      const typeHierarchy = fromDescription (type, handler, typeName, undefined);
      this.types.set (typeName, typeHierarchy);
      typeHierarchy.initHandlers();

    }

    canUpdate(): boolean {
        return true;
    }

    findTypeName(typeName: string | null | undefined, subName?: string, value?: any):string | null | undefined {
        if( typeName==null)
            return typeName;

        if (subName==null) {
            return typeName;
        } else {
            const selectedType = this.types.get(typeName);
            if( (selectedType != null) && (selectedType.children!=null)) {
                const type = selectedType.children[subName].type;
                if (type==null) {
                  throw new Error('SubType named '+subName+' of '+typeName+ ' doesn\'t have a type name.');
                } else {
                  return type;
                }
            }
        }

        return undefined;
    }

    listSubNames (typeName:string | null | undefined, value?: any):string[] {
      let ret:string[] = [];
      if (typeName!=null) {
        const typeInfo = this.types.get(typeName);
        if( typeInfo?.children!=null) {
          ret = Object.keys(typeInfo.children);
        }
      }

      if (ret.length==0){
        // We will use the value to extract properties
        if (value!=null) {
          if (Array.isArray(value)) {
            if (value.length>0) {
              const setOfKeys=new Set<string>();
              for (const element of value) {
                const elementKeys=Object.keys(element);
                for (const key of elementKeys) {
                  setOfKeys.add(key);
                }
              }
              ret= Array.from(setOfKeys.values());
            }
          }else {
            ret = Object.keys(value);
          }
        }
      }

      return ret;
    }

  findTypeHandler<Type>(typeName: string | null | undefined, subName?: string, value?: Type): {typeName?: string | null, handler?:XtTypeHandler<Type> } {
    if (typeName==null) return {typeName};
    const ret= this.types.get(typeName);
    if (ret!=null) {
      return { typeName:ret.type, handler: ret.handler};
    } else return {};
  }

  setHandler<Type>(typeName: string, handler: XtTypeHandler<Type>): void {
    const ret= this.types.get(typeName);
    if (ret!=null) {
      ret.handler=handler;
    }else {
      throw new Error ("No type named "+typeName+" found to set handler for.");
    }
  }

}

export type XtTypeHierarchy = {
    type?:string;
    children?:{[key:string]: XtTypeHierarchy} ;
    parent?:XtTypeHierarchy;
    handler?:XtTypeHandler<any>;

    addChild (key:string, child:XtTypeHierarchy) : void;
    initHandlers ():void;
}

export class XtBaseTypeHierarchy implements XtTypeHierarchy {
    type?:string;
    children?:{[key:string]: XtTypeHierarchy} ;
    parent?:XtTypeHierarchy;
    handler?:XtTypeHandler<any>;

    constructor (type?:string, parent?:XtTypeHierarchy, handler?:XtTypeHandler<any> ) {
        this.type=type;
        this.parent=parent;
        this.handler=handler;
    }

    addChild (key:string, child:XtTypeHierarchy) : void {
        if (this.children==null) this.children= {};
        this.children[key]=child;
    }

    initHandlers ():void {
      if (this.handler!=null) {
        this.handler.init(this);
      }

      if (this.children!=null) {
        for (const child of Object.values(this.children)) {
          child.initHandlers();
        }
      }
    }

}

export function fromDescription (typeHierarchy:XtTypeInfo|string, handler?:XtTypeHandler<any>, name?:string, parent?:XtTypeHierarchy): XtTypeHierarchy {
  let ret: XtBaseTypeHierarchy|null = null;
  if (typeof typeHierarchy == 'string') {
    ret= new XtBaseTypeHierarchy(typeHierarchy, parent, handler);
  } else {

    ret = new XtBaseTypeHierarchy(undefined, parent, handler);

    for (const key of Object.keys(typeHierarchy)) {
      const value = typeHierarchy[key];
      fromDescription(value, undefined, key, ret);
    }
  }

  if((parent!=null) && (name!=null))
    parent.addChild(name, ret);
  else if ((parent!=null) && (name==null)) {
    throw new Error("Cannot add type to parent without a name.");
  } else if (name!=null) {
    ret.type= name;
  }
  return ret;
}


function isPrimitive(valueElement: any): boolean {
  if (typeof valueElement == 'object') {
    if (valueElement==null) return true;
    else {
      return valueElement instanceof Date;
    }
  } else return true;
}

/**
 * Simple description of a type: Each property is either an object itself or just a single type
 */
export type XtTypeInfo = {
  [keys: string]: XtTypeInfo|string;
}
