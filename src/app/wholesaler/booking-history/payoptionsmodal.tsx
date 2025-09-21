// components/PayNowModal.tsx
"use client";

import { CalendarClock, CreditCard, Landmark, User, Wallet, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Reservation } from './BookingModal';

export type PayableRoom = Reservation['allRooms'][0];

interface PayNowModalProps {
  reservation: Reservation;
  onSuccess: () => void;
  onClose: () => void;
}

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper functions to format dates and calculate fees
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return "N/A";
  }
};

const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day} ${month} ${year} ${hours}:${minutes}`;
    } catch {
        return "N/A";
    }
};

const calculateFee = (room: PayableRoom): number => {
    const policy = room.cancellationPolicy;
    if (!policy || !policy.date) return 0;
    const cancellationDeadline = new Date(policy.date);
    const now = new Date();
    if (now > cancellationDeadline) {
        return (policy as any)?.amount ?? 0;
    }
    return 0;
};

const PayNowModal: React.FC<PayNowModalProps> = ({
  reservation,
  onSuccess,
  onClose,
}) => {
  const [selectedRooms, setSelectedRooms] = useState<Record<number, PayableRoom>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Payment method is now fixed to 'balance' as gateway is disabled.
  const paymentMethod = 'balance';

  // --- NEW: Get the main balance from the reservation prop ---
  const mainBalance = reservation.agency?.walletBalance?.mainBalance ?? 0;

  useState(() => {
    const initialSelection: Record<number, PayableRoom> = {};
    reservation.allRooms.forEach(room => {
      if (room.status.toLowerCase() !== 'cancelled') {
        initialSelection[room.reservationId] = room;
      }
    });
    setSelectedRooms(initialSelection);
  });

  const handleToggleRoom = (room: PayableRoom) => {
    setSelectedRooms(prev => {
      const newSelected = { ...prev };
      if (newSelected[room.reservationId]) {
        delete newSelected[room.reservationId];
      } else {
        newSelected[room.reservationId] = room;
      }
      return newSelected;
    });
  };

  const selectedRoomsArray = useMemo(() => Object.values(selectedRooms), [selectedRooms]);

  const { totalToPay } = useMemo(() => {
    const total = selectedRoomsArray.reduce((acc, room) => acc + room.priceNet, 0);
    return { totalToPay: total };
  }, [selectedRoomsArray]);

  const handleProceedToPay = async () => {
    if (isSubmitting || selectedRoomsArray.length === 0) return;

    setIsSubmitting(true);
    const token = getAuthToken();
    if (!token) {
      toast.error("Authorization failed. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    const paymentPromises = selectedRoomsArray.map(room => {
      const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/${reservation.dbId}/reservations/${room.reservationId}/switch-to-credit`;
      return fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      }).then(async response => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Payment failed for ${room.roomName}`);
        }
        return response.json();
      });
    });

    try {
      await Promise.all(paymentPromises);
      toast.success(`Payment of ${totalToPay.toFixed(2)} ${reservation.currency} successful!`);
      onSuccess();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPayButtonDisabled = selectedRoomsArray.length === 0 || isSubmitting;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col text-gray-800 dark:text-gray-200 transform transition-all duration-300">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Complete Your Payment</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select items and confirm payment from your credit balance.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="border rounded-lg dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 bg-gray-100 dark:bg-gray-900/50 p-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">
              <div className="col-span-5">Service</div>
              <div className="col-span-2">Traveller</div>
              <div className="col-span-2 text-right pr-2">Price</div>
              <div className="col-span-3 text-right">Cancellation Fee</div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {reservation.allRooms.map((room, index) => {
                const isSelected = !!selectedRooms[room.reservationId];
                const fee = calculateFee(room);
                const passenger = reservation.passengers[index] || null;
                const isCancelled = room.status.toLowerCase() === 'cancelled';
                return (
                  <div key={room.reservationId} className={`grid grid-cols-12 gap-4 p-4 items-start transition-colors ${isCancelled ? 'opacity-50 bg-gray-50 dark:bg-gray-700/20 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}>
                    <div className="col-span-5 flex items-start gap-3">
                      <input type="checkbox" checked={isSelected} onChange={() => handleToggleRoom(room)} disabled={isCancelled} className={`h-5 w-5 rounded mt-0.5 border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0 ${isCancelled ? 'cursor-not-allowed' : 'cursor-pointer'}`} />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{reservation.hotelInfo.name}</p>
                        <p className="text-sm">{room.roomName}</p>
                        <p className="text-sm text-gray-500">{room.boardName || 'Board basis not specified'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)} ({reservation.nights} nights)</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm flex items-center gap-2 pt-1">
                      {passenger && <><User className="h-4 w-4 text-gray-500 shrink-0" /><p>{passenger.firstName} {passenger.lastName}</p></>}
                    </div>
                    <div className="col-span-2 text-right font-semibold pr-2">{isCancelled ? <span className='text-red-500 text-sm'>CANCELLED</span> : `${reservation.currency} ${room.priceNet.toFixed(2)}`}</div>
                    <div className="col-span-3 text-right text-sm">
                      <p className={`font-semibold text-base ${fee > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>{reservation.currency} {fee.toFixed(2)}</p>
                      {room.cancellationPolicy?.date && !isCancelled && <div className="flex items-center justify-end gap-1.5 mt-1 text-green-600 dark:text-green-400"><CalendarClock size={14} /><p className="text-xs font-medium">Free until {formatDateTime(room.cancellationPolicy.date)}</p></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 mt-auto bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Pay with Balance Option */}
                <div className={`p-4 rounded-lg border-2 transition-all border-blue-500 bg-blue-50 dark:bg-blue-900/30`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                           <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                           <div>
                             <span className="font-semibold text-gray-800 dark:text-gray-200">Pay with Credit Balance</span>
                              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                 Balance: {mainBalance.toFixed(2)} {reservation.currency}
                              </p>
                           </div>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-blue-600 shrink-0">
                           <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 pl-8">The total amount will be deducted from your balance.</p>
                </div>

                {/* Payment Gateway Option (Disabled) */}
                <div className="p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Landmark className="h-5 w-5 text-gray-400" />
                           <span className="font-semibold text-gray-500">Payment Gateways</span>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Currently unavailable</p>
                </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 mt-6 pt-4 border-t dark:border-gray-700">
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-200">
                Total to Pay: 
                <span className="text-2xl ml-2 text-blue-600 dark:text-blue-400">{reservation.currency} {totalToPay.toFixed(2)}</span>
              </p>
            </div>
            <div className="flex space-x-3">
              <button onClick={onClose} className="px-5 py-2.5 rounded-md text-sm font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition">Cancel</button>
              <button onClick={handleProceedToPay} disabled={isPayButtonDisabled} className="px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2">
                {isSubmitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Processing...</>) : (`Pay Selected (${selectedRoomsArray.length})`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayNowModal;