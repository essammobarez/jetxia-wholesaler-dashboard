'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  FiX, 
  FiChevronDown, 
  FiHome, 
  FiCalendar, 
  FiMoon, 
  FiUsers, 
  FiMapPin, 
  FiFileText, 
  FiCreditCard, 
  FiTag,
  FiEdit 
} from 'react-icons/fi';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaBan } from 'react-icons/fa';
import EditPriceModal from './EditPriceModal'; 

// INTERFACES 
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
  allRooms?: any[];
  priceDetails?: {
    price?: { value: number; currency: string };
    originalPrice?: { value: number; currency: string };
    markupApplied?: { type: string; value: number; description: string };
  };
  agentRef?: string; 
}

interface BookingModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
}

// HELPER COMPONENTS FOR CLEANER UI
const Section: React.FC<{ title: string; children: React.ReactNode; icon?: React.ElementType }> = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
    <h3 className="flex items-center gap-2 px-4 py-2 text-base font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
      {Icon && <Icon className="text-blue-500" />}
      {title}
    </h3>
    <div className="p-4 space-y-3">
      {children}
    </div>
  </div>
);

const DetailItem: React.FC<{ label: string; value?: React.ReactNode; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div className="flex items-start justify-between text-sm">
    <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </p>
    <p className="font-medium text-gray-800 dark:text-gray-200 text-right">{value || 'N/A'}</p>
  </div>
);

// DATE FORMATTER
const formatDate = (d: string) => {
    if (!d) return null;
    try {
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return null;
        return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
    } catch {
        return null;
    }
};

