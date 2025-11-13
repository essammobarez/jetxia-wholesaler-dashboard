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
// import ItineraryBuilder from './components/ItineraryBuilder';
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
  // This regex replacement logic is kept as per original file
  return str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
};

const getInitialFormData = (pkg?: ApiPackage) => {
  const flightBlock = pkg?.flights?.[0]?.flightBlockSeatId;
  
  // --- UPDATED INITIAL FLIGHT LOGIC ---
  const initialFlight = flightBlock ? {
      id: flightBlock._id,
      name: flightBlock.name,
      // Use the first airline from the new 'airlines' array
      airline: flightBlock.airlines?.[0] ? {
        name: flightBlock.airlines[0].name,
        logo: `https://ui-avatars.com/api/?name=${flightBlock.airlines[0].name.replace(/\s/g, "+")}&background=random`
      } : { name: 'Unknown Airline', logo: '' },
      route: flightBlock.route,
      // Get flight numbers from 'outboundSegments' and 'returnSegments'
      departureFlightNumber: flightBlock.route?.outboundSegments?.[0]?.flightNumber || "N/A",
      returnFlightNumber: flightBlock.route?.returnSegments?.[0]?.flightNumber || "N/A",
      
      // --- UPDATED TIME & DURATION MAPPING ---
      departureTime: flightBlock.availableDates?.[0]?.outboundSegmentTimes?.[0]?.departureTime || "N/A",
      arrivalTime: flightBlock.availableDates?.[0]?.outboundSegmentTimes?.[0]?.arrivalTime || "N/A",
      duration: flightBlock.availableDates?.[0]?.outboundSegmentTimes?.[0]?.flightDuration || "N/A",
      // --- END OF UPDATE ---

      departureDate: flightBlock.availableDates?.[0]?.departureDate || "N/A",
      // Get pricing from the new structure (classes -> pricing -> adult -> price)
      pricing: { 
        economy: flightBlock.classes?.find((c: any) => c.classId === 1)?.pricing.adult.price || 0,
        business: flightBlock.classes?.find((c: any) => c.classId === 2)?.pricing.adult.price || 0,
        first: flightBlock.classes?.find((c: any) => c.classId === 3)?.pricing.adult.price || 0,
      },
      // Get availability from the new structure
      availability: {
        class1: {
          total: flightBlock.classes?.find((c: any) => c.classId === 1)?.totalSeats || 0,
          booked: flightBlock.classes?.find((c: any) => c.classId === 1)?.bookedSeats || 0,
        },
        class2: {
          total: flightBlock.classes?.find((c: any) => c.classId === 2)?.totalSeats || 0,
          booked: flightBlock.classes?.find((c: any) => c.classId === 2)?.bookedSeats || 0,
        },
        class3: {
          total: flightBlock.classes?.find((c: any) => c.classId === 3)?.totalSeats || 0,
          booked: flightBlock.classes?.find((c: any) => c.classId === 3)?.bookedSeats || 0,
        }
      },
      // Map all available dates
      availableDates: flightBlock.availableDates?.map((d: any) => ({
        departure: d.departureDate,
        return: d.returnDate,
        deadline: d.deadline,
      })) || []
  } : null;
  // --- END OF UPDATED FLIGHT LOGIC ---

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

  // --- UPDATED: Logic for childPrice2to6 ---
  const child2to6Price = pkg?.pricing?.childPrice2to6;
  
  // --- UPDATED: Logic for mealPlan ---
  const mealType = pkg?.mealPlan?.type;
  let mealName = [];
  if (mealType === 'BB') mealName = ['Breakfast'];
  else if (mealType === 'RO') mealName = ['Room Only'];
  else if (mealType === 'HB') mealName = ['Half Board'];
  else if (mealType === 'FB') mealName = ['Full Board'];
  else if (mealType === 'AI') mealName = ['All Inclusive'];

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
    selectedDateIndex: null, // This remains, though logic in FlightSelection is updated
    selectedHotel: initialHotel,
    selectedRoomType: null,
    selectedHotelRooms: pkg?.hotels?.[0]?.selectedRooms || [],

    pricing: {
      adult: pkg?.pricing?.adultPrice || 0,
      child6to12: pkg?.pricing?.childPrice6to12 || 0,
      // --- UPDATED: child2to6 now an object ---
      child2to6: {
        price: (typeof child2to6Price === 'number' && child2to6Price > 0) ? child2to6Price : 0,
        isFree: (typeof child2to6Price !== 'number' || child2to6Price === 0)
      },
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
    // --- UPDATED: Itinerary mapping ---
    itinerary: pkg?.itinerary?.map((day: any) => ({
      day: day.day,
      title: day.title,
      description: day.description,
      activities: day.activities || [], // Expects string[]
      extraServices: day.extraServices || [], // Expects string[]
    })) || [] as any[],
    images: pkg?.packageImages || [] as string[],
    selectedInclusions: {
      // --- UPDATED: meals populated from mealPlan ---
      meals: mealName,
      // These are populated from GET response which still has these keys
      activities: pkg?.exclusions?.map((e: any) => ({ name: e.name, price: String(e.price || 0) })) || [],
      extras: pkg?.optionalExtras?.map((e: any) => ({ name: e.name, price: String(e.price || 0) })) || []
    }
  };
};

