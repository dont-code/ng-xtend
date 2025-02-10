
export enum XtStoreCriteriaOperator {
  EQUALS = '=',
  LESS_THAN = '<',
  LESS_THAN_EQUAL = '<=',
}

export class XtStoreCriteria {
  name: string;
  value: any;
  operator: XtStoreCriteriaOperator;

  constructor(
    name: string,
    value: any,
    operator?: XtStoreCriteriaOperator
  ) {
    this.name = name;
    this.value = value;
    if (!operator) this.operator = XtStoreCriteriaOperator.EQUALS;
    else {
      this.operator = operator;
    }
  }
}

export type XtSortBy ={
  by:string,
  direction: XtSortByDirection
}

export enum XtSortByDirection {
  None = "None",
  Ascending = "Ascending",
  Descending = "Descending"
}

export enum XtGroupByShow {
  OnlyLowest="OnlyLowest",
  OnlyHighest="OnlyHighest"
}

export enum XtGroupByOperation {
  Count= "Count",
  Sum="Sum",
  Average="Average",
  Minimum="Minimum",
  Maximum="Maximum"
}

export type XtGroupBy= {
  of: string,
  display:{[key:string]:XtGroupByAggregate};
  show?:XtGroupByShow,
  label?:string

  atLeastOneGroupIsRequested (): boolean;
  getRequiredListOfFields(): Set<string>;
}

export type XtGroupByAggregate = {
  operation: XtGroupByOperation;
  of:string,
  label?:string
}


