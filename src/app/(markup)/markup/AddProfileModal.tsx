// components/AddProfileModal.tsx
'use client';
import React, { FC, useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ProfileInput {
  name: string;
  type: string;
  service: string;
  market: string;
  action: string;
}

interface AddProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const AddProfileModal: FC<AddProfileModalProps> = ({
  open,
  onClose,
}) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [service, setService] = useState('');
  const [market, setMarket] = useState('');
  const [action, setAction] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // build query string
    const params = new URLSearchParams({
      name,
      type,
      service,
      market,
      action,
    });
    // navigate to promotion page
    router.push(`/promotion?${params.toString()}`);
    // reset & close
    setName(''); setType(''); setService(''); setMarket(''); setAction('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center px-2 py-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-[95%] sm:max-w-xl md:max-w-2xl p-4 sm:p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-semibold mb-6">Add Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              type="text"
              placeholder="Enter name"
              className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={type}
              onChange={e => setType(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              <option value="Commission">Commission</option>
              <option value="Markup">Markup</option>
            </select>
          </div>
          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Service &amp; context <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={service}
              onChange={e => setService(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select service &amp; context</option>
              <option value="Activity">Activity</option>
              <option value="Hotel">Hotel</option>
              <option value="Flight">Flight</option>
            </select>
          </div>
          {/* Market */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Market 
            </label>
            <input
              
              value={market}
              onChange={e => setMarket(e.target.value)}
              type="text"
              placeholder="e.g. markup, hotel"
              className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Action Code */}
          <div>
            <label className="block text-sm font-medium text-gray-800">Code</label>
            <input
              value={action}
              onChange={e => setAction(e.target.value)}
              type="text"
              placeholder="Action code"
              className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Footer Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-blue-600 rounded text-blue-600 hover:bg-blue-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProfileModal;
