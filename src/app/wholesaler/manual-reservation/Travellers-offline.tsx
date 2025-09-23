import React, { ReactNode } from 'react';
import { Button, TextField, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Plus, Trash2 } from 'lucide-react';
import { Country } from 'country-state-city';
import ReactCountryFlag from 'react-country-flag';

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

// Props for Travellers component
type TravellersProps = {
  rooms: Room[];
  handleAddRoom: () => void;
  handleRemoveRoom: (roomId: number) => void;
  handleRoomChange: (roomId: number, field: keyof Omit<Room, 'travellers'>, value: string) => void;
  handleAddTraveller: (roomId: number, type: TravellerType) => void;
  handleRemoveTraveller: (roomId: number, travellerId: number) => void;
  handleTravellerChange: (roomId: number, travellerId: number, field: keyof Traveller, value: any) => void;
};

// Main Travellers Component
export const Travellers: React.FC<TravellersProps> = ({
  rooms,
  handleAddRoom,
  handleRemoveRoom,
  handleRoomChange,
  handleAddTraveller,
  handleRemoveTraveller,
  handleTravellerChange,
}) => {
  const titles = ['Mr.', 'Mrs.', 'Ms.'];
  const roomNameOptions = ['Deluxe', 'Suite', 'Standard'];
  const countries = Country.getAllCountries().map(c => ({
    code: c.isoCode,
    name: c.name,
  }));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormSection title="Travellers">
        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => handleAddRoom()}
          >
            Add Room
          </Button>
        </div>

        {rooms.map(room => (
          <div
            key={room.id}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-6 relative"
          >
            <div className="absolute top-4 right-4">
              <Button
                color="error"
                onClick={() => handleRemoveRoom(room.id)}
                size="small"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Room Details */}
            <h3 className="text-lg font-medium text-blue-800">Room #{room.id}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8 items-end">
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

            {/* Traveller Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <Button
                variant="outlined"
                startIcon={<Plus />}
                onClick={() => handleAddTraveller(room.id, 'adult')}
              >
                Add Adult
              </Button>
              <Button
                variant="outlined"
                startIcon={<Plus />}
                onClick={() => handleAddTraveller(room.id, 'child')}
              >
                Add Child
              </Button>
            </div>

            {/* Travellers in Room - Safe mapping */}
            {(room.travellers || []).map(traveller => (
              <div
                key={traveller.id}
                className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 relative mt-6"
              >
                <div className="absolute top-4 right-4">
                  <Button
                    color="error"
                    onClick={() => handleRemoveTraveller(room.id, traveller.id)}
                    size="small"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>

                <h4 className="text-md font-medium text-gray-700 capitalize">
                  {traveller.type}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 items-end">
                  <FormSelectSimple
                    label="Title"
                    placeholder="Select title"
                    options={titles.map(t => ({ code: t, name: t }))}
                    value={traveller.title}
                    onChange={e =>
                      handleTravellerChange(room.id, traveller.id, 'title', e.target.value)
                    }
                  />
                  <FormInput
                    label="First Name"
                    placeholder="Enter first name"
                    value={traveller.firstName}
                    onChange={e =>
                      handleTravellerChange(room.id, traveller.id, 'firstName', e.target.value)
                    }
                  />
                  <FormInput
                    label="Last Name"
                    placeholder="Enter last name"
                    value={traveller.lastName}
                    onChange={e =>
                      handleTravellerChange(room.id, traveller.id, 'lastName', e.target.value)
                    }
                  />
                  <DatePicker
                    label="Birthday"
                    format="DD/MM/YYYY"
                    value={traveller.birthday}
                    onChange={date =>
                      handleTravellerChange(room.id, traveller.id, 'birthday', date)
                    }
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
                    onChange={e =>
                      handleTravellerChange(room.id, traveller.id, 'nationality', e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </FormSection>
    </LocalizationProvider>
  );
};