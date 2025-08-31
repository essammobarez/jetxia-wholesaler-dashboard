"use client";

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { FaCheckCircle, FaEye, FaTimes } from 'react-icons/fa';

import AddSetup from './AddSetup';
import AddContent from './AddContent';
import Preview from './Preview';
import Schedule from './Schedule';

// Dummy data for the predefined lists
const dummyLists = [
  {
    name: 'USA Agency',
    id: 'usa_agency',
    data: [
      { Email: 'john.doe@usaagency.com', 'First name': 'John', 'Last name': 'Doe', Phone: '123-456-7890', Address: '123 Agency St, NY' },
      { Email: 'jane.smith@usaagency.com', 'First name': 'Jane', 'Last name': 'Smith', Phone: '098-765-4321', Address: '456 Bureau Rd, CA' },
      { Email: 'mike.jones@usaagency.com', 'First name': 'Mike', 'Last name': 'Jones', Phone: '555-123-4567', Address: '789 Office Ave, TX' },
    ],
  },
  {
    name: 'UAE Email',
    id: 'uae_email',
    data: [
      { Email: 'ali.hassan@uaeemail.com', 'First name': 'Ali', 'Last name': 'Hassan', Phone: '971-50-1234567', Address: '101 Dubai St, Dubai' },
      { Email: 'fatima.khan@uaeemail.com', 'First name': 'Fatima', 'Last name': 'Khan', Phone: '971-55-7654321', Address: '202 Abu Dhabi Rd, Abu Dhabi' },
    ],
  },
  {
    name: 'Egypt Agency',
    id: 'egypt_agency',
    data: [
      { Email: 'ahmed.mohamed@egyptagency.com', 'First name': 'Ahmed', 'Last name': 'Mohamed', Phone: '20-100-9876543', Address: '55 Cairo Blvd, Giza' },
      { Email: 'sara.ali@egyptagency.com', 'First name': 'Sara', 'Last name': 'Ali', Phone: '20-111-3456789', Address: '77 Nile Rd, Luxor' },
    ],
  },
  {
    name: 'ASTB Company',
    id: 'astb_company',
    data: [
      { Email: 'david.wilson@astbcompany.com', 'First name': 'David', 'Last name': 'Wilson', Phone: '44-20-11223344', Address: 'ASTB HQ, London' },
      { Email: 'maria.lopez@astbcompany.com', 'First name': 'Maria', 'Last name': 'Lopez', Phone: '34-91-5556677', Address: 'ASTB Branch, Madrid' },
    ],
  },
];

// Define the type for the uploaded data
type UploadedData = any[][];

// Modal Component for displaying data
const DataModal = ({ data, onClose, listName }: { data: UploadedData; onClose: () => void; listName: string | undefined }) => {
  if (!data || data.length === 0) return null;

  const headers = data[0];
  const rows = data.slice(1);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h3 className="text-xl font-medium text-gray-900">Data for {listName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="mt-4 overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 whitespace-nowrap">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App component
export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<UploadedData>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handler for selecting a predefined list
  const handleListSelect = (listId: string) => {
    const list = dummyLists.find(l => l.id === listId);
    if (list) {
      const dataAsArray = [Object.keys(list.data[0]), ...list.data.map(item => Object.values(item))];
      setUploadedData(dataAsArray);
      setSelectedList(listId);
    }
  };

  // Handler to open the modal and show data
  const handleViewData = (listId: string) => {
    const list = dummyLists.find(l => l.id === listId);
    if (list) {
      const dataAsArray = [Object.keys(list.data[0]), ...list.data.map(item => Object.values(item))];
      setUploadedData(dataAsArray); // Set the data to display in the modal
      setSelectedList(listId); // Keep track of the selected list
      setIsModalOpen(true);
    }
  };

  // Handler to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // You can choose to clear uploadedData here if it's no longer needed,
    // but keeping it might be useful if the user clicks 'Go to Add Setup' right after.
  };

  // Handler to receive final data from AddSetup and proceed
  const handleProceedFromSetup = (finalData: any[][]) => {
    setUploadedData(finalData); // Update state with the possibly edited/selected data
    setCurrentStep(3);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 2:
        return <AddSetup
          data={uploadedData}
          onProceed={handleProceedFromSetup}
          onBack={() => setCurrentStep(1)}
        />;
      case 3:
        return <AddContent onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />;
      case 4:
        return <Preview
          recipientData={uploadedData}
          onNext={() => setCurrentStep(5)}
          onBack={() => setCurrentStep(3)}
        />;
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
                onClick={() => alert('Campaign Finished!')}
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
              {/* Campaign Info Section */}
              <div className="flex-1 space-y-8">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">Campaign Info</h2>
                  <div className="mb-4">
                    <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <input type="text" id="campaignName" placeholder="Enter campaign name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                    <textarea id="shortDescription" placeholder="Enter short description about campaign" rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                  </div>
                </div>
              </div>

              {/* Recipient List Section */}
              <div className="flex-1 bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col">
                <div className="flex flex-col flex-grow">
                  <h2 className="text-lg font-medium text-gray-800 mb-2">Select a previous list</h2>
                  {/* <p className="text-sm text-gray-500 mb-4">Choose from your existing contact lists.</p> */}
                  <div className="space-y-3 flex-grow overflow-y-auto pr-2 max-h-60">
                    {dummyLists.map((list) => (
                      <div key={list.id} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border ${selectedList === list.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`} onClick={() => handleListSelect(list.id)}>
                        <span className="font-medium text-gray-800">{list.name}</span>
                        <div className="flex items-center space-x-2">
                          {selectedList === list.id && (
                            <FaCheckCircle className="text-green-500" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the parent div's onClick from firing
                              handleViewData(list.id);
                            }}
                            className="text-gray-500 hover:text-blue-600 p-1 rounded-full"
                            aria-label={`View data for ${list.name}`}
                          >
                            <FaEye />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full mt-8 flex justify-end">
              <button
                onClick={() => {
                  if (uploadedData.length > 0) {
                    setCurrentStep(2);
                  } else {
                    alert('Please select a list before proceeding.');
                  }
                }}
                className={`font-medium py-3 px-8 rounded-full shadow-lg transition-colors duration-200 ${uploadedData.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                disabled={uploadedData.length === 0}
              >
                Go to Add Setup →
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

  const selectedListName = dummyLists.find(l => l.id === selectedList)?.name;

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
      {/* Modal for displaying data */}
      {isModalOpen && (
        <DataModal
          data={uploadedData}
          onClose={handleCloseModal}
          listName={selectedListName}
        />
      )}
    </div>
  );
}