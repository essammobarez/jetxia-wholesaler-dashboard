// components/CancellationConfirmationModal.tsx
import React, { useState } from 'react';
import { XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast'; // Import toast

// Define the Booking interface within this file or in a shared types file
export interface Booking {
  dbId: string; // Add dbId here
  bookingId: string;
  hotel: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  cancelUntil: string;
  paymentStatus: string;
}

interface CancellationConfirmationModalProps {
  booking: Booking;
  onConfirm: (dbId: string) => void;
  onClose: () => void;
  isCanceling: boolean;
}

const CancellationConfirmationModal: React.FC<CancellationConfirmationModalProps> = ({
  booking,
  onConfirm,
  onClose,
  isCanceling,
}) => {
  const [confirmationText, setConfirmationText] = useState('');

  const handleConfirmClick = () => {
    if (confirmationText.toLowerCase() === 'y') {
      onConfirm(booking.dbId);
    } else {
      toast.error('Please type "Y" to confirm cancellation.'); // Show error toast instead of alert
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={24} /> Confirm Cancellation
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XCircle size={24} />
          </button>
        </div>

        <div className="text-gray-700 dark:text-gray-300 mb-6">
          <p className="mb-4">
            You are about to cancel the following booking. This action cannot be undone.
            Please review the details carefully.
          </p>
          <ul className="space-y-2 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <li><span className="font-semibold">Booking ID:</span> {booking.bookingId}</li>
            <li><span className="font-semibold">Hotel:</span> {booking.hotel}</li>
            <li><span className="font-semibold">Guest Name:</span> {booking.guestName}</li>
            <li><span className="font-semibold">Check-in:</span> {booking.checkIn}</li>
            <li><span className="font-semibold">Check-out:</span> {booking.checkOut}</li>
            {booking.cancelUntil && booking.paymentStatus !== 'Canceled' && (
              <li><span className="font-semibold text-green-600 dark:text-green-400">Free Cancellation Until:</span> {format(new Date(booking.cancelUntil), 'dd/MM/yyyy')}</li>
            )}
            {/* {booking.paymentStatus === 'PR' && (
              <li className="text-purple-600 dark:text-purple-400"><span className="font-semibold">Payment Status:</span> Awaiting Payment</li>
            )} */}
            {booking.paymentStatus === 'Pending' && (
              <li className="text-yellow-600 dark:text-yellow-400"><span className="font-semibold">Payment Status:</span> Pending</li>
            )}
          </ul>

          <p className="mt-4 text-sm font-medium">
            To confirm cancellation, please type "<span className="font-bold text-red-500">Y</span>" in the box below:
          </p>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Type Y to confirm"
            aria-label="Type Y to confirm cancellation"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            disabled={isCanceling}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmClick}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
            disabled={isCanceling || confirmationText.toLowerCase() !== 'y'}
          >
            {isCanceling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelling...
              </>
            ) : (
              'Confirm Cancellation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationConfirmationModal;