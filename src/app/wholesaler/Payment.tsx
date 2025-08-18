'use client'

import React, { FC, useState, useEffect, ChangeEvent } from 'react'
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
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
  Eye,
  Plus,
  X,
  FileText, // Icon for PDF
  FileSpreadsheet // Icon for CSV
} from 'lucide-react'
import { jsPDF } from 'jspdf' // Library for PDF generation

type Payment = {
  _id: string
  paymentId: string
  agencyId: {
    _id: string
    slug: string
  }
  wholesalerId: string
  ledgerEntryId: {
    _id: string
    referenceType: string
    referenceId: string
    description: string
  }
  fullAmount: number
  paidAmount: number
  status: string
  remainingAmount: number
  createdAt: string
  updatedAt: string
  createdBy?: string
}

type PaymentResponse = {
  statusCode: number
  success: boolean
  message: string
  data: {
    payments: Payment[]
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      limit: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
}

type Agency = {
  _id: string
  agencyId: string
  agencyName: string
  totalItems: number
  totalOutstanding: number
  slug?: string
  status?: string
  country?: string
  city?: string
  email?: string
  phoneNumber?: string
  businessCurrency?: string
  walletBalance?: {
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
  createdAt?: string
  updatedAt?: string
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL!

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken") || "";
  }
  return "";
}

// MODIFIED: fetchPayments now accepts startDate and endDate
const fetchPayments = async (wholesalerId: string, page: number = 1, limit: number = 10, startDate?: string, endDate?: string): Promise<PaymentResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Auth token missing. Please login again.");
  }

  // Construct query string with date parameters
  let url = `${API_URL}paymentHistory/wholesaler/payments?page=${page}&limit=${limit}`;
  if (startDate) {
    url += `&startDate=${startDate}`;
  }
  if (endDate) {
    url += `&endDate=${endDate}`;
  }

  const res = await fetch(url, {
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

  const data: PaymentResponse = await res.json()
  return data
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
  // reports/agency-outstanding-report
  const res = await fetch(`${API_URL}reports/agency-outstanding-report`, {
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

// Function to fetch ledger entries for an agency
const fetchLedgerEntries = async (agencyId: string) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Auth token missing. Please login again.");
  }

  try {
    const response = await fetch(`${API_URL}ledger/report`, {
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
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error("Invalid ledger API response format");
    }

    // Filter ledger entries for the specific agency and get unpaid entries
    const agencyLedgerEntries = data.data.filter((entry: any) =>
      entry.agency === agencyId &&
      entry.ledgerStatus !== 'PAID' &&
      entry.type === 'DEBIT'
    );

    return agencyLedgerEntries;
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    throw error;
  }
}

// Function to make payment to agency
const makePaymentToAgency = async (agencyId: string, paymentAmount: number) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Auth token missing. Please login again.");
  }

  try {
    // First, fetch ledger entries for the agency
    const ledgerEntries = await fetchLedgerEntries(agencyId);

    if (ledgerEntries.length === 0) {
      throw new Error("No outstanding ledger entries found for this agency");
    }

    // Extract ledger IDs
    const ledgerIds = ledgerEntries.map((entry: any) => entry._id);

    const response = await fetch(`${API_URL}paymentHistory/${agencyId}/credit/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        paymentAmount: paymentAmount,
        ledgerIds: ledgerIds
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
  // NEW: State for date range filtering
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agenciesLoading, setAgenciesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wholesalerId, setWholesalerId] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedAgencyId, setSelectedAgencyId] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false)
  const [agencySearchTerm, setAgencySearchTerm] = useState('')

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

  // MODIFIED: useEffect to fetch payments with date range filter
  useEffect(() => {
    const loadPayments = async () => {
      if (!wholesalerId || !API_URL) {
        setLoading(false)
        return
      }

      setLoading(true)
      console.log("wholesalerId", wholesalerId)

      try {
        // Pass startDate and endDate to the fetch function
        const response = await fetchPayments(wholesalerId, pagination.currentPage, pagination.limit, startDate, endDate)
        if (response.success && response.data.payments) {
          setPayments(response.data.payments)
          setPagination(response.data.pagination)
          setError(null)
        } else {
          setError('Failed to fetch payments')
        }
      } catch (err: any) {
        console.error('Error fetching payments from API:', err)
        setError(err.message || 'Failed to fetch payments')
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [wholesalerId, pagination.currentPage, pagination.limit, startDate, endDate]) // ADDED: Dependencies for date filters

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleStatusFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
  }

  // NEW: Date change handlers
  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value)
    // Reset page to 1 when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value)
    // Reset page to 1 when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleExportReport = async () => {
    if (!wholesalerId) {
      setError('No wholesaler ID found. Please log in again.')
      return
    }

    setExportLoading(true)
    setError(null)

    try {
      // MODIFIED: Include date filters in the export payload
      const filters = {
        search,
        status: statusFilter === 'All' ? undefined : statusFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        // Add more filters as needed
      }

      await exportPaymentReport(wholesalerId, filters)
    } catch (err: any) {
      setError(err.message || 'Failed to export report')
    } finally {
      setExportLoading(false)
    }
  }

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowViewModal(true)
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setSelectedPayment(null)
  }

  // --- NEW --- Export single payment as PDF
  const handleExportPDF = (payment: Payment) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Payment Receipt', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Payment ID: ${payment.paymentId}`, 14, 32);
    doc.text(`Date: ${format(new Date(payment.createdAt), 'yyyy-MM-dd')}`, 14, 39);

    doc.setLineWidth(0.5);
    doc.line(14, 45, 196, 45);

    doc.setFontSize(12);
    doc.setTextColor(0);
    const details = [
      { label: 'Agency:', value: payment.agencyId.slug },
      { label: 'Status:', value: payment.status },
      { label: 'Paid Amount:', value: `$${payment.paidAmount.toFixed(2)}` },
      { label: 'Full Amount:', value: `$${payment.fullAmount.toFixed(2)}` },
      { label: 'Remaining Amount:', value: `$${payment.remainingAmount.toFixed(2)}` },
      { label: 'Reference Type:', value: payment.ledgerEntryId.referenceType },
      { label: 'Description:', value: payment.ledgerEntryId.description },
    ];

    let yPosition = 55;
    details.forEach(detail => {
      doc.text(detail.label, 14, yPosition);
      doc.text(detail.value, 60, yPosition);
      yPosition += 8;
    });

    doc.save(`payment-${payment.paymentId}.pdf`);
  };

  // --- NEW --- Export single payment as CSV
  const handleExportCSV = (payment: Payment) => {
    const headers = [
      "Payment ID", "Agency Slug", "Status", "Paid Amount", "Full Amount",
      "Remaining Amount", "Date", "Reference Type", "Description"
    ];

    const row = [
      payment.paymentId,
      payment.agencyId.slug,
      payment.status,
      payment.paidAmount.toFixed(2),
      payment.fullAmount.toFixed(2),
      payment.remainingAmount.toFixed(2),
      format(new Date(payment.createdAt), 'yyyy-MM-dd'),
      payment.ledgerEntryId.referenceType,
      `"${payment.ledgerEntryId.description.replace(/"/g, '""')}"` // Escape double quotes
    ];

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(',') + "\n"
      + row.join(',');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payment-${payment.paymentId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Payment Modal Handlers
  const openPaymentModal = () => {
    setShowPaymentModal(true)
    setSelectedAgencyId('')
    setPaymentAmount('')
    setPaymentError(null)
    setAgencySearchTerm('')
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedAgencyId('')
    setPaymentAmount('')
    setPaymentError(null)
    setAgencySearchTerm('')
  }

  const handleAgencySelect = (agencyId: string) => {
    setSelectedAgencyId(agencyId)
    setShowAgencyDropdown(false)
    setPaymentError(null)
    setAgencySearchTerm('')
  }

  const toggleAgencyDropdown = () => {
    setShowAgencyDropdown(!showAgencyDropdown)
    if (!showAgencyDropdown) {
      setAgencySearchTerm('')
    }
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

  // Filter agencies based on search term
  const filteredAgencies = agencies.filter(agency => {
    if (!agencySearchTerm.trim()) return true;

    const searchLower = agencySearchTerm.toLowerCase();
    return (
      agency.agencyName.toLowerCase().includes(searchLower) ||
      (agency.slug && agency.slug.toLowerCase().includes(searchLower)) ||
      (agency.city && agency.city.toLowerCase().includes(searchLower)) ||
      (agency.country && agency.country.toLowerCase().includes(searchLower)) ||
      (agency.email && agency.email.toLowerCase().includes(searchLower))
    );
  });

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

    // Find the selected agency to get the agencyId field
    const selectedAgency = agencies.find(a => a._id === selectedAgencyId)
    if (!selectedAgency) {
      setPaymentError('Selected agency not found')
      return
    }

    setPaymentLoading(true)
    setPaymentError(null)

    try {
      const result = await makePaymentToAgency(selectedAgency._id, amount)
      console.log('Payment successful:', result)

      // Close modal
      closePaymentModal()

      // Refresh data after successful payment
      if (wholesalerId) {
        // Refresh agencies to update balances
        const agenciesData = await fetchAgencies(wholesalerId)
        setAgencies(agenciesData)

        // Refresh payment history
        const paymentResponse = await fetchPayments(wholesalerId, pagination.currentPage, pagination.limit)
        if (paymentResponse.success && paymentResponse.data.payments) {
          setPayments(paymentResponse.data.payments)
          setPagination(paymentResponse.data.pagination)
        }
      }

      // Show success message
      setError(null)
    } catch (err: any) {
      setPaymentError(err.message || 'Payment failed. Please try again.')
    } finally {
      setPaymentLoading(false)
    }
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      handlePageChange(pagination.currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      handlePageChange(pagination.currentPage - 1)
    }
  }

  // MODIFIED: `filtered` now only handles search and status filters since the API will handle date filtering.
  const filtered = payments.filter(p => {
    const matchesSearch =
      p.paymentId.toLowerCase().includes(search.toLowerCase()) ||
      p.paidAmount.toString().includes(search) ||
      p.agencyId.slug.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'All' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const displayed = filtered

  // Calculate summary statistics
  const totalAmount = filtered.reduce((sum, payment) => sum + payment.paidAmount, 0)
  const paidPayments = filtered.filter(p => p.status === 'Paid').length
  const partiallyPaidPayments = filtered.filter(p => p.status === 'Partially Paid').length
  const refundedPayments = filtered.filter(p => p.status === 'Refunded').length

  const summaryStats = [
    { title: 'Total Revenue', value: `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, change: '+12.3%', gradient: 'gradient-success' },
    { title: 'Paid', value: paidPayments.toString(), icon: CheckCircle, change: '+8.5%', gradient: 'gradient-blue' },
    { title: 'Partially Paid', value: partiallyPaidPayments.toString(), icon: Clock, change: '-2.1%', gradient: 'gradient-warning' },
    { title: 'Refunded', value: refundedPayments.toString(), icon: XCircle, change: '-15.7%', gradient: 'gradient-secondary' }
  ]

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return CheckCircle
      case 'partially paid': return Clock
      case 'refunded': return XCircle
      default: return CreditCard
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'partially paid': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'refunded': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
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
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="btn-modern bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 w-full sm:w-auto"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {showDateFilter ? 'Hide Date Filter' : 'Date Filter'}
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
              placeholder="Search by payment ID, amount, or agency..."
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
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Refunded">Refunded</option>
            </select>
            {/* NEW: Date filter inputs */}
            {showDateFilter && (
              <div className="flex space-x-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="input-modern py-3 px-4 w-full"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="input-modern py-3 px-4 w-full"
                  placeholder="End Date"
                />
              </div>
            )}
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
            onClick={() => { setSearch(''); setStatusFilter('All'); setStartDate(''); setEndDate('') }}
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
                <div key={payment._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">#{payment.paymentId}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {payment.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Paid Amount</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${payment.paidAmount != null ? payment.paidAmount.toFixed(2) : '0.00'}
                    </p>
                    {payment.remainingAmount > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Remaining: ${payment.remainingAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(payment.createdAt), 'yyyy-MM-dd')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <CreditCard className="w-4 h-4" />
                        <span>{payment.agencyId.slug}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleViewPayment(payment)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleExportPDF(payment)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Export as PDF"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleExportCSV(payment)}
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        title="Export as CSV"
                      >
                        <FileSpreadsheet className="w-5 h-5" />
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paid Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agency</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {displayed.map((payment, index) => {
                  const StatusIcon = getStatusIcon(payment.status)
                  return (
                    <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">#{payment.paymentId}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{format(new Date(payment.createdAt), 'yyyy-MM-dd')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">${payment.paidAmount != null ? payment.paidAmount.toFixed(2) : '0.00'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.remainingAmount > 0 ? `Remaining: $${payment.remainingAmount.toFixed(2)}` : 'USD'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">{payment.agencyId.slug}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{payment.ledgerEntryId.referenceType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewPayment(payment)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExportPDF(payment)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Export as PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExportCSV(payment)}
                            className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            title="Export as CSV"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
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
              <span>Showing {displayed.length} of {pagination.totalCount} transactions (Page {pagination.currentPage} of {pagination.totalPages})</span>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
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
                        ? (() => {
                          const selectedAgency = agencies.find(a => a._id === selectedAgencyId);
                          return selectedAgency ? `${selectedAgency.agencyName} ($${selectedAgency.totalOutstanding.toFixed(2)})` : 'Choose an agency...';
                        })()
                        : 'Choose an agency...'
                      }
                    </span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${showAgencyDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showAgencyDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-hidden">
                      {/* Search Input */}
                      <div className="sticky top-0 bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-3">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={agencySearchTerm}
                            onChange={(e) => setAgencySearchTerm(e.target.value)}
                            placeholder="Search agencies..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:bg-white dark:focus:bg-gray-700 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Agency List */}
                      <div className="max-h-48 overflow-y-auto">
                        {filteredAgencies.length > 0 ? (
                          filteredAgencies.map((agency) => (
                            <button
                              key={agency._id}
                              type="button"
                              onClick={() => handleAgencySelect(agency._id)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">
                                {agency.agencyName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Total Outstanding: ${agency.totalOutstanding.toFixed(2)} ({agency.totalItems} items)
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Search className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No agencies found</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Try adjusting your search terms
                            </p>
                          </div>
                        )}
                      </div>
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
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Outstanding</span>
                    </div>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {(() => {
                        const selectedAgency = agencies.find(a => a._id === selectedAgencyId);
                        return selectedAgency ? selectedAgency.totalOutstanding.toFixed(2) : '0.00';
                      })()}
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

      {/* View Payment Details Modal */}
      {showViewModal && selectedPayment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeViewModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full animate-scale-up border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Payment Details
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    #{selectedPayment.paymentId}
                  </p>
                </div>
              </div>
              <button
                onClick={closeViewModal}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Payment Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Paid Amount</span>
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      ${selectedPayment.paidAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Full Amount</span>
                      <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      ${selectedPayment.fullAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Remaining Amount</span>
                      <DollarSign className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                      ${selectedPayment.remainingAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className={`rounded-xl p-4 border ${
                    selectedPayment.status === 'Paid'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : selectedPayment.status === 'Partially Paid'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                      {(() => {
                        const StatusIcon = getStatusIcon(selectedPayment.status);
                        return <StatusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
                      })()}
                    </div>
                    <p className={`text-lg font-bold ${
                      selectedPayment.status === 'Paid'
                        ? 'text-green-900 dark:text-green-100'
                        : selectedPayment.status === 'Partially Paid'
                          ? 'text-yellow-900 dark:text-yellow-100'
                          : 'text-blue-900 dark:text-blue-100'
                      }`}>
                      {selectedPayment.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Payment Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Payment ID</label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPayment.paymentId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Agency</label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPayment.agencyId.slug}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {format(new Date(selectedPayment.createdAt), 'PPP')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Updated Date</label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {format(new Date(selectedPayment.updatedAt), 'PPP')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Reference Type</label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPayment.ledgerEntryId.referenceType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Reference ID</label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPayment.ledgerEntryId.referenceId}</p>
                    </div>
                    {selectedPayment.createdBy && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Created By</label>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPayment.createdBy}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ledger Entry Description */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Transaction Description
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedPayment.ledgerEntryId.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
              <button
                onClick={closeViewModal}
                className="btn-modern bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentLogPage