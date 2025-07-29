"use client";

import {
  AlertCircle,
  Building,
  CheckCircle,
  DollarSign,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Search,
} from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";

// --- Interfaces for the new API response ---

// Defines the structure for a single booking item from the API list
interface BookingListItem {
  _id: string;
  agencyName: string;
  ledgerStatus: "OUTSTANDING" | "PAID"; // Assuming possible values
  amount: number;
  paidAmount: number;
  outstanding: number;
  currency: string;
  agency: string; // Agency ID
  bookingInfo: {
    bookingId: string;
    status: "confirmed" | "cancelled" | "pending"; // Assuming possible values
  };
}

// Defines the structure for the summary data
interface SummaryData {
  totalOutstanding: number;
  bookingCount: number;
  agencyCount: number;
}

// --- Main Component ---
const OutstandingReport: React.FC = () => {
  // State for the raw data from the API
  const [bookingItems, setBookingItems] = useState<BookingListItem[]>([]);
  // State for the filtered data to be displayed in the table
  const [filteredItems, setFilteredItems] = useState<BookingListItem[]>([]);
  // State for the summary cards
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  // State for UI and filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // --- Data Fetching ---
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Retrieve auth token from cookies or local storage
      const token =
        document.cookie
          .split("; ")
          .find((r) => r.startsWith("authToken="))
          ?.split("=")[1] || localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Authorization failed. Please log in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/reports/outstanding`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(
          result.message || "An unknown API error occurred."
        );
      }

      // Set the state with the fetched data
      setSummaryData(result.data.summary);
      setBookingItems(result.data.list);
    } catch (err) {
      console.error("Error fetching report data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Failed to fetch report data: ${errorMessage}`);
      setSummaryData(null);
      setBookingItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []); // Fetch data on initial component mount

  // --- Filtering Logic ---
  useEffect(() => {
    let filtered = bookingItems.filter((item) => {
      const matchesSearch =
        item.bookingInfo.bookingId
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.agencyName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAgency =
        selectedAgency === "all" || item.agency === selectedAgency;
      const matchesStatus =
        statusFilter === "all" || item.ledgerStatus === statusFilter;

      return matchesSearch && matchesAgency && matchesStatus;
    });

    setFilteredItems(filtered);
  }, [bookingItems, searchTerm, selectedAgency, statusFilter]);

  // Dynamically generate a unique list of agencies for the filter dropdown
  const agencies = useMemo(() => {
    const uniqueAgencies = new Map<string, string>();
    bookingItems.forEach((item) => {
      if (!uniqueAgencies.has(item.agency)) {
        uniqueAgencies.set(item.agency, item.agencyName);
      }
    });
    return Array.from(uniqueAgencies, ([id, name]) => ({ id, name }));
  }, [bookingItems]);

  // --- UI Helpers ---
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "OUTSTANDING":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
      case "PAID":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "OUTSTANDING":
        return <AlertCircle className="w-4 h-4" />;
      case "PAID":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // --- CSV Export ---
  const exportToCSV = () => {
    const headers = [
      "Booking ID",
      "Agency Name",
      "Booking Status",
      "Ledger Status",
      "Amount",
      "Paid Amount",
      "Outstanding",
      "Currency",
    ];
    const csvData = filteredItems.map((item) =>
      [
        item.bookingInfo.bookingId,
        `"${item.agencyName.replace(/"/g, '""')}"`, // Handle commas in name
        item.bookingInfo.status,
        item.ledgerStatus,
        item.amount,
        item.paidAmount,
        item.outstanding,
        item.currency,
      ].join(",")
    );

    const csvContent = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `outstanding-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Error Loading Data
              </h3>
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchReportData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Outstanding Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review outstanding booking transactions
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={fetchReportData}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportToCSV}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Outstanding
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(summaryData?.totalOutstanding ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryData?.bookingCount ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Agencies
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryData?.agencyCount ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Search
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="search"
                type="text"
                placeholder="Search Booking ID, Agency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="agency-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Agency
            </label>
            <select
              id="agency-filter"
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Agencies</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Ledger Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="OUTSTANDING">Outstanding</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Agency Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Booking Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ledger Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Outstanding
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.bookingInfo.bookingId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {item.agencyName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-sm bg-green-100 text-cyan-800 capitalize">
                      {item.bookingInfo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-sm text-xs font-medium ${getStatusColor(
                        item.ledgerStatus
                      )}`}
                    >
                      {getStatusIcon(item.ledgerStatus)}
                      <span className="capitalize">
                        {item.ledgerStatus.toLowerCase()}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {item.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-green-600">
                      {item.paidAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-red-600">
                      {item.outstanding.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No items found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutstandingReport;