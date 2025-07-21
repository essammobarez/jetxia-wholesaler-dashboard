"use client";

import {
  AlertCircle,
  Building,
  CheckCircle,
  Clock,
  Download,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";

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

interface StatementEntry {
  id: string;
  date: string;
  description: string;
  bookingId: string;
  reference: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

interface AccountStatement {
  agencyId: string;
  agencyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  statementPeriod: {
    from: string;
    to: string;
  };
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  currency: string;
  entries: StatementEntry[];
  paymentTerms: string;
  creditLimit: number;
  status: "active" | "suspended" | "warning";
}

const StatementOfAccount: React.FC = () => {
  const [statements, setStatements] = useState<AccountStatement[]>([]);
  const [selectedAgency, setSelectedAgency] = useState("all");
  const [selectedStatement, setSelectedStatement] =
    useState<AccountStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<
    Array<{ id: string; agencyName: string }>
  >([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  const transformApiDataToStatements = (
    apiData: ApiBookingResponse[]
  ): AccountStatement[] => {
    const agencyGroups = new Map<string, ApiBookingResponse[]>();
    apiData.forEach((booking) => {
      const agencyId = booking.agency?._id || "unknown";
      if (!agencyGroups.has(agencyId)) {
        agencyGroups.set(agencyId, []);
      }
      agencyGroups.get(agencyId)!.push(booking);
    });

    const statements: AccountStatement[] = [];
    agencyGroups.forEach((bookings, agencyId) => {
      if (bookings.length === 0) return;
      const firstBooking = bookings[0];
      const agencyName = firstBooking.agency?.agencyName || "Unknown Agency";
      const sortedBookings = bookings.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      let runningBalance = 0;
      const entries: StatementEntry[] = [];
      let currency = "USD";
      sortedBookings.forEach((booking) => {
        currency =
          booking.priceDetails?.price?.currency ||
          booking.bookingData?.initialResponse?.price?.selling?.currency ||
          "USD";
        const priceValue =
          booking.priceDetails?.price?.value ||
          booking.bookingData?.initialResponse?.price?.selling?.value ||
          0;
        const originalPriceValue =
          booking.priceDetails?.originalPrice?.value || priceValue;
        if (priceValue > 0) {
          runningBalance -= priceValue;
          entries.push({
            id: booking._id,
            date: booking.createdAt,
            description: `Hotel booking - ${
              booking.bookingData?.detailedInfo?.hotel?.name || "Unknown Hotel"
            }`,
            bookingId: booking.bookingId,
            reference:
              booking.bookingData?.initialResponse?.reference?.external ||
              booking.bookingId,
            debit: priceValue,
            credit: 0,
            runningBalance: runningBalance,
          });
        }
        if (
          booking.priceDetails?.markupApplied &&
          priceValue > originalPriceValue
        ) {
          const markupAmount = priceValue - originalPriceValue;
          if (markupAmount > 0) {
            runningBalance += markupAmount;
            entries.push({
              id: `${booking._id}-markup`,
              date: booking.createdAt,
              description: `Markup applied - ${
                booking.priceDetails.markupApplied.description || "Markup"
              }`,
              bookingId: booking.bookingId,
              reference: `${booking.bookingId}-MARKUP`,
              debit: 0,
              credit: markupAmount,
              runningBalance: runningBalance,
            });
          }
        }
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
                id: `${booking._id}-payment-${index}`,
                date: booking.createdAt,
                description: `Payment received for booking ${booking.bookingId}`,
                bookingId: booking.bookingId,
                reference: `PAY-${booking.bookingId}-${index}`,
                debit: 0,
                credit: paymentAmount,
                runningBalance: runningBalance,
              });
            }
          });
        }
      });

      const totalDebits = entries.reduce((sum, entry) => sum + entry.debit, 0);
      const totalCredits = entries.reduce(
        (sum, entry) => sum + entry.credit,
        0
      );
      const openingBalance = 0;
      const closingBalance = runningBalance;
      let status: "active" | "suspended" | "warning" = "active";
      if (closingBalance < -1000) {
        status = "suspended";
      } else if (closingBalance < -500) {
        status = "warning";
      }
      statements.push({
        agencyId: agencyId,
        agencyName: agencyName,
        contactName: "Contact Person",
        email: "contact@agency.com",
        phone: "+1234567890",
        address: "Agency Address",
        statementPeriod: { from: dateRange.from, to: dateRange.to },
        openingBalance,
        closingBalance,
        totalDebits,
        totalCredits,
        currency,
        entries,
        paymentTerms: "30 days",
        creditLimit: 5000,
        status,
      });
    });
    return statements;
  };

  useEffect(() => {
    const fetchStatementData = async () => {
      if (!wholesalerId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
        const response = await fetch(
          `${apiUrl}/booking/wholesaler/${wholesalerId}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const apiData: ApiBookingResponse[] = await response.json();
        if (!Array.isArray(apiData))
          throw new Error("Invalid API response format");
        const validBookings = apiData.filter(
          (b) => b && b._id && b.bookingId && b.agency && b.agency._id
        );
        if (validBookings.length === 0)
          throw new Error("No valid booking data found");
        const transformedStatements =
          transformApiDataToStatements(validBookings);
        const uniqueAgencies = Array.from(
          new Map(
            validBookings.map((b) => [
              b.agency._id,
              { id: b.agency._id, agencyName: b.agency.agencyName },
            ])
          ).values()
        );
        setAgencies(uniqueAgencies);
        setStatements(transformedStatements);
      } catch (error) {
        console.error("Error fetching statement data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
        setStatements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStatementData();
  }, [dateRange, wholesalerId]);

  const filteredStatements =
    selectedAgency === "all"
      ? statements
      : statements.filter((s) => s.agencyId === selectedAgency);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "warning":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "suspended":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      case "suspended":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const exportStatementToPDF = (statement: AccountStatement) => {
    console.log("Exporting statement for:", statement.agencyName);
    const content = `
STATEMENT OF ACCOUNT
...
`; // export logic remains the same
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statement-${statement.agencyName.replace(/\s+/g, "-")}-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalOutstanding = statements.reduce(
    (sum, s) => sum + Math.min(s.closingBalance, 0),
    0
  );
  const totalCredit = statements.reduce(
    (sum, s) => sum + Math.max(s.closingBalance, 0),
    0
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
            <AlertCircle className="w-8 h-8 text-red-600" />
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Statement of Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Agency account statements and balance summaries
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Outstanding
              </p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                ${Math.abs(totalOutstanding).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Credit
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                ${totalCredit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Agencies
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {statements.filter((s) => s.status === "active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Statements
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {statements.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
          <div className="w-full">
            <button
              onClick={() => setSelectedAgency("all")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Statements List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStatements.map((statement) => (
          <div
            key={statement.agencyId}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {statement.agencyName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {statement.contactName} • {statement.email}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    statement.status
                  )}`}
                >
                  {getStatusIcon(statement.status)}
                  <span className="capitalize">{statement.status}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Opening Balance
                  </p>
                  <p
                    className={`text-base sm:text-lg font-semibold ${
                      statement.openingBalance >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {statement.currency}{" "}
                    {Math.abs(statement.openingBalance).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Closing Balance
                  </p>
                  <p
                    className={`text-base sm:text-lg font-semibold ${
                      statement.closingBalance >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {statement.currency}{" "}
                    {Math.abs(statement.closingBalance).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm gap-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    {statement.entries.length} transactions
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Credit Limit: {statement.currency}{" "}
                    {statement.creditLimit.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setSelectedStatement(statement)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => exportStatementToPDF(statement)}
                  className="sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm flex items-center justify-center"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statement Detail Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    Statement: {selectedStatement.agencyName}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Period:{" "}
                    {new Date(
                      selectedStatement.statementPeriod.from
                    ).toLocaleDateString()}{" "}
                    to{" "}
                    {new Date(
                      selectedStatement.statementPeriod.to
                    ).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStatement(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6">
              <table className="w-full text-sm">
                <thead className="hidden md:table-header-group bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reference</th>
                    <th className="p-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Debit</th>
                    <th className="p-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Credit</th>
                    <th className="p-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 md:divide-y-0">
                  {/* Opening Balance */}
                  <tr className="block md:table-row mb-4 md:mb-0 p-4 md:p-0 rounded-lg md:rounded-none bg-blue-50 dark:bg-blue-900/20 shadow md:shadow-none">
                    <td className="block md:table-cell p-2 md:p-3 text-right md:text-left border-b md:border-b-0">
                      <span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Date:</span>
                      {new Date(selectedStatement.statementPeriod.from).toLocaleDateString()}
                    </td>
                    <td className="block md:table-cell p-2 md:p-3 text-right md:text-left border-b md:border-b-0 font-medium">
                       <span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Details:</span>
                       Opening Balance
                    </td>
                    <td className="block md:table-cell p-2 md:p-3 text-right md:text-left"><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Reference:</span>-</td>
                    <td className="block md:table-cell p-2 md:p-3 text-right md:text-left"><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Debit:</span>-</td>
                    <td className="block md:table-cell p-2 md:p-3 text-right md:text-left"><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Credit:</span>-</td>
                    <td className="block md:table-cell p-2 md:p-3 text-right md:text-left font-medium">
                      <span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Balance:</span>
                      {selectedStatement.currency} {selectedStatement.openingBalance.toLocaleString()}
                    </td>
                  </tr>

                  {/* Transaction Entries */}
                  {selectedStatement.entries.map((entry) => (
                    <tr key={entry.id} className="block md:table-row mb-4 md:mb-0 p-4 md:p-0 rounded-lg md:rounded-none bg-white dark:bg-gray-800 shadow md:shadow-none">
                       <td className="block md:table-cell p-2 md:p-3 text-right md:text-left border-b md:border-b-0"><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Date:</span>{new Date(entry.date).toLocaleDateString()}</td>
                       <td className="block md:table-cell p-2 md:p-3 text-right md:text-left border-b md:border-b-0"><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Description:</span>{entry.description}</td>
                       <td className="block md:table-cell p-2 md:p-3 text-right md:text-left border-b md:border-b-0"><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Reference:</span>{entry.reference}</td>
                       <td className="block md:table-cell p-2 md:p-3 text-right md:text-left text-red-600 dark:text-red-400"><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Debit:</span>{entry.debit > 0 ? `${selectedStatement.currency} ${entry.debit.toLocaleString()}` : "-"}</td>
                       <td className="block md:table-cell p-2 md:p-3 text-right md:text-left text-green-600 dark:text-green-400"><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Credit:</span>{entry.credit > 0 ? `${selectedStatement.currency} ${entry.credit.toLocaleString()}` : "-"}</td>
                       <td className={`block md:table-cell p-2 md:p-3 text-right md:text-left font-medium ${entry.runningBalance >= 0 ? "text-green-600" : "text-red-600"}`}><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Balance:</span>{selectedStatement.currency} {Math.abs(entry.runningBalance).toLocaleString()}</td>
                    </tr>
                  ))}

                  {/* Closing Balance */}
                  <tr className="block md:table-row p-4 md:p-0 rounded-lg md:rounded-none bg-gray-100 dark:bg-gray-700 font-bold shadow md:shadow-none">
                     <td className="block md:table-cell p-2 md:p-3 text-right md:text-left border-b md:border-b-0"><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Date:</span>{new Date(selectedStatement.statementPeriod.to).toLocaleDateString()}</td>
                     <td className="block md:table-cell p-2 md:p-3 text-right md:text-left border-b md:border-b-0"><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Details:</span>Closing Balance</td>
                     <td className="block md:table-cell p-2 md:p-3 text-right md:text-left border-b md:border-b-0"><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Reference:</span>-</td>
                     <td className="block md:table-cell p-2 md:p-3 text-right md:text-left text-red-600 dark:text-red-400"><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Total Debit:</span>{selectedStatement.currency} {selectedStatement.totalDebits.toLocaleString()}</td>
                     <td className="block md:table-cell p-2 md:p-3 text-right md:text-left text-green-600 dark:text-green-400"><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Total Credit:</span>{selectedStatement.currency} {selectedStatement.totalCredits.toLocaleString()}</td>
                     <td className={`block md:table-cell p-2 md:p-3 text-right md:text-left ${selectedStatement.closingBalance >= 0 ? "text-green-600" : "text-red-600"}`}><span className="float-left font-semibold text-gray-500 dark:text-gray-400 md:hidden">Closing Balance:</span>{selectedStatement.currency} {Math.abs(selectedStatement.closingBalance).toLocaleString()}</td>
                  </tr>

                </tbody>
              </table>
            </div>

            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={() => exportStatementToPDF(selectedStatement)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export Statement
              </button>
              <button
                onClick={() => setSelectedStatement(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredStatements.length === 0 && !loading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No statements found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your filters or date range.
          </p>
        </div>
      )}
    </div>
  );
};

export default StatementOfAccount;