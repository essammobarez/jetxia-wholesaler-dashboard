"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaPaperPlane, FaTimes } from "react-icons/fa";

interface AddConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // MODIFIED: Reverted to a simple callback
  bookingId: string; // The main booking _id
  reservationId: number; // The room's specific reservationId
}

const AddConfirmationModal: React.FC<AddConfirmationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  reservationId,
}) => {
  const [confirmationNo, setConfirmationNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationNo.trim()) {
      toast.error("Confirmation number cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting confirmation number...");

    const token =
      document.cookie
        .split("; ")
        .find((r) => r.startsWith("authToken="))
        ?.split("=")[1] || localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authorization failed. Please log in again.", { id: toastId });
      setIsSubmitting(false);
      return;
    }

    const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/${bookingId}/rooms/${reservationId}/confirmation`;
    const finalConfirmationNo = confirmationNo.trim();

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirmationNo: finalConfirmationNo }),
      });

      if (response.ok) {
        // This toast fulfills the requirement to show success message
        toast.success("Confirmation added successfully!", { id: toastId });
        onSuccess(); // MODIFIED: Call success handler without arguments
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.message || "Failed to add confirmation number.",
          { id: toastId }
        );
      }
    } catch (error) {
      console.error("Error submitting confirmation:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Add Confirmation Number
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label
              htmlFor="confirmationNo"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Confirmation Number
            </label>
            <input
              id="confirmationNo"
              type="text"
              value={confirmationNo}
              onChange={(e) => setConfirmationNo(e.target.value)}
              placeholder="e.g., CONF123456789"
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>
          <div className="flex justify-end items-center p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 mr-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <FaPaperPlane className="mr-2" />
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddConfirmationModal;