'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plane,
  Loader,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// Import UI Components
import BookingFilter from './components/BookingFilter';
import BookingRequestCard from './components/BookingRequestCard';
import BookingDetailsModal from './components/BookingDetailsModal'; // <-- IMPORT NEW MODAL

// #region --- Confirmation Modal Component ---

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
  actionType?: 'confirmed' | 'cancelled' | 'cancelled';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isProcessing,
  actionType,
}) => {
  if (!isOpen) return null;

  const confirmButtonColor =
    actionType === 'confirmed'
      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500';

  const confirmButtonIcon =
    actionType === 'confirmed' ? (
      <CheckCircle className="w-4 h-4 mr-2" />
    ) : (
      <XCircle className="w-4 h-4 mr-2" />
    );

  const confirmButtonText =
    actionType === 'confirmed'
      ? 'Confirm'
      : actionType === 'cancelled'
        ? 'Reject'
        : 'Cancel Booking';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 transform transition-all scale-100 opacity-100">
        <div className="p-6">
          <h3
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
            id="modal-title"
          >
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>
        </div>
        <div className="flex justify-end space-x-4 bg-gray-100 dark:bg-gray-900/50 px-6 py-4 rounded-b-2xl">
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-colors disabled:opacity-50"
            onClick={onCancel}
            disabled={isProcessing}
          >
            No, go back
          </button>
          <button
            type="button"
            className={`inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 ${confirmButtonColor}`}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              confirmButtonIcon
            )}
            {isProcessing ? 'Processing...' : `Yes, ${confirmButtonText}`}
          </button>
        </div>
      </div>
    </div>
  );
};

// #endregion

// #region --- Data Types, Helpers, and Mappers ---

// Helper function to get Auth Token
const getAuthToken = () => {
  return (
    document.cookie
      .split('; ')
      .find(r => r.startsWith('authToken='))
      ?.split('=')[1] || localStorage.getItem('authToken')
  );
};

// --- Package Booking API Types ---
// EXPORTED for modal
export interface ApiPackageBooking {
  _id: string;
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  packageId: {
    _id: string;
    packageTitle: string;
    country: string;
    city: string;
  };
  agencyId: {
    _id: string;
    agencyName: string;
  };
  bookingReference: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests: string;
  passengers: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    passportNumber: string;
    passportExpiry: string;
  }[];
  selectedHotel: {
    hotelBlockRoomId: string;
    roomTypeId: string;
    quantity: number;
  };
  flightSeats: {
    flightBlockSeatId: string;
    totalSeats: number;
  };
  pricing: {
    priceBreakdown: {
      subtotal: number;
      totalPrice: number;
      adults: { quantity: number; unitPrice: number };
      children: { quantity: number; unitPrice: number };
      infants: { quantity: number; unitPrice: number };
      hotel: {
        roomPricePerNight: number;
        quantity: number;
        nights: number;
        currency: string;
      };
      singleSupplement: { amount: number };
    };
    totalPrice: number;
    currency: string;
  };
  status: string;
  travelStartDate: string;
  travelEndDate: string;
  paymentStatus: string;
  bookingDate: string;
  bookedBy: { email: string };
}

// --- Flight Booking API Types ---
// EXPORTED for modal
export interface ApiFlightBooking {
  _id: string;
  reference: string;
  blockSeat: {
    _id: string;
    name: string;
    airline: {
      code: string;
      name: string;
      country: string;
    };
    route: {
      from: {
        country: string;
        iataCode: string;
      };
      to: {
        country: string;
        iataCode: string;
      };
      tripType: string;
    };
    currency: string;
  };
  agency: {
    _id: string;
    email: string;
  };
  classId: number;
  trip: {
    tripType: string;
    departureDate: string;
    returnDate: string;
  };
  passengers: {
    paxType: string;
    title: string;
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
    nationality: string;
    passportNumber: string;
    passportExpiry: string;
    passportIssueCountry: string;
  }[];
  contact: {
    name: string;
    email: string;
    phoneCode: string;
    phoneNumber: string;
  };
  quantity: number;
  priceSnapshot: {
    currency: string;
    unitPrice: number;
    totalAmount: number;
  };
  status: string;
  createdAt: string;
}

