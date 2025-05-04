export class SpecialFields<Type>
{
  /**
   * Keep track of date fields for json conversion
   * Undefined means not evaluated, null or empty means the type does not have any date field
   */
  dateFields?:Array<keyof Type>|null;
  /**
   * Undefined means not evaluated, null means the type does not have any id field
   */
  idField?:keyof Type | null;

  addDateField(name: keyof Type) {
    if (this.dateFields==null) {
      this.dateFields = new Array<keyof Type>();
    }
    this.dateFields.push(name);
  }

  clearDateFields() {
    if( this.dateFields!=null) {
      this.dateFields.length=0;
    }
  }
}
