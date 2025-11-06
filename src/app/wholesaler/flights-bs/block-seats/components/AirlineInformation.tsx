// AirlineInformation.tsx
import React from 'react';
// Import the 'X' icon for the close button
import { Building, Search, CheckCircle, X } from 'lucide-react';
import { availableAirlines } from '../availableAirlines'; // Assuming this file exists in the same directory

interface Airline {
  name: string;
  code: string;
  country: string;
  logo: string;
}

interface AirlineInformationProps {
  formData: {
    airline: string;
    airlineCode: string;
    airlineCountry: string;
  };
  handleAirlineChange: (airlineName: string) => void;
  errors: { [key: string]: string };
}

const AirlineInformation: React.FC<AirlineInformationProps> = ({ formData, handleAirlineChange, errors }) => {
  const [airlineSearch, setAirlineSearch] = React.useState('');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Sync input field with parent state
  React.useEffect(() => {
    setAirlineSearch(formData.airline);
  }, [formData.airline]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const filteredAirlines = availableAirlines.filter(airline =>
    airline.name.toLowerCase().includes(airlineSearch.toLowerCase()) ||
    airline.code.toLowerCase().includes(airlineSearch.toLowerCase()) ||
    airline.country.toLowerCase().includes(airlineSearch.toLowerCase())
  );

  const handleSelectAirline = (airline: Airline) => {
    handleAirlineChange(airline.name);
    setAirlineSearch(airline.name);
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-blue-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center mb-6 pb-4 border-b-2 border-blue-200 dark:border-gray-700">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-3 shadow-md">
          <Building className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Airline Information
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="relative" ref={dropdownRef}>
          <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Select Airline *
          </label>
          <div className="relative mb-3">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search airline, code, or country..."
              value={airlineSearch}
              onChange={(e) => {
                setAirlineSearch(e.target.value);
                if (!isDropdownOpen) setIsDropdownOpen(true);
                // If user is typing, deselect any previously selected airline
                if (e.target.value.toLowerCase() !== formData.airline.toLowerCase()) {
                  handleAirlineChange('');
                }
              }}
              onFocus={() => setIsDropdownOpen(true)}
              // Increased right-padding to pr-12 to make space for the close button
              className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all text-base ${errors.airline ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
              autoComplete="off"
            />
            
            {/* --- ADDED CLOSE BUTTON --- */}
            {airlineSearch.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setAirlineSearch('');
                  handleAirlineChange('');
                  setIsDropdownOpen(true); // Re-open dropdown to show full list
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {/* --- END OF ADDED BUTTON --- */}

          </div>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredAirlines.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  No airlines match your search
                </div>
              ) : (
                filteredAirlines.map((airline) => (
                  <div
                    key={airline.code}
                    onClick={() => handleSelectAirline(airline)}
                    className="flex items-center px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <img
                      src={airline.logo}
                      alt={airline.name}
                      className="w-8 h-8 object-contain mr-3 bg-white rounded-md p-1 shadow-sm"
                      onError={(e) => {
                        (e.g.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMzIgMjBMMjAgMzJMMzIgNDRMNDQgMzJMMzIgMjBaIiBmaWxsPSIjOUM5Q0EzIi8+PC9zdmc+';
                      }}
                    />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{airline.name} ({airline.code})</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{airline.country}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {errors.airline && (
            <p className="text-red-500 text-sm mt-2 font-medium">{errors.airline}</p>
          )}
          {formData.airline && (
            <div className="mt-4 flex items-center space-x-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-md">
              <img
                src={availableAirlines.find(a => a.name === formData.airline)?.logo}
                alt={formData.airline}
                className="w-16 h-16 object-contain bg-white rounded-xl p-2 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMzIgMjBMMjAgMzJMMzIgNDRMNDQgMzJMMzIgMjBaIiBmaWxsPSIjOUM5Q0EzIi8+PC9zdmc+';
                }}
              />
              <div className="flex-1">
                <p className="font-bold text-lg text-gray-900 dark:text-white">{formData.airline}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Code: {formData.airlineCode} • {formData.airlineCountry}
                </p>
              </div>
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Airline Code
          </label>
          <input
            type="text"
            value={formData.airlineCode}
            disabled
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300"
          />
        </div>
      </div>
    </div>
  );
};

export default AirlineInformation;