// RouteInformation.tsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import { MapPin, ArrowLeftRight, ArrowRight, Info, CheckCircle } from 'lucide-react';
import { countriesAndAirports } from '../countriesAndAirports'; // Assuming this file exists in the same directory

interface RouteInformationProps {
    formData: {
        route: {
            isRoundTrip: boolean;
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
    // --- END NEW PROPS ---
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
}) => {
    
    // --- MOVED CONSOLE LOGS INTO useEffect ---
    // This hook runs once when the props are first passed in,
    // and again only if these specific props change.
    useEffect(() => {
        // --- CONSOLE LOG 2 (FILE 2) ---
        console.log(`--- DEBUG (RouteInformation): Received FROM Country: [${fromCountry}], IATA: [${selectedFromAirports}]`);
        console.log(`--- DEBUG (RouteInformation): Received TO Country: [${toCountry}], IATA: [${selectedToAirports}]`);
    }, [fromCountry, toCountry, selectedFromAirports, selectedToAirports]);
    // --- END MOVED CONSOLE LOGS ---


    // --- REMOVED internal state for fromCountry and toCountry ---
    // const [fromCountry, setFromCountry] = useState('');
    // const [toCountry, setToCountry] = useState('');

    const [fromCountrySearch, setFromCountrySearch] = useState('');
    const [toCountrySearch, setToCountrySearch] = useState('');

    const filteredFromCountries = countriesAndAirports.filter(c =>
        c.country.toLowerCase().includes(fromCountrySearch.toLowerCase())
    );
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
                <div className="space-y-4">
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200">
                        From (Departure) * {fromCountry && countriesAndAirports.find(c => c.country === fromCountry)?.flag}
                    </label>
                    <input
                        type="text"
                        placeholder="Search country..."
                        value={fromCountrySearch}
                        onChange={(e) => setFromCountrySearch(e.target.value)}
                        className="w-full px-4 py-2 mb-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm"
                    />
                    <select
                        value={fromCountry} // Now uses prop
                        onChange={(e) => handleFromCountryChange(e.target.value)} // Now calls updated handler
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                    >
                        <option value="">Select departure country...</option>
                        {filteredFromCountries.map((country) => (
                            <option key={country.country} value={country.country}>
                                {country.flag} {country.country}
                            </option>
                        ))}
                    </select>
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
                <div className="space-y-4">
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200">
                        To (Destination) * {toCountry && countriesAndAirports.find(c => c.country === toCountry)?.flag}
                    </label>
                    <input
                        type="text"
                        placeholder="Search country..."
                        value={toCountrySearch}
                        onChange={(e) => setToCountrySearch(e.target.value)}
                        className="w-full px-4 py-2 mb-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm"
                    />
                    <select
                        value={toCountry} // Now uses prop
                        onChange={(e) => handleToCountryChange(e.target.value)} // Now calls updated handler
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                    >
                        <option value="">Select destination country...</option>
                        {filteredToCountries.map((country) => (
                            <option key={country.country} value={country.country}>
                                {country.flag} {country.country}
                            </option>
                        ))}
                    </select>
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
        </div>
    );
};

export default RouteInformation;