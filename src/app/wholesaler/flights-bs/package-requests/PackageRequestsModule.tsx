'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plane,
  Loader,
  AlertTriangle,
  CreditCard, // Icon for Visa tab
} from 'lucide-react';

// Import UI Components
import BookingFilter from './components/BookingFilter';
import BookingRequestCard from './components/BookingRequestCard';
import BookingDetailsModal from './components/BookingDetailsModal';
import ConfirmationModal from './components/ConfirmationModal';
// --- ADDED: Import new Visa component ---
import VisaBookingsComponent from './components/VisaBookingsComponent';

// Import Invoice Generator
import {
  generateInvoicePDF,
  generateInvoiceNumber,
} from './components/invoiceGenerator';

// --- ADDED: Import Flight Voucher Generator ---
import { generateFlightVoucherPDF } from './components/flightVoucherGenerator';

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
  wholesalerId?: string | any; // Added to match API response
}

// --- Flight Booking API Types ---
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
    // Assuming agency name might be available in full API, if not we use email as fallback in mapper if needed
    agencyName?: string;
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

// Main Internal Type
export interface PackageRequest {
  _id: string;
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
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Under Review';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  rawData: ApiPackageBooking | ApiFlightBooking;
  bookingType: 'package' | 'flight';
}

// Capitalize status helper
const capitalize = (s: string): PackageRequest['status'] => {
  if (!s) return 'Pending';
  const lower = s.toLowerCase();
  const formatted = lower.charAt(0).toUpperCase() + lower.slice(1);
  if (
    formatted === 'Pending' ||
    formatted === 'Confirmed' ||
    formatted === 'Cancelled' ||
    formatted === 'Completed' ||
    formatted === 'Under Review'
  ) {
    return formatted as PackageRequest['status'];
  }
  return 'Under Review';
};

// Maps Package API data to Requests
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
      _id: b._id,
      id: b.bookingReference || b._id,
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
        name: 'See Details',
        address: 'N/A',
        rating: 0,
        roomType: 'N/A',
        checkIn: b.travelStartDate,
        checkOut: b.travelEndDate,
        nights: durationDays - 1,
      },
      travelers: b.travelers,
      roomPreference: 'Mixed',
      specialRequests: b.specialRequests,
      pricing: {
        basePrice: b.pricing.totalPrice,
        totalPrice: b.pricing.totalPrice,
        discount: 0,
      },
      financials: {
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
      priority: 'Medium',
      rawData: b,
      bookingType: 'package',
    };
  });
};

// Maps Flight API data to Requests
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
      _id: b._id,
      id: b.reference || b._id,
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
      roomPreference: 'N/A' as any,
      specialRequests: 'N/A',
      pricing: {
        basePrice: b.priceSnapshot.totalAmount,
        totalPrice: b.priceSnapshot.totalAmount,
        discount: 0,
      },
      financials: {
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
      priority: 'Medium',
      rawData: b,
      bookingType: 'flight',
    };
  });
};

// #endregion

// #region --- Tab Content Components ---

// Handler for Generating Invoice
const handleGenerateInvoice = async (request: PackageRequest) => {
  const now = new Date();
  const dueDate = new Date();
  dueDate.setDate(now.getDate() + 7); // Set due date to 7 days from now

  const invoiceData = {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: now.toLocaleDateString('en-GB'), // DD/MM/YYYY
    dueDate: dueDate.toLocaleDateString('en-GB'), // DD/MM/YYYY
    request: request, // Pass the entire request object to the generator
  };

  await generateInvoicePDF(invoiceData);
};

const PackageBookingsComponent = () => {
  const [packageRequests, setPackageRequests] = useState<PackageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    _id: string;
    action: 'confirmed' | 'cancelled';
  } | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBookingForView, setSelectedBookingForView] =
    useState<PackageRequest | null>(null);

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

        setPackageRequests(
          mapPackageBookingsToRequests(packageData.data.bookings),
        );
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- ADDED: Handler for Package Voucher ---
  // This is a placeholder. You will need a specific voucher template for "packages"
  const handleGeneratePackageVoucher = (request: PackageRequest) => {
    if (request.bookingType !== 'package') return;
    // TODO: Implement package voucher generation when template is available
    alert('Package voucher generation is not yet implemented.');
    console.log('Generate package voucher for:', request);
  };

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

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      Pending:
        'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
      Confirmed:
        'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
      Completed:
        'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300',
      Cancelled:
        'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
      'Under Review':
        'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return styles[status] || styles['Pending'];
  };

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

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  // UPDATED: Sends lowercase status payload
  const handleModalConfirm = async (modalData: { pnr: string }) => {
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

    // PAYLOAD: uses 'action' directly which is already lowercase ("confirmed" or "cancelled")
    const payload = {
      status: action,
      pnr: modalData.pnr,
    };

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
    action: 'confirmed' | 'cancelled',
  ) => {
    setSelectedRequest({ _id, action });
    setIsModalOpen(true);
  };

  const handleViewDetails = (request: PackageRequest) => {
    setSelectedBookingForView(request);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
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

      <BookingDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        booking={selectedBookingForView}
      />

      <BookingFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
      />

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
                onView={handleViewDetails}
                onInvoice={handleGenerateInvoice}
                onVoucher={handleGeneratePackageVoucher} // <-- PASS THE HANDLER
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    _id: string;
    action: 'confirmed' | 'cancelled';
  } | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBookingForView, setSelectedBookingForView] =
    useState<PackageRequest | null>(null);

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

        setFlightRequests(mapFlightBookingsToRequests(flightData.data));
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- ADDED: Handler for Flight Voucher ---
  const handleGenerateFlightVoucher = async (request: PackageRequest) => {
    if (request.bookingType !== 'flight') return;
    try {
      // We pass the rawData, which is the ApiFlightBooking object
      await generateFlightVoucherPDF(request.rawData as ApiFlightBooking);
    } catch (err) {
      console.error('Error generating flight voucher:', err);
      alert('Error generating flight voucher. See console for details.');
    }
  };

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

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      Pending:
        'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
      Confirmed:
        'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
      Completed:
        'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300',
      Cancelled:
        'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/3D dark:text-red-300',
      'Under Review':
        'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return styles[status] || styles['Pending'];
  };

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

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleModalConfirm = async (modalData: { pnr: string }) => {
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

    const url = `${process.env.NEXT_PUBLIC_FLIGHT_URL}/block-seats/bookings/${_id}/status`;
    const method = 'PATCH';

    // PAYLOAD: uses 'action' directly which is already lowercase ("confirmed" or "cancelled")
    const payload = {
      status: action,
      pnr: modalData.pnr,
    };

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
    action: 'confirmed' | 'cancelled',
  ) => {
    setSelectedRequest({ _id, action });
    setIsModalOpen(true);
  };

  const handleViewDetails = (request: PackageRequest) => {
    setSelectedBookingForView(request);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
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

      <BookingDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        booking={selectedBookingForView}
      />

      <BookingFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
      />

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
                onView={handleViewDetails}
                onInvoice={handleGenerateInvoice}
                onVoucher={handleGenerateFlightVoucher} // <-- PASS THE HANDLER
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
  const [activeTab, setActiveTab] = useState<'packages' | 'flight' | 'visa'>( // UPDATED STATE
    'packages',
  );

  return (
    <div className="space-y-6">
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
        {/* --- ADDED VISA TAB BUTTON --- */}
        <button
          onClick={() => setActiveTab('visa')}
          className={`flex items-center px-6 py-3 text-lg font-semibold transition-colors ${
            activeTab === 'visa'
              ? 'border-b-4 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <CreditCard className="w-5 h-5 mr-2" /> Visa
        </button>
        {/* --- END ADDED BUTTON --- */}
      </div>

      {activeTab === 'packages' && <PackageBookingsComponent />}
      {activeTab === 'flight' && <FlightBookingsComponent />}
      {activeTab === 'visa' && <VisaBookingsComponent />} {/* UPDATED: Renders imported component */}
    </div>
  );
};

export default PackageRequestsModule;