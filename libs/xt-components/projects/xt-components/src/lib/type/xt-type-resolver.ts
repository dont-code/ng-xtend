import { XtTypeInfo } from "../plugin/xt-plugin-info";
import { XtContext } from '../xt-context';

/**
 * Determines the type of elements based on a hierarchy of type
 */
export type XtTypeResolver<TypeContext> = {

  findType (typeInfo:TypeContext|null|undefined, subName?:string, value?:any):string|null|undefined;

  listSubNames (typeInfo: TypeContext | null | undefined, value?: any):string[];

  canUpdate (): boolean;
}

export type XtUpdatableTypeResolver<TypeContext> = XtTypeResolver<TypeContext> & {
    addType (typeName:string, type:XtTypeInfo|string):void;

}

export class XtTypeHierarchyResolver<T> implements XtUpdatableTypeResolver<XtContext<T>> {
    types= new Map<string, XtTypeHierarchy> ();

    addType (typeName:string, type:XtTypeInfo|string):void {
        this.types.set (typeName, fromDescription (type));
    }

    canUpdate(): boolean {
        return true;
    }

    findType(typeInfo: XtContext<T> | null | undefined, subName?: string, value?: any):string | null | undefined {
        if( typeInfo==null)
            return typeInfo;
        if (typeInfo.valueType==null)
          return typeInfo.valueType;

        if (subName==null) {
            return typeInfo.valueType;
        } else {
            const selectedType = this.types.get(typeInfo.valueType);
            if( (selectedType != null) && (selectedType.children!=null)) {
                const type = selectedType.children[subName].type;
                if (type==null) {
                  throw new Error('SubType named '+subName+' of '+typeInfo.valueType+ ' doesn\'t have a type name.');
                } else {
                  return type;
                }
            }
        }

        return undefined;
    }

    listSubNames (context: XtContext<T> | null | undefined, value?: any):string[] {
      let ret:string[] = [];
      if ((context!=null)&&(context.valueType!=null)) {
        const typeInfo = this.types.get(context.valueType);
        if( typeInfo?.children!=null) {
          ret = Object.keys(typeInfo.children);
        }
      } else {
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

}

export type XtTypeHierarchy = {
    type?:string;
    children?:{[key:string]: XtTypeHierarchy} ;
    parent?:XtTypeHierarchy;

    addChild (key:string, child:XtTypeHierarchy) : void;
}

export class XtBaseTypeHierarchy implements XtTypeHierarchy {
    type?:string;
    children?:{[key:string]: XtTypeHierarchy} ;
    parent?:XtTypeHierarchy;

    constructor (type?:string, parent?:XtTypeHierarchy) {
        this.type=type;
        this.parent=parent;
    }

    addChild (key:string, child:XtTypeHierarchy) : void {
        if (this.children==null) this.children= {};
        this.children[key]=child;
    }

}

export function fromDescription (typeHierarchy:XtTypeInfo|string, name?:string, parent?:XtTypeHierarchy): XtTypeHierarchy {
  let ret: XtBaseTypeHierarchy|null = null;
  if (typeof typeHierarchy == 'string') {
    ret= new XtBaseTypeHierarchy(typeHierarchy, parent);
  } else {

    ret = new XtBaseTypeHierarchy(undefined, parent);

    for (const key of Object.keys(typeHierarchy)) {
      const value = typeHierarchy[key];
      fromDescription(value, key, ret);
    }
  }

  if((parent!=null) && (name!=null))
    parent.addChild(name, ret);
  else if ((parent!=null) && (name==null)) {
    throw new Error("Cannot add type to parent without a name.");
  }
  return ret;
}

