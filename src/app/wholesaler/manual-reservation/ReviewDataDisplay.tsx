import React from 'react';
import { Typography, Paper, Grid, Chip, Divider } from '@mui/material';
import { Plane, Calendar, Tag, User, Users, DollarSign, ListChecks, Info } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import isoCountries from 'i18n-iso-countries';
import ReactCountryFlag from 'react-country-flag';

// Ensure locale is registered for country names
if (!isoCountries.getNames('en')) {
  isoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'));
}

// --- TYPES (Copied for file independence) ---
type TravellerType = 'adult' | 'child';

type Traveller = {
  id: number;
  type: TravellerType;
  title: string;
  firstName: string;
  lastName: string;
  birthday: string | null;
  nationality: string; // ISO country code
};

type Room = {
  id: number;
  roomInfo: string;
  roomName: string;
  board: string;
  roomType: string;
  price: string;
  travellers: Traveller[];
};

type Policy = {
  id: number;
  type: string;
  date: Dayjs | null;
  price: string;
};

interface ReviewDataDisplayProps {
  data: {
    agencyName: string;
    selectedHotelDetails: any;
    checkIn: Dayjs | null;
    checkOut: Dayjs | null;
    externalId: string;
    reservationStatus: string;
    supplierName: string;
    currency: string;
    supplierCode: string;
    backofficeRef: string;
    language: string;
    agentRef: string;
    supplierConfirmation: string;
    supplierPrice: string;
    markup: string;
    commission: string;
    totalPrice: string;
    rooms: Room[];
    cancellationPolicies: Policy[];
    addedRemarks: string[];
    comments: string;
  };
}

// Helper to display data in a clean key-value format
const DataField: React.FC<{ label: string; value: string | React.ReactNode; className?: string }> = ({ label, value, className = '' }) => (
  <div className={`flex flex-col p-3 border-r border-b border-gray-100 last:border-r-0 last:md:border-b-0 ${className}`}>
    <Typography variant="caption" className="block text-gray-500 font-medium uppercase tracking-wider mb-0.5">
      {label}
    </Typography>
    <div className="text-gray-900 font-semibold break-words">
      {value}
    </div>
  </div>
);

const getCountryName = (code: string) => isoCountries.getName(code, 'en') || code;

export const ReviewDataDisplay: React.FC<ReviewDataDisplayProps> = ({ data }) => {
  const {
    agencyName, selectedHotelDetails, checkIn, checkOut, externalId, reservationStatus,
    supplierName, currency, supplierCode, backofficeRef, language, agentRef,
    supplierConfirmation, supplierPrice, markup, commission, totalPrice, rooms,
    cancellationPolicies, addedRemarks, comments
  } = data;

  const totalGuests = rooms.reduce((acc, room) => acc + room.travellers.length, 0);

  // Fallback for hotel details display
  const hotelName = selectedHotelDetails?.name || data.destination || 'Hotel Name Not Selected';
  const hotelCity = selectedHotelDetails?.location?.city || 'N/A';
  const hotelCountryCode = selectedHotelDetails?.location?.countryCode || 'N/A';
  const hotelStars = selectedHotelDetails?.rating || 'N/A';

  return (
    <div className="space-y-8">
      
      {/* 1. Destination & Agency Summary - Primary Card */}
      <Paper elevation={4} className="p-6 rounded-xl border border-blue-100 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-y divide-gray-200 md:divide-y-0 md:divide-x">
          
          {/* Agency */}
          <div className="flex flex-col space-y-2 p-3">
            <Typography variant="subtitle2" className="flex items-center text-blue-600 font-bold mb-1">
              <Tag size={18} className="mr-2" />
              Agency
            </Typography>
            <Typography variant="h6" className="font-extrabold text-gray-900">{agencyName || 'N/A'}</Typography>
          </div>
          
          {/* Hotel */}
          <div className="flex flex-col space-y-2 p-3">
            <Typography variant="subtitle2" className="flex items-center text-blue-600 font-bold mb-1">
              <Plane size={18} className="mr-2" />
              Destination
            </Typography>
            <div className="font-bold text-gray-900">
              {hotelName} 
              <Chip label={`${hotelStars}★`} size="small" className="ml-2 bg-yellow-100 text-yellow-800 font-semibold" />
            </div>
            <Typography variant="body2" className="text-gray-600">
              {hotelCity}, {getCountryName(hotelCountryCode)}
            </Typography>
          </div>
          
          {/* Dates */}
          <div className="flex flex-col space-y-2 p-3">
            <Typography variant="subtitle2" className="flex items-center text-blue-600 font-bold mb-1">
              <Calendar size={18} className="mr-2" />
              Travel Dates
            </Typography>
            <div className="flex flex-wrap gap-2">
              <Chip label={`Check-in: ${checkIn ? dayjs(checkIn).format('DD MMM YYYY') : 'N/A'}`} size="medium" className="bg-green-100 text-green-800 font-semibold" />
              <Chip label={`Check-out: ${checkOut ? dayjs(checkOut).format('DD MMM YYYY') : 'N/A'}`} size="medium" className="bg-red-100 text-red-800 font-semibold" />
            </div>
          </div>
        </div>
      </Paper>

      {/* 2. Room and Traveller Details - Dynamic Accordion-style cards */}
      <div className="space-y-6">
        <Typography variant="h5" className="font-bold text-indigo-700 mt-6 mb-2 flex items-center">
          <Users size={24} className="mr-3" /> Rooms & Guests ({totalGuests} Travellers)
        </Typography>
        
        {rooms.map((room, roomIndex) => (
          <Paper key={room.id} elevation={2} className="p-5 rounded-lg border border-indigo-200 bg-indigo-50">
            <Typography variant="h6" className="font-extrabold text-indigo-800 mb-4 border-b border-indigo-200 pb-2">
              Room {roomIndex + 1}: {room.roomName || `Untitled Room ${roomIndex + 1}`}
            </Typography>

            <Grid container spacing={0} className="mb-4 bg-white rounded-md shadow-sm border border-gray-100 divide-x divide-gray-100">
              <DataField label="Board" value={room.board || 'N/A'} className="sm:w-1/3 w-full" />
              <DataField label="Room Type" value={room.roomType || 'N/A'} className="sm:w-1/3 w-full" />
              <DataField label="Room Price" value={<span className="text-lg text-green-700 font-extrabold">{room.price} {currency || 'N/A'}</span>} className="sm:w-1/3 w-full !border-r-0" />
            </Grid>

            <Typography variant="subtitle1" className="font-bold text-gray-700 mt-4 mb-2">Travellers:</Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {room.travellers.map((traveller, tIndex) => (
                <div key={traveller.id} className="p-3 bg-white rounded-md shadow-md border-l-4 border-blue-400">
                  <div className="flex items-center mb-1">
                    <User size={16} className="text-gray-500 mr-2" />
                    <span className="font-semibold">{traveller.title}. {traveller.firstName} {traveller.lastName}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <Chip label={traveller.type === 'adult' ? 'Adult' : 'Child'} size="small" className={`font-medium ${traveller.type === 'adult' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`} />
                    {traveller.nationality && (
                      <span className="flex items-center">
                        <ReactCountryFlag countryCode={traveller.nationality} svg style={{ width: '1.2em', height: '1.2em' }} className="mr-1 shadow" />
                        {getCountryName(traveller.nationality)}
                      </span>
                    )}
                    {traveller.birthday && <span className="text-xs">| DOB: {dayjs(traveller.birthday).format('DD/MM/YYYY')}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Paper>
        ))}
      </div>

      {/* 3. Price, Policy, and External Details - Two-Column Layout */}
      <Grid container spacing={4}>
        {/* Left Column: Pricing & Policy */}
        <Grid item xs={12} lg={6}>
          <div className="space-y-6">
            {/* Price Information */}
            <Paper elevation={2} className="p-5 rounded-xl border border-green-200 bg-white">
              <Typography variant="h6" className="font-bold text-green-700 mb-4 flex items-center">
                <DollarSign size={24} className="mr-3" /> Price & Financials
              </Typography>
              <Grid container spacing={0} className="border border-y border-gray-100 rounded-md">
                <DataField label="Supplier Price" value={`${supplierPrice} ${currency}`} className="w-1/2" />
                <DataField label="Markup (%)" value={`${markup}%`} className="w-1/2 !border-r-0" />
                <DataField label="Commission" value={commission || '0'} className="w-1/2 !border-b-0" />
                <div className="w-1/2 flex flex-col justify-center items-center p-3 text-center bg-green-50">
                  <Typography variant="body2" className="text-green-600 font-medium uppercase tracking-wider">Total Price</Typography>
                  <Typography variant="h5" className="font-extrabold text-green-800">{totalPrice} {currency || 'N/A'}</Typography>
                </div>
              </Grid>
            </Paper>

            {/* Cancellation Policy */}
            <Paper elevation={2} className="p-5 rounded-xl border border-red-200 bg-white">
              <Typography variant="h6" className="font-bold text-red-700 mb-4 flex items-center">
                <Calendar size={24} className="mr-3" /> Cancellation Policy
              </Typography>
              <div className="space-y-3">
                {cancellationPolicies.length > 0 ? (
                  cancellationPolicies.map((p, index) => (
                    <div key={index} className="flex justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <Typography variant="body2" className="font-medium flex items-center">
                        <Info size={16} className="text-red-500 mr-2" />
                        Cancel by: <span className="font-bold ml-1">{p.date ? dayjs(p.date).format('DD MMM YYYY') : 'N/A'}</span>
                      </Typography>
                      <Typography variant="body2" className="font-bold text-red-700">
                        Charge: {p.price} {currency}
                      </Typography>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-gray-500 flex items-center">
                    <Info size={16} className="text-red-500 mr-2" />
                    No cancellation policies added.
                  </div>
                )}
              </div>
            </Paper>
          </div>
        </Grid>

        {/* Right Column: External & Remarks */}
        <Grid item xs={12} lg={6}>
          <div className="space-y-6">
            {/* External Details */}
            <Paper elevation={2} className="p-5 rounded-xl border border-orange-200 bg-white h-full">
              <Typography variant="h6" className="font-bold text-orange-700 mb-4 flex items-center">
                <Plane size={24} className="mr-3" /> External System Details
              </Typography>
              <Grid container spacing={0} className="border border-y border-gray-100 rounded-md">
                <DataField label="External ID" value={externalId || 'N/A'} className="w-1/2" />
                <DataField label="Status" value={<Chip label={reservationStatus || 'N/A'} size="small" color="secondary" className="font-semibold" /> as any} className="w-1/2 !border-r-0" />
                <DataField label="Supplier Name" value={supplierName || 'N/A'} className="w-1/2" />
                <DataField label="Supplier Code" value={supplierCode || 'N/A'} className="w-1/2 !border-r-0" />
                <DataField label="Agent Reference" value={agentRef || 'N/A'} className="w-1/2 !border-b-0" />
                <DataField label="Confirmation #" value={supplierConfirmation || 'N/A'} className="w-1/2 !border-r-0 !border-b-0" />
              </Grid>
            </Paper>

            {/* Backoffice Remarks */}
            <Paper elevation={2} className="p-5 rounded-xl border border-teal-200 bg-white">
              <Typography variant="h6" className="font-bold text-teal-700 mb-4 flex items-center">
                <ListChecks size={24} className="mr-3" /> Backoffice Remarks
              </Typography>
              <div className="space-y-4">
                {comments && (
                  <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                    <Typography variant="body2" className="font-semibold text-gray-700 mb-1">General Comments:</Typography>
                    <Typography variant="body2" className="text-gray-800 whitespace-pre-wrap">{comments}</Typography>
                  </div>
                )}
                {addedRemarks.length > 0 && (
                  <div>
                    <Typography variant="body2" className="font-semibold text-gray-700 mb-1">Tags/Remarks:</Typography>
                    <div className="flex flex-wrap gap-2">
                      {addedRemarks.map((remark, index) => (
                        <Chip key={index} label={remark} size="small" className="bg-teal-100 text-teal-800 font-medium" />
                      ))}
                    </div>
                  </div>
                )}
                {!comments && addedRemarks.length === 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-500">
                    No backoffice remarks or comments added for this booking.
                  </div>
                )}
              </div>
            </Paper>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};