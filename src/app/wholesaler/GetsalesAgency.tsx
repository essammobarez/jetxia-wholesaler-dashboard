'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Eye, Edit, Search, X } from 'lucide-react'

// Define the full type for the agency object
interface Agency {
  _id: string
  status: 'pending' | 'approved' | 'rejected'
  agencyName: string
  slug: string
  country: string
  city: string
  postCode: string
  address: string
  website: string
  phoneNumber: string
  email: string
  businessCurrency: string
  vat: string
  licenseUrl: string | null
  logoUrl: string | null
  title: string
  firstName: string
  lastName: string
  emailId: string
  designation: string
  mobileNumber: string
  userName: string
  walletBalance: {
    mainBalance: number
    availableCredit: number
    creditExpiryDate: string | null
  }
  createdAt: string
  updatedAt: string
}

// ------------------------------
// MODAL COMPONENT
// ------------------------------
const AgencyDetailsModal = ({
  agency,
  onClose,
}: {
  agency: Agency
  onClose: () => void
}) => {
  if (!agency) return null

  const detailItem = (label: string, value: string | number | null) => (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
        {value || 'N/A'}
      </p>
    </div>
  )

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {agency.agencyName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {agency.slug}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Agency Details */}
          <section>
            <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-600 pb-2 mb-4">
              Agency Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {detailItem('Status', agency.status)}
              {detailItem('Email', agency.email)}
              {detailItem('Phone', agency.phoneNumber)}
              {detailItem('Location', `${agency.city}, ${agency.country}`)}
              {detailItem('Address', agency.address)}
              {detailItem('Post Code', agency.postCode)}
              {detailItem('Website', agency.website)}
              {detailItem('VAT/TAX ID', agency.vat)}
            </div>
          </section>

          {/* Main User Details */}
          <section>
            <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-600 pb-2 mb-4">
              Main User
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {detailItem('Name', `${agency.title} ${agency.firstName} ${agency.lastName}`)}
              {detailItem('Username', agency.userName)}
              {detailItem('Email ID', agency.emailId)}
              {detailItem('Designation', agency.designation)}
              {detailItem('Mobile', agency.mobileNumber)}
            </div>
          </section>

          {/* Financials */}
          <section>
            <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-600 pb-2 mb-4">
              Financials
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {detailItem('Currency', agency.businessCurrency)}
              {detailItem('Wallet Balance', `$${agency.walletBalance.mainBalance.toFixed(2)}`)}
              {detailItem('Available Credit', `$${agency.walletBalance.availableCredit.toFixed(2)}`)}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// ------------------------------
// MAIN PAGE COMPONENT
// ------------------------------
export default function MyAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for advanced features
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null)

  useEffect(() => {
    const fetchAgencies = async () => {
      const token =
        document.cookie.split('; ').find(r => r.startsWith('authToken='))?.split('=')[1] ||
        localStorage.getItem('authToken')

      if (!token) {
        setError('Authorization failed. Please log in again.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}sales/my-agencies`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to fetch data.')

        const result = await response.json()
        if (result.success) {
          setAgencies(result.data)
        } else {
          throw new Error(result.message)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAgencies()
  }, [])

  const handleViewDetails = (agency: Agency) => {
    setSelectedAgency(agency)
    setIsModalOpen(true)
  }

  const filteredAgencies = useMemo(() => {
    return agencies
      .filter(agency => {
        if (statusFilter === 'All') return true
        return agency.status === statusFilter.toLowerCase()
      })
      .filter(agency => {
        const search = searchTerm.toLowerCase()
        return (
          agency.agencyName.toLowerCase().includes(search) ||
          agency.email.toLowerCase().includes(search) ||
          agency.firstName.toLowerCase().includes(search) ||
          agency.lastName.toLowerCase().includes(search) ||
          agency.slug.toLowerCase().includes(search)
        )
      })
  }, [agencies, searchTerm, statusFilter])

  const getStatusClasses = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  if (loading) return <div className="text-center p-8">Loading...</div>
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>

  return (
    <>
      {isModalOpen && selectedAgency && (
        <AgencyDetailsModal agency={selectedAgency} onClose={() => setIsModalOpen(false)} />
      )}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Agencies</h1>
          <p className="text-gray-500 mt-1">Manage and view details of your agencies.</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-5">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-96 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {['All', 'Approved', 'Pending', 'Rejected'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === status
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              {/* Table headers */}
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Agency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAgencies.length > 0 ? (
                filteredAgencies.map(agency => (
                  <tr key={agency._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4"><div className="font-semibold">{agency.agencyName}</div><div className="text-xs text-gray-500">{agency.country}</div></td>
                    <td className="px-6 py-4"><div className="font-semibold">{`${agency.firstName} ${agency.lastName}`}</div><div className="text-xs text-gray-500">{agency.email}</div></td>
                    <td className="px-6 py-4 text-center"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(agency.status)}`}>{agency.status}</span></td>
                    <td className="px-6 py-4 font-mono">${agency.walletBalance.mainBalance.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleViewDetails(agency)} className="p-2 text-blue-600 hover:text-blue-800"><Eye /></button>
                      <button className="p-2 text-gray-500 hover:text-gray-800"><Edit /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-10">No agencies match your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}