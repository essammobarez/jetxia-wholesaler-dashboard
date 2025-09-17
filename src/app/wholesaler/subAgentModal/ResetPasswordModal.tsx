'use client';
import React from 'react';
import { X, Mail } from 'lucide-react';

type ResetPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agentEmail: string;
  isProcessing: boolean;
};

export const ResetPasswordModal = ({
  isOpen,
  onClose,
  onConfirm,
  agentEmail,
  isProcessing,
}: ResetPasswordModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
        <header className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Reset Password</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </header>
        <main className="p-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Mail className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Are you sure you want to send a password reset link to the following sub-agent?
          </p>
          <p className="mt-2 text-center font-semibold text-gray-900 bg-gray-100 p-2 rounded">
            {agentEmail}
          </p>
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
            disabled={isProcessing}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Sending...' : 'Send Link'}
          </button>
        </footer>
      </div>
    </div>
  );
};