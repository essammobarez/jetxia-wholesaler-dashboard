'use client';

import React from 'react';
import {
  Package,
  Eye,
  CheckCircle,
  XCircle,
  Edit,
  Calendar,
  Users,
  MapPin,
  Clock,
  Mail,
  Phone,
  User,
  FileText,
} from 'lucide-react';
import { PackageRequest } from './PackageRequestsModule'; // Import type from main module

interface CardProps {
  request: PackageRequest;
  getStatusBadge: (status: string) => string;
  getPriorityBadge: (priority: string) => string;
  onConfirm: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onCancel: (requestId: string) => void;
  onView: (request: PackageRequest) => void; // <-- ADD THIS PROP
}

const BookingRequestCard: React.FC<CardProps> = ({
  request,
  getStatusBadge,
  getPriorityBadge,
  onConfirm,
  onReject,
  onCancel,
  onView, // <-- GET THIS PROP
}) => {
  return (
    <div
      key={request.id}
      className="card-modern p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {request.id}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusBadge(
                request.status,
              )}`}
            >
              {request.status}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getPriorityBadge(
                request.priority,
              )}`}
            >
              {request.priority}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {new Date(request.requestDate).toLocaleString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
            <User className="w-4 h-4 mr-2 text-blue-600" />
            Customer Information
          </h4>
          <div className="pl-6 space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {request.customer.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {request.customer.email}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <Phone className="w-3 h-3 mr-1" />
              {request.customer.phone}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {request.customer.nationality}
            </p>
          </div>
        </div>

        {/* Package Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
            <Package className="w-4 h-4 mr-2 text-purple-600" />
            Package Details
          </h4>
          <div className="pl-6 space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {request.package.title}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {request.package.destination}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(request.package.startDate).toLocaleDateString()} -{' '}
              {new Date(request.package.endDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {request.travelers.adults} Adults, {request.travelers.children}{' '}
              Children, {request.travelers.infants} Infants
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Base Price:
            </span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              ${request.pricing.basePrice}
            </span>
          </div>
          {request.pricing.discount > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                -${request.pricing.discount}
              </span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total:
            </span>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${request.pricing.totalPrice}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700 flex items-center justify-end space-x-3">
        <button
          onClick={() => onView(request)} // <-- ADD ONCLICK HANDLER
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center transition-colors shadow-md hover:shadow-lg"
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </button>

        {/* 'Package Request' button removed */}

        {request.status === 'Pending' && (
          <>
            <button
              onClick={() => onConfirm(request._id)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold flex items-center transition-colors shadow-md hover:shadow-lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm
            </button>
            <button
              onClick={() => onReject(request._id)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center transition-colors shadow-md hover:shadow-lg"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </button>
          </>
        )}

        {/* Show Cancel button if status is Confirmed */}
        {request.status === 'Confirmed' && (
          <button
            onClick={() => onCancel(request._id)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center transition-colors shadow-md hover:shadow-lg"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
          </button>
        )}

        <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold flex items-center transition-colors shadow-md hover:shadow-lg">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </button>
      </div>
    </div>
  );
};

export default BookingRequestCard;