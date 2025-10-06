'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Search, Plus, Eye, Edit, Trash2, Download, Upload, RefreshCw, Check, X, AlertCircle, Map, Home } from 'lucide-react';

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

const CountryMapping = () => {
  const router = useRouter();
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

  // Mock suppliers data
  const suppliers = [
    { id: 'ebooking', name: 'eBooking' },
    { id: 'iwtx', name: 'IWTX' },
    { id: 'amadeus', name: 'Amadeus' },
    { id: 'sabre', name: 'Sabre' }
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
      supplierCountryId: 'UAE_001',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      currency: 'AED',
      continent: 'Asia',
      masterId: 'master_002',
      status: 'mapped',
      confidence: 98,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '5',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierCountryId: 'US001',
      countryName: 'United States of America',
      countryCode: 'US',
      currency: 'USD',
      continent: 'North America',
      status: 'review',
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
      // Simulate API calls to suppliers
      console.log('Fetching country data from suppliers...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadData();
    } catch (error) {
      console.error('Error fetching from suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = countryData.filter(item => {
    const matchesSearch = item.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.countryCode && item.countryCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSupplier = selectedSupplier === 'all' || item.supplierId === selectedSupplier;
    const matchesContinent = selectedContinent === 'all' || item.continent === selectedContinent;
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesContinent;
  });

  const stats = {
    total: countryData.length,
    pending: countryData.filter(item => item.status === 'pending').length,
    mapped: countryData.filter(item => item.status === 'mapped').length,
    review: countryData.filter(item => item.status === 'review').length
  };

  const continentStats = continents.map(continent => ({
    name: continent,
    count: countryData.filter(item => item.continent === continent).length,
    mapped: countryData.filter(item => item.continent === continent && item.status === 'mapped').length
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading country data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/wholesaler')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="h-5 w-5 mr-1" />
                Dashboard
              </button>
              <span className="text-gray-400">/</span>
              <button 
                onClick={() => router.push('/wholesaler/mapping')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Mapping
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Country</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="h-7 w-7 text-green-500" />
            Country Mapping
          </h1>
          <p className="text-gray-600 mt-1">
            Map and manage country data from all suppliers with regional insights
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchFromSuppliers}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Fetch from Suppliers
          </button>
          <button
            onClick={() => setShowCreateMaster(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Master
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Countries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Globe className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mapped</p>
              <p className="text-2xl font-bold text-green-600">{stats.mapped}</p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Need Review</p>
              <p className="text-2xl font-bold text-red-600">{stats.review}</p>
            </div>
            <Eye className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Continent Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Map className="h-5 w-5" />
          Regional Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {continentStats.map((continent) => (
            <div key={continent.name} className="text-center p-3 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-1">{continent.name}</h3>
              <p className="text-2xl font-bold text-blue-600">{continent.count}</p>
              <p className="text-sm text-gray-500">
                {continent.mapped} mapped
              </p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: continent.count > 0 ? `${(continent.mapped / continent.count) * 100}%` : '0%'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="mapped">Mapped</option>
            <option value="review">Need Review</option>
          </select>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Suppliers</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
          <select
            value={selectedContinent}
            onChange={(e) => setSelectedContinent(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Continents</option>
            {continents.map(continent => (
              <option key={continent} value={continent}>{continent}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Continent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{item.supplierName}</div>
                      <div className="text-sm text-gray-500 ml-2">ID: {item.supplierCountryId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.countryName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                      {item.countryCode || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                      {item.currency || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.continent}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      item.status === 'mapped' ? 'bg-green-100 text-green-800' :
                      item.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                      {item.confidence && ` (${item.confidence}%)`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCountry(item);
                          setShowMappingModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No country data found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or fetch data from suppliers</p>
          </div>
        )}
      </div>

      {/* Master Countries */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Master Countries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masterCountries.map((master) => (
            <div key={master.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{master.name}</h3>
                <div className="flex gap-2">
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {master.iso2Code}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {master.currency}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Region: {master.region}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                ISO3: {master.iso3Code}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Mapped: {master.mappedCount}</span>
                <span className="text-gray-500">Suppliers: {master.suppliers.length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default CountryMapping;