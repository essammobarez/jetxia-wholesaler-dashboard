'use client';

import React, { useState, useEffect } from 'react';
import {
  Hotel,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Star,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  Utensils,
  X,
  AlertTriangle,
  Info,
  Loader2 
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Country, City, ICountry, ICity } from 'country-state-city';

import HotelForm from './HotelForm';
import HotelCard from './HotelCard';

// #region --- TYPES (Exported) ---
export interface HotelAmenity {
  icon: any; 
  name: string;
  available: boolean; 
}

export interface RoomType {
  type: string;
  price: number;
  maxOccupancy: number;
  available: number;
  total: number;
  amenities: string[];
}

export interface HotelInventory {
  id: string; 
  name: string; 
  category: number; 
  location: {
    city: string; 
    country: string; 
    address: string; 
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  description: string;
  images: string[];
  amenities: HotelAmenity[];
  roomTypes: RoomType[];
  checkInDate: string;
  checkOutDate: string;
  availableDates?: {
    id: string;
    checkIn: string;
    checkOut: string;
  }[];
  supplierCommission?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
  agencyCommission?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
  currency?: string;
  status: 'Available' | 'Sold Out' | 'Maintenance' | 'Blocked';
  totalRooms: number;
  availableRooms: number;
  rating: number;
  reviews: number;
  createdAt: string;
  validUntil: string;
}
// #endregion

// #region --- HELPER FUNCTIONS (Exported) ---

export const getAuthToken = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return document.cookie
            .split('; ')
            .find(r => r.startsWith('authToken='))
            ?.split('=')[1] || localStorage.getItem('authToken');
};

export const mapApiStatus = (apiStatus: string): HotelInventory['status'] => {
    switch (apiStatus?.toLowerCase()) {
        case 'active':
        case 'available':
            return 'Available';
        case 'inactive':
        case 'sold out':
            return 'Sold Out';
        case 'blocked':
             return 'Blocked';
        default:
            return 'Available';
    }
};

export const getAmenityIcon = (name: string) => {
    if (name.toLowerCase().includes('wifi')) return Wifi;
    if (name.toLowerCase().includes('parking')) return Car;
    if (name.toLowerCase().includes('pool')) return Waves;
    if (name.toLowerCase().includes('gym') || name.toLowerCase().includes('fitness')) return Dumbbell;
    if (name.toLowerCase().includes('restaurant')) return Utensils;
    if (name.toLowerCase().includes('service')) return Coffee;
    return Info;
}

export const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Sold Out':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Maintenance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Blocked':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
};

export const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
};
// #endregion

const HotelsModule = () => {
  const [hotels, setHotels] = useState<HotelInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelInventory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hotelToDeleteId, setHotelToDeleteId] = useState<string | null>(null);
  const [confirmInput, setConfirmInput] = useState('');

  const [filterCountriesList, setFilterCountriesList] = useState<ICountry[]>([]);
  const [filterCitiesList, setFilterCitiesList] = useState<ICity[]>([]);

  useEffect(() => {
    setFilterCountriesList(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (filterCountry && filterCountry !== 'all') {
      const countryData = filterCountriesList.find(c => c.name === filterCountry);
      if (countryData) {
        setFilterCitiesList(City.getCitiesOfCountry(countryData.isoCode) || []);
      } else {
        setFilterCitiesList([]);
      }
    } else {
      setFilterCitiesList([]);
    }
    setFilterCity('all');
  }, [filterCountry, filterCountriesList]);


    useEffect(() => {
    const fetchHotels = async () => {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        toast.error("Authentication required. Please log in.");
        return;
      }

      const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotel-block-rooms`;

      try {
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data && Array.isArray(result.data.hotelBlocks)) {
          const transformedHotels: HotelInventory[] = result.data.hotelBlocks.map((apiHotel: any) => ({
            id: apiHotel._id,
            name: apiHotel.hotelName,
            category: apiHotel.starRating,
            location: {
              city: apiHotel.city?.name || 'N/A',
              country: apiHotel.country?.name || 'N/A',
              address: apiHotel.fullAddress || '',
            },
            description: apiHotel.description || '',
            images: [],
            amenities: (apiHotel.hotelAmenities || []).map((amenityName: string) => ({
                icon: getAmenityIcon(amenityName),
                name: amenityName,
                available: true
            })),
            roomTypes: (apiHotel.roomTypes || []).map((apiRoom: any) => ({
              type: apiRoom.roomTypeName,
              price: apiRoom.price?.value || 0,
              maxOccupancy: apiRoom.maxGuests || 0,
              available: apiRoom.availableRooms || 0,
              total: apiRoom.blockedRooms || 0,
              amenities: apiRoom.amenities || [],
            })),
            checkInDate: apiHotel.availableDatePeriods?.[0]?.checkInDate?.split('T')[0] || 'N/A',
            checkOutDate: apiHotel.availableDatePeriods?.[0]?.checkOutDate?.split('T')[0] || 'N/A',
            availableDates: (apiHotel.availableDatePeriods || []).map((period: any) => ({
              id: period._id,
              checkIn: period.checkInDate?.split('T')[0],
              checkOut: period.checkOutDate?.split('T')[0],
            })),
            supplierCommission: apiHotel.supplierCommission,
            agencyCommission: apiHotel.agencyCommission,
            currency: apiHotel.currency || 'USD',
            status: mapApiStatus(apiHotel.status),
            totalRooms: apiHotel.totalBlockedRooms || 0,
            availableRooms: apiHotel.totalAvailableRooms || 0,
            rating: 0,
            reviews: 0,
            createdAt: apiHotel.createdAt?.split('T')[0] || 'N/A',
            validUntil: apiHotel.availableDatePeriods?.[apiHotel.availableDatePeriods.length - 1]?.checkOutDate?.split('T')[0] || 'N/A',
          }));
          setHotels(transformedHotels);
        } else {
          throw new Error(result.message || "Invalid data structure received from API.");
        }
      } catch (err: any) {
        console.error("Failed to fetch hotels:", err);
        setError(err.message || "An unknown error occurred while fetching hotels.");
        toast.error(err.message || "Failed to load hotels.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);


  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || hotel.status === filterStatus;
    const matchesCountry = filterCountry === 'all' || hotel.location.country === filterCountry;
    const matchesCity = filterCity === 'all' || hotel.location.city === filterCity;

    return matchesSearch && matchesStatus && matchesCountry && matchesCity;
  });

  const handleDelete = (id: string) => {
    setHotelToDeleteId(id);
    setIsDeleteModalOpen(true);
    setConfirmInput(''); // Reset input when modal opens
  };

  const confirmDeleteAndCallApi = async () => {
    if (!hotelToDeleteId) return;

    const token = getAuthToken();
    if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        setIsDeleteModalOpen(false);
        return;
    }

    const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotel-block-rooms/${hotelToDeleteId}`;

    try {
        const response = await fetch(API_URL, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
            throw new Error(errorData.message || `API error! Status: ${response.status}`);
        }

        setHotels(prev => prev.filter(hotel => hotel.id !== hotelToDeleteId));
        toast.success("Hotel deleted successfully.");

    } catch (err: any) {
        console.error("Failed to delete hotel:", err);
        toast.error(err.message || "An error occurred while deleting the hotel.");
    } finally {
        setIsDeleteModalOpen(false);
        setHotelToDeleteId(null);
        setConfirmInput('');
    }
  };


  if (showAddForm) {
    return <HotelForm onClose={() => setShowAddForm(false)} onSave={(newHotelData) => {
       setHotels(prev => [newHotelData, ...prev]);
       setShowAddForm(false);
    }} />;
  }

  if (selectedHotel) {
    return <HotelForm
      hotel={selectedHotel}
      onClose={() => setSelectedHotel(null)}
      onSave={(updatedHotelData) => {
        setHotels(prev => prev.map(h =>
          h.id === updatedHotelData.id ? updatedHotelData : h
        ));
        setSelectedHotel(null);
      }}
    />;
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hotels Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage hotel inventory and bookings</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-gradient"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Hotel
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card-modern p-6 space-y-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 mb-2">
          <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Search & Filters</h3>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-400" />
          <input
            type="text"
            placeholder="Search by hotel name, city, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base font-medium bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700 rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-400 transition-all shadow-sm hover:shadow-md"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Country Filter */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Country
            </label>
            <select
              value={filterCountry}
              onChange={(e) => {
                setFilterCountry(e.target.value);
              }}
              className="w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-700 rounded-xl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 focus:border-green-500 dark:focus:border-green-400 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">All Countries</option>
              {filterCountriesList.map((country) => (
                <option key={country.isoCode} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
              City
            </label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              disabled={filterCountry === 'all'}
              className={`w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 rounded-xl transition-all shadow-sm cursor-pointer ${
                filterCountry === 'all'
                  ? 'border-gray-300 dark:border-gray-700 opacity-60 cursor-not-allowed'
                  : 'border-purple-300 dark:border-purple-700 hover:shadow-md focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900 focus:border-purple-500 dark:focus:border-purple-400'
              }`}
            >
              <option value="all">{filterCountry === 'all' ? 'Select Country First' : 'All Cities'}</option>
              {filterCitiesList.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
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
                  <option value="Available">Available</option>
                  <option value="Sold Out">Sold Out</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(filterCountry !== 'all' || filterCity !== 'all' || filterStatus !== 'all' || searchTerm) && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t-2 border-blue-200 dark:border-blue-800">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Active Filters:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium flex items-center">
                "{searchTerm}"
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSearchTerm('')} />
              </span>
            )}
            {filterCountry !== 'all' && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium flex items-center">
                {filterCountry}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilterCountry('all')} />
              </span>
            )}
            {filterCity !== 'all' && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium flex items-center">
                {filterCity}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilterCity('all')} />
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium flex items-center">
                {filterStatus}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilterStatus('all')} />
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCountry('all');
                setFilterStatus('all');
              }}
              className="ml-auto px-4 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-full text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

       {/* Loading and Error States */}
       {isLoading && (
         <div className="flex justify-center items-center py-12">
             <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
             <p className="ml-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Loading Hotels...</p>
         </div>
       )}
       {error && !isLoading && (
           <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
               <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
               <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Failed to Load Hotels</h3>
               <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                  Retry
              </button>
           </div>
       )}


      {/* Hotels Grid - Render only if not loading and no error */}
      {!isLoading && !error && (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredHotels.map(hotel => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onEdit={setSelectedHotel}
                    onDelete={handleDelete}
                  />
                ))}
            </div>

            {/* Empty State for Filters/No Data */}
            {filteredHotels.length === 0 && (
                <div className="text-center py-12">
                <Hotel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {hotels.length === 0 ? 'No Hotels Available' : 'No Hotels Found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {hotels.length === 0
                    ? 'There are currently no hotels to display. Try adding one!'
                    : 'Try adjusting your search or filter criteria.'}
                </p>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-gradient"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hotel
                </button>
                </div>
            )}
        </>
      )}
      
      {/* Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="card-modern p-6 max-w-md w-full">
            <h3 className="font-bold text-lg text-red-600 dark:text-red-400 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Confirm Deletion
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2 mb-4">
              This action is irreversible. The hotel block and all its associated data will be permanently removed. To proceed, please type "yes" in the box below.
            </p>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-red-500 bg-white dark:bg-gray-800"
              placeholder='Type "yes" to confirm'
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAndCallApi}
                disabled={confirmInput.toLowerCase() !== 'yes'}
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelsModule;