/**
 * Keeps meta-data information about a ManagedData fields.
 * Useful when manipulating list of ManagedData where you discover (and store) fields on the go.
 */

export class SpecialFields
{
  dateFields:Array<string>|null=null;
  idField:any = null;

  addDateField(name: any) {
    if (this.dateFields==null) {
      this.dateFields = new Array<string>();
    }
    this.dateFields.push(name);
  }
}
