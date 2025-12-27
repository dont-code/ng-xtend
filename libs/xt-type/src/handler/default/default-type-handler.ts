import { AbstractTypeHandler } from '../xt-type-handler';
import { SpecialFields } from '../../transformation/special-fields';

/**
 * A default handler for transient data (without an Id).
 */
export class DefaultTypeHandler<Type> extends AbstractTypeHandler<Type> {
    constructor(fields?:SpecialFields<Type>) {
        super(fields);
        if (fields?.idField!=null) throw new Error('DefaultTypeHandler does not support idField. Use ManagedDataHandler instead.');
    }

    createNew(): Type {
        return {} as Type;
    }

}
