// BlockSeatCard.tsx

import React from 'react';
import {
  Plane,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  ArrowRight,
  Info,
  Clock,
} from 'lucide-react';
// We assume 'BlockSeat' type is imported from a shared file,
// based on the mapper in your BlockSeatsModule.
// This type should include both 'classes' (with full pricing)
// and 'priceClasses' (for display rules).
import { BlockSeat } from './mockData'; // Assuming mockData exports the BlockSeat type

interface BlockSeatCardProps {
  blockSeat: BlockSeat;
  onEdit: (seat: BlockSeat) => void;
  onDelete: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Available':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'Limited':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'Sold Out':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'Cancelled':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    case 'Expired':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getClassColor = (classType: string) => {
  switch (classType) {
    case 'Economy':
      return 'bg-blue-500';
    case 'Business':
      return 'bg-purple-500';
    case 'First':
      return 'bg-amber-500';
    default:
      return 'bg-gray-500';
  }
};

const BlockSeatCard: React.FC<BlockSeatCardProps> = ({
  blockSeat,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      key={blockSeat.id}
      className="card-modern p-6 hover:shadow-lg transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center border border-gray-200 dark:border-gray-700">
            <img
              src={
                blockSeat.airline?.logo ||
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMzIgMjBMMjAgMzJMMzIgNDRMNDQgMzJMMzIgMjBaIiBmaWxsPSIjOUM5Q0EzIi8+PC9zdmc+'
              }
              alt={blockSeat.airline?.name || 'Airline'}
              className="w-full h-full object-contain"
              onError={(e) => {
                (
                  e.target as HTMLImageElement
                ).src =
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMzIgMjBMMjAgMzJMMzIgNDRMNDQgMzJMMzIgMjBaIiBmaWxsPSIjOUM5Q0EzIi8+PC9zdmc+';
              }}
            />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {blockSeat.airline?.name || 'Unknown Airline'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {blockSeat.flightNumber} • {blockSeat.aircraft || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
              blockSeat.status,
            )}`}
          >
            {blockSeat.status}
          </span>
          <button
            onClick={() => onEdit(blockSeat)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(blockSeat.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Route Information */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="text-center flex-1">
          <p className="font-bold text-xl text-gray-900 dark:text-white mb-1">
            {Array.isArray(blockSeat.route.from)
              ? blockSeat.route.from.map((a) => a.code).join(', ')
              : typeof blockSeat.route.from === 'string'
                ? blockSeat.route.from
                : blockSeat.route.from.code}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {Array.isArray(blockSeat.route.from)
              ? `${blockSeat.route.from.length} Airport${
                  blockSeat.route.from.length > 1 ? 's' : ''
                }`
              : typeof blockSeat.route.from === 'string'
                ? blockSeat.route.from
                : blockSeat.route.from.city}
          </p>
          {Array.isArray(blockSeat.route.from) &&
            blockSeat.route.from.length > 1 && (
              <div className="mt-2 flex flex-wrap gap-1 justify-center">
                {blockSeat.route.from.map((airport, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
                  >
                    {airport.flag} {airport.city}
                  </span>
                ))}
              </div>
            )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {blockSeat.departureTime}
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center mx-4">
          <div className="text-center">
            <Plane className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {blockSeat.duration}
            </p>
          </div>
        </div>
        <div className="text-center flex-1">
          <p className="font-bold text-xl text-gray-900 dark:text-white mb-1">
            {Array.isArray(blockSeat.route.to)
              ? blockSeat.route.to.map((a) => a.code).join(', ')
              : typeof blockSeat.route.to === 'string'
                ? blockSeat.route.to
                : blockSeat.route.to.code}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {Array.isArray(blockSeat.route.to)
              ? `${blockSeat.route.to.length} Airport${
                  blockSeat.route.to.length > 1 ? 's' : ''
                }`
              : typeof blockSeat.route.to === 'string'
                ? blockSeat.route.to
                : blockSeat.route.to.city}
          </p>
          {Array.isArray(blockSeat.route.to) &&
            blockSeat.route.to.length > 1 && (
              <div className="mt-2 flex flex-wrap gap-1 justify-center">
                {blockSeat.route.to.map((airport, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs"
                  >
                    {airport.flag} {airport.city}
                  </span>
                ))}
              </div>
            )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {blockSeat.arrivalTime}
          </p>
        </div>
      </div>

      {/* ================================================================== */}
      {/* ================== UPDATED SECTION STARTS HERE =================== */}
      {/* ================================================================== */}

      {/* Date Information (UPDATED to show first deadline) */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            Departure:{' '}
            {/* This uses the first available date, as mapped in BlockSeatsModule */}
            {new Date(blockSeat.departureDate).toLocaleDateString()}
          </span>
        </div>

        {/* NEWLY ADDED DEADLINE (from first available date) */}
        {blockSeat.availableDates?.[0]?.deadline && (
          <div className="flex items-center text-red-600 dark:text-red-400 font-medium">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Deadline:{' '}
              {new Date(
                blockSeat.availableDates[0].deadline,
              ).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* =================== UPDATED SECTION ENDS HERE ==================== */}
      {/* ================================================================== */}

      {/* Available Airports for Frontend */}
      {((Array.isArray(blockSeat.route.from) &&
        blockSeat.route.from.length > 0) ||
        (Array.isArray(blockSeat.route.to) &&
          blockSeat.route.to.length > 0)) && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            Available in Frontend Search
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(blockSeat.route.from) &&
              blockSeat.route.from.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    FROM Airports:
                  </p>
                  <div className="space-y-1">
                    {blockSeat.route.from.map((airport, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-sm flex items-center justify-between border border-blue-200 dark:border-blue-700"
                      >
                        <span className="font-medium">
                          {airport.flag} {airport.city}
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                          {airport.code}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            {Array.isArray(blockSeat.route.to) &&
              blockSeat.route.to.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    TO Airports:
                  </p>
                  <div className="space-y-1">
                    {blockSeat.route.to.map((airport, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-sm flex items-center justify-between border border-green-200 dark:border-green-700"
                      >
                        <span className="font-medium">
                          {airport.flag} {airport.city}
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400 font-bold">
                          {airport.code}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 flex items-center">
            <Info className="w-3 h-3 mr-1" />
            Customers searching for these airports will find this flight
          </p>
        </div>
      )}

      {/* Available Dates (UPDATED with Time and Deadline) */}
      {blockSeat.availableDates && blockSeat.availableDates.length > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
            Available Flight Dates ({blockSeat.availableDates.length})
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {blockSeat.availableDates.map((date) => (
              <div
                key={date.id}
                className="px-3 py-3 bg-white dark:bg-gray-700 rounded-lg text-xs border border-green-200 dark:border-green-700 space-y-2"
              >
                {/* Departure and Return */}
                <div className="flex items-center justify-between font-medium text-gray-700 dark:text-gray-300">
                  <div className="text-left">
                    <span className="text-gray-500 dark:text-gray-400 text-xs block">
                      Depart
                    </span>
                    {new Date(date.departureDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {date.departureTime}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mx-2" />
                  <div className="text-right">
                    <span className="text-gray-500 dark:text-gray-400 text-xs block">
                      Return
                    </span>
                    {new Date(date.returnDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {date.returnTime}
                    </span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 text-center">
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    Deadline:{' '}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {new Date(date.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Classes (Includes fix for missing pricing) */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          Available Classes & Pricing:
        </h4>

        {/* Iterate over 'classes' which has the detailed pricing */}
        {blockSeat.classes.map((pClass, index) => {
          // Find the matching 'priceClass' from the other array to get baggage/rules
          // This is needed because the mapper split the data
          const displayRules = blockSeat.priceClasses.find(
            (pc) => pc.classType === pClass.className,
          );

          return (
            <div
              key={index}
              className="p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
            >
              {/* Class Header */}
              <div className="flex items-start sm:items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-600 flex-col sm:flex-row gap-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 sm:mt-0 ${getClassColor(
                      pClass.className,
                    )}`}
                  ></div>
                  <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      {pClass.className}
                    </p>
                    {displayRules && (
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>
                          Baggage:{' '}
                          {displayRules.baggageAllowance.checkedBag}
                        </span>
                        <span>
                          Refund:{' '}
                          {displayRules.fareRules.refundable ? 'Yes' : 'No'}
                        </span>
                        <span>
                          Change: ${displayRules.fareRules.changeFee}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right flex-shrink-0 sm:ml-4 w-full sm:w-auto pl-6 sm:pl-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {pClass.availableSeats} / {pClass.totalSeats} seats
                  </p>
                  <div className="w-full sm:w-20 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                    <div
                      className="h-1.5 bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          (pClass.availableSeats / (pClass.totalSeats || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Detailed Pricing Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                {/* Adult Pricing */}
                <div className="text-sm">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    Adult
                  </p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {pClass.pricing?.adult?.price ?? 0}{' '}
                    <span className="text-xs font-normal">
                      {pClass.currency}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Comm: {pClass.pricing?.adult?.commission?.value ?? 0}
                    {pClass.pricing?.adult?.commission?.type === 'PERCENTAGE'
                      ? '%'
                      : ` ${pClass.currency}`}
                  </p>
                </div>

                {/* Children Pricing */}
                <div className="text-sm">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    Child
                  </p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {pClass.pricing?.children?.price ?? 0}{' '}
                    <span className="text-xs font-normal">
                      {pClass.currency}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Comm: {pClass.pricing?.children?.commission?.value ?? 0}
                    {pClass.pricing?.children?.commission?.type === 'PERCENTAGE'
                      ? '%'
                      : ` ${pClass.currency}`}
                  </p>
                </div>

                {/* Infant Pricing */}
                <div className="text-sm">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    Infant
                  </p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {pClass.pricing?.infant?.price ?? 0}{' '}
                    <span className="text-xs font-normal">
                      {pClass.currency}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Comm: {pClass.pricing?.infant?.commission?.value ?? 0}
                    {pClass.pricing?.infant?.commission?.type === 'PERCENTAGE'
                      ? '%'
                      : ` ${pClass.currency}`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlockSeatCard;