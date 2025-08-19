"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Building, AlertCircle, Search, X, Phone, Mail, Globe, User, MapPin, Hash, Briefcase, Calendar, Wallet, CreditCard, ChevronRight } from 'lucide-react';

// =================================================================
// 1. EXPANDED AGENCY INTERFACE
// =================================================================
// This interface defines the detailed structure for an agency object.
interface Agency {
  _id: string;
  agencyName: string;
  salespersonId: {
    _id: string;
    username: string;
    email: string;
  } | null;
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
    <div className="w-8 flex-shrink-0 pt-1">
      {Icon && <Icon className="h-5 w-5 text-indigo-500" />}
    </div>
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const formattedSalespersonName = agency.salespersonId ? 
    agency.salespersonId.username
      .split('.')
      .map(namePart => namePart.charAt(0).toUpperCase() + namePart.slice(1))
      .join(' ') : 'N/A';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform scale-95 transition-transform duration-300 animate-in fade-in-0 zoom-in-95">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-xl z-10">
          <div className="flex items-center">
            <Building className="w-6 h-6 mr-3 text-indigo-500"/>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{agency.agencyName}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200 border-b pb-2 mb-2">Agency Info</h3>
              <DetailItem icon={Hash} label="Agency Slug" value={agency.slug} />
              <DetailItem icon={MapPin} label="Address" value={`${agency.address}, ${agency.city} ${agency.postCode}, ${agency.country}`} />
              <DetailItem icon={Mail} label="Business Email" value={agency.email} />
              <DetailItem icon={Phone} label="Business Phone" value={agency.phoneNumber} />
              <DetailItem icon={Globe} label="Website" value={<a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{agency.website}</a>} />
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200 border-b pb-2 mb-2">Admin Contact</h3>
                <DetailItem icon={User} label="Name" value={`${agency.title} ${agency.firstName} ${agency.lastName}`} />
                <DetailItem icon={Briefcase} label="Designation" value={agency.designation} />
                <DetailItem icon={Mail} label="Contact Email" value={agency.emailId} />
                <DetailItem icon={Phone} label="Contact Mobile" value={agency.mobileNumber} />
                <DetailItem icon={User} label="Username" value={agency.userName} />
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200 border-b pb-2 mb-2">Financial & System</h3>
                <DetailItem icon={Wallet} label="Main Balance" value={`${agency.walletBalance.mainBalance.toFixed(2)} ${agency.businessCurrency}`} />
                <DetailItem icon={CreditCard} label="Available Credit" value={`${agency.walletBalance.availableCredit.toFixed(2)} ${agency.businessCurrency}`} />
                <DetailItem icon={User} label="Sales Person" value={formattedSalespersonName} />
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
  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-12">
    <Icon className="w-12 h-12 mb-4 text-gray-400" />
    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
    <p>{message}</p>
  </div>
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
  
  const [salespersons, setSalespersons] = useState<
    { username: string; formattedName: string; count: number }[]
  >([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

  // Helper function to format salesperson username
  const formatSalespersonName = (username: string) => {
    if (!username) return 'N/A';
    return username
      .split('.')
      .map(namePart => namePart.charAt(0).toUpperCase() + namePart.slice(1))
      .join(' ');
  };
  
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

  useEffect(() => {
    const fetchAgencies = async () => {
      setLoading(true);
      setError(null);
      try {
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
          
          const salespersonMap = new Map<string, number>();
          result.data.forEach((agency: Agency) => {
            const username = agency.salespersonId?.username;
            if (username) {
              salespersonMap.set(username, (salespersonMap.get(username) || 0) + 1);
            }
          });
          
          const uniqueSalespersons = Array.from(salespersonMap.keys()).map(username => ({
            username,
            formattedName: formatSalespersonName(username),
            count: salespersonMap.get(username) || 0,
          }));
          setSalespersons(uniqueSalespersons);
        } else {
          if (result.data === null || result.data.length === 0) {
            setAgencies([]);
            setSalespersons([]);
          } else {
            throw new Error(result.message || "Failed to parse agency data.");
          }
        }
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch agencies:", e);
        setAgencies([]);
        setSalespersons([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => fetchAgencies(), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredAgencies = useMemo(() => {
    if (!selectedSalesperson) {
      return [];
    }
    return agencies.filter(agency => agency.salespersonId?.username === selectedSalesperson);
  }, [agencies, selectedSalesperson]);


  return (
    <>
      <main className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Left Panel: Salespersons List */}
          <aside className="w-full lg:w-1/4 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2">Sales Persons</h2>
            {loading ? (
              <ul className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <li key={i} className="flex items-center space-x-2 animate-pulse">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : error ? (
              <TableMessage icon={AlertCircle} title="Error" message={error} />
            ) : salespersons.length > 0 ? (
              <ul className="space-y-2">
                {salespersons.map(sp => (
                  <li
                    key={sp.username}
                    onClick={() => setSelectedSalesperson(sp.username)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 ${selectedSalesperson === sp.username ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-3" />
                      <span>{sp.formattedName} ({sp.count})</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </li>
                ))}
              </ul>
            ) : (
              <TableMessage icon={AlertCircle} title="No Sales Persons" message="No salespersons found." />
            )}
          </aside>

          {/* Right Panel: Agencies Table */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Agencies
            </h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 tracking-wide">
                    <tr>
                      <th className="px-6 py-3 w-2/5">Agency Name</th>
                      <th className="px-6 py-3 w-1/4">City</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!selectedSalesperson ? (
                      <tr>
                        <td colSpan={3} className="text-center p-12">
                          <TableMessage
                            icon={AlertCircle}
                            title="Select a Sales Person"
                            message="Please select a sales person from the list on the left to view their assigned agencies."
                          />
                        </td>
                      </tr>
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
                      <tr>
                        <td colSpan={3} className="text-center p-12">
                          <TableMessage
                            icon={X}
                            title="No Agencies Found"
                            message="This sales person has no agencies assigned."
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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