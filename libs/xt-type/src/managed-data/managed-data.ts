
export type ManagedData = {
  _id:string,
  [keys:string]: ManagedData | string | number | boolean | Date | undefined | null
}

