'use client';

import React from 'react';
import {
  X,
  Package,
  Plane,
  User,
  Users,
  CreditCard,
  Hotel,
  Mail,
  Phone,
  Calendar,
  Hash,
  Building,
} from 'lucide-react';

// --- Interfaces DEFINED LOCALLY to avoid circular dependencies ---

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

export interface BookingModalData {
  id: string;
  bookingType: 'package' | 'flight';
  rawData: ApiPackageBooking | ApiFlightBooking;
}

// #region --- Helper Functions & Components ---

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateString;
  }
};

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (e) {
    return `${currency} ${amount}`;
  }
};

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card-modern-inset p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        {icon}
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
  fullWidth = false,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
        {icon}
        {label}
      </dt>
      <dd className="text-sm text-gray-900 dark:text-white font-semibold break-words">
        {value || 'N/A'}
      </dd>
    </div>
  );
}

// #endregion

// #region --- Package Booking Details ---

function PackageBookingDetails({ booking }: { booking: ApiPackageBooking }) {
  return (
    <div className="space-y-6">
      {/* --- Booking Info --- */}
      <DetailSection
        title="Booking Information"
        icon={<Hash className="w-5 h-5 mr-2" />}
      >
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <InfoItem label="Reference" value={booking.bookingReference} />
          <InfoItem
            label="Booking Date"
            value={formatDateTime(booking.bookingDate)}
          />
          <InfoItem label="Status" value={booking.status} />
          <InfoItem label="Payment Status" value={booking.paymentStatus} />
          <InfoItem label="Agency" value={booking.agencyId?.agencyName} />
          <InfoItem label="Booked By" value={booking.bookedBy?.email} />
        </dl>
      </DetailSection>

      {/* --- Package & Travel --- */}
      <DetailSection
        title="Package & Travel"
        icon={<Package className="w-5 h-5 mr-2" />}
      >
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <InfoItem
            label="Package Title"
            value={booking.packageId?.packageTitle}
          />
          <InfoItem
            label="Destination"
            value={`${booking.packageId?.city}, ${booking.packageId?.country}`}
          />
          <InfoItem
            label="Travel Start"
            value={formatDate(booking.travelStartDate)}
          />
          <InfoItem
            label="Travel End"
            value={formatDate(booking.travelEndDate)}
          />
          <InfoItem
            label="Special Requests"
            value={booking.specialRequests}
            fullWidth
          />
        </dl>
      </DetailSection>

      {/* --- Contact Info --- */}
      <DetailSection
        title="Contact Person"
        icon={<User className="w-5 h-5 mr-2" />}
      >
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <InfoItem
            label="Email"
            value={booking.contactEmail}
            icon={<Mail className="w-4 h-4 mr-1.5" />}
          />
          <InfoItem
            label="Phone"
            value={booking.contactPhone}
            icon={<Phone className="w-4 h-4 mr-1.5" />}
          />
        </dl>
      </DetailSection>

      {/* --- Passengers --- */}
      <DetailSection
        title={`Travelers (${booking.travelers?.adults || 0}A, ${
          booking.travelers?.children || 0
        }C, ${booking.travelers?.infants || 0}I)`}
        icon={<Users className="w-5 h-5 mr-2" />}
      >
        {booking.passengers?.map((p, index) => (
          <div key={index} className="card-modern-inset p-3">
            <p className="font-semibold text-gray-900 dark:text-white">
              {p.firstName} {p.lastName}
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              <InfoItem
                label="Date of Birth"
                value={formatDate(p.dateOfBirth)}
              />
              <InfoItem label="Passport No." value={p.passportNumber} />
              <InfoItem
                label="Passport Expiry"
                value={formatDate(p.passportExpiry)}
              />
            </dl>
          </div>
        ))}
      </DetailSection>

      {/* --- Hotel --- */}
      {booking.selectedHotel && (
        <DetailSection
          title="Hotel Details"
          icon={<Hotel className="w-5 h-5 mr-2" />}
        >
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InfoItem
              label="Hotel Block Room ID"
              value={booking.selectedHotel.hotelBlockRoomId}
              fullWidth
            />
            <InfoItem
              label="Room Type ID"
              value={booking.selectedHotel.roomTypeId}
              fullWidth
            />
            <InfoItem
              label="Quantity"
              value={booking.selectedHotel.quantity}
              fullWidth
            />
          </dl>
        </DetailSection>
      )}

      {/* --- Flight --- */}
      {booking.flightSeats && (
        <DetailSection
          title="Flight Details"
          icon={<Plane className="w-5 h-5 mr-2" />}
        >
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InfoItem
              label="Flight Block Seat ID"
              value={booking.flightSeats.flightBlockSeatId}
              fullWidth
            />
            <InfoItem
              label="Total Seats"
              value={booking.flightSeats.totalSeats}
              fullWidth
            />
          </dl>
        </DetailSection>
      )}

      {/* --- Pricing --- */}
      {booking.pricing && (
        <DetailSection
          title="Pricing"
          icon={<CreditCard className="w-5 h-5 mr-2" />}
        >
          <div className="space-y-2">
            <InfoItem
              label="Total Price"
              value={
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(
                    booking.pricing.totalPrice,
                    booking.pricing.currency,
                  )}
                </span>
              }
            />
            {booking.pricing.priceBreakdown && (
              <InfoItem
                label="Subtotal"
                value={formatCurrency(
                  booking.pricing.priceBreakdown.subtotal,
                  booking.pricing.currency,
                )}
              />
            )}
          </div>
          {booking.pricing.priceBreakdown && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-2">Price Breakdown</h4>
              <dl className="grid grid-cols-2 gap-4">
                {booking.pricing.priceBreakdown.adults && (
                  <InfoItem
                    label="Adults"
                    value={`${
                      booking.pricing.priceBreakdown.adults.quantity
                    } x ${formatCurrency(
                      booking.pricing.priceBreakdown.adults.unitPrice,
                      booking.pricing.currency,
                    )}`}
                  />
                )}
                {booking.pricing.priceBreakdown.children && (
                  <InfoItem
                    label="Children"
                    value={`${
                      booking.pricing.priceBreakdown.children.quantity
                    } x ${formatCurrency(
                      booking.pricing.priceBreakdown.children.unitPrice,
                      booking.pricing.currency,
                    )}`}
                  />
                )}
                {booking.pricing.priceBreakdown.infants && (
                  <InfoItem
                    label="Infants"
                    value={`${
                      booking.pricing.priceBreakdown.infants.quantity
                    } x ${formatCurrency(
                      booking.pricing.priceBreakdown.infants.unitPrice,
                      booking.pricing.currency,
                    )}`}
                  />
                )}
                {booking.pricing.priceBreakdown.hotel && (
                  <InfoItem
                    label="Hotel"
                    value={`${
                      booking.pricing.priceBreakdown.hotel.quantity
                    } room(s) x ${
                      booking.pricing.priceBreakdown.hotel.nights
                    } nights @ ${formatCurrency(
                      booking.pricing.priceBreakdown.hotel.roomPricePerNight,
                      booking.pricing.priceBreakdown.hotel.currency,
                    )}`}
                  />
                )}
                {booking.pricing.priceBreakdown.singleSupplement && (
                  <InfoItem
                    label="Single Supplement"
                    value={formatCurrency(
                      booking.pricing.priceBreakdown.singleSupplement.amount,
                      booking.pricing.currency,
                    )}
                  />
                )}
              </dl>
            </div>
          )}
        </DetailSection>
      )}
    </div>
  );
}

// #endregion

// #region --- Flight Booking Details ---

function FlightBookingDetails({ booking }: { booking: ApiFlightBooking }) {
  return (
    <div className="space-y-6">
      {/* --- Booking Info --- */}
      <DetailSection
        title="Booking Information"
        icon={<Hash className="w-5 h-5 mr-2" />}
      >
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <InfoItem label="Reference" value={booking.reference} />
          <InfoItem
            label="Booking Date"
            value={formatDateTime(booking.createdAt)}
          />
          <InfoItem label="Status" value={booking.status} />
          <InfoItem
            label="Agency"
            value={booking.agency?.email}
            icon={<Building className="w-4 h-4 mr-1.5" />}
          />
        </dl>
      </DetailSection>

      {/* --- Flight & Route --- */}
      {booking.blockSeat && (
        <DetailSection
          title="Flight & Route"
          icon={<Plane className="w-5 h-5 mr-2" />}
        >
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InfoItem
              label="Flight Name"
              value={booking.blockSeat.name}
              fullWidth
            />
            <InfoItem
              label="Airline"
              value={`${booking.blockSeat.airline?.name} (${booking.blockSeat.airline?.code})`}
              icon={<Plane className="w-4 h-4 mr-1.5" />} // Fallback to basic Plane icon
            />
            <InfoItem
              label="Trip Type"
              value={booking.blockSeat.route?.tripType}
            />
            <InfoItem
              label="From"
              value={`${booking.blockSeat.route?.from?.iataCode} (${booking.blockSeat.route?.from?.country})`}
              icon={<Plane className="w-4 h-4 mr-1.5" />} // Fallback to basic Plane icon
            />
            <InfoItem
              label="To"
              value={`${booking.blockSeat.route?.to?.iataCode} (${booking.blockSeat.route?.to?.country})`}
              icon={<Plane className="w-4 h-4 mr-1.5" />} // Fallback to basic Plane icon
            />
            {booking.trip && (
              <>
                <InfoItem
                  label="Departure Date"
                  value={formatDate(booking.trip.departureDate)}
                  icon={<Calendar className="w-4 h-4 mr-1.5" />}
                />
                <InfoItem
                  label="Return Date"
                  value={formatDate(booking.trip.returnDate)}
                  icon={<Calendar className="w-4 h-4 mr-1.5" />}
                />
              </>
            )}
            <InfoItem label="Booked Class ID" value={booking.classId} />
            <InfoItem label="Quantity" value={booking.quantity} />
          </dl>
        </DetailSection>
      )}

      {/* --- Contact Info --- */}
      {booking.contact && (
        <DetailSection
          title="Contact Person"
          icon={<User className="w-5 h-5 mr-2" />}
        >
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InfoItem label="Name" value={booking.contact.name} />
            <InfoItem
              label="Email"
              value={booking.contact.email}
              icon={<Mail className="w-4 h-4 mr-1.5" />}
            />
            <InfoItem
              label="Phone"
              value={`${booking.contact.phoneCode} ${booking.contact.phoneNumber}`}
              icon={<Phone className="w-4 h-4 mr-1.5" />}
            />
          </dl>
        </DetailSection>
      )}

      {/* --- Passengers --- */}
      {booking.passengers && (
        <DetailSection
          title={`Passengers (${booking.passengers.length})`}
          icon={<Users className="w-5 h-5 mr-2" />}
        >
          {booking.passengers.map((p, index) => (
            <div key={index} className="card-modern-inset p-3">
              <p className="font-semibold text-gray-900 dark:text-white">
                {p.title}. {p.firstName} {p.lastName} ({p.paxType})
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                <InfoItem label="Gender" value={p.gender} />
                <InfoItem label="Date of Birth" value={formatDate(p.dob)} />
                <InfoItem label="Nationality" value={p.nationality} />
                <InfoItem label="Passport No." value={p.passportNumber} />
                <InfoItem
                  label="Passport Expiry"
                  value={formatDate(p.passportExpiry)}
                />
                <InfoItem
                  label="Passport Issue Country"
                  value={p.passportIssueCountry}
                />
              </dl>
            </div>
          ))}
        </DetailSection>
      )}

      {/* --- Pricing --- */}
      {booking.priceSnapshot && (
        <DetailSection
          title="Pricing"
          icon={<CreditCard className="w-5 h-5 mr-2" />}
        >
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InfoItem
              label="Total Price"
              value={
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(
                    booking.priceSnapshot.totalAmount,
                    booking.priceSnapshot.currency,
                  )}
                </span>
              }
            />
            <InfoItem
              label="Unit Price"
              value={formatCurrency(
                booking.priceSnapshot.unitPrice,
                booking.priceSnapshot.currency,
              )}
            />
          </dl>
        </DetailSection>
      )}
    </div>
  );
}

// #endregion

// #region --- Main Modal Component ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingModalData | any | null;
}

const BookingDetailsModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  if (!isOpen || !booking) return null;

  const isPackage = booking.bookingType === 'package';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl m-4 transform transition-all max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl z-10">
          <h2
            className="text-2xl font-bold text-gray-900 dark:text-white flex items-center"
            id="modal-title"
          >
            {isPackage ? (
              <Package className="w-6 h-6 mr-3 text-purple-600" />
            ) : (
              <Plane className="w-6 h-6 mr-3 text-blue-600" />
            )}
            Booking Details: {booking.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {isPackage ? (
            <PackageBookingDetails
              booking={booking.rawData as ApiPackageBooking}
            />
          ) : (
            <FlightBookingDetails
              booking={booking.rawData as ApiFlightBooking}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-4 bg-gray-100 dark:bg-gray-900/50 px-6 py-4 rounded-b-2xl sticky bottom-0 z-10">
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;