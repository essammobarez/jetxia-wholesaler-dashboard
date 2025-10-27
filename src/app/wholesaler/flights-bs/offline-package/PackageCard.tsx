// PackageCard.tsx

import React from 'react';
import {
  MapPin,
  Calendar,
  Star,
  CheckCircle,
  Edit,
  Trash2,
  DollarSign,
  Clock
} from 'lucide-react';
import { ApiPackage } from './OfflinePackageModule'; // Import the type from the main module


interface PackageCardProps {
  pkg: ApiPackage;
  onEdit: (pkg: ApiPackage) => void;
  onDelete: (id: string) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    // Normalize status for consistent styling
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    switch (normalizedStatus) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Sold out': // Handle 'Sold Out' if it appears in the API
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'Draft':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Budget':
        return 'bg-green-500';
      case 'Standard':
        return 'bg-blue-500';
      case 'Luxury':
        return 'bg-purple-500';
      case 'Premium':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      default:
        return 'bg-gray-500';
    }
  };

  // Function to remove emojis and extra spaces from a string
  const cleanString = (str: string) => {
    if (!str) return '';
    return str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
  };


  return (
    <div key={pkg._id} className="card-modern p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{pkg.packageTitle}</h3>
            {pkg.category && (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(pkg.category)} text-white`}>
                {pkg.category}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{pkg.city}, {cleanString(pkg.country)}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{pkg.days} Days / {pkg.nights} Nights</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(pkg.status)}`}>
               {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(pkg)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(pkg._id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {pkg.description}
      </p>

      {/* Pricing */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Starting from</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pkg.pricing.currency} {pkg.pricing.adultPrice}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">per adult</p>
          </div>
          <div className="text-right text-xs text-gray-500 dark:text-gray-400">
            <p>Child: {pkg.pricing.currency} {pkg.pricing.childPrice}</p>
            <p>Infant: {pkg.pricing.currency} {pkg.pricing.infantPrice}</p>
            {pkg.pricing.singleSupplement > 0 && (
              <p>Single: +{pkg.pricing.currency} {pkg.pricing.singleSupplement}</p>
            )}
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Departure: {new Date(pkg.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>Book by: {new Date(pkg.bookingDeadline).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;