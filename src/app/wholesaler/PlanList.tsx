'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronDown, ChevronUp, RefreshCw, Search as SearchIcon } from 'lucide-react';

interface Markup {
  provider: string;
  type: 'percentage' | 'fixed'; // adjust if other types exist
  value: number;
  _id: string;
}

interface PlanAPI {
  _id: string;
  name: string;
  service: string;
  createdBy: string;
  markups: Markup[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // ...other fields if present
}

type SortOption =
  | 'name_asc'
  | 'name_desc'
  | 'createdAsc'
  | 'createdDesc';

export default function PlanListAdvanced() {
  // Plans data + its loading/error states
  const [plans, setPlans] = useState<PlanAPI[]>([]);
  const [planLoading, setPlanLoading] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Controls for search/filter/sort
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('createdDesc');

  // Wholesaler ID state + loading/error for retrieving it
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);
  const [wholesalerLoading, setWholesalerLoading] = useState<boolean>(true);
  const [wholesalerError, setWholesalerError] = useState<string | null>(null);

  // On mount: load wholesalerId from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wholesalerId');
      if (stored) {
        setWholesalerId(stored);
      } else {
        setWholesalerError('No wholesaler ID found in localStorage.');
      }
    } catch (err) {
      console.error('Error accessing localStorage for wholesalerId:', err);
      setWholesalerError('Unable to read wholesaler ID from localStorage.');
    } finally {
      setWholesalerLoading(false);
    }
  }, []);

  // Fetch plans function, depends on wholesalerId
  const fetchPlans = useCallback(async () => {
    if (!wholesalerId) {
      setPlanError('Wholesaler ID not available');
      return;
    }
    setPlanLoading(true);
    setPlanError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!baseUrl) {
        throw new Error('Missing NEXT_PUBLIC_BACKEND_URL environment variable');
      }
      // Ensure no trailing slash
      const url = `${baseUrl.replace(/\/+$/, '')}/markup/plans/wholesaler/${wholesalerId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header here if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        setPlans(json.data);
      } else {
        const msg = json.message || 'Unexpected API response';
        throw new Error(msg);
      }
    } catch (err: any) {
      console.error('Error fetching plans:', err);
      setPlanError(err.message || 'Failed to fetch plans');
    } finally {
      setPlanLoading(false);
    }
  }, [wholesalerId]);

  // When wholesalerId becomes available (and not in error), trigger fetchPlans
  useEffect(() => {
    if (!wholesalerLoading && wholesalerId) {
      fetchPlans();
    }
    // If wholesalerLoading is false and wholesalerId is null, we won't fetch
  }, [wholesalerLoading, wholesalerId, fetchPlans]);

  // Filtered & sorted plans
  const filteredSortedPlans = useMemo(() => {
    let filtered = plans;

    // Filter by search term (name or service)
    if (searchTerm.trim()) {
      const lower = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        plan =>
          plan.name.toLowerCase().includes(lower) ||
          plan.service.toLowerCase().includes(lower)
      );
    }

    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter(plan => plan.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(plan => !plan.isActive);
    }

    // Sort
    filtered = filtered.slice(); // clone to avoid mutating original
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'createdAsc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'createdDesc':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [plans, searchTerm, statusFilter, sortOption]);

  // Handlers for controls
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
  };
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
  };

  // Render logic
  // 1. If still loading wholesalerId
  if (wholesalerLoading) {
    return (
      <div className="w-full mx-auto p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">Loading configuration...</p>
      </div>
    );
  }
  // 2. If error loading wholesalerId
  if (wholesalerError) {
    return (
      <div className="w-full mx-auto p-6">
        <p className="text-red-600 dark:text-red-400">
          Error: {wholesalerError}
        </p>
        {/* Optionally, allow user to retry or enter ID manually */}
        <button
          onClick={() => {
            setWholesalerLoading(true);
            setWholesalerError(null);
            try {
              const stored = localStorage.getItem('wholesalerId');
              if (stored) {
                setWholesalerId(stored);
              } else {
                setWholesalerError('No wholesaler ID found in localStorage.');
              }
            } catch (err) {
              console.error('Error re-reading localStorage for wholesalerId:', err);
              setWholesalerError('Unable to read wholesaler ID from localStorage.');
            } finally {
              setWholesalerLoading(false);
            }
          }}
          className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </button>
      </div>
    );
  }

  // 3. If fetching plans
  if (planLoading) {
    return (
      <div className="w-full mx-auto p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">Loading plans...</p>
      </div>
    );
  }
  // 4. If error fetching plans
  if (planError) {
    return (
      <div className="w-full mx-auto p-6">
        <p className="text-red-600 dark:text-red-400">Error loading plans: {planError}</p>
        <button
          onClick={fetchPlans}
          className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </button>
      </div>
    );
  }

  // 5. Main UI once wholesalerId is loaded and plans fetched
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div
        className="mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow
                   // max-w-6xl
                   "
      >
        {/* Header & controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Plans ({filteredSortedPlans.length})
          </h2>
          <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-3 lg:space-y-0 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {/* Sort */}
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdDesc">Newest First</option>
              <option value="createdAsc">Oldest First</option>
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
            </select>
            {/* Refresh */}
            <button
              onClick={fetchPlans}
              className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              title="Refresh plans"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* If no plans after filtering */}
        {filteredSortedPlans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">No plans match the criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSortedPlans.map(plan => {
              // Prepare markup details
              const markupDetails = plan.markups.map(m => {
                if (m.type === 'percentage') {
                  return `${m.value}% (provider: ${m.provider})`;
                }
                // For fixed type, you might format as currency; adjust locale/currency as needed
                return `${m.value} (provider: ${m.provider})`;
              });

              return (
                <Disclosure
                  key={plan._id}
                  as="div"
                  className="border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg focus:outline-none">
                        <div className="flex flex-col text-left">
                          <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                            {plan.name}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Service: <span className="font-medium">{plan.service}</span>
                            {' • '}
                            Status:{' '}
                            <span
                              className={
                                plan.isActive
                                  ? 'text-green-600 bg-green-200 p-1 rounded-sm dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }
                            >
                              {plan.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </span>
                        </div>
                        <span className="ml-2">
                          {open ? (
                            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          )}
                        </span>
                      </Disclosure.Button>

                      <Disclosure.Panel className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                        {/* Created/Updated */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                          <div>
                            <span className="font-medium">Created:</span>{' '}
                            {new Date(plan.createdAt).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Updated:</span>{' '}
                            {new Date(plan.updatedAt).toLocaleString()}
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-medium">Plan ID:</span> {plan._id}
                          </div>
                        </div>
                        {/* Markup details */}
                        <div className="mb-3">
                          <span className="font-medium text-gray-800 dark:text-gray-100">
                            Markups:
                          </span>
                          {markupDetails.length > 0 ? (
                            <ul className="list-disc list-inside mt-1 text-gray-600 dark:text-gray-300">
                              {markupDetails.map((md, idx) => (
                                <li key={idx}>{md}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1 text-gray-600 dark:text-gray-300">No markups.</p>
                          )}
                        </div>
                        {/* Future: add buttons for edit/delete, etc. */}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
