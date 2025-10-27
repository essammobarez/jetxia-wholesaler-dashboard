// src/app/wholesaler/flights-bs/offline-package/PackageForm.tsx

'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Save, Plane, Hotel } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import BasicInformation from './BasicInformation';
import FlightSelection from './FlightSelection';
import HotelSelection from './HotelSelection';
import Availability from './Availability';
import PackageHighlights from './PackageHighlights';
import ItineraryBuilder from './ItineraryBuilder';
import PackageInclusions from './PackageInclusions';
import PackageImages from './PackageImages';
import Pricing from './Pricing';
import Commission from './Commission';
import Dates from './Dates';

import { OfflinePackage, countriesWithCities } from './mockData';

interface PackageFormProps {
  package?: OfflinePackage;
  onClose: () => void;
  onSave: (packageData: OfflinePackage) => void;
}

const getAuthToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return document.cookie
    .split('; ')
    .find(r => r.startsWith('authToken='))
    ?.split('=')[1] || localStorage.getItem('authToken');
};

const PackageForm: React.FC<PackageFormProps> = ({ package: pkg, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: pkg?.title || '',
    destination: {
      city: pkg?.destination?.city || '',
      country: pkg?.destination?.country || '',
      region: pkg?.destination?.region || ''
    },
    duration: {
      days: pkg?.duration?.days || 1,
      nights: pkg?.duration?.nights || 0
    },
    description: pkg?.description || '',
    highlights: pkg?.highlights || [''],
    category: pkg?.category || 'Standard' as 'Budget' | 'Standard' | 'Luxury' | 'Premium',
    status: pkg?.status || 'Draft' as 'Active' | 'Sold Out' | 'Cancelled' | 'Draft',
    selectedBlockSeat: null as any,
    selectedDateIndex: null as number | null,
    selectedHotel: null as any,
    selectedRoomType: null as any,
    pricing: {
      adult: pkg?.pricing?.adult || 0,
      child: pkg?.pricing?.child || 0,
      infant: pkg?.pricing?.infant || 0,
      singleSupplement: pkg?.pricing?.singleSupplement || 0
    },
    supplierCommission: { type: 'fixed' as 'fixed' | 'percentage', value: 0 },
    agencyCommission: { type: 'percentage' as 'fixed' | 'percentage', value: 10 },
    availability: {
      singleRooms: {
        total: pkg?.availability?.singleRooms?.total || 0,
        booked: pkg?.availability?.singleRooms?.booked || 0
      },
      doubleRooms: {
        total: pkg?.availability?.doubleRooms?.total || 0,
        booked: pkg?.availability?.doubleRooms?.booked || 0
      },
      tripleRooms: {
        total: pkg?.availability?.tripleRooms?.total || 0,
        booked: pkg?.availability?.tripleRooms?.booked || 0
      }
    },
    dates: {
      startDate: pkg?.dates?.startDate || '',
      endDate: pkg?.dates?.endDate || '',
      bookingDeadline: pkg?.dates?.bookingDeadline || ''
    },
    itinerary: pkg?.itinerary || [] as any[],
    images: pkg?.images || [] as string[],
    selectedInclusions: {
      meals: [] as string[],
      activities: [] as string[],
      extras: [] as string[]
    }
  });


  const [blockSeatsData, setBlockSeatsData] = useState<any[]>([]);
  const [hotelBlockData, setHotelBlockData] = useState<any[]>([]);
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [showBlockSeatSelector, setShowBlockSeatSelector] = useState(false);
  const [showHotelSelector, setShowHotelSelector] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    flight: true,
    hotel: true,
    itinerary: false,
    inclusions: false,
    images: false
  });
  const [currentDay, setCurrentDay] = useState({
    day: 1,
    title: '',
    description: '',
    activities: [] as string[],
    meals: [] as string[],
    accommodation: ''
  });
  const [showDayForm, setShowDayForm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const availableMeals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const availableActivities = [
    'City Tour', 'Museum Visit', 'Beach Activities', 'Desert Safari',
    'Boat Cruise', 'Shopping', 'Cultural Show', 'Adventure Sports',
    'Wildlife Safari', 'Historical Sites', 'Food Tasting', 'Photography Tour'
  ];
  const availableExtras = [
    'Airport Meet & Greet', 'Tour Guide', 'Photography', 'Travel Insurance',
    'Visa Assistance', 'SIM Card', 'Laundry Service', 'Room Upgrade'
  ];

  const fetchBlockSeats = async () => {
    setIsLoadingFlights(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found.");
      }
      const response = await axios.get(`${process.env.NEXT_PUBLIC_FLIGHT_URL}/block-seats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.success) {
        const transformedData = response.data.data.map((seat: any) => ({
          id: seat._id,
          flightNumber: seat._id.slice(-6).toUpperCase(),
          airline: {
            name: seat.airline.name,
            logo: `https://ui-avatars.com/api/?name=${seat.airline.name.replace(/\s/g, "+")}&background=random`,
          },
          route: {
            from: [{ city: seat.route.from.iataCode, code: seat.route.from.iataCode }],
            to: [{ city: seat.route.to.iataCode, code: seat.route.to.iataCode }],
          },
          departureTime: "N/A",
          arrivalTime: "N/A",
          duration: "N/A",
          departureDate: seat.availableDates[0]?.departureDate || '',
          pricing: {
            economy: seat.classes.find((c: any) => c.classId === 1)?.price || 0,
            business: seat.classes.find((c: any) => c.classId === 2)?.price || 0,
            first: seat.classes.find((c: any) => c.classId === 3)?.price || 0,
          },
          availability: {
            class1: {
              total: seat.classes.find((c: any) => c.classId === 1)?.totalSeats || 0,
              booked: seat.classes.find((c: any) => c.classId === 1)?.bookedSeats || 0,
            },
            class2: {
              total: seat.classes.find((c: any) => c.classId === 2)?.totalSeats || 0,
              booked: seat.classes.find((c: any) => c.classId === 2)?.bookedSeats || 0,
            },
            class3: {
              total: seat.classes.find((c: any) => c.classId === 3)?.totalSeats || 0,
              booked: seat.classes.find((c: any) => c.classId === 3)?.bookedSeats || 0,
            }
          },
          availableDates: seat.availableDates.map((d: any) => ({
            departure: d.departureDate,
            return: d.returnDate,
          })),
        }));
        setBlockSeatsData(transformedData);
      } else {
        console.error("Failed to fetch block seats:", response.data.message);
        setBlockSeatsData([]);
      }
    } catch (error) {
      console.error("An error occurred while fetching block seats:", error);
      setBlockSeatsData([]);
    } finally {
      setIsLoadingFlights(false);
    }
  };

  const fetchHotelBlockRooms = async () => {
    setIsLoadingHotels(true);
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication token not found.");
        }
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}hotel-block-rooms`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.data && response.data.success) {
            const transformedData = response.data.data.hotelBlocks.map((hotel: any) => ({
                id: hotel._id,
                name: hotel.hotelName,
                city: hotel.city.name,
                country: hotel.country.name,
                rating: hotel.starRating,
                amenities: hotel.hotelAmenities || [],
                roomTypes: hotel.roomTypes.map((rt: any) => ({
                    id: rt._id, // Important for payload
                    name: rt.roomTypeName,
                    price: rt.price.value,
                    maxGuests: rt.maxGuests,
                })),
            }));
            setHotelBlockData(transformedData);
        } else {
            console.error("Failed to fetch hotel block rooms:", response.data.message);
            setHotelBlockData([]);
        }
    } catch (error) {
        console.error("An error occurred while fetching hotel block rooms:", error);
        setHotelBlockData([]);
    } finally {
        setIsLoadingHotels(false);
    }
  };

  const handleSelectFlightClick = () => {
    if (blockSeatsData.length === 0) {
      fetchBlockSeats();
    }
    setShowBlockSeatSelector(!showBlockSeatSelector);
  };

  const handleSelectHotelClick = () => {
    if (hotelBlockData.length === 0) {
        fetchHotelBlockRooms();
    }
    setShowHotelSelector(!showHotelSelector);
  };

  useEffect(() => {
    if (formData.selectedHotel) {
      const hotel = formData.selectedHotel;
      let singleCount = 0;
      let doubleCount = 0;
      let tripleCount = 0;
      hotel.roomTypes.forEach((room: any) => {
        if (room.maxGuests === 1) singleCount += 10;
        else if (room.maxGuests === 2) doubleCount += 10;
        else if (room.maxGuests >= 3) tripleCount += 10;
      });
      setFormData(prev => ({
        ...prev,
        availability: {
          singleRooms: { total: singleCount, booked: 0 },
          doubleRooms: { total: doubleCount, booked: 0 },
          tripleRooms: { total: tripleCount, booked: 0 }
        }
      }));
    }
  }, [formData.selectedHotel]);

  useEffect(() => {
    if (pkg?.destination?.country) {
      const country = pkg.destination.country;
      setSelectedCountry(country);
      const selected = countriesWithCities.find(c => c.country === country);
      setAvailableCities(selected ? selected.cities : []);
    }
  }, [pkg]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calculateCommission = (price: number, commission: { type: 'fixed' | 'percentage', value: number }) => {
    if (commission.type === 'fixed') return commission.value;
    return (price * commission.value) / 100;
  };

  const calculateNetPrice = () => {
    const basePrice = formData.pricing.adult;
    const supplierComm = calculateCommission(basePrice, formData.supplierCommission);
    const agencyComm = calculateCommission(basePrice, formData.agencyCommission);
    return basePrice - supplierComm - agencyComm;
  };

  const handleAddDay = () => {
    if (!currentDay.title || !currentDay.description) {
      toast.error('Please fill in day title and description');
      return;
    }
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { ...currentDay, day: prev.itinerary.length + 1 }]
    }));
    setCurrentDay({
      day: formData.itinerary.length + 2,
      title: '',
      description: '',
      activities: [],
      meals: [],
      accommodation: ''
    });
    setShowDayForm(false);
  };

  const handleRemoveDay = (dayNumber: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter(day => day.day !== dayNumber)
        .map((day, index) => ({ ...day, day: index + 1 }))
    }));
  };

  const handleToggleMeal = (meal: string) => {
    setCurrentDay(prev => ({
      ...prev,
      meals: prev.meals.includes(meal as any)
        ? prev.meals.filter(m => m !== meal)
        : [...prev.meals, meal as any]
    }));
  };

  const handleToggleActivity = (activity: string) => {
    setCurrentDay(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const handleToggleInclusion = (type: 'meals' | 'activities' | 'extras', item: string) => {
    setFormData(prev => ({
      ...prev,
      selectedInclusions: {
        ...prev.selectedInclusions,
        [type]: prev.selectedInclusions[type].includes(item)
          ? prev.selectedInclusions[type].filter(i => i !== item)
          : [...prev.selectedInclusions[type], item]
      }
    }));
  };

  const handleAddImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    const selected = countriesWithCities.find(c => c.country === country);
    setAvailableCities(selected ? selected.cities : []);
    setFormData(prev => ({
      ...prev,
      destination: { ...prev.destination, country, city: '' }
    }));
  };

  const handleAddHighlight = () => {
    setFormData(prev => ({ ...prev, highlights: [...prev.highlights, ''] }));
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));
  };

  const handleHighlightChange = (index: number, value: string) => {
    setFormData(prev => ({ ...prev, highlights: prev.highlights.map((h, i) => i === index ? value : h) }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title) newErrors.title = 'Package title is required';
    if (!formData.destination.city) newErrors.city = 'Destination city is required';
    if (!formData.destination.country) newErrors.country = 'Country is required';
    if (!formData.selectedBlockSeat) newErrors.blockSeat = 'Please select a flight';
    if (!formData.selectedHotel) newErrors.hotel = 'Please select a hotel';
    if (formData.pricing.adult <= 0) newErrors.pricing = 'Adult price must be greater than 0';
    if (!formData.dates.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.dates.endDate) newErrors.endDate = 'End date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
        toast.error("Please fill all required fields.");
        return;
    }

    const payload = {
        packageTitle: formData.title,
        country: formData.destination.country,
        city: formData.destination.city,
        region: formData.destination.region,
        days: formData.duration.days,
        nights: formData.duration.nights,
        description: formData.description,
        category: formData.category,
        status: formData.status.toLowerCase(),
        flights: [
            {
                flightBlockSeatId: formData.selectedBlockSeat.id,
                selectedSeats: 1 // Assuming 1 seat for now as it's not in the form
            }
        ],
        hotels: [
            {
                hotelBlockRoomId: formData.selectedHotel.id,
                selectedRooms: formData.selectedHotel.roomTypes.map((rt: any) => ({
                    roomTypeId: rt.id,
                    quantity: 1 // Assuming 1 room of each type for now
                }))
            }
        ],
        pricing: {
            adultPrice: formData.pricing.adult,
            childPrice: formData.pricing.child,
            infantPrice: formData.pricing.infant,
            singleSupplement: formData.pricing.singleSupplement,
            currency: "USD" // Hardcoded as per payload idea
        },
        supplierCommission: {
            type: formData.supplierCommission.type,
            value: formData.supplierCommission.value
        },
        agencyCommission: {
            type: formData.agencyCommission.type,
            value: formData.agencyCommission.value
        },
        startDate: new Date(formData.dates.startDate).toISOString(),
        endDate: new Date(formData.dates.endDate).toISOString(),
        bookingDeadline: formData.dates.bookingDeadline ? new Date(formData.dates.bookingDeadline).toISOString() : undefined
    };

    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication token not found.");
        }

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/packages`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.data && response.data.success) {
            toast.success("Package created successfully!");
            onSave(response.data.data); // Assuming the API returns the created package
            onClose();
        } else {
            toast.error(`Failed to create package: ${response.data.message}`);
        }
    } catch (error: any) {
        console.error("An error occurred while creating the package:", error);
        toast.error(`An error occurred: ${error.response?.data?.message || error.message}`);
    }
};

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {pkg ? 'Edit Package' : 'Create New Package'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Combine flights and hotels to create an offline package
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <BasicInformation
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              selectedCountry={selectedCountry}
              handleCountryChange={handleCountryChange}
              availableCities={availableCities}
              countriesWithCities={countriesWithCities}
            />
            <FlightSelection
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              blockSeatsData={blockSeatsData}
              isLoadingFlights={isLoadingFlights}
              showBlockSeatSelector={showBlockSeatSelector}
              handleSelectFlightClick={handleSelectFlightClick}
              setShowBlockSeatSelector={setShowBlockSeatSelector}
              setShowHotelSelector={setShowHotelSelector}
            />
            <HotelSelection
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              showHotelSelector={showHotelSelector}
              setShowHotelSelector={setShowHotelSelector}
              handleSelectHotelClick={handleSelectHotelClick}
              hotelBlockData={hotelBlockData}
              isLoadingHotels={isLoadingHotels}
            />
            <Availability formData={formData} setFormData={setFormData} />
            <PackageHighlights
              formData={formData}
              handleHighlightChange={handleHighlightChange}
              handleRemoveHighlight={handleRemoveHighlight}
              handleAddHighlight={handleAddHighlight}
            />
            <ItineraryBuilder
              formData={formData}
              setFormData={setFormData}
              toggleSection={toggleSection}
              expandedSections={expandedSections}
              currentDay={currentDay}
              setCurrentDay={setCurrentDay}
              showDayForm={showDayForm}
              setShowDayForm={setShowDayForm}
              handleAddDay={handleAddDay}
              handleRemoveDay={handleRemoveDay}
              handleToggleMeal={handleToggleMeal}
              handleToggleActivity={handleToggleActivity}
              availableMeals={availableMeals}
              availableActivities={availableActivities}
            />
            <PackageInclusions
              formData={formData}
              toggleSection={toggleSection}
              expandedSections={expandedSections}
              handleToggleInclusion={handleToggleInclusion}
              availableMeals={availableMeals}
              availableActivities={availableActivities}
              availableExtras={availableExtras}
            />
            <PackageImages
              formData={formData}
              toggleSection={toggleSection}
              expandedSections={expandedSections}
              handleAddImage={handleAddImage}
              handleRemoveImage={handleRemoveImage}
            />
          </div>

          {/* Right Column - Pricing, Commission, Dates */}
          <div className="lg:col-span-1 space-y-6">
            <Pricing formData={formData} setFormData={setFormData} errors={errors} />
            <Commission
              formData={formData}
              setFormData={setFormData}
              calculateCommission={calculateCommission}
              calculateNetPrice={calculateNetPrice}
            />
            <Dates
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
            />
            {/* Action Buttons */}
            <div className="card-modern p-6 border-2 border-blue-200 dark:border-blue-800 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  className="w-full btn-gradient flex items-center justify-center space-x-2 text-base"
                >
                  <Save className="w-5 h-5" />
                  <span>{pkg ? 'Update Package' : 'Create Package'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PackageForm;