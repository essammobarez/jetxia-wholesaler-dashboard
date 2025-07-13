// DashboardPage.tsx
'use client';
import React from 'react';
import { TrendingUp, TrendingDown, Users, Eye, UserPlus, Activity, BarChart3, PieChart, TrendingUpIcon, DollarSign } from 'lucide-react';
import AreaChart from './AreaChart';
import DonutChart from './DonutChart';

interface Stat {
  label: string;
  value: string;
  pct: string;
  gradient: string;
  icon: React.ComponentType<any>;
  description: string;
}

const stats: Stat[] = [
  { 
    label: 'Total Views', 
    value: '7,265', 
    pct: '+11.01%', 
    gradient: 'gradient-blue',
    icon: Eye,
    description: 'Website page views this month'
  },
  { 
    label: 'Active Visits', 
    value: '3,671', 
    pct: '-0.03%', 
    gradient: 'gradient-purple',
    icon: Users,
    description: 'Unique visitors tracking'
  },
  { 
    label: 'New Users', 
    value: '156', 
    pct: '+15.03%', 
    gradient: 'gradient-pink',
    icon: UserPlus,
    description: 'First-time user registrations'
  },
  { 
    label: 'Active Users', 
    value: '2,318', 
    pct: '+6.08%', 
    gradient: 'gradient-cyan',
    icon: Activity,
    description: 'Currently engaged users'
  },
];

const quickStats = [
  { label: 'Revenue', value: '$52,420', change: '+12.5%', icon: DollarSign, color: 'text-green-600' },
  { label: 'Bookings', value: '1,247', change: '+8.2%', icon: BarChart3, color: 'text-blue-600' },
  { label: 'Conversion', value: '3.2%', change: '+0.8%', icon: TrendingUpIcon, color: 'text-purple-600' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-scale">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-gradient">
            Generate Report
          </button>
          <button className="btn-modern bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            Export Data
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {quickStats.map(({ label, value, change, icon: Icon, color }, index) => (
          <div 
            key={label} 
            className="card-modern p-4 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
              <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">{change}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(({ label, value, pct, gradient, icon: Icon, description }, index) => {
          const isUp = pct.startsWith('+');
          return (
            <div 
              key={label} 
              className="card-modern p-6 h-40 flex flex-col justify-between relative overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Background gradient overlay */}
              <div className={`absolute top-0 right-0 w-24 h-24 ${gradient} opacity-10 rounded-full -mr-8 -mt-8`}></div>
              
              {/* Icon */}
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${gradient} bg-opacity-20`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  isUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{pct}</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</span>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card-modern p-6 animate-slide-right">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Analytics</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-lg">7D</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg">30D</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg">90D</button>
            </div>
          </div>
        <AreaChart />
        </div>
        
        <div className="card-modern p-6 animate-slide-right" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Distribution Overview</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View Details</button>
          </div>
        <DonutChart />
        </div>
      </div>

      {/* Bottom Section - Enhanced Cards */}
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
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-300">Outstanding</span>
              </div>
              <span className="font-semibold text-red-600">$3,200</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-gray-600 dark:text-gray-300">Payments</span>
              </div>
              <span className="font-semibold text-green-600">92% Success</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <TrendingUpIcon className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600 dark:text-gray-300">Analytics</span>
              </div>
              <span className="font-semibold text-purple-600">+12.5% Growth</span>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="w-full btn-modern bg-blue-600 text-white hover:bg-blue-700">
              View All Reports
            </button>
          </div>
        </div>

        {/* Action Items Card */}
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
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <span className="text-gray-600 dark:text-gray-300">Completed Today</span>
              <span className="font-semibold text-green-600 dark:text-green-400">8</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <span className="text-gray-600 dark:text-gray-300">Pending Actions</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">5</span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Activity className="w-12 h-12 mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">All action items are up to date</p>
            <button className="mt-4 btn-modern bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300">
              Create New Task
            </button>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.8s' }}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Indicators</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: 'Server Uptime', value: '99.9%', status: 'excellent' },
            { label: 'Response Time', value: '1.2s', status: 'good' },
            { label: 'Error Rate', value: '0.1%', status: 'excellent' },
            { label: 'Load Average', value: '45%', status: 'good' },
          ].map(({ label, value, status }, index) => (
            <div key={label} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className={`inline-flex w-3 h-3 rounded-full mb-2 ${
                status === 'excellent' ? 'bg-green-500' : 
                status === 'good' ? 'bg-blue-500' : 'bg-yellow-500'
              }`}></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
