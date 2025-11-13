import { AlertTriangle, ArrowRight, Calendar, CheckCircle, Clock, Info, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'; // Added useEffect
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// --- NEW/UPDATED TYPES ---
interface StoppageDate {
    arrival: string;
    departure: string;
}

interface AvailableDateEntry {
    departure: string;
    arrival: string;
    return: string;
    returnArrival: string;
    deadline: string;
    id: string;
    stoppageDates: StoppageDate[];
    returnStoppageDates: StoppageDate[];
    layoverHours: string;
    layoverMinutes: string;
    returnLayoverHours: string;
    returnLayoverMinutes: string;
}

interface AvailableFlightDatesProps {
    formData: {
        route: {
            departure: string;
            arrival: string;
            return: string;
            returnArrival: string;
            deadline: string;
            isRoundTrip: boolean;
            // --- Outbound Stoppages ---
            stoppageType: 'direct' | 'stoppage' | null;
            stoppageCount: string;
            stoppageDates: StoppageDate[];
            // --- NEW: Return Stoppages ---
            returnStoppageType: 'direct' | 'stoppage' | null;
            returnStoppageCount: string;
            returnStoppageDates: StoppageDate[];
            // --- NEW: Layover (One Way) ---
            layoverHours: string;
            layoverMinutes: string;
            // --- NEW: Return Layover ---
            returnLayoverHours: string;
            returnLayoverMinutes: string;
        };
        availableDates: AvailableDateEntry[];
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    errors: { [key: string]: string };
    
    // --- Props for convenience (ONE WAY stoppage) ---
    stoppageType: 'direct' | 'stoppage' | null;
    stoppageCount: string;
    stoppageDates: StoppageDate[];
    handleStoppageDateChange: (index: number, type: 'arrival' | 'departure', value: string) => void;

    // --- NEW PROPS (for RETURN stoppages) ---
    returnStoppageType: 'direct' | 'stoppage' | null;
    returnStoppageCount: string;
    returnStoppageDates: StoppageDate[];
    handleReturnStoppageDateChange: (index: number, type: 'arrival' | 'departure', value: string) => void;
}

// --- RENAMED: Helper for calculating duration (was calculateLayover) ---
const calculateDuration = (startStr: string, endStr: string): string => {
    if (!startStr || !endStr) return '...';

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return '...';
    }

    let diffMs = endDate.getTime() - startDate.getTime();

    if (diffMs < 0) return 'Error'; // End is before start

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
};

// --- Options for new select dropdowns ---
const hoursOptions = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
const minutesOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));


const AvailableFlightDates: React.FC<AvailableFlightDatesProps> = ({
    formData,
    setFormData,
    errors,
    // Outbound stoppage props
    stoppageType,
    stoppageCount,
    stoppageDates,
    handleStoppageDateChange,
    // --- NEW: Return stoppage props ---
    returnStoppageType,
    returnStoppageCount,
    returnStoppageDates,
    handleReturnStoppageDateChange
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateError, setDateError] = useState('');

    const formatDateToISO = (date: Date | null): string => {
        if (!date) return '';
        return date.toISOString();
    };

    const parseISOToDate = (dateString: string): Date | null => {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return null;
        }
        return date;
    };

    // --- NEW HELPER: Adds layover time to a date string ---
    const addLayoverToDate = (dateString: string, hoursStr: string, minutesStr: string): Date | null => {
        const baseDate = parseISOToDate(dateString);
        if (!baseDate) return null;

        const hours = parseInt(hoursStr, 10) || 0;
        const minutes = parseInt(minutesStr, 10) || 0;

        baseDate.setHours(baseDate.getHours() + hours);
        baseDate.setMinutes(baseDate.getMinutes() + minutes);
        
        return baseDate;
    };

    // --- NEW: Destructure for use in useEffects ---
    const { 
        arrival, 
        return: returnDeparture,
        returnArrival, 
        layoverHours, 
        layoverMinutes,
        returnLayoverHours,
        returnLayoverMinutes
    } = formData.route;

    // Create stable dependencies for useEffects
    // --- FIX HERE: Added (stoppageDates || []) to prevent .map() on undefined ---
    const departureDeps = (stoppageDates || []).map(s => s.departure).join(',');
    // --- FIX HERE: Added (returnStoppageDates || []) to prevent .map() on undefined ---
    const returnDepartureDeps = (returnStoppageDates || []).map(s => s.departure).join(',');

    // --- NEW useEffect: Auto-calculate ONE WAY stop arrivals ---
    useEffect(() => {
        // --- Add check for stoppageDates being defined ---
        // Skip if not stoppage type
        if (stoppageType !== 'stoppage' || !stoppageDates) {
            return;
        }

        // Need at least one layover value OR arrival to calculate
        if (!arrival || (layoverHours === '' && layoverMinutes === '')) {
            return;
        }

        const newStoppageDates = [...stoppageDates];
        let changed = false;

        for (let i = 0; i < newStoppageDates.length; i++) {
            const previousDateString = i === 0 ? arrival : newStoppageDates[i - 1].departure;

            if (!previousDateString) {
                // If previous date is cleared, clear this one
                if (newStoppageDates[i].arrival !== '') {
                    newStoppageDates[i] = { ...newStoppageDates[i], arrival: '', departure: '' }; // Clear arrival and subsequent departure
                    changed = true;
                }
                continue;
            }

            const newArrivalDate = addLayoverToDate(previousDateString, layoverHours, layoverMinutes);
            const newArrivalString = formatDateToISO(newArrivalDate);

            if (newStoppageDates[i].arrival !== newArrivalString) {
                newStoppageDates[i] = { ...newStoppageDates[i], arrival: newArrivalString };
                changed = true;
                
                // If new arrival is after current departure, clear departure
                const currentDepartureDate = parseISOToDate(newStoppageDates[i].departure);
                if (newArrivalDate && currentDepartureDate && currentDepartureDate < newArrivalDate) {
                    newStoppageDates[i].departure = '';
                }
            }
        }

        if (changed) {
            setFormData(prev => ({ ...prev, route: { ...prev.route, stoppageDates: newStoppageDates } }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arrival, layoverHours, layoverMinutes, departureDeps, stoppageType, setFormData]); // stoppageDates removed from deps, using departureDeps

    // --- NEW useEffect: Auto-calculate RETURN stop arrivals ---
    useEffect(() => {
        // --- Add check for returnStoppageDates being defined ---
        // --- UPDATED: Use returnLayoverHours and returnLayoverMinutes ---
        // Skip if not stoppage type, or if layover is not set (but allow 00:00)
        if (returnStoppageType !== 'stoppage' || !returnStoppageDates) {
            return;
        }

        // --- FIXED: Need returnArrival (not returnDeparture) to calculate first stoppage
        if (!returnArrival || (returnLayoverHours === '' && returnLayoverMinutes === '')) {
            return;
        }

        const newStoppageDates = [...returnStoppageDates];
        let changed = false;

        for (let i = 0; i < newStoppageDates.length; i++) {
            // --- FIXED: Use returnArrival for first stoppage, not returnDeparture
            const previousDateString = i === 0 ? returnArrival : newStoppageDates[i - 1].departure;

            if (!previousDateString) {
                if (newStoppageDates[i].arrival !== '') {
                    newStoppageDates[i] = { ...newStoppageDates[i], arrival: '', departure: '' };
                    changed = true;
                }
                continue;
            }

            const newArrivalDate = addLayoverToDate(previousDateString, returnLayoverHours, returnLayoverMinutes);
            const newArrivalString = formatDateToISO(newArrivalDate);

            if (newStoppageDates[i].arrival !== newArrivalString) {
                newStoppageDates[i] = { ...newStoppageDates[i], arrival: newArrivalString };
                changed = true;

                const currentDepartureDate = parseISOToDate(newStoppageDates[i].departure);
                if (newArrivalDate && currentDepartureDate && currentDepartureDate < newArrivalDate) {
                    newStoppageDates[i].departure = '';
                }
            }
        }

        if (changed) {
            setFormData(prev => ({ ...prev, route: { ...prev.route, returnStoppageDates: newStoppageDates } }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [returnArrival, returnLayoverHours, returnLayoverMinutes, returnDepartureDeps, returnStoppageType, setFormData]); // --- FIXED: Changed returnDeparture to returnArrival in dependencies


    // --- Function to check if outbound stoppage dates are filled ---
    const areOutboundStoppageDatesValid = () => {
        if (stoppageType !== 'stoppage' || !stoppageDates) { // Added !stoppageDates check
            return true; // Not applicable
        }
        const count = parseInt(stoppageCount, 10) || 0;
        if (count === 0) {
            return true; // No stops to validate
        }
        // Check if the temporary builder's stoppage dates are all filled
        const datesFilled = stoppageDates.every(s => s.arrival && s.departure);
        if (!datesFilled) {
            setDateError('Please fill in all arrival and departure times for each inbound stop.');
            return false;
        }

        // Validate layover times
        for (const stop of stoppageDates) {
            const arrival = parseISOToDate(stop.arrival);
            const departure = parseISOToDate(stop.departure);
            if (arrival && departure && departure < arrival) {
                setDateError('Inbound stop departure time cannot be before its arrival time.');
                return false;
            }
        }
        return true;
    };
    
    // --- NEW: Function to check if return stoppage dates are filled ---
    const areReturnStoppageDatesValid = () => {
        if (!formData.route.isRoundTrip || returnStoppageType !== 'stoppage' || !returnStoppageDates) { // Added !returnStoppageDates check
            return true; // Not applicable
        }
        const count = parseInt(returnStoppageCount, 10) || 0;
        if (count === 0) {
            return true; // No stops to validate
        }
        // Check if the temporary builder's stoppage dates are all filled
        const datesFilled = returnStoppageDates.every(s => s.arrival && s.departure);
        if (!datesFilled) {
            setDateError('Please fill in all arrival and departure times for each outbound stop.');
            return false;
        }

        // Validate layover times
        for (const stop of returnStoppageDates) {
            const arrival = parseISOToDate(stop.arrival);
            const departure = parseISOToDate(stop.departure);
            if (arrival && departure && departure < arrival) {
                setDateError('Outbound stop departure time cannot be before its arrival time.');
                return false;
            }
        }
        return true;
    };

    const handleSaveDate = () => {
        // --- UPDATED: Validation check ---
        const allStopsValid = areOutboundStoppageDatesValid() && areReturnStoppageDatesValid();

        if (
            formData.route.departure &&
            formData.route.arrival && 
            formData.route.deadline &&
            (!formData.route.isRoundTrip || (formData.route.return && formData.route.returnArrival)) &&
            allStopsValid // --- UPDATED ---
        ) {
            const newDate: AvailableDateEntry = { // Use new type
                id: Date.now().toString(),
                departure: formData.route.departure,
                arrival: formData.route.arrival, 
                deadline: formData.route.deadline,
                return: formData.route.isRoundTrip ? formData.route.return : '',
                returnArrival: formData.route.isRoundTrip ? formData.route.returnArrival : '',
                stoppageDates: formData.route.stoppageDates,
                returnStoppageDates: formData.route.isRoundTrip ? formData.route.returnStoppageDates : [], // --- NEW ---
                layoverHours: formData.route.layoverHours, // --- NEW ---
                layoverMinutes: formData.route.layoverMinutes, // --- NEW ---
                returnLayoverHours: formData.route.returnLayoverHours, // --- NEW ---
                returnLayoverMinutes: formData.route.returnLayoverMinutes, // --- NEW ---
            };

            setFormData(prev => {
                // Reset the date builder in the route object
                const resetStoppageDates = Array(parseInt(prev.route.stoppageCount, 10) || 0)
                    .fill(null)
                    .map(() => ({ arrival: '', departure: '' }));
                
                // --- NEW: Reset return stoppages ---
                const resetReturnStoppageDates = Array(parseInt(prev.route.returnStoppageCount, 10) || 0)
                    .fill(null)
                    .map(() => ({ arrival: '', departure: '' }));

                return {
                    ...prev,
                    availableDates: [...prev.availableDates, newDate],
                    route: {
                        ...prev.route,
                        departure: '',
                        arrival: '',
                        return: '',
                        returnArrival: '', 
                        deadline: '',
                        layoverHours: '', // --- NEW ---
                        layoverMinutes: '', // --- NEW ---
                        returnLayoverHours: '', // --- NEW ---
                        returnLayoverMinutes: '', // --- NEW ---
                        stoppageDates: resetStoppageDates,
                        returnStoppageDates: resetReturnStoppageDates // --- NEW ---
                    }
                };
            });
            setShowDatePicker(false);
            setDateError('');
        } else if (!dateError) {
            // Show a generic error if validation functions didn't set one
            setDateError('Please fill in all required dates (Departure, Arrival, Deadline, and Return/Return Arrival if round trip).');
        }
    };

    const handleToggleDatePicker = () => {
        if (showDatePicker) {
            // If closing, check if save is possible
            if (formData.route.departure && formData.route.arrival && formData.route.deadline && (!formData.route.isRoundTrip || (formData.route.return && formData.route.returnArrival))) {
                handleSaveDate(); // This will save if valid, or show error
            } else {
                // Just close it
                setShowDatePicker(false);
                setDateError('');
                // Reset builder
                setFormData(prev => ({
                    ...prev,
                    route: {
                        ...prev.route,
                        departure: '',
                        arrival: '', 
                        return: '',
                        returnArrival: '', 
                        deadline: '',
                        layoverHours: '', // --- NEW ---
                        layoverMinutes: '', // --- NEW ---
                        returnLayoverHours: '', // --- NEW ---
                        returnLayoverMinutes: '', // --- NEW ---
                        stoppageDates: Array(parseInt(prev.route.stoppageCount, 10) || 0)
                            .fill(null)
                            .map(() => ({ arrival: '', departure: '' })),
                        // --- NEW: Reset return stoppages ---
                        returnStoppageDates: Array(parseInt(prev.route.returnStoppageCount, 10) || 0)
                            .fill(null)
                            .map(() => ({ arrival: '', departure: '' }))
                    }
                }));
            }
        } else {
            // Opening
            setShowDatePicker(true);
            setDateError('');
        }
    };

    // Helper for displaying dates in the list
    const formatDisplayDate = (dateString: string | null) => {
        const date = parseISOToDate(dateString || '');
        if (!date) return 'N/A';
        return date.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDisplayDateOnly = (dateString: string | null) => {
        const date = parseISOToDate(dateString || '');
        if (!date) return 'Invalid Date';
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };


    return (
        <div className="mt-8 pt-8 border-t-2 border-green-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    Available Flight Dates
                </h4>
                <button
                    type="button"
                    onClick={handleToggleDatePicker}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center shadow-md"
                >
                    {showDatePicker ? (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {/* --- UPDATED: Check for all fields --- */}
                            {(formData.route.departure && formData.route.arrival && formData.route.deadline && (!formData.route.isRoundTrip || (formData.route.return && formData.route.returnArrival))) ? 'Save Date' : 'Close'}
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Date
                        </>
                    )}
                </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {showDatePicker
                    ? 'Select departure, arrival, deadline, stop dates, and return dates/times below, then click "Save Date" to add them to the list.'
                    : 'Click "Add Date" button to add new available flight dates. Only these dates will be available for booking.'
                }
            </p>
            {errors.dates && formData.availableDates.length === 0 && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <p className="text-red-600 dark:text-red-400 font-semibold text-sm">{errors.dates}</p>
                </div>
            )}
            {showDatePicker && (
                <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                    <h5 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                        Select Flight Dates & Times
                    </h5>
                    {dateError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                            <p className="text-red-600 dark:text-red-400 font-semibold text-sm">{dateError}</p>
                        </div>
                    )}
                    
                    {/* --- NEW: ONE WAY FLIGHT SECTION --- */}
                    <div className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                        <h6 className="text-md font-bold text-gray-800 dark:text-gray-200 mb-4">
                            One Way Flight
                        </h6>
                        
                        {/* --- Row 1: Departure, Duration, and Arrival --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* --- Field 1: Departure --- */}
                            <div>
                                <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                    Departure Date & Time *
                                </label>
                                <div className="relative">
                                    <DatePicker
                                        selected={parseISOToDate(formData.route.departure)}
                                        onChange={(date: Date | null) => {
                                            const dateString = formatDateToISO(date);
                                            const currentDeadline = parseISOToDate(formData.route.deadline);
                                            if (currentDeadline && date && currentDeadline > date) {
                                                setFormData(prev => ({ ...prev, route: { ...prev.route, departure: dateString, deadline: '', arrival: '' } }));
                                            } else {
                                                setFormData(prev => ({ ...prev, route: { ...prev.route, departure: dateString, arrival: '' } }));
                                            }
                                        }}
                                        minDate={new Date()}
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        placeholderText="Select departure date & time"
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm cursor-pointer border-gray-300 dark:border-gray-600"
                                        wrapperClassName="w-full"
                                        showPopperArrow={false}
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                    />
                                </div>
                            </div>

                            {/* --- Field 2: Duration --- */}
                            <div>
                                <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                    <Clock className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                    Duration time
                                </label>
                                <div className="w-full px-4 py-2.5 h-[42px] flex items-center bg-gray-100 dark:bg-gray-800 border rounded-lg transition-all text-sm border-gray-300 dark:border-gray-600">
                                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                        {calculateDuration(formData.route.departure, formData.route.arrival)}
                                    </span>
                                </div>
                            </div>

                            {/* --- Field 3: Arrival --- */}
                            <div>
                                <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                    Arrival time *
                                </label>
                                <div className="relative">
                                    <DatePicker
                                        selected={parseISOToDate(formData.route.arrival)}
                                        onChange={(date: Date | null) => {
                                            const dateString = formatDateToISO(date);
                                            setFormData(prev => ({ ...prev, route: { ...prev.route, arrival: dateString } }));
                                        }}
                                        minDate={parseISOToDate(formData.route.departure) || new Date()}
                                        minTime={
                                            parseISOToDate(formData.route.departure) &&
                                            parseISOToDate(formData.route.arrival) &&
                                            parseISOToDate(formData.route.departure)?.toDateString() === parseISOToDate(formData.route.arrival)?.toDateString()
                                                ? parseISOToDate(formData.route.departure)
                                                : new Date(new Date().setHours(0, 0, 0, 0))
                                        }
                                        maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        placeholderText="Select arrival date & time"
                                        disabled={!formData.route.departure}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm cursor-pointer border-gray-300 dark:border-gray-600"
                                        wrapperClassName="w-full"
                                        showPopperArrow={false}
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* --- End of Departure/Duration/Arrival row --- */}

                        {/* --- NEW ROW for Layover Time --- */}
                        {/* === THIS SECTION IS CONDITIONALLY RENDERED AS REQUESTED === */}
                        {stoppageType === 'stoppage' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                
                                {/* --- Empty div for 1st column (pushes field to middle) --- */}
                                <div></div>

                                {/* --- Field: Layover Time (NOW SELECTS) --- */}
                                <div>
                                    <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                        <Clock className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                        Layover time
                                    </label>
                                    <div className="flex space-x-2">
                                        {/* Hours Select */}
                                        <div className="flex-1">
                                            <select
                                                value={formData.route.layoverHours}
                                                onChange={(e) => {
                                                    setFormData(prev => ({ ...prev, route: { ...prev.route, layoverHours: e.target.value } }));
                                                }}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm border-gray-300 dark:border-gray-600"
                                            >
                                                <option value="">HH</option>
                                                {hoursOptions.map(hour => (
                                                    <option key={hour} value={hour}>{hour}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Minutes Select */}
                                        <div className="flex-1">
                                            <select
                                                value={formData.route.layoverMinutes}
                                                onChange={(e) => {
                                                    setFormData(prev => ({ ...prev, route: { ...prev.route, layoverMinutes: e.target.value } }));
                                                }}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm border-gray-300 dark:border-gray-600"
                                            >
                                                <option value="">MM</option>
                                                {minutesOptions.map(min => (
                                                    <option key={min} value={min}>{min}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* --- Empty div for 3rd column --- */}
                                <div></div>
                            </div>
                        )}
                        {/* --- END NEW LAYOVER ROW --- */}
                        
                        {/* --- INBOUND STOPPAGE DATE PICKER SECTION --- */}
                        {stoppageType === 'stoppage' && stoppageDates && ( // Added stoppageDates check
                            <div className="mt-6 pt-4 border-t border-green-300 dark:border-green-700 space-y-4">
                                <h6 className="text-md font-bold text-gray-800 dark:text-gray-200">
                                    Stoppage Dates & Times
                                </h6>
                                {stoppageDates.map((stopDate, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50">
                                        
                                        {/* --- Field 1 (Stop Arrival) --- MODIFIED --- */}
                                        <div>
                                            <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                                Arrival Date & Time * {/* Label changed back */ }
                                            </label>
                                            <DatePicker
                                                selected={parseISOToDate(stopDate.arrival)}
                                                onChange={() => {}} // Disabled, no-op
                                                minDate={parseISOToDate(formData.route.arrival) || new Date()} 
                                                maxDate={parseISOToDate(formData.route.return)}
                                                dateFormat="MMMM d, yyyy h:mm aa"
                                                placeholderText="Auto-calculated" // Changed
                                                disabled={true} // Changed
                                                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border rounded-lg transition-all text-sm cursor-not-allowed border-gray-300 dark:border-gray-600" // Styled as disabled
                                                wrapperClassName="w-full"
                                                showPopperArrow={false}
                                                showTimeSelect
                                                timeFormat="HH:mm"
                                                timeIntervals={15}
                                            />
                                        </div>

                                        {/* --- Field 2 (Stop Duration) --- */}
                                        <div>
                                            <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                <Clock className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                                Stop Duration time
                                            </label>
                                            <div className="w-full px-4 py-2.5 h-[42px] flex items-center bg-gray-100 dark:bg-gray-800 border rounded-lg transition-all text-sm border-gray-300 dark:border-gray-600">
                                                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                                    {calculateDuration(stopDate.arrival, stopDate.departure)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* --- Field 3 (Stop Departure) --- */}
                                        <div>
                                            <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                                Departure Date * {/* Label changed back */ }
                                            </label>
                                            <DatePicker
                                                selected={parseISOToDate(stopDate.departure)}
                                                onChange={(date: Date | null) => handleStoppageDateChange(index, 'departure', formatDateToISO(date))}
                                                minDate={parseISOToDate(stopDate.arrival) || parseISOToDate(formData.route.arrival) || new Date()}
                                                maxDate={parseISOToDate(formData.route.return)}
                                                dateFormat="MMMM d, yyyy h:mm aa"
                                                placeholderText="Select stop departure time"
                                                disabled={!stopDate.arrival} // Now depends on auto-filled arrival
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm cursor-pointer border-gray-300 dark:border-gray-600"
                                                wrapperClassName="w-full"
                                                showPopperArrow={false}
                                                showTimeSelect
                                                timeFormat="HH:mm"
                                                timeIntervals={15}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* --- END: ONE WAY FLIGHT SECTION --- */}
                    
                    
                    {/* --- NEW: RETURN FLIGHT SECTION --- */}
                    {formData.route.isRoundTrip && (
                        <div className="mt-6 border border-gray-300 dark:border-gray-600 p-4 rounded-lg"> 
                            <h6 className="text-md font-bold text-gray-800 dark:text-gray-200 mb-4">
                                Return Flight
                            </h6>

                            {/* --- Return Fields Row --- */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                
                                {/* --- Field 1: Return Date & Time --- */}
                                <div>
                                    <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                        Return Date & Time *
                                    </label>
                                    <div className="relative">
                                        <DatePicker
                                            selected={parseISOToDate(formData.route.return)}
                                            onChange={(date: Date | null) => {
                                                const dateString = formatDateToISO(date);
                                                setFormData(prev => ({ ...prev, route: { ...prev.route, return: dateString, returnArrival: '' } }));
                                            }}
                                            minDate={parseISOToDate(formData.route.arrival) || parseISOToDate(formData.route.departure) || new Date()}
                                            minTime={
                                                parseISOToDate(formData.route.arrival) &&
                                                parseISOToDate(formData.route.return) &&
                                                parseISOToDate(formData.route.arrival)?.toDateString() === parseISOToDate(formData.route.return)?.toDateString()
                                                    ? parseISOToDate(formData.route.arrival)
                                                    : new Date(new Date().setHours(0, 0, 0, 0))
                                            }
                                            maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            placeholderText="Select return date & time"
                                            disabled={!formData.route.arrival} 
                                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm cursor-pointer border-gray-300 dark:border-gray-600"
                                            wrapperClassName="w-full"
                                            showPopperArrow={false}
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                        />
                                    </div>
                                </div>
                                
                                {/* --- Field 2: Return Duration (NEW) --- */}
                                <div>
                                    <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                        <Clock className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                        Return Duration time
                                    </label>
                                    <div className="w-full px-4 py-2.5 h-[42px] flex items-center bg-gray-100 dark:bg-gray-800 border rounded-lg transition-all text-sm border-gray-300 dark:border-gray-600">
                                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                            {calculateDuration(formData.route.return, formData.route.returnArrival)}
                                        </span>
                                    </div>
                                </div>

                                {/* --- Field 3: Return Arrival (NEW) --- */}
                                <div>
                                    <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                        Return Arrival time *
                                    </label>
                                    <div className="relative">
                                        <DatePicker
                                            selected={parseISOToDate(formData.route.returnArrival)}
                                            onChange={(date: Date | null) => {
                                                const dateString = formatDateToISO(date);
                                                setFormData(prev => ({ ...prev, route: { ...prev.route, returnArrival: dateString } }));
                                            }}
                                            minDate={parseISOToDate(formData.route.return) || new Date()}
                                            minTime={
                                                parseISOToDate(formData.route.return) &&
                                                parseISOToDate(formData.route.returnArrival) &&
                                                parseISOToDate(formData.route.return)?.toDateString() === parseISOToDate(formData.route.returnArrival)?.toDateString()
                                                    ? parseISOToDate(formData.route.return)
                                                    : new Date(new Date().setHours(0, 0, 0, 0))
                                            }
                                            maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            placeholderText="Select return arrival date & time"
                                            disabled={!formData.route.return}
                                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm cursor-pointer border-gray-300 dark:border-gray-600"
                                            wrapperClassName="w-full"
                                            showPopperArrow={false}
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* --- NEW ROW for Return Layover Time --- */}
                            {/* === THIS SECTION IS CONDITIONALLY RENDERED AS REQUESTED === */}
                            {returnStoppageType === 'stoppage' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    
                                    {/* --- Empty div for 1st column (pushes field to middle) --- */}
                                    <div></div>

                                    {/* --- Field: Return Layover Time --- */}
                                    <div>
                                        <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                            <Clock className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                            Layover time
                                        </label>
                                        <div className="flex space-x-2">
                                            {/* Hours Select */}
                                            <div className="flex-1">
                                                <select
                                                    value={formData.route.returnLayoverHours}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, route: { ...prev.route, returnLayoverHours: e.target.value } }));
                                                    }}
                                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm border-gray-300 dark:border-gray-600"
                                                >
                                                    <option value="">HH</option>
                                                    {hoursOptions.map(hour => (
                                                        <option key={hour} value={hour}>{hour}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {/* Minutes Select */}
                                            <div className="flex-1">
                                                <select
                                                    value={formData.route.returnLayoverMinutes}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, route: { ...prev.route, returnLayoverMinutes: e.target.value } }));
                                                    }}
                                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm border-gray-300 dark:border-gray-600"
                                                >
                                                    <option value="">MM</option>
                                                    {minutesOptions.map(min => (
                                                        <option key={min} value={min}>{min}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- Empty div for 3rd column --- */}
                                    <div></div>
                                </div>
                            )}
                            {/* --- END NEW RETURN LAYOVER ROW --- */}
                    
                            {/* === THIS SECTION IS CONDITIONALLY RENDERED AS REQUESTED === */}
                            {returnStoppageType === 'stoppage' && returnStoppageDates && ( // Added returnStoppageDates check
                                <div className="mt-6 pt-4 border-t border-green-300 dark:border-green-700 space-y-4">
                                    <h6 className="text-md font-bold text-gray-800 dark:text-gray-200">
                                        Stoppage Dates & Times
                                    </h6>
                                    {returnStoppageDates.map((stopDate, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50">
                                            
                                            {/* --- Field 1 (Return Stop Arrival) --- MODIFIED --- */}
                                            <div>
                                                <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                                    Arrival Date & Time * </label>
                                                <DatePicker
                                                    selected={parseISOToDate(stopDate.arrival)}
                                                    onChange={() => {}} // Disabled, no-op
                                                    minDate={parseISOToDate(formData.route.return) || new Date()} 
                                                    maxDate={parseISOToDate(formData.route.returnArrival)}
                                                    dateFormat="MMMM d, yyyy h:mm aa"
                                                    placeholderText="Auto-calculated" // Changed
                                                    disabled={true} // Changed
                                                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border rounded-lg transition-all text-sm cursor-not-allowed border-gray-300 dark:border-gray-600" // Styled as disabled
                                                    wrapperClassName="w-full"
                                                    showPopperArrow={false}
                                                    showTimeSelect
                                                    timeFormat="HH:mm"
                                                    timeIntervals={15}
                                                />
                                            </div>

                                            {/* --- Field 2 (Return Stop Duration) --- */}
                                            <div>
                                                <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                    <Clock className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                                    Stop Duration time
                                                </label>
                                                <div className="w-full px-4 py-2.5 h-[42px] flex items-center bg-gray-100 dark:bg-gray-800 border rounded-lg transition-all text-sm border-gray-300 dark:border-gray-600">
                                                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                                        {calculateDuration(stopDate.arrival, stopDate.departure)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* --- Field 3 (Return Stop Departure) --- */}
                                            <div>
                                                <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                                    Departure Date *
                                                </label>
                                                <DatePicker
                                                    selected={parseISOToDate(stopDate.departure)}
                                                    onChange={(date: Date | null) => handleReturnStoppageDateChange(index, 'departure', formatDateToISO(date))}
                                                    minDate={parseISOToDate(stopDate.arrival) || parseISOToDate(formData.route.return) || new Date()}
                                                    maxDate={parseISOToDate(formData.route.returnArrival)}
                                                    dateFormat="MMMM d, yyyy h:mm aa"
                                                    placeholderText="Select stop departure time"
                                                    disabled={!stopDate.arrival} // Now depends on auto-filled arrival
                                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm cursor-pointer border-gray-300 dark:border-gray-600"
                                                    wrapperClassName="w-full"
                                                    showPopperArrow={false}
                                                    showTimeSelect
                                                    timeFormat="HH:mm"
                                                    timeIntervals={15}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {/* --- END: RETURN FLIGHT SECTION --- */}


                    {/* --- MOVED: DEADLINE ROW --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                Deadline Date *
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={parseISOToDate(formData.route.deadline)}
                                    onChange={(date: Date | null) => {
                                        const dateString = formatDateToISO(date);
                                        setFormData(prev => ({ ...prev, route: { ...prev.route, deadline: dateString } }));
                                    }}
                                    minDate={new Date()}
                                    maxDate={parseISOToDate(formData.route.departure)}
                                    dateFormat="MMMM d, yyyy" 
                                    placeholderText="Select deadline date"
                                    disabled={!formData.route.departure}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm cursor-pointer border-gray-300 dark:border-gray-600"
                                    wrapperClassName="w-full"
                                    showPopperArrow={false}
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {formData.availableDates.length > 0 ? (
                <div className="space-y-3">
                    {formData.availableDates.map((dateItem, index) => (
                        <div
                            key={dateItem.id}
                            className="flex items-start justify-between p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-green-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex items-start space-x-4 md:space-x-6 flex-1">
                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    #{index + 1}
                                </span>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                                        {/* Departure */}
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Departure</p>
                                            <p className="text-base font-bold text-gray-900 dark:text-white">
                                                {formatDisplayDate(dateItem.departure)}
                                            </p>
                                        </div>
                                        
                                        {/* --- NEW: Layover Display --- */}
                                        {(dateItem.layoverHours || dateItem.layoverMinutes) && (
                                            <>
                                                <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Layover</p>
                                                    <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                                                        {dateItem.layoverHours || '0'}h {dateItem.layoverMinutes || '0'}m
                                                    </p>
                                                </div>
                                            </>
                                        )}

                                        {/* --- Arrival Display --- */}
                                        <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Arrival</p>
                                            <p className="text-base font-bold text-gray-900 dark:text-white">
                                                {formatDisplayDate(dateItem.arrival)}
                                            </p>
                                        </div>

                                        {/* --- Return and Return Arrival Display --- */}
                                        {dateItem.return && (
                                            <>
                                                <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Return</p>
                                                    <p className="text-base font-bold text-gray-900 dark:text-white">
                                                        {formatDisplayDate(dateItem.return)}
                                                    </p>
                                                </div>
                                                
                                                {/* --- NEW: Return Layover Display --- */}
                                                {(dateItem.returnLayoverHours || dateItem.returnLayoverMinutes) && (
                                                    <>
                                                        <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
                                                        <div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Return Layover</p>
                                                            <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                                                                {dateItem.returnLayoverHours || '0'}h {dateItem.returnLayoverMinutes || '0'}m
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                                
                                                <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Return Arrival</p>
                                                    <p className="text-base font-bold text-gray-900 dark:text-white">
                                                        {formatDisplayDate(dateItem.returnArrival)}
                                                    </p>
                                                </div>
                                            </>
                                        )}

                                        <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />

                                        {/* Deadline Display */}
                                        <div>
                                            <p className="text-xs text-red-600 dark:text-red-400 mb-1">Deadline</p>
                                            <p className="text-base font-bold text-red-600 dark:text-red-400">
                                                {formatDisplayDateOnly(dateItem.deadline)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* --- inbound Stoppage Date Display --- */}
                                    {dateItem.stoppageDates && dateItem.stoppageDates.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-green-200 dark:border-gray-600 space-y-3">
                                            {dateItem.stoppageDates.map((stop, sIndex) => (
                                                <div key={sIndex} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        inbound Stop {sIndex + 1}
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                                                        {/* Arrival */}
                                                        <div className="text-sm text-gray-800 dark:text-gray-200">
                                                            <span className="font-medium text-gray-600 dark:text-gray-400 text-xs block">Arrival</span>
                                                            {formatDisplayDate(stop.arrival)}
                                                        </div>
                                                        {/* Departure */}
                                                        <div className="text-sm text-gray-800 dark:text-gray-200">
                                                            <span className="font-medium text-gray-600 dark:text-gray-400 text-xs block">Departure</span>
                                                            {formatDisplayDate(stop.departure)}
                                                        </div>
                                                        {/* Layover (Duration) */}
                                                        <div className="text-sm text-gray-800 dark:text-gray-200 md:text-right">
                                                            <span className="font-medium text-gray-600 dark:text-gray-400 text-xs block">Layover</span>
                                                            <div className="flex items-center md:justify-end text-blue-600 dark:text-blue-400 mt-1">
                                                                <Clock className="w-5 h-5 mr-1.5 flex-shrink-0" />
                                                                <span className="text-lg font-bold">
                                                                    {calculateDuration(stop.arrival, stop.departure)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* --- Return Stoppage Date Display --- */}
                                    {dateItem.returnStoppageDates && dateItem.returnStoppageDates.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-green-200 dark:border-gray-600 space-y-3">
                                            {dateItem.returnStoppageDates.map((stop, sIndex) => (
                                                <div key={sIndex} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                                    {/* --- THIS LABEL HAS BEEN CHANGED PER YOUR REQUEST --- */}
                                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        inbound Stop {sIndex + 1}
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                                                        {/* Arrival */}
                                                        <div className="text-sm text-gray-800 dark:text-gray-200">
                                                            <span className="font-medium text-gray-600 dark:text-gray-400 text-xs block">Arrival</span>
                                                            {formatDisplayDate(stop.arrival)}
                                                        </div>
                                                        {/* Departure */}
                                                        <div className="text-sm text-gray-800 dark:text-gray-200">
                                                            <span className="font-medium text-gray-600 dark:text-gray-400 text-xs block">Departure</span>
                                                            {formatDisplayDate(stop.departure)}
                                                        </div>
                                                        {/* Layover (Duration) */}
                                                        <div className="text-sm text-gray-800 dark:text-gray-200 md:text-right">
                                                            <span className="font-medium text-gray-600 dark:text-gray-400 text-xs block">Layover</span>
                                                            <div className="flex items-center md:justify-end text-blue-600 dark:text-blue-400 mt-1">
                                                                <Clock className="w-5 h-5 mr-1.5 flex-shrink-0" />
                                                                <span className="text-lg font-bold">
                                                                    {calculateDuration(stop.arrival, stop.departure)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        availableDates: prev.availableDates.filter(d => d.id !== dateItem.id)
                                    }));
                                }}
                                className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-all ml-4"
                                title="Remove this date"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                        No available dates added yet
                    </p> 
                    {/* --- BUG FIXED HERE: Changed </D> to </p> --- */}
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Select dates above and click "Add Date" to add available flight dates
                    </p>
                </div>
            )}
            {formData.availableDates.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-400 font-medium flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        Total available flight dates: <span className="font-bold ml-1">{formData.availableDates.length}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default AvailableFlightDates;