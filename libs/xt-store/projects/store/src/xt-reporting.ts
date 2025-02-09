export interface DontCodeReportType {
  title: string;
  for: string;
  groupedBy?: {[key:string]:DontCodeReportGroupType};
  sortedBy?: {[key:string]:DontCodeReportSortType};
  as?: {[key:string]:DontCodeReportDisplayType};
}

export interface DontCodeReportGroupType {
  of: string,
  display:{[key:string]:DontCodeReportGroupAggregateType};
  show?:DontCodeReportGroupShowType,
  label?:string,
}

export interface DontCodeReportGroupAggregateType {
  operation: DontCodeGroupOperationType;
  of:string,
  label?:string
}

export enum DontCodeReportGroupShowType {
  OnlyLowest="OnlyLowest",
  OnlyHighest="OnlyHighest"
}

export enum DontCodeGroupOperationType {
  Count= "Count",
  Sum="Sum",
  Average="Average",
  Minimum="Minimum",
  Maximum="Maximum"
}

export interface DontCodeReportSortType {
  by:string,
  direction: DontCodeSortDirectionType
}

export enum DontCodeSortDirectionType {
  None = "None",
  Ascending = "Ascending",
  Descending = "Descending"
}

export interface DontCodeReportDisplayType {
  type: string;
  of: string;
  by?:string;
  title: string;
}
