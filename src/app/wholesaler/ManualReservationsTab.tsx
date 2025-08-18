// pages/manual-reservation.tsx

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
};

// Section wrapper
type SectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

const FormSection: React.FC<SectionProps> = ({ title, children, className = '' }) => (
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

const FormInput: React.FC<MuiInputProps> = ({
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

const FormSelectWithFlag: React.FC<MuiSelectWithFlagProps> = ({
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

// Main Component
const ManualReservation: NextPage = () => {
  const [travellers, setTravellers] = useState<Traveller[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [nextRoomId, setNextRoomId] = useState<number>(1);

  // Form fields
  const [reseller, setReseller] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [agent, setAgent] = useState('');
  const [externalId, setExternalId] = useState('');
  const [reservationStatus, setReservationStatus] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [currency, setCurrency] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [backofficeRef, setBackofficeRef] = useState('');
  const [language, setLanguage] = useState('');
  const [agentRef, setAgentRef] = useState('');
  const [supplierConfirmation, setSupplierConfirmation] = useState('');
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [nights, setNights] = useState<number | ''>('');
  const [destination, setDestination] = useState('');
  const [hotel, setHotel] = useState('');
  const [supplierPrice, setSupplierPrice] = useState('');
  const [markup, setMarkup] = useState('');
  const [commission, setCommission] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [rateName, setRateName] = useState('');
  const [rateDescription, setRateDescription] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [backofficeRemark, setBackofficeRemark] = useState('');
  const [comments, setComments] = useState('');

  // Options
  const [countries, setCountries] = useState<Array<{ code: string; name: string }>>([]);
  const [currencies, setCurrencies] = useState<Array<{ code: string; name: string }>>([]);
  const [languages, setLanguages] = useState<Array<{ code: string; name: string }>>([]);
  const [destinations, setDestinations] = useState<Array<{ code: string; name: string }>>([]);
  const [hotels, setHotels] = useState<Array<{ code: string; name: string }>>([]);

  // Static options
  const titles = ['Mr.', 'Mrs.', 'Ms.'];
  const roomInfoOptions = ['Room 1', 'Room 2'];
  const roomNameOptions = ['Deluxe', 'Suite', 'Standard'];
  const policyOptions = ['Standard Policy', 'Flexible', 'Strict'];
  const remarksOptions = ['Promotion', 'VIP Guest', 'Special Request'];

  useEffect(() => {
    // Load countries (with flag support)
    const countryList = Country.getAllCountries().map(c => ({
      code: c.isoCode,
      name: c.name,
    }));
    setCountries(countryList);

    // Load currencies (no flag)
    const currencyList = currencyCodes.data.map(curr => ({
      code: curr.code,
      name: `${curr.code} - ${curr.currency}`,
    }));
    setCurrencies(currencyList);

    // Load languages using i18n-iso-countries
    // The getLanguages() function is deprecated. Use getNames() instead.
    const langs = Object.entries(isoCountries.getNames('en', { select: 'official' }))
      .map(([code, name]) => ({
        code,
        name: name as string,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
    setLanguages(langs);

    // Mock destinations & hotels
    setDestinations([
      { code: 'FR', name: 'Paris' },
      { code: 'GB', name: 'London' },
      { code: 'JP', name: 'Tokyo' },
      { code: 'US', name: 'New York' },
      { code: 'AE', name: 'Dubai' },
    ]);

    setHotels([
      { code: 'A', name: 'Hotel A' },
      { code: 'B', name: 'Hotel B' },
      { code: 'C', name: 'Hotel C' },
    ]);
  }, []);

  // Traveller handlers
  const handleAddAdult = () => {
    const newTraveller: Traveller = {
      id: nextId,
      type: 'adult',
      title: '',
      firstName: '',
      lastName: '',
      birthday: null,
      nationality: '',
    };
    setTravellers(prev => [...prev, newTraveller]);
    setNextId(prev => prev + 1);
  };

  const handleAddChild = () => {
    const newTraveller: Traveller = {
      id: nextId,
      type: 'child',
      title: '',
      firstName: '',
      lastName: '',
      birthday: null,
      nationality: '',
    };
    setTravellers(prev => [...prev, newTraveller]);
    setNextId(prev => prev + 1);
  };

  const handleRemoveTraveller = (id: number) => {
    setTravellers(prev => prev.filter(t => t.id !== id));
  };

  const handleTravellerChange = (id: number, field: keyof Traveller, value: any) => {
    setTravellers(prev =>
      prev.map(t => (t.id === id ? { ...t, [field]: value } : t))
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
    };
    setRooms(prev => [...prev, newRoom]);
    setNextRoomId(prev => prev + 1);
  };

  const handleRemoveRoom = (id: number) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  const handleRoomChange = (id: number, field: keyof Room, value: string) => {
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
            {/* 1. Reseller & Agent + Destination */}
            <div className="space-y-8">
              <FormSection title="Reseller & Agent">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                  <FormInput
                    label="Reseller"
                    placeholder="Enter reseller name"
                    value={reseller}
                    onChange={e => setReseller(e.target.value)}
                  />
                  <FormInput
                    label="Supervisor"
                    placeholder="Enter supervisor name"
                    value={supervisor}
                    onChange={e => setSupervisor(e.target.value)}
                  />
                  <FormInput
                    label="Agent"
                    placeholder="Enter agent name"
                    value={agent}
                    onChange={e => setAgent(e.target.value)}
                  />
                </div>
              </FormSection>

              <FormSection title="Destination">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                  <FormSelectSimple
                    label="Destination"
                    placeholder="Select destination"
                    options={destinations}
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                  />
                  <FormSelectSimple
                    label="Hotel"
                    placeholder="Select hotel"
                    options={hotels}
                    value={hotel}
                    onChange={e => setHotel(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 items-end">
                  <DatePicker
                    label="Check In"
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
                    label="Check Out"
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
                  />
                </div>
              </FormSection>
            </div>

            {/* 2. External Details */}
            <FormSection title="External Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <FormSelectSimple
                  label="External ID"
                  placeholder="Select external ID"
                  options={[{ code: 'EXT1', name: 'External ID 1' }]}
                  value={externalId}
                  onChange={e => setExternalId(e.target.value)}
                />
                <FormSelectSimple
                  label="Reservation Status"
                  placeholder="Select reservation status"
                  options={[
                    { code: 'CONF', name: 'Confirmed' },
                    { code: 'PEND', name: 'Pending' },
                    { code: 'CANC', name: 'Cancelled' },
                  ]}
                  value={reservationStatus}
                  onChange={e => setReservationStatus(e.target.value)}
                />
                <FormInput
                  label="Supplier Name"
                  placeholder="Enter supplier name"
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                />
                <FormSelectSimple
                  label="Currency"
                  placeholder="Select currency"
                  options={currencies}
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                />
                <FormInput
                  label="Supplier Code"
                  placeholder="Enter supplier code"
                  value={supplierCode}
                  onChange={e => setSupplierCode(e.target.value)}
                />
                <FormInput
                  label="Backoffice Ref"
                  placeholder="Enter backoffice ref"
                  value={backofficeRef}
                  onChange={e => setBackofficeRef(e.target.value)}
                />
                <FormSelectSimple
                  label="Language"
                  placeholder="Select language"
                  options={languages}
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                />
                <FormInput
                  label="Agent Ref"
                  placeholder="Enter agent ref"
                  value={agentRef}
                  onChange={e => setAgentRef(e.target.value)}
                />
                <FormInput
                  label="Supplier Confirmation"
                  placeholder="Enter supplier confirmation"
                  value={supplierConfirmation}
                  onChange={e => setSupplierConfirmation(e.target.value)}
                />
              </div>
            </FormSection>

            {/* 3. Travellers & Rooms */}
            <FormSection title="Travellers">
              <div className="flex flex-wrap gap-4 mb-6">
                <Button variant="contained" startIcon={<Plus />} onClick={handleAddAdult}>
                  Add Adult
                </Button>
                <Button variant="contained" startIcon={<Plus />} onClick={handleAddChild}>
                  Add Child
                </Button>
                <Button variant="contained" startIcon={<Plus />} onClick={handleAddRoom}>
                  Add Room
                </Button>
              </div>

              {/* Travellers */}
              {travellers.map(traveller => (
                <div
                  key={traveller.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6 relative"
                >
                  <div className="absolute top-4 right-4">
                    <Button color="error" onClick={() => handleRemoveTraveller(traveller.id)} size="small">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  <h3 className="text-lg font-medium text-gray-800 capitalize">{traveller.type}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 items-end">
                    <FormSelectSimple
                      label="Title"
                      placeholder="Select title"
                      options={titles.map(t => ({ code: t, name: t }))}
                      value={traveller.title}
                      onChange={e => handleTravellerChange(traveller.id, 'title', e.target.value)}
                    />
                    <FormInput
                      label="First Name"
                      placeholder="Enter first name"
                      value={traveller.firstName}
                      onChange={e => handleTravellerChange(traveller.id, 'firstName', e.target.value)}
                    />
                    <FormInput
                      label="Last Name"
                      placeholder="Enter last name"
                      value={traveller.lastName}
                      onChange={e => handleTravellerChange(traveller.id, 'lastName', e.target.value)}
                    />
                    <DatePicker
                      label="Birthday"
                      format="DD/MM/YYYY"
                      value={traveller.birthday}
                      onChange={date => handleTravellerChange(traveller.id, 'birthday', date)}
                      slotProps={{
                        textField: {
                          InputLabelProps: { shrink: true },
                          placeholder: 'DD/MM/YYYY',
                          variant: 'outlined',
                          fullWidth: true,
                        },
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
                    <FormSelectWithFlag
                      label="Nationality"
                      placeholder="Select nationality"
                      options={countries}
                      value={traveller.nationality}
                      onChange={e => handleTravellerChange(traveller.id, 'nationality', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              {/* Rooms */}
              {rooms.map(room => (
                <div
                  key={room.id}
                  className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-6 relative mt-6"
                >
                  <div className="absolute top-4 right-4">
                    <Button color="error" onClick={() => handleRemoveRoom(room.id)} size="small">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  <h3 className="text-lg font-medium text-blue-800">Room #{room.id}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8 items-end">
                    <FormSelectSimple
                      label="Room Info"
                      placeholder="Select room info"
                      options={roomInfoOptions.map(r => ({ code: r, name: r }))}
                      value={room.roomInfo}
                      onChange={e => handleRoomChange(room.id, 'roomInfo', e.target.value)}
                    />
                    <FormSelectSimple
                      label="Room Name"
                      placeholder="Select room name"
                      options={roomNameOptions.map(r => ({ code: r, name: r }))}
                      value={room.roomName}
                      onChange={e => handleRoomChange(room.id, 'roomName', e.target.value)}
                    />
                    <FormInput
                      label="Board"
                      placeholder="Enter board type"
                      value={room.board}
                      onChange={e => handleRoomChange(room.id, 'board', e.target.value)}
                    />
                    <FormInput
                      label="Room Type"
                      placeholder="Enter room type"
                      value={room.roomType}
                      onChange={e => handleRoomChange(room.id, 'roomType', e.target.value)}
                    />
                    <FormInput
                      label="Price"
                      placeholder="Enter price"
                      value={room.price}
                      onChange={e => handleRoomChange(room.id, 'price', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </FormSection>

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
              <div className="flex justify-end mt-4">
                <Button variant="outlined">Suggest Price</Button>
              </div>
            </FormSection>

            {/* 5. Rate & Cancellation Policy */}
            <div className="space-y-8">
              <FormSection title="Rate">
                <div className="grid grid-cols-1 gap-y-8">
                  <FormInput
                    label="Name"
                    placeholder="Enter rate name"
                    value={rateName}
                    onChange={e => setRateName(e.target.value)}
                  />
                  <TextField
                    label="Description"
                    placeholder="Enter description"
                    multiline
                    rows={3}
                    value={rateDescription}
                    onChange={e => setRateDescription(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ placeholder: 'Enter description' }}
                    variant="outlined"
                    fullWidth
                  />
                </div>
              </FormSection>

              <FormSection title="Cancellation Policy">
                <div className="flex flex-wrap gap-4 items-center">
                  <FormSelectSimple
                    label="Add New Policy"
                    placeholder="Standard policy"
                    options={policyOptions.map(p => ({ code: p, name: p }))}
                    value={cancellationPolicy}
                    onChange={e => setCancellationPolicy(e.target.value)}
                    className="flex-1 min-w-[200px]"
                  />
                  <Button variant="outlined">Add New Cancellation Policy</Button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-600">
                        <th className="p-2 font-medium">#</th>
                        <th className="p-2 font-medium">Type</th>
                        <th className="p-2 font-medium">Date</th>
                        <th className="p-2 font-medium">Price</th>
                        <th className="p-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-gray-500">
                        <td className="p-2">1</td>
                        <td className="p-2">Standard</td>
                        <td className="p-2">2025-04-01</td>
                        <td className="p-2">$100</td>
                        <td className="p-2">
                          <Button>
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </FormSection>
            </div>

            {/* 6. Backoffice Remarks */}
            <FormSection title="Backoffice Remarks">
              <div className="flex flex-wrap gap-4 items-center">
                <FormSelectSimple
                  label="Add New Remark"
                  placeholder="Promotion"
                  options={remarksOptions.map(r => ({ code: r, name: r }))}
                  value={backofficeRemark}
                  onChange={e => setBackofficeRemark(e.target.value)}
                  className="flex-1 min-w-[200px]"
                />
                <Button variant="outlined">Add New Remark</Button>
              </div>
              <TextField
                label="Comments"
                placeholder="Enter comments"
                multiline
                rows={4}
                value={comments}
                onChange={e => setComments(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ placeholder: 'Enter comments' }}
                variant="outlined"
                fullWidth
                className="mt-4"
              />
            </FormSection>

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