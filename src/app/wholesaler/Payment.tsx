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
  Eye
} from 'lucide-react'

type Payment = {
  id: string
  date: string
  amount: number
  status: string
  paymentMethod: string
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

const fetchPayments = async (wholesalerId: string): Promise<Payment[]> => {
  const res = await fetch(`${API_URL}/booking/wholesaler/${wholesalerId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  const data: any[] = await res.json()

  return data.map(item => {
    const booking = item.bookingData
    const rawAmount =
      typeof item.price === 'number'
        ? item.price
        : booking?.reservationDetails?.service?.prices?.total?.selling?.value ?? 0

    return {
      id: item.bookingId || 'Unknown',
      date: format(new Date(item.createdAt), 'yyyy-MM-dd'),
      amount: rawAmount,
      status: item.status
        ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
        : 'Unknown',
      paymentMethod: item.paymentType
        ? item.paymentType.charAt(0).toUpperCase() + item.paymentType.slice(1).toLowerCase()
        : 'Unknown'
    }
  })
}

const PaymentLogPage: FC = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wholesalerId, setWholesalerId] = useState<string | null>(null)

  // Load stored wholesaler ID on mount
  useEffect(() => {
    const stored = localStorage.getItem('wholesalerId')
    if (stored) {
      setWholesalerId(stored)
    } else {
      setError('No wholesaler ID found. Please log in again.')
    }
  }, [])

  // Fetch payments once we have the ID with mock data fallback
  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true)
      
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
        {
          id: 'PAY-001',
          date: '2024-01-15',
          amount: 2450.00,
          status: 'Completed',
          paymentMethod: 'Credit Card'
        },
        {
          id: 'PAY-002',
          date: '2024-01-14',
          amount: 1850.75,
          status: 'Completed',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: 'PAY-003',
          date: '2024-01-13',
          amount: 3200.50,
          status: 'Pending',
          paymentMethod: 'PayPal'
        },
        {
          id: 'PAY-004',
          date: '2024-01-12',
          amount: 950.25,
          status: 'Failed',
          paymentMethod: 'Credit Card'
        },
        {
          id: 'PAY-005',
          date: '2024-01-11',
          amount: 4750.00,
          status: 'Completed',
          paymentMethod: 'Wire Transfer'
        },
        {
          id: 'PAY-006',
          date: '2024-01-10',
          amount: 1650.80,
          status: 'Completed',
          paymentMethod: 'Credit Card'
        },
        {
          id: 'PAY-007',
          date: '2024-01-09',
          amount: 2890.45,
          status: 'Pending',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: 'PAY-008',
          date: '2024-01-08',
          amount: 750.90,
          status: 'Completed',
          paymentMethod: 'PayPal'
        },
        {
          id: 'PAY-009',
          date: '2024-01-07',
          amount: 5200.00,
          status: 'Completed',
          paymentMethod: 'Wire Transfer'
        },
        {
          id: 'PAY-010',
          date: '2024-01-06',
          amount: 1120.35,
          status: 'Failed',
          paymentMethod: 'Credit Card'
        },
        {
          id: 'PAY-011',
          date: '2024-01-05',
          amount: 3750.60,
          status: 'Completed',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: 'PAY-012',
          date: '2024-01-04',
          amount: 2100.25,
          status: 'Pending',
          paymentMethod: 'PayPal'
        },
        {
          id: 'PAY-013',
          date: '2024-01-03',
          amount: 850.70,
          status: 'Completed',
          paymentMethod: 'Credit Card'
        },
        {
          id: 'PAY-014',
          date: '2024-01-02',
          amount: 4250.00,
          status: 'Completed',
          paymentMethod: 'Wire Transfer'
        },
        {
          id: 'PAY-015',
          date: '2024-01-01',
          amount: 1875.90,
          status: 'Completed',
          paymentMethod: 'Bank Transfer'
        }
      ]

      setPayments(mockPayments)
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
    {
      title: 'Total Revenue',
      value: `$${totalAmount.toLocaleString()}`,
      icon: DollarSign,
      change: '+12.3%',
      gradient: 'gradient-success'
    },
    {
      title: 'Completed',
      value: completedPayments.toString(),
      icon: CheckCircle,
      change: '+8.5%',
      gradient: 'gradient-blue'
    },
    {
      title: 'Pending',
      value: pendingPayments.toString(),
      icon: Clock,
      change: '-2.1%',
      gradient: 'gradient-warning'
    },
    {
      title: 'Failed',
      value: failedPayments.toString(),
      icon: XCircle,
      change: '-15.7%',
      gradient: 'gradient-secondary'
    }
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
    <div className="space-y-8 animate-fade-scale">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">
            Payment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Monitor and manage all payment transactions
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-gradient">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button className="btn-modern bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
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
            {/* Background Pattern */}
            <div className={`absolute top-0 right-0 w-20 h-20 ${gradient} opacity-10 rounded-full -mr-6 -mt-6`}></div>
            
            {/* Header */}
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
            
            {/* Content */}
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
              placeholder="Search by ID, amount, or method..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex space-x-4 w-full md:w-auto">
          <select
              className="input-modern py-3 px-4 w-full md:w-auto"
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

        {/* Loading / Error / Empty States */}
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
          <button className="mt-4 btn-gradient">
            Retry Loading
          </button>
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
            onClick={() => {
              setSearch('')
              setStatusFilter('All')
            }}
            className="mt-4 btn-modern bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
          >
            Clear Filters
          </button>
          </div>
        )}

      {/* Enhanced Payment Table */}
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
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {displayed.map((payment, index) => {
                  const StatusIcon = getStatusIcon(payment.status)
                  return (
                    <tr 
                      key={payment.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              #{payment.id}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Transaction ID
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {payment.date}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          ${payment.amount != null ? payment.amount.toFixed(2) : '0.00'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">USD</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}
                      >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {payment.status}
                      </span>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {payment.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
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
            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Showing {displayed.length} of {filtered.length} transactions</span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Previous
                </button>
                <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
          </div>
        )}
    </div>
  )
}

export default PaymentLogPage