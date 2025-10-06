'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Search, Plus, Eye, Edit, Trash2, Download, RefreshCw, Check, AlertCircle, Globe, Navigation, Sparkles, Users, CheckCircle2, Info, ChevronDown, ChevronUp, ArrowRightLeft } from 'lucide-react';

interface CityData {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierCityId: string;
  cityName: string;
  cityCode?: string;
  countryName: string;
  countryCode: string;
  stateProvince?: string;
  timezone?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  masterId?: string;
  status: 'pending' | 'mapped' | 'review';
  confidence?: number;
  createdAt: string;
  updatedAt: string;
}

interface MasterCity {
  id: string;
  name: string;
  code: string;
  countryName: string;
  countryCode: string;
  stateProvince?: string;
  timezone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  iataCode?: string;
  population?: number;
  mappedCount: number;
  suppliers: string[];
  createdAt: string;
  updatedAt: string;
}

const CitiesTab = () => {
  const [cityData, setCityData] = useState<CityData[]>([]);
  const [masterCities, setMasterCities] = useState<MasterCity[]>([]);
  const [masterCountries, setMasterCountries] = useState<any[]>([]);
  const [selectedCountryForView, setSelectedCountryForView] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'mapped' | 'review'>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [showCreateMaster, setShowCreateMaster] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [groupedView, setGroupedView] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [autoMatchEnabled, setAutoMatchEnabled] = useState(true);
  const [isUpdatingSuppliers, setIsUpdatingSuppliers] = useState(false);
  
  // Match & Unmatch States
  const [autoMatchResults, setAutoMatchResults] = useState<{
    success: number;
    warnings: Array<{
      groupName: string;
      cities: CityData[];
      issues: string[];
    }>;
  }>({ success: 0, warnings: [] });
  const [isMatching, setIsMatching] = useState(false);
  const [showManualMatchModal, setShowManualMatchModal] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [groupSelectionMode, setGroupSelectionMode] = useState<{ [groupName: string]: boolean }>({});
  const [selectedCitiesInGroup, setSelectedCitiesInGroup] = useState<{ [groupName: string]: Set<string> }>({});
  const [batchSelectionMode, setBatchSelectionMode] = useState(false);
  const [unmatchSelectionMode, setUnmatchSelectionMode] = useState<string | null>(null);
  const [selectedCitiesForUnmatch, setSelectedCitiesForUnmatch] = useState<Set<string>>(new Set());
  const [showUnmatchConfirmModal, setShowUnmatchConfirmModal] = useState(false);
  const [showMatchConfirmModal, setShowMatchConfirmModal] = useState(false);
  const [pendingMatchData, setPendingMatchData] = useState<{
    groupName: string;
    cities: CityData[];
    warnings: string[];
  } | null>(null);

  // Mock suppliers data
  const suppliers = [
    { id: 'ebooking', name: 'eBooking' },
    { id: 'iwtx', name: 'IWTX' },
    { id: 'amadeus', name: 'Amadeus' },
    { id: 'sabre', name: 'Sabre' },
    { id: 'expedia', name: 'Expedia' }
  ];

  // Mock city data
  const mockCityData: CityData[] = [
    {
      id: '1',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierCityId: 'CAI001',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      stateProvince: 'Cairo Governorate',
      timezone: 'Africa/Cairo',
      coordinates: { latitude: 30.0444, longitude: 31.2357 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierCityId: 'CAIRO_01',
      cityName: 'Cairo City',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      stateProvince: 'Cairo',
      timezone: 'Africa/Cairo',
      coordinates: { latitude: 30.0626, longitude: 31.2497 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierCityId: 'CAIRO_EG',
      cityName: 'Cairo',
      cityCode: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      stateProvince: 'Cairo Governorate',
      timezone: 'Africa/Cairo',
      coordinates: { latitude: 30.0444, longitude: 31.2357 },
      masterId: 'master_001',
      status: 'mapped',
      confidence: 97,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '4',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierCityId: 'DXB_UAE',
      cityName: 'Dubai',
      cityCode: 'DXB',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      stateProvince: 'Dubai',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 25.2048, longitude: 55.2708 },
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '5',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierCityId: 'ALX001',
      cityName: 'Alexandria',
      cityCode: 'ALY',
      countryName: 'Egypt',
      countryCode: 'EG',
      stateProvince: 'Alexandria Governorate',
      timezone: 'Africa/Cairo',
      coordinates: { latitude: 31.2001, longitude: 29.9187 },
      masterId: 'JETIXIA_CITY_ALX_001',
      status: 'mapped',
      confidence: 95,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '5b',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierCityId: 'ALX_SBR',
      cityName: 'Alexandria',
      cityCode: 'ALY',
      countryName: 'Egypt',
      countryCode: 'EG',
      stateProvince: 'Alexandria Governorate',
      timezone: 'Africa/Cairo',
      coordinates: { latitude: 31.2001, longitude: 29.9187 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '5c',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierCityId: 'ALX_AMD',
      cityName: 'Alexandria',
      cityCode: 'ALY',
      countryName: 'Egypt',
      countryCode: 'EG',
      stateProvince: 'Alexandria Governorate',
      timezone: 'Africa/Cairo',
      coordinates: { latitude: 31.2001, longitude: 29.9187 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // UAE Cities from all suppliers
    // Dubai
    {
      id: '6',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierCityId: 'DXB001',
      cityName: 'Dubai',
      cityCode: 'DXB',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      stateProvince: 'Dubai',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 25.2048, longitude: 55.2708 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '7',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierCityId: 'DUBAI_001',
      cityName: 'Dubai City',
      cityCode: 'DXB',
      countryName: 'UAE',
      countryCode: 'AE',
      stateProvince: 'Dubai',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 25.2084, longitude: 55.2719 },
      masterId: 'master_005',
      status: 'mapped',
      confidence: 96,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '8',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierCityId: 'DXB_AMADEUS',
      cityName: 'Dubai',
      cityCode: 'DXB',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      stateProvince: 'Dubai Emirate',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 25.2048, longitude: 55.2708 },
      masterId: 'master_005',
      status: 'mapped',
      confidence: 98,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '9',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierCityId: 'SAB_DXB',
      cityName: 'Dubai',
      cityCode: 'DXB',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      stateProvince: 'Dubai',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 25.2048, longitude: 55.2708 },
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '10',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierCityId: 'BOOK_DXB',
      cityName: 'Dubai',
      cityCode: 'DXB',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      stateProvince: 'Dubai',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 25.2048, longitude: 55.2708 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // Abu Dhabi
    {
      id: '11',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierCityId: 'AUH001',
      cityName: 'Abu Dhabi',
      cityCode: 'AUH',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      stateProvince: 'Abu Dhabi',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 24.4539, longitude: 54.3773 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '12',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierCityId: 'ABU_DHABI_001',
      cityName: 'Abu Dhabi City',
      cityCode: 'AUH',
      countryName: 'UAE',
      countryCode: 'AE',
      stateProvince: 'Abu Dhabi',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 24.4648, longitude: 54.3618 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '13',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierCityId: 'AUH_AMADEUS',
      cityName: 'Abu Dhabi',
      cityCode: 'AUH',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      stateProvince: 'Abu Dhabi Emirate',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 24.4539, longitude: 54.3773 },
      masterId: 'master_006',
      status: 'mapped',
      confidence: 94,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '14',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierCityId: 'SAB_AUH',
      cityName: 'Abu Dhabi',
      cityCode: 'AUH',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      stateProvince: 'Abu Dhabi',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 24.4539, longitude: 54.3773 },
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '15',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierCityId: 'BOOK_AUH',
      cityName: 'Abu Dhabi',
      cityCode: 'AUH',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      stateProvince: 'Abu Dhabi',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 24.4539, longitude: 54.3773 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // USA Cities from all suppliers
    // New York
    {
      id: '16',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierCityId: 'NYC001',
      cityName: 'New York',
      cityCode: 'NYC',
      countryName: 'United States',
      countryCode: 'US',
      stateProvince: 'New York',
      timezone: 'America/New_York',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '17',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierCityId: 'NEW_YORK_001',
      cityName: 'New York City',
      cityCode: 'NYC',
      countryName: 'USA',
      countryCode: 'US',
      stateProvince: 'NY',
      timezone: 'America/New_York',
      coordinates: { latitude: 40.7589, longitude: -73.9851 },
      masterId: 'master_007',
      status: 'mapped',
      confidence: 97,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '18',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierCityId: 'NYC_AMADEUS',
      cityName: 'New York',
      cityCode: 'NYC',
      countryName: 'United States',
      countryCode: 'US',
      stateProvince: 'New York State',
      timezone: 'America/New_York',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      masterId: 'master_007',
      status: 'mapped',
      confidence: 99,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '19',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierCityId: 'SAB_NYC',
      cityName: 'NYC',
      cityCode: 'NYC',
      countryName: 'United States',
      countryCode: 'US',
      stateProvince: 'New York',
      timezone: 'America/New_York',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '20',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierCityId: 'BOOK_NYC',
      cityName: 'New York',
      cityCode: 'NYC',
      countryName: 'United States',
      countryCode: 'US',
      stateProvince: 'New York',
      timezone: 'America/New_York',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // Los Angeles
    {
      id: '21',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierCityId: 'LAX001',
      cityName: 'Los Angeles',
      cityCode: 'LAX',
      countryName: 'United States',
      countryCode: 'US',
      stateProvince: 'California',
      timezone: 'America/Los_Angeles',
      coordinates: { latitude: 34.0522, longitude: -118.2437 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '22',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierCityId: 'LOS_ANGELES_001',
      cityName: 'LA',
      cityCode: 'LAX',
      countryName: 'USA',
      countryCode: 'US',
      stateProvince: 'CA',
      timezone: 'America/Los_Angeles',
      coordinates: { latitude: 34.0689, longitude: -118.4452 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '23',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierCityId: 'LAX_AMADEUS',
      cityName: 'Los Angeles',
      cityCode: 'LAX',
      countryName: 'United States',
      countryCode: 'US',
      stateProvince: 'California',
      timezone: 'America/Los_Angeles',
      coordinates: { latitude: 34.0522, longitude: -118.2437 },
      masterId: 'master_008',
      status: 'mapped',
      confidence: 95,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '24',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierCityId: 'SAB_LAX',
      cityName: 'Los Angeles',
      cityCode: 'LAX',
      countryName: 'United States',
      countryCode: 'US',
      stateProvince: 'California',
      timezone: 'America/Los_Angeles',
      coordinates: { latitude: 34.0522, longitude: -118.2437 },
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '25',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierCityId: 'BOOK_LAX',
      cityName: 'Los Angeles',
      cityCode: 'LAX',
      countryName: 'United States',
      countryCode: 'US',
      stateProvince: 'California',
      timezone: 'America/Los_Angeles',
      coordinates: { latitude: 34.0522, longitude: -118.2437 },
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  // Mock master cities
  const mockMasterCities: MasterCity[] = [
    {
      id: 'master_001',
      name: 'Cairo',
      code: 'CAI',
      countryName: 'Egypt',
      countryCode: 'EG',
      stateProvince: 'Cairo Governorate',
      timezone: 'Africa/Cairo',
      coordinates: { latitude: 30.0444, longitude: 31.2357 },
      iataCode: 'CAI',
      population: 9500000,
      mappedCount: 1,
      suppliers: ['amadeus'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_002',
      name: 'Dubai',
      code: 'DXB',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      stateProvince: 'Dubai',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 25.2048, longitude: 55.2708 },
      iataCode: 'DXB',
      population: 3400000,
      mappedCount: 0,
      suppliers: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_003',
      name: 'Alexandria',
      code: 'ALY',
      countryName: 'Egypt',
      countryCode: 'EG',
      stateProvince: 'Alexandria Governorate',
      timezone: 'Africa/Cairo',
      coordinates: { latitude: 31.2001, longitude: 29.9187 },
      iataCode: 'ALY',
      population: 5200000,
      mappedCount: 0,
      suppliers: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'JETIXIA_CITY_ALX_001',
      name: 'Alexandria',
      code: 'ALX',
      countryName: 'Egypt',
      countryCode: 'EG',
      stateProvince: 'Alexandria Governorate',
      timezone: 'Africa/Cairo',
      coordinates: { latitude: 31.2001, longitude: 29.9187 },
      iataCode: 'ALY',
      population: 5200000,
      mappedCount: 1,
      suppliers: ['ebooking'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_004',
      name: 'Hurghada',
      code: 'HRG',
      countryName: 'Egypt',
      countryCode: 'EG',
      stateProvince: 'Red Sea Governorate',
      timezone: 'Africa/Cairo',
      coordinates: { latitude: 27.2579, longitude: 33.8116 },
      iataCode: 'HRG',
      population: 250000,
      mappedCount: 0,
      suppliers: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_005',
      name: 'Sharm El Sheikh',
      code: 'SSH',
      countryName: 'Egypt',
      countryCode: 'EG',
      stateProvince: 'South Sinai Governorate',
      timezone: 'Africa/Cairo',
      coordinates: { latitude: 27.9158, longitude: 34.3300 },
      iataCode: 'SSH',
      population: 73000,
      mappedCount: 0,
      suppliers: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_006',
      name: 'Abu Dhabi',
      code: 'AUH',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      stateProvince: 'Abu Dhabi',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 24.4539, longitude: 54.3773 },
      iataCode: 'AUH',
      population: 1450000,
      mappedCount: 1,
      suppliers: ['amadeus'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_007',
      name: 'New York',
      code: 'NYC',
      countryName: 'United States',
      countryCode: 'US',
      stateProvince: 'New York',
      timezone: 'America/New_York',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      iataCode: 'NYC',
      population: 8336000,
      mappedCount: 3,
      suppliers: ['iwtx', 'amadeus'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_008',
      name: 'Los Angeles',
      code: 'LAX',
      countryName: 'United States',
      countryCode: 'US',
      stateProvince: 'California',
      timezone: 'America/Los_Angeles',
      coordinates: { latitude: 34.0522, longitude: -118.2437 },
      iataCode: 'LAX',
      population: 3980000,
      mappedCount: 1,
      suppliers: ['amadeus'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  // Mock master countries (should come from completed country mapping)
  const mockMasterCountries = [
    { id: 'master_001', name: 'Egypt', code: 'EG', iso2Code: 'EG', iso3Code: 'EGY', currency: 'EGP', continent: 'Africa', region: 'Northern Africa', status: 'mapped' },
    { id: 'master_002', name: 'United Arab Emirates', code: 'AE', iso2Code: 'AE', iso3Code: 'ARE', currency: 'AED', continent: 'Asia', region: 'Western Asia', status: 'mapped' },
    { id: 'master_003', name: 'United States', code: 'US', iso2Code: 'US', iso3Code: 'USA', currency: 'USD', continent: 'North America', region: 'Northern America', status: 'mapped' },
    { id: 'master_004', name: 'United Kingdom', code: 'GB', iso2Code: 'GB', iso3Code: 'GBR', currency: 'GBP', continent: 'Europe', region: 'Northern Europe', status: 'mapped' },
    { id: 'master_005', name: 'Germany', code: 'DE', iso2Code: 'DE', iso3Code: 'DEU', currency: 'EUR', continent: 'Europe', region: 'Western Europe', status: 'mapped' },
    { id: 'master_006', name: 'France', code: 'FR', iso2Code: 'FR', iso3Code: 'FRA', currency: 'EUR', continent: 'Europe', region: 'Western Europe', status: 'mapped' },
    { id: 'master_007', name: 'Japan', code: 'JP', iso2Code: 'JP', iso3Code: 'JPN', currency: 'JPY', continent: 'Asia', region: 'Eastern Asia', status: 'mapped' },
    { id: 'master_008', name: 'China', code: 'CN', iso2Code: 'CN', iso3Code: 'CHN', currency: 'CNY', continent: 'Asia', region: 'Eastern Asia', status: 'mapped' },
    { id: 'master_009', name: 'Australia', code: 'AU', iso2Code: 'AU', iso3Code: 'AUS', currency: 'AUD', continent: 'Oceania', region: 'Australia and New Zealand', status: 'mapped' },
    { id: 'master_010', name: 'Canada', code: 'CA', iso2Code: 'CA', iso3Code: 'CAN', currency: 'CAD', continent: 'North America', region: 'Northern America', status: 'mapped' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCityData(mockCityData);
      setMasterCities(mockMasterCities);
      setMasterCountries(mockMasterCountries);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-expand all groups when country changes
  useEffect(() => {
    if (selectedCountry && cityData.length > 0) {
      const countryCities = cityData.filter(city => city.countryCode === selectedCountry);
      const grouped = groupCitiesByName(countryCities);
      const allGroupNames = Object.keys(grouped);
      setExpandedGroups(new Set(allGroupNames));
    } else {
      setExpandedGroups(new Set());
    }
  }, [selectedCountry, cityData]);

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

  // Generate Master ID for cities
  const generateMasterId = () => {
    const existingIds = cityData
      .map(c => c.masterId)
      .filter((id): id is string => id !== undefined && id.startsWith('JETIXIA_CITY_'));
    
    if (existingIds.length === 0) {
      return 'JETIXIA_CITY_00001';
    }
    
    const maxNumber = Math.max(
      ...existingIds.map(id => {
        const match = id.match(/JETIXIA_CITY_(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
    );
    
    return `JETIXIA_CITY_${String(maxNumber + 1).padStart(5, '0')}`;
  };

  // Group cities by normalized name within selected country with Master ID priority
  const groupCitiesByName = (cities: CityData[]) => {
    if (!selectedCountry) return {};
    
    const countryCities = cities.filter(city => city.countryCode === selectedCountry);
    const groups: { [key: string]: CityData[] } = {};
    
    // First pass: Group by masterId but use cityName as key
    countryCities.forEach(city => {
      if (city.masterId && city.masterId.startsWith('JETIXIA_CITY_')) {
        const groupKey = city.cityName; // Use cityName instead of masterId
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(city);
      }
    });
    
    // Second pass: Group remaining cities by similarity
    const ungroupedCities = countryCities.filter(
      city => !city.masterId || !city.masterId.startsWith('JETIXIA_CITY_')
    );
    
    ungroupedCities.forEach(city => {
      const normalizedName = city.cityName.toLowerCase().replace(/[^a-z]/g, '');
      const normalizedCode = (city.cityCode || '').toLowerCase();
      
      let foundGroup = false;
      
      // Try to find a similar existing group
      for (const [groupKey, groupCities] of Object.entries(groups)) {
        if (!groupKey.startsWith('JETIXIA_CITY_')) {
          const firstCity = groupCities[0];
          const existingNormalizedName = firstCity.cityName.toLowerCase().replace(/[^a-z]/g, '');
          const existingNormalizedCode = (firstCity.cityCode || '').toLowerCase();
          
          // Calculate similarity (70% name, 30% code)
          const nameSimilarity = normalizedName === existingNormalizedName || 
                                normalizedName.includes(existingNormalizedName) || 
                                existingNormalizedName.includes(normalizedName) ? 0.7 : 0;
          const codeSimilarity = normalizedCode && existingNormalizedCode && 
                               normalizedCode === existingNormalizedCode ? 0.3 : 0;
          
          const totalSimilarity = nameSimilarity + codeSimilarity;
          
          if (totalSimilarity >= 0.7) {
            groups[groupKey].push(city);
            foundGroup = true;
            break;
          }
        }
      }
      
      if (!foundGroup) {
        const groupKey = city.cityName;
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(city);
      }
    });
    
    // Sort groups alphabetically
    const sortedGroups: { [key: string]: CityData[] } = {};
    Object.keys(groups).sort().forEach(key => {
      sortedGroups[key] = groups[key];
    });
    
    return sortedGroups;
  };

  // ============ MANUAL MATCH FUNCTIONS ============
  const handleToggleGroupSelectionMode = (groupName: string) => {
    setGroupSelectionMode(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
    
    if (groupSelectionMode[groupName]) {
      setSelectedCitiesInGroup(prev => ({
        ...prev,
        [groupName]: new Set()
      }));
    }
  };

  const handleCityCheckboxChange = (groupName: string, cityId: string) => {
    setSelectedCitiesInGroup(prev => {
      const currentSelection = prev[groupName] || new Set();
      const newSelection = new Set(currentSelection);
      
      if (newSelection.has(cityId)) {
        newSelection.delete(cityId);
      } else {
        newSelection.add(cityId);
      }
      
      return {
        ...prev,
        [groupName]: newSelection
      };
    });
  };

  const handleConfirmGroupMatch = (groupName: string) => {
    const selectedIds = selectedCitiesInGroup[groupName];
    if (!selectedIds || selectedIds.size < 2) {
      alert('Please select at least 2 cities to match');
      return;
    }

    const grouped = groupCitiesByName(cityData);
    const cities = grouped[groupName] || [];
    const selectedCities = cities.filter(c => selectedIds.has(c.id));

    const warnings = detectWarnings(selectedCities);

    setPendingMatchData({
      groupName,
      cities: selectedCities,
      warnings
    });
    setShowMatchConfirmModal(true);
  };

  const handleCancelGroupSelection = (groupName: string) => {
    setGroupSelectionMode(prev => ({
      ...prev,
      [groupName]: false
    }));
    setSelectedCitiesInGroup(prev => ({
      ...prev,
      [groupName]: new Set()
    }));
  };

  // ============ BATCH SELECTION FUNCTIONS ============
  const handleToggleBatchMode = () => {
    setBatchSelectionMode(prev => !prev);
    if (batchSelectionMode) {
      setSelectedCitiesInGroup({});
    }
  };

  const handleBatchCheckboxChange = (groupName: string, cityId: string) => {
    setSelectedCitiesInGroup(prev => {
      const currentSelection = prev[groupName] || new Set();
      const newSelection = new Set(currentSelection);
      
      if (newSelection.has(cityId)) {
        newSelection.delete(cityId);
      } else {
        newSelection.add(cityId);
      }
      
      return {
        ...prev,
        [groupName]: newSelection
      };
    });
  };

  const handleConfirmBatchMatch = () => {
    const allSelectedCities: CityData[] = [];
    const grouped = groupCitiesByName(cityData);

    Object.entries(selectedCitiesInGroup).forEach(([groupName, selectedIds]) => {
      if (selectedIds.size >= 2) {
        const cities = grouped[groupName] || [];
        const selected = cities.filter(c => selectedIds.has(c.id));
        allSelectedCities.push(...selected);
      }
    });

    if (allSelectedCities.length < 2) {
      alert('Please select at least 2 cities across all groups to match');
      return;
    }

    const warnings = detectWarnings(allSelectedCities);

    setPendingMatchData({
      groupName: 'Batch Match',
      cities: allSelectedCities,
      warnings
    });
    setShowMatchConfirmModal(true);
  };

  // ============ AUTO MATCH FUNCTION ============
  const handleAutoMatchAll = async () => {
    if (!selectedCountry) {
      alert('Please select a country first');
      return;
    }
    
    setIsMatching(true);
    const results = { success: 0, warnings: [] as any[] };

    try {
      const grouped = groupCitiesByName(cityData);
      
      for (const [groupName, cities] of Object.entries(grouped)) {
        if (cities.length >= 2) {
          const pendingCities = cities.filter(c => c.status === 'pending');
          
          if (pendingCities.length >= 2) {
            const warnings = detectWarnings(pendingCities);
            
            if (warnings.length === 0) {
              results.success++;
            } else {
              results.warnings.push({
                groupName,
                cities: pendingCities,
                issues: warnings
              });
            }
          }
        }
      }

      setAutoMatchResults(results);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } finally {
      setIsMatching(false);
    }
  };

  // ============ UNMATCH FUNCTIONS ============
  const handleUnmatchGroup = (groupName: string) => {
    setUnmatchSelectionMode(groupName);
    setSelectedCitiesForUnmatch(new Set());
  };

  const handleUnmatchCheckboxChange = (cityId: string) => {
    setSelectedCitiesForUnmatch(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(cityId)) {
        newSelection.delete(cityId);
      } else {
        newSelection.add(cityId);
      }
      return newSelection;
    });
  };

  const handleConfirmUnmatch = () => {
    if (selectedCitiesForUnmatch.size === 0) {
      alert('Please select at least one city to unmatch');
      return;
    }
    setShowUnmatchConfirmModal(true);
  };

  const handleCancelUnmatch = () => {
    setUnmatchSelectionMode(null);
    setSelectedCitiesForUnmatch(new Set());
  };

  const processUnmatch = () => {
    setCityData(prevData => 
      prevData.map(city => {
        if (selectedCitiesForUnmatch.has(city.id)) {
          return {
            ...city,
            status: 'pending' as const
            // IMPORTANT: masterId is NOT deleted, only status changes
          };
        }
        return city;
      })
    );

    setShowUnmatchConfirmModal(false);
    setUnmatchSelectionMode(null);
    setSelectedCitiesForUnmatch(new Set());
  };

  // ============ WARNING DETECTION ============
  const detectWarnings = (cities: CityData[]): string[] => {
    const warnings: string[] = [];
    
    const uniqueCodes = new Set(cities.map(c => c.cityCode).filter(Boolean));
    if (uniqueCodes.size > 1) {
      warnings.push(`Multiple city codes: ${Array.from(uniqueCodes).join(', ')}`);
    }
    
    const uniqueSuppliers = new Set(cities.map(c => c.supplierName));
    if (uniqueSuppliers.size === 1) {
      warnings.push('All cities from same supplier - possible duplicate');
    }
    
    return warnings;
  };

  const runAutoMatch = async () => {
    if (!selectedCountry) return;
    
    setLoading(true);
    try {
      const grouped = groupCitiesByName(cityData);
      Object.values(grouped).forEach(group => {
        if (group.length > 1) {
          const pendingItems = group.filter(item => item.status === 'pending');
          if (pendingItems.length > 0) {
            console.log(`Auto-matching ${pendingItems.length} cities in group: ${group[0].cityName}`);
          }
        }
      });
      await loadData();
    } catch (error) {
      console.error('Auto-match error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuppliers = () => {
    setIsUpdatingSuppliers(true);
    
    setTimeout(() => {
      const newCitiesFromExpedia: CityData[] = [
        {
          id: `expedia_${Date.now()}_1`,
          supplierId: 'expedia',
          supplierName: 'Expedia',
          supplierCityId: 'EXP_CAI_001',
          cityName: 'Cairo',
          cityCode: 'CAI',
          countryName: 'Egypt',
          countryCode: 'EG',
          stateProvince: 'Cairo Governorate',
          timezone: 'Africa/Cairo',
          coordinates: {
            latitude: 30.0444,
            longitude: 31.2357
          },
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `expedia_${Date.now()}_2`,
          supplierId: 'expedia',
          supplierName: 'Expedia',
          supplierCityId: 'EXP_NYC_001',
          cityName: 'New York',
          cityCode: 'NYC',
          countryName: 'United States',
          countryCode: 'US',
          stateProvince: 'New York',
          timezone: 'America/New_York',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          },
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `expedia_${Date.now()}_3`,
          supplierId: 'expedia',
          supplierName: 'Expedia',
          supplierCityId: 'EXP_PAR_001',
          cityName: 'Paris',
          cityCode: 'PAR',
          countryName: 'France',
          countryCode: 'FR',
          stateProvince: 'Île-de-France',
          timezone: 'Europe/Paris',
          coordinates: {
            latitude: 48.8566,
            longitude: 2.3522
          },
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setCityData(prevData => [...prevData, ...newCitiesFromExpedia]);
      setIsUpdatingSuppliers(false);
      alert(`✅ Data updated successfully!\n\nAdded ${newCitiesFromExpedia.length} new cities from Expedia`);
    }, 1500);
  };

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findSimilarCities = (city: CityData): MasterCity[] => {
    if (!city.coordinates) return [];
    
    return masterCities.filter(master => {
      const distance = calculateDistance(
        city.coordinates!.latitude,
        city.coordinates!.longitude,
        master.coordinates.latitude,
        master.coordinates.longitude
      );
      return distance < 50; // Within 50km
    });
  };

  const filteredData = cityData.filter(item => {
    const matchesSearch = item.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.countryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSupplier = selectedSupplier === 'all' || item.supplierId === selectedSupplier;
    const matchesCountry = selectedCountry === 'all' || item.countryCode === selectedCountry;
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesCountry;
  });

  const countryCities = selectedCountry ? cityData.filter(city => city.countryCode === selectedCountry) : [];
  const stats = {
    total: countryCities.length,
    pending: countryCities.filter(item => item.status === 'pending').length,
    mapped: countryCities.filter(item => item.status === 'mapped').length,
    review: countryCities.filter(item => item.status === 'review').length
  };

  const uniqueCountries = Array.from(new Set(cityData.map(item => item.countryCode)))
    .map(code => {
      const city = cityData.find(item => item.countryCode === code);
      return { code, name: city?.countryName || code };
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading cities data...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-scale">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-7 w-7 text-purple-500" />
            Cities Mapping
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Location-based city mapping with coordinate matching and distance calculations
          </p>
          {masterCountries.length > 0 && (
            <div className="mt-3">
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Step 1: Select Country (from completed country mapping)
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="input-modern w-64 px-4 py-3 text-base font-medium border-2 border-gray-300 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <option value="" className="text-gray-500">Choose a country...</option>
                {masterCountries.filter(country => country.status === 'mapped').map(country => (
                  <option key={country.code} value={country.code} className="text-gray-900 font-medium">
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleUpdateSuppliers}
            disabled={isUpdatingSuppliers}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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

          {/* Match Buttons - Only show when country is selected */}
          {selectedCountry && (
            <>
              {/* Auto Match All Button */}
              <button
                onClick={handleAutoMatchAll}
                disabled={isMatching}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg transition-all"
              >
                {isMatching ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Auto Matching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Auto Match All
                  </>
                )}
              </button>

              {/* Manual Match Toggle Button */}
              <button
                onClick={handleToggleBatchMode}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-lg transition-all ${
                  batchSelectionMode
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                }`}
              >
                <Users className="h-4 w-4" />
                {batchSelectionMode ? 'Cancel Manual Match' : 'Manual Match'}
              </button>

              {/* Confirm All Batch Button */}
              {batchSelectionMode && Object.values(selectedCitiesInGroup).some(set => set.size > 0) && (
                <button
                  onClick={handleConfirmBatchMatch}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 font-medium shadow-lg transition-all animate-pulse"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm All ({Object.values(selectedCitiesInGroup).reduce((acc, set) => acc + set.size, 0)} selected)
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mode Description */}
      {batchSelectionMode && selectedCountry && (
        <div className="card-modern p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Manual Match Mode Active</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Select cities from different groups to match them together. You can select multiple cities across different groups, then click "Confirm All" to create the match.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Country Selection Notice */}
      {!selectedCountry && (
        <div className="card-modern p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Select a Country First
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Choose a country from the completed country mapping to view and manage its cities.
          </p>
          <p className="text-sm text-gray-400">
            Complete the country mapping step first to enable city mapping.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      {selectedCountry && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Need Review</p>
              <p className="text-2xl font-bold text-red-600">{stats.review}</p>
            </div>
            <Eye className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>
      )}

      {/* Content only shows when country is selected */}
      {selectedCountry && (
        <>
          {/* Auto-Match Settings */}
          <div className="card-modern p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">City Matching Settings</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mapping cities in {masterCountries.find(c => c.code === selectedCountry)?.name}
                  </p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoMatchEnabled}
                    onChange={(e) => setAutoMatchEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable Auto Match</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                {groupedView && (
                  <button
                    onClick={() => {
                      const allGroups = Object.keys(groupCitiesByName(filteredData));
                      if (expandedGroups.size === allGroups.length) {
                        setExpandedGroups(new Set());
                      } else {
                        setExpandedGroups(new Set(allGroups));
                      }
                    }}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    {expandedGroups.size === Object.keys(groupCitiesByName(filteredData)).length ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Collapse All
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Expand All
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setGroupedView(!groupedView)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    groupedView 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {groupedView ? 'Grouped View' : 'List View'}
                </button>
              </div>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="card-modern p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          Geographic Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {uniqueCountries.map((country) => {
            const count = cityData.filter(city => city.countryCode === country.code).length;
            return (
              <div key={country.code} className="text-center">
                <div className="text-2xl font-bold text-purple-600">{count}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{country.name}</div>
                <div className="text-xs text-gray-400">{country.code}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="card-modern p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search cities, countries..."
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
            <option value="review">Need Review</option>
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
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="input-modern px-3 py-2"
          >
            <option value="all">All Countries</option>
            {uniqueCountries.map(country => (
              <option key={country.code} value={country.code}>{country.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table - Grouped by City */}
      <div className="space-y-6">
        {groupedView ? (
          // Grouped View
          Object.entries(groupCitiesByName(filteredData)).map(([cityName, cityGroup]) => {
            const suppliers = Array.from(new Set(cityGroup.map(c => c.supplierName)));
            const mapped = cityGroup.filter(c => c.status === 'mapped').length;
            const pending = cityGroup.filter(c => c.status === 'pending').length;
            const review = cityGroup.filter(c => c.status === 'review').length;
            
            // Debug log for Alexandria
            if (cityName === 'Alexandria') {
              console.log('Alexandria Debug:', { cityName, pending, mapped, totalCities: cityGroup.length, cityGroup });
            }
            
            return (
              <div key={cityName} className="card-modern overflow-hidden">
                {/* City Group Header with Gradient */}
                <div 
                  className="bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500 px-6 py-4 cursor-pointer"
                  onClick={() => toggleGroup(cityName)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`transform transition-transform ${expandedGroups.has(cityName) ? 'rotate-0' : '-rotate-90'}`}>
                        {expandedGroups.has(cityName) ? (
                          <ChevronDown className="h-5 w-5 text-white" />
                        ) : (
                          <ChevronUp className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <Navigation className="h-6 w-6 text-white" />
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          {cityName}
                          <span className="text-sm font-normal opacity-90">
                            ({cityGroup[0].cityCode})
                          </span>
                        </h3>
                        <div className="flex items-center gap-3 text-white/90 text-sm">
                          <span>{cityGroup[0].countryName}</span>
                          <span>•</span>
                          <span>{cityGroup.length} records from {suppliers.length} suppliers</span>
                          {(() => {
                            const matchedCity = cityGroup.find(c => c.masterId && (c.masterId.startsWith('JETIXIA_CITY_') || c.masterId.startsWith('master_')));
                            const masterCity = matchedCity ? masterCities.find(m => m.id === matchedCity.masterId) : null;
                            return masterCity ? (
                              <>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                                  Master: {masterCity.code}
                                </span>
                              </>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badges and Match Buttons */}
                    <div className="flex items-center gap-2">
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
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                          {review} Review
                        </span>
                      )}

                      {/* View/Edit/Move/Delete Action Buttons */}
                      <div className="flex gap-2 ml-2">
                        {(() => {
                          const matchedCity = cityGroup.find(c => c.masterId?.startsWith('JETIXIA_CITY_'));
                          const masterCity = matchedCity ? masterCities.find(m => m.id === matchedCity.masterId) : null;
                          return masterCity ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`View Master City: ${masterCity.name}\nCode: ${masterCity.code}\nCountry: ${masterCity.countryName}\nTimezone: ${masterCity.timezone}\nCoordinates: ${masterCity.coordinates.latitude}, ${masterCity.coordinates.longitude}`);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Edit functionality would open a modal to edit: ${masterCity.name}`);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-1"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Move functionality would allow relocating cities to a different master city`);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-1"
                              >
                                <ArrowRightLeft className="h-3 w-3" />
                                Move
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete Master City: ${masterCity.name}?\n\nThis will unmatch all ${cityGroup.length} associated cities.`)) {
                                    alert('Delete functionality would be implemented here');
                                  }
                                }}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </button>
                            </>
                          ) : null;
                        })()}
                      </div>

                      {/* Manual Match & Unmatch Buttons */}
                      <div className="flex gap-2">
                        {/* Manual Match for this group */}
                        {!groupSelectionMode[cityName] && !unmatchSelectionMode && pending >= 2 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleGroupSelectionMode(cityName);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-1"
                          >
                            <Users className="h-3 w-3" />
                            Manual Match
                          </button>
                        )}

                        {/* Confirm Manual Match */}
                        {groupSelectionMode[cityName] && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmGroupMatch(cityName);
                              }}
                              disabled={(selectedCitiesInGroup[cityName]?.size || 0) < 2}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Confirm ({selectedCitiesInGroup[cityName]?.size || 0})
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelGroupSelection(cityName);
                              }}
                              className="px-3 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-all shadow-md"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {/* Unmatch Button - Only show for mapped groups */}
                        {!groupSelectionMode[cityName] && !unmatchSelectionMode && mapped > 0 && cityGroup.some(c => c.masterId?.startsWith('JETIXIA_CITY_')) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnmatchGroup(cityName);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Unmatch
                          </button>
                        )}

                        {/* Unmatch Confirm/Cancel */}
                        {unmatchSelectionMode === cityName && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmUnmatch();
                              }}
                              disabled={selectedCitiesForUnmatch.size === 0}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-1"
                            >
                              <AlertCircle className="h-3 w-3" />
                              Confirm Unmatch ({selectedCitiesForUnmatch.size})
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelUnmatch();
                              }}
                              className="px-3 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-all shadow-md"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* City Details Table - Only show when expanded */}
                {expandedGroups.has(cityName) && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {/* Checkbox Column - Show in Manual Match or Batch or Unmatch mode */}
                        {(groupSelectionMode[cityName] || batchSelectionMode || unmatchSelectionMode === cityName) && (
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              onChange={(e) => {
                                const allIds = cityGroup.map(c => c.id);
                                if (unmatchSelectionMode === cityName) {
                                  if (e.target.checked) {
                                    setSelectedCitiesForUnmatch(new Set(allIds));
                                  } else {
                                    setSelectedCitiesForUnmatch(new Set());
                                  }
                                } else {
                                  if (e.target.checked) {
                                    setSelectedCitiesInGroup(prev => ({
                                      ...prev,
                                      [cityName]: new Set(allIds)
                                    }));
                                  } else {
                                    setSelectedCitiesInGroup(prev => ({
                                      ...prev,
                                      [cityName]: new Set()
                                    }));
                                  }
                                }
                              }}
                              checked={
                                unmatchSelectionMode === cityName
                                  ? selectedCitiesForUnmatch.size === cityGroup.length && cityGroup.length > 0
                                  : (selectedCitiesInGroup[cityName]?.size || 0) === cityGroup.length && cityGroup.length > 0
                              }
                            />
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Supplier Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          State/Province
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Coordinates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Timezone
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
                      {cityGroup.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          {/* Checkbox Column */}
                          {(groupSelectionMode[cityName] || batchSelectionMode || unmatchSelectionMode === cityName) && (
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                onChange={() => {
                                  if (unmatchSelectionMode === cityName) {
                                    handleUnmatchCheckboxChange(item.id);
                                  } else if (batchSelectionMode) {
                                    handleBatchCheckboxChange(cityName, item.id);
                                  } else {
                                    handleCityCheckboxChange(cityName, item.id);
                                  }
                                }}
                                checked={
                                  unmatchSelectionMode === cityName
                                    ? selectedCitiesForUnmatch.has(item.id)
                                    : (selectedCitiesInGroup[cityName]?.has(item.id) || false)
                                }
                              />
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.supplierName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{item.cityName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">ID: {item.supplierCityId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900 dark:text-white">{item.cityCode}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{item.stateProvince || 'N/A'}</div>
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
                            <div className="text-sm text-gray-900 dark:text-white">{item.timezone || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              item.status === 'mapped' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              item.status === 'pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {item.confidence ? (
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                  {item.confidence}%
                                </span>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedCity(item);
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
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
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
                      City Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Coordinates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Timezone
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
                          <div className="text-sm text-gray-500 dark:text-gray-400 ml-2">ID: {item.supplierCityId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{item.cityName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.cityCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{item.countryName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.stateProvince}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.coordinates ? (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <div>{item.coordinates.latitude.toFixed(4)}</div>
                            <div>{item.coordinates.longitude.toFixed(4)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{item.timezone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          item.status === 'mapped' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          item.status === 'pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {item.confidence ? `${item.confidence}%` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCity(item);
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
            <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No cities found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or fetch data from suppliers</p>
          </div>
        )}
      </div>
        </>
      )}

      {/* ============ UNMATCH CONFIRMATION MODAL ============ */}
      {showUnmatchConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Confirm Unmatch</h2>
                  <p className="text-red-100 text-sm mt-1">
                    Remove selected cities from their current match
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Important: Master ID Preservation
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      The Master ID will <strong>NOT</strong> be deleted. Only the status will change to "pending".
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Cities to Unmatch ({selectedCitiesForUnmatch.size})
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {Array.from(selectedCitiesForUnmatch).map(cityId => {
                      const city = cityData.find(c => c.id === cityId);
                      if (!city) return null;
                      
                      return (
                        <div key={cityId} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{city.cityName}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {city.supplierName} • Code: {city.cityCode || 'N/A'}
                              </p>
                            </div>
                          </div>
                          {city.masterId && (
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-mono">
                              {city.masterId}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 rounded-b-2xl flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowUnmatchConfirmModal(false)}
                className="px-6 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={processUnmatch}
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Confirm Unmatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MATCH CONFIRMATION MODAL ============ */}
      {showMatchConfirmModal && pendingMatchData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Confirm Match</h2>
                  <p className="text-green-100 text-sm mt-1">
                    Review and confirm the cities match
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Match Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-700 dark:text-green-300">Group Name:</p>
                    <p className="font-semibold text-green-900 dark:text-green-100">{pendingMatchData.groupName}</p>
                  </div>
                  <div>
                    <p className="text-green-700 dark:text-green-300">Cities to Match:</p>
                    <p className="font-semibold text-green-900 dark:text-green-100">{pendingMatchData.cities.length}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  Cities ({pendingMatchData.cities.length})
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {pendingMatchData.cities.map(city => (
                      <div key={city.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{city.cityName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {city.supplierName} • Code: {city.cityCode || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          city.status === 'mapped' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                          'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                        }`}>
                          {city.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {pendingMatchData.warnings.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Warnings
                  </h4>
                  <ul className="space-y-1">
                    {pendingMatchData.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 rounded-b-2xl flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowMatchConfirmModal(false);
                  setPendingMatchData(null);
                }}
                className="px-6 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newMasterId = generateMasterId();
                  
                  setCityData(prevData => 
                    prevData.map(city => {
                      if (pendingMatchData.cities.some(c => c.id === city.id)) {
                        return {
                          ...city,
                          masterId: newMasterId,
                          status: 'mapped' as const
                        };
                      }
                      return city;
                    })
                  );

                  setShowMatchConfirmModal(false);
                  setPendingMatchData(null);
                  setGroupSelectionMode({});
                  setSelectedCitiesInGroup({});
                  setBatchSelectionMode(false);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Cities Section - Only show when country is selected */}
      {selectedCountry && (
        <div className="card-modern p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Master Cities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {masterCities
              .filter(city => city.countryCode === selectedCountry)
              .map((city) => {
              // Calculate actual mapped count
              const actualMappedCount = cityData.filter(c => c.masterId === city.id).length;
              // Calculate unique suppliers
              const uniqueSuppliers = new Set(
                cityData
                  .filter(c => c.masterId === city.id)
                  .map(c => c.supplierName)
              );

              // Get country flag emoji
              const getCountryFlag = (countryCode: string) => {
                const codePoints = countryCode
                  .toUpperCase()
                  .split('')
                  .map(char => 127397 + char.charCodeAt(0));
                return String.fromCodePoint(...codePoints);
              };

              return (
                <div key={city.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" title={city.countryName}>
                        {getCountryFlag(city.countryCode)}
                      </span>
                      <h3 className="font-medium text-gray-900 dark:text-white">{city.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm mb-2">
                    <span className="font-medium">Master Code:</span>
                    <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-semibold">
                      {city.code}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        {city.code}
                      </span>
                      {city.iataCode && (
                        <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          {city.iataCode}
                        </span>
                      )}
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="text-gray-600 dark:text-gray-400">
                        🌍 {city.stateProvince || 'N/A'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        🕒 {city.timezone}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        📊 {actualMappedCount} mapped
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        🏢 {uniqueSuppliers.size} suppliers
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitiesTab;