'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type DeleteConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agentName: string;
  isProcessing: boolean;
};

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  agentName,
  isProcessing,
}: DeleteConfirmationModalProps) => {
  const [confirmationInput, setConfirmationInput] = useState('');

  // Reset the input field whenever the modal is closed or opened
  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const isConfirmationTextMatched = confirmationInput === 'DELETE';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
        <header className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-red-600">Confirm Deletion</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </header>
        <main className="p-6">
          <p className="text-sm text-gray-600">
            This is a permanent action. You are about to delete the agent{' '}
            <strong className="text-gray-900">{agentName}</strong>.
          </p>
          <p className="mt-4 text-sm text-gray-800">
            To confirm, please type <strong className="text-red-700">DELETE</strong> in the box below.
          </p>
          <input
            type="text"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="DELETE"
            autoComplete="off"
          />
        </main>
        <footer className="flex justify-end space-x-3 p-4 bg-gray-50 border-t">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmationTextMatched || isProcessing}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Deleting...' : 'Delete Agent Permanently'}
          </button>
        </footer>
      </div>
    </div>
  );
};