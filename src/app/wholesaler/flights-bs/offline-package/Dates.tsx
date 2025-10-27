// src/components/Dates.tsx

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, AlertTriangle, Clock, Info, ArrowRight } from 'lucide-react';

interface DatesProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<any>>;
}

const Dates: React.FC<DatesProps> = ({ formData, setFormData, errors, setErrors }) => {
  return (
    <div className="card-modern p-6 border-2 border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-2">
            <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <span>Dates</span>
        </h3>
        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-xs font-bold">
          Required
        </span>
      </div>
      <div className="space-y-4">
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            Start Date *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600 dark:text-red-400 pointer-events-none z-10" />
            <DatePicker
              selected={formData.dates.startDate ? new Date(formData.dates.startDate) : null}
              onChange={(date: Date | null) => {
                setFormData(prev => ({
                  ...prev,
                  dates: { ...prev.dates, startDate: date ? date.toISOString().split('T')[0] : '' }
                }));
                setErrors(prev => ({ ...prev, startDate: '' }));
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select start date"
              className={`w-full pl-12 pr-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900/30 shadow-sm hover:shadow-md cursor-pointer transition-all ${
                errors.startDate
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400'
              }`}
              minDate={new Date()}
              showPopperArrow={false}
              autoComplete="off"
            />
          </div>
          {errors.startDate && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {errors.startDate}
            </p>
          )}
        </div>
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            End Date *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600 dark:text-red-400 pointer-events-none z-10" />
            <DatePicker
              selected={formData.dates.endDate ? new Date(formData.dates.endDate) : null}
              onChange={(date: Date | null) => {
                setFormData(prev => ({
                  ...prev,
                  dates: { ...prev.dates, endDate: date ? date.toISOString().split('T')[0] : '' }
                }));
                setErrors(prev => ({ ...prev, endDate: '' }));
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select end date"
              className={`w-full pl-12 pr-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900/30 shadow-sm hover:shadow-md cursor-pointer transition-all ${
                errors.endDate
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400'
              }`}
              minDate={formData.dates.startDate ? new Date(formData.dates.startDate) : new Date()}
              showPopperArrow={false}
              autoComplete="off"
            />
          </div>
          {errors.endDate && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {errors.endDate}
            </p>
          )}
        </div>
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
            Booking Deadline
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-600 dark:text-orange-400 pointer-events-none z-10" />
            <DatePicker
              selected={formData.dates.bookingDeadline ? new Date(formData.dates.bookingDeadline) : null}
              onChange={(date: Date | null) => {
                setFormData(prev => ({
                  ...prev,
                  dates: { ...prev.dates, bookingDeadline: date ? date.toISOString().split('T')[0] : '' }
                }));
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select booking deadline"
              className="w-full pl-12 pr-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-700 rounded-xl focus:border-orange-500 dark:focus:border-orange-400 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/30 shadow-sm hover:shadow-md cursor-pointer transition-all"
              minDate={new Date()}
              maxDate={formData.dates.startDate ? new Date(formData.dates.startDate) : undefined}
              showPopperArrow={false}
              autoComplete="off"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
            <Info className="w-3 h-3 mr-1" />
            Last date customers can book this package
          </p>
        </div>
        {formData.dates.startDate && formData.dates.endDate && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                <span className="font-semibold">
                  {new Date(formData.dates.startDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="font-semibold">
                  {new Date(formData.dates.endDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700 text-center">
              <p className="text-xs font-bold text-red-800 dark:text-red-300">
                {Math.ceil((new Date(formData.dates.endDate).getTime() - new Date(formData.dates.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days total
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dates;