/**
 * A Managed data is a structure whose lifecycle (creation, destruction, persistance) is managed.
 * It usually contains a unique identifier (usually _id).
 */
export type ManagedData = {
  _id?:string,
  [keys:string]: ManagedData | string | number | boolean | Date | undefined | null
}

/**
 * Checks if a value is a primitive type
 * @param valueElement The value to test
 * @returns True if the value is primitive (or null or Date)
 */
export function isPrimitive(valueElement: any): boolean {
  if (typeof valueElement == 'object') {
    if (valueElement==null) return true;
    else {
      return valueElement instanceof Date;
    }
  } else return true;
}

/**
 * Checks whether a managed data value is temporary (has no _id)
 * @param value The managed data to check
 * @returns True if the value is null/undefined or has no _id
 */
export function isTemporary (value: ManagedData | null | undefined): boolean {
  if (value==null) return true;
  if( value._id==null) return true;
  return false;
}

/**
 * Returns the _id of a managed data value, or undefined if it is temporary
 * @param value The managed data to get the id from
 * @returns The _id string, or undefined if value is null/undefined or has no _id
 */
export function nonTemporaryId (value: ManagedData | null | undefined): string | undefined {
  if (value?._id==null) return value?._id;
  return value._id;
}
