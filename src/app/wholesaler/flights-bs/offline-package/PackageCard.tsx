// PackageCard.tsx

import React from 'react';
import {
  MapPin,
  Calendar,
  Star,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Plane,
  Hotel,
  Check,
  X,
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
    <div key={pkg._id} className="card-modern overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Image at Top */}
      {pkg.packageImages && pkg.packageImages.length > 0 && (
        <img
          src={pkg.packageImages[0]}
          alt={pkg.packageTitle}
          className="w-full h-48 object-cover"
        />
      )}

      {/* Content Wrapper */}
      <div className="p-6">
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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{pkg.city}, {cleanString(pkg.country)} ({pkg.region})</span>
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
          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
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

        {/* --- UPDATED: Pricing Section --- */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex justify-between items-baseline mb-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Starting from</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {pkg.pricing.currency} {pkg.pricing.adultPrice}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">per adult</p>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                Child (2-6): <span className="font-semibold">{pkg.pricing.currency} {pkg.pricing.childPrice2to6}</span>
              </div>
              <div className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                Child (6-12): <span className="font-semibold">{pkg.pricing.currency} {pkg.pricing.childPrice6to12}</span>
              </div>
              <div className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                Infant: <span className="font-semibold">{pkg.pricing.currency} {pkg.pricing.infantPrice}</span>
              </div>
              {pkg.pricing.singleSupplement > 0 && (
                <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                  Single Supplement: <span className="font-semibold">+{pkg.pricing.currency} {pkg.pricing.singleSupplement}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* --- End of Updated Pricing Section --- */}


        {/* Flights, Hotels, & Meals */}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {pkg.hotels && pkg.hotels.length > 0 && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Hotel className="w-4 h-4 mr-2 flex-shrink-0" />
              <span><strong>Hotel:</strong> {pkg.hotels[0].hotelBlockRoomId.hotelName} ({pkg.hotels[0].hotelBlockRoomId.starRating} Stars)</span>
            </div>
          )}
          
          {/* --- ERROR FIX --- */}
          {pkg.flights && pkg.flights.length > 0 && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Plane className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>
                <strong>Flight:</strong>
                {/* Check if flightBlockSeatId is null before accessing its properties */}
                {pkg.flights[0].flightBlockSeatId ? (
                  <>
                    {/* Correctly access airline name from the first outbound segment */}
                    {` ${pkg.flights[0].flightBlockSeatId.route?.outboundSegments?.[0]?.airline?.name ?? 'Unknown Airline'} `}
                    ({pkg.flights[0].flightBlockSeatId.route.from.iataCode} - {pkg.flights[0].flightBlockSeatId.route.to.iataCode}, {pkg.flights[0].flightBlockSeatId.route.tripType.replace('_', ' ')})
                  </>
                ) : (
                  ' Not specified'
                )}
              </span>
            </div>
          )}
          {/* --- END OF FIX --- */}

          {pkg.mealPlan && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" /> {/* Re-using icon */}
              <span><strong>Meal Plan:</strong> {pkg.mealPlan.type}</span>
            </div>
          )}
        </div>

        {/* Highlights & Itinerary (Same Row) */}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
          {pkg.highlights && pkg.highlights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Highlights</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {pkg.highlights.map(h => (
                  <li key={h._id}>{h.text}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Fix: Check for itinerary.day (as in JSON) not itinerary.dayNumber */}
          {pkg.itinerary && pkg.itinerary.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Itinerary Summary</h4>
              <ul className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {pkg.itinerary.map(i => (
                  <li key={i._id}><strong>Day {i.day}:</strong> {i.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Inclusions, Exclusions, Extras */}
        {/* Note: Your current JSON doesn't show these fields, but the code supports them, so I've left it. */}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
          {pkg.inclusions && pkg.inclusions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center">
                <Check className="w-4 h-4 mr-1" /> Inclusions
              </h4>
              <ul className="list-none text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {pkg.inclusions.map(inc => (
                  <li key={inc._id}>{inc.name} {inc.price !== 0 ? `(${inc.price})` : ''}</li>
                ))}
              </ul>
            </div>
          )}
          {pkg.exclusions && pkg.exclusions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center">
                <X className="w-4 h-4 mr-1" /> Exclusions
              </h4>
              <ul className="list-none text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {pkg.exclusions.map(exc => (
                  <li key={exc._id}>{exc.name} {exc.price !== 0 ? `(${exc.price})` : ''}</li>
                ))}
              </ul>
            </div>
          )}
          {pkg.optionalExtras && pkg.optionalExtras.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center">
                <Star className="w-4 h-4 mr-1" /> Optional Extras
              </h4>
              <ul className="list-none text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {pkg.optionalExtras.map(opt => (
                  <li key={opt._id}>{opt.name} ({opt.price})</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-1" />
              <span>
                {new Date(pkg.startDate).toLocaleDateString()} - {new Date(pkg.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>Book by: {new Date(pkg.bookingDeadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PackageCard;