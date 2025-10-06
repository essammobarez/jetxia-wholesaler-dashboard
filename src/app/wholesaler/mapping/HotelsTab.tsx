'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, Eye, Edit, Trash2, Download, RefreshCw, Check, AlertCircle, Navigation, Star, MapPin, Clock, Users } from 'lucide-react';

interface HotelData {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierHotelId: string;
  hotelName: string;
  hotelCode?: string;
  address: string;
  cityName: string;
  cityCode?: string;
  countryName: string;
  countryCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  starRating?: number;
  phone?: string;
  email?: string;
  website?: string;
  amenities?: string[];
  description?: string;
  images?: string[];
  masterId?: string;
  status: 'pending' | 'mapped' | 'review' | 'rejected';
  confidence?: number;
  matchingFactors?: {
    nameMatch: number;
    addressMatch: number;
    locationMatch: number;
    overallMatch: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface MasterHotel {
  id: string;
  name: string;
  alternativeNames: string[];
  address: string;
  cityName: string;
  cityCode: string;
  countryName: string;
  countryCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  starRating: number;
  phone?: string;
  email?: string;
  website?: string;
  amenities: string[];
  description: string;
  images: string[];
  mappedCount: number;
  suppliers: string[];
  chainName?: string;
  brandName?: string;
  createdAt: string;
  updatedAt: string;
}

const HotelsTab = () => {
  const [hotelData, setHotelData] = useState<HotelData[]>([]);
  const [masterHotels, setMasterHotels] = useState<MasterHotel[]>([]);
  const [masterCountries, setMasterCountries] = useState<any[]>([]);
  const [masterCities, setMasterCities] = useState<any[]>([]);
  const [selectedCountryForView, setSelectedCountryForView] = useState<string>('');
  const [selectedCityForView, setSelectedCityForView] = useState<string>('');
  const [groupedView, setGroupedView] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'mapped' | 'review' | 'rejected'>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [showCreateMaster, setShowCreateMaster] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelData | null>(null);
  const [autoMappingEnabled, setAutoMappingEnabled] = useState(true);
  const [showMatchResults, setShowMatchResults] = useState(false);
  const [matchResults, setMatchResults] = useState<{
    success: number;
    warnings: Array<{
      groupName: string;
      hotels: HotelData[];
      issues: string[];
    }>;
  }>({ success: 0, warnings: [] });
  const [isMatching, setIsMatching] = useState(false);
  const [showManualMatchModal, setShowManualMatchModal] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [groupSelectionMode, setGroupSelectionMode] = useState<{ [groupName: string]: boolean }>({});
  const [selectedHotelsInGroup, setSelectedHotelsInGroup] = useState<{ [groupName: string]: Set<string> }>({});
  const [batchSelectionMode, setBatchSelectionMode] = useState(false);
  const [unmatchSelectionMode, setUnmatchSelectionMode] = useState<string | null>(null); // groupName when in unmatch selection mode
  const [selectedHotelsForUnmatch, setSelectedHotelsForUnmatch] = useState<Set<string>>(new Set());
  const [showUnmatchConfirmModal, setShowUnmatchConfirmModal] = useState(false);
  const [showMatchConfirmModal, setShowMatchConfirmModal] = useState(false);
  const [pendingMatchData, setPendingMatchData] = useState<{
    groupName: string;
    hotels: HotelData[];
    warnings: string[];
  } | null>(null);
  const [isUpdatingSuppliers, setIsUpdatingSuppliers] = useState(false);

  // Mock suppliers data
  const suppliers = [
    { id: 'ebooking', name: 'eBooking' },
    { id: 'iwtx', name: 'IWTX' },
    { id: 'amadeus', name: 'Amadeus' },
    { id: 'sabre', name: 'Sabre' },
    { id: 'booking', name: 'Booking.com' },
    { id: 'expedia', name: 'Expedia' }
  ];

  // Generate unique Master ID
  const generateMasterId = () => {
    // Get current count of existing master IDs to generate sequential number
    const existingMasterIds = hotelData
      .filter(h => h.masterId && h.masterId.startsWith('JETIXIA_'))
      .map(h => h.masterId!);
    
    const numbers = existingMasterIds
      .map(id => parseInt(id.replace('JETIXIA_', '')))
      .filter(num => !isNaN(num));
    
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    const paddedNumber = nextNumber.toString().padStart(5, '0');
    
    return `JETIXIA_${paddedNumber}`;
  };

  // Mock hotel data
  const mockHotelData: HotelData[] = [
    // Egypt - Cairo Hotels
    {
      id: '1',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierHotelId: 'EG_CAI_001',
      hotelName: 'Four Seasons Hotel Cairo at Nile Plaza',
      hotelCode: 'FSCAI',
      address: '1089 Corniche El Nil, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0444, longitude: 31.2357 },
      starRating: 5,
      phone: '+20 2 2791 7000',
      amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'WiFi'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierHotelId: 'CAIRO_FS_01',
      hotelName: 'Four Seasons Cairo Nile Plaza',
      hotelCode: 'FS_CAI',
      address: 'Corniche El Nil Street, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0446, longitude: 31.2359 },
      starRating: 5,
      amenities: ['Swimming Pool', 'Spa Center', 'Fitness Center', 'Fine Dining'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierHotelId: 'AMADEUS_FSCAIRO',
      hotelName: 'Four Seasons Hotel Cairo at Nile Plaza',
      hotelCode: 'FSCAI',
      address: '1089 Corniche El Nil, Garden City, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0444, longitude: 31.2357 },
      starRating: 5,
      phone: '+20227917000',
      amenities: ['Outdoor Pool', 'Spa', 'Fitness Center', 'Multiple Restaurants'],
      masterId: 'JETIXIA_00001',
      status: 'mapped',
      confidence: 98,
      matchingFactors: {
        nameMatch: 95,
        addressMatch: 99,
        locationMatch: 100,
        overallMatch: 98
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '4',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierHotelId: 'BOOK_CAI_HILTON',
      hotelName: 'Hilton Cairo Heliopolis',
      hotelCode: 'HILCAI',
      address: 'Uruba Street, Heliopolis, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0876, longitude: 31.3253 },
      starRating: 4,
      amenities: ['Pool', 'Gym', 'Restaurant', 'WiFi', 'Business Center'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '5',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierHotelId: 'SAB_CAI_MARRIOTT',
      hotelName: 'Cairo Marriott Hotel & Omar Khayyam Casino',
      hotelCode: 'MARCAI',
      address: '16 Saraya El Gezira Street, Zamalek, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0618, longitude: 31.2194 },
      starRating: 5,
      amenities: ['Pool', 'Casino', 'Spa', 'Multiple Restaurants', 'WiFi'],
      status: 'mapped',
      masterId: 'JETIXIA_00002',
      confidence: 92,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '6',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierHotelId: 'AMD_CAI_SOFITEL',
      hotelName: 'Sofitel Cairo Nile El Gezirah',
      hotelCode: 'SOFCAI',
      address: '3 El Thawra Council St, Zamalek, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0521, longitude: 31.2280 },
      starRating: 5,
      amenities: ['Pool', 'Spa', 'French Restaurant', 'Nile View', 'WiFi'],
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // Egypt - Alexandria Hotels
    {
      id: '7',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierHotelId: 'EG_ALX_001',
      hotelName: 'Four Seasons Hotel Alexandria',
      hotelCode: 'FSALX',
      address: '399 El Geish Road, San Stefano, Alexandria',
      cityName: 'Alexandria',
      cityCode: 'ALX',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 31.2357, longitude: 29.9632 },
      starRating: 5,
      amenities: ['Beach Access', 'Pool', 'Spa', 'Restaurant', 'WiFi'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '8',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierHotelId: 'IWTX_ALX_HILTON',
      hotelName: 'Hilton Alexandria Corniche',
      hotelCode: 'HILALX',
      address: '544 El Geish Road, Alexandria',
      cityName: 'Alexandria',
      cityCode: 'ALX',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 31.2001, longitude: 29.9187 },
      starRating: 4,
      amenities: ['Sea View', 'Pool', 'Gym', 'Restaurant', 'WiFi'],
      status: 'mapped',
      masterId: 'JETIXIA_00003',
      confidence: 89,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // Egypt - Hurghada Hotels
    {
      id: '9',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierHotelId: 'BOOK_HRG_STEIGEN',
      hotelName: 'Steigenberger Al Dau Beach Hotel',
      hotelCode: 'STEHRG',
      address: 'Al Corniche Road, Hurghada',
      cityName: 'Hurghada',
      cityCode: 'HRG',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 27.2579, longitude: 33.8116 },
      starRating: 5,
      amenities: ['Beach Access', 'Pool', 'Spa', 'Diving Center', 'All Inclusive'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '10',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierHotelId: 'SAB_HRG_INTERCONT',
      hotelName: 'InterContinental Hurghada Resort',
      hotelCode: 'INTHRG',
      address: 'Resort Strip, Hurghada',
      cityName: 'Hurghada',
      cityCode: 'HRG',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 27.1767, longitude: 33.8009 },
      starRating: 5,
      amenities: ['Private Beach', 'Multiple Pools', 'Spa', 'Water Sports', 'Kids Club'],
      status: 'mapped',
      masterId: 'JETIXIA_00004',
      confidence: 87,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // UAE - Dubai Hotels
    {
      id: '11',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierHotelId: 'SAB_DXB_ATLANTIS',
      hotelName: 'Atlantis The Palm Dubai',
      hotelCode: 'ATLDXB',
      address: 'Crescent Road, The Palm Jumeirah, Dubai',
      cityName: 'Dubai',
      cityCode: 'DXB',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      coordinates: { latitude: 25.1308, longitude: 55.1164 },
      starRating: 5,
      amenities: ['Water Park', 'Aquarium', 'Multiple Pools', 'Beach Access'],
      status: 'review',
      confidence: 92,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    // Additional variants of existing hotels from different suppliers
    // Four Seasons Cairo - Additional Suppliers
    {
      id: 'fs_sabre',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierHotelId: 'SAB_FS_CAIRO',
      hotelName: 'Four Seasons Cairo at The Nile',
      hotelCode: 'FSCAI_SAB',
      address: '1089 Corniche El Nil Street, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0445, longitude: 31.2358 },
      starRating: 5,
      phone: '+20 2 2791 7000',
      amenities: ['Pool', 'Spa', 'Restaurant', 'Gym'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'fs_booking',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierHotelId: 'BOOK_FS_CAI',
      hotelName: 'Four Seasons Hotel Cairo Nile Plaza',
      hotelCode: 'FS_CAI_BK',
      address: 'Corniche El Nil, Garden City, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0444, longitude: 31.2357 },
      starRating: 5,
      amenities: ['Swimming Pool', 'Wellness Center', 'Fine Dining', 'WiFi'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // Hilton Cairo - Additional Suppliers
    {
      id: 'hilton_ebooking',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierHotelId: 'EB_HILTON_CAI',
      hotelName: 'Hilton Cairo Heliopolis Hotel',
      hotelCode: 'HIL_CAI',
      address: 'Uruba Street, Heliopolis, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0876, longitude: 31.3253 },
      starRating: 4,
      amenities: ['Outdoor Pool', 'Fitness Center', 'Business Facilities'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'hilton_amadeus',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierHotelId: 'AMD_HIL_HELI',
      hotelName: 'Hilton Heliopolis Cairo',
      hotelCode: 'HILCAI_AMD',
      address: 'Uruba St, Heliopolis, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0875, longitude: 31.3254 },
      starRating: 4,
      amenities: ['Pool', 'Restaurant', 'WiFi'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // Cairo Marriott - Additional Suppliers
    {
      id: 'marriott_ebooking',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierHotelId: 'EB_MARRIOTT_CAI',
      hotelName: 'Cairo Marriott Hotel Omar Khayyam',
      hotelCode: 'MAR_CAI',
      address: '16 Saraya El Gezira St, Zamalek, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0618, longitude: 31.2194 },
      starRating: 5,
      amenities: ['Casino', 'Multiple Restaurants', 'Spa'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'marriott_iwtx',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierHotelId: 'IWTX_MAR_CAIRO',
      hotelName: 'Marriott Cairo & Omar Khayyam Casino',
      hotelCode: 'MARCAI_IW',
      address: 'Saraya El Gezira Street, Zamalek, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0619, longitude: 31.2195 },
      starRating: 5,
      amenities: ['Pool', 'Casino', 'WiFi', 'Restaurants'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'marriott_booking',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierHotelId: 'BOOK_MARRIOTT_ZAM',
      hotelName: 'Cairo Marriott Hotel Zamalek',
      hotelCode: 'MARCAI_BK',
      address: '16 Saraya El Gezira, Zamalek, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0617, longitude: 31.2193 },
      starRating: 5,
      amenities: ['Outdoor Pool', 'Spa', 'Casino', 'Garden'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // Sofitel Cairo - Additional Suppliers
    {
      id: 'sofitel_ebooking',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierHotelId: 'EB_SOFITEL_CAI',
      hotelName: 'Sofitel Cairo Nile El Gezirah',
      hotelCode: 'SOF_CAI',
      address: '3 El Thawra Council Street, Zamalek, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0521, longitude: 31.2280 },
      starRating: 5,
      amenities: ['Pool', 'Spa', 'French Cuisine'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'sofitel_sabre',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierHotelId: 'SAB_SOFITEL_GEZ',
      hotelName: 'Sofitel El Gezirah Cairo',
      hotelCode: 'SOFCAI_SAB',
      address: 'El Thawra Council St, Zamalek, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0522, longitude: 31.2281 },
      starRating: 5,
      amenities: ['Swimming Pool', 'Wellness', 'Restaurant'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // Four Seasons Alexandria - Additional Suppliers
    {
      id: 'fs_alx_iwtx',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierHotelId: 'IWTX_FS_ALX',
      hotelName: 'Four Seasons Alexandria at San Stefano',
      hotelCode: 'FSALX_IW',
      address: '399 El Geish Road, San Stefano, Alexandria',
      cityName: 'Alexandria',
      cityCode: 'ALX',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 31.2357, longitude: 29.9632 },
      starRating: 5,
      amenities: ['Beach', 'Pool', 'Spa'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'fs_alx_amadeus',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierHotelId: 'AMD_FS_ALEX',
      hotelName: 'Four Seasons Hotel Alexandria',
      hotelCode: 'FSALX_AMD',
      address: 'El Geish Road, San Stefano, Alexandria',
      cityName: 'Alexandria',
      cityCode: 'ALX',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 31.2358, longitude: 29.9633 },
      starRating: 5,
      amenities: ['Private Beach', 'Spa Center', 'Fine Dining'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // Hilton Alexandria - Additional Suppliers
    {
      id: 'hilton_alx_booking',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierHotelId: 'BOOK_HIL_ALX',
      hotelName: 'Hilton Alexandria Corniche Hotel',
      hotelCode: 'HILALX_BK',
      address: '544 El Geish Road, Sidi Bishr, Alexandria',
      cityName: 'Alexandria',
      cityCode: 'ALX',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 31.2001, longitude: 29.9187 },
      starRating: 4,
      amenities: ['Sea View', 'Pool', 'Restaurant'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'hilton_alx_amadeus',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierHotelId: 'AMD_HILTON_ALX',
      hotelName: 'Hilton Alexandria',
      hotelCode: 'HILALX_AMD',
      address: 'El Geish Road, Alexandria',
      cityName: 'Alexandria',
      cityCode: 'ALX',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 31.2002, longitude: 29.9188 },
      starRating: 4,
      amenities: ['Pool', 'Gym', 'WiFi'],
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  // Mock master hotels
  const mockMasterHotels: MasterHotel[] = [
    {
      id: 'master_001',
      name: 'Four Seasons Hotel Cairo at Nile Plaza',
      alternativeNames: ['Four Seasons Cairo', 'FS Cairo Nile Plaza'],
      address: '1089 Corniche El Nil, Garden City, Cairo',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      coordinates: { latitude: 30.0444, longitude: 31.2357 },
      starRating: 5,
      phone: '+20 2 2791 7000',
      amenities: ['Outdoor Pool', 'Spa', 'Fitness Center', 'Multiple Restaurants', 'WiFi', 'Business Center'],
      description: 'Luxury hotel on the Nile with stunning river views',
      images: [],
      mappedCount: 1,
      suppliers: ['amadeus'],
      chainName: 'Four Seasons',
      brandName: 'Four Seasons',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_002',
      name: 'Atlantis The Palm Dubai',
      alternativeNames: ['Atlantis Dubai', 'Atlantis The Palm'],
      address: 'Crescent Road, The Palm Jumeirah, Dubai',
      cityName: 'Dubai',
      cityCode: 'DXB',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      coordinates: { latitude: 25.1308, longitude: 55.1164 },
      starRating: 5,
      amenities: ['Water Park', 'Aquarium', 'Multiple Pools', 'Beach Access', 'Spa'],
      description: 'Iconic resort on Palm Jumeirah with water park and aquarium',
      images: [],
      mappedCount: 0,
      suppliers: [],
      chainName: 'Atlantis',
      brandName: 'Atlantis',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHotelData(mockHotelData);
      setMasterHotels(mockMasterHotels);
      
      // Mock master countries (from mapped countries)
      setMasterCountries([
        { id: 'EG', name: 'Egypt', code: 'EG', isActive: true },
        { id: 'AE', name: 'United Arab Emirates', code: 'AE', isActive: true },
        { id: 'SA', name: 'Saudi Arabia', code: 'SA', isActive: true },
        { id: 'TR', name: 'Turkey', code: 'TR', isActive: true },
        { id: 'JO', name: 'Jordan', code: 'JO', isActive: true }
      ]);
      
      // Mock master cities (from mapped cities)
      setMasterCities([
        { id: 'CAI', name: 'Cairo', countryCode: 'EG', countryName: 'Egypt', isActive: true },
        { id: 'ALX', name: 'Alexandria', countryCode: 'EG', countryName: 'Egypt', isActive: true },
        { id: 'HRG', name: 'Hurghada', countryCode: 'EG', countryName: 'Egypt', isActive: true },
        { id: 'SSH', name: 'Sharm El Sheikh', countryCode: 'EG', countryName: 'Egypt', isActive: true },
        { id: 'DXB', name: 'Dubai', countryCode: 'AE', countryName: 'United Arab Emirates', isActive: true },
        { id: 'AUH', name: 'Abu Dhabi', countryCode: 'AE', countryName: 'United Arab Emirates', isActive: true },
        { id: 'SHJ', name: 'Sharjah', countryCode: 'AE', countryName: 'United Arab Emirates', isActive: true },
        { id: 'RUH', name: 'Riyadh', countryCode: 'SA', countryName: 'Saudi Arabia', isActive: true },
        { id: 'JED', name: 'Jeddah', countryCode: 'SA', countryName: 'Saudi Arabia', isActive: true },
        { id: 'MEC', name: 'Mecca', countryCode: 'SA', countryName: 'Saudi Arabia', isActive: true },
        { id: 'MED', name: 'Medina', countryCode: 'SA', countryName: 'Saudi Arabia', isActive: true },
        { id: 'IST', name: 'Istanbul', countryCode: 'TR', countryName: 'Turkey', isActive: true },
        { id: 'ANK', name: 'Ankara', countryCode: 'TR', countryName: 'Turkey', isActive: true },
        { id: 'AYT', name: 'Antalya', countryCode: 'TR', countryName: 'Turkey', isActive: true },
        { id: 'AMM', name: 'Amman', countryCode: 'JO', countryName: 'Jordan', isActive: true },
        { id: 'AQJ', name: 'Aqaba', countryCode: 'JO', countryName: 'Jordan', isActive: true },
        { id: 'PET', name: 'Petra', countryCode: 'JO', countryName: 'Jordan', isActive: true }
      ]);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromSuppliers = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadData();
    } catch (error) {
      console.error('Error fetching from suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateNameSimilarity = (name1: string, name2: string): number => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const n1 = normalize(name1);
    const n2 = normalize(name2);
    
    // Exact match
    if (n1 === n2) return 100;
    
    // One contains the other
    if (n1.includes(n2) || n2.includes(n1)) return 95;
    
    // Check word-by-word similarity
    const words1 = name1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const words2 = name2.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(word => words2.includes(word));
    const similarity = (commonWords.length / Math.max(words1.length, words2.length)) * 100;
    
    return Math.round(similarity);
  };

  // SMART Multi-Factor Hotel Grouping
  const groupHotelsByName = (hotels: HotelData[]) => {
    if (!selectedCityForView) return {};
    
    const cityHotels = hotels.filter(hotel => hotel.cityName === selectedCityForView);
    const groups: { [key: string]: HotelData[] } = {};
    
    console.log('\n\n🏨 ===== STARTING HOTEL GROUPING =====');
    console.log('Total hotels in', selectedCityForView, ':', cityHotels.length);
    
    cityHotels.forEach((hotel, index) => {
      console.log(`\n\n📌 Processing Hotel ${index + 1}:`, hotel.hotelName);
      console.log(`  📋 Hotel Details:`, {
        id: hotel.id,
        supplier: hotel.supplierName,
        masterId: hotel.masterId || 'NO MASTER ID',
        status: hotel.status,
        address: hotel.address.substring(0, 50) + '...',
        phone: hotel.phone || 'NO PHONE'
      });
      
      let groupKey: string | null = null;
      let bestMatch = 0;
      let bestMatchDetails = null;
      
      // ═══════════════════════════════════════════════════════
      // 🔑 PRIORITY 1: Check if hotel has masterId - MUST group with same masterId
      // ═══════════════════════════════════════════════════════
      if (hotel.masterId) {
        console.log('  🔑 Hotel has Master ID:', hotel.masterId);
        
        // Find existing group with same masterId
        const existingGroups = Object.keys(groups);
        for (const existingKey of existingGroups) {
          const existingHotelsInGroup = groups[existingKey];
          // Check if any hotel in this group has the same masterId
          const hasMatchingMasterId = existingHotelsInGroup.some(h => h.masterId === hotel.masterId);
          
          if (hasMatchingMasterId) {
            groupKey = existingKey;
            console.log('  ✅ FOUND EXISTING GROUP with same Master ID!');
            console.log('  ✅ Grouping with:', existingKey);
            break;
          }
        }
      }
      
      // ═══════════════════════════════════════════════════════
      // PRIORITY 2: If no masterId match, use similarity matching
      // (Check similarity for ALL hotels - with or without masterId)
      // ═══════════════════════════════════════════════════════
      if (!groupKey) {
        // Check against all existing groups
        const existingGroups = Object.keys(groups);
        console.log('  Checking similarity against', existingGroups.length, 'existing groups');
        
        existingGroups.forEach((existingKey) => {
          const existingHotel = groups[existingKey][0]; // Compare with first hotel in group
        
        // ═══════════════════════════════════════════════════════
        // FACTOR 1: Name Similarity (REQUIRED ≥80%)
        // ═══════════════════════════════════════════════════════
        const nameSimilarity = calculateNameSimilarity(hotel.hotelName, existingHotel.hotelName);
        
        // ═══════════════════════════════════════════════════════
        // FACTOR 2: Address Similarity (REQUIRED ≥70%)
        // ═══════════════════════════════════════════════════════
        let addressSimilarity = 0;
        if (hotel.address && existingHotel.address) {
          addressSimilarity = calculateNameSimilarity(hotel.address, existingHotel.address);
        }
        
        // ═══════════════════════════════════════════════════════
        // FACTOR 3: Coordinates Match (REQUIRED ≥95% similarity)
        // ═══════════════════════════════════════════════════════
        let locationScore = 0;
        let coordsMatch = false;
        
        if (hotel.coordinates && existingHotel.coordinates) {
          // Compare coordinates as numbers (not distance!)
          const lat1 = hotel.coordinates.latitude;
          const lon1 = hotel.coordinates.longitude;
          const lat2 = existingHotel.coordinates.latitude;
          const lon2 = existingHotel.coordinates.longitude;
          
          // Calculate similarity for latitude (to 4 decimal places = ~11m precision)
          const latDiff = Math.abs(lat1 - lat2);
          const lonDiff = Math.abs(lon1 - lon2);
          
          // Coordinates match if difference is very small
          // Make it more lenient: 0.01 degrees ≈ 1.1 km
          const latSimilarity = latDiff < 0.01 ? (100 - (latDiff * 10000)) : 0;
          const lonSimilarity = lonDiff < 0.01 ? (100 - (lonDiff * 10000)) : 0;
          
          // Average similarity
          locationScore = (latSimilarity + lonSimilarity) / 2;
          
          // Consider it a match if ≥95%
          coordsMatch = locationScore >= 95;
        }
        
        // ═══════════════════════════════════════════════════════
        // FACTOR 4: Star Rating Match (Bonus if same)
        // ═══════════════════════════════════════════════════════
        let ratingMatch = 100; // Default to 100 if no rating data
        if (hotel.starRating && existingHotel.starRating) {
          const ratingDiff = Math.abs(hotel.starRating - existingHotel.starRating);
          if (ratingDiff === 0) {
            ratingMatch = 100; // Exact match
          } else if (ratingDiff === 1) {
            ratingMatch = 80; // Close enough
          } else {
            ratingMatch = 50; // Different ratings = suspicious
          }
        }
        
        // ═══════════════════════════════════════════════════════
        // SMART MATCHING LOGIC - Group with alerts for differences
        // ═══════════════════════════════════════════════════════
        
        // CORE MATCHING: Name + Address + Phone (if available)
        const coreNameMatch = nameSimilarity >= 70;
        const coreAddressMatch = addressSimilarity >= 40 || !hotel.address || !existingHotel.address;
        
        // Phone matching (bonus)
        let phoneMatch = true; // Default true if no phone data
        if (hotel.phone && existingHotel.phone) {
          const normalize = (phone: string) => phone.replace(/[^0-9]/g, '');
          const p1 = normalize(hotel.phone);
          const p2 = normalize(existingHotel.phone);
          phoneMatch = p1 === p2 || p1.includes(p2) || p2.includes(p1);
        }
        
        // COORDINATES: Check but don't block grouping
        const coordsAreSame = coordsMatch;
        const hasCoordsConflict = !coordsAreSame && locationScore > 0 && locationScore < 95;
        
        // RATING: Check but allow small differences
        const ratingOk = ratingMatch >= 80;
        
        // GROUPING DECISION - Multi-tier approach:
        // Tier 1: Strong name match (≥80%) + good coords (≥95%) → Group even if address is weak
        // Tier 2: Good name match (≥70%) + decent address (≥40%) + phone match → Group
        // Tier 3: Acceptable name (≥50%) + excellent coords (≥95%) + good address (≥60%) → Group with warning
        const tier1Match = nameSimilarity >= 80 && locationScore >= 95;
        const tier2Match = coreNameMatch && coreAddressMatch && phoneMatch;
        const tier3Match = nameSimilarity >= 50 && locationScore >= 95 && addressSimilarity >= 60 && phoneMatch;
        const shouldGroup = tier1Match || tier2Match || tier3Match;
        
        // Calculate overall match for display
        let overallMatch = 0;
        let needsReview = false;
        
        if (shouldGroup) {
          overallMatch = (
            (nameSimilarity * 0.40) +
            (addressSimilarity * 0.30) +
            (locationScore * 0.20) +
            (ratingMatch * 0.10)
          );
          
          // Flag for manual review if coordinates differ significantly
          if (hasCoordsConflict) {
            needsReview = true;
            console.warn('⚠️ NEEDS REVIEW - Coordinates mismatch!');
          }
          
          // Flag for manual review if rating differs significantly
          if (!ratingOk) {
            needsReview = true;
            console.warn('⚠️ NEEDS REVIEW - Star rating mismatch!');
          }
          
          // Ensure minimum threshold
          if (overallMatch < 90) {
            overallMatch = 90; // Boost to minimum if core factors match
          }
        } else {
          overallMatch = 0;
        }
        
        // ═══════════════════════════════════════════════════════
        // DEBUG LOGGING - Check what's happening
        // ═══════════════════════════════════════════════════════
        console.log('\n🔍 Comparing Hotels:');
        console.log('  Hotel 1:', hotel.hotelName);
        console.log('  Hotel 2:', existingHotel.hotelName);
        console.log('\n📊 Matching Scores:');
        console.log('  ✓ Name:', nameSimilarity.toFixed(1), '%', coreNameMatch ? '✅' : '❌');
        console.log('  ✓ Address:', addressSimilarity.toFixed(1), '%', coreAddressMatch ? '✅' : '❌');
        console.log('  ✓ Phone:', phoneMatch ? '✅' : '❌');
        console.log('  ✓ Location:', locationScore.toFixed(1), '%', coordsAreSame ? '✅' : (hasCoordsConflict ? '⚠️' : '❌'));
        console.log('  ✓ Rating:', ratingMatch, '%', ratingOk ? '✅' : '❌');
        
        if (hotel.coordinates && existingHotel.coordinates) {
          const latDiff = Math.abs(hotel.coordinates.latitude - existingHotel.coordinates.latitude);
          const lonDiff = Math.abs(hotel.coordinates.longitude - existingHotel.coordinates.longitude);
          console.log('\n📍 Coordinates:');
          console.log('  Hotel 1:', hotel.coordinates.latitude.toFixed(6), ',', hotel.coordinates.longitude.toFixed(6));
          console.log('  Hotel 2:', existingHotel.coordinates.latitude.toFixed(6), ',', existingHotel.coordinates.longitude.toFixed(6));
          console.log('  Difference:', latDiff.toFixed(6), ',', lonDiff.toFixed(6));
        }
        
        console.log('\n🎯 Decision:');
        console.log('  Should Group?', shouldGroup ? '✅ YES' : '❌ NO');
        console.log('  Needs Review?', needsReview ? '⚠️ YES' : '✅ NO');
        console.log('  Overall Match:', overallMatch.toFixed(1), '%');
        console.log('  Current Best Match:', bestMatch.toFixed(1), '%');
        console.log('─────────────────────────────────────');
        
        // Store review flag in the hotel data for UI
        if (needsReview && shouldGroup) {
          (hotel as any)._needsReview = true;
          (hotel as any)._reviewReason = 'Coordinates mismatch';
        }
        
        // Group together if core factors match (even with coord differences)
        // Use >= instead of > to handle cases where multiple hotels have same match score
        if (shouldGroup && overallMatch >= 90 && overallMatch >= bestMatch) {
          bestMatch = overallMatch;
          groupKey = existingKey;
          bestMatchDetails = {
            name: nameSimilarity,
            address: addressSimilarity,
            location: locationScore,
            overall: overallMatch
          };
          console.log('  ✅ NEW BEST MATCH! Will group with:', existingKey);
        }
        });
      }
      
      // If no match found, create new group
      if (!groupKey) {
        groupKey = hotel.hotelName;
        console.log('  🆕 Creating NEW group:', groupKey);
      } else {
        console.log('  ✅ Adding to existing group:', groupKey);
        console.log('  📊 Match details:', bestMatchDetails);
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(hotel);
      console.log('  ✓ Hotel added. Group now has', groups[groupKey].length, 'hotels');
    });
    
    console.log('\n\n🏁 ===== GROUPING COMPLETE =====');
    console.log('Total groups created:', Object.keys(groups).length);
    Object.keys(groups).forEach(key => {
      console.log(`  - "${key}": ${groups[key].length} hotels`);
    });
    console.log('================================\n\n');
    
    // Sort groups alphabetically
    const sortedGroups: { [key: string]: HotelData[] } = {};
    Object.keys(groups).sort().forEach(key => {
      sortedGroups[key] = groups[key];
    });
    
    return sortedGroups;
  };

  // ═══════════════════════════════════════════════════════════════════
  // MATCHING FUNCTIONS - Manual & Auto Match
  // ═══════════════════════════════════════════════════════════════════

  // Detect warnings for a hotel group
  const detectWarnings = (hotelGroup: HotelData[]): string[] => {
    const warnings: string[] = [];
    
    // Check 1: Coordinate mismatches
    const coords = hotelGroup.filter(h => h.coordinates).map(h => h.coordinates!);
    if (coords.length > 1) {
      const firstCoord = coords[0];
      const hasCoordMismatch = coords.some(c => {
        const latDiff = Math.abs(c.latitude - firstCoord.latitude);
        const lonDiff = Math.abs(c.longitude - firstCoord.longitude);
        return latDiff > 0.01 || lonDiff > 0.01; // More than ~1km difference
      });
      if (hasCoordMismatch) {
        warnings.push('⚠️ Coordinate mismatch detected - hotels may be at different locations');
      }
    }
    
    // Check 2: Address variations
    const addresses = hotelGroup.map(h => h.address.toLowerCase().trim()).filter(a => a);
    const uniqueAddresses = new Set(addresses);
    if (uniqueAddresses.size > 1 && addresses.length > 1) {
      const addressSimilarity = calculateNameSimilarity(addresses[0], addresses[1]);
      if (addressSimilarity < 50) {
        warnings.push('⚠️ Significantly different addresses detected');
      }
    }
    
    // Check 3: Different star ratings
    const ratings = hotelGroup.filter(h => h.starRating).map(h => h.starRating!);
    const uniqueRatings = new Set(ratings);
    if (uniqueRatings.size > 1) {
      warnings.push(`⚠️ Different star ratings: ${Array.from(uniqueRatings).join(', ')} stars`);
    }
    
    // Check 4: All from same supplier (suspicious - might be duplicates)
    const suppliers = new Set(hotelGroup.map(h => h.supplierId));
    if (suppliers.size === 1 && hotelGroup.length > 1) {
      warnings.push('⚠️ All hotels from same supplier - possible duplicates');
    }
    
    // Check 5: Missing critical data
    const missingPhone = hotelGroup.every(h => !h.phone);
    if (missingPhone) {
      warnings.push('ℹ️ No phone number available from any supplier');
    }
    
    return warnings;
  };

  // Manual Match - Match a single hotel group
  const handleManualMatch = (hotelGroup: HotelData[], groupName: string) => {
    // ✅ RULE: Must have at least 2 hotels to create a match
    if (hotelGroup.length < 2) {
      alert('⚠️ Cannot match a single hotel.\n\nA Master ID can only be assigned when matching multiple hotels together.\n\nPlease wait for more hotels from other suppliers or use manual selection to add more hotels.');
      return;
    }

    // Detect warnings before matching
    const warnings = detectWarnings(hotelGroup);
    
    // Show confirmation modal with warnings
    setPendingMatchData({
      groupName,
      hotels: hotelGroup,
      warnings
    });
    setShowMatchConfirmModal(true);
  };

  // Process manual match after confirmation (from full group match)
  const processManualMatch = () => {
    if (!pendingMatchData) return;

    const { hotels, groupName } = pendingMatchData;
    
    // Check if any hotel already has a master ID
    const existingMaster = hotels.find(h => h.masterId);
    const masterId = existingMaster?.masterId || generateMasterId();
    
    // Update all hotels in the group to mapped status
    const updatedData = hotelData.map(hotel => {
      const isInGroup = hotels.some(h => h.id === hotel.id);
      if (isInGroup) {
        return {
          ...hotel,
          masterId: masterId,
          status: 'mapped' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return hotel;
    });
    
    setHotelData(updatedData);
    
    // Close modal
    setShowMatchConfirmModal(false);
    setPendingMatchData(null);
    
    // Show success message
    alert(`✅ Successfully matched ${hotels.length} hotels for \"${groupName}\"\nMaster ID: ${masterId}`);
  };

  // Auto Match All - Match all groups automatically
  const handleAutoMatchAll = () => {
    if (!selectedCityForView) {
      alert('⚠️ Please select a city first');
      return;
    }

    setIsMatching(true);
    
    // Get all groups
    const groups = groupHotelsByName(hotelData.filter(h => h.cityName === selectedCityForView));
    
    let successCount = 0;
    const warningsList: Array<{
      groupName: string;
      hotels: HotelData[];
      issues: string[];
    }> = [];
    
    // Process each group
    const updatedData = [...hotelData];
    
    Object.entries(groups).forEach(([groupName, hotelGroup]) => {
      // Skip if already all mapped
      const allMapped = hotelGroup.every(h => h.status === 'mapped');
      if (allMapped) return;
      
      // Detect warnings
      const warnings = detectWarnings(hotelGroup);
      
      // Get or create master ID
      const existingMaster = hotelGroup.find(h => h.masterId);
      const masterId = existingMaster?.masterId || generateMasterId();
      
      // Update hotels
      hotelGroup.forEach(hotel => {
        const index = updatedData.findIndex(h => h.id === hotel.id);
        if (index !== -1) {
          updatedData[index] = {
            ...updatedData[index],
            masterId: masterId,
            status: 'mapped' as const,
            updatedAt: new Date().toISOString()
          };
        }
      });
      
      successCount++;
      
      // Add to warnings list if issues found
      if (warnings.length > 0) {
        warningsList.push({
          groupName,
          hotels: hotelGroup,
          issues: warnings
        });
      }
    });
    
    // Update state
    setHotelData(updatedData);
    setMatchResults({ success: successCount, warnings: warningsList });
    setShowMatchResults(true);
    setIsMatching(false);
  };

  // Confirm match results (close modal)
  const handleConfirmMatchResults = () => {
    setShowMatchResults(false);
    setMatchResults({ success: 0, warnings: [] });
  };

  // Undo auto match
  const handleUndoAutoMatch = () => {
    // In real implementation, would restore previous state
    // For now, just close modal
    alert('ℹ️ Undo functionality - would restore previous state');
    setShowMatchResults(false);
  };

  // Open Manual Match Modal - now toggles batch selection mode
  const handleOpenManualMatchModal = () => {
    if (!selectedCityForView) {
      alert('⚠️ Please select a city first');
      return;
    }
    
    if (batchSelectionMode) {
      // Exit batch mode - clear all selections
      setBatchSelectionMode(false);
      setGroupSelectionMode({});
      setSelectedHotelsInGroup({});
    } else {
      // Enter batch mode - enable checkboxes on all groups
      setBatchSelectionMode(true);
      const groups = groupHotelsByName(hotelData.filter(h => h.cityName === selectedCityForView));
      const newSelectionMode: { [key: string]: boolean } = {};
      const newSelectedHotels: { [key: string]: Set<string> } = {};
      
      Object.entries(groups).forEach(([groupName, hotelGroup]) => {
        // Only enable selection for groups that aren't fully mapped or need rematch
        const hasUnmapped = hotelGroup.some(h => h.status !== 'mapped');
        if (hasUnmapped || true) { // Allow all groups for now
          newSelectionMode[groupName] = true;
          newSelectedHotels[groupName] = new Set(hotelGroup.map(h => h.id));
        }
      });
      
      setGroupSelectionMode(newSelectionMode);
      setSelectedHotelsInGroup(newSelectedHotels);
    }
  };

  // Toggle group selection
  const handleToggleGroup = (groupName: string) => {
    const newSelection = new Set(selectedGroups);
    if (newSelection.has(groupName)) {
      newSelection.delete(groupName);
    } else {
      newSelection.add(groupName);
    }
    setSelectedGroups(newSelection);
  };

  // Match selected groups manually
  const handleMatchSelectedGroups = () => {
    if (selectedGroups.size === 0) {
      alert('⚠️ Please select at least one group');
      return;
    }

    const groups = groupHotelsByName(hotelData.filter(h => h.cityName === selectedCityForView));
    const updatedData = [...hotelData];
    let successCount = 0;

    selectedGroups.forEach(groupName => {
      const hotelGroup = groups[groupName];
      if (!hotelGroup) return;

      // Check if already all mapped
      const allMapped = hotelGroup.every(h => h.status === 'mapped');
      if (allMapped) return;

      // Get or create master ID
      const existingMaster = hotelGroup.find(h => h.masterId);
      const masterId = existingMaster?.masterId || generateMasterId();

      // Update hotels
      hotelGroup.forEach(hotel => {
        const index = updatedData.findIndex(h => h.id === hotel.id);
        if (index !== -1) {
          updatedData[index] = {
            ...updatedData[index],
            masterId: masterId,
            status: 'mapped' as const,
            updatedAt: new Date().toISOString()
          };
        }
      });

      successCount++;
    });

    setHotelData(updatedData);
    setShowManualMatchModal(false);
    setSelectedGroups(new Set());
    alert(`✅ Successfully matched ${successCount} groups!`);
  };

  // Toggle selection mode for a group (inline checkboxes)
  const handleToggleGroupSelectionMode = (groupName: string, hotelGroup: HotelData[]) => {
    setGroupSelectionMode(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
    
    // Initialize with all hotels selected if entering selection mode
    if (!groupSelectionMode[groupName]) {
      const allHotelIds = new Set(hotelGroup.map(h => h.id));
      setSelectedHotelsInGroup(prev => ({
        ...prev,
        [groupName]: allHotelIds
      }));
    }
  };

  // Toggle individual hotel selection within a group
  const handleToggleHotelInGroup = (groupName: string, hotelId: string) => {
    setSelectedHotelsInGroup(prev => {
      const currentSelection = prev[groupName] || new Set();
      const newSelection = new Set(currentSelection);
      
      if (newSelection.has(hotelId)) {
        newSelection.delete(hotelId);
      } else {
        newSelection.add(hotelId);
      }
      
      return {
        ...prev,
        [groupName]: newSelection
      };
    });
  };

  // Confirm match for selected hotels in a group
  const handleConfirmGroupMatch = (groupName: string, allHotels: HotelData[]) => {
    const selectedIds = selectedHotelsInGroup[groupName] || new Set();
    
    if (selectedIds.size === 0) {
      alert('⚠️ Please select at least one hotel');
      return;
    }

    // ✅ RULE: Must have at least 2 hotels to create a match
    if (selectedIds.size < 2) {
      alert('⚠️ You must select at least 2 hotels to create a match.\n\nA Master ID can only be assigned when matching multiple hotels together.');
      return;
    }

    const selectedHotels = allHotels.filter(h => selectedIds.has(h.id));
    
    // Detect warnings before matching
    const warnings = detectWarnings(selectedHotels);
    
    // Show confirmation modal with warnings
    setPendingMatchData({
      groupName,
      hotels: selectedHotels,
      warnings
    });
    setShowMatchConfirmModal(true);
  };

  // Process the actual match after confirmation
  const processMatch = () => {
    if (!pendingMatchData) return;

    const { hotels } = pendingMatchData;
    const selectedIds = new Set(hotels.map(h => h.id));
    
    // Get or create master ID
    const existingMaster = hotels.find(h => h.masterId);
    const masterId = existingMaster?.masterId || generateMasterId();

    // Update only selected hotels
    const updatedData = hotelData.map(hotel => {
      if (selectedIds.has(hotel.id)) {
        return {
          ...hotel,
          masterId: masterId,
          status: 'mapped' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return hotel;
    });

    setHotelData(updatedData);
    
    // Exit selection mode
    setGroupSelectionMode(prev => ({ ...prev, [pendingMatchData.groupName]: false }));
    setSelectedHotelsInGroup(prev => ({ ...prev, [pendingMatchData.groupName]: new Set() }));
    
    // Close modal
    setShowMatchConfirmModal(false);
    setPendingMatchData(null);
    
    alert(`✅ Successfully matched ${selectedIds.size} hotels!\nMaster ID: ${masterId}`);
  };

  // Cancel group selection mode
  const handleCancelGroupSelection = (groupName: string) => {
    setGroupSelectionMode(prev => ({ ...prev, [groupName]: false }));
    setSelectedHotelsInGroup(prev => ({ ...prev, [groupName]: new Set() }));
  };

  // Batch confirm - match all selected hotels in all groups
  const handleBatchConfirm = () => {
    const updatedData = [...hotelData];
    let totalMatched = 0;
    
    Object.entries(selectedHotelsInGroup).forEach(([groupName, selectedIds]) => {
      if (selectedIds.size === 0) return;
      
      // Get hotels for this group
      const groupHotels = hotelData.filter(h => selectedIds.has(h.id));
      
      // Get or create master ID
      const existingMaster = groupHotels.find(h => h.masterId);
      const masterId = existingMaster?.masterId || generateMasterId();
      
      // Update selected hotels
      selectedIds.forEach(hotelId => {
        const index = updatedData.findIndex(h => h.id === hotelId);
        if (index !== -1) {
          updatedData[index] = {
            ...updatedData[index],
            masterId: masterId,
            status: 'mapped' as const,
            updatedAt: new Date().toISOString()
          };
          totalMatched++;
        }
      });
    });
    
    setHotelData(updatedData);
    setBatchSelectionMode(false);
    setGroupSelectionMode({});
    setSelectedHotelsInGroup({});
    
    alert(`✅ Successfully matched ${totalMatched} hotels across all groups!`);
  };

  // Unmatch a hotel group - enable selection mode to choose hotels
  const handleUnmatchGroup = (hotelGroup: HotelData[], groupName: string) => {
    console.log('🔓 Unmatch clicked for group:', groupName);
    setUnmatchSelectionMode(groupName);
    setSelectedHotelsForUnmatch(new Set());
  };

  const toggleHotelForUnmatch = (hotelId: string) => {
    const newSelected = new Set(selectedHotelsForUnmatch);
    if (newSelected.has(hotelId)) {
      newSelected.delete(hotelId);
    } else {
      newSelected.add(hotelId);
    }
    setSelectedHotelsForUnmatch(newSelected);
  };

  const cancelUnmatchSelection = () => {
    setUnmatchSelectionMode(null);
    setSelectedHotelsForUnmatch(new Set());
  };

  const confirmUnmatchSelection = () => {
    if (selectedHotelsForUnmatch.size === 0) {
      alert('⚠️ Please select at least one hotel to unmatch.');
      return;
    }

    // Show confirmation modal
    setShowUnmatchConfirmModal(true);
  };

  const processUnmatch = () => {
    const updatedData = hotelData.map(hotel => {
      if (selectedHotelsForUnmatch.has(hotel.id)) {
        console.log(`Unmatching hotel ${hotel.id}: ${hotel.hotelName} - Keeping masterId: ${hotel.masterId}, changing status to pending`);
        // ✅ IMPORTANT: masterId is NEVER removed or changed once assigned
        // Only the status changes from 'mapped' to 'pending'
        return {
          ...hotel,
          status: 'pending' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return hotel;
    });

    setHotelData(updatedData);
    setUnmatchSelectionMode(null);
    setSelectedHotelsForUnmatch(new Set());
    setShowUnmatchConfirmModal(false);
    alert(`✅ Unmatch successful!\n${selectedHotelsForUnmatch.size} hotels returned to Pending status.\n\n✓ Master ID remains unchanged and preserved permanently.`);
  };

  // Update Suppliers - Fetch new data from suppliers
  const handleUpdateSuppliers = () => {
    setIsUpdatingSuppliers(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // New hotels from Expedia (new supplier)
      const newHotelsFromExpedia: HotelData[] = [
        {
          id: `expedia_${Date.now()}_1`,
          supplierId: 'expedia',
          supplierName: 'Expedia',
          supplierHotelId: 'EXP_FSCAIRO_001',
          hotelName: 'Four Seasons Hotel Cairo Nile Plaza',
          hotelCode: 'FSCAI_EXP',
          address: '1089 Corniche El Nil Street, Cairo',
          cityName: 'Cairo',
          cityCode: 'CAI',
          countryName: 'Egypt',
          countryCode: 'EG',
          coordinates: { latitude: 30.0445, longitude: 31.2358 },
          starRating: 5,
          phone: '+20 2 2791 7000',
          amenities: ['Pool', 'Spa', 'Restaurant', 'Bar', 'WiFi', 'Parking'],
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `expedia_${Date.now()}_2`,
          supplierId: 'expedia',
          supplierName: 'Expedia',
          supplierHotelId: 'EXP_MARRIOTT_CAI',
          hotelName: 'Cairo Marriott Hotel & Omar Khayyam Casino',
          hotelCode: 'MAR_CAI_EXP',
          address: '16 Saray El Gezira Street, Zamalek, Cairo',
          cityName: 'Cairo',
          cityCode: 'CAI',
          countryName: 'Egypt',
          countryCode: 'EG',
          coordinates: { latitude: 30.0626, longitude: 31.2243 },
          starRating: 5,
          phone: '+20 2 2728 3000',
          amenities: ['Casino', 'Pool', 'Spa', 'Multiple Restaurants', 'WiFi'],
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `expedia_${Date.now()}_3`,
          supplierId: 'expedia',
          supplierName: 'Expedia',
          supplierHotelId: 'EXP_KEMPINSKI_CAI',
          hotelName: 'Kempinski Nile Hotel Cairo',
          hotelCode: 'KEMP_CAI_EXP',
          address: '12 Ahmed Ragheb Street, Garden City, Cairo',
          cityName: 'Cairo',
          cityCode: 'CAI',
          countryName: 'Egypt',
          countryCode: 'EG',
          coordinates: { latitude: 30.0382, longitude: 31.2312 },
          starRating: 5,
          phone: '+20 2 2798 0000',
          amenities: ['Rooftop Pool', 'Spa', 'Gym', 'Fine Dining', 'WiFi'],
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // Add new hotels to existing data
      setHotelData(prevData => [...prevData, ...newHotelsFromExpedia]);
      setIsUpdatingSuppliers(false);
      
      alert(`✅ Data updated successfully!\n\nAdded ${newHotelsFromExpedia.length} new hotels from Expedia`);
    }, 1500);
  };

  // Create master hotel data by aggregating best information from all suppliers
  const createMasterFromGroup = (hotelGroup: HotelData[]) => {
    // Find the most complete/accurate data from each supplier
    const getBestName = () => {
      // Prefer longest complete name
      return hotelGroup.reduce((best, hotel) => 
        hotel.hotelName.length > best.hotelName.length ? hotel : best
      ).hotelName;
    };
    
    const getBestAddress = () => {
      // Prefer most detailed address
      return hotelGroup.reduce((best, hotel) => 
        (hotel.address?.length || 0) > (best.address?.length || 0) ? hotel : best
      ).address || '';
    };
    
    const getBestRating = () => {
      // Get highest star rating reported
      const ratings = hotelGroup.filter(h => h.starRating).map(h => h.starRating!);
      return ratings.length > 0 ? Math.max(...ratings) : undefined;
    };
    
    const getBestCoordinates = () => {
      // Use coordinates from mapped hotel, or first one with coordinates
      const mappedHotel = hotelGroup.find(h => h.status === 'mapped' && h.coordinates);
      if (mappedHotel?.coordinates) return mappedHotel.coordinates;
      
      const withCoords = hotelGroup.find(h => h.coordinates);
      return withCoords?.coordinates;
    };
    
    const getBestPhone = () => {
      // Prefer international format
      const phones = hotelGroup.filter(h => h.phone).map(h => h.phone!);
      return phones.find(p => p.startsWith('+')) || phones[0];
    };
    
    const getAllAmenities = () => {
      // Combine all unique amenities
      const allAmenities = new Set<string>();
      hotelGroup.forEach(hotel => {
        hotel.amenities?.forEach(a => allAmenities.add(a));
      });
      return Array.from(allAmenities);
    };
    
    return {
      name: getBestName(),
      address: getBestAddress(),
      starRating: getBestRating(),
      coordinates: getBestCoordinates(),
      phone: getBestPhone(),
      amenities: getAllAmenities(),
      suppliers: hotelGroup.map(h => h.supplierName),
      recordCount: hotelGroup.length
    };
  };

  const runAutoMapping = async () => {
    const threshold = 95; // 95%+ accuracy requirement
    
    hotelData.filter(hotel => hotel.status === 'pending').forEach(hotel => {
      masterHotels.forEach(master => {
        if (hotel.coordinates && master.coordinates) {
          const distance = calculateDistance(
            hotel.coordinates.latitude,
            hotel.coordinates.longitude,
            master.coordinates.latitude,
            master.coordinates.longitude
          );
          
          const nameMatch = calculateNameSimilarity(hotel.hotelName, master.name);
          const locationMatch = distance < 0.5 ? 100 : Math.max(0, 100 - (distance * 20));
          
          let addressMatch = 0;
          if (hotel.address && master.address) {
            addressMatch = calculateNameSimilarity(hotel.address, master.address);
          }
          
          const overallMatch = (nameMatch * 0.4 + addressMatch * 0.3 + locationMatch * 0.3);
          
          if (overallMatch >= threshold) {
            console.log(`Auto-mapping: ${hotel.hotelName} -> ${master.name} (${overallMatch.toFixed(1)}%)`);
          }
        }
      });
    });
  };

  const filteredData = hotelData.filter(item => {
    // First filter by selected country and city for viewing
    const matchesCountry = !selectedCountryForView || item.countryName === selectedCountryForView;
    const matchesCityForView = !selectedCityForView || item.cityName === selectedCityForView;
    
    const matchesSearch = item.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSupplier = selectedSupplier === 'all' || item.supplierId === selectedSupplier;
    const matchesCity = selectedCity === 'all' || item.cityCode === selectedCity;
    const matchesRating = selectedRating === 'all' || 
                         (selectedRating === 'unrated' && !item.starRating) ||
                         (item.starRating && item.starRating.toString() === selectedRating);
    
    return matchesCountry && matchesCityForView && matchesSearch && matchesStatus && matchesSupplier && matchesCity && matchesRating;
  });

  const stats = {
    total: hotelData.length,
    pending: hotelData.filter(item => item.status === 'pending').length,
    mapped: hotelData.filter(item => item.status === 'mapped').length,
    review: hotelData.filter(item => item.status === 'review').length,
    rejected: hotelData.filter(item => item.status === 'rejected').length
  };

  const uniqueCities = Array.from(new Set(hotelData.map(item => item.cityCode)))
    .map(code => {
      const hotel = hotelData.find(item => item.cityCode === code);
      return { code, name: hotel?.cityName || code };
    });

  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: hotelData.filter(hotel => hotel.starRating === rating).length
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading hotels data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-scale">
      {/* Header with Update Suppliers Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-7 w-7 text-orange-500" />
            Hotels Mapping
          </h1>
        </div>
        <button
          onClick={handleUpdateSuppliers}
          disabled={isUpdatingSuppliers}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg shadow-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdatingSuppliers ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              🔄 Update Suppliers
            </>
          )}
        </button>
      </div>      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Building2 className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mapped</p>
              <p className="text-2xl font-bold text-green-600">{stats.mapped}</p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Review</p>
              <p className="text-2xl font-bold text-blue-600">{stats.review}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="card-modern p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Rating Distribution
        </h2>
        <div className="grid grid-cols-5 md:grid-cols-5 gap-4">
          {ratingDistribution.map((item) => (
            <div key={item.rating} className="text-center">
              <div className="flex justify-center mb-1">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-2xl font-bold text-orange-600">{item.count}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{item.rating} Star</div>
            </div>
          ))}
        </div>
      </div>

      {/* Country and City Selection */}
      <div className="card-modern p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Country and City</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Choose country first, then city to view hotels</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-blue-50/50 to-green-50/50 rounded-2xl border-2 border-blue-200/50 shadow-lg backdrop-blur-sm">
            {/* Country Selection */}
            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300 mb-3">
                <MapPin className="h-4 w-4" />
                Select Country
              </label>
              <select
                value={selectedCountryForView}
                onChange={(e) => {
                  setSelectedCountryForView(e.target.value);
                  setSelectedCityForView(''); // Reset city when country changes
                }}
                className="w-full px-4 py-3 text-base font-medium bg-white border-2 border-blue-300 rounded-xl shadow-lg hover:border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="" className="text-gray-500">🌍 Choose a country...</option>
                {masterCountries.map(country => (
                  <option key={country.id} value={country.name}>{country.name}</option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none" style={{top: '28px'}}>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* City Selection */}
            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-bold text-green-700 dark:text-green-300 mb-3">
                <Building2 className="h-4 w-4" />
                Select City
              </label>
              <select
                value={selectedCityForView}
                onChange={(e) => setSelectedCityForView(e.target.value)}
                disabled={!selectedCountryForView}
                className="w-full px-4 py-3 text-base font-medium bg-white border-2 border-green-300 rounded-xl shadow-lg hover:border-green-500 focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all duration-200 appearance-none cursor-pointer disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <option value="" className="text-gray-500">🏙️ Choose a city...</option>
                {masterCities
                  .filter(city => city.countryName === selectedCountryForView)
                  .map(city => (
                    <option key={city.id} value={city.name}>{city.name}</option>
                  ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none" style={{top: '28px'}}>
                <svg className={`w-5 h-5 transition-colors duration-200 ${!selectedCountryForView ? 'text-gray-400' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={groupedView}
                onChange={(e) => setGroupedView(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Group by Hotel Name</span>
            </label>
          </div>
        </div>
      </div>

      {/* Show message if no country/city selected */}
      {(!selectedCountryForView || !selectedCityForView) && (
        <div className="card-modern p-8 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select Country and City
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please select both a country and city above to view the hotels mapping data.
          </p>
        </div>
      )}

      {/* Content - only show when both country and city are selected */}
      {selectedCountryForView && selectedCityForView && (
        <>
          {/* Match Buttons - Above filters */}
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={handleAutoMatchAll}
              disabled={isMatching}
              className="btn-modern bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMatching ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Processing Auto Match...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  🚀 Auto Match All
                </>
              )}
            </button>

            <button
              onClick={handleOpenManualMatchModal}
              className="btn-modern bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold transform hover:scale-105 transition-transform"
            >
              <Edit className="h-5 w-5" />
              {batchSelectionMode ? '❌ Cancel Batch Selection' : '✋ Manual Match'}
            </button>

            {batchSelectionMode && (
              <button
                onClick={handleBatchConfirm}
                disabled={Object.values(selectedHotelsInGroup).every(set => set.size === 0)}
                className="btn-modern bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-slow transform hover:scale-105"
                title="Click to confirm all selected hotels across all groups"
              >
                <Check className="h-5 w-5" />
                ✅ Confirm All ({Object.values(selectedHotelsInGroup).reduce((sum, set) => sum + set.size, 0)} Hotels)
              </button>
            )}

            <p className="text-sm text-gray-600">
              {batchSelectionMode 
                ? 'Batch Selection Mode: Select hotels across multiple groups, then click Confirm All' 
                : 'Auto Match: Match all groups automatically • Manual Match: Select specific groups to match'
              }
            </p>
          </div>

          {/* Filters */}
          <div className="card-modern p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search hotels, addresses, cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern w-full pl-10 pr-4 py-2"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="input-modern px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="mapped">Mapped</option>
            <option value="review">Review</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="input-modern px-3 py-2"
          >
            <option value="all">All Suppliers</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="input-modern px-3 py-2"
          >
            <option value="all">All Cities</option>
            {uniqueCities.map(city => (
              <option key={city.code} value={city.code}>{city.name}</option>
            ))}
          </select>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="input-modern px-3 py-2"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
            <option value="unrated">Unrated</option>
          </select>
        </div>
      </div>

      {/* Data Table - Grouped by Hotel */}
      <div className="space-y-6">
        {groupedView ? (
          // Grouped View
          Object.entries(groupHotelsByName(filteredData)).map(([hotelName, hotelGroup]) => {
            const suppliers = Array.from(new Set(hotelGroup.map(h => h.supplierName)));
            const mapped = hotelGroup.filter(h => h.status === 'mapped').length;
            const pending = hotelGroup.filter(h => h.status === 'pending').length;
            const review = hotelGroup.filter(h => h.status === 'review').length;
            const rejected = hotelGroup.filter(h => h.status === 'rejected').length;
            const avgRating = hotelGroup.find(h => h.starRating)?.starRating || 0;
            
            return (
              <div key={hotelName} className="card-modern overflow-hidden">
                {/* Hotel Group Header with Gradient */}
                <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-6 w-6 text-white" />
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          {hotelName}
                          {avgRating > 0 && (
                            <div className="flex items-center gap-1">
                              {[...Array(avgRating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-white text-white" />
                              ))}
                            </div>
                          )}
                        </h3>
                        <p className="text-white/90 text-sm">
                          {hotelGroup.length} records from {suppliers.length} suppliers • {hotelGroup[0].cityName}, {hotelGroup[0].countryName}
                        </p>
                        {hotelGroup.find(h => h.masterId) && (
                          <p className="text-white/80 text-xs mt-1 font-mono bg-white/10 px-2 py-1 rounded inline-block">
                            🔑 Master ID: {hotelGroup.find(h => h.masterId)?.masterId}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Badges, Manual Match, and Unmatch Buttons */}
                    <div className="flex items-center gap-3">
                      {/* Manual Match Button - for inline selection (hidden during batch mode and unmatch mode) */}
                      {!batchSelectionMode && !groupSelectionMode[hotelName] && unmatchSelectionMode !== hotelName && !hotelGroup.every(h => h.status === 'mapped') && (
                        <button
                          onClick={() => handleToggleGroupSelectionMode(hotelName, hotelGroup)}
                          className="px-4 py-2 bg-white hover:bg-gray-50 text-pink-600 rounded-lg shadow-md font-semibold flex items-center gap-2 transition-all border-2 border-white"
                          title="Select specific hotels to match"
                        >
                          <Edit className="h-4 w-4" />
                          ✋ Manual Match
                        </button>
                      )}

                      {/* Unmatch Button - show if ANY hotel in group has masterId */}
                      {!batchSelectionMode && !groupSelectionMode[hotelName] && unmatchSelectionMode !== hotelName && hotelGroup.some(h => h.masterId) && (
                        <button
                          onClick={() => handleUnmatchGroup(hotelGroup, hotelName)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md font-semibold flex items-center gap-2 transition-all transform hover:scale-105"
                          title="Remove mapping from Master ID (Master ID will be preserved)"
                        >
                          <RefreshCw className="h-4 w-4" />
                          🔓 Unmatch
                        </button>
                      )}

                      {/* Unmatch Selection Mode Actions */}
                      {unmatchSelectionMode === hotelName && (
                        <>
                          <button
                            onClick={confirmUnmatchSelection}
                            disabled={selectedHotelsForUnmatch.size === 0}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg shadow-md font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <RefreshCw className="h-4 w-4" />
                            🔓 Confirm Unmatch ({selectedHotelsForUnmatch.size})
                          </button>
                          <button
                            onClick={cancelUnmatchSelection}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md font-semibold flex items-center gap-2 transition-all"
                          >
                            ❌ Cancel
                          </button>
                        </>
                      )}

                      {/* Selection Mode Actions - Only show for individual group selection, not batch mode */}
                      {!batchSelectionMode && groupSelectionMode[hotelName] && (
                        <>
                          <button
                            onClick={() => handleConfirmGroupMatch(hotelName, hotelGroup)}
                            disabled={(selectedHotelsInGroup[hotelName]?.size || 0) === 0}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check className="h-4 w-4" />
                            ✅ Confirm ({selectedHotelsInGroup[hotelName]?.size || 0})
                          </button>
                          <button
                            onClick={() => handleCancelGroupSelection(hotelName)}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md font-semibold flex items-center gap-2 transition-all"
                          >
                            ❌ Cancel
                          </button>
                        </>
                      )}

                      {/* Status Badges */}
                      {!groupSelectionMode[hotelName] && (
                        <>
                          {mapped > 0 && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                              {mapped} Mapped
                            </span>
                          )}
                          {pending > 0 && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                              {pending} Pending
                            </span>
                          )}
                          {review > 0 && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                              {review} Review
                            </span>
                          )}
                          {rejected > 0 && (
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                              {rejected} Rejected
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Hotel Details Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {/* Checkbox column - show in manual match selection mode OR unmatch selection mode */}
                        {(groupSelectionMode[hotelName] || unmatchSelectionMode === hotelName) && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                            {unmatchSelectionMode === hotelName ? 'Unmatch' : 'Select'}
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name Variant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Coordinates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Confidence
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {hotelGroup.map((item) => {
                        const isSelected = selectedHotelsInGroup[hotelName]?.has(item.id) || false;
                        return (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            groupSelectionMode[hotelName] && isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          {/* Checkbox - show in manual match selection mode OR unmatch selection mode (only for hotels with masterId) */}
                          {(groupSelectionMode[hotelName] || (unmatchSelectionMode === hotelName && item.masterId)) && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={
                                  groupSelectionMode[hotelName]
                                    ? isSelected
                                    : selectedHotelsForUnmatch.has(item.id)
                                }
                                onChange={() => {
                                  if (groupSelectionMode[hotelName]) {
                                    handleToggleHotelInGroup(hotelName, item.id);
                                  } else {
                                    toggleHotelForUnmatch(item.id);
                                  }
                                }}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                disabled={unmatchSelectionMode === hotelName && !item.masterId}
                              />
                            </td>
                          )}
                          {/* Empty cell for hotels without masterId in unmatch mode */}
                          {unmatchSelectionMode === hotelName && !item.masterId && (
                            <td className="px-6 py-4 whitespace-nowrap"></td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.supplierName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">ID: {item.supplierHotelId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">{item.hotelName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.hotelCode || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">{item.address}</div>
                            {item.phone && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">{item.phone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.coordinates ? (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                <div>Lat: {item.coordinates.latitude.toFixed(4)}</div>
                                <div>Lng: {item.coordinates.longitude.toFixed(4)}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.starRating ? (
                              <div className="flex items-center gap-1">
                                <div className="flex">
                                  {[...Array(item.starRating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{item.starRating}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">Unrated</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              item.status === 'mapped' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              item.status === 'pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              item.status === 'review' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.confidence ? (
                              <div>
                                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                  {item.confidence}%
                                </div>
                                {item.matchingFactors && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    N:{item.matchingFactors.nameMatch}% A:{item.matchingFactors.addressMatch}% L:{item.matchingFactors.locationMatch}%
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedHotel(item);
                                  setShowMappingModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Edit Mapping"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        ) : (
          // List View (Original Table)
          <div className="card-modern overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Hotel Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      City/Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.supplierName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 ml-2">ID: {item.supplierHotelId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">{item.hotelName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.hotelCode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{item.address}</div>
                        {item.coordinates && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.coordinates.latitude.toFixed(4)}, {item.coordinates.longitude.toFixed(4)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{item.cityName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.countryName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.starRating ? (
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(item.starRating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">{item.starRating}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Unrated</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          item.status === 'mapped' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          item.status === 'pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          item.status === 'review' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.confidence ? (
                          <div className="text-sm text-gray-900 dark:text-white font-medium">
                            {item.confidence}%
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                        {item.matchingFactors && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            N:{item.matchingFactors.nameMatch}% A:{item.matchingFactors.addressMatch}% L:{item.matchingFactors.locationMatch}%
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedHotel(item);
                              setShowMappingModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {filteredData.length === 0 && (
          <div className="card-modern p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No hotels found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or fetch data from suppliers</p>
          </div>
        )}
      </div>

      {/* Master Hotels */}
      <div className="card-modern p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Master Hotels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masterHotels.map((master) => (
            <div key={master.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white pr-2">{master.name}</h3>
                <div className="flex items-center">
                  {[...Array(master.starRating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <div className="space-y-1 mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {master.address}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {master.cityName}, {master.countryName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {master.coordinates.latitude.toFixed(4)}, {master.coordinates.longitude.toFixed(4)}
                </p>
                {master.brandName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Brand: {master.brandName}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Mapped: {master.mappedCount}</span>
                <span className="text-gray-500 dark:text-gray-400">Suppliers: {master.suppliers.length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}

      {/* Match Results Modal */}
      {showMatchResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Check className="h-6 w-6" />
                Auto Match Results
              </h2>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Success Summary */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 rounded-full p-2">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      Successfully Matched {matchResults.success} Groups
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      All hotels have been assigned Master IDs
                    </p>
                  </div>
                </div>
              </div>

              {/* Warnings Section */}
              {matchResults.warnings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Warnings ({matchResults.warnings.length})
                  </h3>
                  <div className="space-y-4">
                    {matchResults.warnings.map((warning, idx) => (
                      <div key={idx} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">
                          {warning.groupName}
                        </h4>
                        <ul className="space-y-1">
                          {warning.issues.map((issue, issueIdx) => (
                            <li key={issueIdx} className="text-sm text-orange-700 dark:text-orange-300 flex items-start gap-2">
                              <span className="mt-0.5">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 text-xs text-orange-600 dark:text-orange-400">
                          {warning.hotels.length} hotels matched with Master ID: {warning.hotels[0].masterId}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Warnings */}
              {matchResults.warnings.length === 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    No warnings detected - all matches appear to be clean!
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-3">
              <button
                onClick={handleUndoAutoMatch}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                ❌ Undo
              </button>
              {matchResults.warnings.length > 0 && (
                <button
                  onClick={() => {
                    alert('📝 Review mode - Navigate to each warning to review and edit');
                    setShowMatchResults(false);
                  }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  ⏸️ Review Warnings
                </button>
              )}
              <button
                onClick={handleConfirmMatchResults}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                ✅ Confirm All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Match Modal */}
      {showManualMatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Edit className="h-6 w-6" />
                Manual Match - Select Groups
              </h2>
              <p className="text-white/90 text-sm mt-1">
                Select hotel groups you want to match manually. Groups with warnings are marked.
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-3">
                {Object.entries(groupHotelsByName(hotelData.filter(h => h.cityName === selectedCityForView))).map(([groupName, hotelGroup]) => {
                  const warnings = detectWarnings(hotelGroup);
                  const allMapped = hotelGroup.every(h => h.status === 'mapped');
                  const hasMasterId = hotelGroup.some(h => h.masterId);
                  const isSelected = selectedGroups.has(groupName);
                  const suppliers = Array.from(new Set(hotelGroup.map(h => h.supplierName)));

                  return (
                    <div
                      key={groupName}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : allMapped
                          ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                          : warnings.length > 0
                          ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleGroup(groupName)}
                          disabled={allMapped}
                          className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />

                        {/* Group Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {groupName}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {hotelGroup.length} records from {suppliers.join(', ')}
                              </p>
                              {hasMasterId && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                                  🔑 {hotelGroup.find(h => h.masterId)?.masterId}
                                </p>
                              )}
                            </div>

                            {/* Status Badge */}
                            {allMapped ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                ✓ Mapped
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                                Pending
                              </span>
                            )}
                          </div>

                          {/* Warnings */}
                          {warnings.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {warnings.map((warning, idx) => (
                                <p key={idx} className="text-xs text-orange-700 dark:text-orange-400 flex items-start gap-1">
                                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span>{warning}</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selection Summary */}
              {selectedGroups.size > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold">
                    {selectedGroups.size} group(s) selected
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowManualMatchModal(false);
                  setSelectedGroups(new Set());
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMatchSelectedGroups}
                disabled={selectedGroups.size === 0}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-4 w-4" />
                Match {selectedGroups.size > 0 ? `${selectedGroups.size} ` : ''}Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unmatch Confirmation Modal */}
      {showUnmatchConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <AlertCircle className="h-6 w-6" />
                ⚠️ Warning: Unmatch Hotels
              </h2>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Warning Message */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                <p className="text-gray-800 dark:text-gray-200 font-medium mb-3">
                  You are about to unmatch <span className="text-red-600 dark:text-red-400 font-bold">{selectedHotelsForUnmatch.size}</span> hotel(s).
                </p>
                
                {/* Consequences List */}
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">This will:</p>
                  <div className="space-y-1.5 ml-2">
                    <p className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>Change hotels status from Mapped to Pending</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>Allow hotels to be re-matched or modified</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 font-bold">✓</span>
                      <span className="text-green-700 dark:text-green-400 font-semibold">Master ID will NEVER be removed or changed</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation Question */}
              <p className="text-center text-gray-800 dark:text-gray-200 font-semibold">
                Do you want to continue?
              </p>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowUnmatchConfirmModal(false)}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                ❌ Cancel
              </button>
              <button
                onClick={processUnmatch}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
              >
                <RefreshCw className="h-4 w-4" />
                🔓 Confirm Unmatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Confirmation Modal */}
      {showMatchConfirmModal && pendingMatchData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Check className="h-6 w-6" />
                Confirm Hotel Match
              </h2>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Match Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                  You are about to match <span className="text-blue-600 dark:text-blue-400 font-bold">{pendingMatchData.hotels.length}</span> hotel(s) for:
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {pendingMatchData.groupName}
                </p>
              </div>

              {/* Hotels List */}
              <div className="mb-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Selected Hotels:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pendingMatchData.hotels.map((hotel) => (
                    <div key={hotel.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm">
                      <p className="font-semibold text-gray-900 dark:text-white">{hotel.hotelName}</p>
                      <p className="text-gray-600 dark:text-gray-400">Supplier: {hotel.supplierName}</p>
                      <p className="text-gray-600 dark:text-gray-400">{hotel.address}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              {pendingMatchData.warnings.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-orange-900 dark:text-orange-200 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Warnings Detected:
                  </p>
                  <ul className="space-y-1 ml-2">
                    {pendingMatchData.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-orange-700 dark:text-orange-300 flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Confirmation Question */}
              <p className="text-center text-gray-800 dark:text-gray-200 font-semibold">
                {pendingMatchData.warnings.length > 0 
                  ? '⚠️ Do you want to proceed despite the warnings?'
                  : 'Proceed with matching these hotels?'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowMatchConfirmModal(false);
                  setPendingMatchData(null);
                }}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                ❌ Cancel
              </button>
              <button
                onClick={() => {
                  // Check if this is from full group match or selection match
                  if (groupSelectionMode[pendingMatchData.groupName]) {
                    processMatch();
                  } else {
                    processManualMatch();
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
              >
                <Check className="h-4 w-4" />
                ✅ Confirm Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelsTab;