export type DateInterval = {
  every: number;
  item: DateIntervalItem;
}

export type DateIntervalItem= 'Day'|'Week'|'Month'|'Year';
