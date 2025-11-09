// src/components/PackageHighlights.tsx

import React from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';

interface PackageHighlightsProps {
  formData: any;
  handleHighlightChange: (index: number, value: string) => void;
  handleRemoveHighlight: (index: number) => void;
  handleAddHighlight: () => void;
}

const PackageHighlights: React.FC<PackageHighlightsProps> = ({
  formData,
  handleHighlightChange,
  handleRemoveHighlight,
  handleAddHighlight,
}) => {
  return (
    <div className="card-modern p-6 border-2 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-2">
            <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <span>Package Highlights</span>
        </h3>
      </div>
      <div className="space-y-2">
        {formData.highlights.map((highlight: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={highlight}
              onChange={(e) => handleHighlightChange(index, e.target.value)}
              // --- UPDATE ---
              // Replaced 'input-modern' with a more detailed Tailwind CSS implementation
              // for a better input field design, including dark mode and focus states.
              className="flex-1 py-2 px-3 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent sm:text-sm transition-colors"
              // --- END UPDATE ---
              placeholder="e.g., Visit the Pyramids of Giza"
            />
            <button
              onClick={() => handleRemoveHighlight(index)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={handleAddHighlight}
          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Add Highlight
        </button>
      </div>
    </div>
  );
};

export default PackageHighlights;