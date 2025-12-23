import * as React from "react";
import PhoneInputWithCountry, {
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input";
import type { E164Number } from "libphonenumber-js/core";
import "react-phone-number-input/style.css";
import { Label } from "./label";
import { cn } from "./utils";
import type { Country as CountryCode } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

interface PhoneInputProps {
  id?: string;
  label?: string;
  value?: string;
  defaultCountry?: CountryCode;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  setActiveDropdown?: (key: string | null) => void;
}

interface CountrySelectProps {
  value?: CountryCode;
  onChange: (value?: CountryCode) => void;
  labels?: { [key: string]: string };
  disabled?: boolean;
  name?: string;
  tabIndex?: number;
  "aria-label"?: string;
  setActiveDropdown?: (key: string | null) => void;
}

const CountrySelect = ({
  value,
  onChange,
  labels,
  disabled,
  name,
  tabIndex,
  "aria-label": ariaLabel,
  setActiveDropdown,
}: CountrySelectProps) => {
  const Flag = value ? flags[value] : null;

  // Get commonly used countries sorted by dial code
  const sortedCountries = React.useMemo(() => {
    // Popular countries to prioritize
    const popularCountries = [
      "US",
      "MY",
      "SG",
      "GB",
      "AU",
      "CA",
      "IN",
      "CN",
      "JP",
      "KR",
      "TH",
      "ID",
      "PH",
      "VN",
      "DE",
      "FR",
      "IT",
      "ES",
      "BR",
      "MX",
    ];

    const allCountries = getCountries().map((country) => ({
      code: country,
      dialCode: parseInt(getCountryCallingCode(country)),
      name: labels?.[country] || country,
      isPopular: popularCountries.includes(country),
    }));

    // Separate popular and other countries
    const popular = allCountries.filter((c) => c.isPopular);
    const others = allCountries.filter((c) => !c.isPopular);

    // Sort both groups by dial code
    const sortedPopular = popular.sort((a, b) => a.dialCode - b.dialCode);
    const sortedOthers = others.sort((a, b) => a.dialCode - b.dialCode);

    // Combine: popular first, then others
    return [...sortedPopular, ...sortedOthers];
  }, [labels]);

  return (
    <div className="relative">
      <select
        name={name}
        disabled={disabled}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        value={value || ""}
        onChange={(event) =>
          onChange((event.target.value as CountryCode) || undefined)
        }
        onFocus={() => setActiveDropdown?.(null)}
        size={1}
        style={{
          maxHeight: "240px",
          overflowY: "auto",
        }}
        className="h-10 rounded-l-md border border-r-0 border-gray-300 bg-white pl-3 pr-20 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <option value="">International</option>
        {sortedCountries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name} (+{country.dialCode})
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none gap-0.5">
        {Flag && (
          <span className="w-5 h-4 flex items-center justify-center flex-shrink-0">
            <Flag title="" />
          </span>
        )}
        <span className="text-sm font-medium flex-shrink-0">
          {value && `+${getCountryCallingCode(value)}`}
        </span>
        <svg
          className="h-4 w-4 text-gray-500 ml-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

export default function PhoneInput({
  id,
  label,
  value = "",
  defaultCountry = "MY",
  onChange,
  placeholder = "Enter phone number",
  required = false,
  disabled = false,
  className,
  error,
  setActiveDropdown,
}: PhoneInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-gray-900 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="flex">
        <PhoneInputWithCountry
          id={id}
          international
          defaultCountry={defaultCountry}
          value={value}
          onChange={(value: E164Number | undefined) => onChange?.(value)}
          placeholder={placeholder}
          disabled={disabled}
          countrySelectComponent={(props) => (
            <CountrySelect {...props} setActiveDropdown={setActiveDropdown} />
          )}
          numberInputProps={{
            className: cn(
              "flex h-10 w-full rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 transition-colors duration-200",
              error && "border-red-500 focus:ring-red-500 focus:border-red-500"
            ),
          }}
        />
      </div>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export { PhoneInput };
export type { CountryCode as Country };
