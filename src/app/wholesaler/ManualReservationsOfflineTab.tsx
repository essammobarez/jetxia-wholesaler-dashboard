import React, { useState, useEffect, ReactNode } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Plus, Trash2 } from 'lucide-react';
import { TextField, MenuItem, Button } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// External Libraries & Dayjs for date handling
import { Country } from 'country-state-city';
import currencyCodes from 'currency-codes';
import ReactCountryFlag from 'react-country-flag';
import isoCountries from 'i18n-iso-countries';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

// Import components
import Agency from './manual-reservation/Agency-offline';
import { CancellationPolicy } from './manual-reservation/CancellationPolicy-offline';
import BackofficeRemarks from './manual-reservation/BackofficeRemarks';
import { Destination } from './manual-reservation/Destination-offline';
import { Travellers } from './manual-reservation/Travellers-offline';
import { ExternalDetails } from './manual-reservation/ExternalDetails-offline';

// Register English locale
isoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'));

// --- TYPES ---
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

// --- SHARED COMPONENTS ---
type SectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export const FormSection: React.FC<SectionProps> = ({ title, children, className = '' }) => (
  <div className={`bg-white shadow-md rounded-xl p-6 md:p-8 ${className}`}>
    <h2 className="text-xl font-semibold mb-6 text-gray-800">{title}</h2>
    <div className="space-y-6">{children}</div>
  </div>
);

type MuiInputProps = {
  label: string;
  placeholder: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  multiline?: boolean;
  rows?: number;
};

export const FormInput: React.FC<MuiInputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  className = '',
  multiline = false,
  rows,
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
    multiline={multiline}
    rows={rows}
    className={className}
  />
);

type MuiSelectWithFlagProps = {
  label: string;
  placeholder: string;
  options: Array<{ code: string; name: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export const FormSelectWithFlag: React.FC<MuiSelectWithFlagProps> = ({
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
        if (!selectedOption) return selected as string;
        return (
          <div className="flex items-center gap-2">
            <ReactCountryFlag
              countryCode={selectedOption.code}
              svg
              style={{ width: '1.2em', height: '1.2em' }}
              title={selectedOption.name}
            />
            <span>{selectedOption.name}</span>
          </div>
        );
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
        <div className="flex items-center gap-2">
          <ReactCountryFlag
            countryCode={option.code}
            svg
            style={{ width: '1.5em', height: '1.5em', marginRight: 8 }}
            title={option.name}
          />
          {option.name}
        </div>
      </MenuItem>
    ))}
  </TextField>
);

