'use client';

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { X, ChevronDown, UserCheck, Loader2 } from 'lucide-react';

interface SalesUser {
  _id: string;
  username: string;
}

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencyId: string | null;
  agencyName: string | null;
}

const AssignModal: React.FC<AssignModalProps> = ({ isOpen, onClose, agencyId, agencyName }) => {
  const [salesUsers, setSalesUsers] = useState<SalesUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSalesUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken") || document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1];
        if (!token) throw new Error("Authorization failed. Please log in again.");

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sales/list`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch sales users.');
        
        setSalesUsers(result.data);
        if (result.data.length > 0) {
          setSelectedUserId('');
        } else {
          toast.error('No sales users found to assign.');
        }
      } catch (error: any) {
        toast.error(error.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesUsers();
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast.error("Please select a sales user.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Assigning agency...");

    try {
      const token = localStorage.getItem("authToken") || document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1];
      if (!token) throw new Error("Authorization failed.");
      
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/sales/${agencyId}/assign-sales`;
      const payload = { salespersonId: selectedUserId };
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to assign sales person.');
      }

      toast.update(toastId, {
        render: result.message || "Agency assigned successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      toast.update(toastId, {
        render: error.message || "An error occurred.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      if (document.body.contains(document.getElementById('sales-user-select'))) {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10  flex items-center justify-center z-50 p-4">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in-up border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Close modal"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mb-3">
            <UserCheck className="w-6 h-6 text-blue-600"/>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Assign Agency</h3>
          <p className="text-gray-500 text-sm mt-1">Select a sales representative</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
          <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Agency to assign</p>
          <h4 className="font-semibold text-gray-800 truncate">{agencyName || 'Unknown Agency'}</h4>
          <p className="text-xs text-gray-500 mt-1">ID: {agencyId || 'N/A'}</p>
        </div>

        <div className="space-y-2 mb-6">
          <label htmlFor="sales-user-select" className="block text-sm font-medium text-gray-700">
            Sales Representative
          </label>
          
          {loading ? (
            <div className="flex items-center space-x-2 text-gray-500 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading sales representatives...</span>
            </div>
          ) : (
            <div className="relative">
              <select
                id="sales-user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className={`appearance-none w-full bg-white border ${
                  selectedUserId ? 'border-gray-300 focus:border-blue-500' : 'border-blue-300'
                } hover:border-blue-400 px-4 py-3 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  !selectedUserId ? 'text-gray-400' : 'text-gray-800'
                }`}
                disabled={salesUsers.length === 0 || isSubmitting}
              >
                <option value="" disabled>
                  {salesUsers.length > 0 
                    ? 'Select a sales representative' 
                    : 'No representatives available'}
                </option>
                {salesUsers.length > 0 ? (
                  salesUsers.map((user) => (
                    <option key={user._id} value={user._id} className="text-gray-800">
                      {user.username}
                    </option>
                  ))
                ) : null}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <ChevronDown size={18} />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all disabled:opacity-70 border border-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={!selectedUserId || loading || salesUsers.length === 0 || isSubmitting}
            className={`flex-1 px-4 py-3 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all flex items-center justify-center ${
              selectedUserId && !isSubmitting
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Assigning...
              </>
            ) : (
              'Assign Agency'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignModal;