'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Download, Filter, Search, Building2, Eye, FileText } from 'lucide-react';

interface SupplierBooking {
  _id: string;
  bookingId: string;
  agency: {
    agencyName: string;
    _id: string;
  };
  supplier: {
    name: string;
    _id: string;
  };
  status: string;
  serviceDates: {
    startDate: string;
    endDate: string;
  };
  priceDetails: {
    originalPrice: {
      value: number;
      currency: string;
    };
    price: {
      value: number;
      currency: string;
    };
    markupApplied?: {
      type: string;
      value: number;
    };
  };
  rooms?: Array<{
    cancellationPolicy?: {
      policies?: Array<{
        charge?: {
          components?: {
            net?: {
              value: number;
              currency: string;
            };
          };
        };
      }>;
    };
  }>;
  bookingDate: string;
  vouchedDate?: string;
  cancelledDate?: string;
  wasVouched: boolean; // Track if booking was ever vouched
}

interface Supplier {
  _id: string;
  name: string;
}

const StatementsOnAccount = () => {
  const [bookings, setBookings] = useState<SupplierBooking[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Date filtering
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, vouched, cancelled
  
  // Statement view
  const [selectedStatement, setSelectedStatement] = useState<SupplierBooking | null>(null);

  // Get wholesaler ID on mount
  useEffect(() => {
    const storedId = localStorage.getItem('wholesalerId');
    setWholesalerId(storedId);
  }, []);

  // Fetch suppliers and bookings
  useEffect(() => {
    if (!wholesalerId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch suppliers
        const suppliersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/offline-provider/by-wholesaler/${wholesalerId}`
        );
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData || []);

        // Fetch all bookings
        const bookingsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/wholesaler/${wholesalerId}`
        );
        
        if (!bookingsResponse.ok) {
          throw new Error(`HTTP error! Status: ${bookingsResponse.status}`);
        }
        
        const bookingsData = await bookingsResponse.json();
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [bookingsData];
        
        // Filter only vouched bookings (confirmed/ok) and vouched-then-cancelled
        const vouchedBookings = bookingsArray.filter((booking: any) => {
          const status = booking.status?.toLowerCase();
          
          // Include confirmed/ok bookings (currently vouched)
          if (status === 'confirmed' || status === 'ok') {
            return true;
          }
          
          // Include cancelled bookings that were previously vouched
          if (status === 'cancelled' && booking.wasVouched) {
            return true;
          }
          
          return false;
        }).map((booking: any) => ({
          ...booking,
          wasVouched: booking.status?.toLowerCase() === 'confirmed' || 
                     booking.status?.toLowerCase() === 'ok' || 
                     booking.wasVouched || false
        }));
        
        setBookings(vouchedBookings);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
        setBookings([]);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [wholesalerId]);

  // Filter bookings based on selected criteria
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Supplier filter
      if (selectedSupplier !== 'all' && booking.supplier?._id !== selectedSupplier) {
        return false;
      }

      // Date range filter
      if (startDate && new Date(booking.serviceDates?.startDate) < new Date(startDate)) {
        return false;
      }
      if (endDate && new Date(booking.serviceDates?.startDate) > new Date(endDate)) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches = 
          booking.bookingId?.toLowerCase().includes(searchLower) ||
          booking.agency?.agencyName?.toLowerCase().includes(searchLower) ||
          booking.supplier?.name?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      // Status filter
      if (statusFilter === 'vouched' && 
          !['confirmed', 'ok'].includes(booking.status?.toLowerCase())) {
        return false;
      }
      if (statusFilter === 'cancelled' && booking.status?.toLowerCase() !== 'cancelled') {
        return false;
      }

      return true;
    });
  }, [bookings, selectedSupplier, startDate, endDate, searchTerm, statusFilter]);

  // Calculate statement summary
  const statementSummary = useMemo(() => {
    return filteredBookings.reduce((acc, booking) => {
      // Get net rate from booking confirmation
      const netRate = booking.priceDetails?.originalPrice?.value || 
                     booking.rooms?.[0]?.cancellationPolicy?.policies?.[0]?.charge?.components?.net?.value || 
                     0;
      
      const currency = booking.priceDetails?.originalPrice?.currency || 
                      booking.rooms?.[0]?.cancellationPolicy?.policies?.[0]?.charge?.components?.net?.currency || 
                      'USD';

      if (booking.status?.toLowerCase() === 'cancelled') {
        acc.totalCancelled += netRate;
        acc.cancelledCount += 1;
      } else {
        acc.totalVouched += netRate;
        acc.vouchedCount += 1;
      }
      
      acc.totalNet += netRate;
      acc.currency = currency;
      
      return acc;
    }, {
      totalNet: 0,
      totalVouched: 0,
      totalCancelled: 0,
      vouchedCount: 0,
      cancelledCount: 0,
      currency: 'USD'
    });
  }, [filteredBookings]);

  const getNetRate = (booking: SupplierBooking): number => {
    return booking.priceDetails?.originalPrice?.value || 
           booking.rooms?.[0]?.cancellationPolicy?.policies?.[0]?.charge?.components?.net?.value || 
           0;
  };

  const getCurrency = (booking: SupplierBooking): string => {
    return booking.priceDetails?.originalPrice?.currency || 
           booking.rooms?.[0]?.cancellationPolicy?.policies?.[0]?.charge?.components?.net?.currency || 
           'USD';
  };

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
              Net rates from vouched booking confirmations
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
            {filteredBookings.map((booking) => {
              const netRate = getNetRate(booking);
              const currency = getCurrency(booking);
              const isCancelled = booking.status?.toLowerCase() === 'cancelled';
              
              return (
                <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
                    {booking.bookingId}
                  </td>
                  <td className="px-6 py-4">{booking.supplier?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{booking.agency?.agencyName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(booking.serviceDates?.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-semibold">
                    <span className={isCancelled ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}>
                      {isCancelled && '-'}{currency} {netRate.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      isCancelled
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        : booking.status?.toLowerCase() === 'confirmed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
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
            })}
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500 dark:text-gray-400">
                  No vouched bookings found for the selected criteria.
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
                  <span className="sr-only">Close</span>
                  ✕
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
                    {getCurrency(selectedStatement)} {getNetRate(selectedStatement).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</label>
                  <p className="text-gray-900 dark:text-white">{selectedStatement.supplier?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Agency</label>
                  <p className="text-gray-900 dark:text-white">{selectedStatement.agency?.agencyName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Service Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedStatement.serviceDates?.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className={`font-semibold ${
                    selectedStatement.status?.toLowerCase() === 'cancelled' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {selectedStatement.status?.toLowerCase() === 'cancelled' 
                      ? 'Cancelled (Was Vouched)' 
                      : 'Vouched'}
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
