"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface MessageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (messageId: string, newContent: string) => void;
  messageId: string;
  currentContent: string;
  isLoading?: boolean;
}

const MessageEditModal: React.FC<MessageEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  messageId,
  currentContent,
  isLoading = false,
}) => {
  const [editedContent, setEditedContent] = useState(currentContent);

  useEffect(() => {
    if (isOpen) {
      setEditedContent(currentContent);
    }
  }, [isOpen, currentContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedContent.trim() && editedContent !== currentContent) {
      onSubmit(messageId, editedContent.trim());
    }
  };

  const handleClose = () => {
    setEditedContent(currentContent); // Reset to current content
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Message</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Message Content:
            </label>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Enter your message..."
              disabled={isLoading}
            />
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
              disabled={!editedContent.trim() || editedContent === currentContent || isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageEditModal;
