'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { PlanAPI } from './PlanListAdvanced'; // Assumes types are exported from the main file

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (markupIds: string[]) => void;
  plan: PlanAPI | null;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  plan,
  isDeleting,
}) => {
  const [selectedMarkupIds, setSelectedMarkupIds] = useState<string[]>([]);

  // Reset selection when modal opens/closes or plan changes
  useEffect(() => {
    if (isOpen) {
      setSelectedMarkupIds([]);
    }
  }, [isOpen]);

  const handleToggleMarkup = (markupId: string) => {
    setSelectedMarkupIds(prev =>
      prev.includes(markupId)
        ? prev.filter(id => id !== markupId)
        : [...prev, markupId]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allMarkupIds = plan?.markups.map(m => m._id) || [];
      setSelectedMarkupIds(allMarkupIds);
    } else {
      setSelectedMarkupIds([]);
    }
  };

  if (!isOpen || !plan) return null;

  const allMarkupsSelected = plan.markups.length > 0 && selectedMarkupIds.length === plan.markups.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Delete Markups
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
          Select markups to delete from the plan "<strong>{plan.name}</strong>". This action cannot be undone.
        </p>

        <div className="border rounded-md border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
          {plan.markups && plan.markups.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500"
                      checked={allMarkupsSelected}
                      onChange={handleSelectAll}
                      disabled={isDeleting}
                    />
                  </th>
                  <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Provider</th>
                  <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Markup</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {plan.markups.map((markup) => (
                  <tr key={markup._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500"
                        checked={selectedMarkupIds.includes(markup._id)}
                        onChange={() => handleToggleMarkup(markup._id)}
                        disabled={isDeleting}
                      />
                    </td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{markup.provider?.name || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                      {markup.type === 'percentage' ? `${markup.value}%` : markup.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-4 text-center text-gray-500 dark:text-gray-400">No markups available to delete.</p>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedMarkupIds)}
            disabled={isDeleting || selectedMarkupIds.length === 0}
            className="flex items-center justify-center px-4 py-2 w-36 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : `Delete (${selectedMarkupIds.length}) Selected`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;