// BaggageAllowance.tsx
import React from 'react';
import { Package } from 'lucide-react';

interface BaggageAllowanceProps {
    formData: {
        baggage: {
            checkedBags: number;
            weight: number;
            carryOn: number;
        };
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    baggageWeightOptions: { value: number; label: string; }[];
}

const BaggageAllowance: React.FC<BaggageAllowanceProps> = ({ formData, setFormData, baggageWeightOptions }) => {
    return (
        <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-purple-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-3 shadow-md">
                    <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Baggage Allowance
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Number of Checked Bags
                    </label>
                    <select
                        value={formData.baggage.checkedBags}
                        onChange={(e) => setFormData(prev => ({ ...prev, baggage: { ...prev.baggage, checkedBags: Number(e.target.value) } }))}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                    >
                        <option value="0">0 Bags</option>
                        <option value="1">1 Bag</option>
                        <option value="2">2 Bags</option>
                        <option value="3">3 Bags</option>
                    </select>
                </div>
                <div>
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Weight per Bag
                    </label>
                    <select
                        value={formData.baggage.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, baggage: { ...prev.baggage, weight: Number(e.target.value) } }))}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                    >
                        {baggageWeightOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Carry-on Weight
                    </label>
                    <select
                        value={formData.baggage.carryOn}
                        onChange={(e) => setFormData(prev => ({ ...prev, baggage: { ...prev.baggage, carryOn: Number(e.target.value) } }))}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all text-base font-medium"
                    >
                        <option value="0">0 kg</option>
                        <option value="5">5 kg</option>
                        <option value="7">7 kg</option>
                        <option value="8">8 kg</option>
                        <option value="10">10 kg</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default BaggageAllowance;