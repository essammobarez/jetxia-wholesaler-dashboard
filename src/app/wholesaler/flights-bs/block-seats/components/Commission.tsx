// Commission.tsx
import React from 'react';
import { DollarSign } from 'lucide-react';

interface CommissionProps {
    formData: {
        supplierCommission: {
            type: 'fixed' | 'percentage';
            value: number;
        };
        agencyCommission: {
            type: 'fixed' | 'percentage';
            value: number;
        };
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    getSelectedCurrencySymbol: () => string;
}

const Commission: React.FC<CommissionProps> = ({ formData, setFormData, getSelectedCurrencySymbol }) => {
    return (
        <div className="bg-gradient-to-br from-teal-50 via-white to-teal-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-teal-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-teal-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl mr-3 shadow-md">
                    <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Commission
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Supplier Commission
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Commission from airlines (deducted from net cost)
                    </p>
                    <div className="flex gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                                ...prev,
                                supplierCommission: { ...prev.supplierCommission, type: 'fixed' }
                            }))}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${formData.supplierCommission.type === 'fixed'
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            💵 Fixed Amount
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                                ...prev,
                                supplierCommission: { ...prev.supplierCommission, type: 'percentage' }
                            }))}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${formData.supplierCommission.type === 'percentage'
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            📊 Percentage
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.supplierCommission.value}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                supplierCommission: { ...prev.supplierCommission, value: Number(e.target.value) }
                            }))}
                            onWheel={(e) => e.currentTarget.blur()}
                            min="0"
                            step="0.01"
                            max={formData.supplierCommission.type === 'percentage' ? 100 : undefined}
                            className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder={formData.supplierCommission.type === 'percentage' ? 'e.g., 10' : 'e.g., 50'}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                            {formData.supplierCommission.type === 'percentage' ? '%' : getSelectedCurrencySymbol()}
                        </span>
                    </div>
                </div>
                <div>
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Agency Commission
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Commission to agencies (deducted from markup/sale price)
                    </p>
                    <div className="flex gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                                ...prev,
                                agencyCommission: { ...prev.agencyCommission, type: 'fixed' }
                            }))}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${formData.agencyCommission.type === 'fixed'
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            💵 Fixed Amount
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                                ...prev,
                                agencyCommission: { ...prev.agencyCommission, type: 'percentage' }
                            }))}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${formData.agencyCommission.type === 'percentage'
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            📊 Percentage
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.agencyCommission.value}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                agencyCommission: { ...prev.agencyCommission, value: Number(e.target.value) }
                            }))}
                            onWheel={(e) => e.currentTarget.blur()}
                            min="0"
                            step="0.01"
                            max={formData.agencyCommission.type === 'percentage' ? 100 : undefined}
                            className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder={formData.agencyCommission.type === 'percentage' ? 'e.g., 15' : 'e.g., 75'}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                            {formData.agencyCommission.type === 'percentage' ? '%' : getSelectedCurrencySymbol()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Commission;