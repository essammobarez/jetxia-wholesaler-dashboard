import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Plus, CheckCircle, Calendar, AlertTriangle, Trash2, ArrowRight, Info, Clock } from 'lucide-react'; // Added Clock

// --- NEW/UPDATED TYPES ---
interface StoppageDate {
    arrival: string;
    departure: string;
}

interface AvailableDateEntry {
    departure: string;
    return: string;
    deadline: string;
    id: string;
    stoppageDates: StoppageDate[];
}

interface AvailableFlightDatesProps {
    formData: {
        route: {
            departure: string;
            return: string;
            deadline: string;
            isRoundTrip: boolean;
            // --- NEW: Props for stoppage builder ---
            stoppageType: 'direct' | 'stoppage' | null;
            stoppageCount: string;
            stoppageDates: StoppageDate[];
        };
        availableDates: AvailableDateEntry[]; // UPDATED TYPE
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    errors: { [key: string]: string };
    // --- NEW PROPS (from formData.route, passed for convenience) ---
    stoppageType: 'direct' | 'stoppage' | null;
    stoppageCount: string;
    stoppageDates: StoppageDate[];
    handleStoppageDateChange: (index: number, type: 'arrival' | 'departure', value: string) => void;
}

// --- NEW: Layover Calculation Helper ---
const calculateLayover = (arrivalStr: string, departureStr: string): string => {
    if (!arrivalStr || !departureStr) return '...';

    const arrivalDate = new Date(arrivalStr);
    const departureDate = new Date(departureStr);

    if (isNaN(arrivalDate.getTime()) || isNaN(departureDate.getTime())) {
        return '...';
    }

    let diffMs = departureDate.getTime() - arrivalDate.getTime();

    if (diffMs < 0) return 'Error'; // Departure is before arrival

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
};


const AvailableFlightDates: React.FC<AvailableFlightDatesProps> = ({
    formData,
    setFormData,
    errors,
    stoppageType,
    stoppageCount,
    stoppageDates,
    handleStoppageDateChange
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

    // --- NEW: Function to check if all stoppage dates are filled ---
    const areStoppageDatesValid = () => {
        if (stoppageType !== 'stoppage') {
            return true; // Not applicable
        }
        const count = parseInt(stoppageCount, 10) || 0;
        if (count === 0) {
            return true; // No stops to validate
        }
        // Check if the temporary builder's stoppage dates are all filled
        const datesFilled = stoppageDates.every(s => s.arrival && s.departure);
        if (!datesFilled) {
            setDateError('Please fill in all arrival and departure times for each stop.');
            return false;
        }

        // --- NEW: Validate layover times ---
        for (const stop of stoppageDates) {
            const arrival = parseISOToDate(stop.arrival);
            const departure = parseISOToDate(stop.departure);
            if (arrival && departure && departure < arrival) {
                setDateError('Stop departure time cannot be before its arrival time.');
                return false;
            }
        }

        setDateError(''); // Clear error
        return true;
    };

    const handleSaveDate = () => {
        if (
            formData.route.departure &&
            formData.route.deadline &&
            (!formData.route.isRoundTrip || formData.route.return) &&
            areStoppageDatesValid() // NEW check
        ) {
            const newDate: AvailableDateEntry = { // Use new type
                id: Date.now().toString(),
                departure: formData.route.departure,
                deadline: formData.route.deadline,
                return: formData.route.isRoundTrip ? formData.route.return : '',
                stoppageDates: formData.route.stoppageDates // Add the new array
            };

            setFormData(prev => {
                // Reset the date builder in the route object
                const resetStoppageDates = Array(parseInt(prev.route.stoppageCount, 10) || 0)
                    .fill(null)
                    .map(() => ({ arrival: '', departure: '' }));

                return {
                    ...prev,
                    availableDates: [...prev.availableDates, newDate],
                    route: {
                        ...prev.route,
                        departure: '',
                        return: '',
                        deadline: '',
                        stoppageDates: resetStoppageDates // Reset builder
                    }
                };
            });
            setShowDatePicker(false);
            setDateError('');
        } else if (!dateError) {
            // Show a generic error if areStoppageDatesValid() didn't set one
            setDateError('Please fill in all required dates (Departure, Deadline, and Return if round trip).');
        }
    };

    const handleToggleDatePicker = () => {
        if (showDatePicker) {
            // If closing, check if save is possible
            if (formData.route.departure && formData.route.deadline && (!formData.route.isRoundTrip || formData.route.return)) {
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
                        return: '',
                        deadline: '',
                        stoppageDates: Array(parseInt(prev.route.stoppageCount, 10) || 0)
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
                            {(formData.route.departure && formData.route.deadline && (!formData.route.isRoundTrip || formData.route.return)) ? 'Save Date' : 'Close'}
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
                    ? 'Select departure, deadline, stop dates, and return dates/times below, then click "Save Date" to add them to the list.'
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                            setFormData(prev => ({ ...prev, route: { ...prev.route, departure: dateString, deadline: '' } }));
                                        } else {
                                            setFormData(prev => ({ ...prev, route: { ...prev.route, departure: dateString } }));
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

                        {formData.route.isRoundTrip && (
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
                                            setFormData(prev => ({ ...prev, route: { ...prev.route, return: dateString } }));
                                        }}
                                        minDate={parseISOToDate(formData.route.departure) || new Date()}
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        placeholderText="Select return date & time"
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
                        )}

                        <div>
                            {/* UPDATED: Deadline label indicates Date only */}
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
                                    dateFormat="MMMM d, yyyy" // UPDATED: Date only format
                                    placeholderText="Select deadline date"
                                    disabled={!formData.route.departure}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm cursor-pointer border-gray-300 dark:border-gray-600"
                                    wrapperClassName="w-full"
                                    showPopperArrow={false}
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                // UPDATED: Removed time selection props for deadline
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- NEW STOPPAGE DATE PICKER SECTION --- */}
                    {stoppageType === 'stoppage' && stoppageDates.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-green-300 dark:border-green-700 space-y-4">
                            <h6 className="text-md font-bold text-gray-800 dark:text-gray-200">
                                Stoppage Dates & Times
                            </h6>
                            {stoppageDates.map((stopDate, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50">
                                    <div>
                                        <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                            Stop {index + 1} Arrival *
                                        </label>
                                        <DatePicker
                                            selected={parseISOToDate(stopDate.arrival)}
                                            onChange={(date: Date | null) => handleStoppageDateChange(index, 'arrival', formatDateToISO(date))}
                                            minDate={parseISOToDate(formData.route.departure) || new Date()}
                                            maxDate={parseISOToDate(formData.route.return)}
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            placeholderText="Select stop arrival time"
                                            disabled={!formData.route.departure}
                                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm cursor-pointer border-gray-300 dark:border-gray-600"
                                            wrapperClassName="w-full"
                                            showPopperArrow={false}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                            Stop {index + 1} Departure *
                                        </label>
                                        <DatePicker
                                            selected={parseISOToDate(stopDate.departure)}
                                            onChange={(date: Date | null) => handleStoppageDateChange(index, 'departure', formatDateToISO(date))}
                                            minDate={parseISOToDate(stopDate.arrival) || parseISOToDate(formData.route.departure) || new Date()}
                                            maxDate={parseISOToDate(formData.route.return)}
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            placeholderText="Select stop departure time"
                                            disabled={!stopDate.arrival}
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
            {formData.availableDates.length > 0 ? (
                <div className="space-y-3">
                    {formData.availableDates.map((dateItem, index) => (
                        <div
                            key={dateItem.id}
                            // UPDATED: items-start for better alignment with new content
                            className="flex items-start justify-between p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-green-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all"
                        >
                            {/* UPDATED: items-start */}
                            <div className="flex items-start space-x-4 md:space-x-6 flex-1">
                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    #{index + 1}
                                </span>
                                {/* NEW: flex-1 wrapper */}
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                                        {/* Departure */}
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Departure</p>
                                            <p className="text-base font-bold text-gray-900 dark:text-white">
                                                {formatDisplayDate(dateItem.departure)}
                                            </p>
                                        </div>

                                        {dateItem.return && (
                                            <>
                                                <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Return</p>
                                                    <p className="text-base font-bold text-gray-900 dark:text-white">
                                                        {formatDisplayDate(dateItem.return)}
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

                                    {/* --- UPDATED: Stoppage Date Display with Layover --- */}
                                    {dateItem.stoppageDates && dateItem.stoppageDates.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-green-200 dark:border-gray-600 space-y-3">
                                            {dateItem.stoppageDates.map((stop, sIndex) => (
                                                <div key={sIndex} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        Stop {sIndex + 1}
                                                    </p>
                                                    {/* --- NEW: Grid layout for better alignment --- */}
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
                                                        {/* --- UPDATED: Layover (Large and Bold) --- */}
                                                        <div className="text-sm text-gray-800 dark:text-gray-200 md:text-right">
                                                            <span className="font-medium text-gray-600 dark:text-gray-400 text-xs block">Layover</span>
                                                            <div className="flex items-center md:justify-end text-blue-600 dark:text-blue-400 mt-1">
                                                                <Clock className="w-5 h-5 mr-1.5 flex-shrink-0" />
                                                                <span className="text-lg font-bold">
                                                                    {calculateLayover(stop.arrival, stop.departure)}
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
                                className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-all ml-4" // Added ml-4
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