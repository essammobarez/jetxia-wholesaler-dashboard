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
  Filter,
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

// Types for Block Seats
interface Airline {
  code: string;
  name: string;
  logo: string;
  flagCode: string;
  country?: string;
}

interface PriceClass {
  classType: 'Economy' | 'Business' | 'First';
  price: number;
  availableSeats: number;
  totalSeats: number;
  baggageAllowance: {
    checkedBag: string;
    handBag: string;
    weight: string;
  };
  fareRules: {
    refundable: boolean;
    changeable: boolean;
    changeFee: number;
    cancellationFee: number;
  };
}

interface BlockSeat {
  id: string;
  airline: Airline;
  flightNumber: string;
  route: {
    from: {
      code: string;
      city: string;
      country: string;
    } | string;
    to: {
      code: string;
      city: string;
      country: string;
    } | string;
    departure?: string;
    return?: string;
    isRoundTrip?: boolean;
  };
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft: string;
  priceClasses: PriceClass[];
  pricing?: {
    economy: number;
    business: number;
    first: number;
  };
  baggage?: {
    checkedBags: number;
    weight: number;
    carryOn: number;
  };
  fareRules?: {
    cancellationFee: number;
    changeFee: number;
    refundable: boolean;
  };
  availability?: {
    class1: {
    total: number;
    booked: number;
    };
    class2: {
      total: number;
      booked: number;
    };
    class3: {
      total: number;
      booked: number;
    };
  };
  supplierCommission?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
  agencyCommission?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
  availableDates?: {
    id: string;
    departure: string;
    return: string;
  }[];
  status: 'Active' | 'Sold Out' | 'Cancelled' | 'Expired' | 'Available' | 'Limited';
  createdAt: string;
  validUntil: string;
  lastUpdated?: string;
}

// Mock Airlines Data with Logos
const airlinesData: Airline[] = [
  {
    code: 'MS',
    name: 'EgyptAir',
    logo: 'https://images.kiwi.com/airlines/64/MS.png',
    flagCode: 'EG'
  },
  {
    code: 'SV',
    name: 'Saudi Arabian Airlines',
    logo: 'https://images.kiwi.com/airlines/64/SV.png',
    flagCode: 'SA'
  },
  {
    code: 'EK',
    name: 'Emirates',
    logo: 'https://images.kiwi.com/airlines/64/EK.png',
    flagCode: 'AE'
  },
  {
    code: 'QR',
    name: 'Qatar Airways',
    logo: 'https://images.kiwi.com/airlines/64/QR.png',
    flagCode: 'QA'
  },
  {
    code: 'TK',
    name: 'Turkish Airlines',
    logo: 'https://images.kiwi.com/airlines/64/TK.png',
    flagCode: 'TR'
  },
  {
    code: 'LH',
    name: 'Lufthansa',
    logo: 'https://images.kiwi.com/airlines/64/LH.png',
    flagCode: 'DE'
  }
];

