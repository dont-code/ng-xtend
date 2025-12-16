import { XtTypeHandler } from '../handler/xt-type-handler';
import { DefaultTypeHandler } from '../handler/default/default-type-handler';

/**
 * Determines the type of elements based on a hierarchy of type
 */
export type XtTypeResolver = {

  findTypeName (typeName:string|null|undefined, subName?:string, value?:any):string|null|undefined;
  findType (typeName:string|null|undefined, subName?:string, value?:any):XtTypeReference|XtTypeHierarchy|null|undefined;
  findReference (typeName:string|null|undefined, subName:string):XtTypeReference|null|undefined;
  getOrCreateTypeHandler<Type>(typeName: string | null | undefined, subName?: string, value?: Type): {typeName?: string | null, handler?:XtTypeHandler<Type> };
  findTypeHandler<Type> (typeName:string|null|undefined, createDefault?:boolean, subName?:string, value?:Type): {typeName?:string|null, handler?:XtTypeHandler<Type> };

  listSubNames (typeName: string | null | undefined, value?: any):string[];
  listReferences (typeName: string | null | undefined):{[key:string ]: XtTypeReference};
  isPrimitiveType (type: string | XtTypeHierarchy| XtTypeReference | null | undefined, value?: any):boolean;
  findPrimitiveType (value:any) : XtTypeHierarchy| undefined;
  findSubPropertiesWithType<Type> (typeName:string|null|undefined, typeOfSubProperties:string):(keyof Type)[];
  calculateSubPropertiesPerType<Type> (typeName:string|null|undefined):Map<string, (keyof Type)[]>;

  canUpdate (): boolean;

}

export type XtUpdatableTypeResolver = XtTypeResolver & {
  addRootType<Type> (typeName:string, type:XtTypeInfo|XtTypeDetail|string, handler?:XtTypeHandler<Type>):void;
  setHandler<Type> (typeName:string, handler:XtTypeHandler<Type>):void;
  resolveAllTypeReferences ():void;
}

export class XtTypeHierarchyResolver implements XtUpdatableTypeResolver {
    types= new Map<string, XtTypeHierarchy> ();

