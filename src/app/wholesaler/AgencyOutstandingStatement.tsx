"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Building,
  Clock,
  DollarSign,
  Download,
  Mail,
  Phone,
  Printer,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  fetchAgencyData as fetchAgencyDataFromAPI,
  fetchRealBookingData,
  transformApiDataToOutstandingItems,
} from "./reportDataService"; // Assuming this service file exists

interface AgencyOutstandingItem {
  id: string;
  bookingId: string;
  customerName: string;
  serviceType: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  currency: string;
  dueDate: string;
  daysPastDue: number;
  status: "pending" | "overdue" | "critical";
  clientRef: string;
  notes?: string;
  agencyId: string; // Added for filtering
  agencyName: string; // Added for filtering
}

interface AgencyStatementData {
  agencyId: string;
  agencyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  items: AgencyOutstandingItem[];
  totalOutstanding: number;
  totalOverdue: number;
  statementDate: string;
  statementNumber: string;
  website?: string;
  vat?: string;
  businessCurrency?: string;
}

// Updated interface to match API response fields
interface AgencyData {
  _id: string; // Corresponds to agencyId
  agencyName: string;
  totalOutstanding: number;
  itemCount: number; // Corresponds to totalItems
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  designation?: string;
  mobileNumber?: string;
  emailId?: string;
  city?: string;
  country?: string;
  postCode?: string;
  website?: string;
  vat?: string;
  businessCurrency?: string;
}

