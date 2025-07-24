'use client';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';

interface Passenger {
  paxId: number;
  type: string;
  lead: boolean;
  title: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  phonePrefix?: string | null;
}

interface RoomDetail {
  id: string;
  name: string;
  board: string;
  boardBasis: string;
  info: string;
  passengerIds: number[];
}

interface HotelInfo {
  id: string;
  name: string;
  stars: number;
  lastUpdated: string;
  cityId: string;
  countryId: string;
}

interface Remark {
  code: string;
  name: string;
  list: string[];
}

export interface Reservation {
  dbId?: string;
  bookingId: string;
  sequenceNumber: number;
  reservationId: number;
  topStatus: string;
  createdAt: string;
  agencyName: string;
  wholesaler?: string;
  wholesalerName: string;
  providerId?: string;
  providerName?: string;
  clientRef: string;
  serviceType: string;
  initStatus: string;
  price: number;
  currency: string;
  addedTime: string;
  addedUser: string;
  paymentType: string;
  paymentStatus: string;
  rateDescription: string;
  priceIssueNet: number;
  priceIssueCommission: number;
  priceIssueSelling: number;
  cancellationDate: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  destinationCity: string;
  destinationCountry: string;
  nationality: string;
  passengers: Passenger[];
  remarks: Remark[];
  hotelInfo: HotelInfo;
  rooms: RoomDetail[];
  freeCancellation: string;
  priceDetails?: {
    price?: { value: number; currency: string };
    originalPrice?: { value: number; currency: string };
    markupApplied?: { type: string; value: number };
  };
}

