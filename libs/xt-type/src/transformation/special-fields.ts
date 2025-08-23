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
   * Old field names that needs to be converted to new ones when loaded from json
   */
  oldFields?:Array<OldField<Type>>;

  addDateField(name: keyof Type) {
    if (this.dateFields==null) {
      this.dateFields = new Array<keyof Type>();
    }
    this.dateFields.push(name);
  }

  addOldField(oldName:string, newName: keyof Type) {
    if (this.oldFields==null) {
      this.oldFields = new Array<OldField<Type>>();
    }
    this.oldFields.push({
      oldFieldName:oldName,
      newFieldName:newName
    });
  }

  clearDateFields() {
    if( this.dateFields!=null) {
      this.dateFields.length=0;
    }
  }
}

export type OldField<Type> = {
  oldFieldName:string;
  newFieldName:keyof Type;
}