    addRootType<Type> (typeName:string, type:XtTypeInfo|XtTypeDetail|string, handler?:XtTypeHandler<Type>):void {
      if (handler==null) {
          handler = this.findTypeHandler<Type>(typeName)?.handler;
      }
      const typeHierarchy = this.fromDescription (type, typeName,handler);
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

  /**
   * Retrieves the complete information on a subType. It can be a type definition or a reference to a type definition
   * @param typeName
   * @param subName
   */
  findType (typeName:string|null|undefined, subName?:string|null, value?:any):XtTypeReference|XtTypeHierarchy|null|undefined {
    if( typeName==null)
      return typeName;
    const selectedType = this.types.get(typeName);
    if( (selectedType==null)&& (value!=null)) {
      return this.findPrimitiveType(value);
    }
    if (subName!=null) {
      if( selectedType?.children!=null)
        return selectedType?.children[subName];
      else throw new Error ('No subType named '+subName+' for '+typeName+'.');
    }
    return selectedType;
  }

  findReference(typeName: string | null | undefined, refName: string):XtTypeReference | null | undefined {
    if( typeName==null)
      return typeName;

    const selectedType = this.types.get(typeName);
    if( selectedType?.children!=null)
      return selectedType?.children[refName] as XtTypeReference;
    return undefined;
  }

  listReferences(typeName: string | null | undefined):{[key:string ]: XtTypeReference} {
    let ret:{[key:string]: XtTypeReference} = {};
    if( typeName==null)
      return ret;

    const selectedType = this.types.get(typeName);
    if( selectedType!=null) {
      ret= selectedType.listReferences();
    }

    return ret;
  }


  isPrimitiveType (typeDef:string | XtTypeHierarchy| XtTypeReference | null | undefined, value?:any):boolean {

      if (typeDef==null) {
        // No type is defined, so just check the value
        return isPrimitive(value);
      } else {
        let typeName:string|null=null;
        let foundType=null;
        if (isTypeReference(typeDef)) {
          typeName = typeDef.toType;
        } else if (typeof typeDef == 'string') {
          typeName = typeDef;
        }
        if (typeName!=null) {
          foundType = this.types.get(typeName);
        }else {
          foundType = typeDef as XtTypeHierarchy;
        }

        if (foundType==null) {
          if ((typeName=='string') || (typeName=='number') || (typeName=='boolean') || (typeName=='date') || (typeName=='date-time') || (typeName=='time')) {
            return true;
          }else return false;
        }else if ( (foundType.children == null) || (Object.keys(foundType.children).length == 0 )) {
          return true;
        } else return false;
      }
    }

  findPrimitiveType (value:any) : XtTypeHierarchy| undefined {
    if (value==null) return undefined;
    const simpleType = findPrimitiveType(value);
    if (simpleType!=null) return new XtBaseTypeHierarchy(simpleType);
    else return undefined;
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

  calculateSubPropertiesPerType<Type> (typeName:string|null|undefined):Map<string, (keyof Type)[]> {
    const ret = new Map<string, (keyof Type)[]>();
    if (typeName!=null) {
      const typeInfo = this.types.get(typeName);
      if (typeInfo?.children != null) {
        for (const subKey in typeInfo?.children) {
          const type = typeInfo?.children[subKey];
          if (type.type!=null) {
            let list = ret.get(type.type);
            if (list == null) {
              list = new Array<keyof Type>();
              ret.set(type.type, list);
            }
            list.push(subKey as keyof Type);
          }
        }
      }
    }
    return ret;
  }

  /**
   * Returns the list of properties of the type typeName that are compatible with the type typeOfSubProperties
   * @param typeName
   * @param typeOfSubProperties
   */
  findSubPropertiesWithType<Type> (typeName:string|null|undefined, typeOfSubProperties:string):(keyof Type)[] {
    if (typeName!=null) {
      const typeInfo = this.types.get(typeName);
      if (typeInfo?.children != null) {
        const ret=new Array<keyof Type>();
        for (const subKey in typeInfo?.children) {
          const type = typeInfo?.children[subKey];
          if (!isTypeReference(type)) {
            if (type.isTypeOf (typeOfSubProperties)) {
              ret.push(subKey as keyof Type);
            }
          }
        }
        return ret;
      }
    }
    return [];
  }

  getOrCreateTypeHandler<Type>(typeName: string | null | undefined, subName?: string, value?: Type): {typeName?: string | null, handler?:XtTypeHandler<Type> } {
    return this.findTypeHandler(typeName, true, subName, value );
  }

  findTypeHandler<Type>(typeName: string | null | undefined, createDefault?:boolean, subName?: string, value?: Type): {typeName?: string | null, handler?:XtTypeHandler<Type> } {
    if ((typeName!=null) && (subName!=null)) {
      typeName = this.findTypeName(typeName, subName, value);
    }
    if (typeName==null) return {typeName};
    const ret= this.types.get(typeName);
    if (ret!=null) {
      if ((ret.handler==null)&& (createDefault==true)) {
        ret.handler = this.createDefaultTypeHandler(ret, value);
      }
      return { typeName:ret.type, handler: ret.handler};
    } else return {};
  }

  createDefaultTypeHandler<Type> (type: XtTypeHierarchy, value?:Type): XtTypeHandler<Type> {
    const ret = new DefaultTypeHandler<Type>();
    ret.init(type);
    return ret;
  }

  setHandler<Type>(typeName: string, handler: XtTypeHandler<Type>): void {
    const ret= this.types.get(typeName);
    if (ret!=null) {
      ret.handler=handler;
    }else {
      throw new Error ("No type named "+typeName+" found to set handler for.");
    }
  }

  fromDescription (typeHierarchy:XtTypeInfo|XtTypeDetail|string, name:string, handler?:XtTypeHandler<any>): XtTypeHierarchy {
    let ret: XtBaseTypeHierarchy|null = null;
    let reference:XtTypeReference|null = null;
    if (typeof typeHierarchy == 'string') {
      // It's either a primitive or a reference to another rootType
      if (!this.isPrimitiveType(typeHierarchy)) {
          // Find the reference to an non primitive type
        ret = this.types.get(typeHierarchy) as XtBaseTypeHierarchy??null;
        if( ret==null) throw new Error('Type '+typeHierarchy+' not found in the type hierarchy.');
      } else {
          // Just create the hierarchy to the primitive type
        ret= new XtBaseTypeHierarchy(typeHierarchy, handler);
        ret.initHandler();
      }
    } else {

      ret = new XtBaseTypeHierarchy(name, handler);

        // We read the detailed version of the description
      if (isTypeDetail(typeHierarchy)) {
        if( typeHierarchy.compatibleTypes!=null)
          ret.compatibleTypes=[...typeHierarchy.compatibleTypes];

        if (typeHierarchy.children!=null) {
          for (const key of Object.keys(typeHierarchy.children)) {
            const value = typeHierarchy.children[key];
            // We get the handler for the type if there is already one.
            let subHandler=null;
            if (typeof value == 'string') {
              subHandler=this.findTypeHandler(value)?.handler;
            }
            if (isTypeReference (value)) {
              reference = new XtBaseTypeReference(value.toType, value.field, value.type, value.referenceType);
              ret.addReference(key, reference);
            } else {
              const newChild = this.fromDescription(value, key, subHandler??undefined);
              ret.addChild(key, newChild as XtBaseTypeHierarchy);
            }
          }
        }
      } else  // The simple version is given
      {
        let simpleType=typeHierarchy as XtTypeInfo;
        for (const key of Object.keys(simpleType)) {
          const value = simpleType[key];
            // We get the handler for the type if there is already one.
          let subHandler=null;
          if (typeof value == 'string') {
            subHandler=this.findTypeHandler(value)?.handler;
          }
          const newChild = this.fromDescription(value, key, subHandler??undefined);
          ret.addChild(key, newChild as XtBaseTypeHierarchy);

        }
      }
    }

    return ret;
  }

  resolveAllTypeReferences ():void {
    for (const type of this.types.values()) {
      const refs = type.listReferences();
      for (const ref of Object.keys(refs)) {
        if( refs[ref].type==XtBaseTypeReference.UNRESOLVED_TYPE) {
          const refType = this.findType(refs[ref].toType, refs[ref].field);
          if( refType!=null) {
            refs[ref].type=refType.type;
          }else {
            throw new Error('Unable to resolve reference '+ref+' of type '+type.type);
          }
        }
      }
    }
  }

}

export type XtTypeHierarchy = {
    type:string;
    children?:{[key:string]: XtTypeHierarchy | XtTypeReference} ;
    handler?:XtTypeHandler<any>;
    compatibleTypes?: string[];

    addChild (key:string, child:XtTypeHierarchy) : void;
    addReference (key:string, child:XtTypeReference) : void;
    initHandler ():void;

    isTypeOf(typeName: string): boolean;
    isCompatibleWith (typeName: string): boolean;

    listReferences (): { [key:string]:XtTypeReference};
}

export class XtBaseTypeHierarchy implements XtTypeHierarchy {
  type:string;
  children?:{[key:string]: XtBaseTypeHierarchy | XtTypeReference} ;
  handler?:XtTypeHandler<any>;
  compatibleTypes?: string[];

  constructor (type:string, handler?:XtTypeHandler<any> ) {
      this.type=type;
      this.handler=handler;
  }

  addChild (key:string, child:XtBaseTypeHierarchy) : void {
      if (this.children==null) this.children= {};
      this.children[key]=child;
  }

  addReference (key:string, child:XtBaseTypeReference) : void {
    if (this.children==null) this.children= {};
    this.children[key]=child;
  }

  initHandler ():void {
      if (this.handler!=null) {
        this.handler.init(this);
      }
    }

    isTypeOf (toTest: string){
      return this.type==toTest;
    }

    isCompatibleWith (toTest:string): boolean {
      if (this.compatibleTypes==null) return false;
      return this.compatibleTypes.indexOf(toTest) > -1;
    }

  listReferences (): { [key:string]:XtTypeReference} {
    const ret:{[key:string]:XtTypeReference} = {};

    if( this.children!=null ) {
      for (const childKey in this.children) {
        const child=this.children[childKey];
        if( isTypeReference(child)) {
          ret[childKey] = child;
        }
      }
    }
    return ret;
  }
}

/**
 * Internally manages a link between two types
 */
export class XtBaseTypeReference implements XtTypeReference{
  toType:string;
  referenceType?: 'MANY-TO-ONE' | 'ONE-TO-MANY' | undefined;
  field: string;
  type?:string;

  public static readonly UNRESOLVED_TYPE = 'UNRESOLVED';

  constructor(toType:string, field:string, type?:string, referenceType?: 'MANY-TO-ONE' | 'ONE-TO-MANY') {
    this.toType = toType;
    this.referenceType = referenceType;
    this.field = field;
    if( type!=null) {
      this.type=type;
    }else this.type=XtBaseTypeReference.UNRESOLVED_TYPE;
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

function findPrimitiveType (value:any) : string | undefined {
  if (value==null) return undefined;
  if (Array.isArray(value)) {
    if (value.length>0) return findPrimitiveType(value[0])+'[]';
    else return undefined;
  }
  if (typeof value == 'object') {
    // Dates are object of simple types
    if( value instanceof Date) {
      return 'date';
    } else return undefined;
  } else return (typeof value).toLowerCase();
}



/**
 * Simple description of a type: Each property is either an object itself or just a single type
 */
export type XtTypeInfo = {
  [keys: string]: XtTypeDetail|XtTypeInfo|string;
}

/**
 * More complex description of a type. Enable model compatibility & links
 */
export type XtTypeDetail = {
  compatibleTypes?:string[];
  children?:{[key:string]: XtTypeReference|XtTypeInfo|string};
}

export type XtTypeReference = {
  toType:string,
  referenceType?:'MANY-TO-ONE'|'ONE-TO-MANY',
  field:string,
  type?:string
}

export function isTypeDetail (toTest:XtTypeDetail|XtTypeInfo): toTest is XtTypeDetail {
  if (toTest.compatibleTypes !=null) {
    return Array.isArray(toTest.compatibleTypes);
  }
  for (const sub in toTest) {
    if ((sub!='compatibleTypes') && (sub!='children')) {
      return false;
    }
  }
  return true;
}

export function isTypeReference (toTest:XtTypeReference|XtTypeInfo|XtTypeHierarchy|string|null|undefined): toTest is XtTypeReference {
  if (toTest==null) return false;
  if (typeof toTest == 'string') return false;
  if ((toTest as any).referenceType != null) return true;
  else if ((toTest as any).handler!=null) {
    return false;
  } else {
      return (toTest as any).field!=null;
  }
}
