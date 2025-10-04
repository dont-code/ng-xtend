import { addDays, addMonths, addWeeks, addYears } from 'date-fns';

export type DateInterval = {
  every: number;
  item: DateIntervalItem;
}

export type DateIntervalItem= 'Day'|'Week'|'Month'|'Year';

export function addInterval (start:Date, interval:DateInterval|null|undefined): Date {
  if (start == null) return start;
    if ((interval==null) || (interval.item==null) || (interval.every==null)){
    return new Date(start);
  }

  switch (interval.item) {
    case 'Day':
      return addDays(start, interval.every);
    case 'Week':
      return addWeeks(start, interval.every);
    case 'Month':
      return addMonths(start, interval.every);
    case 'Year':
      return addYears(start, interval.every);
  }

}
