import { DataTransformationInfo } from '../transformation/data-transformation-info';

export class Counters {
  sum:any;

  count=0;

  minimum: any;
  minAsValue: number | null = null;

  maximum: any;
  maxAsValue: number | null = null;

  metaData = new DataTransformationInfo();
}
