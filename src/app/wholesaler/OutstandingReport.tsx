"use client";

import {
  AlertCircle,
  Building,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { agenciesData } from "./agencies";
import {
  fetchRealBookingData,
  transformApiDataToOutstandingItems,
} from "./reportDataService";

interface OutstandingItem {
  id: string;
  bookingId: string;
  agencyName: string;
  agencyId: string;
  amount: number;
  currency: string;
  dueDate: string;
  daysPastDue: number;
  serviceType: string;
  clientRef: string;
  status: "pending" | "overdue" | "critical";
  customerName: string;
  checkIn: string;
  checkOut: string;
}

const OutstandingReport: React.FC = () => {
  const [outstandingItems, setOutstandingItems] = useState<OutstandingItem[]>(
    []
  );
  const [filteredItems, setFilteredItems] = useState<OutstandingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dynamic wholesalerId from localStorage
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // Load stored wholesaler ID on mount
  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  // Fetch real data from API
  const fetchOutstandingData = async () => {
    if (!wholesalerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const apiData = await fetchRealBookingData(wholesalerId);
      const transformedData = transformApiDataToOutstandingItems(apiData);
      setOutstandingItems(transformedData);
    } catch (error) {
      console.error("Error fetching outstanding data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to fetch outstanding data: ${errorMessage}`);
      setOutstandingItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutstandingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wholesalerId]);

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = outstandingItems.filter((item) => {
      const matchesSearch =
        item.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clientRef.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAgency =
        selectedAgency === "all" || item.agencyId === selectedAgency;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesAgency && matchesStatus;
    });

    setFilteredItems(filtered);
  }, [outstandingItems, searchTerm, selectedAgency, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "overdue":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
      case "critical":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
      case "critical":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const totalOutstanding = filteredItems.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const overdueCount = filteredItems.filter(
    (item) => item.status === "overdue" || item.status === "critical"
  ).length;

  const exportToCSV = () => {
    const headers = [
      "Booking ID",
      "Agency Name",
      "Customer Name",
      "Amount",
      "Currency",
      "Due Date",
      "Days Past Due",
      "Status",
      "Service Type",
      "Client Ref",
      "Check In",
      "Check Out",
    ];

    const csvData = filteredItems.map((item) => [
      item.bookingId,
      item.agencyName,
      `"${item.customerName.replace(/"/g, '""')}"`,
      item.amount,
      item.currency,
      item.dueDate,
      item.daysPastDue,
      item.status,
      item.serviceType,
      item.clientRef,
      item.checkIn,
      item.checkOut,
    ]);

    const csvContent = [headers.join(","), ...csvData.map(row => row.join(","))].join("\n");

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
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
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
            onClick={() => window.location.reload()}
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
            Track unpaid bookings and outstanding amounts
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={fetchOutstandingData}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                ${totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Overdue Items
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overdueCount}
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
                Total Items
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredItems.length}
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
                {new Set(filteredItems.map((item) => item.agencyId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings, agencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agency
            </label>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Agencies</option>
              {agenciesData.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.agencyName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Actions
            </label>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedAgency("all");
                setStatusFilter("all");
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Outstanding Items Table / Cards */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="hidden md:table-header-group bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Agency & Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-transparent">
              {filteredItems.map((item) => (
                <tr key={item.id} className="block md:table-row mb-4 md:mb-0">
                  {/* Mobile Card View */}
                  <td className="block md:hidden p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm" colSpan={6}>
                     <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                           <div>
                              <p className="font-bold text-gray-900 dark:text-white">{item.bookingId}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{item.serviceType}</p>
                           </div>
                           <p className="text-lg font-bold text-right text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              {item.currency} {item.amount.toLocaleString()}
                           </p>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                           <p><span className="font-medium">Agency:</span> {item.agencyName}</p>
                           <p><span className="font-medium">Customer:</span> {item.customerName}</p>
                           <p><span className="font-medium">Travel Dates:</span> {item.checkIn} to {item.checkOut}</p>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
                           <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.dueDate}</p>
                              {item.daysPastDue > 0 && (
                                <p className="text-xs text-red-600 dark:text-red-400">{item.daysPastDue} days overdue</p>
                              )}
                           </div>
                           <span
                              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                           >
                              {getStatusIcon(item.status)}
                              <span className="capitalize">{item.status}</span>
                           </span>
                           <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700">
                              <Eye className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  </td>
                  
                  {/* Desktop Table View */}
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap align-top">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.bookingId}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.serviceType} • {item.clientRef}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{item.checkIn} to {item.checkOut}</div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap align-top">
                     <div className="text-sm font-medium text-gray-900 dark:text-white">{item.agencyName}</div>
                     <div className="text-sm text-gray-500 dark:text-gray-400">{item.customerName}</div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap align-top">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.currency} {item.amount.toLocaleString()}</div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap align-top">
                    <div className="text-sm text-gray-900 dark:text-white">{item.dueDate}</div>
                    {item.daysPastDue > 0 && (
                      <div className="text-xs text-red-600 dark:text-red-400">{item.daysPastDue} days overdue</div>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap align-top">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                    >
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status}</span>
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-center align-top">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
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
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No outstanding items found
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