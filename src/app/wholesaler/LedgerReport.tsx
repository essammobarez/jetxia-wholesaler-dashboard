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
// Dynamic agencies will be extracted from API data

// API Response Interfaces
interface ApiBookingResponse {
  modificationDetails?: {
    modifiedAt: string;
  };
  _id: string;
  bookingId: string;
  sequenceNumber: number;
  reservationId: number;
  bookingData: {
    initialResponse?: {
      id: number;
      clientRef: string;
      type: string;
      status: string;
      reference: {
        external: string;
        confirmation: string | null;
      };
      price: {
        selling: {
          value: number;
          currency: string;
        };
      };
      added: {
        time: string;
        user: {
          module: string;
          id: number;
          username: string;
          name: string;
          email: string;
          telephone: string;
        };
        module: string;
      };
    };
    detailedInfo?: {
      id: number;
      clientRef: string;
      service: {
        type: string;
        status: string;
        prices: {
          total: {
            selling: {
              value: number;
              currency: string;
            };
          };
        };
      };
      hotel?: {
        name: string;
      };
      added: {
        time: string;
      };
    };
  };
  provider: {
    _id: string;
    name: string;
  };
  agency: {
    _id: string;
    agencyName: string;
  };
  wholesaler: string;
  status: string;
  bookingType: string;
  paymentMethod: string | null;
  priceDetails?: {
    price: {
      value: number;
      currency: string;
    };
    originalPrice: {
      value: number;
      currency: string;
    };
    markupApplied?: {
      type: string;
      value: number;
      description: string;
    };
  };
  modified: boolean;
  createdAt: string;
  payments: any[];
  __v: number;
}

interface LedgerEntry {
  id: string;
  date: string;
  bookingId: string;
  agencyName: string;
  agencyId: string;
  transactionType: "booking" | "payment" | "refund" | "commission" | "markup";
  description: string;
  debit: number;
  credit: number;
  balance: number;
  currency: string;
  reference: string;
  status: "confirmed" | "pending" | "cancelled";
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
  const [agencies, setAgencies] = useState<
    Array<{ id: string; agencyName: string }>
  >([]);

  // Dynamic wholesalerId from localStorage
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // Load stored wholesaler ID on mount
  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  // Transform API data to LedgerEntry format
  const transformApiDataToLedgerEntries = (
    apiData: ApiBookingResponse[]
  ): LedgerEntry[] => {
    const entries: LedgerEntry[] = [];
    let runningBalance = 0;

    // Sort bookings by creation date to maintain chronological order
    const sortedBookings = [...apiData].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedBookings.forEach((booking) => {
      // Safely extract currency with fallbacks
      const currency =
        booking.priceDetails?.price?.currency ||
        booking.bookingData?.initialResponse?.price?.selling?.currency ||
        "USD";

      // Safely extract price values
      const priceValue =
        booking.priceDetails?.price?.value ||
        booking.bookingData?.initialResponse?.price?.selling?.value ||
        0;

      const originalPriceValue =
        booking.priceDetails?.originalPrice?.value || priceValue;

      const baseEntry = {
        id: booking._id,
        date: booking.createdAt,
        bookingId: booking.bookingId,
        agencyName: booking.agency?.agencyName || "Unknown Agency",
        agencyId: booking.agency?._id || "unknown",
        currency: currency,
        reference:
          booking.bookingData?.initialResponse?.reference?.external ||
          booking.bookingId,
        status:
          (booking.status as "confirmed" | "pending" | "cancelled") ||
          "pending",
      };

      // Booking entry (debit)
      if (priceValue > 0) {
        runningBalance -= priceValue;
        entries.push({
          ...baseEntry,
          transactionType: "booking",
          description: `Hotel booking - ${
            booking.bookingData?.detailedInfo?.hotel?.name || "Unknown Hotel"
          }`,
          debit: priceValue,
          credit: 0,
          balance: runningBalance,
        });
      }

      // Markup entry (credit) if markup is applied
      if (
        booking.priceDetails?.markupApplied &&
        priceValue > originalPriceValue
      ) {
        const markupAmount = priceValue - originalPriceValue;
        if (markupAmount > 0) {
          runningBalance += markupAmount;
          entries.push({
            ...baseEntry,
            id: `${booking._id}-markup`,
            transactionType: "markup",
            description: `Markup applied - ${
              booking.priceDetails.markupApplied.description || "Markup"
            }`,
            debit: 0,
            credit: markupAmount,
            balance: runningBalance,
          });
        }
      }

      // Payment entries if any
      if (
        booking.payments &&
        Array.isArray(booking.payments) &&
        booking.payments.length > 0
      ) {
        booking.payments.forEach((payment: any, index: number) => {
          const paymentAmount = payment?.amount || 0;
          if (paymentAmount > 0) {
            runningBalance += paymentAmount;
            entries.push({
              ...baseEntry,
              id: `${booking._id}-payment-${index}`,
              transactionType: "payment",
              description: `Payment received for booking ${booking.bookingId}`,
              debit: 0,
              credit: paymentAmount,
              balance: runningBalance,
            });
          }
        });
      }
    });

    return entries;
  };

  // Fetch real data from API
  useEffect(() => {
    const fetchLedgerData = async () => {
      if (!wholesalerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          // use the env‑based URL instead of the hard‑coded one
          `${apiUrl}/booking/wholesaler/${wholesalerId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiData: ApiBookingResponse[] = await response.json();

        console.log("API Response:", apiData); // Debug log

        if (!Array.isArray(apiData)) {
          throw new Error("Invalid API response format");
        }

        // Filter out invalid entries
        const validBookings = apiData.filter(
          (booking) =>
            booking &&
            booking._id &&
            booking.bookingId &&
            booking.agency &&
            booking.agency._id &&
            booking.agency.agencyName
        );

        if (validBookings.length === 0) {
          throw new Error("No valid booking data found");
        }

        const transformedEntries =
          transformApiDataToLedgerEntries(validBookings);

        // Extract unique agencies from API data
        const uniqueAgencies = Array.from(
          new Map(
            validBookings.map((booking) => [
              booking.agency._id,
              { id: booking.agency._id, agencyName: booking.agency.agencyName },
            ])
          ).values()
        );
        setAgencies(uniqueAgencies);

        setLedgerEntries(transformedEntries);
        setFilteredEntries(transformedEntries);
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
  }, [wholesalerId]);

  // Filter and sort entries
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

    // Sort by date
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
      entry.description,
      entry.debit,
      entry.credit,
      entry.balance,
      entry.currency,
      entry.reference,
      entry.status,
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
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
      <div className="p-6">
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ledger Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed transaction history and account movements
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
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

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
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

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
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

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
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

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedAgency("all");
              setTransactionTypeFilter("all");
              setDateRange({ from: "", to: "" });
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            Clear Filters
          </button>

          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>
              Sort by Date (
              {sortOrder === "desc" ? "Newest First" : "Oldest First"})
            </span>
          </button>
        </div>
      </div>

      {/* Ledger Entries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.date).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.agencyName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {entry.debit > 0 && (
                      <div className="text-sm font-medium text-red-600 dark:text-red-400">
                        -{entry.currency} {entry.debit.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {entry.credit > 0 && (
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{entry.currency} {entry.credit.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
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
