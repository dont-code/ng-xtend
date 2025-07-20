export type MoneyAmount = {
  amount: number;
  currency?: Currency;
}

export type Currency = string;

export type EuroAmount = MoneyAmount & {
  currency:'EUR'
}

export type UsdAmount = MoneyAmount & {
  currency:'USD'
}

