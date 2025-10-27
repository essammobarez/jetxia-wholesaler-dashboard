// src/components/BasicInformation.tsx

import React from 'react';
import { Package, AlertTriangle } from 'lucide-react';

interface BasicInformationProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: { [key: string]: string };
  selectedCountry: string;
  handleCountryChange: (country: string) => void;
  availableCities: string[];
  countriesWithCities: { country: string; cities: string[] }[];
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  formData,
  setFormData,
  errors,
  selectedCountry,
  handleCountryChange,
  availableCities,
  countriesWithCities,
}) => {
  return (
    <div className="card-modern p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-2">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span>Basic Information</span>
        </h3>
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-bold">
          Required
        </span>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Package Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`w-full px-5 py-4 text-base border-2 rounded-xl transition-all duration-200 ${
              errors.title
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md`}
            placeholder="e.g., Cairo & Luxor Historical Journey"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {errors.title}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Country *
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className={`w-full px-5 py-4 text-base border-2 rounded-xl transition-all duration-200 ${
                errors.country
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md cursor-pointer`}
            >
              <option value="">Select Country</option>
              {countriesWithCities.map((item, idx) => (
                <option key={idx} value={item.country}>
                  {item.country}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.country}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              City *
            </label>
            <select
              value={formData.destination.city}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                destination: { ...prev.destination, city: e.target.value }
              }))}
              disabled={!selectedCountry}
              className={`w-full px-5 py-4 text-base border-2 rounded-xl transition-all duration-200 ${
                errors.city
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
              } ${
                !selectedCountry ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md`}
            >
              <option value="">
                {selectedCountry ? 'Select City' : 'Select Country First'}
              </option>
              {availableCities.map((city, idx) => (
                <option key={idx} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.city}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Region <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.destination.region}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              destination: { ...prev.destination, region: e.target.value }
            }))}
            className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md"
            placeholder="e.g., Middle East, North Africa, Mediterranean"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Days
            </label>
            <input
              type="number"
              min="1"
              value={formData.duration.days}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                duration: { ...prev.duration, days: parseInt(e.target.value) || 1 }
              }))}
              className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Nights
            </label>
            <input
              type="number"
              min="0"
              value={formData.duration.nights}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                duration: { ...prev.duration, nights: parseInt(e.target.value) || 0 }
              }))}
              className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Description <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none shadow-sm hover:shadow-md resize-none"
            rows={4}
            placeholder="Describe the package experience, what makes it special, activities included..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                category: e.target.value as 'Budget' | 'Standard' | 'Luxury' | 'Premium'
              }))}
              className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 focus:outline-none shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="Budget">Budget</option>
              <option value="Standard">Standard</option>
              <option value="Luxury">Luxury</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                status: e.target.value as 'Active' | 'Sold Out' | 'Cancelled' | 'Draft'
              }))}
              className="w-full px-5 py-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/30 focus:outline-none shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Sold Out">Sold Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInformation;