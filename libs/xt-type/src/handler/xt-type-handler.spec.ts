import { AbstractTypeHandler } from './xt-type-handler';
import { xtTypeManager } from '../globals';

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
      date:'Date'
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
  })

});


type ToHandleType = {
  id: string,
  date: Date,
  newName: string
}

class TestTypeHandler extends AbstractTypeHandler<ToHandleType> {
  constructor() {
    super('id', ['date'] );
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
    super(undefined, ['date'] );
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
