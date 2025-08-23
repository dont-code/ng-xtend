import { ManagedData } from '../managed-data/managed-data';
import { SpecialFields } from '../transformation/special-fields';
import { XtTypeHierarchy } from '../resolver/xt-type-resolver';

export type XtTypeHandler<Type> = {
  init(context:XtTypeHierarchy):void,
  idField():keyof Type|null,

  fromJson (json:any):void;
  toJson (value: Type): any;

  dateFromJson (dateAsString:string | null | undefined):Date | null | undefined;
  dateToJson (date:Date | null | undefined):string | null | undefined;

  /**
   * Creates a new empty instance of type. Id is not set at this point
   */
  createNew (): Type;
}

export abstract class AbstractTypeHandler<Type> implements XtTypeHandler<Type> {

  protected fields:SpecialFields<Type> = new SpecialFields<Type>();

  constructor(idField?:keyof Type, dateFields?:Array<keyof Type> ) {
    this.fields.idField=idField;
    this.fields.dateFields=dateFields;
  }

  abstract init (context:XtTypeHierarchy):void;
  abstract createNew (): Type;

  fromJson(json: any): void {
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
  }

  idField():keyof Type|null {
    return this.fields.idField??null;
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

}