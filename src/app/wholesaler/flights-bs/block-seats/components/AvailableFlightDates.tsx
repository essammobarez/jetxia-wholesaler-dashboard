// AvailableFlightDates.tsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Plus, CheckCircle, Calendar, AlertTriangle, Trash2, ArrowRight, Info } from 'lucide-react';

interface AvailableFlightDatesProps {
    formData: {
        route: {
            departure: string;
            return: string;
            isRoundTrip: boolean;
        };
        availableDates: { departure: string; return: string; id: string }[];
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    errors: { [key: string]: string };
}


const AvailableFlightDates: React.FC<AvailableFlightDatesProps> = ({ formData, setFormData, errors }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);

    return (
        <div className="mt-8 pt-8 border-t-2 border-green-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    📅 Available Flight Dates
                </h4>
                <button
                    type="button"
                    onClick={() => {
                        if (showDatePicker && formData.route.departure && (!formData.route.isRoundTrip || formData.route.return)) {
                            const newDate = {
                                id: Date.now().toString(),
                                departure: formData.route.departure,
                                return: formData.route.isRoundTrip ? formData.route.return : ''
                            };
                            setFormData(prev => ({
                                ...prev,
                                availableDates: [...prev.availableDates, newDate],
                                route: { ...prev.route, departure: '', return: '' }
                            }));
                            setShowDatePicker(false);
                        } else {
                            setShowDatePicker(!showDatePicker);
                        }
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center shadow-md"
                >
                    {showDatePicker ? (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {formData.route.departure && (!formData.route.isRoundTrip || formData.route.return) ? 'Save Date' : 'Close'}
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
                    ? 'Select departure and return dates below, then click "Save Date" to add them to the list.'
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
                        Select Flight Dates
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                Departure Date *
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={formData.route.departure ? new Date(formData.route.departure) : null}
                                    onChange={(date) => {
                                        const dateString = date ? date.toISOString().split('T')[0] : '';
                                        setFormData(prev => ({ ...prev, route: { ...prev.route, departure: dateString } }));
                                    }}
                                    minDate={new Date()}
                                    dateFormat="MMMM d, yyyy"
                                    placeholderText="Select departure date"
                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm cursor-pointer border-gray-300 dark:border-gray-600"
                                    wrapperClassName="w-full"
                                    showPopperArrow={false}
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                />
                            </div>
                        </div>
                        {formData.route.isRoundTrip && (
                            <div>
                                <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                    Return Date *
                                </label>
                                <div className="relative">
                                    <DatePicker
                                        selected={formData.route.return ? new Date(formData.route.return) : null}
                                        onChange={(date) => {
                                            const dateString = date ? date.toISOString().split('T')[0] : '';
                                            setFormData(prev => ({ ...prev, route: { ...prev.route, return: dateString } }));
                                        }}
                                        minDate={formData.route.departure ? new Date(formData.route.departure) : new Date()}
                                        dateFormat="MMMM d, yyyy"
                                        placeholderText="Select return date"
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm cursor-pointer border-gray-300 dark:border-gray-600"
                                        wrapperClassName="w-full"
                                        showPopperArrow={false}
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {formData.availableDates.length > 0 ? (
                <div className="space-y-3">
                    {formData.availableDates.map((dateItem, index) => (
                        <div
                            key={dateItem.id}
                            className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-green-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex items-center space-x-6">
                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    #{index + 1}
                                </span>
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Departure</p>
                                        <p className="text-base font-bold text-gray-900 dark:text-white">
                                            {new Date(dateItem.departure).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Return</p>
                                        <p className="text-base font-bold text-gray-900 dark:text-white">
                                            {new Date(dateItem.return).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
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
                                className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-all"
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