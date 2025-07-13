'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  MapPin,
  User,
  Clock,
  Building,
  Eye,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Bed,
  Users,
  Globe,
  TrendingUp,
  BarChart3,
  Activity,
  RefreshCw
} from 'lucide-react';

// Enhanced types with better structure
interface HistoryRecord {
  id: string;
  user: string;
  loginDate: string;
  searchQuery: string;
  hotel: string;
  hotelCode: string;
  rooms: string[];
  bookingStages: string[];
  destination?: string;
  checkInDate?: string;
  checkOutDate?: string;
  roomsInfo?: string;
  citizenship?: string;
  searchTime?: string;
  status: 'completed' | 'pending' | 'cancelled' | 'processing';
  priority: 'high' | 'medium' | 'low';
  revenue?: number;
  commission?: number;
}

const stageConfig = [
  { key: 'HS', label: 'Hotel Search', color: 'bg-blue-500', description: 'Initial search performed' },
  { key: 'AV', label: 'Availability', color: 'bg-purple-500', description: 'Availability checked' },
  { key: 'PB', label: 'Pre-booking', color: 'bg-orange-500', description: 'Pre-booking initiated' },
  { key: 'OK', label: 'Booked', color: 'bg-green-500', description: 'Successfully booked' },
];

const StatusBadge = ({ stage, active }: { stage: typeof stageConfig[0]; active: boolean }) => (
  <div className="relative group">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-300 ${
        active 
          ? `${stage.color} shadow-lg scale-110` 
          : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
      }`}
    >
      {stage.key}
    </div>
    
    {/* Tooltip */}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
        <div className="font-medium">{stage.label}</div>
        <div className="text-gray-300">{stage.description}</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
      </div>
    </div>
  </div>
);

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color,
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  change?: string;
  icon: React.ComponentType<any>; 
  color: string;
  subtitle?: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
        {change && (
          <div className="flex items-center mt-2">
            <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
            <span className="text-xs text-green-600 font-medium">{change}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const HistoryTabElite: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [filteredData, setFilteredData] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'user' | 'revenue'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock data with enhanced structure
  useEffect(() => {
    const mockData: HistoryRecord[] = [
      {
        id: '1',
        user: 'Ahmed Hassan',
        loginDate: '2024-01-15T10:30:00Z',
        searchQuery: 'Dubai Hotels',
        hotel: 'Burj Al Arab',
        hotelCode: 'BAA001',
        rooms: ['Deluxe Suite', 'Presidential Suite'],
        bookingStages: ['HS', 'AV', 'PB', 'OK'],
        destination: 'Dubai, UAE',
        checkInDate: '2024-02-01T15:00:00Z',
        checkOutDate: '2024-02-05T11:00:00Z',
        roomsInfo: '2 Adults, 1 Child | Executive Floor',
        citizenship: 'UAE',
        searchTime: '14:30:25',
        status: 'completed',
        priority: 'high',
        revenue: 2450,
        commission: 245
      },
      {
        id: '2',
        user: 'Sarah Wilson',
        loginDate: '2024-01-14T09:15:00Z',
        searchQuery: 'Paris City Center',
        hotel: 'Le Meurice',
        hotelCode: 'LM001',
        rooms: ['Classic Room'],
        bookingStages: ['HS', 'AV', 'PB'],
        destination: 'Paris, France',
        checkInDate: '2024-01-20T15:00:00Z',
        checkOutDate: '2024-01-23T11:00:00Z',
        roomsInfo: '2 Adults | Standard',
        citizenship: 'France',
        searchTime: '09:45:12',
        status: 'pending',
        priority: 'medium',
        revenue: 890,
        commission: 89
      },
      {
        id: '3',
        user: 'Mohammad Ali',
        loginDate: '2024-01-13T16:45:00Z',
        searchQuery: 'New York Business Hotels',
        hotel: 'The Plaza',
        hotelCode: 'PLZ001',
        rooms: ['Business Suite'],
        bookingStages: ['HS', 'AV'],
        destination: 'New York, USA',
        checkInDate: '2024-01-25T15:00:00Z',
        checkOutDate: '2024-01-28T11:00:00Z',
        roomsInfo: '1 Adult | Business Floor',
        citizenship: 'USA',
        searchTime: '16:50:33',
        status: 'processing',
        priority: 'high',
        revenue: 1200,
        commission: 120
      },
      {
        id: '4',
        user: 'Lisa Chen',
        loginDate: '2024-01-12T11:20:00Z',
        searchQuery: 'Tokyo Luxury Hotels',
        hotel: 'Park Hyatt Tokyo',
        hotelCode: 'PHT001',
        rooms: ['Park Suite'],
        bookingStages: ['HS'],
        destination: 'Tokyo, Japan',
        checkInDate: '2024-02-10T15:00:00Z',
        checkOutDate: '2024-02-15T11:00:00Z',
        roomsInfo: '2 Adults | Luxury Floor',
        citizenship: 'Japan',
        searchTime: '11:25:45',
        status: 'cancelled',
        priority: 'low',
        revenue: 0,
        commission: 0
      }
    ];

    setHistoryData(mockData);
    setFilteredData(mockData);
    setLoading(false);
  }, []);

  // Enhanced filtering logic
  useEffect(() => {
    let filtered = historyData.filter(record => {
      const matchesSearch = 
        record.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.searchQuery.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.hotel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.destination?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUser = selectedUser === 'all' || record.user === selectedUser;
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;

      let matchesDate = true;
      if (dateRange.from && dateRange.to) {
        const recordDate = new Date(record.loginDate);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        matchesDate = recordDate >= fromDate && recordDate <= toDate;
      }

      return matchesSearch && matchesUser && matchesStatus && matchesDate;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.loginDate).getTime() - new Date(b.loginDate).getTime();
          break;
        case 'user':
          comparison = a.user.localeCompare(b.user);
          break;
        case 'revenue':
          comparison = (a.revenue || 0) - (b.revenue || 0);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredData(filtered);
  }, [historyData, searchTerm, selectedUser, selectedStatus, dateRange, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const exportToCSV = () => {
    const headers = [
      'User', 'Login Date', 'Search Query', 'Hotel', 'Destination', 
      'Check In', 'Check Out', 'Status', 'Revenue', 'Commission'
    ];

    const csvData = filteredData.map(record => [
      record.user,
      formatDate(record.loginDate),
      record.searchQuery,
      record.hotel,
      record.destination || '',
      record.checkInDate ? formatDate(record.checkInDate) : '',
      record.checkOutDate ? formatDate(record.checkOutDate) : '',
      record.status,
      record.revenue || 0,
      record.commission || 0
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const uniqueUsers = Array.from(new Set(historyData.map(r => r.user)));
  const totalRevenue = filteredData.reduce((sum, r) => sum + (r.revenue || 0), 0);
  const totalCommission = filteredData.reduce((sum, r) => sum + (r.commission || 0), 0);
  const completedBookings = filteredData.filter(r => r.status === 'completed').length;

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

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking History</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track all booking activities, searches, and user interactions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLoading(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Records"
          value={filteredData.length}
          change="+12% this week"
          icon={Activity}
          color="bg-blue-500"
          subtitle="Active booking searches"
        />
        <MetricCard
          title="Completed Bookings"
          value={completedBookings}
          change="+8% completion rate"
          icon={CheckCircle}
          color="bg-green-500"
          subtitle="Successfully processed"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change="+15% this month"
          icon={BarChart3}
          color="bg-purple-500"
          subtitle="Generated revenue"
        />
        <MetricCard
          title="Commission Earned"
          value={`$${totalCommission.toLocaleString()}`}
          change="+10% this month"
          icon={TrendingUp}
          color="bg-orange-500"
          subtitle="Commission from bookings"
        />
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Search</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, hotels, destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            />
          </div>

          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort as any);
              setSortOrder(order as any);
            }}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="date-desc">Latest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="user-asc">User A-Z</option>
            <option value="user-desc">User Z-A</option>
            <option value="revenue-desc">Highest Revenue</option>
            <option value="revenue-asc">Lowest Revenue</option>
          </select>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedUser('all');
              setSelectedStatus('all');
              setDateRange({ from: '', to: '' });
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Clear All Filters
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredData.length} of {historyData.length} records
          </span>
        </div>
      </div>

      {/* Enhanced Data Cards View */}
      <div className="space-y-4">
        {filteredData.map((record) => (
          <div
            key={record.id}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 ${getPriorityColor(record.priority)} border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* User Info */}
                <div className="lg:col-span-3">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{record.user}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(record.loginDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search & Hotel Info */}
                <div className="lg:col-span-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{record.searchQuery}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {record.destination}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{record.hotel}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Code: {record.hotelCode}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="lg:col-span-3">
                  {record.checkInDate && record.checkOutDate && (
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatDate(record.checkInDate)} - {formatDate(record.checkOutDate)}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <Bed className="w-3 h-3 mr-1" />
                        <span>{record.rooms.join(', ')}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{record.roomsInfo}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Revenue & Status */}
                <div className="lg:col-span-2">
                  <div className="space-y-2">
                    {record.revenue ? (
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          ${record.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Commission: ${record.commission?.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No revenue</p>
                    )}
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {record.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {record.status === 'cancelled' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Booking Stages */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Booking Progress:</span>
                  <div className="flex items-center space-x-2">
                    {stageConfig.map((stage) => (
                      <StatusBadge
                        key={stage.key}
                        stage={stage}
                        active={record.bookingStages.includes(stage.key)}
                      />
                    ))}
                  </div>
                </div>
                
                {record.citizenship && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Globe className="w-3 h-3 mr-1" />
                    <span>{record.citizenship}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No booking history found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Try adjusting your search criteria or filters to find what you're looking for.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedUser('all');
              setSelectedStatus('all');
              setDateRange({ from: '', to: '' });
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryTabElite; 