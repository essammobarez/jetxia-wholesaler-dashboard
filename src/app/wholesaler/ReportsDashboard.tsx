"use client";

import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  FileText,
  LayoutGrid,
  Loader2,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// Import report components for preview data

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
        payment: {
          status: string;
          type: string;
          deadline: string | null;
        };
        prices: {
          total: {
            selling: {
              value: number;
              currency: string;
            };
          };
        };
      };
      serviceDates?: {
        startDate: string;
        endDate: string;
      };
      reference?: {
        external: string;
        confirmation: string | null;
      };
      hotel?: {
        name: string;
      };
      passengers?: Array<{
        firstName: string;
        lastName: string;
        email: string;
      }>;
      added: {
        time: string;
      };
      destination?: {
        country: {
          name: string;
          iso: string;
        };
        city: {
          name: string;
        };
      };
      nationality?: {
        id: number;
        name: string;
        iso: string;
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

interface DashboardData {
  outstanding: {
    total: number;
    agencies: Array<{ agency: string; amount: number; status: string }>;
  };
  ledger: {
    netBalance: number;
    entries: Array<{
      date: string;
      desc: string;
      debit: number;
      credit: number;
      balance: number;
    }>;
  };
  statement: {
    agencies: Array<{ agency: string; opening: number; closing: number }>;
  };
  payments: {
    total: number;
    records: Array<{ agency: string; amount: number; status: string }>;
  };
  analytics: {
    revenueGrowth: number;
    totalRevenue: number;
    activeAgencies: number;
    totalAgencies: number;
    avgProcessing: number;
  };
  metrics: {
    activeSessions: number;
    processingQueue: number;
    systemHealth: number;
  };
}

const ReportsDashboard: React.FC<{
  onSelectReport?: (report: string) => void;
}> = ({ onSelectReport }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic wholesalerId from localStorage
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // Load stored wholesaler ID on mount
  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  // Transform API data to dashboard format
  const transformApiDataToDashboard = (
    apiData: ApiBookingResponse[]
  ): DashboardData => {
    if (!apiData || apiData.length === 0) {
      throw new Error("No booking data available");
    }

    // Group by agency for various calculations
    const agencyData = apiData.reduce((acc, booking) => {
      const agencyName = booking.agency?.agencyName || "Unknown Agency";
      const amount =
        booking.priceDetails?.price?.value ||
        booking.bookingData?.initialResponse?.price?.selling?.value ||
        0;

      if (!acc[agencyName]) {
        acc[agencyName] = {
          totalAmount: 0,
          bookings: [],
          status: "pending",
        };
      }

      acc[agencyName].totalAmount += amount;
      acc[agencyName].bookings.push(booking);

      // Determine status based on booking status
      if (booking.status === "confirmed") {
        acc[agencyName].status = "completed";
      } else if (
        booking.status === "cancelled" ||
        booking.status === "failed"
      ) {
        acc[agencyName].status = "overdue";
      }

      return acc;
    }, {} as Record<string, { totalAmount: number; bookings: ApiBookingResponse[]; status: string }>);

    // Outstanding Report Data
    const outstandingAgencies = Object.entries(agencyData)
      .map(([agency, data]) => ({
        agency,
        amount: data.totalAmount,
        status: data.status,
      }))
      .filter((item) => item.status === "overdue" || item.status === "pending")
      .slice(0, 3);

    const totalOutstanding = outstandingAgencies.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    // Ledger Report Data
    const ledgerEntries = apiData.slice(0, 3).map((booking, index) => {
      const amount =
        booking.priceDetails?.price?.value ||
        booking.bookingData?.initialResponse?.price?.selling?.value ||
        0;
      const date = new Date(booking.createdAt).toLocaleDateString();
      const desc = `${
        booking.bookingData?.detailedInfo?.service?.type?.toUpperCase() ||
        "BOOKING"
      } - ${booking.bookingId}`;

      return {
        date,
        desc,
        debit: booking.status === "confirmed" ? 0 : amount,
        credit: booking.status === "confirmed" ? amount : 0,
        balance: index === 0 ? -amount : 0,
      };
    });

    const netBalance = ledgerEntries.reduce(
      (sum, entry) => sum + entry.credit - entry.debit,
      0
    );

    // Statement of Account Data
    const statementAgencies = Object.entries(agencyData)
      .slice(0, 3)
      .map(([agency, data]) => ({
        agency,
        opening: 0,
        closing: data.totalAmount,
      }));

    // Payment Report Data
    const paymentRecords = Object.entries(agencyData)
      .slice(0, 3)
      .map(([agency, data]) => ({
        agency,
        amount: data.totalAmount,
        status: data.status,
      }));

    const totalPayments = paymentRecords.reduce(
      (sum, record) => sum + record.amount,
      0
    );

    // Analytics Data
    const totalRevenue = apiData.reduce((sum, booking) => {
      const amount =
        booking.priceDetails?.price?.value ||
        booking.bookingData?.initialResponse?.price?.selling?.value ||
        0;
      return sum + amount;
    }, 0);

    const uniqueAgencies = Object.keys(agencyData);
    const activeAgencies = uniqueAgencies.filter(
      (agency) => agencyData[agency].status === "completed"
    ).length;

    return {
      outstanding: {
        total: totalOutstanding,
        agencies: outstandingAgencies,
      },
      ledger: {
        netBalance,
        entries: ledgerEntries,
      },
      statement: {
        agencies: statementAgencies,
      },
      payments: {
        total: totalPayments,
        records: paymentRecords,
      },
      analytics: {
        revenueGrowth: 8.5, // Placeholder - could calculate based on date comparison
        totalRevenue,
        activeAgencies,
        totalAgencies: uniqueAgencies.length,
        avgProcessing: 2.3, // Placeholder
      },
      metrics: {
        activeSessions: Math.floor(Math.random() * 50) + 10, // Simulated
        processingQueue: Math.floor(Math.random() * 20) + 5, // Simulated
        systemHealth: 98.5, // Simulated
      },
    };
  };

  const fetchDashboardData = async () => {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData: ApiBookingResponse[] = await response.json();

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

      const transformedData = transformApiDataToDashboard(validBookings);
      setDashboardData(transformedData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [wholesalerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Dashboard Data Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No booking data found to generate dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Reports & Analytics Dashboard
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Quick overview of all financial and operational reports. Click any
        section to view the full report.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Outstanding Report Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Outstanding Report</h2>
          </div>
          <div className="mb-2 text-gray-500 text-sm">
            Total Outstanding:{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              ${dashboardData.outstanding.total.toLocaleString()}
            </span>
          </div>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left">Agency</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.outstanding.agencies.map((row, i) => (
                <tr key={i}>
                  <td>{row.agency}</td>
                  <td className="text-right">${row.amount.toLocaleString()}</td>
                  <td className="text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        row.status === "overdue"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() =>
              onSelectReport && onSelectReport("OutstandingReport")
            }
            className="mt-auto btn-modern bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
          >
            View Full Report
          </button>
        </div>

        {/* Ledger Report Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold">Ledger Report</h2>
          </div>
          <div className="mb-2 text-gray-500 text-sm">
            Net Balance:{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              ${dashboardData.ledger.netBalance.toLocaleString()}
            </span>
          </div>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left">Date</th>
                <th className="text-left">Description</th>
                <th className="text-right">Debit</th>
                <th className="text-right">Credit</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.ledger.entries.map((row, i) => (
                <tr key={i}>
                  <td>{row.date}</td>
                  <td className="truncate max-w-20">{row.desc}</td>
                  <td className="text-right">
                    {row.debit > 0 ? `-$${row.debit.toLocaleString()}` : "-"}
                  </td>
                  <td className="text-right">
                    {row.credit > 0 ? `+$${row.credit.toLocaleString()}` : "-"}
                  </td>
                  <td className="text-right">
                    ${row.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => onSelectReport && onSelectReport("LedgerReport")}
            className="mt-auto btn-modern bg-purple-600 text-white w-full py-2 rounded hover:bg-purple-700"
          >
            View Full Report
          </button>
        </div>

        {/* Statement of Account Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold">Statement of Account</h2>
          </div>
          <div className="mb-2 text-gray-500 text-sm">
            Agencies:{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {dashboardData.statement.agencies.length}
            </span>
          </div>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left">Agency</th>
                <th className="text-right">Opening</th>
                <th className="text-right">Closing</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.statement.agencies.map((row, i) => (
                <tr key={i}>
                  <td className="truncate max-w-20">{row.agency}</td>
                  <td className="text-right">
                    ${row.opening.toLocaleString()}
                  </td>
                  <td className="text-right">
                    ${row.closing.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() =>
              onSelectReport && onSelectReport("StatementOfAccount")
            }
            className="mt-auto btn-modern bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
          >
            View Full Report
          </button>
        </div>

        {/* Payment Report Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-6 h-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold">Payment Report</h2>
          </div>
          <div className="mb-2 text-gray-500 text-sm">
            Total Payments:{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              ${dashboardData.payments.total.toLocaleString()}
            </span>
          </div>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left">Agency</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.payments.records.map((row, i) => (
                <tr key={i}>
                  <td className="truncate max-w-20">{row.agency}</td>
                  <td className="text-right">${row.amount.toLocaleString()}</td>
                  <td className="text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        row.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => onSelectReport && onSelectReport("PaymentReport")}
            className="mt-auto btn-modern bg-indigo-600 text-white w-full py-2 rounded hover:bg-indigo-700"
          >
            View Full Report
          </button>
        </div>

        {/* Advanced Analytics Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-600 mr-2" />
            <h2 className="text-xl font-semibold">Advanced Analytics</h2>
          </div>
          <div className="mb-2 text-gray-500 text-sm">
            Revenue Growth:{" "}
            <span className="font-bold text-emerald-600">
              +{dashboardData.analytics.revenueGrowth}%
            </span>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Total Revenue:</span>
              <span className="font-medium">
                ${dashboardData.analytics.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Active Agencies:</span>
              <span className="font-medium">
                {dashboardData.analytics.activeAgencies} of{" "}
                {dashboardData.analytics.totalAgencies}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Avg Processing:</span>
              <span className="font-medium">
                {dashboardData.analytics.avgProcessing} days
              </span>
            </div>
          </div>
          <button
            onClick={() =>
              onSelectReport && onSelectReport("AdvancedAnalytics")
            }
            className="mt-auto btn-modern bg-emerald-600 text-white w-full py-2 rounded hover:bg-emerald-700"
          >
            View Analytics
          </button>
        </div>

        {/* Real-time Metrics Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <LayoutGrid className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Live Metrics</h2>
          </div>
          <div className="mb-2 text-gray-500 text-sm">Real-time updates</div>
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Sessions:</span>
              <span className="font-medium text-green-600">
                {dashboardData.metrics.activeSessions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Processing Queue:</span>
              <span className="font-medium text-orange-600">
                {dashboardData.metrics.processingQueue}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">System Health:</span>
              <span className="font-medium text-green-600">
                {dashboardData.metrics.systemHealth}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${dashboardData.metrics.systemHealth}%` }}
              ></div>
            </div>
          </div>
          <button className="mt-auto btn-modern bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
            View System Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
