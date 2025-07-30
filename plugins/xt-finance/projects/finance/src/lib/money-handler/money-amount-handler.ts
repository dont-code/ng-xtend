import { AbstractTypeHandler, XtTypeHierarchy } from 'xt-type';
import { MoneyAmount } from './money-amount';

export class MoneyAmountHandler extends AbstractTypeHandler<MoneyAmount> {
    type: XtTypeHierarchy|null = null;

    constructor() {
      super(undefined, undefined);  // No Id are defined as it's not a managed data
    }
    init(context: XtTypeHierarchy): void {
        this.type=context;
    }

    override createNew(): MoneyAmount {
      const ret:MoneyAmount = {} as unknown as MoneyAmount;
      if (this.type?.type?.endsWith('-amount')) {
        if (this.type.type!='money-amount') {
          ret.currency=this.type.type.substring(0,3).toUpperCase();
        }
      }
      return ret;
    }
}
