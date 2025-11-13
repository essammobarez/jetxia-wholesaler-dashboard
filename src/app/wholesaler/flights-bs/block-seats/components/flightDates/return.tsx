import { Calendar, Clock } from 'lucide-react';
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Import types and helpers from the main file
import { 
    AvailableFlightDatesProps, 
    StoppageDate, 
    calculateDuration 
} from '../AvailableFlightDates'; // Note: Assumes main file is named AvailableFlightDates.tsx

// --- Options for new select dropdowns (defined locally) ---
const hoursOptions = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
const minutesOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

// --- Props for this specific component ---
interface ReturnFlightProps {
    formData: AvailableFlightDatesProps['formData'];
    setFormData: AvailableFlightDatesProps['setFormData'];
    parseISOToDate: (dateString: string) => Date | null;
    formatDateToISO: (date: Date | null) => string;
    // Return stoppage props
    returnStoppageType: 'direct' | 'stoppage' | null;
    returnStoppageDates: StoppageDate[];
    handleReturnStoppageDateChange: (index: number, type: 'arrival' | 'departure', value: string) => void;
}

export const ReturnFlight: React.FC<ReturnFlightProps> = ({
    formData,
    setFormData,
    parseISOToDate,
    formatDateToISO,
    returnStoppageType,
    returnStoppageDates,
    handleReturnStoppageDateChange
}) => {
    
    // This component only renders its content if it's a round trip
    if (!formData.route.isRoundTrip) {
        return null;
    }

    return (
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
                            {/* --- UPDATED ONCHANGE HANDLER --- */}
                            onChange={(date: Date | null) => {
                                const arrivalDate = parseISOToDate(formData.route.arrival);
                                let dateString = formatDateToISO(date); // Get new date string

                                // Check if the selected date is valid
                                if (date && arrivalDate && date < arrivalDate) {
                                    // If return date is before arrival, force it to be the arrival date
                                    dateString = formatDateToISO(arrivalDate);
                                }
                                
                                // Set state with the (potentially corrected) date string
                                setFormData(prev => ({ ...prev, route: { ...prev.route, return: dateString, returnArrival: '' } }));
                            }}
                            minDate={parseISOToDate(formData.route.arrival) || parseISOToDate(formData.route.departure) || new Date()}
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
                            {/* --- UPDATED ONCHANGE HANDLER --- */}
                            onChange={(date: Date | null) => {
                                const returnDepartureDate = parseISOToDate(formData.route.return);
                                
                                // Check if the selected date is valid
                                if (date && returnDepartureDate && date < returnDepartureDate) {
                                    // If date is before return departure, force it
                                    const dateString = formatDateToISO(returnDepartureDate);
                                    setFormData(prev => ({ ...prev, route: { ...prev.route, returnArrival: dateString } }));
                                } else {
                                    // Otherwise, set normally
                                    const dateString = formatDateToISO(date);
                                    setFormData(prev => ({ ...prev, route: { ...prev.route, returnArrival: dateString } }));
                                }
                            }}
                            minDate={parseISOToDate(formData.route.return) || new Date()}
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
    );
};