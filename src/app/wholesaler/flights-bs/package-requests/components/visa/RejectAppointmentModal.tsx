"use client";

import React, { useState } from "react";
import { Appointment } from "./VisaBookings"; // Assuming VisaBookings.tsx exports this
import { FaSpinner, FaTimes } from "react-icons/fa";

// Helper function to get token (as provided)
const getAuthToken = () => {
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("authToken="))
      ?.split("=")[1] || localStorage.getItem("authToken")
  );
};

interface Props {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

const RejectAppointmentModal: React.FC<Props> = ({
  isOpen,
  appointment,
  onClose,
  onUpdateSuccess,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    if (!rejectionReason) {
      setError("Rejection reason is required.");
      return;
    }

    setLoading(true);
    setError(null);

    const token = getAuthToken();
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token || !API_URL) {
      setError("Configuration error. Please contact support.");
      setLoading(false);
      return;
    }

    const payload = {
      status: "rejected",
      rejectionReason: rejectionReason,
      adminNotes: adminNotes || "Rejected due to specified reason.", // Default
    };

    try {
      const response = await fetch(
        `${API_URL}/visa-appointment/${appointment._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to reject appointment.");
      }

      // Success
      setRejectionReason("");
      setAdminNotes("");
      onUpdateSuccess(); // Refresh data in parent and close modal
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Reject Appointment
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You are about to reject the visa appointment for{" "}
              <strong>
                {appointment.personalInfo.firstName}{" "}
                {appointment.personalInfo.lastName}
              </strong>{" "}
              (ID: {appointment._id}).
            </p>
            <div>
              <label
                htmlFor="rejectionReason"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Rejection Reason (Required)
              </label>
              <textarea
                id="rejectionReason"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Invalid passport photo - does not meet requirements"
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label
                htmlFor="adminNotes"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Admin Notes (Optional)
              </label>
              <textarea
                id="adminNotes"
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g., Rejected due to photo quality issues"
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
          <div className="flex justify-end items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300 flex items-center gap-2"
            >
              {loading && <FaSpinner className="animate-spin" />}
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectAppointmentModal;