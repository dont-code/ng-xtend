import { AbstractTypeHandler } from '../handler/xt-type-handler';
import { ManagedData } from './managed-data';
import { XtTypeHierarchy } from '../resolver/xt-type-resolver';
import { XtSpecialFieldsHelper } from '../transformation/xt-special-fields-helper';
import { SpecialFields } from '../transformation/special-fields';

/**
 * A general data handler that manages an optional _id field and Date fields from / to json
 */
export class ManagedDataHandler<Type extends ManagedData = ManagedData> extends AbstractTypeHandler<Type>
{
  constructor(specialFields?:SpecialFields<Type>) {
    super(specialFields);
  }

  init(context:XtTypeHierarchy): void {
    super.init(context);
    this.findDateFields();
  }

  createNew(): Type {
    return { } as Type;
  }

  protected findDateFields () {
    if (this.type?.children!=null) {
      this.fields.clearDateFields();
      for (const [name, type] of Object.entries(this.type.children)) {
          if (XtSpecialFieldsHelper.isDateType (type.type)) {
            this.fields.addDateField(name);
          }
        }
      }
  }



}
