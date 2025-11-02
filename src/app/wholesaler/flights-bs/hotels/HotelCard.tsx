import React from 'react';
import {
  Edit,
  Trash2,
  Star,
  MapPin,
  Users,
  Calendar,
} from 'lucide-react';

// Import types and helpers from the main module
import { 
  HotelInventory, 
  getStatusColor, 
  renderStars 
} from './HotelsModule'; // Assuming files are in the same directory

interface HotelCardProps {
  hotel: HotelInventory;
  onEdit: (hotel: HotelInventory) => void;
  onDelete: (id: string) => void;
}

const HotelCard = ({ hotel, onEdit, onDelete }: HotelCardProps) => {
  return (
    <div key={hotel.id} className="card-modern p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{hotel.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(hotel.status)}`}>
              {hotel.status}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              {renderStars(hotel.category)}
              <span className="ml-1">({hotel.category} Star)</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{hotel.location.city}, {hotel.location.country}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(hotel)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(hotel.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rating & Reviews */}
      <div className="flex items-center space-x-4 mb-4">
         {/* Display rating/reviews if available, otherwise hide or show placeholder */}
        {hotel.rating > 0 && (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="font-semibold text-gray-900 dark:text-white">{hotel.rating}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">({hotel.reviews} reviews)</span>
          </div>
        )}
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-1" />
          {/* Displaying first available date range */}
          <span className="text-sm">{hotel.checkInDate} - {hotel.checkOutDate}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {hotel.description || 'No description available.'}
      </p>

      {/* Amenities */}
       {hotel.amenities && hotel.amenities.length > 0 && (
        <div className="mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Amenities:</h4>
            <div className="flex flex-wrap gap-2">
            {hotel.amenities.slice(0, 4).map((amenity, index) => {
                const IconComponent = amenity.icon; // Use the mapped icon
                return (
                  <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg text-xs">
                      <IconComponent className="w-3 h-3 mr-1 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{amenity.name}</span>
                  </div>
                );
            })}
            {hotel.amenities.length > 4 && (
                <div className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                +{hotel.amenities.length - 4} more
                </div>
            )}
            </div>
        </div>
        )}

      {/* Room Types */}
      {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
        <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Room Types:</h4>
            {hotel.roomTypes.map((room, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{room.type}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Max: {room.maxOccupancy} guests</span>
                    <span>Available: {room.available}/{room.total}</span>
                </div>
                </div>
                <div className="text-right">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{hotel.currency} {room.price}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">per night</p>
                </div>
            </div>
            ))}
        </div>
        ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No room types defined for this hotel.</p>
        )}

      {/* Total Availability */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {hotel.availableRooms}/{hotel.totalRooms} rooms available
            </span>
          </div>
          { hotel.totalRooms > 0 && ( // Prevent division by zero
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div
                className="h-2 bg-blue-500 rounded-full"
                style={{ width: `${(hotel.availableRooms / hotel.totalRooms) * 100}%` }}
                ></div>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default HotelCard;