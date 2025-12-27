/**
 * A Managed data is a structure whose lifecycle (creation, destruction, persistance) is managed.
 * It usually contains a unique identifier (usually _id).
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

export function isTemporary (value: ManagedData | null | undefined): boolean {
  if (value==null) return true;
  if( value._id==null) return true;
  return false;
}

export function nonTemporaryId (value: ManagedData | null | undefined): string | undefined {
  if (value?._id==null) return value?._id;
  return value._id;
}
