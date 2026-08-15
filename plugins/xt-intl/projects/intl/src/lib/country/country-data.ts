import worldCountries from 'world-countries/countries.json';

export interface Country {
  label: string;
  code: string;
  alpha2?: string;
  alpha3?: string;
  capital: string;
  region: string;
  currency: {
    code: string;
    label: string;
    symbol: string | null;
  };
  language: {
    code: string;
    label: string;
  };
  flag: string;
  countryCode: string;
  isoCode: string;
}

interface WorldCountry {
  name: { common: string };
  cca2: string;
  cca3: string;
  ccn3: string;
  region?: string;
  capital?: string[];
  currencies?: { [code: string]: { name: string; symbol: string } };
  languages?: { [code: string]: string };
  idd?: { root: string; suffixes: string[] };
}

const worldCountriesData = worldCountries as unknown as WorldCountry[];

const countries: Country[] = worldCountriesData.map(country => ({
  code: country.cca2,
  alpha2: country.cca2,
  alpha3: country.cca3,
  label: country.name.common,
  capital: country.capital?.[0] ?? '',
  region: country.region ?? '',
  currency: currencyOf(country),
  language: languageOf(country),
  flag: `https://flagcdn.com/48x36/${country.cca2.toLowerCase()}.png`,
  countryCode: phoneCodeOf(country),
  isoCode: country.ccn3 ?? ''
}));

export const alpha3Codes: Record<string, string> = Object.fromEntries(
  worldCountriesData.map(country => [country.cca2, country.cca3])
);

export function listCountries(): Country[] {
  return countries;
}

export function searchCountries(query: string, fields: (keyof Country)[] = ['label', 'capital', 'code']): Country[] {
  const normalizedQuery = query.toLowerCase().trim();
  return countries.filter(country =>
    fields.some(field => {
      const value = country[field];
      return typeof value === 'string' && value.toLowerCase().includes(normalizedQuery);
    })
  );
}

export function getByAlpha3(alpha3: string): Country | undefined {
  const alpha3Upper = alpha3.toUpperCase();
  return countries.find(country => country.alpha3 === alpha3Upper);
}

function currencyOf(country: WorldCountry): Country['currency'] {
  const currencies = country.currencies;
  if (currencies == null) return { code: '', label: '', symbol: null };
  const code = Object.keys(currencies)[0];
  const currency = code != null ? currencies[code] : undefined;
  return { code: code ?? '', label: currency?.name ?? '', symbol: currency?.symbol ?? null };
}

function languageOf(country: WorldCountry): Country['language'] {
  const languages = country.languages;
  if (languages == null) return { code: '', label: '' };
  const code = Object.keys(languages)[0];
  return { code: code ?? '', label: code != null ? languages[code] : '' };
}

function phoneCodeOf(country: WorldCountry): string {
  const suffix = country.idd?.suffixes?.[0] ?? '';
  return `${country.idd?.root ?? ''}${suffix}`;
}
