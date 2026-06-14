/**
 * Maps properties between two types (FROM -> TO and TO -> FROM).
 * Supports bidirectional property mapping with automatic pass-through for unmapped properties.
 */
export class MappingHelper<FROM, TO> {

  /** Forward mapping: FROM property -> TO property */
  mapFromTo= new Map<keyof FROM, keyof TO>();
  /** Reverse mapping: TO property -> FROM property */
  mapToFrom= new Map<keyof TO, keyof FROM>();

  /**
   * @param mappingInfo Optional mapping definition from FROM keys to TO keys
   */
  constructor(mappingInfo:{[key in keyof FROM]: keyof TO}|undefined) {
    if( mappingInfo!=null) {
      for (const prop of Object.keys(mappingInfo) as (keyof FROM)[]) {
        this.mapFromTo.set(prop, mappingInfo[prop]);
        this.mapToFrom.set(mappingInfo[prop], prop);
      }
    }
  }

  /**
   * Maps a FROM value to its TO representation
   * @param value The FROM value to map
   * @param oldTo Optional existing TO value to extend
   * @returns The mapped TO value
   */
  to (value:FROM | null | undefined, oldTo?:TO | null): TO | null | undefined {
    if (value==null) return value as unknown as TO;
    else {
      let ret = oldTo;
      if (ret==null) {
        ret = {} as TO;
      }
      for (const fromKey of Object.keys(value) as (keyof FROM)[]) {
        let toKey=this.mapFromTo.get(fromKey);
        if ((toKey == null) && (fromKey!='_id')) { toKey=fromKey as unknown as keyof TO;} // Assume no mapping = same mapping, don't copy the Ids
        if (toKey!=null)
          ret[toKey]=value[fromKey] as any;
      }
      return ret;
    }
  }

  /**
   * Maps a TO value back to its FROM representation
   * @param value The TO value to map from
   * @param oldFrom Optional existing FROM value to extend
   * @returns The mapped FROM value
   */
  from (value:TO | null | undefined, oldFrom?:FROM | null): FROM | null | undefined {
    if (value==null) return value as unknown as FROM;
    else {
      let ret = oldFrom;
      if (ret==null) {
        ret = {} as FROM;
      }
      for (const toKey of Object.keys(value) as (keyof TO)[]) {
        let fromKey=this.mapToFrom.get(toKey);
        if ((fromKey == null)&&(toKey!='_id')) { fromKey=toKey as unknown as keyof FROM;}
        if (fromKey!=null)
          ret[fromKey]=value[toKey] as any;
      }
      return ret;
    }
  }

  /**
   * Adds a mapping from a FROM property to a TO property
   * @param fromName The FROM-side property name
   * @param toName The TO-side property name
   */
  addFromToMapping (fromName:keyof FROM, toName:keyof TO) {
    this.mapFromTo.set(fromName, toName);
    this.mapToFrom.set(toName, fromName);
  }

  /**
   * Adds a mapping from a TO property to a FROM property
   * @param toName The TO-side property name
   * @param fromName The FROM-side property name
   */
  addToFromMapping (toName:keyof TO, fromName:keyof FROM) {
    this.mapToFrom.set(toName, fromName);
    this.mapFromTo.set(fromName, toName);
  }

  /**
   * Gets a value from the FROM object using the TO property name
   * @param toName The TO-side property name
   * @param parent The FROM object to read from
   * @returns The mapped value
   */
  getValueAs(toName: keyof TO, parent: FROM ): any {
    const fromName = this.mapToFrom.get(toName);
    if (fromName != undefined) {
      return parent[fromName];
    } else {
      return parent[toName as unknown as keyof FROM];
    }
  }

  /**
   * Sets a value on the FROM object using the TO property name
   * @param toName The TO-side property name
   * @param parent The FROM object to modify
   * @param value The value to set
   */
  setValueAs(toName: keyof TO, parent: FROM, value: any ) {
    const fromName = this.mapToFrom.get(toName);
    if (fromName != undefined) {
      parent[fromName] = value;
    } else {
      parent[toName as unknown as keyof FROM] = value;
    }
  }
}

/**
 * Mapper when no mapping is needed (FROM and TO are the same type).
 * Simply spreads values without any property translation.
 */
export class NoMappingHelper<TYPE> extends MappingHelper<TYPE, TYPE> {
  constructor() {
    super(undefined);
  }

  /**
   * Merges the FROM value into the TO value by spreading both
   * @param value The value to map
   * @param oldTo Optional existing value to merge into
   * @returns The merged value
   */
  override to (value:TYPE | null | undefined, oldTo?:TYPE | null): TYPE | null | undefined {
    return {...oldTo, ...value} as TYPE;
  }
  /**
   * Merges the TO value into the FROM value by spreading both
   * @param value The value to map from
   * @param oldFrom Optional existing value to merge into
   * @returns The merged value
   */
  override from (value:TYPE | null | undefined, oldFrom?:TYPE | null): TYPE | null | undefined {
    return {...oldFrom, ...value} as TYPE;
  }

  /**
   * Directly reads a property from the parent (no translation needed)
   * @param toName The property name
   * @param parent The object to read from
   * @returns The property value
   */
  override getValueAs(toName: keyof TYPE, parent: TYPE ): any {
    return parent[toName];
  }

  /**
   * Directly sets a property on the parent (no translation needed)
   * @param toName The property name
   * @param parent The object to modify
   * @param value The value to set
   */
  setValueAs(toName: keyof TYPE, parent: TYPE, value: any ) {
    parent[toName] = value;
  }

}
