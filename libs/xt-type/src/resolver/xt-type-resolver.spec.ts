import { describe, expect, it } from 'vitest';
import { xtTypeManager } from '../globals';

describe('Xt Type Resolver', () => {
  it ('should correctly calculates properties per types', () => {
    const resolver = xtTypeManager();
    resolver.addRootType('fromType', {
      name: 'string',
      date: 'date',
      count: 'number',
      recount: 'number',
    });
    resolver.addRootType('toType', {
      nom: 'string',
      jours: 'date',
      nombre: 'number',
      renombre:'number'
    });

    const fromTypes = resolver.calculateSubPropertiesPerType('fromType');
    expect([...fromTypes.keys()].sort()).toEqual(['string', 'number', 'date'].sort());
    expect(fromTypes.get('number')).toEqual(['count','recount']);

  });

  it ('should correctly load complex types', () => {
    const resolver = xtTypeManager();
    resolver.addRootType('authorType', {
      firstName: 'string',
      lastName: 'string'
    });
    resolver.addRootType('bookType', {
      children:{
        name: 'string',
        author: {
          type: 'authorType',
          referenceType:'ONE'
        }
      }
    });

    const authorRef = resolver.findReference('bookType', 'author');
    expect(authorRef).toBeTruthy();
    expect(authorRef?.type).toEqual('authorType');
  });
})

