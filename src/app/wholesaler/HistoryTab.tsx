import { NextPage } from 'next';
import Head from 'next/head';
import {
  Search,
  Filter,
  Download,
  Calendar,
  MapPin,
  User,
  Clock,
  Bed,
  Users,
  Globe,
  TrendingUp,
  Activity,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL!

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken") || "";
  }
  return "";
}

// --- TYPES ---
// Updated interface to match the new API response structure
interface RoomInfo {
  id?: number;
  adults: number;
  children: number;
  childrenAges?: number[];
}

interface HistoryRow {
  User: string;
  LoginDate: string;
  Search: string;
  Hotel: string;
  HotelCode: string;
  Room: string[];
  BookingStages: string[];
  Destination?: string;
  CheckInDate?: string;
  CheckOutDate?: string;
  RoomsInfo?: RoomInfo[] | string;
  Citizenship?: string;
  // Fields from code2 for UI enhancement (optional, with defaults)
  id?: string;
  status?: 'completed' | 'pending' | 'cancelled' | 'processing';
  priority?: 'high' | 'medium' | 'low';
  revenue?: number;
  commission?: number;
}

// --- CONSTANTS & HELPERS from code2 ---
const stageConfig = [
  { key: 'LG', label: 'User Login', color: 'bg-lime-600', description: 'User logged in' },
  { key: 'HS', label: 'Hotel Search', color: 'bg-blue-500', description: 'Initial search performed' },
  { key: 'AV', label: 'Availability', color: 'bg-purple-500', description: 'Availability checked' },
  { key: 'PB', label: 'Pre-booking', color: 'bg-orange-500', description: 'Pre-booking initiated' },
  { key: 'OK', label: 'Booked', color: 'bg-green-500', description: 'Successfully booked' },
];

// --- UI COMPONENTS from code2 ---

const StatusBadge = ({ stage, active }: { stage: typeof stageConfig[0]; active: boolean }) => (
  <div className="relative group">
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-300 ${active
        ? `${stage.color} shadow-lg scale-110`
        : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
        }`}
    >
      {stage.key}
    </div>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-max opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
      <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
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

// --- MAIN PAGE COMPONENT ---

const HistoryPage: NextPage = () => {
  // Original state for raw data
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [dailyStats, setDailyStats] = useState({ searchCount: 0, userCount: 0 });

  // State from code2 for UI and filtering
  const [filteredData, setFilteredData] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'user'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  
  // Pagination state
  // const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage] = useState(10);

  // Fetch data from the original API endpoint
  const fetchData = (page: number = 1) => {
    setLoading(true);
    const apiUrl = `${API_URL}HistoryPage?page=${page}`;
    const authToken = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };

    fetch(apiUrl, { headers })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        console.log("history page json", json)
        if (json.success && Array.isArray(json.data.history)) {
          const apiData: HistoryRow[] = json.data.history;
          setHistory(apiData);
          setFilteredData(apiData);
          
          // Set daily statistics from API response
          if (json.data.dailySearchCount !== undefined && json.data.dailyUsersCount !== undefined) {
            setDailyStats({
              searchCount: json.data.dailySearchCount,
              userCount: json.data.dailyUsersCount
            });
          }

          // Set total pages if provided by API
          const apiTotalPages =
            (json.data && (json.data.totalPages || json.data.total_pages || json.data.totalPage)) ||
            json.totalPages || json.total_pages ||
            (json.pagination && (json.pagination.totalPages || json.pagination.total_pages)) ||
            (json.data && json.data.pagination && (json.data.pagination.totalPages || json.data.pagination.total_pages)) ||
            null;
          if (typeof apiTotalPages === 'number') {
            setTotalPages(apiTotalPages);
          }
        }
      })
      .catch(err => console.error('Failed to load history:', err))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  // Filtering and sorting logic from code2, adapted for HistoryRow interface
  useEffect(() => {
    let filtered = history.filter(record => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch =
        record.User.toLowerCase().includes(lowerSearchTerm) ||
        record.Search.toLowerCase().includes(lowerSearchTerm) ||
        record.Hotel.toLowerCase().includes(lowerSearchTerm) ||
        record.Destination?.toLowerCase().includes(lowerSearchTerm) ||
        record.HotelCode.toLowerCase().includes(lowerSearchTerm);

      const matchesUser = selectedUser === 'all' || record.User === selectedUser;

      let matchesDate = true;
      if (dateRange.from && dateRange.to) {
        const recordDate = new Date(record.LoginDate);
        // Add one day to 'to' date to include the whole day in the range
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        toDate.setDate(toDate.getDate() + 1);
        matchesDate = recordDate >= fromDate && recordDate < toDate;
      }

      return matchesSearch && matchesUser && matchesDate;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.LoginDate).getTime() - new Date(b.LoginDate).getTime();
          break;
        case 'user':
          comparison = a.User.localeCompare(b.User);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredData(filtered);
  }, [history, searchTerm, selectedUser, dateRange, sortBy, sortOrder]);

  // Helper functions from code2
  

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const formatRoomsInfo = (roomsInfo: RoomInfo[] | string | undefined): string => {
    if (!roomsInfo) return 'N/A';
    if (Array.isArray(roomsInfo)) {
      return roomsInfo.map((room, idx) => 
        `${room.adults} adults${room.children > 0 ? `, ${room.children} children` : ''}`
      ).join(', ');
    }
    if (typeof roomsInfo === 'string') {
      return roomsInfo.replace(/\|/g, ', ');
    }
    return 'N/A';
  };

  const exportToCSV = () => {
    const headers = ['User', 'Login Date', 'Search Query', 'Hotel', 'Hotel Code', 'Destination', 'Check In', 'Check Out', 'Rooms Info', 'Booking Stages'];
    const csvData = filteredData.map(record => [
      record.User,
      formatDate(record.LoginDate),
      record.Search,
      record.Hotel,
      record.HotelCode,
      record.Destination || '',
      record.CheckInDate ? formatDate(record.CheckInDate) : '',
      record.CheckOutDate ? formatDate(record.CheckOutDate) : '',
      formatRoomsInfo(record.RoomsInfo),
      Array.isArray(record.BookingStages) ? record.BookingStages.join(', ') : ''
    ]);
    const csvContent = [headers, ...csvData].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination calculations
  // const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;
  // const currentData = filteredData.slice(startIndex, endIndex);

  // Calculations for Metric Cards
  const uniqueUsers = Array.from(new Set(history.map(r => r.User)));

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head><title>Booking History</title></Head>
      <main className="flex-1 py-10 px-6 bg-gray-50 dark:bg-gray-900">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking History</h1>
            <p className="text-gray-600 dark:text-gray-400">Track all booking activities, searches, and user interactions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchData(currentPage)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Enhanced Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total Records" value={filteredData.length} icon={Activity} color="bg-blue-500" subtitle="Active booking searches" />
          <MetricCard title="Daily Searches" value={dailyStats.searchCount} icon={Search} color="bg-green-500" subtitle="Searches performed today" />
          <MetricCard title="Daily Users" value={dailyStats.userCount} icon={User} color="bg-purple-500" subtitle="Active users today" />
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Search</h3>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Filter className="w-4 h-4" />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative lg:col-span-2">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search users, hotels, destinations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all" />
            </div>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
              <option value="all">All Users</option>
              {uniqueUsers.map(user => (<option key={user} value={user}>{user}</option>))}
            </select>
            <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [sort, order] = e.target.value.split('-'); setSortBy(sort as any); setSortOrder(order as any); }} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="user-asc">User A-Z</option>
              <option value="user-desc">User Z-A</option>
            </select>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <input type="date" value={dateRange.from} onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <input type="date" value={dateRange.to} onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={() => { setSearchTerm(''); setSelectedUser('all'); setDateRange({ from: '', to: '' }); }} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Clear All Filters
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredData.length} of {history.length} records
            </span>
          </div>
        </div>

        {/* Enhanced Data Cards View */}
        <div className="space-y-4">
          {filteredData.map((record, index) => (
            <div key={record.id || `${record.User}-${record.LoginDate}-${index}`} className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border ${getPriorityColor(record.priority)} border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-4">
                  {/* User Info */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{record.User}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1" />{formatDate(record.LoginDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Search & Hotel Info */}
                  <div className="lg:col-span-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{record.Search}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center"><MapPin className="w-3 h-3 mr-1" />{record.Destination || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{record.Hotel}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Code: {record.HotelCode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="lg:col-span-3">
                    {(record.CheckInDate || record.RoomsInfo) && (
                      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        {record.CheckInDate && record.CheckOutDate && (
                          <div className="flex items-center"><Calendar className="w-3 h-3 mr-2 flex-shrink-0" /><span>{formatDate(record.CheckInDate)} - {formatDate(record.CheckOutDate)}</span></div>
                        )}
                        {record.Room?.length > 0 && (
                          <div className="flex items-center"><Bed className="w-3 h-3 mr-2 flex-shrink-0" /><span>{record.Room.join(', ')}</span></div>
                        )}
                        {record.RoomsInfo && (
                          <div className="flex items-center"><Users className="w-3 h-3 mr-2 flex-shrink-0" /><span>{formatRoomsInfo(record.RoomsInfo)}</span></div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Revenue & Status */}
                  
                </div>
              </div>

              {/* Booking Stages */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress:</span>
                    <div className="flex items-center space-x-3">
                      {stageConfig.map((stage) => {
                        // If HS is available, LG state will be colored by default
                        let isActive = record.BookingStages.includes(stage.key);
                        if (stage.key === 'LG' && record.BookingStages.includes('HS')) {
                          isActive = true;
                        }
                        return <StatusBadge key={stage.key} stage={stage} active={isActive} />;
                      })}
                    </div>
                  </div>
                  {record.Citizenship && (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Globe className="w-3 h-3 mr-1" />
                      <span>{record.Citizenship}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && !loading && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No History Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or clearing the filters.</p>
            <button onClick={() => { setSearchTerm(''); setSelectedUser('all'); setDateRange({ from: '', to: '' }); }} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Clear All Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredData.length > 0 && totalPages && totalPages > 1 && (
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <span className="px-3 py-2 text-sm text-gray-500">...</span>
                )}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default HistoryPage;