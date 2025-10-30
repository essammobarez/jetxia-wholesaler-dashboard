'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Eye, FileText, Download, Search } from 'lucide-react';

// --- EXISTING INTERFACES (Kept for initial data loading and modal structure) ---
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
  wasVouched: boolean;
  provider?: {
    name?: string;
    _id?: string;
    supplierName?: string;
    supplierId?: string;
  };
  bookingOverview?: {
    provider?: {
      name?: string;
      _id?: string;
      supplierName?: string;
      supplierId?: string;
    };
  };
}

interface Supplier {
  _id: string;
  name: string;
  type?: 'Offline' | 'Online';
}

interface PaymentTransaction {
  _id: string;
  paymentId: string;
  agencyId: {
    _id: string;
    agencyName?: string;
    slug: string;
  };
  wholesalerId: string;
  ledgerEntryId: {
    _id: string;
    referenceType: string;
    referenceId: string;
    description: string;
  };
  fullAmount: number;
  paidAmount: number;
  status: string;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  supplier?: {
    name: string;
    _id: string;
  };
  agencyInfo?: {
    agencyName: string;
    _id: string;
  };
  currency?: string;
}

interface StatementEntry {
  _id: string;
  type: 'booking' | 'payment';
  date: string;
  reference: string;
  description: string;
  supplier: {
    name: string;
    _id: string;
  };
  agency: {
    agencyName: string;
    _id: string;
  };
  creditAmount?: number;
  debitAmount?: number;
  currency: string;
  status: string;
  originalData: SupplierBooking | PaymentTransaction;
}

// --- NEW INTERFACES for API Responses ---
interface FinancialSummary {
  totalCredits: { count: number; amount: number };
  totalDebits: { count: number; amount: number };
  paymentsMade: { count: number; amount: number };
  accountBalance: number;
  totalTransactions: number;
  recentTransactions: Array<{
    date: string;
    reference: string;
    description: string;
    supplier: string;
    agency: string;
    credit: number | null;
    debit: number | null;
    status: string;
  }>;
}

interface LedgerEntry {
  _id: string;
  wholesaler: { _id: string; wholesalerName: string };
  supplier: { _id: string; name: string };
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  currency: string;
  date: string;
  referenceType: string;
  referenceId: string;
  status: string;
  bookingId: string;
  agencyId: { _id: string; agencyName: string };
  hotelName: string;
  serviceDate: string;
  balanceAfter: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const StatementsOnAccount = () => {
  // --- TOKEN FETCH FUNCTION ---
  const getAuthToken = () => {
    return document.cookie
            .split('; ')
            .find(r => r.startsWith('authToken='))
            ?.split('=')[1] || localStorage.getItem('authToken');
  };

  // --- EXISTING STATE ---
  const [bookings, setBookings] = useState<SupplierBooking[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NEW STATE for API data ---
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  // Date filtering
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Search and filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Statement view
  const [selectedStatement, setSelectedStatement] = useState<StatementEntry | null>(null);
  const [fullBookingData, setFullBookingData] = useState<any>(null);
  const [loadingBookingDetails, setLoadingBookingDetails] = useState(false);

  // Get wholesaler ID on mount
  useEffect(() => {
    const storedId = localStorage.getItem('wholesalerId');
    setWholesalerId(storedId);
  }, []);

  // Fetch complete booking details when a booking is selected
  const fetchFullBookingDetails = async (bookingId: string) => {
    if (!wholesalerId || !bookingId) return;

    setLoadingBookingDetails(true);
    try {
      console.log('Fetching full booking details for:', bookingId);
      const detailsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/details/${bookingId}`
      );
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        console.log('Full booking details fetched:', detailsData);
        setFullBookingData(detailsData);
      } else {
        throw new Error('Could not fetch from details endpoint.');
      }
    } catch (error) {
      console.error('Error fetching full booking details:', error);
      setFullBookingData({
        error: true,
        message: 'Could not retrieve full booking details from the primary source.',
        fallbackMessage: 'Displaying limited information available from the ledger.',
      });
    } finally {
      setLoadingBookingDetails(false);
    }
  };

  // Handle statement selection and fetch full booking data
  const handleStatementSelection = async (statement: StatementEntry) => {
    setSelectedStatement(statement);
    setFullBookingData(null); // Reset previous data

    if (statement.type === 'booking' && statement.originalData && ('bookingId' in statement.originalData)) {
      const bookingData = statement.originalData as SupplierBooking;
      const bookingId = bookingData.bookingId || bookingData._id;
      await fetchFullBookingDetails(bookingId);
    }
  };

  // --- EFFECT FOR INITIAL DATA & SUPPLIER LIST ---
  // This effect remains to populate the supplier dropdown list.
  useEffect(() => {
    if (!wholesalerId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      // --- Use the new getAuthToken function ---
      const token = getAuthToken();
      // --- End of change ---

      try {
        const [offlineResponse, onlineResponse, bookingsResponse] = await Promise.allSettled([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/offline-provider/by-wholesaler/${wholesalerId}`),
          // --- API URL AND TOKEN ADDED AS REQUESTED ---
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wholesaler/supplier-connection`, {
            headers: {
              'Authorization': `Bearer ${token}` // Use the token fetched by getAuthToken
            }
          }),
          // --- END OF CHANGE ---
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/wholesaler/${wholesalerId}`)
        ]);

        const allSuppliers: Supplier[] = [];
        const supplierIds = new Set<string>();

        const addSupplier = (supplier: Supplier) => {
          if (supplier._id && !supplierIds.has(supplier._id)) {
            allSuppliers.push(supplier);
            supplierIds.add(supplier._id);
          }
        };

        if (offlineResponse.status === 'fulfilled' && offlineResponse.value.ok) {
          const offlineData = await offlineResponse.value.json();
          (Array.isArray(offlineData) ? offlineData : offlineData.data || []).forEach((s: any) => addSupplier({ _id: s._id, name: s.name, type: 'Offline' }));
        }

        if (onlineResponse.status === 'fulfilled' && onlineResponse.value.ok) {
          const onlineData = await onlineResponse.value.json();
          (Array.isArray(onlineData) ? onlineData : onlineData.data || []).forEach((s: any) => addSupplier({ _id: s._id, name: s.name, type: 'Online' }));
        }

        if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.ok) {
            const bookingsData = await bookingsResponse.value.json();
            const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [bookingsData];
            setBookings(bookingsArray); // Keep bookings state for reference if needed
             bookingsArray.forEach((booking: any) => {
                const supplierName = booking.supplier?.name || booking.provider?.name || booking.bookingOverview?.provider?.name;
                const supplierId = booking.supplier?._id || booking.provider?._id || booking.bookingOverview?.provider?._id;
                if (supplierName && supplierId) {
                    addSupplier({ _id: supplierId, name: supplierName, type: undefined });
                }
             });
        }

        allSuppliers.sort((a, b) => a.name.localeCompare(b.name));
        setSuppliers(allSuppliers);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch initial data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [wholesalerId]);

  // --- NEW EFFECT: Fetch financial data when a supplier is selected ---
  useEffect(() => {
    if (!selectedSupplier || !wholesalerId || selectedSupplier === 'DEBUG_ALL') {
      setFinancialSummary(null);
      setLedgerEntries([]);
      setLedgerError(null);
      return;
    }

    const fetchSupplierData = async () => {
      setIsLedgerLoading(true);
      setLedgerError(null);
      try {
        const [dashboardResponse, ledgerResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/supplier-payments/dashboard/financial/${wholesalerId}?supplierId=${selectedSupplier}`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/supplier-payments/ledger/${wholesalerId}?supplierId=${selectedSupplier}`)
        ]);

        if (!dashboardResponse.ok) {
          const errorData = await dashboardResponse.json();
          throw new Error(errorData.message || `Failed to fetch financial dashboard: ${dashboardResponse.statusText}`);
        }
        if (!ledgerResponse.ok) {
          const errorData = await ledgerResponse.json();
          throw new Error(errorData.message || `Failed to fetch supplier ledger: ${ledgerResponse.statusText}`);
        }

        const dashboardData = await dashboardResponse.json();
        const ledgerData = await ledgerResponse.json();

        setFinancialSummary(dashboardData.data);
        setLedgerEntries(ledgerData.data || []);
      } catch (err: any) {
        setLedgerError(err.message || 'An unknown error occurred while fetching supplier data.');
        setFinancialSummary(null);
        setLedgerEntries([]);
      } finally {
        setIsLedgerLoading(false);
      }
    };

    fetchSupplierData();
  }, [selectedSupplier, wholesalerId]);

  // --- NEW: Filter ledger entries based on UI controls ---
  const filteredLedgerEntries = useMemo(() => {
    return ledgerEntries.filter(entry => {
      // Date range filter
      const entryDate = new Date(entry.date);
      if (startDate && entryDate < new Date(startDate)) {
        return false;
      }
      if (endDate) {
        // Include the entire end day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (entryDate > endOfDay) {
          return false;
        }
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches =
          entry.bookingId?.toLowerCase().includes(searchLower) ||
          entry.agencyId?.agencyName?.toLowerCase().includes(searchLower) ||
          entry.description?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'vouched' && entry.status?.toLowerCase() !== 'outstanding') {
            return false;
        }
        if (statusFilter === 'cancelled' && entry.status?.toLowerCase() !== 'reversed') {
            return false;
        }
      }
      
      return true;
    });
  }, [ledgerEntries, startDate, endDate, searchTerm, statusFilter]);

  if (loading) {
    return <div className="card-modern p-6 text-center"><p>Loading initial data...</p></div>;
  }

  if (error) {
    return <div className="card-modern p-6 text-center bg-red-50"><h3 className="font-semibold text-red-700">Error</h3><p>{error}</p></div>;
  }

  return (
    <div className="card-modern overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-orange-600" />
              Statement of Account
              {selectedSupplier && suppliers.find(s => s._id === selectedSupplier) && (
                <span className="text-lg font-medium text-orange-600">
                  - {suppliers.find(s => s._id === selectedSupplier)?.name}
                </span>
              )}
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {selectedSupplier
                ? 'Detailed accounting ledger with credits and debits for the selected supplier.'
                : 'Please select a supplier to view their statement of account.'}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <Download className="w-4 h-4" />
            Export Statement
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Supplier <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">-- Select a Supplier --</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name} {supplier.type ? `(${supplier.type})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="all">All Statuses</option>
                <option value="vouched">Outstanding</option>
                <option value="cancelled">Reversed</option>
            </select>
          </div>
        </div>
        <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                placeholder="Search by Booking ID, Agency, or Description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
        </div>
      </div>

      {/* --- RENDER LOGIC BASED ON SUPPLIER SELECTION --- */}
      {selectedSupplier ? (
        <>
            {/* Summary Cards from Dashboard API */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-600">Total Credits</h3>
                    <p className="text-2xl font-bold text-green-700">{isLedgerLoading ? '...' : financialSummary?.totalCredits?.count || 0}</p>
                    <p className="text-sm text-green-600">USD {(financialSummary?.totalCredits?.amount || 0).toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600">Total Debits</h3>
                    <p className="text-2xl font-bold text-blue-700">{isLedgerLoading ? '...' : financialSummary?.totalDebits?.count || 0}</p>
                    <p className="text-sm text-blue-600">USD {(financialSummary?.totalDebits?.amount || 0).toFixed(2)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-red-600">Payments Made</h3>
                    <p className="text-2xl font-bold text-red-700">{isLedgerLoading ? '...' : financialSummary?.paymentsMade?.count || 0}</p>
                    <p className="text-sm text-red-600">USD {(financialSummary?.paymentsMade?.amount || 0).toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-orange-600">Account Balance</h3>
                    <p className="text-2xl font-bold text-orange-700">USD {(financialSummary?.accountBalance || 0).toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-600">Total Transactions</h3>
                    <p className="text-2xl font-bold text-purple-700">{isLedgerLoading ? '...' : financialSummary?.totalTransactions || 0}</p>
                </div>
            </div>
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Reference</th>
                    <th className="px-6 py-3 text-left">Description</th>
                    <th className="px-6 py-3 text-left">Agency</th>
                    <th className="px-6 py-3 text-right">Credit (USD)</th>
                    <th className="px-6 py-3 text-right">Debit (USD)</th>
                    <th className="px-6 py-3 text-right">Balance (USD)</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y">
                    {isLedgerLoading ? (
                        <tr><td colSpan={9} className="text-center py-10">Loading ledger...</td></tr>
                    ) : ledgerError ? (
                        <tr><td colSpan={9} className="text-center py-10 text-red-600">{ledgerError}</td></tr>
                    ) : filteredLedgerEntries.length > 0 ? (
                        filteredLedgerEntries.map((entry) => (
                            <tr key={entry._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{new Date(entry.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium text-blue-600">{entry.bookingId}</td>
                                <td className="px-6 py-4">{entry.description}</td>
                                <td className="px-6 py-4">{entry.agencyId?.agencyName || 'N/A'}</td>
                                <td className="px-6 py-4 text-right font-mono text-green-700">
                                    {entry.type === 'CREDIT' ? entry.amount.toFixed(2) : '-'}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-red-700">
                                    {entry.type === 'DEBIT' ? entry.amount.toFixed(2) : '-'}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-gray-800 dark:text-gray-200">
                                    {entry.balanceAfter.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        entry.status === 'OUTSTANDING' ? 'bg-green-100 text-green-800' :
                                        entry.status === 'REVERSED' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {entry.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleStatementSelection({
                                            _id: entry._id,
                                            type: 'booking',
                                            date: entry.date,
                                            reference: entry.bookingId,
                                            description: entry.description,
                                            supplier: entry.supplier,
                                            agency: { _id: entry.agencyId._id, agencyName: entry.agencyId.agencyName },
                                            creditAmount: entry.type === 'CREDIT' ? entry.amount : undefined,
                                            debitAmount: entry.type === 'DEBIT' ? entry.amount : undefined,
                                            currency: entry.currency,
                                            status: entry.status,
                                            originalData: { bookingId: entry.bookingId, _id: entry.referenceId } as any
                                        })}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg"
                                    >
                                        <Eye className="w-3 h-3" /> View
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={9} className="text-center py-10">No transactions found for the selected criteria.</td></tr>
                    )}
                </tbody>
            </table>
            </div>
        </>
      ) : (
        // Initial state when no supplier is selected
        <div className="p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold">No Supplier Selected</h3>
          <p className="mt-2 text-gray-600">Please select a supplier to view their statement of account.</p>
        </div>
      )}
      
      {/* Statement Detail Modal (Reuses existing logic) */}
      {selectedStatement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Statement Details
                </h3>
                <button onClick={() => setSelectedStatement(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="text-sm font-medium text-gray-500">Reference ID</label>
                      <p className="text-lg font-semibold text-blue-600">{selectedStatement.reference}</p>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-500">{selectedStatement.creditAmount ? 'Credit' : 'Debit'} Amount</label>
                      <p className={`text-lg font-semibold ${selectedStatement.creditAmount ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedStatement.currency} {(selectedStatement.creditAmount || selectedStatement.debitAmount || 0).toFixed(2)}
                      </p>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p>{selectedStatement.description}</p>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p>{selectedStatement.status}</p>
                  </div>
              </div>

              {loadingBookingDetails ? (
                <p>Loading full booking details...</p>
              ) : fullBookingData ? (
                <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4">Comprehensive Booking Details</h4>
                    {fullBookingData.error ? (
                        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">
                            <p><strong>{fullBookingData.message}</strong></p>
                            <p>{fullBookingData.fallbackMessage}</p>
                        </div>
                    ) : (
                        <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-x-auto">
                            {JSON.stringify(fullBookingData, null, 2)}
                        </pre>
                    )}
                </div>
              ) : (
                <div className="border-t pt-6 text-center text-gray-500">
                    <p>Click "View" on a booking to see comprehensive details here.</p>
We                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatementsOnAccount;