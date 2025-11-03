import { useRouter } from "next/navigation";
import React from "react";
import {
  FaBan,
  FaCheckCircle,
  FaCreditCard,
  FaEye,
  FaFileInvoiceDollar,
  FaPlus,
  FaTicketAlt,
} from "react-icons/fa";

import { Reservation } from "./BookingModal";

type RoomNeedingConfirmation = {
  reservationId: number;
  reference?: {
    confirmation: string | null;
  } | null;
  status: string;
  // Add other properties if needed, or use 'any' if type is complex
  [key: string]: any;
};

type BookingActionsProps = {
  reservation: Reservation;
  reservationForModals: Reservation;
  overallStatusKey: string;
  isCancelled: boolean;
  isGenerating: boolean;
  isLoaderVisible: boolean;
  updatingBookingId: string | null;
  firstRoomNeedingConfirmation?: RoomNeedingConfirmation;
  onOnRequestStatusChange: (
    bookingId: string,
    newStatus: "confirmed" | "cancelled"
  ) => void;
  onAddServiceClick: () => void;
  onCancelClick: (reservation: Reservation) => void;
  onPayNowClick: (reservation: Reservation) => void;
  onAddConfirmationClick: (
    reservation: Reservation,
    reservationId: number
  ) => void;
  onGenerateVoucherClick: (reservation: Reservation) => void;
  onGenerateInvoiceClick: (reservation: Reservation) => void;
  onViewClick: (reservation: Reservation) => void;
};

const BookingActions: React.FC<BookingActionsProps> = ({
  reservation,
  reservationForModals,
  overallStatusKey,
  isCancelled,
  isGenerating,
  isLoaderVisible,
  updatingBookingId,
  firstRoomNeedingConfirmation,
  onOnRequestStatusChange,
  onAddServiceClick,
  onCancelClick,
  onPayNowClick,
  onAddConfirmationClick,
  onGenerateVoucherClick,
  onGenerateInvoiceClick,
  onViewClick,
}) => {
  const router = useRouter();

  const baseButtonStyles =
    "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg shadow-sm border transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  const defaultButtonStyles =
    "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600";
  const cancelButtonStyles =
    "bg-red-500 hover:bg-red-600 text-white border-red-600";
  const payButtonStyles =
    "bg-green-500 hover:bg-green-600 text-white border-green-600";
  const viewButtonStyles =
    "bg-blue-500 hover:bg-blue-600 text-white border-blue-600";

  return (
    <div className="flex items-center flex-wrap gap-2 mt-4">
      {reservation.topStatus.toLowerCase() === "onrequest" ? (
        <>
          <button
            onClick={() =>
              onOnRequestStatusChange(reservation.dbId, "confirmed")
            }
            disabled={updatingBookingId === reservation.dbId}
            className={`${baseButtonStyles} ${payButtonStyles}`}
          >
            <FaCheckCircle />
            <span>
              {updatingBookingId === reservation.dbId
                ? "Accepting..."
                : "Accept"}
            </span>
          </button>
          <button
            onClick={() =>
              onOnRequestStatusChange(reservation.dbId, "cancelled")
            }
            disabled={updatingBookingId === reservation.dbId}
            className={`${baseButtonStyles} ${cancelButtonStyles}`}
          >
            <FaBan />
            <span>
              {updatingBookingId === reservation.dbId
                ? "Rejecting..."
                : "Reject"}
            </span>
          </button>
          <button
            onClick={() => onViewClick(reservationForModals)}
            disabled={updatingBookingId === reservation.dbId}
            className={`${baseButtonStyles} ${viewButtonStyles}`}
          >
            <FaEye />
            <span>View</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onAddServiceClick}
            className={`${baseButtonStyles} ${defaultButtonStyles}`}
          >
            <FaPlus />
            <span>Add Service</span>
          </button>
          <button
            onClick={() => onCancelClick(reservationForModals)}
            disabled={overallStatusKey === "cancelled"}
            className={`${baseButtonStyles} ${cancelButtonStyles}`}
          >
            <FaBan />
            <span>Cancel</span>
          </button>

          {reservation.paymentType.toLowerCase() === "paylater" && (
            <button
              onClick={() => onPayNowClick(reservationForModals)}
              disabled={overallStatusKey === "cancelled"}
              className={`${baseButtonStyles} ${payButtonStyles}`}
            >
              <FaCreditCard />
              <span>PayNow</span>
            </button>
          )}

          {firstRoomNeedingConfirmation && !isCancelled && (
            <button
              onClick={() =>
                onAddConfirmationClick(
                  reservation,
                  firstRoomNeedingConfirmation.reservationId
                )
              }
              className={`${baseButtonStyles} bg-purple-500 hover:bg-purple-600 text-white border-purple-600`}
            >
              <FaCheckCircle />
              <span>Add Confirmation</span>
            </button>
          )}

          <button
            onClick={() => onGenerateVoucherClick(reservationForModals)}
            disabled={isGenerating || isLoaderVisible}
            className={`${baseButtonStyles} ${defaultButtonStyles}`}
          >
            <FaTicketAlt />
            <span>Voucher</span>
          </button>
          <button
            onClick={() => onGenerateInvoiceClick(reservationForModals)}
            disabled={isGenerating || isLoaderVisible}
            className={`${baseButtonStyles} ${defaultButtonStyles}`}
          >
            <FaFileInvoiceDollar />
            <span>Invoice</span>
          </button>
          <button
            onClick={() => onViewClick(reservationForModals)}
            className={`${baseButtonStyles} ${viewButtonStyles}`}
          >
            <FaEye />
            <span>View</span>
          </button>
        </>
      )}
    </div>
  );
};

export default BookingActions;