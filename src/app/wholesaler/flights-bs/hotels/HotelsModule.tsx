'use client';

import React, { useState, useEffect } from 'react';
// DatePicker is not used in this file anymore, removed
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
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
  // ArrowRight, // Not used here
  AlertTriangle,
  // CheckCircle, // Not used here
  Info,
  // Image as ImageIcon, // Not used here
  // Upload, // Not used here
  // FileText, // Not used here
  // Building, // Not used here
  // Bed, // Not used here
  // Save, // Not used here
  Loader2 // Added for loading state
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Import library for countries and cities
import { Country, City, ICountry, ICity } from 'country-state-city';

// Import components
import HotelForm from './HotelForm';
import HotelCard from './HotelCard';

// #region --- TYPES (Exported) ---
export interface HotelAmenity {
  icon: any; // Keep using Lucide icons for display, but API might not provide this directly
  name: string;
  available: boolean; // Assuming all amenities from API are available
}

export interface RoomType {
  type: string;
  price: number;
  maxOccupancy: number;
  available: number; // Corresponds to availableRooms from API
  total: number; // Corresponds to blockedRooms from API
  amenities: string[]; // API provides this, map accordingly
}

export interface HotelInventory {
  id: string; // Corresponds to _id from API
  name: string; // Corresponds to hotelName from API
  category: number; // Corresponds to starRating from API
  location: {
    city: string; // Corresponds to city.name from API
    country: string; // Corresponds to country.name from API
    address: string; // Corresponds to fullAddress from API
    coordinates?: { // API doesn't provide this, keep optional
      lat: number;
      lng: number;
    };
  };
  description: string; // Corresponds to description from API
  images: string[]; // API doesn't provide this, keep for potential future use or default image
  amenities: HotelAmenity[]; // Map from hotelAmenities if provided, otherwise default or empty
  roomTypes: RoomType[]; // Map from roomTypes array in API
  checkInDate: string; // Use the first availableDatePeriod's checkInDate
  checkOutDate: string; // Use the first availableDatePeriod's checkOutDate
  availableDates?: { // Map from availableDatePeriods in API
    id: string; // Corresponds to _id inside availableDatePeriods
    checkIn: string; // Corresponds to checkInDate inside availableDatePeriods
    checkOut: string; // Corresponds to checkOutDate inside availableDatePeriods
  }[];
  supplierCommission?: { // Map directly
    type: 'fixed' | 'percentage';
    value: number;
  };
  agencyCommission?: { // Map directly
    type: 'fixed' | 'percentage';
    value: number;
  };
  currency?: string; // Map directly
  status: 'Available' | 'Sold Out' | 'Maintenance' | 'Blocked'; // Map from API status ('active' -> 'Available', etc.)
  totalRooms: number; // Corresponds to totalBlockedRooms from API
  availableRooms: number; // Corresponds to totalAvailableRooms from API
  rating: number; // API doesn't provide this, use default or placeholder
  reviews: number; // API doesn't provide this, use default or placeholder
  createdAt: string; // Map directly
  validUntil: string; // API doesn't provide this, maybe use last checkout date or default
}
// #endregion

// #region --- HELPER FUNCTIONS (Exported) ---

// Function to get auth token (moved outside components for broader use)
export const getAuthToken = () => {
    // Ensure this runs only on the client-side
    if (typeof window === 'undefined') {
        return null;
    }
    return document.cookie
            .split('; ')
            .find(r => r.startsWith('authToken='))
            ?.split('=')[1] || localStorage.getItem('authToken');
};

// Helper to map API status to UI status
export const mapApiStatus = (apiStatus: string): HotelInventory['status'] => {
    switch (apiStatus?.toLowerCase()) {
        case 'active':
        case 'available': // Assuming active means available
            return 'Available';
        case 'inactive': // Example mapping
        case 'sold out':
            return 'Sold Out';
        case 'blocked':
             return 'Blocked';
        // Add more mappings as needed based on actual API statuses
        default:
            return 'Available'; // Default status
    }
};

// Helper to get default icon based on amenity name (simple example)
export const getAmenityIcon = (name: string) => {
    if (name.toLowerCase().includes('wifi')) return Wifi;
    if (name.toLowerCase().includes('parking')) return Car;
    if (name.toLowerCase().includes('pool')) return Waves;
    if (name.toLowerCase().includes('gym') || name.toLowerCase().includes('fitness')) return Dumbbell;
    if (name.toLowerCase().includes('restaurant')) return Utensils;
    if (name.toLowerCase().includes('service')) return Coffee;
    return Info; // Default icon
}

// Helper function for status color (Exported)
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

// Helper function for stars (Exported)
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
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelInventory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all'); // Store country name
  const [filterCity, setFilterCity] = useState<string>('all');

  // State for filter dropdowns using the library
  const [filterCountriesList, setFilterCountriesList] = useState<ICountry[]>([]);
  const [filterCitiesList, setFilterCitiesList] = useState<ICity[]>([]);

  // Load countries for filters
  useEffect(() => {
    setFilterCountriesList(Country.getAllCountries());
  }, []);

  // Update cities list when filterCountry changes
  useEffect(() => {
    if (filterCountry && filterCountry !== 'all') {
      const countryData = filterCountriesList.find(c => c.name === filterCountry);
      if (countryData) {
        setFilterCitiesList(City.getCitiesOfCountry(countryData.isoCode) || []);
      } else {
        setFilterCitiesList([]);
      }
    } else {
      setFilterCitiesList([]); // Clear cities if 'All Countries' is selected
    }
    // Reset city filter when country changes
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
          method: 'GET', // Assuming GET request to fetch list
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
          // Transform API data to HotelInventory format
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
            images: [], // API doesn't provide images
            amenities: (apiHotel.hotelAmenities || []).map((amenityName: string) => ({ // Assuming hotelAmenities is an array of names
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
              amenities: apiRoom.amenities || [], // Assuming amenities is an array of strings
            })),
            // Use first available period for main check-in/out display, format date part only
            checkInDate: apiHotel.availableDatePeriods?.[0]?.checkInDate?.split('T')[0] || 'N/A',
            checkOutDate: apiHotel.availableDatePeriods?.[0]?.checkOutDate?.split('T')[0] || 'N/A',
            availableDates: (apiHotel.availableDatePeriods || []).map((period: any) => ({
              id: period._id,
              checkIn: period.checkInDate?.split('T')[0], // Extract date part
              checkOut: period.checkOutDate?.split('T')[0], // Extract date part
            })),
            supplierCommission: apiHotel.supplierCommission,
            agencyCommission: apiHotel.agencyCommission,
            currency: apiHotel.currency || 'USD',
            status: mapApiStatus(apiHotel.status),
            totalRooms: apiHotel.totalBlockedRooms || 0,
            availableRooms: apiHotel.totalAvailableRooms || 0,
            rating: 0, // Default value as API doesn't provide it
            reviews: 0, // Default value as API doesn't provide it
            createdAt: apiHotel.createdAt?.split('T')[0] || 'N/A',
             // Use last checkout date or a default validity
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
  }, []); // Empty dependency array means this runs once on mount


  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || hotel.status === filterStatus;
    // Match against the selected country name
    const matchesCountry = filterCountry === 'all' || hotel.location.country === filterCountry;
     // Match against the selected city name
    const matchesCity = filterCity === 'all' || hotel.location.city === filterCity;

    return matchesSearch && matchesStatus && matchesCountry && matchesCity;
  });

  const handleDeleteHotel = (id: string) => {
    // Add API call for deletion here if needed
    if (confirm('Are you sure you want to delete this hotel?')) {
      setHotels(prev => prev.filter(hotel => hotel.id !== id));
      toast.success("Hotel deleted (locally). Implement API call for permanent deletion.");
    }
  };

  if (showAddForm) {
    return <HotelForm onClose={() => setShowAddForm(false)} onSave={(newHotelData) => {
       // Ideally, re-fetch or optimistically update the state
       // Simple approach: Add to the start of the list
       setHotels(prev => [newHotelData, ...prev]);
       setShowAddForm(false);
    }} />;
  }

  if (selectedHotel) {
    return <HotelForm
      hotel={selectedHotel}
      onClose={() => setSelectedHotel(null)}
      onSave={(updatedHotelData) => {
         // Ideally, re-fetch or optimistically update the state
         // Simple approach: Replace in the list
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
              value={filterCountry} // Value is the country name string
              onChange={(e) => {
                setFilterCountry(e.target.value);
                // City reset is handled by the useEffect watching filterCountry
              }}
              className="w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-700 rounded-xl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 focus:border-green-500 dark:focus:border-green-400 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">All Countries</option>
              {filterCountriesList.map((country) => (
                <option key={country.isoCode} value={country.name}>
                  {country.name} {/* Display only name */}
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
              value={filterCity} // Value is the city name string
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
                {/* Reset country also resets city via useEffect */}
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
                setFilterCountry('all'); // This will trigger city reset via useEffect
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
                {/* Optionally add a retry button */}
                 <button
                   onClick={() => window.location.reload()} // Simple retry: reload page
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
                {/* Use HotelCard component */}
                {filteredHotels.map(hotel => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onEdit={setSelectedHotel}
                    onDelete={handleDeleteHotel}
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
    </div>
  );
};

export default HotelsModule;