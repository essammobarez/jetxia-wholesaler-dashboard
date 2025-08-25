// Schedule.tsx
import React, { useState } from 'react';
import { FaRocket, FaCalendarAlt, FaClock, FaGlobe } from 'react-icons/fa';

const Schedule = () => {
  const [scheduleOption, setScheduleOption] = useState('now'); // 'now' or 'later'
  
  // Get today's date in YYYY-MM-DD format for the min attribute of the date input
  const today = new Date();
  const todayString = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  
  // State for date, time, and timezone
  const [date, setDate] = useState(todayString);
  const [time, setTime] = useState(String(today.getHours()).padStart(2, '0') + ':' + String(today.getMinutes()).padStart(2, '0'));
  const [timezone, setTimezone] = useState('Asia/Dhaka');


  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">Ready to Launch?</h2>
        <p className="text-gray-500 mt-2">Choose when your campaign should be sent to your selected lists.</p>
      </div>

      {/* Scheduling Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
        {/* Option 1: Send Immediately */}
        <div
          onClick={() => setScheduleOption('now')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
            scheduleOption === 'now'
              ? 'bg-blue-50 border-blue-500 shadow-lg'
              : 'bg-white border-gray-200 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center">
            <FaRocket className={`text-2xl mr-4 ${scheduleOption === 'now' ? 'text-blue-600' : 'text-gray-400'}`} />
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Send Immediately</h3>
              <p className="text-sm text-gray-500">Your campaign will be sent as soon as you click Finish.</p>
            </div>
          </div>
        </div>

        {/* Option 2: Schedule for Later */}
        <div
          onClick={() => setScheduleOption('later')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
            scheduleOption === 'later'
              ? 'bg-blue-50 border-blue-500 shadow-lg'
              : 'bg-white border-gray-200 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center">
            <FaCalendarAlt className={`text-2xl mr-4 ${scheduleOption === 'later' ? 'text-blue-600' : 'text-gray-400'}`} />
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Schedule for Later</h3>
              <p className="text-sm text-gray-500">Specify a future date and time for your campaign to be sent.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional Schedule Inputs */}
      {scheduleOption === 'later' && (
        <div className="w-full bg-white p-8 rounded-xl shadow-md border border-gray-200 animate-fade-in">
          <h3 className="text-xl font-semibold text-gray-800 mb-5">Set Delivery Date and Time</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Schedule Date */}
            <div>
              <label htmlFor="scheduleDate" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="mr-2 text-gray-400" /> Date
              </label>
              <input
                type="date"
                id="scheduleDate"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={todayString}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Schedule Time */}
            <div>
              <label htmlFor="scheduleTime" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaClock className="mr-2 text-gray-400" /> Time
              </label>
              <input
                type="time"
                id="scheduleTime"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
             {/* Timezone */}
            <div>
              <label htmlFor="timezone" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaGlobe className="mr-2 text-gray-400" /> Timezone
              </label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Asia/Dhaka">(GMT+06:00) Dhaka</option>
                <option value="America/New_York">(GMT-04:00) Eastern Time (US & Canada)</option>
                <option value="Europe/London">(GMT+01:00) London</option>
                <option value="Asia/Tokyo">(GMT+09:00) Tokyo</option>
                <option value="Australia/Sydney">(GMT+10:00) Sydney</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Note: Your local timezone (Dhaka) has been selected by default.</p>
        </div>
      )}
    </div>
  );
};

// You might need to add this to your tailwind.config.js for the animation
// keyframes: {
//   'fade-in': {
//     '0%': { opacity: '0', transform: 'translateY(-10px)' },
//     '100%': { opacity: '1', transform: 'translateY(0)' },
//   },
// },
// animation: {
//   'fade-in': 'fade-in 0.5s ease-out',
// },

export default Schedule;