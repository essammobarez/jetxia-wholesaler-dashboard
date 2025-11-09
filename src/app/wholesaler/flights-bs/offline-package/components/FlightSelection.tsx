import React from 'react';
import { Plane, Info, Clock, AlertCircle, ArrowRightLeft, Timer, CalendarCheck } from 'lucide-react';

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
  
  // Determine if we should show the list: explicit toggle OR no seat selected yet
  const shouldShowList = showBlockSeatSelector || !formData.selectedBlockSeat;

  return (
    <div className="card-modern p-6 border-2 border-cyan-200 dark:border-cyan-800 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg mr-2">
            <Plane className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <span>Flight (Block Seats)</span>
        </h3>
        {/* Only show Change button if a seat is already selected */}
        {formData.selectedBlockSeat && (
            <button
            onClick={handleSelectFlightClick}
            className="btn-gradient text-sm"
            >
            Change Flight
            </button>
        )}
      </div>
      {errors.blockSeat && !formData.selectedBlockSeat && (
        <p className="text-red-500 text-xs mb-3">{errors.blockSeat}</p>
      )}

      {formData.selectedBlockSeat ? (
        <div className="space-y-4">
          {/* SELECTED FLIGHT DETAILS CARD */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue-100 dark:border-blue-900 shadow-sm">
            <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <img
                  src={formData.selectedBlockSeat.airline.logo}
                  alt={formData.selectedBlockSeat.airline.name}
                  className="w-12 h-12 rounded-lg object-contain bg-gray-50 dark:bg-gray-700 p-1 border border-gray-100 dark:border-gray-600"
                />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-xl leading-tight">
                    {formData.selectedBlockSeat.airline.name}
                  </p>
                  <div className="flex items-center mt-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-full w-fit">
                    <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{formData.selectedBlockSeat.route.from[0]?.code}</span>
                    <Plane className="w-3.5 h-3.5 mx-2 text-blue-500" />
                    <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{formData.selectedBlockSeat.route.to[0]?.code}</span>
                  </div>
                </div>
              </div>
              <div className="text-right bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
                <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  ${formData.selectedBlockSeat.pricing.economy}
                </p>
                <p className="text-[11px] font-medium text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider">Per Person</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl items-center space-x-3">
                 <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                    <Plane className="w-5 h-5 text-blue-600 dark:text-blue-300 rotate-45" />
                 </div>
                 <div>
                   <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70">Outbound Flight</p>
                   <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                     {formData.selectedBlockSeat.departureFlightNumber || 'N/A'}
                   </p>
                 </div>
              </div>

              <div className="flex p-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800 rounded-xl items-center space-x-3">
                 <div className="p-2 bg-pink-100 dark:bg-pink-800 rounded-lg">
                    <Plane className="w-5 h-5 text-pink-600 dark:text-pink-300 -rotate-135" />
                 </div>
                 <div>
                   <p className="text-[11px] font-semibold uppercase tracking-wider text-pink-600/70 dark:text-pink-400/70">Return Flight</p>
                   <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                     {formData.selectedBlockSeat.returnFlightNumber || 'N/A'}
                   </p>
                 </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 px-2">
               <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm font-medium">Duration: {formData.selectedBlockSeat.duration}</span>
               </div>
               <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <ArrowRightLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Round Trip</span>
               </div>
            </div>
          </div>

          {/* ALL AVAILABLE DATES DISPLAY (No selection needed, all passed) */}
          {formData.selectedBlockSeat.availableDates && formData.selectedBlockSeat.availableDates.length > 0 && (
            <div className="p-5 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-900 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-gray-800 dark:text-white flex items-center">
                  <CalendarCheck className="w-5 h-5 mr-2 text-green-600 dark:text-green-500" />
                  Included Travel Dates
                </h4>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full text-green-700 dark:text-green-300 font-semibold border border-green-200 dark:border-green-800">
                  All {formData.selectedBlockSeat.availableDates.length} Included
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {formData.selectedBlockSeat.availableDates.map((dateInfo: any, idx: number) => (
                  <div
                    key={idx}
                    className="relative p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                         <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                           Departure
                         </p>
                         <p className="text-sm font-semibold text-gray-900 dark:text-white">
                           {new Date(dateInfo.departure).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                         </p>
                      </div>
                      <div className="flex justify-between items-center">
                         <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                           Return
                         </p>
                         <p className="text-sm font-semibold text-gray-900 dark:text-white">
                           {new Date(dateInfo.return).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                         </p>
                      </div>

                      {dateInfo.deadline && (
                         <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end">
                           <p className="text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">
                             <AlertCircle className="w-3 h-3 mr-1" />
                             Deadline: {new Date(dateInfo.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                           </p>
                         </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Flight Selector List - ALWAYS SHOW if no seat selected OR explicitly toggled */}
      {shouldShowList && (
        <div className={`space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar ${formData.selectedBlockSeat ? 'mt-6 border-t border-gray-200 dark:border-gray-700 pt-6' : 'mt-2'}`}>
          <div className="sticky top-0 bg-white dark:bg-gray-900 py-3 z-10 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 mb-2">
             <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
               <Plane className="w-4 h-4 mr-2 text-cyan-500" />
               Available Flights {formData.destination.country && `to ${formData.destination.country}`}
             </p>
             {blockSeatsData.length > 0 && (
                 <span className="px-2.5 py-1 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 text-xs font-bold rounded-md">
                  {blockSeatsData.length} Found
                 </span>
             )}
          </div>
          
          {!formData.destination.country ? (
               <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start">
                 <Info className="w-5 h-5 text-amber-600 dark:text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                 <div>
                   <h5 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">Action Required</h5>
                   <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                     Please select a <strong>Destination Country</strong> in the Basic Information section above to see relevant flights.
                   </p>
                 </div>
               </div>
          ) : isLoadingFlights ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
               <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
               <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading flights...</p>
            </div>
          ) : blockSeatsData.length > 0 ? (
            <div className="space-y-3 pb-2">
            {blockSeatsData.map((seat) => (
              <div
                key={seat.id}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    selectedBlockSeat: seat,
                    // selectedDateIndex removed as we pass all now
                    selectedHotel: null
                  }));
                  setShowBlockSeatSelector(false);
                  setShowHotelSelector(false);
                  setErrors(prev => ({ ...prev, blockSeat: '', hotel: '' }));
                }}
                className="group p-4 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-2xl cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div className="flex space-x-4">
                    <img src={seat.airline.logo} alt={seat.airline.name} className="w-10 h-10 rounded-md object-contain border border-gray-100 dark:border-gray-700 bg-white p-0.5" />
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                         <p className="font-bold text-gray-900 dark:text-white leading-tight">
                           {seat.airline.name}
                         </p>
                         <div className="flex space-x-1">
                           <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded flex items-center">
                             <Plane className="w-3 h-3 mr-1 rotate-45" />
                             {seat.departureFlightNumber || 'N/A'}
                           </span>
                           <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 rounded flex items-center">
                             <Plane className="w-3 h-3 mr-1 -rotate-135" />
                             {seat.returnFlightNumber || 'N/A'}
                           </span>
                         </div>
                      </div>
                      
                      <div className="flex items-center mt-2 space-x-3">
                         <div className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                           <span className="font-bold text-xs text-gray-700 dark:text-gray-300">{seat.route.from[0]?.code}</span>
                           <ArrowRightLeft className="w-3 h-3 mx-1.5 text-gray-400" />
                           <span className="font-bold text-xs text-gray-700 dark:text-gray-300">{seat.route.to[0]?.code}</span>
                         </div>
                         <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                           <Timer className="w-3 h-3 mr-1" />
                           {seat.duration}
                         </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end justify-between h-full min-h-[60px]">
                    <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">${seat.pricing.economy}</p>
                    {seat.availableDates && seat.availableDates.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center">
                          <CalendarCheck className="w-3 h-3 mr-1" />
                          {seat.availableDates.length} Dates Included
                        </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <Plane className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">No flights found for this country</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightSelection;