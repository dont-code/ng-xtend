/**
 * A data object managed by XtType
 * It has an optional Id
 * and enforces a hierarchy of manageddata or primitive types
 */
export type ManagedData = {
  _id?:string,
  [keys:string]: ManagedData | string | number | boolean | Date | undefined | null
}

export function isPrimitive(valueElement: any): boolean {
  if (typeof valueElement == 'object') {
    if (valueElement==null) return true;
    else {
      return valueElement instanceof Date;
    }
  } else return true;
}
