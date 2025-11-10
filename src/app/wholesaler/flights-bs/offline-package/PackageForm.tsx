'use client';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';
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

import { ApiPackage } from './OfflinePackageModule';

interface PackageFormProps {
  package?: ApiPackage;
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

const formatDateForInput = (isoDate: string | undefined) => {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toISOString().split('T')[0];
  } catch (error) {
    console.warn("Could not parse date:", isoDate);
    return '';
  }
};

const cleanString = (str: string) => {
  if (!str) return '';
  return str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
};

const getInitialFormData = (pkg?: ApiPackage) => {
  const flightBlock = pkg?.flights?.[0]?.flightBlockSeatId;
  const initialFlight = flightBlock ? {
      id: flightBlock._id,
      name: flightBlock.name,
      airline: flightBlock.airline,
      route: flightBlock.route,
      // Map flight numbers from route if available, otherwise fallback (though your new API seems to have them in route)
      departureFlightNumber: flightBlock.route?.departureFlightNumber || "N/A",
      returnFlightNumber: flightBlock.route?.returnFlightNumber || "N/A",
      departureTime: "N/A",
      arrivalTime: "N/A",
      duration: "N/A",
      departureDate: "N/A",
      pricing: { economy: 0, business: 0, first: 0 },
      availability: { class1: {}, class2: {}, class3: {} },
      availableDates: []
  } : null;

  const hotelBlock = pkg?.hotels?.[0]?.hotelBlockRoomId;
  const initialHotel = hotelBlock ? {
      id: hotelBlock._id,
      name: hotelBlock.hotelName,
      rating: hotelBlock.starRating,
      city: hotelBlock.city?.name,
      country: hotelBlock.country?.name,
      amenities: [],
      roomTypes: [] 
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
    highlights: pkg?.highlights?.sort((a: any, b: any) => a.order - b.order).map((h: any) => h.text) || [''],
    category: (pkg?.category as 'Leisure & Adventure' | 'Budget' | 'Standard' | 'Luxury' | 'Premium') || 'Standard',
    status: (pkg?.status ? (pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)) : 'Active') as 'Active' | 'Sold Out' | 'Cancelled' | 'Draft',
    
    selectedBlockSeat: initialFlight,
    selectedDateIndex: null,
    selectedHotel: initialHotel,
    selectedRoomType: null,
    selectedHotelRooms: pkg?.hotels?.[0]?.selectedRooms || [],

    pricing: {
      adult: pkg?.pricing?.adultPrice || 0,
      child6to12: pkg?.pricing?.childPrice6to12 || 0,
      child2to6: pkg?.pricing?.childPrice2to6 || 0,
      infant: pkg?.pricing?.infantPrice || 0,
      singleSupplement: pkg?.pricing?.singleSupplement || 0
    },
    supplierCommission: pkg?.supplierCommission || { type: 'fixed' as 'fixed' | 'percentage', value: 0 },
    agencyCommission: pkg?.agencyCommission || { type: 'percentage' as 'fixed' | 'percentage', value: 10 },
    availability: {
      singleRooms: { total: 0, booked: 0 },
      doubleRooms: { total: 0, booked: 0 },
      tripleRooms: { total: 0, booked: 0 }
    },
    dates: {
      startDate: formatDateForInput(pkg?.startDate),
      endDate: formatDateForInput(pkg?.endDate),
      bookingDeadline: formatDateForInput(pkg?.bookingDeadline)
    },
    itinerary: pkg?.itinerary?.map((day: any) => ({
      day: day.dayNumber,
      title: day.title,
      description: day.description,
      activities: day.activities?.map((a: any) => a.activity) || [],
      meals: [
        day.meals?.breakfast ? 'Breakfast' : null,
        day.meals?.lunch ? 'Lunch' : null,
        day.meals?.dinner ? 'Dinner' : null
      ].filter(Boolean),
      accommodation: day.accommodation || ''
    })) || [] as any[],
    images: pkg?.packageImages || [] as string[],
    selectedInclusions: {
      // Load meals from pkg.inclusions (string array)
      meals: pkg?.inclusions?.map((i: any) => i.name).filter(Boolean) || [],
      // Load exclusions from pkg.exclusions, map to {name, price} for the UI
      activities: pkg?.exclusions?.map((e: any) => ({ name: e.name, price: String(e.price || 0) })) || [],
      // Load optional extras from pkg.optionalExtras, map to {name, price} for the UI
      extras: pkg?.optionalExtras?.map((e: any) => ({ name: e.name, price: String(e.price || 0) })) || []
    }
  };
};

