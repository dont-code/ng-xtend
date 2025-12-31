import { ManagedData } from '../managed-data/managed-data';
import { SpecialFields } from '../transformation/special-fields';
import { XtTypeHierarchy, XtTypeResolver } from '../resolver/xt-type-resolver';
import { MappingHelper } from '../transformation/mapping-helper';
import { XtSpecialFieldsHelper } from '../transformation/xt-special-fields-helper';

export type XtTypeHandler<Type> = {
  init(context:XtTypeHierarchy):void,
  idField():keyof Type|null,
  getId(value: Type): any | null;

  fromJson (json:any):void;
  toJson (value: Type): any;

  dateFromJson (dateAsString:string | null | undefined):Date | null | undefined;
  dateToJson (date:Date | null | undefined):string | null | undefined;

  /**
   * Creates a new empty instance of type. Id is not set at this point
   */
  createNew (): Type;
  safeDuplicate (value: Type): Type;

  /**
   * Simple support to display or calculate with the item
   */
  stringToDisplay(value:Type):string;
  isDisplayTemplateSet():boolean;
  numberToCalculate(value:Type):number | undefined;

  getOrCreateMappingFrom<OtherType> (fromTypeName: string, registry:XtTypeResolver): MappingHelper<OtherType, Type> | undefined;
}

/**
 * An implementation of XtTypeHandler that provides the basic handling of special fields
 */
export abstract class AbstractTypeHandler<Type> implements XtTypeHandler<Type> {

  protected fields:SpecialFields<Type> = new SpecialFields<Type>();
  protected type:XtTypeHierarchy|null = null;

  /**
   * Marker for 'I checked and you cannot map to this type', don't try again
   */
  protected static readonly NONE_MAPPING=new MappingHelper<any,any>({});

  constructor(specialFields?:SpecialFields<Type> ) {
    if (specialFields!=null) this.fields=specialFields;
  }

  init (context:XtTypeHierarchy):void {
    this.type=context;
    if (context.displayTemplate!=null) this.fields.setDisplayTemplate(context.displayTemplate);
    if (context.numericField!=null) this.fields.setNumericValueField(context.numericField as keyof Type);
    if (this.fields.isEmpty ()) {
      this.fields = XtSpecialFieldsHelper.findSpecialFields(context.type, context);
    }
  }

  createNew (): Type {
    // Try to create an element of the right type
    const targetType = this.type?.type;
    if (targetType!=null) {
      switch (targetType) {
        case 'string': return '' as Type;
        case 'number': return 0 as Type;
        case 'boolean': return false as Type;
        case 'date':
        case 'time':
        case 'date-time':
          return new Date() as Type;
        default:
          if (targetType.includes('[]'))
            return [] as Type;
          else
            return { } as Type;
      }
    }

    return { } as Type;

  }

  fromJson(json: any): void {
    if( json==null) return;
    // Copy the storage id to _id field if it exists
    if (this.fields.idField != null) {
      json._id = json[this.fields.idField];
    }

    if (this.fields.dateFields != null) {
      for (const dateTypeName of this.fields.dateFields) {
        json[dateTypeName] = this.dateFromJson(json[dateTypeName]);
      }
    }

    if( this.fields.oldFields != null) {
      for (const oldField of this.fields.oldFields) {
        const val=json[oldField.oldFieldName];
        if (val!=undefined) {
          json[oldField.newFieldName]=val;
          delete json[oldField.oldFieldName];
        }
      }
    }

    // Converts any subelements as well
    if (this.type?.children!=null) {
      for (const childKey in this.type.children) {
        (this.type.children[childKey] as any).handler?.fromJson(json[childKey]);
      }
    }
  }

  toJson(value: Type): void {
      // Remove the _id field if another id field is defined
    if (this.fields.idField!=null) {
      value[this.fields.idField] = (value as ManagedData)._id as any;
      delete (value as ManagedData)._id;
    }

    if (this.fields.dateFields != null) {
      for (const dateTypeName of this.fields.dateFields) {
        value[dateTypeName] = this.dateToJson(value[dateTypeName] as Date) as any;
      }
    }

    // Converts any subelements as well
    if (this.type?.children!=null) {
      for (const childKey in this.type.children) {
        (this.type.children[childKey] as any).handler?.toJson([childKey as keyof Type]);
      }
    }
  }

  idField():keyof Type|null {
    return this.fields.idField??null;
  }

  getId(value: Type): any | null {
    let fieldId=this.idField();
    if (fieldId!=null) return value[fieldId];
    else return (value as any)._id;
  }

  stringToDisplay(value: Type): string {
    let ret= this.fields.runDisplayTemplate(value);
    if (ret==null) {
      ret=this.getId(value)?.toString() ?? JSON.stringify(value);
    }
    return ret as string;
  }

  numberToCalculate(value: Type): number | undefined {
    if (this.fields.numericValueField!=null) return value[this.fields.numericValueField] as number;
    return undefined;
  }

  dateFromJson(dateAsString: string | null | undefined): Date | null | undefined {
    if (dateAsString!=null) {
      let timeEpoch =Date.parse(dateAsString);
      if( isNaN(timeEpoch)) {
        // Invalid date try to remove a possible TZ description in []
        const tzDescIndex = dateAsString.lastIndexOf('[');
        if (tzDescIndex!=-1) {
          timeEpoch=Date.parse(dateAsString.substring(0, tzDescIndex));
        }
      }
      if (isNaN(timeEpoch)) {
        return undefined;
      }
      else {
         return new Date(timeEpoch);
      }
    }
    return null;
  }

  dateToJson(date: Date | null | undefined): string | null | undefined {
    if (date==null) return date;
    return date.toJSON();
  }

  safeDuplicate (value: Type): Type {
    // For now just make a clone
    const ret= structuredClone(value);
    // The duplicate should have the same Id
    const idField = this.idField();
    if (idField!=null) {
      delete ret[idField];
    }
    delete (ret as ManagedData)._id;
    return ret;
  }

  getOrCreateMappingFrom<OtherType> (fromTypeName: string, registry:XtTypeResolver): MappingHelper<OtherType, Type> | undefined
  {
    let ret=this.fields.getMapping<OtherType>(fromTypeName);
    if (ret===AbstractTypeHandler.NONE_MAPPING) return undefined;
    if (ret==null) {
      // try to find a mapping
      ret = this.createMappingFrom ( fromTypeName, registry);
      if (ret==null) {
        this.fields.setMapping(fromTypeName, AbstractTypeHandler.NONE_MAPPING);
      } else {
        this.fields.setMapping(fromTypeName, ret);
      }
    }
    return ret;
  }

  /**
   * Try to automatically map a type to another by looking at properties that may have different names but the same types.
   * @param fromTypeName
   * @param registry
   * @protected
   */
  protected createMappingFrom<OtherType>(fromTypeName: string, registry:XtTypeResolver): MappingHelper<OtherType, Type> | undefined {
    // Let's see if we have properties with the same types.
    const fromTypes = registry.calculateSubPropertiesPerType<OtherType> (fromTypeName);
    const toTypes = registry.calculateSubPropertiesPerType<Type> (this.type?.type);
    // Do we find all the types needed in the source ?
    const mapping: {[key in keyof OtherType]:keyof Type} = {} as {[key in keyof OtherType]:keyof Type};
    for (const toTypeName of toTypes.keys()) {
      let found=fromTypes.get(toTypeName);
      if (found == null) {
        // Cannot find this type
        return undefined;
      } else {
        const targetPossibilities = toTypes.get(toTypeName)!;
        if ((found.length==1) && (targetPossibilities.length==1)) {
          mapping[found[0]]=targetPossibilities[0];
        } else if (found.length >= targetPossibilities.length) {
          for (const targetProp of targetPossibilities) {
            const matchIndex: number =this.findBestMappingMatch<OtherType> (found, targetProp);
            if (matchIndex!=-1) {
              mapping[found[matchIndex]]=targetProp;
              found.splice(matchIndex, 1);
            }else {
              return undefined;
            }
          }
        }
      }
    }
    return new MappingHelper<OtherType, Type>(mapping);
  }

  /**
   * Try to find which property in the list matches best the target property
   * @param found
   * @param targetProp
   * @protected
   */
  protected findBestMappingMatch<OtherType>(found: (keyof OtherType)[], targetProp: keyof Type): number {
    let index=0;
    // Do they have the same name ?
    for (const key of found) {
      if (key.toString().toLowerCase()==targetProp.toString().toLowerCase()) {
        return index;
      }
      index++;
    }

    // Or similar names ?
    index=0;
    for (const key of found) {
      if ((key.toString().toLowerCase().indexOf(targetProp.toString().toLowerCase())!=-1) ||
          (targetProp.toString().toLowerCase().indexOf(key.toString().toLowerCase())!=-1)) {
        return index;
      }
      index++;
    }

    return -1;
  }

  isDisplayTemplateSet():boolean {
    return this.fields.displayTemplate!=null;
  }

}
