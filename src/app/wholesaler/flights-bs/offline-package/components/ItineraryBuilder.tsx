// src/components/ItineraryBuilder.tsx

import React from 'react';
import { Calendar, ChevronDown, ChevronUp, Trash2, Utensils, Bed, Plus, X, Save } from 'lucide-react';

interface ItineraryBuilderProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  toggleSection: (section: 'itinerary') => void;
  expandedSections: { itinerary: boolean };
  currentDay: any;
  setCurrentDay: React.Dispatch<React.SetStateAction<any>>;
  showDayForm: boolean;
  setShowDayForm: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddDay: () => void;
  handleRemoveDay: (dayNumber: number) => void;
  handleToggleMeal: (meal: string) => void;
  handleToggleActivity: (activity: string) => void;
  availableMeals: string[];
  availableActivities: string[];
}

const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({
  formData,
  toggleSection,
  expandedSections,
  currentDay,
  setCurrentDay,
  showDayForm,
  setShowDayForm,
  handleAddDay,
  handleRemoveDay,
  handleToggleMeal,
  handleToggleActivity,
  availableMeals,
  availableActivities
}) => {
  return (
    <div className="card-modern p-6">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => toggleSection('itinerary')}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-orange-600" />
          Day-by-Day Itinerary ({formData.itinerary.length} days)
        </h3>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          {expandedSections.itinerary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      {expandedSections.itinerary && (
        <div className="space-y-4">
          {formData.itinerary.map((day: any) => (
            <div key={day.day} className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                      Day {day.day}
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{day.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{day.description}</p>
                  {day.meals.length > 0 && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Utensils className="w-3 h-3 text-orange-600" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {day.meals.join(', ')}
                      </span>
                    </div>
                  )}
                  {day.activities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {day.activities.map((activity: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs">
                          {activity}
                        </span>
                      ))}
                    </div>
                  )}
                  {day.accommodation && (
                    <div className="flex items-center space-x-2">
                      <Bed className="w-3 h-3 text-orange-600" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {day.accommodation}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveDay(day.day)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {!showDayForm ? (
            <button
              onClick={() => setShowDayForm(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 transition-colors font-medium"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Day {formData.itinerary.length + 1}
            </button>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-gray-900 dark:text-white">
                  Day {formData.itinerary.length + 1}
                </h5>
                <button
                  onClick={() => setShowDayForm(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={currentDay.title}
                  onChange={(e) => setCurrentDay(prev => ({ ...prev, title: e.target.value }))}
                  className="input-modern"
                  placeholder="Day title (e.g., Arrival in Cairo)"
                />
                <textarea
                  value={currentDay.description}
                  onChange={(e) => setCurrentDay(prev => ({ ...prev, description: e.target.value }))}
                  className="input-modern"
                  rows={2}
                  placeholder="Day description..."
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meals Included:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableMeals.map((meal) => (
                      <button
                        key={meal}
                        onClick={() => handleToggleMeal(meal)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          currentDay.meals.includes(meal as any)
                            ? 'bg-orange-500 text-white'
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
                    Activities:
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {availableActivities.map((activity) => (
                      <button
                        key={activity}
                        onClick={() => handleToggleActivity(activity)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          currentDay.activities.includes(activity)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                        }`}
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={currentDay.accommodation}
                  onChange={(e) => setCurrentDay(prev => ({ ...prev, accommodation: e.target.value }))}
                  className="input-modern"
                  placeholder="Accommodation (optional)"
                />
                <button
                  onClick={handleAddDay}
                  className="w-full btn-gradient"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  Save Day
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItineraryBuilder;