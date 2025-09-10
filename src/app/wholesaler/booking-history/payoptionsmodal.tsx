"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaTimes, FaWallet } from "react-icons/fa";
import { Reservation } from "./BookingModal";

interface PayOptionsModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PayOptionsModal: React.FC<PayOptionsModalProps> = ({
  reservation,
  onClose,
  onSuccess,
}) => {
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!reservation) return null;

  const handleConfirmPayment = async () => {
    const firstRoom = reservation.allRooms?.[0];
    if (!firstRoom) {
      toast.error("No room reservation found to process payment.");
      return;
    }

    const bookingId = reservation.dbId;
    const reservationId = firstRoom.reservationId;

    if (!bookingId || !reservationId) {
      toast.error("Missing required IDs for payment processing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token =
        document.cookie
          .split("; ")
          .find((r) => r.startsWith("authToken="))
          ?.split("=")[1] || localStorage.getItem("authToken");

      if (!token) throw new Error("Authorization token not found.");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/${bookingId}/reservations/${reservationId}/switch-to-credit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "An unknown error occurred.",
        }));
        throw new Error(errorData.message);
      }

      toast.success("Payment confirmed successfully! Booking updated.");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const leadPassenger =
    reservation.passengers.find((p) => p.lead) || reservation.passengers[0];
  const guestName = leadPassenger
    ? `${leadPassenger.firstName} ${leadPassenger.lastName}`
    : "N/A";

  const isConfirmDisabled =
    confirmationInput.toUpperCase() !== "Y" || isSubmitting;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FaWallet className="text-blue-600 dark:text-blue-400" />
           <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
  Confirm Payment
</h2>

          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FaTimes size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5 text-gray-700 dark:text-gray-300">
          <p className="leading-relaxed">
            An amount of{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {reservation.priceIssueSelling.toFixed(2)} {reservation.currency}
            </span>{" "}
            will be deducted from your wallet for booking{" "}
            <span className="font-medium">{reservation.hotelInfo.name}</span>{" "}
            under the name{" "}
            <span className="font-medium">{guestName}</span>.
          </p>

          <div>
            <label
              htmlFor="confirmation"
              className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2"
            >
              Type <span className="font-bold">Y</span> to confirm
            </label>
            <input
              id="confirmation"
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="Y"
              maxLength={1}
              className="w-full px-3 py-2 text-lg font-semibold rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-md font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmPayment}
            disabled={isConfirmDisabled}
            className="w-full py-2.5 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z"
                />
              </svg>
            ) : (
              "Confirm & Pay"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayOptionsModal;
