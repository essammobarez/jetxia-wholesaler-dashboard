// src/components/Commission.tsx

import React from 'react';
import { DollarSign } from 'lucide-react';

interface CommissionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  calculateCommission: (price: number, commission: { type: 'fixed' | 'percentage', value: number }) => number;
  calculateNetPrice: () => number;
}

const Commission: React.FC<CommissionProps> = ({
  formData,
  setFormData,
  calculateCommission,
  calculateNetPrice,
}) => {
  return (
    <div className="card-modern p-6 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mr-2">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span>Commission</span>
        </h3>
      </div>
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-5 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            Supplier Commission <span className="text-gray-400 ml-1">(From Airlines)</span>
          </label>
          <div className="flex items-center space-x-3 mb-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                supplierCommission: { ...prev.supplierCommission, type: 'fixed' }
              }))}
              className={`flex-1 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                formData.supplierCommission.type === 'fixed'
                  ? 'bg-emerald-500 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-400'
              }`}
            >
              Fixed Amount
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                supplierCommission: { ...prev.supplierCommission, type: 'percentage' }
              }))}
              className={`flex-1 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                formData.supplierCommission.type === 'percentage'
                  ? 'bg-emerald-500 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-400'
              }`}
            >
              Percentage
            </button>
          </div>
          <div className="relative">
            <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-lg font-bold ${
              formData.supplierCommission.type === 'percentage' ? 'text-emerald-600' : 'text-gray-500'
            }`}>
              {formData.supplierCommission.type === 'percentage' ? '%' : '$'}
            </span>
            <input
              type="number"
              min="0"
              step={formData.supplierCommission.type === 'percentage' ? '0.1' : '0.01'}
              max={formData.supplierCommission.type === 'percentage' ? '100' : undefined}
              value={formData.supplierCommission.value}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                supplierCommission: { ...prev.supplierCommission, value: parseFloat(e.target.value) || 0 }
              }))}
              className="w-full pl-12 pr-5 py-4 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl transition-all duration-200 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold text-lg"
              placeholder="0.00"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
              {formData.supplierCommission.type === 'percentage' ? 'of Base Price' : 'USD'}
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Agency Commission <span className="text-gray-400 ml-1">(For Your Business)</span>
          </label>
          <div className="flex items-center space-x-3 mb-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                agencyCommission: { ...prev.agencyCommission, type: 'fixed' }
              }))}
              className={`flex-1 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                formData.agencyCommission.type === 'fixed'
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
            >
              Fixed Amount
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                agencyCommission: { ...prev.agencyCommission, type: 'percentage' }
              }))}
              className={`flex-1 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                formData.agencyCommission.type === 'percentage'
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
            >
              Percentage
            </button>
          </div>
          <div className="relative">
            <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-lg font-bold ${
              formData.agencyCommission.type === 'percentage' ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {formData.agencyCommission.type === 'percentage' ? '%' : '$'}
            </span>
            <input
              type="number"
              min="0"
              step={formData.agencyCommission.type === 'percentage' ? '0.1' : '0.01'}
              max={formData.agencyCommission.type === 'percentage' ? '100' : undefined}
              value={formData.agencyCommission.value}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                agencyCommission: { ...prev.agencyCommission, value: parseFloat(e.target.value) || 0 }
              }))}
              className="w-full pl-12 pr-5 py-4 border-2 border-blue-300 dark:border-blue-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md font-semibold text-lg"
              placeholder="0.00"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
              {formData.agencyCommission.type === 'percentage' ? 'of Base Price' : 'USD'}
            </div>
          </div>
        </div>
        <div className="p-6 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 shadow-lg">
          <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            Price Breakdown
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white/60 dark:bg-gray-900/30 p-3 rounded-xl">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Base Price:</span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">${formData.pricing.adult.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between bg-red-100/60 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
              <span className="text-sm font-medium text-red-700 dark:text-red-400">- Supplier Commission:</span>
              <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                ${calculateCommission(formData.pricing.adult, formData.supplierCommission).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between bg-red-100/60 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
              <span className="text-sm font-medium text-red-700 dark:text-red-400">- Agency Commission:</span>
              <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                ${calculateCommission(formData.pricing.adult, formData.agencyCommission).toFixed(2)}
              </span>
            </div>
            <div className="pt-4 mt-2 border-t-2 border-emerald-400 dark:border-emerald-600">
              <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-xl shadow-lg">
                <span className="text-sm font-bold text-white">Net Price:</span>
                <span className="text-2xl font-black text-white">${calculateNetPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Commission;