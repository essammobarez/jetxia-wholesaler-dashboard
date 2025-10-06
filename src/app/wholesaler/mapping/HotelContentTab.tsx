'use client';

import React, { useState, useEffect } from 'react';
import { 
  Hotel, Search, Plus, Eye, Edit, Trash2, Download, RefreshCw, Check, 
  AlertCircle, Navigation, Star, MapPin, Clock, Users, Bed, Wifi,
  Car, Coffee, Dumbbell, Waves, Utensils, Shield, Camera, Image,
  ChevronDown, Filter, Grid, List, ArrowUpDown, CheckCircle2,
  Building2, Bath, Maximize, Tv, AirVent, X
} from 'lucide-react';

interface RoomData {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierRoomId: string;
  hotelId: string;
  hotelName: string;
  roomName: string;
  roomType: string;
  roomCategory: string;
  description: string;
  maxOccupancy: number;
  bedType: string;
  bedCount: number;
  roomSize: number; // in sqm
  amenities: string[];
  images: string[];
  policies: {
    smoking: boolean;
    petFriendly: boolean;
    childFriendly: boolean;
    accessibility: boolean;
  };
  pricing: {
    basePrice: number;
    currency: string;
    taxIncluded: boolean;
  };
  availability: {
    totalRooms: number;
    availableRooms: number;
  };
  masterId?: string;
  status: 'pending' | 'mapped' | 'review' | 'rejected';
  confidence?: number;
  matchingFactors?: {
    nameMatch: number;
    typeMatch: number;
    amenitiesMatch: number;
    overallMatch: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface MasterRoom {
  id: string;
  name: string;
  type: string;
  category: string;
  standardName: string;
  description: string;
  amenities: string[];
  images: string[];
  mappedCount: number;
  suppliers: string[];
  avgPrice: number;
  avgSize: number;
  avgOccupancy: number;
  createdAt: string;
  updatedAt: string;
}

const HotelContentTab = () => {
  const [roomData, setRoomData] = useState<RoomData[]>([]);
  const [masterRooms, setMasterRooms] = useState<MasterRoom[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<RoomData[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedHotel, setSelectedHotel] = useState<string>('all');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [showMappingModal, setShowMappingModal] = useState<boolean>(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [groupedView, setGroupedView] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sample data
  useEffect(() => {
    const sampleRoomData: RoomData[] = [
      {
        id: '1',
        supplierId: 'booking',
        supplierName: 'Booking.com',
        supplierRoomId: 'BK_room_001',
        hotelId: 'hotel_001',
        hotelName: 'Hilton Cairo Nile Plaza',
        roomName: 'Deluxe River View Room',
        roomType: 'Deluxe',
        roomCategory: 'Standard',
        description: 'Spacious room with stunning Nile River views, modern amenities and luxury furnishings.',
        maxOccupancy: 3,
        bedType: 'King',
        bedCount: 1,
        roomSize: 35,
        amenities: ['Free WiFi', 'Air Conditioning', 'Minibar', 'Flat-screen TV', 'River View', 'Safe', 'Balcony'],
        images: [
          '/api/placeholder/400/300',
          '/api/placeholder/400/300',
          '/api/placeholder/400/300'
        ],
        policies: {
          smoking: false,
          petFriendly: false,
          childFriendly: true,
          accessibility: true
        },
        pricing: {
          basePrice: 180,
          currency: 'USD',
          taxIncluded: false
        },
        availability: {
          totalRooms: 25,
          availableRooms: 18
        },
        masterId: 'JETIXIA_ROOM_DLX_001',
        status: 'mapped',
        confidence: 92,
        matchingFactors: {
          nameMatch: 88,
          typeMatch: 95,
          amenitiesMatch: 90,
          overallMatch: 92
        },
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z'
      },
      {
        id: '2',
        supplierId: 'expedia',
        supplierName: 'Expedia',
        supplierRoomId: 'EXP_room_002',
        hotelId: 'hotel_001',
        hotelName: 'Hilton Cairo Nile Plaza',
        roomName: 'Deluxe Nile View',
        roomType: 'Deluxe', 
        roomCategory: 'Standard',
        description: 'Elegant room overlooking the Nile with premium amenities and comfortable furnishing.',
        maxOccupancy: 3,
        bedType: 'King',
        bedCount: 1,
        roomSize: 35,
        amenities: ['WiFi', 'AC', 'Mini Bar', 'TV', 'Nile View', 'Safe', 'Terrace'],
        images: [
          '/api/placeholder/400/300',
          '/api/placeholder/400/300'
        ],
        policies: {
          smoking: false,
          petFriendly: false,
          childFriendly: true,
          accessibility: true
        },
        pricing: {
          basePrice: 185,
          currency: 'USD',
          taxIncluded: true
        },
        availability: {
          totalRooms: 25,
          availableRooms: 12
        },
        masterId: 'JETIXIA_ROOM_DLX_001',
        status: 'mapped',
        confidence: 89,
        matchingFactors: {
          nameMatch: 92,
          typeMatch: 95,
          amenitiesMatch: 85,
          overallMatch: 89
        },
        createdAt: '2024-01-15T11:15:00Z',
        updatedAt: '2024-01-16T15:45:00Z'
      },
      {
        id: '3',
        supplierId: 'agoda',
        supplierName: 'Agoda',
        supplierRoomId: 'AGD_room_003',
        hotelId: 'hotel_001',
        hotelName: 'Hilton Cairo Nile Plaza',
        roomName: 'Superior Room with Nile View',
        roomType: 'Superior',
        roomCategory: 'Economy',
        description: 'Comfortable superior room with partial Nile views and essential amenities.',
        maxOccupancy: 2,
        bedType: 'Queen',
        bedCount: 1,
        roomSize: 28,
        amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Partial Nile View', 'Safe'],
        images: [
          '/api/placeholder/400/300'
        ],
        policies: {
          smoking: false,
          petFriendly: false,
          childFriendly: true,
          accessibility: false
        },
        pricing: {
          basePrice: 120,
          currency: 'USD',
          taxIncluded: false
        },
        availability: {
          totalRooms: 40,
          availableRooms: 32
        },
        status: 'pending',
        confidence: 75,
        matchingFactors: {
          nameMatch: 65,
          typeMatch: 80,
          amenitiesMatch: 70,
          overallMatch: 75
        },
        createdAt: '2024-01-15T12:00:00Z',
        updatedAt: '2024-01-16T16:30:00Z'
      },
      {
        id: '4',
        supplierId: 'hotelbeds',
        supplierName: 'HotelBeds',
        supplierRoomId: 'HB_room_004',
        hotelId: 'hotel_002',
        hotelName: 'Four Seasons Cairo',
        roomName: 'Presidential Suite',
        roomType: 'Suite',
        roomCategory: 'Luxury',
        description: 'Luxurious presidential suite with panoramic city views, separate living area and premium amenities.',
        maxOccupancy: 6,
        bedType: 'King + Sofa bed',
        bedCount: 2,
        roomSize: 120,
        amenities: ['Free WiFi', 'Air Conditioning', 'Minibar', 'Flat-screen TV', 'City View', 'Safe', 'Balcony', 'Jacuzzi', 'Butler Service', 'Living Room'],
        images: [
          '/api/placeholder/400/300',
          '/api/placeholder/400/300',
          '/api/placeholder/400/300',
          '/api/placeholder/400/300'
        ],
        policies: {
          smoking: true,
          petFriendly: true,
          childFriendly: true,
          accessibility: true
        },
        pricing: {
          basePrice: 850,
          currency: 'USD',
          taxIncluded: false
        },
        availability: {
          totalRooms: 3,
          availableRooms: 1
        },
        status: 'pending',
        confidence: 0,
        createdAt: '2024-01-15T13:45:00Z',
        updatedAt: '2024-01-16T17:10:00Z'
      }
    ];

    const sampleMasterRooms: MasterRoom[] = [
      {
        id: 'JETIXIA_ROOM_DLX_001',
        name: 'Deluxe River View Room',
        type: 'Deluxe',
        category: 'Standard',
        standardName: 'Deluxe Room - River/Nile View',
        description: 'Spacious deluxe room with stunning river views, modern amenities and luxury furnishings.',
        amenities: ['Free WiFi', 'Air Conditioning', 'Minibar', 'Flat-screen TV', 'River View', 'Safe', 'Balcony'],
        images: [
          '/api/placeholder/400/300',
          '/api/placeholder/400/300',
          '/api/placeholder/400/300'
        ],
        mappedCount: 2,
        suppliers: ['booking', 'expedia'],
        avgPrice: 182.5,
        avgSize: 35,
        avgOccupancy: 3,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-16T18:00:00Z'
      }
    ];

    setRoomData(sampleRoomData);
    setMasterRooms(sampleMasterRooms);
    setFilteredRooms(sampleRoomData);
  }, []);

  // Group rooms by type and hotel
  const groupRoomsByType = (rooms: RoomData[]) => {
    const grouped: { [key: string]: RoomData[] } = {};
    rooms.forEach(room => {
      const groupKey = `${room.roomType}_${room.hotelName}`;
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(room);
    });
    return grouped;
  };

  // Get unique values for filters
  const getUniqueSuppliers = () => Array.from(new Set(roomData.map(room => room.supplierName)));
  const getUniqueHotels = () => Array.from(new Set(roomData.map(room => room.hotelName)));
  const getUniqueRoomTypes = () => Array.from(new Set(roomData.map(room => room.roomType)));

  // Filter rooms
  useEffect(() => {
    let filtered = roomData;

    if (selectedSupplier !== 'all') {
      filtered = filtered.filter(room => room.supplierName === selectedSupplier);
    }

    if (selectedHotel !== 'all') {
      filtered = filtered.filter(room => room.hotelName === selectedHotel);
    }

    if (selectedRoomType !== 'all') {
      filtered = filtered.filter(room => room.roomType === selectedRoomType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(room => room.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRooms(filtered);
  }, [roomData, selectedSupplier, selectedHotel, selectedRoomType, selectedStatus, searchTerm]);

  const handleToggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const RoomCard = ({ room }: { room: RoomData }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Room Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={room.images[0] || '/api/placeholder/400/300'}
          alt={room.roomName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            room.status === 'mapped' ? 'bg-green-100 text-green-800' :
            room.status === 'pending' ? 'bg-orange-100 text-orange-800' :
            room.status === 'review' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {room.status}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 text-xs font-semibold bg-black/70 text-white rounded">
            {room.images.length} <Camera className="inline w-3 h-3 ml-1" />
          </span>
        </div>
        {room.confidence && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2 py-1 text-xs font-semibold bg-white/90 text-gray-800 rounded">
              {room.confidence}% match
            </span>
          </div>
        )}
      </div>

      {/* Room Details */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{room.roomName}</h3>
            <p className="text-sm text-gray-600">{room.hotelName}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-blue-600">${room.pricing.basePrice}</p>
            <p className="text-xs text-gray-500">per night</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {room.maxOccupancy}
          </div>
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            {room.bedCount} {room.bedType}
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            {room.roomSize}m²
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {room.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {room.supplierName}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedRoom(room);
                setShowMappingModal(true);
              }}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              View
            </button>
            <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
              <Edit className="w-3 h-3" />
              Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              🏨 Hotel Content Management
            </h1>
            <p className="text-purple-100 text-lg">
              Match and manage room types, amenities, and content across all suppliers
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">{filteredRooms.length}</div>
              <div className="text-purple-200 text-sm">Total Rooms</div>
            </div>
            <Hotel className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Rooms</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by room name, hotel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Suppliers</option>
              {getUniqueSuppliers().map(supplier => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
            <select
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Hotels</option>
              {getUniqueHotels().map(hotel => (
                <option key={hotel} value={hotel}>{hotel}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
            <select
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {getUniqueRoomTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="mapped">Mapped</option>
              <option value="pending">Pending</option>
              <option value="review">Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setGroupedView(!groupedView)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                groupedView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Grouped View
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredRooms.length} rooms
          </div>
        </div>
      </div>

      {/* Rooms Display */}
      {groupedView ? (
        <div className="space-y-6">
          {Object.entries(groupRoomsByType(filteredRooms)).map(([groupKey, rooms]) => {
            const [roomType, hotelName] = groupKey.split('_');
            const mapped = rooms.filter(r => r.status === 'mapped').length;
            const pending = rooms.filter(r => r.status === 'pending').length;
            const masterRoom = rooms.find(r => r.masterId)?.masterId ? 
              masterRooms.find(m => m.id === rooms.find(r => r.masterId)?.masterId) : null;

            return (
              <div key={groupKey} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleToggleGroup(groupKey)}
                >
                  <div className="flex items-center space-x-4">
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transform transition-transform ${
                        expandedGroups.has(groupKey) ? 'rotate-180' : ''
                      }`}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{roomType} Rooms</h3>
                      <p className="text-sm text-gray-600">{hotelName}</p>
                    </div>
                    {masterRoom && (
                      <div className="flex items-center gap-2">
                        <span>•</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                          Master: {masterRoom.standardName}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{rooms.length}</div>
                        <div className="text-gray-500">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{mapped}</div>
                        <div className="text-gray-500">Mapped</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{pending}</div>
                        <div className="text-gray-500">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedGroups.has(groupKey) && (
                  <div className="border-t border-gray-100">
                    <div className="p-6">
                      <div className={`grid gap-6 ${
                        viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                      }`}>
                        {rooms.map(room => (
                          <RoomCard key={room.id} room={room} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className={`grid gap-6 ${
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}>
            {filteredRooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      )}

      {/* Room Details Modal */}
      {showMappingModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedRoom.roomName}</h2>
                  <p className="text-purple-100">{selectedRoom.hotelName}</p>
                </div>
                <button
                  onClick={() => setShowMappingModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Room Images */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Room Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedRoom.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Room ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>

              {/* Room Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Room Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Type:</span>
                      <span className="font-medium">{selectedRoom.roomType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{selectedRoom.roomCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Occupancy:</span>
                      <span className="font-medium">{selectedRoom.maxOccupancy} guests</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bed Type:</span>
                      <span className="font-medium">{selectedRoom.bedCount} {selectedRoom.bedType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Size:</span>
                      <span className="font-medium">{selectedRoom.roomSize} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">${selectedRoom.pricing.basePrice} {selectedRoom.pricing.currency}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Availability & Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        selectedRoom.status === 'mapped' ? 'bg-green-100 text-green-800' :
                        selectedRoom.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedRoom.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available Rooms:</span>
                      <span className="font-medium">{selectedRoom.availability.availableRooms}/{selectedRoom.availability.totalRooms}</span>
                    </div>
                    {selectedRoom.confidence && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Match Confidence:</span>
                        <span className="font-medium">{selectedRoom.confidence}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supplier:</span>
                      <span className="font-medium">{selectedRoom.supplierName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRoom.amenities.map((amenity, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedRoom.description}</p>
              </div>

              {/* Policies */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Policies</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg text-center ${selectedRoom.policies.smoking ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    <div className="font-medium">{selectedRoom.policies.smoking ? 'Smoking' : 'Non-Smoking'}</div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${selectedRoom.policies.petFriendly ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="font-medium">{selectedRoom.policies.petFriendly ? 'Pet Friendly' : 'No Pets'}</div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${selectedRoom.policies.childFriendly ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="font-medium">{selectedRoom.policies.childFriendly ? 'Child Friendly' : 'Adults Only'}</div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${selectedRoom.policies.accessibility ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="font-medium">{selectedRoom.policies.accessibility ? 'Accessible' : 'Not Accessible'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex items-center justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Map Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelContentTab;