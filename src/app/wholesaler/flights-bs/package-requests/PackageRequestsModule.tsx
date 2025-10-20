'use client';

import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Edit,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Plane,
  Hotel,
  Clock,
  Mail,
  Phone,
  User,
  AlertTriangle,
  X,
  Save,
  ArrowLeft,
  Info,
  FileText,
  MessageSquare,
  Star
} from 'lucide-react';

// Types
interface PackageRequest {
  id: string;
  requestDate: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    nationality: string;
  };
  package: {
    id: string;
    title: string;
    destination: string;
    duration: string;
    startDate: string;
    endDate: string;
  };
  flight: {
    airline: string;
    flightNumber: string;
    from: string;
    to: string;
    departureDate: string;
    departureTime: string;
    returnDate: string;
    returnTime: string;
    class: string;
  };
  hotel: {
    name: string;
    address: string;
    rating: number;
    roomType: string;
    checkIn: string;
    checkOut: string;
    nights: number;
  };
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  roomPreference: 'Single' | 'Double' | 'Triple' | 'Mixed';
  specialRequests: string;
  pricing: {
    basePrice: number;
    totalPrice: number;
    discount: number;
  };
  financials: {
    flightCost: number;
    hotelCost: number;
    totalCost: number;
    markup: number;
    sellingPrice: number;
    airlineCommission: {
      type: 'fixed' | 'percentage';
      value: number;
      amount: number;
    };
    agencyCommission: {
      type: 'fixed' | 'percentage';
      value: number;
      amount: number;
    };
    netProfit: number;
  };
  status: 'Pending' | 'Confirmed' | 'Rejected' | 'Under Review';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

// Mock Data
const mockRequests: PackageRequest[] = [
  {
    id: 'REQ-001',
    requestDate: '2025-10-19T10:30:00',
    customer: {
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@email.com',
      phone: '+20 100 123 4567',
      nationality: 'Egypt 🇪🇬'
    },
    package: {
      id: 'PKG-001',
      title: 'Luxury Dubai Experience',
      destination: 'Dubai, UAE',
      duration: '5 Days / 4 Nights',
      startDate: '2025-11-15',
      endDate: '2025-11-19'
    },
    flight: {
      airline: 'Emirates',
      flightNumber: 'EK 924',
      from: 'Cairo (CAI)',
      to: 'Dubai (DXB)',
      departureDate: '2025-11-15',
      departureTime: '14:30',
      returnDate: '2025-11-19',
      returnTime: '09:15',
      class: 'Economy'
    },
    hotel: {
      name: 'The Ritz-Carlton, Dubai',
      address: 'Al Mamsha Street, Jumeirah Beach Residence, Dubai',
      rating: 5,
      roomType: 'Deluxe Room with Sea View',
      checkIn: '2025-11-15',
      checkOut: '2025-11-19',
      nights: 4
    },
    travelers: {
      adults: 2,
      children: 1,
      infants: 0
    },
    roomPreference: 'Double',
    specialRequests: 'Need airport pickup service and halal food options',
    pricing: {
      basePrice: 4500,
      totalPrice: 4275,
      discount: 225
    },
    financials: {
      flightCost: 1800,
      hotelCost: 2200,
      totalCost: 4000,
      markup: 500,
      sellingPrice: 4500,
      airlineCommission: {
        type: 'percentage',
        value: 10,
        amount: 400
      },
      agencyCommission: {
        type: 'percentage',
        value: 5,
        amount: 225
      },
      netProfit: 675
    },
    status: 'Pending',
    priority: 'High'
  },
  {
    id: 'REQ-002',
    requestDate: '2025-10-19T09:15:00',
    customer: {
      name: 'Sara Mohamed',
      email: 'sara.mohamed@email.com',
      phone: '+20 122 987 6543',
      nationality: 'Egypt 🇪🇬'
    },
    package: {
      id: 'PKG-002',
      title: 'Maldives Paradise Retreat',
      destination: 'Malé, Maldives',
      duration: '7 Days / 6 Nights',
      startDate: '2025-12-01',
      endDate: '2025-12-07'
    },
    flight: {
      airline: 'Emirates',
      flightNumber: 'EK 652',
      from: 'Cairo (CAI)',
      to: 'Malé (MLE)',
      departureDate: '2025-12-01',
      departureTime: '21:45',
      returnDate: '2025-12-07',
      returnTime: '10:15',
      class: 'Business'
    },
    hotel: {
      name: 'Conrad Maldives Rangali Island',
      address: 'Rangali Island, Alif Dhaal Atoll',
      rating: 5,
      roomType: 'Beach Villa',
      checkIn: '2025-12-01',
      checkOut: '2025-12-07',
      nights: 6
    },
    travelers: {
      adults: 2,
      children: 0,
      infants: 0
    },
    roomPreference: 'Single',
    specialRequests: 'Honeymoon package - need romantic setup',
    pricing: {
      basePrice: 8500,
      totalPrice: 8075,
      discount: 425
    },
    financials: {
      flightCost: 4200,
      hotelCost: 3600,
      totalCost: 7800,
      markup: 700,
      sellingPrice: 8500,
      airlineCommission: {
        type: 'fixed',
        value: 350,
        amount: 350
      },
      agencyCommission: {
        type: 'percentage',
        value: 5,
        amount: 425
      },
      netProfit: 625
    },
    status: 'Under Review',
    priority: 'Medium'
  },
  {
    id: 'REQ-003',
    requestDate: '2025-10-18T16:45:00',
    customer: {
      name: 'Khaled Ibrahim',
      email: 'khaled.ibrahim@email.com',
      phone: '+20 111 555 8888',
      nationality: 'Egypt 🇪🇬'
    },
    package: {
      id: 'PKG-001',
      title: 'Luxury Dubai Experience',
      destination: 'Dubai, UAE',
      duration: '5 Days / 4 Nights',
      startDate: '2025-11-20',
      endDate: '2025-11-24'
    },
    flight: {
      airline: 'Emirates',
      flightNumber: 'EK 924',
      from: 'Cairo (CAI)',
      to: 'Dubai (DXB)',
      departureDate: '2025-11-20',
      departureTime: '14:30',
      returnDate: '2025-11-24',
      returnTime: '09:15',
      class: 'Economy'
    },
    hotel: {
      name: 'Atlantis The Palm',
      address: 'Crescent Road, The Palm, Dubai',
      rating: 5,
      roomType: 'Family Suite',
      checkIn: '2025-11-20',
      checkOut: '2025-11-24',
      nights: 4
    },
    travelers: {
      adults: 4,
      children: 2,
      infants: 1
    },
    roomPreference: 'Mixed',
    specialRequests: 'Family trip - need connecting rooms',
    pricing: {
      basePrice: 9000,
      totalPrice: 8550,
      discount: 450
    },
    financials: {
      flightCost: 4500,
      hotelCost: 3200,
      totalCost: 7700,
      markup: 1300,
      sellingPrice: 9000,
      airlineCommission: {
        type: 'percentage',
        value: 8,
        amount: 616
      },
      agencyCommission: {
        type: 'percentage',
        value: 5,
        amount: 450
      },
      netProfit: 1466
    },
    status: 'Confirmed',
    priority: 'Low'
  },
  {
    id: 'REQ-004',
    requestDate: '2025-10-19T11:20:00',
    customer: {
      name: 'Fatima Ali',
      email: 'fatima.ali@email.com',
      phone: '+20 128 444 9999',
      nationality: 'Egypt 🇪🇬'
    },
    package: {
      id: 'PKG-003',
      title: 'Istanbul Cultural Tour',
      destination: 'Istanbul, Turkey',
      duration: '4 Days / 3 Nights',
      startDate: '2025-10-28',
      endDate: '2025-10-31'
    },
    flight: {
      airline: 'Turkish Airlines',
      flightNumber: 'TK 690',
      from: 'Cairo (CAI)',
      to: 'Istanbul (IST)',
      departureDate: '2025-10-28',
      departureTime: '08:45',
      returnDate: '2025-10-31',
      returnTime: '12:30',
      class: 'Economy'
    },
    hotel: {
      name: 'Four Seasons Istanbul at Sultanahmet',
      address: 'Tevkifhane Sok. No:1, Sultanahmet, Istanbul',
      rating: 5,
      roomType: 'Deluxe Room',
      checkIn: '2025-10-28',
      checkOut: '2025-10-31',
      nights: 3
    },
    travelers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    roomPreference: 'Single',
    specialRequests: 'Solo traveler - prefer female guide',
    pricing: {
      basePrice: 2800,
      totalPrice: 2660,
      discount: 140
    },
    financials: {
      flightCost: 950,
      hotelCost: 1450,
      totalCost: 2400,
      markup: 400,
      sellingPrice: 2800,
      airlineCommission: {
        type: 'percentage',
        value: 10,
        amount: 240
      },
      agencyCommission: {
        type: 'fixed',
        value: 140,
        amount: 140
      },
      netProfit: 500
    },
    status: 'Pending',
    priority: 'Urgent'
  }
];

const PackageRequestsModule = () => {
  const [requests, setRequests] = useState<PackageRequest[]>(mockRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<PackageRequest | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'view' | 'edit'>('list');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.package.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Confirmed': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
      'Rejected': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
      'Under Review': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300'
    };
    return styles[status as keyof typeof styles] || styles['Pending'];
  };

  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    const styles = {
      'Low': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300',
      'Medium': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
      'High': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300',
      'Urgent': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300'
    };
    return styles[priority as keyof typeof styles] || styles['Medium'];
  };

  // Handle actions
  const handleConfirm = (request: PackageRequest) => {
    setSelectedRequest(request);
    setShowConfirmModal(true);
  };

  const handleReject = (request: PackageRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const handleView = (request: PackageRequest) => {
    setSelectedRequest(request);
    setViewMode('view');
  };

  const handleEdit = (request: PackageRequest) => {
    setSelectedRequest(request);
    setViewMode('edit');
  };

  const confirmRequest = (notes: string) => {
    if (selectedRequest) {
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'Confirmed' as const }
          : req
      ));
      setShowConfirmModal(false);
      setSelectedRequest(null);
    }
  };

  const rejectRequest = (reason: string) => {
    if (selectedRequest) {
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'Rejected' as const }
          : req
      ));
      setShowRejectModal(false);
      setSelectedRequest(null);
    }
  };

  // View Request Detail
  if (viewMode === 'view' && selectedRequest) {
    return <ViewRequestDetail request={selectedRequest} onBack={() => { setViewMode('list'); setSelectedRequest(null); }} />;
  }

  // Edit Request
  if (viewMode === 'edit' && selectedRequest) {
    return <EditRequest request={selectedRequest} onBack={() => { setViewMode('list'); setSelectedRequest(null); }} onSave={(updated) => {
      setRequests(prev => prev.map(req => req.id === updated.id ? updated : req));
      setViewMode('list');
      setSelectedRequest(null);
    }} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Package className="w-8 h-8 mr-3 text-purple-600" />
            Package Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer package booking requests
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg font-semibold">
            {filteredRequests.length} Requests
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card-modern p-6 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Search & Filters
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600 dark:text-purple-400" />
            <input
              type="text"
              placeholder="🔍 Search by customer, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-base font-medium bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900/30 shadow-sm hover:shadow-md transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/30 shadow-sm hover:shadow-md cursor-pointer transition-all"
            >
              <option value="all">📋 All Status</option>
              <option value="Pending">⏳ Pending</option>
              <option value="Under Review">🔍 Under Review</option>
              <option value="Confirmed">✅ Confirmed</option>
              <option value="Rejected">❌ Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              Priority
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-4 py-3.5 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 rounded-xl focus:border-red-500 dark:focus:border-red-400 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900/30 shadow-sm hover:shadow-md cursor-pointer transition-all"
            >
              <option value="all">🎯 All Priorities</option>
              <option value="Low">🔵 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🟠 High</option>
              <option value="Urgent">🔴 Urgent</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t-2 border-purple-200 dark:border-purple-700">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Active Filters:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 rounded-full text-sm font-semibold flex items-center">
                Search: {searchTerm}
                <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setSearchTerm('')} />
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 rounded-full text-sm font-semibold flex items-center">
                Status: {filterStatus}
                <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setFilterStatus('all')} />
              </span>
            )}
            {filterPriority !== 'all' && (
              <span className="px-3 py-1 bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 rounded-full text-sm font-semibold flex items-center">
                Priority: {filterPriority}
                <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setFilterPriority('all')} />
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterPriority('all');
              }}
              className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="card-modern p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No requests found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No package requests available at the moment'
              }
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="card-modern p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {request.id}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getPriorityBadge(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(request.requestDate).toLocaleString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-600" />
                    Customer Information
                  </h4>
                  <div className="pl-6 space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {request.customer.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {request.customer.email}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {request.customer.phone}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {request.customer.nationality}
                    </p>
                  </div>
                </div>

                {/* Package Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-purple-600" />
                    Package Details
                  </h4>
                  <div className="pl-6 space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {request.package.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {request.package.destination}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(request.package.startDate).toLocaleDateString()} - {new Date(request.package.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {request.travelers.adults} Adults, {request.travelers.children} Children, {request.travelers.infants} Infants
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Base Price:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${request.pricing.basePrice}
                    </span>
                  </div>
                  {request.pricing.discount > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                        -${request.pricing.discount}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      ${request.pricing.totalPrice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700 flex items-center justify-end space-x-3">
                <button
                  onClick={() => handleView(request)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center transition-colors shadow-md hover:shadow-lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </button>
                <button
                  onClick={() => {
                    console.log('Package Request clicked for:', request.id);
                    alert(`Package Request Details\n\nRequest ID: ${request.id}\nCustomer: ${request.customer.name}\nPackage: ${request.package.title}\nStatus: ${request.status}`);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold flex items-center transition-all shadow-md hover:shadow-lg"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Package Request
                </button>
                {request.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleConfirm(request)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold flex items-center transition-colors shadow-md hover:shadow-lg"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center transition-colors shadow-md hover:shadow-lg"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleEdit(request)}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold flex items-center transition-colors shadow-md hover:shadow-lg"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedRequest && (
        <ConfirmModal
          request={selectedRequest}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmRequest}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <RejectModal
          request={selectedRequest}
          onClose={() => setShowRejectModal(false)}
          onReject={rejectRequest}
        />
      )}
    </div>
  );
};

// View Request Detail Component
const ViewRequestDetail = ({ request, onBack }: { request: PackageRequest; onBack: () => void }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Requests
        </button>
        <div className="flex items-center space-x-3">
          <span className={`px-4 py-2 rounded-lg text-sm font-bold border-2 ${request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : request.status === 'Confirmed' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
            {request.status}
          </span>
        </div>
      </div>

      {/* Request ID and Date */}
      <div className="card-modern p-6 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Request {request.id}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Received on {new Date(request.requestDate).toLocaleString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="card-modern p-6 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="w-6 h-6 mr-2 text-blue-600" />
            Customer Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Name</label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{request.customer.name}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Email</label>
              <p className="text-base text-gray-900 dark:text-white flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {request.customer.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Phone</label>
              <p className="text-base text-gray-900 dark:text-white flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {request.customer.phone}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Nationality</label>
              <p className="text-base text-gray-900 dark:text-white flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {request.customer.nationality}
              </p>
            </div>
          </div>
        </div>

        {/* Package Information */}
        <div className="card-modern p-6 border-2 border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="w-6 h-6 mr-2 text-purple-600" />
            Package Details
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Package Title</label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{request.package.title}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Destination</label>
              <p className="text-base text-gray-900 dark:text-white flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {request.package.destination}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Duration</label>
              <p className="text-base text-gray-900 dark:text-white flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {request.package.duration}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Travel Dates</label>
              <p className="text-base text-gray-900 dark:text-white">
                {new Date(request.package.startDate).toLocaleDateString()} - {new Date(request.package.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Details */}
      <div className="card-modern p-6 border-2 border-sky-200 dark:border-sky-800 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Plane className="w-6 h-6 mr-2 text-sky-600" />
          Flight Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Airline & Flight Number</label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{request.flight.airline} - {request.flight.flightNumber}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Route</label>
              <p className="text-base text-gray-900 dark:text-white">{request.flight.from} → {request.flight.to}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Class</label>
              <span className="inline-block px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 rounded-full text-sm font-semibold">
                {request.flight.class}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-sky-200 dark:border-sky-700">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Departure</label>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {new Date(request.flight.departureDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{request.flight.departureTime}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-sky-200 dark:border-sky-700">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Return</label>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {new Date(request.flight.returnDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{request.flight.returnTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Details */}
      <div className="card-modern p-6 border-2 border-pink-200 dark:border-pink-800 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Hotel className="w-6 h-6 mr-2 text-pink-600" />
          Hotel Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Hotel Name</label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{request.hotel.name}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Address</label>
              <p className="text-base text-gray-900 dark:text-white">{request.hotel.address}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Rating</label>
              <div className="flex items-center">
                {Array.from({ length: request.hotel.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Room Type</label>
              <p className="text-base text-gray-900 dark:text-white">{request.hotel.roomType}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-pink-200 dark:border-pink-700">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Check-in</label>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                  {new Date(request.hotel.checkIn).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-pink-200 dark:border-pink-700">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Check-out</label>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                  {new Date(request.hotel.checkOut).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-center">
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{request.hotel.nights} Nights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Travelers Information */}
      <div className="card-modern p-6 border-2 border-green-200 dark:border-green-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2 text-green-600" />
          Travelers
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-700">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{request.travelers.adults}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-semibold">Adults</p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{request.travelers.children}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-semibold">Children</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{request.travelers.infants}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-semibold">Infants</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t-2 border-green-200 dark:border-green-700">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Room Preference</label>
          <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">{request.roomPreference}</p>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="card-modern p-6 border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-indigo-600" />
          Financial Breakdown
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cost Breakdown */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Cost Breakdown</h3>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                <Plane className="w-4 h-4 mr-2" />
                Flight Cost
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">${request.financials.flightCost}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                <Hotel className="w-4 h-4 mr-2" />
                Hotel Cost
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">${request.financials.hotelCost}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg border-2 border-indigo-300 dark:border-indigo-700">
              <span className="text-gray-800 dark:text-gray-200 font-bold">Total Cost</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${request.financials.totalCost}</span>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Revenue & Commissions</h3>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Markup</span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">+${request.financials.markup}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Selling Price</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">${request.financials.sellingPrice}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div>
                <span className="text-gray-600 dark:text-gray-400 block">Airline Commission</span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {request.financials.airlineCommission.type === 'percentage' 
                    ? `${request.financials.airlineCommission.value}% from airline` 
                    : `$${request.financials.airlineCommission.value} fixed from airline`}
                </span>
              </div>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">+${request.financials.airlineCommission.amount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div>
                <span className="text-gray-600 dark:text-gray-400 block">Agency Commission</span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {request.financials.agencyCommission.type === 'percentage' 
                    ? `${request.financials.agencyCommission.value}% to agency` 
                    : `$${request.financials.agencyCommission.value} fixed to agency`}
                </span>
              </div>
              <span className="text-lg font-semibold text-red-600 dark:text-red-400">-${request.financials.agencyCommission.amount}</span>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="mt-6 pt-6 border-t-2 border-indigo-200 dark:border-indigo-700">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-xl border-2 border-indigo-300 dark:border-indigo-600">
            <span className="text-xl font-bold text-gray-900 dark:text-white">Net Profit</span>
            <span className={`text-3xl font-bold ${request.financials.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {request.financials.netProfit >= 0 ? '+' : ''}${request.financials.netProfit}
            </span>
          </div>
          {request.financials.netProfit < 0 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Warning: This package is running at a loss
            </p>
          )}
        </div>
      </div>

      {/* Special Requests */}
      {request.specialRequests && (
        <div className="card-modern p-6 border-2 border-orange-200 dark:border-orange-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-orange-600" />
            Special Requests
          </h2>
          <p className="text-base text-gray-900 dark:text-white bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            {request.specialRequests}
          </p>
        </div>
      )}
    </div>
  );
};

// Edit Request Component
const EditRequest = ({ request, onBack, onSave }: { request: PackageRequest; onBack: () => void; onSave: (request: PackageRequest) => void }) => {
  const [formData, setFormData] = useState(request);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Requests
        </button>
      </div>

      <div className="card-modern p-6 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Request {request.id}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="card-modern p-6 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="w-6 h-6 mr-2 text-blue-600" />
            Customer Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.customer.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  customer: { ...prev.customer, name: e.target.value }
                }))}
                className="input-modern"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.customer.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  customer: { ...prev.customer, email: e.target.value }
                }))}
                className="input-modern"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.customer.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  customer: { ...prev.customer, phone: e.target.value }
                }))}
                className="input-modern"
              />
            </div>
          </div>
        </div>

        {/* Travelers */}
        <div className="card-modern p-6 border-2 border-green-200 dark:border-green-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2 text-green-600" />
            Travelers
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Adults</label>
              <input
                type="number"
                min="1"
                value={formData.travelers.adults}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  travelers: { ...prev.travelers, adults: parseInt(e.target.value) }
                }))}
                className="input-modern"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Children</label>
              <input
                type="number"
                min="0"
                value={formData.travelers.children}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  travelers: { ...prev.travelers, children: parseInt(e.target.value) }
                }))}
                className="input-modern"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Infants</label>
              <input
                type="number"
                min="0"
                value={formData.travelers.infants}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  travelers: { ...prev.travelers, infants: parseInt(e.target.value) }
                }))}
                className="input-modern"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Room Preference</label>
              <select
                value={formData.roomPreference}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  roomPreference: e.target.value as any
                }))}
                className="input-modern"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card-modern p-6 border-2 border-yellow-200 dark:border-yellow-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-yellow-600" />
            Pricing
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Base Price</label>
              <input
                type="number"
                min="0"
                value={formData.pricing.basePrice}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pricing: { 
                    ...prev.pricing, 
                    basePrice: parseFloat(e.target.value),
                    totalPrice: parseFloat(e.target.value) - prev.pricing.discount
                  }
                }))}
                className="input-modern"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Discount</label>
              <input
                type="number"
                min="0"
                value={formData.pricing.discount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pricing: { 
                    ...prev.pricing, 
                    discount: parseFloat(e.target.value),
                    totalPrice: prev.pricing.basePrice - parseFloat(e.target.value)
                  }
                }))}
                className="input-modern"
              />
            </div>
            <div className="pt-3 border-t-2 border-yellow-200 dark:border-yellow-700">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Price</label>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">${formData.pricing.totalPrice}</p>
            </div>
          </div>
        </div>

        {/* Status & Priority */}
        <div className="card-modern p-6 border-2 border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Info className="w-6 h-6 mr-2 text-purple-600" />
            Status & Priority
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  status: e.target.value as any
                }))}
                className="input-modern"
              >
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  priority: e.target.value as any
                }))}
                className="input-modern"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Special Requests */}
      <div className="card-modern p-6 border-2 border-orange-200 dark:border-orange-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-orange-600" />
          Special Requests
        </h2>
        <textarea
          value={formData.specialRequests}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            specialRequests: e.target.value
          }))}
          rows={4}
          className="input-modern"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold flex items-center transition-colors"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Confirm Modal Component
const ConfirmModal = ({ request, onClose, onConfirm }: { request: PackageRequest; onClose: () => void; onConfirm: (notes: string) => void }) => {
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card-modern max-w-2xl w-full p-6 border-2 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
            Confirm Request
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to confirm request <span className="font-bold">{request.id}</span> from <span className="font-bold">{request.customer.name}</span>?
          </p>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Confirmation Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add any notes or special instructions for this confirmation..."
              className="input-modern"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(notes)}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold flex items-center transition-colors"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Confirm Request
          </button>
        </div>
      </div>
    </div>
  );
};

// Reject Modal Component
const RejectModal = ({ request, onClose, onReject }: { request: PackageRequest; onClose: () => void; onReject: (reason: string) => void }) => {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card-modern max-w-2xl w-full p-6 border-2 border-red-200 dark:border-red-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <XCircle className="w-6 h-6 mr-2 text-red-600" />
            Reject Request
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to reject request <span className="font-bold">{request.id}</span> from <span className="font-bold">{request.customer.name}</span>?
          </p>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Please provide a reason for rejecting this request..."
              className="input-modern"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onReject(reason)}
            disabled={!reason.trim()}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Reject Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageRequestsModule;

