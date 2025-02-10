/**
 * Keep track of information about how to extract value of data
 */
export class DataTransformationInfo {
  parsed = false; // Has the element been parsed ?
  array=false; // Is it an array ?
  direct = false; // Is the element already a usable value (not an object)
  subValue:string|null=null; // What field will give the usable value ?
  subValues:string[]|null=null; // What list of fields needs to be following to extract the usable value ?
}
