// FareRules.tsx
import React from 'react';
import { FileText } from 'lucide-react';

interface FareRule {
    name: string;
    cancellationFee: number;
    changeFee: number;
    refundable: boolean;
}

interface FareRulesProps {
    formData: {
        fareRules: {
            templateName: string;
            cancellationFee: number;
            changeFee: number;
            refundable: boolean;
        };
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    handleFareRuleTemplate: (templateName: string) => void;
    fareRulesTemplates: FareRule[];
    getSelectedCurrencySymbol: () => string;
}

const FareRules: React.FC<FareRulesProps> = ({
    formData,
    setFormData,
    handleFareRuleTemplate,
    fareRulesTemplates,
    getSelectedCurrencySymbol
}) => {
    return (
        <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-orange-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-orange-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mr-3 shadow-md">
                    <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Fare Rules
                </h3>
            </div>
            <div className="mb-6">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    📋 Select Standard Template or Manual Entry
                </label>
                <select
                    value={formData.fareRules.templateName === 'Manual Entry' ? '' : formData.fareRules.templateName}
                    onChange={(e) => handleFareRuleTemplate(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all text-base font-medium"
                >
                    <option value="">Manual Entry (Custom)</option>
                    {fareRulesTemplates.map((template) => (
                        <option key={template.name} value={template.name}>
                            {template.name} - {template.refundable ? '✓ Refundable' : '✗ Non-Refundable'}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Select a template to apply standard rules, or keep "Manual Entry" to customize all fields
                </p>
            </div>
            <div className="space-y-6">
                <div>
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Cancellation Fee {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                    </label>
                    <input
                        type="number"
                        value={formData.fareRules.cancellationFee}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            fareRules: { ...prev.fareRules, cancellationFee: Number(e.target.value), templateName: 'Manual Entry' }
                        }))}
                        onWheel={(e) => e.currentTarget.blur()}
                        min="0"
                        step="1"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="e.g., 100"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Fee charged if the booking is cancelled (0 = Free cancellation)
                    </p>
                </div>
                <div>
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Change Fee {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                    </label>
                    <input
                        type="number"
                        value={formData.fareRules.changeFee}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            fareRules: { ...prev.fareRules, changeFee: Number(e.target.value), templateName: 'Manual Entry' }
                        }))}
                        onWheel={(e) => e.currentTarget.blur()}
                        min="0"
                        step="1"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="e.g., 50"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Fee charged for date/time changes (0 = Free changes)
                    </p>
                </div>
                <div>
                    <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Refundable Status
                    </label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                                ...prev,
                                fareRules: { ...prev.fareRules, refundable: true, templateName: 'Manual Entry' }
                            }))}
                            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${formData.fareRules.refundable
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            ✓ Refundable
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                                ...prev,
                                fareRules: { ...prev.fareRules, refundable: false, templateName: 'Manual Entry' }
                            }))}
                            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${!formData.fareRules.refundable
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            ✗ Non-Refundable
                        </button>
                    </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                    <h4 className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-3">
                        📜 Current Fare Rules Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Cancellation Fee:</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                                {getSelectedCurrencySymbol()} {formData.fareRules.cancellationFee}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Change Fee:</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                                {getSelectedCurrencySymbol()} {formData.fareRules.changeFee}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Refundable:</span>
                            <span className={`font-bold ${formData.fareRules.refundable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {formData.fareRules.refundable ? '✓ Yes' : '✗ No'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FareRules;