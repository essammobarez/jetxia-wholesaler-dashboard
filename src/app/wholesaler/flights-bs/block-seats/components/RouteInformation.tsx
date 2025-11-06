// RouteInformation.tsx
import React, { useState, useEffect, useRef } from 'react'; // Import useEffect and useRef
// --- UPDATED: Added Ticket icon ---
import { MapPin, ArrowLeftRight, ArrowRight, Info, CheckCircle, X, Ticket } from 'lucide-react'; 
import { countriesAndAirports } from '../countriesAndAirports'; // Assuming this file exists in the same directory

interface RouteInformationProps {
    formData: {
        route: {
            isRoundTrip: boolean;
            // --- UPDATED: Split flightNumber ---
            departureFlightNumber: string; 
            destinationFlightNumber: string; 
        };
    };
    handleTripTypeChange: (isRoundTrip: boolean) => void;
    selectedFromAirports: string[];
    selectedToAirports: string[];
    toggleFromAirport: (airportCode: string) => void;
    toggleToAirport: (airportCode: string) => void;
    errors: { [key: string]: string };
    // --- NEW PROPS ---
    fromCountry: string;
    setFromCountry: (country: string) => void;
    toCountry: string;
    setToCountry: (country: string) => void;
    // --- UPDATED: Split flight number handlers ---
    handleDepartureFlightNumberChange: (flightNumber: string) => void;
    handleDestinationFlightNumberChange: (flightNumber: string) => void;
}

const RouteInformation: React.FC<RouteInformationProps> = ({
    formData,
    handleTripTypeChange,
    selectedFromAirports,
    selectedToAirports,
    toggleFromAirport,
    toggleToAirport,
    errors,
    // --- DESTRUCTURE NEW PROPS ---
    fromCountry,
    setFromCountry,
    toCountry,
    setToCountry,
    // --- DESTRUCTURE Flight Number Props ---
    handleDepartureFlightNumberChange,
    handleDestinationFlightNumberChange,
}) => {
    
    // --- MOVED CONSOLE LOGS INTO useEffect ---
    useEffect(() => {
        // --- CONSOLE LOG 2 (FILE 2) ---
        console.log(`--- DEBUG (RouteInformation): Received FROM Country: [${fromCountry}], IATA: [${selectedFromAirports}]`);
        console.log(`--- DEBUG (RouteInformation): Received TO Country: [${toCountry}], IATA: [${selectedToAirports}]`);
    }, [fromCountry, toCountry, selectedFromAirports, selectedToAirports]);
    // --- END MOVED CONSOLE LOGS ---


    // --- REMOVED internal state for fromCountry and toCountry ---

    // --- UPDATED to initialize with prop value ---
    const [fromCountrySearch, setFromCountrySearch] = useState(fromCountry || '');
    const [toCountrySearch, setToCountrySearch] = useState(toCountry || '');
    
    // --- NEW State for dropdown visibility ---
    const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
    const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);

    // --- NEW Refs for click-outside detection ---
    const fromRef = useRef<HTMLDivElement>(null);
    const toRef = useRef<HTMLDivElement>(null);

    // --- NEW useEffect for click-outside ---
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Check for From dropdown
            if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
                setIsFromDropdownOpen(false);
                setFromCountrySearch(fromCountry); // Reset search to match selected country
            }
            // Check for To dropdown
            if (toRef.current && !toRef.current.contains(event.target as Node)) {
                setIsToDropdownOpen(false);
                setToCountrySearch(toCountry); // Reset search to match selected country
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean-up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [fromRef, toRef, fromCountry, toCountry, setFromCountrySearch, setToCountrySearch]);


    const filteredFromCountries = countriesAndAirports.filter(c =>
        c.country.toLowerCase().includes(fromCountrySearch.toLowerCase())
    );
    // --- FIX: Corrected typo from countriesAndAirAiroprts to countriesAndAirports ---
    const filteredToCountries = countriesAndAirports.filter(c =>
        c.country.toLowerCase().includes(toCountrySearch.toLowerCase())
    );

    const getAirportsForCountry = (country: string) => {
        return countriesAndAirports.find(c => c.country === country)?.airports || [];
    };

    // --- UPDATED to call prop function ---
    const handleFromCountryChange = (country: string) => {
        setFromCountry(country);
        // Clearing selected airports is now handled in the parent component
    };

    // --- UPDATED to call prop function ---
    const handleToCountryChange = (country: string) => {
        setToCountry(country);
        // Clearing selected airports is now handled in the parent component
    };


    return (
        <div className="bg-gradient-to-br from-green-50 via-white to-green-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-green-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-green-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-3 shadow-md">
                    <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Route Information
                </h3>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trip Type *
                </label>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => handleTripTypeChange(true)}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${formData.route.isRoundTrip
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <ArrowLeftRight className="w-5 h-5" />
                            <span className="font-semibold">Round Trip</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {/* Fire emoji removed as requested */}
                            Return automatically calculated
                        </p>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTripTypeChange(false)}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${!formData.route.isRoundTrip
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <ArrowRight className="w-5 h-5" />
                            <span className="font-semibold">One Way</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Single direction</p>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* === FROM (DEPARTURE) SECTION - UPDATED === */}
                <div className="space-y-4" ref={fromRef}> {/* Add ref */}
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200">
                        From (Departure) * {fromCountry && countriesAndAirports.find(c => c.country === fromCountry)?.flag}
                    </label>

                    {/* Wrapper for input and custom dropdown */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search country..."
                            value={fromCountrySearch}
                            onChange={(e) => {
                                setFromCountrySearch(e.target.value);
                                if (!isFromDropdownOpen) setIsFromDropdownOpen(true); // Open on type
                            }}
                            onFocus={() => setIsFromDropdownOpen(true)} // Open on click/focus
                            // --- ADDED PADDING-RIGHT (pr-10) ---
                            className="w-full px-4 py-3 pr-10 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                        />
                        {/* --- NEW: CLOSE BUTTON --- */}
                        {fromCountrySearch && (
                            <button
                                type="button"
                                onClick={() => {
                                    setFromCountrySearch(''); // Clear search
                                    handleFromCountryChange(''); // Clear parent state
                                    setIsFromDropdownOpen(true); // Keep dropdown open
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                        {/* --- END: CLOSE BUTTON --- */}

                        {isFromDropdownOpen && (
                            <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto mt-2">
                                {filteredFromCountries.length > 0 ? (
                                    filteredFromCountries.map((country) => (
                                        <div
                                            key={country.country}
                                            className="px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                                            onClick={() => {
                                                handleFromCountryChange(country.country); // Set parent state
                                                setFromCountrySearch(country.country); // Set local input state
                                                setIsFromDropdownOpen(false); // Close dropdown
                                            }}
                                        >
                                            <span className="mr-2">{country.flag}</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{country.country}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-gray-500 dark:text-gray-400">No countries found.</div>
                                )}
                            </div>
                        )}
                    </div>
                                        
                    {fromCountry && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Select Airports:</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                {getAirportsForCountry(fromCountry).map((airport) => (
                                    <label
                                        key={airport.code}
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${selectedFromAirports.includes(airport.code) // This will now be pre-checked
                                                ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                                                : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-green-300'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedFromAirports.includes(airport.code)} // This will now be pre-checked
                                            onChange={() => toggleFromAirport(airport.code)}
                                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                        />
                                        <span className="ml-3 font-medium text-gray-900 dark:text-white">
                                            {airport.city} ({airport.code})
                                        </span>
                                        {selectedFromAirports.includes(airport.code) && (
                                            <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                                        )}
                                    </label>
                                ))}
                            </div>
                            {selectedFromAirports.length > 0 && (
                                <div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {selectedFromAirports.map(code => {
                                            const airport = getAirportsForCountry(fromCountry).find(a => a.code === code);
                                            return (
                                                <span key={code} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-semibold">
                                                    {airport?.city} ({code})
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                                        <Info className="w-3 h-3 mr-1" />
                                        These airports will appear in frontend search results
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    {errors.from && (
                        <p className="text-red-500 text-sm font-medium">{errors.from}</p>
                    )}
                </div>

                {/* === TO (DESTINATION) SECTION - UPDATED === */}
                <div className="space-y-4" ref={toRef}> {/* Add ref */}
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200">
                        To (Destination) * {toCountry && countriesAndAirports.find(c => c.country === toCountry)?.flag}
                    </label>

                    {/* Wrapper for input and custom dropdown */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search country..."
                            value={toCountrySearch}
                            onChange={(e) => {
                                setToCountrySearch(e.target.value);
                                if (!isToDropdownOpen) setIsToDropdownOpen(true); // Open on type
                            }}
                            onFocus={() => setIsToDropdownOpen(true)} // Open on click/focus
                            // --- ADDED PADDING-RIGHT (pr-10) ---
                            className="w-full px-4 py-3 pr-10 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                        />
                        {/* --- NEW: CLOSE BUTTON --- */}
                        {toCountrySearch && (
                            <button
                                type="button"
                                onClick={() => {
                                    setToCountrySearch(''); // Clear search
                                    handleToCountryChange(''); // Clear parent state
                                    setIsToDropdownOpen(true); // Keep dropdown open
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                        {/* --- END: CLOSE BUTTON --- */}

                        {isToDropdownOpen && (
                            <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto mt-2">
                                {filteredToCountries.length > 0 ? (
                                    filteredToCountries.map((country) => (
                                        <div
                                            key={country.country}
                                            className="px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                                            onClick={() => {
                                                handleToCountryChange(country.country); // Set parent state
                                                setToCountrySearch(country.country); // Set local input state
                                                setIsToDropdownOpen(false); // Close dropdown
                                            }}
                                        >
                                            <span className="mr-2">{country.flag}</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{country.country}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-gray-500 dark:text-gray-400">No countries found.</div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {toCountry && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Select Airports:</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                {getAirportsForCountry(toCountry).map((airport) => (
                                    <label
                                        key={airport.code}
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${selectedToAirports.includes(airport.code) // This will now be pre-checked
                                                ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                                                : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-green-300'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedToAirports.includes(airport.code)} // This will now be pre-checked
                                            onChange={() => toggleToAirport(airport.code)}
                                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                        />
                                        <span className="ml-3 font-medium text-gray-900 dark:text-white">
                                            {airport.city} ({airport.code})
                                        </span>
                                        {selectedToAirports.includes(airport.code) && (
                                            <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                                        )}
                                    </label>
                                ))}
                            </div>
                            {selectedToAirports.length > 0 && (
                                <div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {selectedToAirports.map(code => {
                                            const airport = getAirportsForCountry(toCountry).find(a => a.code === code);
                                            return (
                                                <span key={code} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-semibold">
                                                    {airport?.city} ({code})
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                                        <Info className="w-3 h-3 mr-1" />
                                        These airports will appear in frontend search results
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    {errors.to && (
                        <p className="text-red-500 text-sm font-medium">{errors.to}</p>
                    )}
                </div>
            </div>

            {/* --- UPDATED: Flight Number Inputs (Split) --- */}
            {(fromCountry && toCountry) && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Departure Flight Number */}
                    <div>
                        <label htmlFor="departureFlightNumber" className="flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            <Ticket className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                            Departure Flight Number
                        </label>
                        <input
                            type="text"
                            id="departureFlightNumber"
                            placeholder="e.g., EK201"
                            value={formData.route.departureFlightNumber}
                            onChange={(e) => handleDepartureFlightNumberChange(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                        />
                    </div>

                    {/* Destination Flight Number */}
                    <div>
                        <label htmlFor="destinationFlightNumber" className="flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            <Ticket className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                            Destination Flight Number
                        </label>
                        <input
                            type="text"
                            id="destinationFlightNumber"
                            placeholder="e.g., EK202"
                            value={formData.route.destinationFlightNumber}
                            onChange={(e) => handleDestinationFlightNumberChange(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                        />
                    </div>

                    {/* Info Text */}
                    <div className="md:col-span-2">
                         <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center -mt-2">
                            <Info className="w-3 h-3 mr-1" />
                            Optional: Specify flight numbers for this route.
                        </p>
                    </div>
                </div>
            )}
            {/* --- END: Flight Number Inputs --- */}

        </div>
    );
};

export default RouteInformation;