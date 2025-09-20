export type RecurringTask = {
  amount: number;
  currency?: Currency;
}

export type Currency = string;

export type EuroAmount = RecurringTask & {
  currency:'EUR'
}

export type UsdAmount = RecurringTask & {
  currency:'USD'
}