type MuiSelectSimpleProps = {
  label: string;
  placeholder: string;
  options: Array<{ code: string; name: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export const FormSelectSimple: React.FC<MuiSelectSimpleProps> = ({
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

// --- MAIN COMPONENT ---
const ManualReservation: NextPage = () => {
  const initialRoomId = Date.now();

  const [rooms, setRooms] = useState<Room[]>([
    {
      id: initialRoomId,
      roomInfo: '',
      roomName: '',
      board: '',
      roomType: '',
      price: '',
      travellers: [
        {
          id: initialRoomId + 1,
          type: 'adult',
          title: '',
          firstName: '',
          lastName: '',
          birthday: null,
          nationality: '',
        },
      ],
    },
  ]);
  const [nextRoomId, setNextRoomId] = useState<number>(initialRoomId + 1);

  // --- FORM STATE ---
  // 1. Agency State
  const [selectedAgencyId, setSelectedAgencyId] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [agencyData, setAgencyData] = useState<{ walletBalance: number; markup: number }>({ walletBalance: 0, markup: 0 });

  // 2. Destination State (Lifted)
  const [destination, setDestination] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [selectedHotelDetails, setSelectedHotelDetails] = useState<any | null>(null);
  const [checkIn, setCheckIn] = useState<Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null);

  // 3. External Details State
  const [externalId, setExternalId] = useState('');
  const [reservationStatus, setReservationStatus] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [currency, setCurrency] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [backofficeRef, setBackofficeRef] = useState('');
  const [language, setLanguage] = useState('');
  const [agentRef, setAgentRef] = useState('');
  const [supplierConfirmation, setSupplierConfirmation] = useState('');

  // 4. Price Information State
  const [supplierPrice, setSupplierPrice] = useState('');
  const [markup, setMarkup] = useState('');
  const [commission, setCommission] = useState('');
  const [totalPrice, setTotalPrice] = useState('');

  // 5. Cancellation Policy State (Lifted)
  const [cancellationPolicies, setCancellationPolicies] = useState<Policy[]>([]);

  // 6. Backoffice Remarks State (Lifted)
  const [addedRemarks, setAddedRemarks] = useState<string[]>([]);
  const [comments, setComments] = useState('');

  // Dropdown options
  const [currencies, setCurrencies] = useState<Array<{ code: string; name: string }>>([]);
  const [languages, setLanguages] = useState<Array<{ code: string; name: string }>>([]);
  const policyOptions = ['Standard Policy', 'Flexible', 'Strict'];

  // API Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // --- EFFECTS ---
  useEffect(() => {
    const currencyList = currencyCodes.data.map(curr => ({
      code: curr.code,
      name: `${curr.code} - ${curr.currency}`,
    }));
    setCurrencies(currencyList);

    const langs = Object.entries(isoCountries.getNames('en', { select: 'official' }))
      .map(([code, name]) => ({
        code,
        name: name as string,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    setLanguages(langs);
  }, []);

  // --- HANDLERS ---
  const handleAddTraveller = (roomId: number, type: TravellerType) => {
    setRooms(prevRooms =>
      prevRooms.map(room => {
        if (room.id === roomId) {
          const newTraveller: Traveller = {
            id: Date.now(),
            type,
            title: '',
            firstName: '',
            lastName: '',
            birthday: null,
            nationality: '',
          };
          return {
            ...room,
            travellers: [...(room.travellers || []), newTraveller],
          };
        }
        return room;
      })
    );
  };

  const handleRemoveTraveller = (roomId: number, travellerId: number) => {
    setRooms(prevRooms =>
      prevRooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            travellers: room.travellers.filter(t => t.id !== travellerId),
          };
        }
        return room;
      })
    );
  };

  const handleTravellerChange = (roomId: number, travellerId: number, field: keyof Traveller, value: any) => {
    setRooms(prevRooms =>
      prevRooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            travellers: room.travellers.map(t =>
              t.id === travellerId ? { ...t, [field]: value } : t
            ),
          };
        }
        return room;
      })
    );
  };

  const handleAddRoom = () => {
    const newRoom: Room = {
      id: nextRoomId,
      roomInfo: '',
      roomName: '',
      board: '',
      roomType: '',
      price: '',
      travellers: [
        {
          id: Date.now(),
          type: 'adult',
          title: '',
          firstName: '',
          lastName: '',
          birthday: null,
          nationality: '',
        },
      ],
    };
    setRooms(prev => [...prev, newRoom]);
    setNextRoomId(prev => prev + 1);
  };

  const handleRemoveRoom = (id: number) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  const handleRoomChange = (id: number, field: keyof Omit<Room, 'travellers'>, value: string) => {
    setRooms(prev =>
      prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleCreateReservation = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // **CHANGE HERE**: Remove image properties from hotel details before sending
    const { mainImageUrl, mainImages, ...hotelDetailsWithoutImages } = selectedHotelDetails || {};
    const hotelDetailsForPayload = selectedHotelDetails ? hotelDetailsWithoutImages : null;

    const payload = {
      agencyId: selectedAgencyId,
      destination: {
        name: destination,
        hotelId: selectedHotelId,
        hotelDetails: hotelDetailsForPayload, // Use the sanitized object
        checkIn: checkIn ? checkIn.format('YYYY-MM-DD') : null,
        checkOut: checkOut ? checkOut.format('YYYY-MM-DD') : null,
      },
      externalDetails: {
        externalId,
        reservationStatus,
        supplierName,
        currency,
        supplierCode,
        backofficeRef,
        language,
        agentRef,
        supplierConfirmation,
      },
      rooms: rooms.map(room => ({
        roomInfo: room.roomInfo,
        roomName: room.roomName,
        board: room.board,
        roomType: room.roomType,
        price: parseFloat(room.price) || 0,
        travellers: room.travellers.map(t => ({
          type: t.type,
          title: t.title,
          firstName: t.firstName,
          lastName: t.lastName,
          birthday: t.birthday ? dayjs(t.birthday).format('YYYY-MM-DD') : null,
          nationality: t.nationality,
        })),
      })),
      priceInfo: {
        supplierPrice: parseFloat(supplierPrice) || 0,
        markup: parseFloat(markup) || 0,
        commission: parseFloat(commission) || 0,
        totalPrice: parseFloat(totalPrice) || 0,
      },
      cancellationPolicies: cancellationPolicies.map(p => ({
        type: p.type,
        date: p.date ? p.date.format('YYYY-MM-DD') : null,
        price: parseFloat(p.price.replace('$', '')) || 0,
      })),
      remarks: {
        selectedRemarks: addedRemarks,
        comments: comments,
      },
    };

    try {
        const axiosInstance = axios.create({
            baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
        });
      const response = await axiosInstance.post('/offline-booking', payload);
      console.log('Reservation created successfully:', response.data);
      alert('Reservation created successfully!');
      // Optionally reset form or redirect here
    } catch (error) {
      console.error('Failed to create reservation:', error);
      const errorMessage = (error as any).response?.data?.message || 'An unexpected error occurred.';
      setSubmitError(`Failed to create reservation: ${errorMessage}`);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Head>
        <title>Manual Reservation</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Manual Reservation
          </h1>

          <main className="space-y-8">
            <div className="space-y-8">
              <Agency
                selectedAgencyId={selectedAgencyId}
                setSelectedAgencyId={setSelectedAgencyId}
                agencyName={agencyName}
                setAgencyName={setAgencyName}
                onAgencyDataSelect={setAgencyData}
              />
              <Destination
                destination={destination}
                setDestination={setDestination}
                selectedHotelId={selectedHotelId}
                setSelectedHotelId={setSelectedHotelId}
                selectedHotelDetails={selectedHotelDetails}
                setSelectedHotelDetails={setSelectedHotelDetails}
                checkIn={checkIn}
                setCheckIn={setCheckIn}
                checkOut={checkOut}
                setCheckOut={setCheckOut}
              />
            </div>

            <ExternalDetails
              externalId={externalId}
              setExternalId={setExternalId}
              reservationStatus={reservationStatus}
              setReservationStatus={setReservationStatus}
              supplierName={supplierName}
              setSupplierName={setSupplierName}
              currency={currency}
              setCurrency={setCurrency}
              supplierCode={supplierCode}
              setSupplierCode={setSupplierCode}
              backofficeRef={backofficeRef}
              setBackofficeRef={setBackofficeRef}
              language={language}
              setLanguage={setLanguage}
              agentRef={agentRef}
              setAgentRef={setAgentRef}
              supplierConfirmation={supplierConfirmation}
              setSupplierConfirmation={setSupplierConfirmation}
              currencies={currencies}
              languages={languages}
            />

            <Travellers
              rooms={rooms}
              handleAddRoom={handleAddRoom}
              handleRemoveRoom={handleRemoveRoom}
              handleRoomChange={handleRoomChange}
              handleAddTraveller={handleAddTraveller}
              handleRemoveTraveller={handleRemoveTraveller}
              handleTravellerChange={handleTravellerChange}
            />

            <FormSection title="Price Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <FormInput
                  label="Supplier Price"
                  placeholder="Enter supplier price"
                  value={supplierPrice}
                  onChange={e => setSupplierPrice(e.target.value)}
                  className="md:col-span-2"
                />
                <FormInput
                  label="Markup"
                  placeholder="Enter markup"
                  value={markup}
                  onChange={e => setMarkup(e.target.value)}
                  className="md:col-span-2"
                />
                <FormInput
                  label="Commission"
                  placeholder="Enter commission"
                  value={commission}
                  onChange={e => setCommission(e.target.value)}
                  className="md:col-span-2"
                />
                <FormInput
                  label="Total Price"
                  placeholder="Enter total price"
                  value={totalPrice}
                  onChange={e => setTotalPrice(e.target.value)}
                  className="md:col-span-2"
                />
              </div>
            </FormSection>

            <CancellationPolicy
              policyOptions={policyOptions.map(p => ({ code: p, name: p }))}
              policies={cancellationPolicies}
              setPolicies={setCancellationPolicies}
            />

            <BackofficeRemarks
              comments={comments}
              setComments={setComments}
              addedRemarks={addedRemarks}
              setAddedRemarks={setAddedRemarks}
            />

            <div className="flex justify-end items-center space-x-4 pt-4">
              <Button variant="outlined" size="large">
                Reset
              </Button>
              <Button
                variant="contained"
                size="large"
                color="primary"
                onClick={handleCreateReservation}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Reservation'}
              </Button>
            </div>
            {submitError && <p className="text-red-500 text-right mt-2">{submitError}</p>}
          </main>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default ManualReservation;