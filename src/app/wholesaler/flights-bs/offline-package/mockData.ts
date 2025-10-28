// mockData.ts

import {
  Plane,
  Hotel,
  Car,
  Camera,
  Utensils,
  Users
} from 'lucide-react';

// Types for Offline Packages
export interface PackageInclusion {
  type: 'flight' | 'hotel' | 'transfer' | 'activity' | 'meal' | 'guide';
  icon: any;
  name: string;
  description: string;
  included: boolean;
}

export interface PackageItinerary {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: ('Breakfast' | 'Lunch' | 'Dinner')[];
  accommodation?: string;
}

export interface OfflinePackage {
  id: string;
  title: string;
  destination: {
    city: string;
    country: string;
    region: string;
  };
  duration: {
    days: number;
    nights: number;
  };
  description: string;
  highlights: string[];
  inclusions: PackageInclusion[];
  itinerary: PackageItinerary[];
  pricing: {
    adult: number;
    child: number;
    infant: number;
    singleSupplement: number;
  };
  availability: {
    singleRooms: { total: number; booked: number };
    doubleRooms: { total: number; booked: number };
    tripleRooms: { total: number; booked: number };
  };
  dates: {
    startDate: string;
    endDate: string;
    bookingDeadline: string;
  };
  category: 'Budget' | 'Standard' | 'Luxury' | 'Premium';
  rating: number;
  reviews: number;
  images: string[];
  status: 'Active' | 'Sold Out' | 'Cancelled' | 'Draft';
  createdAt: string;
  lastUpdated: string;
}

