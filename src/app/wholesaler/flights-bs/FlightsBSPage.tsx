'use client';

import React, { useState } from 'react';
import {
  Plane,
  Hotel,
  Package,
  Users,
  Calendar,
  MapPin,
  Building2,
  Plus,
  Search,
  Filter,
  BarChart3,
  ClipboardList
} from 'lucide-react';

// Modules are now handled at the parent WholesalerDashboard level

// Types
interface FlightsBSStats {
  totalBlockSeats: number;
  activeBlockSeats: number;
  totalHotels: number;
  totalPackages: number;
}

interface FlightsBSPageProps {
  onModuleSelect?: (module: string) => void;
}

const FlightsBSPage = ({ onModuleSelect }: FlightsBSPageProps = {}) => {
  const [activeModule, setActiveModule] = useState<string>('overview');
  const [stats] = useState<FlightsBSStats>({
    totalBlockSeats: 245,
    activeBlockSeats: 89,
    totalHotels: 156,
    totalPackages: 78
  });

  const handleModuleSelect = (moduleId: string) => {
    setActiveModule(moduleId);
    if (onModuleSelect) {
      // Map internal module ids to parent navigation tabs
      const moduleMap: { [key: string]: string } = {
        'block-seats': 'Block Seats',
        'hotels': 'Hotels', 
        'offline-package': 'Offline Package',
        'package-requests': 'Package Requests'
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
      color: 'bg-blue-500'
    },
    {
      id: 'block-seats',
      name: 'Block Seats',
      icon: Plane,
      description: 'Manage flight block seats and inventory',
      color: 'bg-green-500'
    },
    {
      id: 'hotels',
      name: 'Hotels',
      icon: Hotel,
      description: 'Hotel inventory and bookings',
      color: 'bg-purple-500'
    },
    {
      id: 'offline-package',
      name: 'Offline Package',
      icon: Package,
      description: 'Offline travel packages management',
      color: 'bg-orange-500'
    },
    {
      id: 'package-requests',
      name: 'Package Requests',
      icon: ClipboardList,
      description: 'Manage customer package booking requests',
      color: 'bg-pink-500'
    }
  ];

  // Always render overview since modules are handled by parent
  const renderActiveModule = () => {
    return renderOverview();
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-modern p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Block Seats</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.totalBlockSeats}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Across all airlines</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Plane className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card-modern p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Block Seats</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.activeBlockSeats}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Currently available</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card-modern p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hotels</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats.totalHotels}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Partner hotels</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Hotel className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="card-modern p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Packages</h3>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{stats.totalPackages}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Offline packages</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
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
      </div>
    </div>
  );

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
      <div className="min-h-96">
        {renderActiveModule()}
      </div>
    </div>
  );
};

export default FlightsBSPage;