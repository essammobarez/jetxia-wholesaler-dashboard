'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Hotel,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Star,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  Utensils,
  X,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Info,
  Image as ImageIcon,
  Upload,
  FileText,
  Building,
  Bed,
  Save
} from 'lucide-react';

// Types for Hotels
interface HotelAmenity {
  icon: any;
  name: string;
  available: boolean;
}

interface RoomType {
  type: string;
  price: number;
  maxOccupancy: number;
  available: number;
  total: number;
  amenities: string[];
}

interface HotelInventory {
  id: string;
  name: string;
  category: number; // Star rating
  location: {
    city: string;
    country: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  description: string;
  images: string[];
  amenities: HotelAmenity[];
  roomTypes: RoomType[];
  checkInDate: string;
  checkOutDate: string;
  availableDates?: {
    id: string;
    checkIn: string;
    checkOut: string;
  }[];
  supplierCommission?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
  agencyCommission?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
  currency?: string;
  status: 'Available' | 'Sold Out' | 'Maintenance' | 'Blocked';
  totalRooms: number;
  availableRooms: number;
  rating: number;
  reviews: number;
  createdAt: string;
  validUntil: string;
}

// Mock Hotels Data
const mockHotels: HotelInventory[] = [
  {
    id: '1',
    name: 'Four Seasons Hotel Cairo at Nile Plaza',
    category: 5,
    location: {
      city: 'Cairo',
      country: 'Egypt 🇪🇬',
      address: '1089 Corniche El Nil, Garden City, Cairo',
      coordinates: { lat: 30.0444, lng: 31.2357 }
    },
    description: 'Luxury hotel overlooking the Nile River with world-class amenities',
    images: ['hotel1.jpg', 'hotel2.jpg'],
    amenities: [
      { icon: Wifi, name: 'Free WiFi', available: true },
      { icon: Car, name: 'Parking', available: true },
      { icon: Dumbbell, name: 'Fitness Center', available: true },
      { icon: Waves, name: 'Swimming Pool', available: true },
      { icon: Utensils, name: 'Restaurant', available: true },
      { icon: Coffee, name: 'Room Service', available: true }
    ],
    roomTypes: [
      {
        type: 'Deluxe Room',
        price: 280,
        maxOccupancy: 2,
        available: 8,
        total: 15,
        amenities: ['King Bed', 'City View', 'Mini Bar', 'Air Conditioning']
      },
      {
        type: 'Nile View Suite',
        price: 450,
        maxOccupancy: 4,
        available: 3,
        total: 8,
        amenities: ['Nile View', 'Living Room', 'Balcony', 'Premium Amenities']
      }
    ],
    checkInDate: '2025-10-20',
    checkOutDate: '2025-10-25',
    status: 'Available',
    totalRooms: 23,
    availableRooms: 11,
    rating: 4.8,
    reviews: 1250,
    createdAt: '2025-10-14',
    validUntil: '2025-10-19'
  },
  {
    id: '2',
    name: 'The Ritz-Carlton, Dubai',
    category: 5,
    location: {
      city: 'Dubai',
      country: 'United Arab Emirates 🇦🇪',
      address: 'Dubai International Financial Centre',
      coordinates: { lat: 25.2048, lng: 55.2708 }
    },
    description: 'Iconic luxury hotel in the heart of Dubai\'s financial district',
    images: ['hotel3.jpg', 'hotel4.jpg'],
    amenities: [
      { icon: Wifi, name: 'Free WiFi', available: true },
      { icon: Car, name: 'Valet Parking', available: true },
      { icon: Dumbbell, name: 'Spa & Fitness', available: true },
      { icon: Waves, name: 'Pool & Beach', available: true },
      { icon: Utensils, name: 'Fine Dining', available: true }
    ],
    roomTypes: [
      {
        type: 'Classic Room',
        price: 520,
        maxOccupancy: 2,
        available: 12,
        total: 20,
        amenities: ['King Bed', 'City View', 'Marble Bathroom', 'Club Access']
      },
      {
        type: 'Executive Suite',
        price: 890,
        maxOccupancy: 4,
        available: 5,
        total: 10,
        amenities: ['Separate Living Room', 'Butler Service', 'Premium Location']
      }
    ],
    checkInDate: '2025-10-22',
    checkOutDate: '2025-10-28',
    status: 'Available',
    totalRooms: 30,
    availableRooms: 17,
    rating: 4.9,
    reviews: 2100,
    createdAt: '2025-10-14',
    validUntil: '2025-10-21',
    availableDates: [
      { id: '1', checkIn: '2025-10-22', checkOut: '2025-10-28' },
      { id: '2', checkIn: '2025-11-05', checkOut: '2025-11-12' }
    ],
    supplierCommission: { type: 'percentage', value: 10 },
    agencyCommission: { type: 'percentage', value: 8 },
    currency: 'USD'
  },
  {
    id: '3',
    name: 'Mandarin Oriental Bangkok',
    category: 5,
    location: {
      city: 'Bangkok',
      country: 'Thailand 🇹🇭',
      address: '48 Oriental Avenue, Bangkok',
      coordinates: { lat: 13.7244, lng: 100.5154 }
    },
    description: 'Historic luxury hotel on the banks of the Chao Phraya River',
    images: ['hotel5.jpg'],
    amenities: [
      { icon: Wifi, name: 'Free WiFi', available: true },
      { icon: Waves, name: 'River Pool', available: true },
      { icon: Dumbbell, name: 'Wellness Center', available: true },
      { icon: Utensils, name: 'Thai Cuisine', available: true }
    ],
    roomTypes: [
      { type: 'Deluxe Room', price: 220, maxOccupancy: 2, available: 15, total: 25, amenities: ['River View', 'Balcony'] },
      { type: 'Suite', price: 380, maxOccupancy: 4, available: 8, total: 12, amenities: ['Living Area', 'Butler Service'] }
    ],
    checkInDate: '2025-11-01',
    checkOutDate: '2025-11-07',
    status: 'Available',
    totalRooms: 37,
    availableRooms: 23,
    rating: 4.7,
    reviews: 1890,
    createdAt: '2025-10-14',
    validUntil: '2025-10-30',
    availableDates: [
      { id: '1', checkIn: '2025-11-01', checkOut: '2025-11-07' },
      { id: '2', checkIn: '2025-11-15', checkOut: '2025-11-22' }
    ],
    supplierCommission: { type: 'percentage', value: 12 },
    agencyCommission: { type: 'fixed', value: 30 },
    currency: 'USD'
  },
  {
    id: '4',
    name: 'Park Hyatt Paris-Vendôme',
    category: 5,
    location: {
      city: 'Paris',
      country: 'France 🇫🇷',
      address: '5 Rue de la Paix, Paris',
      coordinates: { lat: 48.8698, lng: 2.3305 }
    },
    description: 'Elegant palace hotel near Place Vendôme',
    images: ['hotel6.jpg'],
    amenities: [
      { icon: Wifi, name: 'Free WiFi', available: true },
      { icon: Dumbbell, name: 'Spa by La Prairie', available: true },
      { icon: Utensils, name: 'Michelin Star Restaurant', available: true },
      { icon: Coffee, name: '24/7 Service', available: true }
    ],
    roomTypes: [
      { type: 'Park King Room', price: 650, maxOccupancy: 2, available: 10, total: 18, amenities: ['City View', 'Marble Bath'] },
      { type: 'Vendôme Suite', price: 1200, maxOccupancy: 3, available: 3, total: 6, amenities: ['Place Vendôme View', 'Separate Living'] }
    ],
    checkInDate: '2025-10-25',
    checkOutDate: '2025-10-30',
    status: 'Available',
    totalRooms: 24,
    availableRooms: 13,
    rating: 4.9,
    reviews: 1560,
    createdAt: '2025-10-14',
    validUntil: '2025-10-24',
    availableDates: [
      { id: '1', checkIn: '2025-10-25', checkOut: '2025-10-30' }
    ],
    supplierCommission: { type: 'percentage', value: 15 },
    agencyCommission: { type: 'percentage', value: 10 },
    currency: 'EUR'
  },
  {
    id: '5',
    name: 'The Oberoi Udaivilas',
    category: 5,
    location: {
      city: 'Jaipur',
      country: 'India 🇮🇳',
      address: 'Haridasji Ki Magri, Udaipur',
      coordinates: { lat: 24.5760, lng: 73.6820 }
    },
    description: 'Palace hotel overlooking Lake Pichola',
    images: ['hotel7.jpg'],
    amenities: [
      { icon: Wifi, name: 'Free WiFi', available: true },
      { icon: Waves, name: 'Pool', available: true },
      { icon: Dumbbell, name: 'Spa', available: true },
      { icon: Utensils, name: 'Indian & International Cuisine', available: true }
    ],
    roomTypes: [
      { type: 'Premier Room', price: 420, maxOccupancy: 2, available: 12, total: 20, amenities: ['Lake View', 'Private Garden'] },
      { type: 'Kohinoor Suite', price: 850, maxOccupancy: 4, available: 4, total: 8, amenities: ['Private Pool', 'Butler'] }
    ],
    checkInDate: '2025-11-10',
    checkOutDate: '2025-11-17',
    status: 'Available',
    totalRooms: 28,
    availableRooms: 16,
    rating: 4.8,
    reviews: 1120,
    createdAt: '2025-10-14',
    validUntil: '2025-11-05',
    availableDates: [
      { id: '1', checkIn: '2025-11-10', checkOut: '2025-11-17' },
      { id: '2', checkIn: '2025-12-01', checkOut: '2025-12-08' }
    ],
    supplierCommission: { type: 'percentage', value: 10 },
    agencyCommission: { type: 'percentage', value: 12 },
    currency: 'USD'
  },
  {
    id: '6',
    name: 'Hotel Arts Barcelona',
    category: 5,
    location: {
      city: 'Barcelona',
      country: 'Spain 🇪🇸',
      address: 'Marina 19-21, Barcelona',
      coordinates: { lat: 41.3874, lng: 2.1950 }
    },
    description: 'Contemporary luxury hotel with Mediterranean views',
    images: ['hotel8.jpg'],
    amenities: [
      { icon: Wifi, name: 'Free WiFi', available: true },
      { icon: Waves, name: 'Beach Access', available: true },
      { icon: Dumbbell, name: 'Fitness', available: true },
      { icon: Utensils, name: 'Restaurants', available: true }
    ],
    roomTypes: [
      { type: 'Deluxe Room', price: 380, maxOccupancy: 2, available: 18, total: 30, amenities: ['City/Sea View', 'Modern Design'] },
      { type: 'Executive Suite', price: 720, maxOccupancy: 4, available: 6, total: 10, amenities: ['Panoramic View', 'Terrace'] }
    ],
    checkInDate: '2025-10-28',
    checkOutDate: '2025-11-03',
    status: 'Available',
    totalRooms: 40,
    availableRooms: 24,
    rating: 4.7,
    reviews: 2340,
    createdAt: '2025-10-14',
    validUntil: '2025-10-27',
    availableDates: [
      { id: '1', checkIn: '2025-10-28', checkOut: '2025-11-03' }
    ],
    supplierCommission: { type: 'percentage', value: 12 },
    agencyCommission: { type: 'fixed', value: 50 },
    currency: 'EUR'
  },
  {
    id: '7',
    name: 'Aman Tokyo',
    category: 5,
    location: {
      city: 'Tokyo',
      country: 'Japan 🇯🇵',
      address: 'The Otemachi Tower, Tokyo',
      coordinates: { lat: 35.6850, lng: 139.7670 }
    },
    description: 'Minimalist luxury hotel in the heart of Tokyo',
    images: ['hotel9.jpg'],
    amenities: [
      { icon: Wifi, name: 'Free WiFi', available: true },
      { icon: Waves, name: 'Onsen Pool', available: true },
      { icon: Dumbbell, name: 'Aman Spa', available: true },
      { icon: Utensils, name: 'Japanese Cuisine', available: true }
    ],
    roomTypes: [
      { type: 'Deluxe Room', price: 980, maxOccupancy: 2, available: 8, total: 15, amenities: ['City View', 'Japanese Design'] },
      { type: 'Premier Suite', price: 1650, maxOccupancy: 3, available: 3, total: 7, amenities: ['Imperial Palace View', 'Living Area'] }
    ],
    checkInDate: '2025-11-05',
    checkOutDate: '2025-11-12',
    status: 'Available',
    totalRooms: 22,
    availableRooms: 11,
    rating: 4.9,
    reviews: 890,
    createdAt: '2025-10-14',
    validUntil: '2025-11-01',
    availableDates: [
      { id: '1', checkIn: '2025-11-05', checkOut: '2025-11-12' },
      { id: '2', checkIn: '2025-11-20', checkOut: '2025-11-27' }
    ],
    supplierCommission: { type: 'percentage', value: 8 },
    agencyCommission: { type: 'percentage', value: 10 },
    currency: 'JPY'
  },
  {
    id: '8',
    name: 'Santorini Grace Hotel',
    category: 4,
    location: {
      city: 'Santorini',
      country: 'Greece 🇬🇷',
      address: 'Imerovigli, Santorini',
      coordinates: { lat: 36.4315, lng: 25.4311 }
    },
    description: 'Boutique hotel with stunning caldera views',
    images: ['hotel10.jpg'],
    amenities: [
      { icon: Wifi, name: 'Free WiFi', available: true },
      { icon: Waves, name: 'Infinity Pool', available: true },
      { icon: Utensils, name: 'Restaurant', available: true },
      { icon: Coffee, name: 'Bar', available: true }
    ],
    roomTypes: [
      { type: 'Grace Room', price: 520, maxOccupancy: 2, available: 10, total: 15, amenities: ['Caldera View', 'Private Terrace'] },
      { type: 'Honeymoon Suite', price: 890, maxOccupancy: 2, available: 3, total: 5, amenities: ['Private Pool', 'Sea View'] }
    ],
    checkInDate: '2025-10-30',
    checkOutDate: '2025-11-05',
    status: 'Available',
    totalRooms: 20,
    availableRooms: 13,
    rating: 4.8,
    reviews: 1450,
    createdAt: '2025-10-14',
    validUntil: '2025-10-28',
    availableDates: [
      { id: '1', checkIn: '2025-10-30', checkOut: '2025-11-05' }
    ],
    supplierCommission: { type: 'percentage', value: 15 },
    agencyCommission: { type: 'percentage', value: 12 },
    currency: 'EUR'
  }
];

const HotelsModule = () => {
  const [hotels, setHotels] = useState<HotelInventory[]>(mockHotels);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelInventory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  
  // Countries and Cities for filtering
  const countriesWithCities = [
    { country: 'Egypt 🇪🇬', cities: ['Cairo', 'Alexandria', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El Sheikh', 'Dahab'] },
    { country: 'United Arab Emirates 🇦🇪', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'] },
    { country: 'Saudi Arabia 🇸🇦', cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif'] },
    { country: 'Turkey 🇹🇷', cities: ['Istanbul', 'Ankara', 'Antalya', 'Bodrum', 'Cappadocia', 'Izmir'] },
    { country: 'United Kingdom 🇬🇧', cities: ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Liverpool'] },
    { country: 'United States 🇺🇸', cities: ['New York', 'Los Angeles', 'Miami', 'Las Vegas', 'Chicago', 'Orlando'] },
    { country: 'France 🇫🇷', cities: ['Paris', 'Nice', 'Lyon', 'Marseille', 'Cannes', 'Bordeaux'] },
    { country: 'Italy 🇮🇹', cities: ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Pisa'] },
    { country: 'Spain 🇪🇸', cities: ['Barcelona', 'Madrid', 'Valencia', 'Seville', 'Malaga', 'Ibiza'] },
    { country: 'Greece 🇬🇷', cities: ['Athens', 'Santorini', 'Mykonos', 'Crete', 'Rhodes', 'Thessaloniki'] },
    { country: 'Thailand 🇹🇭', cities: ['Bangkok', 'Phuket', 'Pattaya', 'Chiang Mai', 'Krabi', 'Koh Samui'] },
    { country: 'Malaysia 🇲🇾', cities: ['Kuala Lumpur', 'Penang', 'Langkawi', 'Malacca', 'Johor Bahru'] },
    { country: 'Singapore 🇸🇬', cities: ['Singapore', 'Sentosa'] },
    { country: 'India 🇮🇳', cities: ['Delhi', 'Mumbai', 'Goa', 'Jaipur', 'Agra', 'Bangalore'] },
    { country: 'China 🇨🇳', cities: ['Beijing', 'Shanghai', 'Hong Kong', 'Guangzhou', 'Shenzhen'] },
    { country: 'Japan 🇯🇵', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima', 'Nara', 'Fukuoka'] },
    { country: 'Australia 🇦🇺', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Gold Coast'] },
    { country: 'New Zealand 🇳🇿', cities: ['Auckland', 'Wellington', 'Queenstown', 'Christchurch'] },
    { country: 'South Africa 🇿🇦', cities: ['Cape Town', 'Johannesburg', 'Durban', 'Port Elizabeth'] },
    { country: 'Morocco 🇲🇦', cities: ['Marrakech', 'Casablanca', 'Fes', 'Rabat', 'Tangier'] },
    { country: 'Jordan 🇯🇴', cities: ['Amman', 'Petra', 'Aqaba', 'Dead Sea', 'Wadi Rum'] },
    { country: 'Lebanon 🇱🇧', cities: ['Beirut', 'Byblos', 'Baalbek', 'Tripoli', 'Sidon'] },
    { country: 'Qatar 🇶🇦', cities: ['Doha', 'Al Wakrah', 'Al Khor'] },
    { country: 'Kuwait 🇰🇼', cities: ['Kuwait City', 'Hawalli', 'Salmiya'] },
    { country: 'Bahrain 🇧🇭', cities: ['Manama', 'Riffa', 'Muharraq'] },
    { country: 'Oman 🇴🇲', cities: ['Muscat', 'Salalah', 'Nizwa', 'Sur'] },
  ];
  
  // Get available cities based on selected country
  const availableCitiesForFilter = filterCountry === 'all' 
    ? [] 
    : countriesWithCities.find(c => c.country === filterCountry)?.cities || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Sold Out':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Maintenance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Blocked':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || hotel.status === filterStatus;
    const matchesCountry = filterCountry === 'all' || hotel.location.country === filterCountry;
    const matchesCity = filterCity === 'all' || hotel.location.city === filterCity;
    
    return matchesSearch && matchesStatus && matchesCountry && matchesCity;
  });

  const handleDeleteHotel = (id: string) => {
    if (confirm('Are you sure you want to delete this hotel?')) {
      setHotels(prev => prev.filter(hotel => hotel.id !== id));
    }
  };

  const renderHotelCard = (hotel: HotelInventory) => (
    <div key={hotel.id} className="card-modern p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{hotel.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(hotel.status)}`}>
              {hotel.status}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              {renderStars(hotel.category)}
              <span className="ml-1">({hotel.category} Star)</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{hotel.location.city}, {hotel.location.country}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedHotel(hotel)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteHotel(hotel.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rating & Reviews */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center">
          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
          <span className="font-semibold text-gray-900 dark:text-white">{hotel.rating}</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">({hotel.reviews} reviews)</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-1" />
          <span className="text-sm">{hotel.checkInDate} - {hotel.checkOutDate}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {hotel.description}
      </p>

      {/* Amenities */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Amenities:</h4>
        <div className="flex flex-wrap gap-2">
          {hotel.amenities.slice(0, 4).map((amenity, index) => {
            const IconComponent = amenity.icon;
            return (
              <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg text-xs">
                <IconComponent className="w-3 h-3 mr-1 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{amenity.name}</span>
              </div>
            );
          })}
          {hotel.amenities.length > 4 && (
            <div className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              +{hotel.amenities.length - 4} more
            </div>
          )}
        </div>
      </div>

      {/* Room Types */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 dark:text-white">Room Types:</h4>
        {hotel.roomTypes.map((room, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">{room.type}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Max: {room.maxOccupancy} guests</span>
                <span>Available: {room.available}/{room.total}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">${room.price}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">per night</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total Availability */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {hotel.availableRooms}/{hotel.totalRooms} rooms available
            </span>
          </div>
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
            <div 
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${(hotel.availableRooms / hotel.totalRooms) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (showAddForm) {
    return <HotelForm onClose={() => setShowAddForm(false)} onSave={(newHotel) => {
      setHotels(prev => [...prev, { ...newHotel, id: Date.now().toString() }]);
      setShowAddForm(false);
    }} />;
  }

  if (selectedHotel) {
    return <HotelForm 
      hotel={selectedHotel} 
      onClose={() => setSelectedHotel(null)} 
      onSave={(updatedHotel) => {
        setHotels(prev => prev.map(hotel => 
          hotel.id === updatedHotel.id ? updatedHotel : hotel
        ));
        setSelectedHotel(null);
      }} 
    />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hotels Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage hotel inventory and bookings</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-gradient"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Hotel
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card-modern p-6 space-y-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 mb-2">
          <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Search & Filters</h3>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-400" />
          <input
            type="text"
            placeholder="🔍 Search by hotel name, city, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base font-medium bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700 rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-400 transition-all shadow-sm hover:shadow-md"
          />
        </div>
        
        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Country Filter */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Country
            </label>
            <select
              value={filterCountry}
              onChange={(e) => {
                setFilterCountry(e.target.value);
                setFilterCity('all'); // Reset city when country changes
              }}
              className="w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-700 rounded-xl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 focus:border-green-500 dark:focus:border-green-400 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">🌍 All Countries</option>
              {countriesWithCities.map((item) => (
                <option key={item.country} value={item.country}>
                  {item.country}
                </option>
              ))}
            </select>
          </div>
          
          {/* City Filter */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
              City
            </label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              disabled={filterCountry === 'all'}
              className={`w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 rounded-xl transition-all shadow-sm cursor-pointer ${
                filterCountry === 'all' 
                  ? 'border-gray-300 dark:border-gray-700 opacity-60 cursor-not-allowed' 
                  : 'border-purple-300 dark:border-purple-700 hover:shadow-md focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900 focus:border-purple-500 dark:focus:border-purple-400'
              }`}
            >
              <option value="all">🏙️ {filterCountry === 'all' ? 'Select Country First' : 'All Cities'}</option>
              {availableCitiesForFilter.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
              Status
            </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-700 rounded-xl focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900 focus:border-orange-500 dark:focus:border-orange-400 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">📊 All Status</option>
              <option value="Available">✅ Available</option>
              <option value="Sold Out">❌ Sold Out</option>
              <option value="Maintenance">🔧 Maintenance</option>
              <option value="Blocked">🚫 Blocked</option>
        </select>
          </div>
        </div>
        
        {/* Active Filters Summary */}
        {(filterCountry !== 'all' || filterCity !== 'all' || filterStatus !== 'all' || searchTerm) && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t-2 border-blue-200 dark:border-blue-800">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Active Filters:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium flex items-center">
                🔍 "{searchTerm}"
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSearchTerm('')} />
              </span>
            )}
            {filterCountry !== 'all' && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium flex items-center">
                {filterCountry}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => { setFilterCountry('all'); setFilterCity('all'); }} />
              </span>
            )}
            {filterCity !== 'all' && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium flex items-center">
                {filterCity}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilterCity('all')} />
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium flex items-center">
                {filterStatus}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilterStatus('all')} />
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCountry('all');
                setFilterCity('all');
                setFilterStatus('all');
              }}
              className="ml-auto px-4 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-full text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHotels.map(renderHotelCard)}
      </div>

      {/* Empty State */}
      {filteredHotels.length === 0 && (
        <div className="text-center py-12">
          <Hotel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Hotels Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first hotel'
            }
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-gradient"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Hotel
          </button>
        </div>
      )}
    </div>
  );
};

// Hotel Form Component
const HotelForm = ({ hotel, onClose, onSave }: {
  hotel?: HotelInventory;
  onClose: () => void;
  onSave: (hotel: any) => void;
}) => {
  const [formData, setFormData] = useState({
    name: hotel?.name || '',
    category: hotel?.category || 5,
    location: {
      city: hotel?.location.city || '',
      country: hotel?.location.country || '',
      address: hotel?.location.address || '',
    },
    description: hotel?.description || '',
    images: hotel?.images || [] as string[],
    checkInDate: hotel?.checkInDate || '',
    checkOutDate: hotel?.checkOutDate || '',
    availableDates: hotel?.availableDates || [] as { id: string; checkIn: string; checkOut: string }[],
    currency: hotel?.currency || 'USD',
    supplierCommission: hotel?.supplierCommission || {
      type: 'fixed' as 'fixed' | 'percentage',
      value: 0,
    },
    agencyCommission: hotel?.agencyCommission || {
      type: 'fixed' as 'fixed' | 'percentage',
      value: 0,
    },
    roomTypes: hotel?.roomTypes || [] as RoomType[],
    amenities: hotel?.amenities || [] as HotelAmenity[],
    status: hotel?.status || 'Available' as 'Available' | 'Sold Out' | 'Maintenance' | 'Blocked',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newRoomType, setNewRoomType] = useState<RoomType>({
    type: '',
    price: 0,
    maxOccupancy: 2,
    available: 0,
    total: 0,
    amenities: []
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Countries and Cities
  const countriesWithCities = [
    { country: 'Egypt 🇪🇬', cities: ['Cairo', 'Alexandria', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El Sheikh', 'Dahab'] },
    { country: 'United Arab Emirates 🇦🇪', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'] },
    { country: 'Saudi Arabia 🇸🇦', cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif'] },
    { country: 'Turkey 🇹🇷', cities: ['Istanbul', 'Ankara', 'Antalya', 'Bodrum', 'Cappadocia', 'Izmir'] },
    { country: 'United Kingdom 🇬🇧', cities: ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Liverpool'] },
    { country: 'United States 🇺🇸', cities: ['New York', 'Los Angeles', 'Miami', 'Las Vegas', 'Chicago', 'Orlando'] },
    { country: 'France 🇫🇷', cities: ['Paris', 'Nice', 'Lyon', 'Marseille', 'Cannes', 'Bordeaux'] },
    { country: 'Italy 🇮🇹', cities: ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Pisa'] },
    { country: 'Spain 🇪🇸', cities: ['Barcelona', 'Madrid', 'Valencia', 'Seville', 'Malaga', 'Ibiza'] },
    { country: 'Greece 🇬🇷', cities: ['Athens', 'Santorini', 'Mykonos', 'Crete', 'Rhodes', 'Thessaloniki'] },
    { country: 'Thailand 🇹🇭', cities: ['Bangkok', 'Phuket', 'Pattaya', 'Chiang Mai', 'Krabi', 'Koh Samui'] },
    { country: 'Malaysia 🇲🇾', cities: ['Kuala Lumpur', 'Penang', 'Langkawi', 'Malacca', 'Johor Bahru'] },
    { country: 'Singapore 🇸🇬', cities: ['Singapore', 'Sentosa'] },
    { country: 'India 🇮🇳', cities: ['Delhi', 'Mumbai', 'Goa', 'Jaipur', 'Agra', 'Bangalore'] },
    { country: 'China 🇨🇳', cities: ['Beijing', 'Shanghai', 'Hong Kong', 'Guangzhou', 'Shenzhen'] },
    { country: 'Japan 🇯🇵', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima', 'Nara', 'Fukuoka'] },
    { country: 'Australia 🇦🇺', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Gold Coast'] },
    { country: 'New Zealand 🇳🇿', cities: ['Auckland', 'Wellington', 'Queenstown', 'Christchurch'] },
    { country: 'South Africa 🇿🇦', cities: ['Cape Town', 'Johannesburg', 'Durban', 'Port Elizabeth'] },
    { country: 'Morocco 🇲🇦', cities: ['Marrakech', 'Casablanca', 'Fes', 'Rabat', 'Tangier'] },
    { country: 'Jordan 🇯🇴', cities: ['Amman', 'Petra', 'Aqaba', 'Dead Sea', 'Wadi Rum'] },
    { country: 'Lebanon 🇱🇧', cities: ['Beirut', 'Byblos', 'Baalbek', 'Tripoli', 'Sidon'] },
    { country: 'Qatar 🇶🇦', cities: ['Doha', 'Al Wakrah', 'Al Khor'] },
    { country: 'Kuwait 🇰🇼', cities: ['Kuwait City', 'Hawalli', 'Salmiya'] },
    { country: 'Bahrain 🇧🇭', cities: ['Manama', 'Riffa', 'Muharraq'] },
    { country: 'Oman 🇴🇲', cities: ['Muscat', 'Salalah', 'Nizwa', 'Sur'] },
    { country: 'Iraq 🇮🇶', cities: ['Baghdad', 'Erbil', 'Basra', 'Najaf'] },
    { country: 'Palestine 🇵🇸', cities: ['Jerusalem', 'Ramallah', 'Bethlehem', 'Hebron'] },
    { country: 'Syria 🇸🇾', cities: ['Damascus', 'Aleppo', 'Homs', 'Latakia'] },
    { country: 'Yemen 🇾🇪', cities: ['Sanaa', 'Aden', 'Taiz', 'Hodeidah'] },
    { country: 'Libya 🇱🇾', cities: ['Tripoli', 'Benghazi', 'Misrata'] },
    { country: 'Tunisia 🇹🇳', cities: ['Tunis', 'Sousse', 'Sfax', 'Djerba'] },
    { country: 'Algeria 🇩🇿', cities: ['Algiers', 'Oran', 'Constantine', 'Annaba'] },
    { country: 'Sudan 🇸🇩', cities: ['Khartoum', 'Omdurman', 'Port Sudan'] },
    { country: 'Somalia 🇸🇴', cities: ['Mogadishu', 'Hargeisa', 'Bosaso'] },
    { country: 'Mauritania 🇲🇷', cities: ['Nouakchott', 'Nouadhibou'] },
    { country: 'Djibouti 🇩🇯', cities: ['Djibouti City'] },
    { country: 'Comoros 🇰🇲', cities: ['Moroni'] }
  ];

  // Update cities when country changes
  useEffect(() => {
    if (formData.location.country) {
      const country = countriesWithCities.find(c => c.country === formData.location.country);
      if (country) {
        setAvailableCities(country.cities);
        setSelectedCountry(formData.location.country);
      }
    }
  }, []);

  const handleCountryChange = (country: string) => {
    const selectedCountryData = countriesWithCities.find(c => c.country === country);
    if (selectedCountryData) {
      setSelectedCountry(country);
      setAvailableCities(selectedCountryData.cities);
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          country: country,
          city: '' // Reset city when country changes
        }
      }));
    }
  };

  // Available currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
  ];

  const getSelectedCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === formData.currency);
    return currency ? currency.symbol : '';
  };

  // Available amenities
  const availableAmenities = [
    { icon: Wifi, name: 'Free WiFi' },
    { icon: Car, name: 'Parking' },
    { icon: Dumbbell, name: 'Fitness Center' },
    { icon: Waves, name: 'Swimming Pool' },
    { icon: Utensils, name: 'Restaurant' },
    { icon: Coffee, name: 'Room Service' },
  ];

  // Calculate commission
  const calculateCommission = (
    basePrice: number,
    commission: { type: 'fixed' | 'percentage'; value: number }
  ): number => {
    if (commission.type === 'percentage') {
      return (basePrice * commission.value) / 100;
    }
    return commission.value;
  };

  const calculateNetPrice = (roomPrice: number): number => {
    const supplierCommissionAmount = calculateCommission(roomPrice, formData.supplierCommission);
    const agencyCommissionAmount = calculateCommission(roomPrice, formData.agencyCommission);
    return roomPrice - supplierCommissionAmount - agencyCommissionAmount;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Hotel name is required';
    }
    if (!formData.location.city) {
      newErrors.city = 'City is required';
    }
    if (!formData.location.country) {
      newErrors.country = 'Country is required';
    }
    if (formData.roomTypes.length === 0) {
      newErrors.roomTypes = 'At least one room type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRoomType = () => {
    if (newRoomType.type && newRoomType.price > 0) {
      setFormData(prev => ({
        ...prev,
        roomTypes: [...prev.roomTypes, { ...newRoomType }]
      }));
      setNewRoomType({
        type: '',
        price: 0,
        maxOccupancy: 2,
        available: 0,
        total: 0,
        amenities: []
      });
    }
  };

  const handleRemoveRoomType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, i) => i !== index)
    }));
  };

  const handleToggleAmenity = (amenityName: string, icon: any) => {
    const exists = formData.amenities.find(a => a.name === amenityName);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        amenities: prev.amenities.filter(a => a.name !== amenityName)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, { icon, name: amenityName, available: true }]
      }));
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const newHotel = {
        id: hotel?.id || Date.now().toString(),
        name: formData.name,
        category: formData.category,
        location: formData.location,
        description: formData.description,
        images: formData.images,
        amenities: formData.amenities,
        roomTypes: formData.roomTypes,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        availableDates: formData.availableDates,
        supplierCommission: formData.supplierCommission,
        agencyCommission: formData.agencyCommission,
        currency: formData.currency,
        status: formData.status,
        totalRooms: formData.roomTypes.reduce((sum, room) => sum + room.total, 0),
        availableRooms: formData.roomTypes.reduce((sum, room) => sum + room.available, 0),
        rating: hotel?.rating || 0,
        reviews: hotel?.reviews || 0,
        createdAt: hotel?.createdAt || new Date().toISOString().split('T')[0],
        validUntil: hotel?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
      onSave(newHotel);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Hotel className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
        {hotel ? 'Edit Hotel' : 'Add New Hotel'}
      </h2>
                <p className="text-sm text-purple-100 mt-1">
                  Fill in the hotel details below
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

        <div className="p-8 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-purple-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-purple-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-3 shadow-md">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hotel Name */}
              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                  placeholder="e.g., Four Seasons Hotel"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2 font-medium flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Star Category */}
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Star Rating *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ Five Star</option>
                  <option value={4}>⭐⭐⭐⭐ Four Star</option>
                  <option value={3}>⭐⭐⭐ Three Star</option>
                  <option value={2}>⭐⭐ Two Star</option>
                  <option value={1}>⭐ One Star</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                >
                  <option value="Available">✅ Available</option>
                  <option value="Sold Out">❌ Sold Out</option>
                  <option value="Maintenance">🔧 Maintenance</option>
                  <option value="Blocked">🚫 Blocked</option>
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Country *
                </label>
                <select
                  value={formData.location.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold"
                >
                  <option value="">🌍 Select Country</option>
                  {countriesWithCities.map((item) => (
                    <option key={item.country} value={item.country}>
                      {item.country}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm mt-2 font-medium flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.country}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  City *
                </label>
                <select
                  value={formData.location.city}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  disabled={!selectedCountry}
                  className={`w-full px-5 py-4 text-base border-2 rounded-xl transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:outline-none shadow-sm hover:shadow-md font-semibold ${
                    !selectedCountry 
                      ? 'border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-100 dark:focus:ring-blue-900/30'
                  }`}
                >
                  <option value="">🏙️ {selectedCountry ? 'Select City' : 'Select Country First'}</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-500 text-sm mt-2 font-medium flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Full Address
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                  placeholder="e.g., 1089 Corniche El Nil, Garden City"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                  placeholder="Describe the hotel features and highlights..."
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-blue-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-blue-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl mr-3 shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Hotel Amenities
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select all amenities available at your hotel
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableAmenities.map((amenity) => {
                const IconComponent = amenity.icon;
                const isSelected = formData.amenities.some(a => a.name === amenity.name);
                
                return (
                  <button
                    key={amenity.name}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity.name, amenity.icon)}
                    className={`flex items-center p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold text-sm ${
                        isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {amenity.name}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            {formData.amenities.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                  Selected: {formData.amenities.length} amenities
                </p>
              </div>
            )}
          </div>

          {/* Room Types */}
          <div className="bg-gradient-to-br from-green-50 via-white to-green-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-green-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-green-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-3 shadow-md">
                <Bed className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Room Types & Pricing
              </h3>
            </div>

            {/* Add New Room Type */}
            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Add New Room Type
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Room Type Name *
                  </label>
                  <input
                    type="text"
                    value={newRoomType.type}
                    onChange={(e) => setNewRoomType(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm"
                    placeholder="e.g., Deluxe Room"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={newRoomType.price}
                    onChange={(e) => setNewRoomType(prev => ({ ...prev, price: Number(e.target.value) }))}
                    min="0"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    value={newRoomType.maxOccupancy}
                    onChange={(e) => setNewRoomType(prev => ({ ...prev, maxOccupancy: Number(e.target.value) }))}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    &nbsp;
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRoomType}
                    disabled={!newRoomType.type || newRoomType.price <= 0}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all flex items-center justify-center disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Room Types List */}
            {formData.roomTypes.length > 0 ? (
              <div className="space-y-4">
                {formData.roomTypes.map((room, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-green-200 dark:border-gray-600 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                          {room.type}
                        </h5>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {getSelectedCurrencySymbol()} {room.price} / night
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            Max {room.maxOccupancy} guests
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRoomType(index)}
                        className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <Bed className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">No room types added yet</p>
                {errors.roomTypes && (
                  <p className="text-red-500 text-sm mt-2 font-medium flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.roomTypes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Dates & Availability */}
          <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-orange-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-orange-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mr-3 shadow-md">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dates & Availability
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  <Calendar className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                  Check-In Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.checkInDate ? new Date(formData.checkInDate) : null}
                    onChange={(date) => {
                      const dateString = date ? date.toISOString().split('T')[0] : '';
                      setFormData(prev => ({ ...prev, checkInDate: dateString }));
                    }}
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Select check-in date"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-base cursor-pointer border-gray-300 dark:border-gray-600"
                    wrapperClassName="w-full"
                    showPopperArrow={false}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  <Calendar className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                  Check-Out Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.checkOutDate ? new Date(formData.checkOutDate) : null}
                    onChange={(date) => {
                      const dateString = date ? date.toISOString().split('T')[0] : '';
                      setFormData(prev => ({ ...prev, checkOutDate: dateString }));
                    }}
                    minDate={formData.checkInDate ? new Date(formData.checkInDate) : new Date()}
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Select check-out date"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-base cursor-pointer border-gray-300 dark:border-gray-600"
                    wrapperClassName="w-full"
                    showPopperArrow={false}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
              </div>
            </div>

            {/* Available Dates Management */}
            <div className="mt-8 pt-8 border-t-2 border-orange-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  📅 Available Date Periods
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.checkInDate && formData.checkOutDate) {
                      const newDate = {
                        id: Date.now().toString(),
                        checkIn: formData.checkInDate,
                        checkOut: formData.checkOutDate
                      };
                      setFormData(prev => ({
                        ...prev,
                        availableDates: [...prev.availableDates, newDate],
                        checkInDate: '',
                        checkOutDate: ''
                      }));
                    }
                  }}
                  disabled={!formData.checkInDate || !formData.checkOutDate}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all flex items-center shadow-md disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Period
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Add specific date periods when this hotel is available for booking
              </p>

              {formData.availableDates.length > 0 ? (
                <div className="space-y-3">
                  {formData.availableDates.map((dateItem, index) => (
                    <div
                      key={dateItem.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-orange-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-6">
                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          #{index + 1}
                        </span>
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-In</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white">
                              {new Date(dateItem.checkIn).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-Out</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white">
                              {new Date(dateItem.checkOut).toLocaleDateString('en-US', { 
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
                        title="Remove this period"
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
                    No date periods added yet
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Select dates above and click "Add Period"
                  </p>
                </div>
              )}

              {formData.availableDates.length > 0 && (
                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-orange-700 dark:text-orange-400 font-medium flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Total available periods: <span className="font-bold ml-1">{formData.availableDates.length}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Commission & Currency */}
          <div className="bg-gradient-to-br from-teal-50 via-white to-teal-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-teal-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-teal-200 dark:border-gray-700">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl mr-3 shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pricing & Commission
              </h3>
            </div>

            {/* Currency Selection */}
            <div className="mb-6">
              <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Currency *
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 transition-all text-base font-medium"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier Commission */}
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Supplier Commission
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Commission from hotel (deducted from net cost)
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
                    💵 Fixed
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
                    📊 %
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
                    min="0"
                    step="0.01"
                    max={formData.supplierCommission.type === 'percentage' ? 100 : undefined}
                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-base font-medium"
                    placeholder="0"
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
                  Commission to agencies (deducted from sale price)
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
                    💵 Fixed
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
                    📊 %
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
                    min="0"
                    step="0.01"
                    max={formData.agencyCommission.type === 'percentage' ? 100 : undefined}
                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-base font-medium"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                    {formData.agencyCommission.type === 'percentage' ? '%' : getSelectedCurrencySymbol()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t-2 border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all shadow-md"
            >
            Cancel
          </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
            Save Hotel
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelsModule;