import { AbstractTypeHandler } from 'xt-type';
import countriests from 'countries-ts';
const { getByAlpha3 } = countriests;

/**
 * Handles the country type, an ISO 3166-1 alpha-3 country code (e.g. 'FRA').
 * Values are sorted by their country name.
 */
export class CountryTypeHandler extends AbstractTypeHandler<string> {

  /**
   * Countries are always sortable
   * @returns True
   */
  override isSortable(): boolean {
    return true;
  }

  /**
   * Compares two countries by their country name. Null values are always sorted first.
   * @param value1 - The first country code
   * @param value2 - The second country code
   * @returns A negative number if value1 is smaller, zero if equal, a positive number if value1 is greater
   */
  override compareTo(value1: string, value2: string): number {
    const name1 = this.countryName(value1);
    const name2 = this.countryName(value2);
    if (name1 == null) return name2 == null ? 0 : -1;
    if (name2 == null) return 1;
    return name1.localeCompare(name2);
  }

  /**
   * Resolves the display name of a country from its alpha-3 code
   * @param code - The country code
   * @returns The country name, or the code itself when it cannot be resolved
   */
  private countryName(code: string): string | null {
    if (code == null) return null;
    const country = getByAlpha3(code);
    return country?.label ?? code;
  }

}
