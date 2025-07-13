// components/BookingActions.tsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaCreditCard,
  FaEdit,
  FaEye,
  FaFileInvoiceDollar,
  FaHashtag,
  FaLink,
  FaPercentage,
  FaReceipt,
  FaTicketAlt,
  FaTimes,
} from "react-icons/fa";
import { Reservation } from "./BookingModal";
import { generateInvoiceNumber, generateInvoicePDF } from "./InvoiceGenerator";
import { generateVoucherPDF } from "./voucher";

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
}) => {
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const handleGenerateInvoice = async () => {
    setIsGeneratingInvoice(true);
    try {
      const invoiceNumber = generateInvoiceNumber();
      const invoiceDate = new Date().toLocaleDateString();
      const dueDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(); // 30 days from now

      await generateInvoicePDF({
        invoiceNumber,
        invoiceDate,
        dueDate,
        reservation,
      });

      toast.success("Invoice generated successfully!");
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice. Please try again.");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  return (
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
        <FaFileInvoiceDollar
          title="Invoice"
          className={`cursor-pointer text-3xl ${
            isGeneratingInvoice ? "opacity-50" : ""
          }`}
          onClick={isGeneratingInvoice ? undefined : handleGenerateInvoice}
        />
        <FaTicketAlt
          title="Voucher"
          className="cursor-pointer text-3xl"
          onClick={async () => {
            try {
              await generateVoucherPDF(reservation);
              toast.success("Voucher generated!");
            } catch (e) {
              toast.error("Failed to generate voucher");
            }
          }}
        />
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

      {/* Loading indicator for invoice generation */}
      {isGeneratingInvoice && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Generating invoice...</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default BookingActions;
