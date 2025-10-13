"use client";

import type { NextPage } from 'next';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { IoClose, IoCloseCircle, IoSearch, IoLocationSharp, IoFilterSharp, IoGridOutline, IoListOutline, IoStarSharp, IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { FaTrash, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHotel, FaCity, FaBuilding } from 'react-icons/fa';
import { Building2, Eye, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Country, State, City as CityLib } from 'country-state-city';
import ReactCountryFlag from 'react-country-flag';

// === Types ===
type MappedSupplier = {
  supplier: string;
  supplierHotelId: string;
  source: string;
  _id: string;
};

type Hotel = {
  _id: string;
  name: string;
  address: string;
  telephone: string;
  zipCode: string;
  country: {
    id: string;
    name: string;
    iso: string;
  };
  city: {
    id: number;
    name: string;
    countryId: string;
  };
  coordinates: {
    type: string;
    coordinates: number[];
  };
  stars: number;
  boardBasis: string[];
  facilities: {
    id: number;
    name: string;
    _id: string;
  }[];
  specialDeals: boolean;
  mainImageUrl: string;
  mappedSuppliers: MappedSupplier[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  mainImages: string[];
};

type SupplierHotelDetails = {
  hotelName: string;
  address: {
    fullAddress: string;
    city: string;
    countryCode: string;
  };
  starRating: number;
  contact: {
    phone: string;
    email: string;
  };
  descriptions?: {
    general?: string;
  };
  facilites: string[];
};

// Autocomplete Types
type CountryResult = {
  id: string;
  name: string;
  iso: string;
};

type CityResult = {
  id: string | number;
  name: string;
  countryName?: string;
  countryId?: string | number;
};

type HotelResult = {
  _id: string | number;
  name: string;
  city?: { name?: string; id?: string | number } | null;
  country?: { name?: string; id?: string | number } | null;
  cityName?: string;
  countryName?: string;
};

type DestinationSelection = {
  type: 'city' | 'hotel';
  id: string | number;
  name: string;
  cityName?: string;
  countryName?: string;
};

// === Component: Inline Supplier Detail Display ===
const SupplierDataDisplay = ({ supplierId, hotelId }: { supplierId: string; hotelId: string }) => {
  const [details, setDetails] = useState<SupplierHotelDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supplierId || !hotelId) {
      setIsLoading(false);
      setError('Missing supplier or hotel ID.');
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
          throw new Error('Backend URL is not configured.');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}hotel/${supplierId}/${hotelId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          throw new Error(errorData?.message || `Failed to fetch details (${response.status})`);
        }

        const result = await response.json();
        
        if (!result) {
          throw new Error('No data received from server');
        }

        if (result.success && result.data) {
          setDetails(result.data);
        } else {
          throw new Error(result?.message || 'Invalid data format received.');
        }
      } catch (err: any) {
        console.error('Error fetching supplier details:', err);
        setError(err?.message || 'An unknown error occurred while fetching supplier details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [supplierId, hotelId]);

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-300 animate-pulse">
        Loading supplier data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 mt-3 pt-3 border-t border-gray-300">
        <span className="font-semibold">Error:</span> {error}
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 text-sm bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg">
      <div className="space-y-2">
        <p className="font-semibold text-gray-900 text-base">{details.hotelName}</p>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 flex">
            {Array.from({ length: Math.round(details.starRating) }).map((_, i) => (
              <IoStarSharp key={i} className="w-4 h-4" />
            ))}
          </span>
          <span className="text-xs text-gray-600 font-medium">({details.starRating}-Star)</span>
        </div>
        <p className="text-gray-700 pt-1 flex items-start gap-2">
          <FaMapMarkerAlt className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <span className="flex-1">{details.address?.fullAddress || 'Address not available'}</span>
        </p>
        <p className="text-gray-700 flex items-center gap-2">
          <FaPhone className="w-4 h-4 text-green-600" />
          {details.contact?.phone || 'Phone not available'}
        </p>
        <p className="text-gray-700 flex items-center gap-2">
          <FaEnvelope className="w-4 h-4 text-purple-600" />
          {details.contact?.email || 'Email not available'}
        </p>
      </div>

      {details.facilites && details.facilites.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">Facilities:</p>
          <div className="flex flex-wrap gap-1.5">
            {details.facilites.slice(0, 5).map((facility, index) => (
              <span
                key={index}
                className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full"
              >
                {facility}
              </span>
            ))}
            {details.facilites.length > 5 && (
              <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full">
                +{details.facilites.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// === Modal: Hotel Detail ===
const HotelDetailModal = ({
  hotel,
  onClose,
  onRemoveSupplier,
}: {
  hotel: Hotel | null;
  onClose: () => void;
  onRemoveSupplier: (hotelId: string, supplierMappingId: string) => void;
}) => {
  if (!hotel) return null;

  const getHighResImageUrl = (url: string) => {
    try {
      if (!url) {
        return '/images/placeholder.jpg';
      }
      if (typeof url === 'string' && url.includes('_t.jpg')) {
        return url.replace('_t.jpg', '_z.jpg');
      }
      return url;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return '/images/placeholder.jpg';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-72 w-full">
          <Image
            src={getHighResImageUrl(hotel.mainImageUrl)}
            alt={hotel.name}
            fill
            className="object-cover rounded-t-2xl"
            quality={100}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-2xl" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 text-xl leading-none hover:bg-white transition-colors shadow-lg"
            aria-label="Close modal"
          >
            <IoClose />
          </button>
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-400 flex">
                {Array.from({ length: Math.round(hotel.stars) }).map((_, i) => (
                  <IoStarSharp key={i} className="w-5 h-5" />
                ))}
              </span>
              <span className="text-white font-semibold text-sm bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                {hotel.stars.toFixed(1)} Star
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">{hotel.name}</h2>
          </div>
        </div>

        <div>
          <div className="sticky top-0 z-10 bg-white px-6 pt-5 pb-4 border-b border-gray-200">
            <p className="text-xs text-gray-500 font-mono mb-2">
              ID: <code className="bg-gray-100 px-2 py-1 rounded text-gray-700">{hotel._id}</code>
            </p>
            <div className="flex items-start gap-2 text-gray-700">
              <IoLocationSharp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                {hotel.address}, {hotel.city.name}, {hotel.country.name}, {hotel.zipCode}
              </p>
            </div>
            <p className="text-sm text-gray-700 mt-2 flex items-center gap-2">
              <FaPhone className="w-4 h-4 text-green-600" />
              {hotel.telephone}
            </p>
          </div>

          <div className="px-6 pb-6">
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                Facilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {hotel.facilities.map((facility) => (
                  <span
                    key={facility._id}
                    className="text-sm font-medium bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    {facility.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                Board Basis
              </h3>
              <div className="flex flex-wrap gap-2">
                {hotel.boardBasis.map((basis, index) => (
                  <span
                    key={index}
                    className="text-sm font-medium bg-purple-100 text-purple-800 px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    {basis}
                  </span>
                ))}
              </div>
            </div>

            {hotel.mappedSuppliers && hotel.mappedSuppliers.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
                  Mapped Suppliers
                  <span className="text-sm font-normal text-gray-600">
                    ({hotel.mappedSuppliers.length})
                  </span>
                </h3>
                <div className="space-y-4">
                  {hotel.mappedSuppliers.map((supplier) => (
                    <div
                      key={supplier._id}
                      className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-base font-bold text-blue-700 capitalize mb-1">
                            {supplier.source}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            Supplier Hotel ID:{' '}
                            <code className="bg-gray-200 px-2 py-0.5 rounded text-gray-800 font-mono text-xs">
                              {supplier.supplierHotelId}
                            </code>
                          </p>
                          <p className="text-sm text-gray-600">
                            Supplier:{' '}
                            <code className="bg-gray-200 px-2 py-0.5 rounded text-gray-800 font-mono text-xs">
                              {supplier.supplier}
                            </code>
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveSupplier(hotel._id, supplier._id)}
                          className="bg-gradient-to-r from-red-600 to-red-700 text-white p-2.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg flex-shrink-0"
                          aria-label="Remove supplier"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                      <SupplierDataDisplay
                        supplierId={supplier.supplier}
                        hotelId={supplier.supplierHotelId}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// === Modal: All Facilities ===
const FacilitiesModal = ({
  facilities,
  onClose,
}: {
  facilities: Hotel['facilities'] | null;
  onClose: () => void;
}) => {
  if (!facilities) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-gray-900">
              All Facilities <span className="text-blue-600">({facilities.length})</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-800 text-3xl leading-none transition-colors"
              aria-label="Close"
            >
              <IoClose />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto -mr-2 pr-2">
            <div className="flex flex-wrap gap-2">
              {facilities.map((facility) => (
                <span
                  key={facility._id}
                  className="text-sm font-medium bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg shadow-sm"
                >
                  {facility.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Main Page Component V2 ===
const HotelListPageV2: NextPage = () => {
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Master countries and cities for dropdowns (using country-state-city)
  const [countryList, setCountryList] = useState<{ name: string; isoCode: string }[]>([]);
  const [cityList, setCityList] = useState<string[]>([]);
  
  // Country and City selection
  const [selectedCountryForView, setSelectedCountryForView] = useState('');
  const [selectedCountryIsoCode, setSelectedCountryIsoCode] = useState('');
  const [selectedCityForView, setSelectedCityForView] = useState('');
  const [countrySearchInput, setCountrySearchInput] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<{ name: string; isoCode: string }[]>([]);
  
  // City search (frontend filtering)
  const [citySearchInput, setCitySearchInput] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  
  // Hotel Name search (autocomplete)
  const [hotelNameSearch, setHotelNameSearch] = useState('');
  const [hotelNameResults, setHotelNameResults] = useState<HotelResult[]>([]);
  const [isSearchingHotelName, setIsSearchingHotelName] = useState(false);
  const [showHotelNameDropdown, setShowHotelNameDropdown] = useState(false);
  const [selectedHotelName, setSelectedHotelName] = useState<HotelResult | null>(null);
  
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grouped' | 'grid' | 'list'>('grouped');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [facilitiesToShow, setFacilitiesToShow] = useState<Hotel['facilities'] | null>(null);
  const [expandedHotels, setExpandedHotels] = useState<Set<string>>(new Set());

  // Load countries from country-state-city library
  useEffect(() => {
    const countries = Country.getAllCountries() || [];
    countries.sort((a, b) => a.name.localeCompare(b.name));
    const formattedCountries = countries.map(c => ({ name: c.name, isoCode: c.isoCode }));
    setCountryList(formattedCountries);
    setFilteredCountries(formattedCountries);
  }, []);

  // Load cities when country changes
  useEffect(() => {
    if (selectedCountryIsoCode) {
      const states = State.getStatesOfCountry(selectedCountryIsoCode) || [];
      let citiesAccumulator: string[] = [];
      states.forEach(st => {
        CityLib.getCitiesOfState(selectedCountryIsoCode, st.isoCode)?.forEach(cityObj => {
          if (cityObj.name && !citiesAccumulator.includes(cityObj.name)) {
            citiesAccumulator.push(cityObj.name);
          }
        });
      });
      const sortedCities = citiesAccumulator.sort((a, b) => a.localeCompare(b));
      setCityList(sortedCities);
      setFilteredCities(sortedCities);
      setSelectedCityForView(''); // Reset city when country changes
      setCitySearchInput('');
    } else {
      setCityList([]);
      setFilteredCities([]);
      setSelectedCityForView('');
      setCitySearchInput('');
    }
  }, [selectedCountryIsoCode]);

  // Filter cities based on search input (frontend only)
  useEffect(() => {
    if (citySearchInput.trim()) {
      const searchLower = citySearchInput.toLowerCase();
      const filtered = cityList.filter(city =>
        city.toLowerCase().includes(searchLower)
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cityList);
    }
  }, [citySearchInput, cityList]);

  // Filter countries based on search input
  useEffect(() => {
    if (countrySearchInput.trim()) {
      const searchLower = countrySearchInput.toLowerCase();
      const filtered = countryList.filter(country =>
        country.name.toLowerCase().includes(searchLower) ||
        country.isoCode.toLowerCase().includes(searchLower)
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countryList);
    }
  }, [countrySearchInput, countryList]);

  // Fetch all hotels
  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
          throw new Error('Backend URL is not configured. Please check your environment variables.');
        }

        const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}hotel-mapping/v2/search`);
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}. ${errorText}`);
        }

        const result: { success: boolean; data: Hotel[] } = await response.json();
        
        if (!result) {
          throw new Error('No data received from server');
        }

        if (result.success && Array.isArray(result.data)) {
          setAllHotels(result.data);
        } else {
          throw new Error(result?.success === false ? 'Server returned unsuccessful response' : 'Invalid data format received.');
        }
      } catch (err: any) {
        console.error('Error fetching hotels:', err);
        setError(err?.message || 'An unknown error occurred while fetching hotels.');
        setAllHotels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Fetch hotels by name (autocomplete search)
  useEffect(() => {
    const fetchHotelsByName = async () => {
      if (!hotelNameSearch.trim() || hotelNameSearch.length < 2) {
        setHotelNameResults([]);
        return;
      }

      setIsSearchingHotelName(true);
      try {
        if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
          console.error('Backend URL is not configured');
          setHotelNameResults([]);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}hotel-mapping/v2/search?searchQuery=${encodeURIComponent(hotelNameSearch)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch hotels: ${response.status} ${response.statusText}`);
          setHotelNameResults([]);
          return;
        }

        const result = await response.json();
        if (result && result.success && Array.isArray(result.data)) {
          setHotelNameResults(result.data);
          setShowHotelNameDropdown(true);
        } else {
          setHotelNameResults([]);
        }
      } catch (err: any) {
        console.error('Error fetching hotels:', err);
        setHotelNameResults([]);
      } finally {
        setIsSearchingHotelName(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchHotelsByName();
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [hotelNameSearch]);

  // Toggle expansion for a hotel
  const toggleHotelExpansion = (hotelId: string) => {
    setExpandedHotels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hotelId)) {
        newSet.delete(hotelId);
      } else {
        newSet.add(hotelId);
      }
      return newSet;
    });
  };

  // Client-side filtering
  const filteredHotels = useMemo(() => {
    return allHotels.filter((hotel) => {
      // Filter by selected country (by name, like HotelsTab.tsx)
      const matchesCountry = !selectedCountryForView || hotel.country.name === selectedCountryForView;
      
      // Filter by selected city (by name, like HotelsTab.tsx)
      const matchesCity = !selectedCityForView || hotel.city.name === selectedCityForView;
      
      // Filter by hotel name search
      const matchesHotelName = !selectedHotelName || hotel._id === selectedHotelName._id;

      // Filter by star rating
      const matchesStar = starFilter === null || Math.round(hotel.stars) === starFilter;

      return matchesCountry && matchesCity && matchesHotelName && matchesStar;
    });
  }, [allHotels, selectedCountryForView, selectedCityForView, selectedHotelName, starFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    try {
      const totalHotels = allHotels?.length || 0;
      const totalMappedSuppliers = allHotels?.reduce((sum, hotel) => {
        return sum + (hotel?.mappedSuppliers?.length || 0);
      }, 0) || 0;
      const hotelsWithMultipleSuppliers = allHotels?.filter(hotel => 
        hotel?.mappedSuppliers && hotel.mappedSuppliers.length > 1
      ).length || 0;
      const averageSuppliersPerHotel = totalHotels > 0 
        ? (totalMappedSuppliers / totalHotels).toFixed(1) 
        : '0';
      
      return {
        totalHotels,
        totalMappedSuppliers,
        hotelsWithMultipleSuppliers,
        averageSuppliersPerHotel
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalHotels: 0,
        totalMappedSuppliers: 0,
        hotelsWithMultipleSuppliers: 0,
        averageSuppliersPerHotel: '0'
      };
    }
  }, [allHotels]);

  const handleRemoveSupplier = async (hotelId: string, supplierMappingId: string) => {
    if (!hotelId || !supplierMappingId) {
      alert('Error: Missing hotel ID or supplier mapping ID');
      return;
    }

    if (!confirm('Are you sure you want to remove this supplier mapping? This action cannot be undone.')) {
      return;
    }

    try {
      if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        throw new Error('Backend URL is not configured');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}hotel-master/${hotelId}/remove-supplier`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supplierMappingId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to remove supplier.');
      }

      const updateSuppliers = (hotel: Hotel) => ({
        ...hotel,
        mappedSuppliers: hotel.mappedSuppliers?.filter((s) => s._id !== supplierMappingId) || [],
      });

      setAllHotels((prevHotels) => prevHotels.map((h) => (h._id === hotelId ? updateSuppliers(h) : h)));
      setSelectedHotel((prevSelected) =>
        prevSelected && prevSelected._id === hotelId ? updateSuppliers(prevSelected) : prevSelected
      );

      alert('Supplier mapping removed successfully!');
    } catch (err: any) {
      console.error('Error removing supplier:', err);
      alert(`Error: ${err?.message || 'An unknown error occurred while removing the supplier'}`);
    }
  };

  const getHighResImageUrl = (url: string) => {
    try {
      if (!url) {
        return '/images/placeholder.jpg';
      }
      if (typeof url === 'string' && url.includes('_t.jpg')) {
        return url.replace('_t.jpg', '_z.jpg');
      }
      return url;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return '/images/placeholder.jpg';
    }
  };

  const handleCountrySelect = (country: { name: string; isoCode: string }) => {
    setSelectedCountryForView(country.name);
    setSelectedCountryIsoCode(country.isoCode);
    setCountrySearchInput(country.name);
    setShowCountryDropdown(false);
  };

  const handleCountryClear = () => {
    setSelectedCountryForView('');
    setSelectedCountryIsoCode('');
    setCountrySearchInput('');
    setSelectedCityForView('');
    setCitySearchInput('');
  };

  const handleCitySelect = (city: string) => {
    setSelectedCityForView(city);
    setCitySearchInput(city);
    setShowCityDropdown(false);
  };

  const handleCityClear = () => {
    setSelectedCityForView('');
    setCitySearchInput('');
  };

  const handleSelectHotelName = (hotel: HotelResult) => {
    setSelectedHotelName(hotel);
    setHotelNameSearch('');
    setShowHotelNameDropdown(false);
    setHotelNameResults([]);
  };

  const handleClearHotelName = () => {
    setSelectedHotelName(null);
    setHotelNameSearch('');
    setHotelNameResults([]);
  };
  
  const handleClearFilters = () => {
    setSelectedCountryForView('');
    setSelectedCountryIsoCode('');
    setCountrySearchInput('');
    setSelectedCityForView('');
    setCitySearchInput('');
    setSelectedHotelName(null);
    setHotelNameSearch('');
    setStarFilter(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-4 sm:p-6 lg:p-8">
        <main className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
                  <Building2 className="h-10 w-10 text-blue-600" />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                    Mapped Hotels
                  </span>
                </h1>
                <p className="text-gray-600 text-sm">
                  Discover and manage your hotel inventory with advanced search and supplier mapping
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                <button
                  onClick={() => setViewMode('grouped')}
                  className={`px-3 py-2 rounded-md transition-all text-sm font-medium ${
                    viewMode === 'grouped'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Grouped view"
                >
                  <div className="flex items-center gap-1.5">
                    <FaBuilding className="w-4 h-4" />
                    <span>Grouped</span>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Grid view"
                >
                  <IoGridOutline className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="List view"
                >
                  <IoListOutline className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-blue-50/50 to-green-50/50 rounded-2xl border-2 border-blue-200/50 shadow-lg backdrop-blur-sm">
                {/* Country Search with Autocomplete */}
                <div className="relative">
                  <label className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300 mb-3">
                    <IoLocationSharp className="h-4 w-4" />
                    Country
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🌍 Type to search country..."
                      value={countrySearchInput}
                      onChange={(e) => setCountrySearchInput(e.target.value)}
                      onFocus={() => setShowCountryDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
                      className={`w-full py-3 text-base font-medium bg-white border-2 border-blue-300 rounded-xl shadow-lg hover:border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200 ${selectedCountryIsoCode ? 'pl-12 pr-10' : 'px-4 pr-10'}`}
                    />
                    {/* Flag display */}
                    {selectedCountryIsoCode && (
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ReactCountryFlag 
                          countryCode={selectedCountryIsoCode} 
                          svg 
                          style={{ width: '1.5em', height: '1.5em' }} 
                        />
                      </div>
                    )}
                    {/* Clear button */}
                    {selectedCountryForView && (
                      <button
                        onClick={handleCountryClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <IoClose className="h-5 w-5" />
                      </button>
                    )}
                    
                    {/* Country Dropdown */}
                    {showCountryDropdown && filteredCountries.length > 0 && (
                      <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50">
                        <div className="p-2">
                          {filteredCountries.map((country) => (
                            <button
                              key={country.isoCode}
                              onClick={() => handleCountrySelect(country)}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <ReactCountryFlag 
                                countryCode={country.isoCode} 
                                svg 
                                style={{ width: '1.2em', height: '1.2em' }} 
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate">{country.name}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* City Search with Autocomplete */}
                <div className="relative">
                  <label className="flex items-center gap-2 text-sm font-bold text-green-700 dark:text-green-300 mb-3">
                    <FaCity className="h-4 w-4" />
                    City
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={!selectedCountryIsoCode ? "First select a country..." : "🏙️ Type to search city..."}
                      value={citySearchInput}
                      onChange={(e) => setCitySearchInput(e.target.value)}
                      onFocus={() => setShowCityDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                      disabled={!selectedCountryIsoCode}
                      className="w-full px-4 py-3 text-base font-medium bg-white border-2 border-green-300 rounded-xl shadow-lg hover:border-green-500 focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all duration-200 pr-10 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
                    />
                    {/* Clear button */}
                    {selectedCityForView && (
                      <button
                        onClick={handleCityClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <IoClose className="h-5 w-5" />
                      </button>
                    )}
                    
                    {/* City Dropdown */}
                    {showCityDropdown && filteredCities.length > 0 && selectedCountryIsoCode && (
                      <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50">
                        <div className="p-2">
                          {filteredCities.map((city) => (
                            <button
                              key={city}
                              onClick={() => handleCitySelect(city)}
                              className="w-full text-left px-3 py-2 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <FaCity className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate">{city}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hotel Name Search */}
                <div className="relative">
                  <label className="flex items-center gap-2 text-sm font-bold text-purple-700 dark:text-purple-300 mb-3">
                    <FaHotel className="h-4 w-4" />
                    Hotel Name
                  </label>
                  <div className="relative">
                    {selectedHotelName ? (
                      <div className="flex items-center gap-2 w-full h-12 px-4 py-3 rounded-xl border-2 border-purple-300 bg-purple-50">
                        <FaHotel className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span className="flex-1 text-sm text-gray-900 font-medium truncate">
                          {selectedHotelName.name}
                        </span>
                        <button
                          onClick={handleClearHotelName}
                          className="text-gray-400 hover:text-gray-700 transition-colors"
                          aria-label="Clear hotel"
                        >
                          <IoClose className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="🏨 Search hotel..."
                          value={hotelNameSearch}
                          onChange={(e) => setHotelNameSearch(e.target.value)}
                          onFocus={() => hotelNameResults.length > 0 && setShowHotelNameDropdown(true)}
                          onBlur={() => setTimeout(() => setShowHotelNameDropdown(false), 200)}
                          className="w-full px-4 py-3 text-base font-medium bg-white border-2 border-purple-300 rounded-xl shadow-lg hover:border-purple-500 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                        />
                        {isSearchingHotelName && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hotel Name Dropdown */}
                    {showHotelNameDropdown && hotelNameResults.length > 0 && (
                      <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50">
                        <div className="p-2">
                          {hotelNameResults.map((hotel) => (
                            <button
                              key={hotel._id}
                              onClick={() => handleSelectHotelName(hotel)}
                              className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <FaHotel className="w-4 h-4 text-purple-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate">{hotel.name}</div>
                                <div className="text-xs text-gray-500 truncate">
                                  {[hotel.city?.name || hotel.cityName, hotel.country?.name || hotel.countryName]
                                    .filter(Boolean)
                                    .join(', ')}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCountryForView || selectedCityForView || selectedHotelName || starFilter !== null) && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center flex-wrap gap-2">
                  <span className="text-xs font-medium text-gray-600">Filters:</span>
                  {selectedCountryForView && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      🌍 {selectedCountryForView}
                    </span>
                  )}
                  {selectedCityForView && (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      <FaCity className="w-3 h-3" />
                      {selectedCityForView}
                    </span>
                  )}
                  {selectedHotelName && (
                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      <FaHotel className="w-3 h-3" />
                      {selectedHotelName.name}
                    </span>
                  )}
                  {starFilter !== null && (
                    <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      {'★'.repeat(starFilter)}
                    </span>
                  )}
                  <button
                    onClick={handleClearFilters}
                    className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Hotels</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalHotels}</p>
                  </div>
                  <Building2 className="h-10 w-10 text-blue-500 opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mapped Suppliers</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.totalMappedSuppliers}</p>
                  </div>
                  <Check className="h-10 w-10 text-green-500 opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Multi-Supplier</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">{stats.hotelsWithMultipleSuppliers}</p>
                  </div>
                  <RefreshCw className="h-10 w-10 text-purple-500 opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Suppliers</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{stats.averageSuppliersPerHotel}</p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-orange-500 opacity-50" />
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-lg text-gray-600 mt-4">Loading hotels...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 bg-red-50 text-red-700 rounded-xl border border-red-200">
              <p className="font-bold text-lg">Error:</p>
              <p className="mt-2">{error}</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-bold text-gray-900">{filteredHotels.length}</span> of{' '}
                  <span className="font-semibold">{allHotels.length}</span> hotels
                </div>
              </div>

              {filteredHotels.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                  <IoFilterSharp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-900 mb-2">No hotels found</p>
                  <p className="text-gray-600">Try adjusting your filters or search criteria</p>
                </div>
              ) : viewMode === 'grouped' ? (
                /* Grouped View - Inspired by HotelsTab.tsx */
                <div className="space-y-6">
                  {filteredHotels.map((hotel) => {
                    const isExpanded = expandedHotels.has(hotel._id);
                    const hasMultipleSuppliers = (hotel.mappedSuppliers?.length || 0) > 1;
                    
                    return (
                      <div key={hotel._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                        {/* Hotel Header */}
                        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                                <Image
                                  src={getHighResImageUrl(hotel.mainImageUrl)}
                                  alt={hotel.name}
                                  fill
                                  className="object-cover"
                                  quality={80}
                                  sizes="80px"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                  {hotel.name || 'Unknown Hotel'}
                                  {hotel.stars && hotel.stars > 0 && (
                                    <div className="flex items-center gap-1">
                                      {[...Array(Math.min(Math.round(hotel.stars), 5))].map((_, i) => (
                                        <IoStarSharp key={i} className="w-4 h-4 text-yellow-300" />
                                      ))}
                                    </div>
                                  )}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 text-white/90 text-sm">
                                  <IoLocationSharp className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{hotel.address}, {hotel.city.name}, {hotel.country.name}</span>
                                </div>
                                <p className="text-white/80 text-xs mt-1 font-mono bg-white/10 px-2 py-1 rounded inline-block">
                                  ID: {hotel._id}
                                </p>
                              </div>
                            </div>
                            
                            {/* Status and Actions */}
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-end gap-2">
                                <span className="px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-1.5">
                                  <Check className="w-4 h-4" />
                                  {hotel.mappedSuppliers?.length || 0} {(hotel.mappedSuppliers?.length || 0) === 1 ? 'Supplier' : 'Suppliers'}
                                </span>
                                {hasMultipleSuppliers && (
                                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                    Multi-Source
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => toggleHotelExpansion(hotel._id)}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white"
                              >
                                {isExpanded ? (
                                  <IoChevronUp className="w-5 h-5" />
                                ) : (
                                  <IoChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                            {/* Hotel Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                                  <Building2 className="w-5 h-5 text-blue-600" />
                                  Hotel Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p className="flex items-center gap-2 text-gray-700">
                                    <FaPhone className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <span className="font-medium">Phone:</span> {hotel.telephone || 'N/A'}
                                  </p>
                                  <p className="flex items-start gap-2 text-gray-700">
                                    <FaMapMarkerAlt className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    <span><span className="font-medium">Address:</span> {hotel.address}, {hotel.zipCode}</span>
                                  </p>
                                  <p className="flex items-center gap-2 text-gray-700">
                                    <IoLocationSharp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span className="font-medium">Coordinates:</span> {hotel.coordinates?.coordinates?.[1]?.toFixed(4) || 'N/A'}, {hotel.coordinates?.coordinates?.[0]?.toFixed(4) || 'N/A'}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 text-lg">Board Basis & Facilities</h4>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Board Basis:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {hotel.boardBasis && hotel.boardBasis.length > 0 ? (
                                        hotel.boardBasis.map((basis, idx) => (
                                          <span key={idx} className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-medium">
                                            {basis}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-xs text-gray-500">No board basis information</span>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Top Facilities:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {hotel.facilities && hotel.facilities.length > 0 ? (
                                        <>
                                          {hotel.facilities.slice(0, 6).map((facility) => (
                                            <span key={facility._id} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs font-medium">
                                              {facility.name}
                                            </span>
                                          ))}
                                          {hotel.facilities.length > 6 && (
                                            <button
                                              onClick={() => setFacilitiesToShow(hotel.facilities)}
                                              className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300 transition-colors"
                                            >
                                              +{hotel.facilities.length - 6} more
                                            </button>
                                          )}
                                        </>
                                      ) : (
                                        <span className="text-xs text-gray-500">No facilities information</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Mapped Suppliers */}
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-orange-600" />
                                Mapped Suppliers ({hotel.mappedSuppliers?.length || 0})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {hotel.mappedSuppliers && hotel.mappedSuppliers.length > 0 ? (
                                  hotel.mappedSuppliers.map((supplier) => (
                                  <div
                                    key={supplier._id}
                                    className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1">
                                        <p className="text-base font-bold text-blue-700 capitalize mb-1">
                                          {supplier.source}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          Supplier Hotel ID:{' '}
                                          <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono text-xs">
                                            {supplier.supplierHotelId}
                                          </code>
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                          Supplier ID:{' '}
                                          <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono text-xs">
                                            {supplier.supplier}
                                          </code>
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => handleRemoveSupplier(hotel._id, supplier._id)}
                                        className="bg-gradient-to-r from-red-600 to-red-700 text-white p-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg flex-shrink-0"
                                        aria-label="Remove supplier"
                                        title="Remove this supplier mapping"
                                      >
                                        <FaTrash className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <SupplierDataDisplay
                                      supplierId={supplier.supplier}
                                      hotelId={supplier.supplierHotelId}
                                    />
                                  </div>
                                  ))
                                ) : (
                                  <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600 text-sm">No supplier mappings available</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex items-center justify-end gap-3">
                              <button
                                onClick={() => setSelectedHotel(hotel)}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Full Details
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Grid and List Views */
                <section
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch'
                      : 'space-y-4'
                  }
                >
                  {filteredHotels.map((hotel, index) => (
                    <div
                      key={hotel._id}
                      className={`bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                        viewMode === 'list' ? 'flex gap-4 p-4' : 'flex flex-col h-full'
                      }`}
                    >
                      <div
                        className={`relative overflow-hidden ${
                          viewMode === 'list'
                            ? 'w-48 h-32 rounded-lg flex-shrink-0'
                            : 'h-48 w-full rounded-t-xl'
                        }`}
                      >
                        <Image
                          src={getHighResImageUrl(hotel.mainImageUrl)}
                          alt={hotel.name}
                          fill
                          className="object-cover"
                          quality={90}
                          priority={index < 6}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        {hotel.stars && hotel.stars > 0 && (
                          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-sm font-bold text-gray-900 shadow-md flex items-center gap-1">
                            <IoStarSharp className="w-4 h-4 text-yellow-500" />
                            {hotel.stars.toFixed(1)}
                          </div>
                        )}
                        {hotel.mappedSuppliers && hotel.mappedSuppliers.length > 1 && (
                          <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                            {hotel.mappedSuppliers.length} Suppliers
                          </div>
                        )}
                      </div>

                      <div className={`flex-1 flex flex-col ${viewMode === 'grid' ? 'p-5' : ''}`}>
                        <div className="flex-1">
                          <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{hotel.name || 'Unknown Hotel'}</h2>
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            <code className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {hotel._id || 'N/A'}
                            </code>
                          </p>
                          <div className="flex items-start gap-1.5 mt-2 text-sm text-gray-600">
                            <IoLocationSharp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {hotel.city?.name || 'Unknown'}, {hotel.country?.name || 'Unknown'}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                            {hotel.facilities && hotel.facilities.length > 0 ? (
                              <>
                                {hotel.facilities.slice(0, viewMode === 'list' ? 5 : 3).map((facility) => (
                                  <span
                                    key={facility._id}
                                    className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md"
                                  >
                                    {facility.name}
                                  </span>
                                ))}
                                {hotel.facilities.length > (viewMode === 'list' ? 5 : 3) && (
                                  <button
                                    onClick={() => setFacilitiesToShow(hotel.facilities)}
                                    className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
                                  >
                                    +
                                    {hotel.facilities.length - (viewMode === 'list' ? 5 : 3)} more
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-500">No facilities</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedHotel(hotel)}
                          className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md ${
                            viewMode === 'list' ? 'px-6 py-2 mt-3' : 'w-full py-2.5 mt-4'
                          }`}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <HotelDetailModal
        hotel={selectedHotel}
        onClose={() => setSelectedHotel(null)}
        onRemoveSupplier={handleRemoveSupplier}
      />
      <FacilitiesModal facilities={facilitiesToShow} onClose={() => setFacilitiesToShow(null)} />
    </>
  );
};

export default HotelListPageV2;
