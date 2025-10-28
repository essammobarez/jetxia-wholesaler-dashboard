// Status.tsx
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface StatusProps {
    formData: {
        status: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Status: React.FC<StatusProps> = ({ formData, setFormData }) => {
    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl mr-3 shadow-md">
                    <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Status
                </h3>
            </div>
            <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full md:w-1/2 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-gray-500 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-900 transition-all text-base font-medium"
            >
                <option value="Available">Available</option>
                <option value="Limited">Limited</option>
                <option value="Sold Out">Sold Out</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
    );
};

export default Status;