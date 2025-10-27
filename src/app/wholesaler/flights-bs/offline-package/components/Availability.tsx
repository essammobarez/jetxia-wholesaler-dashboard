// src/components/Availability.tsx

import React from 'react';
import { Users, Info, Bed, CheckCircle } from 'lucide-react';

interface AvailabilityProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Availability: React.FC<AvailabilityProps> = ({ formData, setFormData }) => {
  return (
    <div className="card-modern p-6 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span>Availability</span>
        </h3>
        {formData.selectedHotel && (
          <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-xs font-bold flex items-center">
            <Info className="w-3 h-3 mr-1" />
            From {formData.selectedHotel.name}
          </span>
        )}
      </div>
      {!formData.selectedHotel ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Select a hotel first</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Room availability will be auto-filled from the selected hotel</p>
        </div>
      ) : (
        <div className="space-y-5">
          {formData.selectedBlockSeat && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Flight Capacity (Block Seats)</p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {(formData.selectedBlockSeat?.availability?.class1?.total || 0) +
                      (formData.selectedBlockSeat?.availability?.class2?.total || 0) +
                      (formData.selectedBlockSeat?.availability?.class3?.total || 0)} seats
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Already Booked</p>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {(formData.selectedBlockSeat?.availability?.class1?.booked || 0) +
                      (formData.selectedBlockSeat?.availability?.class2?.booked || 0) +
                      (formData.selectedBlockSeat?.availability?.class3?.booked || 0)} seats
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Single Rooms <span className="text-gray-400 ml-1">(1 Person per room)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Total Available</label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                  <input
                    type="number"
                    min="0"
                    value={formData.availability.singleRooms.total}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        singleRooms: { ...prev.availability.singleRooms, total: parseInt(e.target.value) || 0 }
                      }
                    }))}
                    className="w-full pl-10 pr-3 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none font-semibold"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                  Already Booked
                  <Info className="w-3 h-3 ml-1 text-gray-400" />
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.availability.singleRooms.booked}
                    readOnly
                    disabled
                    className="w-full pl-10 pr-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold cursor-not-allowed"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-white/60 dark:bg-gray-900/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Remaining:</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {Math.max(0, formData.availability.singleRooms.total - formData.availability.singleRooms.booked)} rooms
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-xl border-2 border-purple-200 dark:border-purple-800">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Double Rooms <span className="text-gray-400 ml-1">(2 People per room)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Total Available</label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                  <input
                    type="number"
                    min="0"
                    value={formData.availability.doubleRooms.total}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        doubleRooms: { ...prev.availability.doubleRooms, total: parseInt(e.target.value) || 0 }
                      }
                    }))}
                    className="w-full pl-10 pr-3 py-3 border-2 border-purple-300 dark:border-purple-600 rounded-lg transition-all duration-200 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 focus:outline-none font-semibold"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                  Already Booked
                  <Info className="w-3 h-3 ml-1 text-gray-400" />
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.availability.doubleRooms.booked}
                    readOnly
                    disabled
                    className="w-full pl-10 pr-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold cursor-not-allowed"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-white/60 dark:bg-gray-900/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Remaining:</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {Math.max(0, formData.availability.doubleRooms.total - formData.availability.doubleRooms.booked)} rooms
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border-2 border-green-200 dark:border-green-800">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Triple Rooms <span className="text-gray-400 ml-1">(3 People per room)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Total Available</label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  <input
                    type="number"
                    min="0"
                    value={formData.availability.tripleRooms.total}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        tripleRooms: { ...prev.availability.tripleRooms, total: parseInt(e.target.value) || 0 }
                      }
                    }))}
                    className="w-full pl-10 pr-3 py-3 border-2 border-green-300 dark:border-green-600 rounded-lg transition-all duration-200 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 focus:outline-none font-semibold"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                  Already Booked
                  <Info className="w-3 h-3 ml-1 text-gray-400" />
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.availability.tripleRooms.booked}
                    readOnly
                    disabled
                    className="w-full pl-10 pr-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold cursor-not-allowed"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-white/60 dark:bg-gray-900/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Remaining:</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {Math.max(0, formData.availability.tripleRooms.total - formData.availability.tripleRooms.booked)} rooms
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-5 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl border-2 border-indigo-200 dark:border-indigo-700">
            <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
              Total Availability Summary
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white/60 dark:bg-gray-900/30 p-3 rounded-xl">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Rooms:</span>
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                  {formData.availability.singleRooms.total + formData.availability.doubleRooms.total + formData.availability.tripleRooms.total} rooms
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/60 dark:bg-gray-900/30 p-3 rounded-xl">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Booked:</span>
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                  {formData.availability.singleRooms.booked + formData.availability.doubleRooms.booked + formData.availability.tripleRooms.booked} rooms
                </span>
              </div>
              <div className="flex items-center justify-between bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-xl shadow-lg">
                <span className="text-sm font-bold text-white">Still Available:</span>
                <span className="text-2xl font-black text-white">
                  {Math.max(0,
                    (formData.availability.singleRooms.total - formData.availability.singleRooms.booked) +
                    (formData.availability.doubleRooms.total - formData.availability.doubleRooms.booked) +
                    (formData.availability.tripleRooms.total - formData.availability.tripleRooms.booked)
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-indigo-300 dark:border-indigo-700">
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Max Capacity (Single):</span>
                    <span className="font-semibold">{formData.availability.singleRooms.total * 1} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Capacity (Double):</span>
                    <span className="font-semibold">{formData.availability.doubleRooms.total * 2} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Capacity (Triple):</span>
                    <span className="font-semibold">{formData.availability.tripleRooms.total * 3} people</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-indigo-200 dark:border-indigo-800 font-bold text-indigo-700 dark:text-indigo-300">
                    <span>Total Capacity:</span>
                    <span>
                      {(formData.availability.singleRooms.total * 1) +
                        (formData.availability.doubleRooms.total * 2) +
                        (formData.availability.tripleRooms.total * 3)} people
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Availability;