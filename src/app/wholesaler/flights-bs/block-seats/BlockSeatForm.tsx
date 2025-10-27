// BlockSeatForm.tsx

'use client';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Plane,
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  Package,
  FileText,
  Save,
  ArrowLeftRight,
  ArrowRight,
  Building
} from 'lucide-react';
import { BlockSeat } from './mockData';
import { availableAirlines } from './availableAirlines';
import { countriesAndAirports } from './countriesAndAirports';

interface BlockSeatFormProps {
  blockSeat?: BlockSeat;
  onClose: () => void;
  onSave: (seat: BlockSeat) => void;
}

// Function to fetch authentication token from cookies or local storage
const getAuthToken = () => {
  return document.cookie
    .split('; ')
    .find(r => r.startsWith('authToken='))
    ?.split('=')[1] || localStorage.getItem('authToken');
};

const BlockSeatForm: React.FC<BlockSeatFormProps> = ({ blockSeat, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    airline: blockSeat?.airline.name || '',
    airlineCode: blockSeat?.airline.code || '',
    airlineCountry: blockSeat?.airline.country || '',
    route: {
      from: typeof blockSeat?.route.from === 'string' ? blockSeat.route.from : blockSeat?.route.from?.code || '',
      to: typeof blockSeat?.route.to === 'string' ? blockSeat.route.to : blockSeat?.route.to?.code || '',
      departure: blockSeat?.route.departure || '',
      return: blockSeat?.route.return || '',
      isRoundTrip: blockSeat?.route.isRoundTrip !== undefined ? blockSeat.route.isRoundTrip : true,
    },
    availableDates: blockSeat?.availableDates || [] as { departure: string; return: string; id: string }[],
    pricing: {
      class1: blockSeat?.pricing?.economy || 0,
      class2: blockSeat?.pricing?.business || 0,
      class3: blockSeat?.pricing?.first || 0,
      currency: 'USD',
    },
    supplierCommission: {
      type: 'fixed' as 'fixed' | 'percentage',
      value: blockSeat?.supplierCommission?.value || 0,
    },
    agencyCommission: {
      type: 'fixed' as 'fixed' | 'percentage',
      value: blockSeat?.agencyCommission?.value || 0,
    },
    baggage: {
      checkedBags: blockSeat?.baggage?.checkedBags || 2,
      weight: blockSeat?.baggage?.weight || 23,
      carryOn: blockSeat?.baggage?.carryOn || 7,
    },
    fareRules: {
      templateName: 'Manual Entry', // Set default to 'Manual Entry'
      cancellationFee: blockSeat?.fareRules?.cancellationFee || 0,
      changeFee: blockSeat?.fareRules?.changeFee || 0,
      refundable: blockSeat?.fareRules?.refundable || false,
    },
    availability: {
      class1: {
        total: blockSeat?.availability?.class1?.total || 0,
        booked: blockSeat?.availability?.class1?.booked || 0,
      },
      class2: {
        total: blockSeat?.availability?.class2?.total || 0,
        booked: blockSeat?.availability?.class2?.booked || 0,
      },
      class3: {
        total: blockSeat?.availability?.class3?.total || 0,
        booked: blockSeat?.availability?.class3?.booked || 0,
      },
    },
    status: blockSeat?.status || 'Available',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [airlineSearch, setAirlineSearch] = useState('');
  const [fromCountry, setFromCountry] = useState('');
  const [toCountry, setToCountry] = useState('');
  const [selectedFromAirports, setSelectedFromAirports] = useState<string[]>([]);
  const [selectedToAirports, setSelectedToAirports] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading

  const fareRulesTemplates = [
    {
      name: 'Flexible',
      cancellationFee: 0,
      changeFee: 0,
      refundable: true
    },
    {
      name: 'Semi-Flexible',
      cancellationFee: 50,
      changeFee: 25,
      refundable: true
    },
    {
      name: 'Standard',
      cancellationFee: 100,
      changeFee: 50,
      refundable: false
    },
    {
      name: 'Restricted',
      cancellationFee: 150,
      changeFee: 75,
      refundable: false
    },
    {
      name: 'Non-Refundable',
      cancellationFee: 200,
      changeFee: 100,
      refundable: false
    },
  ];

  // Effect to derive the template name when editing an existing block seat
  useEffect(() => {
    if (blockSeat?.fareRules) {
        const matchingTemplate = fareRulesTemplates.find(t =>
            t.cancellationFee === blockSeat.fareRules.cancellationFee &&
            t.changeFee === blockSeat.fareRules.changeFee &&
            t.refundable === blockSeat.fareRules.refundable
        );
        setFormData(prev => ({
            ...prev,
            fareRules: {
                ...prev.fareRules,
                templateName: matchingTemplate ? matchingTemplate.name : 'Manual Entry',
            }
        }));
    }
  }, [blockSeat]);

  useEffect(() => {
    console.log('📝 Form data updated:', {
      airline: formData.airline,
      from: formData.route.from,
      to: formData.route.to,
      availableDates: formData.availableDates.length,
      pricing: formData.pricing.class1,
      availability: formData.availability.class1.total,
    });
  }, [formData]);

  const baggageWeightOptions = [
    { value: 20, label: '20 kg' },
    { value: 23, label: '23 kg' },
    { value: 25, label: '25 kg' },
    { value: 30, label: '30 kg' },
    { value: 32, label: '32 kg' },
    { value: 40, label: '40 kg' },
  ];

  const [fromCountrySearch, setFromCountrySearch] = useState('');
  const [toCountrySearch, setToCountrySearch] = useState('');

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD' },
    { code: 'IQD', name: 'Iraqi Dinar', symbol: 'IQD' },
    { code: 'OMR', name: 'Omani Rial', symbol: 'OMR' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD' },
    { code: 'LBP', name: 'Lebanese Pound', symbol: 'L£' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  ];

  const getSelectedCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === formData.pricing.currency);
    return currency ? currency.symbol : '';
  };

  const calculateCommission = (
    basePrice: number,
    commission: { type: 'fixed' | 'percentage'; value: number }
  ): number => {
    if (commission.type === 'percentage') {
      return (basePrice * commission.value) / 100;
    }
    return commission.value;
  };

  const calculateNetPrice = (classPrice: number): number => {
    const supplierCommissionAmount = calculateCommission(classPrice, formData.supplierCommission);
    const agencyCommissionAmount = calculateCommission(classPrice, formData.agencyCommission);
    return classPrice - supplierCommissionAmount - agencyCommissionAmount;
  };

  const filteredAirlines = availableAirlines.filter(airline =>
    airline.name.toLowerCase().includes(airlineSearch.toLowerCase()) ||
    airline.code.toLowerCase().includes(airlineSearch.toLowerCase()) ||
    airline.country.toLowerCase().includes(airlineSearch.toLowerCase())
  );

  const filteredFromCountries = countriesAndAirports.filter(c =>
    c.country.toLowerCase().includes(fromCountrySearch.toLowerCase())
  );
  const filteredToCountries = countriesAndAirports.filter(c =>
    c.country.toLowerCase().includes(toCountrySearch.toLowerCase())
  );

  const handleAirlineChange = (airlineName: string) => {
    const airline = availableAirlines.find(a => a.name === airlineName);
    if (airline) {
      setFormData(prev => ({
        ...prev,
        airline: airline.name,
        airlineCode: airline.code,
        airlineCountry: airline.country,
      }));
    }
  };

  const handleFromCountryChange = (country: string) => {
    setFromCountry(country);
    setSelectedFromAirports([]);
  };

  const handleToCountryChange = (country: string) => {
    setToCountry(country);
    setSelectedToAirports([]);
  };

  const toggleFromAirport = (airportCode: string) => {
    setSelectedFromAirports(prev =>
      prev.includes(airportCode)
        ? prev.filter(code => code !== airportCode)
        : [...prev, airportCode]
    );
  };

  const toggleToAirport = (airportCode: string) => {
    setSelectedToAirports(prev =>
      prev.includes(airportCode)
        ? prev.filter(code => code !== airportCode)
        : [...prev, airportCode]
    );
  };

  const getAirportsForCountry = (country: string) => {
    return countriesAndAirports.find(c => c.country === country)?.airports || [];
  };

  const handleDepartureDateChange = (departureDate: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      newData.route.departure = departureDate;
      if (newData.route.isRoundTrip && departureDate) {
        const depDate = new Date(departureDate);
        depDate.setDate(depDate.getDate() + 7);
        newData.route.return = depDate.toISOString().split('T')[0];
      }
      return newData;
    });
  };

  const handleTripTypeChange = (isRoundTrip: boolean) => {
    setFormData(prev => {
      const newData = { ...prev };
      newData.route.isRoundTrip = isRoundTrip;
      if (isRoundTrip && newData.route.departure && !newData.route.return) {
        const depDate = new Date(newData.route.departure);
        depDate.setDate(depDate.getDate() + 7);
        newData.route.return = depDate.toISOString().split('T')[0];
      }
      return newData;
    });
  };

  const handleFareRuleTemplate = (templateName: string) => {
    const template = fareRulesTemplates.find(t => t.name === templateName);
    if (template) {
      setFormData(prev => ({
        ...prev,
        fareRules: {
          templateName: template.name, // Set the template name
          cancellationFee: template.cancellationFee,
          changeFee: template.changeFee,
          refundable: template.refundable,
        },
      }));
    } else {
        // This handles the "Manual Entry (Custom)" selection
        setFormData(prev => ({
            ...prev,
            fareRules: {
                ...prev.fareRules,
                templateName: 'Manual Entry',
            },
        }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.airline) newErrors.airline = 'Please select an airline';
    if (selectedFromAirports.length === 0) newErrors.from = 'Please select at least one departure airport';
    if (selectedToAirports.length === 0) newErrors.to = 'Please select at least one destination airport';
    if (formData.availableDates.length === 0) newErrors.dates = 'Please add at least one available date';
    if (formData.pricing.class1 <= 0) newErrors.class1 = 'Class 1 price must be greater than 0';
    if (formData.availability.class1.total <= 0) newErrors.availability = 'Please set total seats for at least Class 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const fromAirportsData = selectedFromAirports.map(code => {
        const airport = countriesAndAirports
          .flatMap(c => c.airports)
          .find(a => a.code === code);
        const country = countriesAndAirports.find(c =>
          c.airports.some(a => a.code === code)
        );
        return {
          code: airport?.code || code,
          city: airport?.city || code,
          country: country?.country || '',
          flag: country?.flag || ''
        };
      });

    const toAirportsData = selectedToAirports.map(code => {
        const airport = countriesAndAirports
          .flatMap(c => c.airports)
          .find(a => a.code === code);
        const country = countriesAndAirports.find(c =>
          c.airports.some(a => a.code === code)
        );
        return {
          code: airport?.code || code,
          city: airport?.city || code,
          country: country?.country || '',
          flag: country?.flag || ''
        };
      });

    // Map form data to the API payload structure
    const classesPayload = [];
    if (formData.pricing.class1 > 0 && formData.availability.class1.total > 0) {
        classesPayload.push({ classId: 1, totalSeats: formData.availability.class1.total, price: formData.pricing.class1 });
    }
    if (formData.pricing.class2 > 0 && formData.availability.class2.total > 0) {
        classesPayload.push({ classId: 2, totalSeats: formData.availability.class2.total, price: formData.pricing.class2 });
    }
    if (formData.pricing.class3 > 0 && formData.availability.class3.total > 0) {
        classesPayload.push({ classId: 3, totalSeats: formData.availability.class3.total, price: formData.pricing.class3 });
    }

    const apiPayload = {
      name: `${fromAirportsData[0]?.city || 'Departure'} to ${toAirportsData[0]?.city || 'Destination'} ${formData.route.isRoundTrip ? 'Round Trip' : 'One Way'}`,
      airline: {
        code: formData.airlineCode,
        name: formData.airline,
        country: formData.airlineCountry,
      },
      route: {
        from: {
          country: fromAirportsData[0]?.country || '',
          iataCode: fromAirportsData[0]?.code || '',
        },
        to: {
          country: toAirportsData[0]?.country || '',
          iataCode: toAirportsData[0]?.code || '',
        },
        tripType: formData.route.isRoundTrip ? 'ROUND_TRIP' : 'ONE_WAY',
      },
      availableDates: formData.availableDates.map(d => ({
        departureDate: d.departure,
        returnDate: formData.route.isRoundTrip ? d.return : null,
      })),
      classes: classesPayload,
      currency: formData.pricing.currency,
      status: formData.status,
      fareRules: {
        template: formData.fareRules.templateName.toUpperCase().replace(/[-\s]/g, '_'),
        refundable: formData.fareRules.refundable,
        changeFee: formData.fareRules.changeFee,
        cancellationFee: formData.fareRules.cancellationFee,
      },
      baggageAllowance: {
        checkedBags: formData.baggage.checkedBags,
        weightPerBag: `${formData.baggage.weight}kg`,
        carryOnWeight: `${formData.baggage.carryOn}kg`,
      },
      commission: {
        supplierCommission: {
          type: formData.supplierCommission.type === 'fixed' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
          value: formData.supplierCommission.value,
        },
        agencyCommission: {
          type: formData.agencyCommission.type === 'fixed' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
          value: formData.agencyCommission.value,
        },
      },
      remarks: `Block seat from ${fromAirportsData.map(a => a.code).join(', ')} to ${toAirportsData.map(a => a.code).join(', ')}`,
    };

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_FLIGHT_URL}block-seats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create block seat. Please check server logs.' }));
        throw new Error(errorData.message || 'An unknown error occurred.');
      }

      const responseData = await response.json();
      console.log('API Success:', responseData);

      // Construct the data for the local state update (onSave)
      const priceClasses = [
        {
          classType: 'Economy' as const,
          price: formData.pricing.class1,
          availableSeats: formData.availability.class1.total - formData.availability.class1.booked,
          totalSeats: formData.availability.class1.total,
          baggageAllowance: { checkedBag: `${formData.baggage.checkedBags}x${formData.baggage.weight}kg`, handBag: `${formData.baggage.carryOn}kg`, weight: `${formData.baggage.weight}kg total` },
          fareRules: { refundable: formData.fareRules.refundable, changeable: true, changeFee: formData.fareRules.changeFee, cancellationFee: formData.fareRules.cancellationFee }
        },
        {
          classType: 'Business' as const,
          price: formData.pricing.class2,
          availableSeats: formData.availability.class2.total - formData.availability.class2.booked,
          totalSeats: formData.availability.class2.total,
          baggageAllowance: { checkedBag: `${formData.baggage.checkedBags}x${formData.baggage.weight + 9}kg`, handBag: `${formData.baggage.carryOn + 5}kg`, weight: `${formData.baggage.weight + 9}kg total` },
          fareRules: { refundable: formData.fareRules.refundable, changeable: true, changeFee: formData.fareRules.changeFee, cancellationFee: formData.fareRules.cancellationFee }
        },
        {
          classType: 'First' as const,
          price: formData.pricing.class3,
          availableSeats: formData.availability.class3.total - formData.availability.class3.booked,
          totalSeats: formData.availability.class3.total,
          baggageAllowance: { checkedBag: `${formData.baggage.checkedBags}x${formData.baggage.weight + 17}kg`, handBag: `${formData.baggage.carryOn + 8}kg`, weight: `${formData.baggage.weight + 17}kg total` },
          fareRules: { refundable: formData.fareRules.refundable, changeable: true, changeFee: formData.fareRules.changeFee, cancellationFee: formData.fareRules.cancellationFee }
        }
      ];

      const firstAvailableDate = formData.availableDates[0];
      const newBlockSeat = {
        id: blockSeat?.id || responseData?.id || Date.now().toString(), // Use ID from response if available
        airline: {
          name: formData.airline,
          code: formData.airlineCode,
          country: formData.airlineCountry,
          logo: availableAirlines.find(a => a.name === formData.airline)?.logo || 'https://images.kiwi.com/airlines/64/XX.png',
          flagCode: formData.airlineCountry || 'XX'
        },
        flightNumber: `${formData.airlineCode}${Math.floor(Math.random() * 9000) + 1000}`,
        route: {
          from: fromAirportsData,
          to: toAirportsData,
          departure: firstAvailableDate?.departure || '',
          return: firstAvailableDate?.return || '',
          isRoundTrip: formData.route.isRoundTrip
        },
        departureDate: firstAvailableDate?.departure || new Date().toISOString().split('T')[0],
        departureTime: '14:30',
        arrivalTime: '17:45',
        duration: '3h 15m',
        aircraft: 'Boeing 737-800',
        priceClasses: priceClasses,
        pricing: {
          economy: formData.pricing.class1,
          business: formData.pricing.class2,
          first: formData.pricing.class3
        },
        baggage: formData.baggage,
        fareRules: formData.fareRules,
        availability: formData.availability,
        availableDates: formData.availableDates,
        supplierCommission: formData.supplierCommission,
        agencyCommission: formData.agencyCommission,
        status: formData.status,
        createdAt: blockSeat?.createdAt || new Date().toISOString().split('T')[0],
        validUntil: blockSeat?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
      } as BlockSeat;

      onSave(newBlockSeat);
      onClose();

    } catch (error) {
      console.error('API Error:', error);
      alert(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {blockSeat ? 'Edit Block Seat' : 'Add New Block Seat'}
                </h2>
                <p className="text-sm text-blue-100 mt-1">
                  Fill in the flight details below
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
        <div className="p-8 space-y-6">
          {/* Airline Selection */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-blue-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-blue-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-3 shadow-md">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Airline Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Select Airline *
                </label>
                <div className="relative mb-3">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search airline, code, or country..."
                    value={airlineSearch}
                    onChange={(e) => setAirlineSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all text-base"
                  />
                </div>
                <select
                  value={formData.airline}
                  onChange={(e) => handleAirlineChange(e.target.value)}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all text-base font-medium ${errors.airline ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                >
                  <option value="">Choose an airline...</option>
                  {filteredAirlines.length === 0 ? (
                    <option disabled>No airlines match your search</option>
                  ) : (
                    filteredAirlines.map((airline) => (
                      <option key={airline.code} value={airline.name}>
                        {airline.name} ({airline.code}) - {airline.country}
                      </option>
                    ))
                  )}
                </select>
                {errors.airline && (
                  <p className="text-red-500 text-sm mt-2 font-medium">{errors.airline}</p>
                )}
                {formData.airline && (
                  <div className="mt-4 flex items-center space-x-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-md">
                    <img
                      src={availableAirlines.find(a => a.name === formData.airline)?.logo}
                      alt={formData.airline}
                      className="w-16 h-16 object-contain bg-white rounded-xl p-2 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMzIgMjBMMjAgMzJMMzIgNDRMNDQgMzJMMzIgMjBaIiBmaWxsPSIjOUM5Q0EzIi8+PC9zdmc+';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">{formData.airline}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        Code: {formData.airlineCode} • {formData.airlineCountry}
                      </p>
                    </div>
                    <CheckCircle className="w-7 h-7 text-green-500" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Airline Code
                </label>
                <input
                  type="text"
                  value={formData.airlineCode}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300"
                />
              </div>
            </div>
          </div>
          {/* Route Information */}
          <div className="bg-gradient-to-br from-green-50 via-white to-green-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-green-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-green-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-3 shadow-md">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Route Information
              </h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trip Type *
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleTripTypeChange(true)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    formData.route.isRoundTrip
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowLeftRight className="w-5 h-5" />
                    <span className="font-semibold">Round Trip</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    🔥 Return automatically calculated
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleTripTypeChange(false)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    !formData.route.isRoundTrip
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowRight className="w-5 h-5" />
                    <span className="font-semibold">One Way</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Single direction</p>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200">
                  From (Departure) * {fromCountry && countriesAndAirports.find(c => c.country === fromCountry)?.flag}
                </label>
                <input
                  type="text"
                  placeholder="Search country..."
                  value={fromCountrySearch}
                  onChange={(e) => setFromCountrySearch(e.target.value)}
                  className="w-full px-4 py-2 mb-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm"
                />
                <select
                  value={fromCountry}
                  onChange={(e) => handleFromCountryChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                >
                  <option value="">Select departure country...</option>
                  {filteredFromCountries.map((country) => (
                    <option key={country.country} value={country.country}>
                      {country.flag} {country.country}
                    </option>
                  ))}
                </select>
                {fromCountry && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Select Airports:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                      {getAirportsForCountry(fromCountry).map((airport) => (
                        <label
                          key={airport.code}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                            selectedFromAirports.includes(airport.code)
                              ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                              : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-green-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFromAirports.includes(airport.code)}
                            onChange={() => toggleFromAirport(airport.code)}
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="ml-3 font-medium text-gray-900 dark:text-white">
                            {airport.city} ({airport.code})
                          </span>
                          {selectedFromAirports.includes(airport.code) && (
                            <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                    {selectedFromAirports.length > 0 && (
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedFromAirports.map(code => {
                            const airport = getAirportsForCountry(fromCountry).find(a => a.code === code);
                            return (
                              <span key={code} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-semibold">
                                {airport?.city} ({code})
                              </span>
                            );
                          })}
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                          <Info className="w-3 h-3 mr-1" />
                          These airports will appear in frontend search results
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {errors.from && (
                  <p className="text-red-500 text-sm font-medium">{errors.from}</p>
                )}
              </div>
              <div className="space-y-4">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200">
                  To (Destination) * {toCountry && countriesAndAirports.find(c => c.country === toCountry)?.flag}
                </label>
                <input
                  type="text"
                  placeholder="Search country..."
                  value={toCountrySearch}
                  onChange={(e) => setToCountrySearch(e.target.value)}
                  className="w-full px-4 py-2 mb-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm"
                />
                <select
                  value={toCountry}
                  onChange={(e) => handleToCountryChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-base font-medium"
                >
                  <option value="">Select destination country...</option>
                  {filteredToCountries.map((country) => (
                    <option key={country.country} value={country.country}>
                      {country.flag} {country.country}
                    </option>
                  ))}
                </select>
                {toCountry && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Select Airports:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                      {getAirportsForCountry(toCountry).map((airport) => (
                        <label
                          key={airport.code}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                            selectedToAirports.includes(airport.code)
                              ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                              : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-green-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedToAirports.includes(airport.code)}
                            onChange={() => toggleToAirport(airport.code)}
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="ml-3 font-medium text-gray-900 dark:text-white">
                            {airport.city} ({airport.code})
                          </span>
                          {selectedToAirports.includes(airport.code) && (
                            <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                    {selectedToAirports.length > 0 && (
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedToAirports.map(code => {
                            const airport = getAirportsForCountry(toCountry).find(a => a.code === code);
                            return (
                              <span key={code} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-semibold">
                                {airport?.city} ({code})
                              </span>
                            );
                          })}
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                          <Info className="w-3 h-3 mr-1" />
                          These airports will appear in frontend search results
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {errors.to && (
                  <p className="text-red-500 text-sm font-medium">{errors.to}</p>
                )}
              </div>
            </div>
            <div className="mt-8 pt-8 border-t-2 border-green-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  📅 Available Flight Dates
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    if (showDatePicker && formData.route.departure && (!formData.route.isRoundTrip || formData.route.return)) {
                      const newDate = {
                        id: Date.now().toString(),
                        departure: formData.route.departure,
                        return: formData.route.isRoundTrip ? formData.route.return : ''
                      };
                      setFormData(prev => ({
                        ...prev,
                        availableDates: [...prev.availableDates, newDate],
                        route: { ...prev.route, departure: '', return: '' }
                      }));
                      setShowDatePicker(false);
                    } else {
                      setShowDatePicker(!showDatePicker);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center shadow-md"
                >
                  {showDatePicker ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {formData.route.departure && (!formData.route.isRoundTrip || formData.route.return) ? 'Save Date' : 'Close'}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Date
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {showDatePicker
                  ? 'Select departure and return dates below, then click "Save Date" to add them to the list.'
                  : 'Click "Add Date" button to add new available flight dates. Only these dates will be available for booking.'
                }
              </p>
              {errors.dates && formData.availableDates.length === 0 && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <p className="text-red-600 dark:text-red-400 font-semibold text-sm">{errors.dates}</p>
                </div>
              )}
              {showDatePicker && (
                <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <h5 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                    Select Flight Dates
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                        Departure Date *
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={formData.route.departure ? new Date(formData.route.departure) : null}
                          onChange={(date) => {
                            const dateString = date ? date.toISOString().split('T')[0] : '';
                            setFormData(prev => ({ ...prev, route: { ...prev.route, departure: dateString } }));
                          }}
                          minDate={new Date()}
                          dateFormat="MMMM d, yyyy"
                          placeholderText="Select departure date"
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm cursor-pointer border-gray-300 dark:border-gray-600"
                          wrapperClassName="w-full"
                          showPopperArrow={false}
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                        />
                      </div>
                    </div>
                    {formData.route.isRoundTrip && (
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                          Return Date *
                        </label>
                        <div className="relative">
                          <DatePicker
                            selected={formData.route.return ? new Date(formData.route.return) : null}
                            onChange={(date) => {
                              const dateString = date ? date.toISOString().split('T')[0] : '';
                              setFormData(prev => ({ ...prev, route: { ...prev.route, return: dateString } }));
                            }}
                            minDate={formData.route.departure ? new Date(formData.route.departure) : new Date()}
                            dateFormat="MMMM d, yyyy"
                            placeholderText="Select return date"
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 transition-all text-sm cursor-pointer border-gray-300 dark:border-gray-600"
                            wrapperClassName="w-full"
                            showPopperArrow={false}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {formData.availableDates.length > 0 ? (
                <div className="space-y-3">
                  {formData.availableDates.map((dateItem, index) => (
                    <div
                      key={dateItem.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-green-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-6">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          #{index + 1}
                        </span>
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Departure</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white">
                              {new Date(dateItem.departure).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Return</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white">
                              {new Date(dateItem.return).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            availableDates: prev.availableDates.filter(d => d.id !== dateItem.id)
                          }));
                        }}
                        className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-all"
                        title="Remove this date"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    No available dates added yet
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Select dates above and click "Add Date" to add available flight dates
                  </p>
                </div>
              )}
              {formData.availableDates.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-medium flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Total available flight dates: <span className="font-bold ml-1">{formData.availableDates.length}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Pricing */}
          <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-yellow-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-yellow-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl mr-3 shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pricing
              </h3>
            </div>
            <div className="mb-6">
              <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Currency *
              </label>
              <select
                value={formData.pricing.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, currency: e.target.value } }))}
                className="w-full md:w-1/2 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition-all text-base font-medium"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Class 1 * {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                </label>
                <input
                  type="number"
                  value={formData.pricing.class1}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, class1: Number(e.target.value) } }))}
                  onWheel={(e) => e.currentTarget.blur()}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition-all text-base font-medium border-gray-200 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Class 2 {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                </label>
                <input
                  type="number"
                  value={formData.pricing.class2}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, class2: Number(e.target.value) } }))}
                  onWheel={(e) => e.currentTarget.blur()}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="e.g., 1250"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Class 3 {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                </label>
                <input
                  type="number"
                  value={formData.pricing.class3}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, class3: Number(e.target.value) } }))}
                  onWheel={(e) => e.currentTarget.blur()}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="e.g., 2000"
                />
              </div>
            </div>
          </div>
          {/* Baggage */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-purple-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-3 shadow-md">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Baggage Allowance
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Number of Checked Bags
                </label>
                <select
                  value={formData.baggage.checkedBags}
                  onChange={(e) => setFormData(prev => ({ ...prev, baggage: { ...prev.baggage, checkedBags: Number(e.target.value) } }))}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                >
                  <option value="0">0 Bags</option>
                  <option value="1">1 Bag</option>
                  <option value="2">2 Bags</option>
                  <option value="3">3 Bags</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Weight per Bag
                </label>
                <select
                  value={formData.baggage.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, baggage: { ...prev.baggage, weight: Number(e.target.value) } }))}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                >
                  {baggageWeightOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Carry-on Weight
                </label>
                <select
                  value={formData.baggage.carryOn}
                  onChange={(e) => setFormData(prev => ({ ...prev, baggage: { ...prev.baggage, carryOn: Number(e.target.value) } }))}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                >
                  <option value="0">0 kg</option>
                  <option value="5">5 kg</option>
                  <option value="7">7 kg</option>
                  <option value="8">8 kg</option>
                  <option value="10">10 kg</option>
                </select>
              </div>
            </div>
          </div>
          {/* Fare Rules */}
          <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-orange-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-orange-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mr-3 shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Fare Rules
              </h3>
            </div>
            <div className="mb-6">
              <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                📋 Select Standard Template or Manual Entry
              </label>
              <select
                value={formData.fareRules.templateName === 'Manual Entry' ? '' : formData.fareRules.templateName}
                onChange={(e) => handleFareRuleTemplate(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all text-base font-medium"
              >
                <option value="">Manual Entry (Custom)</option>
                {fareRulesTemplates.map((template) => (
                  <option key={template.name} value={template.name}>
                    {template.name} - {template.refundable ? '✓ Refundable' : '✗ Non-Refundable'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Select a template to apply standard rules, or keep "Manual Entry" to customize all fields
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Cancellation Fee {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                </label>
                <input
                  type="number"
                  value={formData.fareRules.cancellationFee}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fareRules: { ...prev.fareRules, cancellationFee: Number(e.target.value), templateName: 'Manual Entry' }
                  }))}
                  onWheel={(e) => e.currentTarget.blur()}
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="e.g., 100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Fee charged if the booking is cancelled (0 = Free cancellation)
                </p>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Change Fee {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                </label>
                <input
                  type="number"
                  value={formData.fareRules.changeFee}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fareRules: { ...prev.fareRules, changeFee: Number(e.target.value), templateName: 'Manual Entry' }
                  }))}
                  onWheel={(e) => e.currentTarget.blur()}
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="e.g., 50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Fee charged for date/time changes (0 = Free changes)
                </p>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Refundable Status
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      fareRules: { ...prev.fareRules, refundable: true, templateName: 'Manual Entry' }
                    }))}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                      formData.fareRules.refundable
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    ✓ Refundable
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      fareRules: { ...prev.fareRules, refundable: false, templateName: 'Manual Entry' }
                    }))}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                      !formData.fareRules.refundable
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    ✗ Non-Refundable
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                <h4 className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-3">
                  📜 Current Fare Rules Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cancellation Fee:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {getSelectedCurrencySymbol()} {formData.fareRules.cancellationFee}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Change Fee:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {getSelectedCurrencySymbol()} {formData.fareRules.changeFee}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Refundable:</span>
                    <span className={`font-bold ${formData.fareRules.refundable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formData.fareRules.refundable ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Commission */}
          <div className="bg-gradient-to-br from-teal-50 via-white to-teal-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-teal-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-teal-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl mr-3 shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Commission
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Supplier Commission
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Commission from airlines (deducted from net cost)
                </p>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      supplierCommission: { ...prev.supplierCommission, type: 'fixed' }
                    }))}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.supplierCommission.type === 'fixed'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    💵 Fixed Amount
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      supplierCommission: { ...prev.supplierCommission, type: 'percentage' }
                    }))}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.supplierCommission.type === 'percentage'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    📊 Percentage
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.supplierCommission.value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      supplierCommission: { ...prev.supplierCommission, value: Number(e.target.value) }
                    }))}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="0.01"
                    max={formData.supplierCommission.type === 'percentage' ? 100 : undefined}
                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder={formData.supplierCommission.type === 'percentage' ? 'e.g., 10' : 'e.g., 50'}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                    {formData.supplierCommission.type === 'percentage' ? '%' : getSelectedCurrencySymbol()}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Agency Commission
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Commission to agencies (deducted from markup/sale price)
                </p>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      agencyCommission: { ...prev.agencyCommission, type: 'fixed' }
                    }))}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.agencyCommission.type === 'fixed'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    💵 Fixed Amount
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      agencyCommission: { ...prev.agencyCommission, type: 'percentage' }
                    }))}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.agencyCommission.type === 'percentage'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    📊 Percentage
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.agencyCommission.value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      agencyCommission: { ...prev.agencyCommission, value: Number(e.target.value) }
                    }))}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="0.01"
                    max={formData.agencyCommission.type === 'percentage' ? 100 : undefined}
                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder={formData.agencyCommission.type === 'percentage' ? 'e.g., 15' : 'e.g., 75'}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                    {formData.agencyCommission.type === 'percentage' ? '%' : getSelectedCurrencySymbol()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Availability */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-indigo-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-indigo-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mr-3 shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Availability & Bookings
              </h3>
            </div>
            <div className="space-y-8">
              <div className="p-6 bg-white dark:bg-gray-800/50 rounded-xl border-2 border-indigo-100 dark:border-gray-700">
                <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  Class 1
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Total Seats Available *
                    </label>
                    <input
                      type="number"
                      value={formData.availability.class1.total}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        availability: {
                          ...prev.availability,
                          class1: { ...prev.availability.class1, total: Number(e.target.value) }
                        }
                      }))}
                      onWheel={(e) => e.currentTarget.blur()}
                      min="0"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="e.g., 50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Already Booked (Auto)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.availability.class1.booked}
                        readOnly
                        disabled
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium cursor-not-allowed text-gray-600 dark:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Info className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Auto-calculated from frontend bookings
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Available: {formData.availability.class1.total - formData.availability.class1.booked} seats
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Total Amount Booked
                    </label>
                    <div className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg">
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {getSelectedCurrencySymbol()} {(calculateNetPrice(formData.pricing.class1) * formData.availability.class1.booked).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">After commissions</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800/50 rounded-xl border-2 border-indigo-100 dark:border-gray-700">
                <h4 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center">
                  <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                  Class 2
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Total Seats Available *
                    </label>
                    <input
                      type="number"
                      value={formData.availability.class2.total}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        availability: {
                          ...prev.availability,
                          class2: { ...prev.availability.class2, total: Number(e.target.value) }
                        }
                      }))}
                      onWheel={(e) => e.currentTarget.blur()}
                      min="0"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="e.g., 30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Already Booked (Auto)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.availability.class2.booked}
                        readOnly
                        disabled
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium cursor-not-allowed text-gray-600 dark:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Info className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Auto-calculated from frontend bookings
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Available: {formData.availability.class2.total - formData.availability.class2.booked} seats
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Total Amount Booked
                    </label>
                    <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg">
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {getSelectedCurrencySymbol()} {(calculateNetPrice(formData.pricing.class2) * formData.availability.class2.booked).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">After commissions</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800/50 rounded-xl border-2 border-indigo-100 dark:border-gray-700">
                <h4 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center">
                  <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                  Class 3
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Total Seats Available *
                    </label>
                    <input
                      type="number"
                      value={formData.availability.class3.total}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        availability: {
                          ...prev.availability,
                          class3: { ...prev.availability.class3, total: Number(e.target.value) }
                        }
                      }))}
                      onWheel={(e) => e.currentTarget.blur()}
                      min="0"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="e.g., 20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Already Booked (Auto)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.availability.class3.booked}
                        readOnly
                        disabled
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium cursor-not-allowed text-gray-600 dark:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Info className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Auto-calculated from frontend bookings
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Available: {formData.availability.class3.total - formData.availability.class3.booked} seats
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Total Amount Booked
                    </label>
                    <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {getSelectedCurrencySymbol()} {(calculateNetPrice(formData.pricing.class3) * formData.availability.class3.booked).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">After commissions</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                <h4 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">
                  📊 Total Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Seats</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {formData.availability.class1.total + formData.availability.class2.total + formData.availability.class3.total}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Booked</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {formData.availability.class1.booked + formData.availability.class2.booked + formData.availability.class3.booked}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {getSelectedCurrencySymbol()} {(
                        (calculateNetPrice(formData.pricing.class1) * formData.availability.class1.booked) +
                        (calculateNetPrice(formData.pricing.class2) * formData.availability.class2.booked) +
                        (calculateNetPrice(formData.pricing.class3) * formData.availability.class3.booked)
                      ).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">After all commissions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl mr-3 shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Status
              </h3>
            </div>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full md:w-1/2 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-gray-500 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-900 transition-all text-base font-medium"
            >
              <option value="Available">Available</option>
              <option value="Limited">Limited</option>
              <option value="Sold Out">Sold Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-t-2 border-gray-200 dark:border-gray-700 p-8 rounded-b-xl flex justify-between items-center">
          <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
            * Required fields
          </p>
          <div className="flex space-x-4">
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="px-8 py-3.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer select-none"
              style={{ userSelect: 'none' }}
            >
              Cancel
            </div>
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isSubmitting) {
                  handleSubmit();
                }
              }}
              className={`px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ userSelect: 'none', pointerEvents: isSubmitting ? 'none' : 'auto' }}
            >
              <Save className="w-5 h-5 mr-2 pointer-events-none" />
              <span className="pointer-events-none">
                {isSubmitting ? (blockSeat ? 'Updating...' : 'Creating...') : (blockSeat ? 'Update Block Seat' : 'Create Block Seat')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockSeatForm;