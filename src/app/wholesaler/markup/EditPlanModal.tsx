import React, { useState, useEffect } from 'react';
import { PlanAPI } from './PlanListAdvanced';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPlan: PlanAPI) => void;
  plan: PlanAPI | null;
}

const EditPlanModal: React.FC<EditPlanModalProps> = ({ isOpen, onClose, onSave, plan }) => {
  const [formData, setFormData] = useState<Partial<PlanAPI>>({
    name: '',
    service: '',
    isActive: true,
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        service: plan.service,
        isActive: plan.isActive,
      });
    }
  }, [plan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plan) {
      onSave({ ...plan, ...formData });
    }
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Edit Plan: {plan.name}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Plan Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Plan Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* Service */}
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Service
              </label>
              <input
                type="text"
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            
            {/* Status */}
            <div className="flex items-center">
                <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Active
                </label>
            </div>

          </div>
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlanModal;