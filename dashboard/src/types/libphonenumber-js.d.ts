declare module 'libphonenumber-js' {
  export type CountryCode = string;
  export function getCountries(): CountryCode[];
  export function getCountryCallingCode(countryCode: CountryCode): string;
}

