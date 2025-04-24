import { SpecialFields } from './special-fields';

/**
 * Some code to discover and handle fields that requires special treatment
 */
export class XtSpecialFieldsHelper {

  static specialFieldsCache = new Map<string, SpecialFields>();
  /**
   * In case some entity definition has changed, clear the cache
   */
  public static clearConfigCache (): void {
    this.specialFieldsCache.clear();
  }

  /** Returns any field who is a date, in order to convert it from json. Keep the result in a cache map
   *
   * @param name
   * @param entity
   * @protected
   */
  public static findSpecialFields (name:string, entity:any):SpecialFields {
    let specialFields = XtSpecialFieldsHelper.specialFieldsCache.get(name);
    if (specialFields!=null) return specialFields;

    const curScore: {score:number, field:any} = {score:-1, field:null}

    specialFields = new SpecialFields();
    const fields = entity.fields;
    if( fields!=null) {
      let prop: keyof typeof fields;
      for (prop in fields) {
        // Finds the date fields that will need to be converted from json to javascript Date
        if (fields[prop]?.type==='Date' || fields[prop]?.type==='Date & Time') {
          specialFields.addDateField(fields[prop]?.name);
        } else {
          XtSpecialFieldsHelper.scoreIdFieldFromEntityField(fields[prop], curScore);
        }
      }
    }
    if (curScore.score>0) {
      specialFields.idField=curScore.field;
    }
    XtSpecialFieldsHelper.specialFieldsCache.set(name, specialFields);

    // eslint-disable-next-line no-restricted-syntax
    //console.debug("Found special fields for entity at position "+name, specialFields);
    return specialFields;
  }

  static findSpecialFieldsFromData(data: Array<any>, existingFields: SpecialFields) {
    if( (existingFields.idField==null) && (data?.length>0)) {
      // We must guess the id field from data
      const first=data[0];
      const curScore: {score:number, field:any} = {score:-1, field:null}
      let prop: keyof typeof first;

      for (prop in first) {
        XtSpecialFieldsHelper.scoreIdFieldFromProperty(prop, curScore);
      }
      if (curScore.score>0) {
        const test=data.length>1?data[Math.floor((data.length+1)/2)]:null;
        if ((test==null) || (test[curScore.field]!=first[curScore.field]))  // Just check that another element doesn't have the same value as an id should be unique
          existingFields.idField=curScore.field;
      }
    }
  }

  protected static scoreIdFieldFromEntityField (prop:any, score:{score:number, field:any}): boolean {
    return XtSpecialFieldsHelper.scoreIdFieldFromProperty(prop?.name, score);
  }

  protected static scoreIdFieldFromProperty (name:string, score:{score:number, field:any}): boolean {
    if( name==null)
      return false;
    const propName=name.toLowerCase();
    // Finds if the element is the id field
    if( propName === "_id") {
      score.field="_id";  // Don't need to process Id
      score.score = 100;
      return true;
    } else {
      if ((propName == "id")||(propName=="uniqueid")||(propName=="identifier") || (propName=='key') || (propName=='primaryKey')||(propName=='uniqueKey')) {
        if (score.score<80) {
          score.score=80;
          score.field=name;
        }
      } else if (propName.includes("unique")||propName.includes("primary")) {
        if (score.score<50) {
          score.score = 50;
          score.field=name;
        }
      }else if (propName.includes("id")||propName.includes('key')) {
        if (score.score<30) {
          score.score = 30;
          score.field=name;
        }
      }
      return false;
    }

  }

}