// --- ADDED: Meal plan mapping ---
const mealTypeMap = {
  'Room Only': 'RO',
  'Breakfast': 'BB',
  'Half Board': 'HB',
  'Full Board': 'FB',
  'All Inclusive': 'AI'
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
  // --- REMOVED: Itinerary state, now handled in PackageInclusions ---
  // const [currentDay, setCurrentDay] = useState(...);
  // const [showDayForm, setShowDayForm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedCountry, setSelectedCountry] = useState(cleanString(pkg?.country || ''));

  // --- REMOVED: availableMeals, availableActivities, availableExtras ---
  // These are now handled within PackageInclusions

  const fetchBlockSeats = async () => {
    setIsLoadingFlights(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication token not found.");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_FLIGHT_URL}/block-seats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.success) {
        
        // --- !! CRITICAL FIX HERE !! ---
        // Added robust checking to prevent 'cannot read name of undefined' error
        const transformedData = response.data.data.map((seat: any) => {
          // Safely get airline name
          const firstAirline = (seat.airlines && seat.airlines.length > 0) ? seat.airlines[0] : null;
          const airlineName = firstAirline && firstAirline.name ? firstAirline.name : 'Unknown Airline';
          const logoName = firstAirline && firstAirline.name ? firstAirline.name : 'N/A';

          return {
            id: seat._id,
            name: seat.name, // Map the 'name' field
            departureFlightNumber: seat.route.outboundSegments?.[0]?.flightNumber || 'N/A',
            returnFlightNumber: seat.route.returnSegments?.[0]?.flightNumber || 'N/A',
            airline: {
              name: airlineName,
              logo: `https://ui-avatars.com/api/?name=${logoName.replace(/\s/g, "+")}&background=random`,
            },
            // Add optional chaining to route properties for safety
            route: {
              from: [{ city: seat.route?.from?.iataCode, code: seat.route?.from?.iataCode, country: seat.route?.from?.country }],
              to: [{ city: seat.route?.to?.iataCode, code: seat.route?.to?.iataCode, country: seat.route?.to?.country }],
            },
            
            departureTime: seat.availableDates?.[0]?.outboundSegmentTimes?.[0]?.departureTime || "N/A",
            arrivalTime: seat.availableDates?.[0]?.outboundSegmentTimes?.[0]?.arrivalTime || "N/A",
            duration: seat.availableDates?.[0]?.outboundSegmentTimes?.[0]?.flightDuration || "N/A",
            
            departureDate: seat.availableDates[0]?.departureDate || '',
            pricing: {
              economy: seat.classes.find((c: any) => c.classId === 1)?.pricing.adult.price || 0,
              business: seat.classes.find((c: any) => c.classId === 2)?.pricing.adult.price || 0,
              first: seat.classes.find((c: any) => c.classId === 3)?.pricing.adult.price || 0,
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
              deadline: d.deadline,
            })),
          };
        });
        // --- !! END OF FIX !! ---

        setBlockSeatsData(transformedData);
      } else {
        setBlockSeatsData([]);
      }
    } catch (error) {
      console.error("Error fetching block seats:", error); // This will log the error you saw
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

  // --- REMOVED: Itinerary handlers (handleAddDay, handleRemoveDay, etc.) ---
  // This logic is now fully contained in PackageInclusions.tsx

  // --- REMOVED: handleToggleInclusion ---
  // This logic is now fully contained in PackageInclusions.tsx

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
  
  // --- !! KEY FIX IS HERE !! ---
  // Updated the filter logic to be robust against trailing/leading whitespace
  // by using trim() on both the data and the selected country.
  const filteredBlockSeatsData = useMemo(() => {
    if (!selectedCountry) return [];
    return blockSeatsData.filter(seat =>
      seat.route.to[0]?.country?.trim().toLowerCase() === selectedCountry.trim().toLowerCase()
    );
  }, [blockSeatsData, selectedCountry]);
  // --- !! END OF FIX !! ---

  // --- REMOVED: buildInclusionsPayload, buildExclusionsPayload, buildOptionalExtrasPayload ---

  // --- UPDATED: buildItineraryPayload ---
  const buildItineraryPayload = () => {
      return formData.itinerary.map((day: any) => ({
          day: day.day,
          title: day.title || "",
          description: day.description || "",
          activities: day.activities || [],
          extraServices: day.extraServices || [],
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

    // --- ADDED: Meal plan mapping ---
    const selectedMeal = formData.selectedInclusions.meals[0] || 'Room Only';
    const mealType = mealTypeMap[selectedMeal as keyof typeof mealTypeMap] || 'RO';

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
        // --- ADDED: mealPlan ---
        mealPlan: {
            type: mealType,
        },
        
        // --- REMOVED: inclusions, exclusions, optionalExtras ---

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
        // --- UPDATED: pricing payload ---
        pricing: {
            adultPrice: formData.pricing.adult,
            childPrice6to12: formData.pricing.child6to12,
            childPrice2to6: formData.pricing.child2to6.isFree ? 0 : formData.pricing.child2to6.price,
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
    
    // --- REMOVED: inclusions, exclusions, optionalExtras check ---

    // --- ADDED: mealPlan check ---
    if (JSON.stringify(formData.selectedInclusions.meals) !== JSON.stringify(originalFormData.selectedInclusions.meals)) {
      const selectedMeal = formData.selectedInclusions.meals[0] || 'Room Only';
      changedData.mealPlan = {
        type: mealTypeMap[selectedMeal as keyof typeof mealTypeMap] || 'RO'
      };
    }

    if (formData.selectedBlockSeat?.id !== originalFormData.selectedBlockSeat?.id) {
      changedData.flights = [{ flightBlockSeatId: formData.selectedBlockSeat.id, selectedSeats: 1 }];
    }

    if (formData.selectedHotel?.id !== originalFormData.selectedHotel?.id) {
      changedData.hotels = [{
          hotelBlockRoomId: formData.selectedHotel.id,
          selectedRooms: (formData.selectedHotel.roomTypes || []).map((rt: any) => ({ roomTypeId: rt.id, quantity: 1 }))
      }];
    }
    
    // --- UPDATED: pricing check ---
    const changedPricing: { [key: string]: any } = {};
    if (formData.pricing.adult !== originalFormData.pricing.adult) changedPricing.adultPrice = formData.pricing.adult;
    if (formData.pricing.child6to12 !== originalFormData.pricing.child6to12) changedPricing.childPrice6to12 = formData.pricing.child6to12;
    
    const newChild2to6Price = formData.pricing.child2to6.isFree ? 0 : formData.pricing.child2to6.price;
    const oldChild2to6Price = originalFormData.pricing.child2to6.isFree ? 0 : originalFormData.pricing.child2to6.price;
    if (newChild2to6Price !== oldChild2to6Price) changedPricing.childPrice2to6 = newChild2to6Price;

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

    // --- UPDATED: Itinerary change detection ---
    const originalItineraryPayload = originalFormData.itinerary.map((day: any) => ({
      day: day.day,
      title: day.title || "",
      description: day.description || "",
      activities: day.activities || [],
      extraServices: day.extraServices || [],
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
            {/* <ItineraryBuilder
              ...
            /> */}
            <PackageInclusions
              formData={formData}
              setFormData={setFormData} 
              toggleSection={toggleSection}
              expandedSections={expandedSections}
              // --- REMOVED: Unused props ---
              // handleToggleInclusion={handleToggleInclusion}
              // availableMeals={availableMeals}
              // availableActivities={availableActivities}
              // availableExtras={availableExtras}
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