const PackageForm: React.FC<PackageFormProps> = ({ package: pkg, onClose, onSave }) => {
  const [formData, setFormData] = useState(() => getInitialFormData(pkg));
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
  const [selectedCountry, setSelectedCountry] = useState(cleanString(pkg?.country || ''));

  const availableMeals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const availableActivities = [
    'City Tour', 'Museum Visit', 'Beach Activities', 'Desert Safari',
    'Boat Cruise', 'Shopping', 'Cultural Show', 'Adventure Sports',
    'Wildlife Safari', 'Historical Sites', 'Food Tasting', 'Photography Tour'
  ];
  const availableExtras = [
    'Airport Meet & Greet', 'Tour Guide', 'Photography', 'Travel Insurance',
    'Visa Assistance', 'SIM Card', 'Laundry Service', 'Room Upgrade', 'Airport Round-trip Transfers', 'UAE Entry Visa'
  ];

  const fetchBlockSeats = async () => {
    setIsLoadingFlights(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication token not found.");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_FLIGHT_URL}/block-seats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.success) {
        const transformedData = response.data.data.map((seat: any) => ({
          id: seat._id,
          // Explicitly mapping Flight Numbers from route
          departureFlightNumber: seat.route.departureFlightNumber,
          returnFlightNumber: seat.route.returnFlightNumber,
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
            deadline: d.deadline, // Explicitly mapping deadline
          })),
        }));
        setBlockSeatsData(transformedData);
      } else {
        setBlockSeatsData([]);
      }
    } catch (error) {
      console.error("Error fetching block seats:", error);
      setBlockSeatsData([]);
    } finally {
      setIsLoadingFlights(false);
    }
  };

  const fetchHotelBlockRooms = async () => {
    setIsLoadingHotels(true);
    try {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication token not found.");
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/hotel-block-rooms`, {
            headers: { Authorization: `Bearer ${token}` },
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
                    id: rt._id,
                    name: rt.roomTypeName,
                    price: rt.price.value,
                    maxGuests: rt.maxGuests,
                })),
            }));
            setHotelBlockData(transformedData);
        } else {
            setHotelBlockData([]);
        }
    } catch (error) {
        console.error("Error fetching hotel blocks:", error);
        setHotelBlockData([]);
    } finally {
        setIsLoadingHotels(false);
    }
  };

  const handleSelectFlightClick = () => {
    if (blockSeatsData.length === 0) fetchBlockSeats();
    setShowBlockSeatSelector(!showBlockSeatSelector);
  };

  const handleSelectHotelClick = () => {
    if (hotelBlockData.length === 0) fetchHotelBlockRooms();
    setShowHotelSelector(!showHotelSelector);
  };

  useEffect(() => {
    if (formData.selectedHotel && formData.selectedHotel.roomTypes?.length > 0) {
      const hotel = formData.selectedHotel;
      let singleCount = 0, doubleCount = 0, tripleCount = 0;
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
  }, [formData.selectedHotel?.roomTypes]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      destination: { ...prev.destination, country: selectedCountry },
    }));
  
    const originalCountry = cleanString(pkg?.country || '');
    if (selectedCountry !== originalCountry) {
      setFormData(prev => ({
        ...prev,
        destination: { ...prev.destination, country: selectedCountry, city: '' },
        selectedBlockSeat: null,
        selectedDateIndex: null,
        selectedHotel: null,
        selectedRoomType: null,
        selectedHotelRooms: [], 
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
        [type]: (prev.selectedInclusions[type] as string[]).includes(item)
          ? (prev.selectedInclusions[type] as string[]).filter(i => i !== item)
          : [...(prev.selectedInclusions[type] as string[]), item]
      }
    }));
  };

  const handleImageUpload = (base64String: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, base64String]
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleCountryChange = (country: string) => setSelectedCountry(country);

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
    if (!selectedCountry) return [];
    return blockSeatsData.filter(seat =>
      seat.route.to[0]?.country?.toLowerCase() === selectedCountry.toLowerCase()
    );
  }, [blockSeatsData, selectedCountry]);

  // --- NEW PAYLOAD FUNCTIONS ---

  // 1. Build INCLUSIONS (from Meals)
  const buildInclusionsPayload = () => {
    return formData.selectedInclusions.meals.map((meal: string) => ({
      name: meal,
      description: "", // As requested
      price: 0, // Meals from this section don't have a price in the UI
      currency: "USD",
      type: "included",
      category: "", // As requested
      icon: "restaurant" // Matching example
    }));
  };

  // 2. Build EXCLUSIONS (from "Activities Excluded" in UI)
  const buildExclusionsPayload = () => {
    // Note: The UI saves "Activities Excluded" into formData.selectedInclusions.activities
    return formData.selectedInclusions.activities.map((item: any) => ({
      name: item.name,
      description: "", // As requested
      price: parseFloat(item.price) || 0,
      currency: "USD",
      type: "excluded",
      category: "", // As requested
      icon: "do_not_disturb_on" // Generic icon for exclusion
    }));
  };

  // 3. Build OPTIONAL EXTRAS (from "Extra Services" in UI)
  const buildOptionalExtrasPayload = () => {
    // Note: The UI saves "Extra Services" into formData.selectedInclusions.extras
    return formData.selectedInclusions.extras.map((item: any) => ({
      name: item.name,
      description: "", // As requested
      price: parseFloat(item.price) || 0,
      currency: "USD",
      type: "optional",
      category: "", // As requested
      icon: "star" // Matching example
    }));
  };
  
  // --- END OF NEW PAYLOAD FUNCTIONS ---


  const buildItineraryPayload = () => {
      return formData.itinerary.map(day => ({
          dayNumber: day.day,
          title: day.title || "",
          description: day.description || "",
          activities: day.activities.map((act: string) => ({
              time: "Variable",
              activity: act,
              description: ""
          })),
          meals: {
              breakfast: day.meals.includes('Breakfast'),
              lunch: day.meals.includes('Lunch'),
              dinner: day.meals.includes('Dinner')
          },
          accommodation: day.accommodation || ""
      }));
  };

  const buildFullPayload = () => {
    let hotelRoomsPayload;
    if (formData.selectedHotel?.roomTypes?.length > 0) {
      hotelRoomsPayload = formData.selectedHotel.roomTypes.map((rt: any) => ({
        roomTypeId: rt.id,
        quantity: 1 
      }));
    } else {
      hotelRoomsPayload = formData.selectedHotelRooms;
    }

    return {
        packageTitle: formData.title,
        country: formData.destination.country,
        city: formData.destination.city,
        region: formData.destination.region || "",
        days: formData.duration.days,
        nights: formData.duration.nights,
        description: formData.description,
        category: formData.category,
        status: formData.status.toLowerCase(),
        packageImages: formData.images,
        highlights: formData.highlights.filter(h => h.trim() !== '').map((text, index) => ({
            text,
            order: index + 1
        })),
        itinerary: buildItineraryPayload(),
        mealPlan: {
            type: "BB", 
            description: "Bed & Breakfast - Daily breakfast included"
        },
        
        // --- UPDATED PAYLOAD KEYS ---
        inclusions: buildInclusionsPayload(),
        exclusions: buildExclusionsPayload(),
        optionalExtras: buildOptionalExtrasPayload(),
        // --- END OF UPDATES ---

        flights: [
            {
                flightBlockSeatId: formData.selectedBlockSeat.id,
                selectedSeats: 1 
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
            childPrice6to12: formData.pricing.child6to12,
            childPrice2to6: formData.pricing.child2to6,
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

  const buildPartialPayload = () => {
    const changedData: { [key: string]: any } = {};

    if (formData.title !== originalFormData.title) changedData.packageTitle = formData.title;
    if (formData.destination.country !== originalFormData.destination.country) changedData.country = formData.destination.country;
    if (formData.destination.city !== originalFormData.destination.city) changedData.city = formData.destination.city;
    if (formData.destination.region !== originalFormData.destination.region) changedData.region = formData.destination.region;
    if (formData.duration.days !== originalFormData.duration.days) changedData.days = formData.duration.days;
    if (formData.duration.nights !== originalFormData.duration.nights) changedData.nights = formData.duration.nights;
    if (formData.description !== originalFormData.description) changedData.description = formData.description;
    if (formData.category !== originalFormData.category) changedData.category = formData.category;
    if (formData.status.toLowerCase() !== originalFormData.status.toLowerCase()) changedData.status = formData.status.toLowerCase();

    if (JSON.stringify(formData.images) !== JSON.stringify(originalFormData.images)) {
        changedData.packageImages = formData.images;
    }
    if (JSON.stringify(formData.highlights) !== JSON.stringify(originalFormData.highlights)) {
        changedData.highlights = formData.highlights.filter(h => h.trim() !== '').map((text, index) => ({ text, order: index + 1 }));
    }
    
    const newItinerary = buildItineraryPayload();
    
    // --- UPDATED INCLUSIONS/EXCLUSIONS/EXTRAS ---
    if (JSON.stringify(formData.selectedInclusions) !== JSON.stringify(originalFormData.selectedInclusions)) {
        changedData.inclusions = buildInclusionsPayload();
        changedData.exclusions = buildExclusionsPayload();
        changedData.optionalExtras = buildOptionalExtrasPayload();
    }
    // --- END OF UPDATE ---


    if (formData.selectedBlockSeat?.id !== originalFormData.selectedBlockSeat?.id) {
      changedData.flights = [{ flightBlockSeatId: formData.selectedBlockSeat.id, selectedSeats: 1 }];
    }

    if (formData.selectedHotel?.id !== originalFormData.selectedHotel?.id) {
      changedData.hotels = [{
          hotelBlockRoomId: formData.selectedHotel.id,
          selectedRooms: (formData.selectedHotel.roomTypes || []).map((rt: any) => ({ roomTypeId: rt.id, quantity: 1 }))
      }];
    }
    
    const changedPricing: { [key: string]: any } = {};
    if (formData.pricing.adult !== originalFormData.pricing.adult) changedPricing.adultPrice = formData.pricing.adult;
    if (formData.pricing.child6to12 !== originalFormData.pricing.child6to12) changedPricing.childPrice6to12 = formData.pricing.child6to12;
    if (formData.pricing.child2to6 !== originalFormData.pricing.child2to6) changedPricing.childPrice2to6 = formData.pricing.child2to6;
    if (formData.pricing.infant !== originalFormData.pricing.infant) changedPricing.infantPrice = formData.pricing.infant;
    if (formData.pricing.singleSupplement !== originalFormData.pricing.singleSupplement) changedPricing.singleSupplement = formData.pricing.singleSupplement;
    if (Object.keys(changedPricing).length > 0) {
      changedPricing.currency = "USD";
      changedData.pricing = changedPricing;
    }

    if (JSON.stringify(formData.supplierCommission) !== JSON.stringify(originalFormData.supplierCommission)) {
      changedData.supplierCommission = formData.supplierCommission;
    }
    if (JSON.stringify(formData.agencyCommission) !== JSON.stringify(originalFormData.agencyCommission)) {
      changedData.agencyCommission = formData.agencyCommission;
    }

    if (formData.dates.startDate !== originalFormData.dates.startDate) changedData.startDate = new Date(formData.dates.startDate).toISOString();
    if (formData.dates.endDate !== originalFormData.dates.endDate) changedData.endDate = new Date(formData.dates.endDate).toISOString();
    if (formData.dates.bookingDeadline !== originalFormData.dates.bookingDeadline) changedData.bookingDeadline = formData.dates.bookingDeadline ? new Date(formData.dates.bookingDeadline).toISOString() : undefined;

    // Check if itinerary actually changed
    const originalItineraryPayload = originalFormData.itinerary.map(day => ({
      dayNumber: day.day,
      title: day.title || "",
      description: day.description || "",
      activities: day.activities.map((act: string) => ({
        time: "Variable",
        activity: act,
        description: ""
      })),
      meals: {
        breakfast: day.meals.includes('Breakfast'),
        lunch: day.meals.includes('Lunch'),
        dinner: day.meals.includes('Dinner')
      },
      accommodation: day.accommodation || ""
    }));


    if(JSON.stringify(newItinerary) !== JSON.stringify(originalItineraryPayload)) {
      changedData.itinerary = newItinerary;
    }

    return changedData;
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
        toast.error("Please fill all required fields.");
        return;
    }

    const isEditing = !!pkg;
    let payload = isEditing ? buildPartialPayload() : buildFullPayload();
    let url = isEditing ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/packages/${pkg._id}` : `${process.env.NEXT_PUBLIC_BACKEND_URL}/packages`;
    let method: 'post' | 'patch' = isEditing ? 'patch' : 'post';

    if (isEditing && Object.keys(payload).length === 0) {
        toast("No changes detected.", { icon: "🤷" });
        return;
    }
    
    try {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication token not found.");

        const response = await axios[method](url, payload, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.success) {
            toast.success(`Package ${isEditing ? 'updated' : 'created'} successfully!`);
            onSave(response.data.data);
            onClose();
        } else {
            toast.error(`Failed to ${isEditing ? 'update' : 'create'} package: ${response.data.message}`);
        }
    } catch (error: any) {
        console.error(`Error ${isEditing ? 'updating' : 'creating'} package:`, error);
        toast.error(`An error occurred: ${error.response?.data?.message || error.message}`);
    }
};

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto">
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
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BasicInformation
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              selectedCountry={selectedCountry}
              handleCountryChange={handleCountryChange}
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
              setFormData={setFormData} 
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
              handleImageUpload={handleImageUpload}
              handleRemoveImage={handleRemoveImage}
            />
          </div>

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
            <div className="card-modern p-6 border-2 border-blue-200 dark:border-blue-800 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="space-y-3">
                <button onClick={handleSubmit} className="w-full btn-gradient flex items-center justify-center space-x-2 text-base">
                  <Save className="w-5 h-5" />
                  <span>{pkg ? 'Update Package' : 'Create Package'}</span>
                </button>
                <button onClick={onClose} className="w-full px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2">
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