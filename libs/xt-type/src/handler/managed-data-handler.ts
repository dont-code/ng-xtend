import { AbstractTypeHandler } from './xt-type-handler';
import { ManagedData } from '../managed-data/managed-data';
import { XtTypeHierarchy } from '../resolver/xt-type-resolver';
import { SpecialFields } from '../transformation/special-fields';

/**
 * A general data handler that manages _id field and Date fields from / to json
 */
export class ManagedDataHandler<Type extends ManagedData = ManagedData> extends AbstractTypeHandler<Type>
{

  type:XtTypeHierarchy;

  constructor(type:XtTypeHierarchy, idField?:keyof ManagedData, dateFields?:string[]) {
    super(idField, dateFields);
    this.type = type;
  }

  override fromJson(json: any) {
    super.fromJson(json);

  }

  override toJson(obj: any) {
    super.toJson(obj);
  }

  init(): void {
    this.findDateFields();
  }

  protected findDateFields () {
    if (this.type.children!=null) {
      this.dateFields.length=0;
      for (const [name, type] of Object.entries(this.type.children)) {
          if (SpecialFields.isDateType (type)) {
            this.dateFields?.push(name);
          }
        }
      }
  }


}