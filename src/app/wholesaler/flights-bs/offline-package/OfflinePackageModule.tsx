// OfflinePackageModule.tsx

'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Package, X, Loader2 } from 'lucide-react';
import PackageCard from './PackageCard';
import PackageForm from './PackageForm';
import DeleteConfirmationModal from './DeleteConfirmationModal'; // Import the new modal component

// Define the interface based on the API response structure
export interface ApiPackage {
  _id: string;
  packageTitle: string;
  country: string;
  city: string;
  days: number;
  nights: number;
  description: string;
  category: string;
  status: string;
  pricing: {
    adultPrice: number;
    childPrice: number;
    infantPrice: number;
    singleSupplement: number;
    currency: string;
  };
  startDate: string;
  bookingDeadline: string;
}

const OfflinePackageModule = () => {
  const [packages, setPackages] = useState<ApiPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ApiPackage | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<ApiPackage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Function to get the auth token from cookies or local storage
  const getAuthToken = () => {
    return document.cookie
            .split('; ')
            .find(r => r.startsWith('authToken='))
            ?.split('=')[1] || localStorage.getItem('authToken');
  };

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/packages`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch packages. Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setPackages(result.data.packages);
        } else {
          throw new Error(result.message || "An unknown error occurred.");
        }

      } catch (err: any) {
        setError(err.message);
        console.error("API call failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const cleanString = (str: string) => {
    if (!str) return '';
    return str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
  };

  const uniqueCountries = useMemo(() => {
    const countrySet = new Set(packages.map(pkg => cleanString(pkg.country)));
    return Array.from(countrySet).sort();
  }, [packages]);

  const availableCitiesForFilter = useMemo(() => {
    if (filterCountry === 'all') return [];
    const citySet = new Set(
      packages
        .filter(pkg => cleanString(pkg.country) === filterCountry)
        .map(pkg => pkg.city)
    );
    return Array.from(citySet).sort();
  }, [packages, filterCountry]);

  const filteredPackages = useMemo(() => {
     return packages.filter(pkg => {
        const cleanedCountry = cleanString(pkg.country);
        const matchesSearch =
          pkg.packageTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cleanedCountry.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || pkg.status.toLowerCase() === filterStatus.toLowerCase();
        const matchesCountry = filterCountry === 'all' || cleanedCountry === filterCountry;
        const matchesCity = filterCity === 'all' || pkg.city === filterCity;
        const matchesCategory = filterCategory === 'all' || pkg.category === filterCategory;
        return matchesSearch && matchesStatus && matchesCategory && matchesCountry && matchesCity;
     });
  }, [packages, searchTerm, filterStatus, filterCategory, filterCountry, filterCity]);

  const handleOpenDeleteModal = (id: string) => {
    const pkgToDelete = packages.find(p => p._id === id);
    if (pkgToDelete) {
        setPackageToDelete(pkgToDelete);
        setIsDeleteModalOpen(true);
    }
  };
  
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPackageToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!packageToDelete) return;

    setIsDeleting(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found.");
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/packages/${packageToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to delete package.`);
      }

      const result = await response.json();
      if(result.success) {
        setPackages(prev => prev.filter(p => p._id !== packageToDelete._id));
        handleCloseDeleteModal();
      } else {
        throw new Error(result.message || "An error occurred during deletion.");
      }
    } catch (err: any) {
      setError(`Deletion Failed: ${err.message}`);
      console.error("Delete API call failed:", err);
    } finally {
      setIsDeleting(false);
      // Close modal even if delete fails, error will be shown on main screen
      if (packageToDelete) handleCloseDeleteModal();
    }
  };
  
  const handleSavePackage = (pkg: ApiPackage) => {
    if(selectedPackage) {
      setPackages(prev => prev.map(p => (p._id === pkg._id ? pkg : p)));
    } else {
      setPackages(prev => [{ ...pkg, _id: Date.now().toString() }, ...prev]);
    }
    setSelectedPackage(null);
    setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
        <p className="ml-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Loading Packages...</p>
      </div>
    );
  }

  if (error && !isDeleteModalOpen) { // Don't show main error when modal is open
    return (
      <div className="text-center py-12 card-modern bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
        <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">An Error Occurred</h3>
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (showAddForm || selectedPackage) {
    return (
      <PackageForm
        package={selectedPackage ?? undefined}
        onClose={() => {
          setShowAddForm(false);
          setSelectedPackage(null);
        }}
        onSave={handleSavePackage}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Offline Packages</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage travel packages and itineraries</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-gradient"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card-modern p-6 space-y-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-2 mb-2">
          <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Search & Filters</h3>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-600 dark:text-purple-400" />
          <input
            type="text"
            placeholder="Search by package name, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base font-medium bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900 focus:border-purple-500 dark:focus:border-purple-400 transition-all shadow-sm hover:shadow-md"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Country
            </label>
            <select
              value={filterCountry}
              onChange={(e) => {
                setFilterCountry(e.target.value);
                setFilterCity('all');
              }}
              className="w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-700 rounded-xl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 focus:border-green-500 dark:focus:border-green-400 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">All Countries</option>
              {uniqueCountries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></span>
              City
            </label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              disabled={filterCountry === 'all'}
              className={`w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 rounded-xl transition-all shadow-sm cursor-pointer ${
                filterCountry === 'all' 
                  ? 'border-gray-300 dark:border-gray-700 opacity-60 cursor-not-allowed' 
                  : 'border-cyan-300 dark:border-cyan-700 hover:shadow-md focus:ring-4 focus:ring-cyan-200 dark:focus:ring-cyan-900 focus:border-cyan-500 dark:focus:border-cyan-400'
              }`}
            >
              <option value="all">{filterCountry === 'all' ? 'Select Country First' : 'All Cities'}</option>
              {availableCitiesForFilter.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-700 rounded-xl focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900 focus:border-orange-500 dark:focus:border-orange-400 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Sold Out">Sold Out</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-pink-500 mr-2"></span>
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-pink-300 dark:border-pink-700 rounded-xl focus:ring-4 focus:ring-pink-200 dark:focus:ring-pink-900 focus:border-pink-500 dark:focus:border-pink-400 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Budget">Budget</option>
              <option value="Standard">Standard</option>
              <option value="Luxury">Luxury</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPackages.map(pkg => (
          <PackageCard
            key={pkg._id}
            pkg={pkg}
            onEdit={setSelectedPackage}
            onDelete={handleOpenDeleteModal}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Packages Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' || filterCountry !== 'all' || filterCity !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first travel package'
            }
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-gradient"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Package
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && packageToDelete && (
        <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            packageName={packageToDelete.packageTitle}
            isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default OfflinePackageModule;