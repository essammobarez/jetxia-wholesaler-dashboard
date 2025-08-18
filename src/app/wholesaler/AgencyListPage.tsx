"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Building, AlertCircle, Search, Filter, X, Phone, Mail, Globe, User, MapPin, Hash, Briefcase, Calendar, Wallet, CreditCard } from 'lucide-react';

// =================================================================
// 1. EXPANDED AGENCY INTERFACE
// =================================================================
// This interface defines the detailed structure for an agency object.
interface Agency {
  _id: string;
  agencyName: string;
  salespersonId: string | null;
  city: string;
  status: 'approved' | 'suspended' | 'pending';
  walletBalance: {
    mainBalance: number;
    availableCredit: number;
    creditExpiryDate: string | null;
  };
  logoUrl: string | null;
  slug: string;
  markup: number;
  country: string;
  postCode: string;
  address: string;
  website: string;
  phoneNumber: string;
  email: string;
  businessCurrency: string;
  vat: string;
  licenseUrl: string | null;
  title: string;
  firstName: string;
  lastName: string;
  emailId: string;
  designation: string;
  mobileNumber: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}


// =================================================================
// 2. HELPER & MODAL COMPONENTS
// =================================================================

/**
 * A reusable component for displaying a single piece of detail with an optional icon.
 * @param {React.ElementType} [icon] - The Lucide icon component to display.
 * @param {string} label - The label for the detail item.
 * @param {React.ReactNode} value - The value to display.
 */
