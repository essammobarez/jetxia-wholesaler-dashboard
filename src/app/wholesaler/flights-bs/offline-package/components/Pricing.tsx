// src/components/Pricing.tsx

import React from 'react'; // Removed useState since childAgeRange is gone
import { DollarSign, AlertTriangle } from 'lucide-react';

interface PricingProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: { [key: string]: string };
}

const Pricing: React.FC<PricingProps> = ({ formData, setFormData, errors }) => {
  // Local state to manage the selected age range view - REMOVED
  // const [childAgeRange, setChildAgeRange] = useState<'6-12' | '2-6'>('6-12'); - REMOVED

  // handleAgeRangeChange - REMOVED

  // --- NEW: Handler for the 2-6 "It have price" checkbox ---
  const handleChild2to6CheckboxChange = (isChecked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        child2to6: {
          ...prev.pricing.child2to6,
          isFree: !isChecked, // if checked, isFree is false
          price: !isChecked ? 0 : prev.pricing.child2to6.price, // Reset price to 0 if now free
        }
      }
    }));
  };

  // --- NEW: Handler for the 2-6 price input ---
  const handleChild2to6PriceChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        child2to6: {
          ...prev.pricing.child2to6,
          price: parseFloat(value) || 0,
        }
      }
    }));
  };

  return (
    <div className="card-modern p-6 border-2 border-yellow-200 dark:border-yellow-800 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-2">
            <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <span>Pricing</span>
        </h3>
        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-bold">
          Required
        </span>
      </div>
      <div className="space-y-5">
        {/* Adult Price (12+ years) */}
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Adult Price (12+ years) *
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.pricing.adult}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                pricing: { ...prev.pricing, adult: parseFloat(e.target.value) || 0 }
              }))}
              className={`w-full pl-12 pr-5 py-4 border-2 rounded-xl transition-all duration-200 ${errors.pricing
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-yellow-100 dark:focus:ring-yellow-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold text-lg`}
              placeholder="0.00"
            />
          </div>
          {errors.pricing && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {errors.pricing}
            </p>
          )}
        </div>

        {/* --- MODIFIED SECTION --- */}
        {/* Children (6-12 years) Price */}
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Children Price (6-12 years)
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.pricing.child6to12}
              onChange={(e) => setFormData((prev: any) => ({
                ...prev,
                pricing: { ...prev.pricing, child6to12: parseFloat(e.target.value) || 0 }
              }))}
              className="w-full pl-12 pr-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold text-lg"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* --- NEW SECTION --- */}
        {/* Children (2-6 years) Price */}
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
              Children Price (2-6 years)
            </span>
            {/* The new checkbox */}
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                // --- UPDATED: Removed focus rings ---
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                checked={!formData.pricing.child2to6.isFree}
                onChange={(e) => handleChild2to6CheckboxChange(e.target.checked)}
              />
              {/* --- UPDATED: Changed text color to blue --- */}
              <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                It has price
              </span>
            </label>
          </label>
          <div className="relative">
            {formData.pricing.child2to6.isFree ? (
              // "FREE" disabled input
              <input
                type="text"
                value="FREE"
                disabled
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-semibold text-lg cursor-not-allowed"
              />
            ) : (
              // Price input
              <>
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricing.child2to6.price}
                  onChange={(e) => handleChild2to6PriceChange(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold text-lg"
                  placeholder="0.00"
                />
              </>
            )}
          </div>
        </div>
        {/* --- END OF NEW/MODIFIED SECTION --- */}

        {/* Infant Price (0-2 years) */}
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Infant Price (0-2 years)
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.pricing.infant}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                pricing: { ...prev.pricing, infant: parseFloat(e.target.value) || 0 }
              }))}
              className="w-full pl-12 pr-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold text-lg"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Single Supplement */}
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            Single Supplement
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.pricing.singleSupplement}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                pricing: { ...prev.pricing, singleSupplement: parseFloat(e.target.value) || 0 }
              }))}
              className="w-full pl-12 pr-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold text-lg"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;