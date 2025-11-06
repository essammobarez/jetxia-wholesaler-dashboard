// Pricing.tsx
import React from 'react';
import { DollarSign } from 'lucide-react';

// --- UPDATED: Interface to include commission type and value ---
interface PassengerPricing {
    price: number;
    commission: {
        type: 'percentage' | 'fixed';
        value: number;
    };
}

interface PricingProps {
    formData: {
        pricing: {
            class1: { adult: PassengerPricing; child: PassengerPricing; infant: PassengerPricing; };
            class2: { adult: PassengerPricing; child: PassengerPricing; infant: PassengerPricing; };
            class3: { adult: PassengerPricing; child: PassengerPricing; infant: PassengerPricing; };
            currency: string;
        };
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    currencies: { code: string; name: string; symbol: string; }[];
    getSelectedCurrencySymbol: () => string;
}

const Pricing: React.FC<PricingProps> = ({ formData, setFormData, currencies, getSelectedCurrencySymbol }) => {
    
    // Helper function to create a number input
    const renderPriceInput = (
        value: number,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
        placeholder: string
    ) => (
        <input
            type="number"
            // Ensure value is a number (handles potential undefined)
            value={value || 0} 
            onChange={onChange}
            onWheel={(e) => e.currentTarget.blur()}
            min="0"
            step="0.01" 
            // UPDATED: Added bg-white/70 for "blur" effect
            className="w-full px-4 py-3 text-base bg-white/70 dark:bg-gray-700/70 border-2 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition-all font-medium border-gray-200 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder={placeholder}
        />
    );

    // Helper function to render a full passenger block (Price + Commission fields)
    const renderPassengerBlock = (
        classKey: 'class1' | 'class2' | 'class3',
        passengerKey: 'adult' | 'child' | 'infant',
        label: string,
        pricePlaceholder: string
    ) => {
        // --- Safely access nested properties using optional chaining ---
        const passengerData = formData.pricing[classKey]?.[passengerKey];
        const price = passengerData?.price ?? 0;
        // --- UPDATED: Logic for new commission structure ---
        const commissionType = passengerData?.commission?.type ?? 'percentage';
        const commissionValue = passengerData?.commission?.value ?? 0;

        // --- Helper to update nested form state safely ---
        const updateCommission = (key: 'type' | 'value', value: string | number) => {
            setFormData(prev => ({
                ...prev,
                pricing: {
                    ...prev.pricing,
                    [classKey]: {
                        ...(prev.pricing[classKey] || {}), // Ensure class object exists
                        [passengerKey]: {
                            ...(prev.pricing[classKey]?.[passengerKey] || {}), // Ensure passenger object exists
                            commission: {
                                ...(prev.pricing[classKey]?.[passengerKey]?.commission || { type: 'percentage', value: 0 }), // Ensure commission object exists
                                [key]: value,
                                // If type is changed, reset value
                                ...(key === 'type' && { value: 0 }) 
                            }
                        }
                    }
                }
            }));
        };

        return (
            // UPDATED: Set background of inner block to be consistent
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {label} Price
                </label>
                {renderPriceInput(
                    price, // Use safe value
                    (e) => setFormData(prev => ({
                        ...prev,
                        pricing: {
                            ...prev.pricing,
                            [classKey]: {
                                ...(prev.pricing[classKey] || {}),
                                [passengerKey]: {
                                    ...(prev.pricing[classKey]?.[passengerKey] || {}),
                                    price: Number(e.target.value)
                                }
                            }
                        }
                    })),
                    pricePlaceholder
                )}
                
                {/* --- UPDATED LAYOUT: Commission Section --- */}
                <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Agency Commission
                    </label>
                    {/* --- UPDATED: Swapped order of select and input --- */}
                    <div className="flex gap-2">
                        {/* Commission Type Select (now on left) */}
                        <select
                            value={commissionType}
                            onChange={(e) => updateCommission('type', e.target.value)}
                            // UPDATED: Added bg-white/70 for "blur" effect
                            className="w-1/2 px-4 py-2 text-sm bg-white/70 dark:bg-gray-700/70 border-2 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition-all font-medium border-gray-200 dark:border-gray-600"
                        >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed</option>
                        </select>

                        {/* Commission Value Input (now on right, with symbol inside) */}
                        <div className="relative w-1/2">
                            <input
                                type="number"
                                value={commissionValue || 0}
                                onChange={(e) => updateCommission('value', Number(e.target.value))}
                                onWheel={(e) => e.currentTarget.blur()}
                                min="0"
                                step="1"
                                // UPDATED: Added bg-white/70 for "blur" effect
                                className="w-full px-4 py-2 pr-10 text-sm bg-white/70 dark:bg-gray-700/70 border-2 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition-all font-medium border-gray-200 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="0"
                            />
                            {/* The Symbol (absolute position) */}
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 dark:text-gray-400">
                                {commissionType === 'percentage' ? '%' : getSelectedCurrencySymbol()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        // UPDATED: Changed color theme from yellow to sky/blue
        <div className="bg-gradient-to-br from-sky-50 via-white to-sky-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-sky-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-sky-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl mr-3 shadow-md">
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
                    // UPDATED: Color theme and blur effect
                    className="w-full md:w-1/2 px-4 py-3 bg-white/70 dark:bg-gray-700/70 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition-all text-base font-medium"
                >
                    {currencies.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                            {curr.code} - {curr.name} ({curr.symbol})
                        </option>
                    ))}
                </select>
            </div>
            
            {/* --- UPDATED: Changed color theme for columns --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* --- Class 1 (Light) --- */}
                <div className="space-y-4 p-4 rounded-xl bg-sky-50/50 dark:bg-gray-800/40 border border-sky-200/50 dark:border-gray-700/50">
                    <h4 className="block text-base font-semibold text-gray-900 dark:text-white bg-sky-200/80 dark:bg-sky-800/40 p-3 rounded-lg">
                        Class 1 * {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                    </h4>
                    {renderPassengerBlock('class1', 'adult', 'Adult', 'e.g., 500')}
                    {renderPassengerBlock('class1', 'child', 'Children', 'e.g., 400')}
                    {renderPassengerBlock('class1', 'infant', 'Infant', 'e.g., 100')}
                </div>

                {/* --- Class 2 (Little Dark) --- */}
                <div className="space-y-4 p-4 rounded-xl bg-sky-100/50 dark:bg-gray-800/60 border border-sky-200/50 dark:border-gray-700/50">
                    <h4 className="block text-base font-semibold text-gray-900 dark:text-white bg-sky-300/80 dark:bg-sky-800/60 p-3 rounded-lg">
                        Class 2 {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                    </h4>
                    {renderPassengerBlock('class2', 'adult', 'Adult', 'e.g., 1250')}
                    {renderPassengerBlock('class2', 'child', 'Children', 'e.g., 1000')}
                    {renderPassengerBlock('class2', 'infant', 'Infant', 'e.g., 200')}
                </div>

                {/* --- Class 3 (More Dark) --- */}
                <div className="space-y-4 p-4 rounded-xl bg-sky-200/50 dark:bg-gray-800/80 border border-sky-300/50 dark:border-gray-700/50">
                    <h4 className="block text-base font-semibold text-gray-900 dark:text-white bg-sky-400/80 dark:bg-sky-800/80 p-3 rounded-lg">
                        Class 3 {getSelectedCurrencySymbol() && `(${getSelectedCurrencySymbol()})`}
                    </h4>
                    {renderPassengerBlock('class3', 'adult', 'Adult', 'e.g., 2000')}
                    {renderPassengerBlock('class3', 'child', 'Children', 'e.g., 1800')}
                    {renderPassengerBlock('class3', 'infant', 'Infant', 'e.g., 300')}
                </div>

            </div>
        </div>
    );
};

export default Pricing;