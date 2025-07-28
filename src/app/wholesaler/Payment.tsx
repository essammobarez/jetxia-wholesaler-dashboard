'use client'

import React, { FC, useState, useEffect, ChangeEvent } from 'react'
import { format } from 'date-fns'
import { 
  Search, 
  Filter, 
  Download, 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  MoreVertical,
  Eye,
  Plus,
  X
} from 'lucide-react'

type Payment = {
  id: string
  date: string
  amount: number
  status: string
  paymentMethod: string
}

type Agency = {
  _id: string
  agencyName: string
  slug: string
  status: string
  country: string
  city: string
  email: string
  phoneNumber: string
  businessCurrency: string
  walletBalance: {
    mainBalance: number
    availableCredit: number
    creditExpiryDate: string | null
  }
  markupPlan?: {
    _id: string
    name: string
    service: string
    markups: Array<{
      provider: {
        _id: string
        name: string
      }
      type: string
      value: number
      _id: string
    }>
  }
  createdAt: string
  updatedAt: string
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL!

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken") || "";
  }
  return "";
}

const fetchPayments = async (wholesalerId: string): Promise<Payment[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Auth token missing. Please login again.");
  }

  const res = await fetch(`${API_URL}paymentHistory/${wholesalerId}/payments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }
    throw new Error(`API error: ${res.status}`)
  }

  const data: any[] = await res.json()

  return data.map(item => {
    return {
      id: item.paymentId || item.id || 'Unknown',
      date: format(new Date(item.createdAt || item.paymentDate || item.date), 'yyyy-MM-dd'),
      amount: item.amount || item.paymentAmount || 0,
      status: item.status
        ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
        : 'Unknown',
      paymentMethod: item.paymentMethod || item.paymentType || item.method
        ? (item.paymentMethod || item.paymentType || item.method).charAt(0).toUpperCase() + 
          (item.paymentMethod || item.paymentType || item.method).slice(1).toLowerCase()
        : 'Unknown'
    }
  })
}

// Function to handle payment actions (view details, download receipt, etc.)
const handlePaymentAction = async (paymentId: string, action: string) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Auth token missing. Please login again.");
  }

  try {
    const response = await fetch(`${API_URL}payments/${paymentId}/${action}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error performing payment action ${action}:`, error);
    throw error;
  }
}

// Function to export payment report
const exportPaymentReport = async (wholesalerId: string, filters?: any) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Auth token missing. Please login again.");
  }

  try {
    const response = await fetch(`${API_URL}payments/export/${wholesalerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(filters || {}),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }
      throw new Error(`API error: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error exporting payment report:', error);
    throw error;
  }
}

// Function to fetch agencies for a wholesaler
const fetchAgencies = async (wholesalerId: string): Promise<Agency[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Auth token missing. Please login again.");
  }

  const res = await fetch(`${API_URL}agency/wholesaler/${wholesalerId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }
    throw new Error(`API error: ${res.status}`)
  }

  const response = await res.json()
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch agencies')
  }

  return response.data || []
}

