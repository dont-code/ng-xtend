import {
  XtGroupBy,
  XtGroupByAggregate, XtGroupByOperation,
  XtGroupByShow,
  XtSortBy,
  XtSortByDirection
} from './xt-store-parameters';

export interface DontCodeReportType<T> {
  title: string;
  for: string;
  groupedBy?: {[key:string]:XtGroupBy<T>};
  sortedBy?: {[key:string]:XtSortBy<T>};
  as?: {[key:string]:DontCodeReportDisplayType};
}

export interface DontCodeReportDisplayType {
  type: string;
  of: string;
  by?:string;
  title: string;
}

export class XtStoreSortBy<T> implements XtSortBy<T> {

  direction: XtSortByDirection;

  constructor(public by: keyof T, direction?:XtSortByDirection, public subSort?:XtSortBy<T>) {
    if (direction==null)   this.direction=XtSortByDirection.None;
    else this.direction=direction;
  }
}

export class XtStoreGroupBy<T> implements XtGroupBy<T> {
  display:{[key:string]:XtStoreGroupByAggregate<T>};

  constructor(public of:keyof T, display?:{[key:string]:XtStoreGroupByAggregate<T>}, public show?:XtGroupByShow) {
    if (display==null) this.display={};
    else this.display=display;
  }

  public atLeastOneGroupIsRequested (): boolean {
    if( (this.display!=null) && (Object.keys(this.display).length>0))
      return true;
    return false;
  }

  getRequiredListOfFields(): Set<keyof T> {
    const ret = new Set<keyof T>();
    if( this.display!=null) {
      for (const aggregate of Object.values(this.display)) {
        ret.add(aggregate.of);
      }
    }
    return ret;
  }
}

export class XtStoreGroupByAggregate<T> implements XtGroupByAggregate<T>{
  constructor(public of:keyof T, public operation:XtGroupByOperation) {
  }
}

