import { MappingHelper } from './mapping-helper';
import { Eta, type TemplateFunction } from 'eta/core';

/**
 * Manages special field metadata for a type, including id field, date fields,
 * display templates, numeric value fields, old field name mappings, and cross-type mappings.
 */
export class SpecialFields<Type>
{
  /**
   * Keep track of date fields for json conversion
   * Undefined means not evaluated, null or empty means the type does not have any date field
   */
  dateFields?:Array<keyof Type>;
  /**
   * Undefined means not evaluated, null means the type does not have any id field
   */
  idField?:keyof Type;

  /**
   * Squirrelly template for calculating the string to display
   */
  displayTemplate?:TemplateFunction;

  /**
   * Field used to provide numerical value for calculation
   */
  numericValueField?:keyof Type;

  /**
   * Old field names that needs to be converted to new ones when loaded from json
   */
  oldFields?:Array<OldField<Type>>;

  /**
   * Stores the mapping from Type to another type
   */
  /** Map of source type name to mapping helper for cross-type conversion */
  mappingFromType = new Map<string, MappingHelper<any, Type>> ();

  /** Shared Eta template engine instance for compiling display templates */
  protected static readonly templateEngine = new Eta({
    autoEscape:false, autoTrim: 'nl'
  });


  /**
   * @param idField Optional name of the id field
   * @param dateFields Optional list of date field names
   */
  constructor(idField?:keyof Type, dateFields?:Array<keyof Type>) {
    this.idField = idField;
    this.dateFields = dateFields;
  }

  /**
   * Checks whether no special fields are configured
   * @returns True if no special fields have been set
   */
  isEmpty ():boolean {
    return this.idField==null && this.dateFields==null && this.mappingFromType.size==0 && this.numericValueField==null && this.oldFields==null && this.displayTemplate==null;
  }

  /**
   * Registers a mapping from another type to this type
   * @param fromTypeName The source type name
   * @param mapping The mapping helper to register
   */
  setMapping<FromType> (fromTypeName:string, mapping:MappingHelper<FromType, Type>)
  {
    this.mappingFromType.set(fromTypeName, mapping);
  }

  /**
   * Gets the mapping helper from another type to this type
   * @param fromTypeName The source type name
   * @returns The mapping helper or undefined if none is registered
   */
  getMapping<FromType>(fromTypeName:string): MappingHelper<FromType, Type> | undefined {
    return this.mappingFromType.get(fromTypeName);
  }

  /**
   * Registers a date field for automatic JSON date conversion
   * @param name The field name to register as a date field
   * @returns This instance for chaining
   */
  addDateField(name: keyof Type):SpecialFields<Type> {
    if (this.dateFields==null) {
      this.dateFields = new Array<keyof Type>();
    }
    this.dateFields.push(name);
    return this;
  }

  /**
   * Registers a field rename for backward compatibility when loading from JSON
   * @param oldName The old/legacy field name
   * @param newName The current field name
   * @returns This instance for chaining
   */
  addOldField(oldName:string, newName: keyof Type):SpecialFields<Type> {
    if (this.oldFields==null) {
      this.oldFields = new Array<OldField<Type>>();
    }
    this.oldFields.push({
      oldFieldName:oldName,
      newFieldName:newName
    });
    return this;
  }

  /**
   * Clears all registered date fields
   * @returns This instance for chaining
   */
  clearDateFields():SpecialFields<Type> {
    if( this.dateFields!=null) {
      this.dateFields.length=0;
    }
    return this;
  }

  /**
   * Sets and pre-compiles a display template string
   * @param template The template string (uses Eta template syntax), or undefined to clear
   * @returns This instance for chaining
   */
  setDisplayTemplate (template?:string):SpecialFields<Type> {
    if (template==null) {
      this.displayTemplate = undefined;
    }else {
      // Precompile the template
      this.displayTemplate = SpecialFields.templateEngine.compile(template);
    }
    return this;
  }

  /**
   * Renders the display template with the given value
   * @param value The value to render
   * @returns The rendered string or undefined if no template is set
   */
  runDisplayTemplate (value:Type):string|undefined {
    if (this.displayTemplate!=null) {
      return this.displayTemplate.call(SpecialFields.templateEngine,value as object);
    } else {
      return undefined;
    }
  }

  /**
   * Sets the field used for numeric value calculations
   * @param fieldName The field name to use for numeric values (optional, clears if undefined)
   * @returns This instance for chaining
   */
  setNumericValueField (fieldName?:keyof Type):SpecialFields<Type> {
    this.numericValueField = fieldName;
    return this;
  }

  /**
   * Checks whether a type string represents a date-compatible type
   * @param type The type string to check
   * @returns True if the type is Date, string, or number
   */
  static isDateType (type:string):boolean {
    return type==='Date' || type==='string' || type==='number';
  }
}

/**
 * Describes a field rename from an old (legacy) name to a new name
 */
export type OldField<Type> = {
  oldFieldName:string;
  newFieldName:keyof Type;
}
