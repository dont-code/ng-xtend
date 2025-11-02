import { AbstractTypeHandler } from '../xt-type-handler';

export class DefaultTypeHandler<Type> extends AbstractTypeHandler<Type> {
    createNew(): Type {
        throw new Error('Method not implemented.');
    }

}
