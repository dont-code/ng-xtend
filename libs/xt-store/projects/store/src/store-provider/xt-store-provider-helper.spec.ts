import {XtStoreProviderHelper} from './xt-store-provider-helper';
import { XtStoreGroupByAggregate, XtStoreGroupBy } from '../xt-reporting';
import { XtGroupByOperation } from '../xt-store-parameters';
import { ManagedData, xtTypeManager } from 'xt-type';
import { describe, expect, it } from 'vitest';

describe('Store Provider Helper', () => {
  it('should correctly manage id fields', () => {

    xtTypeManager().addType("EntityA", {
        "_id": "Text",
        "name": "Text"
    });

    let result = XtStoreProviderHelper.findTypeHandler("EntityA");

    expect(result.handler?.idField()).toEqual("_id");

    let listToTest:Array<ManagedData>=[{
      _id:"454545",
      name:"Name1"
    }, {
      _id:"76877",
      name:"Name2"
    }]
    let toStore = new Array(...listToTest);
    XtStoreProviderHelper.cleanUpDataBeforeSaving(toStore, result.typeName!, result.handler);
    expect(toStore[0]).toStrictEqual(listToTest[0]);

    xtTypeManager().addType("EntityB", {
      "uniqueName": "Text",
      "firstName": "Text"
    })
    result = XtStoreProviderHelper.findTypeHandler("EntityB");
    expect(result.handler?.idField()).toBeNull();

    listToTest=[{
      uniqueName:"454545",
      firstName:"Name1"
    }, {
      uniqueName:"76877",
      firstName:"Name2"
    }];

    XtStoreProviderHelper.cleanUpLoadedData(listToTest, result.typeName!, result.handler);
    expect(listToTest[0]._id).toBeUndefined();

    toStore = new Array(...listToTest);
    XtStoreProviderHelper.cleanUpDataBeforeSaving(toStore, result.typeName!, result.handler);
    expect(toStore[0]._id).toBeUndefined();
    expect(toStore[1]._id).toBeUndefined();

  });

  it('should correctly manage Date fields', () => {

    xtTypeManager().addType("DateEntityB", {
      "_id":"Text",
      "Date":"Date & Time"
    });
    let result = XtStoreProviderHelper.findTypeHandler("DateEntityB");

    expect(result.handler).toBeTruthy();

    let listToTest:Array<ManagedData>=[{
      _id:"454545",
      Date:"2024-12-23T13:18:37.000Z"
    }, {
      _id:"76877",
      Date:"2022-12-10T14:51:59.110Z"
    }]

    XtStoreProviderHelper.cleanUpLoadedData(listToTest, result.typeName!, result.handler);
    expect(listToTest[0]["Date"] instanceof Date).toBeTruthy();

    expect(listToTest[0]["Date"]!.valueOf()).not.toBeNaN();
    expect(listToTest[1]["Date"]!.valueOf()).not.toBeNaN();
  });

/*  it('should dynamically manage Id fields', () => {
    xtTypeManager().addType("DynEntityA",{
      "other":"Text",
      "description":"Text"
    });
    let result = XtStoreProviderHelper.findTypeHandler("DynEntityA");

    expect(result.handler?.idField()).toBeNull();

    const listToTest=[{
      other:"Test",
      description:"Test2",
      "newField":"NewValue"
    }, {
      other:"Test",
      description:"Test2"
    }];

      // This will try to guess the id from the data itself
    XtStoreProviderHelper.cleanUpLoadedData(listToTest, result.typeName!, result.handler);

    expect(result.handler?.idField()).toBeNull();

    XtStoreProviderHelper.cleanUpLoadedData([{
      other:"Test",
      description:"Test1",
      "_id":"NewValue"
    }, {
      other:"Test",
      description:"Test2",
      "_id":"NewValue2"
    }], result.typeName!, result.handler);
    expect(result.handler?.idField()).toStrictEqual("id");

  });*/

  it('should calculate groups correctly', () => {
  //    XtStoreProviderHelper.clearConfigCache();
      const resp=XtStoreProviderHelper.calculateGroupedByValues("test",[{
        id:'id1',
        type:'type1',
        text:'text1',
        value:100,
        money: {
          amount:null,
          currencyCode:'EUR'
        },
        date:new Date(2023,1,1)
      },{
          id:'id2',
          type:'type1',
          text:'text2',
          value:200,
          money: {
            amount:200,
            currencyCode:'EUR'
          },
          date:new Date(2023,4,1)
        },{
          id:'idNull',
          type:'type1',
          text:null,
          value:null,
          money: {
            amount:100,
            currencyCode:'EUR'
          },
          date:null
        },{
          id:'id3',
          type:'type2',
          text:'text3',
          value:300,
          money: {
            amount:300,
            currencyCode:'EUR'
          },
          date:new Date(2023,7,1)
        },{
          id:'id4',
          type:'type2',
          text:'text4',
          value:400,
          money: {
            amount:400,
            currencyCode:'EUR'
          },
          date:new Date(2023,10,1)
        },{
          id:'idUndefined',
          type:'type2'
        }],
        new XtStoreGroupBy('type', {
          'aaa': new XtStoreGroupByAggregate('text',XtGroupByOperation.Count ),
          'aba': new XtStoreGroupByAggregate('value',XtGroupByOperation.Count ),
          'abb': new XtStoreGroupByAggregate('value',XtGroupByOperation.Minimum ),
          'abc': new XtStoreGroupByAggregate('value',XtGroupByOperation.Maximum ),
          'abd': new XtStoreGroupByAggregate('value',XtGroupByOperation.Sum ),
          'abe': new XtStoreGroupByAggregate('value',XtGroupByOperation.Average ),
          'aca': new XtStoreGroupByAggregate('money',XtGroupByOperation.Count ),
          'acb': new XtStoreGroupByAggregate('money',XtGroupByOperation.Minimum ),
          'acc': new XtStoreGroupByAggregate('money',XtGroupByOperation.Maximum ),
          'acd': new XtStoreGroupByAggregate('money',XtGroupByOperation.Sum ),
          'ace': new XtStoreGroupByAggregate('money',XtGroupByOperation.Average ),
          'ada': new XtStoreGroupByAggregate('date',XtGroupByOperation.Count ),
          'adb': new XtStoreGroupByAggregate('date',XtGroupByOperation.Minimum ),
          'adc': new XtStoreGroupByAggregate('date',XtGroupByOperation.Maximum ),
          'add': new XtStoreGroupByAggregate('date',XtGroupByOperation.Sum ),
          'ade': new XtStoreGroupByAggregate('date',XtGroupByOperation.Average )

        }));

      expect(resp?.values?.size).toEqual(2);
      const type1Values = resp?.values?.get('type1');
      const type2Values = resp?.values?.get('type2');
      if ((type1Values==null) || (type2Values==null)) {
        expect(type1Values).not.toBeNull();
        expect(type2Values).not.toBeNull();
      } else {
        expect(type1Values?.length).toEqual(16);
        expect(type2Values?.length).toEqual(16);
        expect(type1Values[0].value).toEqual(2);  // Count of text
        expect(type1Values[1].value).toEqual(2);  // Count of value
        expect(type1Values[2].value).toEqual(100);  // Min of value
        expect(type1Values[3].value).toEqual(200);  // Max of value
        expect(type1Values[4].value).toEqual(300);  // Sum of value
        expect(type1Values[5].value).toEqual(150);  // Average of value
        /*expect(type1Values[6].value).toEqual(2);  // Count of money
        expect(type1Values[7].value).toEqual({amount:100, currencyCode:'EUR'});  // Min of money
        expect(type1Values[8].value).toEqual({amount:200, currencyCode:'EUR'});  // Max of money
        expect(type1Values[9].value).toEqual({amount:300, currencyCode:'EUR'});  // Sum of money
        expect(type1Values[10].value).toEqual({amount:150, currencyCode:'EUR'});  // Average of money*/
        expect(type1Values[11].value).toEqual(2);  // Count of date
        expect(type1Values[12].value).toEqual(new Date(2023, 1, 1));  // Min of date
        expect(type1Values[13].value).toEqual(new Date(2023, 4, 1));  // Max of date
        expect(type1Values[14].value).toBeNull();  // Sum of date
        expect(type1Values[15].value).toBeNull();  // Average of date


        expect(type2Values[0].value).toEqual(2);  // Count of text
        expect(type2Values[1].value).toEqual(2);  // Count of value
        expect(type2Values[2].value).toEqual(300);  // Min of value
        expect(type2Values[3].value).toEqual(400);  // Max of value
        expect(type2Values[4].value).toEqual(700);  // Sum of value
        expect(type2Values[5].value).toEqual(350);  // Average of value
        /*expect(type2Values[6].value).toEqual(2);  // Count of money
        expect(type2Values[7].value).toEqual({amount:300, currencyCode:'EUR'});  // Min of money
        expect(type2Values[8].value).toEqual({amount:400, currencyCode:'EUR'});  // Max of money
        expect(type2Values[9].value).toEqual({amount:700, currencyCode:'EUR'});  // Sum of money
        expect(type2Values[10].value).toEqual({amount:350, currencyCode:'EUR'});  // Average of money*/
        expect(type2Values[11].value).toEqual(2);  // Count of date
        expect(type2Values[12].value).toEqual(new Date(2023, 7, 1));  // Min of date
        expect(type2Values[13].value).toEqual(new Date(2023, 10, 1));  // Max of date
        expect(type2Values[14].value).toBeNull();  // Sum of date
        expect(type2Values[15].value).toBeNull();  // Average of date
      }
    }
  )
  }
);
