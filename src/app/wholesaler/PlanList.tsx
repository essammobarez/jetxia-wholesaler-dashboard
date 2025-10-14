'use client';
import React, { useEffect, useState, useMemo, useCallback, Fragment } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDown, ChevronUp, RefreshCw, Search as SearchIcon, Edit, Trash2, Loader2, X, Wrench, AlertTriangle } from 'lucide-react';

// --- INTERFACES AND TYPES ---
interface Markup {
  provider: {
    _id: string;
    name: string;
  } | null;
  type: 'percentage' | 'fixed';
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
}

type SortOption = 'name_asc' | 'name_desc' | 'createdAsc' | 'createdDesc';

// --- MODAL COMPONENT: EditMarkupsModal ---
interface EditMarkupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: () => void;
  plan: PlanAPI | null;
}

const EditMarkupsModal: React.FC<EditMarkupsModalProps> = ({ isOpen, onClose, onUpdateSuccess, plan }) => {
  const [markupValues, setMarkupValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && plan?.markups) {
      const initialValues = plan.markups.reduce((acc, markup) => {
        acc[markup._id] = String(markup.value);
        return acc;
      }, {} as Record<string, string>);
      setMarkupValues(initialValues);
    } else if (!isOpen) {
      setTimeout(() => {
          setMarkupValues({});
          setIsSubmitting(false);
          setError(null);
      }, 300);
    }
  }, [isOpen, plan]);

  const handleValueChange = (markupId: string, value: string) => {
    setMarkupValues(prev => ({ ...prev, [markupId]: value }));
  };

  const handleBulkUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        markups: Object.entries(markupValues).map(([markupId, value]) => {
          const numValue = Number(value);
          if (isNaN(numValue) || value.trim() === '') {
            throw new Error(`Invalid value for one of the markups. Please enter valid numbers.`);
          }
          return { markupId, value: numValue };
        }),
      };

      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!baseUrl) {
        throw new Error('Missing NEXT_PUBLIC_BACKEND_URL environment variable');
      }
      const url = `${baseUrl.replace(/\/+$/, '')}/markup/${plan._id}/markups/bulk-update`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      onUpdateSuccess();
    } catch (err: any) {
      console.error('Failed to bulk update markups:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-60" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true"></span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
              <form onSubmit={handleBulkUpdateSubmit}>
                {/* Modal Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <Wrench className="w-4 h-4 mr-2 text-blue-500" />
                    Edit Markups
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="px-4 py-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Plan: <strong className="text-gray-700 dark:text-gray-200">{plan?.name}</strong>
                    </p>
                  {error && <p className="text-red-600 bg-red-100 dark:bg-red-900/50 p-2 rounded-md mb-3 text-xs">{error}</p>}
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2 -mr-2">
                    {plan?.markups && plan.markups.length > 0 ? (
                      plan.markups.map((markup) => (
                        <div key={markup._id} className="p-2 rounded-md flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                          <label htmlFor={`markup-${markup._id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 w-2/5 truncate">
                            {markup.provider?.name || 'N/A'}
                          </label>
                          <div className="relative flex-grow ml-3">
                            <input
                              id={`markup-${markup._id}`}
                              type="number"
                              step="0.01"
                              value={markupValues[markup._id] || ''}
                              onChange={(e) => handleValueChange(markup._id, e.target.value)}
                              className="w-full pl-2 pr-6 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              placeholder="e.g., 10"
                              required
                            />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 text-sm pointer-events-none">%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">No markups found.</p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end items-center px-4 py-3 space-x-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  {plan?.markups && plan.markups.length > 0 && (
                      <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center w-32 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:bg-blue-400"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </div>
    </Transition>
  );
};

// --- MODAL COMPONENT: DeleteConfirmationModal ---
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (markupIdsToDelete: string[]) => void;
  plan: PlanAPI | null;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  plan,
  isDeleting,
}) => {
  const [selectedMarkups, setSelectedMarkups] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedMarkups([]);
    }
  }, [isOpen]);

  const handleCheckboxChange = (markupId: string) => {
    setSelectedMarkups(prev =>
      prev.includes(markupId)
        ? prev.filter(id => id !== markupId)
        : [...prev, markupId]
    );
  };

  if (!isOpen || !plan) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="min-h-screen px-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                <div className="fixed inset-0 bg-black bg-opacity-60" />
            </Transition.Child>
            <span className="inline-block h-screen align-middle" aria-hidden="true"></span>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <div className="inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                            Confirm Deletion
                        </h3>
                       <button type="button" onClick={onClose} className="p-1 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          You are about to delete markups from the plan "<strong>{plan.name}</strong>". Select the suppliers you wish to remove. This action cannot be undone.
                        </p>

                        <div className="border border-gray-200 dark:border-gray-600 rounded-md max-h-60 overflow-y-auto">
                           <div className="space-y-1 p-3">
                            {plan.markups.length > 0 ? (
                                plan.markups.map(markup => (
                                    <label key={markup._id} htmlFor={`delete-markup-${markup._id}`} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                        <div className="flex items-center">
                                             <input
                                                id={`delete-markup-${markup._id}`}
                                                type="checkbox"
                                                checked={selectedMarkups.includes(markup._id)}
                                                onChange={() => handleCheckboxChange(markup._id)}
                                                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                            />
                                            <span className="ml-3 text-sm font-medium text-gray-800 dark:text-gray-200">{markup.provider?.name || 'N/A'}</span>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">{markup.value}%</span>
                                    </label>
                                ))
                            ) : (
                                <p className="text-center text-sm text-gray-500 py-4">No markups found in this plan.</p>
                            )}
                           </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center px-6 py-4 space-x-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                       <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50">
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(selectedMarkups)}
                            disabled={isDeleting || selectedMarkups.length === 0}
                            className="inline-flex items-center justify-center w-36 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : `Delete (${selectedMarkups.length})`}
                        </button>
                    </div>
                </div>
            </Transition.Child>
        </div>
      </div>
    </Transition>
  );
};


// --- MAIN COMPONENT: PlanListAdvanced ---
export default function PlanListAdvanced() {
  const [plans, setPlans] = useState<PlanAPI[]>([]);
  const [planLoading, setPlanLoading] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('createdDesc');
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);
  const [wholesalerLoading, setWholesalerLoading] = useState<boolean>(true);
  const [wholesalerError, setWholesalerError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanAPI | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const url = `${baseUrl.replace(/\/+$/, '')}/markup/plans/wholesaler/${wholesalerId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
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

  useEffect(() => {
    if (!wholesalerLoading && wholesalerId) {
      fetchPlans();
    }
  }, [wholesalerLoading, wholesalerId, fetchPlans]);

  const filteredSortedPlans = useMemo(() => {
    let filtered = plans.filter(plan => plan.markups && plan.markups.length > 0);

    if (searchTerm.trim()) {
      const lower = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        plan =>
          plan.name.toLowerCase().includes(lower) ||
          plan.service.toLowerCase().includes(lower)
      );
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter(plan => plan.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(plan => !plan.isActive);
    }

    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'createdAsc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'createdDesc': default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return filtered;
  }, [plans, searchTerm, statusFilter, sortOption]);

  const handleOpenEditModal = (plan: PlanAPI) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };
 
  const handleOpenDeleteModal = (plan: PlanAPI) => {
    setSelectedPlan(plan);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setSelectedPlan(null);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  const handleUpdateSuccess = () => {
    handleCloseModals();
    fetchPlans();
  };
 
  const handleConfirmDelete = async (markupIdsToDelete: string[]) => {
    if (!selectedPlan || markupIdsToDelete.length === 0) return;

    setIsDeleting(true);
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!baseUrl) {
            throw new Error('Missing NEXT_PUBLIC_BACKEND_URL environment variable');
        }

        const planId = selectedPlan._id;
        // **UPDATED ENDPOINT HERE**
        const url = `${baseUrl.replace(/\/+$/, '')}/markup/${planId}/markups/bulk-remove`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markupIds: markupIdsToDelete }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to delete markups (HTTP ${response.status})`);
        }
        
        fetchPlans(); // Refresh the data
        handleCloseModals();

    } catch (error: any) {
        console.error('Error deleting markups:', error);
        alert(`Error: ${error.message}`);
    } finally {
        setIsDeleting(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSortOption(e.target.value as SortOption);

  if (wholesalerLoading) {
    return <div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading configuration...</div>;
  }

  if (wholesalerError) {
    return (
      <div className="p-6">
        <p className="text-red-600 dark:text-red-400">Error: {wholesalerError}</p>
        <button onClick={() => window.location.reload()} className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </button>
      </div>
    );
  }

  if (planLoading) {
    return <div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading plans...</div>;
  }

  if (planError) {
    return (
      <div className="p-6">
        <p className="text-red-600 dark:text-red-400">Error loading plans: {planError}</p>
        <button onClick={fetchPlans} className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Plans ({filteredSortedPlans.length})
          </h2>
          <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-3 lg:space-y-0 w-full lg:w-auto">
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
            <select value={statusFilter} onChange={handleStatusFilterChange} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select value={sortOption} onChange={handleSortChange} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="createdDesc">Newest First</option>
              <option value="createdAsc">Oldest First</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
            </select>
            <button onClick={fetchPlans} className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md" title="Refresh plans">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredSortedPlans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">No plans match the criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSortedPlans.map(plan => (
              <Disclosure key={plan._id} as="div" className="border border-gray-200 dark:border-gray-700 rounded-lg">
                {({ open }) => (
                  <>
                    <Disclosure.Button className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg focus:outline-none">
                      <div className="text-left flex-grow">
                        <span className="text-lg font-medium text-gray-800 dark:text-gray-100">{plan.name}</span>
                        <span className="block text-sm text-gray-600 dark:text-gray-300">
                          Service: <span className="font-medium">{plan.service}</span> | Status:{' '}
                          <span className={plan.isActive ? 'text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs dark:bg-green-900 dark:text-green-300' : 'text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs dark:bg-red-900 dark:text-red-300'}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenEditModal(plan); }} 
                          className="p-2 rounded-md text-blue-600 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800"
                          title="Edit Markups"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(plan); }} 
                          className="p-2 rounded-md text-red-600 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-800"
                          title="Delete Markups"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="pl-2">
                          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </span>
                      </div>
                    </Disclosure.Button>

                    <Disclosure.Panel className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                        <div><span className="font-medium">Created:</span> {new Date(plan.createdAt).toLocaleString()}</div>
                        <div><span className="font-medium">Updated:</span> {new Date(plan.updatedAt).toLocaleString()}</div>
                        <div className="md:col-span-2"><span className="font-medium">Plan ID:</span> {plan._id}</div>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Markups:</span>
                        {plan.markups.length > 0 ? (
                          <ul className="list-disc list-inside mt-1">
                            {plan.markups.map((m, idx) => <li key={idx}>{m.type === 'percentage' ? `${m.value}%` : m.value} ({m.provider?.name ?? 'N/A'})</li>)}
                          </ul>
                        ) : <p className="mt-1">No markups.</p>}
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        )}
      </div>

      <EditMarkupsModal isOpen={isEditModalOpen} onClose={handleCloseModals} onUpdateSuccess={handleUpdateSuccess} plan={selectedPlan} />
      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={handleCloseModals} onConfirm={handleConfirmDelete} plan={selectedPlan} isDeleting={isDeleting} />
    </div>
  );
}