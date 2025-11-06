import React from 'react';
import { Plane, Info } from 'lucide-react';

interface FlightSelectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<any>>;
  blockSeatsData: any[];
  isLoadingFlights: boolean;
  showBlockSeatSelector: boolean;
  handleSelectFlightClick: () => void;
  setShowBlockSeatSelector: React.Dispatch<React.SetStateAction<boolean>>;
  setShowHotelSelector: React.Dispatch<React.SetStateAction<boolean>>;
}

const FlightSelection: React.FC<FlightSelectionProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  blockSeatsData,
  isLoadingFlights,
  showBlockSeatSelector,
  handleSelectFlightClick,
  setShowBlockSeatSelector,
  setShowHotelSelector,
}) => {
  return (
    <div className="card-modern p-6 border-2 border-cyan-200 dark:border-cyan-800 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg mr-2">
            <Plane className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <span>Flight (Block Seats)</span>
        </h3>
        <button
          onClick={handleSelectFlightClick}
          className="btn-gradient text-sm"
        >
          {formData.selectedBlockSeat ? 'Change Flight' : 'Select Flight'}
        </button>
      </div>
      {errors.blockSeat && !formData.selectedBlockSeat && (
        <p className="text-red-500 text-xs mb-3">{errors.blockSeat}</p>
      )}
      {formData.selectedBlockSeat ? (
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <img
                  src={formData.selectedBlockSeat.airline.logo}
                  alt={formData.selectedBlockSeat.airline.name}
                  className="w-8 h-8 rounded"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formData.selectedBlockSeat.airline.name} {formData.selectedBlockSeat.flightNumber}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formData.selectedBlockSeat.route.from[0]?.city} -> {formData.selectedBlockSeat.route.to[0]?.city}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formData.selectedBlockSeat.departureTime}
                </p>
                <p className="text-xs text-gray-500">{formData.selectedBlockSeat.duration}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
              <span>{formData.selectedBlockSeat.departureDate}</span>
              <span>Economy: ${formData.selectedBlockSeat.pricing.economy}</span>
            </div>
          </div>
          {formData.selectedBlockSeat.availableDates && formData.selectedBlockSeat.availableDates.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Available Dates
                </h4>
                <span className="text-xs bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded-full text-purple-900 dark:text-purple-100 font-semibold">
                  {formData.selectedBlockSeat.availableDates.length} dates
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {formData.selectedBlockSeat.availableDates.map((dateInfo: any, idx: number) => {
                  const isSelected = formData.selectedDateIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          selectedDateIndex: idx
                        }));
                      }}
                      className={`p-3 rounded-lg border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-600 dark:border-purple-400'
                          : 'bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-500'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className={`text-xs font-semibold flex items-center ${
                          isSelected ? 'text-white' : 'text-purple-900 dark:text-purple-100'
                        }`}>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          Dep: {new Date(dateInfo.departure).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className={`text-xs font-semibold flex items-center ${
                          isSelected ? 'text-white' : 'text-pink-900 dark:text-pink-100'
                        }`}>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                          </svg>
                          Ret: {new Date(dateInfo.return).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {isSelected && (
                          <div className="mt-2 pt-2 border-t border-white/30">
                            <p className="text-[10px] font-bold text-white flex items-center justify-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              SELECTED
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <Plane className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No flight selected</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Select a country to see available flights</p>
        </div>
      )}
      {showBlockSeatSelector && (
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Available Flights {formData.destination.country && `to ${formData.destination.country}`}:
          </p>
          {!formData.destination.country ? (
               <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
                 <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 flex items-center">
                   <Info className="w-4 h-4 mr-2" />
                   Please select a country first to see available flights.
                 </p>
               </div>
          ) : isLoadingFlights ? (
            <div className="text-center py-4 text-gray-600 dark:text-gray-400">
              Loading flights...
            </div>
          ) : blockSeatsData.length > 0 ? (
            blockSeatsData.map((seat) => (
              <div
                key={seat.id}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    selectedBlockSeat: seat,
                    selectedDateIndex: null,
                    selectedHotel: null
                  }));
                  setShowBlockSeatSelector(false);
                  setShowHotelSelector(false);
                  setErrors(prev => ({ ...prev, blockSeat: '', hotel: '' }));
                }}
                className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={seat.airline.logo} alt={seat.airline.name} className="w-6 h-6 rounded" />
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {seat.airline.name} {seat.flightNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {seat.route.from[0]?.code} -> {seat.route.to[0]?.code}
                      </p>
                      {seat.availableDates && seat.availableDates.length > 0 && (
                        <p className="text-xs text-blue-600 font-semibold mt-1">
                          {seat.availableDates.length} date{seat.availableDates.length > 1 ? 's' : ''} available
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">${seat.pricing.economy}</p>
                    <p className="text-xs text-gray-500">{seat.duration}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-600 dark:text-gray-400">
              No available flights found for {formData.destination.country}.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightSelection;