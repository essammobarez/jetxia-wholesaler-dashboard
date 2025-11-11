'use client';
import React, { useState, useEffect } from 'react';
import { Plane, Save, X } from 'lucide-react';
import { BlockSeat } from './mockData';
import { availableAirlines } from './availableAirlines';
import { countriesAndAirports } from './countriesAndAirports';

// Import components
import AirlineInformation from './components/AirlineInformation';
import RouteInformation from './components/RouteInformation';
import AvailableFlightDates from './components/AvailableFlightDates';
import Pricing from './components/Pricing';
import BaggageAllowance from './components/BaggageAllowance';
import FareRules from './components/FareRules';
import AvailabilityBookings from './components/AvailabilityBookings';
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

interface AvailableDateEntry {
    departure: string;
    return: string;
    deadline: string;
    id: string;
    stoppageDates: StoppageDate[];
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
        if (Array.isArray(routeData?.stoppages) && routeData.stoppages.length > 0) {
            return routeData.stoppages.map((stop: any) => ({
                country: stop.country || '',
                airportCode: stop.iataCode || stop.code || '',
                // --- ADDED ---
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
        airline: blockSeat?.airline.name || '',
        airlineCode: blockSeat?.airline.code || '',
        airlineCountry: blockSeat?.airline.country || '',
        route: {
            from: (Array.isArray((blockSeat as any)?.route?.from) && (blockSeat as any).route.from.length > 0)
                ? (blockSeat as any).route.from[0].code
                : (typeof blockSeat?.route.from === 'string' ? blockSeat.route.from : (blockSeat?.route.from as any)?.iataCode || (blockSeat?.route.from as any)?.code || ''),
            to: (Array.isArray((blockSeat as any)?.route?.to) && (blockSeat as any).route.to.length > 0)
                ? (blockSeat as any).route.to[0].code
                : (typeof blockSeat?.route.to === 'string' ? blockSeat.route.to : (blockSeat?.route.to as any)?.iataCode || (blockSeat?.route.to as any)?.code || ''),
            departure: blockSeat?.route.departure || '',
            return: blockSeat?.route.return || '',
            deadline: '',
            isRoundTrip: blockSeat?.route.isRoundTrip !== undefined ? blockSeat.route.isRoundTrip : (blockSeat as any)?.route?.tripType === 'ROUND_TRIP' || true,
            departureFlightNumber: (blockSeat as any)?.route?.departureFlightNumber || '',
            returnFlightNumber: (blockSeat as any)?.route?.returnFlightNumber || '',
            // --- NEW STOPPAGE STATE ---
            stoppageType: initialStoppageType as 'direct' | 'stoppage' | null,
            stoppageCount: initialStoppageCount,
            // --- UPDATED STOPPAGES STATE ---
            stoppages: initialStoppages as Array<{ country: string; airportCode: string; depFlightNumber: string; retFlightNumber: string; }>,
            // --- NEW: Stoppage dates for the date builder ---
            stoppageDates: Array(initialStoppages.length).fill(null).map(() => ({ arrival: '', departure: '' })) as StoppageDate[],
        },
        // --- UPDATED: availableDates state with new type ---
        availableDates: (blockSeat?.availableDates as any[])?.map(d => ({ ...d, stoppageDates: d.stoppageDates || [] })) || [] as AvailableDateEntry[],
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
    const [selectedFromAirports, setSelectedFromAirports] = useState<string[]>([]);
    const [selectedToAirports, setSelectedToAirports] = useState<string[]>([]);
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
                setSelectedFromAirports(firstFromRoute.iataCode ? [firstFromRoute.iataCode] : []);
            } else if (fromRouteData && typeof fromRouteData === 'object' && !Array.isArray(fromRouteData)) {
                setFromCountry(fromRouteData.country || '');
                setSelectedFromAirports((fromRouteData.iataCode || fromRouteData.code) ? [(fromRouteData.iataCode || fromRouteData.code)] : []);
            }

            const toRouteData = (blockSeat as any).route?.to;
            if (Array.isArray(toRouteData) && toRouteData.length > 0) {
                const firstToRoute = toRouteData[0];
                setToCountry(firstToRoute.country || '');
                setSelectedToAirports(firstToRoute.iataCode ? [firstToRoute.iataCode] : []);
            } else if (toRouteData && typeof toRouteData === 'object' && !Array.isArray(toRouteData)) {
                setToCountry(toRouteData.country || '');
                setSelectedToAirports((toRouteData.iataCode || toRouteData.code) ? [(toRouteData.iataCode || toRouteData.code)] : []);
            }

            // --- UPDATED: Load available dates with stoppage dates ---
            if ((blockSeat as any).availableDates && (blockSeat as any).availableDates.length > 0) {
                const recombinedDates: AvailableDateEntry[] = (blockSeat as any).availableDates.map((d: any) => {
                    const departure = d.departureDate && d.departureTime ? `${d.departureDate}T${d.departureTime}:00.000` : (d.departureDate || d.departure);
                    const returnDate = d.returnDate && d.returnTime ? `${d.returnDate}T${d.returnTime}:00.000` : (d.returnDate || d.return);

                    // --- NEW: Recombine stoppage dates ---
                    const stoppageDates = (d.stoppageDates || []).map((stop: any) => ({
                        arrival: stop.arrivalDate && stop.arrivalTime ? `${stop.arrivalDate}T${stop.arrivalTime}:00.000` : (stop.arrival || ''),
                        departure: stop.departureDate && stop.departureTime ? `${stop.departureDate}T${stop.departureTime}:00.000` : (stop.departure || '')
                    }));

                    return {
                        departure: departure,
                        return: returnDate,
                        deadline: d.deadline,
                        id: d._id || d.id || Math.random().toString(36).substr(2, 9),
                        stoppageDates: stoppageDates // Add the new array
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

    const handleSetFromCountry = (country: string) => {
        setFromCountry(country);
        setSelectedFromAirports([]);
    };

    const handleSetToCountry = (country: string) => {
        setToCountry(country);
        setSelectedToAirports([]);
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

        setFormData(prev => ({
            ...prev,
            route: {
                ...prev.route,
                stoppageType,
                stoppageCount,
                // Clear stoppages if 'direct', otherwise set the new array
                stoppages: stoppageType === 'direct' ? [] : newStoppages,
                // --- NEW: Update stoppage dates array ---
                stoppageDates: stoppageType === 'direct' ? [] : newStoppageDates
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

    const toggleFromAirport = (airportCode: string) => {
        setSelectedFromAirports(prev => prev.includes(airportCode) ? prev.filter(code => code !== airportCode) : [...prev, airportCode]);
    };

    const toggleToAirport = (airportCode: string) => {
        setSelectedToAirports(prev => prev.includes(airportCode) ? prev.filter(code => code !== airportCode) : [...prev, airportCode]);
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

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.airline) newErrors.airline = 'Please select an airline';
        if (selectedFromAirports.length === 0) newErrors.from = 'Please select at least one departure airport';
        if (selectedToAirports.length === 0) newErrors.to = 'Please select at least one destination airport';

        // NEW: Validate stoppages
        if (formData.route.stoppageType === 'stoppage') {
            if (!formData.route.stoppageCount || parseInt(formData.route.stoppageCount, 10) <= 0) {
                newErrors.stoppage = 'Please select the number of stops.';
            }
            formData.route.stoppages.forEach((stop, index) => {
                if (!stop.airportCode) {
                    newErrors[`stop_${index}`] = `Please select an airport for Stop ${index + 1}.`;
                    // This error isn't displayed, but good for logic
                }
            });
            if (formData.route.stoppages.some(s => !s.airportCode)) {
                newErrors.stoppageAirport = 'Please select an airport for all specified stops.';
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

        const fromAirportsData = selectedFromAirports.map(code => {
            const airport = countriesAndAirports.flatMap(c => c.airports).find(a => a.code === code);
            const country = countriesAndAirports.find(c => c.airports.some(a => a.code === code));
            return {
                iataCode: airport?.code || code,
                country: country?.country || ''
            };
        });

        const toAirportsData = selectedToAirports.map(code => {
            const airport = countriesAndAirports.flatMap(c => c.airports).find(a => a.code === code);
            const country = countriesAndAirports.find(c => c.airports.some(a => a.code === code));
            return {
                iataCode: airport?.code || code,
                country: country?.country || ''
            };
        });

        // --- NEW: Map Stoppage Data ---
        const stoppageAirportsData = formData.route.stoppages.map(stop => {
            const airport = countriesAndAirports.flatMap(c => c.airports).find(a => a.code === stop.airportCode);
            const country = countriesAndAirports.find(c => c.country === stop.country);
            return {
                iataCode: airport?.code || stop.airportCode,
                country: country?.country || stop.country,
                // --- ADDED ---
                departureFlightNumber: stop.depFlightNumber,
                returnFlightNumber: stop.retFlightNumber
            };
        }).filter(stop => stop.iataCode); // Ensure we only send valid stops

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

        // --- UPDATED: availableDates payload ---
        const availableDatesPayload = formData.availableDates.map(d => ({
            departureDate: getLocalDate(d.departure),
            departureTime: getLocalTime(d.departure),
            returnDate: formData.route.isRoundTrip ? getLocalDate(d.return) : null,
            returnTime: formData.route.isRoundTrip ? getLocalTime(d.return) : null,
            deadline: getLocalDate(d.deadline),
            // --- NEW: Format stoppage dates for API ---
            stoppageDates: d.stoppageDates.map(stop => ({
                arrivalDate: getLocalDate(stop.arrival),
                arrivalTime: getLocalTime(stop.arrival),
                departureDate: getLocalDate(stop.departure),
                departureTime: getLocalTime(stop.departure)
            }))
        }));

        const currentApiPayload = {
            name: formData.name || `${fromAirportsData[0]?.iataCode || 'From'} to ${toAirportsData[0]?.iataCode || 'To'} ${formData.route.stoppageType === 'stoppage' ? `(${stoppageAirportsData.length} Stop)` : ''}`,
            airline: { code: formData.airlineCode, name: formData.airline, country: formData.airlineCountry },
            route: {
                from: fromAirportsData[0] || {},
                to: toAirportsData[0] || {},
                // --- NEW: Add stoppages to payload ---
                stoppages: stoppageAirportsData,
                tripType: formData.route.isRoundTrip ? 'ROUND_TRIP' : 'ONE_WAY',
                departureFlightNumber: formData.route.departureFlightNumber,
                returnFlightNumber: formData.route.returnFlightNumber,
            },
            availableDates: availableDatesPayload, // --- UPDATED ---
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
            remarks: `Block seat from ${fromAirportsData.map(a => a.iataCode).join(', ')} to ${toAirportsData.map(a => a.iataCode).join(', ')}. Stops: ${stoppageAirportsData.map(a => a.iataCode).join(', ') || 'None'}`,
        };

        try {
            const token = getAuthToken();
            if (!token) throw new Error('Authentication token not found.');

            let responseData;
            const seatId = (blockSeat as any)?._id || (blockSeat as any)?.id;

            if (seatId) {
                console.log("Update payload:", currentApiPayload);
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
                console.log("Create payload:", currentApiPayload);
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
                        selectedFromAirports={selectedFromAirports}
                        selectedToAirports={selectedToAirports}
                        toggleFromAirport={toggleFromAirport}
                        toggleToAirport={toggleToAirport}
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