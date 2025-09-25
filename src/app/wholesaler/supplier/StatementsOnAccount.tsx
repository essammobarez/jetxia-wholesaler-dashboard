'use-client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Building2, Download, Eye, FileText, Search } from 'lucide-react';

// --- INTERFACES ---
interface StatementBooking {
  _id: string;
  date: string;
  bookingId: string;
  supplier: string;
  agency: string;
  wholesaler: string;
  serviceDate: string;
  netRate: {
    value: number;
    currency: string;
  };
  status: 'confirmed' | 'cancelled';
  roomId: string;
  reservationId:string;
}

interface Supplier {
  _id: string;
  name: string;
}

// --- HELPER FUNCTIONS ---
const getWholesalerId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('wholesalerId');
  }
  return null;
};

const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
};

// --- COMPONENT ---
const StatementsOnAccount = () => {
  // --- STATE MANAGEMENT ---
  const [bookings, setBookings] = useState<StatementBooking[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and UI state
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStatement, setSelectedStatement] = useState<StatementBooking | null>(null);

  // --- DATA FETCHING ---
  // This effect now re-runs whenever the start or end date changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const wholesalerId = getWholesalerId();
      const token = getAuthToken();

      if (!token) {
        toast.error("Auth token missing. Please login again.");
        setError("Authentication token is not available.");
        setLoading(false);
        return;
      }
      if (!wholesalerId) {
        toast.error("Wholesaler ID missing.");
        setError("Wholesaler ID could not be found.");
        setLoading(false);
        return;
      }

      try {
        // Build the URL for the statements API, adding date params if they exist
        const statementUrl = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/wholesaler/${wholesalerId}/supplier-statement`);
        if (startDate) {
          statementUrl.searchParams.append('startDate', startDate);
        }
        if (endDate) {
          statementUrl.searchParams.append('endDate', endDate);
        }

        // Fetch suppliers and statements concurrently
        const [suppliersResponse, statementsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/provider`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(statementUrl.toString(), {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
        ]);

        if (suppliersResponse.ok) {
            const suppliersData = await suppliersResponse.json();
            setSuppliers(suppliersData?.data || suppliersData || []);
        } else {
            console.error("Failed to fetch suppliers");
        }
        
        if (!statementsResponse.ok) {
          throw new Error(`HTTP error! Status: ${statementsResponse.status}`);
        }
        
        const statementsData = await statementsResponse.json();
        if (statementsData.success) {
          setBookings(statementsData.data || []);
        } else {
          throw new Error(statementsData.message || 'Failed to retrieve statement data.');
        }

      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching data.');
        setBookings([]);
        // Keep suppliers list even if statement fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]); // Dependency array ensures re-fetch on date change

  // --- DATA PROCESSING & FILTERING ---
  const filteredBookings = useMemo(() => {
    const selectedSupplierName = selectedSupplier === 'all' 
        ? null 
        : suppliers.find(s => s._id === selectedSupplier)?.name;

    return bookings.filter(booking => {
      // Supplier filter
      if (selectedSupplierName && booking.supplier !== selectedSupplierName) {
        return false;
      }
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
            !booking.bookingId?.toLowerCase().includes(searchLower) &&
            !booking.agency?.toLowerCase().includes(searchLower) &&
            !booking.supplier?.toLowerCase().includes(searchLower)
        ) return false;
      }
      // Status filter
      if (statusFilter === 'vouched' && booking.status !== 'confirmed') {
        return false;
      }
      if (statusFilter === 'cancelled' && booking.status !== 'cancelled') {
        return false;
      }
      // Date filtering is now handled by the API, so it's removed from here
      return true;
    });
  }, [bookings, selectedSupplier, suppliers, searchTerm, statusFilter]);

  const statementSummary = useMemo(() => {
    return filteredBookings.reduce((acc, booking) => {
        const { value, currency } = booking.netRate;

        if (booking.status === 'cancelled') {
            acc.totalCancelled += value;
            acc.cancelledCount += 1;
        } else if (booking.status === 'confirmed') {
            acc.totalVouched += value;
            acc.vouchedCount += 1;
        }
        acc.currency = currency;
        return acc;
    }, {
        totalVouched: 0,
        totalCancelled: 0,
        vouchedCount: 0,
        cancelledCount: 0,
        currency: 'USD'
    });
  }, [filteredBookings]);

  // --- RENDER LOGIC ---
  if (loading) {
    return (
      <div className="card-modern p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading supplier statements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-modern p-6 text-center bg-red-50 dark:bg-red-900/20">
        <h3 className="font-semibold text-red-700 dark:text-red-400">Error Loading Statements</h3>
        <p className="mt-2 text-red-600 dark:text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="card-modern animate-fade-scale overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-orange-600" />
              Supplier Statements of Account
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Net rates from vouched and cancelled booking confirmations
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Statement
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Supplier Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Supplier
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Statuses</option>
              <option value="vouched">Vouched Only</option>
              <option value="cancelled">Cancelled (Was Vouched)</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by booking ID, agency, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Vouched Bookings</h3>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{statementSummary.vouchedCount}</p>
            <p className="text-sm text-green-600 dark:text-green-400">
              {statementSummary.currency} {statementSummary.totalVouched.toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Cancelled (Was Vouched)</h3>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{statementSummary.cancelledCount}</p>
            <p className="text-sm text-red-600 dark:text-red-400">
              -{statementSummary.currency} {statementSummary.totalCancelled.toFixed(2)}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400">Net Balance</h3>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {statementSummary.currency} {(statementSummary.totalVouched - statementSummary.totalCancelled).toFixed(2)}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Entries</h3>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{filteredBookings.length}</p>
          </div>
        </div>
      </div>

      {/* Statement Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-600 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Booking ID</th>
              <th className="px-6 py-3">Supplier</th>
              <th className="px-6 py-3">Agency</th>
              <th className="px-6 py-3">Service Date</th>
              <th className="px-6 py-3 text-right">Net Rate</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                const isCancelled = booking.status === 'cancelled';
                return (
                  <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
                      {booking.bookingId}
                    </td>
                    <td className="px-6 py-4">{booking.supplier}</td>
                    <td className="px-6 py-4">{booking.agency}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(booking.serviceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold">
                      <span className={isCancelled ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}>
                        {isCancelled && '-'}{booking.netRate.currency} {booking.netRate.value.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isCancelled
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      }`}>
                        {isCancelled ? 'Cancelled (Was Vouched)' : 'Vouched'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedStatement(booking)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-500 dark:text-gray-400">
                  No statement entries found for the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Statement Detail Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Booking Statement Details
                </h3>
                <button
                  onClick={() => setSelectedStatement(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Booking ID</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedStatement.bookingId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Rate</label>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {selectedStatement.netRate.currency} {selectedStatement.netRate.value.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</label>
                  <p className="text-gray-900 dark:text-white">{selectedStatement.supplier}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Agency</label>
                  <p className="text-gray-900 dark:text-white">{selectedStatement.agency}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Service Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedStatement.serviceDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className={`font-semibold ${
                    selectedStatement.status === 'cancelled' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {selectedStatement.status === 'cancelled' ? 'Cancelled (Was Vouched)' : 'Vouched'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatementsOnAccount;