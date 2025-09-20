import { AbstractTypeHandler, XtTypeHierarchy } from 'xt-type';
import { RecurringTask } from './recurring-task';

export class RecurringTaskHandler extends AbstractTypeHandler<RecurringTask> {

    constructor() {
      super(undefined, undefined);  // No Id are defined as it's not a managed data
      this.fields.addOldField('currencyCode','currency');
    }

    override createNew(): RecurringTask {
      const ret:RecurringTask = {} as unknown as RecurringTask;
      if (this.type?.type?.endsWith('-amount')) {
        if (this.type.type!='money-amount') {
          ret.currency=this.type.type.substring(0,3).toUpperCase();
        }
      }
      return ret;
    }

}
