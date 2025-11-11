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
    // --- UPDATE: Changed type to 'any' to correctly receive the full formData from the parent ---
    formData: any;
    // --- END UPDATE ---
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
    // --- UPDATE: Check if Semi Flexible (Custom) mode is active ---
    const isManualEntry = formData.fareRules.templateName === 'Semi Flexible';
    // --- END UPDATE ---

    // --- UPDATE: Check if Non-Refundable Template is selected ---
    const isNonRefundableTemplate = formData.fareRules.templateName === 'Non-Refundable';
    // --- END UPDATE ---

    // --- NEW LOGIC: Determine values for summary ---
    const getBaseFare = () => {
        const { pricing } = formData;
        // Check for pricing structure, handle potential undefined
        if (pricing?.class1?.adult?.price > 0) return pricing.class1.adult.price;
        if (pricing?.class2?.adult?.price > 0) return pricing.class2.adult.price;
        if (pricing?.class3?.adult?.price > 0) return pricing.class3.adult.price;
        return 0; // Fallback
    };

    // If it's refundable, show the fee. If not, show the full base fare as the cancellation cost.
    const cancellationFeeToShow = formData.fareRules.refundable
        ? formData.fareRules.cancellationFee
        : getBaseFare();
    
    // Change fee is always the value from the rules.
    const changeFeeToShow = formData.fareRules.changeFee;
    // --- END NEW LOGIC ---

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
                    {/* --- UPDATE: Changed label text --- */}
                    Select Standard Template or Semi Flexible (Custom)
                    {/* --- END UPDATE --- */}
                </label>
                <select
                    // --- UPDATE: Check for 'Semi Flexible' instead of 'Manual Entry' ---
                    value={formData.fareRules.templateName === 'Semi Flexible' ? '' : formData.fareRules.templateName}
                    // --- END UPDATE ---
                    onChange={(e) => {
                        const templateName = e.target.value;
                        // Call the parent function to set template data (for Flexible/Non-Refundable)
                        handleFareRuleTemplate(templateName);

                        // --- UPDATE: If "Semi Flexible (Custom)" is selected, force-clear the fields ---
                        if (templateName === '') {
                            setFormData(prev => ({
                                ...prev,
                                fareRules: {
                                    ...prev.fareRules,
                                    // --- UPDATE: Set templateName to 'Semi Flexible' for custom mode ---
                                    templateName: 'Semi Flexible',
                                    // --- END UPDATE ---
                                    cancellationFee: 0, // Reset to 0
                                    changeFee: 0,       // Reset to 0
                                    refundable: false,  // Reset to default
                                }
                            }));
                        }
                        // --- END UPDATE ---
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all text-base font-medium"
                >
                    {/* --- UPDATE: Changed option text --- */}
                    <option value="">Semi Flexible (Custom)</option>
                    {/* --- END UPDATE --- */}
                    {fareRulesTemplates
                        // --- UPDATE: Added 'Semi Flexible' to the filter ---
                        .filter(template => template.name === 'Flexible' || template.name === 'Non-Refundable' || template.name === 'Semi Flexible')
                        // --- END UPDATE ---
                        .map((template) => (
                            <option key={template.name} value={template.name}>
                                {/* --- UPDATE: Change display text for Non-Refundable --- */}
                                {template.name} - {
                                    template.name === 'Non-Refundable'
                                        ? 'Non Changeable'
                                        : (template.refundable ? 'Refundable' : 'Non-Refundable')
                                }
                                {/* --- END UPDATE --- */}
                            </option>
                        ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {/* --- UPDATE: Changed helper text --- */}
                    Select a template to apply standard rules, or keep "Semi Flexible (Custom)" to customize all fields
                    {/* --- END UPDATE --- */}
                </p>
            </div>
            <div className="space-y-6">

                {/* --- UPDATE: Show message if Non-Refundable is selected --- */}
                {isNonRefundableTemplate && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700">
                        <p className="text-center text-base font-semibold text-red-600 dark:text-red-300">
                            This fare is Fully Non-Refundable.
                        </p>
                    </div>
                )}
                {/* --- END UPDATE --- */}


                {/* --- UPDATE: Hide all fields if Non-Refundable is selected --- */}
                {!isNonRefundableTemplate && (
                    <>
                        <div>
                            <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Cancellation Fee {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                            </label>
                            <input
                                type="number"
                                value={formData.fareRules.cancellationFee}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    // --- UPDATE: Set templateName to 'Semi Flexible' on change ---
                                    fareRules: { ...prev.fareRules, cancellationFee: Number(e.target.value), templateName: 'Semi Flexible' }
                                    // --- END UPDATE ---
                                }))}
                                onWheel={(e) => e.currentTarget.blur()}
                                min="0"
                                step="1"
                                disabled={!isManualEntry}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
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
                                    // --- UPDATE: Set templateName to 'Semi Flexible' on change ---
                                    fareRules: { ...prev.fareRules, changeFee: Number(e.target.value), templateName: 'Semi Flexible' }
                                    // --- END UPDATE ---
                                }))}
                                onWheel={(e) => e.currentTarget.blur()}
                                min="0"
                                step="1"
                                disabled={!isManualEntry}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
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
                                        // --- UPDATE: Set templateName to 'Semi Flexible' on change ---
                                        fareRules: { ...prev.fareRules, refundable: true, templateName: 'Semi Flexible' }
                                        // --- END UPDATE ---
                                    }))}
                                    disabled={!isManualEntry}
                                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed ${formData.fareRules.refundable
                                            ? 'bg-green-600 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Refundable
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        // --- UPDATE: Set templateName to 'Semi Flexible' on change ---
                                        fareRules: { ...prev.fareRules, refundable: false, templateName: 'Semi Flexible' }
                                        // --- END UPDATE ---
                                    }))}
                                    disabled={!isManualEntry}
                                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed ${!formData.fareRules.refundable
                                            ? 'bg-red-600 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {/* --- UPDATE: Changed button text --- */}
                                    Semi-Refundable
                                    {/* --- END UPDATE --- */}
                                </button>
                            </div>
                        </div>
                    </>
                )}
                {/* --- END UPDATE --- */}

                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                    <h4 className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-3">
                        Current Fare Rules Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Cancellation Fee:</span>
                            {/* --- UPDATE: Show dynamic cancellation fee --- */}
                            <span className="font-bold text-gray-900 dark:text-white">
                                {getSelectedCurrencySymbol()} {cancellationFeeToShow}
                            </span>
                            {/* --- END UPDATE --- */}
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Change Fee:</span>
                             {/* --- UPDATE: Show dynamic change fee --- */}
                            <span className="font-bold text-gray-900 dark:text-white">
                                {getSelectedCurrencySymbol()} {changeFeeToShow}
                            </span>
                             {/* --- END UPDATE --- */}
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Refundable:</span>
                            <span className={`font-bold ${formData.fareRules.refundable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {/* --- UPDATE: Show 'Semi-Refundable' when applicable --- */}
                                {
                                    formData.fareRules.refundable 
                                        ? 'Yes' 
                                        : (isManualEntry ? 'Semi-Refundable' : 'No')
                                }
                                {/* --- END UPDATE --- */}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FareRules;