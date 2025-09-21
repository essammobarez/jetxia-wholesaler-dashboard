'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import type { SubAgency } from './SubAgencyModal';

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: SubAgency | null;
  onUpdate: (updatedAgent: SubAgency) => void;
  agencyId?: string;
}

export const EditAgentModal: React.FC<EditAgentModalProps> = ({
  isOpen,
  onClose,
  agent,
  onUpdate,
  agencyId,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

  useEffect(() => {
    if (agent) {
      setFormData({
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
      });
    }
  }, [agent]);

  if (!isOpen || !agent) return null;
  
  const getAuthToken = () => {
    return document.cookie
           .split('; ')
           .find(r => r.startsWith('authToken='))
           ?.split('=')[1] || localStorage.getItem('authToken');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyId) {
      toast.error("Agency ID not found. Cannot update agent.");
      return;
    }
    
    setIsSaving(true);
    const token = getAuthToken();
    if (!token) {
        toast.error("Authorization failed. Please log in again.");
        setIsSaving(false);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/sub-agency/update/${agent._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                agencyId,
                ...formData
            })
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to update agent details.");
        }
        
        onUpdate({ ...agent, ...formData });
        toast.success("Agent details updated successfully!");
        onClose();

    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">Edit Agent Details</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </header>

          <main className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </main>

          <footer className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};