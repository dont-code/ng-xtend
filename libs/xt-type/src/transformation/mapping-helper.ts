export class MappingHelper<FROM, TO> {

  mapFromTo= new Map<keyof FROM, keyof TO>();
  mapToFrom= new Map<keyof TO, keyof FROM>();

  constructor(mappingInfo:{[key in keyof FROM]: keyof TO}) {
    for (const prop of Object.keys(mappingInfo) as (keyof FROM)[]) {
      this.mapFromTo.set(prop, mappingInfo[prop]);
      this.mapToFrom.set(mappingInfo[prop], prop);
    }
  }

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

  addFromToMapping (fromName:keyof FROM, toName:keyof TO) {
    this.mapFromTo.set(fromName, toName);
    this.mapToFrom.set(toName, fromName);
  }

  addToFromMapping (toName:keyof TO, fromName:keyof FROM) {
    this.mapToFrom.set(toName, fromName);
    this.mapFromTo.set(fromName, toName);
  }

  getValueAs(toName: keyof TO, parent: FROM ): any {
    const fromName = this.mapToFrom.get(toName);
    if (fromName != undefined) {
      return parent[fromName];
    } else {
      return parent[toName as unknown as keyof FROM];
    }
  }

  setValueAs(toName: keyof TO, parent: FROM, value: any ) {
    const fromName = this.mapToFrom.get(toName);
    if (fromName != undefined) {
      parent[fromName] = value;
    } else {
      parent[toName as unknown as keyof FROM] = value;
    }
  }
}
