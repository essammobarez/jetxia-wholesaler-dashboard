'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Eye, Edit, Trash2, Download, RefreshCw, Check, AlertCircle, Globe, ChevronDown, ChevronUp, ArrowRightLeft } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  apiEndpoint: string;
  active: boolean;
}

interface NationalityData {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierNationalityId: string;
  nationalityName: string;
  nationalityCode?: string;
  countryName?: string;
  countryCode?: string;
  masterId?: string;
  status: 'pending' | 'mapped' | 'review';
  confidence?: number;
  createdAt: string;
  updatedAt: string;
}

interface MasterNationality {
  id: string;
  name: string;
  code: string;
  standardCode: string; // ISO code
  alternativeNames?: string[];
  mappedCount: number;
  suppliers: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const NationalityTab = () => {
  const [nationalityData, setNationalityData] = useState<NationalityData[]>([]);
  const [masterNationalities, setMasterNationalities] = useState<MasterNationality[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'mapped' | 'review'>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [showCreateMaster, setShowCreateMaster] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedNationality, setSelectedNationality] = useState<NationalityData | null>(null);
  const [isUpdatingSuppliers, setIsUpdatingSuppliers] = useState(false);
  
  // Match & Unmatch States
  const [autoMatchResults, setAutoMatchResults] = useState<{
    success: number;
    warnings: Array<{
      groupName: string;
      nationalities: NationalityData[];
      issues: string[];
    }>;
  }>({ success: 0, warnings: [] });
  const [isMatching, setIsMatching] = useState(false);
  const [showManualMatchModal, setShowManualMatchModal] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [groupSelectionMode, setGroupSelectionMode] = useState<{ [groupName: string]: boolean }>({});
  const [selectedNationalitiesInGroup, setSelectedNationalitiesInGroup] = useState<{ [groupName: string]: Set<string> }>({});
  const [batchSelectionMode, setBatchSelectionMode] = useState(false);
  const [unmatchSelectionMode, setUnmatchSelectionMode] = useState<string | null>(null);
  const [selectedNationalitiesForUnmatch, setSelectedNationalitiesForUnmatch] = useState<Set<string>>(new Set());
  const [showUnmatchConfirmModal, setShowUnmatchConfirmModal] = useState(false);
  const [showMatchConfirmModal, setShowMatchConfirmModal] = useState(false);
  const [pendingMatchData, setPendingMatchData] = useState<{
    groupName: string;
    nationalities: NationalityData[];
    warnings: string[];
  } | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<{ [groupName: string]: boolean }>({});
  
  // Action Modals States
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [nationalityToDelete, setNationalityToDelete] = useState<NationalityData | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [nationalityToMove, setNationalityToMove] = useState<NationalityData | null>(null);
  const [selectedTargetMaster, setSelectedTargetMaster] = useState<string>('');

  // Mock suppliers data
  const mockSuppliers: Supplier[] = [
    { id: 'ebooking', name: 'eBooking', apiEndpoint: '/api/suppliers/ebooking/nationalities', active: true },
    { id: 'iwtx', name: 'IWTX', apiEndpoint: '/api/suppliers/iwtx/nationalities', active: true },
    { id: 'amadeus', name: 'Amadeus', apiEndpoint: '/api/suppliers/amadeus/nationalities', active: true },
    { id: 'sabre', name: 'Sabre', apiEndpoint: '/api/suppliers/sabre/nationalities', active: true },
    { id: 'expedia', name: 'Expedia', apiEndpoint: '/api/suppliers/expedia/nationalities', active: true }
  ];

  // Mock nationalities data from different suppliers
  const mockNationalityData: NationalityData[] = [
    // Egyptian Nationality from all suppliers
    {
      id: '1',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierNationalityId: 'EG_001',
      nationalityName: 'Egyptian',
      nationalityCode: 'EG',
      countryName: 'Egypt',
      countryCode: 'EG',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierNationalityId: 'EGY_001',
      nationalityName: 'Egypt',
      nationalityCode: 'EGY',
      countryName: 'Egypt',
      countryCode: 'EG',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierNationalityId: 'EGYPT_NAT',
      nationalityName: 'Egyptian National',
      nationalityCode: 'EG',
      countryName: 'Egypt',
      countryCode: 'EG',
      masterId: 'master_001',
      status: 'mapped',
      confidence: 98,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '4',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierNationalityId: 'SAB_EG',
      nationalityName: 'Egyptian',
      nationalityCode: 'EG',
      countryName: 'Egypt',
      countryCode: 'EG',
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '5',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierNationalityId: 'BOOK_EG',
      nationalityName: 'Egyptian',
      nationalityCode: 'EG',
      countryName: 'Egypt',
      countryCode: 'EG',
      masterId: 'master_001',
      status: 'mapped',
      confidence: 96,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },

    // American Nationality from all suppliers
    {
      id: '6',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierNationalityId: 'US_001',
      nationalityName: 'American',
      nationalityCode: 'US',
      countryName: 'United States',
      countryCode: 'US',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '7',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierNationalityId: 'USA_001',
      nationalityName: 'USA',
      nationalityCode: 'USA',
      countryName: 'United States of America',
      countryCode: 'US',
      masterId: 'master_002',
      status: 'mapped',
      confidence: 95,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '8',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierNationalityId: 'US_AMADEUS',
      nationalityName: 'United States Citizen',
      nationalityCode: 'US',
      countryName: 'United States',
      countryCode: 'US',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '9',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierNationalityId: 'SAB_US',
      nationalityName: 'American',
      nationalityCode: 'US',
      countryName: 'USA',
      countryCode: 'US',
      masterId: 'master_002',
      status: 'mapped',
      confidence: 99,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '10',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierNationalityId: 'BOOK_US',
      nationalityName: 'American',
      nationalityCode: 'US',
      countryName: 'United States',
      countryCode: 'US',
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },

    // British Nationality from all suppliers
    {
      id: '11',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierNationalityId: 'GB_001',
      nationalityName: 'British',
      nationalityCode: 'GB',
      countryName: 'United Kingdom',
      countryCode: 'GB',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '12',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierNationalityId: 'UK_001',
      nationalityName: 'UK Citizen',
      nationalityCode: 'UK',
      countryName: 'United Kingdom',
      countryCode: 'GB',
      masterId: 'master_003',
      status: 'mapped',
      confidence: 97,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '13',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierNationalityId: 'GB_AMADEUS',
      nationalityName: 'British National',
      nationalityCode: 'GB',
      countryName: 'UK',
      countryCode: 'GB',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '14',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierNationalityId: 'SAB_GB',
      nationalityName: 'British',
      nationalityCode: 'GB',
      countryName: 'United Kingdom',
      countryCode: 'GB',
      masterId: 'master_003',
      status: 'mapped',
      confidence: 98,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '15',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierNationalityId: 'BOOK_GB',
      nationalityName: 'British',
      nationalityCode: 'GB',
      countryName: 'UK',
      countryCode: 'GB',
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },

    // German Nationality from all suppliers
    {
      id: '16',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierNationalityId: 'DE_001',
      nationalityName: 'German',
      nationalityCode: 'DE',
      countryName: 'Germany',
      countryCode: 'DE',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '17',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierNationalityId: 'DEU_001',
      nationalityName: 'Deutschland',
      nationalityCode: 'DEU',
      countryName: 'Germany',
      countryCode: 'DE',
      masterId: 'master_004',
      status: 'mapped',
      confidence: 93,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '18',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierNationalityId: 'DE_AMADEUS',
      nationalityName: 'German',
      nationalityCode: 'DE',
      countryName: 'Germany',
      countryCode: 'DE',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '19',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierNationalityId: 'SAB_DE',
      nationalityName: 'German',
      nationalityCode: 'DE',
      countryName: 'Germany',
      countryCode: 'DE',
      masterId: 'master_004',
      status: 'mapped',
      confidence: 99,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '20',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierNationalityId: 'BOOK_DE',
      nationalityName: 'German',
      nationalityCode: 'DE',
      countryName: 'Germany',
      countryCode: 'DE',
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },

    // French Nationality from all suppliers
    {
      id: '21',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierNationalityId: 'FR_001',
      nationalityName: 'French',
      nationalityCode: 'FR',
      countryName: 'France',
      countryCode: 'FR',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '22',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierNationalityId: 'FRA_001',
      nationalityName: 'Français',
      nationalityCode: 'FRA',
      countryName: 'France',
      countryCode: 'FR',
      masterId: 'master_005',
      status: 'mapped',
      confidence: 91,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '23',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierNationalityId: 'FR_AMADEUS',
      nationalityName: 'French',
      nationalityCode: 'FR',
      countryName: 'France',
      countryCode: 'FR',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '24',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierNationalityId: 'SAB_FR',
      nationalityName: 'French',
      nationalityCode: 'FR',
      countryName: 'France',
      countryCode: 'FR',
      masterId: 'master_005',
      status: 'mapped',
      confidence: 98,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '25',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierNationalityId: 'BOOK_FR',
      nationalityName: 'French',
      nationalityCode: 'FR',
      countryName: 'France',
      countryCode: 'FR',
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },

    // Canadian Nationality from all suppliers
    {
      id: '26',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierNationalityId: 'CA_001',
      nationalityName: 'Canadian',
      nationalityCode: 'CA',
      countryName: 'Canada',
      countryCode: 'CA',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '27',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierNationalityId: 'CAN_001',
      nationalityName: 'Canada',
      nationalityCode: 'CAN',
      countryName: 'Canada',
      countryCode: 'CA',
      masterId: 'master_006',
      status: 'mapped',
      confidence: 94,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '28',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierNationalityId: 'CA_AMADEUS',
      nationalityName: 'Canadian',
      nationalityCode: 'CA',
      countryName: 'Canada',
      countryCode: 'CA',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '29',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierNationalityId: 'SAB_CA',
      nationalityName: 'Canadian',
      nationalityCode: 'CA',
      countryName: 'Canada',
      countryCode: 'CA',
      masterId: 'master_006',
      status: 'mapped',
      confidence: 97,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '30',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierNationalityId: 'BOOK_CA',
      nationalityName: 'Canadian',
      nationalityCode: 'CA',
      countryName: 'Canada',
      countryCode: 'CA',
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },

    // Australian Nationality from all suppliers
    {
      id: '31',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierNationalityId: 'AU_001',
      nationalityName: 'Australian',
      nationalityCode: 'AU',
      countryName: 'Australia',
      countryCode: 'AU',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '32',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierNationalityId: 'AUS_001',
      nationalityName: 'Aussie',
      nationalityCode: 'AUS',
      countryName: 'Australia',
      countryCode: 'AU',
      masterId: 'master_007',
      status: 'mapped',
      confidence: 90,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '33',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierNationalityId: 'AU_AMADEUS',
      nationalityName: 'Australian',
      nationalityCode: 'AU',
      countryName: 'Australia',
      countryCode: 'AU',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '34',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierNationalityId: 'SAB_AU',
      nationalityName: 'Australian',
      nationalityCode: 'AU',
      countryName: 'Australia',
      countryCode: 'AU',
      masterId: 'master_007',
      status: 'mapped',
      confidence: 96,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '35',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierNationalityId: 'BOOK_AU',
      nationalityName: 'Australian',
      nationalityCode: 'AU',
      countryName: 'Australia',
      countryCode: 'AU',
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },

    // Japanese Nationality from all suppliers
    {
      id: '36',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierNationalityId: 'JP_001',
      nationalityName: 'Japanese',
      nationalityCode: 'JP',
      countryName: 'Japan',
      countryCode: 'JP',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '37',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierNationalityId: 'JPN_001',
      nationalityName: 'Japan',
      nationalityCode: 'JPN',
      countryName: 'Japan',
      countryCode: 'JP',
      masterId: 'master_008',
      status: 'mapped',
      confidence: 92,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '38',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierNationalityId: 'JP_AMADEUS',
      nationalityName: 'Japanese',
      nationalityCode: 'JP',
      countryName: 'Japan',
      countryCode: 'JP',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '39',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierNationalityId: 'SAB_JP',
      nationalityName: 'Japanese',
      nationalityCode: 'JP',
      countryName: 'Japan',
      countryCode: 'JP',
      masterId: 'master_008',
      status: 'mapped',
      confidence: 98,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '40',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierNationalityId: 'BOOK_JP',
      nationalityName: 'Japanese',
      nationalityCode: 'JP',
      countryName: 'Japan',
      countryCode: 'JP',
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },

    // Chinese Nationality from all suppliers
    {
      id: '41',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierNationalityId: 'CN_001',
      nationalityName: 'Chinese',
      nationalityCode: 'CN',
      countryName: 'China',
      countryCode: 'CN',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '42',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierNationalityId: 'CHN_001',
      nationalityName: 'China',
      nationalityCode: 'CHN',
      countryName: 'People Republic of China',
      countryCode: 'CN',
      masterId: 'master_009',
      status: 'mapped',
      confidence: 89,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '43',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierNationalityId: 'CN_AMADEUS',
      nationalityName: 'Chinese',
      nationalityCode: 'CN',
      countryName: 'China',
      countryCode: 'CN',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '44',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierNationalityId: 'SAB_CN',
      nationalityName: 'Chinese',
      nationalityCode: 'CN',
      countryName: 'China',
      countryCode: 'CN',
      masterId: 'master_009',
      status: 'mapped',
      confidence: 97,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '45',
      supplierId: 'booking',
      supplierName: 'Booking.com',
      supplierNationalityId: 'BOOK_CN',
      nationalityName: 'Chinese',
      nationalityCode: 'CN',
      countryName: 'China',
      countryCode: 'CN',
      status: 'review',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },

    // Indian Nationality from 4 suppliers
    {
      id: '46',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierNationalityId: 'IN_001',
      nationalityName: 'Indian',
      nationalityCode: 'IN',
      countryName: 'India',
      countryCode: 'IN',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '47',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierNationalityId: 'IND_001',
      nationalityName: 'India',
      nationalityCode: 'IND',
      countryName: 'India',
      countryCode: 'IN',
      masterId: 'master_010',
      status: 'mapped',
      confidence: 88,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '48',
      supplierId: 'amadeus',
      supplierName: 'Amadeus',
      supplierNationalityId: 'IN_AMADEUS',
      nationalityName: 'Indian',
      nationalityCode: 'IN',
      countryName: 'India',
      countryCode: 'IN',
      status: 'pending',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '49',
      supplierId: 'sabre',
      supplierName: 'Sabre',
      supplierNationalityId: 'SAB_IN',
      nationalityName: 'Indian',
      nationalityCode: 'IN',
      countryName: 'India',
      countryCode: 'IN',
      masterId: 'master_010',
      status: 'mapped',
      confidence: 96,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  // Mock master nationalities
  const mockMasterNationalityData: MasterNationality[] = [
    {
      id: 'master_001',
      name: 'Egyptian',
      code: 'EG',
      standardCode: 'EG',
      alternativeNames: ['Egypt', 'Egyption'],
      mappedCount: 3,
      suppliers: ['amadeus', 'ebooking', 'iwtx'],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_002',
      name: 'American',
      code: 'US',
      standardCode: 'US',
      alternativeNames: ['USA', 'United States', 'US Citizen'],
      mappedCount: 2,
      suppliers: ['amadeus', 'sabre'],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_003',
      name: 'British',
      code: 'GB',
      standardCode: 'GB',
      alternativeNames: ['UK', 'United Kingdom', 'UK Citizen'],
      mappedCount: 2,
      suppliers: ['amadeus', 'sabre'],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_004',
      name: 'German',
      code: 'DE',
      standardCode: 'DE',
      alternativeNames: ['Germany', 'Deutschland'],
      mappedCount: 2,
      suppliers: ['amadeus', 'sabre'],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_005',
      name: 'French',
      code: 'FR',
      standardCode: 'FR',
      alternativeNames: ['France', 'Français'],
      mappedCount: 2,
      suppliers: ['amadeus', 'sabre'],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_006',
      name: 'Canadian',
      code: 'CA',
      standardCode: 'CA',
      alternativeNames: ['Canada'],
      mappedCount: 2,
      suppliers: ['amadeus', 'sabre'],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_007',
      name: 'Australian',
      code: 'AU',
      standardCode: 'AU',
      alternativeNames: ['Australia', 'Aussie'],
      mappedCount: 2,
      suppliers: ['amadeus', 'sabre'],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_008',
      name: 'Japanese',
      code: 'JP',
      standardCode: 'JP',
      alternativeNames: ['Japan'],
      mappedCount: 2,
      suppliers: ['amadeus', 'sabre'],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_009',
      name: 'Chinese',
      code: 'CN',
      standardCode: 'CN',
      alternativeNames: ['China', 'People Republic of China'],
      mappedCount: 2,
      suppliers: ['amadeus', 'sabre'],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_010',
      name: 'Indian',
      code: 'IN',
      standardCode: 'IN',
      alternativeNames: ['India'],
      mappedCount: 2,
      suppliers: ['amadeus', 'sabre'],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_011',
      name: 'Italian',
      code: 'IT',
      standardCode: 'IT',
      alternativeNames: ['Italy', 'Italia'],
      mappedCount: 0,
      suppliers: [],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_012',
      name: 'Spanish',
      code: 'ES',
      standardCode: 'ES',
      alternativeNames: ['Spain', 'España'],
      mappedCount: 0,
      suppliers: [],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_013',
      name: 'Dutch',
      code: 'NL',
      standardCode: 'NL',
      alternativeNames: ['Netherlands', 'Holland'],
      mappedCount: 0,
      suppliers: [],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_014',
      name: 'Brazilian',
      code: 'BR',
      standardCode: 'BR',
      alternativeNames: ['Brazil', 'Brasil'],
      mappedCount: 0,
      suppliers: [],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'master_015',
      name: 'Russian',
      code: 'RU',
      standardCode: 'RU',
      alternativeNames: ['Russia', 'Russian Federation'],
      mappedCount: 0,
      suppliers: [],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  // Generate unique Master ID
  const generateMasterId = () => {
    const existingMasterIds = nationalityData
      .filter(n => n.masterId && n.masterId.startsWith('JETIXIA_NAT_'))
      .map(n => n.masterId!);
    
    const numbers = existingMasterIds
      .map(id => parseInt(id.replace('JETIXIA_NAT_', '')))
      .filter(num => !isNaN(num));
    
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    const paddedNumber = nextNumber.toString().padStart(5, '0');
    
    return `JETIXIA_NAT_${paddedNumber}`;
  };

  // ============ WORLD NATIONALITIES MASTER LIST (ISO 3166-1) ============
  const WORLD_NATIONALITIES_ISO: Array<{
    nationalityName: string;
    countryName: string;
    isoCode: string;
    alpha3Code: string;
    alternativeNames: string[];
  }> = [
    // A
    { nationalityName: 'Afghan', countryName: 'Afghanistan', isoCode: 'AF', alpha3Code: 'AFG', alternativeNames: ['Afghani'] },
    { nationalityName: 'Albanian', countryName: 'Albania', isoCode: 'AL', alpha3Code: 'ALB', alternativeNames: [] },
    { nationalityName: 'Algerian', countryName: 'Algeria', isoCode: 'DZ', alpha3Code: 'DZA', alternativeNames: [] },
    { nationalityName: 'American', countryName: 'United States', isoCode: 'US', alpha3Code: 'USA', alternativeNames: ['USA', 'US Citizen'] },
    { nationalityName: 'Andorran', countryName: 'Andorra', isoCode: 'AD', alpha3Code: 'AND', alternativeNames: [] },
    { nationalityName: 'Angolan', countryName: 'Angola', isoCode: 'AO', alpha3Code: 'AGO', alternativeNames: [] },
    { nationalityName: 'Argentinian', countryName: 'Argentina', isoCode: 'AR', alpha3Code: 'ARG', alternativeNames: ['Argentine'] },
    { nationalityName: 'Armenian', countryName: 'Armenia', isoCode: 'AM', alpha3Code: 'ARM', alternativeNames: [] },
    { nationalityName: 'Australian', countryName: 'Australia', isoCode: 'AU', alpha3Code: 'AUS', alternativeNames: ['Aussie'] },
    { nationalityName: 'Austrian', countryName: 'Austria', isoCode: 'AT', alpha3Code: 'AUT', alternativeNames: [] },
    { nationalityName: 'Azerbaijani', countryName: 'Azerbaijan', isoCode: 'AZ', alpha3Code: 'AZE', alternativeNames: ['Azeri'] },
    
    // B
    { nationalityName: 'Bahamian', countryName: 'Bahamas', isoCode: 'BS', alpha3Code: 'BHS', alternativeNames: [] },
    { nationalityName: 'Bahraini', countryName: 'Bahrain', isoCode: 'BH', alpha3Code: 'BHR', alternativeNames: [] },
    { nationalityName: 'Bangladeshi', countryName: 'Bangladesh', isoCode: 'BD', alpha3Code: 'BGD', alternativeNames: [] },
    { nationalityName: 'Barbadian', countryName: 'Barbados', isoCode: 'BB', alpha3Code: 'BRB', alternativeNames: ['Bajan'] },
    { nationalityName: 'Belarusian', countryName: 'Belarus', isoCode: 'BY', alpha3Code: 'BLR', alternativeNames: [] },
    { nationalityName: 'Belgian', countryName: 'Belgium', isoCode: 'BE', alpha3Code: 'BEL', alternativeNames: [] },
    { nationalityName: 'Belizean', countryName: 'Belize', isoCode: 'BZ', alpha3Code: 'BLZ', alternativeNames: [] },
    { nationalityName: 'Beninese', countryName: 'Benin', isoCode: 'BJ', alpha3Code: 'BEN', alternativeNames: [] },
    { nationalityName: 'Bhutanese', countryName: 'Bhutan', isoCode: 'BT', alpha3Code: 'BTN', alternativeNames: [] },
    { nationalityName: 'Bolivian', countryName: 'Bolivia', isoCode: 'BO', alpha3Code: 'BOL', alternativeNames: [] },
    { nationalityName: 'Bosnian', countryName: 'Bosnia and Herzegovina', isoCode: 'BA', alpha3Code: 'BIH', alternativeNames: ['Herzegovinian'] },
    { nationalityName: 'Botswanan', countryName: 'Botswana', isoCode: 'BW', alpha3Code: 'BWA', alternativeNames: [] },
    { nationalityName: 'Brazilian', countryName: 'Brazil', isoCode: 'BR', alpha3Code: 'BRA', alternativeNames: [] },
    { nationalityName: 'British', countryName: 'United Kingdom', isoCode: 'GB', alpha3Code: 'GBR', alternativeNames: ['UK', 'English', 'Scottish', 'Welsh', 'Northern Irish'] },
    { nationalityName: 'Bruneian', countryName: 'Brunei', isoCode: 'BN', alpha3Code: 'BRN', alternativeNames: [] },
    { nationalityName: 'Bulgarian', countryName: 'Bulgaria', isoCode: 'BG', alpha3Code: 'BGR', alternativeNames: [] },
    { nationalityName: 'Burkinabe', countryName: 'Burkina Faso', isoCode: 'BF', alpha3Code: 'BFA', alternativeNames: [] },
    { nationalityName: 'Burmese', countryName: 'Myanmar', isoCode: 'MM', alpha3Code: 'MMR', alternativeNames: ['Myanmar'] },
    { nationalityName: 'Burundian', countryName: 'Burundi', isoCode: 'BI', alpha3Code: 'BDI', alternativeNames: [] },
    
    // C
    { nationalityName: 'Cambodian', countryName: 'Cambodia', isoCode: 'KH', alpha3Code: 'KHM', alternativeNames: ['Khmer'] },
    { nationalityName: 'Cameroonian', countryName: 'Cameroon', isoCode: 'CM', alpha3Code: 'CMR', alternativeNames: [] },
    { nationalityName: 'Canadian', countryName: 'Canada', isoCode: 'CA', alpha3Code: 'CAN', alternativeNames: [] },
    { nationalityName: 'Cape Verdean', countryName: 'Cape Verde', isoCode: 'CV', alpha3Code: 'CPV', alternativeNames: [] },
    { nationalityName: 'Central African', countryName: 'Central African Republic', isoCode: 'CF', alpha3Code: 'CAF', alternativeNames: [] },
    { nationalityName: 'Chadian', countryName: 'Chad', isoCode: 'TD', alpha3Code: 'TCD', alternativeNames: [] },
    { nationalityName: 'Chilean', countryName: 'Chile', isoCode: 'CL', alpha3Code: 'CHL', alternativeNames: [] },
    { nationalityName: 'Chinese', countryName: 'China', isoCode: 'CN', alpha3Code: 'CHN', alternativeNames: ['China'] },
    { nationalityName: 'Colombian', countryName: 'Colombia', isoCode: 'CO', alpha3Code: 'COL', alternativeNames: [] },
    { nationalityName: 'Comorian', countryName: 'Comoros', isoCode: 'KM', alpha3Code: 'COM', alternativeNames: [] },
    { nationalityName: 'Congolese', countryName: 'Congo', isoCode: 'CG', alpha3Code: 'COG', alternativeNames: [] },
    { nationalityName: 'Costa Rican', countryName: 'Costa Rica', isoCode: 'CR', alpha3Code: 'CRI', alternativeNames: [] },
    { nationalityName: 'Croatian', countryName: 'Croatia', isoCode: 'HR', alpha3Code: 'HRV', alternativeNames: [] },
    { nationalityName: 'Cuban', countryName: 'Cuba', isoCode: 'CU', alpha3Code: 'CUB', alternativeNames: [] },
    { nationalityName: 'Cypriot', countryName: 'Cyprus', isoCode: 'CY', alpha3Code: 'CYP', alternativeNames: [] },
    { nationalityName: 'Czech', countryName: 'Czech Republic', isoCode: 'CZ', alpha3Code: 'CZE', alternativeNames: [] },
    
    // D
    { nationalityName: 'Danish', countryName: 'Denmark', isoCode: 'DK', alpha3Code: 'DNK', alternativeNames: [] },
    { nationalityName: 'Djiboutian', countryName: 'Djibouti', isoCode: 'DJ', alpha3Code: 'DJI', alternativeNames: [] },
    { nationalityName: 'Dominican', countryName: 'Dominican Republic', isoCode: 'DO', alpha3Code: 'DOM', alternativeNames: [] },
    
    // E
    { nationalityName: 'Ecuadorian', countryName: 'Ecuador', isoCode: 'EC', alpha3Code: 'ECU', alternativeNames: [] },
    { nationalityName: 'Egyptian', countryName: 'Egypt', isoCode: 'EG', alpha3Code: 'EGY', alternativeNames: [] },
    { nationalityName: 'Emirati', countryName: 'United Arab Emirates', isoCode: 'AE', alpha3Code: 'ARE', alternativeNames: ['UAE'] },
    { nationalityName: 'Equatorial Guinean', countryName: 'Equatorial Guinea', isoCode: 'GQ', alpha3Code: 'GNQ', alternativeNames: [] },
    { nationalityName: 'Eritrean', countryName: 'Eritrea', isoCode: 'ER', alpha3Code: 'ERI', alternativeNames: [] },
    { nationalityName: 'Estonian', countryName: 'Estonia', isoCode: 'EE', alpha3Code: 'EST', alternativeNames: [] },
    { nationalityName: 'Ethiopian', countryName: 'Ethiopia', isoCode: 'ET', alpha3Code: 'ETH', alternativeNames: [] },
    
    // F
    { nationalityName: 'Fijian', countryName: 'Fiji', isoCode: 'FJ', alpha3Code: 'FJI', alternativeNames: [] },
    { nationalityName: 'Filipino', countryName: 'Philippines', isoCode: 'PH', alpha3Code: 'PHL', alternativeNames: ['Philippine'] },
    { nationalityName: 'Finnish', countryName: 'Finland', isoCode: 'FI', alpha3Code: 'FIN', alternativeNames: [] },
    { nationalityName: 'French', countryName: 'France', isoCode: 'FR', alpha3Code: 'FRA', alternativeNames: [] },
    
    // G
    { nationalityName: 'Gabonese', countryName: 'Gabon', isoCode: 'GA', alpha3Code: 'GAB', alternativeNames: [] },
    { nationalityName: 'Gambian', countryName: 'Gambia', isoCode: 'GM', alpha3Code: 'GMB', alternativeNames: [] },
    { nationalityName: 'Georgian', countryName: 'Georgia', isoCode: 'GE', alpha3Code: 'GEO', alternativeNames: [] },
    { nationalityName: 'German', countryName: 'Germany', isoCode: 'DE', alpha3Code: 'DEU', alternativeNames: [] },
    { nationalityName: 'Ghanaian', countryName: 'Ghana', isoCode: 'GH', alpha3Code: 'GHA', alternativeNames: [] },
    { nationalityName: 'Greek', countryName: 'Greece', isoCode: 'GR', alpha3Code: 'GRC', alternativeNames: [] },
    { nationalityName: 'Grenadian', countryName: 'Grenada', isoCode: 'GD', alpha3Code: 'GRD', alternativeNames: [] },
    { nationalityName: 'Guatemalan', countryName: 'Guatemala', isoCode: 'GT', alpha3Code: 'GTM', alternativeNames: [] },
    { nationalityName: 'Guinean', countryName: 'Guinea', isoCode: 'GN', alpha3Code: 'GIN', alternativeNames: [] },
    { nationalityName: 'Guyanese', countryName: 'Guyana', isoCode: 'GY', alpha3Code: 'GUY', alternativeNames: [] },
    
    // H
    { nationalityName: 'Haitian', countryName: 'Haiti', isoCode: 'HT', alpha3Code: 'HTI', alternativeNames: [] },
    { nationalityName: 'Honduran', countryName: 'Honduras', isoCode: 'HN', alpha3Code: 'HND', alternativeNames: [] },
    { nationalityName: 'Hungarian', countryName: 'Hungary', isoCode: 'HU', alpha3Code: 'HUN', alternativeNames: [] },
    
    // I
    { nationalityName: 'Icelandic', countryName: 'Iceland', isoCode: 'IS', alpha3Code: 'ISL', alternativeNames: [] },
    { nationalityName: 'Indian', countryName: 'India', isoCode: 'IN', alpha3Code: 'IND', alternativeNames: [] },
    { nationalityName: 'Indonesian', countryName: 'Indonesia', isoCode: 'ID', alpha3Code: 'IDN', alternativeNames: [] },
    { nationalityName: 'Iranian', countryName: 'Iran', isoCode: 'IR', alpha3Code: 'IRN', alternativeNames: ['Persian'] },
    { nationalityName: 'Iraqi', countryName: 'Iraq', isoCode: 'IQ', alpha3Code: 'IRQ', alternativeNames: [] },
    { nationalityName: 'Irish', countryName: 'Ireland', isoCode: 'IE', alpha3Code: 'IRL', alternativeNames: [] },
    { nationalityName: 'Israeli', countryName: 'Israel', isoCode: 'IL', alpha3Code: 'ISR', alternativeNames: [] },
    { nationalityName: 'Italian', countryName: 'Italy', isoCode: 'IT', alpha3Code: 'ITA', alternativeNames: [] },
    { nationalityName: 'Ivorian', countryName: 'Ivory Coast', isoCode: 'CI', alpha3Code: 'CIV', alternativeNames: [] },
    
    // J
    { nationalityName: 'Jamaican', countryName: 'Jamaica', isoCode: 'JM', alpha3Code: 'JAM', alternativeNames: [] },
    { nationalityName: 'Japanese', countryName: 'Japan', isoCode: 'JP', alpha3Code: 'JPN', alternativeNames: ['Japan'] },
    { nationalityName: 'Jordanian', countryName: 'Jordan', isoCode: 'JO', alpha3Code: 'JOR', alternativeNames: [] },
    
    // K
    { nationalityName: 'Kazakh', countryName: 'Kazakhstan', isoCode: 'KZ', alpha3Code: 'KAZ', alternativeNames: ['Kazakhstani'] },
    { nationalityName: 'Kenyan', countryName: 'Kenya', isoCode: 'KE', alpha3Code: 'KEN', alternativeNames: [] },
    { nationalityName: 'Kuwaiti', countryName: 'Kuwait', isoCode: 'KW', alpha3Code: 'KWT', alternativeNames: [] },
    { nationalityName: 'Kyrgyz', countryName: 'Kyrgyzstan', isoCode: 'KG', alpha3Code: 'KGZ', alternativeNames: [] },
    
    // L
    { nationalityName: 'Lao', countryName: 'Laos', isoCode: 'LA', alpha3Code: 'LAO', alternativeNames: ['Laotian'] },
    { nationalityName: 'Latvian', countryName: 'Latvia', isoCode: 'LV', alpha3Code: 'LVA', alternativeNames: [] },
    { nationalityName: 'Lebanese', countryName: 'Lebanon', isoCode: 'LB', alpha3Code: 'LBN', alternativeNames: [] },
    { nationalityName: 'Liberian', countryName: 'Liberia', isoCode: 'LR', alpha3Code: 'LBR', alternativeNames: [] },
    { nationalityName: 'Libyan', countryName: 'Libya', isoCode: 'LY', alpha3Code: 'LBY', alternativeNames: [] },
    { nationalityName: 'Lithuanian', countryName: 'Lithuania', isoCode: 'LT', alpha3Code: 'LTU', alternativeNames: [] },
    { nationalityName: 'Luxembourgish', countryName: 'Luxembourg', isoCode: 'LU', alpha3Code: 'LUX', alternativeNames: [] },
    
    // M
    { nationalityName: 'Macedonian', countryName: 'North Macedonia', isoCode: 'MK', alpha3Code: 'MKD', alternativeNames: [] },
    { nationalityName: 'Malagasy', countryName: 'Madagascar', isoCode: 'MG', alpha3Code: 'MDG', alternativeNames: [] },
    { nationalityName: 'Malawian', countryName: 'Malawi', isoCode: 'MW', alpha3Code: 'MWI', alternativeNames: [] },
    { nationalityName: 'Malaysian', countryName: 'Malaysia', isoCode: 'MY', alpha3Code: 'MYS', alternativeNames: [] },
    { nationalityName: 'Maldivian', countryName: 'Maldives', isoCode: 'MV', alpha3Code: 'MDV', alternativeNames: [] },
    { nationalityName: 'Malian', countryName: 'Mali', isoCode: 'ML', alpha3Code: 'MLI', alternativeNames: [] },
    { nationalityName: 'Maltese', countryName: 'Malta', isoCode: 'MT', alpha3Code: 'MLT', alternativeNames: [] },
    { nationalityName: 'Mauritanian', countryName: 'Mauritania', isoCode: 'MR', alpha3Code: 'MRT', alternativeNames: [] },
    { nationalityName: 'Mauritian', countryName: 'Mauritius', isoCode: 'MU', alpha3Code: 'MUS', alternativeNames: [] },
    { nationalityName: 'Mexican', countryName: 'Mexico', isoCode: 'MX', alpha3Code: 'MEX', alternativeNames: [] },
    { nationalityName: 'Moldovan', countryName: 'Moldova', isoCode: 'MD', alpha3Code: 'MDA', alternativeNames: [] },
    { nationalityName: 'Monegasque', countryName: 'Monaco', isoCode: 'MC', alpha3Code: 'MCO', alternativeNames: [] },
    { nationalityName: 'Mongolian', countryName: 'Mongolia', isoCode: 'MN', alpha3Code: 'MNG', alternativeNames: [] },
    { nationalityName: 'Montenegrin', countryName: 'Montenegro', isoCode: 'ME', alpha3Code: 'MNE', alternativeNames: [] },
    { nationalityName: 'Moroccan', countryName: 'Morocco', isoCode: 'MA', alpha3Code: 'MAR', alternativeNames: [] },
    { nationalityName: 'Mozambican', countryName: 'Mozambique', isoCode: 'MZ', alpha3Code: 'MOZ', alternativeNames: [] },
    
    // N
    { nationalityName: 'Namibian', countryName: 'Namibia', isoCode: 'NA', alpha3Code: 'NAM', alternativeNames: [] },
    { nationalityName: 'Nepalese', countryName: 'Nepal', isoCode: 'NP', alpha3Code: 'NPL', alternativeNames: ['Nepali'] },
    { nationalityName: 'Dutch', countryName: 'Netherlands', isoCode: 'NL', alpha3Code: 'NLD', alternativeNames: ['Netherlands'] },
    { nationalityName: 'New Zealander', countryName: 'New Zealand', isoCode: 'NZ', alpha3Code: 'NZL', alternativeNames: ['Kiwi'] },
    { nationalityName: 'Nicaraguan', countryName: 'Nicaragua', isoCode: 'NI', alpha3Code: 'NIC', alternativeNames: [] },
    { nationalityName: 'Nigerien', countryName: 'Niger', isoCode: 'NE', alpha3Code: 'NER', alternativeNames: [] },
    { nationalityName: 'Nigerian', countryName: 'Nigeria', isoCode: 'NG', alpha3Code: 'NGA', alternativeNames: [] },
    { nationalityName: 'North Korean', countryName: 'North Korea', isoCode: 'KP', alpha3Code: 'PRK', alternativeNames: [] },
    { nationalityName: 'Norwegian', countryName: 'Norway', isoCode: 'NO', alpha3Code: 'NOR', alternativeNames: [] },
    
    // O
    { nationalityName: 'Omani', countryName: 'Oman', isoCode: 'OM', alpha3Code: 'OMN', alternativeNames: [] },
    
    // P
    { nationalityName: 'Pakistani', countryName: 'Pakistan', isoCode: 'PK', alpha3Code: 'PAK', alternativeNames: [] },
    { nationalityName: 'Palestinian', countryName: 'Palestine', isoCode: 'PS', alpha3Code: 'PSE', alternativeNames: [] },
    { nationalityName: 'Panamanian', countryName: 'Panama', isoCode: 'PA', alpha3Code: 'PAN', alternativeNames: [] },
    { nationalityName: 'Paraguayan', countryName: 'Paraguay', isoCode: 'PY', alpha3Code: 'PRY', alternativeNames: [] },
    { nationalityName: 'Peruvian', countryName: 'Peru', isoCode: 'PE', alpha3Code: 'PER', alternativeNames: [] },
    { nationalityName: 'Polish', countryName: 'Poland', isoCode: 'PL', alpha3Code: 'POL', alternativeNames: [] },
    { nationalityName: 'Portuguese', countryName: 'Portugal', isoCode: 'PT', alpha3Code: 'PRT', alternativeNames: [] },
    
    // Q
    { nationalityName: 'Qatari', countryName: 'Qatar', isoCode: 'QA', alpha3Code: 'QAT', alternativeNames: [] },
    
    // R
    { nationalityName: 'Romanian', countryName: 'Romania', isoCode: 'RO', alpha3Code: 'ROU', alternativeNames: [] },
    { nationalityName: 'Russian', countryName: 'Russia', isoCode: 'RU', alpha3Code: 'RUS', alternativeNames: [] },
    { nationalityName: 'Rwandan', countryName: 'Rwanda', isoCode: 'RW', alpha3Code: 'RWA', alternativeNames: [] },
    
    // S
    { nationalityName: 'Saudi', countryName: 'Saudi Arabia', isoCode: 'SA', alpha3Code: 'SAU', alternativeNames: ['Saudi Arabian'] },
    { nationalityName: 'Senegalese', countryName: 'Senegal', isoCode: 'SN', alpha3Code: 'SEN', alternativeNames: [] },
    { nationalityName: 'Serbian', countryName: 'Serbia', isoCode: 'RS', alpha3Code: 'SRB', alternativeNames: [] },
    { nationalityName: 'Singaporean', countryName: 'Singapore', isoCode: 'SG', alpha3Code: 'SGP', alternativeNames: [] },
    { nationalityName: 'Slovak', countryName: 'Slovakia', isoCode: 'SK', alpha3Code: 'SVK', alternativeNames: [] },
    { nationalityName: 'Slovenian', countryName: 'Slovenia', isoCode: 'SI', alpha3Code: 'SVN', alternativeNames: [] },
    { nationalityName: 'Somali', countryName: 'Somalia', isoCode: 'SO', alpha3Code: 'SOM', alternativeNames: [] },
    { nationalityName: 'South African', countryName: 'South Africa', isoCode: 'ZA', alpha3Code: 'ZAF', alternativeNames: [] },
    { nationalityName: 'South Korean', countryName: 'South Korea', isoCode: 'KR', alpha3Code: 'KOR', alternativeNames: ['Korean'] },
    { nationalityName: 'Spanish', countryName: 'Spain', isoCode: 'ES', alpha3Code: 'ESP', alternativeNames: [] },
    { nationalityName: 'Sri Lankan', countryName: 'Sri Lanka', isoCode: 'LK', alpha3Code: 'LKA', alternativeNames: [] },
    { nationalityName: 'Sudanese', countryName: 'Sudan', isoCode: 'SD', alpha3Code: 'SDN', alternativeNames: [] },
    { nationalityName: 'Swedish', countryName: 'Sweden', isoCode: 'SE', alpha3Code: 'SWE', alternativeNames: [] },
    { nationalityName: 'Swiss', countryName: 'Switzerland', isoCode: 'CH', alpha3Code: 'CHE', alternativeNames: [] },
    { nationalityName: 'Syrian', countryName: 'Syria', isoCode: 'SY', alpha3Code: 'SYR', alternativeNames: [] },
    
    // T
    { nationalityName: 'Taiwanese', countryName: 'Taiwan', isoCode: 'TW', alpha3Code: 'TWN', alternativeNames: [] },
    { nationalityName: 'Tajik', countryName: 'Tajikistan', isoCode: 'TJ', alpha3Code: 'TJK', alternativeNames: [] },
    { nationalityName: 'Tanzanian', countryName: 'Tanzania', isoCode: 'TZ', alpha3Code: 'TZA', alternativeNames: [] },
    { nationalityName: 'Thai', countryName: 'Thailand', isoCode: 'TH', alpha3Code: 'THA', alternativeNames: [] },
    { nationalityName: 'Togolese', countryName: 'Togo', isoCode: 'TG', alpha3Code: 'TGO', alternativeNames: [] },
    { nationalityName: 'Tunisian', countryName: 'Tunisia', isoCode: 'TN', alpha3Code: 'TUN', alternativeNames: [] },
    { nationalityName: 'Turkish', countryName: 'Turkey', isoCode: 'TR', alpha3Code: 'TUR', alternativeNames: [] },
    { nationalityName: 'Turkmen', countryName: 'Turkmenistan', isoCode: 'TM', alpha3Code: 'TKM', alternativeNames: [] },
    
    // U
    { nationalityName: 'Ugandan', countryName: 'Uganda', isoCode: 'UG', alpha3Code: 'UGA', alternativeNames: [] },
    { nationalityName: 'Ukrainian', countryName: 'Ukraine', isoCode: 'UA', alpha3Code: 'UKR', alternativeNames: [] },
    { nationalityName: 'Uruguayan', countryName: 'Uruguay', isoCode: 'UY', alpha3Code: 'URY', alternativeNames: [] },
    { nationalityName: 'Uzbek', countryName: 'Uzbekistan', isoCode: 'UZ', alpha3Code: 'UZB', alternativeNames: ['Uzbekistani'] },
    
    // V
    { nationalityName: 'Venezuelan', countryName: 'Venezuela', isoCode: 'VE', alpha3Code: 'VEN', alternativeNames: [] },
    { nationalityName: 'Vietnamese', countryName: 'Vietnam', isoCode: 'VN', alpha3Code: 'VNM', alternativeNames: [] },
    
    // Y
    { nationalityName: 'Yemeni', countryName: 'Yemen', isoCode: 'YE', alpha3Code: 'YEM', alternativeNames: [] },
    
    // Z
    { nationalityName: 'Zambian', countryName: 'Zambia', isoCode: 'ZM', alpha3Code: 'ZMB', alternativeNames: [] },
    { nationalityName: 'Zimbabwean', countryName: 'Zimbabwe', isoCode: 'ZW', alpha3Code: 'ZWE', alternativeNames: [] },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuppliers(mockSuppliers);
      setNationalityData(mockNationalityData);
      
      // Auto-generate Master Nationalities from ISO list
      const generatedMasters: MasterNationality[] = WORLD_NATIONALITIES_ISO.map((nat, index) => ({
        id: `master_${String(index + 1).padStart(3, '0')}`,
        name: nat.nationalityName,
        code: nat.isoCode,
        standardCode: nat.alpha3Code,
        alternativeNames: nat.alternativeNames,
        mappedCount: 0,
        suppliers: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      setMasterNationalities(generatedMasters);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromSuppliers = async () => {
    setLoading(true);
    try {
      for (const supplier of suppliers.filter(s => s.active)) {
        console.log(`Fetching from ${supplier.name}...`);
      }
      await loadData();
    } catch (error) {
      console.error('Error fetching from suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMasterNationality = async (data: Partial<MasterNationality>) => {
    console.log('Creating master nationality:', data);
    setShowCreateMaster(false);
  };

  const mapNationality = async (nationalityId: string, masterId: string) => {
    console.log('Mapping nationality:', nationalityId, 'to master:', masterId);
    setShowMappingModal(false);
    setSelectedNationality(null);
  };

  // Auto-match algorithm: Calculate similarity between names
  const calculateNameSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 100;
    if (s1.includes(s2) || s2.includes(s1)) return 90;
    
    // Simple Levenshtein distance for basic similarity
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 100;
    
    const editDistance = (s1: string, s2: string): number => {
      const costs: number[] = [];
      for (let i = 0; i <= s2.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s1.length; j++) {
          if (i === 0) {
            costs[j] = j;
          } else if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(j - 1) !== s2.charAt(i - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
        if (i > 0) costs[s1.length] = lastValue;
      }
      return costs[s1.length];
    };
    
    const distance = editDistance(shorter, longer);
    return Math.round(((longer.length - distance) / longer.length) * 100);
  };

  const autoMatchAll = async () => {
    setLoading(true);
    try {
      const updatedData = nationalityData.map(nationality => {
        if (nationality.status === 'mapped') return nationality;
        
        let bestMatch: { master: MasterNationality; confidence: number } | null = null;
        
        for (const master of masterNationalities) {
          // Check main name similarity
          let confidence = calculateNameSimilarity(nationality.nationalityName, master.name);
          
          // Check alternative names
          if (master.alternativeNames) {
            for (const altName of master.alternativeNames) {
              const altConfidence = calculateNameSimilarity(nationality.nationalityName, altName);
              if (altConfidence > confidence) {
                confidence = altConfidence;
              }
            }
          }
          
          // Check country code match
          if (nationality.countryCode && nationality.countryCode === master.code) {
            confidence = Math.min(confidence + 10, 100);
          }
          
          if (confidence >= 95 && (!bestMatch || confidence > bestMatch.confidence)) {
            bestMatch = { master, confidence };
          }
        }
        
        if (bestMatch) {
          return {
            ...nationality,
            masterId: bestMatch.master.id,
            status: 'mapped' as const,
            confidence: bestMatch.confidence
          };
        }
        
        return nationality;
      });
      
      setNationalityData(updatedData);
      
      // Update master nationalities mapped count
      const updatedMasters = masterNationalities.map(master => {
        const mappedItems = updatedData.filter(n => n.masterId === master.id);
        const uniqueSuppliers = Array.from(new Set(mappedItems.map(n => n.supplierId)));
        
        return {
          ...master,
          mappedCount: mappedItems.length,
          suppliers: uniqueSuppliers
        };
      });
      
      setMasterNationalities(updatedMasters);
      
      console.log('Auto-matching completed!');
    } catch (error) {
      console.error('Error during auto-matching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuppliers = () => {
    setIsUpdatingSuppliers(true);
    
    setTimeout(() => {
      const newNationalitiesFromExpedia: NationalityData[] = [
        {
          id: `expedia_${Date.now()}_1`,
          supplierId: 'expedia',
          supplierName: 'Expedia',
          supplierNationalityId: 'EXP_EG_001',
          nationalityName: 'Egyptian',
          nationalityCode: 'EG',
          countryName: 'Egypt',
          countryCode: 'EG',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `expedia_${Date.now()}_2`,
          supplierId: 'expedia',
          supplierName: 'Expedia',
          supplierNationalityId: 'EXP_US_001',
          nationalityName: 'American',
          nationalityCode: 'US',
          countryName: 'United States',
          countryCode: 'US',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `expedia_${Date.now()}_3`,
          supplierId: 'expedia',
          supplierName: 'Expedia',
          supplierNationalityId: 'EXP_GB_001',
          nationalityName: 'British',
          nationalityCode: 'GB',
          countryName: 'United Kingdom',
          countryCode: 'GB',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setNationalityData(prevData => [...prevData, ...newNationalitiesFromExpedia]);
      setIsUpdatingSuppliers(false);
      alert(`✅ Data updated successfully!\n\nAdded ${newNationalitiesFromExpedia.length} new nationalities from Expedia`);
    }, 1500);
  };

  // ==================== GROUPING FUNCTION WITH ISO MATCHING ====================
  const groupNationalitiesByName = (data: NationalityData[]) => {
    const groups: { [key: string]: NationalityData[] } = {};
    
    data.forEach((nationality) => {
      let groupKey: string | null = null;
      let bestMatch = 0;
      
      // PRIORITY 1: Check if nationality has masterId
      if (nationality.masterId) {
        const existingGroups = Object.keys(groups);
        for (const existingKey of existingGroups) {
          const hasMatchingMasterId = groups[existingKey].some(n => n.masterId === nationality.masterId);
          if (hasMatchingMasterId) {
            groupKey = existingKey;
            break;
          }
        }
      }
      
      // PRIORITY 2: ISO Code Matching (NEW - HIGHEST PRIORITY FOR ACCURACY)
      if (!groupKey) {
        // Find ISO entry for current nationality
        const currentIsoEntry = WORLD_NATIONALITIES_ISO.find(iso => 
          iso.nationalityName.toLowerCase() === nationality.nationalityName.toLowerCase() ||
          iso.countryName.toLowerCase() === nationality.nationalityName.toLowerCase() ||
          iso.isoCode.toLowerCase() === nationality.nationalityCode?.toLowerCase() ||
          iso.alpha3Code.toLowerCase() === nationality.nationalityCode?.toLowerCase() ||
          iso.alternativeNames.some(alt => alt.toLowerCase() === nationality.nationalityName.toLowerCase())
        );
        
        if (currentIsoEntry) {
          const existingGroups = Object.keys(groups);
          for (const existingKey of existingGroups) {
            const existingNationality = groups[existingKey][0];
            
            // Find ISO entry for existing group nationality
            const existingIsoEntry = WORLD_NATIONALITIES_ISO.find(iso =>
              iso.nationalityName.toLowerCase() === existingNationality.nationalityName.toLowerCase() ||
              iso.countryName.toLowerCase() === existingNationality.nationalityName.toLowerCase() ||
              iso.isoCode.toLowerCase() === existingNationality.nationalityCode?.toLowerCase() ||
              iso.alpha3Code.toLowerCase() === existingNationality.nationalityCode?.toLowerCase() ||
              iso.alternativeNames.some(alt => alt.toLowerCase() === existingNationality.nationalityName.toLowerCase())
            );
            
            // Match if same ISO code (e.g., "China" and "Chinese" both map to CN)
            if (existingIsoEntry && currentIsoEntry.isoCode === existingIsoEntry.isoCode) {
              groupKey = existingKey;
              break;
            }
          }
        }
      }
      
      // PRIORITY 3: Traditional Similarity matching (fallback)
      if (!groupKey) {
        const existingGroups = Object.keys(groups);
        existingGroups.forEach((existingKey) => {
          const existingNationality = groups[existingKey][0];
          
          const nameSimilarity = calculateNameSimilarity(nationality.nationalityName, existingNationality.nationalityName);
          let codeSimilarity = 0;
          
          if (nationality.nationalityCode && existingNationality.nationalityCode) {
            codeSimilarity = nationality.nationalityCode === existingNationality.nationalityCode ? 100 : 0;
          }
          
          const overallMatch = (nameSimilarity * 0.7) + (codeSimilarity * 0.3);
          
          if (overallMatch >= 90 && overallMatch >= bestMatch) {
            bestMatch = overallMatch;
            groupKey = existingKey;
          }
        });
      }
      
      if (!groupKey) {
        groupKey = nationality.nationalityName;
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(nationality);
    });
    
    return groups;
  };

  // ==================== MANUAL MATCH FUNCTIONS ====================
  const handleToggleGroupSelectionMode = (groupName: string, nationalities: NationalityData[]) => {
    if (groupSelectionMode[groupName]) {
      setGroupSelectionMode(prev => ({ ...prev, [groupName]: false }));
      setSelectedNationalitiesInGroup(prev => ({ ...prev, [groupName]: new Set() }));
    } else {
      setGroupSelectionMode(prev => ({ ...prev, [groupName]: true }));
      const allIds = new Set(nationalities.map(n => n.id));
      setSelectedNationalitiesInGroup(prev => ({ ...prev, [groupName]: allIds }));
    }
  };

  const handleNationalityCheckboxToggle = (groupName: string, nationalityId: string) => {
    setSelectedNationalitiesInGroup(prev => {
      const current = new Set(prev[groupName] || []);
      if (current.has(nationalityId)) {
        current.delete(nationalityId);
      } else {
        current.add(nationalityId);
      }
      return { ...prev, [groupName]: current };
    });
  };

  const handleConfirmGroupMatch = (groupName: string, allNationalities: NationalityData[]) => {
    const selectedIds = selectedNationalitiesInGroup[groupName] || new Set();
    const selectedNationalities = allNationalities.filter(n => selectedIds.has(n.id));
    
    if (selectedIds.size < 2) {
      alert('⚠️ You must select at least 2 nationalities to create a match.\n\nA Master ID can only be assigned when matching multiple nationalities together from different suppliers.');
      return;
    }
    
    const warnings = detectWarnings(selectedNationalities);
    setPendingMatchData({ groupName, nationalities: selectedNationalities, warnings });
    setShowMatchConfirmModal(true);
  };

  const detectWarnings = (nationalities: NationalityData[]): string[] => {
    const warnings: string[] = [];
    const codes = new Set(nationalities.map(n => n.nationalityCode).filter(Boolean));
    const suppliers = nationalities.map(n => n.supplierName);
    const uniqueSuppliers = new Set(suppliers);
    
    if (codes.size > 1) {
      warnings.push(`⚠️ Multiple nationality codes: ${Array.from(codes).join(', ')}`);
    }
    
    if (suppliers.length !== uniqueSuppliers.size) {
      warnings.push(`⚠️ Duplicate suppliers detected`);
    }
    
    return warnings;
  };

  const processManualMatch = () => {
    if (!pendingMatchData) return;
    
    const newMasterId = generateMasterId();
    const updatedData = nationalityData.map(nationality => {
      const isSelected = pendingMatchData.nationalities.some(n => n.id === nationality.id);
      if (isSelected) {
        return {
          ...nationality,
          masterId: newMasterId,
          status: 'mapped' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return nationality;
    });
    
    setNationalityData(updatedData);
    setGroupSelectionMode(prev => ({ ...prev, [pendingMatchData.groupName]: false }));
    setSelectedNationalitiesInGroup(prev => ({ ...prev, [pendingMatchData.groupName]: new Set() }));
    setPendingMatchData(null);
    setShowMatchConfirmModal(false);
    
    alert(`✅ Successfully matched ${pendingMatchData.nationalities.length} nationalities!\n\nMaster ID: ${newMasterId}`);
  };

  const handleCancelGroupMatch = (groupName: string) => {
    setGroupSelectionMode(prev => ({ ...prev, [groupName]: false }));
    setSelectedNationalitiesInGroup(prev => ({ ...prev, [groupName]: new Set() }));
  };

  // ==================== BATCH SELECTION FUNCTIONS ====================
  const handleOpenManualMatchModal = () => {
    setBatchSelectionMode(prev => !prev);
    if (!batchSelectionMode) {
      setSelectedNationalitiesInGroup({});
      setGroupSelectionMode({});
    }
  };

  const handleBatchConfirm = () => {
    const allSelectedNationalities: NationalityData[] = [];
    
    Object.keys(selectedNationalitiesInGroup).forEach(groupName => {
      const selectedIds = selectedNationalitiesInGroup[groupName];
      if (selectedIds && selectedIds.size > 0) {
        const groupNationalities = Object.values(groupNationalitiesByName(filteredData))
          .flat()
          .filter(n => selectedIds.has(n.id));
        allSelectedNationalities.push(...groupNationalities);
      }
    });
    
    if (allSelectedNationalities.length < 2) {
      alert('⚠️ You must select at least 2 nationalities to create a match.');
      return;
    }
    
    const newMasterId = generateMasterId();
    const updatedData = nationalityData.map(nationality => {
      const isSelected = allSelectedNationalities.some(n => n.id === nationality.id);
      if (isSelected) {
        return {
          ...nationality,
          masterId: newMasterId,
          status: 'mapped' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return nationality;
    });
    
    setNationalityData(updatedData);
    setBatchSelectionMode(false);
    setSelectedNationalitiesInGroup({});
    setGroupSelectionMode({});
    
    alert(`✅ Successfully matched ${allSelectedNationalities.length} nationalities!\n\nMaster ID: ${newMasterId}`);
  };

  // ==================== AUTO MATCH FUNCTIONS ====================
  const handleAutoMatchAll = async () => {
    setIsMatching(true);
    const warnings: Array<{ groupName: string; nationalities: NationalityData[]; issues: string[] }> = [];
    let successCount = 0;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedData = [...nationalityData];
      const grouped = groupNationalitiesByName(filteredData);
      
      Object.entries(grouped).forEach(([groupName, nationalities]) => {
        const unmappedNationalities = nationalities.filter(n => n.status === 'pending');
        
        if (unmappedNationalities.length >= 2) {
          const newMasterId = generateMasterId();
          const groupWarnings = detectWarnings(unmappedNationalities);
          
          unmappedNationalities.forEach(nationality => {
            const index = updatedData.findIndex(n => n.id === nationality.id);
            if (index !== -1) {
              updatedData[index] = {
                ...updatedData[index],
                masterId: newMasterId,
                status: 'mapped',
                updatedAt: new Date().toISOString()
              };
              successCount++;
            }
          });
          
          if (groupWarnings.length > 0) {
            warnings.push({
              groupName,
              nationalities: unmappedNationalities,
              issues: groupWarnings
            });
          }
        }
      });
      
      setNationalityData(updatedData);
      setAutoMatchResults({ success: successCount, warnings });
      
    } catch (error) {
      console.error('Error during auto-match:', error);
      alert('❌ Error during auto-match. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  // ==================== UNMATCH FUNCTIONS ====================
  const handleUnmatchGroup = (nationalities: NationalityData[], groupName: string) => {
    setUnmatchSelectionMode(groupName);
    const nationalitiesWithMasterId = nationalities.filter(n => n.masterId);
    const allIds = new Set(nationalitiesWithMasterId.map(n => n.id));
    setSelectedNationalitiesForUnmatch(allIds);
  };

  const cancelUnmatchSelection = () => {
    setUnmatchSelectionMode(null);
    setSelectedNationalitiesForUnmatch(new Set());
  };

  const handleUnmatchCheckboxToggle = (nationalityId: string) => {
    setSelectedNationalitiesForUnmatch(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nationalityId)) {
        newSet.delete(nationalityId);
      } else {
        newSet.add(nationalityId);
      }
      return newSet;
    });
  };

  const confirmUnmatchSelection = () => {
    if (selectedNationalitiesForUnmatch.size === 0) {
      alert('⚠️ Please select at least one nationality to unmatch.');
      return;
    }
    setShowUnmatchConfirmModal(true);
  };

  const processUnmatch = () => {
    const updatedData = nationalityData.map(nationality => {
      if (selectedNationalitiesForUnmatch.has(nationality.id)) {
        return {
          ...nationality,
          status: 'pending' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return nationality;
    });
    
    setNationalityData(updatedData);
    setUnmatchSelectionMode(null);
    setSelectedNationalitiesForUnmatch(new Set());
    setShowUnmatchConfirmModal(false);
    
    alert(`✅ Successfully unmatched ${selectedNationalitiesForUnmatch.size} nationalities!\n\nNote: Master IDs have been preserved.`);
  };

  // ==================== ACCORDION TOGGLE ====================
  const toggleGroupExpansion = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // ==================== ACTION HANDLERS ====================
  const handleViewNationality = (nationality: NationalityData) => {
    setSelectedNationality(nationality);
    setShowViewModal(true);
  };

  const handleDeleteClick = (nationality: NationalityData) => {
    setNationalityToDelete(nationality);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteConfirm = () => {
    if (nationalityToDelete) {
      const updatedData = nationalityData.filter(item => item.id !== nationalityToDelete.id);
      setNationalityData(updatedData);
      setShowDeleteConfirmModal(false);
      setNationalityToDelete(null);
      alert(`✅ Successfully deleted nationality: ${nationalityToDelete.nationalityName} from ${nationalityToDelete.supplierName}`);
    }
  };

  const handleMoveClick = (nationality: NationalityData) => {
    setNationalityToMove(nationality);
    setSelectedTargetMaster('');
    setShowMoveModal(true);
  };

  const handleMoveConfirm = () => {
    if (nationalityToMove && selectedTargetMaster) {
      const updatedData = nationalityData.map(item => {
        if (item.id === nationalityToMove.id) {
          return {
            ...item,
            masterId: selectedTargetMaster,
            status: 'mapped' as const,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });
      
      setNationalityData(updatedData);
      setShowMoveModal(false);
      setNationalityToMove(null);
      setSelectedTargetMaster('');
      
      const targetMaster = masterNationalities.find(m => m.id === selectedTargetMaster);
      alert(`✅ Successfully moved "${nationalityToMove.nationalityName}" to "${targetMaster?.name}"`);
    }
  };

  const filteredData = nationalityData.filter(item => {
    const matchesSearch = item.nationalityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSupplier = selectedSupplier === 'all' || item.supplierId === selectedSupplier;
    
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const groupedData = groupNationalitiesByName(filteredData);

  // Auto-expand all groups on mount or when grouped data changes
  useEffect(() => {
    const allGroups = Object.keys(groupedData);
    const initialExpanded: { [key: string]: boolean } = {};
    allGroups.forEach(groupName => {
      initialExpanded[groupName] = true; // Open all groups by default
    });
    setExpandedGroups(initialExpanded);
  }, [Object.keys(groupedData).join(',')]); // Re-run when group names change

  const stats = {
    total: nationalityData.length,
    pending: nationalityData.filter(item => item.status === 'pending').length,
    mapped: nationalityData.filter(item => item.status === 'mapped').length,
    review: nationalityData.filter(item => item.status === 'review').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading nationality data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-scale">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="h-7 w-7 text-blue-500" />
          Nationality Mapping
        </h1>
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
      </div>

      {/* Match Buttons */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
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

        {/* Expand/Collapse All Button */}
        <button
          onClick={() => {
            const allExpanded = Object.values(expandedGroups).every(v => v);
            const newState: { [key: string]: boolean } = {};
            Object.keys(groupedData).forEach(key => {
              newState[key] = !allExpanded;
            });
            setExpandedGroups(newState);
          }}
          className="btn-modern bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold transform hover:scale-105 transition-transform"
        >
          {Object.values(expandedGroups).every(v => v) ? (
            <>
              <ChevronUp className="h-5 w-5" />
              📂 Collapse All
            </>
          ) : (
            <>
              <ChevronDown className="h-5 w-5" />
              📂 Expand All
            </>
          )}
        </button>

        {batchSelectionMode && (
          <button
            onClick={handleBatchConfirm}
            disabled={Object.values(selectedNationalitiesInGroup).every(set => set.size === 0)}
            className="btn-modern bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-slow transform hover:scale-105"
            title="Click to confirm all selected nationalities across all groups"
          >
            <Check className="h-5 w-5" />
            ✅ Confirm All ({Object.values(selectedNationalitiesInGroup).reduce((sum, set) => sum + set.size, 0)} Nationalities)
          </button>
        )}

        <p className="text-sm text-gray-600 flex-1 min-w-[300px]">
          {batchSelectionMode 
            ? 'Batch Selection Mode: Select nationalities across multiple groups, then click Confirm All' 
            : 'Auto Match: Match all groups automatically • Manual Match: Select specific groups to match'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
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

      {/* Filters */}
      <div className="card-modern p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search nationalities..."
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
        </div>
      </div>

      {/* Data Table - Grouped by Nationality */}
      <div className="card-modern overflow-hidden">
        <div className="overflow-x-auto">
          {Object.entries(groupedData).map(([groupName, items]) => (
            <div key={groupName} className="mb-6 last:mb-0 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              {/* Group Header - Clickable */}
              <div 
                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-l-4 border-blue-500 cursor-pointer hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-colors"
                onClick={() => toggleGroupExpansion(groupName)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0">
                      {expandedGroups[groupName] ? (
                        <ChevronUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        {groupName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {items.length} {items.length === 1 ? 'record' : 'records'} from {new Set(items.map(i => i.supplierName)).size} {new Set(items.map(i => i.supplierName)).size === 1 ? 'supplier' : 'suppliers'}
                      </p>
                      {/* Master ISO Code Display */}
                      {(() => {
                        const firstItem = items[0];
                        const isoEntry = WORLD_NATIONALITIES_ISO.find(iso => 
                          iso.nationalityName.toLowerCase() === firstItem.nationalityName.toLowerCase() ||
                          iso.countryName.toLowerCase() === firstItem.nationalityName.toLowerCase() ||
                          iso.isoCode.toLowerCase() === firstItem.nationalityCode?.toLowerCase() ||
                          iso.alpha3Code.toLowerCase() === firstItem.nationalityCode?.toLowerCase() ||
                          iso.alternativeNames.some(alt => alt.toLowerCase() === firstItem.nationalityName.toLowerCase())
                        );
                        
                        if (isoEntry) {
                          const hasMasterId = items.some(i => i.masterId);
                          return (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-2xl" title={isoEntry.countryName}>
                                {String.fromCodePoint(0x1F1E6 - 65 + isoEntry.isoCode.charCodeAt(0))}
                                {String.fromCodePoint(0x1F1E6 - 65 + isoEntry.isoCode.charCodeAt(1))}
                              </span>
                              <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-md">
                                {isoEntry.isoCode}
                              </span>
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded">
                                {isoEntry.alpha3Code}
                              </span>
                              {hasMasterId && (
                                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                                  ✓ Mapped
                                </span>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    {/* Manual Match Button */}
                    {!batchSelectionMode && !groupSelectionMode[groupName] && unmatchSelectionMode !== groupName && !items.every(i => i.status === 'mapped') && (
                      <button
                        onClick={() => handleToggleGroupSelectionMode(groupName, items)}
                        className="px-4 py-2 bg-white hover:bg-gray-50 text-pink-600 rounded-lg shadow-md font-semibold flex items-center gap-2 transition-all border-2 border-white"
                        title="Select specific nationalities to match"
                      >
                        <Edit className="h-4 w-4" />
                        ✋ Manual Match
                      </button>
                    )}

                    {/* Unmatch Button */}
                    {!batchSelectionMode && !groupSelectionMode[groupName] && unmatchSelectionMode !== groupName && items.some(i => i.masterId) && (
                      <button
                        onClick={() => handleUnmatchGroup(items, groupName)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md font-semibold flex items-center gap-2 transition-all transform hover:scale-105"
                        title="Remove mapping from Master ID (Master ID will be preserved)"
                      >
                        <RefreshCw className="h-4 w-4" />
                        🔓 Unmatch
                      </button>
                    )}

                    {/* Unmatch Selection Mode Actions */}
                    {unmatchSelectionMode === groupName && (
                      <>
                        <button
                          onClick={confirmUnmatchSelection}
                          disabled={selectedNationalitiesForUnmatch.size === 0}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg shadow-md font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RefreshCw className="h-4 w-4" />
                          🔓 Confirm Unmatch ({selectedNationalitiesForUnmatch.size})
                        </button>
                        <button
                          onClick={cancelUnmatchSelection}
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md font-semibold flex items-center gap-2 transition-all"
                        >
                          ❌ Cancel
                        </button>
                      </>
                    )}

                    {/* Selection Mode Actions */}
                    {!batchSelectionMode && groupSelectionMode[groupName] && (
                      <>
                        <button
                          onClick={() => handleConfirmGroupMatch(groupName, items)}
                          disabled={(selectedNationalitiesInGroup[groupName]?.size || 0) === 0}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg shadow-md font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="h-4 w-4" />
                          ✅ Confirm Match ({selectedNationalitiesInGroup[groupName]?.size || 0})
                        </button>
                        <button
                          onClick={() => handleCancelGroupMatch(groupName)}
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md font-semibold flex items-center gap-2 transition-all"
                        >
                          ❌ Cancel
                        </button>
                      </>
                    )}

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

              {/* Group Table - Only show when expanded */}
              {expandedGroups[groupName] && (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {/* Checkbox column */}
                      {(batchSelectionMode || groupSelectionMode[groupName] || unmatchSelectionMode === groupName) && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={
                              unmatchSelectionMode === groupName
                                ? items.filter(i => i.masterId).every(i => selectedNationalitiesForUnmatch.has(i.id))
                                : items.every(i => selectedNationalitiesInGroup[groupName]?.has(i.id))
                            }
                            onChange={(e) => {
                              if (unmatchSelectionMode === groupName) {
                                const nationalitiesWithMasterId = items.filter(i => i.masterId);
                                if (e.target.checked) {
                                  const allIds = new Set(nationalitiesWithMasterId.map(i => i.id));
                                  setSelectedNationalitiesForUnmatch(allIds);
                                } else {
                                  setSelectedNationalitiesForUnmatch(new Set());
                                }
                              } else {
                                if (e.target.checked) {
                                  const allIds = new Set(items.map(i => i.id));
                                  setSelectedNationalitiesInGroup(prev => ({ ...prev, [groupName]: allIds }));
                                } else {
                                  setSelectedNationalitiesInGroup(prev => ({ ...prev, [groupName]: new Set() }));
                                }
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </th>
                      )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nationality Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ISO Match
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
                      {/* Checkbox - show in manual match selection mode OR unmatch selection mode */}
                      {(batchSelectionMode || groupSelectionMode[groupName] || unmatchSelectionMode === groupName) && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {unmatchSelectionMode === groupName ? (
                            item.masterId ? (
                              <input
                                type="checkbox"
                                checked={selectedNationalitiesForUnmatch.has(item.id)}
                                onChange={() => handleUnmatchCheckboxToggle(item.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            ) : null
                          ) : (
                            <input
                              type="checkbox"
                              checked={selectedNationalitiesInGroup[groupName]?.has(item.id) || false}
                              onChange={() => handleNationalityCheckboxToggle(groupName, item.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.supplierName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 ml-2">ID: {item.supplierNationalityId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{item.nationalityName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                          {item.nationalityCode || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const isoEntry = WORLD_NATIONALITIES_ISO.find(iso => 
                            iso.nationalityName.toLowerCase() === item.nationalityName.toLowerCase() ||
                            iso.countryName.toLowerCase() === item.nationalityName.toLowerCase() ||
                            iso.isoCode.toLowerCase() === item.nationalityCode?.toLowerCase() ||
                            iso.alpha3Code.toLowerCase() === item.nationalityCode?.toLowerCase() ||
                            iso.alternativeNames.some(alt => alt.toLowerCase() === item.nationalityName.toLowerCase())
                          );
                          
                          if (isoEntry) {
                            return (
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs font-bold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                                  {isoEntry.isoCode}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400" title={`${isoEntry.nationalityName} - ${isoEntry.countryName}`}>
                                  {isoEntry.nationalityName}
                                </span>
                              </div>
                            );
                          }
                          return (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              No ISO match
                            </span>
                          );
                        })()}
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
                              setSelectedNationality(item);
                              setShowMappingModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Edit nationality mapping"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleViewNationality(item)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                            title="View nationality details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleMoveClick(item)}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                            title="Move to another master nationality"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Delete nationality"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          ))}
          
          {Object.keys(groupedData).length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No nationality data found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or fetch data from suppliers</p>
            </div>
          )}
        </div>
      </div>

      {/* Master Nationalities */}
      <div className="card-modern p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Master Nationalities ({masterNationalities.length})
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Based on ISO 3166-1 Standard
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {masterNationalities.map((master) => {
            const isoEntry = WORLD_NATIONALITIES_ISO.find(iso => iso.alpha3Code === master.standardCode);
            
            // Calculate real-time mapped count and suppliers
            const mappedNationalities = nationalityData.filter(n => 
              n.masterId === master.id || 
              (n.nationalityCode && n.nationalityCode.toLowerCase() === isoEntry?.isoCode.toLowerCase()) ||
              (n.nationalityCode && n.nationalityCode.toLowerCase() === isoEntry?.alpha3Code.toLowerCase()) ||
              (n.nationalityName.toLowerCase() === master.name.toLowerCase())
            );
            
            const actualMappedCount = mappedNationalities.filter(n => n.status === 'mapped').length;
            const uniqueSuppliers = Array.from(new Set(mappedNationalities.map(n => n.supplierId)));
            
            return (
              <div key={master.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" title={isoEntry?.countryName}>
                      {isoEntry?.isoCode ? `${String.fromCodePoint(0x1F1E6 - 65 + isoEntry.isoCode.charCodeAt(0))}${String.fromCodePoint(0x1F1E6 - 65 + isoEntry.isoCode.charCodeAt(1))}` : '🌍'}
                    </span>
                    <h3 className="font-medium text-gray-900 dark:text-white">{master.name}</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {isoEntry?.isoCode || master.code}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {master.standardCode}
                    </span>
                  </div>
                  {isoEntry?.alternativeNames && isoEntry.alternativeNames.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Also: {isoEntry.alternativeNames.slice(0, 2).join(', ')}
                      {isoEntry.alternativeNames.length > 2 && ` +${isoEntry.alternativeNames.length - 2}`}
                    </div>
                  )}
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

      {/* Mapping Modal */}
      {showMappingModal && selectedNationality && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Map Nationality
              </h2>
              <button
                onClick={() => {
                  setShowMappingModal(false);
                  setSelectedNationality(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Selected Nationality:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Supplier:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {selectedNationality.supplierName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {selectedNationality.nationalityName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Code:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {selectedNationality.nationalityCode}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Country:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {selectedNationality.countryName || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Select Master Nationality:
              </h3>
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {masterNationalities.map((master) => {
                  const similarity = calculateNameSimilarity(
                    selectedNationality.nationalityName,
                    master.name
                  );
                  const codeMatch = selectedNationality.countryCode === master.code;
                  
                  return (
                    <button
                      key={master.id}
                      onClick={() => {
                        const updatedData = nationalityData.map(n =>
                          n.id === selectedNationality.id
                            ? { ...n, masterId: master.id, status: 'mapped' as const, confidence: similarity }
                            : n
                        );
                        setNationalityData(updatedData);
                        
                        const updatedMasters = masterNationalities.map(m => {
                          if (m.id === master.id) {
                            const mappedItems = updatedData.filter(n => n.masterId === m.id);
                            const uniqueSuppliers = Array.from(new Set(mappedItems.map(n => n.supplierId)));
                            return {
                              ...m,
                              mappedCount: mappedItems.length,
                              suppliers: uniqueSuppliers
                            };
                          }
                          return m;
                        });
                        setMasterNationalities(updatedMasters);
                        
                        setShowMappingModal(false);
                        setSelectedNationality(null);
                      }}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                        codeMatch || similarity >= 90
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {master.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          {codeMatch && (
                            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                              Code Match
                            </span>
                          )}
                          {similarity >= 90 && (
                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              {similarity}% Match
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span>Code: {master.code}</span>
                        <span className="mx-2">•</span>
                        <span>ISO: {master.standardCode}</span>
                        <span className="mx-2">•</span>
                        <span>Mapped: {master.mappedCount}</span>
                      </div>
                      {master.alternativeNames && master.alternativeNames.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Also known as: {master.alternativeNames.join(', ')}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowMappingModal(false);
                  setSelectedNationality(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unmatch Confirmation Modal */}
      {showUnmatchConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full animate-scale-in">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white px-8 py-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Confirm Unmatch</h2>
                  <p className="text-white/90 text-sm mt-1">Remove mapping from selected nationalities</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Warning Section */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-6 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Important Information</h3>
                    <ul className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-orange-500 rounded-full"></span>
                        {selectedNationalitiesForUnmatch.size} {selectedNationalitiesForUnmatch.size === 1 ? 'nationality' : 'nationalities'} will be unmatched
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-orange-500 rounded-full"></span>
                        Status will change from "Mapped" to "Pending"
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-orange-500 rounded-full"></span>
                        Will require manual review and re-matching
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Master ID Preservation Notice */}
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Master ID Preservation</h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ✅ Master ID will <strong>NEVER</strong> be removed or changed. It will be preserved for future reference and re-matching.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowUnmatchConfirmModal(false)}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processUnmatch}
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Confirm Unmatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Confirmation Modal */}
      {showMatchConfirmModal && pendingMatchData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-8 py-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Check className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Confirm Match</h2>
                  <p className="text-white/90 text-sm mt-1">Review and confirm nationality matching</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Summary Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Match Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Group:</span>
                    <span className="ml-2 text-blue-800 dark:text-blue-200">{pendingMatchData.groupName}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Nationalities:</span>
                    <span className="ml-2 text-blue-800 dark:text-blue-200">{pendingMatchData.nationalities.length}</span>
                  </div>
                </div>
              </div>

              {/* Selected Nationalities */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Selected Nationalities
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {pendingMatchData.nationalities.map((nationality, index) => (
                    <div key={nationality.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">{index + 1}.</span>
                            <span className="font-medium text-gray-900 dark:text-white">{nationality.nationalityName}</span>
                            {nationality.nationalityCode && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                                {nationality.nationalityCode}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span>Supplier: {nationality.supplierName}</span>
                            {nationality.countryName && (
                              <>
                                <span className="mx-2">•</span>
                                <span>Country: {nationality.countryName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings Section */}
              {pendingMatchData.warnings && pendingMatchData.warnings.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">Warnings Detected</h3>
                      <ul className="space-y-2">
                        {pendingMatchData.warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-orange-700 dark:text-orange-300 flex items-start gap-2">
                            <span className="h-1.5 w-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-3 italic">
                        Please review these warnings before confirming the match.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 rounded-b-2xl flex justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => {
                  setShowMatchConfirmModal(false);
                  setPendingMatchData(null);
                }}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processManualMatch}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Confirm Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Nationality Modal */}
      {showViewModal && selectedNationality && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Nationality Details</h2>
                    <p className="text-white/90 text-sm mt-1">Complete information</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedNationality(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Basic Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Nationality Name</p>
                    <p className="text-blue-900 dark:text-blue-100 font-semibold mt-1">{selectedNationality.nationalityName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Nationality Code</p>
                    <p className="text-blue-900 dark:text-blue-100 font-semibold mt-1">{selectedNationality.nationalityCode || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Country Name</p>
                    <p className="text-blue-900 dark:text-blue-100 font-semibold mt-1">{selectedNationality.countryName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Country Code</p>
                    <p className="text-blue-900 dark:text-blue-100 font-semibold mt-1">{selectedNationality.countryCode || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Supplier Info */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-4">Supplier Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Supplier Name</p>
                    <p className="text-purple-900 dark:text-purple-100 font-semibold mt-1">{selectedNationality.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Supplier Nationality ID</p>
                    <p className="text-purple-900 dark:text-purple-100 font-semibold mt-1">{selectedNationality.supplierNationalityId}</p>
                  </div>
                </div>
              </div>

              {/* ISO Match */}
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-4">ISO 3166-1 Match</h3>
                {(() => {
                  const isoEntry = WORLD_NATIONALITIES_ISO.find(iso => 
                    iso.nationalityName.toLowerCase() === selectedNationality.nationalityName.toLowerCase() ||
                    iso.countryName.toLowerCase() === selectedNationality.nationalityName.toLowerCase() ||
                    iso.isoCode.toLowerCase() === selectedNationality.nationalityCode?.toLowerCase() ||
                    iso.alpha3Code.toLowerCase() === selectedNationality.nationalityCode?.toLowerCase() ||
                    iso.alternativeNames.some(alt => alt.toLowerCase() === selectedNationality.nationalityName.toLowerCase())
                  );
                  
                  if (isoEntry) {
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">ISO Code (Alpha-2)</p>
                          <p className="text-green-900 dark:text-green-100 font-bold text-lg mt-1">{isoEntry.isoCode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">ISO Code (Alpha-3)</p>
                          <p className="text-green-900 dark:text-green-100 font-bold text-lg mt-1">{isoEntry.alpha3Code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Standard Nationality</p>
                          <p className="text-green-900 dark:text-green-100 font-semibold mt-1">{isoEntry.nationalityName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Country</p>
                          <p className="text-green-900 dark:text-green-100 font-semibold mt-1">{isoEntry.countryName}</p>
                        </div>
                        {isoEntry.alternativeNames.length > 0 && (
                          <div className="col-span-2">
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Alternative Names</p>
                            <p className="text-green-900 dark:text-green-100 mt-1">{isoEntry.alternativeNames.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <p className="text-gray-500 dark:text-gray-400">No ISO match found</p>
                  );
                })()}
              </div>

              {/* Status Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 border-l-4 border-gray-500 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Status Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Status</p>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded mt-1 ${
                      selectedNationality.status === 'mapped' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      selectedNationality.status === 'pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedNationality.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Confidence</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">
                      {selectedNationality.confidence ? `${selectedNationality.confidence}%` : 'N/A'}
                    </p>
                  </div>
                  {selectedNationality.masterId && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Master ID</p>
                      <p className="text-gray-900 dark:text-gray-100 font-mono font-semibold mt-1">{selectedNationality.masterId}</p>
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
                    <p className="text-indigo-900 dark:text-indigo-100 text-sm mt-1">{new Date(selectedNationality.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Updated At</p>
                    <p className="text-indigo-900 dark:text-indigo-100 text-sm mt-1">{new Date(selectedNationality.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedNationality(null);
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && nationalityToDelete && (
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
                  Are you sure you want to delete this nationality record?
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-700 dark:text-red-300">Nationality:</span>
                    <span className="text-red-900 dark:text-red-100">{nationalityToDelete.nationalityName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-700 dark:text-red-300">Supplier:</span>
                    <span className="text-red-900 dark:text-red-100">{nationalityToDelete.supplierName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-700 dark:text-red-300">Code:</span>
                    <span className="text-red-900 dark:text-red-100">{nationalityToDelete.nationalityCode || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> Deleting this nationality will remove it from the system permanently. 
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
                  setNationalityToDelete(null);
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

      {/* Move Nationality Modal */}
      {showMoveModal && nationalityToMove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white px-8 py-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Move Nationality</h2>
                  <p className="text-white/90 text-sm mt-1">Select the correct master nationality</p>
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
                    <span className="font-semibold text-orange-700 dark:text-orange-300">Nationality:</span>
                    <span className="text-orange-900 dark:text-orange-100 font-medium">{nationalityToMove.nationalityName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-orange-700 dark:text-orange-300">Supplier:</span>
                    <span className="text-orange-900 dark:text-orange-100">{nationalityToMove.supplierName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-orange-700 dark:text-orange-300">Code:</span>
                    <span className="text-orange-900 dark:text-orange-100 font-mono">{nationalityToMove.nationalityCode || 'N/A'}</span>
                  </div>
                  {nationalityToMove.masterId && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-700 dark:text-orange-300">Current Master:</span>
                      <span className="text-orange-900 dark:text-orange-100 font-mono">
                        {masterNationalities.find(m => m.id === nationalityToMove.masterId)?.name || nationalityToMove.masterId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Select New Master */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Select Correct Master Nationality
                </h3>
                
                {/* Search Filter */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search master nationalities..."
                    className="w-full px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => {
                      const searchValue = e.target.value.toLowerCase();
                      const filteredMasters = document.querySelectorAll('.master-option');
                      filteredMasters.forEach((el) => {
                        const text = el.textContent?.toLowerCase() || '';
                        (el as HTMLElement).style.display = text.includes(searchValue) ? 'flex' : 'none';
                      });
                    }}
                  />
                </div>

                {/* Masters Grid */}
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                  {masterNationalities
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((master) => {
                      const isoEntry = WORLD_NATIONALITIES_ISO.find(iso => iso.alpha3Code === master.standardCode);
                      const isSelected = selectedTargetMaster === master.id;
                      const isCurrent = nationalityToMove.masterId === master.id;

                      return (
                        <div
                          key={master.id}
                          className={`master-option flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
                          
                          <span className="text-2xl" title={isoEntry?.countryName}>
                            {isoEntry?.isoCode ? `${String.fromCodePoint(0x1F1E6 - 65 + isoEntry.isoCode.charCodeAt(0))}${String.fromCodePoint(0x1F1E6 - 65 + isoEntry.isoCode.charCodeAt(1))}` : '🌍'}
                          </span>
                          
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
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                {isoEntry?.isoCode || master.code}
                              </span>
                              <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                {master.standardCode}
                              </span>
                            </div>
                            {isoEntry?.alternativeNames && isoEntry.alternativeNames.length > 0 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Also: {isoEntry.alternativeNames.slice(0, 2).join(', ')}
                              </div>
                            )}
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
                    <strong>Note:</strong> Moving this nationality will update its master mapping and change its status to "mapped". 
                    This helps correct misplaced nationalities and maintain accurate data organization.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 rounded-b-2xl flex justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setNationalityToMove(null);
                  setSelectedTargetMaster('');
                }}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveConfirm}
                disabled={!selectedTargetMaster || selectedTargetMaster === nationalityToMove.masterId}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Move Nationality
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalityTab;