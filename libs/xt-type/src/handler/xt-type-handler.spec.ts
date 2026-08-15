import { describe, expect, it } from 'vitest';
import { AbstractTypeHandler } from './xt-type-handler';
import { xtTypeManager } from '../globals';
import { SpecialFields } from '../transformation/special-fields';
import { ManagedDataHandler } from '../managed-data/managed-data-handler';
import { ManagedData } from '../managed-data/managed-data';
import { DefaultTypeHandler } from './default/default-type-handler.ts';
import { XtBaseTypeHierarchy } from '../resolver/xt-type-resolver.ts';

describe('Type Handler', () => {
  it('should support json date translation', () => {
    const handler = new TestTypeHandler();
    let json={
      id: 'test1',
      newName: 'test1',
      date: '2018-05-01'
    }
    handler.fromJson(json);

    expect(json.id).toBe('test1');
    expect(json.newName).toBe('test1');
    expect(json.date).toBeInstanceOf(Date);

    handler.toJson(json as unknown as ToHandleType);

    expect(json.date).toEqual('2018-05-01T00:00:00.000Z');
  });

  it('should support json id translation', () => {
    const handler = new TestTypeHandler();
    let json={
      id: 'test1',
      newName: 'test1',
      date: '2018-05-01'
    }
    handler.fromJson(json);

    expect((json as any)._id).toBe('test1');

    (json as any)._id='newId';
    handler.toJson(json as unknown as ToHandleType);

    expect(json.id).toEqual('newId');
    expect((json as any)._id).toBeUndefined();
  });

  it ('should calculate display string', () => {
    const handler = new ManagedDataHandler(
      new SpecialFields<ManagedData>().setDisplayTemplate('Name: <%= it.firstName %>, <%= it.lastName %>')
    );
    const display=handler.stringToDisplay({
      firstName:'John',
      lastName:'Doe'
    });

    expect (display).toEqual('Name: John, Doe');
  });

  it ('should support numerical value', () => {
    const handler = new ManagedDataHandler(
      new SpecialFields<ManagedData>().setNumericValueField('amount')
    );
    const amount=handler.numberToCalculate({
      firstName:'John',
      lastName:'Doe',
      currency:'EUR',
      amount:34.5
    });

    expect (amount).toEqual(34.5);
  });

  it('should support old field translation', () => {
    const handler = new TestTypeHandler();
    let json={
      id: 'test1',
      oldName: 'test1',
      date: '2018-05-01'
    }
    handler.fromJson(json);

    expect((json as unknown as ToHandleType).newName).toBe('test1');
    expect(json.oldName).toBeUndefined();

    handler.toJson(json as unknown as ToHandleType);

    expect((json as unknown as ToHandleType).newName).toBe('test1');
    expect(json.oldName).toBeUndefined();
  });

  it('should support subType translation', () => {
    xtTypeManager().addRootType('subType', {
      newName:'string',
      date:'date'
    }, new SubTypeTestHandler());

    xtTypeManager().addRootType('complexType', {
      subType:'subType'
    }, new ComplexTypeTestHandler());

    const handler = xtTypeManager().findTypeHandler('complexType')?.handler!;
    let json={
      id: 'test1',
      subType:{
        oldName: 'test1',
        date: '2018-05-01'
      }
    }
    handler.fromJson(json);
    expect((json as unknown as ComplexType).subType.newName).toBe('test1');
    expect((json as unknown as ComplexType).subType.date).toBeInstanceOf(Date);

    handler.toJson(json as unknown as ComplexType);
    expect((json as unknown as ComplexType).subType.date).toEqual(new Date('2018-05-01'));

  });

  it ('should correctly map simple types', () => {
    const resolver = xtTypeManager();
    const testToHandler=new TestToTypeHandler();
    resolver.addRootType('fromSimpleType', {
      name: 'string',
      date: 'date',
      count: 'number'
    });
    resolver.addRootType('toSimpleType', {
      nom: 'string',
      jours: 'date',
      nombre: 'number'
    }, testToHandler);

    const mapping = testToHandler.getOrCreateMappingFrom('fromSimpleType', resolver);
    expect(mapping).toBeTruthy();
    const curDate = new Date();
    const mapped = mapping!.to ({
      name: 'nom1',
      date: curDate,
      count: 3
    });
    expect (mapped).toEqual({
      nom:'nom1',
      jours: curDate,
      nombre: 3
    });
  });

  it ('should correctly map complex types', () => {
    const resolver = xtTypeManager();
    const testToComplexHandler=new TestToComplexHandler();
    resolver.addRootType('fromComplexType', {
      name: 'string',
      startdate: 'date',
      enddate: 'date',
      description:'string',
      count: 'number'
    });
    resolver.addRootType('toComplexType', {
      description:'string',
      lastname: 'string',
      start: 'date',
      end: 'date',
      nombre: 'number'
    }, testToComplexHandler);

    const mapping = testToComplexHandler.getOrCreateMappingFrom('fromComplexType', resolver);
    expect(mapping).toBeTruthy();
    const curDate = new Date();
    const endDate = new Date().setMonth((curDate.getMonth() + 1)%13);
    const mapped = mapping!.to ({
      name: 'nom3',
      startdate: curDate,
      enddate: endDate,
      description:'description 3',
      count: 3
    });
    expect (mapped).toEqual({
      lastname:'nom3',
      start: curDate,
      end: endDate,
      description:'description 3',
      nombre: 3
    });
  })

  it ('should fail on non-mappable types', () => {
    const resolver = xtTypeManager();
    const testToHandler=new TestToTypeHandler();
    resolver.addRootType('fromBadType', {
      name: 'string',
      count: 'number'
    });
    resolver.addRootType('toBadType', {
      nom: 'string',
      date: 'date'
    }, testToHandler);

    const mapping = testToHandler.getOrCreateMappingFrom('fromBadType', resolver);
    expect(mapping).toBeUndefined();
  });

  it ('should create correct new values', () => {
    let defaultHandler=new DefaultTypeHandler();
    let typeHierarchy=new XtBaseTypeHierarchy('string', defaultHandler);
    typeHierarchy.initHandler();

    expect(defaultHandler.createNew()).toEqual('');

    defaultHandler=new DefaultTypeHandler();
    typeHierarchy=new XtBaseTypeHierarchy('pizza', defaultHandler);
    typeHierarchy.initHandler();
    expect(defaultHandler.createNew()).toEqual({});
  });

});

describe('Type sorting', () => {

  function handlerFor (typeName:string, handler:AbstractTypeHandler<any>):AbstractTypeHandler<any> {
    const typeHierarchy = new XtBaseTypeHierarchy(typeName, handler);
    typeHierarchy.initHandler();
    return handler;
  }

  it ('should mark all primitive types as sortable', () => {
    for (const typeName of ['string', 'number', 'boolean', 'date', 'date-time', 'time']) {
      const handler = handlerFor(typeName, new DefaultTypeHandler());
      expect(handler.isSortable(), typeName).toBe(true);
    }
  });

  it ('should not mark an unknown complex type as sortable', () => {
    const handler = handlerFor('person', new DefaultTypeHandler());
    expect(handler.isSortable()).toBe(false);
  });

  it ('should mark a type with a numeric field as sortable', () => {
    const handler = handlerFor('money', new ManagedDataHandler(
      new SpecialFields<ManagedData>().setNumericValueField('amount')
    ));
    expect(handler.isSortable()).toBe(true);
  });

  it ('should compare strings', () => {
    const handler = handlerFor('string', new DefaultTypeHandler());
    expect(handler.compareTo('abc', 'abc')).toBe(0);
    expect(handler.compareTo('abc', 'abd')).toBeLessThan(0);
    expect(handler.compareTo('abd', 'abc')).toBeGreaterThan(0);
  });

  it ('should compare numbers', () => {
    const handler = handlerFor('number', new DefaultTypeHandler());
    expect(handler.compareTo(3, 3)).toBe(0);
    expect(handler.compareTo(2, 3)).toBeLessThan(0);
    expect(handler.compareTo(3, 2)).toBeGreaterThan(0);
  });

  it ('should compare booleans', () => {
    const handler = handlerFor('boolean', new DefaultTypeHandler());
    expect(handler.compareTo(false, false)).toBe(0);
    expect(handler.compareTo(true, true)).toBe(0);
    expect(handler.compareTo(false, true)).toBeLessThan(0);
    expect(handler.compareTo(true, false)).toBeGreaterThan(0);
  });

  it ('should compare dates', () => {
    const handler = handlerFor('date', new DefaultTypeHandler());
    const first = new Date('2018-05-01');
    const second = new Date('2019-05-01');
    expect(handler.compareTo(first, first)).toBe(0);
    expect(handler.compareTo(first, second)).toBeLessThan(0);
    expect(handler.compareTo(second, first)).toBeGreaterThan(0);
  });

  it ('should compare date-time values', () => {
    const handler = handlerFor('date-time', new DefaultTypeHandler());
    const first = new Date('2018-05-01T10:00:00.000Z');
    const second = new Date('2018-05-01T12:00:00.000Z');
    expect(handler.compareTo(first, second)).toBeLessThan(0);
    expect(handler.compareTo(second, first)).toBeGreaterThan(0);
    expect(handler.compareTo(second, second)).toBe(0);
  });

  it ('should compare time values', () => {
    const handler = handlerFor('time', new DefaultTypeHandler());
    const first = new Date('1970-01-01T08:00:00.000Z');
    const second = new Date('1970-01-01T09:30:00.000Z');
    expect(handler.compareTo(first, second)).toBeLessThan(0);
    expect(handler.compareTo(second, first)).toBeGreaterThan(0);
    expect(handler.compareTo(second, second)).toBe(0);
  });

  it ('should compare date values given as strings', () => {
    const handler = handlerFor('date', new DefaultTypeHandler());
    expect(handler.compareTo('2018-05-01', '2019-05-01')).toBeLessThan(0);
    expect(handler.compareTo('2019-05-01', '2018-05-01')).toBeGreaterThan(0);
    expect(handler.compareTo('2019-05-01', '2019-05-01')).toBe(0);
  });

  it ('should sort null values first', () => {
    const handler = handlerFor('string', new DefaultTypeHandler());
    expect(handler.compareTo(null as any, 'abc')).toBeLessThan(0);
    expect(handler.compareTo('abc', null as any)).toBeGreaterThan(0);
    expect(handler.compareTo(null as any, null as any)).toBe(0);
  });

  it ('should compare complex types by their numeric field', () => {
    const handler = handlerFor('money', new ManagedDataHandler(
      new SpecialFields<ManagedData>().setNumericValueField('amount')
    ));
    expect(handler.compareTo({amount: 10}, {amount: 20})).toBeLessThan(0);
    expect(handler.compareTo({amount: 20}, {amount: 10})).toBeGreaterThan(0);
    expect(handler.compareTo({amount: 10}, {amount: 10})).toBe(0);
  });

  it ('should sort all primitive types by natural order', () => {
    const types: {name:string, values:any[], expected:any[]}[] = [
      {name: 'string', values: ['b', 'a', 'c'], expected: ['a', 'b', 'c']},
      {name: 'number', values: [3, 1, 2], expected: [1, 2, 3]},
      {name: 'boolean', values: [true, false, true], expected: [false, true, true]},
      {name: 'date', values: [new Date('2019-05-01'), new Date('2018-05-01'), new Date('2020-05-01')], expected: [new Date('2018-05-01'), new Date('2019-05-01'), new Date('2020-05-01')]},
      {name: 'date-time', values: [new Date('2019-05-01T12:00:00Z'), new Date('2019-05-01T10:00:00Z'), new Date('2019-05-01T11:00:00Z')], expected: [new Date('2019-05-01T10:00:00Z'), new Date('2019-05-01T11:00:00Z'), new Date('2019-05-01T12:00:00Z')]},
      {name: 'time', values: [new Date('1970-01-01T09:00:00Z'), new Date('1970-01-01T07:00:00Z'), new Date('1970-01-01T08:00:00Z')], expected: [new Date('1970-01-01T07:00:00Z'), new Date('1970-01-01T08:00:00Z'), new Date('1970-01-01T09:00:00Z')]},
    ];
    for (const entry of types) {
      const handler = handlerFor(entry.name, new DefaultTypeHandler());
      const sorted = [...entry.values].sort((a, b) => handler.compareTo(a, b));
      expect(sorted).toEqual(entry.expected);
    }
  });

});