interface BookingModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ reservation: r, isOpen, onClose }) => {
  // Create or get modal root
  const modalRoot = typeof document !== 'undefined'
    ? document.getElementById('modal-root') || (() => {
        const el = document.createElement('div');
        el.id = 'modal-root';
        document.body.appendChild(el);
        return el;
      })()
    : null;

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !modalRoot) return null;

  // Format helper for DD/MM/YYYY
  const formatDate = (d: string) => {
    if (!d) return 'N/A';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return 'N/A';

    const day = String(dt.getDate()).padStart(2, '0');
    const month = String(dt.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = dt.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Aliases to match existing function calls in the JSX
  const fmtDate = formatDate;
  const fmtDateTime = formatDate;

  // Guest name
  const passengers = r.passengers || [];
  const lead = passengers.find(p => p.lead) || passengers[0] || ({} as Passenger);
  const guestName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || '-';

  // Compute nights if missing
  let nightsCount = r.nights;
  if ((!nightsCount || nightsCount <= 0) && r.checkIn && r.checkOut) {
    const d1 = new Date(r.checkIn);
    const d2 = new Date(r.checkOut);
    const diffMs = d2.getTime() - d1.getTime();
    nightsCount = diffMs > 0 ? Math.round(diffMs / (1000 * 60 * 60 * 24)) : 0;
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b dark:border-gray-700">
          <FaCheckCircle className="text-green-500 text-xl" />
          <h2 className="text-lg font-semibold dark:text-white">
            Booking Details: {r.bookingId} <span className="text-sm text-gray-500 dark:text-gray-300">(Reservation #{r.reservationId})</span>
          </h2>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Created: {fmtDateTime(r.createdAt)}
            </span>
            <button 
              onClick={onClose} 
              aria-label="Close modal"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 space-y-6">
          {/* 1. Order & Agency Info */}
          <section>
            <h3 className="text-blue-600 font-medium text-sm mb-1">Order & Agency Info</h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-blue-50 p-3 rounded-md">
              <div>
                <p className="text-[10px] text-gray-500">Booking ID</p>
                <p className="font-semibold">{r.bookingId}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Reservation ID</p>
                <p className="font-semibold">{r.reservationId}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Sequence #</p>
                <p className="font-semibold">{r.sequenceNumber}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Agency</p>
                <p className="font-semibold truncate">{r.agencyName}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Wholesaler</p>
                <p className="font-semibold truncate">{r.wholesalerName}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Client Ref</p>
                <p className="font-semibold break-all">{r.clientRef}</p>
              </div>
            </div>
          </section>

          {/* 2. Hotel & Stay Info */}
          <section>
            <h3 className="text-blue-600 font-medium text-sm mb-1">Hotel & Stay Info</h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-blue-50 p-3 rounded-md">
              <div>
                <p className="text-[10px] text-gray-500">Hotel Name</p>
                <p className="font-semibold">{r.hotelInfo.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Stars</p>
                <p className="font-semibold">{r.hotelInfo.stars}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Check-in</p>
                <p className="font-semibold">{fmtDate(r.checkIn)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Check-out</p>
                <p className="font-semibold">{fmtDate(r.checkOut)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Nights</p>
                <p className="font-semibold">{nightsCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Destination</p>
                <p className="font-semibold">{r.destinationCity}, {r.destinationCountry}</p>
              </div>
              <div className="sm:col-span-3">
                <p className="text-[10px] text-gray-500">Free Cancellation Until</p>
                <p className="font-semibold">{r.freeCancellation ? fmtDateTime(r.freeCancellation) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Nationality</p>
                <p className="font-semibold">{r.nationality}</p>
              </div>
            </div>
          </section>

          {/* 3. Pricing & Payment */}
          <section>
            <h3 className="text-blue-600 font-medium text-sm mb-1">Pricing & Payment</h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-blue-50 p-3 rounded-md">
              <div>
                <p className="text-[10px] text-gray-500">Price ({r.currency})</p>
                <p className="font-semibold">{r.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Payment Type</p>
                <p className="font-semibold">{r.paymentType}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Payment Status</p>
                <p className="font-semibold">{r.paymentStatus}</p>
              </div>
              <div className="sm:col-span-3">
                <p className="text-[10px] text-gray-500">Rate Details</p>
                <p className="font-semibold whitespace-pre-wrap">{r.rateDescription || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Price Breakdown (Issue Net)</p>
                <p className="font-semibold">{r.priceIssueNet.toFixed(2)} {r.currency}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Commission</p>
                <p className="font-semibold">{r.priceIssueCommission.toFixed(2)} {r.currency}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Selling Price</p>
                <p className="font-semibold">{r.priceIssueSelling.toFixed(2)} {r.currency}</p>
              </div>
            </div>
          </section>

          {/* 4. Guest Info */}
          <section>
            <h3 className="text-blue-600 font-medium text-sm mb-1">Guest Information</h3>
            {passengers.map((g, idx) => {
              const email = g.email || '-';
              const phone = g.phonePrefix && g.phone ? `${g.phonePrefix}${g.phone}` : '-';
              return (
                <div key={idx} className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-blue-50 p-3 rounded-md mb-2">
                  <div>
                    <p className="text-[10px] text-gray-500">Name</p>
                    <p className="font-semibold">{g.title ? `${g.title}. ` : ''}{g.firstName} {g.lastName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Email</p>
                    <p className="font-semibold truncate">{email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Phone</p>
                    <p className="font-semibold">{phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Type</p>
                    <p className="font-semibold">{g.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Pax ID</p>
                    <p className="font-semibold">{g.paxId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Lead</p>
                    <p className="font-semibold">{g.lead ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* 5. Room Details */}
          <section>
            <h3 className="text-blue-600 font-medium text-sm mb-1">Room Details</h3>
            {r.rooms.length > 0 ? r.rooms.map((room, idx) => (
              <div key={idx} className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-blue-50 p-3 rounded-md mb-2">
                <div className="sm:col-span-2">
                  <p className="text-[10px] text-gray-500">Room Name</p>
                  <p className="font-semibold">{room.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Board</p>
                  <p className="font-semibold">{room.board} ({room.boardBasis})</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Passengers IDs</p>
                  <p className="font-semibold">{room.passengerIds.join(', ') || '-'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] text-gray-500">Info</p>
                  <p className="font-semibold whitespace-pre-wrap">{room.info || '-'}</p>
                </div>
              </div>
            )) : (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-blue-50 p-3 rounded-md mb-2">
                <div className="sm:col-span-6 text-center text-gray-500">No room details</div>
              </div>
            )}
          </section>

          {/* 6. Remarks / Notes */}
          <section>
            <h3 className="text-blue-600 font-medium text-sm mb-1">Remarks / Notes</h3>
            {r.remarks.length > 0 ? r.remarks.map((rm, idx) => (
              <div key={idx} className="bg-blue-50 p-3 rounded-md mb-2">
                <p className="text-[10px] text-gray-500 font-medium">{rm.name}</p>
                <ul className="list-disc ml-5 text-gray-800 dark:text-gray-200">
                  {rm.list.map((line, j) => (
                    <li key={j} className="whitespace-pre-wrap">{line}</li>
                  ))}
                </ul>
              </div>
            )) : (
              <p className="text-gray-500">No remarks</p>
            )}
          </section>

          {/* 7. Cancellation & Links */}
          <section>
            <h3 className="text-blue-600 font-medium text-sm mb-1">Cancellation & Links</h3>
            <div className="bg-blue-50 p-3 rounded-md space-y-1">
              <p className="text-[10px] text-gray-500">Cancellation Deadline</p>
              <p className="font-semibold">
                {r.cancellationDate ? fmtDateTime(r.cancellationDate) : 'N/A'}
              </p>
              {/* If you have links to cancel/sync, you can list here if provided in response. */}
              {/* Example: if item.bookingData.reservationDetails._links.cancel.href available, you could show a button/link. */}
            </div>
          </section>

          {/* 8. Additional Info */}
          <section>
            <h3 className="text-blue-600 font-medium text-sm mb-1">Additional Info</h3>
            <div className="bg-blue-50 p-3 rounded-md space-y-1">
              <p className="text-[10px] text-gray-500">Initial Status</p>
              <p className="font-semibold">{r.initStatus}</p>
              <p className="text-[10px] text-gray-500">Service Type</p>
              <p className="font-semibold">{r.serviceType}</p>
              <p className="text-[10px] text-gray-500">Added On</p>
              <p className="font-semibold">{fmtDateTime(r.addedTime)} by {r.addedUser}</p>
            </div>
          </section>
        </div>
      </div>
    </div>,
    modalRoot
  );
};