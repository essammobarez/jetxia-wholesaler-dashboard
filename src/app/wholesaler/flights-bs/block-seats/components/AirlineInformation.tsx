import React from 'react';
// Import the 'X' icon for the close button
import { Building, Search, CheckCircle, X, Save } from 'lucide-react';
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
    // ADDED: Receive stoppage state from parent
    route: {
      stoppageType: 'direct' | 'stoppage' | null;
      stoppageCount: string;
    };
  };
  handleAirlineChange: (airlineName: string) => void;
  // ADDED: Prop to notify parent of stoppage changes
  onStoppageChange: (stoppageType: 'direct' | 'stoppage' | null, stoppageCount: string) => void;
  errors: { [key: string]: string };
}

const AirlineInformation: React.FC<AirlineInformationProps> = ({
  formData,
  handleAirlineChange,
  onStoppageChange, // UPDATED
  errors,
}) => {
  const [airlineSearch, setAirlineSearch] = React.useState('');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // --- Stoppage State (Local) ---
  // REMOVED: Local state for stoppageType and stoppageCount
  // They are now controlled by parent via formData.route.stoppageType and formData.route.stoppageCount

  // --- MODIFIED: State for saved vs. temporary selections ---
  const [selectedAirlines, setSelectedAirlines] = React.useState<Airline[]>([]);
  const [tempSelectedAirlines, setTempSelectedAirlines] = React.useState<Airline[]>([]);

  // --- Sync parent's single airline with local multi-airline state on load ---
  React.useEffect(() => {
    if (formData.airline && selectedAirlines.length === 0) {
      const initialAirline = availableAirlines.find(a => a.name === formData.airline);
      if (initialAirline) {
        setSelectedAirlines([initialAirline]);
        setTempSelectedAirlines([initialAirline]); // Sync temp state as well
      }
    }
  }, [formData.airline]); // Only run when parent prop changes

  // --- Sync temp state when dropdown opens ---
  React.useEffect(() => {
    if (isDropdownOpen) {
      setTempSelectedAirlines(selectedAirlines);
    }
  }, [isDropdownOpen, selectedAirlines]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false); // Close dropdown, temporary changes are lost
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // --- CALCULATE MAX SELECTIONS (Uses props) ---
  let maxSelections = 1; // Default for 'direct'
  if (formData.route.stoppageType === 'stoppage' && formData.route.stoppageCount) {
    maxSelections = parseInt(formData.route.stoppageCount, 10) + 1; // 1 stop -> 2 airlines, etc.
  }

  const filteredAirlines = availableAirlines.filter(airline =>
    airline.name.toLowerCase().includes(airlineSearch.toLowerCase()) ||
    airline.code.toLowerCase().includes(airlineSearch.toLowerCase()) ||
    airline.country.toLowerCase().includes(airlineSearch.toLowerCase())
  );

  // --- MODIFIED: Handle Toggling Airlines (updates TEMP state) ---
  const handleToggleAirline = (airline: Airline) => {
    const isSelected = tempSelectedAirlines.some(a => a.code === airline.code);
    let newTempAirlines: Airline[] = [];

    if (isSelected) {
      // Uncheck: Remove from temp list
      newTempAirlines = tempSelectedAirlines.filter(a => a.code !== airline.code);
    } else {
      // Check: Add to temp list if not at max
      if (tempSelectedAirlines.length < maxSelections) {
        newTempAirlines = [...tempSelectedAirlines, airline];
      } else {
        return; // At max
      }
    }
    setTempSelectedAirlines(newTempAirlines);
  };

  // --- NEW: Handle Save Selection ---
  const handleSaveSelection = () => {
    setSelectedAirlines(tempSelectedAirlines); // Commit temp state to saved state
    handleAirlineChange(tempSelectedAirlines[0]?.name || ''); // Update parent

    // Update search bar text
    if (tempSelectedAirlines.length > 1) {
      setAirlineSearch(`${tempSelectedAirlines.length} airlines selected`);
    } else if (tempSelectedAirlines.length === 1) {
      setAirlineSearch(tempSelectedAirlines[0].name);
    } else {
      setAirlineSearch('');
    }

    setIsDropdownOpen(false); // Close dropdown
  };

  // --- Handle removing an airline from the (saved) selected list ---
  const handleRemoveAirline = (code: string) => {
    const newSelectedAirlines = selectedAirlines.filter(a => a.code !== code);
    setSelectedAirlines(newSelectedAirlines);
    setTempSelectedAirlines(newSelectedAirlines); // Keep temp in sync
    // Update parent
    handleAirlineChange(newSelectedAirlines[0]?.name || '');

    // Update search bar text
    if (newSelectedAirlines.length > 1) {
      setAirlineSearch(`${newSelectedAirlines.length} airlines selected`);
    } else if (newSelectedAirlines.length === 1) {
      setAirlineSearch(newSelectedAirlines[0].name);
    } else {
      setAirlineSearch('');
    }
  };

  // --- Handle Clear Button (X) ---
  const handleClearAll = () => {
    setAirlineSearch('');
    setSelectedAirlines([]);
    setTempSelectedAirlines([]);
    handleAirlineChange('');
    setIsDropdownOpen(true); // Re-open dropdown
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

        {/* --- COLUMN 1 --- */}
        <div className="space-y-6">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Select Airline(s) * <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> (Max {maxSelections})</span>
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
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all text-base ${errors.airline ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                autoComplete="off"
              />

              {(airlineSearch.length > 0 || selectedAirlines.length > 0) && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  aria-label="Clear selection"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* --- MODIFIED DROPDOWN WITH CHECKBOXES + SAVE BUTTON --- */}
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-lg flex flex-col">
                <div className="max-h-60 overflow-y-auto">
                  {filteredAirlines.length === 0 ? (
                    <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      No airlines match your search
                    </div>
                  ) : (
                    filteredAirlines.map((airline) => {
                      // Check against temp state
                      const isSelected = tempSelectedAirlines.some(a => a.code === airline.code);
                      const isDisabled = !isSelected && tempSelectedAirlines.length >= maxSelections;
                      return (
                        <div
                          key={airline.code}
                          onClick={() => !isDisabled && handleToggleAirline(airline)}
                          className={`flex items-center px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => handleToggleAirline(airline)}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <img
                            src={airline.logo}
                            alt={airline.name}
                            className="w-8 h-8 object-contain ml-3 mr-3 bg-white rounded-md p-1 shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMzIgMjBMMjAgMzJMMzIgNDRMNDQgMzJMMzIgMjBaIiBmaWxsPSIjOUM5Q0EzIi8+PC9zdmc+';
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{airline.name} ({airline.code})</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{airline.country}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {/* --- SAVE BUTTON --- */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <button
                    type="button"
                    onClick={handleSaveSelection}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Selection ({tempSelectedAirlines.length}/{maxSelections})
                  </button>
                </div>
              </div>
            )}

            {errors.airline && (
              <p className="text-red-500 text-sm mt-2 font-medium">{errors.airline}</p>
            )}

            {/* --- DISPLAY LIST OF *SAVED* SELECTED AIRLINES --- */}
            {selectedAirlines.length > 0 && (
              <div className="mt-4 space-y-3">
                {selectedAirlines.map((airline, index) => (
                  <div
                    key={airline.code}
                    className={`flex items-center space-x-4 p-4 rounded-xl border-2 shadow-md ${index === 0 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}
                  >
                    <img
                      src={airline.logo}
                      alt={airline.name}
                      className="w-12 h-12 object-contain bg-white rounded-xl p-1 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMzIgMjBMMjAgMzJMMzIgNDRMNDQgMzJMMzIgMjBaIiBmaWxsPSIjOUM5Q0EzIi8+PC9zdmc+';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {airline.name}
                        {index === 0 && <span className="text-sm font-normal text-blue-600 dark:text-blue-400"> (Primary)</span>}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        Code: {airline.code} • {airline.country}
                      </p>
                    </div>
                    {index === 0 && <CheckCircle className="w-7 h-7 text-green-500 flex-shrink-0" />}
                    <button
                      type="button"
                      onClick={() => handleRemoveAirline(airline.code)}
                      className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                      aria-label={`Remove ${airline.name}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* --- COLUMN 2 --- */}
        <div className="space-y-6">
          <div>
            <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Flight Type
            </label>
            <div className="flex space-x-4">
              <label className={`flex items-center p-3.5 w-1/2 border-2 rounded-xl cursor-pointer transition-all ${formData.route.stoppageType === 'direct' ? 'bg-blue-50 dark:bg-blue-900/50 border-gray-200 dark:border-gray-600' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`}>
                <input
                  type="radio"
                  name="stoppageType"
                  value="direct"
                  checked={formData.route.stoppageType === 'direct'}
                  onChange={() => {
                    // UPDATED: Call parent handler
                    onStoppageChange('direct', '');

                    // Truncate selected airlines to 1
                    const newSelected = selectedAirlines.slice(0, 1);
                    setSelectedAirlines(newSelected);
                    setTempSelectedAirlines(newSelected);
                    handleAirlineChange(newSelected[0]?.name || '');
                  }}
                  className="w-5 h-5 bg-gray-100 border-gray-300 "
                />
                <span className="ml-3 font-medium text-gray-800 dark:text-gray-200">Direct Flight</span>
              </label>
              {/* --- SPELLING CORRECTED HERE --- */}
              <label className={`flex items-center p-3.5 w-1/2 border-2 rounded-xl cursor-pointer transition-all ${formData.route.stoppageType === 'stoppage' ? 'bg-blue-50 dark:bg-blue-900/50 border-gray-200 dark:border-gray-600' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`}>
                <input
                  type="radio"
                  name="stoppageType"
                  value="stoppage"
                  checked={formData.route.stoppageType === 'stoppage'}
                  // UPDATED: Call parent handler
                  onChange={() => onStoppageChange('stoppage', formData.route.stoppageCount || '1')}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 "
                />
                <span className="ml-3 font-medium text-gray-800 dark:text-gray-200">Stoppage/Transit</span>
              </label>
            </div>
          </div>

          {formData.route.stoppageType === 'stoppage' && (
            <div>
              <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Number of Stops
              </label>
              <select
                value={formData.route.stoppageCount}
                onChange={(e) => {
                  const newStopCount = e.target.value;
                  const newMaxAirlines = parseInt(newStopCount, 10) + 1;

                  // UPDATED: Call parent handler
                  onStoppageChange('stoppage', newStopCount);

                  // Truncate selected airlines to the new max
                  const newSelected = selectedAirlines.slice(0, newMaxAirlines);
                  setSelectedAirlines(newSelected);
                  setTempSelectedAirlines(newSelected);
                  handleAirlineChange(newSelected[0]?.name || '');
                }}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all text-base border-gray-200 dark:border-gray-600"
              >
                <option value="" disabled>Select stops...</option>
                <option value="1">1 Stop (Max 2 Airlines)</option>
                <option value="2">2 Stops (Max 3 Airlines)</option>
                <option value="3">3 Stops (Max 4 Airlines)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Primary Airline Code
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
    </div>
  );
};

export default AirlineInformation;