type ToHandleType = {
  id: string,
  date: Date,
  newName: string
}

class TestTypeHandler extends AbstractTypeHandler<ToHandleType> {
  constructor() {
    super(new SpecialFields('id', ['date']) );
    this.fields.addOldField('oldName', 'newName');
  }

  createNew(): ToHandleType {
    return {id:'TEST', date:new Date(), newName:'TEST'};
  }

}

type SubType = {
  newName: string,
  date: Date
}

type ComplexType = {
  id: string,
  subType: SubType
}

class SubTypeTestHandler extends AbstractTypeHandler<SubType> {
  constructor() {
    super(new SpecialFields(undefined, ['date']) );
    this.fields.addOldField('oldName', 'newName');
  }

  createNew(): SubType {
    return {date:new Date(), newName:'TEST'};
  }

}
class ComplexTypeTestHandler extends AbstractTypeHandler<ComplexType> {
  constructor() {
    super( );
  }

  createNew(): ComplexType {
    return {id:'TEST', subType:{newName:'Test', date:new Date()}};
  }

}

class TestToTypeHandler extends AbstractTypeHandler<any> {
  createNew() {
    return {
      nom: 'nom1',
      jours: new Date(),
      nombre: new Date().getTime()
    }
  }

}

class TestToComplexHandler extends AbstractTypeHandler<any> {
  createNew() {
    return {
      lastname: 'nom2',
      description: 'description 2',
      start: new Date(),
      end: new Date().setHours(13,43,54,245),
      nombre: new Date().getTime()
    }
  }

}