const DetailItem = ({ icon: Icon, label, value }: { icon?: React.ElementType; label: string; value: React.ReactNode; }) => (
    <div className="flex items-start min-h-[44px]">
      {/* Icon container with fixed width for alignment */}
      <div className="w-8 flex-shrink-0 pt-1">
        {Icon && <Icon className="h-5 w-5 text-indigo-500" />}
      </div>
      {/* Text content */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
        <p className="break-words text-base text-gray-900 dark:text-white">
          {value || <span className="text-gray-400 dark:text-gray-500">N/A</span>}
        </p>
      </div>
    </div>
  );


/**
 * The Modal component to display comprehensive agency details.
 * @param {Agency} agency - The agency object to display.
 * @param {() => void} onClose - Function to call when the modal should be closed.
 */
const AgencyDetailsModal = ({ agency, onClose }: { agency: Agency; onClose: () => void; }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside the modal to close it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform scale-95 transition-transform duration-300 animate-in fade-in-0 zoom-in-95">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-xl z-10">
          <div className="flex items-center">
            <Building className="w-6 h-6 mr-3 text-indigo-500"/>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{agency.agencyName}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {/* Increased gap from gap-6 to gap-8 for more horizontal space between columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Column 1: Agency & Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200 border-b pb-2 mb-2">Agency Info</h3>
              <DetailItem icon={Hash} label="Agency Slug" value={agency.slug} />
              <DetailItem icon={MapPin} label="Address" value={`${agency.address}, ${agency.city} ${agency.postCode}, ${agency.country}`} />
              <DetailItem icon={Mail} label="Business Email" value={agency.email} />
              <DetailItem icon={Phone} label="Business Phone" value={agency.phoneNumber} />
              <DetailItem icon={Globe} label="Website" value={<a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{agency.website}</a>} />
            </div>

            {/* Column 2: Admin Contact */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200 border-b pb-2 mb-2">Admin Contact</h3>
                <DetailItem icon={User} label="Name" value={`${agency.title} ${agency.firstName} ${agency.lastName}`} />
                <DetailItem icon={Briefcase} label="Designation" value={agency.designation} />
                <DetailItem icon={Mail} label="Contact Email" value={agency.emailId} />
                <DetailItem icon={Phone} label="Contact Mobile" value={agency.mobileNumber} />
                <DetailItem icon={User} label="Username" value={agency.userName} />
            </div>

            {/* Column 3: Financial & System Info */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200 border-b pb-2 mb-2">Financial & System</h3>
                <DetailItem icon={Wallet} label="Main Balance" value={`${agency.walletBalance.mainBalance.toFixed(2)} ${agency.businessCurrency}`} />
                <DetailItem icon={CreditCard} label="Available Credit" value={`${agency.walletBalance.availableCredit.toFixed(2)} ${agency.businessCurrency}`} />
                <DetailItem icon={User} label="Sales Person ID" value={agency.salespersonId} />
                <DetailItem icon={Calendar} label="Created On" value={new Date(agency.createdAt).toLocaleDateString()} />
                <DetailItem icon={Calendar} label="Last Updated" value={new Date(agency.updatedAt).toLocaleDateString()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * A reusable component for displaying messages within the table (e.g., Error, No Data).
 */
const TableMessage = ({ icon: Icon, title, message }: { icon: React.ElementType; title: string; message: string; }) => (
  <tr>
    <td colSpan={4} className="text-center p-12">
      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <Icon className="w-12 h-12 mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
        <p>{message}</p>
      </div>
    </td>
  </tr>
);

/**
 * A skeleton row component to indicate loading state.
 */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
    </td>
  </tr>
);


// =================================================================
// 3. MAIN PAGE COMPONENT
// =================================================================
export default function AgencyListPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // State for managing the modal visibility and selected agency
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

  useEffect(() => {
    const fetchAgencies = async () => {
      setLoading(true);
      setError(null);
      try {
        // Retrieve authorization token from cookies or local storage
        const token =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("authToken="))
            ?.split("=")[1] || localStorage.getItem("authToken");

        if (!token) {
          throw new Error("Authorization token not found. Please log in again.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/wholesaler/sales-person`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setAgencies(result.data);
        } else {
          // This handles cases where the API call is successful but there's no data array
          // or a specific message indicates no agencies.
          if (result.data === null || result.data.length === 0) {
            setAgencies([]);
          } else {
            throw new Error(result.message || "Failed to parse agency data.");
          }
        }
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch agencies:", e);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data after a short delay to show loading state
    const timer = setTimeout(() => fetchAgencies(), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Memoized filtered list of agencies based on search and status filters
  const filteredAgencies = useMemo(() => {
    return agencies.filter((agency) => {
      const matchesSearch = agency.agencyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || agency.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [agencies, searchTerm, statusFilter]);

  // Helper function to get status badge styling
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'suspended':
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <>
      <main className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header + Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-0">
              Assigned Agency List
            </h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-48 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Agency Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 tracking-wide">
                  <tr>
                    <th className="px-6 py-3 w-2/5">Agency Name</th>
                    <th className="px-6 py-3 w-1/4">Sales Person ID</th>
                    <th className="px-6 py-3 w-1/5">City</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                  ) : error ? (
                    <TableMessage
                      icon={AlertCircle}
                      title="No Agency Found"
                      message={error}
                    />
                  ) : filteredAgencies.length > 0 ? (
                    filteredAgencies.map((agency) => (
                      <tr
                        key={agency._id}
                        onClick={() => setSelectedAgency(agency)}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                        >
                          <div className="flex items-center">
                            <Building className="w-5 h-5 mr-2 text-gray-400" />
                            <span className="truncate">{agency.agencyName}</span>
                          </div>
                        </th>
                        <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300 truncate">
                          {agency.salespersonId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 truncate">{agency.city}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusClass(
                              agency.status
                            )}`}
                          >
                            {agency.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <TableMessage
                      icon={X}
                      title="No Agencies Found"
                      message={searchTerm || statusFilter !== 'all' ? "No agencies match your current filters." : "There are no agencies to display."}
                    />
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Conditionally render the modal */}
      {selectedAgency && (
        <AgencyDetailsModal
          agency={selectedAgency}
          onClose={() => setSelectedAgency(null)}
        />
      )}
    </>
  );
}