'use client';

import React, { useState, useEffect } from 'react';
import {
  Plane,
  Hotel,
  Package,
  Calendar,
  MapPin,
  Building2,
  Plus,
  Search,
  Filter,
  BarChart3,
  ClipboardList,
  Loader2, // Added for loading spinner
  AlertTriangle, // Added for error icon
  // --- START: Added Icons for new cards ---
  DollarSign,
  BookOpen,
  Clock,
  BedDouble,
  Armchair,
  PackageCheck,
  // --- END: Added Icons for new cards ---
} from 'lucide-react';

// Modules are now handled at the parent WholesalerDashboard level

// --- START: API Data Types ---
// Types based on the API response
interface FlightBlocksStats {
  total: number;
  active: number;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
}

interface HotelBlocksStats {
  total: number;
  active: number;
  totalRooms: number;
  availableRooms: number;
  soldRooms: number;
}

interface PackagesStats {
  total: number;
  active: number;
  draft: number;
  expired: number;
}

interface BookingsStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  totalRevenue: number;
}

// Main data structure from the API response's 'data' key
interface DashboardData {
  flightBlocks: FlightBlocksStats;
  hotelBlocks: HotelBlocksStats;
  packages: PackagesStats;
  bookings: BookingsStats;
}
// --- END: API Data Types ---

interface FlightsBSPageProps {
  onModuleSelect?: (module: string) => void;
}

// --- START: Token Fetch Helper ---
const getAuthToken = () => {
  const cookieToken = document.cookie
    .split('; ')
    .find((r) => r.startsWith('authToken='))
    ?.split('=')[1];

  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to localStorage if not in cookie
  return localStorage.getItem('authToken');
};
// --- END: Token Fetch Helper ---

const FlightsBSPage = ({ onModuleSelect }: FlightsBSPageProps = {}) => {
  const [activeModule, setActiveModule] = useState<string>('overview');

  // --- START: API State Management ---
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!baseUrl) {
          throw new Error('Backend URL is not configured.');
        }

        const response = await fetch(`${baseUrl}/packages/dashboard`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to fetch dashboard data.');
        }

        setStats(result.data);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array to run once on mount
  // --- END: API State Management ---

  const handleModuleSelect = (moduleId: string) => {
    setActiveModule(moduleId);
    if (onModuleSelect) {
      // Map internal module ids to parent navigation tabs
      const moduleMap: { [key: string]: string } = {
        'block-seats': 'Block Seats',
        'hotels': 'Hotels',
        'offline-package': 'Offline Package',
        'package-requests': 'Package Requests',
      };
      onModuleSelect(moduleMap[moduleId] || moduleId);
    }
  };

  // Module navigation items
  const moduleItems = [
    {
      id: 'overview',
      name: 'Overview',
      icon: BarChart3,
      description: 'Dashboard overview and statistics',
      color: 'bg-blue-500',
    },
    {
      id: 'block-seats',
      name: 'Block Seats',
      icon: Plane,
      description: 'Manage flight block seats and inventory',
      color: 'bg-green-500',
    },
    {
      id: 'hotels',
      name: 'Hotels',
      icon: Hotel,
      description: 'Hotel inventory and bookings',
      color: 'bg-purple-500',
    },
    {
      id: 'offline-package',
      name: 'Offline Package',
      icon: Package,
      description: 'Offline travel packages management',
      color: 'bg-orange-500',
    },
    {
      id: 'package-requests',
      name: 'Package Requests',
      icon: ClipboardList,
      description: 'Manage customer package booking requests',
      color: 'bg-pink-500',
    },
  ];

  // Always render overview since modules are handled by parent
  const renderActiveModule = () => {
    return renderOverview();
  };

  const renderOverview = () => {
    // --- START: Loading and Error Handling ---
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Loading Dashboard...
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="card-modern p-6 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                Error Loading Data
              </h3>
              <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    if (!stats) {
      return (
        <div className="flex justify-center items-center h-96">
          <p className="text-gray-600 dark:text-gray-400">
            No dashboard data available.
          </p>
        </div>
      );
    }
    // --- END: Loading and Error Handling ---

    return (
      <div className="space-y-8">
        {/* --- START: Advanced At-a-Glance Summary (with visible icons) --- */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            At-a-Glance Summary
          </h3>
          {/* Row 1: Flight Blocks */}
          <div className="relative p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-blue-500 dark:border-blue-700 overflow-hidden">
            <Plane className="absolute top-4 right-4 w-8 h-8 text-blue-400 dark:text-blue-500 opacity-70" />
            <p className="font-medium text-gray-900 dark:text-white relative z-10">
              <strong className="text-blue-700 dark:text-blue-300">Flight Blocks:</strong> Total: {stats.flightBlocks.total} | Active: {stats.flightBlocks.active} | Total Seats: {stats.flightBlocks.totalSeats} | Booked: {stats.flightBlocks.bookedSeats} | Available: <span className="text-green-600 dark:text-green-400 font-bold">{stats.flightBlocks.availableSeats}</span>
            </p>
          </div>
          {/* Row 2: Hotel Blocks */}
          <div className="relative p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-purple-500 dark:border-purple-700 overflow-hidden">
            <Hotel className="absolute top-4 right-4 w-8 h-8 text-purple-400 dark:text-purple-500 opacity-70" />
            <p className="font-medium text-gray-900 dark:text-white relative z-10">
              <strong className="text-purple-700 dark:text-purple-300">Hotel Blocks:</strong> Total: {stats.hotelBlocks.total} | Active: {stats.hotelBlocks.active} | Total Rooms: {stats.hotelBlocks.totalRooms} | Sold: {stats.hotelBlocks.soldRooms} | Available: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{stats.hotelBlocks.availableRooms}</span>
            </p>
          </div>
          {/* Row 3: Packages */}
          <div className="relative p-5 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-orange-500 dark:border-orange-700 overflow-hidden">
            <Package className="absolute top-4 right-4 w-8 h-8 text-orange-400 dark:text-orange-500 opacity-70" />
            <p className="font-medium text-gray-900 dark:text-white relative z-10">
              <strong className="text-orange-700 dark:text-orange-300">Packages:</strong> Total: {stats.packages.total} | Active: <span className="text-orange-600 dark:text-orange-400 font-bold">{stats.packages.active}</span> | Draft: {stats.packages.draft} | Expired: {stats.packages.expired}
            </p>
          </div>
          {/* Row 4: Bookings */}
          <div className="relative p-5 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-rose-500 dark:border-rose-700 overflow-hidden">
            <BookOpen className="absolute top-4 right-4 w-8 h-8 text-rose-400 dark:text-rose-500 opacity-70" />
            <p className="font-medium text-gray-900 dark:text-white relative z-10">
              <strong className="text-rose-700 dark:text-rose-300">Bookings:</strong> Total: {stats.bookings.total} | Pending: <span className="text-yellow-600 dark:text-yellow-400 font-bold">{stats.bookings.pending}</span> | Confirmed: {stats.bookings.confirmed} | Cancelled: {stats.bookings.cancelled} | Completed: {stats.bookings.completed} | Revenue: <span className="text-emerald-600 dark:text-emerald-400 font-bold">${stats.bookings.totalRevenue.toLocaleString()}</span>
            </p>
          </div>
        </div>
        {/* --- END: Advanced At-a-Glance Summary --- */}

        {/* --- MODIFIED: Stats Cards Grid (Now 8 cards) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Flight Blocks (Updated) */}
          <div className="card-modern p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Flight Blocks</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {stats.flightBlocks.total}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Across all airlines</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Plane className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Card 2: Available Seats (Updated) */}
          <div className="card-modern p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Seats</h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {stats.flightBlocks.availableSeats}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Across all active blocks</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Armchair className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Card 3: Total Hotel Blocks (Updated) */}
          <div className="card-modern p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Hotel Blocks</h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {stats.hotelBlocks.total}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Partner hotels</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Hotel className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Card 4: Available Rooms (Updated) */}
          <div className="card-modern p-6 border-l-4 border-cyan-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Rooms</h3>
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mt-2">
                  {stats.hotelBlocks.availableRooms}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Across all hotels</p>
              </div>
              <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <BedDouble className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </div>

          {/* --- START: New Card Row --- */}

          {/* Card 5: Total Revenue (NEW) */}
          <div className="card-modern p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Revenue</h3>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  ${stats.bookings.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">From all bookings</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Card 6: Total Bookings (NEW) */}
          <div className="card-modern p-6 border-l-4 border-rose-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Bookings</h3>
                <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-2">
                  {stats.bookings.total}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All booking statuses</p>
              </div>
              <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
          </div>

          {/* Card 7: Pending Bookings (NEW) */}
          <div className="card-modern p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Bookings</h3>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                  {stats.bookings.pending}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Awaiting confirmation</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Card 8: Active Packages (NEW) */}
          <div className="card-modern p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Packages</h3>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                  {stats.packages.active}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stats.packages.draft} drafts
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <PackageCheck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
          {/* --- END: New Card Row --- */}
        </div>

        {/* Recent Activity (Still static as per original code)
        <div className="card-modern p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                <Plane className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">New block seats added for Egyptair</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">CAI → DXB • 25 seats • Economy Class</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</span>
            </div>

            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                <Hotel className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Hotel inventory updated</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Four Seasons Cairo • 15 rooms added</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">4 hours ago</span>
            </div>

            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
                <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">New offline package created</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cairo + Hurghada 5 days package</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">1 day ago</span>
            </div>
          </div>
        </div> */}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-scale">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">✈️ Flights BS</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Flight Block Seats, Hotels & Offline Package Management System
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="btn-modern bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <Search className="w-4 h-4 mr-2" />
            Search
          </button>
          <button className="btn-modern bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Module Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {moduleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleModuleSelect(item.id)}
              className={`p-4 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'card-modern hover:shadow-lg hover:transform hover:scale-105'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : item.color}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white'}`} />
                </div>
                <h3 className={`font-semibold ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {item.name}
                </h3>
              </div>
              <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Module Content */}
      <div className="min-h-96">{renderActiveModule()}</div>
    </div>
  );
};

export default FlightsBSPage;