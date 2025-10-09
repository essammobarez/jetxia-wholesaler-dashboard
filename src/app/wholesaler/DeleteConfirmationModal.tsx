// components/DeleteConfirmationModal.tsx
'use client';
import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agencyName: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  agencyName,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full transform transition-transform scale-100">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Deletion
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Are you sure you want to permanently delete the agency{' '}
              <strong className="font-medium text-gray-800">
                &quot;{agencyName}&quot;
              </strong>
              ? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}