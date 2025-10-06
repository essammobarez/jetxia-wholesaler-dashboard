'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Search, Plus, Eye, Edit, Trash2, Download, RefreshCw, Check, AlertCircle, Map, Sparkles, Users, CheckCircle2, Info, ArrowRightLeft, ChevronDown, ChevronUp } from 'lucide-react';

interface CountryData {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierCountryId: string;
  countryName: string;
  countryCode?: string;
  currency?: string;
  continent?: string;
  masterId?: string;
  status: 'pending' | 'mapped' | 'review';
  confidence?: number;
  createdAt: string;
  updatedAt: string;
}

interface MasterCountry {
  id: string;
  name: string;
  code: string;
  iso2Code: string;
  iso3Code: string;
  currency: string;
  continent: string;
  region: string;
  mappedCount: number;
  suppliers: string[];
  createdAt: string;
  updatedAt: string;
}

const CountryTab = () => {
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [masterCountries, setMasterCountries] = useState<MasterCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'mapped' | 'review'>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [showCreateMaster, setShowCreateMaster] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [groupedView, setGroupedView] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [autoMatchEnabled, setAutoMatchEnabled] = useState(true);
  const [isUpdatingSuppliers, setIsUpdatingSuppliers] = useState(false);
  
  // Match & Unmatch States
  const [autoMatchResults, setAutoMatchResults] = useState<{
    success: number;
    warnings: Array<{
      groupName: string;
      countries: CountryData[];
      issues: string[];
    }>;
  }>({ success: 0, warnings: [] });
  const [isMatching, setIsMatching] = useState(false);
  const [showManualMatchModal, setShowManualMatchModal] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [groupSelectionMode, setGroupSelectionMode] = useState<{ [groupName: string]: boolean }>({});
  const [selectedCountriesInGroup, setSelectedCountriesInGroup] = useState<{ [groupName: string]: Set<string> }>({});
  const [batchSelectionMode, setBatchSelectionMode] = useState(false);
  const [unmatchSelectionMode, setUnmatchSelectionMode] = useState<string | null>(null);
  const [selectedCountriesForUnmatch, setSelectedCountriesForUnmatch] = useState<Set<string>>(new Set());
  const [showUnmatchConfirmModal, setShowUnmatchConfirmModal] = useState(false);
  const [showMatchConfirmModal, setShowMatchConfirmModal] = useState(false);
  const [pendingMatchData, setPendingMatchData] = useState<{
    groupName: string;
    countries: CountryData[];
    warnings: string[];
  } | null>(null);
  
  // Action Modals States
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<CountryData | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [countryToMove, setCountryToMove] = useState<CountryData | null>(null);
  const [selectedTargetMaster, setSelectedTargetMaster] = useState<string>('');
  const [expandedGroupsState, setExpandedGroupsState] = useState<{ [groupName: string]: boolean }>({});

  // Mock suppliers data
  const suppliers = [
    { id: 'ebooking', name: 'eBooking' },
    { id: 'iwtx', name: 'IWTX' },
    { id: 'amadeus', name: 'Amadeus' },
    { id: 'sabre', name: 'Sabre' },
    { id: 'expedia', name: 'Expedia' }
  ];

  const continents = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'];

  // Mock country data
  const mockCountryData: CountryData[] = [
    {
      id: '1',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierCountryId: 'EG001',
      countryName: 'Egypt',
      countryCode: 'EG',
      currency: 'EGP',
      continent: 'Africa',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierCountryId: 'EGY_001',
      countryName: 'Egypt Arab Republic',
      countryCode: 'EGY',
      currency: 'EGP',
      continent: 'Africa',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierCountryId: 'EGYPT_C',
      countryName: 'Egypt',
      countryCode: 'EG',
      currency: 'EGP',
      continent: 'Africa',
      masterId: 'master_001',
      status: 'mapped',
      confidence: 99,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '4',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierCountryId: 'SA_UAE_01',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      currency: 'AED',
      continent: 'Asia',
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    // Additional comprehensive world countries
    // United States from all suppliers
    {
      id: '8',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierCountryId: 'US001',
      countryName: 'United States',
      countryCode: 'US',
      currency: 'USD',
      continent: 'North America',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '9',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierCountryId: 'USA_001',
      countryName: 'USA',
      countryCode: 'US',
      currency: 'USD',
      continent: 'North America',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '10',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierCountryId: 'US_AMADEUS',
      countryName: 'United States of America',
      countryCode: 'US',
      currency: 'USD',
      continent: 'North America',
      masterId: 'master_003',
      status: 'mapped',
      confidence: 97,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '11',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierCountryId: 'SAB_USA',
      countryName: 'US',
      countryCode: 'US',
      currency: 'USD',
      continent: 'North America',
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '12',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierCountryId: 'BOOK_US',
      countryName: 'United States',
      countryCode: 'US',
      currency: 'USD',
      continent: 'North America',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // United Kingdom from all suppliers
    {
      id: '13',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierCountryId: 'GB001',
      countryName: 'United Kingdom',
      countryCode: 'GB',
      currency: 'GBP',
      continent: 'Europe',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '14',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierCountryId: 'UK_001',
      countryName: 'UK',
      countryCode: 'GB',
      currency: 'GBP',
      continent: 'Europe',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '15',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierCountryId: 'GB_AMADEUS',
      countryName: 'Great Britain',
      countryCode: 'GB',
      currency: 'GBP',
      continent: 'Europe',
      masterId: 'master_004',
      status: 'mapped',
      confidence: 95,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '16',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierCountryId: 'SAB_UK',
      countryName: 'Britain',
      countryCode: 'GB',
      currency: 'GBP',
      continent: 'Europe',
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '17',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierCountryId: 'BOOK_GB',
      countryName: 'United Kingdom',
      countryCode: 'GB',
      currency: 'GBP',
      continent: 'Europe',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    
    // Germany from all suppliers
    {
      id: '18',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierCountryId: 'DE001',
      countryName: 'Germany',
      countryCode: 'DE',
      currency: 'EUR',
      continent: 'Europe',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '19',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierCountryId: 'DE_001',
      countryName: 'Deutschland',
      countryCode: 'DE',
      currency: 'EUR',
      continent: 'Europe',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '20',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierCountryId: 'DE_AMADEUS',
      countryName: 'Germany',
      countryCode: 'DE',
      currency: 'EUR',
      continent: 'Europe',
      masterId: 'master_005',
      status: 'mapped',
      confidence: 98,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '21',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierCountryId: 'SAB_DE',
      countryName: 'German',
      countryCode: 'DE',
      currency: 'EUR',
      continent: 'Europe',
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '22',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierCountryId: 'BOOK_DE',
      countryName: 'Germany',
      countryCode: 'DE',
      currency: 'EUR',
      continent: 'Europe',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  // Mock master countries
  const mockMasterCountries: MasterCountry[] = [
    {
      id: 'master_001',
      name: 'Egypt',
      code: 'EG',
      iso2Code: 'EG',
      iso3Code: 'EGY',
      currency: 'EGP',
      continent: 'Africa',
      region: 'Northern Africa',
      mappedCount: 1,
      suppliers: ['amadeus'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_002',
      name: 'United Arab Emirates',
      code: 'AE',
      iso2Code: 'AE',
      iso3Code: 'ARE',
      currency: 'AED',
      continent: 'Asia',
      region: 'Western Asia',
      mappedCount: 1,
      suppliers: ['sabre'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_003',
      name: 'United States',
      code: 'US',
      iso2Code: 'US',
      iso3Code: 'USA',
      currency: 'USD',
      continent: 'North America',
      region: 'Northern America',
      mappedCount: 2,
      suppliers: ['amadeus', 'sabre'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_004',
      name: 'United Kingdom',
      code: 'GB',
      iso2Code: 'GB',
      iso3Code: 'GBR',
      currency: 'GBP',
      continent: 'Europe',
      region: 'Northern Europe',
      mappedCount: 2,
      suppliers: ['amadeus', 'sabre'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_005',
      name: 'Germany',
      code: 'DE',
      iso2Code: 'DE',
      iso3Code: 'DEU',
      currency: 'EUR',
      continent: 'Europe',
      region: 'Western Europe',
      mappedCount: 2,
      suppliers: ['amadeus', 'sabre'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_006',
      name: 'France',
      code: 'FR',
      iso2Code: 'FR',
      iso3Code: 'FRA',
      currency: 'EUR',
      continent: 'Europe',
      region: 'Western Europe',
      mappedCount: 0,
      suppliers: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_007',
      name: 'Japan',
      code: 'JP',
      iso2Code: 'JP',
      iso3Code: 'JPN',
      currency: 'JPY',
      continent: 'Asia',
      region: 'Eastern Asia',
      mappedCount: 0,
      suppliers: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_008',
      name: 'China',
      code: 'CN',
      iso2Code: 'CN',
      iso3Code: 'CHN',
      currency: 'CNY',
      continent: 'Asia',
      region: 'Eastern Asia',
      mappedCount: 0,
      suppliers: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_009',
      name: 'Australia',
      code: 'AU',
      iso2Code: 'AU',
      iso3Code: 'AUS',
      currency: 'AUD',
      continent: 'Oceania',
      region: 'Australia and New Zealand',
      mappedCount: 0,
      suppliers: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_010',
      name: 'Canada',
      code: 'CA',
      iso2Code: 'CA',
      iso3Code: 'CAN',
      currency: 'CAD',
      continent: 'North America',
      region: 'Northern America',
      mappedCount: 0,
      suppliers: [],
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
      setCountryData(mockCountryData);
      setMasterCountries(mockMasterCountries);
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

  // Generate Master ID for countries
  const generateMasterId = () => {
    const existingIds = countryData
      .map(c => c.masterId)
      .filter((id): id is string => id !== undefined && id.startsWith('JETIXIA_COUNTRY_'));
    
    if (existingIds.length === 0) {
      return 'JETIXIA_COUNTRY_00001';
    }
    
    const maxNumber = Math.max(
      ...existingIds.map(id => {
        const match = id.match(/JETIXIA_COUNTRY_(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
    );
    
    return `JETIXIA_COUNTRY_${String(maxNumber + 1).padStart(5, '0')}`;
  };

  // Group countries by normalized name with Master ID priority
  const groupCountriesByName = (countries: CountryData[]) => {
    const groups: { [key: string]: CountryData[] } = {};
    
    // First pass: Group by masterId
    countries.forEach(country => {
      if (country.masterId && country.masterId.startsWith('JETIXIA_COUNTRY_')) {
        if (!groups[country.masterId]) {
          groups[country.masterId] = [];
        }
        groups[country.masterId].push(country);
      }
    });
    
    // Second pass: Group remaining countries by similarity
    const ungroupedCountries = countries.filter(
      country => !country.masterId || !country.masterId.startsWith('JETIXIA_COUNTRY_')
    );
    
    ungroupedCountries.forEach(country => {
      const normalizedName = country.countryName.toLowerCase().replace(/[^a-z]/g, '');
      const normalizedCode = (country.countryCode || '').toLowerCase();
      
      let foundGroup = false;
      
      // Try to find a similar existing group
      for (const [groupKey, groupCountries] of Object.entries(groups)) {
        if (!groupKey.startsWith('JETIXIA_COUNTRY_')) {
          const firstCountry = groupCountries[0];
          const existingNormalizedName = firstCountry.countryName.toLowerCase().replace(/[^a-z]/g, '');
          const existingNormalizedCode = (firstCountry.countryCode || '').toLowerCase();
          
          // Calculate similarity (70% name, 30% code)
          const nameSimilarity = normalizedName === existingNormalizedName || 
                                normalizedName.includes(existingNormalizedName) || 
                                existingNormalizedName.includes(normalizedName) ? 0.7 : 0;
          const codeSimilarity = normalizedCode && existingNormalizedCode && 
                               normalizedCode === existingNormalizedCode ? 0.3 : 0;
          
          const totalSimilarity = nameSimilarity + codeSimilarity;
          
          if (totalSimilarity >= 0.7) {
            groups[groupKey].push(country);
            foundGroup = true;
            break;
          }
        }
      }
      
      if (!foundGroup) {
        const groupKey = country.countryName;
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(country);
      }
    });
    
    return groups;
  };

  // ============ MANUAL MATCH FUNCTIONS ============
  const handleToggleGroupSelectionMode = (groupName: string) => {
    setGroupSelectionMode(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
    
    if (groupSelectionMode[groupName]) {
      setSelectedCountriesInGroup(prev => ({
        ...prev,
        [groupName]: new Set()
      }));
    }
  };

  const handleCountryCheckboxChange = (groupName: string, countryId: string) => {
    setSelectedCountriesInGroup(prev => {
      const currentSelection = prev[groupName] || new Set();
      const newSelection = new Set(currentSelection);
      
      if (newSelection.has(countryId)) {
        newSelection.delete(countryId);
      } else {
        newSelection.add(countryId);
      }
      
      return {
        ...prev,
        [groupName]: newSelection
      };
    });
  };

  const handleConfirmGroupMatch = (groupName: string) => {
    const selectedIds = selectedCountriesInGroup[groupName];
    if (!selectedIds || selectedIds.size < 2) {
      alert('Please select at least 2 countries to match');
      return;
    }

    const grouped = groupCountriesByName(countryData);
    const countries = grouped[groupName] || [];
    const selectedCountries = countries.filter(c => selectedIds.has(c.id));

    const warnings = detectWarnings(selectedCountries);

    setPendingMatchData({
      groupName,
      countries: selectedCountries,
      warnings
    });
    setShowMatchConfirmModal(true);
  };

  const handleCancelGroupSelection = (groupName: string) => {
    setGroupSelectionMode(prev => ({
      ...prev,
      [groupName]: false
    }));
    setSelectedCountriesInGroup(prev => ({
      ...prev,
      [groupName]: new Set()
    }));
  };

  // ============ BATCH SELECTION FUNCTIONS ============
  const handleToggleBatchMode = () => {
    setBatchSelectionMode(prev => !prev);
    if (batchSelectionMode) {
      setSelectedCountriesInGroup({});
    }
  };

  const handleBatchCheckboxChange = (groupName: string, countryId: string) => {
    setSelectedCountriesInGroup(prev => {
      const currentSelection = prev[groupName] || new Set();
      const newSelection = new Set(currentSelection);
      
      if (newSelection.has(countryId)) {
        newSelection.delete(countryId);
      } else {
        newSelection.add(countryId);
      }
      
      return {
        ...prev,
        [groupName]: newSelection
      };
    });
  };

  const handleConfirmBatchMatch = () => {
    const allSelectedCountries: CountryData[] = [];
    const grouped = groupCountriesByName(countryData);

    Object.entries(selectedCountriesInGroup).forEach(([groupName, selectedIds]) => {
      if (selectedIds.size >= 2) {
        const countries = grouped[groupName] || [];
        const selected = countries.filter(c => selectedIds.has(c.id));
        allSelectedCountries.push(...selected);
      }
    });

    if (allSelectedCountries.length < 2) {
      alert('Please select at least 2 countries across all groups to match');
      return;
    }

    const warnings = detectWarnings(allSelectedCountries);

    setPendingMatchData({
      groupName: 'Batch Match',
      countries: allSelectedCountries,
      warnings
    });
    setShowMatchConfirmModal(true);
  };

  // ============ AUTO MATCH FUNCTION ============
  const handleAutoMatchAll = async () => {
    setIsMatching(true);
    const results = { success: 0, warnings: [] as any[] };

    try {
      const grouped = groupCountriesByName(countryData);
      
      for (const [groupName, countries] of Object.entries(grouped)) {
        if (countries.length >= 2) {
          const pendingCountries = countries.filter(c => c.status === 'pending');
          
          if (pendingCountries.length >= 2) {
            const warnings = detectWarnings(pendingCountries);
            
            if (warnings.length === 0) {
              results.success++;
            } else {
              results.warnings.push({
                groupName,
                countries: pendingCountries,
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
    setSelectedCountriesForUnmatch(new Set());
  };

  const handleUnmatchCheckboxChange = (countryId: string) => {
    setSelectedCountriesForUnmatch(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(countryId)) {
        newSelection.delete(countryId);
      } else {
        newSelection.add(countryId);
      }
      return newSelection;
    });
  };

  const handleConfirmUnmatch = () => {
    if (selectedCountriesForUnmatch.size === 0) {
      alert('Please select at least one country to unmatch');
      return;
    }
    setShowUnmatchConfirmModal(true);
  };

  const handleCancelUnmatch = () => {
    setUnmatchSelectionMode(null);
    setSelectedCountriesForUnmatch(new Set());
  };

  const processUnmatch = () => {
    setCountryData(prevData => 
      prevData.map(country => {
        if (selectedCountriesForUnmatch.has(country.id)) {
          return {
            ...country,
            status: 'pending' as const
            // IMPORTANT: masterId is NOT deleted, only status changes
          };
        }
        return country;
      })
    );

    setShowUnmatchConfirmModal(false);
    setUnmatchSelectionMode(null);
    setSelectedCountriesForUnmatch(new Set());
  };

  // ============ WARNING DETECTION ============
  const detectWarnings = (countries: CountryData[]): string[] => {
    const warnings: string[] = [];
    
    const uniqueCodes = new Set(countries.map(c => c.countryCode).filter(Boolean));
    if (uniqueCodes.size > 1) {
      warnings.push(`Multiple country codes: ${Array.from(uniqueCodes).join(', ')}`);
    }
    
    const uniqueSuppliers = new Set(countries.map(c => c.supplierName));
    if (uniqueSuppliers.size === 1) {
      warnings.push('All countries from same supplier - possible duplicate');
    }
    
    return warnings;
  };

  const runAutoMatch = async () => {
    setLoading(true);
    try {
      // Auto-match logic for countries with high confidence
      const grouped = groupCountriesByName(countryData);
      Object.values(grouped).forEach(group => {
        if (group.length > 1) {
          // Auto-match countries with similar names and same continent
          const pendingItems = group.filter(item => item.status === 'pending');
          if (pendingItems.length > 0) {
            console.log(`Auto-matching ${pendingItems.length} countries in group: ${group[0].countryName}`);
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
      const newCountriesFromExpedia: CountryData[] = [
        {
          id: `expedia_${Date.now()}_1`,
          supplierId: 'expedia',
          supplierName: 'Expedia',
          supplierCountryId: 'EXP_EG_001',
          countryName: 'Egypt',
          countryCode: 'EG',
          currency: 'EGP',
          continent: 'Africa',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `expedia_${Date.now()}_2`,
          supplierId: 'expedia',
          supplierName: 'Expedia',
          supplierCountryId: 'EXP_US_001',
          countryName: 'United States',
          countryCode: 'US',
          currency: 'USD',
          continent: 'North America',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `expedia_${Date.now()}_3`,
          supplierId: 'expedia',
          supplierName: 'Expedia',
          supplierCountryId: 'EXP_FR_001',
          countryName: 'France',
          countryCode: 'FR',
          currency: 'EUR',
          continent: 'Europe',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setCountryData(prevData => [...prevData, ...newCountriesFromExpedia]);
      setIsUpdatingSuppliers(false);
      alert(`✅ Data updated successfully!\n\nAdded ${newCountriesFromExpedia.length} new countries from Expedia`);
    }, 1500);
  };

  // ==================== ACTION HANDLERS ====================
  const handleViewCountry = (country: CountryData) => {
    setSelectedCountry(country);
    setShowViewModal(true);
  };

  const handleDeleteClick = (country: CountryData) => {
    setCountryToDelete(country);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteConfirm = () => {
    if (countryToDelete) {
      const updatedData = countryData.filter(item => item.id !== countryToDelete.id);
      setCountryData(updatedData);
      setShowDeleteConfirmModal(false);
      setCountryToDelete(null);
      alert(`✅ Successfully deleted country: ${countryToDelete.countryName} from ${countryToDelete.supplierName}`);
    }
  };

  const handleMoveClick = (country: CountryData) => {
    setCountryToMove(country);
    setSelectedTargetMaster('');
    setShowMoveModal(true);
  };

  const handleMoveConfirm = () => {
    if (countryToMove && selectedTargetMaster) {
      const updatedData = countryData.map(item => {
        if (item.id === countryToMove.id) {
          return {
            ...item,
            masterId: selectedTargetMaster,
            status: 'mapped' as const,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });
      
      setCountryData(updatedData);
      setShowMoveModal(false);
      setCountryToMove(null);
      setSelectedTargetMaster('');
      
      const targetMaster = masterCountries.find(m => m.id === selectedTargetMaster);
      alert(`✅ Successfully moved "${countryToMove.countryName}" to "${targetMaster?.name}"`);
    }
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

  const toggleGroupState = (groupName: string) => {
    setExpandedGroupsState(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const filteredData = countryData.filter(item => {
    const matchesSearch = item.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSupplier = selectedSupplier === 'all' || item.supplierId === selectedSupplier;
    const matchesContinent = selectedContinent === 'all' || item.continent === selectedContinent;
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesContinent;
  });

  // Group countries by continent
  const groupCountriesByContinent = (data: CountryData[]) => {
    const grouped: { [key: string]: CountryData[] } = {};
    
    data.forEach(item => {
      const continentKey = item.continent || 'Other';
      
      if (!grouped[continentKey]) {
        grouped[continentKey] = [];
      }
      grouped[continentKey].push(item);
    });
    
    // Sort continents alphabetically
    const sortedGrouped: { [key: string]: CountryData[] } = {};
    Object.keys(grouped).sort().forEach(key => {
      sortedGrouped[key] = grouped[key];
    });
    
    return sortedGrouped;
  };

  const groupedData = groupCountriesByContinent(filteredData);

  const stats = {
    total: countryData.length,
    pending: countryData.filter(item => item.status === 'pending').length,
    mapped: countryData.filter(item => item.status === 'mapped').length,
    review: countryData.filter(item => item.status === 'review').length
  };

  const continentStats = continents.map(continent => ({
    name: continent,
    count: countryData.filter(item => item.continent === continent).length
  })).filter(stat => stat.count > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading country data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-scale">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="h-7 w-7 text-green-500" />
            Country Mapping
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Map country data with regional insights and currency information
          </p>
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

          {/* Confirm All Batch Button - Only show when in batch mode with selections */}
          {batchSelectionMode && Object.values(selectedCountriesInGroup).some(set => set.size > 0) && (
            <button
              onClick={handleConfirmBatchMatch}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 font-medium shadow-lg transition-all animate-pulse"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm All ({Object.values(selectedCountriesInGroup).reduce((acc, set) => acc + set.size, 0)} selected)
            </button>
          )}
        </div>
      </div>

      {/* Mode Description */}
      {batchSelectionMode && (
        <div className="card-modern p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Manual Match Mode Active</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Select countries from different groups to match them together. You can select multiple countries across different groups, then click "Confirm All" to create the match.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Globe className="h-8 w-8 text-green-500" />
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

      {/* Auto-Match Settings */}
      <div className="card-modern p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Matching Settings</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configure auto-matching and data view</p>
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
                  const allGroupNames = Object.keys(groupCountriesByName(filteredData));
                  const allExpanded = allGroupNames.every(name => expandedGroups.has(name));
                  
                  if (allExpanded) {
                    // Collapse all
                    setExpandedGroups(new Set());
                  } else {
                    // Expand all
                    setExpandedGroups(new Set(allGroupNames));
                  }
                }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
              >
                {Object.keys(groupCountriesByName(filteredData)).every(name => expandedGroups.has(name)) ? (
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
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {groupedView ? 'Grouped View' : 'List View'}
            </button>
          </div>
        </div>
      </div>

      {/* Regional Distribution */}
      <div className="card-modern p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Map className="h-5 w-5 text-blue-500" />
          Regional Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {continentStats.map((continent) => (
            <div key={continent.name} className="text-center">
              <div className="text-2xl font-bold text-blue-600">{continent.count}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{continent.name}</div>
            </div>
          ))}
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
                placeholder="Search countries..."
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
            value={selectedContinent}
            onChange={(e) => setSelectedContinent(e.target.value)}
            className="input-modern px-3 py-2"
          >
            <option value="all">All Continents</option>
            {continents.map(continent => (
              <option key={continent} value={continent}>{continent}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Display - Grouped or List View */}
      <div className="card-modern overflow-hidden">
        {groupedView ? (
          <div className="p-6 space-y-4">
            {Object.entries(groupCountriesByName(filteredData)).map(([groupName, countries]) => {
              const isExpanded = expandedGroups.has(groupName);
              const groupStats = {
                total: countries.length,
                pending: countries.filter(c => c.status === 'pending').length,
                mapped: countries.filter(c => c.status === 'mapped').length,
                review: countries.filter(c => c.status === 'review').length
              };
              
              return (
                <div key={groupName} className="card-modern overflow-hidden">
                  {/* Country Group Header with Gradient */}
                  <div 
                    className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-4 cursor-pointer"
                    onClick={() => toggleGroup(groupName)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`transform transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-white" />
                          ) : (
                            <ChevronUp className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <Globe className="h-6 w-6 text-white" />
                        <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {groupName}
                            {countries[0].countryCode && (
                              <span className="text-sm font-normal opacity-90">
                                ({countries[0].countryCode})
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-3 text-white/90 text-sm">
                            <span>{countries[0].continent}</span>
                            <span>•</span>
                            <span>{groupStats.total} records from {new Set(countries.map(c => c.supplierName)).size} suppliers</span>
                            {/* Master Code from matched countries */}
                            {(() => {
                              const matchedCountry = countries.find(c => c.masterId);
                              if (matchedCountry) {
                                const masterCountry = masterCountries.find(m => m.id === matchedCountry.masterId);
                                if (masterCountry) {
                                  return (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono font-semibold">
                                        Master: {masterCountry.iso2Code} / {masterCountry.iso3Code}
                                      </span>
                                    </>
                                  );
                                }
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Badges and Match Buttons */}
                      <div className="flex items-center gap-2">
                        {groupStats.mapped > 0 && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            {groupStats.mapped} Mapped
                          </span>
                        )}
                        {groupStats.pending > 0 && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                            {groupStats.pending} Pending
                          </span>
                        )}
                        {groupStats.review > 0 && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                            {groupStats.review} Review
                          </span>
                        )}

                        {/* Manual Match & Unmatch Buttons */}
                        <div className="flex gap-2 ml-2">
                          {/* Manual Match for this group */}
                          {!groupSelectionMode[groupName] && !unmatchSelectionMode && groupStats.pending >= 2 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleGroupSelectionMode(groupName);
                              }}
                              className="px-3 py-1 bg-white text-green-700 text-xs rounded-lg hover:bg-green-50 transition-all shadow-md flex items-center gap-1 border border-green-300"
                            >
                              <Users className="h-3 w-3" />
                              Manual Match
                            </button>
                          )}

                          {/* Confirm Manual Match */}
                          {groupSelectionMode[groupName] && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmGroupMatch(groupName);
                                }}
                                disabled={(selectedCountriesInGroup[groupName]?.size || 0) < 2}
                                className="px-3 py-1 bg-white text-emerald-700 text-xs rounded-lg hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-1 border border-emerald-300"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Confirm ({selectedCountriesInGroup[groupName]?.size || 0})
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelGroupSelection(groupName);
                                }}
                                className="px-3 py-1 bg-white text-gray-700 text-xs rounded-lg hover:bg-gray-50 transition-all shadow-md border border-gray-300"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {/* Unmatch Button - Only show for mapped groups */}
                          {!groupSelectionMode[groupName] && !unmatchSelectionMode && groupStats.mapped > 0 && countries.some(c => c.masterId?.startsWith('JETIXIA_COUNTRY_')) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnmatchGroup(groupName);
                              }}
                              className="px-3 py-1 bg-white text-red-700 text-xs rounded-lg hover:bg-red-50 transition-all shadow-md flex items-center gap-1 border border-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                              Unmatch
                            </button>
                          )}

                          {/* Unmatch Confirm/Cancel */}
                          {unmatchSelectionMode === groupName && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmUnmatch();
                                }}
                                disabled={selectedCountriesForUnmatch.size === 0}
                                className="px-3 py-1 bg-white text-red-700 text-xs rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-1 border border-red-300"
                              >
                                <AlertCircle className="h-3 w-3" />
                                Confirm Unmatch ({selectedCountriesForUnmatch.size})
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelUnmatch();
                                }}
                                className="px-3 py-1 bg-white text-gray-700 text-xs rounded-lg hover:bg-gray-50 transition-all shadow-md border border-gray-300"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Country Details Table */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              {/* Checkbox Column - Show in Manual Match or Batch or Unmatch mode */}
                              {(groupSelectionMode[groupName] || batchSelectionMode || unmatchSelectionMode === groupName) && (
                                <th className="px-4 py-3 text-left">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    onChange={(e) => {
                                      const allIds = countries.map(c => c.id);
                                      if (unmatchSelectionMode === groupName) {
                                        if (e.target.checked) {
                                          setSelectedCountriesForUnmatch(new Set(allIds));
                                        } else {
                                          setSelectedCountriesForUnmatch(new Set());
                                        }
                                      } else {
                                        const currentSelection = selectedCountriesInGroup[groupName] || new Set();
                                        if (e.target.checked) {
                                          setSelectedCountriesInGroup(prev => ({
                                            ...prev,
                                            [groupName]: new Set(allIds)
                                          }));
                                        } else {
                                          setSelectedCountriesInGroup(prev => ({
                                            ...prev,
                                            [groupName]: new Set()
                                          }));
                                        }
                                      }
                                    }}
                                    checked={
                                      unmatchSelectionMode === groupName
                                        ? selectedCountriesForUnmatch.size === countries.length && countries.length > 0
                                        : (selectedCountriesInGroup[groupName]?.size || 0) === countries.length && countries.length > 0
                                    }
                                  />
                                </th>
                              )}
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Supplier
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Name Variation
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Code
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {countries.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                {/* Checkbox Column */}
                                {(groupSelectionMode[groupName] || batchSelectionMode || unmatchSelectionMode === groupName) && (
                                  <td className="px-4 py-4">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      onChange={() => {
                                        if (unmatchSelectionMode === groupName) {
                                          handleUnmatchCheckboxChange(item.id);
                                        } else if (batchSelectionMode) {
                                          handleBatchCheckboxChange(groupName, item.id);
                                        } else {
                                          handleCountryCheckboxChange(groupName, item.id);
                                        }
                                      }}
                                      checked={
                                        unmatchSelectionMode === groupName
                                          ? selectedCountriesForUnmatch.has(item.id)
                                          : (selectedCountriesInGroup[groupName]?.has(item.id) || false)
                                      }
                                    />
                                  </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.supplierName}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 ml-2">ID: {item.supplierCountryId}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-white">{item.countryName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                                    {item.countryCode || 'N/A'}
                                  </span>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedCountry(item);
                                        setShowMappingModal(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                      title="Edit country mapping"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleViewCountry(item)}
                                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                      title="View country details"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleMoveClick(item)}
                                      className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                      title="Move to another master country"
                                    >
                                      <ArrowRightLeft className="h-4 w-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteClick(item)}
                                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                      title="Delete country"
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
                    </div>
                  )}
                </div>
              );
            })}
            
            {Object.keys(groupCountriesByName(filteredData)).length === 0 && (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No country data found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or fetch data from suppliers</p>
              </div>
            )}
          </div>
        ) : (
          // Grouped by Continent view
          <div className="overflow-x-auto">
            {Object.entries(groupedData).map(([continentName, items]) => (
              <div key={continentName} className="mb-6 last:mb-0">
                {/* Continent Header */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 px-6 py-4 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Map className="h-5 w-5 text-green-500" />
                        {continentName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {items.length} {items.length === 1 ? 'record' : 'records'} from {new Set(items.map(i => i.supplierName)).size} {new Set(items.map(i => i.supplierName)).size === 1 ? 'supplier' : 'suppliers'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {items.some(i => i.status === 'mapped') && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                          {items.filter(i => i.status === 'mapped').length} Mapped
                        </span>
                      )}
                      {items.some(i => i.status === 'pending') && (
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium">
                          {items.filter(i => i.status === 'pending').length} Pending
                        </span>
                      )}
                      {items.some(i => i.status === 'review') && (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm font-medium">
                          {items.filter(i => i.status === 'review').length} Review
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Continent Table */}
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Country Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Currency
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
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.supplierName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 ml-2">ID: {item.supplierCountryId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{item.countryName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                            {item.countryCode || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.currency || 'N/A'}
                          </span>
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
                                setSelectedCountry(item);
                                setShowMappingModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit country mapping"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleViewCountry(item)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="View country details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleMoveClick(item)}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                              title="Move to another master country"
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(item)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete country"
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
            ))}
            
            {Object.keys(groupedData).length === 0 && (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No country data found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or fetch data from suppliers</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Master Countries */}
      <div className="card-modern p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Master Countries ({masterCountries.length})
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ISO 3166-1 Standard
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {masterCountries.map((master) => {
            // Calculate real-time mapped count and suppliers
            const mappedCountries = countryData.filter(c => 
              c.masterId === master.id || 
              (c.countryCode && c.countryCode.toUpperCase() === master.iso2Code) ||
              (c.countryCode && c.countryCode.toUpperCase() === master.iso3Code) ||
              (c.countryName.toLowerCase() === master.name.toLowerCase())
            );
            
            const actualMappedCount = mappedCountries.filter(c => c.status === 'mapped').length;
            const uniqueSuppliers = Array.from(new Set(mappedCountries.map(c => c.supplierId)));
            
            return (
              <div key={master.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" title={master.name}>
                      {master.iso2Code ? `${String.fromCodePoint(0x1F1E6 - 65 + master.iso2Code.charCodeAt(0))}${String.fromCodePoint(0x1F1E6 - 65 + master.iso2Code.charCodeAt(1))}` : '🌍'}
                    </span>
                    <h3 className="font-medium text-gray-900 dark:text-white">{master.name}</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {master.iso2Code}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {master.iso3Code}
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="text-gray-600 dark:text-gray-400">
                      💰 {master.currency}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      🌍 {master.continent}
                    </p>
                    {master.region && (
                      <p className="text-gray-600 dark:text-gray-400">
                        📍 {master.region}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">
                      📊 {actualMappedCount} mapped
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      🏢 {uniqueSuppliers.length} suppliers
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============ UNMATCH CONFIRMATION MODAL ============ */}
      {showUnmatchConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header - Red Gradient */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Confirm Unmatch</h2>
                  <p className="text-red-100 text-sm mt-1">
                    Remove selected countries from their current match
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Important Notice - Master ID Preservation */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Important: Master ID Preservation
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      The Master ID will <strong>NOT</strong> be deleted. Only the status will change to "pending".
                      This allows for easy re-matching if needed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Countries List */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-red-500" />
                  Countries to Unmatch ({selectedCountriesForUnmatch.size})
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {Array.from(selectedCountriesForUnmatch).map(countryId => {
                      const country = countryData.find(c => c.id === countryId);
                      if (!country) return null;
                      
                      return (
                        <div 
                          key={countryId}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {country.countryName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {country.supplierName} • Code: {country.countryCode || 'N/A'}
                              </p>
                            </div>
                          </div>
                          {country.masterId && (
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-mono">
                              {country.masterId}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {(() => {
                const selectedCountries = countryData.filter(c => selectedCountriesForUnmatch.has(c.id));
                const warnings = detectWarnings(selectedCountries);
                
                if (warnings.length > 0) {
                  return (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Warnings
                      </h4>
                      <ul className="space-y-1">
                        {warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Action Summary */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What will happen:</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>{selectedCountriesForUnmatch.size}</strong> countries will be unmatched</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Status will change to <strong>pending</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Master ID will be <strong>preserved</strong> (not deleted)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>You can re-match these countries later if needed</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
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
            {/* Modal Header - Green Gradient */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Confirm Match</h2>
                  <p className="text-green-100 text-sm mt-1">
                    Review and confirm the countries match
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Match Summary */}
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
                    <p className="text-green-700 dark:text-green-300">Countries to Match:</p>
                    <p className="font-semibold text-green-900 dark:text-green-100">{pendingMatchData.countries.length}</p>
                  </div>
                </div>
              </div>

              {/* Countries List */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-500" />
                  Countries ({pendingMatchData.countries.length})
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {pendingMatchData.countries.map(country => (
                      <div 
                        key={country.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {country.countryName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {country.supplierName} • Code: {country.countryCode || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          country.status === 'mapped' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                          'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                        }`}>
                          {country.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Warnings */}
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

            {/* Modal Actions */}
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
                  // Here would be the actual match processing logic
                  const newMasterId = generateMasterId();
                  
                  setCountryData(prevData => 
                    prevData.map(country => {
                      if (pendingMatchData.countries.some(c => c.id === country.id)) {
                        return {
                          ...country,
                          masterId: newMasterId,
                          status: 'mapped' as const
                        };
                      }
                      return country;
                    })
                  );

                  // Reset states
                  setShowMatchConfirmModal(false);
                  setPendingMatchData(null);
                  setGroupSelectionMode({});
                  setSelectedCountriesInGroup({});
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

      {/* ============ VIEW COUNTRY MODAL ============ */}
      {showViewModal && selectedCountry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-8 py-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Eye className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Country Details</h2>
                  <p className="text-white/90 text-sm mt-1">Complete information</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Basic Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Country Name</p>
                    <p className="text-blue-900 dark:text-blue-100 font-semibold mt-1">{selectedCountry.countryName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Country Code</p>
                    <p className="text-blue-900 dark:text-blue-100 font-mono font-semibold mt-1">{selectedCountry.countryCode || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Currency</p>
                    <p className="text-blue-900 dark:text-blue-100 font-semibold mt-1">{selectedCountry.currency || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Continent</p>
                    <p className="text-blue-900 dark:text-blue-100 font-semibold mt-1">{selectedCountry.continent || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Supplier Info */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-4">Supplier Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Supplier Name</p>
                    <p className="text-purple-900 dark:text-purple-100 font-semibold mt-1">{selectedCountry.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Supplier Country ID</p>
                    <p className="text-purple-900 dark:text-purple-100 font-mono font-semibold mt-1">{selectedCountry.supplierCountryId}</p>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 border-l-4 border-gray-500 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Status Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Status</p>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded mt-1 ${
                      selectedCountry.status === 'mapped' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      selectedCountry.status === 'pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedCountry.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Confidence</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">
                      {selectedCountry.confidence ? `${selectedCountry.confidence}%` : 'N/A'}
                    </p>
                  </div>
                  {selectedCountry.masterId && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Master ID</p>
                      <p className="text-gray-900 dark:text-gray-100 font-mono font-semibold mt-1">{selectedCountry.masterId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-6 rounded-lg">
                <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-4">Timestamps</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Created At</p>
                    <p className="text-indigo-900 dark:text-indigo-100 text-sm mt-1">{new Date(selectedCountry.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Updated At</p>
                    <p className="text-indigo-900 dark:text-indigo-100 text-sm mt-1">{new Date(selectedCountry.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCountry(null);
                }}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setShowMappingModal(true);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      {showDeleteConfirmModal && countryToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white px-8 py-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Confirm Deletion</h2>
                  <p className="text-white/90 text-sm mt-1">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-lg mb-6">
                <p className="text-red-800 dark:text-red-200 mb-4">
                  Are you sure you want to delete this country record?
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-700 dark:text-red-300">Country:</span>
                    <span className="text-red-900 dark:text-red-100">{countryToDelete.countryName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-700 dark:text-red-300">Supplier:</span>
                    <span className="text-red-900 dark:text-red-100">{countryToDelete.supplierName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-700 dark:text-red-300">Code:</span>
                    <span className="text-red-900 dark:text-red-100">{countryToDelete.countryCode || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> Deleting this country will remove it from the system permanently. 
                    If it's mapped to a Master ID, the mapping will also be removed.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setCountryToDelete(null);
                }}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MOVE COUNTRY MODAL ============ */}
      {showMoveModal && countryToMove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white px-8 py-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Move Country</h2>
                  <p className="text-white/90 text-sm mt-1">Select the correct master country</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Current Info */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Currently Incorrect Placement
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-orange-700 dark:text-orange-300">Country:</span>
                    <span className="text-orange-900 dark:text-orange-100 font-medium">{countryToMove.countryName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-orange-700 dark:text-orange-300">Supplier:</span>
                    <span className="text-orange-900 dark:text-orange-100">{countryToMove.supplierName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-orange-700 dark:text-orange-300">Code:</span>
                    <span className="text-orange-900 dark:text-orange-100 font-mono">{countryToMove.countryCode || 'N/A'}</span>
                  </div>
                  {countryToMove.masterId && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-700 dark:text-orange-300">Current Master:</span>
                      <span className="text-orange-900 dark:text-orange-100 font-mono">
                        {masterCountries.find(m => m.id === countryToMove.masterId)?.name || countryToMove.masterId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Select New Master */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Select Correct Master Country
                </h3>
                
                {/* Search Filter */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search master countries..."
                    className="w-full px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => {
                      const searchValue = e.target.value.toLowerCase();
                      const filteredMasters = document.querySelectorAll('.master-country-option');
                      filteredMasters.forEach((el) => {
                        const text = el.textContent?.toLowerCase() || '';
                        (el as HTMLElement).style.display = text.includes(searchValue) ? 'flex' : 'none';
                      });
                    }}
                  />
                </div>

                {/* Masters Grid */}
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                  {masterCountries
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((master) => {
                      const isSelected = selectedTargetMaster === master.id;
                      const isCurrent = countryToMove.masterId === master.id;

                      return (
                        <div
                          key={master.id}
                          className={`master-country-option flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/40 shadow-md' 
                              : isCurrent
                              ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 opacity-60'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          } ${isCurrent ? 'cursor-not-allowed' : ''}`}
                          onClick={() => !isCurrent && setSelectedTargetMaster(master.id)}
                        >
                          <div className="flex-shrink-0">
                            {isSelected && (
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                            {!isSelected && (
                              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                                {master.name}
                              </span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 text-xs font-semibold bg-orange-500 text-white rounded">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-mono">{master.iso2Code} / {master.iso3Code}</span>
                              <span>•</span>
                              <span>{master.currency}</span>
                              <span>•</span>
                              <span>{master.continent}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Help Text */}
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-4 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Note:</strong> Moving this country will update its master mapping and change its status to "mapped". 
                    This helps correct misplaced countries and maintain accurate data organization.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 rounded-b-2xl flex justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setCountryToMove(null);
                  setSelectedTargetMaster('');
                }}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveConfirm}
                disabled={!selectedTargetMaster || selectedTargetMaster === countryToMove.masterId}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Move Country
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryTab;