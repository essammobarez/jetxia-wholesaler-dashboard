import { AlertTriangle, Calendar } from 'lucide-react';
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Import child components
import { OneWayFlight } from './oneway';
import { ReturnFlight } from './return';

// Import types from the main file
import { 
    AvailableFlightDatesProps, 
    StoppageDate 
} from '../AvailableFlightDates'; // Note: Assumes main file is named AvailableFlightDates.tsx

// --- Props for this specific component ---
// It needs almost all the props from the main component, plus some helpers
interface DateOverlayProps {
    formData: AvailableFlightDatesProps['formData'];
    setFormData: AvailableFlightDatesProps['setFormData'];
    dateError: string;
    parseISOToDate: (dateString: string) => Date | null;
    formatDateToISO: (date: Date | null) => string;
    
    // One Way stoppage props
    stoppageType: 'direct' | 'stoppage' | null;
    stoppageDates: StoppageDate[];
    handleStoppageDateChange: (index: number, type: 'arrival' | 'departure', value: string) => void;
    
    // Return stoppage props
    returnStoppageType: 'direct' | 'stoppage' | null;
    returnStoppageDates: StoppageDate[];
    handleReturnStoppageDateChange: (index: number, type: 'arrival' | 'departure', value: string) => void;
}

const DateOverlay: React.FC<DateOverlayProps> = ({
    formData,
    setFormData,
    dateError,
    parseISOToDate,
    formatDateToISO,
    // One Way props
    stoppageType,
    stoppageDates,
    handleStoppageDateChange,
    // Return props
    returnStoppageType,
    returnStoppageDates,
    handleReturnStoppageDateChange
}) => {
    return (
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
            
            {/* --- ONE WAY FLIGHT SECTION (Component) --- */}
            <OneWayFlight
                formData={formData}
                setFormData={setFormData}
                parseISOToDate={parseISOToDate}
                formatDateToISO={formatDateToISO}
                stoppageType={stoppageType}
                stoppageDates={stoppageDates}
                handleStoppageDateChange={handleStoppageDateChange}
            />
            
            {/* --- RETURN FLIGHT SECTION (Component) --- */}
            <ReturnFlight
                formData={formData}
                setFormData={setFormData}
                parseISOToDate={parseISOToDate}
                formatDateToISO={formatDateToISO}
                returnStoppageType={returnStoppageType}
                returnStoppageDates={returnStoppageDates}
                handleReturnStoppageDateChange={handleReturnStoppageDateChange}
            />

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
    );
};

export default DateOverlay;