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
