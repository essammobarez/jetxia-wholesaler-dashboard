"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { StatusType } from './types';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (action: 'close' | 'reopen') => void;
  currentStatus: Exclude<StatusType, "all">;
  ticketSubject: string;
  isLoading?: boolean;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentStatus,
  ticketSubject,
  isLoading = false,
}) => {
  const [selectedAction, setSelectedAction] = useState<'close' | 'reopen' | null>(null);

  // Reset selected action when modal opens or current status changes
  useEffect(() => {
    if (isOpen) {
      setSelectedAction(null);
    }
  }, [isOpen, currentStatus]);

  const getAvailableActions = () => {
    switch (currentStatus) {
      case 'open':
        return [
          { action: 'close', label: 'Close Ticket', description: 'Mark ticket as resolved and closed' }
        ];
      case 'in_progress':
        return [
          { action: 'close', label: 'Close Ticket', description: 'Mark ticket as resolved and closed' }
        ];
      case 'closed':
        return [
          { action: 'reopen', label: 'Reopen Ticket', description: 'Reopen the closed ticket' }
        ];
      default:
        return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAction) {
      onSubmit(selectedAction);
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    onClose();
  };

  const availableActions = getAvailableActions();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Change Ticket Status</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Ticket:</p>
            <p className="text-sm font-medium text-gray-900 line-clamp-2">{ticketSubject}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Current Status:</p>
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
              currentStatus === 'open' ? 'text-green-700 bg-green-50 border-green-200' :
              currentStatus === 'in_progress' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
              'text-gray-700 bg-gray-50 border-gray-200'
            }`}>
              {currentStatus === 'open' ? 'Open' : 
               currentStatus === 'in_progress' ? 'In Progress' : 'Closed'}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Actions:
              </label>
              <div className="space-y-2">
                {availableActions.map((action) => (
                  <label
                    key={action.action}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAction === action.action
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="action"
                      value={action.action}
                      checked={selectedAction === action.action}
                      onChange={(e) => setSelectedAction(e.target.value as 'close' | 'reopen')}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      selectedAction === action.action
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAction === action.action && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{action.label}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedAction || isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;
