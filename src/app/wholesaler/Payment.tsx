'use client'

import React, { FC, useState, useEffect, ChangeEvent } from 'react'
import { format } from 'date-fns'

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

  // Fetch payments once we have the ID
  useEffect(() => {
    if (!wholesalerId) return

    setLoading(true)
    fetchPayments(wholesalerId)
      .then(data => {
        setPayments(data)
        setError(null)
      })
      .catch(err => {
        setError(`Failed to load payments: ${err.message}`)
      })
      .finally(() => {
        setLoading(false)
      })
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

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Payment Log</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by ID or Amount"
              value={search}
              onChange={handleSearchChange}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-4 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <select
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Loading / Error / Empty States */}
        {loading && (
          <div className="bg-white shadow rounded-lg p-8 text-center text-gray-600">
            Loading payments…
          </div>
        )}

        {!loading && error && (
          <div className="bg-white shadow rounded-lg p-8 text-center text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && displayed.length === 0 && (
          <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
            No matching payments found.
          </div>
        )}

        {/* Table */}
        {!loading && !error && displayed.length > 0 && (
          <div className="overflow-x-auto shadow rounded-lg bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayed.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${p.amount != null ? p.amount.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          p.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : p.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentLogPage