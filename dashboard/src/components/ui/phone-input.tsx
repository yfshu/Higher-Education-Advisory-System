import React, { useState } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from './utils';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const countries: Country[] = [
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', dialCode: '+880' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dialCode: '+92' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', dialCode: '+94' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', dialCode: '+95' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳', dialCode: '+673' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', dialCode: '+855' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦', dialCode: '+856' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', dialCode: '+64' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', dialCode: '+852' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', dialCode: '+886' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', dialCode: '+971' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', dialCode: '+974' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', dialCode: '+965' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', dialCode: '+973' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', dialCode: '+968' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
];

interface PhoneInputProps {
  id?: string;
  label?: string;
  value?: string;
  defaultCountry?: string;
  onChange?: (value: string, countryCode?: string) => void;
  onCountryChange?: (country: Country) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export default function PhoneInput({
  id,
  label,
  value = '',
  defaultCountry = 'MY',
  onChange,
  onCountryChange,
  placeholder = '12-345-6789',
  required = false,
  disabled = false,
  className,
  error
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === defaultCountry) || countries[0]
  );
  
  const [phoneNumber, setPhoneNumber] = useState(() => {
    // If value already contains country code, extract the number part
    if (value && value.startsWith(selectedCountry.dialCode)) {
      return value.substring(selectedCountry.dialCode.length).trim();
    }
    return value.replace(/^\+\d+\s*/, ''); // Remove any existing country code
  });

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      const fullNumber = phoneNumber ? `${country.dialCode} ${phoneNumber}` : '';
      onChange?.(fullNumber, country.code);
      onCountryChange?.(country);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value;
    setPhoneNumber(number);
    const fullNumber = number ? `${selectedCountry.dialCode} ${number}` : '';
    onChange?.(fullNumber, selectedCountry.code);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-32 backdrop-blur-sm bg-white/50 border-white/30">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="backdrop-blur-xl bg-white/90 border-white/20">
            <div className="max-h-64 overflow-y-auto">
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 text-left">{country.name}</span>
                    <span className="text-sm text-gray-500">{country.dialCode}</span>
                  </div>
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <Input
            id={id}
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className="backdrop-blur-sm bg-white/50 border-white/30"
          />
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      
      {!error && (
        <p className="text-xs text-gray-500">
          Example: {selectedCountry.dialCode} {placeholder}
        </p>
      )}
    </div>
  );
}

export { PhoneInput };
export type { Country };