// Function to make payment to agency
const makePaymentToAgency = async (agencyId: string, paymentAmount: number) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Auth token missing. Please login again.");
  }

  try {
    const response = await fetch(`${API_URL}paymentHistory/${agencyId}/credit/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        paymentAmount: paymentAmount
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error making payment to agency:', error);
    throw error;
  }
}

const PaymentLogPage: FC = () => {

  const [payments, setPayments] = useState<Payment[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(false)
  const [agenciesLoading, setAgenciesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wholesalerId, setWholesalerId] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedAgencyId, setSelectedAgencyId] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false)

  // Load stored wholesaler ID on mount
  useEffect(() => {
    const stored = localStorage.getItem('wholesalerId')
    if (stored) {
      setWholesalerId(stored)
    } else {
      setError('No wholesaler ID found. Please log in again.')
    }
  }, [])

  // Fetch agencies once we have the wholesaler ID
  useEffect(() => {
    const loadAgencies = async () => {
      if (!wholesalerId) return
      
      setAgenciesLoading(true)
      console.log("Fetching agencies for wholesalerId:", wholesalerId)
      
      try {
        const agenciesData = await fetchAgencies(wholesalerId)
        console.log("Agencies fetched successfully:", agenciesData)
        setAgencies(agenciesData)
        setError(null)
      } catch (err: any) {
        console.error('Error fetching agencies:', err)
        setError(`Failed to fetch agencies: ${err.message}`)
      } finally {
        setAgenciesLoading(false)
      }
    }

    loadAgencies()
  }, [wholesalerId])

  // Fetch payments once we have the ID with mock data fallback
  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true)
      console.log("wholesalerId", wholesalerId)
      try {
        if (wholesalerId && API_URL) {
          const data = await fetchPayments(wholesalerId)
          if (data && data.length > 0) {
            setPayments(data)
            setError(null)
            setLoading(false)
            return
          }
        }
      } catch (err: any) {
        console.error('Error fetching payments from API:', err)
      }

      // Fallback to mock data
      console.log('🔧 Development mode: Using mock payment data')
      const mockPayments = [
         { id: 'PAY-001', date: '2024-01-15', amount: 2450.00, status: 'Completed', paymentMethod: 'Credit Card' },
         { id: 'PAY-002', date: '2024-01-14', amount: 1850.75, status: 'Completed', paymentMethod: 'Bank Transfer' },
         { id: 'PAY-003', date: '2024-01-13', amount: 3200.50, status: 'Pending', paymentMethod: 'PayPal' },
         { id: 'PAY-004', date: '2024-01-12', amount: 950.25, status: 'Failed', paymentMethod: 'Credit Card' },
         { id: 'PAY-005', date: '2024-01-11', amount: 4750.00, status: 'Completed', paymentMethod: 'Wire Transfer' },
         { id: 'PAY-006', date: '2024-01-10', amount: 1650.80, status: 'Completed', paymentMethod: 'Credit Card' },
         { id: 'PAY-007', date: '2024-01-09', amount: 2890.45, status: 'Pending', paymentMethod: 'Bank Transfer' },
         { id: 'PAY-008', date: '2024-01-08', amount: 750.90, status: 'Completed', paymentMethod: 'PayPal' },
         { id: 'PAY-009', date: '2024-01-07', amount: 5200.00, status: 'Completed', paymentMethod: 'Wire Transfer' },
         { id: 'PAY-010', date: '2024-01-06', amount: 1120.35, status: 'Failed', paymentMethod: 'Credit Card' },
      ]

      // setPayments(mockPayments)
      setError(null)
      setLoading(false)
    }

    loadPayments()
  }, [wholesalerId])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleStatusFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
  }

  const handleExportReport = async () => {
    if (!wholesalerId) {
      setError('No wholesaler ID found. Please log in again.')
      return
    }

    setExportLoading(true)
    setError(null)

    try {
      const filters = {
        search,
        status: statusFilter === 'All' ? undefined : statusFilter,
        // Add more filters as needed
      }
      
      await exportPaymentReport(wholesalerId, filters)
    } catch (err: any) {
      setError(err.message || 'Failed to export report')
    } finally {
      setExportLoading(false)
    }
  }

  const handlePaymentActionClick = async (paymentId: string, action: string) => {
    setActionLoading(paymentId)
    setError(null)

    try {
      const result = await handlePaymentAction(paymentId, action)
      console.log(`Payment ${action} result:`, result)
      // Handle the result based on the action
      // For example, if action is 'view', you might want to show a modal
    } catch (err: any) {
      setError(err.message || `Failed to ${action} payment`)
    } finally {
      setActionLoading(null)
    }
  }

  // Payment Modal Handlers
  const openPaymentModal = () => {
    setShowPaymentModal(true)
    setSelectedAgencyId('')
    setPaymentAmount('')
    setPaymentError(null)
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedAgencyId('')
    setPaymentAmount('')
    setPaymentError(null)
  }

  const handleAgencySelect = (agencyId: string) => {
    setSelectedAgencyId(agencyId)
    setShowAgencyDropdown(false)
    setPaymentError(null)
  }

  const toggleAgencyDropdown = () => {
    setShowAgencyDropdown(!showAgencyDropdown)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showAgencyDropdown && !target.closest('.agency-dropdown')) {
        setShowAgencyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAgencyDropdown]);

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and decimal points
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setPaymentAmount(value)
      setPaymentError(null)
    }
  }

  const handlePaymentSubmit = async () => {
    // Validation
    if (!selectedAgencyId) {
      setPaymentError('Please select an agency')
      return
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setPaymentError('Please enter a valid payment amount')
      return
    }

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount)) {
      setPaymentError('Please enter a valid number')
      return
    }

    setPaymentLoading(true)
    setPaymentError(null)

    try {
      const result = await makePaymentToAgency(selectedAgencyId, amount)
      console.log('Payment successful:', result)
      
      // Close modal and refresh data
      closePaymentModal()
      
      // Optionally refresh payments and agencies
      if (wholesalerId) {
        // Refresh agencies to update balances
        const agenciesData = await fetchAgencies(wholesalerId)
        setAgencies(agenciesData)
      }
      
      // Show success message
      setError(null)
    } catch (err: any) {
      setPaymentError(err.message || 'Payment failed. Please try again.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const filtered = payments.filter(p => {
    const matchesSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.amount.toString().includes(search)
    const matchesStatus =
      statusFilter === 'All' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const displayed = filtered.slice(0, 20)

  // Calculate summary statistics
  const totalAmount = filtered.reduce((sum, payment) => sum + payment.amount, 0)
  const completedPayments = filtered.filter(p => p.status === 'Completed').length
  const pendingPayments = filtered.filter(p => p.status === 'Pending').length
  const failedPayments = filtered.filter(p => p.status === 'Failed').length

  const summaryStats = [
    { title: 'Total Revenue', value: `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, change: '+12.3%', gradient: 'gradient-success' },
    { title: 'Completed', value: completedPayments.toString(), icon: CheckCircle, change: '+8.5%', gradient: 'gradient-blue' },
    { title: 'Pending', value: pendingPayments.toString(), icon: Clock, change: '-2.1%', gradient: 'gradient-warning' },
    { title: 'Failed', value: failedPayments.toString(), icon: XCircle, change: '-15.7%', gradient: 'gradient-secondary' }
  ]

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return CheckCircle
      case 'pending': return Clock
      case 'failed': return XCircle
      default: return CreditCard
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-scale">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-2">
            Payment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            Monitor and manage all payment transactions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 w-full sm:w-auto">
          <button 
            onClick={openPaymentModal}
            className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto px-4 py-2 rounded-xl font-medium transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Make Payment
          </button>
          <button 
            onClick={handleExportReport}
            disabled={exportLoading}
            className={`btn-gradient w-full sm:w-auto ${exportLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Download className="w-4 h-4 mr-2" />
            {exportLoading ? 'Exporting...' : 'Export Report'}
          </button>
          <button className="btn-modern bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map(({ title, value, icon: Icon, change, gradient }, index) => (
          <div 
            key={title}
            className="card-modern p-6 relative overflow-hidden animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 ${gradient} opacity-10 rounded-full -mr-6 -mt-6`}></div>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${gradient} bg-opacity-20 rounded-xl`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                <TrendingUp className="w-4 h-4" />
                <span>{change}</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input-modern pl-10 pr-4 py-3 w-full"
              placeholder="Search by ID, amount..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <select
              className="input-modern py-3 px-4 w-full sm:w-auto"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
            <button className="btn-modern bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300 px-4">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </button>
          </div>
        </div>
      </div>

      {/* --- Loading / Error / Empty States --- */}
      {loading && (
        <div className="card-modern p-12 text-center animate-pulse">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-bounce" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading payment data...</p>
        </div>
      )}

      {!loading && error && (
        <div className="card-modern p-12 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button className="mt-4 btn-gradient">Retry Loading</button>
        </div>
      )}

      {!loading && !error && displayed.length === 0 && (
        <div className="card-modern p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Payments Found</h3>
          <p className="text-gray-500 dark:text-gray-400">No payments match your current filter criteria.</p>
          <button 
            onClick={() => { setSearch(''); setStatusFilter('All'); }}
            className="mt-4 btn-modern bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* --- Enhanced Payment List (Table for Desktop, Cards for Mobile) --- */}
      {!loading && !error && displayed.length > 0 && (
        <div className="card-modern overflow-hidden animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment Transactions ({filtered.length})
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Recent payment activity and transaction history
            </p>
          </div>

          {/* Mobile Card View (hidden on md and up) */}
          <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
            {displayed.map(payment => {
              const StatusIcon = getStatusIcon(payment.status);
              return (
                <div key={payment.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">#{payment.id}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {payment.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${payment.amount != null ? payment.amount.toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{payment.date}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <CreditCard className="w-4 h-4" />
                        <span>{payment.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handlePaymentActionClick(payment.id, 'view')}
                        disabled={actionLoading === payment.id}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handlePaymentActionClick(payment.id, 'download')}
                        disabled={actionLoading === payment.id}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (hidden below md) */}
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {displayed.map((payment, index) => {
                  const StatusIcon = getStatusIcon(payment.status)
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">#{payment.id}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{payment.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">${payment.amount != null ? payment.amount.toFixed(2) : '0.00'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">USD</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">{payment.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handlePaymentActionClick(payment.id, 'view')}
                            disabled={actionLoading === payment.id}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handlePaymentActionClick(payment.id, 'download')}
                            disabled={actionLoading === payment.id}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Info */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400 space-y-2 sm:space-y-0">
              <span>Showing {displayed.length} of {filtered.length} transactions</span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closePaymentModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full animate-scale-up border border-gray-100 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-xl">
                  <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Make Payment
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Process payment to selected agency
                  </p>
                </div>
              </div>
              <button
                onClick={closePaymentModal}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Agency Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Select Agency
                </label>
                <div className="relative agency-dropdown">
                  <button
                    type="button"
                    onClick={toggleAgencyDropdown}
                    disabled={agenciesLoading}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors text-left flex items-center justify-between"
                  >
                    <span className={selectedAgencyId ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                      {selectedAgencyId 
                        ? agencies.find(a => a._id === selectedAgencyId)?.agencyName || 'Choose an agency...'
                        : 'Choose an agency...'
                      }
                    </span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${showAgencyDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showAgencyDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {agencies.map((agency) => (
                        <button
                          key={agency._id}
                          type="button"
                          onClick={() => handleAgencySelect(agency._id)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {agency.agencyName} ({agency.slug})
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {agency.city}, {agency.country}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Amount */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                    $
                  </span>
                  <input
                    type="text"
                    value={paymentAmount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors text-lg font-medium"
                    disabled={paymentLoading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {paymentError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-pulse">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{paymentError}</p>
                  </div>
                </div>
              )}

              {/* Selected Agency Info */}
              {selectedAgencyId && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Current Balance</span>
                    </div>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      ${agencies.find(a => a._id === selectedAgencyId)?.walletBalance.mainBalance.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
              <button
                onClick={closePaymentModal}
                disabled={paymentLoading}
                className="btn-modern bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={paymentLoading || !selectedAgencyId || !paymentAmount}
                className={`btn-gradient bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 font-semibold ${paymentLoading || !selectedAgencyId || !paymentAmount ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {paymentLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentLogPage