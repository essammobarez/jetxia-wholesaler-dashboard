import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (data: { pnr: string }) => void;
  onCancel: () => void;
  isProcessing: boolean;
  actionType?: 'confirmed' | 'cancelled';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isProcessing,
  actionType,
}) => {
  const [pnr, setPnr] = useState('');

  // Reset PNR when modal opens
  useEffect(() => {
    if (isOpen) {
      setPnr('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    // Pass PNR only if confirmed, otherwise pass empty string
    onConfirm({ pnr: actionType === 'confirmed' ? pnr : '' });
  };

  const confirmButtonColor =
    actionType === 'confirmed'
      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500';

  const confirmButtonIcon =
    actionType === 'confirmed' ? (
      <CheckCircle className="w-4 h-4 mr-2" />
    ) : (
      <XCircle className="w-4 h-4 mr-2" />
    );

  const confirmButtonText =
    actionType === 'confirmed'
      ? 'Confirm'
      : 'Reject/Cancel';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 transform transition-all scale-100 opacity-100">
        <div className="p-6">
          <h3
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
            id="modal-title"
          >
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          {/* Added PNR Input Field - Only shows if action is 'confirmed' */}
          {actionType === 'confirmed' && (
            <div className="mb-4">
              <label htmlFor="pnr-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PNR Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                id="pnr-input"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                placeholder="Enter PNR Number"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                disabled={isProcessing}
              />
            </div>
          )}

        </div>
        <div className="flex justify-end space-x-4 bg-gray-100 dark:bg-gray-900/50 px-6 py-4 rounded-b-2xl">
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-colors disabled:opacity-50"
            onClick={onCancel}
            disabled={isProcessing}
          >
            No, go back
          </button>
          <button
            type="button"
            className={`inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 ${confirmButtonColor}`}
            onClick={handleConfirmClick}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              confirmButtonIcon
            )}
            {isProcessing ? 'Processing...' : `Yes, ${confirmButtonText}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;