import { AbstractTypeHandler, XtTypeHierarchy } from 'xt-type';
import { MoneyAmount } from './money-amount';

export class MoneyAmountHandler extends AbstractTypeHandler<MoneyAmount> {

    constructor() {
      super();
      this.fields.addOldField('currencyCode','currency');
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

    /**
     * Money amounts are always sortable
     * @returns True
     */
    override isSortable(): boolean {
      return true;
    }

    /**
     * Compares two money amounts by their amount. Null values are always sorted first.
     * @param value1 - The first money amount
     * @param value2 - The second money amount
     * @returns A negative number if value1 is smaller, zero if equal, a positive number if value1 is greater
     */
    override compareTo(value1: MoneyAmount, value2: MoneyAmount): number {
      const amount1 = value1?.amount;
      const amount2 = value2?.amount;
      if (amount1 == null) return amount2 == null ? 0 : -1;
      if (amount2 == null) return 1;
      return amount1 - amount2;
    }

}
