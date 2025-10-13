import React from 'react';
import { Loader2 } from 'lucide-react'; // Using lucide for a spinner icon

interface PlanAPI {
  _id: string;
  name: string;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plan: PlanAPI | null;
  isDeleting: boolean; // New prop to indicate deletion is in progress
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  plan,
  isDeleting, // Destructure the new prop
}) => {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Confirm Deletion
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete the plan "<strong>{plan.name}</strong>"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isDeleting} // Disable cancel button during deletion
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting} // Disable delete button during deletion
            className="flex items-center justify-center px-4 py-2 w-28 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
      {/* Basic CSS for the animation */}
      <style>{`
        @keyframes fade-in-scale {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DeleteConfirmationModal;
