// AvailabilityBookings.tsx
import React from 'react';
import { Users, Info, CheckCircle } from 'lucide-react';

interface AvailabilityBookingsProps {
    formData: {
        pricing: { class1: number; class2: number; class3: number; };
        availability: {
            class1: { total: number; booked: number; };
            class2: { total: number; booked: number; };
            class3: { total: number; booked: number; };
        };
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    calculateNetPrice: (classPrice: number) => number;
    getSelectedCurrencySymbol: () => string;
}

const AvailabilityBookings: React.FC<AvailabilityBookingsProps> = ({
    formData,
    setFormData,
    calculateNetPrice,
    getSelectedCurrencySymbol
}) => {
    return (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-indigo-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-indigo-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mr-3 shadow-md">
                    <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Availability & Bookings
                </h3>
            </div>
            <div className="space-y-8">
                {/* Class 1 */}
                <div className="p-6 bg-white dark:bg-gray-800/50 rounded-xl border-2 border-indigo-100 dark:border-gray-700">
                    <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                        Class 1
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Total Seats Available *
                            </label>
                            <input
                                type="number"
                                value={formData.availability.class1.total}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    availability: {
                                        ...prev.availability,
                                        class1: { ...prev.availability.class1, total: Number(e.target.value) }
                                    }
                                }))}
                                onWheel={(e) => e.currentTarget.blur()}
                                min="0"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="e.g., 50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Already Booked (Auto)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.availability.class1.booked}
                                    readOnly
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium cursor-not-allowed text-gray-600 dark:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Info className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Auto-calculated from frontend bookings
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Available: {formData.availability.class1.total - formData.availability.class1.booked} seats
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Total Amount Booked
                            </label>
                            <div className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg">
                                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                    {getSelectedCurrencySymbol()} {(calculateNetPrice(formData.pricing.class1) * formData.availability.class1.booked).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">After commissions</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Class 2 */}
                <div className="p-6 bg-white dark:bg-gray-800/50 rounded-xl border-2 border-indigo-100 dark:border-gray-700">
                    <h4 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center">
                        <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                        Class 2
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Total Seats Available
                            </label>
                            <input
                                type="number"
                                value={formData.availability.class2.total}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    availability: {
                                        ...prev.availability,
                                        class2: { ...prev.availability.class2, total: Number(e.target.value) }
                                    }
                                }))}
                                onWheel={(e) => e.currentTarget.blur()}
                                min="0"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="e.g., 30"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Already Booked (Auto)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.availability.class2.booked}
                                    readOnly
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium cursor-not-allowed text-gray-600 dark:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Info className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                             <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Auto-calculated from frontend bookings
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Available: {formData.availability.class2.total - formData.availability.class2.booked} seats
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Total Amount Booked
                            </label>
                            <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg">
                                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                    {getSelectedCurrencySymbol()} {(calculateNetPrice(formData.pricing.class2) * formData.availability.class2.booked).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">After commissions</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Class 3 */}
                <div className="p-6 bg-white dark:bg-gray-800/50 rounded-xl border-2 border-indigo-100 dark:border-gray-700">
                    <h4 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center">
                        <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                        Class 3
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Total Seats Available
                            </label>
                            <input
                                type="number"
                                value={formData.availability.class3.total}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    availability: {
                                        ...prev.availability,
                                        class3: { ...prev.availability.class3, total: Number(e.target.value) }
                                    }
                                }))}
                                onWheel={(e) => e.currentTarget.blur()}
                                min="0"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="e.g., 20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Already Booked (Auto)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.availability.class3.booked}
                                    readOnly
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium cursor-not-allowed text-gray-600 dark:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Info className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                             <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Auto-calculated from frontend bookings
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Available: {formData.availability.class3.total - formData.availability.class3.booked} seats
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Total Amount Booked
                            </label>
                            <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg">
                                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                    {getSelectedCurrencySymbol()} {(calculateNetPrice(formData.pricing.class3) * formData.availability.class3.booked).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">After commissions</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Summary */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                    <h4 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">
                        📊 Total Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Seats</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {formData.availability.class1.total + formData.availability.class2.total + formData.availability.class3.total}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Booked</p>
                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                {formData.availability.class1.booked + formData.availability.class2.booked + formData.availability.class3.booked}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                {getSelectedCurrencySymbol()} {(
                                    (calculateNetPrice(formData.pricing.class1) * formData.availability.class1.booked) +
                                    (calculateNetPrice(formData.pricing.class2) * formData.availability.class2.booked) +
                                    (calculateNetPrice(formData.pricing.class3) * formData.availability.class3.booked)
                                ).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">After all commissions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityBookings;