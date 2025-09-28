import { ManagedData } from 'xt-type';
import { addInterval, DateInterval } from './date-interval';

export type RecurringTask = ManagedData &{
  name: string;
  date: Date;
  completed:boolean;
  occurs?: DateInterval;

}

export function nextDate (task:RecurringTask): Date {
  if( task.date==null) return task.date;
  return addInterval(task.date, task.occurs);
}
