// BlockSeatForm.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Plane, Save, X } from 'lucide-react';
import { BlockSeat } from './mockData';
import { availableAirlines } from './availableAirlines';
import { countriesAndAirports } from './countriesAndAirports';

// Import the new components
import AirlineInformation from './components/AirlineInformation';
import RouteInformation from './components/RouteInformation';
import AvailableFlightDates from './components/AvailableFlightDates';
import Pricing from './components/Pricing';
import BaggageAllowance from './components/BaggageAllowance';
import FareRules from './components/FareRules';
import Commission from './components/Commission';
import AvailabilityBookings from './components/AvailabilityBookings';
import Status from './components/Status';

interface BlockSeatFormProps {
    blockSeat?: BlockSeat; // This type must now match your new response structure
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

// Helper function to find differences between two objects for the PATCH payload
const getUpdatedFields = (original: any, current: any): any => {
    const changes: { [key: string]: any } = {};

    if (!original) return current;

    Object.keys(current).forEach(key => {
        const originalValue = original[key];
        const currentValue = current[key];

        if (!original.hasOwnProperty(key)) {
            changes[key] = currentValue;
            return;
        }

        if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue) &&
            typeof originalValue === 'object' && originalValue !== null && !Array.isArray(originalValue)) {
            const nestedChanges = getUpdatedFields(originalValue, currentValue);
            if (Object.keys(nestedChanges).length > 0) {
                changes[key] = nestedChanges;
            }
        }
        else if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
            changes[key] = currentValue;
        }
    });

    return changes;
};


const BlockSeatForm: React.FC<BlockSeatFormProps> = ({ blockSeat, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        airline: blockSeat?.airline.name || '',
        airlineCode: blockSeat?.airline.code || '',
        airlineCountry: blockSeat?.airline.country || '',
        route: {
            // Updated to handle array or object from (for mockData compatibility)
            from: (Array.isArray((blockSeat as any)?.route?.from) && (blockSeat as any).route.from.length > 0)
                ? (blockSeat as any).route.from[0].code
                : (typeof blockSeat?.route.from === 'string' ? blockSeat.route.from : (blockSeat?.route.from as any)?.iataCode || (blockSeat?.route.from as any)?.code || ''),
            to: (Array.isArray((blockSeat as any)?.route?.to) && (blockSeat as any).route.to.length > 0)
                ? (blockSeat as any).route.to[0].code
                : (typeof blockSeat?.route.to === 'string' ? blockSeat.route.to : (blockSeat?.route.to as any)?.iataCode || (blockSeat?.route.to as any)?.code || ''),
            departure: blockSeat?.route.departure || '',
            return: blockSeat?.route.return || '',
            isRoundTrip: blockSeat?.route.isRoundTrip !== undefined ? blockSeat.route.isRoundTrip : (blockSeat as any)?.route?.tripType === 'ROUND_TRIP' || true,
        },
        availableDates: blockSeat?.availableDates || [] as { departure: string; return: string; id: string }[],
        pricing: {
            // Use new pricing object OR fall back to priceClasses
            class1: blockSeat?.pricing?.economy || (blockSeat as any)?.priceClasses?.find((c: any) => c.classType === 'Economy')?.price || (blockSeat as any)?.classes?.find((c: any) => c.classId === 1)?.price || 0,
            class2: blockSeat?.pricing?.business || (blockSeat as any)?.priceClasses?.find((c: any) => c.classType === 'Business')?.price || (blockSeat as any)?.classes?.find((c: any) => c.classId === 2)?.price || 0,
            class3: blockSeat?.pricing?.first || (blockSeat as any)?.priceClasses?.find((c: any) => c.classType === 'First')?.price || (blockSeat as any)?.classes?.find((c: any) => c.classId === 3)?.price || 0,
            currency: (blockSeat as any)?.currency || 'USD',
        },
        supplierCommission: {
            type: (blockSeat as any)?.commission?.supplierCommission?.type === 'PERCENTAGE' ? 'percentage' : 'fixed' as 'fixed' | 'percentage',
            value: (blockSeat as any)?.commission?.supplierCommission?.value || 0,
        },
        agencyCommission: {
            type: (blockSeat as any)?.commission?.agencyCommission?.type === 'PERCENTAGE' ? 'percentage' : 'fixed' as 'fixed' | 'percentage',
            value: (blockSeat as any)?.commission?.agencyCommission?.value || 0,
        },
        baggage: {
            checkedBags: (blockSeat as any)?.baggage?.checkedBags || (blockSeat as any)?.baggageAllowance?.checkedBags || 2,
            weight: (blockSeat as any)?.baggage?.weight || parseInt((blockSeat as any)?.baggageAllowance?.weightPerBag) || 23,
            carryOn: (blockSeat as any)?.baggage?.carryOn || parseInt((blockSeat as any)?.baggageAllowance?.carryOnWeight) || 7,
        },
        fareRules: {
            templateName: (blockSeat as any)?.fareRules?.template || 'Manual Entry',
            cancellationFee: (blockSeat as any)?.fareRules?.cancellationFee || 0,
            changeFee: (blockSeat as any)?.fareRules?.changeFee || 0,
            refundable: (blockSeat as any)?.fareRules?.refundable || false,
        },
        availability: {
            class1: {
                total: (blockSeat as any)?.classes?.find((c: any) => c.classId === 1)?.totalSeats || blockSeat?.availability?.class1?.total || (blockSeat as any)?.priceClasses?.find((c: any) => c.classType === 'Economy')?.totalSeats || 0,
                booked: (blockSeat as any)?.classes?.find((c: any) => c.classId === 1)?.bookedSeats || blockSeat?.availability?.class1?.booked || 0,
            },
            class2: {
                total: (blockSeat as any)?.classes?.find((c: any) => c.classId === 2)?.totalSeats || blockSeat?.availability?.class2?.total || (blockSeat as any)?.priceClasses?.find((c: any) => c.classType === 'Business')?.totalSeats || 0,
                booked: (blockSeat as any)?.classes?.find((c: any) => c.classId === 2)?.bookedSeats || blockSeat?.availability?.class2?.booked || 0,
            },
            class3: {
                total: (blockSeat as any)?.classes?.find((c: any) => c.classId === 3)?.totalSeats || blockSeat?.availability?.class3?.total || (blockSeat as any)?.priceClasses?.find((c: any) => c.classType === 'First')?.totalSeats || 0,
                booked: (blockSeat as any)?.classes?.find((c: any) => c.classId === 3)?.bookedSeats || blockSeat?.availability?.class3?.booked || 0,
            },
        },
        status: blockSeat?.status || 'Available',
        // Add a name field to the form state to track changes
        name: blockSeat?.name || '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [selectedFromAirports, setSelectedFromAirports] = useState<string[]>([]);
    const [selectedToAirports, setSelectedToAirports] = useState<string[]>([]);
    // --- NEW STATE for controlled RouteInformation ---
    const [fromCountry, setFromCountry] = useState('');
    const [toCountry, setToCountry] = useState('');
    // --- END NEW STATE ---
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fareRulesTemplates = [
        { name: 'Flexible', cancellationFee: 0, changeFee: 0, refundable: true },
        { name: 'Semi-Flexible', cancellationFee: 50, changeFee: 25, refundable: true },
        { name: 'Standard', cancellationFee: 100, changeFee: 50, refundable: false },
        { name: 'Restricted', cancellationFee: 150, changeFee: 75, refundable: false },
        { name: 'Non-Refundable', cancellationFee: 200, changeFee: 100, refundable: false },
        { name: 'MANUAL_ENTRY', cancellationFee: formData.fareRules.cancellationFee, changeFee: formData.fareRules.changeFee, refundable: formData.fareRules.refundable },
        { name: 'FLEXIBLE', cancellationFee: 0, changeFee: 0, refundable: true },
    ];

    useEffect(() => {
        // --- ADDED CONSOLE LOGS ---
        if (blockSeat) {
            console.log("--- BlockSeatForm: Loading in UPDATE STAGE ---");
            // --- END ADDED CONSOLE LOGS ---
            
            // --- CONSOLE LOG 1 (FILE 1) ---
            console.log("--- DEBUG (BlockSeatForm): Loading blockSeat data ---", blockSeat);

            if ((blockSeat as any)?.fareRules) {
                const apiTemplateName = (blockSeat as any).fareRules.template?.replace(/_/g, ' ')
                    .toLowerCase()
                    .replace(/\b\w/g, (l: string) => l.toUpperCase()); // e.g., MANUAL_ENTRY -> Manual Entry

                const matchingTemplate = fareRulesTemplates.find(t =>
                    t.name.toLowerCase() === apiTemplateName?.toLowerCase() ||
                    (
                        t.cancellationFee === (blockSeat as any).fareRules.cancellationFee &&
                        t.changeFee === (blockSeat as any).fareRules.changeFee &&
                        t.refundable === (blockSeat as any).fareRules.refundable
                    )
                );

                setFormData(prev => ({
                    ...prev,
                    fareRules: {
                        ...prev.fareRules,
                        templateName: matchingTemplate ? matchingTemplate.name : 'Manual Entry',
                    }
                }));
            }

            // --- *** UPDATED LOGIC TO HANDLE BOTH ARRAY AND OBJECT *** ---
            const fromRouteData = (blockSeat as any).route?.from;
            if (Array.isArray(fromRouteData) && fromRouteData.length > 0) {
                // Handle ARRAY structure (from user's new example)
                const firstFromRoute = fromRouteData[0];
                const fromCountryValue = firstFromRoute.country || '';
                const fromIataValue = firstFromRoute.code || firstFromRoute.iataCode; // Use .code

                console.log(`--- DEBUG (BlockSeatForm): Setting FROM (Array Path) Country: [${fromCountryValue}], IATA: [${fromIataValue}]`);
                setFromCountry(fromCountryValue);
                setSelectedFromAirports(fromIataValue ? [fromIataValue] : []);

            } else if (fromRouteData && typeof fromRouteData === 'object' && !Array.isArray(fromRouteData)) {
                // Handle OBJECT structure (from original API response)
                const fromCountryValue = fromRouteData.country || '';
                const fromIataValue = fromRouteData.iataCode || fromRouteData.code;

                console.log(`--- DEBUG (BlockSeatForm): Setting FROM (Object Path) Country: [${fromCountryValue}], IATA: [${fromIataValue}]`);
                setFromCountry(fromCountryValue);
                setSelectedFromAirports(fromIataValue ? [fromIataValue] : []);
            }
            // --- END OF 'from' LOGIC ---

            // --- *** UPDATED LOGIC FOR 'to' *** ---
            const toRouteData = (blockSeat as any).route?.to;
            if (Array.isArray(toRouteData) && toRouteData.length > 0) {
                // Handle ARRAY structure
                const firstToRoute = toRouteData[0];
                const toCountryValue = firstToRoute.country || '';
                const toIataValue = firstToRoute.code || firstToRoute.iataCode; // Use .code

                console.log(`--- DEBUG (BlockSeatForm): Setting TO (Array Path) Country: [${toCountryValue}], IATA: [${toIataValue}]`);
                setToCountry(toCountryValue);
                setSelectedToAirports(toIataValue ? [toIataValue] : []);

            } else if (toRouteData && typeof toRouteData === 'object' && !Array.isArray(toRouteData)) {
                // Handle OBJECT structure
                const toCountryValue = toRouteData.country || '';
                const toIataValue = toRouteData.iataCode || toRouteData.code;

                console.log(`--- DEBUG (BlockSeatForm): Setting TO (Object Path) Country: [${toCountryValue}], IATA: [${toIataValue}]`);
                setToCountry(toCountryValue);
                setSelectedToAirports(toIataValue ? [toIataValue] : []);
            }
            // --- END OF 'to' LOGIC ---

        } else {
            // --- ADDED CONSOLE LOGS ---
            console.log("--- BlockSeatForm: Loading in CREATE STAGE ---");
            // --- END ADDED CONSOLE LOGS ---
        }
    }, [blockSeat]);


    const baggageWeightOptions = [
        { value: 20, label: '20 kg' },
        { value: 23, label: '23 kg' },
        { value: 25, label: '25 kg' },
        { value: 30, label: '30 kg' },
        { value: 32, label: '32 kg' },
        { value: 40, label: '40 kg' },
    ];

    const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: 'EUR' },
        { code: 'GBP', name: 'British Pound', symbol: 'GBP' },
        { code: 'EGP', name: 'Egyptian Pound', symbol: 'EGP' },
        { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
        { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR' },
        { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KWD' },
        { code: 'IQD', name: 'Iraqi Dinar', symbol: 'IQD' },
        { code: 'OMR', name: 'Omani Rial', symbol: 'OMR' },
        { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BHD' },
        { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JOD' },
        { code: 'LBP', name: 'Lebanese Pound', symbol: 'LBP' },
        { code: 'TRY', name: 'Turkish Lira', symbol: 'TRY' },
        { code: 'JPY', name: 'Japanese Yen', symbol: 'JPY' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: 'CNY' },
        { code: 'INR', name: 'Indian Rupee', symbol: 'INR' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'AUD' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'CAD' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'SEK' },
    ];

    const getSelectedCurrencySymbol = () => {
        const currency = currencies.find(c => c.code === formData.pricing.currency);
        return currency ? currency.symbol : '';
    };

    // --- NEW HANDLERS for controlled RouteInformation ---
    const handleSetFromCountry = (country: string) => {
        setFromCountry(country);
        setSelectedFromAirports([]); // Clear airports when country changes
    };

    const handleSetToCountry = (country: string) => {
        setToCountry(country);
        setSelectedToAirports([]); // Clear airports when country changes
    };
    // --- END NEW HANDLERS ---

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
                    templateName: template.name,
                    cancellationFee: template.cancellationFee,
                    changeFee: template.changeFee,
                    refundable: template.refundable,
                },
            }));
        } else {
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
        if (!validateForm()) return;
        setIsSubmitting(true);

        const fromAirportsData = selectedFromAirports.map(code => {
            const airport = countriesAndAirports.flatMap(c => c.airports).find(a => a.code === code);
            const country = countriesAndAirports.find(c => c.airports.some(a => a.code === code));
            return {
                code: airport?.code || code,
                city: airport?.city || code,
                country: country?.country || '',
                flag: country?.flag || ''
            };
        });

        const toAirportsData = selectedToAirports.map(code => {
            const airport = countriesAndAirports.flatMap(c => c.airports).find(a => a.code === code);
            const country = countriesAndAirports.find(c => c.airports.some(a => a.code === code));
            return {
                code: airport?.code || code,
                city: airport?.city || code,
                country: country?.country || '',
                flag: country?.flag || ''
            };
        });

        const classesPayload = [];
        if (formData.pricing.class1 > 0 && formData.availability.class1.total > 0) {
            classesPayload.push({ classId: 1, className: "Class 1", totalSeats: formData.availability.class1.total, price: formData.pricing.class1, bookedSeats: formData.availability.class1.booked, availableSeats: formData.availability.class1.total - formData.availability.class1.booked, currency: formData.pricing.currency });
        }
        if (formData.pricing.class2 > 0 && formData.availability.class2.total > 0) {
            classesPayload.push({ classId: 2, className: "Class 2", totalSeats: formData.availability.class2.total, price: formData.pricing.class2, bookedSeats: formData.availability.class2.booked, availableSeats: formData.availability.class2.total - formData.availability.class2.booked, currency: formData.pricing.currency });
        }
        if (formData.pricing.class3 > 0 && formData.availability.class3.total > 0) {
            classesPayload.push({ classId: 3, className: "Class 3", totalSeats: formData.availability.class3.total, price: formData.pricing.class3, bookedSeats: formData.availability.class3.booked, availableSeats: formData.availability.class3.total - formData.availability.class3.booked, currency: formData.pricing.currency });
        }

        const currentApiPayload = {
            name: formData.name || `${fromAirportsData[0]?.city || 'Departure'} to ${toAirportsData[0]?.city || 'Destination'} ${formData.route.isRoundTrip ? 'Round Trip' : 'One Way'}`,
            airline: { code: formData.airlineCode, name: formData.airline, country: formData.airlineCountry },
            route: {
                from: { country: fromAirportsData[0]?.country || '', iataCode: fromAirportsData[0]?.code || '' },
                to: { country: toAirportsData[0]?.country || '', iataCode: toAirportsData[0]?.code || '' },
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
                supplierCommission: { type: formData.supplierCommission.type === 'fixed' ? 'FIXED_AMOUNT' : 'PERCENTAGE', value: formData.supplierCommission.value },
                agencyCommission: { type: formData.agencyCommission.type === 'fixed' ? 'FIXED_AMOUNT' : 'PERCENTAGE', value: formData.agencyCommission.value },
            },
            remarks: `Block seat from ${fromAirportsData.map(a => a.code).join(', ')} to ${toAirportsData.map(a => a.code).join(', ')}`,
        };

        try {
            const token = getAuthToken();
            if (!token) throw new Error('Authentication token not found.');

            let responseData;
            
            // --- FIX START ---
            // Determine if we are in "update mode" by checking for blockSeat prop and its _id OR id.
            const seatId = (blockSeat as any)?._id || (blockSeat as any)?.id;
            // --- END FIX ---

            if (seatId) {
                // UPDATE (PATCH) LOGIC
                console.log("Update mode: Sending PATCH request for seat ID:", seatId);

                // Reconstruct the original payload shape from the prop to compare against the current payload
                const originalApiPayload = {
                    name: (blockSeat as any).name,
                    airline: (blockSeat as any).airline,
                    route: (blockSeat as any).route,
                    availableDates: (blockSeat as any).availableDates.map((d: any) => ({
                        departureDate: d.departureDate,
                        returnDate: (blockSeat as any).route.tripType === 'ROUND_TRIP' ? d.returnDate : null
                    })),
                    classes: (blockSeat as any).classes,
                    currency: (blockSeat as any).currency,
                    status: (blockSeat as any).status,
                    fareRules: (blockSeat as any).fareRules,
                    baggageAllowance: (blockSeat as any).baggageAllowance,
                    commission: (blockSeat as any).commission,
                    remarks: (blockSeat as any).remarks,
                };
                
                const patchPayload = getUpdatedFields(originalApiPayload, currentApiPayload);
                
                console.log("Update payload (only sending changed fields):", patchPayload);

                if (Object.keys(patchPayload).length === 0) {
                    console.log("No changes detected. Closing form.");
                    onClose();
                    setIsSubmitting(false);
                    return;
                }
                
                const response = await fetch(`${process.env.NEXT_PUBLIC_FLIGHT_URL}block-seats/${seatId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(patchPayload),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to update block seat.' }));
                    throw new Error(errorData.message || 'An unknown error occurred.');
                }
                responseData = await response.json();

            } else {
                // CREATE (POST) LOGIC
                console.log("Create mode: Sending POST request.");
                console.log("Create payload (sending full object):", currentApiPayload);

                const response = await fetch(`${process.env.NEXT_PUBLIC_FLIGHT_URL}/block-seats`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(currentApiPayload),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to create block seat.' }));
                    throw new Error(errorData.message || 'An unknown error occurred.');
                }
                responseData = await response.json();
            }


            const priceClasses = [
                { classType: 'Economy' as const, price: formData.pricing.class1, availableSeats: formData.availability.class1.total - formData.availability.class1.booked, totalSeats: formData.availability.class1.total, baggageAllowance: { checkedBag: `${formData.baggage.checkedBags}x${formData.baggage.weight}kg`, handBag: `${formData.baggage.carryOn}kg`, weight: `${formData.baggage.weight}kg total` }, fareRules: { refundable: formData.fareRules.refundable, changeable: true, changeFee: formData.fareRules.changeFee, cancellationFee: formData.fareRules.cancellationFee } },
                { classType: 'Business' as const, price: formData.pricing.class2, availableSeats: formData.availability.class2.total - formData.availability.class2.booked, totalSeats: formData.availability.class2.total, baggageAllowance: { checkedBag: `${formData.baggage.checkedBags}x${formData.baggage.weight + 9}kg`, handBag: `${formData.baggage.carryOn + 5}kg`, weight: `${formData.baggage.weight + 9}kg total` }, fareRules: { refundable: formData.fareRules.refundable, changeable: true, changeFee: formData.fareRules.changeFee, cancellationFee: formData.fareRules.cancellationFee } },
                { classType: 'First' as const, price: formData.pricing.class3, availableSeats: formData.availability.class3.total - formData.availability.class3.booked, totalSeats: formData.availability.class3.total, baggageAllowance: { checkedBag: `${formData.baggage.checkedBags}x${formData.baggage.weight + 17}kg`, handBag: `${formData.baggage.carryOn + 8}kg`, weight: `${formData.baggage.weight + 17}kg total` }, fareRules: { refundable: formData.fareRules.refundable, changeable: true, changeFee: formData.fareRules.changeFee, cancellationFee: formData.fareRules.cancellationFee } }
            ];

            const firstAvailableDate = formData.availableDates[0];
            const newBlockSeat = {
                id: blockSeat?.id || responseData?.id || Date.now().toString(),
                airline: { name: formData.airline, code: formData.airlineCode, country: formData.airlineCountry, logo: availableAirlines.find(a => a.name === formData.airline)?.logo || '', flagCode: formData.airlineCountry || 'XX' },
                flightNumber: `${formData.airlineCode}${Math.floor(Math.random() * 9000) + 1000}`,
                route: { from: fromAirportsData, to: toAirportsData, departure: firstAvailableDate?.departure || '', return: firstAvailableDate?.return || '', isRoundTrip: formData.route.isRoundTrip },
                departureDate: firstAvailableDate?.departure || new Date().toISOString().split('T')[0],
                departureTime: '14:30',
                arrivalTime: '17:45',
                duration: '3h 15m',
                aircraft: 'Boeing 737-800',
                priceClasses: priceClasses,
                pricing: formData.pricing,
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
                // --- ADDING ALL FIELDS FROM API RESPONSE TO MATCH TYPE ---
                _id: (blockSeat as any)?._id || responseData?.data?._id,
                name: currentApiPayload.name,
                classes: classesPayload,
                currency: formData.pricing.currency,
                baggageAllowance: currentApiPayload.baggageAllowance,
                commission: currentApiPayload.commission,
                // --- END ---
            } as BlockSeat;

            onSave(newBlockSeat);
            onClose();

        } catch (error) {
            alert(error instanceof Error ? error.message : 'An unexpected error occurred.');
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
                    <AirlineInformation
                        formData={formData}
                        handleAirlineChange={handleAirlineChange}
                        errors={errors}
                    />

                    <div className="bg-gradient-to-br from-green-50 via-white to-green-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-green-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
                        <RouteInformation
                            formData={formData}
                            handleTripTypeChange={handleTripTypeChange}
                            selectedFromAirports={selectedFromAirports}
                            selectedToAirports={selectedToAirports}
                            toggleFromAirport={toggleFromAirport}
                            toggleToAirport={toggleToAirport}
                            errors={errors}
                            // --- PASSING NEW PROPS ---
                            fromCountry={fromCountry}
                            setFromCountry={handleSetFromCountry}
                            toCountry={toCountry}
                            setToCountry={handleSetToCountry}
                        />
                        <AvailableFlightDates
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                        />
                    </div>


                    <Pricing
                        formData={formData}
                        setFormData={setFormData}
                        currencies={currencies}
                        getSelectedCurrencySymbol={getSelectedCurrencySymbol}
                    />

                    <BaggageAllowance
                        formData={formData}
                        setFormData={setFormData}
                        baggageWeightOptions={baggageWeightOptions}
                    />

                    <FareRules
                        formData={formData}
                        setFormData={setFormData}
                        handleFareRuleTemplate={handleFareRuleTemplate}
                        fareRulesTemplates={fareRulesTemplates}
                        getSelectedCurrencySymbol={getSelectedCurrencySymbol}
                    />

                    {/* <Commission
                        formData={formData}
                        setFormData={setFormData}
                        getSelectedCurrencySymbol={getSelectedCurrencySymbol}
                    /> */}

                    <AvailabilityBookings
                        formData={formData}
                        setFormData={setFormData}
                        calculateNetPrice={calculateNetPrice}
                        getSelectedCurrencySymbol={getSelectedCurrencySymbol}
                    />

                    <Status
                        formData={formData}
                        setFormData={setFormData}
                    />
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-t-2 border-gray-200 dark:border-gray-700 p-8 rounded-b-xl flex justify-between items-center">
                    <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
                        * Required fields
                    </p>
                    <div className="flex space-x-4">
                        <div
                            onClick={onClose}
                            className="px-8 py-3.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer select-none"
                            style={{ userSelect: 'none' }}
                        >
                            Cancel
                        </div>
                        <div
                            onClick={() => !isSubmitting && handleSubmit()}
                            className={`px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ userSelect: 'none', pointerEvents: isSubmitting ? 'none' : 'auto' }}
                        >
                            <Save className="w-5 h-5 mr-2" />
                            <span>
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