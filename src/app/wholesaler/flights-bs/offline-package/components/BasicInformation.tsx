// src/components/BasicInformation.tsx

import React from 'react';
// Import Search and X icons
import { Package, AlertTriangle, Search, X } from 'lucide-react';
// Import the library for countries and cities
import { Country, City, ICountry } from 'country-state-city';

interface BasicInformationProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: { [key: string]: string };
  selectedCountry: string; // This is the country *name*
  handleCountryChange: (country: string) => void;
  availableCities: string[]; // This prop will be ignored
  countriesWithCities: { country: string; cities: string[] }[]; // This prop will also be ignored
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  formData,
  setFormData,
  errors,
  selectedCountry,
  handleCountryChange,
  // We no longer use these props, but keep them to not break the interface
  availableCities,
  countriesWithCities,
}) => {
  // --- COUNTRY LIBRARY LOGIC ---
  const allCountries = React.useMemo(() => Country.getAllCountries(), []);
  const [cities, setCities] = React.useState<string[]>([]);

  // --- NEW STATE FOR COUNTRY SEARCH ---
  const [countrySearch, setCountrySearch] = React.useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = React.useState(false);
  const countryDropdownRef = React.useRef<HTMLDivElement>(null);

  // Sync input field with parent state
  React.useEffect(() => {
    setCountrySearch(selectedCountry);
  }, [selectedCountry]);

  // Close country dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [countryDropdownRef]);

  // Filter countries based on search
  const filteredCountries = React.useMemo(() => {
    if (!countrySearch) {
      return allCountries;
    }
    const lowerSearch = countrySearch.toLowerCase();
    return allCountries.filter(c =>
      c.name.toLowerCase().includes(lowerSearch) ||
      c.isoCode.toLowerCase().includes(lowerSearch)
    );
  }, [countrySearch, allCountries]);

  // Update city list when country changes
  React.useEffect(() => {
    if (selectedCountry) {
      const country = allCountries.find(c => c.name === selectedCountry);
      if (country) {
        const cityData = City.getCitiesOfCountry(country.isoCode);
        setCities(cityData.map(c => c.name));
      } else {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  }, [selectedCountry, allCountries]);

  // Handler to select a country
  const handleSelectCountry = (country: ICountry) => {
    handleCountryChange(country.name);
    setCountrySearch(country.name);
    setIsCountryDropdownOpen(false);
  };

  return (
    <div className="card-modern p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-2">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span>Basic Information</span>
        </h3>
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-bold">
          Required
        </span>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Package Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`w-full px-5 py-4 text-base border-2 rounded-xl transition-all duration-200 ${
              errors.title
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md`}
            placeholder="e.g., Cairo & Luxor Historical Journey"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {errors.title}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* --- MODIFIED COUNTRY FIELD --- */}
          <div className="relative" ref={countryDropdownRef}>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Country *
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => {
                  setCountrySearch(e.target.value);
                  if (!isCountryDropdownOpen) setIsCountryDropdownOpen(true);
                  // If user is typing, deselect parent country
                  if (e.target.value.toLowerCase() !== selectedCountry.toLowerCase()) {
                    handleCountryChange('');
                  }
                }}
                onFocus={() => setIsCountryDropdownOpen(true)}
                className={`w-full pl-12 pr-12 py-4 text-base border-2 rounded-xl transition-all duration-200 ${
                  errors.country
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md`}
                placeholder="Search Country"
                autoComplete="off"
              />
              {countrySearch.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCountrySearch('');
                    handleCountryChange('');
                    setIsCountryDropdownOpen(true);
                  }}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  aria-label="Clear country"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {isCountryDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredCountries.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    No countries match your search
                  </div>
                ) : (
                  // --- CHANGE HERE: REMOVED THE FLAG SPAN ---
                  filteredCountries.map((country) => (
                    <div
                      key={country.isoCode}
                      onClick={() => handleSelectCountry(country)}
                      className="px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <p className="font-medium text-gray-800 dark:text-white">{country.name}</p>
                    </div>
                  ))
                  // --- END OF CHANGE ---
                )}
              </div>
            )}
            
            {errors.country && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.country}
              </p>
            )}
          </div>
          {/* --- END OF MODIFIED COUNTRY FIELD --- */}

          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              City *
            </label>
            <select
              value={formData.destination.city}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                destination: { ...prev.destination, city: e.target.value }
              }))}
              disabled={!selectedCountry} // Still disabled if no country is selected
              className={`w-full px-5 py-4 text-base border-2 rounded-xl transition-all duration-200 ${
                errors.city
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
              } ${
                !selectedCountry ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md`}
            >
              <option value="">
                {selectedCountry ? 'Select City' : 'Select Country First'}
              </option>
              {cities.map((city, idx) => (
                <option key={idx} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.city}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Region <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.destination.region}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              destination: { ...prev.destination, region: e.target.value }
            }))}
            className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md"
            placeholder="e.g., Middle East, North Africa, Mediterranean"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Days
            </label>
            <input
              type="number"
              min="1"
              value={formData.duration.days}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                duration: { ...prev.duration, days: parseInt(e.target.value) || 1 }
              }))}
              className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Nights
            </label>
            <input
              type="number"
              min="0"
              value={formData.duration.nights}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                duration: { ...prev.duration, nights: parseInt(e.target.value) || 0 }
              }))}
              className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Description <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md resize-none"
            rows={4}
            placeholder="Describe the package experience, what makes it special, activities included..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                category: e.target.value as 'Budget' | 'Standard' | 'Luxury' | 'Premium'
              }))}
              className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 focus:outline-none shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="Budget">Budget</option>
              <option value="Standard">Standard</option>
              <option value="Luxury">Luxury</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                status: e.target.value as 'Active' | 'Sold Out' | 'Cancelled' | 'Draft'
              }))}
              className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 text-gray-90t-white focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/30 focus:outline-none shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Sold Out">Sold Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInformation;