import { ManagedData } from '../managed-data/managed-data';

export type XtTypeHandler<Type> = {
  init():void,
  idField():keyof Type|null,

  fromJson (json:any):void;
  toJson (value: Type): any;

  dateFromJson (dateAsString:string | null | undefined):Date | null | undefined;
  dateToJson (date:Date | null | undefined):string | null | undefined;
}

export abstract class AbstractTypeHandler<Type> implements XtTypeHandler<Type> {

  protected _idField:keyof Type|undefined;
  protected dateFields:Array<keyof Type>=[];

  constructor(idField?:keyof Type, dateFields?:Array<keyof Type> ) {
    this._idField=idField;
    this.dateFields=dateFields??[];
  }

  abstract init ():void;

  fromJson(json: any): void {
    // Copy the storage id to _id field if it exists
    if (this._idField!=null) {
      json._id=json[this._idField];
    }
  }

  toJson(value: Type): void {
      // Remove the _id field if another id field is defined
    if (this._idField!=null) {
      value[this._idField] = (value as ManagedData)._id as any;
      delete (value as ManagedData)._id;
    }
  }

  idField():keyof Type|null {
    return this._idField??null;
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