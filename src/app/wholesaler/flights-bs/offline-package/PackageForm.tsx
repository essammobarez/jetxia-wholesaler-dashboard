'use client';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, X, Save, Plane, Hotel } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import BasicInformation from './components/BasicInformation';
import FlightSelection from './components/FlightSelection';
import HotelSelection from './components/HotelSelection';
import Availability from './components/Availability';
import PackageHighlights from './components/PackageHighlights';
import ItineraryBuilder from './components/ItineraryBuilder';
import PackageInclusions from './components/PackageInclusions';
import PackageImages from './components/PackageImages';
import Pricing from './components/Pricing';
import Commission from './components/Commission';
import Dates from './components/Dates';

import { countriesWithCities } from './mockData'; // Keep this for the country/city dropdowns
import { ApiPackage } from './OfflinePackageModule'; // Import the correct package type

interface PackageFormProps {
  package?: ApiPackage; // Use ApiPackage type
  onClose: () => void;
  onSave: (packageData: ApiPackage) => void;
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

// Helper function to format ISO date string to "YYYY-MM-DD" for date inputs
const formatDateForInput = (isoDate: string | undefined) => {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toISOString().split('T')[0];
  } catch (error) {
    console.warn("Could not parse date:", isoDate);
    return '';
  }
};

// Helper function to clean emoji/unicode from country names
const cleanString = (str: string) => {
  if (!str) return '';
  // This regex matches most common emojis and symbols
  return str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
};

// Helper function to initialize form state from a package
const getInitialFormData = (pkg?: ApiPackage) => {
  // Reconstruct a partial flight object for display/ID
  const flightBlock = pkg?.flights[0]?.flightBlockSeatId;
  const initialFlight = flightBlock ? {
      id: flightBlock._id, // For handleSubmit
      name: flightBlock.name, // For display
      airline: flightBlock.airline, // For display
      route: flightBlock.route, // For display
      // Add stubs for other properties that FlightSelection might try to render
      flightNumber: flightBlock._id.slice(-6).toUpperCase(),
      departureTime: "N/A",
      arrivalTime: "N/A",
      duration: "N/A",
      departureDate: "N/A",
      pricing: { economy: 0, business: 0, first: 0 },
      availability: { class1: {}, class2: {}, class3: {} },
      availableDates: []
  } : null;

  // Reconstruct a partial hotel object for display/ID
  const hotelBlock = pkg?.hotels[0]?.hotelBlockRoomId;
  const initialHotel = hotelBlock ? {
      id: hotelBlock._id, // For handleSubmit
      name: hotelBlock.hotelName, // For display
      rating: hotelBlock.starRating, // For display
      city: hotelBlock.city.name, // For display
      country: hotelBlock.country.name, // For display
      // Add stubs
      amenities: [],
      roomTypes: [] // This will be populated if user *changes* the hotel
  } : null;

  return {
    title: pkg?.packageTitle || '',
    destination: {
      city: pkg?.city || '',
      country: cleanString(pkg?.country || ''),
      region: pkg?.region || ''
    },
    duration: {
      days: pkg?.days || 1,
      nights: pkg?.nights || 0
    },
    description: pkg?.description || '',
    highlights: [''], // 'highlights' is not in the API response, default to form's structure
    category: (pkg?.category as 'Budget' | 'Standard' | 'Luxury' | 'Premium') || 'Standard',
    status: (pkg?.status ? (pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)) : 'Active') as 'Active' | 'Sold Out' | 'Cancelled' | 'Draft',
    
    selectedBlockSeat: initialFlight,
    selectedDateIndex: null, // This doesn't seem to be in the API response
    selectedHotel: initialHotel,
    selectedRoomType: null, // This doesn't seem to be in the API response
    
    // Store the *original* selected rooms for submit logic
    selectedHotelRooms: pkg?.hotels[0]?.selectedRooms || [],

    pricing: {
      adult: pkg?.pricing?.adultPrice || 0,
      child: pkg?.pricing?.childPrice || 0,
      infant: pkg?.pricing?.infantPrice || 0,
      singleSupplement: pkg?.pricing?.singleSupplement || 0
    },
    supplierCommission: pkg?.supplierCommission || { type: 'fixed' as 'fixed' | 'percentage', value: 0 },
    agencyCommission: pkg?.agencyCommission || { type: 'percentage' as 'fixed' | 'percentage', value: 10 },
    availability: {
      // 'availability' is not in the API response, default to form's structure
      singleRooms: { total: 0, booked: 0 },
      doubleRooms: { total: 0, booked: 0 },
      tripleRooms: { total: 0, booked: 0 }
    },
    dates: {
      startDate: formatDateForInput(pkg?.startDate),
      endDate: formatDateForInput(pkg?.endDate),
      bookingDeadline: formatDateForInput(pkg?.bookingDeadline)
    },
    itinerary: [] as any[], // 'itinerary' is not in the API response
    images: pkg?.packageImages || [] as string[],
    selectedInclusions: {
      // 'inclusions' is not in the API response
      meals: [] as string[],
      activities: [] as string[],
      extras: [] as string[]
    }
  };
};


const PackageForm: React.FC<PackageFormProps> = ({ package: pkg, onClose, onSave }) => {
  
  // Use an initializer function for useState to map props
  const [formData, setFormData] = useState(() => getInitialFormData(pkg));
  // Store the original state for comparison during update
  const [originalFormData] = useState(() => getInitialFormData(pkg));


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
  
  // Initialize selectedCountry from the (cleaned) package data
  const [selectedCountry, setSelectedCountry] = useState(cleanString(pkg?.country || ''));
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
            from: [{ city: seat.route.from.iataCode, code: seat.route.from.iataCode, country: seat.route.from.country }],
            to: [{ city: seat.route.to.iataCode, code: seat.route.to.iataCode, country: seat.route.to.country }],
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
    if (formData.selectedHotel && formData.selectedHotel.roomTypes?.length > 0) {
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
    // Populate cities when country changes
    if (selectedCountry) {
        const selected = countriesWithCities.find(c => c.country === selectedCountry);
        setAvailableCities(selected ? selected.cities : []);
    } else {
      setAvailableCities([]);
    }
  }, [selectedCountry, countriesWithCities]);
  
  // Sync form state if selectedCountry changes
  useEffect(() => {
    // On mount, this just syncs the country from state, but keeps the city from getInitialFormData
    setFormData(prev => ({
      ...prev,
      destination: { ...prev.destination, country: selectedCountry },
    }));

     // Only reset selections AND CITY if the country is *actually* changed by the user
     if (pkg && selectedCountry !== cleanString(pkg.country)) {
      setFormData(prev => ({
        ...prev,
        destination: { ...prev.destination, city: '' }, // Reset city here
        selectedBlockSeat: null,
        selectedDateIndex: null,
        selectedHotel: null,
      }));
      setErrors(prev => ({...prev, city: '', blockSeat: '', hotel: ''}));
    }
  }, [selectedCountry, pkg]);


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
    // Reset city and selections
    setFormData(prev => ({
      ...prev,
      destination: { ...prev.destination, country, city: '' },
      selectedBlockSeat: null,
      selectedDateIndex: null,
      selectedHotel: null,
    }));
    setErrors(prev => ({...prev, city: '', blockSeat: '', hotel: ''}));
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
  
  const filteredBlockSeatsData = useMemo(() => {
    if (!selectedCountry) {
      return []; // Return empty array if no country is selected
    }
    // Print the target value to the console
    console.log("Filtering flights for target country:", selectedCountry);

    return blockSeatsData.filter(seat =>
      seat.route.from[0]?.country?.toLowerCase() === selectedCountry.toLowerCase()
    );
  }, [blockSeatsData, selectedCountry]);

  // Builds the payload for *only* changed fields during an update
  const buildPartialPayload = () => {
    const changedData: { [key: string]: any } = {};

    // Compare simple string/number fields
    if (formData.title !== originalFormData.title) changedData.packageTitle = formData.title;
    if (formData.destination.country !== originalFormData.destination.country) changedData.country = formData.destination.country;
    if (formData.destination.city !== originalFormData.destination.city) changedData.city = formData.destination.city;
    if (formData.destination.region !== originalFormData.destination.region) changedData.region = formData.destination.region;
    if (formData.duration.days !== originalFormData.duration.days) changedData.days = formData.duration.days;
    if (formData.duration.nights !== originalFormData.duration.nights) changedData.nights = formData.duration.nights;
    if (formData.description !== originalFormData.description) changedData.description = formData.description;
    if (formData.category !== originalFormData.category) changedData.category = formData.category;
    if (formData.status.toLowerCase() !== originalFormData.status.toLowerCase()) changedData.status = formData.status.toLowerCase();

    // Compare selected flight
    if (formData.selectedBlockSeat?.id !== originalFormData.selectedBlockSeat?.id) {
      changedData.flights = [
        {
          flightBlockSeatId: formData.selectedBlockSeat.id,
          selectedSeats: 1 // Assuming 1 seat
        }
      ];
    }

    // Compare selected hotel
    if (formData.selectedHotel?.id !== originalFormData.selectedHotel?.id) {
      changedData.hotels = [
        {
          hotelBlockRoomId: formData.selectedHotel.id,
          selectedRooms: (formData.selectedHotel.roomTypes || []).map((rt: any) => ({
            roomTypeId: rt.id,
            quantity: 1 // Assuming 1 room
          }))
        }
      ];
    }
    
    // Compare nested pricing object
    const changedPricing: { [key: string]: any } = {};
    if (formData.pricing.adult !== originalFormData.pricing.adult) changedPricing.adultPrice = formData.pricing.adult;
    if (formData.pricing.child !== originalFormData.pricing.child) changedPricing.childPrice = formData.pricing.child;
    if (formData.pricing.infant !== originalFormData.pricing.infant) changedPricing.infantPrice = formData.pricing.infant;
    if (formData.pricing.singleSupplement !== originalFormData.pricing.singleSupplement) changedPricing.singleSupplement = formData.pricing.singleSupplement;
    if (Object.keys(changedPricing).length > 0) {
      // Add currency if any price changed
      changedPricing.currency = "USD";
      changedData.pricing = changedPricing;
    }

    // Compare supplier commission
    if (formData.supplierCommission.type !== originalFormData.supplierCommission.type || formData.supplierCommission.value !== originalFormData.supplierCommission.value) {
      changedData.supplierCommission = formData.supplierCommission;
    }

    // Compare agency commission
    if (formData.agencyCommission.type !== originalFormData.agencyCommission.type || formData.agencyCommission.value !== originalFormData.agencyCommission.value) {
      changedData.agencyCommission = formData.agencyCommission;
    }

    // Compare dates
    if (formData.dates.startDate !== originalFormData.dates.startDate) changedData.startDate = new Date(formData.dates.startDate).toISOString();
    if (formData.dates.endDate !== originalFormData.dates.endDate) changedData.endDate = new Date(formData.dates.endDate).toISOString();
    if (formData.dates.bookingDeadline !== originalFormData.dates.bookingDeadline) changedData.bookingDeadline = formData.dates.bookingDeadline ? new Date(formData.dates.bookingDeadline).toISOString() : undefined;

    // Note: itinerary, images, highlights, etc., are not in the original `pkg` data model,
    // so they are not compared here. If you add them to the API, you'd compare them too.

    return changedData;
  }

  // Builds the full payload for creating a new package
  const buildFullPayload = () => {
    // Logic to determine the correct hotel rooms payload
    let hotelRoomsPayload;
    if (formData.selectedHotel?.roomTypes?.length > 0) {
      hotelRoomsPayload = formData.selectedHotel.roomTypes.map((rt: any) => ({
        roomTypeId: rt.id,
        quantity: 1 // Default to 1, as form doesn't specify quantity
      }));
    } else {
      // Fallback in case hotel was selected but roomTypes aren't populated
      hotelRoomsPayload = formData.selectedHotelRooms;
    }

    return {
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
                selectedSeats: 1 // Assuming 1 seat
            }
        ],
        hotels: [
            {
                hotelBlockRoomId: formData.selectedHotel.id,
                selectedRooms: hotelRoomsPayload 
            }
        ],
        pricing: {
            adultPrice: formData.pricing.adult,
            childPrice: formData.pricing.child,
            infantPrice: formData.pricing.infant,
            singleSupplement: formData.pricing.singleSupplement,
            currency: "USD"
        },
        supplierCommission: formData.supplierCommission,
        agencyCommission: formData.agencyCommission,
        startDate: new Date(formData.dates.startDate).toISOString(),
        endDate: new Date(formData.dates.endDate).toISOString(),
        bookingDeadline: formData.dates.bookingDeadline ? new Date(formData.dates.bookingDeadline).toISOString() : undefined,
    };
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
        toast.error("Please fill all required fields.");
        return;
    }

    const isEditing = !!pkg;
    let payload: { [key: string]: any } = {};
    let url = '';
    let method: 'post' | 'patch' = 'post'; // Changed 'put' to 'patch'

    if (isEditing) {
      // --- UPDATE (PATCH) LOGIC ---
      payload = buildPartialPayload();
      
      if (Object.keys(payload).length === 0) {
        toast("No changes detected.", { icon: "🤷" });
        return;
      }
      
      url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/packages/${pkg._id}`;
      method = 'patch'; // Use PATCH for update

    } else {
      // --- CREATE (POST) LOGIC ---
      payload = buildFullPayload();
      url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/packages`;
      method = 'post';
    }
    
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication token not found.");
        }

        const response = await axios[method]( // axios[method] will be axios.patch or axios.post
            url,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.data && response.data.success) {
            toast.success(`Package ${isEditing ? 'updated' : 'created'} successfully!`);
            onSave(response.data.data); // onSave handles both create/update in parent
            onClose();
        } else {
            toast.error(`Failed to ${isEditing ? 'update' : 'create'} package: ${response.data.message}`);
        }
    } catch (error: any) {
        console.error(`An error occurred while ${isEditing ? 'updating' : 'creating'} the package:`, error);
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
              blockSeatsData={filteredBlockSeatsData}
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