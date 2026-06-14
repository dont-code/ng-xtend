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

/**
 * A type resolver that supports dynamic updates: adding root types,
 * setting handlers, and resolving type references.
 */
export type XtUpdatableTypeResolver = XtTypeResolver & {
  addRootType<Type> (typeName:string, type:XtTypeInfo|XtTypeDetail|string, handler?:XtTypeHandler<Type>):void;
  setHandler<Type> (typeName:string, handler:XtTypeHandler<Type>):void;
  resolveAllTypeReferences ():void;
}

/**
 * Default implementation of {@link XtUpdatableTypeResolver}.
 * Manages a registry of type hierarchies and their handlers,
 * supports adding root types, resolving references, and querying type metadata.
 */
export class XtTypeHierarchyResolver implements XtUpdatableTypeResolver {
    /** Map of type names to their hierarchy definitions */
    types= new Map<string, XtTypeHierarchy> ();

    /**
     * Registers a root type in the resolver
     * @param typeName The name of the root type
     * @param type The type description (string, XtTypeInfo, or XtTypeDetail)
     * @param handler Optional handler for the type
     */
    addRootType<Type> (typeName:string, type:XtTypeInfo|XtTypeDetail|string, handler?:XtTypeHandler<Type>):void {
      if (handler==null) {
          handler = this.findTypeHandler<Type>(typeName)?.handler;
      }
      const typeHierarchy = this.fromDescription (type, typeName,handler);
      this.types.set (typeName, typeHierarchy);
      typeHierarchy.initHandler();

    }

    /**
     * Retrieves a registered type hierarchy by name
     * @param typeName The name of the type to retrieve
     * @returns The type hierarchy or undefined if not found
     */
    getType (typeName:string):XtTypeHierarchy|undefined {
      return this.types.get(typeName);
    }

    /**
     * @returns True since this resolver supports updates
     */
    canUpdate(): boolean {
        return true;
    }

    /**
     * Finds the type name for a given type, optionally resolving a sub-type
     * @param typeName The type name or null/undefined
     * @param subName Optional sub-type name
     * @param value Optional value to help determine the type
     * @returns The resolved type name or undefined
     */
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

  /**
   * Finds a type reference by name within a given type
   * @param typeName The parent type name
   * @param refName The reference name to find
   * @returns The type reference or undefined if not found
   */
  findReference(typeName: string | null | undefined, refName: string):XtTypeReference | null | undefined {
    if( typeName==null)
      return typeName;

    const selectedType = this.types.get(typeName);
    if( selectedType?.children!=null)
      return selectedType?.children[refName] as XtTypeReference;
    return undefined;
  }

  /**
   * Lists all type references for a given type
   * @param typeName The type name to list references for
   * @returns A map of reference names to their XtTypeReference definitions
   */
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


  /**
   * Checks if a type definition represents a primitive type
   * @param typeDef The type definition (string name, hierarchy, or reference)
   * @param value Optional value to help determine primitiveness
   * @returns True if the type is primitive
   */
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

  /**
   * Finds the primitive type hierarchy for a given value
   * @param value The value to determine the type of
   * @returns The primitive type hierarchy or undefined
   */
  findPrimitiveType (value:any) : XtTypeHierarchy| undefined {
    if (value==null) return undefined;
    const simpleType = findPrimitiveType(value);
    if (simpleType!=null) return new XtBaseTypeHierarchy(simpleType);
    else return undefined;
  }

  /**
   * Lists the names of sub-properties for a given type, optionally using a value to infer them
   * @param typeName The type name to list sub-properties for
   * @param value Optional value used to infer sub-properties if no type is registered
   * @returns An array of sub-property names
   */
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

  /**
   * Groups sub-properties by their type name
   * @param typeName The parent type name
   * @returns A map of type names to arrays of property keys of that type
   */
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

  /**
   * Gets an existing type handler or creates a default one if none exists
   * @param typeName The name of the type
   * @param subName Optional sub-type name
   * @param value Optional value to help determine the type
   * @returns Object with the resolved typeName and its handler
   */
  getOrCreateTypeHandler<Type>(typeName: string | null | undefined, subName?: string, value?: Type): {typeName?: string | null, handler?:XtTypeHandler<Type> } {
    return this.findTypeHandler(typeName, true, subName, value );
  }

  /**
   * Finds the type handler for a given type, optionally creating a default one
   * @param typeName The name of the type to find the handler for
   * @param createDefault If true, creates a default handler if none exists
   * @param subName Optional sub-type name to resolve first
   * @param value Optional value to help determine the type
   * @returns Object with the resolved typeName and its handler (if found)
   */
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

