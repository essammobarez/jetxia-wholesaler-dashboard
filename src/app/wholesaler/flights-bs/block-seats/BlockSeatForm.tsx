'use client';
import { Plane, Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { availableAirlines } from './availableAirlines';
import { countriesAndAirports } from './countriesAndAirports';
import { BlockSeat } from './mockData';

// Import components
import AirlineInformation from './components/AirlineInformation';
import AvailabilityBookings from './components/AvailabilityBookings';
import AvailableFlightDates from './components/AvailableFlightDates';
import BaggageAllowance from './components/BaggageAllowance';
import FareRules from './components/FareRules';
import Pricing from './components/Pricing';
import RouteInformation from './components/RouteInformation';
import Status from './components/Status';

interface BlockSeatFormProps {
    blockSeat?: BlockSeat;
    onClose: () => void;
    onSave: (seat: BlockSeat) => void;
}

// --- NEW/UPDATED TYPES ---
interface StoppageDate {
    arrival: string;
    departure: string;
}

// --- UPDATED: This interface now matches the one in AvailableFlightDates.tsx ---
interface AvailableDateEntry {
    departure: string;
    arrival: string;
    return: string;
    returnArrival: string;
    deadline: string;
    id: string;
    stoppageDates: StoppageDate[];
    returnStoppageDates: StoppageDate[];
    layoverHours: string;
    layoverMinutes: string;
    returnLayoverHours: string;
    returnLayoverMinutes: string;
}

// --- NEW: Type for airline array (from child) ---
interface SimpleAirline {
  code: string;
  name: string;
  country: string;
  logo?: string;
}

const getAuthToken = () => {
    return document.cookie
        .split('; ')
        .find(r => r.startsWith('authToken='))
        ?.split('=')[1] || localStorage.getItem('authToken');
};

const BlockSeatForm: React.FC<BlockSeatFormProps> = ({ blockSeat, onClose, onSave }) => {
    // Helper to initialize Pricing state deeply
    const initPassengerPricing = (price = 0) => ({
        price,
        commission: { type: 'percentage' as const, value: 0 }
    });

    // UPDATED: Helper to find stoppage data from complex blockSeat structure
    const getInitialStoppages = (routeData: any): { country: string; airportCode: string; depFlightNumber: string; retFlightNumber: string; }[] => {
        
        // --- NEW: Logic to parse segments if they exist (for editing) ---
        if (Array.isArray(routeData?.outboundSegments) && routeData.outboundSegments.length > 1) {
            const stops = [];
            // Loop from segment 0 up to the second-to-last segment
            for (let i = 0; i < routeData.outboundSegments.length - 1; i++) {
                const outSegment = routeData.outboundSegments[i];
                const retSegment = routeData.returnSegments ? routeData.returnSegments[routeData.returnSegments.length - 1 - i] : null;
                
                const stopData = {
                    country: outSegment.to.country || '',
                    airportCode: outSegment.to.iataCode || '',
                    depFlightNumber: routeData.outboundSegments[i+1]?.flightNumber || '',
                    retFlightNumber: retSegment?.flightNumber || ''
                };
                stops.push(stopData);
            }
            return stops;
        }

        // --- Fallback to old `stoppages` array structure (if editing old data) ---
        if (Array.isArray(routeData?.stoppages) && routeData.stoppages.length > 0) {
            return routeData.stoppages.map((stop: any) => ({
                country: stop.country || '',
                airportCode: stop.iataCode || stop.code || '',
                depFlightNumber: stop.departureFlightNumber || '',
                retFlightNumber: stop.returnFlightNumber || ''
            }));
        }
        return [];
    };

    // UPDATED: Helper to determine stoppage type and count from data
    const initialStoppages = getInitialStoppages((blockSeat as any)?.route);
    const initialStoppageCount = initialStoppages.length > 0 ? String(initialStoppages.length) : '';
    const initialStoppageType = initialStoppages.length > 0 ? 'stoppage' : 'direct';

    const [formData, setFormData] = useState({
        // --- UPDATED: Keep primary airline fields for display ---
        airline: blockSeat?.airline.name || (blockSeat as any)?.airlines?.[0]?.name || '',
        airlineCode: blockSeat?.airline.code || (blockSeat as any)?.airlines?.[0]?.code || '',
        airlineCountry: blockSeat?.airline.country || (blockSeat as any)?.airlines?.[0]?.country || '',
        
        // --- ADDED: Store the full array of airlines ---
        airlines: (blockSeat as any)?.airlines || (blockSeat?.airline ? [{
            name: blockSeat.airline.name,
            code: blockSeat.airline.code,
            country: blockSeat.airline.country
        }] : []) as SimpleAirline[],

        route: {
            from: (Array.isArray((blockSeat as any)?.route?.from) && (blockSeat as any).route.from.length > 0)
                ? (blockSeat as any).route.from[0].code
                : (typeof blockSeat?.route.from === 'string' ? blockSeat.route.from : (blockSeat?.route.from as any)?.iataCode || (blockSeat?.route.from as any)?.code || ''),
            to: (Array.isArray((blockSeat as any)?.route?.to) && (blockSeat as any).route.to.length > 0)
                ? (blockSeat as any).route.to[0].code
                : (typeof blockSeat?.route.to === 'string' ? blockSeat.route.to : (blockSeat?.route.to as any)?.iataCode || (blockSeat?.route.to as any)?.code || ''),
            departure: blockSeat?.route.departure || '',
            arrival: '',
            return: blockSeat?.route.return || '',
            returnArrival: '',
            deadline: '',
            isRoundTrip: blockSeat?.route.isRoundTrip !== undefined ? blockSeat.route.isRoundTrip : (blockSeat as any)?.route?.tripType === 'ROUND_TRIP' || true,
            
            // --- UPDATED: Load flight numbers from segments if available ---
            departureFlightNumber: (blockSeat as any)?.route?.outboundSegments?.[0]?.flightNumber || (blockSeat as any)?.route?.departureFlightNumber || '',
            returnFlightNumber: (blockSeat as any)?.route?.returnSegments?.[(blockSeat as any).route.returnSegments.length - 1]?.flightNumber || (blockSeat as any)?.route?.returnFlightNumber || '',
            
            // --- NEW STOPPAGE STATE ---
            stoppageType: initialStoppageType as 'direct' | 'stoppage' | null,
            stoppageCount: initialStoppageCount,
            // --- UPDATED STOPPAGES STATE ---
            stoppages: initialStoppages as Array<{ country: string; airportCode: string; depFlightNumber: string; retFlightNumber: string; }>,
            // --- NEW: Stoppage dates for the date builder ---
            stoppageDates: Array(initialStoppages.length).fill(null).map(() => ({ arrival: '', departure: '' })) as StoppageDate[],
            // --- NEW: Return stoppage fields ---
            returnStoppageType: initialStoppageType as 'direct' | 'stoppage' | null,
            returnStoppageCount: initialStoppageCount,
            returnStoppageDates: Array(initialStoppages.length).fill(null).map(() => ({ arrival: '', departure: '' })) as StoppageDate[],
            // --- NEW: Layover time (One Way) ---
            layoverHours: '',
            layoverMinutes: '',
            // --- NEW: Return Layover time ---
            returnLayoverHours: '',
            returnLayoverMinutes: '',
        },
        // --- UPDATED: availableDates state with new type ---
        availableDates: (blockSeat?.availableDates as any[])?.map(d => ({ ...d, stoppageDates: d.stoppageDates || [], returnStoppageDates: d.returnStoppageDates || [] })) || [] as AvailableDateEntry[],
        pricing: {
            class1: {
                adult: initPassengerPricing((blockSeat as any)?.classes?.find((c: any) => c.classId === 1)?.pricing?.adult?.price || 0),
                // UPDATED: Changed child to children (with fallback for backward compatibility during load)
                children: initPassengerPricing(
                    (blockSeat as any)?.classes?.find((c: any) => c.classId === 1)?.pricing?.children?.price ||
                    (blockSeat as any)?.classes?.find((c: any) => c.classId === 1)?.pricing?.child?.price || 0
                ),
                infant: initPassengerPricing((blockSeat as any)?.classes?.find((c: any) => c.classId === 1)?.pricing?.infant?.price || 0),
            },
            class2: {
                adult: initPassengerPricing((blockSeat as any)?.classes?.find((c: any) => c.classId === 2)?.pricing?.adult?.price || 0),
                // UPDATED: Changed child to children
                children: initPassengerPricing(
                    (blockSeat as any)?.classes?.find((c: any) => c.classId === 2)?.pricing?.children?.price ||
                    (blockSeat as any)?.classes?.find((c: any) => c.classId === 2)?.pricing?.child?.price || 0
                ),
                infant: initPassengerPricing((blockSeat as any)?.classes?.find((c: any) => c.classId === 2)?.pricing?.infant?.price || 0),
            },
            class3: {
                adult: initPassengerPricing((blockSeat as any)?.classes?.find((c: any) => c.classId === 3)?.pricing?.adult?.price || 0),
                // UPDATED: Changed child to children
                children: initPassengerPricing(
                    (blockSeat as any)?.classes?.find((c: any) => c.classId === 3)?.pricing?.children?.price ||
                    (blockSeat as any)?.classes?.find((c: any) => c.classId === 3)?.pricing?.child?.price || 0
                ),
                infant: initPassengerPricing((blockSeat as any)?.classes?.find((c: any) => c.classId === 3)?.pricing?.infant?.price || 0),
            },
            currency: (blockSeat as any)?.currency || 'USD',
        },
        supplierCommission: {
            type: (blockSeat as any)?.commission?.supplierCommission?.type === 'FIXED_AMOUNT' ? 'fixed' : 'percentage' as 'fixed' | 'percentage',
            value: (blockSeat as any)?.commission?.supplierCommission?.value || 0,
        },
        agencyCommission: {
            type: (blockSeat as any)?.commission?.agencyCommission?.type === 'FIXED_AMOUNT' ? 'fixed' : 'percentage' as 'fixed' | 'percentage',
            value: (blockSeat as any)?.commission?.agencyCommission?.value || 0,
        },
        baggage: {
            checkedBags: (blockSeat as any)?.baggageAllowance?.checkedBags || 2,
            weight: parseInt((blockSeat as any)?.baggageAllowance?.weightPerBag) || 23,
            carryOn: parseInt((blockSeat as any)?.baggageAllowance?.carryOnWeight) || 7,
        },
        fareRules: {
            templateName: (blockSeat as any)?.fareRules?.template || 'Manual Entry',
            cancellationFee: (blockSeat as any)?.fareRules?.cancellationFee || 0,
            changeFee: (blockSeat as any)?.fareRules?.changeFee || 0,
            refundable: (blockSeat as any)?.fareRules?.refundable || false,
        },
        availability: {
            class1: {
                total: (blockSeat as any)?.classes?.find((c: any) => c.classId === 1)?.totalSeats || 0,
                booked: (blockSeat as any)?.classes?.find((c: any) => c.classId === 1)?.bookedSeats || 0,
            },
            class2: {
                total: (blockSeat as any)?.classes?.find((c: any) => c.classId === 2)?.totalSeats || 0,
                booked: (blockSeat as any)?.classes?.find((c: any) => c.classId === 2)?.bookedSeats || 0,
            },
            class3: {
                total: (blockSeat as any)?.classes?.find((c: any) => c.classId === 3)?.totalSeats || 0,
                booked: (blockSeat as any)?.classes?.find((c: any) => c.classId === 3)?.bookedSeats || 0,
            },
        },
        status: blockSeat?.status || 'Available',
        name: blockSeat?.name || '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // --- UPDATED: Changed state from string[] to string for radio button logic ---
    const [selectedFromAirport, setSelectedFromAirport] = useState<string>('');
    const [selectedToAirport, setSelectedToAirport] = useState<string>('');
    
    const [fromCountry, setFromCountry] = useState('');
    const [toCountry, setToCountry] = useState('');
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
        if (blockSeat) {
            console.log("--- DEBUG (BlockSeatForm): Loading blockSeat data ---", blockSeat);

            if ((blockSeat as any)?.fareRules) {
                const apiTemplateName = (blockSeat as any).fareRules.template?.replace(/_/g, ' ')
                    .toLowerCase()
                    .replace(/\b\w/g, (l: string) => l.toUpperCase());

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

            const fromRouteData = (blockSeat as any).route?.from;
            if (Array.isArray(fromRouteData) && fromRouteData.length > 0) {
                const firstFromRoute = fromRouteData[0];
                setFromCountry(firstFromRoute.country || '');
                // --- UPDATED: Set single string ---
                setSelectedFromAirport(firstFromRoute.iataCode || '');
            } else if (fromRouteData && typeof fromRouteData === 'object' && !Array.isArray(fromRouteData)) {
                setFromCountry(fromRouteData.country || '');
                // --- UPDATED: Set single string ---
                setSelectedFromAirport((fromRouteData.iataCode || fromRouteData.code) || '');
            }

            const toRouteData = (blockSeat as any).route?.to;
            if (Array.isArray(toRouteData) && toRouteData.length > 0) {
                const firstToRoute = toRouteData[0];
                setToCountry(firstToRoute.country || '');
                // --- UPDATED: Set single string ---
                setSelectedToAirport(firstToRoute.iataCode || '');
            } else if (toRouteData && typeof toRouteData === 'object' && !Array.isArray(toRouteData)) {
                setToCountry(toRouteData.country || '');
                // --- UPDATED: Set single string ---
                setSelectedToAirport((toRouteData.iataCode || toRouteData.code) || '');
            }

            // --- UPDATED: Load available dates with stoppage dates ---
            if ((blockSeat as any).availableDates && (blockSeat as any).availableDates.length > 0) {
                // This logic is complex because the incoming `availableDates` from the API
                // might be in the *new* format (with segmentTimes) or the *old* format.
                // We need to reconstruct the *form's* internal state (which uses full datetimes).
                
                // This is a placeholder for now. A full reverse-migration is complex.
                // For this example, we'll assume the `blockSeat` data is not in the new format yet
                // or we just re-load the simple fields.
                
                // Let's refine the loading logic to handle *both* old and new.
                const recombinedDates: AvailableDateEntry[] = (blockSeat as any).availableDates.map((d: any) => {
                    
                    let departure, arrival, returnDep, returnArr;
                    let outStoppageDates: StoppageDate[] = [];
                    let retStoppageDates: StoppageDate[] = [];

                    if (d.outboundSegmentTimes) {
                        // --- NEW FORMAT ---
                        departure = `${d.departureDate}T${d.outboundSegmentTimes[0].departureTime}:00.000`;
                        arrival = `${d.departureDate}T${d.outboundSegmentTimes[d.outboundSegmentTimes.length - 1].arrivalTime}:00.000`; // Note: This might cross days, simple concat is an approximation.
                        
                        outStoppageDates = d.outboundSegmentTimes.slice(0, -1).map((seg: any, i: number) => ({
                             arrival: `${d.departureDate}T${seg.arrivalTime}:00.000`, // Approximation
                             departure: `${d.departureDate}T${d.outboundSegmentTimes[i+1].departureTime}:00.000` // Approximation
                        }));
                        
                        if (d.returnSegmentTimes) {
                            returnDep = `${d.returnDate}T${d.returnSegmentTimes[0].departureTime}:00.000`;
                            returnArr = `${d.returnDate}T${d.returnSegmentTimes[d.returnSegmentTimes.length - 1].arrivalTime}:00.000`; // Approximation
                            
                            retStoppageDates = d.returnSegmentTimes.slice(0, -1).map((seg: any, i: number) => ({
                                arrival: `${d.returnDate}T${seg.arrivalTime}:00.000`, // Approximation
                                departure: `${d.returnDate}T${d.returnSegmentTimes[i+1].departureTime}:00.000` // Approximation
                            }));
                        }

                    } else {
                        // --- OLD FORMAT ---
                        departure = d.departureDate && d.departureTime ? `${d.departureDate}T${d.departureTime}:00.000` : (d.departureDate || d.departure);
                        arrival = d.arrivalDate && d.arrivalTime ? `${d.arrivalDate}T${d.arrivalTime}:00.000` : (d.arrivalDate || d.arrival); // Assuming old format had this
                        returnDep = d.returnDate && d.returnTime ? `${d.returnDate}T${d.returnTime}:00.000` : (d.returnDate || d.return);
                        returnArr = d.returnArrivalDate && d.returnArrivalTime ? `${d.returnArrivalDate}T${d.returnArrivalTime}:00.000` : (d.returnArrivalDate || d.returnArrival); // Assuming old format had this

                        outStoppageDates = (d.stoppageDates || []).map((stop: any) => ({
                            arrival: stop.arrivalDate && stop.arrivalTime ? `${stop.arrivalDate}T${stop.arrivalTime}:00.000` : (stop.arrival || ''),
                            departure: stop.departureDate && stop.departureTime ? `${stop.departureDate}T${stop.departureTime}:00.000` : (stop.departure || '')
                        }));
                        // We assume old format didn't have returnStoppageDates
                    }


                    return {
                        departure: departure || '',
                        arrival: arrival || '',
                        return: returnDep || '',
                        returnArrival: returnArr || '',
                        deadline: d.deadline,
                        id: d._id || d.id || Math.random().toString(36).substr(2, 9),
                        stoppageDates: outStoppageDates,
                        returnStoppageDates: retStoppageDates,
                        // Re-load layover times if they were saved (from new UI)
                        layoverHours: d.layoverHours || '',
                        layoverMinutes: d.layoverMinutes || '',
                        returnLayoverHours: d.returnLayoverHours || '',
                        returnLayoverMinutes: d.returnLayoverMinutes || '',
                    };
                });

                setFormData(prev => ({
                    ...prev,
                    availableDates: recombinedDates
                }));
            }
        }
    }, [blockSeat]);

    const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: 'EUR' },
        { code: 'GBP', name: 'British Pound', symbol: 'GBP' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
        { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
        { code: 'EGP', name: 'Egyptian Pound', symbol: 'EGP' },
    ];

    const getSelectedCurrencySymbol = () => {
        const currency = currencies.find(c => c.code === formData.pricing.currency);
        return currency ? currency.symbol : '';
    };

    // --- UPDATED: Use new state setter ---
    const handleSetFromCountry = (country: string) => {
        setFromCountry(country);
        setSelectedFromAirport('');
    };

    // --- UPDATED: Use new state setter ---
    const handleSetToCountry = (country: string) => {
        setToCountry(country);
        setSelectedToAirport('');
    };

    const handleDepartureFlightNumberChange = (flightNumber: string) => {
        setFormData(prev => ({ ...prev, route: { ...prev.route, departureFlightNumber: flightNumber } }));
    };

    const handleReturnFlightNumberChange = (flightNumber: string) => {
        setFormData(prev => ({ ...prev, route: { ...prev.route, returnFlightNumber: flightNumber } }));
    };

    const calculateCommission = (basePrice: number, commission: { type: 'fixed' | 'percentage'; value: number }): number => {
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

    // --- UPDATED: Handle the full array of airlines from the child ---
    const handleAirlineChange = (selectedAirlines: SimpleAirline[]) => {
        const primaryAirline = selectedAirlines[0]; // Get the first airline as the primary

        setFormData(prev => ({
            ...prev,
            // --- ADDED: Set the full array ---
            airlines: selectedAirlines,
            
            // --- UPDATED: Set primary fields for display/legacy use ---
            airline: primaryAirline?.name || '',
            airlineCode: primaryAirline?.code || '',
            airlineCountry: primaryAirline?.country || '',
        }));
    };

    // --- UPDATED: Handler for Stoppage Type/Count Changes ---
    const handleStoppageChange = (stoppageType: 'direct' | 'stoppage' | null, stoppageCount: string) => {
        const count = parseInt(stoppageCount, 10) || 0;

        // Resize the stoppages array, preserving existing items
        const newStoppages = Array(count).fill(null).map((_, i) =>
            formData.route.stoppages[i] || { country: '', airportCode: '', depFlightNumber: '', retFlightNumber: '' }
        );

        // --- NEW: Resize the temporary stoppage DATES array ---
        const newStoppageDates = Array(count).fill(null).map((_, i) =>
            formData.route.stoppageDates[i] || { arrival: '', departure: '' }
        );

        // --- NEW: Also resize return stoppage dates array ---
        const newReturnStoppageDates = Array(count).fill(null).map((_, i) =>
            formData.route.returnStoppageDates[i] || { arrival: '', departure: '' }
        );

        setFormData(prev => ({
            ...prev,
            route: {
                ...prev.route,
                stoppageType,
                stoppageCount,
                // Clear stoppages if 'direct', otherwise set the new array
                stoppages: stoppageType === 'direct' ? [] : newStoppages,
                // --- NEW: Update stoppage dates array ---
                stoppageDates: stoppageType === 'direct' ? [] : newStoppageDates,
                // --- NEW: Update return stoppage fields to match ---
                returnStoppageType: stoppageType,
                returnStoppageCount: stoppageCount,
                returnStoppageDates: stoppageType === 'direct' ? [] : newReturnStoppageDates
            }
        }));
    };

    // --- NEW: Handler for changing a stop's country ---
    const handleStoppageCountryChange = (index: number, country: string) => {
        setFormData(prev => {
            const newStoppages = [...prev.route.stoppages];
            // Set new country and reset airportCode, but preserve flight numbers
            newStoppages[index] = { ...newStoppages[index], country, airportCode: '' };
            return { ...prev, route: { ...prev.route, stoppages: newStoppages } };
        });
    };

    // --- NEW: Handler for changing a stop's airport ---
    const handleStoppageAirportToggle = (index: number, airportCode: string) => {
        setFormData(prev => {
            const newStoppages = [...prev.route.stoppages];
            const currentStop = newStoppages[index];
            // This acts like a radio button, only one airport per stop
            newStoppages[index] = { ...currentStop, airportCode: airportCode };
            return { ...prev, route: { ...prev.route, stoppages: newStoppages } };
        });
    };

    // --- NEW: Handler for Stoppage Flight Numbers ---
    const handleStoppageFlightNumberChange = (index: number, type: 'departure' | 'return', value: string) => {
        setFormData(prev => {
            const newStoppages = [...prev.route.stoppages];
            const stop = newStoppages[index];
            if (type === 'departure') {
                stop.depFlightNumber = value;
            } else {
                stop.retFlightNumber = value;
            }
            return { ...prev, route: { ...prev.route, stoppages: newStoppages } };
        });
    };

    // --- NEW: Handler for Stoppage Date Builder ---
    const handleStoppageDateChange = (index: number, type: 'arrival' | 'departure', value: string) => {
        setFormData(prev => {
            const newStoppageDates = [...prev.route.stoppageDates];
            const stopDate = newStoppageDates[index];
            if (type === 'arrival') {
                stopDate.arrival = value;
            } else {
                stopDate.departure = value;
            }
            return { ...prev, route: { ...prev.route, stoppageDates: newStoppageDates } };
        });
    };

    // --- NEW: Handler for Return Stoppage Date Builder ---
    const handleReturnStoppageDateChange = (index: number, type: 'arrival' | 'departure', value: string) => {
        setFormData(prev => {
            const newStoppageDates = [...prev.route.returnStoppageDates];
            const stopDate = newStoppageDates[index];
            if (type === 'arrival') {
                stopDate.arrival = value;
            } else {
                stopDate.departure = value;
            }
            return { ...prev, route: { ...prev.route, returnStoppageDates: newStoppageDates } };
        });
    };

    // --- UPDATED: Renamed function and changed logic to set a single string ---
    const handleFromAirportChange = (airportCode: string) => {
        setSelectedFromAirport(airportCode);
    };

    // --- UPDATED: Renamed function and changed logic to set a single string ---
    const handleToAirportChange = (airportCode: string) => {
        setSelectedToAirport(airportCode);
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
            setFormData(prev => ({ ...prev, fareRules: { ...prev.fareRules, templateName: 'Manual Entry' } }));
        }
    };

    // --- UPDATED: Added validation for flight numbers ---
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        
        if (!formData.airlines || formData.airlines.length === 0) {
            newErrors.airline = 'Please select at least one airline';
        }
        
        if (!selectedFromAirport) newErrors.from = 'Please select a departure airport';
        if (!selectedToAirport) newErrors.to = 'Please select a destination airport';

        // --- NEW: Flight Number Validation ---
        if (!formData.route.departureFlightNumber) {
            newErrors.departureFlightNumber = 'Departure Flight Number is required.';
        }
        if (formData.route.isRoundTrip && !formData.route.returnFlightNumber) {
            newErrors.returnFlightNumber = 'Final Return Flight Number is required.';
        }
        // --- END NEW ---

        if (formData.route.stoppageType === 'stoppage') {
            if (!formData.route.stoppageCount || parseInt(formData.route.stoppageCount, 10) <= 0) {
                newErrors.stoppage = 'Please select the number of stops.';
            }
            const expectedAirlines = (parseInt(formData.route.stoppageCount, 10) || 0) + 1;
            if (formData.airlines.length !== expectedAirlines) {
                newErrors.airline = `Please select exactly ${expectedAirlines} airlines for ${formData.route.stoppageCount} stop(s).`;
            }
            
            let missingStoppageFlightNum = false;
            formData.route.stoppages.forEach((stop, index) => {
                if (!stop.airportCode) {
                     // This error is already handled below
                }
                
                // --- NEW: Stoppage Flight Number Validation ---
                if (stop.airportCode && !stop.depFlightNumber) {
                    missingStoppageFlightNum = true;
                    newErrors[`stop_${index}_dep_flight`] = 'Dep. flight number for this stop is required.';
                }
                if (stop.airportCode && formData.route.isRoundTrip && !stop.retFlightNumber) {
                    missingStoppageFlightNum = true;
                    newErrors[`stop_${index}_ret_flight`] = 'Return flight number for this stop is required.';
                }
                // --- END NEW ---
            });

            if (missingStoppageFlightNum) {
                newErrors.stoppageFlightNumber = 'Please enter all departure (and return, if round trip) flight numbers for all stops.';
            }
            // ---

            if (formData.route.stoppages.some(s => !s.airportCode)) {
                newErrors.stoppageAirport = 'Please select an airport for all specified stops.';
            }
        } else {
            // Direct flight
            if (formData.airlines.length > 1) {
                 newErrors.airline = 'Please select only 1 airline for a direct flight.';
            }
        }


        if (formData.availableDates.length === 0) newErrors.dates = 'Please add at least one available date';
        if (formData.availability.class1.total > 0 && formData.pricing.class1.adult.price <= 0) newErrors.class1 = 'Class 1 Adult price is required';
        if (formData.availability.class1.total <= 0 && formData.availability.class2.total <= 0 && formData.availability.class3.total <= 0) newErrors.availability = 'Please set total seats for at least one class';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getLocalDate = (dateString: string) => {
        if (!dateString) return null;
        const d = new Date(dateString);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getLocalTime = (dateString: string) => {
        if (!dateString) return null;
        const d = new Date(dateString);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);

        // --- (STEP 1) UPDATED: Use new string state to get airport data ---
        // --- UPDATED: Also fetch 'name' (city) for layover field ---
        const getAirportData = (code: string) => {
            if (!code) return { iataCode: code, country: '', name: code };
            const airport = countriesAndAirports.flatMap(c => c.airports).find(a => a.code === code);
            const country = countriesAndAirports.find(c => c.airports.some(a => a.code === code));
            return {
                iataCode: airport?.code || code,
                country: country?.country || '',
                name: airport?.city || code // Use city as the name
            };
        };
        
        const fromAirportData = getAirportData(selectedFromAirport);
        const toAirportData = getAirportData(selectedToAirport);

        // --- (STEP 2) NEW: Map Stoppage Data ---
        // --- UPDATED: Also fetch 'name' (city) for layover field ---
        const stoppageAirportsData = formData.route.stoppages.map(stop => {
            const airport = countriesAndAirports.flatMap(c => c.airports).find(a => a.code === stop.airportCode);
            const country = countriesAndAirports.find(c => c.country === stop.country);
            return {
                iataCode: airport?.code || stop.airportCode,
                country: country?.country || stop.country,
                name: airport?.city || stop.airportCode, // Use city as the name
                departureFlightNumber: stop.depFlightNumber,
                returnFlightNumber: stop.retFlightNumber
            };
        }).filter(stop => stop.iataCode); // Ensure we only send valid stops


        // --- (STEP 3) NEW: Helper functions to build segments ---

        // Helper to format airline object for payload
        const formatAirline = (airline: SimpleAirline | undefined) => {
            if (!airline) return { code: '', name: '' };
            return { code: airline.code, name: airline.name };
        };
        
        // Helper to format airport object for payload (strips 'name')
        const formatAirport = (airport: any) => {
            if (!airport) return { iataCode: '', country: '' };
            return { iataCode: airport.iataCode, country: airport.country };
        };

        const buildOutboundSegments = () => {
            const segments = [];
            const airlines = formData.airlines;
            const stops = stoppageAirportsData;

            if (formData.route.stoppageType !== 'stoppage' || stops.length === 0) {
                // --- Direct Flight ---
                segments.push({
                    segmentNumber: 1,
                    airline: formatAirline(airlines[0]),
                    flightNumber: formData.route.departureFlightNumber,
                    from: formatAirport(fromAirportData),
                    to: formatAirport(toAirportData),
                    hasLayover: false
                });
                return segments;
            }

            // --- Stoppage Flight ---
            
            // Segment 1: Origin -> Stop 1 (e.g., DXB -> LHR)
            segments.push({
                segmentNumber: 1,
                airline: formatAirline(airlines[0]),
                flightNumber: formData.route.departureFlightNumber,
                from: formatAirport(fromAirportData),
                to: formatAirport(stops[0]),
                hasLayover: true,
                layover: {
                    airport: stops[0].iataCode,
                    airportName: stops[0].name
                }
            });

            // Intermediate Segments: Stop[i] -> Stop[i+1]
            for (let i = 0; i < stops.length - 1; i++) {
                const currentStop = stops[i];
                const nextStop = stops[i+1];
                segments.push({
                    segmentNumber: i + 2,
                    airline: formatAirline(airlines[i + 1]),
                    flightNumber: currentStop.departureFlightNumber,
                    from: formatAirport(currentStop),
                    to: formatAirport(nextStop),
                    hasLayover: true,
                    layover: {
                        airport: nextStop.iataCode,
                        airportName: nextStop.name
                    }
                });
            }

            // Final Segment: Last Stop -> Destination (e.g., LHR -> JFK)
            const lastStop = stops[stops.length - 1];
            segments.push({
                segmentNumber: stops.length + 1,
                airline: formatAirline(airlines[stops.length]),
                flightNumber: lastStop.departureFlightNumber,
                from: formatAirport(lastStop),
                to: formatAirport(toAirportData),
                hasLayover: false
            });

            return segments;
        };

        const buildReturnSegments = () => {
            if (!formData.route.isRoundTrip) return [];

            const segments = [];
            const airlines = formData.airlines;
            const stops = stoppageAirportsData;

            if (formData.route.stoppageType !== 'stoppage' || stops.length === 0) {
                // --- Direct Flight ---
                segments.push({
                    segmentNumber: 1,
                    airline: formatAirline(airlines[0]),
                    flightNumber: formData.route.returnFlightNumber,
                    from: formatAirport(toAirportData),
                    to: formatAirport(fromAirportData),
                    hasLayover: false
                });
                return segments;
            }

            // --- Stoppage Flight ---

            // Segment 1: Destination -> Last Stop (e.g., JFK -> LHR)
            const lastStop = stops[stops.length - 1];
            segments.push({
                segmentNumber: 1,
                airline: formatAirline(airlines[stops.length]), // Airline for the last leg
                flightNumber: lastStop.returnFlightNumber,
                from: formatAirport(toAirportData),
                to: formatAirport(lastStop),
                hasLayover: true,
                layover: {
                    airport: lastStop.iataCode,
                    airportName: lastStop.name
                }
            });

            // Intermediate Segments: Stop[i] -> Stop[i-1] (running in reverse)
            for (let i = stops.length - 1; i > 0; i--) {
                const currentStop = stops[i]; // e.g., Stop 2
                const prevStop = stops[i-1]; // e.g., Stop 1
                segments.push({
                    segmentNumber: segments.length + 1,
                    airline: formatAirline(airlines[i]), // Airline for this leg
                    flightNumber: prevStop.returnFlightNumber, // Flight num from *previous* stop
                    from: formatAirport(currentStop),
                    to: formatAirport(prevStop),
                    hasLayover: true,
                    layover: {
                        airport: prevStop.iataCode,
                        airportName: prevStop.name
                    }
                });
            }

            // Final Segment: Stop 1 -> Origin (e.g., LHR -> DXB)
            const firstStop = stops[0];
            segments.push({
                segmentNumber: segments.length + 1,
                airline: formatAirline(airlines[0]), // Airline for the first leg
                flightNumber: formData.route.returnFlightNumber, // The "Final Return" flight number
                from: formatAirport(firstStop),
                to: formatAirport(fromAirportData),
                hasLayover: false
            });

            return segments;
        };


        // --- (STEP 4) Call the builder functions ---
        const outboundSegments = buildOutboundSegments();
        const returnSegments = buildReturnSegments();


        const formatCommission = (comm: { type: string, value: number }) => ({
            type: comm.type === 'fixed' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
            value: comm.value
        });

        const classesPayload = [];
        if (formData.availability.class1.total > 0) {
            classesPayload.push({
                classId: 1,
                className: "Economy",
                totalSeats: formData.availability.class1.total,
                bookedSeats: formData.availability.class1.booked,
                availableSeats: formData.availability.class1.total - formData.availability.class1.booked,
                currency: formData.pricing.currency,
                pricing: {
                    adult: { price: formData.pricing.class1.adult.price, commission: formatCommission(formData.pricing.class1.adult.commission) },
                    // UPDATED: Use children instead of child
                    children: { price: formData.pricing.class1.children.price, commission: formatCommission(formData.pricing.class1.children.commission) },
                    infant: { price: formData.pricing.class1.infant.price, commission: formatCommission(formData.pricing.class1.infant.commission) }
                }
            });
        }
        if (formData.availability.class2.total > 0) {
            classesPayload.push({
                classId: 2,
                className: "Business",
                totalSeats: formData.availability.class2.total,
                bookedSeats: formData.availability.class2.booked,
                availableSeats: formData.availability.class2.total - formData.availability.class2.booked,
                currency: formData.pricing.currency,
                pricing: {
                    adult: { price: formData.pricing.class2.adult.price, commission: formatCommission(formData.pricing.class2.adult.commission) },
                    // UPDATED: Use children instead of child
                    children: { price: formData.pricing.class2.children.price, commission: formatCommission(formData.pricing.class2.children.commission) },
                    infant: { price: formData.pricing.class2.infant.price, commission: formatCommission(formData.pricing.class2.infant.commission) }
                }
            });
        }
        if (formData.availability.class3.total > 0) {
            classesPayload.push({
                classId: 3,
                className: "First",
                totalSeats: formData.availability.class3.total,
                bookedSeats: formData.availability.class3.booked,
                availableSeats: formData.availability.class3.total - formData.availability.class3.booked,
                currency: formData.pricing.currency,
                pricing: {
                    adult: { price: formData.pricing.class3.adult.price, commission: formatCommission(formData.pricing.class3.adult.commission) },
                    // UPDATED: Use children instead of child
                    children: { price: formData.pricing.class3.children.price, commission: formatCommission(formData.pricing.class3.children.commission) },
                    infant: { price: formData.pricing.class3.infant.price, commission: formatCommission(formData.pricing.class3.infant.commission) }
                }
            });
        }

        // --- NEW: Helper for HH:mm duration ---
        const getFlightDuration = (startStr: string, endStr: string): string => {
            if (!startStr || !endStr) return '00:00';
            const startDate = new Date(startStr);
            const endDate = new Date(endStr);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '00:00';

            let diffMs = endDate.getTime() - startDate.getTime();
            if (diffMs < 0) diffMs = 0; // Cannot have negative duration

            const totalMinutes = Math.floor(diffMs / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        };

        // --- NEW: Helper for total minutes ---
        const getLayoverMinutes = (startStr: string, endStr: string): number => {
            if (!startStr || !endStr) return 0;
            const startDate = new Date(startStr);
            const endDate = new Date(endStr);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

            let diffMs = endDate.getTime() - startDate.getTime();
            if (diffMs < 0) diffMs = 0;

            return Math.floor(diffMs / (1000 * 60));
        };

        // --- UPDATED: availableDates payload (NEW LOGIC) ---
        const availableDatesPayload = formData.availableDates.map(d => {
            
            const outboundSegmentTimes: any[] = [];
            const returnSegmentTimes: any[] = [];
            
            // --- Build Outbound Segments ---
            if (d.stoppageDates && d.stoppageDates.length > 0) {
                // Stoppage Flight
                // Segment 1: Origin -> Stop 1
                outboundSegmentTimes.push({
                    segmentNumber: 1,
                    departureTime: getLocalTime(d.departure),
                    arrivalTime: getLocalTime(d.stoppageDates[0].arrival),
                    flightDuration: getFlightDuration(d.departure, d.stoppageDates[0].arrival),
                    layoverDuration: getFlightDuration(d.stoppageDates[0].arrival, d.stoppageDates[0].departure),
                    layoverMinutes: getLayoverMinutes(d.stoppageDates[0].arrival, d.stoppageDates[0].departure)
                });

                // Intermediate Segments
                for (let i = 0; i < d.stoppageDates.length - 1; i++) {
                    const currentStop = d.stoppageDates[i];
                    const nextStop = d.stoppageDates[i+1];
                    outboundSegmentTimes.push({
                        segmentNumber: i + 2,
                        departureTime: getLocalTime(currentStop.departure),
                        arrivalTime: getLocalTime(nextStop.arrival),
                        flightDuration: getFlightDuration(currentStop.departure, nextStop.arrival),
                        layoverDuration: getFlightDuration(nextStop.arrival, nextStop.departure),
                        layoverMinutes: getLayoverMinutes(nextStop.arrival, nextStop.departure)
                    });
                }

                // Final Segment: Last Stop -> Destination
                const lastStop = d.stoppageDates[d.stoppageDates.length - 1];
                outboundSegmentTimes.push({
                    segmentNumber: d.stoppageDates.length + 1,
                    departureTime: getLocalTime(lastStop.departure),
                    arrivalTime: getLocalTime(d.arrival),
                    flightDuration: getFlightDuration(lastStop.departure, d.arrival)
                });

            } else {
                // Direct Flight
                outboundSegmentTimes.push({
                    segmentNumber: 1,
                    departureTime: getLocalTime(d.departure),
                    arrivalTime: getLocalTime(d.arrival),
                    flightDuration: getFlightDuration(d.departure, d.arrival)
                });
            }

            // --- Build Return Segments ---
            if (formData.route.isRoundTrip) {
                if (d.returnStoppageDates && d.returnStoppageDates.length > 0) {
                    // Stoppage Flight (Return)
                    // Segment 1: Destination -> Stop 1
                    returnSegmentTimes.push({
                        segmentNumber: 1,
                        departureTime: getLocalTime(d.return), // This is Return Departure
                        arrivalTime: getLocalTime(d.returnStoppageDates[0].arrival),
                        flightDuration: getFlightDuration(d.return, d.returnStoppageDates[0].arrival),
                        layoverDuration: getFlightDuration(d.returnStoppageDates[0].arrival, d.returnStoppageDates[0].departure),
                        layoverMinutes: getLayoverMinutes(d.returnStoppageDates[0].arrival, d.returnStoppageDates[0].departure)
                    });

                    // Intermediate Segments
                    for (let i = 0; i < d.returnStoppageDates.length - 1; i++) {
                        const currentStop = d.returnStoppageDates[i];
                        const nextStop = d.returnStoppageDates[i+1];
                        returnSegmentTimes.push({
                            segmentNumber: i + 2,
                            departureTime: getLocalTime(currentStop.departure),
                            arrivalTime: getLocalTime(nextStop.arrival),
                            flightDuration: getFlightDuration(currentStop.departure, nextStop.arrival),
                            layoverDuration: getFlightDuration(nextStop.arrival, nextStop.departure),
                            layoverMinutes: getLayoverMinutes(nextStop.arrival, nextStop.departure)
                        });
                    }

                    // Final Segment: Last Stop -> Origin
                    const lastStop = d.returnStoppageDates[d.returnStoppageDates.length - 1];
                    returnSegmentTimes.push({
                        segmentNumber: d.returnStoppageDates.length + 1,
                        departureTime: getLocalTime(lastStop.departure),
                        arrivalTime: getLocalTime(d.returnArrival), // This is Return Arrival
                        flightDuration: getFlightDuration(lastStop.departure, d.returnArrival)
                    });

                } else {
                    // Direct Flight (Return)
                    returnSegmentTimes.push({
                        segmentNumber: 1,
                        departureTime: getLocalTime(d.return),
                        arrivalTime: getLocalTime(d.returnArrival),
                        flightDuration: getFlightDuration(d.return, d.returnArrival)
                    });
                }
            }
            
            return {
                departureDate: getLocalDate(d.departure),
                returnDate: formData.route.isRoundTrip ? getLocalDate(d.return) : null,
                deadline: getLocalDate(d.deadline),
                outboundSegmentTimes: outboundSegmentTimes,
                returnSegmentTimes: returnSegmentTimes.length > 0 ? returnSegmentTimes : null
            };
        });

        // --- (STEP 5) Final Payload Assembly ---
        const currentApiPayload = {
            name: formData.name || `${fromAirportData.iataCode || 'From'} to ${toAirportData.iataCode || 'To'} ${formData.route.stoppageType === 'stoppage' ? `(${stoppageAirportsData.length} Stop)` : ''}`,
            
            airlines: formData.airlines.map(a => ({
                code: a.code,
                name: a.name,
                country: a.country
            })),

            // --- UPDATED: This is the new route object ---
            route: {
                // Overall From/To
                from: formatAirport(fromAirportData),
                to: formatAirport(toAirportData),
                
                // Route properties
                tripType: formData.route.isRoundTrip ? 'ROUND_TRIP' : 'ONE_WAY',
                flightType: (formData.route.stoppageType === 'stoppage' && stoppageAirportsData.length > 0) ? 'STOPPAGE' : 'DIRECT',
                stops: stoppageAirportsData.length,

                // Segments
                outboundSegments: outboundSegments,
                returnSegments: returnSegments,
            },
            // --- End of new route object ---

            availableDates: availableDatesPayload, // --- THIS IS THE NEWLY FORMATTED ARRAY ---
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
                supplierCommission: { type: 'FIXED_AMOUNT', value: 0 },
                agencyCommission: { type: 'FIXED_AMOUNT', value: 0 },
            },
            remarks: `Block seat from ${fromAirportData.iataCode || 'N/A'} to ${toAirportData.iataCode || 'N/A'}. Stops: ${stoppageAirportsData.map(a => a.iataCode).join(', ') || 'None'}`,
        };

        try {
            const token = getAuthToken();
            if (!token) throw new Error('Authentication token not found.');

            let responseData;
            const seatId = (blockSeat as any)?._id || (blockSeat as any)?.id;

            if (seatId) {
                console.log("Update payload:", JSON.stringify(currentApiPayload, null, 2)); // Log the payload
                const response = await fetch(`${process.env.NEXT_PUBLIC_FLIGHT_URL}/block-seats/${seatId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(currentApiPayload),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to update block seat.' }));
                    throw new Error(errorData.message || 'An unknown error occurred.');
                }
                responseData = await response.json();
            } else {
                console.log("Create payload:", JSON.stringify(currentApiPayload, null, 2)); // Log the payload
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

            onSave(responseData.data || responseData);
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
                        formData={formData as any} // Pass the relevant part of formData
                        handleAirlineChange={handleAirlineChange}
                        // --- NEW: Pass stoppage state and handler ---
                        onStoppageChange={handleStoppageChange}
                        errors={errors}
                    />

                    <RouteInformation
                        formData={formData}
                        handleTripTypeChange={handleTripTypeChange}
                        
                        // --- UPDATED: Pass new props to fix the error ---
                        selectedFromAirport={selectedFromAirport}
                        selectedToAirport={selectedToAirport}
                        handleFromAirportChange={handleFromAirportChange}
                        handleToAirportChange={handleToAirportChange}
                        
                        errors={errors}
                        fromCountry={fromCountry}
                        setFromCountry={handleSetFromCountry}
                        toCountry={toCountry}
                        setToCountry={handleSetToCountry}
                        handleDepartureFlightNumberChange={handleDepartureFlightNumberChange}
                        handleReturnFlightNumberChange={handleReturnFlightNumberChange}
                        // --- NEW: Pass stoppage state and handlers ---
                        stoppageType={formData.route.stoppageType}
                        stoppageCount={formData.route.stoppageCount}
                        stoppages={formData.route.stoppages}
                        handleStoppageCountryChange={handleStoppageCountryChange}
                        handleStoppageAirportToggle={handleStoppageAirportToggle}
                        // --- NEW: Pass flight number handler ---
                        handleStoppageFlightNumberChange={handleStoppageFlightNumberChange}
                    />

                    <AvailableFlightDates
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        // --- NEW: Pass stoppage info to date builder ---
                        stoppageType={formData.route.stoppageType}
                        stoppageCount={formData.route.stoppageCount}
                        stoppageDates={formData.route.stoppageDates}
                        handleStoppageDateChange={handleStoppageDateChange}
                        // --- NEW: Pass return stoppage info ---
                        returnStoppageType={formData.route.returnStoppageType}
                        returnStoppageCount={formData.route.returnStoppageCount}
                        returnStoppageDates={formData.route.returnStoppageDates}
                        handleReturnStoppageDateChange={handleReturnStoppageDateChange}
                    />

                    <Pricing
                        formData={formData}
                        setFormData={setFormData}
                        currencies={currencies}
                        getSelectedCurrencySymbol={getSelectedCurrencySymbol}
                    />

                    <BaggageAllowance
                        formData={formData}
                        setFormData={setFormData}
                        baggageWeightOptions={[
                            { value: 20, label: '20 kg' },
                            { value: 23, label: '23 kg' },
                            { value: 30, label: '30 kg' },
                            { value: 40, label: '40 kg' },
                        ]}
                    />

                    <FareRules
                        formData={formData}
                        setFormData={setFormData}
                        handleFareRuleTemplate={handleFareRuleTemplate}
                        fareRulesTemplates={fareRulesTemplates}
                        getSelectedCurrencySymbol={getSelectedCurrencySymbol}
                    />

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
                    <div>
                        <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
                            * Required fields
                        </p>
                        {/* --- NEW: Show stoppage errors --- */}
                        {errors.stoppageAirport && (
                            <p className="text-red-500 text-sm font-medium mt-1">{errors.stoppageAirport}</p>
                        )}
                        {errors.stoppageDates && (
                            <p className="text-red-500 text-sm font-medium mt-1">{errors.stoppageDates}</p>
                        )}
                        {/* --- ERROR MESSAGES ADDED --- */}
                        {errors.stoppageFlightNumber && (
                            <p className="text-red-500 text-sm font-medium mt-1">{errors.stoppageFlightNumber}</p>
                        )}
                        {errors.departureFlightNumber && (
                            <p className="text-red-500 text-sm font-medium mt-1">{errors.departureFlightNumber}</p>
                        )}
                        {errors.returnFlightNumber && (
                            <p className="text-red-500 text-sm font-medium mt-1">{errors.returnFlightNumber}</p>
                        )}
                    </div>
                    <div className="flex space-x-4">
                        <div
                            onClick={onClose}
                            className="px-8 py-3.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer select-none"
                        >
                            Cancel
                        </div>
                        <div
                            onClick={() => !isSubmitting && handleSubmit()}
                            className={`px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}
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