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
  /**
   * @param specialFields Optional pre-configured special fields
   */
  constructor(specialFields?:SpecialFields<Type>) {
    super(specialFields);
  }

  /**
   * Initializes the handler and discovers date fields from the type hierarchy
   * @param context The type hierarchy to initialize from
   */
  init(context:XtTypeHierarchy): void {
    super.init(context);
    this.findDateFields();
  }

  /**
   * Discovers and registers date fields from the type hierarchy children
   */
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
