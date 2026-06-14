import { DataTransformationInfo } from '../transformation/data-transformation-info';

/**
 * Accumulates summary statistics (sum, count, min, max) for a set of values
 */
export class Counters {
  /** Running sum of values */
  sum:any;

  /** Number of values processed */
  count=0;

  /** Minimum value encountered */
  minimum: any;
  /** Minimum value as a number (for calculations) */
  minAsValue: number | null = null;

  /** Maximum value encountered */
  maximum: any;
  /** Maximum value as a number (for calculations) */
  maxAsValue: number | null = null;

  /** Metadata about how to extract values from data */
  metaData = new DataTransformationInfo();
}
