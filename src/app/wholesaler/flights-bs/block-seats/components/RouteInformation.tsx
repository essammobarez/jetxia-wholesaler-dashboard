import React, { useState, useEffect, useRef } from 'react';
// --- UPDATED: Added ArrowDown ---
import { MapPin, ArrowLeftRight, ArrowRight, Info, CheckCircle, X, Ticket, ArrowDown } from 'lucide-react';
import { countriesAndAirports } from '../countriesAndAirports';

interface RouteInformationProps {
    formData: {
        route: {
            isRoundTrip: boolean;
            departureFlightNumber: string;
            returnFlightNumber: string; // UPDATED NAME
        };
    };
    handleTripTypeChange: (isRoundTrip: boolean) => void;
    selectedFromAirports: string[];
    selectedToAirports: string[];
    toggleFromAirport: (airportCode: string) => void;
    toggleToAirport: (airportCode: string) => void;
    errors: { [key: string]: string };
    fromCountry: string;
    setFromCountry: (country: string) => void;
    toCountry: string;
    setToCountry: (country: string) => void;
    handleDepartureFlightNumberChange: (flightNumber: string) => void;
    handleReturnFlightNumberChange: (flightNumber: string) => void; // UPDATED NAME

    // --- NEW STOPPAGE PROPS ---
    stoppageType: 'direct' | 'stoppage' | null;
    stoppageCount: string;
    // --- UPDATED PROPS ---
    stoppages: Array<{ country: string; airportCode: string; depFlightNumber: string; retFlightNumber: string; }>;
    handleStoppageCountryChange: (index: number, country: string) => void;
    handleStoppageAirportToggle: (index: number, airportCode: string) => void;
    // --- NEW HANDLER ---
    handleStoppageFlightNumberChange: (index: number, type: 'departure' | 'return', value: string) => void;
}

const RouteInformation: React.FC<RouteInformationProps> = ({
    formData,
    handleTripTypeChange,
    selectedFromAirports,
    selectedToAirports,
    toggleFromAirport,
    toggleToAirport,
    errors,
    fromCountry,
    setFromCountry,
    toCountry,
    setToCountry,
    handleDepartureFlightNumberChange,
    handleReturnFlightNumberChange, // UPDATED NAME
    // --- NEW STOPPAGE PROPS ---
    stoppageType,
    stoppageCount,
    stoppages,
    handleStoppageCountryChange,
    handleStoppageAirportToggle,
    // --- NEW HANDLER ---
    handleStoppageFlightNumberChange,
}) => {

    useEffect(() => {
        console.log(`--- DEBUG (RouteInformation): Received FROM Country: [${fromCountry}], IATA: [${selectedFromAirports}]`);
        console.log(`--- DEBUG (RouteInformation): Received TO Country: [${toCountry}], IATA: [${selectedToAirports}]`);
    }, [fromCountry, toCountry, selectedFromAirports, selectedToAirports]);

    const [fromCountrySearch, setFromCountrySearch] = useState(fromCountry || '');
    const [toCountrySearch, setToCountrySearch] = useState(toCountry || '');
    const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
    const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);

    const fromRef = useRef<HTMLDivElement>(null);
    const toRef = useRef<HTMLDivElement>(null);

    // --- NEW: Local UI state for stoppage inputs ---
    const [stoppageCountrySearches, setStoppageCountrySearches] = useState<string[]>([]);
    const [isStoppageDropdownOpen, setIsStoppageDropdownOpen] = useState<boolean[]>([]);
    const stoppageRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        setFromCountrySearch(fromCountry || '');
    }, [fromCountry]);

    useEffect(() => {
        setToCountrySearch(toCountry || '');
    }, [toCountry]);

    // --- NEW: Sync local stoppage UI state with props ---
    useEffect(() => {
        const count = parseInt(stoppageCount, 10) || 0;
        if (stoppageType === 'stoppage' && count > 0) {
            // Sync search text
            setStoppageCountrySearches(prev => {
                const newSearches = Array(count).fill('');
                stoppages.forEach((stop, i) => { if (i < count) newSearches[i] = stop.country || ''; });
                return newSearches;
            });
            // Sync dropdown open/closed state
            setIsStoppageDropdownOpen(prev => {
                const newOpen = Array(count).fill(false);
                prev.forEach((open, i) => { if (i < count) newOpen[i] = open; });
                return newOpen;
            });
            // Sync refs array length
            stoppageRefs.current = Array(count).fill(null).map((_, i) => stoppageRefs.current[i] || null);
        } else {
            // Clear local state if no stops
            setStoppageCountrySearches([]);
            setIsStoppageDropdownOpen([]);
            stoppageRefs.current = [];
        }
    }, [stoppageCount, stoppageType, stoppages]); // Also depend on stoppages to sync search text

    // --- UPDATED: Handle outside clicks for From, To, and Stoppages ---
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
                setIsFromDropdownOpen(false);
                setFromCountrySearch(fromCountry);
            }
            if (toRef.current && !toRef.current.contains(event.target as Node)) {
                setIsToDropdownOpen(false);
                setToCountrySearch(toCountry);
            }

            // NEW: Handle outside clicks for all stoppage inputs
            stoppageRefs.current.forEach((ref, index) => {
                if (ref && !ref.contains(event.target as Node)) {
                    setIsStoppageDropdownOpen(prev => {
                        const newOpen = [...prev];
                        newOpen[index] = false;
                        return newOpen;
                    });
                    setStoppageCountrySearches(prev => {
                        const newSearches = [...prev];
                        // Reset search text to the saved country value
                        newSearches[index] = stoppages[index]?.country || '';
                        return newSearches;
                    });
                }
            });
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [fromRef, toRef, fromCountry, toCountry, stoppages]); // Add stoppages to dependency array

    const filteredFromCountries = countriesAndAirports.filter(c =>
        c.country.toLowerCase().includes(fromCountrySearch.toLowerCase())
    );
    const filteredToCountries = countriesAndAirports.filter(c =>
        c.country.toLowerCase().includes(toCountrySearch.toLowerCase())
    );

    const getAirportsForCountry = (country: string) => {
        return countriesAndAirports.find(c => c.country === country)?.airports || [];
    };

    const handleFromCountryChange = (country: string) => {
        setFromCountry(country);
    };

    const handleToCountryChange = (country: string) => {
        setToCountry(country);
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

            {/* --- UPDATED: Layout changed from grid to vertical stack (space-y-6) --- */}
            <div className="space-y-6">
                {/* --- ROW 1: FROM (DEPARTURE) SECTION --- */}
                <div className="space-y-4" ref={fromRef}>
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200">
                        From (Departure) *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search country..."
                            value={fromCountrySearch}
                            onChange={(e) => {
                                setFromCountrySearch(e.target.value);
                                if (!isFromDropdownOpen) setIsFromDropdownOpen(true);
                            }}
                            onFocus={() => setIsFromDropdownOpen(true)}
                            className="w-full px-4 py-3 pr-10 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                        />
                        {fromCountrySearch && (
                            <button
                                type="button"
                                onClick={() => {
                                    setFromCountrySearch('');
                                    handleFromCountryChange('');
                                    setIsFromDropdownOpen(true);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                        {isFromDropdownOpen && (
                            <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto mt-2">
                                {filteredFromCountries.length > 0 ? (
                                    filteredFromCountries.map((country) => (
                                        <div
                                            key={country.country}
                                            className="px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                                            onClick={() => {
                                                handleFromCountryChange(country.country);
                                                setFromCountrySearch(country.country);
                                                setIsFromDropdownOpen(false);
                                            }}
                                        >
                                            {/* Removed Flag Span */}
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
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${selectedFromAirports.includes(airport.code)
                                            ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                                            : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-green-300'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedFromAirports.includes(airport.code)}
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

                    {/* --- MOVED FLIGHT NUMBER --- */}
                    {fromCountry && toCountry && (
                        <div className="mt-2">
                            <label htmlFor="departureFlightNumber" className="flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                <Ticket className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                                {stoppageType === 'stoppage' ? 'First Departure Flight No.' : 'Departure Flight Number'}
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
                    )}
                </div>

                {/* --- UPDATED: Visual Connector (Big, Bold, Colorful) --- */}
                <div className="flex justify-center items-center text-green-500 dark:text-green-400">
                    <ArrowDown className="w-10 h-10" strokeWidth={3} />
                </div>

                {/* --- ROW 2: STOPPAGE SECTION --- */}
                {stoppageType === 'stoppage' && (parseInt(stoppageCount, 10) || 0) > 0 && (
                    <div className="space-y-6"> {/* Removed md:col-span-2 */}
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                            Stoppage / Transit
                        </h4>
                        {/* Loop N times based on stoppageCount */}
                        {Array.from({ length: parseInt(stoppageCount, 10) }).map((_, index) => (
                            <div
                                className="space-y-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                                key={index}
                                ref={el => stoppageRefs.current[index] = el}
                            >
                                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200">
                                    Stop {index + 1} *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search country..."
                                        value={stoppageCountrySearches[index] || ''}
                                        onChange={(e) => {
                                            const newSearches = [...stoppageCountrySearches];
                                            newSearches[index] = e.target.value;
                                            setStoppageCountrySearches(newSearches);
                                            const newOpen = [...isStoppageDropdownOpen];
                                            newOpen[index] = true;
                                            setIsStoppageDropdownOpen(newOpen);
                                        }}
                                        onFocus={() => {
                                            const newOpen = [...isStoppageDropdownOpen];
                                            newOpen[index] = true;
                                            setIsStoppageDropdownOpen(newOpen);
                                        }}
                                        className="w-full px-4 py-3 pr-10 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                                    />
                                    {(stoppageCountrySearches[index]) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSearches = [...stoppageCountrySearches];
                                                newSearches[index] = '';
                                                setStoppageCountrySearches(newSearches);
                                                handleStoppageCountryChange(index, ''); // Clear parent state
                                                const newOpen = [...isStoppageDropdownOpen];
                                                newOpen[index] = true;
                                                setIsStoppageDropdownOpen(newOpen);
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                    {isStoppageDropdownOpen[index] && (
                                        <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto mt-2">
                                            {countriesAndAirports.filter(c => c.country.toLowerCase().includes((stoppageCountrySearches[index] || '').toLowerCase())).length > 0 ? (
                                                countriesAndAirports.filter(c => c.country.toLowerCase().includes((stoppageCountrySearches[index] || '').toLowerCase())).map((country) => (
                                                    <div
                                                        key={country.country}
                                                        className="px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                                                        onClick={() => {
                                                            handleStoppageCountryChange(index, country.country); // Update parent
                                                            const newSearches = [...stoppageCountrySearches];
                                                            newSearches[index] = country.country;
                                                            setStoppageCountrySearches(newSearches); // Update local
                                                            const newOpen = [...isStoppageDropdownOpen];
                                                            newOpen[index] = false;
                                                            setIsStoppageDropdownOpen(newOpen); // Close dropdown
                                                        }}
                                                    >
                                                        {/* Removed Flag Span */}
                                                        <span className="font-medium text-gray-900 dark:text-white">{country.country}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-gray-500 dark:text-gray-400">No countries found.</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Airport selection for the stop */}
                                {stoppages[index]?.country && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Select Airport (Only 1): *</p>
                                        <div className="space-y-2 max-h-48 overflow-y-auto bg-white dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                            {getAirportsForCountry(stoppages[index].country).length > 0 ? (
                                                getAirportsForCountry(stoppages[index].country).map((airport) => (
                                                    <label
                                                        key={airport.code}
                                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${stoppages[index].airportCode === airport.code
                                                            ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                                                            : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-green-300'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio" // Use RADIO for single selection
                                                            name={`stop-${index}-airport`}
                                                            checked={stoppages[index].airportCode === airport.code}
                                                            onChange={() => handleStoppageAirportToggle(index, airport.code)}
                                                            className="w-5 h-5 text-green-600 rounded-full focus:ring-green-500" // rounded-full
                                                        />
                                                        <span className="ml-3 font-medium text-gray-900 dark:text-white">
                                                            {airport.city} ({airport.code})
                                                        </span>
                                                        {stoppages[index].airportCode === airport.code && (
                                                            <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                                                        )}
                                                    </label>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-gray-500 dark:text-gray-400">No airports found for this country.</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* --- NEW FLIGHT NUMBERS FOR STOPPAGE --- */}
                                {stoppages[index]?.airportCode && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        <div>
                                            <label htmlFor={`stop-${index}-dep-flight`} className="flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                <Ticket className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                                                Departure Flight No.
                                            </label>
                                            <input
                                                type="text"
                                                id={`stop-${index}-dep-flight`}
                                                placeholder="e.g., BA456"
                                                value={stoppages[index].depFlightNumber}
                                                onChange={(e) => handleStoppageFlightNumberChange(index, 'departure', e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`stop-${index}-ret-flight`} className="flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                <Ticket className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                                                Return Flight No.
                                            </label>
                                            <input
                                                type="text"
                                                id={`stop-${index}-ret-flight`}
                                                placeholder="e.g., BA457"
                                                value={stoppages[index].retFlightNumber}
                                                onChange={(e) => handleStoppageFlightNumberChange(index, 'return', e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* --- UPDATED: Visual Connector (only if stoppages exist, Big, Bold, Colorful) --- */}
                {stoppageType === 'stoppage' && (parseInt(stoppageCount, 10) || 0) > 0 && (
                    <div className="flex justify-center items-center text-green-500 dark:text-green-400">
                        <ArrowDown className="w-10 h-10" strokeWidth={3} />
                    </div>
                )}


                {/* --- ROW 3: TO (DESTINATION) SECTION --- */}
                <div className="space-y-4" ref={toRef}>
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200">
                        To (Destination) *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search country..."
                            value={toCountrySearch}
                            onChange={(e) => {
                                setToCountrySearch(e.target.value);
                                if (!isToDropdownOpen) setIsToDropdownOpen(true);
                            }}
                            onFocus={() => setIsToDropdownOpen(true)}
                            className="w-full px-4 py-3 pr-10 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                        />
                        {toCountrySearch && (
                            <button
                                type="button"
                                onClick={() => {
                                    setToCountrySearch('');
                                    handleToCountryChange('');
                                    setIsToDropdownOpen(true);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                        {isToDropdownOpen && (
                            <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto mt-2">
                                {filteredToCountries.length > 0 ? (
                                    filteredToCountries.map((country) => (
                                        <div
                                            key={country.country}
                                            className="px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                                            onClick={() => {
                                                handleToCountryChange(country.country);
                                                setToCountrySearch(country.country);
                                                setIsToDropdownOpen(false);
                                            }}
                                        >
                                            {/* Removed Flag Span */}
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
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${selectedToAirports.includes(airport.code)
                                            ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                                            : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-green-300'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedToAirports.includes(airport.code)}
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

                    {/* --- MOVED FLIGHT NUMBER --- */}
                    {fromCountry && toCountry && (
                        <div className="mt-2">
                            <label htmlFor="returnFlightNumber" className="flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                <Ticket className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                                {stoppageType === 'stoppage' ? 'Final Return Flight No.' : 'Return Flight Number'}
                            </label>
                            <input
                                type="text"
                                id="returnFlightNumber"
                                placeholder="e.g., EK202"
                                value={formData.route.returnFlightNumber}
                                onChange={(e) => handleReturnFlightNumberChange(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                            />
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
};

export default RouteInformation;