const RoomAccordion: React.FC<{ room: any; index: number; currency: string }> = ({ room, index, currency }) => {
    const [isOpen, setIsOpen] = useState(index === 0); // Open the first room by default
  
    const policy = room.cancellationPolicy;
    const chargeInfo = policy?.policies?.[0]?.charge?.components?.net;

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-3 overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="text-left">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Room {index + 1}: <span className="text-blue-500">{room.roomName}</span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {room.guests.length} Guest(s)
            </p>
          </div>
          <FiChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
  
        {isOpen && (
          <div className="p-4 bg-white dark:bg-gray-800/50 space-y-4">
            {/* Pricing, Board & Policy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
                <p className="font-semibold mb-2">Pricing</p>
                <DetailItem label="Net Price" value={`${room.priceNet.toFixed(2)} ${currency}`} />
                <DetailItem label="Commission" value={`${room.priceCommission.toFixed(2)} ${currency}`} />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md space-y-3">
                <div>
                    <p className="font-semibold mb-1">Board Basis</p>
                    <DetailItem label="Type" value={`${room.board} (${room.boardBasis})`} />
                </div>
                <div>
                  <p className="font-semibold mb-2">Cancellation Policy</p>
                  {room.status === 'cancelled' ? (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <FaBan />
                      <span className="font-bold">No policy available, Room is cancelled</span>
                    </div>
                  ) : policy && policy.date ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <FaCheckCircle />
                        <span className="font-bold">Free cancellation until:</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 pl-6">{formatDate(policy.date)}</p>
                      {chargeInfo &&
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 pl-6">
                          Charge after deadline: <strong>
                            {chargeInfo.value.toFixed(2)} {chargeInfo.currency}
                          </strong>
                        </p>
                      }
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <FaTimesCircle />
                      <span className="font-bold">Non-refundable</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Guest Details Table */}
            <div>
              <h5 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Guest Details</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {room.guests.map((guest: Passenger, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="p-2 font-medium">{guest.firstName} {guest.lastName} {guest.lead && <span className="text-blue-400 text-xs">(Lead)</span>}</td>
                        <td className="p-2 capitalize">{guest.type}</td>
                        <td className="p-2">{guest.email || '—'}</td>
                        <td className="p-2">{guest.phone ? `${guest.phonePrefix || ''}${guest.phone}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {room.guests.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No guest details assigned to this room.</p>}
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                    onClick={() => alert(`Room cancellation (ID: ${room.reservationId}) is a future feature.`)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    disabled={room.status === 'cancelled'}
                >
                    <FaBan />
                    Cancel This Room
                </button>
            </div>
          </div>
        )}
      </div>
    );
};


export const BookingModal: React.FC<BookingModalProps> = ({ reservation: r, isOpen, onClose }) => {
  const modalRoot = typeof document !== 'undefined' ? (document.getElementById('modal-root') || document.body) : null;
  
  // --- STATE FOR EDIT PRICE MODAL ---
  const [isEditPriceModalOpen, setIsEditPriceModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !modalRoot) return null;
  
  const getModalStatus = (reservation: Reservation): string => {
    if (!reservation.allRooms || reservation.allRooms.length === 0) {
      return reservation.topStatus.toLowerCase(); // Fallback if no room data
    }
    const roomStatuses = new Set(reservation.allRooms.map(room => room.status.toLowerCase()));
    
    if (roomStatuses.has('cancelled')) return 'cancelled';
    if (roomStatuses.has('pending')) return 'pending';
    if (roomStatuses.has('confirmed') || roomStatuses.has('ok')) return 'confirmed';
    
    return reservation.topStatus.toLowerCase();
  };

  const statusStyles: { [key: string]: { icon: React.ElementType, color: string, label: string } } = {
    confirmed: { icon: FaCheckCircle, color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300", label: "Paid" },
    ok: { icon: FaCheckCircle, color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300", label: "OK" },
    cancelled: { icon: FaTimesCircle, color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300", label: "Cancelled" },
    pending: { icon: FaExclamationCircle, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300", label: "Payment Pending" },
  };

  const modalStatusKey = getModalStatus(r);
  const statusInfo = statusStyles[modalStatusKey] || statusStyles.pending;

  // --- PRICE CALCULATION LOGIC ---
  const s = r.priceDetails?.originalPrice?.value ?? 0;
  const markupDetails = r.priceDetails?.markupApplied;
  const markupValue = markupDetails?.value ?? 0;
  // Calculate markup amount based on type (percentage or fixed)
  const m = markupDetails?.type === 'percentage' ? s * (markupValue / 100) : markupValue;
  const np = s + m;
  const sp = r.priceDetails?.price?.value ?? np; // Use net price as fallback
  // Commission (C) and Discount (D) are not in `priceDetails`, default to 0.
  const c = 0;
  const d = 0;
  
  const calculatedPrices = { s, m, np, c, d, sp };

  const handlePriceSave = (updatedData: any) => {
      console.log("Price update received:", updatedData);
      // In a real app, you would refetch booking data here to reflect changes
      setIsEditPriceModalOpen(false);
  };
  
  // A small component for displaying a row in the price breakdown
  const PriceRow: React.FC<{ label: string, value: number, isBold?: boolean, isRed?: boolean }> = ({ label, value, isBold = false, isRed = false }) => (
    <div className={`flex justify-between items-center text-sm ${isBold ? 'font-semibold' : ''} ${isRed ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>
      <p className="text-gray-500 dark:text-gray-400">{label}:</p>
      <p>{value.toFixed(2)}</p>
    </div>
  );

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
          
          {/* MODAL HEADER */}
          <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Booking <span className="text-blue-500">{r.bookingId}</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Created on {formatDate(r.createdAt)} by {r.addedUser}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.color}`}>
                <statusInfo.icon/>
                <span>{statusInfo.label}</span>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <FiX size={24} />
              </button>
            </div>
          </header>

          {/* MODAL CONTENT */}
          <main className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: BOOKING OVERVIEW */}
            <div className="lg:col-span-1 space-y-6">
              <Section title="Hotel & Stay" icon={FiHome}>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{r.hotelInfo.name}</h4>
                <DetailItem label="Check-in" value={formatDate(r.checkIn)} icon={FiCalendar}/>
                <DetailItem label="Check-out" value={formatDate(r.checkOut)} icon={FiCalendar}/>
                <DetailItem label="Total Nights" value={r.nights} icon={FiMoon}/>
                <DetailItem label="Destination" value={`${r.destinationCity}, ${r.destinationCountry}`} icon={FiMapPin}/>
              </Section>

              <Section title="Agency Details" icon={FiUsers}>
                <DetailItem label="Agency" value={r.agencyName}/>
                <DetailItem label="Reservation:" value={r.reservationId}/>
                <DetailItem label="Agent Reference" value={r.agentRef}/>
                <DetailItem label="Provider" value={r.providerName}/>
              </Section>
              
              {/* --- UPDATED PAYMENT OVERVIEW SECTION --- */}
              <Section title="Payment Overview" icon={FiCreditCard}>
                  <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-base text-gray-800 dark:text-gray-100">Price Breakdown</h4>
                      <button 
                          onClick={() => setIsEditPriceModalOpen(true)}
                          className="flex items-center gap-1.5 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md font-medium transition-colors"
                      >
                          <FiEdit />
                          Edit
                      </button>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md space-y-1.5">
                      <PriceRow label="S (Suppl.)" value={calculatedPrices.s} />
                      <PriceRow label="M (Markup)" value={calculatedPrices.m} />
                      <div className="border-t border-gray-200 dark:border-gray-700 !my-2"></div>
                      <PriceRow label="NP (Net)" value={calculatedPrices.np} isBold />
                      <PriceRow label="C (Comm.)" value={calculatedPrices.c} isRed />
                      <PriceRow label="D (Disc.)" value={calculatedPrices.d} isRed />
                      <div className="border-t border-gray-200 dark:border-gray-700 !my-2"></div>
                      <div className="text-blue-600 dark:text-blue-400">
                        <PriceRow label="SP (Sell)" value={calculatedPrices.sp} isBold />
                      </div>
                  </div>
                  <DetailItem label="Payment Type" value={r.paymentType} icon={FiTag}/>
                  <DetailItem label="Payment Status" value={r.paymentStatus} icon={FiFileText}/>
              </Section>
            </div>

            {/* RIGHT COLUMN: ROOMS BREAKDOWN */}
            <div className="lg:col-span-2">
                <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  <FiUsers className="text-blue-500" />
                  Room & Guest Breakdown
                </h3>
              {(r.allRooms && r.allRooms.length > 0) ? r.allRooms.map((room, idx) => (
                <RoomAccordion key={room.reservationId || idx} room={room} index={idx} currency={r.currency}/>
              )) : (
                <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg">
                  No detailed room information available.
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      
      {/* RENDER THE EDIT PRICE MODAL */}
      <EditPriceModal
        isOpen={isEditPriceModalOpen}
        onClose={() => setIsEditPriceModalOpen(false)}
        onSave={handlePriceSave}
        reservation={r}
        calculatedPrices={calculatedPrices}
      />
    </>,
    modalRoot
  );
};