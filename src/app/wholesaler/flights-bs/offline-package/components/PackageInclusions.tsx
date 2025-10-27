// src/components/PackageInclusions.tsx

import React from 'react';
import { CheckCircle, ChevronDown, ChevronUp, Utensils, Camera, Star } from 'lucide-react';

interface PackageInclusionsProps {
  formData: any;
  toggleSection: (section: 'inclusions') => void;
  expandedSections: { inclusions: boolean };
  handleToggleInclusion: (type: 'meals' | 'activities' | 'extras', item: string) => void;
  availableMeals: string[];
  availableActivities: string[];
  availableExtras: string[];
}

const PackageInclusions: React.FC<PackageInclusionsProps> = ({
  formData,
  toggleSection,
  expandedSections,
  handleToggleInclusion,
  availableMeals,
  availableActivities,
  availableExtras,
}) => {
  return (
    <div className="card-modern p-6">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => toggleSection('inclusions')}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          Package Inclusions
        </h3>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          {expandedSections.inclusions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      {expandedSections.inclusions && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Utensils className="w-4 h-4 inline mr-1" />
              Meals Included:
            </label>
            <div className="flex flex-wrap gap-2">
              {availableMeals.map((meal) => (
                <button
                  key={meal}
                  onClick={() => handleToggleInclusion('meals', meal)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.selectedInclusions.meals.includes(meal)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Camera className="w-4 h-4 inline mr-1" />
              Activities Included:
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {availableActivities.map((activity) => (
                <button
                  key={activity}
                  onClick={() => handleToggleInclusion('activities', activity)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.selectedInclusions.activities.includes(activity)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                  }`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Star className="w-4 h-4 inline mr-1" />
              Extra Services:
            </label>
            <div className="flex flex-wrap gap-2">
              {availableExtras.map((extra) => (
                <button
                  key={extra}
                  onClick={() => handleToggleInclusion('extras', extra)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.selectedInclusions.extras.includes(extra)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                  }`}
                >
                  {extra}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Total Selected:</strong>{' '}
              {formData.selectedInclusions.meals.length +
                formData.selectedInclusions.activities.length +
                formData.selectedInclusions.extras.length} items
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageInclusions;