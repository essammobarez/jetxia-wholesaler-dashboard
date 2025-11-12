import React from "react";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaFlag,
  FaBirthdayCake,
  FaAddressCard,
  FaCalendarAlt,
  FaPlaneDeparture,
  FaClock,
  FaFilePdf,
  FaImage,
  FaFile,
  FaGlobe,
  FaMoneyBillWave,
  FaInfoCircle,
  FaDollarSign,
  FaConciergeBell,
} from "react-icons/fa";
import { Appointment } from "./VisaBookings"; // Import the exported interface

interface ModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

// Helper component for displaying info items in the modal
const ModalInfoItem = ({
  icon,
  label,
  value,
  isBadge = false,
  isLink = false,
  isLong = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isBadge?: boolean;
  isLink?: boolean;
  isLong?: boolean;
}) => {
  const renderValue = () => {
    if (isBadge) {
      const isPending =
        String(value).toLowerCase() === "pending" ||
        String(value).toLowerCase() === "unpaid";
      return (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
            isPending
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }`}
        >
          {value}
        </span>
      );
    }
    if (isLink) {
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
        >
          View Document
        </a>
      );
    }
    return (
      <span
        className={`font-medium text-gray-700 dark:text-gray-300 ${
          isLong ? "break-all" : "truncate"
        }`}
      >
        {value}
      </span>
    );
  };

  return (
    <div className="flex justify-between items-start py-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
        {icon} {label}
      </span>
      <div className="text-right max-w-[60%]">{renderValue()}</div>
    </div>
  );
};

const BookingDetailsModal: React.FC<ModalProps> = ({
  appointment,
  onClose,
}) => {
  if (!appointment) {
    return null;
  }

  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    // Backdrop
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn"
    >
      {/* Modal Panel */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FaGlobe className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Appointment Details: {appointment.visa.country}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* --- Section 1: Main Status --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalInfoItem
              icon={<FaInfoCircle className="w-4 h-4" />}
              label="Application Status"
              value={appointment.status}
              isBadge
            />
            <ModalInfoItem
              icon={<FaDollarSign className="w-4 h-4" />}
              label="Payment Status"
              value={appointment.paymentStatus}
              isBadge
            />
          </div>

          <hr className="dark:border-gray-700" />

          {/* --- Section 2: Applicant & Passport --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {/* Column 1: Applicant */}
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Applicant Details
              </h4>
              <ModalInfoItem
                icon={<FaUser className="w-4 h-4" />}
                label="First Name"
                value={appointment.personalInfo.firstName}
              />
              <ModalInfoItem
                icon={<FaUser className="w-4 h-4" />}
                label="Last Name"
                value={appointment.personalInfo.lastName}
              />
              <ModalInfoItem
                icon={<FaEnvelope className="w-4 h-4" />}
                label="Email"
                value={appointment.personalInfo.email}
              />
              <ModalInfoItem
                icon={<FaPhone className="w-4 h-4" />}
                label="Phone"
                value={appointment.personalInfo.phone}
              />
              <ModalInfoItem
                icon={<FaFlag className="w-4 h-4" />}
                label="Nationality"
                value={appointment.personalInfo.nationality}
              />
              <ModalInfoItem
                icon={<FaBirthdayCake className="w-4 h-4" />}
                label="Date of Birth"
                value={formatDate(appointment.personalInfo.dateOfBirth)}
              />
            </div>

            {/* Column 2: Passport */}
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Passport & Travel
              </h4>
              <ModalInfoItem
                icon={<FaAddressCard className="w-4 h-4" />}
                label="Passport Number"
                value={appointment.passportInfo.passportNumber}
              />
              <ModalInfoItem
                icon={<FaCalendarAlt className="w-4 h-4" />}
                label="Issue Date"
                value={formatDate(appointment.passportInfo.issueDate)}
              />
              <ModalInfoItem
                icon={<FaCalendarAlt className="w-4 h-4" />}
                label="Expiry Date"
                value={formatDate(appointment.passportInfo.expiryDate)}
              />
              <ModalInfoItem
                icon={<FaPlaneDeparture className="w-4 h-4" />}
                label="Purpose of Visit"
                value={appointment.travelDetails.purposeOfVisit}
              />
              <ModalInfoItem
                icon={<FaClock className="w-4 h-4" />}
                label="Duration of Stay"
                value={appointment.travelDetails.durationOfStay}
              />
              <ModalInfoItem
                icon={<FaClock className="w-4 h-4" />}
                label="Processing Time"
                value={appointment.visa.processingTime}
              />
            </div>
          </div>

          <hr className="dark:border-gray-700" />

          {/* --- Section 3: Documents --- */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Submitted Documents
            </h4>
            <div className="space-y-1">
              <ModalInfoItem
                icon={<FaFilePdf className="w-4 h-4" />}
                label="Passport Copy"
                value={appointment.documents.passportCopy}
                isLink
              />
              <ModalInfoItem
                icon={<FaImage className="w-4 h-4" />}
                label="Passport Photo"
                value={appointment.documents.passportPhoto}
                isLink
              />
              {appointment.documents.additionalDocuments.map((doc, index) => (
                <ModalInfoItem
                  key={index}
                  icon={<FaFile className="w-4 h-4" />}
                  label={`Additional Doc ${index + 1}`}
                  value={doc}
                  isLink
                />
              ))}
            </div>
          </div>
          
          <hr className="dark:border-gray-700" />

          {/* --- Section 4: Timestamps (Application Info Removed) --- */}
          <div className="grid grid-cols-1 gap-y-2"> {/* <-- UPDATED: Removed md:grid-cols-2 */}
            
            {/* Column 1: Application Info (REMOVED) */}

            {/* Column 2: Timestamps */}
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Timestamps
              </h4>
              <ModalInfoItem
                icon={<FaCalendarAlt className="w-4 h-4" />}
                label="Created At"
                value={formatDateTime(appointment.createdAt)}
            
              />
              <ModalInfoItem
                icon={<FaCalendarAlt className="w-4 h-4" />}
                label="Last Updated"
                value={formatDateTime(appointment.updatedAt)}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer (Pricing) */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <FaMoneyBillWave className="w-5 h-5" />
              Visa Fee:
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                ${appointment.pricing.visaFee.toFixed(2)}
              </span>
            </span>
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <FaConciergeBell className="w-5 h-5" />
              Service Fee:
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                ${appointment.pricing.serviceFee.toFixed(2)}
              </span>
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            <span className="flex items-center gap-2">
              Total: ${appointment.pricing.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;