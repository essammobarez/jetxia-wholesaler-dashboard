// DeleteConfirmationModal.tsx

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  packageName: string;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  packageName,
  isDeleting,
}) => {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    // Reset confirmation text when the modal is closed
    if (!isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canConfirm = confirmText.toLowerCase() === 'yes';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-60 ">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white" id="modal-title">
                  Delete Package
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            <p>
              Are you sure you want to delete the package{' '}
              <strong className="font-semibold text-red-600 dark:text-red-400">"{packageName}"</strong>?
            </p>
            <p className="mt-2">
              This action cannot be undone. All data associated with this package will be permanently removed.
            </p>
          </div>

          <div className="mt-5">
            <label htmlFor="confirm-delete-input" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              To confirm, please type "<span className="font-bold text-gray-800 dark:text-gray-100">yes</span>" into the box below.
            </label>
            <input
              type="text"
              id="confirm-delete-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="yes"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              disabled={isDeleting}
            />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 rounded-b-2xl flex flex-col sm:flex-row-reverse sm:space-x-2 sm:space-x-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm || isDeleting}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Deleting...
              </>
            ) : (
              'Yes, Delete Package'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;