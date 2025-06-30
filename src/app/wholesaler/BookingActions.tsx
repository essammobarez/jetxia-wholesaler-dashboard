// components/BookingActions.tsx
import React from 'react';
import {
  FaTimes,
  FaEdit,
  FaFileInvoiceDollar,
  FaTicketAlt,
  FaCreditCard,
  FaLink,
  FaPercentage,
  FaEye,
  FaHashtag,
  FaReceipt,
  FaCheckCircle,
} from 'react-icons/fa';
import { Reservation } from './BookingModal';

interface Props {
  reservation: Reservation;
  onViewDetails: () => void;
  onEditPrice: (res: Reservation) => void;
  onCancel: (res: Reservation) => void;
}

const BookingActions: React.FC<Props> = ({
  reservation,
  onViewDetails,
  onEditPrice,
  onCancel,
}) => (
  <aside className="w-full sm:col-span-1 bg-gray-50 dark:bg-gray-800 p-4 border-l border-gray-100 dark:border-gray-700">
    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 mt-3">
      Actions
    </h4>

    <div className="grid grid-cols-5 gap-x-12 sm:grid-cols-4 sm:gap-x-4 gap-y-6 mt-3 text-[#1a7ef7]">
      <FaTimes
        title="Cancel"
        className="cursor-pointer text-3xl"
        onClick={() => onCancel(reservation)}
      />
      <FaEdit
        title="Edit Price"
        className="cursor-pointer text-3xl"
        onClick={() => onEditPrice(reservation)}
      />
      <FaFileInvoiceDollar title="Invoice" className="cursor-pointer text-3xl" />
      <FaTicketAlt title="Voucher" className="cursor-pointer text-3xl" />
      <FaCreditCard title="Payment" className="cursor-pointer text-3xl" />
      <FaLink title="Pay Link" className="cursor-pointer text-3xl" />
      <FaPercentage title="Markup" className="cursor-pointer text-3xl" />
      <FaEye
        title="View"
        className="cursor-pointer text-3xl"
        onClick={onViewDetails}
      />
      <FaHashtag title="Confirmation #" className="cursor-pointer text-3xl" />
      <FaReceipt title="View Payment" className="cursor-pointer text-3xl" />
      <FaCheckCircle title="Status" className="cursor-pointer text-3xl" />
      {/* Empty slots auto-fill */}
    </div>
  </aside>
);

export default BookingActions;