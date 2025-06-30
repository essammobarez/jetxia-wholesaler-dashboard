import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateOfflineSupplier() {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wholesaler, setWholesaler] = useState<string>('');

  useEffect(() => {
    // Extract wholesalerId from localStorage or decoded JWT (assuming it's stored there)
    const storedWholesalerId = localStorage.getItem('wholesalerId');
    if (storedWholesalerId) {
      setWholesaler(storedWholesalerId);  // Automatically set wholesaler ID from localStorage or JWT
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wholesaler) {
      setError('Wholesaler ID is missing.');
      toast.error('Wholesaler ID is missing.');
      return;
    }

    // Set isActive to true by default on the backend
    const supplierData = {
      name,
      isActive: true, // Set isActive as true directly from the frontend
      notes,
      wholesaler,
    };

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/offline-provider/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Supplier created successfully!');
        setName('');
        setNotes('');
      } else {
        toast.error(data.message || 'Something went wrong, please try again.');
        setError(data.message || 'Something went wrong, please try again.');
      }
    } catch (err) {
      toast.error('Network error, please try again.');
      setError('Network error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Create Offline Supplier</h2>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            placeholder="Enter supplier name"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="mt-1 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            placeholder="Enter notes (optional)"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Save Supplier'}
          </button>
        </div>
      </form>

      {/* Toast Container - Position changed to top-right */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}
