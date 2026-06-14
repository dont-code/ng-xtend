/**
 * Keep track of information about how to extract value of data
 */
export class DataTransformationInfo {
  /** Whether the element has been parsed */
  parsed = false;
  /** Whether the element is an array */
  array=false;
  /** Whether the element is already a usable value (not an object) */
  direct = false;
  /** The field that will give the usable value */
  subValue:string|null=null;
  /** The list of fields to traverse to extract the usable value */
  subValues:string[]|null=null;
}
