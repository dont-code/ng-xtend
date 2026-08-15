import { AbstractTypeHandler } from 'xt-type';

/**
 * Handles the currency type, an ISO 4217 currency code (e.g. 'EUR', 'USD').
 * Values are sorted by their code.
 */
export class CurrencyTypeHandler extends AbstractTypeHandler<string> {

  /**
   * Currency codes are always sortable
   * @returns True
   */
  override isSortable(): boolean {
    return true;
  }

  /**
   * Compares two currency codes lexicographically. Null values are always sorted first.
   * @param value1 - The first currency code
   * @param value2 - The second currency code
   * @returns A negative number if value1 is smaller, zero if equal, a positive number if value1 is greater
   */
  override compareTo(value1: string, value2: string): number {
    if (value1 == null) return value2 == null ? 0 : -1;
    if (value2 == null) return 1;
    return value1.localeCompare(value2);
  }

}
