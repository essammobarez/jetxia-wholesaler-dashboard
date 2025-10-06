'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
  RadialBarChart, RadialBar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Globe, MapPin, Building2, Hotel,
  CheckCircle, Clock, AlertCircle, Target, Activity, Database,
  ArrowUp, ArrowDown, Percent, Hash
} from 'lucide-react';

interface MappingStats {
  total: number;
  mapped: number;
  pending: number;
  review: number;
  rejected: number;
  percentage: number;
}

interface ModuleStats {
  nationality: MappingStats;
  country: MappingStats;
  cities: MappingStats;
  hotels: MappingStats;
  hotelContent: MappingStats;
}

const DashboardTab = () => {
  const [stats, setStats] = useState<ModuleStats>({
    nationality: {
      total: 145,
      mapped: 98,
      pending: 32,
      review: 12,
      rejected: 3,
      percentage: 67.6
    },
    country: {
      total: 195,
      mapped: 189,
      pending: 4,
      review: 2,
      rejected: 0,
      percentage: 96.9
    },
    cities: {
      total: 8456,
      mapped: 6234,
      pending: 1889,
      review: 298,
      rejected: 35,
      percentage: 73.7
    },
    hotels: {
      total: 45678,
      mapped: 32145,
      pending: 9876,
      review: 2987,
      rejected: 670,
      percentage: 70.4
    },
    hotelContent: {
      total: 156789,
      mapped: 134567,
      pending: 15432,
      review: 4890,
      rejected: 1900,
      percentage: 85.8
    }
  });

  // Chart Data
  const overviewData = [
    {
      module: 'Nationality',
      mapped: stats.nationality.mapped,
      pending: stats.nationality.pending,
      review: stats.nationality.review,
      rejected: stats.nationality.rejected,
      total: stats.nationality.total
    },
    {
      module: 'Country',
      mapped: stats.country.mapped,
      pending: stats.country.pending,
      review: stats.country.review,
      rejected: stats.country.rejected,
      total: stats.country.total
    },
    {
      module: 'Cities',
      mapped: stats.cities.mapped,
      pending: stats.cities.pending,
      review: stats.cities.review,
      rejected: stats.cities.rejected,
      total: stats.cities.total
    },
    {
      module: 'Hotels',
      mapped: stats.hotels.mapped,
      pending: stats.hotels.pending,
      review: stats.hotels.review,
      rejected: stats.hotels.rejected,
      total: stats.hotels.total
    },
    {
      module: 'Hotel Content',
      mapped: stats.hotelContent.mapped,
      pending: stats.hotelContent.pending,
      review: stats.hotelContent.review,
      rejected: stats.hotelContent.rejected,
      total: stats.hotelContent.total
    }
  ];

  const pieData = [
    { name: 'Nationality', value: stats.nationality.total, color: '#3B82F6' },
    { name: 'Country', value: stats.country.total, color: '#10B981' },
    { name: 'Cities', value: stats.cities.total, color: '#8B5CF6' },
    { name: 'Hotels', value: stats.hotels.total, color: '#F59E0B' },
    { name: 'Hotel Content', value: stats.hotelContent.total, color: '#EC4899' }
  ];

  const progressData = [
    { name: 'Nationality', progress: stats.nationality.percentage, fill: '#3B82F6' },
    { name: 'Country', progress: stats.country.percentage, fill: '#10B981' },
    { name: 'Cities', progress: stats.cities.percentage, fill: '#8B5CF6' },
    { name: 'Hotels', progress: stats.hotels.percentage, fill: '#F59E0B' },
    { name: 'Hotel Content', progress: stats.hotelContent.percentage, fill: '#EC4899' }
  ];

  const weeklyData = [
    { day: 'Mon', mapped: 245, pending: 89 },
    { day: 'Tue', mapped: 312, pending: 76 },
    { day: 'Wed', mapped: 198, pending: 123 },
    { day: 'Thu', mapped: 389, pending: 67 },
    { day: 'Fri', mapped: 467, pending: 45 },
    { day: 'Sat', mapped: 298, pending: 87 },
    { day: 'Sun', mapped: 156, pending: 98 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    change, 
    changeType 
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    change?: string;
    changeType?: 'up' | 'down';
  }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-800 transition-colors">{title}</p>
          <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'up' ? <ArrowUp className="h-4 w-4 mr-1 animate-bounce" /> : <ArrowDown className="h-4 w-4 mr-1" />}
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full ${color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              📊 Mapping Dashboard
            </h1>
            <p className="text-blue-100 text-lg">
              Real-time insights and analytics for all mapping modules
            </p>
            <div className="mt-4 flex space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-blue-200 text-sm">Live Updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-blue-200 text-sm">Auto Refresh</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-4xl font-bold">
                {(stats.nationality.total + stats.country.total + stats.cities.total + stats.hotels.total).toLocaleString()}
              </div>
              <div className="text-blue-200 text-sm">Total Records</div>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Activity className="h-12 w-12 text-blue-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Nationalities"
          value={stats.nationality.total.toLocaleString()}
          icon={Users}
          color="bg-blue-500"
          change="+12%"
          changeType="up"
        />
        <StatCard
          title="Total Countries"
          value={stats.country.total.toLocaleString()}
          icon={Globe}
          color="bg-green-500"
          change="+5%"
          changeType="up"
        />
        <StatCard
          title="Total Cities"
          value={stats.cities.total.toLocaleString()}
          icon={MapPin}
          color="bg-purple-500"
          change="+18%"
          changeType="up"
        />
        <StatCard
          title="Total Hotels"
          value={stats.hotels.total.toLocaleString()}
          icon={Building2}
          color="bg-orange-500"
          change="+23%"
          changeType="up"
        />
        <StatCard
          title="Hotel Content"
          value={stats.hotelContent.total.toLocaleString()}
          icon={Hotel}
          color="bg-pink-500"
          change="+18%"
          changeType="up"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Overview Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Module Overview</h3>
            <BarChart className="h-6 w-6 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="module" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="mapped" fill="#10B981" name="Mapped" radius={[2, 2, 0, 0]} />
              <Bar dataKey="pending" fill="#F59E0B" name="Pending" radius={[2, 2, 0, 0]} />
              <Bar dataKey="review" fill="#6366F1" name="Review" radius={[2, 2, 0, 0]} />
              <Bar dataKey="rejected" fill="#EF4444" name="Rejected" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Data Distribution</h3>
            <Target className="h-6 w-6 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [value.toLocaleString(), 'Records']}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Radial Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Mapping Progress</h3>
            <Percent className="h-6 w-6 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={progressData}>
              <RadialBar
                label={{ position: 'insideStart', fill: '#fff', fontWeight: 'bold' }}
                background
                dataKey="progress"
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
              <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Weekly Activity</h3>
            <TrendingUp className="h-6 w-6 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area type="monotone" dataKey="mapped" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="pending" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-800">
                {(stats.nationality.mapped + stats.country.mapped + stats.cities.mapped + stats.hotels.mapped).toLocaleString()}
              </p>
              <p className="text-green-600 font-medium">Total Mapped</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-yellow-800">
                {(stats.nationality.pending + stats.country.pending + stats.cities.pending + stats.hotels.pending).toLocaleString()}
              </p>
              <p className="text-yellow-600 font-medium">Total Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-blue-800">
                {(stats.nationality.review + stats.country.review + stats.cities.review + stats.hotels.review).toLocaleString()}
              </p>
              <p className="text-blue-600 font-medium">Under Review</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-red-800">
                {(stats.nationality.rejected + stats.country.rejected + stats.cities.rejected + stats.hotels.rejected).toLocaleString()}
              </p>
              <p className="text-red-600 font-medium">Total Rejected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;