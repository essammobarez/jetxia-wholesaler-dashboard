// AirlineInformation.tsx
import React from 'react';
import { Building, Search, CheckCircle } from 'lucide-react';
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

  const filteredAirlines = availableAirlines.filter(airline =>
    airline.name.toLowerCase().includes(airlineSearch.toLowerCase()) ||
    airline.code.toLowerCase().includes(airlineSearch.toLowerCase()) ||
    airline.country.toLowerCase().includes(airlineSearch.toLowerCase())
  );

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
        <div>
          <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Select Airline *
          </label>
          <div className="relative mb-3">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search airline, code, or country..."
              value={airlineSearch}
              onChange={(e) => setAirlineSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all text-base"
            />
          </div>
          <select
            value={formData.airline}
            onChange={(e) => handleAirlineChange(e.target.value)}
            className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all text-base font-medium ${errors.airline ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
          >
            <option value="">Choose an airline...</option>
            {filteredAirlines.length === 0 ? (
              <option disabled>No airlines match your search</option>
            ) : (
              filteredAirlines.map((airline) => (
                <option key={airline.code} value={airline.name}>
                  {airline.name} ({airline.code}) - {airline.country}
                </option>
              ))
            )}
          </select>
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