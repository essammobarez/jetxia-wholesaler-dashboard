// src/components/HotelSelection.tsx

import React from 'react';
import { Hotel, Star, Info } from 'lucide-react';

interface HotelSelectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<any>>;
  showHotelSelector: boolean;
  setShowHotelSelector: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelectHotelClick: () => void;
  hotelBlockData: any[];
  isLoadingHotels: boolean;
}

const HotelSelection: React.FC<HotelSelectionProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  showHotelSelector,
  setShowHotelSelector,
  handleSelectHotelClick,
  hotelBlockData,
  isLoadingHotels,
}) => {
  return (
    <div className="card-modern p-6 border-2 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-2">
            <Hotel className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <span>Hotel</span>
        </h3>
        <button
          onClick={handleSelectHotelClick}
          className="btn-gradient text-sm"
        >
          {formData.selectedHotel ? 'Change Hotel' : 'Select Hotel'}
        </button>
      </div>
      {errors.hotel && !formData.selectedHotel && (
        <p className="text-red-500 text-xs mb-3">{errors.hotel}</p>
      )}
      {formData.selectedHotel ? (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.selectedHotel.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formData.selectedHotel.city}, {formData.selectedHotel.country}
              </p>
              <div className="flex items-center mt-1">
                {Array.from({ length: formData.selectedHotel.rating }, (_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formData.selectedHotel.roomTypes.length} Room Types
              </p>
              <p className="text-xs text-gray-500">
                From ${Math.min(...formData.selectedHotel.roomTypes.map((r: any) => r.price))}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {formData.selectedHotel.amenities.slice(0, 5).map((amenity: string, idx: number) => (
              <span key={idx} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <Hotel className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No hotel selected</p>
        </div>
      )}
      {showHotelSelector && (
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Available Hotels:
          </p>
          {isLoadingHotels ? (
             <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                Loading hotels...
             </div>
          ) : (
            hotelBlockData.length > 0 ? (
                hotelBlockData.map((hotel) => (
                    <div
                        key={hotel.id}
                        onClick={() => {
                        setFormData(prev => ({ ...prev, selectedHotel: hotel }));
                        setShowHotelSelector(false);
                        setErrors(prev => ({ ...prev, hotel: '' }));
                        }}
                        className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-green-400 transition-all"
                    >
                        <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {hotel.name}
                            </p>
                            <p className="text-xs text-gray-500">
                            {hotel.city}, {hotel.country}
                            </p>
                            <div className="flex items-center mt-1">
                            {Array.from({ length: hotel.rating }, (_, i) => (
                                <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-green-600">
                            From ${Math.min(...hotel.roomTypes.map((r: any) => r.price))}
                            </p>
                            <p className="text-xs text-gray-500">{hotel.roomTypes.length} room types</p>
                        </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                    No available hotels found.
                </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default HotelSelection;