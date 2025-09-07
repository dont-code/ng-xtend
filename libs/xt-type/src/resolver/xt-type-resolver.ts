import { XtTypeHandler } from '../handler/xt-type-handler';

/**
 * Determines the type of elements based on a hierarchy of type
 */
export type XtTypeResolver = {

  findTypeName (typeName:string|null|undefined, subName?:string, value?:any):string|null|undefined;
  findTypeHandler<Type> (typeName:string|null|undefined, subName?:string, value?:Type): {typeName?:string|null, handler?:XtTypeHandler<Type> };

  listSubNames (typeName: string | null | undefined, value?: any):string[];
  isPrimitiveType (typeName: string | null | undefined, value?: any):boolean;

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
      const typeHierarchy = this.fromDescription (type, handler, typeName, undefined);
      this.types.set (typeName, typeHierarchy);
      typeHierarchy.initHandler();

    }

    getType (typeName:string):XtTypeHierarchy|undefined {
      return this.types.get(typeName);
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
            if( (selectedType != null) && (selectedType.children!=null) && (selectedType.children[subName]!=null)) {
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

    isPrimitiveType (typeName:string, value?:any):boolean {
      const type=this.types.get(typeName);
      if (type==null) {
        // No type is defined, so just check the value
        return isPrimitive(value);
      } else if ( (type.children == null) || (Object.keys(type.children).length == 0 )) {
        return true;
      } else
        return false;
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

  fromDescription (typeHierarchy:XtTypeInfo|string, handler?:XtTypeHandler<any>, name?:string, parent?:XtTypeHierarchy): XtTypeHierarchy {
    let ret: XtBaseTypeHierarchy|null = null;
    if (typeof typeHierarchy == 'string') {
      ret = this.types.get(typeHierarchy)??null;
      if( ret==null) {
        ret= new XtBaseTypeHierarchy(typeHierarchy, handler);
        ret.initHandler();
      }
    } else {

      ret = new XtBaseTypeHierarchy(undefined, handler);

      for (const key of Object.keys(typeHierarchy)) {
        const value = typeHierarchy[key];
          // We get the handler for the type if there is already one.
        let subHandler=null;
        if (typeof value == 'string') {
          subHandler=this.findTypeHandler(value)?.handler;
        }
        this.fromDescription(value, subHandler??undefined, key, ret);
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
}

export type XtTypeHierarchy = {
    type?:string;
    children?:{[key:string]: XtTypeHierarchy} ;
    handler?:XtTypeHandler<any>;

    addChild (key:string, child:XtTypeHierarchy) : void;
    initHandler ():void;
}

export class XtBaseTypeHierarchy implements XtTypeHierarchy {
    type?:string;
    children?:{[key:string]: XtTypeHierarchy} ;
    handler?:XtTypeHandler<any>;

    constructor (type?:string, handler?:XtTypeHandler<any> ) {
        this.type=type;
        this.handler=handler;
    }

    addChild (key:string, child:XtTypeHierarchy) : void {
        if (this.children==null) this.children= {};
        this.children[key]=child;
    }

    initHandler ():void {
      if (this.handler!=null) {
        this.handler.init(this);
      }

    }

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
