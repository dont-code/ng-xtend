import { ManagedData } from '../managed-data/managed-data';

export type XtTypeHandler<TD>= {
  isHandling (value:ManagedData):TD|null;
  subTypeNames (): string[];
  newValue (definition?:TD):ManagedData;
  toJson (value:ManagedData):string;
  fromJson (json:string):ManagedData;
}