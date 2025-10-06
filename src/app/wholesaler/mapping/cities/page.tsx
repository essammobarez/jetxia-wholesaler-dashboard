'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, Plus, Eye, Edit, Trash2, Download, Upload, RefreshCw, Check, X, AlertCircle, Globe, Navigation, Home } from 'lucide-react';

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

const CitiesMapping = () => {
  const router = useRouter();
  const [cityData, setCityData] = useState<CityData[]>([]);
  const [masterCities, setMasterCities] = useState<MasterCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'mapped' | 'review'>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [showCreateMaster, setShowCreateMaster] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);

  // Mock suppliers data
  const suppliers = [
    { id: 'ebooking', name: 'eBooking' },
    { id: 'iwtx', name: 'IWTX' },
    { id: 'amadeus', name: 'Amadeus' },
    { id: 'sabre', name: 'Sabre' }
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
      supplierCityId: 'CAIRO_001',
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
      supplierCityId: 'CAI_CITY',
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
      supplierCityId: 'DXB_001',
      cityName: 'Dubai',
      cityCode: 'DXB',
      countryName: 'United Arab Emirates',
      countryCode: 'AE',
      stateProvince: 'Dubai',
      timezone: 'Asia/Dubai',
      coordinates: { latitude: 25.2048, longitude: 55.2708 },
      masterId: 'master_002',
      status: 'mapped',
      confidence: 99,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '5',
      supplierId: 'ebooking',
      supplierName: 'eBooking',
      supplierCityId: 'NYC_001',
      cityName: 'New York City',
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
      id: '6',
      supplierId: 'iwtx',
      supplierName: 'IWTX',
      supplierCityId: 'LON_001',
      cityName: 'London',
      cityCode: 'LON',
      countryName: 'United Kingdom',
      countryCode: 'GB',
      stateProvince: 'England',
      timezone: 'Europe/London',
      coordinates: { latitude: 51.5074, longitude: -0.1278 },
      status: 'review',
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
      population: 20900000,
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
      setCityData(mockCityData);
      setMasterCities(mockMasterCities);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromSuppliers = async () => {
    setLoading(true);
    try {
      console.log('Fetching city data from suppliers...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadData();
    } catch (error) {
      console.error('Error fetching from suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (coord1: {latitude: number, longitude: number}, coord2: {latitude: number, longitude: number}) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findSimilarCities = (city: CityData) => {
    return cityData.filter(other => 
      other.id !== city.id &&
      other.countryCode === city.countryCode &&
      (other.cityName.toLowerCase().includes(city.cityName.toLowerCase()) ||
       city.cityName.toLowerCase().includes(other.cityName.toLowerCase()) ||
       (city.coordinates && other.coordinates && 
        calculateDistance(city.coordinates, other.coordinates) < 50))
    );
  };

  const filteredData = cityData.filter(item => {
    const matchesSearch = item.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.cityCode && item.cityCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSupplier = selectedSupplier === 'all' || item.supplierId === selectedSupplier;
    const matchesCountry = selectedCountry === 'all' || item.countryCode === selectedCountry;
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesCountry;
  });

  const stats = {
    total: cityData.length,
    pending: cityData.filter(item => item.status === 'pending').length,
    mapped: cityData.filter(item => item.status === 'mapped').length,
    review: cityData.filter(item => item.status === 'review').length
  };

  const countries = Array.from(new Set(cityData.map(item => item.countryCode))).map(code => {
    const city = cityData.find(item => item.countryCode === code);
    return { code, name: city?.countryName || code };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p>Loading cities data...</p>
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
              <span className="text-gray-900 font-medium">Cities</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-7 w-7 text-purple-500" />
            Cities Mapping
          </h1>
          <p className="text-gray-600 mt-1">
            Map and manage city data from all suppliers with location-based matching
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
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
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
              <p className="text-sm font-medium text-gray-600">Total Cities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-500" />
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

      {/* Country Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Country Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {countries.map((country) => {
            const countryStats = {
              total: cityData.filter(item => item.countryCode === country.code).length,
              mapped: cityData.filter(item => item.countryCode === country.code && item.status === 'mapped').length
            };
            return (
              <div key={country.code} className="text-center p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1">{country.name}</h3>
                <p className="text-xl font-bold text-purple-600">{countryStats.total}</p>
                <p className="text-sm text-gray-500">
                  {countryStats.mapped} mapped
                </p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: countryStats.total > 0 ? `${(countryStats.mapped / countryStats.total) * 100}%` : '0%'
                    }}
                  />
                </div>
              </div>
            );
          })}
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
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="mapped">Mapped</option>
            <option value="review">Need Review</option>
          </select>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Suppliers</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Countries</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>{country.name}</option>
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
                  City Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coordinates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timezone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Similar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => {
                const similarCities = findSimilarCities(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{item.supplierName}</div>
                        <div className="text-sm text-gray-500 ml-2">ID: {item.supplierCityId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{item.cityName}</div>
                      <div className="text-sm text-gray-500">
                        {item.cityCode && (
                          <span className="px-2 py-1 text-xs bg-gray-100 rounded mr-1">
                            {item.cityCode}
                          </span>
                        )}
                        {item.stateProvince}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.countryName}</div>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {item.countryCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.coordinates ? (
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {item.coordinates.latitude.toFixed(4)}, {item.coordinates.longitude.toFixed(4)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No coordinates</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.timezone || 'N/A'}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-1 text-xs rounded ${
                          similarCities.length > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {similarCities.length}
                        </span>
                        {similarCities.length > 0 && (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
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
                          className="text-purple-600 hover:text-purple-900"
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
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No city data found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or fetch data from suppliers</p>
          </div>
        )}
      </div>

      {/* Master Cities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Master Cities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masterCities.map((master) => (
            <div key={master.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{master.name}</h3>
                <div className="flex gap-2">
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {master.code}
                  </span>
                  {master.iataCode && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {master.iataCode}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {master.countryName} ({master.countryCode})
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <Navigation className="h-3 w-3" />
                {master.coordinates.latitude.toFixed(2)}, {master.coordinates.longitude.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Timezone: {master.timezone}
              </p>
              {master.population && (
                <p className="text-sm text-gray-600 mb-2">
                  Population: {master.population.toLocaleString()}
                </p>
              )}
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

export default CitiesMapping;