// Mock Block Seats Data
const mockBlockSeats: BlockSeat[] = [
  {
    id: '1',
    airline: airlinesData[0], // EgyptAir
    flightNumber: 'MS980',
    route: {
      from: { code: 'CAI', city: 'Cairo', country: 'Egypt' },
      to: { code: 'DXB', city: 'Dubai', country: 'UAE' }
    },
    departureDate: '2025-10-20',
    departureTime: '14:30',
    arrivalTime: '17:45',
    duration: '3h 15m',
    aircraft: 'Boeing 737-800',
    priceClasses: [
      {
        classType: 'Economy',
        price: 280,
        availableSeats: 8,
        totalSeats: 25,
        baggageAllowance: {
          checkedBag: '23kg',
          handBag: '8kg',
          weight: '31kg total'
        },
        fareRules: {
          refundable: false,
          changeable: true,
          changeFee: 50,
          cancellationFee: 100
        }
      },
      {
        classType: 'Business',
        price: 290,
        availableSeats: 12,
        totalSeats: 15,
        baggageAllowance: {
          checkedBag: '32kg',
          handBag: '12kg',
          weight: '44kg total'
        },
        fareRules: {
          refundable: true,
          changeable: true,
          changeFee: 25,
          cancellationFee: 50
        }
      }
    ],
    availability: {
      class1: { total: 25, booked: 17 },
      class2: { total: 15, booked: 3 },
      class3: { total: 8, booked: 0 }
    },
    supplierCommission: { type: 'percentage', value: 5 },
    agencyCommission: { type: 'fixed', value: 20 },
    availableDates: [
      { id: '1', departure: '2025-10-20', return: '2025-10-25' },
      { id: '2', departure: '2025-10-22', return: '2025-10-27' },
      { id: '3', departure: '2025-10-24', return: '2025-10-29' }
    ],
    status: 'Active',
    createdAt: '2025-10-14',
    validUntil: '2025-10-19'
  },
  {
    id: '2',
    airline: airlinesData[2], // Emirates
    flightNumber: 'EK924',
    route: {
      from: { code: 'CAI', city: 'Cairo', country: 'Egypt' },
      to: { code: 'JFK', city: 'New York', country: 'USA' }
    },
    departureDate: '2025-10-22',
    departureTime: '02:25',
    arrivalTime: '10:15',
    duration: '12h 50m',
    aircraft: 'Boeing 777-300ER',
    priceClasses: [
      {
        classType: 'Economy',
        price: 850,
        availableSeats: 5,
        totalSeats: 30,
        baggageAllowance: {
          checkedBag: '30kg',
          handBag: '7kg',
          weight: '37kg total'
        },
        fareRules: {
          refundable: false,
          changeable: true,
          changeFee: 150,
          cancellationFee: 250
        }
      },
      {
        classType: 'Business',
        price: 2400,
        availableSeats: 8,
        totalSeats: 12,
        baggageAllowance: {
          checkedBag: '40kg',
          handBag: '12kg',
          weight: '52kg total'
        },
        fareRules: {
          refundable: true,
          changeable: true,
          changeFee: 0,
          cancellationFee: 100
        }
      }
    ],
    availability: {
      class1: { total: 30, booked: 25 },
      class2: { total: 12, booked: 4 },
      class3: { total: 8, booked: 0 }
    },
    supplierCommission: { type: 'fixed', value: 50 },
    agencyCommission: { type: 'percentage', value: 10 },
    availableDates: [
      { id: '1', departure: '2025-10-22', return: '2025-10-30' },
      { id: '2', departure: '2025-10-25', return: '2025-11-02' }
    ],
    status: 'Active',
    createdAt: '2025-10-14',
    validUntil: '2025-10-21'
  },
  {
    id: '3',
    airline: airlinesData[0], // EgyptAir - رحلة أخرى لنفس الطيران بتاريخ مختلف
    flightNumber: 'MS980',
    route: {
      from: { code: 'CAI', city: 'Cairo', country: 'Egypt' },
      to: { code: 'DXB', city: 'Dubai', country: 'UAE' }
    },
    departureDate: '2025-11-05',
    departureTime: '14:30',
    arrivalTime: '17:45',
    duration: '3h 15m',
    aircraft: 'Boeing 737-800',
    priceClasses: [
      {
        classType: 'Economy',
        price: 280,
        availableSeats: 12,
        totalSeats: 25,
        baggageAllowance: {
          checkedBag: '23kg',
          handBag: '8kg',
          weight: '31kg total'
        },
        fareRules: {
          refundable: false,
          changeable: true,
          changeFee: 50,
          cancellationFee: 100
        }
      },
      {
        classType: 'Business',
        price: 290,
        availableSeats: 15,
        totalSeats: 15,
        baggageAllowance: {
          checkedBag: '32kg',
          handBag: '12kg',
          weight: '44kg total'
        },
        fareRules: {
          refundable: true,
          changeable: true,
          changeFee: 25,
          cancellationFee: 50
        }
      }
    ],
    availability: {
      class1: { total: 25, booked: 13 },
      class2: { total: 15, booked: 0 },
      class3: { total: 8, booked: 0 }
    },
    supplierCommission: { type: 'percentage', value: 5 },
    agencyCommission: { type: 'fixed', value: 20 },
    availableDates: [
      { id: '1', departure: '2025-11-05', return: '2025-11-12' },
      { id: '2', departure: '2025-11-10', return: '2025-11-17' }
    ],
    status: 'Active',
    createdAt: '2025-10-14',
    validUntil: '2025-11-01'
  },
  {
    id: '4',
    airline: airlinesData[1], // Turkish Airlines
    flightNumber: 'TK690',
    route: {
      from: { code: 'CAI', city: 'Cairo', country: 'Egypt' },
      to: { code: 'IST', city: 'Istanbul', country: 'Turkey' }
    },
    departureDate: '2025-10-25',
    departureTime: '09:15',
    arrivalTime: '12:30',
    duration: '2h 15m',
    aircraft: 'Airbus A321',
    priceClasses: [
      {
        classType: 'Economy',
        price: 195,
        availableSeats: 20,
        totalSeats: 30,
        baggageAllowance: {
          checkedBag: '20kg',
          handBag: '8kg',
          weight: '28kg total'
        },
        fareRules: {
          refundable: false,
          changeable: true,
          changeFee: 40,
          cancellationFee: 80
        }
      },
      {
        classType: 'Business',
        price: 420,
        availableSeats: 8,
        totalSeats: 10,
        baggageAllowance: {
          checkedBag: '30kg',
          handBag: '10kg',
          weight: '40kg total'
        },
        fareRules: {
          refundable: true,
          changeable: true,
          changeFee: 20,
          cancellationFee: 40
        }
      }
    ],
    availability: {
      class1: { total: 30, booked: 10 },
      class2: { total: 10, booked: 2 },
      class3: { total: 8, booked: 0 }
    },
    supplierCommission: { type: 'percentage', value: 8 },
    agencyCommission: { type: 'percentage', value: 6 },
    availableDates: [
      { id: '1', departure: '2025-10-25', return: '2025-10-30' },
      { id: '2', departure: '2025-10-28', return: '2025-11-03' }
    ],
    status: 'Active',
    createdAt: '2025-10-14',
    validUntil: '2025-10-24'
  },
  {
    id: '5',
    airline: airlinesData[3], // Qatar Airways
    flightNumber: 'QR1302',
    route: {
      from: { code: 'CAI', city: 'Cairo', country: 'Egypt' },
      to: { code: 'BKK', city: 'Bangkok', country: 'Thailand' }
    },
    departureDate: '2025-11-01',
    departureTime: '22:50',
    arrivalTime: '13:20',
    duration: '9h 30m',
    aircraft: 'Boeing 787-9',
    priceClasses: [
      {
        classType: 'Economy',
        price: 520,
        availableSeats: 25,
        totalSeats: 40,
        baggageAllowance: {
          checkedBag: '30kg',
          handBag: '7kg',
          weight: '37kg total'
        },
        fareRules: {
          refundable: false,
          changeable: true,
          changeFee: 100,
          cancellationFee: 200
        }
      },
      {
        classType: 'Business',
        price: 1850,
        availableSeats: 12,
        totalSeats: 15,
        baggageAllowance: {
          checkedBag: '40kg',
          handBag: '15kg',
          weight: '55kg total'
        },
        fareRules: {
          refundable: true,
          changeable: true,
          changeFee: 0,
          cancellationFee: 50
        }
      }
    ],
    availability: {
      class1: { total: 40, booked: 15 },
      class2: { total: 15, booked: 3 },
      class3: { total: 10, booked: 0 }
    },
    supplierCommission: { type: 'percentage', value: 10 },
    agencyCommission: { type: 'percentage', value: 8 },
    availableDates: [
      { id: '1', departure: '2025-11-01', return: '2025-11-07' },
      { id: '2', departure: '2025-11-08', return: '2025-11-15' },
      { id: '3', departure: '2025-11-15', return: '2025-11-22' }
    ],
    status: 'Active',
    createdAt: '2025-10-14',
    validUntil: '2025-10-30'
  },
  {
    id: '6',
    airline: airlinesData[2], // Emirates - رحلة إضافية لنفس الطيران بتاريخ مختلف
    flightNumber: 'EK924',
    route: {
      from: { code: 'CAI', city: 'Cairo', country: 'Egypt' },
      to: { code: 'JFK', city: 'New York', country: 'USA' }
    },
    departureDate: '2025-11-08',
    departureTime: '02:25',
    arrivalTime: '10:15',
    duration: '12h 50m',
    aircraft: 'Boeing 777-300ER',
    priceClasses: [
      {
        classType: 'Economy',
        price: 850,
        availableSeats: 18,
        totalSeats: 30,
        baggageAllowance: {
          checkedBag: '30kg',
          handBag: '7kg',
          weight: '37kg total'
        },
        fareRules: {
          refundable: false,
          changeable: true,
          changeFee: 150,
          cancellationFee: 250
        }
      },
      {
        classType: 'Business',
        price: 2400,
        availableSeats: 10,
        totalSeats: 12,
        baggageAllowance: {
          checkedBag: '40kg',
          handBag: '12kg',
          weight: '52kg total'
        },
        fareRules: {
          refundable: true,
          changeable: true,
          changeFee: 0,
          cancellationFee: 100
        }
      }
    ],
    availability: {
      class1: { total: 30, booked: 12 },
      class2: { total: 12, booked: 2 },
      class3: { total: 8, booked: 0 }
    },
    supplierCommission: { type: 'fixed', value: 50 },
    agencyCommission: { type: 'percentage', value: 10 },
    availableDates: [
      { id: '1', departure: '2025-11-08', return: '2025-11-16' },
      { id: '2', departure: '2025-11-12', return: '2025-11-20' }
    ],
    status: 'Active',
    createdAt: '2025-10-14',
    validUntil: '2025-11-05'
  },
  {
    id: '7',
    airline: airlinesData[4], // Etihad Airways
    flightNumber: 'EY654',
    route: {
      from: { code: 'CAI', city: 'Cairo', country: 'Egypt' },
      to: { code: 'CDG', city: 'Paris', country: 'France' }
    },
    departureDate: '2025-10-26',
    departureTime: '15:40',
    arrivalTime: '19:55',
    duration: '4h 15m',
    aircraft: 'Airbus A330-300',
    priceClasses: [
      {
        classType: 'Economy',
        price: 380,
        availableSeats: 22,
        totalSeats: 35,
        baggageAllowance: {
          checkedBag: '23kg',
          handBag: '7kg',
          weight: '30kg total'
        },
        fareRules: {
          refundable: false,
          changeable: true,
          changeFee: 75,
          cancellationFee: 150
        }
      },
      {
        classType: 'Business',
        price: 980,
        availableSeats: 8,
        totalSeats: 12,
        baggageAllowance: {
          checkedBag: '32kg',
          handBag: '12kg',
          weight: '44kg total'
        },
        fareRules: {
          refundable: true,
          changeable: true,
          changeFee: 0,
          cancellationFee: 50
        }
      }
    ],
    availability: {
      class1: { total: 35, booked: 13 },
      class2: { total: 12, booked: 4 },
      class3: { total: 10, booked: 0 }
    },
    supplierCommission: { type: 'percentage', value: 12 },
    agencyCommission: { type: 'fixed', value: 40 },
    availableDates: [
      { id: '1', departure: '2025-10-26', return: '2025-10-31' },
      { id: '2', departure: '2025-11-02', return: '2025-11-07' }
    ],
    status: 'Active',
    createdAt: '2025-10-14',
    validUntil: '2025-10-25'
  },
  {
    id: '8',
    airline: airlinesData[5], // Saudia
    flightNumber: 'SV378',
    route: {
      from: { code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia' },
      to: { code: 'BCN', city: 'Barcelona', country: 'Spain' }
    },
    departureDate: '2025-10-28',
    departureTime: '08:30',
    arrivalTime: '13:45',
    duration: '6h 15m',
    aircraft: 'Boeing 787-10',
    priceClasses: [
      {
        classType: 'Economy',
        price: 450,
        availableSeats: 28,
        totalSeats: 45,
        baggageAllowance: {
          checkedBag: '23kg',
          handBag: '7kg',
          weight: '30kg total'
        },
        fareRules: {
          refundable: false,
          changeable: true,
          changeFee: 80,
          cancellationFee: 160
        }
      },
      {
        classType: 'Business',
        price: 1250,
        availableSeats: 10,
        totalSeats: 15,
        baggageAllowance: {
          checkedBag: '32kg',
          handBag: '12kg',
          weight: '44kg total'
        },
        fareRules: {
          refundable: true,
          changeable: true,
          changeFee: 0,
          cancellationFee: 75
        }
      }
    ],
    availability: {
      class1: { total: 45, booked: 17 },
      class2: { total: 15, booked: 5 },
      class3: { total: 12, booked: 0 }
    },
    supplierCommission: { type: 'percentage', value: 9 },
    agencyCommission: { type: 'percentage', value: 7 },
    availableDates: [
      { id: '1', departure: '2025-10-28', return: '2025-11-03' },
      { id: '2', departure: '2025-11-05', return: '2025-11-11' }
    ],
    status: 'Active',
    createdAt: '2025-10-14',
    validUntil: '2025-10-27'
  },
  {
    id: '9',
    airline: airlinesData[1], // Turkish Airlines - رحلة ثانية لنفس الطيران
    flightNumber: 'TK690',
    route: {
      from: { code: 'CAI', city: 'Cairo', country: 'Egypt' },
      to: { code: 'IST', city: 'Istanbul', country: 'Turkey' }
    },
    departureDate: '2025-11-12',
    departureTime: '15:45',
    arrivalTime: '19:00',
    duration: '2h 15m',
    aircraft: 'Airbus A321',
    priceClasses: [
      {
        classType: 'Economy',
        price: 195,
        availableSeats: 25,
        totalSeats: 30,
        baggageAllowance: {
          checkedBag: '20kg',
          handBag: '8kg',
          weight: '28kg total'
        },
        fareRules: {
          refundable: false,
          changeable: true,
          changeFee: 40,
          cancellationFee: 80
        }
      },
      {
        classType: 'Business',
        price: 420,
        availableSeats: 10,
        totalSeats: 10,
        baggageAllowance: {
          checkedBag: '30kg',
          handBag: '10kg',
          weight: '40kg total'
        },
        fareRules: {
          refundable: true,
          changeable: true,
          changeFee: 20,
          cancellationFee: 40
        }
      }
    ],
    availability: {
      class1: { total: 30, booked: 5 },
      class2: { total: 10, booked: 0 },
      class3: { total: 8, booked: 0 }
    },
    supplierCommission: { type: 'percentage', value: 8 },
    agencyCommission: { type: 'percentage', value: 6 },
    availableDates: [
      { id: '1', departure: '2025-11-12', return: '2025-11-17' },
      { id: '2', departure: '2025-11-19', return: '2025-11-24' }
    ],
    status: 'Active',
    createdAt: '2025-10-14',
    validUntil: '2025-11-10'
  },
  {
    id: '10',
    airline: airlinesData[6], // Air France
    flightNumber: 'AF778',
    route: {
      from: { code: 'CDG', city: 'Paris', country: 'France' },
      to: { code: 'NRT', city: 'Tokyo', country: 'Japan' }
    },
    departureDate: '2025-11-05',
    departureTime: '11:20',
    arrivalTime: '06:30',
    duration: '11h 10m',
    aircraft: 'Boeing 777-300ER',
    priceClasses: [
      {
        classType: 'Economy',
        price: 920,
        availableSeats: 30,
        totalSeats: 50,
        baggageAllowance: {
          checkedBag: '23kg',
          handBag: '12kg',
          weight: '35kg total'
        },
        fareRules: {
          refundable: false,
          changeable: true,
          changeFee: 180,
          cancellationFee: 300
        }
      },
      {
        classType: 'Business',
        price: 3200,
        availableSeats: 15,
        totalSeats: 20,
        baggageAllowance: {
          checkedBag: '32kg',
          handBag: '18kg',
          weight: '50kg total'
        },
        fareRules: {
          refundable: true,
          changeable: true,
          changeFee: 0,
          cancellationFee: 150
        }
      }
    ],
    availability: {
      class1: { total: 50, booked: 20 },
      class2: { total: 20, booked: 5 },
      class3: { total: 15, booked: 0 }
    },
    supplierCommission: { type: 'percentage', value: 10 },
    agencyCommission: { type: 'percentage', value: 12 },
    availableDates: [
      { id: '1', departure: '2025-11-05', return: '2025-11-12' },
      { id: '2', departure: '2025-11-10', return: '2025-11-17' },
      { id: '3', departure: '2025-11-20', return: '2025-11-27' }
    ],
    status: 'Active',
    createdAt: '2025-10-14',
    validUntil: '2025-11-01'
  },
  {
    id: '11',
    airline: airlinesData[7], // Lufthansa
    flightNumber: 'LH582',
    route: {
      from: { code: 'FRA', city: 'Frankfurt', country: 'Germany' },
      to: { code: 'JNB', city: 'Santorini', country: 'Greece' }
    },
    departureDate: '2025-10-30',
    departureTime: '13:50',
    arrivalTime: '17:40',
    duration: '2h 50m',
    aircraft: 'Airbus A320neo',
    priceClasses: [
      {
        classType: 'Economy',
        price: 285,
        availableSeats: 20,
        totalSeats: 30,
        baggageAllowance: {
          checkedBag: '23kg',
          handBag: '8kg',
          weight: '31kg total'
        },
        fareRules: {
          refundable: false,
          changeable: true,
          changeFee: 60,
          cancellationFee: 120
        }
      },
      {
        classType: 'Business',
        price: 650,
        availableSeats: 8,
        totalSeats: 10,
        baggageAllowance: {
          checkedBag: '32kg',
          handBag: '12kg',
          weight: '44kg total'
        },
        fareRules: {
          refundable: true,
          changeable: true,
          changeFee: 30,
          cancellationFee: 60
        }
      }
    ],
    availability: {
      class1: { total: 30, booked: 10 },
      class2: { total: 10, booked: 2 },
      class3: { total: 8, booked: 0 }
    },
    supplierCommission: { type: 'percentage', value: 11 },
    agencyCommission: { type: 'percentage', value: 8 },
    availableDates: [
      { id: '1', departure: '2025-10-30', return: '2025-11-05' },
      { id: '2', departure: '2025-11-06', return: '2025-11-12' }
    ],
    status: 'Active',
    createdAt: '2025-10-14',
    validUntil: '2025-10-28'
  }
];

const BlockSeatsModule = () => {
  const [blockSeats, setBlockSeats] = useState<BlockSeat[]>(mockBlockSeats);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBlockSeat, setSelectedBlockSeat] = useState<BlockSeat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Sold Out':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'Expired':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getClassColor = (classType: string) => {
    switch (classType) {
      case 'Economy':
        return 'bg-blue-500';
      case 'Business':
        return 'bg-purple-500';
      case 'First':
        return 'bg-gold-500';
      default:
        return 'bg-gray-500';
    }
  };

    const filteredBlockSeats = blockSeats.filter(seat => {
    const matchesSearch =
      seat.airline?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seat.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof seat.route?.from === 'string' 
        ? seat.route.from.toLowerCase().includes(searchTerm.toLowerCase())
        : seat.route?.from?.city?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof seat.route?.to === 'string'
        ? seat.route.to.toLowerCase().includes(searchTerm.toLowerCase())
        : seat.route?.to?.city?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || seat.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleDeleteBlockSeat = (id: string) => {
    if (confirm('Are you sure you want to delete this block seat?')) {
      setBlockSeats(prev => prev.filter(seat => seat.id !== id));
    }
  };

  const renderBlockSeatCard = (blockSeat: BlockSeat) => (
    <div key={blockSeat.id} className="card-modern p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center border border-gray-200 dark:border-gray-700">
            <img 
              src={blockSeat.airline?.logo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMzIgMjBMMjAgMzJMMzIgNDRMNDQgMzJMMzIgMjBaIiBmaWxsPSIjOUM5Q0EzIi8+PC9zdmc+'} 
              alt={blockSeat.airline?.name || 'Airline'}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMzIgMjBMMjAgMzJMMzIgNDRMNDQgMzJMMzIgMjBaIiBmaWxsPSIjOUM5Q0EzIi8+PC9zdmc+';
              }}
            />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {blockSeat.airline?.name || 'Unknown Airline'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {blockSeat.flightNumber} • {blockSeat.aircraft || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(blockSeat.status)}`}>
            {blockSeat.status}
          </span>
          <button
            onClick={() => setSelectedBlockSeat(blockSeat)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteBlockSeat(blockSeat.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Route Information */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="text-center flex-1">
          <p className="font-bold text-xl text-gray-900 dark:text-white mb-1">
            {Array.isArray(blockSeat.route.from) 
              ? blockSeat.route.from.map(a => a.code).join(', ')
              : typeof blockSeat.route.from === 'string' 
                ? blockSeat.route.from 
                : blockSeat.route.from.code}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {Array.isArray(blockSeat.route.from) 
              ? `${blockSeat.route.from.length} Airport${blockSeat.route.from.length > 1 ? 's' : ''}`
              : typeof blockSeat.route.from === 'string' 
                ? blockSeat.route.from 
                : blockSeat.route.from.city}
          </p>
          {Array.isArray(blockSeat.route.from) && blockSeat.route.from.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-1 justify-center">
              {blockSeat.route.from.map((airport, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                  {airport.flag} {airport.city}
                </span>
              ))}
        </div>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{blockSeat.departureTime}</p>
        </div>
        <div className="flex-1 flex items-center justify-center mx-4">
          <div className="text-center">
            <Plane className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">{blockSeat.duration}</p>
          </div>
        </div>
        <div className="text-center flex-1">
          <p className="font-bold text-xl text-gray-900 dark:text-white mb-1">
            {Array.isArray(blockSeat.route.to) 
              ? blockSeat.route.to.map(a => a.code).join(', ')
              : typeof blockSeat.route.to === 'string' 
                ? blockSeat.route.to 
                : blockSeat.route.to.code}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {Array.isArray(blockSeat.route.to) 
              ? `${blockSeat.route.to.length} Airport${blockSeat.route.to.length > 1 ? 's' : ''}`
              : typeof blockSeat.route.to === 'string' 
                ? blockSeat.route.to 
                : blockSeat.route.to.city}
          </p>
          {Array.isArray(blockSeat.route.to) && blockSeat.route.to.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-1 justify-center">
              {blockSeat.route.to.map((airport, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">
                  {airport.flag} {airport.city}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{blockSeat.arrivalTime}</p>
        </div>
      </div>

      {/* Date Information */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Departure: {new Date(blockSeat.departureDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4 mr-2" />
          <span>Valid until: {new Date(blockSeat.validUntil).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Available Airports for Frontend */}
      {((Array.isArray(blockSeat.route.from) && blockSeat.route.from.length > 0) || 
        (Array.isArray(blockSeat.route.to) && blockSeat.route.to.length > 0)) && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            Available in Frontend Search
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(blockSeat.route.from) && blockSeat.route.from.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">FROM Airports:</p>
                <div className="space-y-1">
                  {blockSeat.route.from.map((airport, idx) => (
                    <div key={idx} className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-sm flex items-center justify-between border border-blue-200 dark:border-blue-700">
                      <span className="font-medium">{airport.flag} {airport.city}</span>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">{airport.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(blockSeat.route.to) && blockSeat.route.to.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">TO Airports:</p>
                <div className="space-y-1">
                  {blockSeat.route.to.map((airport, idx) => (
                    <div key={idx} className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-sm flex items-center justify-between border border-green-200 dark:border-green-700">
                      <span className="font-medium">{airport.flag} {airport.city}</span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-bold">{airport.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 flex items-center">
            <Info className="w-3 h-3 mr-1" />
            Customers searching for these airports will find this flight
          </p>
        </div>
      )}

      {/* Available Dates */}
      {blockSeat.availableDates && blockSeat.availableDates.length > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
            Available Flight Dates ({blockSeat.availableDates.length})
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {blockSeat.availableDates.map((date) => (
              <div 
                key={date.id}
                className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-xs border border-green-200 dark:border-green-700"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {new Date(date.departure).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {new Date(date.return).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Classes */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 dark:text-white">Available Classes:</h4>
        {blockSeat.priceClasses.map((priceClass, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getClassColor(priceClass.classType)}`}></div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{priceClass.classType}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Baggage: {priceClass.baggageAllowance.checkedBag}</span>
                  <span>Refund: {priceClass.fareRules.refundable ? 'Yes' : 'No'}</span>
                  <span>Change Fee: ${priceClass.fareRules.changeFee}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${priceClass.price}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {priceClass.availableSeats}/{priceClass.totalSeats} seats
              </p>
              <div className="w-16 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                <div 
                  className="h-1 bg-blue-500 rounded-full"
                  style={{ width: `${(priceClass.availableSeats / priceClass.totalSeats) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (showAddForm) {
    return <BlockSeatForm onClose={() => setShowAddForm(false)} onSave={(newBlockSeat) => {
      setBlockSeats(prev => [...prev, { ...newBlockSeat, id: Date.now().toString() }]);
      setShowAddForm(false);
    }} />;
  }

  if (selectedBlockSeat) {
    return <BlockSeatForm 
      blockSeat={selectedBlockSeat} 
      onClose={() => setSelectedBlockSeat(null)} 
      onSave={(updatedBlockSeat) => {
        setBlockSeats(prev => prev.map(seat => 
          seat.id === updatedBlockSeat.id ? updatedBlockSeat : seat
        ));
        setSelectedBlockSeat(null);
      }} 
    />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Block Seats Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage flight inventory and pricing</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-gradient"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Block Seats
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by flight number, airline, or route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-modern pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-modern w-full sm:w-auto"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Sold Out">Sold Out</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      {/* Block Seats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBlockSeats.map(renderBlockSeatCard)}
      </div>

      {/* Empty State */}
      {filteredBlockSeats.length === 0 && (
        <div className="text-center py-12">
          <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Block Seats Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first block seats'
            }
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-gradient"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Block Seats
          </button>
        </div>
      )}
    </div>
  );
};

// Block Seat Form Component
const BlockSeatForm = ({ blockSeat: seat, onClose, onSave }: {
  blockSeat?: BlockSeat;
  onClose: () => void;
  onSave: (seat: any) => void;
}) => {
  const [formData, setFormData] = useState({
    airline: seat?.airline.name || '',
    airlineCode: seat?.airline.code || '',
    airlineCountry: seat?.airline.country || '',
    route: {
      from: typeof seat?.route.from === 'string' ? seat.route.from : seat?.route.from.code || '',
      to: typeof seat?.route.to === 'string' ? seat.route.to : seat?.route.to.code || '',
      departure: seat?.route.departure || '',
      return: seat?.route.return || '',
      isRoundTrip: seat?.route.isRoundTrip !== undefined ? seat.route.isRoundTrip : true,
    },
    availableDates: seat?.availableDates || [] as { departure: string; return: string; id: string }[],
    pricing: {
      class1: seat?.pricing?.economy || 0,
      class2: seat?.pricing?.business || 0,
      class3: seat?.pricing?.first || 0,
      currency: 'USD',
    },
    supplierCommission: {
      type: 'fixed' as 'fixed' | 'percentage',
      value: 0,
    },
    agencyCommission: {
      type: 'fixed' as 'fixed' | 'percentage',
      value: 0,
    },
    baggage: {
      checkedBags: seat?.baggage?.checkedBags || 2,
      weight: seat?.baggage?.weight || 23,
      carryOn: seat?.baggage?.carryOn || 7,
    },
    fareRules: {
      cancellationFee: seat?.fareRules?.cancellationFee || 0,
      changeFee: seat?.fareRules?.changeFee || 0,
      refundable: seat?.fareRules?.refundable || false,
    },
    availability: {
      class1: {
        total: 0,
        booked: 0,
      },
      class2: {
        total: 0,
        booked: 0,
      },
      class3: {
        total: 0,
        booked: 0,
      },
    },
    status: seat?.status || 'Available',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [airlineSearch, setAirlineSearch] = useState('');
  const [fromCountry, setFromCountry] = useState('');
  const [toCountry, setToCountry] = useState('');
  const [selectedFromAirports, setSelectedFromAirports] = useState<string[]>([]);
  const [selectedToAirports, setSelectedToAirports] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Debug: Log form data changes
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

  // List of available airlines with their logos (Major World Airlines)
  const availableAirlines = [
    // Middle East & Africa
    { name: 'EgyptAir', code: 'MS', country: 'Egypt', logo: 'https://images.kiwi.com/airlines/64/MS.png' },
    { name: 'Emirates', code: 'EK', country: 'UAE', logo: 'https://images.kiwi.com/airlines/64/EK.png' },
    { name: 'Qatar Airways', code: 'QR', country: 'Qatar', logo: 'https://images.kiwi.com/airlines/64/QR.png' },
    { name: 'Etihad Airways', code: 'EY', country: 'UAE', logo: 'https://images.kiwi.com/airlines/64/EY.png' },
    { name: 'Saudi Airlines', code: 'SV', country: 'Saudi Arabia', logo: 'https://images.kiwi.com/airlines/64/SV.png' },
    { name: 'Flynas', code: 'XY', country: 'Saudi Arabia', logo: 'https://images.kiwi.com/airlines/64/XY.png' },
    { name: 'Air Arabia', code: 'G9', country: 'UAE', logo: 'https://images.kiwi.com/airlines/64/G9.png' },
    { name: 'Flydubai', code: 'FZ', country: 'UAE', logo: 'https://images.kiwi.com/airlines/64/FZ.png' },
    { name: 'Kuwait Airways', code: 'KU', country: 'Kuwait', logo: 'https://images.kiwi.com/airlines/64/KU.png' },
    { name: 'Gulf Air', code: 'GF', country: 'Bahrain', logo: 'https://images.kiwi.com/airlines/64/GF.png' },
    { name: 'Oman Air', code: 'WY', country: 'Oman', logo: 'https://images.kiwi.com/airlines/64/WY.png' },
    { name: 'Middle East Airlines', code: 'ME', country: 'Lebanon', logo: 'https://images.kiwi.com/airlines/64/ME.png' },
    { name: 'Royal Jordanian', code: 'RJ', country: 'Jordan', logo: 'https://images.kiwi.com/airlines/64/RJ.png' },
    { name: 'Iraqi Airways', code: 'IA', country: 'Iraq', logo: 'https://images.kiwi.com/airlines/64/IA.png' },
    { name: 'Fly Baghdad', code: 'IF', country: 'Iraq', logo: 'https://images.kiwi.com/airlines/64/IF.png' },
    { name: 'Ethiopian Airlines', code: 'ET', country: 'Ethiopia', logo: 'https://images.kiwi.com/airlines/64/ET.png' },
    { name: 'Kenya Airways', code: 'KQ', country: 'Kenya', logo: 'https://images.kiwi.com/airlines/64/KQ.png' },
    { name: 'South African Airways', code: 'SA', country: 'South Africa', logo: 'https://images.kiwi.com/airlines/64/SA.png' },
    { name: 'Royal Air Maroc', code: 'AT', country: 'Morocco', logo: 'https://images.kiwi.com/airlines/64/AT.png' },
    { name: 'Air Algerie', code: 'AH', country: 'Algeria', logo: 'https://images.kiwi.com/airlines/64/AH.png' },
    { name: 'Tunisair', code: 'TU', country: 'Tunisia', logo: 'https://images.kiwi.com/airlines/64/TU.png' },
    
    // Europe
    { name: 'Turkish Airlines', code: 'TK', country: 'Turkey', logo: 'https://images.kiwi.com/airlines/64/TK.png' },
    { name: 'Lufthansa', code: 'LH', country: 'Germany', logo: 'https://images.kiwi.com/airlines/64/LH.png' },
    { name: 'British Airways', code: 'BA', country: 'UK', logo: 'https://images.kiwi.com/airlines/64/BA.png' },
    { name: 'Air France', code: 'AF', country: 'France', logo: 'https://images.kiwi.com/airlines/64/AF.png' },
    { name: 'KLM', code: 'KL', country: 'Netherlands', logo: 'https://images.kiwi.com/airlines/64/KL.png' },
    { name: 'Alitalia', code: 'AZ', country: 'Italy', logo: 'https://images.kiwi.com/airlines/64/AZ.png' },
    { name: 'Iberia', code: 'IB', country: 'Spain', logo: 'https://images.kiwi.com/airlines/64/IB.png' },
    { name: 'Swiss International', code: 'LX', country: 'Switzerland', logo: 'https://images.kiwi.com/airlines/64/LX.png' },
    { name: 'Austrian Airlines', code: 'OS', country: 'Austria', logo: 'https://images.kiwi.com/airlines/64/OS.png' },
    { name: 'Brussels Airlines', code: 'SN', country: 'Belgium', logo: 'https://images.kiwi.com/airlines/64/SN.png' },
    { name: 'Scandinavian Airlines', code: 'SK', country: 'Sweden', logo: 'https://images.kiwi.com/airlines/64/SK.png' },
    { name: 'Finnair', code: 'AY', country: 'Finland', logo: 'https://images.kiwi.com/airlines/64/AY.png' },
    { name: 'Aeroflot', code: 'SU', country: 'Russia', logo: 'https://images.kiwi.com/airlines/64/SU.png' },
    { name: 'LOT Polish Airlines', code: 'LO', country: 'Poland', logo: 'https://images.kiwi.com/airlines/64/LO.png' },
    { name: 'Czech Airlines', code: 'OK', country: 'Czech Republic', logo: 'https://images.kiwi.com/airlines/64/OK.png' },
    { name: 'Air Serbia', code: 'JU', country: 'Serbia', logo: 'https://images.kiwi.com/airlines/64/JU.png' },
    { name: 'TAP Air Portugal', code: 'TP', country: 'Portugal', logo: 'https://images.kiwi.com/airlines/64/TP.png' },
    { name: 'Aegean Airlines', code: 'A3', country: 'Greece', logo: 'https://images.kiwi.com/airlines/64/A3.png' },
    { name: 'Ryanair', code: 'FR', country: 'Ireland', logo: 'https://images.kiwi.com/airlines/64/FR.png' },
    { name: 'EasyJet', code: 'U2', country: 'UK', logo: 'https://images.kiwi.com/airlines/64/U2.png' },
    { name: 'Wizz Air', code: 'W6', country: 'Hungary', logo: 'https://images.kiwi.com/airlines/64/W6.png' },
    { name: 'Norwegian Air', code: 'DY', country: 'Norway', logo: 'https://images.kiwi.com/airlines/64/DY.png' },
    { name: 'Vueling', code: 'VY', country: 'Spain', logo: 'https://images.kiwi.com/airlines/64/VY.png' },
    { name: 'Pegasus Airlines', code: 'PC', country: 'Turkey', logo: 'https://images.kiwi.com/airlines/64/PC.png' },
    
    // North America
    { name: 'American Airlines', code: 'AA', country: 'USA', logo: 'https://images.kiwi.com/airlines/64/AA.png' },
    { name: 'Delta Air Lines', code: 'DL', country: 'USA', logo: 'https://images.kiwi.com/airlines/64/DL.png' },
    { name: 'United Airlines', code: 'UA', country: 'USA', logo: 'https://images.kiwi.com/airlines/64/UA.png' },
    { name: 'Southwest Airlines', code: 'WN', country: 'USA', logo: 'https://images.kiwi.com/airlines/64/WN.png' },
    { name: 'JetBlue Airways', code: 'B6', country: 'USA', logo: 'https://images.kiwi.com/airlines/64/B6.png' },
    { name: 'Alaska Airlines', code: 'AS', country: 'USA', logo: 'https://images.kiwi.com/airlines/64/AS.png' },
    { name: 'Spirit Airlines', code: 'NK', country: 'USA', logo: 'https://images.kiwi.com/airlines/64/NK.png' },
    { name: 'Frontier Airlines', code: 'F9', country: 'USA', logo: 'https://images.kiwi.com/airlines/64/F9.png' },
    { name: 'Air Canada', code: 'AC', country: 'Canada', logo: 'https://images.kiwi.com/airlines/64/AC.png' },
    { name: 'WestJet', code: 'WS', country: 'Canada', logo: 'https://images.kiwi.com/airlines/64/WS.png' },
    { name: 'Aeromexico', code: 'AM', country: 'Mexico', logo: 'https://images.kiwi.com/airlines/64/AM.png' },
    { name: 'Volaris', code: 'Y4', country: 'Mexico', logo: 'https://images.kiwi.com/airlines/64/Y4.png' },
    
    // Asia Pacific
    { name: 'Singapore Airlines', code: 'SQ', country: 'Singapore', logo: 'https://images.kiwi.com/airlines/64/SQ.png' },
    { name: 'Cathay Pacific', code: 'CX', country: 'Hong Kong', logo: 'https://images.kiwi.com/airlines/64/CX.png' },
    { name: 'Japan Airlines', code: 'JL', country: 'Japan', logo: 'https://images.kiwi.com/airlines/64/JL.png' },
    { name: 'All Nippon Airways', code: 'NH', country: 'Japan', logo: 'https://images.kiwi.com/airlines/64/NH.png' },
    { name: 'Korean Air', code: 'KE', country: 'South Korea', logo: 'https://images.kiwi.com/airlines/64/KE.png' },
    { name: 'Asiana Airlines', code: 'OZ', country: 'South Korea', logo: 'https://images.kiwi.com/airlines/64/OZ.png' },
    { name: 'China Southern', code: 'CZ', country: 'China', logo: 'https://images.kiwi.com/airlines/64/CZ.png' },
    { name: 'China Eastern', code: 'MU', country: 'China', logo: 'https://images.kiwi.com/airlines/64/MU.png' },
    { name: 'Air China', code: 'CA', country: 'China', logo: 'https://images.kiwi.com/airlines/64/CA.png' },
    { name: 'Hainan Airlines', code: 'HU', country: 'China', logo: 'https://images.kiwi.com/airlines/64/HU.png' },
    { name: 'Thai Airways', code: 'TG', country: 'Thailand', logo: 'https://images.kiwi.com/airlines/64/TG.png' },
    { name: 'Malaysia Airlines', code: 'MH', country: 'Malaysia', logo: 'https://images.kiwi.com/airlines/64/MH.png' },
    { name: 'Garuda Indonesia', code: 'GA', country: 'Indonesia', logo: 'https://images.kiwi.com/airlines/64/GA.png' },
    { name: 'Philippine Airlines', code: 'PR', country: 'Philippines', logo: 'https://images.kiwi.com/airlines/64/PR.png' },
    { name: 'Vietnam Airlines', code: 'VN', country: 'Vietnam', logo: 'https://images.kiwi.com/airlines/64/VN.png' },
    { name: 'Air India', code: 'AI', country: 'India', logo: 'https://images.kiwi.com/airlines/64/AI.png' },
    { name: 'IndiGo', code: '6E', country: 'India', logo: 'https://images.kiwi.com/airlines/64/6E.png' },
    { name: 'SpiceJet', code: 'SG', country: 'India', logo: 'https://images.kiwi.com/airlines/64/SG.png' },
    { name: 'Pakistan International', code: 'PK', country: 'Pakistan', logo: 'https://images.kiwi.com/airlines/64/PK.png' },
    { name: 'Qantas', code: 'QF', country: 'Australia', logo: 'https://images.kiwi.com/airlines/64/QF.png' },
    { name: 'Air New Zealand', code: 'NZ', country: 'New Zealand', logo: 'https://images.kiwi.com/airlines/64/NZ.png' },
    { name: 'AirAsia', code: 'AK', country: 'Malaysia', logo: 'https://images.kiwi.com/airlines/64/AK.png' },
    { name: 'Cebu Pacific', code: '5J', country: 'Philippines', logo: 'https://images.kiwi.com/airlines/64/5J.png' },
    { name: 'Jetstar', code: 'JQ', country: 'Australia', logo: 'https://images.kiwi.com/airlines/64/JQ.png' },
    { name: 'Scoot', code: 'TR', country: 'Singapore', logo: 'https://images.kiwi.com/airlines/64/TR.png' },
    
    // South America
    { name: 'LATAM Airlines', code: 'LA', country: 'Chile', logo: 'https://images.kiwi.com/airlines/64/LA.png' },
    { name: 'Avianca', code: 'AV', country: 'Colombia', logo: 'https://images.kiwi.com/airlines/64/AV.png' },
    { name: 'Copa Airlines', code: 'CM', country: 'Panama', logo: 'https://images.kiwi.com/airlines/64/CM.png' },
    { name: 'Azul Brazilian', code: 'AD', country: 'Brazil', logo: 'https://images.kiwi.com/airlines/64/AD.png' },
    { name: 'GOL Linhas', code: 'G3', country: 'Brazil', logo: 'https://images.kiwi.com/airlines/64/G3.png' },
    { name: 'Aerolineas Argentinas', code: 'AR', country: 'Argentina', logo: 'https://images.kiwi.com/airlines/64/AR.png' },
  ];

  // Countries and their airports
  const countriesAndAirports = [
    // Middle East
    { country: 'Egypt', flag: '🇪🇬', airports: [{ code: 'CAI', city: 'Cairo' }, { code: 'SSH', city: 'Sharm El Sheikh' }, { code: 'HRG', city: 'Hurghada' }, { code: 'LXR', city: 'Luxor' }, { code: 'ASW', city: 'Aswan' }, { code: 'ALY', city: 'Alexandria' }] },
    { country: 'UAE', flag: '🇦🇪', airports: [{ code: 'DXB', city: 'Dubai' }, { code: 'AUH', city: 'Abu Dhabi' }, { code: 'SHJ', city: 'Sharjah' }] },
    { country: 'Saudi Arabia', flag: '🇸🇦', airports: [{ code: 'JED', city: 'Jeddah' }, { code: 'RUH', city: 'Riyadh' }, { code: 'DMM', city: 'Dammam' }, { code: 'MED', city: 'Medina' }] },
    { country: 'Qatar', flag: '🇶🇦', airports: [{ code: 'DOH', city: 'Doha' }] },
    { country: 'Kuwait', flag: '🇰🇼', airports: [{ code: 'KWI', city: 'Kuwait City' }] },
    { country: 'Iraq', flag: '🇮🇶', airports: [{ code: 'BGW', city: 'Baghdad' }, { code: 'BSR', city: 'Basra' }, { code: 'EBL', city: 'Erbil' }] },
    { country: 'Oman', flag: '🇴🇲', airports: [{ code: 'MCT', city: 'Muscat' }, { code: 'SLL', city: 'Salalah' }] },
    { country: 'Bahrain', flag: '🇧🇭', airports: [{ code: 'BAH', city: 'Manama' }] },
    { country: 'Jordan', flag: '🇯🇴', airports: [{ code: 'AMM', city: 'Amman' }, { code: 'AQJ', city: 'Aqaba' }] },
    { country: 'Lebanon', flag: '🇱🇧', airports: [{ code: 'BEY', city: 'Beirut' }] },
    { country: 'Syria', flag: '🇸🇾', airports: [{ code: 'DAM', city: 'Damascus' }] },
    { country: 'Yemen', flag: '🇾🇪', airports: [{ code: 'SAH', city: 'Sanaa' }] },
    { country: 'Iran', flag: '🇮🇷', airports: [{ code: 'THR', city: 'Tehran' }, { code: 'IKA', city: 'Tehran Imam Khomeini' }] },
    { country: 'Israel', flag: '🇮🇱', airports: [{ code: 'TLV', city: 'Tel Aviv' }] },
    { country: 'Palestine', flag: '🇵🇸', airports: [{ code: 'GZA', city: 'Gaza' }] },
    
    // Europe
    { country: 'UK', flag: '🇬🇧', airports: [{ code: 'LHR', city: 'London Heathrow' }, { code: 'LGW', city: 'London Gatwick' }, { code: 'MAN', city: 'Manchester' }, { code: 'EDI', city: 'Edinburgh' }, { code: 'BHX', city: 'Birmingham' }] },
    { country: 'France', flag: '🇫🇷', airports: [{ code: 'CDG', city: 'Paris CDG' }, { code: 'ORY', city: 'Paris Orly' }, { code: 'NCE', city: 'Nice' }, { code: 'LYS', city: 'Lyon' }, { code: 'MRS', city: 'Marseille' }] },
    { country: 'Germany', flag: '🇩🇪', airports: [{ code: 'FRA', city: 'Frankfurt' }, { code: 'MUC', city: 'Munich' }, { code: 'BER', city: 'Berlin' }, { code: 'DUS', city: 'Düsseldorf' }, { code: 'HAM', city: 'Hamburg' }] },
    { country: 'Italy', flag: '🇮🇹', airports: [{ code: 'FCO', city: 'Rome Fiumicino' }, { code: 'MXP', city: 'Milan Malpensa' }, { code: 'VCE', city: 'Venice' }, { code: 'NAP', city: 'Naples' }, { code: 'FLR', city: 'Florence' }] },
    { country: 'Spain', flag: '🇪🇸', airports: [{ code: 'MAD', city: 'Madrid' }, { code: 'BCN', city: 'Barcelona' }, { code: 'AGP', city: 'Malaga' }, { code: 'SVQ', city: 'Seville' }, { code: 'PMI', city: 'Palma Mallorca' }] },
    { country: 'Netherlands', flag: '🇳🇱', airports: [{ code: 'AMS', city: 'Amsterdam' }] },
    { country: 'Belgium', flag: '🇧🇪', airports: [{ code: 'BRU', city: 'Brussels' }] },
    { country: 'Switzerland', flag: '🇨🇭', airports: [{ code: 'ZRH', city: 'Zurich' }, { code: 'GVA', city: 'Geneva' }] },
    { country: 'Austria', flag: '🇦🇹', airports: [{ code: 'VIE', city: 'Vienna' }] },
    { country: 'Greece', flag: '🇬🇷', airports: [{ code: 'ATH', city: 'Athens' }, { code: 'HER', city: 'Heraklion' }, { code: 'SKG', city: 'Thessaloniki' }] },
    { country: 'Turkey', flag: '🇹🇷', airports: [{ code: 'IST', city: 'Istanbul' }, { code: 'SAW', city: 'Istanbul Sabiha' }, { code: 'AYT', city: 'Antalya' }, { code: 'ESB', city: 'Ankara' }, { code: 'IZM', city: 'Izmir' }] },
    { country: 'Portugal', flag: '🇵🇹', airports: [{ code: 'LIS', city: 'Lisbon' }, { code: 'OPO', city: 'Porto' }, { code: 'FAO', city: 'Faro' }] },
    { country: 'Poland', flag: '🇵🇱', airports: [{ code: 'WAW', city: 'Warsaw' }, { code: 'KRK', city: 'Krakow' }] },
    { country: 'Czech Republic', flag: '🇨🇿', airports: [{ code: 'PRG', city: 'Prague' }] },
    { country: 'Hungary', flag: '🇭🇺', airports: [{ code: 'BUD', city: 'Budapest' }] },
    { country: 'Romania', flag: '🇷🇴', airports: [{ code: 'OTP', city: 'Bucharest' }] },
    { country: 'Ireland', flag: '🇮🇪', airports: [{ code: 'DUB', city: 'Dublin' }] },
    { country: 'Sweden', flag: '🇸🇪', airports: [{ code: 'ARN', city: 'Stockholm' }, { code: 'GOT', city: 'Gothenburg' }] },
    { country: 'Norway', flag: '🇳🇴', airports: [{ code: 'OSL', city: 'Oslo' }] },
    { country: 'Denmark', flag: '🇩🇰', airports: [{ code: 'CPH', city: 'Copenhagen' }] },
    { country: 'Finland', flag: '🇫🇮', airports: [{ code: 'HEL', city: 'Helsinki' }] },
    { country: 'Russia', flag: '🇷🇺', airports: [{ code: 'SVO', city: 'Moscow Sheremetyevo' }, { code: 'DME', city: 'Moscow Domodedovo' }, { code: 'LED', city: 'St Petersburg' }] },
    { country: 'Ukraine', flag: '🇺🇦', airports: [{ code: 'KBP', city: 'Kyiv' }] },
    
    // Asia
    { country: 'China', flag: '🇨🇳', airports: [{ code: 'PEK', city: 'Beijing' }, { code: 'PVG', city: 'Shanghai Pudong' }, { code: 'CAN', city: 'Guangzhou' }, { code: 'HKG', city: 'Hong Kong' }, { code: 'SZX', city: 'Shenzhen' }] },
    { country: 'Japan', flag: '🇯🇵', airports: [{ code: 'NRT', city: 'Tokyo Narita' }, { code: 'HND', city: 'Tokyo Haneda' }, { code: 'KIX', city: 'Osaka' }, { code: 'NGO', city: 'Nagoya' }] },
    { country: 'South Korea', flag: '🇰🇷', airports: [{ code: 'ICN', city: 'Seoul Incheon' }, { code: 'GMP', city: 'Seoul Gimpo' }, { code: 'PUS', city: 'Busan' }] },
    { country: 'India', flag: '🇮🇳', airports: [{ code: 'DEL', city: 'Delhi' }, { code: 'BOM', city: 'Mumbai' }, { code: 'BLR', city: 'Bangalore' }, { code: 'MAA', city: 'Chennai' }, { code: 'CCU', city: 'Kolkata' }] },
    { country: 'Pakistan', flag: '🇵🇰', airports: [{ code: 'KHI', city: 'Karachi' }, { code: 'LHE', city: 'Lahore' }, { code: 'ISB', city: 'Islamabad' }] },
    { country: 'Bangladesh', flag: '🇧🇩', airports: [{ code: 'DAC', city: 'Dhaka' }] },
    { country: 'Sri Lanka', flag: '🇱🇰', airports: [{ code: 'CMB', city: 'Colombo' }] },
    { country: 'Nepal', flag: '🇳🇵', airports: [{ code: 'KTM', city: 'Kathmandu' }] },
    { country: 'Thailand', flag: '🇹🇭', airports: [{ code: 'BKK', city: 'Bangkok Suvarnabhumi' }, { code: 'DMK', city: 'Bangkok Don Mueang' }, { code: 'HKT', city: 'Phuket' }, { code: 'CNX', city: 'Chiang Mai' }] },
    { country: 'Vietnam', flag: '🇻🇳', airports: [{ code: 'SGN', city: 'Ho Chi Minh' }, { code: 'HAN', city: 'Hanoi' }] },
    { country: 'Singapore', flag: '🇸🇬', airports: [{ code: 'SIN', city: 'Singapore' }] },
    { country: 'Malaysia', flag: '🇲🇾', airports: [{ code: 'KUL', city: 'Kuala Lumpur' }, { code: 'PEN', city: 'Penang' }] },
    { country: 'Indonesia', flag: '🇮🇩', airports: [{ code: 'CGK', city: 'Jakarta' }, { code: 'DPS', city: 'Bali' }, { code: 'SUB', city: 'Surabaya' }] },
    { country: 'Philippines', flag: '🇵🇭', airports: [{ code: 'MNL', city: 'Manila' }, { code: 'CEB', city: 'Cebu' }] },
    { country: 'Cambodia', flag: '🇰🇭', airports: [{ code: 'PNH', city: 'Phnom Penh' }, { code: 'REP', city: 'Siem Reap' }] },
    { country: 'Myanmar', flag: '🇲🇲', airports: [{ code: 'RGN', city: 'Yangon' }] },
    { country: 'Laos', flag: '🇱🇦', airports: [{ code: 'VTE', city: 'Vientiane' }] },
    { country: 'Azerbaijan', flag: '🇦🇿', airports: [{ code: 'GYD', city: 'Baku' }] },
    { country: 'Georgia', flag: '🇬🇪', airports: [{ code: 'TBS', city: 'Tbilisi' }] },
    { country: 'Armenia', flag: '🇦🇲', airports: [{ code: 'EVN', city: 'Yerevan' }] },
    { country: 'Kazakhstan', flag: '🇰🇿', airports: [{ code: 'ALA', city: 'Almaty' }] },
    { country: 'Uzbekistan', flag: '🇺🇿', airports: [{ code: 'TAS', city: 'Tashkent' }] },
    
    // Americas
    { country: 'USA', flag: '🇺🇸', airports: [{ code: 'JFK', city: 'New York JFK' }, { code: 'LAX', city: 'Los Angeles' }, { code: 'ORD', city: 'Chicago' }, { code: 'MIA', city: 'Miami' }, { code: 'ATL', city: 'Atlanta' }, { code: 'SFO', city: 'San Francisco' }, { code: 'DFW', city: 'Dallas' }, { code: 'LAS', city: 'Las Vegas' }] },
    { country: 'Canada', flag: '🇨🇦', airports: [{ code: 'YYZ', city: 'Toronto' }, { code: 'YVR', city: 'Vancouver' }, { code: 'YUL', city: 'Montreal' }, { code: 'YYC', city: 'Calgary' }] },
    { country: 'Mexico', flag: '🇲🇽', airports: [{ code: 'MEX', city: 'Mexico City' }, { code: 'CUN', city: 'Cancun' }, { code: 'GDL', city: 'Guadalajara' }] },
    { country: 'Brazil', flag: '🇧🇷', airports: [{ code: 'GRU', city: 'São Paulo' }, { code: 'GIG', city: 'Rio de Janeiro' }, { code: 'BSB', city: 'Brasilia' }] },
    { country: 'Argentina', flag: '🇦🇷', airports: [{ code: 'EZE', city: 'Buenos Aires' }] },
    { country: 'Chile', flag: '🇨🇱', airports: [{ code: 'SCL', city: 'Santiago' }] },
    { country: 'Colombia', flag: '🇨🇴', airports: [{ code: 'BOG', city: 'Bogota' }, { code: 'MDE', city: 'Medellin' }] },
    { country: 'Peru', flag: '🇵🇪', airports: [{ code: 'LIM', city: 'Lima' }] },
    { country: 'Venezuela', flag: '🇻🇪', airports: [{ code: 'CCS', city: 'Caracas' }] },
    { country: 'Ecuador', flag: '🇪🇨', airports: [{ code: 'UIO', city: 'Quito' }] },
    { country: 'Panama', flag: '🇵🇦', airports: [{ code: 'PTY', city: 'Panama City' }] },
    { country: 'Costa Rica', flag: '🇨🇷', airports: [{ code: 'SJO', city: 'San Jose' }] },
    { country: 'Cuba', flag: '🇨🇺', airports: [{ code: 'HAV', city: 'Havana' }] },
    { country: 'Dominican Republic', flag: '🇩🇴', airports: [{ code: 'SDQ', city: 'Santo Domingo' }, { code: 'PUJ', city: 'Punta Cana' }] },
    { country: 'Jamaica', flag: '🇯🇲', airports: [{ code: 'KIN', city: 'Kingston' }] },
    
    // Africa
    { country: 'South Africa', flag: '🇿🇦', airports: [{ code: 'JNB', city: 'Johannesburg' }, { code: 'CPT', city: 'Cape Town' }, { code: 'DUR', city: 'Durban' }] },
    { country: 'Nigeria', flag: '🇳🇬', airports: [{ code: 'LOS', city: 'Lagos' }, { code: 'ABV', city: 'Abuja' }] },
    { country: 'Kenya', flag: '🇰🇪', airports: [{ code: 'NBO', city: 'Nairobi' }] },
    { country: 'Ethiopia', flag: '🇪🇹', airports: [{ code: 'ADD', city: 'Addis Ababa' }] },
    { country: 'Morocco', flag: '🇲🇦', airports: [{ code: 'CMN', city: 'Casablanca' }, { code: 'RAK', city: 'Marrakech' }] },
    { country: 'Algeria', flag: '🇩🇿', airports: [{ code: 'ALG', city: 'Algiers' }] },
    { country: 'Tunisia', flag: '🇹🇳', airports: [{ code: 'TUN', city: 'Tunis' }] },
    { country: 'Libya', flag: '🇱🇾', airports: [{ code: 'TIP', city: 'Tripoli' }] },
    { country: 'Ghana', flag: '🇬🇭', airports: [{ code: 'ACC', city: 'Accra' }] },
    { country: 'Senegal', flag: '🇸🇳', airports: [{ code: 'DSS', city: 'Dakar' }] },
    { country: 'Ivory Coast', flag: '🇨🇮', airports: [{ code: 'ABJ', city: 'Abidjan' }] },
    { country: 'Tanzania', flag: '🇹🇿', airports: [{ code: 'DAR', city: 'Dar es Salaam' }] },
    { country: 'Uganda', flag: '🇺🇬', airports: [{ code: 'EBB', city: 'Entebbe' }] },
    { country: 'Zimbabwe', flag: '🇿🇼', airports: [{ code: 'HRE', city: 'Harare' }] },
    { country: 'Zambia', flag: '🇿🇲', airports: [{ code: 'LUN', city: 'Lusaka' }] },
    { country: 'Mozambique', flag: '🇲🇿', airports: [{ code: 'MPM', city: 'Maputo' }] },
    { country: 'Botswana', flag: '🇧🇼', airports: [{ code: 'GBE', city: 'Gaborone' }] },
    { country: 'Namibia', flag: '🇳🇦', airports: [{ code: 'WDH', city: 'Windhoek' }] },
    { country: 'Angola', flag: '🇦🇴', airports: [{ code: 'LAD', city: 'Luanda' }] },
    { country: 'Congo', flag: '🇨🇬', airports: [{ code: 'BZV', city: 'Brazzaville' }] },
    { country: 'Rwanda', flag: '🇷🇼', airports: [{ code: 'KGL', city: 'Kigali' }] },
    { country: 'Cameroon', flag: '🇨🇲', airports: [{ code: 'DLA', city: 'Douala' }, { code: 'NSI', city: 'Yaounde' }] },
    { country: 'Mali', flag: '🇲🇱', airports: [{ code: 'BKO', city: 'Bamako' }] },
    { country: 'Burkina Faso', flag: '🇧🇫', airports: [{ code: 'OUA', city: 'Ouagadougou' }] },
    { country: 'Niger', flag: '🇳🇪', airports: [{ code: 'NIM', city: 'Niamey' }] },
    { country: 'Chad', flag: '🇹🇩', airports: [{ code: 'NDJ', city: 'N\'Djamena' }] },
    { country: 'Sudan', flag: '🇸🇩', airports: [{ code: 'KRT', city: 'Khartoum' }] },
    { country: 'Mauritius', flag: '🇲🇺', airports: [{ code: 'MRU', city: 'Port Louis' }] },
    { country: 'Seychelles', flag: '🇸🇨', airports: [{ code: 'SEZ', city: 'Mahe' }] },
    { country: 'Madagascar', flag: '🇲🇬', airports: [{ code: 'TNR', city: 'Antananarivo' }] },
    
    // Oceania
    { country: 'Australia', flag: '🇦🇺', airports: [{ code: 'SYD', city: 'Sydney' }, { code: 'MEL', city: 'Melbourne' }, { code: 'BNE', city: 'Brisbane' }, { code: 'PER', city: 'Perth' }, { code: 'ADL', city: 'Adelaide' }] },
    { country: 'New Zealand', flag: '🇳🇿', airports: [{ code: 'AKL', city: 'Auckland' }, { code: 'CHC', city: 'Christchurch' }, { code: 'WLG', city: 'Wellington' }] },
    { country: 'Fiji', flag: '🇫🇯', airports: [{ code: 'NAN', city: 'Nadi' }] },
    { country: 'Papua New Guinea', flag: '🇵🇬', airports: [{ code: 'POM', city: 'Port Moresby' }] },
    { country: 'New Caledonia', flag: '🇳🇨', airports: [{ code: 'NOU', city: 'Noumea' }] },
    { country: 'French Polynesia', flag: '🇵🇫', airports: [{ code: 'PPT', city: 'Tahiti' }] },
    { country: 'Samoa', flag: '🇼🇸', airports: [{ code: 'APW', city: 'Apia' }] },
    { country: 'Tonga', flag: '🇹🇴', airports: [{ code: 'TBU', city: 'Nuku\'alofa' }] },
    { country: 'Vanuatu', flag: '🇻🇺', airports: [{ code: 'VLI', city: 'Port Vila' }] },
    { country: 'Solomon Islands', flag: '🇸🇧', airports: [{ code: 'HIR', city: 'Honiara' }] },
    
    // Additional European Countries
    { country: 'Iceland', flag: '🇮🇸', airports: [{ code: 'KEF', city: 'Reykjavik' }] },
    { country: 'Croatia', flag: '🇭🇷', airports: [{ code: 'ZAG', city: 'Zagreb' }, { code: 'DBV', city: 'Dubrovnik' }] },
    { country: 'Serbia', flag: '🇷🇸', airports: [{ code: 'BEG', city: 'Belgrade' }] },
    { country: 'Bulgaria', flag: '🇧🇬', airports: [{ code: 'SOF', city: 'Sofia' }] },
    { country: 'Slovenia', flag: '🇸🇮', airports: [{ code: 'LJU', city: 'Ljubljana' }] },
    { country: 'Slovakia', flag: '🇸🇰', airports: [{ code: 'BTS', city: 'Bratislava' }] },
    { country: 'Estonia', flag: '🇪🇪', airports: [{ code: 'TLL', city: 'Tallinn' }] },
    { country: 'Latvia', flag: '🇱🇻', airports: [{ code: 'RIX', city: 'Riga' }] },
    { country: 'Lithuania', flag: '🇱🇹', airports: [{ code: 'VNO', city: 'Vilnius' }] },
    { country: 'Bosnia', flag: '🇧🇦', airports: [{ code: 'SJJ', city: 'Sarajevo' }] },
    { country: 'North Macedonia', flag: '🇲🇰', airports: [{ code: 'SKP', city: 'Skopje' }] },
    { country: 'Albania', flag: '🇦🇱', airports: [{ code: 'TIA', city: 'Tirana' }] },
    { country: 'Montenegro', flag: '🇲🇪', airports: [{ code: 'TGD', city: 'Podgorica' }] },
    { country: 'Cyprus', flag: '🇨🇾', airports: [{ code: 'LCA', city: 'Larnaca' }, { code: 'PFO', city: 'Paphos' }] },
    { country: 'Malta', flag: '🇲🇹', airports: [{ code: 'MLA', city: 'Malta' }] },
    { country: 'Luxembourg', flag: '🇱🇺', airports: [{ code: 'LUX', city: 'Luxembourg' }] },
    { country: 'Belarus', flag: '🇧🇾', airports: [{ code: 'MSQ', city: 'Minsk' }] },
    { country: 'Moldova', flag: '🇲🇩', airports: [{ code: 'KIV', city: 'Chisinau' }] },
    
    // Additional Asian Countries
    { country: 'Mongolia', flag: '🇲🇳', airports: [{ code: 'ULN', city: 'Ulaanbaatar' }] },
    { country: 'Bhutan', flag: '🇧🇹', airports: [{ code: 'PBH', city: 'Paro' }] },
    { country: 'Maldives', flag: '🇲🇻', airports: [{ code: 'MLE', city: 'Male' }] },
    { country: 'Brunei', flag: '🇧🇳', airports: [{ code: 'BWN', city: 'Bandar Seri Begawan' }] },
    { country: 'Timor-Leste', flag: '🇹🇱', airports: [{ code: 'DIL', city: 'Dili' }] },
    { country: 'Afghanistan', flag: '🇦🇫', airports: [{ code: 'KBL', city: 'Kabul' }] },
    { country: 'Turkmenistan', flag: '🇹🇲', airports: [{ code: 'ASB', city: 'Ashgabat' }] },
    { country: 'Tajikistan', flag: '🇹🇯', airports: [{ code: 'DYU', city: 'Dushanbe' }] },
    { country: 'Kyrgyzstan', flag: '🇰🇬', airports: [{ code: 'FRU', city: 'Bishkek' }] },
    { country: 'Taiwan', flag: '🇹🇼', airports: [{ code: 'TPE', city: 'Taipei' }] },
    { country: 'Hong Kong', flag: '🇭🇰', airports: [{ code: 'HKG', city: 'Hong Kong' }] },
    { country: 'Macau', flag: '🇲🇴', airports: [{ code: 'MFM', city: 'Macau' }] },
    
    // Additional American Countries
    { country: 'Uruguay', flag: '🇺🇾', airports: [{ code: 'MVD', city: 'Montevideo' }] },
    { country: 'Paraguay', flag: '🇵🇾', airports: [{ code: 'ASU', city: 'Asuncion' }] },
    { country: 'Bolivia', flag: '🇧🇴', airports: [{ code: 'LPB', city: 'La Paz' }] },
    { country: 'Guatemala', flag: '🇬🇹', airports: [{ code: 'GUA', city: 'Guatemala City' }] },
    { country: 'Honduras', flag: '🇭🇳', airports: [{ code: 'SAP', city: 'San Pedro Sula' }] },
    { country: 'Nicaragua', flag: '🇳🇮', airports: [{ code: 'MGA', city: 'Managua' }] },
    { country: 'El Salvador', flag: '🇸🇻', airports: [{ code: 'SAL', city: 'San Salvador' }] },
    { country: 'Belize', flag: '🇧🇿', airports: [{ code: 'BZE', city: 'Belize City' }] },
    { country: 'Guyana', flag: '🇬🇾', airports: [{ code: 'GEO', city: 'Georgetown' }] },
    { country: 'Suriname', flag: '🇸🇷', airports: [{ code: 'PBM', city: 'Paramaribo' }] },
    { country: 'French Guiana', flag: '🇬🇫', airports: [{ code: 'CAY', city: 'Cayenne' }] },
    { country: 'Trinidad and Tobago', flag: '🇹🇹', airports: [{ code: 'POS', city: 'Port of Spain' }] },
    { country: 'Barbados', flag: '🇧🇧', airports: [{ code: 'BGI', city: 'Bridgetown' }] },
    { country: 'Bahamas', flag: '🇧🇸', airports: [{ code: 'NAS', city: 'Nassau' }] },
    { country: 'Haiti', flag: '🇭🇹', airports: [{ code: 'PAP', city: 'Port-au-Prince' }] },
    { country: 'Puerto Rico', flag: '🇵🇷', airports: [{ code: 'SJU', city: 'San Juan' }] },
    { country: 'Aruba', flag: '🇦🇼', airports: [{ code: 'AUA', city: 'Aruba' }] },
    { country: 'Curacao', flag: '🇨🇼', airports: [{ code: 'CUR', city: 'Willemstad' }] },
  ];

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

  // Handle from country change
  const handleFromCountryChange = (country: string) => {
    setFromCountry(country);
    setSelectedFromAirports([]);
  };

  // Handle to country change
  const handleToCountryChange = (country: string) => {
    setToCountry(country);
    setSelectedToAirports([]);
  };

  // Toggle airport selection
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

  // Get airports for selected country
  const getAirportsForCountry = (country: string) => {
    return countriesAndAirports.find(c => c.country === country)?.airports || [];
  };

  // Baggage weight options
  const baggageWeightOptions = [
    { value: 20, label: '20 kg' },
    { value: 23, label: '23 kg' },
    { value: 25, label: '25 kg' },
    { value: 30, label: '30 kg' },
    { value: 32, label: '32 kg' },
    { value: 40, label: '40 kg' },
  ];

  // State for country search
  const [fromCountrySearch, setFromCountrySearch] = useState('');
  const [toCountrySearch, setToCountrySearch] = useState('');

  // World currencies
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

  // Get selected currency symbol
  const getSelectedCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === formData.pricing.currency);
    return currency ? currency.symbol : '';
  };

  // Calculate commission value (supports both fixed and percentage)
  const calculateCommission = (
    basePrice: number,
    commission: { type: 'fixed' | 'percentage'; value: number }
  ): number => {
    if (commission.type === 'percentage') {
      return (basePrice * commission.value) / 100;
    }
    return commission.value;
  };

  // Calculate net price after commissions
  const calculateNetPrice = (classPrice: number): number => {
    const supplierCommissionAmount = calculateCommission(classPrice, formData.supplierCommission);
    const agencyCommissionAmount = calculateCommission(classPrice, formData.agencyCommission);
    return classPrice - supplierCommissionAmount - agencyCommissionAmount;
  };

  // Fare rules templates
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

  // Filter airlines based on search
  const filteredAirlines = availableAirlines.filter(airline => 
    airline.name.toLowerCase().includes(airlineSearch.toLowerCase()) ||
    airline.code.toLowerCase().includes(airlineSearch.toLowerCase()) ||
    airline.country.toLowerCase().includes(airlineSearch.toLowerCase())
  );

  // Filter countries based on search
  const filteredFromCountries = countriesAndAirports.filter(c => 
    c.country.toLowerCase().includes(fromCountrySearch.toLowerCase())
  );

  const filteredToCountries = countriesAndAirports.filter(c => 
    c.country.toLowerCase().includes(toCountrySearch.toLowerCase())
  );

  // 🔥 Handle departure date change and auto-set return date (back-to-back)
  const handleDepartureDateChange = (departureDate: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      newData.route.departure = departureDate;
      
      // 🔥 Auto-calculate return date if round trip
      if (newData.route.isRoundTrip && departureDate) {
        const depDate = new Date(departureDate);
        // Add 7 days by default for return trip
        depDate.setDate(depDate.getDate() + 7);
        newData.route.return = depDate.toISOString().split('T')[0];
      }
      
      return newData;
    });
  };

  // Handle trip type change
  const handleTripTypeChange = (isRoundTrip: boolean) => {
    setFormData(prev => {
      const newData = { ...prev };
      newData.route.isRoundTrip = isRoundTrip;
      
      // 🔥 Auto-set return date if switching to round trip
      if (isRoundTrip && newData.route.departure && !newData.route.return) {
        const depDate = new Date(newData.route.departure);
        depDate.setDate(depDate.getDate() + 7);
        newData.route.return = depDate.toISOString().split('T')[0];
      }
      
      return newData;
    });
  };

  // Handle fare rule template selection
  const handleFareRuleTemplate = (templateName: string) => {
    const template = fareRulesTemplates.find(t => t.name === templateName);
    if (template) {
      setFormData(prev => ({
        ...prev,
        fareRules: {
          cancellationFee: template.cancellationFee,
          changeFee: template.changeFee,
          refundable: template.refundable,
        },
      }));
    }
  };

  const validateForm = () => {
    console.log('🔍 Validating form...');
    const newErrors: { [key: string]: string } = {};

    if (!formData.airline) {
      console.log('❌ Missing airline');
      newErrors.airline = 'Please select an airline';
    }
    if (selectedFromAirports.length === 0) {
      console.log('❌ No from airports selected');
      newErrors.from = 'Please select at least one departure airport';
    }
    if (selectedToAirports.length === 0) {
      console.log('❌ No to airports selected');
      newErrors.to = 'Please select at least one destination airport';
    }
    if (formData.availableDates.length === 0) {
      console.log('❌ No available dates');
      newErrors.dates = 'Please add at least one available date';
    }
    if (formData.pricing.class1 <= 0) {
      console.log('❌ Invalid pricing');
      newErrors.class1 = 'Class 1 price must be greater than 0';
    }
    if (formData.availability.class1.total <= 0) {
      console.log('❌ Invalid availability');
      newErrors.availability = 'Please set total seats for at least Class 1';
    }

    console.log('🔍 Validation errors:', newErrors);
    console.log('✈️ Selected FROM airports:', selectedFromAirports);
    console.log('✈️ Selected TO airports:', selectedToAirports);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('🔵 handleSubmit called');
    console.log('📊 formData:', formData);
    console.log('📅 availableDates:', formData.availableDates);
    
    const isValid = validateForm();
    console.log('✅ Validation result:', isValid);
    console.log('❌ Errors:', errors);
    
    if (isValid) {
      console.log('✅ Validation passed, creating block seat...');
      console.log('🛫 FROM Airports Selected:', selectedFromAirports);
      console.log('🛬 TO Airports Selected:', selectedToAirports);
      
      // Build arrays of airport objects from selected codes
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

      console.log('📍 FROM Airports Data:', fromAirportsData);
      console.log('📍 TO Airports Data:', toAirportsData);

      // Build price classes array from room pricing
      const priceClasses = [
        {
          classType: 'Economy' as const,
          price: formData.pricing.class1,
          availableSeats: formData.availability.class1.total - formData.availability.class1.booked,
          totalSeats: formData.availability.class1.total,
          baggageAllowance: {
            checkedBag: `${formData.baggage.checkedBags}x${formData.baggage.weight}kg`,
            handBag: `${formData.baggage.carryOn}kg`,
            weight: `${formData.baggage.weight}kg total`
          },
          fareRules: {
            refundable: formData.fareRules.refundable,
            changeable: true,
            changeFee: formData.fareRules.changeFee,
            cancellationFee: formData.fareRules.cancellationFee
          }
        },
        {
          classType: 'Business' as const,
          price: formData.pricing.class2,
          availableSeats: formData.availability.class2.total - formData.availability.class2.booked,
          totalSeats: formData.availability.class2.total,
          baggageAllowance: {
            checkedBag: `${formData.baggage.checkedBags}x${formData.baggage.weight + 9}kg`,
            handBag: `${formData.baggage.carryOn + 5}kg`,
            weight: `${formData.baggage.weight + 9}kg total`
          },
          fareRules: {
            refundable: formData.fareRules.refundable,
            changeable: true,
            changeFee: formData.fareRules.changeFee,
            cancellationFee: formData.fareRules.cancellationFee
          }
        },
        {
          classType: 'First' as const,
          price: formData.pricing.class3,
          availableSeats: formData.availability.class3.total - formData.availability.class3.booked,
          totalSeats: formData.availability.class3.total,
          baggageAllowance: {
            checkedBag: `${formData.baggage.checkedBags}x${formData.baggage.weight + 17}kg`,
            handBag: `${formData.baggage.carryOn + 8}kg`,
            weight: `${formData.baggage.weight + 17}kg total`
          },
          fareRules: {
            refundable: formData.fareRules.refundable,
            changeable: true,
            changeFee: formData.fareRules.changeFee,
            cancellationFee: formData.fareRules.cancellationFee
          }
        }
      ];

      // Use first available date as the default departure date
      const firstAvailableDate = formData.availableDates[0];
      
      const newBlockSeat = {
        id: seat?.id || Date.now().toString(),
        airline: {
          name: formData.airline,
          code: formData.airlineCode,
          country: formData.airlineCountry,
          logo: availableAirlines.find(a => a.name === formData.airline)?.logo || 'https://images.kiwi.com/airlines/64/XX.png',
          flagCode: formData.airlineCountry || 'XX'
        },
        flightNumber: `${formData.airlineCode}${Math.floor(Math.random() * 9000) + 1000}`,
        route: {
          // Save ARRAYS of airports - these will show in frontend search
          from: fromAirportsData, // Array of all selected FROM airports
          to: toAirportsData,     // Array of all selected TO airports
          departure: firstAvailableDate?.departure || '',
          return: firstAvailableDate?.return || '',
          isRoundTrip: formData.route.isRoundTrip
        },
        // For display purposes, use first airport
        fromAirports: fromAirportsData,
        toAirports: toAirportsData,
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
        createdAt: seat?.createdAt || new Date().toISOString().split('T')[0],
        validUntil: seat?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
      } as any;
      
      console.log('💾 Saving block seat:', newBlockSeat);
      console.log('✈️ FROM Airports that will show in frontend:', newBlockSeat.fromAirports);
      console.log('✈️ TO Airports that will show in frontend:', newBlockSeat.toAirports);
      console.log('📋 These airports will appear when users search for flights!');
      
      onSave(newBlockSeat);
      console.log('✅ Block seat saved successfully!');
      console.log('🎉 Frontend users can now search and book from these airports!');
      onClose();
      console.log('🚪 Form closed');
    } else {
      console.log('❌ Validation failed, cannot create block seat');
      console.log('⚠️ Please select FROM and TO airports first!');
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
                  {seat ? 'Edit Block Seat' : 'Add New Block Seat'}
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
            
            {/* Trip Type */}
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
              {/* From Section */}
              <div className="space-y-4">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200">
                  From (Departure) * {fromCountry && countriesAndAirports.find(c => c.country === fromCountry)?.flag}
                </label>
                
                {/* From Country */}
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

                {/* From Airports */}
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

              {/* To Section */}
              <div className="space-y-4">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200">
                  To (Destination) * {toCountry && countriesAndAirports.find(c => c.country === toCountry)?.flag}
                </label>
                
                {/* To Country */}
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

                {/* To Airports */}
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


            {/* Available Dates Management */}
            <div className="mt-8 pt-8 border-t-2 border-green-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  📅 Available Flight Dates
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    if (showDatePicker && formData.route.departure && formData.route.return) {
                      const newDate = {
                        id: Date.now().toString(),
                        departure: formData.route.departure,
                        return: formData.route.return
                      };
                      setFormData(prev => ({
                        ...prev,
                        availableDates: [...prev.availableDates, newDate],
                        route: { ...prev.route, departure: '', return: '' }
                      }));
                      setShowDatePicker(false);
                    } else {
                      setShowDatePicker(true);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center shadow-md"
                >
                  {showDatePicker ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {formData.route.departure && formData.route.return ? 'Save Date' : 'Cancel'}
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

              {/* Date Picker Section - Only shown when showDatePicker is true */}
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

              {/* List of Available Dates */}
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
            
            {/* Currency Selection */}
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
            
            {/* Template Selection */}
            <div className="mb-6">
              <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                📋 Select Standard Template or Manual Entry
              </label>
              <select
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

            {/* Editable Fields */}
            <div className="space-y-6">
              {/* Cancellation Fee */}
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Cancellation Fee {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                </label>
                <input
                  type="number"
                  value={formData.fareRules.cancellationFee}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fareRules: { ...prev.fareRules, cancellationFee: Number(e.target.value) }
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

              {/* Change Fee */}
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Change Fee {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                </label>
                <input
                  type="number"
                  value={formData.fareRules.changeFee}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fareRules: { ...prev.fareRules, changeFee: Number(e.target.value) }
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

              {/* Refundable Toggle */}
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Refundable Status
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      fareRules: { ...prev.fareRules, refundable: true }
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
                      fareRules: { ...prev.fareRules, refundable: false }
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

              {/* Summary Card */}
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
              {/* Supplier Commission */}
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Supplier Commission
              </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Commission from airlines (deducted from net cost)
                </p>
                
                {/* Commission Type Selector */}
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

                {/* Commission Value Input */}
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

              {/* Agency Commission */}
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Agency Commission
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Commission to agencies (deducted from markup/sale price)
                </p>
                
                {/* Commission Type Selector */}
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

                {/* Commission Value Input */}
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
              {/* Class 1 Availability */}
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

              {/* Class 2 Availability */}
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

              {/* Class 3 Availability */}
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

              {/* Total Summary */}
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

          {/* Status */}
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

        {/* Footer Actions */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-t-2 border-gray-200 dark:border-gray-700 p-8 rounded-b-xl flex justify-between items-center">
          <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
            * Required fields
          </p>
          <div className="flex space-x-4">
            {/* Cancel Button */}
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚫 Cancel button clicked');
                onClose();
              }}
              className="px-8 py-3.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer select-none"
              style={{ userSelect: 'none' }}
            >
              Cancel
            </div>
            
            {/* Create/Update Button */}
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🟢 CREATE BUTTON CLICKED!');
                console.log('🔥 Calling handleSubmit...');
                handleSubmit();
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer select-none flex items-center"
              style={{ userSelect: 'none', pointerEvents: 'auto' }}
            >
              <Save className="w-5 h-5 mr-2 pointer-events-none" />
              <span className="pointer-events-none">
              {seat ? 'Update Block Seat' : 'Create Block Seat'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockSeatsModule;