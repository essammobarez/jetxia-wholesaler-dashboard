// Pricing.tsx
import React from 'react';
import { DollarSign } from 'lucide-react';

interface PricingProps {
    formData: {
        pricing: {
            class1: number;
            class2: number;
            class3: number;
            currency: string;
        };
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    currencies: { code: string; name: string; symbol: string; }[];
    getSelectedCurrencySymbol: () => string;
}

const Pricing: React.FC<PricingProps> = ({ formData, setFormData, currencies, getSelectedCurrencySymbol }) => {
    return (
        <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-yellow-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-yellow-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl mr-3 shadow-md">
                    <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Pricing
                </h3>
            </div>
            <div className="mb-6">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Currency *
                </label>
                <select
                    value={formData.pricing.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, currency: e.target.value } }))}
                    className="w-full md:w-1/2 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition-all text-base font-medium"
                >
                    {currencies.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                            {curr.code} - {curr.name} ({curr.symbol})
                        </option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Class 1 * {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                    </label>
                    <input
                        type="number"
                        value={formData.pricing.class1}
                        onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, class1: Number(e.target.value) } }))}
                        onWheel={(e) => e.currentTarget.blur()}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition-all text-base font-medium border-gray-200 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="e.g., 500"
                    />
                </div>
                <div>
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Class 2 {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                    </label>
                    <input
                        type="number"
                        value={formData.pricing.class2}
                        onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, class2: Number(e.target.value) } }))}
                        onWheel={(e) => e.currentTarget.blur()}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="e.g., 1250"
                    />
                </div>
                <div>
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Class 3 {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                    </label>
                    <input
                        type="number"
                        value={formData.pricing.class3}
                        onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, class3: Number(e.target.value) } }))}
                        onWheel={(e) => e.currentTarget.blur()}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="e.g., 2000"
                    />
                </div>
            </div>
        </div>
    );
};

export default Pricing;