// Mock Package Data
export const mockPackages: OfflinePackage[] = [
  {
    id: '1',
    title: 'Cairo & Luxor Historical Journey',
    destination: {
      city: 'Cairo & Luxor',
      country: 'Egypt',
      region: 'North Africa'
    },
    duration: {
      days: 5,
      nights: 4
    },
    description: 'Explore the wonders of ancient Egypt with visits to the Pyramids of Giza, Egyptian Museum, and the magnificent temples of Luxor.',
    highlights: [
      'Pyramids of Giza & Sphinx',
      'Egyptian Museum',
      'Valley of the Kings',
      'Karnak Temple Complex',
      'Luxor Temple',
      'Nile River Cruise'
    ],
    inclusions: [
      { type: 'flight', icon: Plane, name: 'Domestic Flights', description: 'Cairo ⇄ Luxor flights', included: true },
      { type: 'hotel', icon: Hotel, name: '4-Star Hotels', description: '4 nights accommodation', included: true },
      { type: 'transfer', icon: Car, name: 'Airport Transfers', description: 'All transfers included', included: true },
      { type: 'activity', icon: Camera, name: 'Guided Tours', description: 'Professional Egyptologist guide', included: true },
      { type: 'meal', icon: Utensils, name: 'Meals', description: 'Daily breakfast + 2 dinners', included: true },
      { type: 'guide', icon: Users, name: 'Tour Guide', description: 'English speaking guide', included: true }
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Cairo',
        description: 'Arrive in Cairo, check-in at hotel, evening at leisure',
        activities: ['Airport pickup', 'Hotel check-in', 'Welcome dinner'],
        meals: ['Dinner'],
        accommodation: 'Cairo Marriott Hotel'
      },
      {
        day: 2,
        title: 'Pyramids & Egyptian Museum',
        description: 'Full day exploring the Pyramids of Giza and Egyptian Museum',
        activities: ['Pyramids of Giza', 'Sphinx', 'Egyptian Museum', 'Khan el Khalili Bazaar'],
        meals: ['Breakfast', 'Lunch']
      },
      {
        day: 3,
        title: 'Flight to Luxor',
        description: 'Morning flight to Luxor, afternoon exploring East Bank',
        activities: ['Flight to Luxor', 'Karnak Temple', 'Luxor Temple'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Sonesta St. George Luxor'
      }
    ],
    pricing: {
      adult: 850,
      child: 425,
      infant: 85,
      singleSupplement: 200
    },
    availability: {
      singleRooms: { total: 5, booked: 2 },
      doubleRooms: { total: 8, booked: 5 },
      tripleRooms: { total: 3, booked: 1 }
    },
    dates: {
      startDate: '2025-11-15',
      endDate: '2025-11-19',
      bookingDeadline: '2025-11-01'
    },
    category: 'Standard',
    rating: 4.6,
    reviews: 89,
    images: ['package1.jpg', 'package2.jpg'],
    status: 'Active',
    createdAt: '2025-10-14',
    lastUpdated: '2025-10-14'
  },
  {
    id: '2',
    title: 'Red Sea Diving Adventure - Hurghada',
    destination: {
      city: 'Hurghada',
      country: 'Egypt',
      region: 'Red Sea'
    },
    duration: {
      days: 7,
      nights: 6
    },
    description: 'Ultimate diving experience in the crystal-clear waters of the Red Sea with world-class coral reefs and marine life.',
    highlights: [
      'Daily Diving Trips',
      'PADI Certification Available',
      'Coral Reef Exploration',
      'Beach Resort Stay',
      'Snorkeling Equipment',
      'Marine Life Photography'
    ],
    inclusions: [
      { type: 'flight', icon: Plane, name: 'Round Trip Flights', description: 'International flights included', included: true },
      { type: 'hotel', icon: Hotel, name: '5-Star Resort', description: '6 nights all-inclusive', included: true },
      { type: 'transfer', icon: Car, name: 'Resort Transfers', description: 'Airport & dive site transfers', included: true },
      { type: 'activity', icon: Camera, name: 'Diving Trips', description: '12 dives with equipment', included: true },
      { type: 'meal', icon: Utensils, name: 'All Meals', description: 'All-inclusive dining', included: true },
      { type: 'guide', icon: Users, name: 'Dive Master', description: 'Professional dive guide', included: true }
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Resort Check-in',
        description: 'Arrive in Hurghada, transfer to resort, orientation session',
        activities: ['Airport pickup', 'Resort check-in', 'Diving briefing', 'Equipment fitting'],
        meals: ['Dinner'],
        accommodation: 'Steigenberger Al Dau Beach Hotel'
      }
    ],
    pricing: {
      adult: 1250,
      child: 625,
      infant: 125,
      singleSupplement: 350
    },
    availability: {
      singleRooms: { total: 4, booked: 1 },
      doubleRooms: { total: 10, booked: 6 },
      tripleRooms: { total: 2, booked: 0 }
    },
    dates: {
      startDate: '2025-12-01',
      endDate: '2025-12-07',
      bookingDeadline: '2025-11-15'
    },
    category: 'Premium',
    rating: 4.8,
    reviews: 156,
    images: ['diving1.jpg', 'diving2.jpg'],
    status: 'Active',
    createdAt: '2025-10-14',
    lastUpdated: '2025-10-14'
  }
];

