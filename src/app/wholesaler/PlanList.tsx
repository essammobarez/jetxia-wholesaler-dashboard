'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronDown, ChevronUp, RefreshCw, Search as SearchIcon, Edit, Trash2, Loader2 } from 'lucide-react';

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
  const [editingMarkup, setEditingMarkup] = useState<Markup | null>(null);
  const [markupValue, setMarkupValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setEditingMarkup(null);
      setMarkupValue('');
      setIsSubmitting(false);
      setError(null);
    }
  }, [isOpen]);

  const handleEditClick = (markup: Markup) => {
    setEditingMarkup(markup);
    setMarkupValue(String(markup.value));
    setError(null);
  };

  const handleCancelClick = () => {
    setEditingMarkup(null);
    setMarkupValue('');
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || !editingMarkup) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!baseUrl) {
        throw new Error('Missing NEXT_PUBLIC_BACKEND_URL environment variable');
      }
      const url = `${baseUrl.replace(/\/+$/, '')}/markup/${plan._id}/markup/${editingMarkup._id}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: Number(markupValue) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      onUpdateSuccess();
    } catch (err: any) {
      console.error('Failed to update markup:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Edit Markups for: {plan.name}
        </h2>
        {error && <p className="text-red-500 bg-red-100 dark:bg-red-900 p-3 rounded-md mb-4">{error}</p>}
        <div className="space-y-3">
          {plan.markups.length > 0 ? (
            plan.markups.map((markup) => (
              <div key={markup._id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                {editingMarkup?._id === markup._id ? (
                  <form onSubmit={handleSaveSubmit} className="flex items-center justify-between space-x-2">
                    <div className="flex-grow">
                      <label className="sr-only" htmlFor={`markup-${markup._id}`}>
                        {markup.provider?.name || 'N/A'} Value
                      </label>
                      <div className="relative">
                        <input
                          id={`markup-${markup._id}`}
                          type="number"
                          value={markupValue}
                          onChange={(e) => setMarkupValue(e.target.value)}
                          className="w-full pl-3 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="e.g., 15"
                          required
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">%</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button type="submit" disabled={isSubmitting} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                      </button>
                      <button type="button" onClick={handleCancelClick} className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{markup.provider?.name || 'N/A'}</span>:
                      <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-gray-50">{markup.value}%</span>
                    </div>
                    <button onClick={() => handleEditClick(markup)} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800">
                      <Edit className="w-4 h-4 mr-1.5" /> Edit
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No markups found for this plan.</p>
          )}
        </div>
        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


// --- MODAL COMPONENT: DeleteConfirmationModal ---
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Confirm Deletion
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete the plan "<strong>{plan.name}</strong>"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center justify-center px-4 py-2 w-28 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
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
    // Filter out plans that have no markups first
    let filtered = plans.filter(plan => plan.markups && plan.markups.length > 0);

    // Then apply other existing filters
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
  
  const handleConfirmDelete = async () => {
    if (!selectedPlan) return;

    const markupId = selectedPlan.markups[0]?._id; 
    if (!markupId) {
        console.error("Cannot delete plan: No associated markup ID found.");
        alert("Error: This plan does not have a deletable markup rule.");
        handleCloseModals();
        return;
    }

    setIsDeleting(true);
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!baseUrl) {
            throw new Error('Missing NEXT_PUBLIC_BACKEND_URL environment variable');
        }

        const planId = selectedPlan._id;
        const url = `${baseUrl.replace(/\/+$/, '')}/markup/${planId}/markup/${markupId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to delete plan (HTTP ${response.status})`);
        }
        
        fetchPlans();
        handleCloseModals();

    } catch (error: any) {
        console.error('Error deleting plan:', error);
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
                          title="Delete Plan"
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