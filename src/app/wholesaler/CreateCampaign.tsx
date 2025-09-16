"use client";

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaEye, FaTimes } from 'react-icons/fa';

import AddSetup from './AddSetup';
import AddContent from './AddContent';
import Preview from './Preview';
import Schedule from './Schedule';

// --- Type Definitions ---
type SubscriberList = {
  _id: string;
  title: string;
  description: string;
};

type Subscriber = {
  email: string;
  name: string;
  phone: string;
  country: string;
  status: string;
};

type UploadedData = any[][];

// --- API Helper Functions ---
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Fetches all subscriber lists with authorization
const fetchAllSubscriberLists = async (token: string): Promise<SubscriberList[]> => {
  try {
    const response = await fetch(`${BASE_URL}/campaign/subscribers/lists`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error("Failed to fetch subscriber lists:", error);
    return [];
  }
};

// Fetches subscribers for a specific list by its ID with authorization
const fetchSubscribersByListId = async (listId: string, token: string): Promise<UploadedData> => {
    try {
        const response = await fetch(`${BASE_URL}/campaign/subscribers/list/${listId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        if (result.success && result.data.length > 0) {
            const subscribers: Subscriber[] = result.data;
            const headers = ['Email', 'Name', 'Phone', 'Country', 'Status'];
            const dataRows = subscribers.map(sub => [sub.email, sub.name, sub.phone, sub.country, sub.status]);
            return [headers, ...dataRows];
        }
        return [['Email', 'Name', 'Phone', 'Country', 'Status']]; // Return headers for empty list
    } catch (error) {
        console.error(`Failed to fetch subscribers for list ${listId}:`, error);
        return [];
    }
};

// --- Utility Function to get Token ---
const getAuthToken = (): string | null => {
    const fromCookie = document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1];
    if (fromCookie) return fromCookie;
    return localStorage.getItem("authToken");
};


// Modal Component for displaying data (no changes needed here)
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
  const [subscriberLists, setSubscriberLists] = useState<SubscriberList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<UploadedData>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all subscriber lists on component mount
  useEffect(() => {
    const loadLists = async () => {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        alert("Authorization failed. Please log in again.");
        setIsLoading(false);
        return;
      }
      const lists = await fetchAllSubscriberLists(token);
      setSubscriberLists(lists);
      setIsLoading(false);
    };
    loadLists();
  }, []);

  const handleListSelect = (listId: string) => {
    setSelectedList(listId);
  };

  const handleViewData = async (listId: string) => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
        alert("Authorization failed. Please log in again.");
        setIsLoading(false);
        return;
    }
    const subscribers = await fetchSubscribersByListId(listId, token);
    setUploadedData(subscribers);
    setIsModalOpen(true);
    setIsLoading(false);
  };
  
  const handleGoToSetup = async () => {
    if (!selectedList) {
        alert('Please select a list before proceeding.');
        return;
    }
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
        alert("Authorization failed. Please log in again.");
        setIsLoading(false);
        return;
    }
    const subscribers = await fetchSubscribersByListId(selectedList, token);
    setUploadedData(subscribers);
    setCurrentStep(2);
    setIsLoading(false);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleProceedFromSetup = (finalData: any[][]) => {
    setUploadedData(finalData);
    setCurrentStep(3);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 2:
        return <AddSetup data={uploadedData} onProceed={handleProceedFromSetup} onBack={() => setCurrentStep(1)} />;
      case 3:
        return <AddContent onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />;
      case 4:
        return <Preview recipientData={uploadedData} onNext={() => setCurrentStep(5)} onBack={() => setCurrentStep(3)} />;
      case 5:
        return (
          <div className="flex flex-col w-full items-center">
            <Schedule />
            <div className="w-full mt-8 flex justify-end space-x-4">
              <button onClick={() => setCurrentStep(4)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-8 rounded-full transition-colors duration-200">
                Go Back
              </button>
              <button onClick={() => alert('Campaign Finished!')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow-lg transition-colors duration-200">
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
                  <h2 className="text-lg font-medium text-gray-800 mb-2">Select from saved list</h2>
                  <div className="space-y-3 flex-grow overflow-y-auto pr-2 max-h-60">
                    {isLoading && !isModalOpen ? <p className="text-gray-500">Loading lists...</p> : (
                        subscriberLists.length > 0 ? subscriberLists.map((list) => (
                      <div key={list._id} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border ${selectedList === list._id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`} onClick={() => handleListSelect(list._id)}>
                        <span className="font-medium text-gray-800">{list.title}</span>
                        <div className="flex items-center space-x-2">
                          {selectedList === list._id && (<FaCheckCircle className="text-green-500" />)}
                          <button onClick={(e) => { e.stopPropagation(); handleViewData(list._id); }} className="text-gray-500 hover:text-blue-600 p-1 rounded-full" aria-label={`View data for ${list.title}`}>
                            <FaEye />
                          </button>
                        </div>
                      </div>
                    )) : <p className="text-gray-500">No subscriber lists found.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full mt-8 flex justify-end">
              <button
                onClick={handleGoToSetup}
                className={`font-medium py-3 px-8 rounded-full shadow-lg transition-colors duration-200 ${selectedList ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                disabled={!selectedList || isLoading}
              >
                {isLoading ? 'Loading...' : 'Go to Add Setup →'}
              </button>
            </div>
          </>
        );
    }
  };

  const getStepClass = (step: number) => {
    if (currentStep === step) return 'w-12 h-12 rounded-full border-2 border-blue-500 bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-lg';
    if (currentStep > step) return 'w-12 h-12 rounded-full border-2 border-green-500 bg-green-50 flex items-center justify-center text-green-500 font-bold text-lg';
    return 'w-12 h-12 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg';
  };

  const getStepTextClass = (step: number) => {
    if (currentStep === step) return 'mt-2 text-sm text-blue-600 font-medium whitespace-nowrap';
    if (currentStep > step) return 'mt-2 text-sm text-green-600 font-medium whitespace-nowrap';
    return 'mt-2 text-sm text-gray-400 whitespace-nowrap';
  };
  
  const selectedListName = subscriberLists.find(l => l._id === selectedList)?.title;

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        {/* Progress Bar Section */}
        <div className="w-full mb-12">
          <div className="flex justify-between items-center text-gray-500">
            {[1, 2, 3, 4, 5].map((step, index, arr) => (
                <div key={step} className={`flex items-center ${index < arr.length -1 ? 'flex-1' : ''}`}>
                    <div className="flex flex-col items-center">
                        <div className={getStepClass(step)}>
                            {currentStep > step ? <FaCheckCircle /> : step}
                        </div>
                        <div className={getStepTextClass(step)}>
                            {['Create Campaign', 'Add Setup', 'Add Content', 'Preview', 'Schedule'][index]}
                        </div>
                    </div>
                    {index < arr.length - 1 && (
                        <div className={`flex-1 h-0.5 ${currentStep > step ? 'bg-green-300' : 'bg-gray-300'} mx-4 transition-colors duration-300`}></div>
                    )}
                </div>
            ))}
          </div>
        </div>
        {/* Dynamic content rendering */}
        {renderStepContent()}
      </div>
      {/* Modal for displaying data */}
      {isModalOpen && (
        <DataModal data={uploadedData} onClose={handleCloseModal} listName={selectedListName} />
      )}
    </div>
  );
}