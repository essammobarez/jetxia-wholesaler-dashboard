"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FaBuilding, FaTimesCircle, FaTicketAlt } from "react-icons/fa";
import { RiPlaneLine } from "react-icons/ri";
import { BiTransferAlt } from "react-icons/bi";
import { FiLayout } from "react-icons/fi";

// Define the shape of the component props
interface AddServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Service Options Array with routes and styles
const ADD_SERVICE_OPTIONS = [
  { label: "Hotels & Apartments", Icon: FaBuilding, route: "/hotel/search", color: "text-red-500", bg: "bg-red-500/10" },
  { label: "Flight", Icon: RiPlaneLine, route: "/flight/search", color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Accommodation", Icon: FaBuilding, route: "/hotel/search", color: "text-red-500", bg: "bg-red-500/10" }, // Duplicated to match user's explicit list
  { label: "Events", Icon: FaTicketAlt, route: "/events/search", color: "text-purple-500", bg: "bg-purple-500/10" },
  { label: "Transfer", Icon: BiTransferAlt, route: "/transfer/search", color: "text-green-500", bg: "bg-green-500/10" },
  { label: "Activity", Icon: FiLayout, route: "/activity/search", color: "text-yellow-500", bg: "bg-yellow-500/10" },
];

const AddServiceSelectionModal: React.FC<AddServiceSelectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleServiceSelect = (route: string) => {
    onClose(); // Close modal
    // Connect modal with the given code (using useRouter from next/navigation)
    router.push(route);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300"
      onClick={onClose} // Close modal when clicking outside
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 w-11/12 max-w-2xl transform transition-transform duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Select Service Type
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1"
            aria-label="Close modal"
          >
            <FaTimesCircle size={24} />
          </button>
        </div>

        {/* Service Selection Grid with Interactive Animations */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {ADD_SERVICE_OPTIONS.map((service, index) => (
            <div
              key={index}
              onClick={() => handleServiceSelect(service.route)}
              // Interactive animation styles: hover effect, shadow, translate, and active shrink
              className="group flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
            >
              {/* Interactive Icon/Animation */}
              <div className={`p-4 rounded-full transition-all duration-300 ${service.bg} group-hover:ring-4 ring-blue-500/30 group-hover:shadow-md`}>
                <service.Icon 
                  size={32} 
                  className={`${service.color} group-hover:scale-110 group-hover:rotate-1 transition-transform duration-300`} 
                />
              </div>
              <p className="mt-3 text-sm sm:text-base font-semibold text-center text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {service.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddServiceSelectionModal;