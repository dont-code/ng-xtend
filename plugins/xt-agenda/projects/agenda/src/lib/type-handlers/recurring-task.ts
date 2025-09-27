import { DateInterval } from './date-interval';

export type RecurringTask = {
  name: string;
  date: Date;
  completed:boolean;
  occurs?: DateInterval;
}
