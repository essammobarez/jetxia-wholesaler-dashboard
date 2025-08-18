// AddSetup.tsx
import React from 'react';

interface AddSetupProps {
  onNext: () => void;
  onBack: () => void;
}

const AddSetup: React.FC<AddSetupProps> = ({ onNext, onBack }) => {
  return (
    <div className="flex flex-col w-full items-center">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Setup Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-1">
              From Name
            </label>
            <input
              type="text"
              id="fromName"
              placeholder="Enter from name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-1">
              From Email
            </label>
            <input
              type="email"
              id="fromEmail"
              placeholder="Enter email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              placeholder="Enter email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="replyTo" className="block text-sm font-medium text-gray-700 mb-1">
              Reply To Email Address
            </label>
            <input
              type="email"
              id="replyTo"
              placeholder="Enter email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-6">
          <label htmlFor="footerDetails" className="block text-sm font-medium text-gray-700 mb-1">
            Footer Details <span className="text-gray-500 text-xs">(Optional, Will Override Generic Footer)</span>
          </label>
          <textarea
            id="footerDetails"
            placeholder="Enter short description about campaign"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-ring-blue-500 resize-none"
          ></textarea>
        </div>
      </div>
      <div className="w-full mt-8 flex justify-end space-x-4">
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-8 rounded-full transition-colors duration-200"
        >
          Go Back
        </button>
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow-lg transition-colors duration-200"
        >
          Go to add content →
        </button>
      </div>
    </div>
  );
};

export default AddSetup;