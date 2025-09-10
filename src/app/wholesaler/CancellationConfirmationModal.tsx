// components/RoomCancellationModal.tsx
"use-client";

import { AlertTriangle, ArrowLeft, Loader2, XCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Reservation } from './booking-history/BookingModal'; // Assuming Reservation type is exported from here

// Define a type for a single room within the 'allRooms' array for cancellation purposes
export type CancellableRoom = Reservation['allRooms'][0];

interface RoomCancellationModalProps {
  reservation: Reservation;
  onConfirm: (selectedRooms: CancellableRoom[]) => void;
  onClose: () => void;
  isCanceling: boolean;
}

// Helper to format dates consistently
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "N/A";
  }
};

const RoomCancellationModal: React.FC<RoomCancellationModalProps> = ({
  reservation,
  onConfirm,
  onClose,
  isCanceling,
}) => {
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [selectedRooms, setSelectedRooms] = useState<Record<number, CancellableRoom>>({});
  const [confirmationText, setConfirmationText] = useState('');

  // Toggles room selection
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

  // Handles the final confirmation click
  const handleConfirmClick = () => {
    if (confirmationText.toLowerCase() === 'y') {
      onConfirm(selectedRoomsArray);
    } else {
      toast.error('Please type "Y" to confirm cancellation.');
    }
  };

  // Step 1: Room Selection UI
  const renderSelectStep = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Select Rooms to Cancel
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <XCircle size={24} />
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        This booking contains multiple rooms. Please select which rooms you wish to cancel.
      </p>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {reservation.allRooms.map((room) => {
            const isSelected = !!selectedRooms[room.reservationId];
            const isAlreadyCancelled = room.status.toLowerCase() === 'cancelled';
            return (
              <label
                key={room.reservationId}
                className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                } ${isAlreadyCancelled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleRoom(room)}
                  disabled={isAlreadyCancelled}
                  className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <div className="ml-4 flex-grow">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{room.roomName}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-x-4">
                    <span>
                      Price: <span className="font-medium text-gray-700 dark:text-gray-300">{room.priceNet.toFixed(2)} {reservation.currency}</span>
                    </span>
                    <span>
                      Free Cancel By: <span className="font-medium text-gray-700 dark:text-gray-300">{formatDate(room.cancellationPolicy?.date)}</span>
                    </span>
                    {isAlreadyCancelled && <span className="font-bold text-red-500">Already Cancelled</span>}
                  </div>
                </div>
              </label>
            );
        })}
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          Close
        </button>
        <button
          onClick={() => setStep('confirm')}
          disabled={selectedRoomsArray.length === 0}
          className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Next
        </button>
      </div>
    </>
  );

  // Step 2: Confirmation UI
  const renderConfirmStep = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <AlertTriangle className="text-red-500 mr-2" size={24} /> Confirm Cancellation
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <XCircle size={24} />
        </button>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        You are about to cancel the selected room(s). This action cannot be undone.
      </p>
      <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
        <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Rooms to be Cancelled:</h4>
        <ul className="space-y-1 text-sm list-disc list-inside">
          {selectedRoomsArray.map(room => (
            <li key={room.reservationId}>{room.roomName}</li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
        To confirm, please type "<span className="font-bold text-red-500">Y</span>" in the box below:
      </p>
      <input
        type="text"
        value={confirmationText}
        onChange={(e) => setConfirmationText(e.target.value)}
        className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        placeholder="Type Y to confirm"
      />
      <div className="flex justify-between items-center mt-6">
        <button
            onClick={() => setStep('select')}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center"
            disabled={isCanceling}
        >
            <ArrowLeft className="w-4 h-4 mr-2"/>
            Back
        </button>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            disabled={isCanceling}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmClick}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center min-w-[170px]"
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
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
        {step === 'select' ? renderSelectStep() : renderConfirmStep()}
      </div>
    </div>
  );
};

export default RoomCancellationModal;