// Main Internal Type (Exported for Card component)
export interface PackageRequest {
  _id: string; // Database ID for API calls
  id: string; // Display ID (booking reference)
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
  roomPreference: 'Single' | 'Double' | 'Triple' | 'Mixed' | 'N/A';
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
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Under Review' | 'Cancelled'; // Added Cancelled
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  // --- ADDED FOR VIEW MODAL ---
  rawData: ApiPackageBooking | ApiFlightBooking;
  bookingType: 'package' | 'flight';
  // --------------------------
}

// Capitalize status helper
const capitalize = (s: string): PackageRequest['status'] => {
  if (!s) return 'Pending';
  const lower = s.toLowerCase();
  const formatted = lower.charAt(0).toUpperCase() + lower.slice(1);
  if (
    formatted === 'Pending' ||
    formatted === 'Confirmed' ||
    formatted === 'Rejected' ||
    formatted === 'Under Review' ||
    formatted === 'Cancelled' // Added Cancelled
  ) {
    return formatted;
  }
  return 'Under Review'; // Default
};

// Maps Package API data to our internal PackageRequest component type
const mapPackageBookingsToRequests = (
  bookings: ApiPackageBooking[],
): PackageRequest[] => {
  return bookings.map(b => {
    const firstPassenger = b.passengers[0] || {};
    const durationDays =
      (new Date(b.travelEndDate).getTime() -
        new Date(b.travelStartDate).getTime()) /
      (1000 * 3600 * 24);

    return {
      _id: b._id, // Store the raw ID
      id: b.bookingReference || b._id, // Use reference as display ID
      requestDate: b.bookingDate,
      customer: {
        name: `${firstPassenger.firstName || 'N/A'} ${
          firstPassenger.lastName || 'N/A'
        }`,
        email: b.contactEmail,
        phone: b.contactPhone,
        nationality: firstPassenger.passportNumber ? 'See Passengers' : 'N/A',
      },
      package: {
        id: b.packageId._id,
        title: b.packageId.packageTitle,
        destination: `${b.packageId.city}, ${b.packageId.country}`,
        duration: `${durationDays} Days / ${durationDays - 1} Nights`,
        startDate: b.travelStartDate,
        endDate: b.travelEndDate,
      },
      flight: {
        // Flight data is minimal in this API, using placeholders
        airline: 'See Details',
        flightNumber: 'N/A',
        from: 'N/A',
        to: 'N/A',
        departureDate: b.travelStartDate,
        departureTime: 'N/A',
        returnDate: b.travelEndDate,
        returnTime: 'N/A',
        class: 'N/A',
      },
      hotel: {
        // Hotel data is minimal in this API, using placeholders
        name: 'See Details',
        address: 'N/A',
        rating: 0,
        roomType: 'N/A',
        checkIn: b.travelStartDate,
        checkOut: b.travelEndDate,
        nights: durationDays - 1,
      },
      travelers: b.travelers,
      roomPreference: 'Mixed', // Default
      specialRequests: b.specialRequests,
      pricing: {
        basePrice: b.pricing.totalPrice,
        totalPrice: b.pricing.totalPrice,
        discount: 0,
      },
      financials: {
        // Financials are not provided, using defaults
        flightCost: 0,
        hotelCost: 0,
        totalCost: 0,
        markup: 0,
        sellingPrice: b.pricing.totalPrice,
        airlineCommission: { type: 'fixed', value: 0, amount: 0 },
        agencyCommission: { type: 'fixed', value: 0, amount: 0 },
        netProfit: 0,
      },
      status: capitalize(b.status),
      priority: 'Medium', // Default
      // --- ADDED FOR VIEW MODAL ---
      rawData: b,
      bookingType: 'package',
      // --------------------------
    };
  });
};

// Maps Flight API data to our internal PackageRequest component type
const mapFlightBookingsToRequests = (
  bookings: ApiFlightBooking[],
): PackageRequest[] => {
  return bookings.map(b => {
    const durationDays =
      b.trip.returnDate && b.trip.departureDate
        ? (new Date(b.trip.returnDate).getTime() -
            new Date(b.trip.departureDate).getTime()) /
          (1000 * 3600 * 24)
        : 1;

    return {
      _id: b._id, // Store the raw ID
      id: b.reference || b._id, // Use reference as display ID
      requestDate: b.createdAt,
      customer: {
        name: b.contact.name,
        email: b.contact.email,
        phone: `${b.contact.phoneCode}${b.contact.phoneNumber}`,
        nationality: b.passengers[0]?.nationality || 'N/A',
      },
      package: {
        id: b.blockSeat._id,
        title: b.blockSeat.name,
        destination: `${b.blockSeat.route.to.iataCode}, ${b.blockSeat.route.to.country}`,
        duration: `${durationDays} Days`,
        startDate: b.trip.departureDate,
        endDate: b.trip.returnDate || b.trip.departureDate,
      },
      flight: {
        airline: b.blockSeat.airline.name,
        flightNumber: b.blockSeat.airline.code,
        from: b.blockSeat.route.from.iataCode,
        to: b.blockSeat.route.to.iataCode,
        departureDate: b.trip.departureDate,
        departureTime: 'N/A',
        returnDate: b.trip.returnDate || 'N/A',
        returnTime: 'N/A',
        class: 'See Details',
      },
      hotel: {
        // No hotel data in flight bookings
        name: 'N/A',
        address: 'N/A',
        rating: 0,
        roomType: 'N/A',
        checkIn: 'N/A',
        checkOut: 'N/A',
        nights: 0,
      },
      travelers: {
        adults: b.passengers.filter(p => p.paxType === 'ADT').length,
        children: b.passengers.filter(p => p.paxType === 'CHD').length,
        infants: b.passengers.filter(p => p.paxType === 'INF').length,
      },
      roomPreference: 'N/A' as any, // Not applicable
      specialRequests: 'N/A',
      pricing: {
        basePrice: b.priceSnapshot.totalAmount,
        totalPrice: b.priceSnapshot.totalAmount,
        discount: 0,
      },
      financials: {
        // Financials are not provided, using defaults
        flightCost: 0,
        hotelCost: 0,
        totalCost: 0,
        markup: 0,
        sellingPrice: b.priceSnapshot.totalAmount,
        airlineCommission: { type: 'fixed', value: 0, amount: 0 },
        agencyCommission: { type: 'fixed', value: 0, amount: 0 },
        netProfit: 0,
      },
      status: capitalize(b.status),
      priority: 'Medium', // Default
      // --- ADDED FOR VIEW MODAL ---
      rawData: b,
      bookingType: 'flight',
      // --------------------------
    };
  });
};

// #endregion

// #region --- Tab Content Components ---

const PackageBookingsComponent = () => {
  const [packageRequests, setPackageRequests] = useState<PackageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // State for modal and API updates
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    _id: string;
    action: 'confirmed' | 'cancelled' | 'cancelled';
  } | null>(null);

  // --- ADDED: State for View Modal ---
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBookingForView, setSelectedBookingForView] =
    useState<PackageRequest | null>(null);
  // ---------------------------------

  // Data Fetching Effect
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const packageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/packages/bookings`;

      try {
        const packageResponse = await fetch(packageUrl, { headers });

        if (!packageResponse.ok) {
          throw new Error(
            `Failed to fetch package bookings: ${packageResponse.statusText}`,
          );
        }
        const packageData = await packageResponse.json();

        // --- DUMMY DATA REMOVED ---
        // Restore original line:
        setPackageRequests(
          mapPackageBookingsToRequests(packageData.data.bookings),
        );
        // ---------------
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter requests
  const filteredRequests = packageRequests.filter(request => {
    const matchesSearch =
      request.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.package.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      request.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesPriority =
      filterPriority === 'all' ||
      request.priority.toLowerCase() === filterPriority.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      Pending:
        'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
      Confirmed:
        'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
      Rejected:
        'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
      Cancelled: // Added Cancelled
        'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
      'Under Review':
        'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return styles[status] || styles['Pending'];
  };

  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    const styles: { [key: string]: string } = {
      Low: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300',
      Medium:
        'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
      High: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300',
      Urgent:
        'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
    };
    return styles[priority] || styles['Medium'];
  };

  // --- Modal and API Call Handlers ---
  const handleModalCancel = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleModalConfirm = async () => {
    if (!selectedRequest) return;

    setIsUpdating(true);
    const { _id, action } = selectedRequest;
    const token = getAuthToken();

    if (!token) {
      setError('Authentication token not found.');
      setIsUpdating(false);
      setIsModalOpen(false);
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/packages/bookings/${_id}/status`;
    const method = 'PATCH';
    const payload = { status: action };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to update booking status',
        );
      }

      // Update local state on success
      setPackageRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === _id ? { ...req, status: capitalize(action) } : req,
        ),
      );
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsUpdating(false);
      setIsModalOpen(false);
      setSelectedRequest(null);
    }
  };

  const openConfirmationModal = (
    _id: string,
    action: 'confirmed' | 'cancelled' | 'cancelled',
  ) => {
    setSelectedRequest({ _id, action });
    setIsModalOpen(true);
  };

  // --- ADDED: Handler for View Modal ---
  const handleViewDetails = (request: PackageRequest) => {
    setSelectedBookingForView(request);
    setIsViewModalOpen(true);
  };
  // -------------------------------------

  return (
    <div className="space-y-6">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        title="Confirm Action"
        message={`Are you sure you want to ${
          selectedRequest?.action
        } this package booking? This action cannot be undone.`}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        isProcessing={isUpdating}
        actionType={selectedRequest?.action}
      />

      {/* --- ADDED: View Details Modal --- */}
      <BookingDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        booking={selectedBookingForView}
      />
      {/* --------------------------------- */}

      {/* Search and Filters */}
      <BookingFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
      />

      {/* Loading and Error States */}
      {loading && (
        <div className="card-modern p-12 text-center">
          <Loader className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Package Bookings...
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we fetch the data.
          </p>
        </div>
      )}

      {error && (
        <div className="card-modern p-12 text-center bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 dark:text-red-200 mb-2">
            Error loading data
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Requests List */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.length === 0 ? (
            <div className="card-modern p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No requests found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ||
                filterStatus !== 'all' ||
                filterPriority !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No package requests available at the moment'}
              </p>
            </div>
          ) : (
            filteredRequests.map(request => (
              <BookingRequestCard
                key={request.id}
                request={request}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                onConfirm={_id => openConfirmationModal(_id, 'confirmed')}
                onReject={_id => openConfirmationModal(_id, 'cancelled')}
                onCancel={_id => openConfirmationModal(_id, 'cancelled')}
                onView={handleViewDetails} // <-- PASS HANDLER
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const FlightBookingsComponent = () => {
  const [flightRequests, setFlightRequests] = useState<PackageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // State for modal and API updates
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    _id: string;
    action: 'confirmed' | 'cancelled' | 'cancelled';
  } | null>(null);

  // --- ADDED: State for View Modal ---
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBookingForView, setSelectedBookingForView] =
    useState<PackageRequest | null>(null);
  // ---------------------------------

  // Data Fetching Effect
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const flightUrl = `${process.env.NEXT_PUBLIC_FLIGHT_URL}/block-seats/bookings`;

      try {
        const flightResponse = await fetch(flightUrl, { headers });

        if (!flightResponse.ok) {
          throw new Error(
            `Failed to fetch flight bookings: ${flightResponse.statusText}`,
          );
        }
        const flightData = await flightResponse.json();

        // --- DUMMY DATA REMOVED ---
        // Restore original line:
        setFlightRequests(mapFlightBookingsToRequests(flightData.data));
        // ---------------
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter requests
  const filteredRequests = flightRequests.filter(request => {
    const matchesSearch =
      request.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.package.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      request.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesPriority =
      filterPriority === 'all' ||
      request.priority.toLowerCase() === filterPriority.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      Pending:
        'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
      Confirmed:
        'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
      Rejected:
        'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
      Cancelled: // Added Cancelled
        'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
      'Under Review':
        'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return styles[status] || styles['Pending'];
  };

  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    const styles: { [key: string]: string } = {
      Low: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300',
      Medium:
        'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
      High: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300',
      Urgent:
        'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
    };
    return styles[priority] || styles['Medium'];
  };

  // --- Modal and API Call Handlers ---
  const handleModalCancel = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleModalConfirm = async () => {
    if (!selectedRequest) return;

    setIsUpdating(true);
    const { _id, action } = selectedRequest;
    const token = getAuthToken();

    if (!token) {
      setError('Authentication token not found.');
      setIsUpdating(false);
      setIsModalOpen(false);
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_FLIGHT_URL}block-seats/bookings/${_id}/status`;
    const method = 'PATCH';
    const payload = { status: action };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to update booking status',
        );
      }

      // Update local state on success
      setFlightRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === _id ? { ...req, status: capitalize(action) } : req,
        ),
      );
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsUpdating(false);
      setIsModalOpen(false);
      setSelectedRequest(null);
    }
  };

  const openConfirmationModal = (
    _id: string,
    action: 'confirmed' | 'cancelled' | 'cancelled',
  ) => {
    setSelectedRequest({ _id, action });
    setIsModalOpen(true);
  };

  // --- ADDED: Handler for View Modal ---
  const handleViewDetails = (request: PackageRequest) => {
    setSelectedBookingForView(request);
    setIsViewModalOpen(true);
  };
  // -------------------------------------

  return (
    <div className="space-y-6">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        title="Confirm Action"
        message={`Are you sure you want to ${
          selectedRequest?.action
        } this flight booking? This action cannot be undone.`}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        isProcessing={isUpdating}
        actionType={selectedRequest?.action}
      />

      {/* --- ADDED: View Details Modal --- */}
      <BookingDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        booking={selectedBookingForView}
      />
      {/* --------------------------------- */}

      {/* Search and Filters */}
      <BookingFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
      />

      {/* Loading and Error States */}
      {loading && (
        <div className="card-modern p-12 text-center">
          <Loader className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Flight Bookings...
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we fetch the data.
          </p>
        </div>
      )}

      {error && (
        <div className="card-modern p-12 text-center bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 dark:text-red-200 mb-2">
            Error loading data
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Requests List */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.length === 0 ? (
            <div className="card-modern p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No requests found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ||
                filterStatus !== 'all' ||
                filterPriority !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No flight requests available at the moment'}
              </p>
            </div>
          ) : (
            filteredRequests.map(request => (
              <BookingRequestCard
                key={request.id}
                request={request}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                onConfirm={_id => openConfirmationModal(_id, 'confirmed')}
                onReject={_id => openConfirmationModal(_id, 'cancelled')}
                onCancel={_id => openConfirmationModal(_id, 'cancelled')}
                onView={handleViewDetails} // <-- PASS HANDLER
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// #endregion

// #region --- Main Module Component ---

const PackageRequestsModule = () => {
  // State for UI
  const [activeTab, setActiveTab] = useState<'packages' | 'flight'>(
    'packages',
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Package className="w-8 h-8 mr-3 text-purple-600" />
            Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer package and flight bookings
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b-2 border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center px-6 py-3 text-lg font-semibold transition-colors ${
            activeTab === 'packages'
              ? 'border-b-4 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Package className="w-5 h-5 mr-2" /> Packages
        </button>
        <button
          onClick={() => setActiveTab('flight')}
          className={`flex items-center px-6 py-3 text-lg font-semibold transition-colors ${
            activeTab === 'flight'
              ? 'border-b-4 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Plane className="w-5 h-5 mr-2" /> Flight
        </button>
      </div>

      {/* Render active tab content */}
      {activeTab === 'packages' && <PackageBookingsComponent />}
      {activeTab === 'flight' && <FlightBookingsComponent />}
    </div>
  );
};

export default PackageRequestsModule;