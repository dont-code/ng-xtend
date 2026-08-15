import { describe, expect, it } from 'vitest';
import { xtTypeManager } from '../globals';
import { DefaultTypeHandler } from '../handler/default/default-type-handler';
import { XtBaseTypeHierarchy } from './xt-type-resolver.ts';

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
          referenceType:'MANY-TO-ONE'
        }
      }
    });

    const authorRef = resolver.findReference('bookType', 'author');
    expect(authorRef).toBeTruthy();
    expect(authorRef?.type).toEqual('authorType');
  });

  it ('should correctly managed unordered types', () => {
    const resolver = xtTypeManager();
    resolver.addRootType('newBookType', {
      name: 'string',
      author:'newAuthorType'
    });
    resolver.addRootType('newAuthorType', {
      firstName: 'string',
      lastName: 'string'
    });

    resolver.resolveAllTypeReferences();
    const newBookType=resolver.findType('newBookType') as XtBaseTypeHierarchy;
    expect((newBookType.children!['author'] as XtBaseTypeHierarchy).children).toBeDefined();

  });

  it ('should keep an alias type handler sortable when used as a child', () => {
    const resolver = xtTypeManager();
    resolver.addRootType('rating', 'number', new DefaultTypeHandler());
    resolver.addRootType('movieType', {
      title: 'string',
      rating: 'rating'
    });

    const root = resolver.findTypeHandler('rating');
    expect(root.typeName).toEqual('number');
    expect(root.handler?.isSortable()).toBe(true);

    const child = resolver.findTypeHandler('movieType', false, 'rating');
    expect(child.typeName).toEqual('number');
    expect(child.handler?.isSortable()).toBe(true);

    // The child node must keep its alias type name so that rendering resolves the right component
    const childType = resolver.findType('movieType', 'rating') as XtTypeHierarchy;
    expect(childType.type).toEqual('rating');
  });
})

