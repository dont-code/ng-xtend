import {
  DontCodeGroupOperationType,
  DontCodeReportGroupAggregateType,
  DontCodeReportGroupShowType,
  DontCodeReportGroupType,
  DontCodeReportSortType,
  DontCodeSortDirectionType
} from './xt-reporting';

export enum DontCodeStoreCriteriaOperator {
  EQUALS = '=',
  LESS_THAN = '<',
  LESS_THAN_EQUAL = '<=',
}

export class DontCodeStoreCriteria {
  name: string;
  value: any;
  operator: DontCodeStoreCriteriaOperator;

  constructor(
    name: string,
    value: any,
    operator?: DontCodeStoreCriteriaOperator
  ) {
    this.name = name;
    this.value = value;
    if (!operator) this.operator = DontCodeStoreCriteriaOperator.EQUALS;
    else {
      this.operator = operator;
    }
  }
}

export class DontCodeStoreSort implements DontCodeReportSortType {

  direction: DontCodeSortDirectionType;

  constructor(public by: string, direction?:DontCodeSortDirectionType, public subSort?:DontCodeStoreSort) {
    if (direction==null)   this.direction=DontCodeSortDirectionType.None;
    else this.direction=direction;
  }
}

export class DontCodeStoreGroupby implements DontCodeReportGroupType {
  display:{[key:string]:DontCodeStoreAggregate};

  constructor(public of:string, display?:{[key:string]:DontCodeStoreAggregate}, public show?:DontCodeReportGroupShowType) {
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

export class DontCodeStoreAggregate implements DontCodeReportGroupAggregateType{
  constructor(public of:string, public operation:DontCodeGroupOperationType) {
  }
}
