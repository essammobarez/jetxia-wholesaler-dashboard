// mockData.ts

export interface Airline {
  code: string;
  name: string;
  logo: string;
  flagCode: string;
  country?: string;
}

export interface PriceClass {
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

export interface BlockSeat {
  id: string;
  airline: Airline;
  flightNumber: string;
  route: {
    from: { code: string; city: string; country: string } | string;
    to: { code: string; city: string; country: string } | string;
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
    class1: { total: number; booked: number };
    class2: { total: number; booked: number };
    class3: { total: number; booked: number };
  };
  supplierCommission?: { type: 'fixed' | 'percentage'; value: number };
  agencyCommission?: { type: 'fixed' | 'percentage'; value: number };
  availableDates?: { id: string; departure: string; return: string }[];
  status: 'Active' | 'Sold Out' | 'Cancelled' | 'Expired' | 'Available' | 'Limited';
  createdAt: string;
  validUntil: string;
  lastUpdated?: string;
}

export const airlinesData: Airline[] = [
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

export const mockBlockSeats: BlockSeat[] = [
  // ... (exact same as in original)
  {
    id: '1',
    airline: airlinesData[0],
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
    airline: airlinesData[2],
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
    airline: airlinesData[0],
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
    airline: airlinesData[1],
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
    airline: airlinesData[3],
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
    airline: airlinesData[2],
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
    airline: airlinesData[4],
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
    airline: airlinesData[5],
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
    airline: airlinesData[1],
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
    airline: airlinesData[6],
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
    airline: airlinesData[7],
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