"use client";

import React, { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  RefreshCw,
  Calendar,
  Percent,
  DollarSign,
  Building2,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

// Types based on the provided schema
interface Coupon {
  _id: string;
  couponCode: string;
  description: string;
  status: 'active' | 'inactive' | 'expired' | 'suspended';
  validFrom: string;
  validUntil: string;
  limit: number;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  applicableAgencies: Array<string | { _id: string; agencyName?: string; name?: string; email?: string }>; // supports API returning objects
  applicableBookingType: string[];
  createdByWholesaler: string | { _id: string; wholesalerName?: string };
  agencyUsageLimits: Array<{
    agencyId: string;
    usageLimit: number;
    usedCount?: number;
  }>;
  usedCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Agency {
  _id: string;
  name: string;
  email: string;
}

export default function ManageCoupon() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showAgencyModal, setShowAgencyModal] = useState<boolean>(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [viewLoading, setViewLoading] = useState<boolean>(false);
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Helpers to work with agency IDs (API can return IDs or objects)
  const asAgencyId = (agency: string | { _id: string; [key: string]: any }) =>
    typeof agency === 'string' ? agency : agency._id;

  // Form state
  const [formData, setFormData] = useState({
    couponCode: '',
    description: '',
    status: 'active' as 'active' | 'inactive' | 'expired' | 'suspended',
    validFrom: '',
    validUntil: '',
    limit: 1,
    discountType: 'percentage' as 'percentage' | 'fixed_amount',
    discountValue: 0,
    applicableAgencies: [] as string[],
    applicableBookingType: [] as string[],
    agencyUsageLimits: [] as Array<{ agencyId: string; usageLimit: number }>,
  });

  // Load wholesalerId from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('wholesalerId');
    setWholesalerId(stored);
  }, []);

  // Load data on mount
  useEffect(() => {
    if (wholesalerId) {
      fetchCoupons();
      fetchAgencies();
    }
  }, [wholesalerId]);

  // Filter coupons based on search and filters
  useEffect(() => {
    let filtered = coupons;

    if (searchTerm) {
      filtered = filtered.filter(
        (coupon) =>
          coupon.couponCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((coupon) => coupon.status === statusFilter);
    }

    setFilteredCoupons(filtered);
  }, [coupons, searchTerm, statusFilter]);

  const fetchCoupons = async () => {
    if (!wholesalerId) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error("Auth token missing. Please login again.");
      }

      const response = await fetch(`${API_URL}coupons`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setCoupons(data.data);
      } else {
        setError('Failed to fetch coupons');
      }
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
      setError(err.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencies = async () => {
    if (!wholesalerId) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}agency/wholesaler/${wholesalerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch agencies: ${res.status}`);
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const activeAgencies: Agency[] = json.data
          .filter((item: any) => item.status === 'approved')
          .map((item: any) => ({
            _id: item._id,
            name: item.agencyName || item.name || 'Unnamed Agency',
            email: item.email || '',
          }));

        setAgencies(activeAgencies);
      } else {
        setAgencies([]);
      }
    } catch (err) {
      console.error('Failed to fetch agencies:', err);
      setAgencies([]);
    }
  };

  const handleAddCoupon = () => {
    setFormData({
      couponCode: '',
      description: '',
      status: 'active',
      validFrom: '',
      validUntil: '',
      limit: 1,
      discountType: 'percentage',
      discountValue: 0,
      applicableAgencies: [],
      applicableBookingType: [],
      agencyUsageLimits: [],
    });
    setShowAddModal(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      couponCode: coupon.couponCode,
      description: coupon.description,
      status: coupon.status,
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      limit: coupon.limit,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      applicableAgencies: (coupon.applicableAgencies || []).map((a: any) => asAgencyId(a)),
      applicableBookingType: coupon.applicableBookingType,
      agencyUsageLimits: coupon.agencyUsageLimits,
    });
    setShowEditModal(true);
  };

  const handleViewCoupon = async (coupon: Coupon) => {
    // Open modal immediately with current row data and show loader
    setSelectedCoupon(coupon);
    setShowViewModal(true);
    setViewLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error("Auth token missing. Please login again.");
      }

      const response = await fetch(`${API_URL}coupons/${coupon._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setSelectedCoupon(data.data);
      } else {
        throw new Error('Failed to fetch coupon details');
      }
    } catch (err: any) {
      console.error('Error fetching coupon details:', err);
      setError(err.message || 'Failed to fetch coupon details');
    } finally {
      setViewLoading(false);
    }
  };

  const handleManageAgencies = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowAgencyModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'applicableBookingType') {
        const bookingType = value;
        setFormData(prev => ({
          ...prev,
          applicableBookingType: checked
            ? [...prev.applicableBookingType, bookingType]
            : prev.applicableBookingType.filter(type => type !== bookingType)
        }));
      }
    } else {
      // Convert text inputs to numbers for numeric fields
      if (name === 'limit') {
        const raw = value.trim();
        const parsed = raw === '' ? 0 : parseInt(raw, 10);
        setFormData(prev => ({ ...prev, limit: isNaN(parsed) ? 0 : parsed }));
        return;
      }
      if (name === 'discountValue') {
        const raw = value.trim();
        const parsed = raw === '' ? 0 : parseFloat(raw);
        setFormData(prev => ({ ...prev, discountValue: isNaN(parsed) ? 0 : parsed }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAgencySelection = (agencyId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      applicableAgencies: checked
        ? [...prev.applicableAgencies, agencyId]
        : prev.applicableAgencies.filter(id => id !== agencyId)
    }));
  };

  const handleAgencyUsageLimitChange = (agencyId: string, usageLimit: number) => {
    setFormData(prev => ({
      ...prev,
      agencyUsageLimits: prev.agencyUsageLimits.some(item => item.agencyId === agencyId)
        ? prev.agencyUsageLimits.map(item =>
            item.agencyId === agencyId ? { ...item, usageLimit } : item
          )
        : [...prev.agencyUsageLimits, { agencyId, usageLimit }]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wholesalerId) return;

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error("Auth token missing. Please login again.");
      }

      if (showEditModal && selectedCoupon) {
        // Keep existing edit simulation for now
        setCoupons(prev => prev.map(coupon => 
          coupon._id === selectedCoupon._id 
            ? {
                ...coupon,
                ...formData,
                couponCode: formData.couponCode.toUpperCase(),
                updatedAt: new Date().toISOString()
              }
            : coupon
        ));
      } else {
        // Real API call for create
        const createPayload = {
          couponCode: formData.couponCode.toUpperCase(),
          description: formData.description,
          validFrom: formData.validFrom,
          validUntil: formData.validUntil,
          limit: formData.limit,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          applicableBookingType: formData.applicableBookingType
        };

        const response = await fetch(`${API_URL}coupons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(createPayload)
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized. Please login again.");
          }
          const errorData = await response.json();
          throw new Error(errorData.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.data) {
          await fetchCoupons(); // Refresh the list
        } else {
          throw new Error('Failed to create coupon');
        }
      }

      setShowAddModal(false);
      setShowEditModal(false);
    } catch (err: any) {
      console.error('Error creating/updating coupon:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error("Auth token missing. Please login again.");
      }

      const newStatus = coupon.status === 'active' ? 'inactive' : 'active';

      const response = await fetch(`${API_URL}coupons/${coupon._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Refresh the coupons list
        await fetchCoupons();
      } else {
        throw new Error('Failed to update coupon status');
      }
    } catch (err: any) {
      console.error('Error updating coupon status:', err);
      setError(err.message || 'Failed to update coupon status');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate delete
      setCoupons(prev => prev.filter(coupon => coupon._id !== couponId));
    } catch (err) {
      setError('An unexpected error occurred while deleting the coupon.');
    }
  };

  const assignAgenciesToCoupon = async (coupon: Coupon) => {
    if (!coupon || !coupon._id) return;
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Auth token missing. Please login again.');
      }

      const assignments = coupon.applicableAgencies.map((agencyLike) => {
        const agencyId = asAgencyId(agencyLike as any);
        const usageLimit = coupon.agencyUsageLimits.find(
          (item) => item.agencyId === agencyId
        )?.usageLimit || 1;

        return fetch(`${API_URL}coupons/${coupon._id}/assign-agency`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ agencyId, usageLimit }),
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Failed to assign agency: ${res.status}`);
          }
          return res.json();
        });
      });

      await Promise.all(assignments);
    } catch (err) {
      console.error('Error assigning agencies to coupon:', err);
      throw err;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'inactive':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
      case 'expired':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'suspended':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      case 'suspended':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getDiscountIcon = (type: string) => {
    return type === 'percentage' ? (
      <Percent className="w-4 h-4" />
    ) : (
      <DollarSign className="w-4 h-4" />
    );
  };

  const getDiscountColor = (type: string) => {
    return type === 'percentage'
      ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      : 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
  };

  // Statistics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.status === 'active').length;
  const expiredCoupons = coupons.filter(c => c.status === 'expired').length;
  const suspendedCoupons = coupons.filter(c => c.status === 'suspended').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Coupons
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage discount coupons for your agencies
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <button
            onClick={fetchCoupons}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button
            onClick={handleAddCoupon}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Coupon
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Coupons</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCoupons}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeCoupons}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
              <p className="text-2xl font-bold text-red-600">{expiredCoupons}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
              <p className="text-2xl font-bold text-yellow-600">{suspendedCoupons}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Coupons
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Coupon Details
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Validity
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usage Limit
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Percent className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No coupons found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {searchTerm || statusFilter !== 'all'
                          ? 'Try adjusting your search criteria or filters.'
                          : 'Get started by creating your first coupon.'}
                      </p>
                      {!searchTerm && statusFilter === 'all' && (
                        <button
                          onClick={handleAddCoupon}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Create First Coupon
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {coupon.couponCode}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {coupon.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getDiscountColor(
                          coupon.discountType
                        )}`}
                      >
                        {getDiscountIcon(coupon.discountType)}
                        <span>
                          {coupon.discountValue}
                          {coupon.discountType === 'percentage' ? '%' : '$'}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          coupon.status
                        )}`}
                      >
                        {getStatusIcon(coupon.status)}
                        <span className="capitalize">{coupon.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <div>{formatDate(coupon.validFrom)}</div>
                        <div>to {formatDate(coupon.validUntil)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {coupon.limit}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleViewCoupon(coupon)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditCoupon(coupon)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleManageAgencies(coupon)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          title="Manage Agencies"
                        >
                          <Users className="w-5 h-5" />
                        </button>
                        <Switch
                          checked={coupon.status === 'active'}
                          onChange={() => handleToggleStatus(coupon)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            coupon.status === 'active' ? 'bg-green-400' : 'bg-gray-300'
                          }`}
                        >
                          <span className="sr-only">
                            {coupon.status === 'active' ? 'Deactivate' : 'Activate'} Coupon
                          </span>
                          <span 
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              coupon.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                            }`} 
                          />
                        </Switch>
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {showAddModal ? 'Add New Coupon' : 'Edit Coupon'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      name="couponCode"
                      value={formData.couponCode}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., SUMMER2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="expired">Expired</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Describe the coupon and its benefits..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valid From *
                    </label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Usage Limit *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="limit"
                      value={formData.limit === 0 ? '' : String(formData.limit)}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discount Type *
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed_amount">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discount Value *
                    </label>
                    <input
                      type="text"
                      inputMode={formData.discountType === 'percentage' ? 'decimal' : 'numeric'}
                      pattern={formData.discountType === 'percentage' ? '\\d*(\\.\\d*)?' : '[0-9]*'}
                      name="discountValue"
                      value={formData.discountValue === 0 ? '' : String(formData.discountValue)}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Booking Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Applicable Booking Types
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['hotel', 'flight', 'package', 'car', 'activity'].map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="applicableBookingType"
                          value={type}
                          checked={formData.applicableBookingType.includes(type)}
                          onChange={handleFormChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>



                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {showAddModal ? 'Create Coupon' : 'Update Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Coupon Details
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {viewLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Coupon Code
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedCoupon.couponCode}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        selectedCoupon.status
                      )}`}
                    >
                      {getStatusIcon(selectedCoupon.status)}
                      <span className="capitalize">{selectedCoupon.status}</span>
                    </span>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Description
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedCoupon.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Valid From
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedCoupon.validFrom)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Valid Until
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedCoupon.validUntil)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Usage Limit
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedCoupon.limit}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Discount
                    </label>
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getDiscountColor(
                        selectedCoupon.discountType
                      )}`}
                    >
                      {getDiscountIcon(selectedCoupon.discountType)}
                      <span>
                        {selectedCoupon.discountValue}
                        {selectedCoupon.discountType === 'percentage' ? '%' : '$'}
                      </span>
                    </span>
                  </div>
                </div>

                {selectedCoupon.applicableBookingType.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Applicable Booking Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCoupon.applicableBookingType.map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full capitalize"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCoupon.applicableAgencies.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Applicable Agencies
                    </label>
                    <div className="space-y-2">
                      {selectedCoupon.applicableAgencies.map((agencyLike: any) => {
                        const agencyId = asAgencyId(agencyLike);
                        const agencyName = typeof agencyLike === 'string' ? undefined : (agencyLike.agencyName || agencyLike.name);
                        const agency = agencies.find(a => a._id === agencyId);
                        const usageLimit = selectedCoupon.agencyUsageLimits.find(
                          item => item.agencyId === agencyId
                        )?.usageLimit;
                        return (
                          <div key={agencyId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {agencyName || agency?.name || 'Unknown Agency'}
                            </span>
                            {usageLimit && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Limit: {usageLimit}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Created At
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedCoupon.createdAt)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Last Updated
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedCoupon.updatedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agency Management Modal */}
      {showAgencyModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Manage Agencies for {selectedCoupon.couponCode}
                </h2>
                <button
                  onClick={() => setShowAgencyModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Applicable Agencies
                  </label>
                  <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    {agencies.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No agencies available
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {agencies.map((agency) => {
                          const selectedIds = selectedCoupon.applicableAgencies.map((a: any) => asAgencyId(a));
                          const isSelected = selectedIds.includes(agency._id);
                          const usageLimit = selectedCoupon.agencyUsageLimits.find(
                            item => item.agencyId === agency._id
                          )?.usageLimit || 0;
                          
                          return (
                            <div key={agency._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setSelectedCoupon(prev => {
                                      if (!prev) return prev;
                                      const currentIds = prev.applicableAgencies.map((a: any) => asAgencyId(a));
                                      const nextIds = checked
                                        ? Array.from(new Set([...currentIds, agency._id]))
                                        : currentIds.filter(id => id !== agency._id);
                                      const nextUsageLimits = checked
                                        ? (prev.agencyUsageLimits.some(item => item.agencyId === agency._id)
                                          ? prev.agencyUsageLimits
                                          : [...prev.agencyUsageLimits, { agencyId: agency._id, usageLimit: 1 }])
                                        : prev.agencyUsageLimits.filter(item => item.agencyId !== agency._id);
                                      return {
                                        ...prev,
                                        applicableAgencies: nextIds,
                                        agencyUsageLimits: nextUsageLimits,
                                      };
                                    });
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {agency.name}
                                  </span>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {agency.email}
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="flex items-center space-x-2">
                                  <label className="text-xs text-gray-500 dark:text-gray-400">
                                    Usage Limit:
                                  </label>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={usageLimit === 0 ? '' : String(usageLimit)}
                                    onChange={(e) => {
                                      const raw = e.target.value.trim();
                                      const newLimit = raw === '' ? 0 : parseInt(raw, 10);
                                      setSelectedCoupon(prev => {
                                        if (!prev) return prev;
                                        return {
                                          ...prev,
                                          agencyUsageLimits: prev.agencyUsageLimits.map(item =>
                                            item.agencyId === agency._id
                                              ? { ...item, usageLimit: isNaN(newLimit) ? 0 : newLimit }
                                              : item
                                          )
                                        };
                                      });
                                    }}
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {selectedCoupon.applicableAgencies.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selected Agencies Summary
                    </label>
                    <div className="space-y-2">
                      {selectedCoupon.applicableAgencies.map((agencyLike: any) => {
                        const agencyId = asAgencyId(agencyLike);
                        const agencyName = typeof agencyLike === 'string' ? undefined : (agencyLike.agencyName || agencyLike.name);
                        const agency = agencies.find(a => a._id === agencyId);
                        const usageLimit = selectedCoupon.agencyUsageLimits.find(
                          item => item.agencyId === agencyId
                        )?.usageLimit;
                        return (
                          <div key={agencyId} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/30 rounded">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {agencyName || agency?.name || 'Unknown Agency'}
                            </span>
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              Limit: {usageLimit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAgencyModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!selectedCoupon) return;
                    setIsAssigning(true);
                    setError('');
                    try {
                      await assignAgenciesToCoupon(selectedCoupon);
                      await fetchCoupons();
                      setShowAgencyModal(false);
                    } catch (err: any) {
                      setError(err?.message || 'Failed to assign agencies');
                    } finally {
                      setIsAssigning(false);
                    }
                  }}
                  disabled={isAssigning}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAssigning && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
