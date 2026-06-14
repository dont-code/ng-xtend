import { ManagedData } from '../managed-data/managed-data';
import { SpecialFields } from '../transformation/special-fields';
import { XtTypeHierarchy, XtTypeResolver } from '../resolver/xt-type-resolver';
import { MappingHelper } from '../transformation/mapping-helper';
import { XtSpecialFieldsHelper } from '../transformation/xt-special-fields-helper';

/**
 * Handles type-specific operations for a given Type, including JSON serialization,
 * id management, date conversion, display, and cross-type mapping.
 */
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

  /** Special fields metadata (id, dates, display template, numeric value) */
  protected fields:SpecialFields<Type> = new SpecialFields<Type>();
  /** The type hierarchy context for this handler */
  protected type:XtTypeHierarchy|null = null;

  /**
   * Marker for 'I checked and you cannot map to this type', don't try again
   */
  protected static readonly NONE_MAPPING=new MappingHelper<any,any>({});

  /**
   * @param specialFields Optional pre-configured special fields
   */
  constructor(specialFields?:SpecialFields<Type> ) {
    if (specialFields!=null) this.fields=specialFields;
  }

  /**
   * Initializes the handler with a type hierarchy context, configuring special fields
   * @param context The type hierarchy to initialize from
   */
  init (context:XtTypeHierarchy):void {
    this.type=context;
    if (context.displayTemplate!=null) this.fields.setDisplayTemplate(context.displayTemplate);
    if (context.numericField!=null) this.fields.setNumericValueField(context.numericField as keyof Type);
    this.fields = XtSpecialFieldsHelper.findSpecialFields(context.type, context, this.fields);
  }

  /**
   * Creates a new empty instance of the type, with appropriate default values for primitives
   * @returns A new empty value of the type
   */
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

  /**
   * Converts a JSON object to the appropriate format, handling id mapping, date conversion,
   * old field renaming, and recursive child conversion
   * @param json The JSON object to convert
   */
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

  /**
   * Converts a value to its JSON representation, handling id field and date serialization
   * @param value The value to convert to JSON
   */
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

  /**
   * Returns the configured id field name
   * @returns The id field name or null if not configured
   */
  idField():keyof Type|null {
    return this.fields.idField??null;
  }

  /**
   * Gets the id of a value, either from the configured id field or from _id
   * @param value The value to get the id from
   * @returns The id value, or null if not found
   */
  getId(value: Type): any | null {
    let fieldId=this.idField();
    if (fieldId!=null) return value[fieldId];
    else return (value as any)._id;
  }

  /**
   * Converts a value to its display string using the configured template
   * @param value The value to convert to a display string
   * @returns The display string
   */
  stringToDisplay(value: Type): string {
    let ret= null;
    if (value!=null) {
      ret=this.fields.runDisplayTemplate(value);
      if (ret==null) {
        ret=this.getId(value)?.toString() ?? JSON.stringify(value);
      }
    }
    return ret as string;
  }

  /**
   * Extracts a numeric value from the type for calculation purposes
   * @param value The value to extract a number from
   * @returns The numeric value or undefined if no numeric field is configured
   */
  numberToCalculate(value: Type): number | undefined {
    if (this.fields.numericValueField!=null) return value[this.fields.numericValueField] as number;
    return undefined;
  }

  /**
   * Parses a date string into a Date object, handling optional timezone annotations
   * @param dateAsString The date string to parse
   * @returns A Date object, null for null input, or undefined if parsing fails
   */
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

  /**
   * Converts a Date to its JSON string representation
   * @param date The date to convert
   * @returns The JSON string, or null/undefined if input was null/undefined
   */
  dateToJson(date: Date | null | undefined): string | null | undefined {
    if (date==null) return date;
    return date.toJSON();
  }

  /**
   * Creates a safe duplicate of a value, removing its id
   * @param value The value to duplicate
   * @returns A deep clone of the value without its id field
   */
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

  /**
   * Gets an existing mapping from another type or creates one by automatic property matching
   * @param fromTypeName The source type name to map from
   * @param registry The type resolver used for property matching
   * @returns The mapping helper, or undefined if no mapping could be created
   */
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

  /**
   * Checks whether a display template has been configured
   * @returns True if a display template is set
   */
  isDisplayTemplateSet():boolean {
    return this.fields.displayTemplate!=null;
  }

}