  /**
   * Creates a default type handler for the given type hierarchy
   * @param type The type hierarchy to create a handler for
   * @param value Optional value to help determine handler behavior
   * @returns A new DefaultTypeHandler instance
   */
  createDefaultTypeHandler<Type> (type: XtTypeHierarchy, value?:Type): XtTypeHandler<Type> {
    const ret = new DefaultTypeHandler<Type>();
    ret.init(type);
    return ret;
  }

  /**
   * Sets a type handler for an already-registered type
   * @param typeName The name of the type
   * @param handler The handler to assign
   * @throws Error if the type is not found
   */
  setHandler<Type>(typeName: string, handler: XtTypeHandler<Type>): void {
    const ret= this.types.get(typeName);
    if (ret!=null) {
      ret.handler=handler;
    }else {
      throw new Error ("No type named "+typeName+" found to set handler for.");
    }
  }

  /**
   * Recursively builds an XtTypeHierarchy from a type description
   * @param typeHierarchy The type description (string, XtTypeInfo, or XtTypeDetail)
   * @param name The name of the type
   * @param handler Optional handler for the type
   * @returns The constructed type hierarchy
   * @see XtTypeInfo
   * @see XtTypeDetail
   */
  fromDescription (typeHierarchy:XtTypeInfo|XtTypeDetail|string, name:string, handler?:XtTypeHandler<any>): XtTypeHierarchy {
    let ret: XtBaseTypeHierarchy|null = null;
    let reference:XtTypeReference|null = null;
    if (typeof typeHierarchy == 'string') {
      // It's either a primitive or a reference to another rootType
      if (!this.isPrimitiveType(typeHierarchy)) {
          // Find the reference to an non primitive type
        ret = this.types.get(typeHierarchy) as XtBaseTypeHierarchy??null;
        if( ret==null) {
          // Either it's an unknown type, or the type is defined at a later stage. Let's keep a placeholder
          ret = new UNRESOLVED_TYPE (typeHierarchy);
        }
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
        ret.displayTemplate=typeHierarchy.displayTemplate;
        ret.numericField=typeHierarchy.numericField;

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

  /**
   * Resolves all unresolved type references in the hierarchy.
   * Iterates over all registered types and replaces UNRESOLVED_TYPE placeholders
   * and unresolved references with their actual resolved types.
   * @throws Error if a reference cannot be resolved
   */
  resolveAllTypeReferences ():void {
    for (const type of this.types.values()) {
      if (type.children!=null) {
        for (const ref of Object.keys(type.children)) {
          const subType=type.children[ref];
          if (isTypeReference(subType)) {
            if( subType.type==XtBaseTypeReference.UNRESOLVED_TYPE) {
              const refType = this.findType(subType.toType, subType.field);
              if( refType!=null) {
                subType.type=refType.type;
              }else {
                throw new Error('Unable to resolve reference '+ref+' of type '+type.type);
              }
            }
          } else if (isUnresolvedType(subType)) {
            const realType=this.findType(subType.unknownType);
            if( realType!=null) {
              type.children[ref]=realType;
            } else {
              throw new Error('Unable to resolve type '+ref+' of type '+type.type+'. '+subType.unknownType+' is not defined.');
            }
          }
        }
      }
    }
  }

}

/**
 * Represents a node in the type hierarchy tree.
 * Each node has a type name, optional children (sub-properties), references to other types,
 * a handler for data operations, and compatibility metadata.
 */
export type XtTypeHierarchy = {
    type:string;
    children?:{[key:string]: XtTypeHierarchy | XtTypeReference} ;
    handler?:XtTypeHandler<any>;
    compatibleTypes?: string[];
    displayTemplate?:string;
    numericField?:string;

    addChild (key:string, child:XtTypeHierarchy) : void;
    addReference (key:string, child:XtTypeReference) : void;
    initHandler ():void;

    isTypeOf(typeName: string): boolean;
    isCompatibleWith (typeName: string): boolean;

    listReferences (): { [key:string]:XtTypeReference};
}

/**
 * Default implementation of {@link XtTypeHierarchy}. Represents a node in the type hierarchy tree,
 * holding type metadata, children, handler, and compatibility information.
 */
export class XtBaseTypeHierarchy implements XtTypeHierarchy {
  type:string;
  children?:{[key:string]: XtBaseTypeHierarchy | XtTypeReference} ;
  handler?:XtTypeHandler<any>;
  compatibleTypes?: string[];
  displayTemplate?:string;
  numericField?:string;


  /**
   * @param type The name of this type
   * @param handler Optional type handler for this type
   */
  constructor (type:string, handler?:XtTypeHandler<any> ) {
      this.type=type;
      this.handler=handler;
  }

  /**
   * Adds a child type to this type hierarchy
   * @param key The name of the child property
   * @param child The child type hierarchy to add
   */
  addChild (key:string, child:XtBaseTypeHierarchy) : void {
      if (this.children==null) this.children= {};
      this.children[key]=child;
  }

  /**
   * Adds a reference child to this type hierarchy
   * @param key The name of the child property
   * @param child The type reference to add
   */
  addReference (key:string, child:XtBaseTypeReference) : void {
    if (this.children==null) this.children= {};
    this.children[key]=child;
  }

  /**
   * Initializes the type handler with this hierarchy context
   */
  initHandler ():void {
      if (this.handler!=null) {
        this.handler.init(this);
      }
    }

    /**
     * Checks whether this type matches the given type name
     * @param toTest The type name to compare
     * @returns True if the type name matches
     */
    isTypeOf (toTest: string){
      return this.type==toTest;
    }

    /**
     * Checks whether this type is compatible with the given type name
     * @param toTest The type name to check compatibility against
     * @returns True if this type is compatible with the target type
     */
    isCompatibleWith (toTest:string): boolean {
      if (this.compatibleTypes==null) return false;
      return this.compatibleTypes.indexOf(toTest) > -1;
    }

  /**
   * Lists all child references
   * @returns A map of reference names to their XtTypeReference definitions
   */
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
 * Placeholder type used when a referenced type has not been registered yet.
 * Resolved later via {@link XtTypeHierarchyResolver.resolveAllTypeReferences}.
 */
export class UNRESOLVED_TYPE extends XtBaseTypeHierarchy {
  unknownType:string|null=null;

  /**
   * @param unknownType The name of the type that could not be resolved yet
   */
  constructor(unknownType:string) {
    super(unknownType);
    this.unknownType=unknownType;
  }
}

/**
 * Checks whether a type hierarchy node is an unresolved type placeholder
 * @param type The type hierarchy to test
 * @returns True if the type is an UNRESOLVED_TYPE
 */
export function isUnresolvedType (type: XtTypeHierarchy): type is UNRESOLVED_TYPE {
  if ((type as any).unknownType!==undefined) return true;
  else
    return false;
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

  /**
   * Creates a new type reference
   * @param toType The name of the referenced type
   * @param field The field on the referenced type that this reference points to
   * @param type Optional resolved type name; defaults to UNRESOLVED_TYPE if not provided
   * @param referenceType Optional cardinality of the relationship
   */
  constructor(toType:string, field:string, type?:string, referenceType?: 'MANY-TO-ONE' | 'ONE-TO-MANY') {
    this.toType = toType;
    this.referenceType = referenceType;
    this.field = field;
    if( type!=null) {
      this.type=type;
    }else this.type=XtBaseTypeReference.UNRESOLVED_TYPE;
  }
}

/**
 * Checks if a value is a primitive type (not a complex object, unless it's a Date)
 * @param valueElement The value to test
 * @returns True if the value is primitive or a Date
 */
function isPrimitive(valueElement: any): boolean {
  if (typeof valueElement == 'object') {
    if (valueElement==null) return true;
    else {
      return valueElement instanceof Date;
    }
  } else return true;
}

/**
 * Determines the primitive type name for a given value
 * @param value The value to inspect
 * @returns The type name (e.g. 'string', 'number', 'date') or undefined if it cannot be determined
 */
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
  displayTemplate?:string;
  numericField?:string;
  children?:{[key:string]: XtTypeReference|XtTypeInfo|string};
}

/**
 * Represents a reference from one type to another type (e.g. foreign key relationship)
 */
export type XtTypeReference = {
  toType:string,
  referenceType?:'MANY-TO-ONE'|'ONE-TO-MANY',
  field:string,
  type?:string
}

/**
 * Checks whether the given type description is a detailed description (XtTypeDetail) or a simple one (XtTypeInfo)
 * @param toTest The type description to test
 * @returns True if the value is an XtTypeDetail
 */
export function isTypeDetail (toTest:XtTypeDetail|XtTypeInfo): toTest is XtTypeDetail {
  if (toTest.compatibleTypes !=null) {
    return Array.isArray(toTest.compatibleTypes);
  }
  for (const sub in toTest) {
    if ((sub!='compatibleTypes') && (sub!='children') && (sub!='displayTemplate') && (sub!='numericField')) {
      return false;
    }
  }
  return true;
}

/**
 * Checks whether the given value is a type reference
 * @param toTest The value to test
 * @returns True if the value is an XtTypeReference
 */
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
