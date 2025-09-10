// components/RoomCancellationModal.tsx
"use-client";

import { AlertTriangle, CalendarClock, CreditCard, Trash2, User, Wallet, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast'; // Import toast
import { Reservation } from './BookingModal';

export type CancellableRoom = Reservation['allRooms'][0];

interface RoomCancellationModalProps {
  reservation: Reservation;
  onSuccess: () => void; // Replaced onConfirm with onSuccess
  onClose: () => void;
}

// NEW: Helper function to retrieve the auth token from localStorage
const getAuthToken = (): string | null => {
    // This assumes you store your token in localStorage with the key 'authToken'.
    // Adjust the key if you use a different one.
    return localStorage.getItem('authToken');
};

// Helper functions (unchanged)
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

const calculateFee = (room: CancellableRoom): number => {
    const policy = room.cancellationPolicy;
    if (!policy || !policy.date) return 0;
    const cancellationDeadline = new Date(policy.date);
    const now = new Date();
    if (now > cancellationDeadline) {
        return (policy as any).amount ?? 0;
    }
    return 0;
};

const RoomCancellationModal: React.FC<RoomCancellationModalProps> = ({
  reservation,
  onSuccess,
  onClose,
}) => {
  const [selectedRooms, setSelectedRooms] = useState<Record<number, CancellableRoom>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleRoom = (room: CancellableRoom) => {
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
  const isPayLaterBooking = reservation.paymentType === 'PAYLATER';

  const { totalFinalPrice, totalToBeRefunded } = useMemo(() => {
    let finalPrice = 0;
    let refundAmount = 0;
    
    selectedRoomsArray.forEach(room => {
      finalPrice += room.priceNet;
      if (!isPayLaterBooking) {
        const fee = calculateFee(room);
        refundAmount += (room.priceNet - fee);
      }
    });

    return { totalFinalPrice: finalPrice, totalToBeRefunded: refundAmount };
  }, [selectedRoomsArray, isPayLaterBooking]);
  
  // --- UPDATED: API call logic now includes token fetching ---
  const handleProceedToCancel = async () => {
    if (selectedRoomsArray.length === 0 || isSubmitting) return;
    
    setIsSubmitting(true);

    // Fetch the authentication token
    const token = getAuthToken();
    if (!token) {
      toast.error("Authorization failed. Please log in again.");
      setIsSubmitting(false);
      return;
    }
    
    const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}cancel-book`;

    const cancellationPromises = selectedRoomsArray.map(room => {
        const payload = {
            provider: reservation.providerId,
            bookingId: reservation.dbId, // Use the database _id
            typeCancelation: "element",
            reservationId: String(room.reservationId),
        };

        return fetch(endpoint, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Pass the token in the Authorization header
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        }).then(async response => {
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Cancellation failed for room ${room.roomName}`);
            }
            return response.json();
        });
    });

    try {
        await Promise.all(cancellationPromises);
        toast.success(`${selectedRoomsArray.length} room(s) successfully cancelled!`);
        onSuccess(); // Notify parent to refresh and close
    } catch (error: any) {
        toast.error(`Error: ${error.message || "An unknown error occurred"}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const CancellationInfoBox = () => (
    <div className="mt-4 p-3 rounded-lg flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        {isPayLaterBooking ? (
            <Wallet className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
        ) : (
            <CreditCard className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
        )}
        <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                {isPayLaterBooking ? "Pay Later Booking" : "Credit Booking"}
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
                {isPayLaterBooking 
                    ? "You chose to pay at the hotel. No refund will be processed as no payment has been made." 
                    : "Your booking was a credit booking. The refund amount shown will be credited to your original payment method."}
            </p>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col text-gray-800 dark:text-gray-200 transform transition-all duration-300">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20 shrink-0">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <div>
              <h2 className="text-xl font-bold text-red-800 dark:text-red-200">Cancel Booking</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select the items you wish to cancel.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="border rounded-lg dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 bg-gray-100 dark:bg-gray-900/50 p-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">
              <div className="col-span-5">Service</div>
              <div className="col-span-2">Traveller</div>
              <div className="col-span-2 text-right pr-[10px]">Price</div>
              <div className="col-span-3 text-right">Cancellation Fee</div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {reservation.allRooms.map((room, index) => {
                const isSelected = !!selectedRooms[room.reservationId];
                const fee = calculateFee(room);
                const passenger = reservation.passengers[index] || null;
                const isAlreadyCancelled = room.status.toLowerCase() === 'cancelled';
                
                return (
                  <div key={room.reservationId} className={`grid grid-cols-12 gap-4 p-4 items-start transition-colors ${isAlreadyCancelled ? 'opacity-60 bg-gray-50 dark:bg-gray-700/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}>
                    <div className="col-span-5 flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRoom(room)}
                        disabled={isAlreadyCancelled}
                        className={`h-5 w-5 rounded mt-0.5 border-gray-300 text-red-600 focus:ring-red-500 shrink-0 ${isAlreadyCancelled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{reservation.hotelInfo.name}</p>
                        <p className="text-sm">{room.roomName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)} ({reservation.nights} nights)</p>
                      </div>
                    </div>
                    
                    <div className="col-span-2 text-sm flex items-center gap-2 pt-1">
                      {passenger && (
                        <>
                          <User className="h-4 w-4 text-gray-500 shrink-0" />
                          <p>{passenger.firstName} {passenger.lastName} <span className="text-xs text-gray-500 dark:text-gray-400">{passenger.lead ? '(Lead)' : ''}</span></p>
                        </>
                      )}
                    </div>

                    <div className="col-span-2 text-right font-semibold pr-[10px]">
                      {reservation.currency} {room.priceNet.toFixed(2)}
                    </div>

                    <div className="col-span-3 text-right text-sm">
                      <p className="font-semibold text-base text-red-600 dark:text-red-400">{reservation.currency} {fee.toFixed(2)}</p>
                      {room.cancellationPolicy?.date && (
                        <div className="flex items-center justify-end gap-1.5 mt-1 text-green-600 dark:text-green-400">
                          <CalendarClock size={14} />
                          <p className="text-xs font-medium">Free until {formatDateTime(room.cancellationPolicy.date)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <CancellationInfoBox />
        </div>

        <div className="p-6 mt-auto bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 shrink-0">
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                Total for selected items: <span className="font-bold text-gray-900 dark:text-white">{reservation.currency} {totalFinalPrice.toFixed(2)}</span>
              </p>
              <p className="font-bold text-green-600 dark:text-green-400 mt-1">
                Total to be refunded: 
                <span className="text-2xl ml-2">{reservation.currency} {totalToBeRefunded.toFixed(2)}</span>
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={onClose} 
                className="px-5 py-2.5 rounded-md text-sm font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                Keep Booking
              </button>
              <button
                onClick={handleProceedToCancel}
                disabled={selectedRoomsArray.length === 0 || isSubmitting}
                className="px-5 py-2.5 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Cancel Selected ({selectedRoomsArray.length})
                  </>
                )}
              </button>
            </div>
          </div>
            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-4">
              By proceeding, you agree to the cancellation charges shown above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomCancellationModal;