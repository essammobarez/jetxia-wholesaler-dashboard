'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plane,
  Hotel,
  Car,
  Camera,
  Utensils,
  Star,
  Clock,
  CheckCircle,
  X,
  Save,
  AlertTriangle,
  Info,
  Upload,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Bed,
  Coffee,
  Palmtree,
  Music,
  Building
} from 'lucide-react';

// Types for Offline Packages
interface PackageInclusion {
  type: 'flight' | 'hotel' | 'transfer' | 'activity' | 'meal' | 'guide';
  icon: any;
  name: string;
  description: string;
  included: boolean;
}

interface PackageItinerary {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: ('Breakfast' | 'Lunch' | 'Dinner')[];
  accommodation?: string;
}

interface OfflinePackage {
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
    singleRooms: {
      total: number;
      booked: number;
    };
    doubleRooms: {
      total: number;
      booked: number;
    };
    tripleRooms: {
      total: number;
      booked: number;
    };
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
const mockPackages: OfflinePackage[] = [
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

const OfflinePackageModule = () => {
  const [packages, setPackages] = useState<OfflinePackage[]>(mockPackages);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<OfflinePackage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
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
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Sold Out':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'Draft':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Budget':
        return 'bg-green-500';
      case 'Standard':
        return 'bg-blue-500';
      case 'Luxury':
        return 'bg-purple-500';
      case 'Premium':
        return 'bg-gold-500 bg-gradient-to-r from-yellow-400 to-yellow-600';
      default:
        return 'bg-gray-500';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = 
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.destination.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.destination.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || pkg.status === filterStatus;
    const matchesCountry = filterCountry === 'all' || pkg.destination.country === filterCountry;
    const matchesCity = filterCity === 'all' || pkg.destination.city === filterCity;
    const matchesCategory = filterCategory === 'all' || pkg.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesCountry && matchesCity;
  });

  const handleDeletePackage = (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      setPackages(prev => prev.filter(pkg => pkg.id !== id));
    }
  };

  const renderPackageCard = (pkg: OfflinePackage) => (
    <div key={pkg.id} className="card-modern p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{pkg.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(pkg.category)} text-white`}>
              {pkg.category}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{pkg.destination.city}, {pkg.destination.country}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{pkg.duration.days} Days / {pkg.duration.nights} Nights</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(pkg.status)}`}>
              {pkg.status}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedPackage(pkg)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeletePackage(pkg.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rating & Reviews */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center">
          {renderStars(pkg.rating)}
          <span className="ml-2 font-semibold text-gray-900 dark:text-white">{pkg.rating}</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">({pkg.reviews} reviews)</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {pkg.description}
      </p>

      {/* Highlights */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Highlights:</h4>
        <div className="grid grid-cols-2 gap-1">
          {pkg.highlights.slice(0, 4).map((highlight, index) => (
            <div key={index} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
              <span className="truncate">{highlight}</span>
            </div>
          ))}
        </div>
        {pkg.highlights.length > 4 && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+{pkg.highlights.length - 4} more highlights</p>
        )}
      </div>

      {/* Inclusions Icons */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Included:</h4>
        <div className="flex flex-wrap gap-2">
          {pkg.inclusions.filter(inc => inc.included).map((inclusion, index) => {
            const IconComponent = inclusion.icon;
            return (
              <div key={index} className="flex items-center bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg text-xs">
                <IconComponent className="w-3 h-3 mr-1 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300">{inclusion.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Starting from</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${pkg.pricing.adult}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">per adult</p>
          </div>
          <div className="text-right text-xs text-gray-500 dark:text-gray-400">
            <p>Child: ${pkg.pricing.child}</p>
            <p>Infant: ${pkg.pricing.infant}</p>
            {pkg.pricing.singleSupplement > 0 && (
              <p>Single: +${pkg.pricing.singleSupplement}</p>
            )}
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Room Availability</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {(pkg.availability.singleRooms.total - pkg.availability.singleRooms.booked) +
             (pkg.availability.doubleRooms.total - pkg.availability.doubleRooms.booked) +
             (pkg.availability.tripleRooms.total - pkg.availability.tripleRooms.booked)}/
            {pkg.availability.singleRooms.total + pkg.availability.doubleRooms.total + pkg.availability.tripleRooms.total} rooms
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
          <div 
            className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
            style={{ 
              width: `${((pkg.availability.singleRooms.booked + pkg.availability.doubleRooms.booked + pkg.availability.tripleRooms.booked) / 
                        (pkg.availability.singleRooms.total + pkg.availability.doubleRooms.total + pkg.availability.tripleRooms.total)) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Dates */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Departure: {new Date(pkg.dates.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>Book by: {new Date(pkg.dates.bookingDeadline).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (showAddForm) {
    return <PackageForm onClose={() => setShowAddForm(false)} onSave={(newPackage) => {
      setPackages(prev => [...prev, { ...newPackage, id: Date.now().toString() }]);
      setShowAddForm(false);
    }} />;
  }

  if (selectedPackage) {
    return <PackageForm 
      package={selectedPackage} 
      onClose={() => setSelectedPackage(null)} 
      onSave={(updatedPackage) => {
        setPackages(prev => prev.map(pkg => 
          pkg.id === updatedPackage.id ? updatedPackage : pkg
        ));
        setSelectedPackage(null);
      }} 
    />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Offline Packages</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage travel packages and itineraries</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-gradient"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card-modern p-6 space-y-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-2 mb-2">
          <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Search & Filters</h3>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-600 dark:text-purple-400" />
          <input
            type="text"
            placeholder="🔍 Search by package name, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base font-medium bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900 focus:border-purple-500 dark:focus:border-purple-400 transition-all shadow-sm hover:shadow-md"
          />
        </div>
        
        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                setFilterCity('all');
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
              <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></span>
              City
            </label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              disabled={filterCountry === 'all'}
              className={`w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 rounded-xl transition-all shadow-sm cursor-pointer ${
                filterCountry === 'all' 
                  ? 'border-gray-300 dark:border-gray-700 opacity-60 cursor-not-allowed' 
                  : 'border-cyan-300 dark:border-cyan-700 hover:shadow-md focus:ring-4 focus:ring-cyan-200 dark:focus:ring-cyan-900 focus:border-cyan-500 dark:focus:border-cyan-400'
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
              <option value="Active">✅ Active</option>
              <option value="Sold Out">❌ Sold Out</option>
              <option value="Cancelled">🚫 Cancelled</option>
              <option value="Draft">📝 Draft</option>
        </select>
          </div>
          
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-pink-500 mr-2"></span>
              Category
            </label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-pink-300 dark:border-pink-700 rounded-xl focus:ring-4 focus:ring-pink-200 dark:focus:ring-pink-900 focus:border-pink-500 dark:focus:border-pink-400 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">🏷️ All Categories</option>
              <option value="Budget">💚 Budget</option>
              <option value="Standard">💙 Standard</option>
              <option value="Luxury">💜 Luxury</option>
              <option value="Premium">⭐ Premium</option>
        </select>
          </div>
        </div>
        
        {/* Active Filters Summary */}
        {(filterCountry !== 'all' || filterCity !== 'all' || filterStatus !== 'all' || filterCategory !== 'all' || searchTerm) && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t-2 border-purple-200 dark:border-purple-800">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Active Filters:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium flex items-center">
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
              <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded-full text-sm font-medium flex items-center">
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
            {filterCategory !== 'all' && (
              <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 rounded-full text-sm font-medium flex items-center">
                {filterCategory}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilterCategory('all')} />
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCountry('all');
                setFilterCity('all');
                setFilterStatus('all');
                setFilterCategory('all');
              }}
              className="ml-auto px-4 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-full text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPackages.map(renderPackageCard)}
      </div>

      {/* Empty State */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Packages Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' || filterCountry !== 'all' || filterCity !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first travel package'
            }
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-gradient"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Package
          </button>
        </div>
      )}
    </div>
  );
};

// Package Form Component
const PackageForm = ({ package: pkg, onClose, onSave }: {
  package?: OfflinePackage;
  onClose: () => void;
  onSave: (packageData: any) => void;
}) => {
  const [formData, setFormData] = useState({
    title: pkg?.title || '',
    destination: {
      city: pkg?.destination.city || '',
      country: pkg?.destination.country || '',
      region: pkg?.destination.region || ''
    },
    duration: {
      days: pkg?.duration.days || 1,
      nights: pkg?.duration.nights || 0
    },
    description: pkg?.description || '',
    highlights: pkg?.highlights || [''],
    category: pkg?.category || 'Standard' as 'Budget' | 'Standard' | 'Luxury' | 'Premium',
    status: pkg?.status || 'Draft' as 'Active' | 'Sold Out' | 'Cancelled' | 'Draft',
    
    // Block Seats Selection
    selectedBlockSeat: null as any,
    selectedDateIndex: null as number | null,  // Index of selected date from availableDates
    
    // Hotel Selection
    selectedHotel: null as any,
    selectedRoomType: null as any,
    
    // Pricing
    pricing: {
      adult: pkg?.pricing.adult || 0,
      child: pkg?.pricing.child || 0,
      infant: pkg?.pricing.infant || 0,
      singleSupplement: pkg?.pricing.singleSupplement || 0
    },
    
    // Commission
    supplierCommission: { type: 'fixed' as 'fixed' | 'percentage', value: 0 },
    agencyCommission: { type: 'percentage' as 'fixed' | 'percentage', value: 10 },
    
    // Availability (Room-based)
    availability: {
      singleRooms: {
        total: pkg?.availability?.singleRooms?.total || 0,
        booked: pkg?.availability?.singleRooms?.booked || 0
      },
      doubleRooms: {
        total: pkg?.availability?.doubleRooms?.total || 0,
        booked: pkg?.availability?.doubleRooms?.booked || 0
      },
      tripleRooms: {
        total: pkg?.availability?.tripleRooms?.total || 0,
        booked: pkg?.availability?.tripleRooms?.booked || 0
      }
    },
    
    // Dates
    dates: {
      startDate: pkg?.dates.startDate || '',
      endDate: pkg?.dates.endDate || '',
      bookingDeadline: pkg?.dates.bookingDeadline || ''
    },
    
    // Itinerary
    itinerary: pkg?.itinerary || [] as PackageItinerary[],
    
    // Images
    images: pkg?.images || [] as string[],
    
    // Inclusions
    selectedInclusions: {
      meals: [] as string[],
      activities: [] as string[],
      extras: [] as string[]
    }
  });

  const [showBlockSeatSelector, setShowBlockSeatSelector] = useState(false);
  const [showHotelSelector, setShowHotelSelector] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    flight: true,
    hotel: true,
    itinerary: false,
    inclusions: false,
    images: false
  });
  const [currentDay, setCurrentDay] = useState<PackageItinerary>({
    day: 1,
    title: '',
    description: '',
    activities: [],
    meals: [],
    accommodation: ''
  });
  const [showDayForm, setShowDayForm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Auto-update availability when hotel is selected
  useEffect(() => {
    if (formData.selectedHotel) {
      // Get room availability from selected hotel
      const hotel = formData.selectedHotel;
      
      // Count rooms by capacity from hotel room types
      let singleCount = 0;
      let doubleCount = 0;
      let tripleCount = 0;
      
      hotel.roomTypes.forEach((room: any) => {
        if (room.maxGuests === 1) singleCount += 10; // Default 10 rooms of this type
        else if (room.maxGuests === 2) doubleCount += 10;
        else if (room.maxGuests >= 3) tripleCount += 10;
      });
      
      setFormData(prev => ({
        ...prev,
        availability: {
          singleRooms: {
            total: singleCount,
            booked: 0 // Will be updated from frontend bookings
          },
          doubleRooms: {
            total: doubleCount,
            booked: 0 // Will be updated from frontend bookings
          },
          tripleRooms: {
            total: tripleCount,
            booked: 0 // Will be updated from frontend bookings
          }
        }
      }));
    }
  }, [formData.selectedHotel]);

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
    { country: 'Germany 🇩🇪', cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'] },
    { country: 'Switzerland 🇨🇭', cities: ['Zurich', 'Geneva', 'Lucerne', 'Interlaken', 'Bern'] },
    { country: 'Austria 🇦🇹', cities: ['Vienna', 'Salzburg', 'Innsbruck', 'Graz'] },
    { country: 'Netherlands 🇳🇱', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'] },
    { country: 'Belgium 🇧🇪', cities: ['Brussels', 'Bruges', 'Antwerp', 'Ghent'] },
    { country: 'Portugal 🇵🇹', cities: ['Lisbon', 'Porto', 'Faro', 'Algarve', 'Madeira'] },
    { country: 'Sweden 🇸🇪', cities: ['Stockholm', 'Gothenburg', 'Malmo'] },
    { country: 'Norway 🇳🇴', cities: ['Oslo', 'Bergen', 'Stavanger', 'Tromso'] },
    { country: 'Denmark 🇩🇰', cities: ['Copenhagen', 'Aarhus', 'Odense'] },
    { country: 'Poland 🇵🇱', cities: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw'] },
    { country: 'Czech Republic 🇨🇿', cities: ['Prague', 'Brno', 'Cesky Krumlov'] },
    { country: 'Russia 🇷🇺', cities: ['Moscow', 'Saint Petersburg', 'Sochi', 'Kazan'] },
    { country: 'Brazil 🇧🇷', cities: ['Rio de Janeiro', 'Sao Paulo', 'Salvador', 'Brasilia'] },
    { country: 'Argentina 🇦🇷', cities: ['Buenos Aires', 'Mendoza', 'Bariloche', 'Cordoba'] },
    { country: 'Mexico 🇲🇽', cities: ['Cancun', 'Mexico City', 'Playa del Carmen', 'Tulum', 'Cabo'] },
    { country: 'Canada 🇨🇦', cities: ['Toronto', 'Vancouver', 'Montreal', 'Quebec City', 'Calgary'] },
    { country: 'Maldives 🇲🇻', cities: ['Male', 'Hulhumale', 'Maafushi', 'Addu City'] },
    { country: 'Seychelles 🇸🇨', cities: ['Victoria', 'Mahe', 'Praslin', 'La Digue'] },
    { country: 'Mauritius 🇲🇺', cities: ['Port Louis', 'Grand Baie', 'Flic en Flac'] },
    { country: 'Sri Lanka 🇱🇰', cities: ['Colombo', 'Kandy', 'Galle', 'Ella', 'Sigiriya'] },
    { country: 'Indonesia 🇮🇩', cities: ['Bali', 'Jakarta', 'Yogyakarta', 'Lombok', 'Bandung'] },
    { country: 'Philippines 🇵🇭', cities: ['Manila', 'Cebu', 'Boracay', 'Palawan', 'Davao'] },
    { country: 'Vietnam 🇻🇳', cities: ['Hanoi', 'Ho Chi Minh', 'Da Nang', 'Hoi An', 'Nha Trang'] }
  ];

  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Available options
  const availableMeals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const availableActivities = [
    'City Tour', 'Museum Visit', 'Beach Activities', 'Desert Safari', 
    'Boat Cruise', 'Shopping', 'Cultural Show', 'Adventure Sports',
    'Wildlife Safari', 'Historical Sites', 'Food Tasting', 'Photography Tour'
  ];
  const availableExtras = [
    'Airport Meet & Greet', 'Tour Guide', 'Photography', 'Travel Insurance',
    'Visa Assistance', 'SIM Card', 'Laundry Service', 'Room Upgrade'
  ];

  // Helper Functions
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calculateCommission = (price: number, commission: { type: 'fixed' | 'percentage', value: number }) => {
    if (commission.type === 'fixed') {
      return commission.value;
    } else {
      return (price * commission.value) / 100;
    }
  };

  const calculateNetPrice = () => {
    const basePrice = formData.pricing.adult;
    const supplierComm = calculateCommission(basePrice, formData.supplierCommission);
    const agencyComm = calculateCommission(basePrice, formData.agencyCommission);
    return basePrice - supplierComm - agencyComm;
  };

  const handleAddDay = () => {
    if (!currentDay.title || !currentDay.description) {
      alert('Please fill in day title and description');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { ...currentDay, day: prev.itinerary.length + 1 }]
    }));
    
    setCurrentDay({
      day: formData.itinerary.length + 2,
      title: '',
      description: '',
      activities: [],
      meals: [],
      accommodation: ''
    });
    setShowDayForm(false);
  };

  const handleRemoveDay = (dayNumber: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter(day => day.day !== dayNumber)
        .map((day, index) => ({ ...day, day: index + 1 }))
    }));
  };

  const handleToggleMeal = (meal: string) => {
    setCurrentDay(prev => ({
      ...prev,
      meals: prev.meals.includes(meal as any)
        ? prev.meals.filter(m => m !== meal)
        : [...prev.meals, meal as any]
    }));
  };

  const handleToggleActivity = (activity: string) => {
    setCurrentDay(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const handleToggleInclusion = (type: 'meals' | 'activities' | 'extras', item: string) => {
    setFormData(prev => ({
      ...prev,
      selectedInclusions: {
        ...prev.selectedInclusions,
        [type]: prev.selectedInclusions[type].includes(item)
          ? prev.selectedInclusions[type].filter(i => i !== item)
          : [...prev.selectedInclusions[type], item]
      }
    }));
  };

  const handleAddImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    const selected = countriesWithCities.find(c => c.country === country);
    setAvailableCities(selected ? selected.cities : []);
    setFormData(prev => ({ 
      ...prev, 
      destination: { ...prev.destination, country, city: '' }
    }));
  };

  // Mock Block Seats (in real app, this would come from API or parent component)
  const mockBlockSeats = [
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

  // Mock Hotels (in real app, this would come from API or parent component)
  const mockHotels = [
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
      country: 'Thailand 🇹🇭',
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
      country: 'France 🇫🇷',
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
      country: 'Spain 🇪🇸',
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
      country: 'Japan 🇯🇵',
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
      country: 'Greece 🇬🇷',
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
      country: 'Turkey 🇹🇷',
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

  const handleAddHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const handleHighlightChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? value : h)
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title) newErrors.title = 'Package title is required';
    if (!formData.destination.city) newErrors.city = 'Destination city is required';
    if (!formData.destination.country) newErrors.country = 'Country is required';
    if (!formData.selectedBlockSeat) newErrors.blockSeat = 'Please select a flight';
    if (!formData.selectedHotel) newErrors.hotel = 'Please select a hotel';
    if (formData.pricing.adult <= 0) newErrors.pricing = 'Adult price must be greater than 0';
    if (!formData.dates.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.dates.endDate) newErrors.endDate = 'End date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const newPackage: OfflinePackage = {
      id: pkg?.id || Date.now().toString(),
      title: formData.title,
      destination: formData.destination,
      duration: formData.duration,
      description: formData.description,
      highlights: formData.highlights.filter(h => h.trim() !== ''),
      inclusions: [
        { 
          type: 'flight', 
          icon: Plane, 
          name: `${formData.selectedBlockSeat?.airline.name} Flight`, 
          description: `${formData.selectedBlockSeat?.route.from[0]?.code} → ${formData.selectedBlockSeat?.route.to[0]?.code}`, 
          included: true 
        },
        { 
          type: 'hotel', 
          icon: Hotel, 
          name: formData.selectedHotel?.name, 
          description: `${formData.duration.nights} nights in ${formData.selectedHotel?.city}`, 
          included: true 
        }
      ],
      itinerary: [], // Can be built separately
      pricing: formData.pricing,
      availability: formData.availability,
      dates: formData.dates,
      category: formData.category,
      rating: 0,
      reviews: 0,
      images: [],
      status: formData.status,
      createdAt: pkg?.createdAt || new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onSave(newPackage);
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {pkg ? 'Edit Package' : 'Create New Package'}
      </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Combine flights and hotels to create an offline package
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card-modern p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-2">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Basic Information</span>
              </h3>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-bold">
                Required
              </span>
            </div>
            
            <div className="space-y-4">
              {/* Package Title */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Package Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-5 py-4 text-base border-2 rounded-xl transition-all duration-200 ${
                    errors.title 
                      ? 'border-red-500 focus:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md`}
                  placeholder="e.g., Cairo & Luxor Historical Journey"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Country *
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className={`w-full px-5 py-4 text-base border-2 rounded-xl transition-all duration-200 ${
                      errors.country 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md cursor-pointer`}
                  >
                    <option value="">Select Country</option>
                    {countriesWithCities.map((item, idx) => (
                      <option key={idx} value={item.country}>
                        {item.country}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {errors.country}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    City *
                  </label>
                  <select
                    value={formData.destination.city}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      destination: { ...prev.destination, city: e.target.value }
                    }))}
                    disabled={!selectedCountry}
                    className={`w-full px-5 py-4 text-base border-2 rounded-xl transition-all duration-200 ${
                      errors.city 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                    } ${
                      !selectedCountry ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md`}
                  >
                    <option value="">
                      {selectedCountry ? 'Select City' : 'Select Country First'}
                    </option>
                    {availableCities.map((city, idx) => (
                      <option key={idx} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>

              {/* Region (Optional) */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Region <span className="text-gray-400 ml-1">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.destination.region}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    destination: { ...prev.destination, region: e.target.value }
                  }))}
                  className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md"
                  placeholder="e.g., Middle East, North Africa, Mediterranean"
                />
              </div>

              {/* Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration.days}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      duration: { ...prev.duration, days: parseInt(e.target.value) || 1 }
                    }))}
                    className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Nights
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration.nights}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      duration: { ...prev.duration, nights: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Description <span className="text-gray-400 ml-1">(Optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md resize-none"
                  rows={4}
                  placeholder="Describe the package experience, what makes it special, activities included..."
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      category: e.target.value as 'Budget' | 'Standard' | 'Luxury' | 'Premium' 
                    }))}
                    className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 focus:outline-none shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <option value="Budget">💰 Budget</option>
                    <option value="Standard">⭐ Standard</option>
                    <option value="Luxury">👑 Luxury</option>
                    <option value="Premium">💎 Premium</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      status: e.target.value as 'Active' | 'Sold Out' | 'Cancelled' | 'Draft' 
                    }))}
                    className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/30 focus:outline-none shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <option value="Draft">📝 Draft</option>
                    <option value="Active">✅ Active</option>
                    <option value="Sold Out">🔴 Sold Out</option>
                    <option value="Cancelled">❌ Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Flight Selection */}
          <div className="card-modern p-6 border-2 border-cyan-200 dark:border-cyan-800 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg mr-2">
                  <Plane className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <span>Flight (Block Seats)</span>
              </h3>
              <button
                onClick={() => setShowBlockSeatSelector(!showBlockSeatSelector)}
                className="btn-gradient text-sm"
              >
                {formData.selectedBlockSeat ? 'Change Flight' : 'Select Flight'}
          </button>
        </div>

            {errors.blockSeat && !formData.selectedBlockSeat && (
              <p className="text-red-500 text-xs mb-3">{errors.blockSeat}</p>
            )}

            {formData.selectedBlockSeat ? (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={formData.selectedBlockSeat.airline.logo} 
                        alt={formData.selectedBlockSeat.airline.name}
                        className="w-8 h-8 rounded"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formData.selectedBlockSeat.airline.name} {formData.selectedBlockSeat.flightNumber}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formData.selectedBlockSeat.route.from[0]?.city} → {formData.selectedBlockSeat.route.to[0]?.city}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formData.selectedBlockSeat.departureTime}
                      </p>
                      <p className="text-xs text-gray-500">{formData.selectedBlockSeat.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                    <span>{formData.selectedBlockSeat.departureDate}</span>
                    <span>Economy: ${formData.selectedBlockSeat.pricing.economy}</span>
                  </div>
                </div>

                {/* Available Dates Section */}
                {formData.selectedBlockSeat.availableDates && formData.selectedBlockSeat.availableDates.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Available Dates
                      </h4>
                      <span className="text-xs bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded-full text-purple-900 dark:text-purple-100 font-semibold">
                        {formData.selectedBlockSeat.availableDates.length} dates
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {formData.selectedBlockSeat.availableDates.map((dateInfo: any, idx: number) => {
                        const isSelected = formData.selectedDateIndex === idx;
                        return (
                          <div 
                            key={idx}
                            onClick={() => {
                              setFormData(prev => ({ 
                                ...prev, 
                                selectedDateIndex: idx 
                              }));
                            }}
                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${
                              isSelected 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-600 dark:border-purple-400' 
                                : 'bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-500'
                            }`}
                          >
                            <div className="space-y-1">
                              <p className={`text-xs font-semibold flex items-center ${
                                isSelected ? 'text-white' : 'text-purple-900 dark:text-purple-100'
                              }`}>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                                Dep: {new Date(dateInfo.departure).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p className={`text-xs font-semibold flex items-center ${
                                isSelected ? 'text-white' : 'text-pink-900 dark:text-pink-100'
                              }`}>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                </svg>
                                Ret: {new Date(dateInfo.return).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              {isSelected && (
                                <div className="mt-2 pt-2 border-t border-white/30">
                                  <p className="text-[10px] font-bold text-white flex items-center justify-center">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    SELECTED
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <Plane className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No flight selected</p>
              </div>
            )}

            {showBlockSeatSelector && (
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available Flights:
                </p>
                {mockBlockSeats.map((seat) => (
                  <div
                    key={seat.id}
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        selectedBlockSeat: seat,
                        selectedDateIndex: null,  // Reset selected date when flight changes
                        selectedHotel: null  // Reset hotel when flight changes
                      }));
                      setShowBlockSeatSelector(false);
                      setShowHotelSelector(false);  // Close hotel selector
                      setErrors(prev => ({ ...prev, blockSeat: '', hotel: '' }));
                    }}
                    className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={seat.airline.logo} alt={seat.airline.name} className="w-6 h-6 rounded" />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {seat.airline.name} {seat.flightNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {seat.route.from[0]?.code} → {seat.route.to[0]?.code}
                          </p>
                          {seat.availableDates && seat.availableDates.length > 0 && (
                            <p className="text-xs text-blue-600 font-semibold mt-1">
                              ✈️ {seat.availableDates.length} date{seat.availableDates.length > 1 ? 's' : ''} available
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-blue-600">${seat.pricing.economy}</p>
                        <p className="text-xs text-gray-500">{seat.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hotel Selection */}
          <div className="card-modern p-6 border-2 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-2">
                  <Hotel className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span>Hotel</span>
              </h3>
              <button
                onClick={() => setShowHotelSelector(!showHotelSelector)}
                className="btn-gradient text-sm"
              >
                {formData.selectedHotel ? 'Change Hotel' : 'Select Hotel'}
              </button>
            </div>

            {errors.hotel && !formData.selectedHotel && (
              <p className="text-red-500 text-xs mb-3">{errors.hotel}</p>
            )}

            {formData.selectedHotel ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formData.selectedHotel.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formData.selectedHotel.city}, {formData.selectedHotel.country}
                    </p>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: formData.selectedHotel.rating }, (_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formData.selectedHotel.roomTypes.length} Room Types
                    </p>
                    <p className="text-xs text-gray-500">
                      From ${Math.min(...formData.selectedHotel.roomTypes.map((r: any) => r.price))}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.selectedHotel.amenities.slice(0, 5).map((amenity: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <Hotel className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No hotel selected</p>
              </div>
            )}

            {showHotelSelector && (
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {!formData.selectedBlockSeat && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg mb-3">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Select a flight first to see hotels in the destination city
                    </p>
                  </div>
                )}
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formData.selectedBlockSeat 
                    ? `Hotels in ${formData.selectedBlockSeat.route.to[0]?.city || 'destination'}:`
                    : 'Available Hotels:'}
                </p>
                {(() => {
                  const filteredHotels = mockHotels.filter(hotel => {
                    // If no flight selected, show all hotels
                    if (!formData.selectedBlockSeat) return true;
                    // If flight selected, only show hotels in destination city
                    const destinationCity = formData.selectedBlockSeat.route.to[0]?.city;
                    return hotel.city === destinationCity;
                  });

                  if (filteredHotels.length === 0 && formData.selectedBlockSeat) {
                    return (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <Hotel className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No hotels available in {formData.selectedBlockSeat.route.to[0]?.city}
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                          Try selecting a different flight or add hotels to this city
                        </p>
                      </div>
                    );
                  }

                  return filteredHotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, selectedHotel: hotel }));
                        setShowHotelSelector(false);
                        setErrors(prev => ({ ...prev, hotel: '' }));
                      }}
                      className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-green-400 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {hotel.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {hotel.city}, {hotel.country}
                          </p>
                          <div className="flex items-center mt-1">
                            {Array.from({ length: hotel.rating }, (_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            From ${Math.min(...hotel.roomTypes.map(r => r.price))}
                          </p>
                          <p className="text-xs text-gray-500">{hotel.roomTypes.length} room types</p>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="card-modern p-6 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-2">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span>Availability</span>
              </h3>
              {formData.selectedHotel && (
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-xs font-bold flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  From {formData.selectedHotel.name}
                </span>
              )}
            </div>

            {!formData.selectedHotel ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Select a hotel first</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Room availability will be auto-filled from the selected hotel</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Block Seats Info */}
                {formData.selectedBlockSeat && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">✈️ Flight Capacity (Block Seats)</p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                          {(formData.selectedBlockSeat?.availability?.class1?.total || 0) + 
                           (formData.selectedBlockSeat?.availability?.class2?.total || 0) + 
                           (formData.selectedBlockSeat?.availability?.class3?.total || 0)} seats
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Already Booked</p>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                          {(formData.selectedBlockSeat?.availability?.class1?.booked || 0) + 
                           (formData.selectedBlockSeat?.availability?.class2?.booked || 0) + 
                           (formData.selectedBlockSeat?.availability?.class3?.booked || 0)} seats
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Single Rooms */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    🛏️ Single Rooms <span className="text-gray-400 ml-1">(1 Person per room)</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Total Available</label>
                      <div className="relative">
                        <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                        <input
                          type="number"
                          min="0"
                          value={formData.availability.singleRooms.total}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            availability: { 
                              ...prev.availability, 
                              singleRooms: { ...prev.availability.singleRooms, total: parseInt(e.target.value) || 0 }
                            }
                          }))}
                          className="w-full pl-10 pr-3 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none font-semibold"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                        Already Booked
                        <Info className="w-3 h-3 ml-1 text-gray-400" />
                      </label>
                      <div className="relative">
                        <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={formData.availability.singleRooms.booked}
                          readOnly
                          disabled
                          className="w-full pl-10 pr-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold cursor-not-allowed"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-white/60 dark:bg-gray-900/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">💡 Remaining:</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {Math.max(0, formData.availability.singleRooms.total - formData.availability.singleRooms.booked)} rooms
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Double Rooms */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    🛏️🛏️ Double Rooms <span className="text-gray-400 ml-1">(2 People per room)</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Total Available</label>
                      <div className="relative">
                        <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                        <input
                          type="number"
                          min="0"
                          value={formData.availability.doubleRooms.total}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            availability: { 
                              ...prev.availability, 
                              doubleRooms: { ...prev.availability.doubleRooms, total: parseInt(e.target.value) || 0 }
                            }
                          }))}
                          className="w-full pl-10 pr-3 py-3 border-2 border-purple-300 dark:border-purple-600 rounded-lg transition-all duration-200 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 focus:outline-none font-semibold"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                        Already Booked
                        <Info className="w-3 h-3 ml-1 text-gray-400" />
                      </label>
                      <div className="relative">
                        <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={formData.availability.doubleRooms.booked}
                          readOnly
                          disabled
                          className="w-full pl-10 pr-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold cursor-not-allowed"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-white/60 dark:bg-gray-900/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">💡 Remaining:</span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {Math.max(0, formData.availability.doubleRooms.total - formData.availability.doubleRooms.booked)} rooms
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Triple Rooms */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    🛏️🛏️🛏️ Triple Rooms <span className="text-gray-400 ml-1">(3 People per room)</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Total Available</label>
                      <div className="relative">
                        <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                        <input
                          type="number"
                          min="0"
                          value={formData.availability.tripleRooms.total}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            availability: { 
                              ...prev.availability, 
                              tripleRooms: { ...prev.availability.tripleRooms, total: parseInt(e.target.value) || 0 }
                            }
                          }))}
                          className="w-full pl-10 pr-3 py-3 border-2 border-green-300 dark:border-green-600 rounded-lg transition-all duration-200 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 focus:outline-none font-semibold"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                        Already Booked
                        <Info className="w-3 h-3 ml-1 text-gray-400" />
                      </label>
                      <div className="relative">
                        <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={formData.availability.tripleRooms.booked}
                          readOnly
                          disabled
                          className="w-full pl-10 pr-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold cursor-not-allowed"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-white/60 dark:bg-gray-900/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">💡 Remaining:</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {Math.max(0, formData.availability.tripleRooms.total - formData.availability.tripleRooms.booked)} rooms
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Total Summary Card */}
                <div className="mt-4 p-5 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl border-2 border-indigo-200 dark:border-indigo-700">
                  <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
                    📊 Total Availability Summary
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/60 dark:bg-gray-900/30 p-3 rounded-xl">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🏨 Total Rooms:</span>
                      <span className="font-bold text-gray-900 dark:text-white text-lg">
                        {formData.availability.singleRooms.total + formData.availability.doubleRooms.total + formData.availability.tripleRooms.total} rooms
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-white/60 dark:bg-gray-900/30 p-3 rounded-xl">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">📌 Total Booked:</span>
                      <span className="font-bold text-gray-900 dark:text-white text-lg">
                        {formData.availability.singleRooms.booked + formData.availability.doubleRooms.booked + formData.availability.tripleRooms.booked} rooms
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-xl shadow-lg">
                      <span className="text-sm font-bold text-white">✨ Still Available:</span>
                      <span className="text-2xl font-black text-white">
                        {Math.max(0, 
                          (formData.availability.singleRooms.total - formData.availability.singleRooms.booked) +
                          (formData.availability.doubleRooms.total - formData.availability.doubleRooms.booked) +
                          (formData.availability.tripleRooms.total - formData.availability.tripleRooms.booked)
                        )}
                      </span>
                    </div>
                    
                    <div className="pt-3 border-t border-indigo-300 dark:border-indigo-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex justify-between">
                          <span>👤 Max Capacity (Single):</span>
                          <span className="font-semibold">{formData.availability.singleRooms.total * 1} people</span>
                        </div>
                        <div className="flex justify-between">
                          <span>👥 Max Capacity (Double):</span>
                          <span className="font-semibold">{formData.availability.doubleRooms.total * 2} people</span>
                        </div>
                        <div className="flex justify-between">
                          <span>👨‍👩‍👦 Max Capacity (Triple):</span>
                          <span className="font-semibold">{formData.availability.tripleRooms.total * 3} people</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-indigo-200 dark:border-indigo-800 font-bold text-indigo-700 dark:text-indigo-300">
                          <span>🎯 Total Capacity:</span>
                          <span>
                            {(formData.availability.singleRooms.total * 1) + 
                             (formData.availability.doubleRooms.total * 2) + 
                             (formData.availability.tripleRooms.total * 3)} people
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Highlights */}
          <div className="card-modern p-6 border-2 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span>Package Highlights</span>
              </h3>
            </div>
            
            <div className="space-y-2">
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => handleHighlightChange(index, e.target.value)}
                    className="input-modern flex-1"
                    placeholder="e.g., Visit the Pyramids of Giza"
                  />
                  <button
                    onClick={() => handleRemoveHighlight(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddHighlight}
                className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Add Highlight
              </button>
            </div>
          </div>

          {/* Itinerary Builder */}
          <div className="card-modern p-6">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => toggleSection('itinerary')}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                Day-by-Day Itinerary ({formData.itinerary.length} days)
              </h3>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                {expandedSections.itinerary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {expandedSections.itinerary && (
              <div className="space-y-4">
                {/* Existing Days */}
                {formData.itinerary.map((day) => (
                  <div key={day.day} className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                            Day {day.day}
                          </span>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{day.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{day.description}</p>
                        {day.meals.length > 0 && (
                          <div className="flex items-center space-x-2 mb-2">
                            <Utensils className="w-3 h-3 text-orange-600" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {day.meals.join(', ')}
                            </span>
                          </div>
                        )}
                        {day.activities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {day.activities.map((activity, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs">
                                {activity}
                              </span>
                            ))}
                          </div>
                        )}
                        {day.accommodation && (
                          <div className="flex items-center space-x-2">
                            <Bed className="w-3 h-3 text-orange-600" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {day.accommodation}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveDay(day.day)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add New Day */}
                {!showDayForm ? (
                  <button
                    onClick={() => setShowDayForm(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Day {formData.itinerary.length + 1}
                  </button>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        Day {formData.itinerary.length + 1}
                      </h5>
                      <button
                        onClick={() => setShowDayForm(false)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={currentDay.title}
                        onChange={(e) => setCurrentDay(prev => ({ ...prev, title: e.target.value }))}
                        className="input-modern"
                        placeholder="Day title (e.g., Arrival in Cairo)"
                      />
                      <textarea
                        value={currentDay.description}
                        onChange={(e) => setCurrentDay(prev => ({ ...prev, description: e.target.value }))}
                        className="input-modern"
                        rows={2}
                        placeholder="Day description..."
                      />
                      
                      {/* Meals */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Meals Included:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availableMeals.map((meal) => (
                            <button
                              key={meal}
                              onClick={() => handleToggleMeal(meal)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                currentDay.meals.includes(meal as any)
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                              }`}
                            >
                              {meal}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Activities */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Activities:
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {availableActivities.map((activity) => (
                            <button
                              key={activity}
                              onClick={() => handleToggleActivity(activity)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                currentDay.activities.includes(activity)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                              }`}
                            >
                              {activity}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Accommodation */}
                      <input
                        type="text"
                        value={currentDay.accommodation}
                        onChange={(e) => setCurrentDay(prev => ({ ...prev, accommodation: e.target.value }))}
                        className="input-modern"
                        placeholder="Accommodation (optional)"
                      />

                      <button
                        onClick={handleAddDay}
                        className="w-full btn-gradient"
                      >
                        <Save className="w-4 h-4 inline mr-2" />
                        Save Day
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Package Inclusions */}
          <div className="card-modern p-6">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => toggleSection('inclusions')}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Package Inclusions
              </h3>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                {expandedSections.inclusions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {expandedSections.inclusions && (
              <div className="space-y-4">
                {/* Meals */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Utensils className="w-4 h-4 inline mr-1" />
                    Meals Included:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableMeals.map((meal) => (
                      <button
                        key={meal}
                        onClick={() => handleToggleInclusion('meals', meal)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.selectedInclusions.meals.includes(meal)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                        }`}
                      >
                        {meal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Camera className="w-4 h-4 inline mr-1" />
                    Activities Included:
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {availableActivities.map((activity) => (
                      <button
                        key={activity}
                        onClick={() => handleToggleInclusion('activities', activity)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.selectedInclusions.activities.includes(activity)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                        }`}
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extras */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Star className="w-4 h-4 inline mr-1" />
                    Extra Services:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableExtras.map((extra) => (
                      <button
                        key={extra}
                        onClick={() => handleToggleInclusion('extras', extra)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.selectedInclusions.extras.includes(extra)
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                        }`}
                      >
                        {extra}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Total Selected:</strong> {' '}
                    {formData.selectedInclusions.meals.length + 
                     formData.selectedInclusions.activities.length + 
                     formData.selectedInclusions.extras.length} items
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Images Gallery */}
          <div className="card-modern p-6">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => toggleSection('images')}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-pink-600" />
                Package Images ({formData.images.length})
              </h3>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                {expandedSections.images ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {expandedSections.images && (
              <div className="space-y-4">
                {/* Images Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Package ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Image */}
                <button
                  onClick={handleAddImage}
                  className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-pink-400 hover:text-pink-600 transition-colors font-medium"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Add Image URL
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Add images to showcase your package
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Pricing, Commission, Dates */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pricing */}
          <div className="card-modern p-6 border-2 border-yellow-200 dark:border-yellow-800 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-2">
                  <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span>Pricing</span>
              </h3>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-bold">
                Required
              </span>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Adult Price ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricing.adult}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      pricing: { ...prev.pricing, adult: parseFloat(e.target.value) || 0 }
                    }))}
                    className={`w-full pl-12 pr-5 py-4 border-2 rounded-xl transition-all duration-200 ${
                      errors.pricing 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-yellow-100 dark:focus:ring-yellow-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold text-lg`}
                    placeholder="0.00"
                  />
                </div>
                {errors.pricing && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.pricing}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Child Price ($) <span className="text-gray-400 ml-1">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricing.child}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      pricing: { ...prev.pricing, child: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full pl-12 pr-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold text-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Infant Price ($) <span className="text-gray-400 ml-1">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricing.infant}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      pricing: { ...prev.pricing, infant: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full pl-12 pr-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold text-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Single Supplement ($) <span className="text-gray-400 ml-1">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricing.singleSupplement}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      pricing: { ...prev.pricing, singleSupplement: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full pl-12 pr-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold text-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Commission */}
          <div className="card-modern p-6 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mr-2">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span>Commission</span>
              </h3>
            </div>
            
            <div className="space-y-6">
              {/* Supplier Commission */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-5 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Supplier Commission <span className="text-gray-400 ml-1">(From Airlines)</span>
                </label>
                
                <div className="flex items-center space-x-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      supplierCommission: { ...prev.supplierCommission, type: 'fixed' }
                    }))}
                    className={`flex-1 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      formData.supplierCommission.type === 'fixed'
                        ? 'bg-emerald-500 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-400'
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
                    className={`flex-1 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      formData.supplierCommission.type === 'percentage'
                        ? 'bg-emerald-500 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-400'
                    }`}
                  >
                    📊 Percentage
                  </button>
                </div>
                
                <div className="relative">
                  <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-lg font-bold ${
                    formData.supplierCommission.type === 'percentage' ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {formData.supplierCommission.type === 'percentage' ? '%' : '$'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step={formData.supplierCommission.type === 'percentage' ? '0.1' : '0.01'}
                    max={formData.supplierCommission.type === 'percentage' ? '100' : undefined}
                    value={formData.supplierCommission.value}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      supplierCommission: { ...prev.supplierCommission, value: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full pl-12 pr-5 py-4 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl transition-all duration-200 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold text-lg"
                    placeholder="0.00"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                    {formData.supplierCommission.type === 'percentage' ? 'of Base Price' : 'USD'}
                  </div>
                </div>
              </div>

              {/* Agency Commission */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Agency Commission <span className="text-gray-400 ml-1">(For Your Business)</span>
                </label>
                
                <div className="flex items-center space-x-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      agencyCommission: { ...prev.agencyCommission, type: 'fixed' }
                    }))}
                    className={`flex-1 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      formData.agencyCommission.type === 'fixed'
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400'
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
                    className={`flex-1 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      formData.agencyCommission.type === 'percentage'
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    }`}
                  >
                    📊 Percentage
                  </button>
                </div>
                
                <div className="relative">
                  <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-lg font-bold ${
                    formData.agencyCommission.type === 'percentage' ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {formData.agencyCommission.type === 'percentage' ? '%' : '$'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step={formData.agencyCommission.type === 'percentage' ? '0.1' : '0.01'}
                    max={formData.agencyCommission.type === 'percentage' ? '100' : undefined}
                    value={formData.agencyCommission.value}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      agencyCommission: { ...prev.agencyCommission, value: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full pl-12 pr-5 py-4 border-2 border-blue-300 dark:border-blue-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold text-lg"
                    placeholder="0.00"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                    {formData.agencyCommission.type === 'percentage' ? 'of Base Price' : 'USD'}
                  </div>
                </div>
              </div>

              {/* Net Price Summary */}
              <div className="p-6 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 shadow-lg">
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                  Price Breakdown
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white/60 dark:bg-gray-900/30 p-3 rounded-xl">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Base Price:</span>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">${formData.pricing.adult.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-red-100/60 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">− Supplier Commission:</span>
                    <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                      ${calculateCommission(formData.pricing.adult, formData.supplierCommission).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-red-100/60 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">− Agency Commission:</span>
                    <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                      ${calculateCommission(formData.pricing.adult, formData.agencyCommission).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="pt-4 mt-2 border-t-2 border-emerald-400 dark:border-emerald-600">
                    <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-xl shadow-lg">
                      <span className="text-sm font-bold text-white">💰 Net Price:</span>
                      <span className="text-2xl font-black text-white">${calculateNetPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="card-modern p-6 border-2 border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-2">
                  <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <span>Dates</span>
              </h3>
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-xs font-bold">
                Required
              </span>
            </div>
            
            <div className="space-y-4">
              {/* Start Date */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600 dark:text-red-400 pointer-events-none z-10" />
                  <DatePicker
                    selected={formData.dates.startDate ? new Date(formData.dates.startDate) : null}
                    onChange={(date: Date | null) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        dates: { ...prev.dates, startDate: date ? date.toISOString().split('T')[0] : '' }
                      }));
                      setErrors(prev => ({ ...prev, startDate: '' }));
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="📅 Select start date"
                    className={`w-full pl-12 pr-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900/30 shadow-sm hover:shadow-md cursor-pointer transition-all ${
                      errors.startDate 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400'
                    }`}
                    minDate={new Date()}
                    showPopperArrow={false}
                    autoComplete="off"
                  />
                </div>
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {errors.startDate}
                  </p>
                )}
              </div>
              
              {/* End Date */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  End Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600 dark:text-red-400 pointer-events-none z-10" />
                  <DatePicker
                    selected={formData.dates.endDate ? new Date(formData.dates.endDate) : null}
                    onChange={(date: Date | null) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        dates: { ...prev.dates, endDate: date ? date.toISOString().split('T')[0] : '' }
                      }));
                      setErrors(prev => ({ ...prev, endDate: '' }));
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="📅 Select end date"
                    className={`w-full pl-12 pr-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900/30 shadow-sm hover:shadow-md cursor-pointer transition-all ${
                      errors.endDate 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400'
                    }`}
                    minDate={formData.dates.startDate ? new Date(formData.dates.startDate) : new Date()}
                    showPopperArrow={false}
                    autoComplete="off"
                  />
                </div>
                {errors.endDate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {errors.endDate}
                  </p>
                )}
              </div>
              
              {/* Booking Deadline */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                  Booking Deadline
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-600 dark:text-orange-400 pointer-events-none z-10" />
                  <DatePicker
                    selected={formData.dates.bookingDeadline ? new Date(formData.dates.bookingDeadline) : null}
                    onChange={(date: Date | null) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        dates: { ...prev.dates, bookingDeadline: date ? date.toISOString().split('T')[0] : '' }
                      }));
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="⏰ Select booking deadline"
                    className="w-full pl-12 pr-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-700 rounded-xl focus:border-orange-500 dark:focus:border-orange-400 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/30 shadow-sm hover:shadow-md cursor-pointer transition-all"
                    minDate={new Date()}
                    maxDate={formData.dates.startDate ? new Date(formData.dates.startDate) : undefined}
                    showPopperArrow={false}
                    autoComplete="off"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Last date customers can book this package
                </p>
              </div>

              {/* Date Range Summary */}
              {formData.dates.startDate && formData.dates.endDate && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                      <span className="font-semibold">
                        {new Date(formData.dates.startDate).toLocaleDateString('en-US', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">
                        {new Date(formData.dates.endDate).toLocaleDateString('en-US', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700 text-center">
                    <p className="text-xs font-bold text-red-800 dark:text-red-300">
                      {Math.ceil((new Date(formData.dates.endDate).getTime() - new Date(formData.dates.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days total
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="card-modern p-6 border-2 border-blue-200 dark:border-blue-800 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="space-y-3">
              <button
                onClick={handleSubmit}
                className="w-full btn-gradient flex items-center justify-center space-x-2 text-base"
              >
                <Save className="w-5 h-5" />
                <span>{pkg ? 'Update Package' : 'Create Package'}</span>
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflinePackageModule;