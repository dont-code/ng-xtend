import { ManagedData } from 'xt-type';
import { DateInterval } from './date-interval';

export type RecurringTask = ManagedData &{
  name: string;
  picture?: string;
  occurs?: DateInterval;
}

export type Task = ManagedData & {
  date: Date;
  completed: boolean;
  repetition: RecurringTask;
}
