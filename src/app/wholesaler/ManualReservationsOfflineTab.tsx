import React, { useState, useEffect, ReactNode } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Plus, Trash2 } from 'lucide-react';
import {
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// External Libraries
import { Country } from 'country-state-city';
import currencyCodes from 'currency-codes';
import ReactCountryFlag from 'react-country-flag';
import isoCountries from 'i18n-iso-countries';

// Import the newly created component
import Agency from './manual-reservation/Agency';

import { CancellationPolicy } from './manual-reservation/CancellationPolicy';
import BackofficeRemarks from './manual-reservation/BackofficeRemarks';
import { Destination } from './manual-reservation/Destination2';
import { Travellers } from './manual-reservation/Travellers';
import { ExternalDetails } from './manual-reservation/ExternalDetails';

// Register English (you can add more locales if needed)
isoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'));

// Types
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

// Section wrapper
type SectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

// EXPORTED for use in other components
export const FormSection: React.FC<SectionProps> = ({ title, children, className = '' }) => (
  <div className={`bg-white shadow-md rounded-xl p-6 md:p-8 ${className}`}>
    <h2 className="text-xl font-semibold mb-6 text-gray-800">{title}</h2>
    <div className="space-y-6">{children}</div>
  </div>
);

// Generic Input
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

// EXPORTED for use in other components
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

// Select with flag (only for countries)
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

// Simple Select (for currency, language — no flags)
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

// Main Component
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
          id: initialRoomId + 1, // Ensure unique ID for the initial traveller
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

  // Form fields
  const [selectedAgencyId, setSelectedAgencyId] = useState(''); // New state for selected agency ID
  const [agencyName, setAgencyName] = useState(''); // New state for the agency name
  const [externalId, setExternalId] = useState('');
  const [reservationStatus, setReservationStatus] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [currency, setCurrency] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [backofficeRef, setBackofficeRef] = useState('');
  const [language, setLanguage] = useState('');
  const [agentRef, setAgentRef] = useState('');
  const [supplierConfirmation, setSupplierConfirmation] = useState('');
  const [supplierPrice, setSupplierPrice] = useState('');
  const [markup, setMarkup] = useState('');
  const [commission, setCommission] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [comments, setComments] = useState('');

  // Options
  const [currencies, setCurrencies] = useState<Array<{ code: string; name: string }>>([]);
  const [languages, setLanguages] = useState<Array<{ code: string; name: string }>>([]);

  // Static options
  const policyOptions = ['Standard Policy', 'Flexible', 'Strict'];
  const remarksOptions = ['Promotion', 'VIP Guest', 'Special Request'];

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

  // Traveller handlers
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

  // Room handlers
  const handleAddRoom = () => {
    const newRoom: Room = {
      id: nextRoomId,
      roomInfo: '',
      roomName: '',
      board: '',
      roomType: '',
      price: '',
      travellers: [ // Add a default adult traveller
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
            {/* 1. Select Agency & Destination */}
            <div className="space-y-8">
              {/* Use the new component here */}
              <Agency
                selectedAgencyId={selectedAgencyId}
                setSelectedAgencyId={setSelectedAgencyId}
                agencyName={agencyName}
                setAgencyName={setAgencyName}
              />

              {/* Destination Section - Now a separate component */}
              <Destination />
            </div>

            {/* External Details Section - Now a separate component */}
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

            {/* 3. Travellers & Rooms */}
            <Travellers
              rooms={rooms}
              handleAddRoom={handleAddRoom}
              handleRemoveRoom={handleRemoveRoom}
              handleRoomChange={handleRoomChange}
              handleAddTraveller={handleAddTraveller}
              handleRemoveTraveller={handleRemoveTraveller}
              handleTravellerChange={handleTravellerChange}
            />

            {/* 4. Price Information */}
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

            {/* 5. Cancellation Policy (as a separate component) */}
            <CancellationPolicy policyOptions={policyOptions.map(p => ({ code: p, name: p }))} />

            {/* 6. Backoffice Remarks (as a separate component) */}
            <BackofficeRemarks
              comments={comments}
              setComments={setComments}
              remarksOptions={remarksOptions.map(r => ({ code: r, name: r }))}
            />

            {/* Footer Actions */}
            <div className="flex justify-end items-center space-x-4 pt-4">
              <Button variant="outlined" size="large">
                Reset
              </Button>
              <Button variant="contained" size="large" color="primary">
                Create Reservation
              </Button>
            </div>
          </main>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default ManualReservation;