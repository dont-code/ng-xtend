import { SpecialFields } from './special-fields';
import { XtTypeHierarchy } from '../resolver/xt-type-resolver';

/**
 * Some code to discover and handle fields that requires special treatment
 */
export class XtSpecialFieldsHelper {

  static specialFieldsCache = new Map<string, SpecialFields<any>>();
  /**
   * In case some entity definition has changed, clear the cache
   */
  public static clearConfigCache (): void {
    this.specialFieldsCache.clear();
  }

  public static isDateType (typeName:string|null|undefined):boolean {
    return (typeName==='date')||(typeName==='date-time')||(typeName==='time');
  }

  /** Returns any field who is a date, in order to convert it from json. Keep the result in a cache map
   *
   * @param name
   * @param entity
   * @protected
   */
  public static findSpecialFields<Type> (name:string, entity:XtTypeHierarchy):SpecialFields<Type> {
    let specialFields = XtSpecialFieldsHelper.specialFieldsCache.get(name);
    if (specialFields!=null) return specialFields;

    const curIdScore: {score:number, field:any} = {score:-1, field:null}
    const curNumericalScore: {score:number, field:any} = {score:-1, field:null}
    const curDisplayScore: {score:number, field:any} = {score:-1, field:null}

    specialFields = new SpecialFields();
    const fields = entity.children;
    if( fields!=null) {
      let prop: keyof typeof fields;
      for (prop in fields) {
        // Finds the date fields that will need to be converted from json to javascript Date
        if (fields[prop]?.type==='date' || fields[prop]?.type==='date-time' || fields[prop]?.type==='time') {
          specialFields.addDateField(prop);
        } else {
          XtSpecialFieldsHelper.scoreIdFieldFromEntityField(fields[prop], curIdScore);
          XtSpecialFieldsHelper.scoreNumericalFieldFromEntityField(fields[prop], curNumericalScore);
          XtSpecialFieldsHelper.scoreDisplayFieldFromEntityField(fields[prop], curDisplayScore);
        }
      }
    }
    if (curIdScore.score>0) {
      specialFields.idField=curIdScore.field;
    }
    if( curNumericalScore.score>0) {
      specialFields.setNumericValueField(curNumericalScore.field);
    }
    if( curDisplayScore.score>0) {
      specialFields.setDisplayTemplate('<%='+curDisplayScore.field+'%>');
    }
    XtSpecialFieldsHelper.specialFieldsCache.set(name, specialFields);

    // eslint-disable-next-line no-restricted-syntax
    //console.debug("Found special fields for entity at position "+name, specialFields);
    return specialFields;
  }

  static findSpecialFieldsFromData<Type>(data: Array<any>, existingFields: SpecialFields<Type>) {
    if( (existingFields.idField==null) && (data?.length>0)) {
      // We must guess the id field from data
      const first=data[0];
      const curIdScore: {score:number, field:any} = {score:-1, field:null}
      const curNumericalScore: {score:number, field:any} = {score:-1, field:null}
      const curDisplayScore: {score:number, field:any} = {score:-1, field:null}
      let prop: keyof typeof first;

      for (prop in first) {
        XtSpecialFieldsHelper.scoreIdFieldFromProperty(prop, first[prop], curIdScore);
        XtSpecialFieldsHelper.scoreNumericalFieldFromProperty(prop, first[prop], curNumericalScore);
        XtSpecialFieldsHelper.scoreDisplayFieldFromProperty(prop, first[prop], curDisplayScore);
      }
      if (curIdScore.score>0) {
        const test=data.length>1?data[Math.floor((data.length+1)/2)]:null;
        if ((test==null) || (test[curIdScore.field]!=first[curIdScore.field]))  // Just check that another element doesn't have the same value as an id should be unique
          existingFields.idField=curIdScore.field;
      }
      if (curDisplayScore.score>0) {
        existingFields.setDisplayTemplate('<%='+curDisplayScore.field+'%>');
      }
      if (curNumericalScore.score>0) {
        existingFields.setNumericValueField(curNumericalScore.field);
      }
    }
  }

  protected static scoreIdFieldFromEntityField (prop:any, score:{score:number, field:any}): boolean {
    return XtSpecialFieldsHelper.scoreIdFieldFromProperty(prop?.name, null, score);
  }

  protected static scoreNumericalFieldFromEntityField (prop:any, score:{score:number, field:any}): boolean {
    return XtSpecialFieldsHelper.scoreNumericalFieldFromProperty(prop?.name, null, score);
  }
  protected static scoreDisplayFieldFromEntityField (prop:any, score:{score:number, field:any}): boolean {
    return XtSpecialFieldsHelper.scoreDisplayFieldFromProperty(prop?.name, null, score);
  }

  protected static scoreDisplayFieldFromProperty (name:string, value:any, score:{score:number, field:any}): boolean {
    if ((name==null)&&(value==null)) return false;
    const propName=name.toLowerCase();
    if (propName.includes("display") || propName.includes("label")) {
      score.field=name;
      score.score=100;
      return true;
    } else if (typeof value==='string') {
      if (score.score<60) {
        score.score=60;
        score.field=name;
      }
      if (propName.includes("code")) {
        if( score.score<70) {
          score.score=70;
          score.field=name;
        }
      }
      if (propName.includes("name")) {
        if( score.score<80) {
          score.score=80;
          score.field=name;
        }
      }
        return true;
    }
    return false;
  }

  protected static scoreNumericalFieldFromProperty (name:string, value:any, score:{score:number, field:any}): boolean {
    if ((name==null)&&(value==null)) return false;
    const propName=name.toLowerCase();
    if (typeof value==='number') {
      if( score.score<60) {
        score.field = name;
        score.score = 60;
      }
      if (propName.includes("amount")) {
        if( score.score<70) {
          score.score=70;
          score.field=name;
        }
      }
      if (propName.includes("value")) {
        if( score.score<80) {
          score.score=80;
          score.field=name;
        }
      }
      return true;
    }
    return false;
  }


  protected static scoreIdFieldFromProperty (name:string, value:any, score:{score:number, field:any}): boolean {
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
