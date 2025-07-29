"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Building,
  DollarSign,
  Download,
  Mail,
  Phone,
  Printer,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// Helper function to get the auth token
const getAuthToken = () => {
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("authToken="))
      ?.split("=")[1] || localStorage.getItem("authToken")
  );
};

// --- INTERFACES ---

// Interface for the initial list of agencies
interface AgencySummary {
  _id: string;
  agencyName: string;
  totalOutstanding: number;
  itemCount: number;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Interfaces for the detailed API response (reports/agency-outstanding-list/:agencyId)
interface OutstandingSummary {
  itemCount: number;
  totalOutstanding: number;
  totalAmount: number;
  totalPaid: number;
}

interface OutstandingListItem {
  _id: string;
  agencyName: string;
  amount: number;
  paidAmount: number;
  outstanding: number;
  ledgerStatus: string;
  bookingInfo: {
    bookingId: string;
    status: string;
  };
}

interface AgencyOutstandingDetails {
  summary: OutstandingSummary;
  list: OutstandingListItem[];
}

const AgencyOutstandingStatement: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [selectedAgency, setSelectedAgency] = useState<AgencySummary | null>(null);
  const [agenciesList, setAgenciesList] = useState<AgencySummary[]>([]);
  const [outstandingDetails, setOutstandingDetails] = useState<AgencyOutstandingDetails | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("wholesalerId");
    if (storedId) {
        setWholesalerId(storedId);
    } else {
        setLoading(false); // No ID, stop loading
    }
  }, []);

  useEffect(() => {
    if (wholesalerId) {
      loadInitialAgencyList();
    }
  }, [wholesalerId]);

  // --- DATA FETCHING ---

  /**
   * Fetches the initial list of agencies with their outstanding summaries.
   */
  const loadInitialAgencyList = async (isRetry = false) => {
    if (!wholesalerId) {
        if (!isRetry) setError("Wholesaler ID not found.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    const token = getAuthToken();
    if (!token) {
      setError("Authorization failed. Please log in again.");
      setLoading(false);
      return;
    }

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/reports/agency-outstanding-report`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || "Failed to fetch agency summary");
        }
        
        // Transform data to match our AgencySummary interface
        const transformedData = result.data.map((agency: any) => ({
            _id: agency.agencyId,
            agencyName: agency.agencyName,
            totalOutstanding: agency.totalOutstanding,
            itemCount: agency.totalItems,
            // Assuming contact details are not in this summary endpoint,
            // these will be populated if needed from another source or left blank.
            contactPerson: "N/A",
            email: "N/A",
            phone: "N/A",
            address: "N/A",
        }));

        setAgenciesList(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Failed to fetch initial data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches the detailed outstanding list for a specific agency.
   * @param agency - The selected agency object.
   */
  const handleSelectAgency = async (agency: AgencySummary) => {
    setSelectedAgency(agency);
    setLoadingDetails(true);
    setError(null);
    setOutstandingDetails(null);

    const token = getAuthToken();
    if (!token) {
        setError("Authorization failed. Please log in again.");
        setLoadingDetails(false);
        return;
    }

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/reports/agency-outstanding-list/${agency._id}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || "Failed to fetch outstanding details");
        }
        setOutstandingDetails(result.data);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(`Failed to fetch details for ${agency.agencyName}: ${errorMessage}`);
    } finally {
        setLoadingDetails(false);
    }
  };


  const handleBack = () => {
    setSelectedAgency(null);
    setOutstandingDetails(null);
    setError(null);
  };
  
  // --- RENDER LOGIC ---

  if (loading) {
    return (
      <div className="p-6 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error && !loadingDetails && !selectedAgency) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error Loading Data</h3>
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          </div>
          <button
            onClick={() => loadInitialAgencyList(true)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // View 1: Agency Selection List
  if (!selectedAgency) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Agency Outstanding Report</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Select an agency to view details.</p>
          </div>
           <button
            onClick={() => loadInitialAgencyList(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors self-start sm:self-center"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Agency</h3>
             {agenciesList.length === 0 ? (
                <div className="text-center py-8">
                     <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                     <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Agencies Found</h3>
                     <p className="text-gray-500 dark:text-gray-400">No agencies with outstanding items were found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agenciesList.map((agency) => (
                        <div
                            key={agency._id}
                            onClick={() => handleSelectAgency(agency)}
                            className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-all bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                             <div className="flex items-center space-x-4">
                                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <Building className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{agency.agencyName}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{agency.itemCount} outstanding items</p>
                                    <div className="mt-2 text-md font-bold text-red-600 dark:text-red-400">
                                      ${agency.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    );
  }
  
  // View 2: Detailed Outstanding View for the Selected Agency
  return (
    <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
             <button
                onClick={handleBack}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
             >
                 <ArrowLeft className="w-4 h-4" />
                 <span>Back to List</span>
             </button>
             <div className="flex items-center gap-2">
                 <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"><Printer className="w-4 h-4" /><span>Print</span></button>
                 <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Download className="w-4 h-4" /><span>Export</span></button>
             </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            {/* <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Outstanding for: {selectedAgency.agencyName}
            </h1> */}

            {/* Loading and Error states for the details fetch */}
            {loadingDetails && <p>Loading details...</p>}
            {error && !loadingDetails && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md my-4">{error}</div>
            )}

            {outstandingDetails && !loadingDetails && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                         {/* Left Column: Agency Details */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                <Building className="w-5 h-5 mr-2" /> Agency Info
                            </h3>
                            <div className="space-y-2 text-2xl text-gray-700 dark:text-gray-300">
                                <p><strong>Agency Name:</strong> {selectedAgency.agencyName}</p>
                                {/* <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" /> {selectedAgency.email || "Not Available"}</p>
                                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" /> {selectedAgency.phone || "Not Available"}</p> */}
                            </div>
                        </div>

                         {/* Right Column: Summary */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                <DollarSign className="w-5 h-5 mr-2" /> Ledger Summary
                            </h3>
                             <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">${outstandingDetails.summary.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">${outstandingDetails.summary.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                                    <span className="text-gray-900 dark:text-white font-bold">Total Outstanding:</span>
                                    <span className="font-bold text-red-600 text-xl">${outstandingDetails.summary.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Table for Outstanding Items */}
                    <div>
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Outstanding Items ({outstandingDetails.summary.itemCount})</h3>
                         <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Booking ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Agency Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Booking Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ledger Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Paid Amount</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Outstanding</th>
                                    </tr>
                                </thead>
                                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {outstandingDetails.list.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.bookingInfo.bookingId}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{item.agencyName}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                    {item.bookingInfo.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-sm bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                                    {item.ledgerStatus.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right font-medium text-gray-700 dark:text-gray-300">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="px-4 py-4 text-sm text-right font-medium text-green-600 dark:text-green-400">${item.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="px-4 py-4 text-sm text-right font-bold text-red-600 dark:text-red-400">${item.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                 </tbody>
                             </table>
                         </div>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};

export default AgencyOutstandingStatement;