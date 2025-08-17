import { AbstractTypeHandler } from '../handler/xt-type-handler';
import { ManagedData } from './managed-data';
import { XtTypeHierarchy } from '../resolver/xt-type-resolver';
import { XtSpecialFieldsHelper } from '../transformation/xt-special-fields-helper';

/**
 * A general data handler that manages _id field and Date fields from / to json
 */
export class ManagedDataHandler<Type extends ManagedData = ManagedData> extends AbstractTypeHandler<Type>
{

  type:XtTypeHierarchy|null = null;

  constructor(idField?:keyof ManagedData, dateFields?:string[]) {
    super(idField, dateFields);
  }

  init(context:XtTypeHierarchy): void {
    this.type = context;
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