import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Button, TextField, MenuItem, CircularProgress } from '@mui/material';
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

// Type for API data
type RoomTypeFromApi = {
  name: string;
  options: {
    board: string;
    price: {
      value: number;
      currency: string;
    };
  }[];
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
  onChange: (e: React.ChangeEvent<any>) => void;
  className?: string;
  disabled?: boolean;
};

const FormSelectSimple: React.FC<MuiSelectSimpleProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  className = '',
  disabled = false,
}) => (
  <TextField
    label={label}
    select
    value={value}
    onChange={onChange}
    disabled={disabled}
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

// New Component for Autocomplete Input
type AutocompleteOption = {
  code: string;
  name: string;
};

type AutocompleteInputProps = {
  label: string;
  placeholder: string;
  options: AutocompleteOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  className = '',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedOption = options.find(opt => opt.code === value);
    setInputValue(selectedOption ? selectedOption.name : '');
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        const selectedOption = options.find(opt => opt.code === value);
        setInputValue(selectedOption ? selectedOption.name : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef, value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!showSuggestions) {
        setShowSuggestions(true);
    }
    if (e.target.value === '') {
      onChange('');
    }
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (option: AutocompleteOption) => {
    onChange(option.code);
    setInputValue(option.name);
    setShowSuggestions(false);
  };

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(inputValue.toLowerCase())
  );
  
  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
        return <span>{text}</span>;
    }
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <span key={i} className="font-bold text-blue-600">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </span>
    );
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <TextField
        label={label}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        disabled={disabled}
        InputLabelProps={{ shrink: true }}
        fullWidth
        variant="outlined"
        autoComplete="off"
      />
      {showSuggestions && !disabled && (
        <ul className="absolute z-10 w-full bg-white shadow-xl border border-gray-200 rounded-lg mt-2 max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <li
                key={option.code}
                className="px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-800 cursor-pointer transition-colors duration-150 ease-in-out"
                onMouseDown={() => handleSuggestionClick(option)}
              >
                {getHighlightedText(option.name, inputValue)}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-gray-500 italic">No options found</li>
          )}
        </ul>
      )}
    </div>
  );
};


// Props for Travellers component
type TravellersProps = {
  rooms: Room[];
  handleAddRoom: () => void;
  handleRemoveRoom: (roomId: number) => void;
  handleRoomChange: (roomId: number, field: keyof Omit<Room, 'travellers'>, value: string) => void;
  handleAddTraveller: (roomId: number, type: TravellerType) => void;
  handleRemoveTraveller: (roomId: number, travellerId: number) => void;
  handleTravellerChange: (roomId: number, travellerId: number, field: keyof Traveller, value: any) => void;
  apiRoomTypes: RoomTypeFromApi[];
  isRoomDataLoading: boolean;
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
  apiRoomTypes,
  isRoomDataLoading,
}) => {
  const titles = ['Mr.', 'Mrs.', 'Ms.'];
  const countries = Country.getAllCountries().map(c => ({
    code: c.isoCode,
    name: c.name,
  }));

  const roomNameOptions = apiRoomTypes.map(r => ({ code: r.name, name: r.name }));

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

        {rooms.map((room, roomIndex) => {
          const selectedRoomApiData = apiRoomTypes.find(apiRoom => apiRoom.name === room.roomName);
          
          const boardOptions = selectedRoomApiData
            ? [...new Set(selectedRoomApiData.options.map(opt => opt.board))]
                .map(boardName => ({ code: boardName, name: boardName }))
            : [];

          return (
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

              <h3 className="text-lg font-medium text-blue-800">Room #{roomIndex + 1}</h3>
              {isRoomDataLoading && (
                <div className="flex items-center gap-2 text-gray-600">
                  <CircularProgress size={20} />
                  <span>Loading room options...</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8 items-start">
                <AutocompleteInput
                  label="Room Type"
                  placeholder={isRoomDataLoading ? "Loading..." : "Select room type"}
                  options={roomNameOptions}
                  value={room.roomName}
                  disabled={isRoomDataLoading || roomNameOptions.length === 0}
                  onChange={value => {
                    handleRoomChange(room.id, 'roomName', value);
                    handleRoomChange(room.id, 'board', '');
                    handleRoomChange(room.id, 'price', '');
                  }}
                />
                <AutocompleteInput
                  label="Board"
                  placeholder="Select board"
                  options={boardOptions}
                  value={room.board}
                  disabled={!room.roomName || boardOptions.length === 0}
                  onChange={value => {
                    handleRoomChange(room.id, 'board', value);
                  }}
                />
                <FormInput
                  label="Price"
                  placeholder="Enter price"
                  type="number"
                  value={room.price}
                  onChange={e => handleRoomChange(room.id, 'price', e.target.value)}
                />
              </div>

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

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8 items-end">
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
          )
        })}
      </FormSection>
    </LocalizationProvider>
  );
};