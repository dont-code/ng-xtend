
/**
 * Supported comparison operators for store criteria filtering.
 */
export type XtStoreCriteriaOperator = '='|'<'|'<=';

/**
 * Defines a filter criterion for querying entities by a specific field, value, and operator.
 */
export class XtStoreCriteria<T> {
  name: keyof T;
  value: any;
  operator: XtStoreCriteriaOperator;

  /**
   * @param name - The field name to filter on
   * @param value - The value to compare against
   * @param operator - The comparison operator (defaults to '=')
   */
  constructor(
    name: keyof T,
    value: any,
    operator?: XtStoreCriteriaOperator
  ) {
    this.name = name;
    this.value = value;
    if (!operator) this.operator = '=';
    else {
      this.operator = operator;
    }
  }

  /**
   * Tests whether a given object matches this criterion.
   * @param toFilter - The object to test
   * @returns True if the object passes the filter
   */
  filter (toFilter:any): boolean {
    const testValue=toFilter[this.name];
    switch (this.operator) {
      case '=':
        return testValue == this.value;
      case '<':
        return (testValue as number)<(this.value as number);
      case '<=':
        return (testValue as number)<(this.value as number);
      default:
        return true;
    }
  }

}

/**
 * Defines a sort specification for a single field.
 */
export type XtSortBy<T> ={
  by:keyof T,
  direction: XtSortByDirection
}

/**
 * Direction options for sorting query results.
 */
export enum XtSortByDirection {
  None = "None",
  Ascending = "Ascending",
  Descending = "Descending"
}

/**
 * Determines which group value to display when grouping.
 */
export enum XtGroupByShow {
  OnlyLowest="OnlyLowest",
  OnlyHighest="OnlyHighest"
}

/**
 * Supported aggregation operations for group-by calculations.
 */
export enum XtGroupByOperation {
  Count= "Count",
  Sum="Sum",
  Average="Average",
  Minimum="Minimum",
  Maximum="Maximum"
}

/**
 * Configuration for grouping entities by a field and computing aggregates.
 */
export type XtGroupBy<T>= {
  of: keyof T,
  display:{[key:string]:XtGroupByAggregate<T>};
  show?:XtGroupByShow,
  label?:string

  atLeastOneGroupIsRequested (): boolean;
  getRequiredListOfFields(): Set<keyof T>;
}

/**
 * Defines a single aggregate operation within a group-by configuration.
 */
export type XtGroupByAggregate<T> = {
  operation: XtGroupByOperation;
  of:keyof T,
  label?:string
}


