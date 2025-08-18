// App.tsx
"use client";

import { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import AddSetup from './AddSetup';
import AddContent from './AddContent';
import Preview from './Preview';
import Schedule from './Schedule'; // Import the new component

// Main App component
export default function App() {
  const [selectedType, setSelectedType] = useState('plain');
  const [selectedLists, setSelectedLists] = useState<string[]>(['Booking Desk Turizm']);
  const [currentStep, setCurrentStep] = useState(1);

  const handleListChange = (listName: string) => {
    setSelectedLists(prev => {
      if (prev.includes(listName)) {
        return prev.filter(name => name !== listName);
      } else {
        return [...prev, listName];
      }
    });
  };

  const isListSelected = (listName: string) => selectedLists.includes(listName);

  const renderStepContent = () => {
    switch (currentStep) {
      case 2:
        return <AddSetup onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />;
      case 3:
        return <AddContent onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />;
      case 4:
        return <Preview onNext={() => setCurrentStep(5)} onBack={() => setCurrentStep(3)} />;
      case 5:
        return (
          <div className="flex flex-col w-full items-center">
            <Schedule />
            <div className="w-full mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setCurrentStep(4)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-8 rounded-full transition-colors duration-200"
              >
                Go Back
              </button>
              <button
                onClick={() => alert('Campaign Finished!')} // Replace with actual finish logic
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow-lg transition-colors duration-200"
              >
                Finish →
              </button>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className="flex w-full space-x-8">
              <div className="flex-1 space-y-8">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">Select Campaign Type</h2>
                  <div className="flex rounded-xl bg-gray-100 p-1">
                    <button
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                        selectedType === 'plain'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-gray-600 hover:bg-white'
                      }`}
                      onClick={() => setSelectedType('plain')}
                    >
                      <FaCheckCircle className="mr-2 text-blue-200" />
                      Plain Text Type
                    </button>
                    <button
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                        selectedType === 'html'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-gray-600 hover:bg-white'
                      }`}
                      onClick={() => setSelectedType('html')}
                    >
                      <span className="mr-2">{'</>'}</span>
                      HTML Type
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">Campaign Info</h2>
                  <div className="mb-4">
                    <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 mb-1">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      id="campaignName"
                      placeholder="Enter campaign name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </label>
                    <textarea
                      id="shortDescription"
                      placeholder="Enter short description about campaign"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium text-gray-800">Select Lists to send</h2>
                  <span className="text-sm font-medium text-gray-500">{selectedLists.length} Selected</span>
                </div>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectedLists.length === 3}
                      onChange={() => {
                        if (selectedLists.length === 3) {
                          setSelectedLists([]);
                        } else {
                          setSelectedLists(['Booking Desk Turizm', 'Notics', 'Test', 'Travel List']);
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="select-all" className="text-sm text-gray-600 font-medium">Select All</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="booking-desk-turizm"
                      checked={isListSelected('Booking Desk Turizm')}
                      onChange={() => handleListChange('Booking Desk Turizm')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="booking-desk-turizm" className="ml-2 text-gray-800">Booking Desk Turizm</label>
                    <div className="ml-auto flex items-center space-x-2">
                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded-md">Notics</span>
                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded-md">Test</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="travel-list"
                      checked={isListSelected('Travel List')}
                      onChange={() => handleListChange('Travel List')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="travel-list" className="ml-2 text-gray-800">Travel List</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full mt-8 flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow-lg transition-colors duration-200"
              >
                Go to add set up →
              </button>
            </div>
          </>
        );
    }
  };

  const getStepClass = (step: number) => {
    if (currentStep === step) {
      return 'w-12 h-12 rounded-full border-2 border-blue-500 bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-lg';
    } else if (currentStep > step) {
      return 'w-12 h-12 rounded-full border-2 border-green-500 bg-green-50 flex items-center justify-center text-green-500 font-bold text-lg';
    } else {
      return 'w-12 h-12 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg';
    }
  };

  const getStepTextClass = (step: number) => {
    if (currentStep === step) {
      return 'mt-2 text-sm text-blue-600 font-medium whitespace-nowrap';
    } else if (currentStep > step) {
      return 'mt-2 text-sm text-green-600 font-medium whitespace-nowrap';
    } else {
      return 'mt-2 text-sm text-gray-400 whitespace-nowrap';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        {/* Progress Bar Section */}
        <div className="w-full mb-12">
          <div className="flex justify-between items-center text-gray-500">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className={getStepClass(1)}>
                {currentStep > 1 ? <FaCheckCircle /> : '1'}
              </div>
              <div className={getStepTextClass(1)}>Create Campaign</div>
            </div>
            <div className={`flex-1 h-0.5 ${currentStep > 1 ? 'bg-green-300' : 'bg-gray-300'} mx-4 transition-colors duration-300`}></div>
            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className={getStepClass(2)}>
                {currentStep > 2 ? <FaCheckCircle /> : '2'}
              </div>
              <div className={getStepTextClass(2)}>Add Setup</div>
            </div>
            <div className={`flex-1 h-0.5 ${currentStep > 2 ? 'bg-green-300' : 'bg-gray-300'} mx-4 transition-colors duration-300`}></div>
            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1">
              <div className={getStepClass(3)}>
                {currentStep > 3 ? <FaCheckCircle /> : '3'}
              </div>
              <div className={getStepTextClass(3)}>Add Content</div>
            </div>
            <div className={`flex-1 h-0.5 ${currentStep > 3 ? 'bg-green-300' : 'bg-gray-300'} mx-4 transition-colors duration-300`}></div>
            {/* Step 4 */}
            <div className="flex flex-col items-center flex-1">
              <div className={getStepClass(4)}>
                {currentStep > 4 ? <FaCheckCircle /> : '4'}
              </div>
              <div className={getStepTextClass(4)}>Preview</div>
            </div>
            <div className={`flex-1 h-0.5 ${currentStep > 4 ? 'bg-green-300' : 'bg-gray-300'} mx-4 transition-colors duration-300`}></div>
            {/* Step 5 */}
            <div className="flex flex-col items-center flex-1">
              <div className={getStepClass(5)}>
                {currentStep > 5 ? <FaCheckCircle /> : '5'}
              </div>
              <div className={getStepTextClass(5)}>Schedule</div>
            </div>
          </div>
        </div>

        {/* Dynamic content rendering */}
        {renderStepContent()}
      </div>
    </div>
  );
}