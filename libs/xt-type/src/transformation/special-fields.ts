import { MappingHelper } from './mapping-helper';
import { Eta, TemplateFunction } from 'eta/core';

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
  mappingFromType = new Map<string, MappingHelper<any, Type>> ();

  protected static readonly templateEngine = new Eta();


  constructor(idField?:keyof Type, dateFields?:Array<keyof Type>) {
    this.idField = idField;
    this.dateFields = dateFields;
  }

  isEmpty ():boolean {
    return this.idField==null && this.dateFields==null && this.mappingFromType.size==0 && this.numericValueField==null && this.oldFields==null && this.displayTemplate==null;
  }

  setMapping<FromType> (fromTypeName:string, mapping:MappingHelper<FromType, Type>)
  {
    this.mappingFromType.set(fromTypeName, mapping);
  }

  getMapping<FromType>(fromTypeName:string): MappingHelper<FromType, Type> | undefined {
    return this.mappingFromType.get(fromTypeName);
  }

  addDateField(name: keyof Type):SpecialFields<Type> {
    if (this.dateFields==null) {
      this.dateFields = new Array<keyof Type>();
    }
    this.dateFields.push(name);
    return this;
  }

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

  clearDateFields():SpecialFields<Type> {
    if( this.dateFields!=null) {
      this.dateFields.length=0;
    }
    return this;
  }

  setDisplayTemplate (template?:string):SpecialFields<Type> {
    if (template==null) {
      this.displayTemplate = undefined;
    }else {
      // Precompile the template
      this.displayTemplate = SpecialFields.templateEngine.compile(template);
    }
    return this;
  }

  runDisplayTemplate (value:Type):string|undefined {
    if (this.displayTemplate!=null) {
      return this.displayTemplate.call(SpecialFields.templateEngine,value as object);
    } else {
      return undefined;
    }
  }

  setNumericValueField (fieldName?:keyof Type):SpecialFields<Type> {
    this.numericValueField = fieldName;
    return this;
  }

  static isDateType (type:string):boolean {
    return type==='Date' || type==='string' || type==='number';
  }
}

export type OldField<Type> = {
  oldFieldName:string;
  newFieldName:keyof Type;
}
