import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField, MenuItem, CircularProgress, Typography, IconButton, Tooltip } from '@mui/material';
import { Close as CloseIcon, Star as StarIcon, Apartment as ApartmentIcon } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs'; // <-- ADDED dayjs import for date logic
import { debounce } from 'lodash';
import axios from 'axios';

// API Configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// --- TYPES ---
type City = {
  id: string;
  name: string;
  countryId: string;
  countryName: string;
};

type HotelFromDestinationSearch = {
  _id: string;
  name: string;
  city: {
    name: string;
  };
};

type Facility = {
  id: number;
  name: string;
  _id: string;
};

type HotelFromCitySearch = {
  _id: string;
  name: string;
  address: string;
  stars: number;
  mainImageUrl: string;
  facilities: Facility[];
  city: {
    id: string;
    name: string;
    countryId: string;
  };
  country: {
    id: string;
    name: string;
    iso: string;
  };
  mappedSuppliers: {
    supplier: string;
    supplierHotelId: number;
    _id: string;
  }[];
};

type DestinationSearchResult = {
  cities: City[];
  hotels: HotelFromDestinationSearch[];
};

type HotelSearchParams = {
  city?: string;
  hotelName?: string;
};

// --- API CALLS ---

const hotelDestinationQuery = async (searchTerm: string): Promise<DestinationSearchResult> => {
  try {
    const response = await axiosInstance.get(
      `irix/localdb?searchTerm=${searchTerm}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return { cities: [], hotels: [] };
  }
};

const searchHotels = async (params: HotelSearchParams): Promise<HotelFromCitySearch[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.city) {
      queryParams.append('city', params.city);
    }
    if (params.hotelName) {
      queryParams.append('hotelName', params.hotelName);
    }
    const response = await axiosInstance.get(
      `manual-reservation/search?${queryParams.toString()}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return [];
  }
};

// --- UI COMPONENTS ---
type FormSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

const FormSection: React.FC<FormSectionProps> = ({ title, children, className = '' }) => (
  <div className={`bg-white shadow-md rounded-xl p-6 md:p-8 ${className}`}>
    <h2 className="text-xl font-semibold mb-6 text-gray-800">{title}</h2>
    <div className="space-y-6">{children}</div>
  </div>
);

const HotelDetails: React.FC<{ hotel: HotelFromCitySearch | null }> = ({ hotel }) => {
  if (!hotel) {
    return (
      <div className="bg-white rounded-xl shadow-md h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-300">
        <ApartmentIcon className="text-gray-400" style={{ fontSize: 50 }} />
        <h3 className="mt-4 text-lg font-semibold text-gray-700">Hotel Details</h3>
        <p className="mt-1 text-sm text-gray-500">
          Select a destination and a hotel to see its information here.
        </p>
      </div>
    );
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon key={i} fontSize="small" className={i < count ? 'text-yellow-500' : 'text-gray-300'} />
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
      {hotel.mainImageUrl && (
        <div className="w-full h-48 flex-shrink-0">
          <img
            src={hotel.mainImageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6 flex-grow flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-bold text-gray-800 leading-tight">{hotel.name}</h3>
          <div className="flex items-center flex-shrink-0 ml-4 mt-1">{renderStars(hotel.stars)}</div>
        </div>
        <div>
          <p className="text-sm text-gray-600">{hotel.address}</p>
          <p className="text-sm text-gray-500">{hotel.city.name}, {hotel.country.name}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Facilities:</h4>
          <div className="flex flex-wrap items-center gap-2">
            {hotel.facilities.slice(0, 3).map(facility => (
              <span
                key={facility._id}
                className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {facility.name}
              </span>
            ))}
            {hotel.facilities.length > 3 && (
              <Tooltip title={hotel.facilities.slice(3).map(f => f.name).join(', ')} arrow>
                <span
                  className="bg-gray-300 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer"
                >
                  ...
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
type DestinationProps = {
    destination: string;
    setDestination: (value: string) => void;
    selectedHotelId: string;
    setSelectedHotelId: (id: string) => void;
    selectedHotelDetails: HotelFromCitySearch | null;
    setSelectedHotelDetails: (hotel: HotelFromCitySearch | null) => void;
    checkIn: Dayjs | null;
    setCheckIn: (date: Dayjs | null) => void;
    checkOut: Dayjs | null;
    setCheckOut: (date: Dayjs | null) => void;
};

export const Destination: React.FC<DestinationProps> = ({
    destination,
    setDestination,
    selectedHotelId,
    setSelectedHotelId,
    selectedHotelDetails,
    setSelectedHotelDetails,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
}) => {
  const [cities, setCities] = useState<City[]>([]);
  const [hotels, setHotels] = useState<HotelFromDestinationSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  const [hotelsFromCitySearch, setHotelsFromCitySearch] = useState<HotelFromCitySearch[]>([]);
  const [hotelLoading, setHotelLoading] = useState(false);
 
  const [hotelInputValue, setHotelInputValue] = useState('');
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);

  const [nights, setNights] = useState<number | ''>('');

  // --- NEW: State to control the checkout calendar visibility ---
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const debouncedSearch = useRef(
    debounce(async (searchTerm: string) => {
      if (searchTerm.length > 2) {
        setLoading(true);
        const data = await hotelDestinationQuery(searchTerm);
        setCities(data.cities);
        setHotels(data.hotels);
        setLoading(false);
        setShowSuggestions(true);
      } else {
        setCities([]);
        setHotels([]);
        setShowSuggestions(false);
      }
    }, 500)
  ).current;

  useEffect(() => {
    if (checkIn && checkOut) {
      const diff = checkOut.diff(checkIn, 'day');
      setNights(diff > 0 ? diff : '');
    } else {
      setNights('');
    }
  }, [checkIn, checkOut]);

  useEffect(() => {
    if (selectedHotelId) {
      const hotel = hotelsFromCitySearch.find(h => h._id === selectedHotelId);
      setSelectedHotelDetails(hotel || null);
      if (hotel) {
        setHotelInputValue(hotel.name);
      }
    } else {
      setSelectedHotelDetails(null);
      setHotelInputValue('');
    }
  }, [selectedHotelId, hotelsFromCitySearch, setSelectedHotelDetails]);

  const handleDestinationInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDestination(value);
    setSelectedHotelId('');
    setHotelsFromCitySearch([]);
    debouncedSearch(value);
  };

  const handleClearDestination = () => {
    setDestination('');
    setCities([]);
    setHotels([]);
    setShowSuggestions(false);
    setHotelsFromCitySearch([]);
    setSelectedHotelId('');
    if (destinationInputRef.current) {
      destinationInputRef.current.focus();
    }
  };

  const handleCitySelect = async (city: City) => {
    setDestination(`${city.name}, ${city.countryName}`);
    setShowSuggestions(false);
    setHotelsFromCitySearch([]);
    setSelectedHotelId('');
    setHotelLoading(true);
    const hotelsData = await searchHotels({ city: city.name });
    setHotelsFromCitySearch(hotelsData);
    setHotelLoading(false);
  };

  const handleHotelSelect = async (hotel: HotelFromDestinationSearch) => {
    setDestination(`${hotel.name}, ${hotel.city.name}`);
    setShowSuggestions(false);
    setHotelsFromCitySearch([]);
    setSelectedHotelId('');
    setHotelLoading(true);

    const hotelsData = await searchHotels({ city: hotel.city.name, hotelName: hotel.name });
    setHotelsFromCitySearch(hotelsData);

    if (hotelsData.length === 1) {
      setSelectedHotelId(hotelsData[0]._id);
    }

    setHotelLoading(false);
  };

  const filteredHotels = hotelsFromCitySearch.filter(hotel =>
    hotel.name.toLowerCase().includes(hotelInputValue.toLowerCase())
  );

  // --- NEW: Advanced styles for the calendar ---
  const datePickerSlotProps = {
    layout: {
      sx: {
        '.MuiDateCalendar-root': {
          backgroundColor: '#f8fafc',
        },
        '.MuiPickersCalendarHeader-root': {
          backgroundColor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
        },
        '.MuiPickersCalendarHeader-label': {
          fontWeight: 'bold',
        },
        '.MuiPickersDay-root': {
          borderRadius: '8px',
          transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(14, 165, 233, 0.1)', // Light Sky Blue hover
          },
          '&.Mui-selected': {
            backgroundColor: '#0ea5e9', // Sky Blue 500 for selected date
            color: '#ffffff',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#0284c7', // Darker Sky Blue on hover
            },
            '&:focus': {
              backgroundColor: '#0ea5e9',
            },
          },
          '&.MuiPickersDay-today': {
            border: '1px solid #0ea5e9',
          },
        },
      },
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormSection title="Destination">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8">
          <div className="space-y-6">
            <div className="relative">
              <TextField
                label="Destination"
                placeholder="Search for a city or hotel"
                value={destination}
                onChange={handleDestinationInputChange}
                onFocus={() => destination.length > 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                variant="outlined"
                inputRef={destinationInputRef}
                InputProps={{
                  style: destination ? { backgroundColor: '#e0f7fa' } : {},
                  endAdornment: (
                    <>
                      {loading && <CircularProgress size={20} />}
                      {destination && !loading && (
                        <IconButton onClick={handleClearDestination} edge="end" size="small">
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                    </>
                  ),
                }}
              />
              {showSuggestions && (cities.length > 0 || hotels.length > 0) && (
                <div className="absolute top-full left-0 z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-2">
                  {cities.length > 0 && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" className="p-2 font-bold">
                        Cities
                      </Typography>
                      {cities.map((city) => (
                        <MenuItem
                          key={city.id}
                          onClick={() => handleCitySelect(city)}
                          className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                        >
                          {city.name}, {city.countryName}
                        </MenuItem>
                      ))}
                    </>
                  )}
                  {hotels.length > 0 && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" className="p-2 font-bold">
                        Hotels
                      </Typography>
                      {hotels.map((hotel) => (
                        <MenuItem
                          key={hotel._id}
                          onClick={() => handleHotelSelect(hotel)}
                          className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                        >
                          {hotel.name}, {hotel.city.name}
                        </MenuItem>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <TextField
                label="Hotel"
                placeholder={hotelLoading ? 'Loading hotels...' : 'Search and select a hotel'}
                value={hotelInputValue}
                onChange={(e) => {
                  setHotelInputValue(e.target.value);
                  if (selectedHotelId) {
                    setSelectedHotelId('');
                  }
                }}
                onFocus={() => {
                  if (hotelsFromCitySearch.length > 0) {
                    setShowHotelSuggestions(true);
                  }
                }}
                onBlur={() => setTimeout(() => setShowHotelSuggestions(false), 200)}
                disabled={hotelLoading || hotelsFromCitySearch.length === 0}
                InputLabelProps={{ shrink: true }}
                fullWidth
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <>
                      {hotelLoading && <CircularProgress size={20} />}
                      {hotelInputValue && !hotelLoading && (
                        <IconButton
                          onClick={() => setSelectedHotelId('')}
                          edge="end"
                          size="small"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                    </>
                  ),
                }}
              />
              {showHotelSuggestions && filteredHotels.length > 0 && (
                <div className="absolute top-full left-0 z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-2">
                  {filteredHotels.map((hotel) => (
                    <MenuItem
                      key={hotel._id}
                      onClick={() => {
                        setSelectedHotelId(hotel._id);
                        setShowHotelSuggestions(false);
                      }}
                      className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                    >
                      {hotel.name}
                    </MenuItem>
                  ))}
                </div>
              )}
            </div>
            <DatePicker
              label="Check-in"
              format="DD/MM/YYYY"
              value={checkIn}
              onChange={(newValue) => {
                setCheckIn(newValue);
                if (newValue) {
                  // If new check-in is after current check-out, clear check-out
                  if (checkOut && newValue.isAfter(checkOut)) {
                    setCheckOut(null);
                  }
                  setIsCheckoutOpen(true); // Open check-out calendar
                }
              }}
              disablePast // Block past dates
              slotProps={{
                ...datePickerSlotProps, // Apply advanced styles
                textField: {
                  InputLabelProps: { shrink: true },
                  placeholder: 'DD/MM/YYYY',
                  variant: 'outlined',
                  fullWidth: true,
                },
              }}
            />
            <DatePicker
              label="Check-out"
              format="DD/MM/YYYY"
              value={checkOut}
              onChange={(newValue) => setCheckOut(newValue)}
              minDate={checkIn ? checkIn.add(1, 'day') : undefined}
              disabled={!checkIn} // Disable until check-in is selected
              open={isCheckoutOpen} // Control open state
              onOpen={() => setIsCheckoutOpen(true)}
              onClose={() => setIsCheckoutOpen(false)}
              slotProps={{
                ...datePickerSlotProps, // Apply advanced styles
                textField: {
                  InputLabelProps: { shrink: true },
                  placeholder: 'DD/MM/YYYY',
                  variant: 'outlined',
                  fullWidth: true,
                  disabled: !checkIn, // Also disable the text field visually
                },
              }}
            />
            <TextField
              label="Nights"
              placeholder="Number of nights"
              type="number"
              value={nights}
              InputLabelProps={{ shrink: true }}
              fullWidth
              variant="outlined"
              InputProps={{ readOnly: true, style: { backgroundColor: '#f0f0f0' } }}
            />
          </div>
          <HotelDetails hotel={selectedHotelDetails} />
        </div>
      </FormSection>
    </LocalizationProvider>
  );
};