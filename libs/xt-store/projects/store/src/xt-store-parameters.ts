
export type XtStoreCriteriaOperator = '='|'<'|'<=';

export class XtStoreCriteria<T> {
  name: keyof T;
  value: any;
  operator: XtStoreCriteriaOperator;

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

export type XtSortBy<T> ={
  by:keyof T,
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

export type XtGroupBy<T>= {
  of: keyof T,
  display:{[key:string]:XtGroupByAggregate<T>};
  show?:XtGroupByShow,
  label?:string

  atLeastOneGroupIsRequested (): boolean;
  getRequiredListOfFields(): Set<keyof T>;
}

export type XtGroupByAggregate<T> = {
  operation: XtGroupByOperation;
  of:keyof T,
  label?:string
}


