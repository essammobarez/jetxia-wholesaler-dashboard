import React, { useEffect } from 'react';
import { FaRocket, FaCalendarAlt, FaClock, FaGlobe } from 'react-icons/fa';

interface ScheduleProps {
  value: { sendNow: boolean; scheduledAt?: string };
  onChange: (data: { sendNow: boolean; scheduledAt?: string }) => void;
}

const Schedule: React.FC<ScheduleProps> = ({ value, onChange }) => {
  const scheduleOption = value.sendNow ? 'now' : 'later';
  
  const today = new Date();
  const todayString = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  const currentTimeString = String(today.getHours()).padStart(2, '0') + ':' + String(today.getMinutes()).padStart(2, '0');
  
  const setScheduleOption = (option: 'now' | 'later') => {
    if (option === 'now') {
      onChange({ sendNow: true, scheduledAt: undefined });
    } else {
      // When switching to 'later', set a default date/time if not already set
      const scheduledDateTime = value.scheduledAt 
        ? new Date(value.scheduledAt)
        : new Date(today.getTime() + 60 * 60 * 1000); // Default to 1 hour from now

      onChange({ sendNow: false, scheduledAt: scheduledDateTime.toISOString() });
    }
  };

  const handleDateTimeChange = (newDate: string, newTime: string) => {
    // Combine date and time into a single ISO string
    const combined = `${newDate}T${newTime}:00`;
    const dateObj = new Date(combined);
    onChange({ sendNow: false, scheduledAt: dateObj.toISOString() });
  };
  
  const scheduledDate = value.scheduledAt ? value.scheduledAt.split('T')[0] : todayString;
  const scheduledTime = value.scheduledAt ? value.scheduledAt.split('T')[1].substring(0, 5) : currentTimeString;

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">Ready to Launch?</h2>
        <p className="text-gray-500 mt-2">Choose when your campaign should be sent.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
        <div onClick={() => setScheduleOption('now')} className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${scheduleOption === 'now' ? 'bg-blue-50 border-blue-500 shadow-lg' : 'bg-white border-gray-200 hover:border-blue-400'}`}>
          <div className="flex items-center">
            <FaRocket className={`text-2xl mr-4 ${scheduleOption === 'now' ? 'text-blue-600' : 'text-gray-400'}`} />
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Send Immediately</h3>
              <p className="text-sm text-gray-500">Your campaign will be sent as soon as you click Finish.</p>
            </div>
          </div>
        </div>
        <div onClick={() => setScheduleOption('later')} className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${scheduleOption === 'later' ? 'bg-blue-50 border-blue-500 shadow-lg' : 'bg-white border-gray-200 hover:border-blue-400'}`}>
          <div className="flex items-center">
            <FaCalendarAlt className={`text-2xl mr-4 ${scheduleOption === 'later' ? 'text-blue-600' : 'text-gray-400'}`} />
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Schedule for Later</h3>
              <p className="text-sm text-gray-500">Specify a future date and time for your campaign.</p>
            </div>
          </div>
        </div>
      </div>

      {scheduleOption === 'later' && (
        <div className="w-full bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-5">Set Delivery Date and Time</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label htmlFor="scheduleDate" className="flex items-center text-sm font-medium text-gray-700 mb-2"><FaCalendarAlt className="mr-2 text-gray-400" /> Date</label>
              <input type="date" id="scheduleDate" value={scheduledDate} onChange={(e) => handleDateTimeChange(e.target.value, scheduledTime)} min={todayString} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="scheduleTime" className="flex items-center text-sm font-medium text-gray-700 mb-2"><FaClock className="mr-2 text-gray-400" /> Time</label>
              <input type="time" id="scheduleTime" value={scheduledTime} onChange={(e) => handleDateTimeChange(scheduledDate, e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="timezone" className="flex items-center text-sm font-medium text-gray-700 mb-2"><FaGlobe className="mr-2 text-gray-400" /> Timezone</label>
              <select id="timezone" defaultValue="Asia/Dhaka" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="Asia/Dhaka">(GMT+06:00) Dhaka</option>
                <option value="America/New_York">(GMT-04:00) Eastern Time (US & Canada)</option>
                <option value="Europe/London">(GMT+01:00) London</option>
                <option value="Asia/Tokyo">(GMT+09:00) Tokyo</option>
                <option value="Australia/Sydney">(GMT+10:00) Sydney</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Note: The time is based on the selected timezone.</p>
        </div>
      )}
    </div>
  );
};

export default Schedule;