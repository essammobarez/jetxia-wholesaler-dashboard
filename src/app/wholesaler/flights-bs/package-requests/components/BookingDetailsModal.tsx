'use client';

import {
  Building,
  Calendar,
  CreditCard,
  Hash,
  Hotel,
  Mail,
  Package,
  Phone,
  Plane,
  User,
  Users,
  X,
} from 'lucide-react';
import React from 'react';

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

type SectionVariant =
  | 'indigo'
  | 'blue'
  | 'emerald'
  | 'sky'
  | 'rose'
  | 'amber'
  | 'purple'
  | 'slate';

const SectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: SectionVariant;
}> = ({ title, icon, children, className = '', variant = 'slate' }) => {
  const variants: Record<
    SectionVariant,
    {
      headerBg: string;
      iconText: string;
      accentBorder: string;
    }
  > = {
    indigo: {
      headerBg: 'bg-indigo-50/50 dark:bg-indigo-900/10',
      iconText: 'text-indigo-600 dark:text-indigo-400',
      accentBorder: 'border-t-indigo-500',
    },
    blue: {
      headerBg: 'bg-blue-50/50 dark:bg-blue-900/10',
      iconText: 'text-blue-600 dark:text-blue-400',
      accentBorder: 'border-t-blue-500',
    },
    emerald: {
      headerBg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
      iconText: 'text-emerald-600 dark:text-emerald-400',
      accentBorder: 'border-t-emerald-500',
    },
    sky: {
      headerBg: 'bg-sky-50/50 dark:bg-sky-900/10',
      iconText: 'text-sky-600 dark:text-sky-400',
      accentBorder: 'border-t-sky-500',
    },
    rose: {
      headerBg: 'bg-rose-50/50 dark:bg-rose-900/10',
      iconText: 'text-rose-600 dark:text-rose-400',
      accentBorder: 'border-t-rose-500',
    },
    amber: {
      headerBg: 'bg-amber-50/50 dark:bg-amber-900/10',
      iconText: 'text-amber-600 dark:text-amber-400',
      accentBorder: 'border-t-amber-500',
    },
    purple: {
      headerBg: 'bg-purple-50/50 dark:bg-purple-900/10',
      iconText: 'text-purple-600 dark:text-purple-400',
      accentBorder: 'border-t-purple-500',
    },
    slate: {
      headerBg: 'bg-slate-50/50 dark:bg-slate-800/50',
      iconText: 'text-slate-600 dark:text-slate-400',
      accentBorder: 'border-t-slate-500',
    },
  };

  const currentVariant = variants[variant];

  // Clone the icon to apply the variant color class
  const coloredIcon = React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<any>, {
        className: `w-5 h-5 ${currentVariant.iconText}`,
      })
    : icon;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border-t-4 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ${currentVariant.accentBorder} ${className}`}
    >
      <div
        className={`px-5 py-3 border-b border-gray-100 dark:border-gray-700/50 flex items-center gap-2.5 ${currentVariant.headerBg}`}
      >
        {coloredIcon}
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight">
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

const KeyValueRow: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'subtle';
}> = ({ label, value, icon, variant = 'default' }) => {
  let valueClass = 'text-gray-900 dark:text-white';
  if (variant === 'highlight') {
    valueClass = 'text-indigo-700 dark:text-indigo-400 font-bold';
  } else if (variant === 'subtle') {
    valueClass = 'text-gray-600 dark:text-gray-300';
  }

  return (
    <div className="flex items-start py-1.5 group">
      <div className="flex-shrink-0 w-4 h-4 mt-0.5 mr-2.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">
          {label}
        </dt>
        <dd className={`text-sm font-medium ${valueClass} break-words leading-snug`}>
          {value || 'N/A'}
        </dd>
      </div>
    </div>
  );
};

// #endregion

// #region --- Package Booking Details ---

function PackageBookingDetails({ booking }: { booking: ApiPackageBooking }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {/* Left Column */}
      <div className="flex flex-col gap-5">
        <SectionCard
          title="Booking Summary"
          icon={<Hash />}
          variant="indigo"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
             <div className="sm:col-span-2">
               <KeyValueRow label="Reference" value={booking.bookingReference} variant="highlight" />
             </div>
            <KeyValueRow
              label="Booking Date"
              value={formatDateTime(booking.bookingDate)}
              icon={<Calendar className="w-3.5 h-3.5" />}
            />
            <KeyValueRow label="Status" value={
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 uppercase">
                  {booking.status}
                </span>
            } />
            <KeyValueRow label="Payment" value={booking.paymentStatus} icon={<CreditCard className="w-3.5 h-3.5" />} />
            <KeyValueRow
              label="Agency"
              value={booking.agencyId?.agencyName}
              icon={<Building className="w-3.5 h-3.5" />}
            />
            <div className="sm:col-span-2">
               <KeyValueRow label="Booked By" value={booking.bookedBy?.email} icon={<User className="w-3.5 h-3.5" />} />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Contact Information"
          icon={<User />}
          variant="blue"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <KeyValueRow
              label="Email"
              value={booking.contactEmail}
              icon={<Mail className="w-3.5 h-3.5" />}
            />
            <KeyValueRow
              label="Phone"
              value={booking.contactPhone}
              icon={<Phone className="w-3.5 h-3.5" />}
            />
          </div>
        </SectionCard>

        {booking.selectedHotel && (
          <SectionCard
            title="Hotel Details"
            icon={<Hotel />}
            variant="emerald"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <KeyValueRow
                label="Block Room ID"
                value={booking.selectedHotel.hotelBlockRoomId}
              />
              <KeyValueRow
                label="Room Quantity"
                value={booking.selectedHotel.quantity}
              />
               <div className="sm:col-span-2">
                <KeyValueRow
                    label="Room Type ID"
                    value={booking.selectedHotel.roomTypeId}
                  />
               </div>
            </div>
          </SectionCard>
        )}
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-5">
        <SectionCard
          title="Package & Travel"
          icon={<Package />}
          variant="rose"
        >
          <div className="space-y-3">
            <KeyValueRow
              label="Package Title"
              value={booking.packageId?.packageTitle}
              variant="highlight"
            />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <KeyValueRow
                label="Destination"
                value={`${booking.packageId?.city}, ${booking.packageId?.country}`}
                />
                 <div/>
                <KeyValueRow
                label="Travel Start"
                value={formatDate(booking.travelStartDate)}
                icon={<Calendar className="w-3.5 h-3.5" />}
                />
                <KeyValueRow
                label="Travel End"
                value={formatDate(booking.travelEndDate)}
                icon={<Calendar className="w-3.5 h-3.5" />}
                />
             </div>

            {booking.specialRequests && (
                 <div className="pt-3 mt-1 border-t border-rose-100 dark:border-rose-900/30">
                  <dt className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Special Requests
                  </dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300 bg-rose-50/50 dark:bg-rose-900/20 p-2.5 rounded-lg italic">
                    "{booking.specialRequests}"
                  </dd>
                </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title={`Travelers (${booking.travelers?.adults || 0}A, ${
            booking.travelers?.children || 0
          }C, ${booking.travelers?.infants || 0}I)`}
          icon={<Users />}
          variant="amber"
        >
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-200 dark:scrollbar-thumb-amber-800">
            {booking.passengers?.map((p, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-2 mb-2">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    {p.firstName} {p.lastName}
                    </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                   <div>
                      <span className="text-[10px] text-gray-500 uppercase block">DOB</span>
                      {formatDate(p.dateOfBirth)}
                   </div>
                   <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Passport</span>
                      {p.passportNumber}
                   </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Expiry</span>
                      {formatDate(p.passportExpiry)}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {booking.pricing && (
          <SectionCard
            title="Pricing Summary"
            icon={<CreditCard />}
            variant="purple"
          >
            <div className="space-y-4">
               <div className="flex items-center justify-between px-4 py-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider">Total Amount</span>
                   <span className="text-xl font-extrabold text-purple-700 dark:text-purple-300">
                    {formatCurrency(
                      booking.pricing.totalPrice,
                      booking.pricing.currency
                    )}
                  </span>
               </div>

              {booking.pricing.priceBreakdown && (
                <div className="px-1">
                  <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                    Breakdown
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    {booking.pricing.priceBreakdown.adults && (
                       <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800">
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Adults ({booking.pricing.priceBreakdown.adults.quantity})</span>
                          <span className="font-medium text-xs">{formatCurrency(booking.pricing.priceBreakdown.adults.unitPrice * booking.pricing.priceBreakdown.adults.quantity, booking.pricing.currency)}</span>
                       </div>
                    )}
                    {booking.pricing.priceBreakdown.children && (
                        <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800">
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Children ({booking.pricing.priceBreakdown.children.quantity})</span>
                          <span className="font-medium text-xs">{formatCurrency(booking.pricing.priceBreakdown.children.unitPrice * booking.pricing.priceBreakdown.children.quantity, booking.pricing.currency)}</span>
                       </div>
                    )}
                    {booking.pricing.priceBreakdown.infants && (
                       <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800">
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Infants ({booking.pricing.priceBreakdown.infants.quantity})</span>
                          <span className="font-medium text-xs">{formatCurrency(booking.pricing.priceBreakdown.infants.unitPrice * booking.pricing.priceBreakdown.infants.quantity, booking.pricing.currency)}</span>
                       </div>
                    )}
                    {booking.pricing.priceBreakdown.hotel && (
                       <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800">
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Hotel ({booking.pricing.priceBreakdown.hotel.quantity}x{booking.pricing.priceBreakdown.hotel.nights} nights)</span>
                          <span className="font-medium text-xs">{formatCurrency(booking.pricing.priceBreakdown.hotel.roomPricePerNight * booking.pricing.priceBreakdown.hotel.quantity * booking.pricing.priceBreakdown.hotel.nights, booking.pricing.priceBreakdown.hotel.currency)}</span>
                       </div>
                    )}
                    {booking.pricing.priceBreakdown.singleSupplement && (
                       <div className="flex justify-between py-1 pt-2">
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Single Supplement</span>
                          <span className="font-medium text-xs">{formatCurrency(booking.pricing.priceBreakdown.singleSupplement.amount, booking.pricing.currency)}</span>
                       </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

// #endregion

// #region --- Flight Booking Details ---

function FlightBookingDetails({ booking }: { booking: ApiFlightBooking }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {/* Left Column */}
      <div className="flex flex-col gap-5">
        <SectionCard
          title="Booking Summary"
          icon={<Hash />}
          variant="indigo"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <div className="sm:col-span-2">
               <KeyValueRow label="Reference" value={booking.reference} variant="highlight" />
             </div>
            <KeyValueRow
              label="Booking Date"
              value={formatDateTime(booking.createdAt)}
               icon={<Calendar className="w-3.5 h-3.5" />}
            />
             <KeyValueRow label="Status" value={
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 uppercase">
                  {booking.status}
                </span>
            } />
            <div className="sm:col-span-2">
                 <KeyValueRow
                  label="Agency"
                  value={booking.agency?.email}
                  icon={<Building className="w-3.5 h-3.5" />}
                />
            </div>
            <KeyValueRow label="Class ID" value={booking.classId} />
            <KeyValueRow label="Quantity" value={`${booking.quantity} Ticket(s)`} icon={<TicketIcon className="w-3.5 h-3.5"/>} />
          </div>
        </SectionCard>

        {booking.contact && (
          <SectionCard
            title="Contact Person"
            icon={<User />}
            variant="blue"
          >
            <div className="space-y-2">
              <KeyValueRow label="Name" value={booking.contact.name} variant="highlight" icon={<User className="w-3.5 h-3.5"/>} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <KeyValueRow
                    label="Email"
                    value={booking.contact.email}
                    icon={<Mail className="w-3.5 h-3.5" />}
                  />
                  <KeyValueRow
                    label="Phone"
                    value={`${booking.contact.phoneCode} ${booking.contact.phoneNumber}`}
                    icon={<Phone className="w-3.5 h-3.5" />}
                  />
              </div>
            </div>
          </SectionCard>
        )}

        {booking.priceSnapshot && (
          <SectionCard
            title="Pricing Summary"
            icon={<CreditCard />}
            variant="purple"
          >
             <div className="flex items-center justify-between px-4 py-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-3">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider">Total Price</span>
                   <span className="text-xl font-extrabold text-purple-700 dark:text-purple-300">
                    {formatCurrency(
                      booking.priceSnapshot.totalAmount,
                      booking.priceSnapshot.currency
                    )}
                  </span>
               </div>
               <div className="px-2">
                 <KeyValueRow
                    label="Unit Price"
                    value={formatCurrency(
                    booking.priceSnapshot.unitPrice,
                    booking.priceSnapshot.currency
                    )}
                    variant="subtle"
                />
               </div>

          </SectionCard>
        )}
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-5">
        {booking.blockSeat && (
          <SectionCard
            title="Flight & Route"
            icon={<Plane />}
            variant="sky"
          >
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-sky-50 dark:bg-sky-900/10 rounded-lg">
                  <div>
                       <dt className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase">Airline</dt>
                       <dd className="font-bold text-sm text-gray-900 dark:text-white">{booking.blockSeat.airline?.name}</dd>
                       <dd className="text-xs text-gray-500">{booking.blockSeat.airline?.code}</dd>
                  </div>
                   <div className="text-left sm:text-right">
                       <dt className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase">Flight Name</dt>
                       <dd className="font-medium text-sm text-gray-900 dark:text-white">{booking.blockSeat.name}</dd>
                  </div>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center text-center py-3">
                  <div className="flex flex-col items-center">
                      <span className="text-xl font-bold text-gray-800 dark:text-white">{booking.blockSeat.route?.from?.iataCode}</span>
                      <span className="text-[10px] text-gray-500">{booking.blockSeat.route?.from?.country}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                      <Plane className="w-4 h-4 text-sky-400 rotate-90 sm:rotate-0" />
                      <span className="text-[9px] uppercase text-gray-400 mt-0.5">{booking.blockSeat.route?.tripType}</span>
                  </div>
                   <div className="flex flex-col items-center">
                      <span className="text-xl font-bold text-gray-800 dark:text-white">{booking.blockSeat.route?.to?.iataCode}</span>
                      <span className="text-[10px] text-gray-500">{booking.blockSeat.route?.to?.country}</span>
                  </div>
              </div>

              {booking.trip && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <KeyValueRow
                    label="Departure"
                    value={formatDate(booking.trip.departureDate)}
                    icon={<Calendar className="w-3.5 h-3.5" />}
                  />
                  <KeyValueRow
                    label="Return"
                    value={formatDate(booking.trip.returnDate)}
                    icon={<Calendar className="w-3.5 h-3.5" />}
                  />
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {booking.passengers && (
          <SectionCard
            title={`Passengers (${booking.passengers.length})`}
            icon={<Users />}
            variant="amber"
          >
             <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-200 dark:scrollbar-thumb-amber-800">
              {booking.passengers.map((p, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700"
                >
                   <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-amber-500"/>
                          {p.title}. {p.firstName} {p.lastName}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded-full uppercase">
                          {p.paxType}
                      </span>
                   </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                         <span className="text-[10px] text-gray-500 uppercase block">Gender</span>
                         {p.gender}
                    </div>
                     <div>
                         <span className="text-[10px] text-gray-500 uppercase block">Nationality</span>
                         {p.nationality}
                    </div>
                    <div>
                         <span className="text-[10px] text-gray-500 uppercase block">DOB</span>
                         {formatDate(p.dob)}
                    </div>
                    <div>
                         <span className="text-[10px] text-gray-500 uppercase block">Passport</span>
                         {p.passportNumber}
                    </div>
                    <div>
                         <span className="text-[10px] text-gray-500 uppercase block">Expiry</span>
                         {formatDate(p.passportExpiry)}
                    </div>
                    <div>
                         <span className="text-[10px] text-gray-500 uppercase block">Issued In</span>
                         {p.passportIssueCountry}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

// Simple Ticket Icon for quantity
const TicketIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
    </svg>
)

// #endregion

// #region --- Main Modal Component ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingModalData | null;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30  duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - UPDATED to Blue-800 */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-md z-10">
          <div className="flex items-center gap-3">
             <div className="p-1.5 bg-white/10 rounded-lg ">
                {isPackage ? (
                <Package className="w-5 h-5 text-rose-200" />
                ) : (
                <Plane className="w-5 h-5 text-sky-200" />
                )}
             </div>
             <h2 className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-3">
                Booking Details
                <span className="font-mono font-medium text-sm md:text-base tracking-wide bg-blue-950/30 px-2.5 py-0.5 rounded border border-blue-700/50 text-blue-100">
                  {booking.id}
                 </span>
             </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 text-blue-100 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-gray-50 dark:bg-gray-950 scroll-smooth">
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

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-end z-10">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;