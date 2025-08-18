// Schedule.tsx
import React from 'react';

const Schedule = () => {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Schedule Campaign</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Schedule Date */}
          <div>
            <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Date
            </label>
            <input
              type="date"
              id="scheduleDate"
              placeholder="Select Schedule Date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Schedule Time */}
          <div>
            <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Time
            </label>
            <input
              type="time"
              id="scheduleTime"
              placeholder="Choose schedule date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;