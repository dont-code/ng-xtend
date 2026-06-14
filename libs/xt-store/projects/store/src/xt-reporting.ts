import {
  XtGroupBy,
  XtGroupByAggregate, XtGroupByOperation,
  XtGroupByShow,
  XtSortBy,
  XtSortByDirection
} from './xt-store-parameters';

/**
 * Defines a report configuration including grouping, sorting, and display settings.
 */
export interface DontCodeReportType<T> {
  title: string;
  for: string;
  groupedBy?: {[key:string]:XtGroupBy<T>};
  sortedBy?: {[key:string]:XtSortBy<T>};
  as?: {[key:string]:DontCodeReportDisplayType};
}

/**
 * Specifies how a single report field should be displayed.
 */
export interface DontCodeReportDisplayType {
  type: string;
  of: string;
  by?:string;
  title: string;
}

/**
 * Concrete implementation of a sort-by specification for use with the store layer.
 */
export class XtStoreSortBy<T> implements XtSortBy<T> {

  direction: XtSortByDirection;

  /**
   * @param by - The field to sort by
   * @param direction - The sort direction (defaults to None)
   */
  constructor(public by: keyof T, direction?:XtSortByDirection) {
    if (direction==null)   this.direction=XtSortByDirection.None;
    else this.direction=direction;
  }
}

/**
 * Concrete implementation of a group-by specification for use with the store layer.
 */
export class XtStoreGroupBy<T> implements XtGroupBy<T> {
  display:{[key:string]:XtStoreGroupByAggregate<T>};

  /**
   * @param of - The field to group by
   * @param display - Optional map of aggregate definitions
   * @param show - Optional directive for which group value to display
   */
  constructor(public of:keyof T, display?:{[key:string]:XtStoreGroupByAggregate<T>}, public show?:XtGroupByShow) {
    if (display==null) this.display={};
    else this.display=display;
  }

  /**
   * Checks whether at least one aggregate group has been configured.
   * @returns True if any display aggregates are defined
   */
  public atLeastOneGroupIsRequested (): boolean {
    if( (this.display!=null) && (Object.keys(this.display).length>0))
      return true;
    return false;
  }

  /**
   * Returns the set of field keys required by all defined aggregates.
   * @returns A set of field names
   */
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

/**
 * Concrete implementation of a group-by aggregate for use with the store layer.
 */
export class XtStoreGroupByAggregate<T> implements XtGroupByAggregate<T>{
  /**
   * @param of - The field to aggregate
   * @param operation - The aggregation operation to perform
   */
  constructor(public of:keyof T, public operation:XtGroupByOperation) {
  }
}

