"use client";

import React, { useState, useEffect } from 'react';
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
  applicableAgencies: string[];
  applicableBookingType: string[];
  createdByWholesaler: string;
  agencyUsageLimits: Array<{
    agencyId: string;
    usageLimit: number;
  }>;
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
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

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
      // Dummy data for testing
      const dummyCoupons: Coupon[] = [
        {
          _id: '1',
          couponCode: 'SUMMER2024',
          description: 'Summer vacation discount for all bookings',
          status: 'active',
          validFrom: '2024-06-01T00:00:00.000Z',
          validUntil: '2024-08-31T23:59:59.000Z',
          limit: 100,
          discountType: 'percentage',
          discountValue: 15,
          applicableAgencies: ['agency1', 'agency2'],
          applicableBookingType: ['hotel', 'flight', 'package'],
          createdByWholesaler: wholesalerId,
          agencyUsageLimits: [
            { agencyId: 'agency1', usageLimit: 50 },
            { agencyId: 'agency2', usageLimit: 30 }
          ],
          createdAt: '2024-05-15T10:00:00.000Z',
          updatedAt: '2024-05-15T10:00:00.000Z'
        },
        {
          _id: '2',
          couponCode: 'WELCOME10',
          description: 'Welcome bonus for new customers',
          status: 'active',
          validFrom: '2024-01-01T00:00:00.000Z',
          validUntil: '2024-12-31T23:59:59.000Z',
          limit: 500,
          discountType: 'fixed_amount',
          discountValue: 50,
          applicableAgencies: ['agency1', 'agency3'],
          applicableBookingType: ['hotel'],
          createdByWholesaler: wholesalerId,
          agencyUsageLimits: [
            { agencyId: 'agency1', usageLimit: 200 },
            { agencyId: 'agency3', usageLimit: 150 }
          ],
          createdAt: '2024-01-01T08:00:00.000Z',
          updatedAt: '2024-01-01T08:00:00.000Z'
        },
        {
          _id: '3',
          couponCode: 'EXPIRED20',
          description: 'Expired promotional coupon',
          status: 'expired',
          validFrom: '2024-03-01T00:00:00.000Z',
          validUntil: '2024-03-31T23:59:59.000Z',
          limit: 50,
          discountType: 'percentage',
          discountValue: 20,
          applicableAgencies: ['agency2'],
          applicableBookingType: ['flight', 'car'],
          createdByWholesaler: wholesalerId,
          agencyUsageLimits: [
            { agencyId: 'agency2', usageLimit: 25 }
          ],
          createdAt: '2024-02-15T12:00:00.000Z',
          updatedAt: '2024-02-15T12:00:00.000Z'
        },
        {
          _id: '4',
          couponCode: 'SUSPENDED',
          description: 'Temporarily suspended coupon',
          status: 'suspended',
          validFrom: '2024-04-01T00:00:00.000Z',
          validUntil: '2024-06-30T23:59:59.000Z',
          limit: 75,
          discountType: 'percentage',
          discountValue: 25,
          applicableAgencies: ['agency1', 'agency2', 'agency3'],
          applicableBookingType: ['package', 'activity'],
          createdByWholesaler: wholesalerId,
          agencyUsageLimits: [
            { agencyId: 'agency1', usageLimit: 30 },
            { agencyId: 'agency2', usageLimit: 25 },
            { agencyId: 'agency3', usageLimit: 20 }
          ],
          createdAt: '2024-03-20T14:30:00.000Z',
          updatedAt: '2024-03-20T14:30:00.000Z'
        },
        {
          _id: '5',
          couponCode: 'INACTIVE5',
          description: 'Inactive test coupon',
          status: 'inactive',
          validFrom: '2024-05-01T00:00:00.000Z',
          validUntil: '2024-07-31T23:59:59.000Z',
          limit: 25,
          discountType: 'fixed_amount',
          discountValue: 25,
          applicableAgencies: ['agency3'],
          applicableBookingType: ['car'],
          createdByWholesaler: wholesalerId,
          agencyUsageLimits: [
            { agencyId: 'agency3', usageLimit: 15 }
          ],
          createdAt: '2024-04-25T09:15:00.000Z',
          updatedAt: '2024-04-25T09:15:00.000Z'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCoupons(dummyCoupons);
    } catch (err) {
      setError('Failed to fetch coupons. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencies = async () => {
    if (!wholesalerId) return;

    try {
      // Dummy data for testing
      const dummyAgencies: Agency[] = [
        {
          _id: 'agency1',
          name: 'Travel Pro Agency',
          email: 'contact@travelpro.com'
        },
        {
          _id: 'agency2',
          name: 'Global Travel Solutions',
          email: 'info@globaltravel.com'
        },
        {
          _id: 'agency3',
          name: 'Elite Travel Services',
          email: 'support@elitetravel.com'
        },
        {
          _id: 'agency4',
          name: 'Budget Travel Co.',
          email: 'hello@budgettravel.com'
        },
        {
          _id: 'agency5',
          name: 'Luxury Travel Partners',
          email: 'contact@luxurytravel.com'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setAgencies(dummyAgencies);
    } catch (err) {
      console.error('Failed to fetch agencies:', err);
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
      applicableAgencies: coupon.applicableAgencies,
      applicableBookingType: coupon.applicableBookingType,
      agencyUsageLimits: coupon.agencyUsageLimits,
    });
    setShowEditModal(true);
  };

  const handleViewCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowViewModal(true);
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
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
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

    const payload = {
      ...formData,
      couponCode: formData.couponCode.toUpperCase(),
      createdByWholesaler: wholesalerId,
    };

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (showEditModal && selectedCoupon) {
        // Simulate edit
        setCoupons(prev => prev.map(coupon => 
          coupon._id === selectedCoupon._id 
            ? {
                ...coupon,
                ...payload,
                updatedAt: new Date().toISOString()
              }
            : coupon
        ));
      } else {
        // Simulate create
        const newCoupon: Coupon = {
          _id: Date.now().toString(),
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setCoupons(prev => [...prev, newCoupon]);
      }

      setShowAddModal(false);
      setShowEditModal(false);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
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
                      type="number"
                      name="limit"
                      value={formData.limit}
                      onChange={handleFormChange}
                      required
                      min="1"
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
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleFormChange}
                      required
                      min="0"
                      step={formData.discountType === 'percentage' ? '0.01' : '1'}
                      max={formData.discountType === 'percentage' ? '100' : undefined}
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
                      {selectedCoupon.applicableAgencies.map((agencyId) => {
                        const agency = agencies.find(a => a._id === agencyId);
                        const usageLimit = selectedCoupon.agencyUsageLimits.find(
                          item => item.agencyId === agencyId
                        )?.usageLimit;
                        return (
                          <div key={agencyId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {agency?.name || 'Unknown Agency'}
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
                          const isSelected = selectedCoupon.applicableAgencies.includes(agency._id);
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
                                      return {
                                        ...prev,
                                        applicableAgencies: checked
                                          ? [...prev.applicableAgencies, agency._id]
                                          : prev.applicableAgencies.filter(id => id !== agency._id),
                                        agencyUsageLimits: checked
                                          ? [...prev.agencyUsageLimits, { agencyId: agency._id, usageLimit: 1 }]
                                          : prev.agencyUsageLimits.filter(item => item.agencyId !== agency._id)
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
                                    type="number"
                                    min="1"
                                    value={usageLimit}
                                    onChange={(e) => {
                                      const newLimit = Number(e.target.value);
                                      setSelectedCoupon(prev => {
                                        if (!prev) return prev;
                                        return {
                                          ...prev,
                                          agencyUsageLimits: prev.agencyUsageLimits.map(item =>
                                            item.agencyId === agency._id
                                              ? { ...item, usageLimit: newLimit }
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
                      {selectedCoupon.applicableAgencies.map((agencyId) => {
                        const agency = agencies.find(a => a._id === agencyId);
                        const usageLimit = selectedCoupon.agencyUsageLimits.find(
                          item => item.agencyId === agencyId
                        )?.usageLimit;
                        return (
                          <div key={agencyId} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/30 rounded">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {agency?.name || 'Unknown Agency'}
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
                  onClick={() => {
                    // Update the coupon in the main list
                    setCoupons(prev => prev.map(coupon => 
                      coupon._id === selectedCoupon._id ? selectedCoupon : coupon
                    ));
                    setShowAgencyModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
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
