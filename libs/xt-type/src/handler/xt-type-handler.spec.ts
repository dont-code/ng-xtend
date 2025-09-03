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