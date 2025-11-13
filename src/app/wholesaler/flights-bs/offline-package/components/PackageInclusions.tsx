// src/components/PackageInclusions.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle, ChevronDown, ChevronUp, Utensils, Camera, Star,
  Plus, Trash2, Save, Edit, DollarSign, FileText, Package,
  Calendar, Bed, X
} from 'lucide-react';

interface PackageInclusionsProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  toggleSection: (section: string) => void;
  expandedSections: any;
}

const PackageInclusions: React.FC<PackageInclusionsProps> = ({
  formData,
  setFormData,
  toggleSection,
  expandedSections,
}) => {

  // =========================================
  // SECTION 1: PACKAGE INCLUSIONS LOGIC
  // =========================================

  const [isEditingExclusions, setIsEditingExclusions] = useState(true);
  const [isEditingExtras, setIsEditingExtras] = useState(true);
  const [localExclusions, setLocalExclusions] = useState<any[]>([]);
  const [localExtras, setLocalExtras] = useState<any[]>([]);

  useEffect(() => {
    const exclusions = Array.isArray(formData?.selectedInclusions?.activities)
      ? formData.selectedInclusions.activities
      : [];
    setLocalExclusions(exclusions);
    setIsEditingExclusions(exclusions.length === 0);
  }, [formData.selectedInclusions.activities]);

  useEffect(() => {
    const extras = Array.isArray(formData?.selectedInclusions?.extras)
      ? formData.selectedInclusions.extras
      : [];
    setLocalExtras(extras);
    setIsEditingExtras(extras.length === 0);
  }, [formData.selectedInclusions.extras]);

  // --- Summary Calculation ---
  const summaryData = useMemo(() => {
    const calculatePrice = (items: any[]) => {
      return items.reduce((acc, item) => {
        const price = parseFloat(item.price);
        return acc + (isNaN(price) ? 0 : price);
      }, 0);
    };

    const validExclusions = localExclusions.filter(item => item.name && item.name.trim() !== '' && item.price && item.price.trim() !== '');
    const validExtras = localExtras.filter(item => item.name && item.name.trim() !== '' && item.price && item.price.trim() !== '');

    return {
      totalItems: (formData.selectedInclusions.meals?.length || 0) + validExclusions.length + validExtras.length,
      totalPrice: calculatePrice(validExclusions) + calculatePrice(validExtras)
    };
  }, [localExclusions, localExtras, formData.selectedInclusions.meals]);

  // --- Validation for Save Buttons ---
  const isExclusionsSaveDisabled = useMemo(() => {
    const isPartiallyFilled = localExclusions.some(item =>
      (item.name.trim() && !item.price.trim()) ||
      (!item.name.trim() && item.price.trim())
    );
    if (isPartiallyFilled) return true;
    const allItemsEmpty = localExclusions.every(item =>
      !item.name.trim() && !item.price.trim()
    );
    if (allItemsEmpty) return true;
    return false;
  }, [localExclusions]);

  const isExtrasSaveDisabled = useMemo(() => {
    const isPartiallyFilled = localExtras.some(item =>
      (item.name.trim() && !item.price.trim()) ||
      (!item.name.trim() && item.price.trim())
    );
    if (isPartiallyFilled) return true;
    const allItemsEmpty = localExtras.every(item =>
      !item.name.trim() && !item.price.trim()
    );
    if (allItemsEmpty) return true;
    return false;
  }, [localExtras]);

  const mealOptions = ["Room Only", "Breakfast", "Half Board", "Full Board", "All Inclusive"];

  // --- INCLUSIONS HANDLERS ---
  const handleMealClick = (mealToSelect: string) => {
    setFormData((prev: any) => {
      const currentMeals = prev.selectedInclusions.meals || [];
      const currentSelectedMeal = currentMeals[0];
      let newMealsArray: string[];

      if (currentSelectedMeal === mealToSelect) {
        newMealsArray = [];
      } else {
        newMealsArray = [mealToSelect];
      }

      return {
        ...prev,
        selectedInclusions: {
          ...prev.selectedInclusions,
          meals: newMealsArray,
        },
      };
    });
  };

  const handleLocalExclusionChange = (index: number, field: 'name' | 'price', value: string) => {
    const newExclusions = localExclusions.map((item: any, i: number) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setLocalExclusions(newExclusions);
  };

  const handleAddLocalExclusion = () => {
    setLocalExclusions([...localExclusions, { name: '', price: '' }]);
  };

  const handleRemoveLocalExclusion = (index: number) => {
    setLocalExclusions(localExclusions.filter((_: any, i: number) => i !== index));
  };

  const handleSaveExclusions = () => {
    const filteredExclusions = localExclusions.filter(item => item.name.trim() !== '' && item.price.trim() !== '');
    setLocalExclusions(filteredExclusions);
    setFormData((prev: any) => ({
      ...prev,
      selectedInclusions: {
        ...prev?.selectedInclusions,
        activities: filteredExclusions,
      },
    }));
    setIsEditingExclusions(false);
  };

  const handleLocalExtraChange = (index: number, field: 'name' | 'price', value: string) => {
    const newExtras = localExtras.map((item: any, i: number) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setLocalExtras(newExtras);
  };

  const handleAddLocalExtra = () => {
    setLocalExtras([...localExtras, { name: '', price: '' }]);
  };

  const handleRemoveLocalExtra = (index: number) => {
    setLocalExtras(localExtras.filter((_: any, i: number) => i !== index));
  };

  const handleSaveExtras = () => {
    const filteredExtras = localExtras.filter(item => item.name.trim() !== '' && item.price.trim() !== '');
    setLocalExtras(filteredExtras);
    setFormData((prev: any) => ({
      ...prev,
      selectedInclusions: {
        ...prev?.selectedInclusions,
        extras: filteredExtras,
      },
    }));
    setIsEditingExtras(false);
  };

  // =========================================
  // SECTION 2: ITINERARY LOGIC
  // =========================================

  const [showDayForm, setShowDayForm] = useState(false);
  // --- UPDATED: 'accommodation' removed, 'extraServices' added ---
  const [currentDay, setCurrentDay] = useState<{
    title: string;
    description: string;
    activities: string[];
    extraServices: string[];
  }>({
    title: '',
    description: '',
    activities: [],
    extraServices: []
  });

  // Derived data for Itinerary options based on Inclusions selections
  // --- REMOVED: itineraryAvailableMeals useMemo ---

  const itineraryExcludedActivities = useMemo(() => {
    return (formData.selectedInclusions?.activities || [])
      .map((item: any) => item.name)
      .filter((name: string) => name && name.trim() !== '');
  }, [formData.selectedInclusions?.activities]);

  const itineraryExtraServices = useMemo(() => {
    return (formData.selectedInclusions?.extras || [])
      .map((item: any) => item.name)
      .filter((name: string) => name && name.trim() !== '');
  }, [formData.selectedInclusions?.extras]);

  // --- ITINERARY HANDLERS ---
  const handleAddDay = () => {
    setFormData((prev: any) => ({
      ...prev,
      itinerary: [
        ...(prev.itinerary || []),
        { ...currentDay, day: (prev.itinerary?.length || 0) + 1 }
      ]
    }));
    // Reset form
    // --- UPDATED: 'accommodation' removed, 'extraServices' added ---
    setCurrentDay({ title: '', description: '', activities: [], extraServices: [] });
    setShowDayForm(false);
  };

  const handleRemoveDay = (dayNumber: number) => {
    setFormData((prev: any) => ({
      ...prev,
      itinerary: prev.itinerary
        .filter((day: any) => day.day !== dayNumber)
        // Re-index days after removal
        .map((day: any, index: number) => ({ ...day, day: index + 1 }))
    }));
  };

  // --- REMOVED: handleDayToggleMeal function ---

  const handleDayToggleActivity = (activity: string) => {
    setCurrentDay(prev => {
      const activities = prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity];
      return { ...prev, activities };
    });
  };

  // --- ADDED: Handler for Extra Services ---
  const handleDayToggleExtraService = (service: string) => {
    setCurrentDay(prev => {
      const extraServices = prev.extraServices.includes(service)
        ? prev.extraServices.filter(s => s !== service)
        : [...prev.extraServices, service];
      return { ...prev, extraServices };
    });
  };

  return (
    // SINGLE CARD WRAPPER FOR BOTH SECTIONS
    <div className="card-modern p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all">

      {/* =========================================
          SECTION 1: PACKAGE INCLUSIONS
      ========================================= */}
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => toggleSection('inclusions')}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Package Inclusions
          </h3>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          {expandedSections.inclusions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Collapsible Content */}
      {expandedSections.inclusions && (
        <div className="mt-6 space-y-8">

          {/* --- MEALS SECTION --- */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <label className="flex items-center space-x-2 text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
              <Utensils className="w-5 h-5 text-gray-500" />
              <span>Meals Included</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {mealOptions.map((meal) => (
                <button
                  key={meal}
                  onClick={() => handleMealClick(meal)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    (formData.selectedInclusions.meals || []).includes(meal)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                    }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          {/* --- ACTIVITIES EXCLUDED SECTION --- */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center space-x-2 text-base font-semibold text-gray-800 dark:text-gray-200">
                <Camera className="w-5 h-5 text-gray-500" />
                <span>Activities Excluded</span>
              </label>
              {isEditingExclusions ? (
                <button
                  type="button"
                  onClick={handleSaveExclusions}
                  disabled={isExclusionsSaveDisabled}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Exclusions
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingExclusions(true)}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
            </div>

            {isEditingExclusions ? (
              // --- EDITING VIEW (Exclusions) ---
              <div className="space-y-3">
                {localExclusions.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="relative flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Exclusion Name"
                        value={activity.name || ''}
                        onChange={(e) => handleLocalExclusionChange(index, 'name', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="relative w-24">
                      <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        placeholder="Price"
                        value={activity.price || ''}
                        onChange={(e) => handleLocalExclusionChange(index, 'price', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocalExclusion(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-all"
                      aria-label="Remove exclusion"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddLocalExclusion}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exclusion
                </button>
              </div>
            ) : (
              // --- "BLOCK" DISPLAY VIEW (Exclusions) ---
              <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg min-h-[50px]">
                {localExclusions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {localExclusions.map((item: any, index: number) => (
                      <div key={index} className="flex items-baseline px-3 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg border border-blue-300 dark:border-blue-700 shadow-sm">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name || '(Not specified)'}
                        </span>
                        {item.price && (
                          <span className="ml-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                            {`$${item.price}`}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-2">
                    No exclusions saved.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* --- EXTRA SERVICES SECTION --- */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center space-x-2 text-base font-semibold text-gray-800 dark:text-gray-200">
                <Star className="w-5 h-5 text-gray-500" />
                <span>Extra Services</span>
              </label>
              {isEditingExtras ? (
                <button
                  type="button"
                  onClick={handleSaveExtras}
                  disabled={isExtrasSaveDisabled}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Services
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingExtras(true)}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
            </div>

            {isEditingExtras ? (
              // --- EDITING VIEW (Extras) ---
              <div className="space-y-3">
                {localExtras.map((extra: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="relative flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Service Name"
                        value={extra.name || ''}
                        onChange={(e) => handleLocalExtraChange(index, 'name', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="relative w-24">
                      <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        placeholder="Price"
                        value={extra.price || ''}
                        onChange={(e) => handleLocalExtraChange(index, 'price', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocalExtra(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-all"
                      aria-label="Remove extra service"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddLocalExtra}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Extra Service
                </button>
              </div>
            ) : (
              // --- "BLOCK" DISPLAY VIEW (Extras) ---
              <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg min-h-[50px]">
                {localExtras.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {localExtras.map((item: any, index: number) => (
                      <div key={index} className="flex items-baseline px-3 py-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg border border-purple-300 dark:border-purple-700 shadow-sm">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name || '(Not specified)'}
                        </span>
                        {item.price && (
                          <span className="ml-2 text-sm font-bold text-purple-700 dark:text-purple-300">
                            {`$${item.price}`}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-2">
                    No extra services saved.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* --- SUMMARY SECTION --- */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700 flex items-center space-x-3 shadow-sm">
              <Package className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Total Items</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {summaryData.totalItems}
                </p>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700 flex items-center space-x-3 shadow-sm">
              <DollarSign className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-200">Total Price (Est.)</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {summaryData.totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* =========================================
          DIVIDER BETWEEN SECTIONS
      ========================================= */}
      <hr className="my-8 border-gray-200 dark:border-gray-700" />

      {/* =========================================
          SECTION 2: DAY-BY-DAY ITINERARY
      ========================================= */}
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
              <div className="flex items-start justify-between">

                <div className="flex-1 space-y-2.5">

                  {/* Title */}
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                      Day {day.day}
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{day.title}</h4>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400">{day.description}</p>

                  {/* --- REMOVED: Meals Display Block --- */}

                  {/* Activities */}
                  {day.activities?.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Activities:
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {day.activities.map((activity: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* --- ADDED: Extra Services Display --- */}
                  {day.extraServices?.length > 0 && (
                    <div className="mt-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Extra Services:
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {day.extraServices.map((service: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* --- REMOVED: Accommodation Display --- */}

                </div>

                <button
                  onClick={() => handleRemoveDay(day.day)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg ml-2"
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
                  className="py-2 px-3 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent sm:text-sm transition-colors"
                  placeholder="Day title (e.g., Arrival in Cairo)"
                />
                <textarea
                  value={currentDay.description}
                  onChange={(e) => setCurrentDay(prev => ({ ...prev, description: e.target.value }))}
                  className="py-2 px-3 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent sm:text-sm transition-colors"
                  rows={2}
                  placeholder="Day description..."
                />

                {/* --- REMOVED: MEALS SELECTION Block --- */}

                {/* --- EXCLUDED ACTIVITIES SELECTION --- */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Camera className="w-3 h-3 mr-1 text-gray-500" />
                    Excluded Activities:
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {itineraryExcludedActivities.length > 0 ? (
                      itineraryExcludedActivities.map((activity: string) => (
                        <button
                          key={activity}
                          onClick={() => handleDayToggleActivity(activity)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${currentDay.activities.includes(activity)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                            }`}
                        >
                          {activity}
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No excluded activities added above.</p>
                    )}
                  </div>
                </div>

                {/* --- EXTRA SERVICES SELECTION (UPDATED) --- */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Star className="w-3 h-3 mr-1 text-gray-500" />
                    Extra Services:
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {itineraryExtraServices.length > 0 ? (
                      itineraryExtraServices.map((service: string) => (
                        <button
                          key={service}
                          onClick={() => handleDayToggleExtraService(service)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${currentDay.extraServices.includes(service)
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                            }`}
                        >
                          {service}
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No extra services added above.</p>
                    )}
                  </div>
                </div>

                {/* --- REMOVED: Accommodation Input --- */}

                <button
                  onClick={handleAddDay}
                  className="w-full btn-gradient flex justify-center items-center py-2 px-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all"
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

export default PackageInclusions;