// path: ./manual-reservation/Destination.tsx

import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField, MenuItem, CircularProgress, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { debounce } from 'lodash';
import axios from 'axios';

// API Configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// Types
type City = {
  id: string;
  name: string;
  countryId: string;
  countryName: string;
};

type Hotel = {
  _id: string;
  name: string;
  city: {
    name: string;
  };
};

type SearchResult = {
  cities: City[];
  hotels: Hotel[];
};

// API call to search destinations
const hotelDestinationQuery = async (searchTerm: string): Promise<SearchResult> => {
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

// Section wrapper and form components
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

type MuiSelectSimpleProps = {
  label: string;
  placeholder: string;
  options: Array<{ code: string; name: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

const FormSelectSimple: React.FC<MuiSelectSimpleProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  className = '',
}) => (
  <TextField
    label={label}
    select
    value={value}
    onChange={onChange}
    SelectProps={{
      displayEmpty: true,
      renderValue: (selected: unknown) => {
        if (!selected) return <span className="text-gray-400">{placeholder}</span>;
        const selectedOption = options.find(opt => opt.code === selected);
        return selectedOption ? selectedOption.name : (selected as string);
      },
    }}
    InputLabelProps={{ shrink: true }}
    inputProps={{ 'aria-label': placeholder }}
    fullWidth
    variant="outlined"
    className={className}
  >
    <MenuItem value="" disabled>
      {placeholder}
    </MenuItem>
    {options.map(option => (
      <MenuItem key={option.code} value={option.code}>
        {option.name}
      </MenuItem>
    ))}
  </TextField>
);

type MuiInputProps = {
  label: string;
  placeholder: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

const FormInput: React.FC<MuiInputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  className = '',
}) => (
  <TextField
    label={label}
    placeholder={placeholder}
    type={type}
    value={value}
    onChange={onChange}
    InputLabelProps={{ shrink: true }}
    inputProps={{ placeholder }}
    fullWidth
    variant="outlined"
    className={className}
  />
);

// New Destination component
export const Destination = () => {
  const [destination, setDestination] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [checkIn, setCheckIn] = useState<Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null);
  const [nights, setNights] = useState<number | ''>('');
  const [cities, setCities] = useState<City[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hardcoded hotel list
  const hotelOptions = [
    { code: 'hotelA', name: 'Hotel A' },
    { code: 'hotelB', name: 'Hotel B' },
    { code: 'hotelC', name: 'Hotel C' },
  ];

  // State for the new hotel field
  const [selectedHardcodedHotel, setSelectedHardcodedHotel] = useState('');

  // Debounced API call for destination search
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

  // Effect to auto-calculate nights
  useEffect(() => {
    if (checkIn && checkOut) {
      const diff = checkOut.diff(checkIn, 'day');
      if (diff >= 0) {
        setNights(diff);
      } else {
        setNights(''); // Reset if check-out is before check-in
      }
    } else {
      setNights(''); // Reset if either date is cleared
    }
  }, [checkIn, checkOut]);

  // Handle destination input changes
  const handleDestinationInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDestination(value);
    debouncedSearch(value);
  };

  // Handle clearing the destination field
  const handleClearDestination = () => {
    setDestination('');
    setSelectedHotel(null);
    setCities([]);
    setHotels([]);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle a city selection
  const handleCitySelect = (city: City) => {
    setDestination(`${city.name}, ${city.countryName}`);
    setSelectedHotel(null);
    setShowSuggestions(false);
  };

  // Handle a hotel selection
  const handleHotelSelect = (hotel: Hotel) => {
    setDestination(`${hotel.name}, ${hotel.city.name}`);
    setSelectedHotel(hotel);
    setShowSuggestions(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormSection title="Destination">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          <div className="space-y-6">
            <div className="relative"> {/* Use a relative container for the tooltip */}
              <TextField
                label="Destination"
                placeholder="Search for destination"
                value={destination}
                onChange={handleDestinationInputChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                variant="outlined"
                inputRef={inputRef}
                InputProps={{
                  style: destination ? { backgroundColor: '#e0f7fa' } : {},
                  endAdornment: destination && (
                    <IconButton onClick={handleClearDestination} edge="end" size="small">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
              {/* The dropdown tooltip is now positioned absolutely within the relative container */}
              {loading && <CircularProgress size={24} />}
              {!loading && showSuggestions && (cities.length > 0 || hotels.length > 0) && (
                <div className="absolute top-full left-0 z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-2">
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

            {/* New Hotels dropdown field */}
            <FormSelectSimple
              label="Hotels"
              placeholder="Select a hotel"
              options={hotelOptions}
              value={selectedHardcodedHotel}
              onChange={(e) => setSelectedHardcodedHotel(e.target.value)}
            />

            <DatePicker
              label=""
              format="DD/MM/YYYY"
              value={checkIn}
              onChange={(newValue) => setCheckIn(newValue)}
              slotProps={{
                textField: {
                  InputLabelProps: { shrink: true },
                  placeholder: 'DD/MM/YYYY',
                  variant: 'outlined',
                  fullWidth: true,
                },
              }}
            />
            <DatePicker
              label=""
              format="DD/MM/YYYY"
              value={checkOut}
              onChange={(newValue) => setCheckOut(newValue)}
              slotProps={{
                textField: {
                  InputLabelProps: { shrink: true },
                  placeholder: 'DD/MM/YYYY',
                  variant: 'outlined',
                  fullWidth: true,
                },
              }}
            />
            <FormInput
              label="Nights"
              placeholder="Enter number of nights"
              type="number"
              value={nights}
              onChange={e => setNights(e.target.value ? Number(e.target.value) : '')}
              InputProps={{ readOnly: true }}
            />
          </div>
          <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center text-center text-gray-500 min-h-[250px] space-y-4">
            <p>Please select a hotel to see details</p>
          </div>
        </div>
      </FormSection>
    </LocalizationProvider>
  );
};