import { xtTypeManager } from '../globals';
import { AbstractTypeHandler } from '../handler/xt-type-handler';

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

  })
})

class TestToTypeHandler extends AbstractTypeHandler<any> {
    createNew() {
        return {
          nom: 'nom1',
          jours: new Date(),
          nombre: new Date().getTime()
        }
    }

}
