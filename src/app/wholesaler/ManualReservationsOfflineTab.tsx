import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
// External Libraries
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// UPDATED ICON IMPORTS
import { Plus, Trash2, Clock, Wallet, Edit, CheckCircle, X, Calendar, User, Building, MapPin, Hash, DollarSign, FileText, MessageSquare, Briefcase, Star, BedDouble } from 'lucide-react';
// UPDATED MUI IMPORTS
import { TextField, MenuItem, Button, FormControl, RadioGroup, FormControlLabel, Radio, Typography, Modal, Box, IconButton, Divider, Grid } from '@mui/material';
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
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

// Import components and utility functions
import Agency from './manual-reservation/Agency-offline';
import { CancellationPolicy } from './manual-reservation/CancellationPolicy-offline';
import BackofficeRemarks from './manual-reservation/BackofficeRemarks';
import { Destination } from './manual-reservation/Destination-offline';
import { Travellers } from './manual-reservation/Travellers-offline';
import { ExternalDetails } from './manual-reservation/ExternalDetails-offline';
import { PriceInformation } from './manual-reservation/PriceInformation';
import PreviewModal from './PreviewModal';
import { generateVoucherPDF, Reservation } from './voucher/VoucherUtils';
import { generateInvoicePDF, generateInvoiceNumber, InvoiceData } from './voucher/InvoiceUtils';
import BookingSuccess from './BookingSuccess'; // <-- NEW: IMPORT THE SEPARATE COMPONENT

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
  birthdate: string | null; // <-- UPDATED from birthday to birthdate
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

// --- API RESPONSE TYPE ---
type BookingSuccessData = {
    bookingId: string;
    booking: {
        hotel: {
            name: string;
            stars: number;
            city: string;
            country: string;
        };
        fullDetails?: any;
    };
};

// --- UPDATED: TYPE DEFINITIONS FOR ROOMS API ---
type RoomOption = {
  board: string;
  price: { value: number; currency: string };
};

type RoomType = {
  name: string;
  options: RoomOption[];
};

type SupplierData = {
  simplified: {
    roomTypes: RoomType[];
  };
};

type SupplierResponse = {
  supplierId: string;
  supplierName: string;
  data: SupplierData | {};
  success: boolean;
  error?: string;
};

type ApiRoomsResponse = {
  success: boolean;
  data: {
    suppliers: SupplierResponse[];
  };
};


type HotelFromCitySearch = {
    _id: string;
    name: string;
    stars: number;
    location?: { city: string, countryCode: string };
    mappedSuppliers: {
        supplier: string;
        supplierHotelId: number;
        _id: string;
    }[];
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
  onChange: (e: React.ChangeEvent<any>) => void;
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
            style={{ width: '1em', height: '1.5em', marginRight: 8 }}
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
  const getInitialRooms = (): Room[] => {
      const initialRoomId = Date.now();
      return [
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
                      birthdate: null,
                      nationality: '',
                  },
              ],
          },
      ];
  };

  const [rooms, setRooms] = useState<Room[]>(getInitialRooms());
  const [nextRoomId, setNextRoomId] = useState<number>(() => Date.now() + 2);

  // --- FORM STATE ---
  const [selectedAgencyId, setSelectedAgencyId] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [agencyData, setAgencyData] = useState<{ walletBalance: number; markup: number }>({ walletBalance: 0, markup: 0 });
  const [destination, setDestination] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [selectedHotelDetails, setSelectedHotelDetails] = useState<HotelFromCitySearch | null>(null);
  const [checkIn, setCheckIn] = useState<Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null);
  const [externalId, setExternalId] = useState('');
  const [reservationStatus, setReservationStatus] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [currency, setCurrency] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [supplierType, setSupplierType] = useState<'online' | 'offline' | ''>('');
  const [backofficeRef, setBackofficeRef] = useState('');
  const [language, setLanguage] = useState('');
  const [agentRef, setAgentRef] = useState('');
  const [supplierConfirmation, setSupplierConfirmation] = useState('');
  const [supplierPrice, setSupplierPrice] = useState('');
  const [markup, setMarkup] = useState('');
  const [commission, setCommission] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [cancellationPolicies, setCancellationPolicies] = useState<Policy[]>([]);
  const [addedRemarks, setAddedRemarks] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDeadline, setPaymentDeadline] = useState<Dayjs | null>(null);

  // Dropdown options
  const [currencies, setCurrencies] = useState<Array<{ code: string; name: string }>>([]);
  const [languages, setLanguages] = useState<Array<{ code: string; name: string }>>([]);

  // API Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  // --- NEW: BOOKING & DOWNLOAD STATES ---
  const [bookingSuccessData, setBookingSuccessData] = useState<BookingSuccessData | null>(null);
  const [isDownloadingVoucher, setIsDownloadingVoucher] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  // --- NEW: ROOM API STATE ---
  const [apiRoomTypes, setApiRoomTypes] = useState<RoomType[]>([]);
  const [isRoomDataLoading, setIsRoomDataLoading] = useState(false);

  // --- NEW: CURRENCY CONVERSION STATE ---
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [convertedCredit, setConvertedCredit] = useState<number>(0);
  const [isConvertingCurrency, setIsConvertingCurrency] = useState(false);
  
  // --- NEW: WHOLESALER ID STATE ---
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // --- DYNAMIC WHOLESALER ID ---
  const getWholesalerId = useCallback(() => {
    if (typeof window !== "undefined") return localStorage.getItem("wholesalerId") || "";
    return "";
  }, []);

  // --- VOUCHER DOWNLOAD HANDLER ---
  const handleDownloadVoucher = async (data: BookingSuccessData) => {
    setIsDownloadingVoucher(true);
    try {
        const allPassengers = rooms.flatMap((room, roomIndex) =>
            room.travellers.map((traveller, travellerIndex) => ({
                firstName: traveller.firstName,
                lastName: traveller.lastName,
                lead: roomIndex === 0 && travellerIndex === 0,
                nationality: traveller.nationality,
            }))
        );

        const reservationDataForVoucher: Reservation = {
            bookingId: data.bookingId,
            reservationId: supplierConfirmation || externalId,
            providerId: supplierCode,
            checkIn: checkIn ? checkIn.toISOString() : undefined,
            checkOut: checkOut ? checkOut.toISOString() : undefined,
            agency: {
                agencyName: agencyName || "Your Travel Agency",
                address: "123 Travel Lane, Suite 100, Dubai, UAE",
                phoneNumber: "+971 4 123 4567",
            },
            passengers: allPassengers,
            hotelInfo: {
                id: selectedHotelId,
                name: selectedHotelDetails?.name,
                address: {
                    fullAddress: `${selectedHotelDetails?.location?.city}, ${selectedHotelDetails?.location?.countryCode}`,
                    city: selectedHotelDetails?.location?.city,
                    countryCode: selectedHotelDetails?.location?.countryCode,
                },
            },
            allRooms: rooms.map(room => ({
                roomName: room.roomName,
                board: room.board,
            })),
        };

        await generateVoucherPDF(reservationDataForVoucher);

    } catch (error) {
        console.error("Failed to generate voucher:", error);
        alert("Sorry, there was an error creating the voucher. Please try again.");
    } finally {
        setIsDownloadingVoucher(false);
    }
  };

  // --- NEW: INVOICE DOWNLOAD HANDLER ---
  const handleDownloadInvoice = async (data: BookingSuccessData) => {
    setIsDownloadingInvoice(true);
    try {
        const allPassengers = rooms.flatMap((room, roomIndex) =>
            room.travellers.map((traveller, travellerIndex) => ({
                firstName: traveller.firstName,
                lastName: traveller.lastName,
                lead: roomIndex === 0 && travellerIndex === 0,
            }))
        );

        const reservationDetailsForInvoice: Reservation = {
            agencyName: agencyName || "Travel Agency",
            passengers: allPassengers,
            hotelInfo: {
                name: selectedHotelDetails?.name || "N/A",
            },
            checkIn: checkIn ? checkIn.toISOString() : undefined,
            checkOut: checkOut ? checkOut.toISOString() : undefined,
            currency: currency || "USD",
            priceDetails: {
                price: {
                    value: parseFloat(totalPrice) || 0,
                },
            },
        };

        const today = new Date();
        const invoiceData: InvoiceData = {
            invoiceNumber: generateInvoiceNumber(),
            invoiceDate: today.toLocaleDateString("en-GB"),
            dueDate: new Date(today.setDate(today.getDate() + 15)).toLocaleDateString("en-GB"),
            reservation: reservationDetailsForInvoice,
        };

        await generateInvoicePDF(invoiceData);

    } catch (error) {
        console.error("Failed to generate invoice:", error);
        alert("Sorry, there was an error creating the invoice. Please try again.");
    } finally {
        setIsDownloadingInvoice(false);
    }
  };


  // --- FORM RESET FUNCTION ---
  const handleBookAgain = () => {
    setRooms(getInitialRooms());
    setNextRoomId(Date.now() + 2);
    setSelectedAgencyId('');
    setAgencyName('');
    setAgencyData({ walletBalance: 0, markup: 0 });
    setDestination('');
    setSelectedHotelId('');
    setSelectedHotelDetails(null);
    setCheckIn(null);
    setCheckOut(null);
    setExternalId('');
    setReservationStatus('');
    setSupplierName('');
    setCurrency('');
    setSupplierCode('');
    setSupplierType('');
    setBackofficeRef('');
    setLanguage('');
    setAgentRef('');
    setSupplierConfirmation('');
    setMarkup('');
    setCommission('');
    setCancellationPolicies([]);
    setAddedRemarks([]);
    setComments('');
    setPaymentMethod('');
    setPaymentDeadline(null);
    setIsSubmitting(false);
    setSubmitError(null);
    setIsPreviewModalOpen(false);
    setBookingSuccessData(null);
    setApiRoomTypes([]);
  };

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
            birthdate: null,
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
          birthdate: null,
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

  // --- EFFECTS ---
  
  // NEW: Load stored wholesaler ID on mount
  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

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

  // --- EFFECT FOR PRICE CALCULATION ---
  useEffect(() => {
    const totalRoomPrice = rooms.reduce((sum, room) => {
      const price = parseFloat(room.price) || 0;
      return sum + price;
    }, 0);

    const calculatedSupplierPrice = totalRoomPrice.toFixed(2);
    setSupplierPrice(calculatedSupplierPrice);

    const markupValue = parseFloat(markup) || 0;
    const commissionValue = parseFloat(commission) || 0;
    const finalSupplierPrice = parseFloat(calculatedSupplierPrice) || 0;

    const calculatedTotalPrice = (finalSupplierPrice + markupValue) - commissionValue;

    setTotalPrice(calculatedTotalPrice.toFixed(2));

  }, [rooms, markup, commission]);

  // --- EFFECT FOR PAYMENT DEADLINE ---
  useEffect(() => {
    if (cancellationPolicies && cancellationPolicies.length > 0) {
        const dates = cancellationPolicies
            .map(p => p.date)
            .filter((d): d is Dayjs => d !== null && dayjs(d).isValid());

        if (dates.length > 0) {
            const earliestDate = dates.reduce((earliest, current) =>
                current.isBefore(earliest) ? current : earliest
            );
            setPaymentDeadline(earliestDate);
        } else {
            setPaymentDeadline(null);
        }
    } else {
        setPaymentDeadline(null);
    }
  }, [cancellationPolicies]);

    // --- EFFECT TO FETCH EXCHANGE RATES ---
    useEffect(() => {
      const fetchRates = async () => {
        if (!currency || currency === 'USD') {
          setExchangeRates(null);
          return;
        }
        setIsConvertingCurrency(true);
        try {
          const response = await axios.get('https://open.er-api.com/v6/latest/USD');
          setExchangeRates(response.data.rates);
        } catch (error) {
          console.error("Failed to fetch exchange rates:", error);
          setExchangeRates(null);
        } finally {
          setIsConvertingCurrency(false);
        }
      };
  
      fetchRates();
    }, [currency]);
  
    // --- EFFECT TO CALCULATE CONVERTED CREDIT ---
    useEffect(() => {
      const baseCreditUSD = agencyData.walletBalance;
  
      if (currency && currency !== 'USD' && exchangeRates && exchangeRates[currency]) {
        const rate = exchangeRates[currency];
        const convertedValue = baseCreditUSD * rate;
        setConvertedCredit(convertedValue);
      } else {
        setConvertedCredit(baseCreditUSD);
      }
    }, [currency, exchangeRates, agencyData.walletBalance]);

  // --- UPDATED: API CALL TO FETCH ROOMS ---
  const fetchHotelRooms = useCallback(async () => {
    if (!selectedHotelDetails || !checkIn || !checkOut || !selectedHotelDetails.mappedSuppliers || !wholesalerId) {
      setApiRoomTypes([]);
      return;
    }

    setIsRoomDataLoading(true);
    setApiRoomTypes([]);
    setRooms(getInitialRooms());

    try {
      const payload = {
        wholesalerId: wholesalerId, // <-- ADDED wholesalerId TO PAYLOAD
        supplierId: selectedHotelDetails.mappedSuppliers.map(s => ({
          supplierId: s.supplier,
          supplierHotelId: String(s.supplierHotelId)
        })),
        agencyId: "685dd2c31c290ecf67e85324",
        checkIn: checkIn.format('YYYY-MM-DD'),
        checkOut: checkOut.format('YYYY-MM-DD'),
        occupancy: {
          leaderNationality: 526,
          rooms: [{ adults: 1, children: 0, childrenAges: [] }]
        },
        sellingChannel: "B2B"
      };

      const axiosInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_BACKEND_URL });
      const response = await axiosInstance.post<ApiRoomsResponse>('/hotel/rooms', payload);
      
      if (response.data.success && response.data.data.suppliers) {
        const allRoomTypes = response.data.data.suppliers.flatMap(supplier => {
          if (supplier.success && 'simplified' in supplier.data && supplier.data.simplified?.roomTypes) {
            return supplier.data.simplified.roomTypes;
          }
          if (!supplier.success) {
            console.error(`Supplier ${supplier.supplierName} failed:`, supplier.error);
          }
          return [];
        });

        const uniqueRoomTypes = Array.from(new Map(allRoomTypes.map(room => [room.name, room])).values());
        setApiRoomTypes(uniqueRoomTypes);

      } else {
        console.error("No suppliers data found in API response.");
        setApiRoomTypes([]);
      }

    } catch (error) {
      console.error("Error fetching hotel rooms:", error);
      setApiRoomTypes([]);
    } finally {
      setIsRoomDataLoading(false);
    }
  }, [selectedHotelDetails, checkIn, checkOut, wholesalerId]); // <-- ADDED wholesalerId to dependency array

  useEffect(() => {
    // This will now run whenever fetchHotelRooms function reference changes,
    // which happens when wholesalerId (or other dependencies) changes.
    fetchHotelRooms();
  }, [fetchHotelRooms]);


  // --- OPEN PREVIEW MODAL ---
  const handleCreateReservation = () => {
    setIsPreviewModalOpen(true);
  };

  // --- CONFIRM AND SUBMIT BOOKING ---
  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const duration = checkOut && checkIn ? checkOut.diff(checkIn, 'days') : 0;
    const wholesalerId = getWholesalerId();
    const currentCurrency = currency || 'AED';
    const finalTotalPrice = parseFloat(totalPrice) || 0;
    const finalSupplierPrice = parseFloat(supplierPrice) || 0;
    const finalCommissionValue = parseFloat(commission) || 0;

    const formattedPolicies = cancellationPolicies
      .filter(p => p.date && p.price)
      .map(p => {
          return {
              type: p.type,
              date: p.date!.toISOString(),
              charge: {
                  value: finalTotalPrice,
                  currency: currentCurrency,
                  components: {
                      net: {
                          value: finalSupplierPrice,
                          currency: currentCurrency
                      },
                      commission: {
                          value: finalCommissionValue,
                          currency: currentCurrency
                      },
                      selling: {
                          value: finalSupplierPrice,
                          currency: currentCurrency
                      }
                  }
              }
          };
      });

    const cancellationPolicyPayload = {
      date: paymentDeadline ? paymentDeadline.toISOString() : null,
      policies: formattedPolicies,
    };

    const payload = {
      hotel: {
        name: selectedHotelDetails?.name || 'Grand Palace Hotel Dubai',
        stars: selectedHotelDetails?.stars || 5,
        city: selectedHotelDetails?.location?.city || 'Dubai',
        country: selectedHotelDetails?.location?.countryCode || 'AE',
      },
      serviceDates: {
        startDate: checkIn ? checkIn.toISOString() : null,
        endDate: checkOut ? checkOut.toISOString() : null,
        duration: duration,
        durationType: 'nights',
      },
      rooms: rooms.map(room => {
        const roomOriginalPrice = parseFloat(room.price) || 0;

        return {
          name: room.roomName,
          board: room.board,
          status: reservationStatus || 'pending', 
          providerType: supplierType,
          provider: supplierCode || "685c3b910f8ec655c1330cc0",
          price: {
            value: finalTotalPrice.toFixed(2),
            currency: currentCurrency,
          },
          roomPriceDetails: {
            price: { value: finalTotalPrice.toFixed(2), currency: currentCurrency },
            originalPrice: { value: roomOriginalPrice, currency: currentCurrency },
          },
          guests: room.travellers.map((t, index) => ({
            firstName: t.firstName,
            lastName: t.lastName,
            email: `${t.firstName || 'guest'}.${t.lastName || index}@example.com`,
            type: t.type,
            lead: index === 0,
            nationality: t.nationality,
          })),
          cancellationPolicy: cancellationPolicyPayload,
        };
      }),
      agency: selectedAgencyId,
      wholesaler: wholesalerId,
      bookingType: paymentMethod,
      priceDetails: {
        price: { value: finalTotalPrice, currency: currentCurrency },
        originalPrice: { value: finalSupplierPrice, currency: currentCurrency },
        markupApplied: { type: 'fixed', value: parseFloat(markup) || 0, description: 'Fixed markup applied' },
      },
    };

    try {
      const axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
      });
      const response = await axiosInstance.post('/booking/manual-reservation', payload);
      
      console.log('Reservation created successfully:', response.data);
      setBookingSuccessData(response.data.data);
      setIsPreviewModalOpen(false);

    } catch (error) {
      console.error('Failed to create reservation:', error);
      const errorMessage = (error as any).response?.data?.message || 'An unexpected error occurred.';
      setSubmitError(`Failed to create reservation: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- BUTTON DISABLED LOGIC ---
  const isCreateReservationDisabled = isSubmitting || !paymentMethod || !totalPrice || parseFloat(totalPrice) <= 0;


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Head>
        <title>{bookingSuccessData ? 'Booking Confirmed' : 'Manual Reservation'}</title>
      </Head>

      {bookingSuccessData ? (
        <BookingSuccess
          data={bookingSuccessData}
          onBookAgain={handleBookAgain}
          onDownloadVoucher={handleDownloadVoucher}
          onDownloadInvoice={handleDownloadInvoice}
          isDownloadingVoucher={isDownloadingVoucher}
          isDownloadingInvoice={isDownloadingInvoice}
        />
      ) : (
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
                            setSelectedHotelDetails={setSelectedHotelDetails as any}
                            checkIn={checkIn}
                            setCheckIn={setCheckIn}
                            checkOut={checkOut}
                            setCheckOut={setCheckOut}
                        />
                    </div>

                    <ExternalDetails
                        externalId={externalId} setExternalId={setExternalId}
                        reservationStatus={reservationStatus} setReservationStatus={setReservationStatus}
                        supplierName={supplierName} setSupplierName={setSupplierName}
                        currency={currency} setCurrency={setCurrency}
                        supplierCode={supplierCode} setSupplierCode={setSupplierCode}
                        backofficeRef={backofficeRef} setBackofficeRef={setBackofficeRef}
                        agentRef={agentRef} setAgentRef={setAgentRef}
                        supplierConfirmation={supplierConfirmation} setSupplierConfirmation={setSupplierConfirmation}
                        currencies={currencies}
                        setSupplierType={setSupplierType}
                    />

                    <Travellers
                        rooms={rooms} handleAddRoom={handleAddRoom}
                        handleRemoveRoom={handleRemoveRoom} handleRoomChange={handleRoomChange}
                        handleAddTraveller={handleAddTraveller} handleRemoveTraveller={handleRemoveTraveller}
                        handleTravellerChange={handleTravellerChange}
                        apiRoomTypes={apiRoomTypes}
                        isRoomDataLoading={isRoomDataLoading}
                    />

                    <PriceInformation
                        supplierPrice={supplierPrice} markup={markup} setMarkup={setMarkup}
                        commission={commission} setCommission={setCommission} totalPrice={totalPrice}
                    />

                    <CancellationPolicy
                        policies={cancellationPolicies} setPolicies={setCancellationPolicies}
                        totalPrice={totalPrice}
                        currency={currency}
                    />
                    <BackofficeRemarks
                        addedRemarks={addedRemarks} setAddedRemarks={setAddedRemarks}
                        comments={comments} setComments={setComments}
                    />

                    <FormSection title="Payment Method">
                        <RadioGroup
                            aria-label="payment-method" name="payment-method-group"
                            value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <div>
                                <FormControlLabel value="PAYLATER" control={<Radio />} disabled={!paymentDeadline}
                                    label={ <div className="flex items-center gap-2"> <Clock className="h-5 w-5" /> <span>Paylater</span> </div> }
                                />
                                {!paymentDeadline && (
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                                        Paylater option is unavailable because a cancellation deadline has not been set.
                                    </Typography>
                                )}
                                {paymentDeadline && (
                                    <div className="ml-10 mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-900">
                                        <p className="font-semibold"> Please complete payment by {paymentDeadline.format('MMMM D, YYYY, [at] HH:mm:ss')} to secure your booking. </p>
                                        <p className="mt-1"> Unpaid reservation will be automatically canceled after this time. </p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <FormControlLabel
                                    value="CREDIT"
                                    control={<Radio />}
                                    disabled={parseFloat(totalPrice) > agencyData.walletBalance || isConvertingCurrency}
                                    label={
                                        <div className="flex items-center gap-2">
                                            <Wallet className="h-5 w-5" />
                                            <span>
                                                Available credit: <strong>
                                                    {isConvertingCurrency ? 'Converting...' : (
                                                        <>
                                                            {agencyData.walletBalance.toFixed(2)} USD
                                                            {currency && currency !== 'USD' && exchangeRates && (
                                                                <span className="font-normal text-gray-500 ml-1">
                                                                    ({convertedCredit.toFixed(2)} {currency})
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </strong>
                                            </span>
                                        </div>
                                    }
                                />
                            </div>
                        </RadioGroup>
                    </FormSection>

                    <div className="flex justify-end p-6 rounded-xl">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateReservation}
                            disabled={isCreateReservationDisabled}
                        >
                            Create Reservation
                        </Button>
                    </div>
                </main>
            </div>
            <PreviewModal
                isPreviewModalOpen={isPreviewModalOpen} setIsPreviewModalOpen={setIsPreviewModalOpen}
                handleConfirmBooking={handleConfirmBooking} isSubmitting={isSubmitting} submitError={submitError}
                agencyName={agencyName} agencyData={agencyData} selectedHotelDetails={selectedHotelDetails}
                checkIn={checkIn} checkOut={checkOut} externalId={externalId} reservationStatus={reservationStatus}
                supplierName={supplierName} currency={currency} supplierCode={supplierCode} backofficeRef={backofficeRef}
                language={language} agentRef={agentRef} supplierConfirmation={supplierConfirmation} rooms={rooms}
                supplierPrice={supplierPrice} markup={markup} totalPrice={totalPrice} paymentMethod={paymentMethod}
                paymentDeadline={paymentDeadline} cancellationPolicies={cancellationPolicies}
                addedRemarks={addedRemarks} comments={comments}
            />
        </div>
      )}
    </LocalizationProvider>
  );
};

export default ManualReservation;