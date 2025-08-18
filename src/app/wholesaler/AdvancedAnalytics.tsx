"use client";

import {
  AlertCircle,
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Globe,
  PieChart,
  RefreshCw,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    monthly: { month: string; amount: number }[];
  };
  bookings: {
    total: number;
    growth: number;
    byService: { service: string; count: number; revenue: number }[];
  };
  agencies: {
    total: number;
    active: number;
    topPerformers: { name: string; revenue: number; bookings: number }[];
  };
  payments: {
    completed: number;
    pending: number;
    refunded: number;
    averageProcessingTime: number;
  };
  geography: {
    topNationalities: {
      nationality: string;
      bookings: number;
      revenue: number;
    }[];
  };
}

const AdvancedAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [dateRange, setDateRange] = useState("30days");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic wholesalerId from localStorage
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // Load stored wholesaler ID on mount
  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  // Transform API data to analytics format
  const transformApiDataToAnalytics = (
    apiData: ApiBookingResponse[]
  ): AnalyticsData => {
    if (!apiData || apiData.length === 0) {
      throw new Error("No booking data available");
    }

    // Calculate total revenue
    const totalRevenue = apiData.reduce((sum, booking) => {
      const amount =
        booking.priceDetails?.price?.value ||
        booking.bookingData?.initialResponse?.price?.selling?.value ||
        0;
      return sum + amount;
    }, 0);

    // Group by month for revenue trend
    const monthlyRevenue = apiData.reduce((acc, booking) => {
      const createdAt = new Date(booking.createdAt);
      const monthKey = createdAt.toLocaleDateString("en-US", {
        month: "short",
      });
      const amount =
        booking.priceDetails?.price?.value ||
        booking.bookingData?.initialResponse?.price?.selling?.value ||
        0;

      if (acc[monthKey]) {
        acc[monthKey] += amount;
      } else {
        acc[monthKey] = amount;
      }
      return acc;
    }, {} as Record<string, number>);

    // Group by service type
    const serviceBreakdown = apiData.reduce((acc, booking) => {
      const serviceType =
        booking.bookingData?.detailedInfo?.service?.type?.toUpperCase() ||
        booking.bookingData?.initialResponse?.type?.toUpperCase() ||
        "UNKNOWN";
      const amount =
        booking.priceDetails?.price?.value ||
        booking.bookingData?.initialResponse?.price?.selling?.value ||
        0;

      if (acc[serviceType]) {
        acc[serviceType].count += 1;
        acc[serviceType].revenue += amount;
      } else {
        acc[serviceType] = { count: 1, revenue: amount };
      }
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    // Group by agency
    const agencyPerformance = apiData.reduce((acc, booking) => {
      const agencyName = booking.agency?.agencyName || "Unknown Agency";
      const amount =
        booking.priceDetails?.price?.value ||
        booking.bookingData?.initialResponse?.price?.selling?.value ||
        0;

      if (acc[agencyName]) {
        acc[agencyName].bookings += 1;
        acc[agencyName].revenue += amount;
      } else {
        acc[agencyName] = { bookings: 1, revenue: amount };
      }
      return acc;
    }, {} as Record<string, { bookings: number; revenue: number }>);

    // Group by nationality
    const nationalityData = apiData.reduce((acc, booking) => {
      const nationality =
        booking.bookingData?.detailedInfo?.nationality?.name || "Unknown";
      const amount =
        booking.priceDetails?.price?.value ||
        booking.bookingData?.initialResponse?.price?.selling?.value ||
        0;

      if (acc[nationality]) {
        acc[nationality].bookings += 1;
        acc[nationality].revenue += amount;
      } else {
        acc[nationality] = { bookings: 1, revenue: amount };
      }
      return acc;
    }, {} as Record<string, { bookings: number; revenue: number }>);

    // Calculate payment status
    const paymentStatus = apiData.reduce(
      (acc, booking) => {
        if (booking.status === "confirmed") {
          acc.completed += 1;
        } else if (booking.status === "pending") {
          acc.pending += 1;
        } else if (
          booking.status === "cancelled" ||
          booking.status === "failed"
        ) {
          acc.refunded += 1;
        }
        return acc;
      },
      { completed: 0, pending: 0, refunded: 0 }
    );

    // Calculate growth (simplified - could be based on previous period)
    const growth = 8.5; // Placeholder - could calculate based on date comparison

    // Calculate average processing time (simplified)
    const averageProcessingTime = 2.3; // Placeholder

    return {
      revenue: {
        total: totalRevenue,
        growth: growth,
        monthly: Object.entries(monthlyRevenue).map(([month, amount]) => ({
          month,
          amount,
        })),
      },
      bookings: {
        total: apiData.length,
        growth: growth,
        byService: Object.entries(serviceBreakdown).map(([service, data]) => ({
          service,
          count: data.count,
          revenue: data.revenue,
        })),
      },
      agencies: {
        total: Object.keys(agencyPerformance).length,
        active: Object.keys(agencyPerformance).length,
        topPerformers: Object.entries(agencyPerformance)
          .map(([name, data]) => ({
            name,
            revenue: data.revenue,
            bookings: data.bookings,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5),
      },
      payments: {
        completed: paymentStatus.completed,
        pending: paymentStatus.pending,
        refunded: paymentStatus.refunded,
        averageProcessingTime,
      },
      geography: {
        topNationalities: Object.entries(nationalityData)
          .map(([nationality, data]) => ({
            nationality,
            bookings: data.bookings,
            revenue: data.revenue,
          }))
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 5),
      },
    };
  };

  const fetchAnalyticsData = async () => {
    if (!wholesalerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.jetixia.com/api/v1/booking/wholesaler/${wholesalerId}`
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

      // If there's no data, set state to null and return to show the 'No Data' message
      if (validBookings.length === 0) {
        setAnalyticsData(null);
        return;
      }

      const transformedData = transformApiDataToAnalytics(validBookings);
      setAnalyticsData(transformedData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, wholesalerId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const exportAnalytics = () => {
    if (!analyticsData) return;

    const doc = new jsPDF();
    const tableHeadStyles = { fillColor: [22, 163, 74] };
    const today = new Date();
    const fileName = `analytics-report-${today.toISOString().split("T")[0]}.pdf`;
    let lastY = 0; // Keep track of the last Y position

    // --- Header ---
    doc.setFontSize(20);
    doc.text("Advanced Analytics Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${today.toLocaleDateString()}`, 14, 29);

    // --- Summary Section ---
    doc.setFontSize(14);
    doc.text("Key Metrics Summary", 14, 45);
    doc.setFontSize(10);
    doc.text(`Total Revenue: $${analyticsData.revenue.total.toLocaleString()}`, 16, 52);
    doc.text(`Total Bookings: ${analyticsData.bookings.total.toLocaleString()}`, 16, 58);
    doc.text(`Active Agencies: ${analyticsData.agencies.active}`, 16, 64);
    doc.text(`Completed Payments: ${analyticsData.payments.completed}`, 16, 70);
    lastY = 70; // Update lastY after the summary text

    // --- Top Performing Agencies Table ---
    doc.setFontSize(14);
    doc.text("Top Performing Agencies", 14, lastY + 15);
    autoTable(doc, {
      startY: lastY + 20,
      head: [["Rank", "Agency Name", "Bookings", "Revenue"]],
      body: analyticsData.agencies.topPerformers.map((agency, index) => [
        index + 1,
        agency.name,
        agency.bookings.toLocaleString(),
        `$${agency.revenue.toLocaleString()}`,
      ]),
      headStyles: tableHeadStyles,
    });
    lastY = (doc as any).lastAutoTable.finalY; // Update lastY after the table

    // --- Service Breakdown Table ---
    doc.setFontSize(14);
    doc.text("Service Breakdown", 14, lastY + 15);
    autoTable(doc, {
      startY: lastY + 20,
      head: [["Service Type", "Bookings Count", "Revenue"]],
      body: analyticsData.bookings.byService.map((service) => [
        service.service,
        service.count.toLocaleString(),
        `$${service.revenue.toLocaleString()}`,
      ]),
      headStyles: tableHeadStyles,
    });
    lastY = (doc as any).lastAutoTable.finalY;

    // --- Region Distribution Table ---
    doc.setFontSize(14);
    doc.text("Region Distribution (by Nationality)", 14, lastY + 15);
    autoTable(doc, {
      startY: lastY + 20,
      head: [["Nationality", "Bookings", "Revenue"]],
      body: analyticsData.geography.topNationalities.map((nat) => [
        nat.nationality,
        nat.bookings.toLocaleString(),
        `$${nat.revenue.toLocaleString()}`,
      ]),
      headStyles: tableHeadStyles,
    });

    doc.save(fileName);
  };


  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            Loading analytics data...
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
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchAnalyticsData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Analytics Data Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No booking data found to generate analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Advanced Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Deep insights into your business performance and trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="1year">Last year</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <button
            onClick={exportAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${analyticsData.revenue.total.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  +{analyticsData.revenue.growth}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.bookings.total.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  +{analyticsData.bookings.growth}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Agencies
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.agencies.active}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                of {analyticsData.agencies.total} total
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Processing Time
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.payments.averageProcessingTime} days
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Payment processing
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Revenue Trend
          </h3>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">Monthly Overview</span>
          </div>
        </div>

        {analyticsData.revenue.monthly.length > 0 ? (
          <div className="grid grid-cols-6 gap-4 h-64">
            {analyticsData.revenue.monthly.map((month, index) => {
              const maxAmount = Math.max(
                ...analyticsData.revenue.monthly.map((m) => m.amount)
              );
              const height =
                maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;

              return (
                <div key={month.month} className="flex flex-col items-center">
                  <div className="flex-1 flex items-end">
                    <div
                      className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-500 hover:from-blue-700 hover:to-blue-500"
                      style={{ height: `${height}%` }}
                      title={`$${month.amount.toLocaleString()}`}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{month.month}</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    ${(month.amount / 1000).toFixed(0)}k
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No revenue data available for the selected period
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Service Breakdown
          </h3>
          {analyticsData.bookings.byService.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.bookings.byService.map((service, index) => {
                const totalRevenue = analyticsData.bookings.byService.reduce(
                  (sum, s) => sum + s.revenue,
                  0
                );
                const percentage =
                  totalRevenue > 0 ? (service.revenue / totalRevenue) * 100 : 0;

                return (
                  <div key={service.service} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {service.service}
                      </span>
                      <span className="text-sm text-gray-500">
                        {service.count} bookings • $
                        {service.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === 0
                            ? "bg-blue-600"
                            : index === 1
                            ? "bg-purple-600"
                            : index === 2
                            ? "bg-green-600"
                            : "bg-orange-600"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No service data available
              </p>
            </div>
          )}
        </div>

        {/* Top Performing Agencies */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Top Performing Agencies
          </h3>
          {analyticsData.agencies.topPerformers.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.agencies.topPerformers.map((agency, index) => (
                <div
                  key={agency.name}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {agency.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {agency.bookings} bookings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      ${agency.revenue.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">
                        Top performer
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No agency data available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Status Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Payment Status Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {analyticsData.payments.completed}
            </p>
            <p className="text-sm text-gray-500">Completed Payments</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {analyticsData.payments.pending}
            </p>
            <p className="text-sm text-gray-500">Pending Payments</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {analyticsData.payments.refunded}
            </p>
            <p className="text-sm text-gray-500">Refunded Payments</p>
          </div>
        </div>
      </div>

      {/* Nationality Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Region Distribution
        </h3>
        {analyticsData.geography.topNationalities.length > 0 ? (
          <div className="space-y-4">
            {analyticsData.geography.topNationalities.map(
              (nationality, index) => {
                const maxBookings = Math.max(
                  ...analyticsData.geography.topNationalities.map(
                    (n) => n.bookings
                  )
                );
                const width =
                  maxBookings > 0
                    ? (nationality.bookings / maxBookings) * 100
                    : 0;

                return (
                  <div key={nationality.nationality} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {nationality.nationality}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {nationality.bookings} bookings
                        </span>
                        <p className="text-xs text-gray-500">
                          ${nationality.revenue.toLocaleString()} revenue
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No nationality data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;