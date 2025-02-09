import {
  XtGroupBy,
  XtGroupByAggregate, XtGroupByOperation,
  XtGroupByShow,
  XtSortBy,
  XtSortByDirection
} from './xt-store-parameters';

export interface DontCodeReportType {
  title: string;
  for: string;
  groupedBy?: {[key:string]:XtGroupBy};
  sortedBy?: {[key:string]:XtSortBy};
  as?: {[key:string]:DontCodeReportDisplayType};
}

export interface DontCodeReportDisplayType {
  type: string;
  of: string;
  by?:string;
  title: string;
}

export class DontCodeStoreSort implements XtSortBy {

  direction: XtSortByDirection;

  constructor(public by: string, direction?:XtSortByDirection, public subSort?:XtSortBy) {
    if (direction==null)   this.direction=XtSortByDirection.None;
    else this.direction=direction;
  }
}

export class DontCodeStoreGroupby implements XtGroupBy {
  display:{[key:string]:DontCodeStoreAggregate};

  constructor(public of:string, display?:{[key:string]:DontCodeStoreAggregate}, public show?:XtGroupByShow) {
    if (display==null) this.display={};
    else this.display=display;
  }

  public atLeastOneGroupIsRequested (): boolean {
    if( (this.display!=null) && (Object.keys(this.display).length>0))
      return true;
    return false;
  }

  getRequiredListOfFields(): Set<string> {
    const ret = new Set<string>();
    if( this.display!=null) {
      for (const aggregate of Object.values(this.display)) {
        ret.add(aggregate.of);
      }
    }
    return ret;
  }
}

export class DontCodeStoreAggregate implements XtGroupByAggregate{
  constructor(public of:string, public operation:XtGroupByOperation) {
  }
}