// Mock Block Seats
export const mockBlockSeats = [
  {
    id: '1',
    airline: { name: 'EgyptAir', code: 'MS', logo: 'https://images.kiwi.com/airlines/64/MS.png' },
    flightNumber: 'MS980',
    route: { 
      from: [{ code: 'CAI', city: 'Cairo', country: 'Egypt', flag: '🇪🇬' }],
      to: [{ code: 'DXB', city: 'Dubai', country: 'UAE', flag: '🇦🇪' }]
    },
    departureDate: '2025-10-20',
    departureTime: '14:30',
    arrivalTime: '17:45',
    duration: '3h 15m',
    pricing: { economy: 280, business: 290, first: 0 },
    availableDates: [
      { departure: '2025-10-20', return: '2025-10-25' },
      { departure: '2025-10-22', return: '2025-10-27' }
    ]
  },
  {
    id: '2',
    airline: { name: 'Emirates', code: 'EK', logo: 'https://images.kiwi.com/airlines/64/EK.png' },
    flightNumber: 'EK924',
    route: { 
      from: [{ code: 'CAI', city: 'Cairo', country: 'Egypt', flag: '🇪🇬' }],
      to: [{ code: 'JFK', city: 'New York', country: 'USA', flag: '🇺🇸' }]
    },
    departureDate: '2025-10-22',
    departureTime: '02:25',
    arrivalTime: '10:15',
    duration: '12h 50m',
    pricing: { economy: 850, business: 2400, first: 0 },
    availableDates: [
      { departure: '2025-10-22', return: '2025-10-30' },
      { departure: '2025-10-25', return: '2025-11-02' }
    ]
  },
  {
    id: '3',
    airline: { name: 'EgyptAir', code: 'MS', logo: 'https://images.kiwi.com/airlines/64/MS.png' },
    flightNumber: 'MS980',
    route: { 
      from: [{ code: 'CAI', city: 'Cairo', country: 'Egypt', flag: '🇪🇬' }],
      to: [{ code: 'DXB', city: 'Dubai', country: 'UAE', flag: '🇦🇪' }]
    },
    departureDate: '2025-11-05',
    departureTime: '14:30',
    arrivalTime: '17:45',
    duration: '3h 15m',
    pricing: { economy: 280, business: 290, first: 0 },
    availableDates: [
      { departure: '2025-11-05', return: '2025-11-12' },
      { departure: '2025-11-10', return: '2025-11-17' }
    ]
  },
  {
    id: '4',
    airline: { name: 'Turkish Airlines', code: 'TK', logo: 'https://images.kiwi.com/airlines/64/TK.png' },
    flightNumber: 'TK690',
    route: { 
      from: [{ code: 'CAI', city: 'Cairo', country: 'Egypt', flag: '🇪🇬' }],
      to: [{ code: 'IST', city: 'Istanbul', country: 'Turkey', flag: '🇹🇷' }]
    },
    departureDate: '2025-10-25',
    departureTime: '09:15',
    arrivalTime: '12:30',
    duration: '2h 15m',
    pricing: { economy: 195, business: 420, first: 0 },
    availableDates: [
      { departure: '2025-10-25', return: '2025-10-30' },
      { departure: '2025-10-28', return: '2025-11-03' }
    ]
  },
  {
    id: '5',
    airline: { name: 'Qatar Airways', code: 'QR', logo: 'https://images.kiwi.com/airlines/64/QR.png' },
    flightNumber: 'QR1302',
    route: { 
      from: [{ code: 'CAI', city: 'Cairo', country: 'Egypt', flag: '🇪🇬' }],
      to: [{ code: 'BKK', city: 'Bangkok', country: 'Thailand', flag: '🇹🇭' }]
    },
    departureDate: '2025-11-01',
    departureTime: '22:50',
    arrivalTime: '13:20',
    duration: '9h 30m',
    pricing: { economy: 520, business: 1850, first: 0 },
    availableDates: [
      { departure: '2025-11-01', return: '2025-11-07' },
      { departure: '2025-11-08', return: '2025-11-15' },
      { departure: '2025-11-15', return: '2025-11-22' }
    ]
  },
  {
    id: '6',
    airline: { name: 'Emirates', code: 'EK', logo: 'https://images.kiwi.com/airlines/64/EK.png' },
    flightNumber: 'EK924',
    route: { 
      from: [{ code: 'CAI', city: 'Cairo', country: 'Egypt', flag: '🇪🇬' }],
      to: [{ code: 'JFK', city: 'New York', country: 'USA', flag: '🇺🇸' }]
    },
    departureDate: '2025-11-08',
    departureTime: '02:25',
    arrivalTime: '10:15',
    duration: '12h 50m',
    pricing: { economy: 850, business: 2400, first: 0 },
    availableDates: [
      { departure: '2025-11-08', return: '2025-11-16' },
      { departure: '2025-11-12', return: '2025-11-20' }
    ]
  },
  {
    id: '7',
    airline: { name: 'Etihad', code: 'EY', logo: 'https://images.kiwi.com/airlines/64/EY.png' },
    flightNumber: 'EY654',
    route: { 
      from: [{ code: 'CAI', city: 'Cairo', country: 'Egypt', flag: '🇪🇬' }],
      to: [{ code: 'CDG', city: 'Paris', country: 'France', flag: '🇫🇷' }]
    },
    departureDate: '2025-10-26',
    departureTime: '15:40',
    arrivalTime: '19:55',
    duration: '4h 15m',
    pricing: { economy: 380, business: 980, first: 0 },
    availableDates: [
      { departure: '2025-10-26', return: '2025-10-31' },
      { departure: '2025-11-02', return: '2025-11-07' }
    ]
  },
  {
    id: '8',
    airline: { name: 'Saudia', code: 'SV', logo: 'https://images.kiwi.com/airlines/64/SV.png' },
    flightNumber: 'SV378',
    route: { 
      from: [{ code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia', flag: '🇸🇦' }],
      to: [{ code: 'BCN', city: 'Barcelona', country: 'Spain', flag: '🇪🇸' }]
    },
    departureDate: '2025-10-28',
    departureTime: '08:30',
    arrivalTime: '13:45',
    duration: '6h 15m',
    pricing: { economy: 450, business: 1250, first: 0 },
    availableDates: [
      { departure: '2025-10-28', return: '2025-11-03' },
      { departure: '2025-11-05', return: '2025-11-11' }
    ]
  },
  {
    id: '9',
    airline: { name: 'Turkish Airlines', code: 'TK', logo: 'https://images.kiwi.com/airlines/64/TK.png' },
    flightNumber: 'TK690',
    route: { 
      from: [{ code: 'CAI', city: 'Cairo', country: 'Egypt', flag: '🇪🇬' }],
      to: [{ code: 'IST', city: 'Istanbul', country: 'Turkey', flag: '🇹🇷' }]
    },
    departureDate: '2025-11-12',
    departureTime: '15:45',
    arrivalTime: '19:00',
    duration: '2h 15m',
    pricing: { economy: 195, business: 420, first: 0 },
    availableDates: [
      { departure: '2025-11-12', return: '2025-11-17' },
      { departure: '2025-11-19', return: '2025-11-24' }
    ]
  },
  {
    id: '10',
    airline: { name: 'Air France', code: 'AF', logo: 'https://images.kiwi.com/airlines/64/AF.png' },
    flightNumber: 'AF778',
    route: { 
      from: [{ code: 'CDG', city: 'Paris', country: 'France', flag: '🇫🇷' }],
      to: [{ code: 'NRT', city: 'Tokyo', country: 'Japan', flag: '🇯🇵' }]
    },
    departureDate: '2025-11-05',
    departureTime: '11:20',
    arrivalTime: '06:30',
    duration: '11h 10m',
    pricing: { economy: 920, business: 3200, first: 0 },
    availableDates: [
      { departure: '2025-11-05', return: '2025-11-12' },
      { departure: '2025-11-10', return: '2025-11-17' }
    ]
  },
  {
    id: '11',
    airline: { name: 'Lufthansa', code: 'LH', logo: 'https://images.kiwi.com/airlines/64/LH.png' },
    flightNumber: 'LH582',
    route: { 
      from: [{ code: 'FRA', city: 'Frankfurt', country: 'Germany', flag: '🇩🇪' }],
      to: [{ code: 'JTR', city: 'Santorini', country: 'Greece', flag: '🇬🇷' }]
    },
    departureDate: '2025-10-30',
    departureTime: '13:50',
    arrivalTime: '17:40',
    duration: '2h 50m',
    pricing: { economy: 285, business: 650, first: 0 },
    availableDates: [
      { departure: '2025-10-30', return: '2025-11-05' },
      { departure: '2025-11-06', return: '2025-11-12' }
    ]
  }
];

// Mock Hotels
export const mockHotels = [
  {
    id: '1',
    name: 'Grand Nile Hotel',
    city: 'Cairo',
    country: 'Egypt',
    rating: 5,
    roomTypes: [
      { name: 'Standard Room', price: 120, maxGuests: 2 },
      { name: 'Deluxe Room', price: 180, maxGuests: 3 },
      { name: 'Suite', price: 350, maxGuests: 4 }
    ],
    amenities: ['Wifi', 'Pool', 'Spa', 'Restaurant', 'Gym']
  },
  {
    id: '2',
    name: 'The Ritz-Carlton Dubai',
    city: 'Dubai',
    country: 'UAE',
    rating: 5,
    roomTypes: [
      { name: 'Classic Room', price: 520, maxGuests: 2 },
      { name: 'Executive Suite', price: 890, maxGuests: 4 }
    ],
    amenities: ['Wifi', 'Valet Parking', 'Spa', 'Pool', 'Fine Dining']
  },
  {
    id: '3',
    name: 'Mandarin Oriental Bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 5,
    roomTypes: [
      { name: 'Deluxe Room', price: 220, maxGuests: 2 },
      { name: 'Suite', price: 380, maxGuests: 4 }
    ],
    amenities: ['Wifi', 'River Pool', 'Wellness Center', 'Thai Cuisine']
  },
  {
    id: '4',
    name: 'Park Hyatt Paris-Vendôme',
    city: 'Paris',
    country: 'France',
    rating: 5,
    roomTypes: [
      { name: 'Park King Room', price: 650, maxGuests: 2 },
      { name: 'Vendôme Suite', price: 1200, maxGuests: 3 }
    ],
    amenities: ['Wifi', 'Spa by La Prairie', 'Michelin Star Restaurant', '24/7 Service']
  },
  {
    id: '5',
    name: 'Hotel Arts Barcelona',
    city: 'Barcelona',
    country: 'Spain',
    rating: 5,
    roomTypes: [
      { name: 'Deluxe Room', price: 380, maxGuests: 2 },
      { name: 'Executive Suite', price: 720, maxGuests: 4 }
    ],
    amenities: ['Wifi', 'Beach Access', 'Fitness', 'Restaurants']
  },
  {
    id: '6',
    name: 'Aman Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    rating: 5,
    roomTypes: [
      { name: 'Deluxe Room', price: 980, maxGuests: 2 },
      { name: 'Premier Suite', price: 1650, maxGuests: 3 }
    ],
    amenities: ['Wifi', 'Onsen Pool', 'Aman Spa', 'Japanese Cuisine']
  },
  {
    id: '7',
    name: 'Santorini Grace Hotel',
    city: 'Santorini',
    country: 'Greece',
    rating: 4,
    roomTypes: [
      { name: 'Grace Room', price: 520, maxGuests: 2 },
      { name: 'Honeymoon Suite', price: 890, maxGuests: 2 }
    ],
    amenities: ['Wifi', 'Infinity Pool', 'Restaurant', 'Bar']
  },
  {
    id: '8',
    name: 'Four Seasons Istanbul',
    city: 'Istanbul',
    country: 'Turkey',
    rating: 5,
    roomTypes: [
      { name: 'Deluxe Room', price: 350, maxGuests: 2 },
      { name: 'Bosphorus Suite', price: 780, maxGuests: 4 }
    ],
    amenities: ['Wifi', 'Spa', 'Turkish Bath', 'Bosphorus View', 'Fine Dining']
  },
  {
    id: '9',
    name: 'The Plaza New York',
    city: 'New York',
    country: 'USA',
    rating: 5,
    roomTypes: [
      { name: 'Deluxe Room', price: 750, maxGuests: 2 },
      { name: 'Plaza Suite', price: 1850, maxGuests: 4 }
    ],
    amenities: ['Wifi', 'Spa', 'Fine Dining', 'Central Park View', 'Butler Service']
  }
];
export const countriesWithCities = [
  { country: 'Egypt', cities: ['Cairo', 'Alexandria', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El Sheikh', 'Dahab'] },
  { country: 'United Arab Emirates', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'] },
  { country: 'Saudi Arabia', cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif'] },
  { country: 'Turkey', cities: ['Istanbul', 'Ankara', 'Antalya', 'Bodrum', 'Cappadocia', 'Izmir'] },
  { country: 'United Kingdom', cities: ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Liverpool'] },
  { country: 'United States', cities: ['New York', 'Los Angeles', 'Miami', 'Las Vegas', 'Chicago', 'Orlando'] },
  { country: 'France', cities: ['Paris', 'Nice', 'Lyon', 'Marseille', 'Cannes', 'Bordeaux'] },
  { country: 'Italy', cities: ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Pisa'] },
  { country: 'Spain', cities: ['Barcelona', 'Madrid', 'Valencia', 'Seville', 'Malaga', 'Ibiza'] },
  { country: 'Greece', cities: ['Athens', 'Santorini', 'Mykonos', 'Crete', 'Rhodes', 'Thessaloniki'] },
  { country: 'Thailand', cities: ['Bangkok', 'Phuket', 'Pattaya', 'Chiang Mai', 'Krabi', 'Koh Samui'] },
  { country: 'Malaysia', cities: ['Kuala Lumpur', 'Penang', 'Langkawi', 'Malacca', 'Johor Bahru'] },
  { country: 'Singapore', cities: ['Singapore', 'Sentosa'] },
  { country: 'India', cities: ['Delhi', 'Mumbai', 'Goa', 'Jaipur', 'Agra', 'Bangalore'] },
  { country: 'China', cities: ['Beijing', 'Shanghai', 'Hong Kong', 'Guangzhou', 'Shenzhen'] },
  { country: 'Japan', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima', 'Nara', 'Fukuoka'] },
  { country: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Gold Coast'] },
  { country: 'New Zealand', cities: ['Auckland', 'Wellington', 'Queenstown', 'Christchurch'] },
  { country: 'South Africa', cities: ['Cape Town', 'Johannesburg', 'Durban', 'Port Elizabeth'] },
  { country: 'Morocco', cities: ['Marrakech', 'Casablanca', 'Fes', 'Rabat', 'Tangier'] },
  { country: 'Jordan', cities: ['Amman', 'Petra', 'Aqaba', 'Dead Sea', 'Wadi Rum'] },
  { country: 'Lebanon', cities: ['Beirut', 'Byblos', 'Baalbek', 'Tripoli', 'Sidon'] },
  { country: 'Qatar', cities: ['Doha', 'Al Wakrah', 'Al Khor'] },
  { country: 'Kuwait', cities: ['Kuwait City', 'Hawalli', 'Salmiya'] },
  { country: 'Bahrain', cities: ['Manama', 'Riffa', 'Muharraq'] },
  { country: 'Oman', cities: ['Muscat', 'Salalah', 'Nizwa', 'Sur'] },
  { country: 'Germany', cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'] },
  { country: 'Switzerland', cities: ['Zurich', 'Geneva', 'Lucerne', 'Interlaken', 'Bern'] },
  { country: 'Austria', cities: ['Vienna', 'Salzburg', 'Innsbruck', 'Graz'] },
  { country: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'] },
  { country: 'Belgium', cities: ['Brussels', 'Bruges', 'Antwerp', 'Ghent'] },
  { country: 'Portugal', cities: ['Lisbon', 'Porto', 'Faro', 'Algarve', 'Madeira'] },
  { country: 'Sweden', cities: ['Stockholm', 'Gothenburg', 'Malmo'] },
  { country: 'Norway', cities: ['Oslo', 'Bergen', 'Stavanger', 'Tromso'] },
  { country: 'Denmark', cities: ['Copenhagen', 'Aarhus', 'Odense'] },
  { country: 'Poland', cities: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw'] },
  { country: 'Czech Republic', cities: ['Prague', 'Brno', 'Cesky Krumlov'] },
  { country: 'Russia', cities: ['Moscow', 'Saint Petersburg', 'Sochi', 'Kazan'] },
  { country: 'Brazil', cities: ['Rio de Janeiro', 'Sao Paulo', 'Salvador', 'Brasilia'] },
  { country: 'Argentina', cities: ['Buenos Aires', 'Mendoza', 'Bariloche', 'Cordoba'] },
  { country: 'Mexico', cities: ['Cancun', 'Mexico City', 'Playa del Carmen', 'Tulum', 'Cabo'] },
  { country: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal', 'Quebec City', 'Calgary'] },
  { country: 'Maldives', cities: ['Male', 'Hulhumale', 'Maafushi', 'Addu City'] },
  { country: 'Seychelles', cities: ['Victoria', 'Mahe', 'Praslin', 'La Digue'] },
  { country: 'Mauritius', cities: ['Port Louis', 'Grand Baie', 'Flic en Flac'] },
  { country: 'Sri Lanka', cities: ['Colombo', 'Kandy', 'Galle', 'Ella', 'Sigiriya'] },
  { country: 'Indonesia', cities: ['Bali', 'Jakarta', 'Yogyakarta', 'Lombok', 'Bandung'] },
  { country: 'Philippines', cities: ['Manila', 'Cebu', 'Boracay', 'Palawan', 'Davao'] },
  { country: 'Vietnam', cities: ['Hanoi', 'Ho Chi Minh', 'Da Nang', 'Hoi An', 'Nha Trang'] }

];