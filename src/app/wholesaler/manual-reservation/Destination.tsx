import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField, MenuItem, CircularProgress, Typography, IconButton, Tooltip, Button, Alert, Chip, Accordion, AccordionSummary, AccordionDetails, Divider, RadioGroup, FormControlLabel, Radio, FormControl } from '@mui/material';
import {
    Close as CloseIcon, Star as StarIcon, Apartment as ApartmentIcon, Search as SearchIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon, ExpandMore as ExpandMoreIcon,
    Info as InfoIcon, Replay as ReplayIcon, Schedule as ScheduleIcon, CreditCard as CreditCardIcon
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { debounce } from 'lodash';
import axios from 'axios';

// API Configuration
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || process.env.API_URL,
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

// --- TYPES FOR ROOM API RESPONSE ---
type Price = {
    value: number;
    currency: string;
};

type RoomOption = {
    offerId: string;
    board: string;
    price: Price;
    refundable: boolean;
    cancellationDeadline: string;
    features: string[];
    packageToken: string;
    roomToken: string;
};

type RoomType = {
    name: string;
    options: RoomOption[];
};

type SupplierData = {
    supplierId: string;
    supplierName: string;
    data: {
        srk: string;
        tokens: {
            results: string;
        };
        simplified: {
            roomTypes: RoomType[];
        }
    }
};

type RoomApiResponse = {
    success: boolean;
    data: {
        suppliers: SupplierData[];
    };
};

// MODIFIED: TYPES FOR PRE-BOOK API RESPONSE to handle cancellation policy array
type CancellationPolicyDetail = {
    deadline?: string;
};

type PreBookRoomDetail = {
    roomToken: string;
    roomType: string;
    boardRoom: string;
    Refundable: boolean;
    cancellationPolicyDetails: CancellationPolicyDetail[] | null;
    roomInfo: string;
};

type PreBookApiResponseData = {
    availabilityToken: string;
    packageInfo: {
        rooms: PreBookRoomDetail[];
    };
    remarks: string[];
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

const fetchRoomData = async (payload: any): Promise<RoomApiResponse> => {
    try {
        const response = await axiosInstance.post('hotel/rooms', payload);
        return response.data;
    } catch (error) {
        console.error('Error fetching room data:', error);
        throw error;
    }
};

const preBookHotel = async (payload: any): Promise<PreBookApiResponseData> => {
    try {
        const response = await axiosInstance.post('pre-book', payload);
        console.log('Pre-Book Success:', response.data);
        return response.data.data;
    } catch (error) {
        console.error('Error during pre-booking:', error);
        alert('Pre-booking failed! Check the console for details.');
        throw error;
    }
};

const confirmBooking = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('/book-confirm', payload);
        console.log('Booking Confirmation Success:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error during booking confirmation:', error);
        alert('Booking confirmation failed! Check the console for details.');
        throw error;
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
        {children}
    </div>
);

const HotelDetails: React.FC<{ hotel: HotelFromCitySearch | null }> = ({ hotel }) => {
    if (!hotel) {
        return (
            <div className="bg-white rounded-xl shadow-md h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-300">
                <ApartmentIcon className="text-gray-400" style={{ fontSize: 50 }} />
                <h3 className="mt-4 text-lg font-semibold text-gray-700">Hotel Details</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Select a hotel to see its information here.
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
                        {hotel.facilities.slice(0, 5).map(facility => (
                            <span
                                key={facility._id}
                                className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full"
                            >
                                {facility.name}
                            </span>
                        ))}
                        {hotel.facilities.length > 5 && (
                            <Tooltip title={hotel.facilities.slice(5).map(f => f.name).join(', ')} arrow>
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

type RoomResultsProps = {
    status: 'idle' | 'success' | 'error';
    loading: boolean;
    data: RoomApiResponse | null;
    selectedRoomIdentifier: string | null;
    onSelectRoom: (identifier: string, room: RoomOption) => void;
};

const RoomResults: React.FC<RoomResultsProps> = ({ status, loading, data, selectedRoomIdentifier, onSelectRoom }) => {
    const [expanded, setExpanded] = useState<string | false>(false);

    const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    if (status === 'idle') {
        return null;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10 mt-8">
                <CircularProgress />
                <Typography className="ml-4">Searching for available rooms...</Typography>
            </div>
        );
    }

    const roomTypes = data?.data?.suppliers?.[0]?.data?.simplified?.roomTypes;

    if (status === 'success' && (!roomTypes || roomTypes.length === 0)) {
        return <Alert severity="info" className="mt-8">No rooms found for the selected dates or hotel.</Alert>;
    }

    if (status === 'success' && roomTypes && roomTypes.length > 0) {
        return (
            <div className="mt-8">
                <FormSection title="Available Rooms">
                    <div className="space-y-2">
                        {roomTypes.map((roomType, index) => (
                            <Accordion
                                key={index}
                                expanded={expanded === `panel${index}`}
                                onChange={handleChange(`panel${index}`)}
                                sx={{ '&:before': { display: 'none' }, boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls={`panel${index}-content`}
                                    id={`panel${index}-header`}
                                >
                                    <Typography sx={{ fontWeight: 'bold', color: '#1f2937' }}>{roomType.name}</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ backgroundColor: '#fafafa' }}>
                                    <div className="divide-y divide-gray-200">
                                        {roomType.options.map((option, optIndex) => {
                                            const identifier = `${index}-${optIndex}`;
                                            const isSelected = selectedRoomIdentifier === identifier;

                                            return (
                                                <div key={identifier} className={`flex flex-col md:flex-row justify-between items-start md:items-center py-4 px-2 transition-colors duration-200 ${isSelected ? 'bg-blue-100 rounded-lg' : ''}`}>
                                                    <div className="flex-1 mb-3 md:mb-0">
                                                        <p className="font-semibold">{option.board}</p>
                                                        <div className="flex items-center mt-2">
                                                            {option.refundable ? (
                                                                <Tooltip title={`Free cancellation before ${dayjs(option.cancellationDeadline).format('MMMM D, YYYY, [at] HH:mm:ss')}`} arrow>
                                                                    <Chip icon={<CheckCircleIcon />} label="Refundable" color="success" size="small" variant="outlined" />
                                                                </Tooltip>
                                                            ) : (
                                                                <Chip icon={<CancelIcon />} label="Non-Refundable" color="error" size="small" variant="outlined" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-4">
                                                        <div className="text-right">
                                                            <p className="text-xl font-bold text-blue-600">
                                                                {option.price.value.toFixed(2)} {option.price.currency}
                                                            </p>
                                                            <p className="text-xs text-gray-500">Total price</p>
                                                        </div>
                                                        <Button
                                                            variant={isSelected ? "outlined" : "contained"}
                                                            color={isSelected ? "success" : "secondary"}
                                                            onClick={() => onSelectRoom(identifier, option)}
                                                            startIcon={isSelected ? <CheckCircleIcon /> : null}
                                                        >
                                                            {isSelected ? 'Selected' : 'Add Room'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </div>
                </FormSection>
            </div>
        );
    }

    return null;
};

// MODIFIED: PreBookSuccessDetails logic updated to correctly parse deadline
const PreBookSuccessDetails: React.FC<{ data: PreBookApiResponseData, onReset: () => void }> = ({ data, onReset }) => {
    const roomInfo = data.packageInfo.rooms[0];
    const isRefundable = roomInfo.Refundable;

    // Safely access the deadline from the first element of the policy array
    const policyArray = roomInfo.cancellationPolicyDetails;
    const deadline = policyArray && policyArray.length > 0 ? policyArray[0].deadline : undefined;

    // Check if the deadline is a valid future date
    const isDeadlineValid = deadline && dayjs(deadline).isAfter(dayjs());

    const renderCancellationPolicy = () => {
        if (isRefundable && isDeadlineValid) {
            return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography color="primary.main">
                        Free cancellation until: <strong>{dayjs(deadline).format('MMMM D, YYYY, [at] HH:mm:ss')}</strong>
                    </Typography>
                </div>
            );
        } else {
            return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <Typography color="text.secondary">
                        Free cancellation not available
                    </Typography>
                </div>
            );
        }
    };

    return (
        <FormSection title="Pre-Booking Confirmed">
            <div className="space-y-6">
                <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />} sx={{ fontWeight: 'bold' }}>
                    Your pre-booking has been successfully created. Please review the details below.
                </Alert>

                <div>
                    <Typography variant="h6" gutterBottom>Cancellation Policy</Typography>
                    <Divider />
                    <div className="mt-3 p-4 bg-gray-100 rounded-lg">
                        {renderCancellationPolicy()}
                    </div>
                </div>

                <div>
                    <Typography variant="h6" gutterBottom>Important Remarks</Typography>
                    <Divider />
                    <ul className="mt-3 space-y-2 list-disc list-inside bg-gray-100 p-4 rounded-lg">
                        {data.remarks.map((remark, index) => (
                            <li key={index} className="text-gray-700">{remark}</li>
                        ))}
                    </ul>
                </div>

                <div className="text-center pt-4">
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<ReplayIcon />}
                        onClick={onReset}
                    >
                        Make Another Reservation
                    </Button>
                </div>
            </div>
        </FormSection>
    );
};


// --- MAIN COMPONENT ---
// UPDATE: Component now accepts agency wallet and markup data as props.
export const Destination = ({ agencyWalletBalance, agencyMarkup }: { agencyWalletBalance: number | null; agencyMarkup: number | null }) => {
    const [destination, setDestination] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [hotels, setHotels] = useState<HotelFromDestinationSearch[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const destinationInputRef = useRef<HTMLInputElement>(null);

    const [hotelsFromCitySearch, setHotelsFromCitySearch] = useState<HotelFromCitySearch[]>([]);
    const [hotelLoading, setHotelLoading] = useState(false);
    const [selectedHotelId, setSelectedHotelId] = useState('');
    const [selectedHotelDetails, setSelectedHotelDetails] = useState<HotelFromCitySearch | null>(null);

    const [hotelInputValue, setHotelInputValue] = useState('');
    const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);

    const [checkIn, setCheckIn] = useState<Dayjs | null>(null);
    const [checkOut, setCheckOut] = useState<Dayjs | null>(null);
    const [nights, setNights] = useState<number | ''>('');

    const [roomApiLoading, setRoomApiLoading] = useState(false);
    const [roomApiStatus, setRoomApiStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [availableRoomsData, setAvailableRoomsData] = useState<RoomApiResponse | null>(null);

    const [selectedRoomIdentifier, setSelectedRoomIdentifier] = useState<string | null>(null);
    const [selectedRoomData, setSelectedRoomData] = useState<RoomOption | null>(null);

    const [isPreBooking, setIsPreBooking] = useState(false);
    const [preBookResponse, setPreBookResponse] = useState<PreBookApiResponseData | null>(null);

    const [agencyReference, setAgencyReference] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'pay-later' | 'credit'>('credit');
    const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
    const [bookingConfirmation, setBookingConfirmation] = useState<any | null>(null);


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
        setRoomApiStatus('idle');
        setAvailableRoomsData(null);
    }, [selectedHotelId, hotelsFromCitySearch]);

    useEffect(() => {
        setRoomApiStatus('idle');
        setAvailableRoomsData(null);
        setSelectedRoomIdentifier(null);
        setSelectedRoomData(null);
    }, [checkIn, checkOut, selectedHotelId]);

    useEffect(() => {
        // If a non-refundable room is selected, force the payment method to 'credit'.
        if (selectedRoomData && !selectedRoomData.refundable) {
            setPaymentMethod('credit');
        }
    }, [selectedRoomData]);

    const handleClearDestination = () => {
        setDestination('');
        setCities([]);
        setHotels([]);
        setShowSuggestions(false);
        setHotelsFromCitySearch([]);
        setSelectedHotelId('');
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
        setDestination(hotel.city.name);
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

    const handleCheckAvailability = async () => {
        if (!selectedHotelDetails || !checkIn || !checkOut) {
            setRoomApiStatus('error');
            return;
        }
        const firstSupplier = selectedHotelDetails.mappedSuppliers?.[0];
        if (!firstSupplier) {
            setRoomApiStatus('error');
            return;
        }
        const payload = {
            supplierId: [{
                supplierId: firstSupplier.supplier,
                supplierHotelId: firstSupplier.supplierHotelId
            }],
            agencyId: "68456d5311ae56cfecb2b362",
            checkIn: checkIn.format('YYYY-MM-DD'),
            checkOut: checkOut.format('YYYY-MM-DD'),
            occupancy: {
                leaderNationality: 526,
                rooms: [{ adults: 1, children: 0, childrenAges: [] }]
            },
            sellingChannel: "B2B"
        };
        setRoomApiLoading(true);
        setRoomApiStatus('idle');
        setAvailableRoomsData(null);
        setSelectedRoomIdentifier(null);
        setSelectedRoomData(null);
        setPreBookResponse(null);
        setBookingConfirmation(null);


        try {
            const data = await fetchRoomData(payload);
            setAvailableRoomsData(data);
            setRoomApiStatus('success');
        } catch (error) {
            setRoomApiStatus('error');
        } finally {
            setRoomApiLoading(false);
        }
    };

    const handleSelectRoom = (identifier: string, roomData: RoomOption) => {
        if (selectedRoomIdentifier === identifier) {
            setSelectedRoomIdentifier(null);
            setSelectedRoomData(null);
        } else {
            setSelectedRoomIdentifier(identifier);
            setSelectedRoomData(roomData);
        }
    };

    const handlePreBook = async () => {
        const firstSupplierData = availableRoomsData?.data?.suppliers?.[0];
        if (!selectedRoomData || !firstSupplierData || !selectedHotelDetails || !checkIn || !checkOut) {
            console.error("Missing required data for pre-booking.");
            alert("Cannot proceed. Required information is missing.");
            return;
        }
        setIsPreBooking(true);
        const payload = {
            supplier: firstSupplierData.supplierId,
            hotelCode: String(selectedHotelDetails.mappedSuppliers[0].supplierHotelId),
            checkIn: checkIn.format('YYYY-MM-DD'),
            checkOut: checkOut.format('YYYY-MM-DD'),
            nationality: "EG",
            resultToken: firstSupplierData.data.tokens.results,
            srk: firstSupplierData.data.srk,
            hotelIndex: selectedHotelDetails.mappedSuppliers[0].supplierHotelId,
            offerIndex: selectedRoomData.offerId,
            rooms: [
                {
                    adults: 1,
                    packageToken: selectedRoomData.packageToken,
                    roomToken: [selectedRoomData.roomToken]
                }
            ]
        };
        try {
            const resultData = await preBookHotel(payload);
            setPreBookResponse(resultData);
        } finally {
            setIsPreBooking(false);
        }
    };

    const handleFinalizeBooking = async () => {
        if (!preBookResponse || !availableRoomsData || !selectedRoomData || !selectedHotelDetails || !checkIn || !checkOut) {
            alert("Cannot finalize booking. Essential data is missing.");
            return;
        }

        const firstSupplierData = availableRoomsData.data.suppliers[0];
        const supplierDetails = selectedHotelDetails.mappedSuppliers[0];
        
        // Determine bookingType based on UI selection
        const payloadBookingType = paymentMethod === 'credit' ? 'PREPAID' : 'PAYLATER';

        const payload = {
            provider: firstSupplierData.supplierId,
            stayDetails: {
                startDate: checkIn.format('YYYY-MM-DD'),
                endDate: checkOut.format('YYYY-MM-DD'),
            },
            srk: firstSupplierData.data.srk,
            hotelIndex: String(supplierDetails.supplierHotelId),
            offerIndex: selectedRoomData.offerId,
            resultToken: firstSupplierData.data.tokens.results,
            availabilityToken: preBookResponse.availabilityToken,
            payment: {
                method: "prepaid", // Always set to "prepaid" as requested
            },
            reference: {
                clientRef: agencyReference,
            },
            rooms: [
                {
                    name: preBookResponse.packageInfo.rooms[0].roomType,
                    board: preBookResponse.packageInfo.rooms[0].boardRoom,
                    packageRoomToken: selectedRoomData.packageToken,
                    travelers: [
                        {
                            firstName: "mof",
                            lastName: "Doe",
                            email: "tom@gmail.com",
                            type: "adult",
                            lead: true,
                            nationality: "GB",
                        },
                    ],
                },
            ],
            bookingType: payloadBookingType, // Dynamically set based on UI
            data: {
                priceDetails: {
                    price: selectedRoomData.price,
                    originalPrice: selectedRoomData.price,
                    markupApplied: {
                        type: "percentage",
                        value: agencyMarkup || 0,
                        description: `${agencyMarkup || 0}% markup applied`,
                    },
                },
                hotel: {
                    name: selectedHotelDetails.name,
                    stars: selectedHotelDetails.stars,
                    city: selectedHotelDetails.city.name,
                    country: selectedHotelDetails.country.name,
                },
            },
        };

        setIsConfirmingBooking(true);
        try {
            const result = await confirmBooking(payload);
            setBookingConfirmation(result);
            alert('Booking confirmed successfully!');
        } catch (error) {
            // Error is already alerted in confirmBooking function
        } finally {
            setIsConfirmingBooking(false);
        }
    };


    const handleReset = () => {
        setDestination('');
        setCities([]);
        setHotels([]);
        setHotelsFromCitySearch([]);
        setSelectedHotelId('');
        setSelectedHotelDetails(null);
        setHotelInputValue('');
        setCheckIn(null);
        setCheckOut(null);
        setNights('');
        setRoomApiStatus('idle');
        setAvailableRoomsData(null);
        setSelectedRoomIdentifier(null);
        setSelectedRoomData(null);
        setPreBookResponse(null);
        setAgencyReference('');
        setPaymentMethod('credit');
        setIsConfirmingBooking(false);
        setBookingConfirmation(null);
    };

    const filteredHotels = hotelsFromCitySearch.filter(hotel =>
        hotel.name.toLowerCase().includes(hotelInputValue.toLowerCase())
    );

    const isCheckAvailabilityDisabled = !selectedHotelId || !checkIn || !checkOut;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="space-y-8">
                <FormSection title="Create Manual Reservation">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8">
                        <div className="space-y-6 flex flex-col">
                            <div className="relative">
                                <TextField
                                    label="Destination"
                                    placeholder="Search for a city or hotel"
                                    value={destination}
                                    onChange={(e) => {
                                        setDestination(e.target.value);
                                        debouncedSearch(e.target.value);
                                    }}
                                    onFocus={() => destination.length > 2 && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    variant="outlined"
                                    inputRef={destinationInputRef}
                                    InputProps={{
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
                                        {cities.map(city => <MenuItem key={city.id} onClick={() => handleCitySelect(city)}>{city.name}, {city.countryName}</MenuItem>)}
                                        {hotels.map(hotel => <MenuItem key={hotel._id} onClick={() => handleHotelSelect(hotel)}>{hotel.name}, {hotel.city.name}</MenuItem>)}
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
                                        if (selectedHotelId) setSelectedHotelId('');
                                    }}
                                    onFocus={() => hotelsFromCitySearch.length > 0 && setShowHotelSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowHotelSuggestions(false), 200)}
                                    disabled={hotelLoading || hotelsFromCitySearch.length === 0}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    variant="outlined"
                                />
                                {showHotelSuggestions && filteredHotels.length > 0 && (
                                    <div className="absolute top-full left-0 z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-2">
                                        {filteredHotels.map(hotel => <MenuItem key={hotel._id} onClick={() => { setSelectedHotelId(hotel._id); setShowHotelSuggestions(false); }}>{hotel.name}</MenuItem>)}
                                    </div>
                                )}
                            </div>

                            <DatePicker
                                label="Check-in"
                                value={checkIn}
                                onChange={setCheckIn}
                            />
                            <DatePicker
                                label="Check-out"
                                value={checkOut}
                                onChange={setCheckOut}
                                minDate={checkIn ? checkIn.add(1, 'day') : undefined}
                            />
                            <TextField label="Nights" value={nights} InputProps={{ readOnly: true }} />

                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                disabled={isCheckAvailabilityDisabled || roomApiLoading}
                                onClick={handleCheckAvailability}
                                startIcon={roomApiLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                                sx={{ py: 1.5, mt: 'auto', fontWeight: 'bold' }}
                            >
                                {roomApiLoading ? 'Searching...' : 'Check Room Availability'}
                            </Button>
                        </div>

                        <HotelDetails hotel={selectedHotelDetails} />
                    </div>
                    {roomApiStatus === 'error' && !roomApiLoading && (
                        <Alert severity="error" className="mt-6">Failed to fetch rooms. Please check the details and try again.</Alert>
                    )}
                </FormSection>

                <RoomResults
                    status={roomApiStatus}
                    loading={roomApiLoading}
                    data={availableRoomsData}
                    selectedRoomIdentifier={selectedRoomIdentifier}
                    onSelectRoom={handleSelectRoom}
                />

                {selectedRoomData && !preBookResponse && (
                    <div className="mt-8 flex justify-end">
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handlePreBook}
                            disabled={isPreBooking}
                            startIcon={isPreBooking ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{ py: 1.5, fontWeight: 'bold' }}
                        >
                            {isPreBooking ? 'Processing...' : 'Proceed'}
                        </Button>
                    </div>
                )}

                {preBookResponse && !bookingConfirmation && (
                    <>
                        <div className="mt-8">
                            <PreBookSuccessDetails data={preBookResponse} onReset={handleReset} />
                        </div>
                        <FormSection title="Finalize Booking" className="mt-8">
                            <div className="space-y-6">
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        aria-label="payment-method"
                                        name="payment-method-group"
                                        value={paymentMethod}
                                        onChange={(event) => setPaymentMethod(event.target.value as 'pay-later' | 'credit')}
                                    >
                                        {/* Pay Later Option */}
                                        <div className={`p-4 border rounded-lg mb-4 cursor-pointer inline-block ${paymentMethod === 'pay-later' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                                            <FormControlLabel
                                                value="pay-later"
                                                control={<Radio />}
                                                disabled={!selectedRoomData?.refundable}
                                                label={
                                                    <div className="flex items-start ml-2">
                                                        <ScheduleIcon className={`mr-3 mt-1 ${!selectedRoomData?.refundable ? 'text-gray-400' : 'text-blue-600'}`} />
                                                        <div>
                                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Pay later</Typography>
                                                            <Typography variant="body2" color="textSecondary">
                                                                Please complete payment by {
                                                                    preBookResponse?.packageInfo?.rooms?.[0]?.cancellationPolicyDetails?.[0]?.deadline
                                                                        ? dayjs(preBookResponse.packageInfo.rooms[0].cancellationPolicyDetails[0].deadline).format('MMMM D, YYYY, [at] HH:mm:ss')
                                                                        : 'N/A'
                                                                } to secure your booking.
                                                            </Typography>
                                                            <Typography variant="body2" color="textSecondary">
                                                                Unpaid reservation will be automatically canceled after this time.
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                }
                                                sx={{ alignItems: 'flex-start' }}
                                            />
                                        </div>

                                        {/* Credit Option */}
                                        <div className={`p-4 border rounded-lg cursor-pointer inline-block ${paymentMethod === 'credit' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                                            <FormControlLabel
                                                value="credit"
                                                control={<Radio />}
                                                label={
                                                    <div className="flex justify-between items-start ml-2">
                                                        <div className="flex items-start">
                                                            <CreditCardIcon className="mr-3 mt-1 text-green-600" />
                                                            <div>
                                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Credit</Typography>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    Available credit: {agencyWalletBalance !== null ? `${agencyWalletBalance.toFixed(2)} USD` : 'N/A'}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                        {paymentMethod === 'credit' && <CheckCircleIcon className="ml-4" color="success" />}
                                                    </div>
                                                }
                                                sx={{ alignItems: 'flex-start' }}
                                            />
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                
                                <TextField
                                    label="Agency Reference"
                                    value={agencyReference}
                                    onChange={(e) => setAgencyReference(e.target.value)}
                                    variant="outlined"
                                    required
                                    sx={{ display: 'block', maxWidth: '350px' }}
                                />

                                <div className="flex justify-end pt-4">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        onClick={handleFinalizeBooking}
                                        disabled={isConfirmingBooking || !agencyReference}
                                        startIcon={isConfirmingBooking ? <CircularProgress size={20} color="inherit" /> : null}
                                        sx={{ py: 1.5, fontWeight: 'bold' }}
                                    >
                                        {isConfirmingBooking ? 'Finalizing...' : 'Finalize Booking'}
                                    </Button>
                                </div>
                            </div>
                        </FormSection>
                    </>
                )}

                {bookingConfirmation && (
                    <FormSection title="Booking Confirmed!" className="mt-8">
                        <Alert severity="success" sx={{ mb: 4, '.MuiAlert-message': { fontSize: '1.1rem' } }}>
                            Your booking has been finalized successfully.
                            <br />
                            <strong>Booking ID:</strong> {bookingConfirmation?.data?.bookingId || 'N/A'}
                        </Alert>
                        <div className="text-center pt-4">
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<ReplayIcon />}
                                onClick={handleReset}
                            >
                                Make Another Reservation
                            </Button>
                        </div>
                    </FormSection>
                )}
            </div>
        </LocalizationProvider>
    );
};