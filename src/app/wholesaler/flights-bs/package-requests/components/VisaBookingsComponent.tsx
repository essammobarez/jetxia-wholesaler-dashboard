"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  FaPassport,
  FaSpinner,
  FaExclamationCircle,
  FaUser,
  FaGlobe,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaEnvelope,
  FaPhone,
  FaFlag,
  FaBirthdayCake,
  FaAddressCard,
  FaClock,
  FaFilePdf,
  FaImage,
  FaFile,
  FaPlaneDeparture,
  FaArrowRight,
  FaCheck,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import BookingDetailsModal from "./visa/BookingDetailsModal";

// --- 1. IMPORT THE NEW MODALS ---
import AcceptAppointmentModal from "./visa/AcceptAppointmentModal";
import RejectAppointmentModal from "./visa/RejectAppointmentModal";
import CompleteAppointmentModal from "./visa/CompleteAppointmentModal";

// --- TypeScript Types based on your API response ---
// (These remain unchanged)
interface VisaInfo {
  _id: string;
  country: string;
  processingTime: string;
  visaFee: number;
  serviceFee: number;
}

interface Wholesaler {
  _id: string;
  email: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  dateOfBirth: string;
}

interface PassportInfo {
  passportNumber: string;
  issueDate: string;
  expiryDate: string;
}

interface TravelDetails {
  purposeOfVisit: string;
  durationOfStay: string;
}

interface Documents {
  passportCopy: string;
  passportPhoto: string;
  additionalDocuments: string[];
}

interface Pricing {
  visaFee: number;
  serviceFee: number;
  totalAmount: number;
}

export interface Appointment {
  // <-- Exported this interface
  _id: string;
  visa: VisaInfo;
  wholesaler: Wholesaler;
  agency: string;
  personalInfo: PersonalInfo;
  passportInfo: PassportInfo;
  travelDetails: TravelDetails;
  documents: Documents;
  pricing: Pricing;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    total: number;
    page: number;
    totalPages: number;
  };
  data: Appointment[];
}

// --- Helper function to get token ---
// (Unchanged)
const getAuthToken = () => {
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("authToken="))
      ?.split("=")[1] || localStorage.getItem("authToken")
  );
};

// --- Main Component ---

const VisaBookings = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 2. UPDATED STATE FOR ALL MODALS ---
  const [appointmentForDetails, setAppointmentForDetails] =
    useState<Appointment | null>(null);
  const [appointmentForAction, setAppointmentForAction] =
    useState<Appointment | null>(null);

  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // --- 3. WRAP FETCH LOGIC IN useCallback ---
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = getAuthToken();
    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!API_URL) {
      setError(
        "API base URL is not configured. Please set NEXT_PUBLIC_BACKEND_URL."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/visa-appointment/wholesaler`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        setAppointments(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch data.");
      }
      // --- START OF FIX ---
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
    // --- END OF FIX ---
  }, []); // <-- Empty dependency array for useCallback

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]); // <-- Call the memoized function on mount

  // --- 4. HANDLERS FOR MODALS ---

  // Details Modal
  const handleOpenDetails = (appointment: Appointment) => {
    setAppointmentForDetails(appointment);
  };
  const handleCloseDetails = () => {
    setAppointmentForDetails(null);
  };

  // Action Modals
  const handleOpenAccept = (appointment: Appointment) => {
    setAppointmentForAction(appointment);
    setIsAcceptModalOpen(true);
  };

  const handleOpenReject = (appointment: Appointment) => {
    setAppointmentForAction(appointment);
    setIsRejectModalOpen(true);
  };

  const handleOpenComplete = (appointment: Appointment) => {
    setAppointmentForAction(appointment);
    setIsCompleteModalOpen(true);
  };

  const handleCloseActions = () => {
    setAppointmentForAction(null);
    setIsAcceptModalOpen(false);
    setIsRejectModalOpen(false);
    setIsCompleteModalOpen(false);
  };

  // Success handler
  const handleUpdateSuccess = () => {
    handleCloseActions();
    fetchAppointments(); // <-- Re-fetch data on success
  };

  // --- Helper component to render info items cleanly ---
  // (This remains unchanged)
  const InfoItem = ({
    icon,
    label,
    value,
    isBadge = false,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    isBadge?: boolean;
  }) => {
    const renderValue = () => {
      if (isBadge) {
        const isPending =
          value.toLowerCase() === "pending" ||
          value.toLowerCase() === "unpaid";
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
              isPending
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            }`}
          >
            {value}
          </span>
        );
      }
      return (
        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
          {value}
        </span>
      );
    };

    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
          {icon} {label}
        </span>
        {renderValue()}
      </div>
    );
  };

  // --- Render Logic ---

  const renderContent = () => {
    // 1. Loading State (Unchanged)
    if (loading) {
      return (
        <div className="flex justify-center items-center py-16">
          <FaSpinner className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="ml-4 text-gray-500 dark:text-gray-400">
            Loading appointments...
          </p>
        </div>
      );
    }

    // 2. Error State (Unchanged)
    if (error) {
      return (
        <div className="text-center py-16">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 max-w-md mx-auto border border-red-200 dark:border-red-700">
            <FaExclamationCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
              Failed to Load Bookings
            </h4>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      );
    }

    // 3. Empty State (Unchanged)
    if (appointments.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-12 border border-white/50 dark:border-gray-700/50 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaPassport className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Visa Bookings Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This is where your visa booking management will appear.
            </p>
          </div>
        </div>
      );
    }

    // 4. Data State
    return (
      <div className="space-y-6">
        {appointments.map((appointment) => (
          <div
            key={appointment._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl flex flex-col"
          >
            {/* --- 5. UPDATED CARD HEADER --- */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap justify-between items-center gap-3">
                {/* Left Side: Country & Status */}
                <div className="flex items-center gap-4">
                  <FaGlobe className="w-7 h-7 text-blue-500" />
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {appointment.visa.country}
                    </h4>
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                        ${
                          appointment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : appointment.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : appointment.status === "completed"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }
                      `}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>

                {/* --- 6. ACTION BUTTONS WITH UPDATED DISABLED STYLE --- */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Accept Button */}
                  <button
                    onClick={() => handleOpenAccept(appointment)}
                    disabled={appointment.status !== "pending"}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaCheck />
                    Accept
                  </button>

                  {/* Reject Button */}
                  <button
                    onClick={() => handleOpenReject(appointment)}
                    disabled={
                      appointment.status === "rejected" ||
                      appointment.status === "completed"
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaTimes />
                    Reject
                  </button>

                  {/* Completed Button */}
                  <button
                    onClick={() => handleOpenComplete(appointment)}
                    disabled={appointment.status !== "approved"}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaCheckCircle />
                    Completed
                  </button>

                  {/* Existing View Details Button */}
                  <button
                    onClick={() => handleOpenDetails(appointment)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium transition-colors"
                  >
                    View Details
                    <FaArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card Body (Unchanged) */}
            <div className="p-5 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* --- Column 1: Personal Info --- */}
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Applicant Details
                  </h5>
                  <InfoItem
                    icon={<FaUser className="w-4 h-4" />}
                    label="Name"
                    value={`${appointment.personalInfo.firstName} ${appointment.personalInfo.lastName}`}
                  />
                  <InfoItem
                    icon={<FaEnvelope className="w-4 h-4" />}
                    label="Email"
                    value={appointment.personalInfo.email}
                  D/>
                  <InfoItem
                    icon={<FaPhone className="w-4 h-4" />}
                    label="Phone"
                    value={appointment.personalInfo.phone}
                  />
                  <InfoItem
                    icon={<FaFlag className="w-4 h-4" />}
                    label="Nationality"
                    value={appointment.personalInfo.nationality}
                  />
                  <InfoItem
                    icon={<FaBirthdayCake className="w-4 h-4" />}
                    label="Date of Birth"
                    value={new Date(
                      appointment.personalInfo.dateOfBirth
                    ).toLocaleDateString()}
                  />
                </div>

                {/* --- Column 2: Passport & Travel --- */}
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Passport & Travel
                  </h5>
                  <InfoItem
                    icon={<FaAddressCard className="w-4 h-4" />}
                    label="Passport #"
                    value={appointment.passportInfo.passportNumber}
                  />
                  <InfoItem
                    icon={<FaCalendarAlt className="w-4 h-4" />}
                    label="Issue Date"
                    value={new Date(
                      appointment.passportInfo.issueDate
                    ).toLocaleDateString()}
                  />
                  <InfoItem
                    icon={<FaCalendarAlt className="w-4 h-4" />}
                    label="Expiry Date"
                    value={new Date(
                      appointment.passportInfo.expiryDate
                    ).toLocaleDateString()}
                  />
                  <InfoItem
                    icon={<FaPlaneDeparture className="w-4 h-4" />}
                    label="Purpose"
                    value={appointment.travelDetails.purposeOfVisit}
                  />
                  <InfoItem
                    icon={<FaClock className="w-4 h-4" />}
                    label="Duration"
                    value={appointment.travelDetails.durationOfStay}
                  />
                </div>
              </div>

              {/* --- Documents Section --- (Unchanged) */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Documents
                </h5>
                <div className="flex flex-wrap gap-4 text-sm">
                  <a
                    href={appointment.documents.passportCopy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <FaFilePdf className="w-4 h-4" />
                    Passport Copy
                  </a>
                  <a
                    href={appointment.documents.passportPhoto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <FaImage className="w-4 h-4" />
                    Passport Photo
                  </a>
                  {appointment.documents.additionalDocuments.map(
                    (doc, index) => (
                      <a
                        key={index}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <FaFile className="w-4 h-4" />
                        Additional Doc {index + 1}
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Card Footer (Unchanged) */}
            <div className="bg-blue-100 dark:bg-blue-900/50 px-5 py-3 flex justify-between items-center text-xl">
              <div className="text-gray-600 dark:text-gray-400">
                <span>
                  Visa: ${appointment.pricing.visaFee.toFixed(2)}
                </span>
                <span className="mx-2">|</span>
                <span>
                  Service: ${appointment.pricing.serviceFee.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Total: ${appointment.pricing.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Title */}
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
        Visa Booking History
      </h3>

      {/* Render content based on state */}
      {renderContent()}

      {/* --- RENDER ALL MODALS --- (Unchanged) */}
      {/* Details Modal */}
      <BookingDetailsModal
        appointment={appointmentForDetails}
        onClose={handleCloseDetails}
      />

      {/* Action Modals */}
      <AcceptAppointmentModal
        isOpen={isAcceptModalOpen}
        appointment={appointmentForAction}
        onClose={handleCloseActions}
        onUpdateSuccess={handleUpdateSuccess}
      />
      <RejectAppointmentModal
        isOpen={isRejectModalOpen}
        appointment={appointmentForAction}
        onClose={handleCloseActions}
        onUpdateSuccess={handleUpdateSuccess}
      />
      <CompleteAppointmentModal
        isOpen={isCompleteModalOpen}
        appointment={appointmentForAction}
        onClose={handleCloseActions}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default VisaBookings;