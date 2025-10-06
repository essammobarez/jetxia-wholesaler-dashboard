'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Globe, MapPin, Building2, ArrowRight, Home, BarChart3, Activity, Hotel } from 'lucide-react';
import DashboardTab from './DashboardTab';
import HotelContentTab from './HotelContentTab';

const MappingDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const mappingModules = [
    {
      id: 'nationality',
      title: 'Nationality Mapping',
      description: 'Map and match nationality data from all suppliers with master ID system',
      icon: Users,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      href: '/wholesaler/mapping/nationality',
      stats: {
        total: 0,
        mapped: 0,
        pending: 0
      }
    },
    {
      id: 'country',
      title: 'Country Mapping',
      description: 'Map and match country data from all suppliers with centralized management',
      icon: Globe,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      href: '/wholesaler/mapping/country',
      stats: {
        total: 0,
        mapped: 0,
        pending: 0
      }
    },
    {
      id: 'cities',
      title: 'Cities Mapping',
      description: 'Map and match city data from all suppliers with location-based matching',
      icon: MapPin,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      href: '/wholesaler/mapping/cities',
      stats: {
        total: 0,
        mapped: 0,
        pending: 0
      }
    },
    {
      id: 'hotels',
      title: 'Hotels Mapping',
      description: 'Advanced hotel matching with 95%+ accuracy using name, address, and location',
      icon: Building2,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      href: '/wholesaler/mapping/hotels',
      stats: {
        total: 0,
        mapped: 0,
        pending: 0
      }
    },
    {
      id: 'hotel-content',
      title: 'Hotel Content Mapping',
      description: 'Match room types, amenities, and content across all suppliers for complete hotel data',
      icon: Hotel,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      href: '#',
      stats: {
        total: 4,
        mapped: 2,
        pending: 2
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/wholesaler')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="h-5 w-5 mr-1" />
                Dashboard
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Mapping</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Supplier Data Management System
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mapping Management</h1>
          <p className="mt-2 text-gray-600">
            Centralized mapping system for matching and managing data across all suppliers
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-3 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600 bg-gradient-to-b from-blue-50 to-transparent shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className={`h-5 w-5 ${activeTab === 'dashboard' ? 'text-blue-500' : ''}`} />
                  <span>📊 Analytics Dashboard</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('hotel-content')}
                className={`py-4 px-3 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg ${
                  activeTab === 'hotel-content'
                    ? 'border-purple-500 text-purple-600 bg-gradient-to-b from-purple-50 to-transparent shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Hotel className={`h-5 w-5 ${activeTab === 'hotel-content' ? 'text-purple-500' : ''}`} />
                  <span>🏨 Hotel Content</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('modules')}
                className={`py-4 px-3 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg ${
                  activeTab === 'modules'
                    ? 'border-blue-500 text-blue-600 bg-gradient-to-b from-blue-50 to-transparent shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Activity className={`h-5 w-5 ${activeTab === 'modules' ? 'text-blue-500' : ''}`} />
                  <span>🔗 Mapping Modules</span>
                </div>
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'dashboard' && (
              <DashboardTab />
            )}
            {activeTab === 'hotel-content' && (
              <HotelContentTab />
            )}
            {activeTab === 'modules' && (
              <div className="space-y-6">{/* Move existing content here */}

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {mappingModules.map((module) => (
                  <div key={module.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${module.color}`}>
                        <module.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        {module.stats.total}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-900">{module.title}</p>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                      <span>Mapped: {module.stats.mapped}</span>
                      <span>Pending: {module.stats.pending}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Module Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {mappingModules.map((module) => (
                  <Link key={module.id} href={module.href} className="group">
                    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 hover:border-gray-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg ${module.color} group-hover:${module.hoverColor} transition-colors duration-200`}>
                            <module.icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
                              {module.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-md">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                          <span>Mapping Progress</span>
                          <span>
                            {module.stats.total > 0 
                              ? Math.round((module.stats.mapped / module.stats.total) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${module.color} transition-all duration-300`}
                            style={{
                              width: module.stats.total > 0 
                                ? `${(module.stats.mapped / module.stats.total) * 100}%`
                                : '0%'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Mapping Activity</h2>
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent mapping activity</p>
                    <p className="text-sm mt-1">Start mapping data to see activity here</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappingDashboard;