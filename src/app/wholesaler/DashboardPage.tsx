// DashboardPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  UserPlus,
  Activity,
  BarChart3,
  DollarSign,
  Briefcase,
  CheckCircle,
} from 'lucide-react';
import AreaChart from './AreaChart'; // Assuming these components exist
import DonutChart from './DonutChart'; // Assuming these components exist

// --- Data Type Definitions ---
interface DashboardData {
  totalRevenue: number;
  confirmedBookingsCount: number;
  approvedAgenciesCount: number;
  newAgenciesCount: number;
}

interface ReportData {
  totalAmount: number;
  totalPaid: number;
  totalOutstanding: number;
  paymentPercentage: number;
  outstandingCount: number;
  settledCount: number;
}

// --- Main Dashboard Component ---
export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // 1. Get wholesalerId and token from storage
      const wholesalerId = localStorage.getItem('wholesalerId');
      const token =
        document.cookie
          .split('; ')
          .find((r) => r.startsWith('authToken='))
          ?.split('=')[1] || localStorage.getItem('authToken');

      if (!wholesalerId) {
        setError('Wholesaler ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      if (!token) {
        setError('Authorization failed. Please log in again.');
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      try {
        // 2. Fetch both endpoints concurrently
        const [dashboardRes, reportRes] = await Promise.all([
          fetch(`${baseUrl}/dashboard/wholesaler/${wholesalerId}`, { headers }),
          fetch(`${baseUrl}/dashboard/wholesaler/${wholesalerId}/report-overview`, { headers }),
        ]);

        if (!dashboardRes.ok || !reportRes.ok) {
          throw new Error('Failed to fetch dashboard data. Please try again later.');
        }

        const dashboardResult = await dashboardRes.json();
        const reportResult = await reportRes.json();

        // 3. Set state with fetched data
        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data);
        } else {
          throw new Error(dashboardResult.message || 'Failed to fetch dashboard overview.');
        }

        if (reportResult.success) {
          setReportData(reportResult.data);
        } else {
          throw new Error(reportResult.message || 'Failed to fetch report overview.');
        }

      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Loading and Error States ---
  if (loading) {
    return <div className="flex justify-center items-center h-screen">✨ Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">❌ {error}</div>;
  }

  // --- Dynamic Data for UI components ---
  const stats = dashboardData ? [
    {
      label: 'Total Revenue',
      value: `$${dashboardData.totalRevenue?.toFixed(2) ?? '0.00'}`,
      gradient: 'gradient-cyan',
      icon: DollarSign,
      description: 'Total revenue from all bookings',
    },
    {
      label: 'Confirmed Bookings',
      value: `${dashboardData.confirmedBookingsCount ?? 0}`,
      gradient: 'gradient-blue',
      icon: Briefcase,
      description: 'Total number of confirmed bookings',
    },
    {
      label: 'Approved Agencies',
      value: `${dashboardData.approvedAgenciesCount ?? 0}`,
      gradient: 'gradient-purple',
      icon: CheckCircle,
      description: 'Agencies with approved status',
    },
    {
      label: 'New Agencies',
      value: `${dashboardData.newAgenciesCount ?? 0}`,
      gradient: 'gradient-pink',
      icon: UserPlus,
      description: 'Newly registered agencies',
    },
  ] : [];

  // --- Render Component ---
  return (
    <div className="space-y-8 animate-fade-scale">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-gradient">Generate Report</button>
          <button className="btn-modern bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            Export Data
          </button>
        </div>
      </div>

      <hr/>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(({ label, value, gradient, icon: Icon, description }, index) => (
          // FIXED: Changed h-40 to min-h-40 to prevent content from being cut off
          <div key={label} className="card-modern p-6 min-h-40 flex flex-col justify-between relative overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
            <div className={`absolute top-0 right-0 w-24 h-24 ${gradient} opacity-10 rounded-full -mr-8 -mt-8`}></div>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${gradient} bg-opacity-20`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</span>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <hr/>

      {/* Charts Section (Using placeholder components) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card-modern p-6 animate-slide-right">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Performance Analytics</h2>
          <AreaChart />
        </div>
        <div className="card-modern p-6 animate-slide-right" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Distribution Overview</h2>
          <DonutChart />
        </div>
      </div>

      <hr/>

      {/* Bottom Section with Report Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reports Summary Card */}
        <div className="card-modern p-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Reports Overview</h4>
              <p className="text-gray-500 dark:text-gray-400">Quick access to financial reports</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">Total Amount</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${reportData?.totalAmount?.toFixed(2) ?? 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-gray-600 dark:text-gray-300">Total Paid</span>
              </div>
              <span className="font-semibold text-green-600">
                ${reportData?.totalPaid?.toFixed(2) ?? 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-red-600" />
                <span className="text-gray-600 dark:text-gray-300">Total Outstanding</span>
              </div>
              <span className="font-semibold text-red-600">
                ${reportData?.totalOutstanding?.toFixed(2) ?? 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-300">Settled Invoices</span>
              </div>
              <span className="font-semibold text-blue-600">
                {reportData?.settledCount ?? 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <Briefcase className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600 dark:text-gray-300">Outstanding Invoices</span>
              </div>
              <span className="font-semibold text-orange-500">
                {reportData?.outstandingCount ?? 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-gray-600 dark:text-gray-300">Payment Success Rate</span>
              </div>
              <span className="font-semibold text-green-600">
                {reportData?.paymentPercentage ?? 'N/A'}%
              </span>
            </div>
          </div>
          <div className="mt-6">
            <button className="w-full btn-modern bg-blue-600 text-white hover:bg-blue-700">View All Reports</button>
          </div>
        </div>

        {/* Action Items Card (Static as there's no API for it) */}
        <div className="card-modern p-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Action Items</h4>
              <p className="text-gray-500 dark:text-gray-400">Track tasks and pending actions</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Activity className="w-12 h-12 mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No action items to show</p>
            <button className="mt-4 btn-modern bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300">
              Create New Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}