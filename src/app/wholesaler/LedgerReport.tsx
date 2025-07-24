"use client";

import {
  ArrowUpDown,
  DollarSign,
  Download,
  Eye,
  FileText,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// API Response Interface for ledger/report
interface ApiLedgerEntry {
  _id: string;
  agency: string; // Agency ID
  wholesaler: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  currency: string;
  date: string;
  referenceType?: string; // Made optional to handle missing data
  ledgerStatus?: string; // Made optional to handle missing data
  referencId: string;
  description?: string; // Made optional to handle missing data
  dueDate: string | null;
}

// Interface for agency details (used for the filter dropdown)
interface AgencyInfo {
  id: string;
  agencyName: string;
}

// Interface for the data structure used by the component's UI
interface LedgerEntry {
  id: string;
  date: string;
  bookingId: string;
  agencyName: string;
  agencyId: string;
  transactionType: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  currency: string;
  reference: string;
  status: string;
}

const LedgerReport: React.FC = () => {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const [agencies, setAgencies] = useState<AgencyInfo[]>([]);
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  // --- CORRECTED --- Transform API data defensively
  const transformLedgerApiData = (
    apiData: ApiLedgerEntry[],
    agencyMap: Map<string, string>
  ): LedgerEntry[] => {
    return apiData.map((item) => ({
      id: item._id,
      date: item.date,
      bookingId: item.referencId ?? "", // Fallback to empty string
      agencyId: item.agency,
      agencyName: agencyMap.get(item.agency) || "Unknown Agency",
      // Safely call toLowerCase with a fallback
      transactionType: item.referenceType?.toLowerCase() ?? "unknown",
      description: item.description ?? "", // Fallback to empty string
      debit: item.type === "DEBIT" ? item.amount : 0,
      credit: item.type === "CREDIT" ? item.amount : 0,
      balance: 0, // Calculated later
      currency: item.currency,
      reference: item.referencId ?? "", // Fallback to empty string
      // Safely call toLowerCase with a fallback
      status: item.ledgerStatus?.toLowerCase() ?? "unknown",
    }));
  };

  // --- UPDATED --- Fetch real data from the new ledger/report API
  useEffect(() => {
    const fetchLedgerData = async () => {
      if (!wholesalerId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      // Get the authorization token
      const token =
        document.cookie
          .split("; ")
          .find((r) => r.startsWith("authToken="))
          ?.split("=")[1] || localStorage.getItem("authToken");

      if (!token) {
        setError("Authorization failed. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        // Fetch both ledger data and booking data (for agency names) in parallel
        const ledgerPromise = fetch(`${apiUrl}/ledger/report`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const bookingsPromise = fetch(
          `${apiUrl}/booking/wholesaler/${wholesalerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const [ledgerResponse, bookingsResponse] = await Promise.all([
          ledgerPromise,
          bookingsPromise,
        ]);

        if (!ledgerResponse.ok) {
          throw new Error(`Ledger API error! status: ${ledgerResponse.status}`);
        }
        if (!bookingsResponse.ok) {
          throw new Error(
            `Bookings API error! status: ${bookingsResponse.status}`
          );
        }

        const ledgerResult = await ledgerResponse.json();
        const bookingsResult = await bookingsResponse.json();

        if (!ledgerResult.success || !Array.isArray(ledgerResult.data)) {
          throw new Error("Invalid ledger API response format");
        }

        // Create a map of Agency ID -> Agency Name from the booking data
        const agencyMap = new Map<string, string>();
        if (Array.isArray(bookingsResult)) {
          bookingsResult.forEach((booking: any) => {
            if (
              booking.agency &&
              booking.agency._id &&
              booking.agency.agencyName
            ) {
              agencyMap.set(booking.agency._id, booking.agency.agencyName);
            }
          });
        }

        const uniqueAgencies: AgencyInfo[] = Array.from(
          agencyMap.entries()
        ).map(([id, agencyName]) => ({ id, agencyName }));
        setAgencies(uniqueAgencies);

        // Transform the raw API data into the format the UI uses
        const transformedEntries = transformLedgerApiData(
          ledgerResult.data,
          agencyMap
        );

        // Sort entries by date to calculate running balance correctly
        transformedEntries.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Calculate running balance
        let runningBalance = 0;
        const finalEntries = transformedEntries.map((entry) => {
          runningBalance += entry.credit - entry.debit;
          return { ...entry, balance: runningBalance };
        });

        setLedgerEntries(finalEntries);
        setFilteredEntries(finalEntries);
      } catch (error) {
        console.error("Error fetching ledger data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
        setLedgerEntries([]);
        setFilteredEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLedgerData();
  }, [wholesalerId, apiUrl]);

  // Filter and sort entries (No changes needed here)
  useEffect(() => {
    let filtered = ledgerEntries.filter((entry) => {
      const matchesSearch =
        entry.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reference.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAgency =
        selectedAgency === "all" || entry.agencyId === selectedAgency;
      const matchesType =
        transactionTypeFilter === "all" ||
        entry.transactionType === transactionTypeFilter;

      let matchesDate = true;
      if (dateRange.from && dateRange.to) {
        const entryDate = new Date(entry.date);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        matchesDate = entryDate >= fromDate && entryDate <= toDate;
      }

      return matchesSearch && matchesAgency && matchesType && matchesDate;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "desc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    setFilteredEntries(filtered);
  }, [
    ledgerEntries,
    searchTerm,
    selectedAgency,
    transactionTypeFilter,
    dateRange,
    sortOrder,
  ]);

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "booking":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
      case "payment":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "refund":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      case "commission":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900/30";
      case "markup":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <FileText className="w-4 h-4" />;
      case "payment":
        return <TrendingUp className="w-4 h-4" />;
      case "refund":
        return <TrendingDown className="w-4 h-4" />;
      case "commission":
        return <DollarSign className="w-4 h-4" />;
      case "markup":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const totalDebits = filteredEntries.reduce(
    (sum, entry) => sum + entry.debit,
    0
  );
  const totalCredits = filteredEntries.reduce(
    (sum, entry) => sum + entry.credit,
    0
  );
  const netBalance = totalCredits - totalDebits;

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Booking ID",
      "Agency Name",
      "Transaction Type",
      "Description",
      "Debit",
      "Credit",
      "Balance",
      "Currency",
      "Reference",
      "Status",
    ];

    const csvData = filteredEntries.map((entry) => [
      new Date(entry.date).toLocaleDateString(),
      entry.bookingId,
      entry.agencyName,
      entry.transactionType,
      `"${entry.description.replace(/"/g, '""')}"`, // Handle quotes in description
      entry.debit,
      entry.credit,
      entry.balance,
      entry.currency,
      entry.reference,
      entry.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-report-${new Date().toISOString().split("T")[0]}.csv`;
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
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            Ledger Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed transaction history and account movements
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto justify-center"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Debits
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalDebits.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Credits
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalCredits.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                netBalance >= 0
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              <DollarSign
                className={`w-6 h-6 ${
                  netBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Net Balance
              </p>
              <p
                className={`text-2xl font-bold ${
                  netBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${Math.abs(netBalance).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Entries
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredEntries.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, agency, description..."
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
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.agencyName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Type
            </label>
            <select
              value={transactionTypeFilter}
              onChange={(e) => setTransactionTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="booking">Booking</option>
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
              <option value="commission">Commission</option>
              <option value="markup">Markup</option>
            </select>
          </div>
          {/* Date filters are combined for better mobile layout */}
          <div className="grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-1 xl:col-span-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, from: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedAgency("all");
              setTransactionTypeFilter("all");
              setDateRange({ from: "", to: "" });
            }}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            Clear Filters
          </button>

          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>
              Sort by Date (
              {sortOrder === "desc" ? "Newest First" : "Oldest First"})
            </span>
          </button>
        </div>
      </div>

      {/* Ledger Entries */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Desktop Table Header */}
            <thead className="hidden md:table-header-group bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Agency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Debit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Credit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y-0 md:divide-y md:divide-gray-200 md:dark:divide-gray-700">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="block md:table-row mb-4 md:mb-0">
                  {/* Mobile Card View */}
                  <td
                    className="block md:hidden p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
                    colSpan={8}
                  >
                    <div className="space-y-4">
                      {/* Card Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {entry.bookingId}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.agencyName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Ref: {entry.reference}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(
                              entry.transactionType
                            )}`}
                          >
                            {getTransactionIcon(entry.transactionType)}
                            <span className="capitalize">
                              {entry.transactionType}
                            </span>
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {/* Card Body */}
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        {entry.description}
                      </p>
                      {/* Card Footer */}
                      <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">
                              -{entry.currency}{" "}
                              {entry.debit > 0
                                ? entry.debit.toLocaleString()
                                : "0"}
                            </p>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                              +{entry.currency}{" "}
                              {entry.credit > 0
                                ? entry.credit.toLocaleString()
                                : "0"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Balance</p>
                            <p
                              className={`text-lg font-bold ${
                                entry.balance >= 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {entry.currency}{" "}
                              {Math.abs(entry.balance).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Desktop Table Row View */}
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.date).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.bookingId}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {entry.description}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Ref: {entry.reference}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.agencyName}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(
                        entry.transactionType
                      )}`}
                    >
                      {getTransactionIcon(entry.transactionType)}
                      <span className="capitalize">
                        {entry.transactionType}
                      </span>
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-right">
                    {entry.debit > 0 && (
                      <div className="text-sm font-medium text-red-600 dark:text-red-400">
                        -{entry.currency} {entry.debit.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-right">
                    {entry.credit > 0 && (
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{entry.currency} {entry.credit.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-right">
                    <div
                      className={`text-sm font-medium ${
                        entry.balance >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {entry.currency}{" "}
                      {Math.abs(entry.balance).toLocaleString()}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-center">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEntries.length === 0 && !loading && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No ledger entries found
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

export default LedgerReport;