const AgencyOutstandingStatement: React.FC = () => {
  const [selectedAgency, setSelectedAgency] = useState<string>("");
  const [statementData, setStatementData] =
    useState<AgencyStatementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<any[]>([]); // To store detailed booking items for statement generation
  const [agenciesData, setAgenciesData] = useState<AgencyData[]>([]);
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  const loadAgencyData = async (isRetry = false) => {
    if (!wholesalerId && !isRetry) {
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    // 1. Get the authorization token
    const token =
      document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1] ||
      localStorage.getItem("authToken");

    if (!token) {
      setError("Authorization failed. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // 2. Fetch all necessary data in parallel
      const agencyOutstandingPromise = fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/reports/agency-outstanding`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const [agencyOutstandingResponse, bookingData, agencyDetails] =
        await Promise.all([
          agencyOutstandingPromise,
          fetchRealBookingData(wholesalerId), // Kept for generating detailed statement items
          fetchAgencyDataFromAPI(wholesalerId), // Kept for enriching agency contact details
        ]);

      // Handle response from the new endpoint
      if (!agencyOutstandingResponse.ok) {
        throw new Error(`HTTP error! status: ${agencyOutstandingResponse.status}`);
      }
      const summaryData = await agencyOutstandingResponse.json();
      if (!summaryData.success) {
        throw new Error(
          summaryData.message || "Failed to fetch agency outstanding summary"
        );
      }

      // Store detailed booking data for later use in generateStatement
      setApiData(bookingData);

      // Create a map for quick lookup of agency details
      const agencyDetailsMap = new Map(
        agencyDetails.map((ad: any) => [ad._id, ad])
      );

      // 3. Combine summary data with detailed contact info
      const combinedAgencies = summaryData.data.map((summary: any) => {
        const details = agencyDetailsMap.get(summary.agencyId);
        return {
          _id: summary.agencyId,
          agencyName: summary.agencyName,
          totalOutstanding: summary.totalOutstanding,
          itemCount: summary.totalItems,
          // Enrich with details if available
          contactPerson: details
            ? `${details.title || ""} ${details.firstName || ""} ${
                details.lastName || ""
              }`.trim()
            : "N/A",
          email: details ? details.emailId || details.email || "N/A" : "N/A",
          phone: details
            ? details.mobileNumber || details.phoneNumber || "N/A"
            : "N/A",
          address: details
            ? `${details.address || ""}, ${details.city || ""}, ${
                details.country || ""
              } ${details.postCode || ""}`.trim()
            : "N/A",
          website: details?.website,
          vat: details?.vat,
          businessCurrency: details?.businessCurrency,
        };
      });

      setAgenciesData(combinedAgencies);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(`Failed to fetch data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadAgencyData();
  }, [wholesalerId]);

  const generateStatement = (agencyId: string) => {
    setLoading(true);
    const agency = agenciesData.find((a) => a._id === agencyId);
    if (!agency) {
      setLoading(false);
      setError("Agency not found.");
      return;
    }

    if (apiData.length === 0) {
      setLoading(false);
      setError("No booking data available to generate statement. Please refresh.");
      return;
    }

    // This part remains the same, using the detailed data fetched earlier
    const allOutstanding = transformApiDataToOutstandingItems(apiData);
    const agencyOutstanding = allOutstanding.filter(
      (item) => item.agencyId === agencyId
    );

    const totalOutstanding = agencyOutstanding.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const totalOverdue = agencyOutstanding
      .filter((item) => item.status === "overdue" || item.status === "critical")
      .reduce((sum, item) => sum + item.amount, 0);

    const statement: AgencyStatementData = {
      agencyId: agency._id,
      agencyName: agency.agencyName,
      contactPerson: agency.contactPerson || "N/A",
      email: agency.email || "N/A",
      phone: agency.phone || "N/A",
      address: agency.address || "N/A",
      items: agencyOutstanding,
      totalOutstanding,
      totalOverdue,
      statementDate: new Date().toISOString().split("T")[0],
      statementNumber: `OS-${agency._id}-${new Date().getFullYear()}-${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}`,
      website: agency.website,
      vat: agency.vat,
      businessCurrency: agency.businessCurrency,
    };

    setStatementData(statement);
    setLoading(false);
  };

  const exportToPDF = () => {
    if (!statementData) return;
    alert("Export functionality placeholder.");
  };

  const printStatement = () => {
    if (!statementData) return;
    alert("Print functionality placeholder.");
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Error Loading Data
              </h3>
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          </div>
          <button
            onClick={() => loadAgencyData(true)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!statementData) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Outstanding Statement Generator
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select an agency to generate a statement.
            </p>
          </div>
          <button
            onClick={() => loadAgencyData(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors self-start sm:self-center"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Agency
          </h3>
          {agenciesData.length === 0 ? (
            <div className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No Agencies Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No agencies with outstanding items were found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agenciesData.map((agency) => (
                <div
                  key={agency._id}
                  onClick={() => generateStatement(agency._id)}
                  className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all ${
                    agency.totalOutstanding > 0
                      ? "border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 hover:shadow-md"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        agency.totalOutstanding > 0
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : "bg-blue-100 dark:bg-blue-900/30"
                      }`}
                    >
                      <Building
                        className={`w-5 h-5 ${
                          agency.totalOutstanding > 0
                            ? "text-orange-600"
                            : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {agency.agencyName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {agency.itemCount} outstanding items
                      </p>
                      {agency.totalOutstanding > 0 && (
                        <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                          Total: {agency.totalOutstanding.toLocaleString()}
                        </div>
                      )}
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

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-6">
      <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
        <button
          onClick={() => setStatementData(null)}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center flex-wrap gap-2 md:gap-3 self-end md:self-center">
          <button
            onClick={printStatement}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-8 shadow-sm">
        <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            OUTSTANDING STATEMENT
          </h1>
          <div className="flex flex-col sm:flex-row justify-center sm:space-x-8 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Statement #:{" "}
              <span className="font-medium">
                {statementData.statementNumber}
              </span>
            </span>
            <span>
              Date:{" "}
              <span className="font-medium">
                {new Date(statementData.statementDate).toLocaleDateString()}
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Agency Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {statementData.agencyName}
              </div>
              <p>
                <strong>Contact:</strong> {statementData.contactPerson}
              </p>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{statementData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{statementData.phone}</span>
              </div>
              <p>{statementData.address}</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Outstanding:
                </span>
                <span className="text-xl md:text-2xl font-bold text-red-600">
                  {statementData.items[0]?.currency || "USD"}{" "}
                  {statementData.totalOutstanding.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Overdue:
                </span>
                <span className="text-base md:text-lg font-bold text-orange-600">
                  {statementData.items[0]?.currency || "USD"}{" "}
                  {statementData.totalOverdue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Number of Items:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {statementData.items.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Outstanding Items
          </h3>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {statementData.items.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border dark:border-gray-700 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {item.bookingId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.customerName}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === "overdue" || item.status === "critical"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm space-y-2 border-t dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {item.currency} {item.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Due Date:</span>
                    <span>{item.dueDate}</span>
                  </div>
                  {item.daysPastDue > 0 && (
                    <div className="flex justify-between text-red-600 dark:text-red-400 font-medium">
                      <span>Days Overdue:</span>
                      <span>{item.daysPastDue}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Period:</span>
                    <span>
                      {item.checkIn} to {item.checkOut}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Booking Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Service Period
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {statementData.items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.bookingId}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.customerName}
                      </div>
                      <div className="text-xs text-gray-400">
                        Ref: {item.clientRef}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {item.checkIn}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        to {item.checkOut}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.currency} {item.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {item.dueDate}
                      </div>
                      {item.daysPastDue > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {item.daysPastDue} days overdue
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === "overdue" ||
                          item.status === "critical"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        <span className="mr-1">
                          {item.status === "overdue" ||
                          item.status === "critical" ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                        </span>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyOutstandingStatement;