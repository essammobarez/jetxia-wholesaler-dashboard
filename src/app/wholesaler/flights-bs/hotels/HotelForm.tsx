'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Hotel,
  Plus,
  Trash2,
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
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Info,
  Building,
  Bed,
  Save,
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Country, City, ICountry, ICity } from 'country-state-city';

import {
  HotelInventory,
  RoomType,
  HotelAmenity,
  getAuthToken
} from './HotelsModule';

interface HotelFormProps {
  hotel?: HotelInventory;
  onClose: () => void;
  onSave: (hotel: any) => void;
}

const HotelForm = ({ hotel, onSave, onClose }: HotelFormProps) => {
  const [formData, setFormData] = useState({
    name: hotel?.name || '',
    category: hotel?.category || 5,
    location: {
      city: hotel?.location.city || '',
      country: hotel?.location.country || '',
      address: hotel?.location.address || '',
    },
    description: hotel?.description || '',
    images: hotel?.images || [] as string[],
    checkInDate: '',
    checkOutDate: '',
    availableDates: hotel?.availableDates?.map(d => ({...d, checkIn: d.checkIn.split('T')[0], checkOut: d.checkOut.split('T')[0]})) || [] as { id: string; checkIn: string; checkOut: string }[],
    currency: hotel?.currency || 'USD',
    supplierCommission: hotel?.supplierCommission || {
      type: 'fixed' as 'fixed' | 'percentage',
      value: 0,
    },
    agencyCommission: hotel?.agencyCommission || {
      type: 'fixed' as 'fixed' | 'percentage',
      value: 0,
    },
    roomTypes: hotel?.roomTypes?.map(rt => ({ ...rt })) || [] as RoomType[],
    amenities: hotel?.amenities?.map(am => ({...am})) || [] as HotelAmenity[],
    status: hotel?.status || 'Available' as 'Available' | 'Sold Out' | 'Maintenance' | 'Blocked',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newRoomType, setNewRoomType] = useState<RoomType>({
    type: '',
    price: 0,
    maxOccupancy: 2,
    available: 0,
    total: 0,
    amenities: []
  });

  const [allCountries, setAllCountries] = useState<ICountry[]>([]);
  const [availableCities, setAvailableCities] = useState<ICity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAllCountries(Country.getAllCountries());
  }, []);


  useEffect(() => {
    if (formData.location.country) {
      const countryData = allCountries.find(c => c.name === formData.location.country);
      if (countryData) {
        const cities = City.getCitiesOfCountry(countryData.isoCode);
        setAvailableCities(cities || []);

        if (hotel && hotel.location.country === formData.location.country && !cities.find(c => c.name === formData.location.city)) {
             setFormData(prev => ({ ...prev, location: { ...prev.location, city: '' } }));
        }
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableCities([]);
    }
  }, [formData.location.country, hotel, allCountries]);


  const handleCountryChange = (countryName: string) => {
    const selectedCountryData = allCountries.find(c => c.name === countryName);

    if (selectedCountryData) {
      const cities = City.getCitiesOfCountry(selectedCountryData.isoCode);
      setAvailableCities(cities || []);
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          country: selectedCountryData.name,
          city: ''
        }
      }));
    } else {
         setAvailableCities([]);
         setFormData(prev => ({
            ...prev,
            location: {
            ...prev.location,
            country: '',
            city: ''
            }
         }));
    }
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
  ];

  const getSelectedCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === formData.currency);
    return currency ? currency.symbol : '';
  };

  const availableAmenitiesList = [
    { icon: Wifi, name: 'Free WiFi' },
    { icon: Car, name: 'Parking' },
    { icon: Dumbbell, name: 'Fitness Center' },
    { icon: Waves, name: 'Swimming Pool' },
    { icon: Utensils, name: 'Restaurant' },
    { icon: Coffee, name: 'Room Service' },
  ];

  const handleToggleAmenity = (amenityName: string, icon: any) => {
    const exists = formData.amenities.some(a => a.name === amenityName);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        amenities: prev.amenities.filter(a => a.name !== amenityName)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, { icon, name: amenityName, available: true }]
      }));
    }
  };


  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Hotel name is required';
    if (!formData.location.city) newErrors.city = 'City is required';
    if (!formData.location.country) newErrors.country = 'Country is required';
    if (formData.roomTypes.length === 0) newErrors.roomTypes = 'At least one room type is required';
    if (formData.availableDates.length === 0) newErrors.availableDates = 'At least one available date period is required';
    formData.roomTypes.forEach((rt, index) => {
        if (!rt.type) newErrors[`roomType_${index}_type`] = `Room type name is required for room #${index + 1}`;
        if (rt.price <= 0) newErrors[`roomType_${index}_price`] = `Price must be positive for room #${index + 1}`;
        if (rt.total <= 0) newErrors[`roomType_${index}_total`] = `Blocked rooms must be positive for room #${index + 1}`;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRoomType = () => {
    if (!newRoomType.type) {
        toast.warn('Please enter a room type name.');
        return;
    }
     if (newRoomType.price <= 0) {
        toast.warn('Please enter a valid price greater than 0.');
        return;
    }
    if (newRoomType.total <= 0) {
        toast.warn('Please enter a valid number of blocked rooms greater than 0.');
        return;
    }

    setFormData(prev => ({
        ...prev,
        roomTypes: [...prev.roomTypes, { ...newRoomType, available: newRoomType.total }]
    }));
    setNewRoomType({
        type: '',
        price: 0,
        maxOccupancy: 2,
        available: 0,
        total: 0,
        amenities: []
    });
  };

  const handleRemoveRoomType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
    }

    const isEditing = !!hotel?.id;
    let apiPayload: any = {};
    const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}hotel-block-rooms${isEditing ? `/${hotel.id}` : ''}`;
    const method = isEditing ? 'PATCH' : 'POST';

    if (isEditing && hotel) { // Ensure hotel object exists for comparison
        // Build PATCH payload with only changed values
        if (formData.name !== hotel.name) apiPayload.hotelName = formData.name;
        if (formData.category !== hotel.category) apiPayload.starRating = formData.category;
        if (formData.location.address !== hotel.location.address) apiPayload.fullAddress = formData.location.address;
        if (formData.description !== hotel.description) apiPayload.description = formData.description;
        if (formData.currency !== hotel.currency) apiPayload.currency = formData.currency;
        
        if (formData.location.country !== hotel.location.country || formData.location.city !== hotel.location.city) {
            const countryData = allCountries.find(c => c.name === formData.location.country);
            apiPayload.country = {
                id: countryData?.isoCode || 'N/A',
                name: formData.location.country,
                iso: countryData?.isoCode || 'N/A',
            };
            apiPayload.city = {
                id: availableCities.find(c => c.name === formData.location.city)?.stateCode || 'N/A',
                name: formData.location.city,
                countryId: countryData?.isoCode || 'N/A',
            };
        }

        // Deep comparison for arrays of objects can be complex; simplified for this case
        if (JSON.stringify(formData.availableDates) !== JSON.stringify(hotel.availableDates)) {
            apiPayload.availableDatePeriods = formData.availableDates.map(date => ({
                checkInDate: `${date.checkIn}T15:00:00.000Z`,
                checkOutDate: `${date.checkOut}T11:00:00.000Z`,
            }));
        }

        if (JSON.stringify(formData.roomTypes) !== JSON.stringify(hotel.roomTypes)) {
            apiPayload.roomTypes = formData.roomTypes.map(room => ({
                roomTypeName: room.type,
                blockedRooms: room.total,
                price: { value: room.price, currency: formData.currency },
                maxGuests: room.maxOccupancy,
            }));
        }

        if (JSON.stringify(formData.supplierCommission) !== JSON.stringify(hotel.supplierCommission)) {
            apiPayload.supplierCommission = formData.supplierCommission;
        }
        if (JSON.stringify(formData.agencyCommission) !== JSON.stringify(hotel.agencyCommission)) {
            apiPayload.agencyCommission = formData.agencyCommission;
        }
        
        // This is a simple check; for complex objects, a deep-diff library might be better
        if (Object.keys(apiPayload).length === 0) {
            toast.info("No changes were made.");
            setIsLoading(false);
            onClose();
            return;
        }

    } else {
        // Build POST payload (full object) for creating a new hotel
        const selectedCountryObj = allCountries.find(c => c.name === formData.location.country);
        apiPayload = {
          hotelName: formData.name,
          starRating: formData.category,
          country: {
            id: selectedCountryObj?.isoCode || 'N/A',
            name: formData.location.country,
            iso: selectedCountryObj?.isoCode || 'N/A',
          },
          city: {
            id: availableCities.find(c => c.name === formData.location.city)?.stateCode || 'N/A',
            name: formData.location.city,
            countryId: selectedCountryObj?.isoCode || 'N/A',
          },
          fullAddress: formData.location.address,
          description: formData.description,
          availableDatePeriods: formData.availableDates.map(date => ({
            checkInDate: `${date.checkIn}T15:00:00.000Z`,
            checkOutDate: `${date.checkOut}T11:00:00.000Z`,
          })),
          roomTypes: formData.roomTypes.map(room => ({
            roomTypeName: room.type,
            blockedRooms: room.total,
            price: { value: room.price, currency: formData.currency },
            maxGuests: room.maxOccupancy,
          })),
          currency: formData.currency,
          supplierCommission: formData.supplierCommission,
          agencyCommission: formData.agencyCommission,
          status: formData.status === 'Available' ? 'active' : 'inactive',
        };
    }

    try {
      const response = await fetch(API_URL, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const responseData = await response.json();

      // Construct the full object for UI update after a successful save/update
      const savedHotelData: HotelInventory = {
            id: responseData.data?._id || hotel?.id || Date.now().toString(),
            name: formData.name,
            category: formData.category,
            location: formData.location,
            description: formData.description,
            images: formData.images,
            amenities: formData.amenities,
            roomTypes: formData.roomTypes,
            checkInDate: formData.availableDates[0]?.checkIn || 'N/A',
            checkOutDate: formData.availableDates[0]?.checkOut || 'N/A',
            availableDates: formData.availableDates,
            supplierCommission: formData.supplierCommission,
            agencyCommission: formData.agencyCommission,
            currency: formData.currency,
            status: formData.status,
            totalRooms: formData.roomTypes.reduce((sum, room) => sum + room.total, 0),
            availableRooms: formData.roomTypes.reduce((sum, room) => sum + (room.available > 0 ? room.available : room.total), 0),
            rating: hotel?.rating || 0,
            reviews: hotel?.reviews || 0,
            createdAt: responseData.data?.createdAt?.split('T')[0] || hotel?.createdAt || new Date().toISOString().split('T')[0],
            validUntil: formData.availableDates?.[formData.availableDates.length - 1]?.checkOut || 'N/A',
      };

      onSave(savedHotelData);
      toast.success(isEditing ? 'update successfull' : 'Hotel added successfully!');
      onClose();

    } catch (error: any) {
      console.error('API Error:', error);
      toast.error(`Error saving hotel: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Hotel className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {hotel ? 'Edit Hotel' : 'Add New Hotel'}
                </h2>
                <p className="text-sm text-purple-100 mt-1">
                  Fill in the hotel details below
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-purple-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-purple-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-3 shadow-md">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hotel Name */}
              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                  placeholder="e.g., Four Seasons Hotel"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2 font-medium flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Star Category */}
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Star Rating *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                >
                  <option value={5}>Five Star</option>
                  <option value={4}>Four Star</option>
                  <option value={3}>Three Star</option>
                  <option value={2}>Two Star</option>
                  <option value={1}>One Star</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                >
                  <option value="Available">Available</option>
                  <option value="Sold Out">Sold Out</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Country *
                </label>
                <select
                  value={formData.location.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold"
                >
                  <option value="">Select Country</option>
                  {allCountries.map((country) => (
                    <option key={country.isoCode} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm mt-2 font-medium flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.country}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  City *
                </label>
                <select
                  value={formData.location.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  disabled={!formData.location.country}
                  className={`w-full px-5 py-4 text-base border-2 rounded-xl transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:outline-none shadow-sm hover:shadow-md font-semibold ${
                    !formData.location.country
                      ? 'border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-100 dark:focus:ring-blue-900/30'
                  }`}
                >
                  <option value="">{formData.location.country ? 'Select City' : 'Select Country First'}</option>
                  {availableCities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-500 text-sm mt-2 font-medium flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Full Address
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                  placeholder="e.g., 1089 Corniche El Nil, Garden City"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                  placeholder="Describe the hotel features and highlights..."
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-blue-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-blue-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl mr-3 shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Hotel Amenities
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select all amenities available at your hotel
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableAmenitiesList.map((amenity) => {
                const IconComponent = amenity.icon;
                const isSelected = formData.amenities.some(a => a.name === amenity.name);

                return (
                  <button
                    key={amenity.name}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity.name, amenity.icon)}
                    className={`flex items-center p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold text-sm ${
                        isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {amenity.name}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            {formData.amenities.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                  Selected: {formData.amenities.length} amenities
                </p>
              </div>
            )}
          </div>

          {/* Room Types */}
          <div className="bg-gradient-to-br from-green-50 via-white to-green-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-green-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-green-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-3 shadow-md">
                <Bed className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Room Types & Pricing
              </h3>
            </div>

            {/* Add New Room Type */}
            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Add New Room Type
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                   <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Room Type Name *
                      </label>
                      <input
                           type="text"
                           value={newRoomType.type}
                           onChange={(e) => setNewRoomType(prev => ({ ...prev, type: e.target.value }))}
                           className={`w-full px-4 py-2 bg-white dark:bg-gray-700 border-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm ${errors['newRoom_type'] ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                           placeholder="e.g., Deluxe Room"
                      />
                       {errors['newRoom_type'] && <p className="text-red-500 text-xs mt-1">{errors['newRoom_type']}</p>}
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Price *
                      </label>
                      <input
                           type="number"
                           value={newRoomType.price}
                           onChange={(e) => setNewRoomType(prev => ({ ...prev, price: Number(e.target.value) || 0 }))}
                           min="0"
                           className={`w-full px-4 py-2 bg-white dark:bg-gray-700 border-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm ${errors['newRoom_price'] ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                           placeholder="0"
                      />
                       {errors['newRoom_price'] && <p className="text-red-500 text-xs mt-1">{errors['newRoom_price']}</p>}
                  </div>
                   <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Blocked Rooms *
                      </label>
                      <input
                           type="number"
                           value={newRoomType.total}
                           onChange={(e) => setNewRoomType(prev => ({ ...prev, total: Number(e.target.value) || 0 }))}
                           min="0"
                           className={`w-full px-4 py-2 bg-white dark:bg-gray-700 border-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm ${errors['newRoom_total'] ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                           placeholder="0"
                      />
                       {errors['newRoom_total'] && <p className="text-red-500 text-xs mt-1">{errors['newRoom_total']}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Max Guests
                    </label>
                    <input
                      type="number"
                      value={newRoomType.maxOccupancy}
                      onChange={(e) => setNewRoomType(prev => ({ ...prev, maxOccupancy: Number(e.target.value) || 1 }))}
                      min="1"
                      max="10"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddRoomType}
                      disabled={!newRoomType.type || newRoomType.price <= 0 || newRoomType.total <= 0}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all flex items-center justify-center disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </button>
                  </div>
              </div>
            </div>


            {/* Room Types List */}
            {formData.roomTypes.length > 0 ? (
              <div className="space-y-4">
                {formData.roomTypes.map((room, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-green-200 dark:border-gray-600 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                          {room.type || `Room #${index + 1}`}
                        </h5>
                         {errors[`roomType_${index}_type`] && <p className="text-red-500 text-xs mt-1">{errors[`roomType_${index}_type`]}</p>}
                         {errors[`roomType_${index}_price`] && <p className="text-red-500 text-xs mt-1">{errors[`roomType_${index}_price`]}</p>}
                         {errors[`roomType_${index}_total`] && <p className="text-red-500 text-xs mt-1">{errors[`roomType_${index}_total`]}</p>}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {getSelectedCurrencySymbol()} {room.price} / night
                          </span>
                           <span className="flex items-center">
                              <Bed className="w-4 h-4 mr-1" />
                              {room.total} Blocked
                           </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            Max {room.maxOccupancy} guests
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRoomType(index)}
                        className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-all ml-4"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <Bed className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">No room types added yet</p>
                {errors.roomTypes && (
                  <p className="text-red-500 text-sm mt-2 font-medium flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.roomTypes}
                  </p>
                )}
              </div>
            )}
          </div>


          {/* Dates & Availability */}
          <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-orange-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-orange-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mr-3 shadow-md">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dates & Availability
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  <Calendar className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                  Check-In Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.checkInDate ? new Date(formData.checkInDate) : null}
                    onChange={(date) => {
                      const dateString = date ? date.toISOString().split('T')[0] : '';
                      setFormData(prev => ({ ...prev, checkInDate: dateString }));
                    }}
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Select check-in date"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-base cursor-pointer border-gray-300 dark:border-gray-600"
                    wrapperClassName="w-full"
                    showPopperArrow={false}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  <Calendar className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                  Check-Out Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.checkOutDate ? new Date(formData.checkOutDate) : null}
                    onChange={(date) => {
                      const dateString = date ? date.toISOString().split('T')[0] : '';
                      setFormData(prev => ({ ...prev, checkOutDate: dateString }));
                    }}
                    minDate={formData.checkInDate ? new Date(formData.checkInDate) : new Date()}
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Select check-out date"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-base cursor-pointer border-gray-300 dark:border-gray-600"
                    wrapperClassName="w-full"
                    showPopperArrow={false}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
              </div>
            </div>

            {/* Available Dates Management */}
            <div className="mt-8 pt-8 border-t-2 border-orange-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  Available Date Periods *
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.checkInDate && formData.checkOutDate) {
                        if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
                            toast.warn("Check-out date must be after check-in date.");
                            return;
                        }
                      const newDate = {
                        id: Date.now().toString(),
                        checkIn: formData.checkInDate,
                        checkOut: formData.checkOutDate
                      };
                      setFormData(prev => ({
                        ...prev,
                        availableDates: [...prev.availableDates, newDate],
                        checkInDate: '',
                        checkOutDate: ''
                      }));
                    } else {
                        toast.warn("Please select both check-in and check-out dates.");
                    }
                  }}
                  disabled={!formData.checkInDate || !formData.checkOutDate}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all flex items-center shadow-md disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Period
                </button>
              </div>
               {errors.availableDates && (
                 <p className="text-red-500 text-sm mb-4 font-medium flex items-center">
                     <AlertTriangle className="w-4 h-4 mr-1" />
                     {errors.availableDates}
                 </p>
               )}

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Add specific date periods when this hotel is available for booking.
              </p>

              {formData.availableDates.length > 0 ? (
                <div className="space-y-3">
                  {formData.availableDates.map((dateItem, index) => (
                    <div
                      key={dateItem.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-orange-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-6">
                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          #{index + 1}
                        </span>
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-In</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white">
                              {new Date(dateItem.checkIn + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-Out</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white">
                               {new Date(dateItem.checkOut + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            availableDates: prev.availableDates.filter(d => d.id !== dateItem.id)
                          }));
                        }}
                        className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-all"
                        title="Remove this period"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed ${errors.availableDates ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                        No date periods added yet
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Select dates above and click "Add Period"
                    </p>
                    {errors.availableDates && (
                         <p className="text-red-500 text-sm mt-2 font-medium flex items-center justify-center">
                             <AlertTriangle className="w-4 h-4 mr-1" />
                             {errors.availableDates}
                         </p>
                    )}
                </div>
              )}

              {formData.availableDates.length > 0 && (
                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-orange-700 dark:text-orange-400 font-medium flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Total available periods: <span className="font-bold ml-1">{formData.availableDates.length}</span>
                  </p>
                </div>
              )}
            </div>
          </div>


          {/* Commission & Currency */}
          <div className="bg-gradient-to-br from-teal-50 via-white to-teal-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-teal-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-teal-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl mr-3 shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pricing & Commission
              </h3>
            </div>

            {/* Currency Selection */}
            <div className="mb-6">
              <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Currency *
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 transition-all text-base font-medium"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier Commission */}
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Supplier Commission
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Commission from hotel (deducted from net cost)
                </p>

                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      supplierCommission: { ...prev.supplierCommission, type: 'fixed' }
                    }))}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.supplierCommission.type === 'fixed'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Fixed
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      supplierCommission: { ...prev.supplierCommission, type: 'percentage' }
                    }))}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.supplierCommission.type === 'percentage'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    %
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={formData.supplierCommission.value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      supplierCommission: { ...prev.supplierCommission, value: Number(e.target.value) || 0 }
                    }))}
                    min="0"
                    step="0.01"
                    max={formData.supplierCommission.type === 'percentage' ? 100 : undefined}
                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-base font-medium"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                    {formData.supplierCommission.type === 'percentage' ? '%' : getSelectedCurrencySymbol()}
                  </span>
                </div>
              </div>

              {/* Agency Commission */}
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Agency Commission
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Commission to agencies (deducted from sale price)
                </p>

                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      agencyCommission: { ...prev.agencyCommission, type: 'fixed' }
                    }))}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.agencyCommission.type === 'fixed'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Fixed
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      agencyCommission: { ...prev.agencyCommission, type: 'percentage' }
                    }))}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.agencyCommission.type === 'percentage'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    %
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={formData.agencyCommission.value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      agencyCommission: { ...prev.agencyCommission, value: Number(e.target.value) || 0 }
                    }))}
                    min="0"
                    step="0.01"
                    max={formData.agencyCommission.type === 'percentage' ? 100 : undefined}
                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-base font-medium"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                    {formData.agencyCommission.type === 'percentage' ? '%' : getSelectedCurrencySymbol()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="border-t-2 border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              type="button"
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all shadow-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              type="button"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2" />
              {isLoading ? 'Saving...' : (hotel ? 'Update Hotel' : 'Save Hotel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelForm;