import { describe, expect, it } from 'vitest';
import { MappingHelper } from './mapping-helper';

describe('Handle Mapping of fields', () => {
  it ('should correctly read mapped values', () => {

    const helper = new MappingHelper<TestFromType, TestToType>({
      fromDate:'testDate',
      fromName:'testName'
    });

    const fromValue:TestFromType = {fromDate:new Date(), fromName:'fromNameValue'};
    expect(helper.getValueAs('testName', fromValue)).toEqual(fromValue.fromName);
    const newDate=new Date(2020, 3, 4);
    helper.setValueAs('testDate', fromValue, newDate);
    expect(helper.getValueAs('testDate', fromValue)).toEqual(newDate);

    const toValue = helper.to(fromValue)!;
    expect(toValue).toEqual({
      testDate: newDate,
      testName: 'fromNameValue'
    });

    toValue.testName='NewName';
    const newFromValue = helper.from(toValue)!;
    expect(newFromValue).toEqual({
      fromDate: newDate,
      fromName:'NewName'
    });
  })
})

export type TestToType = {
  testDate:Date,
  testName:string
}

export type TestFromType = {
  fromDate:Date,
  fromName:string
}
