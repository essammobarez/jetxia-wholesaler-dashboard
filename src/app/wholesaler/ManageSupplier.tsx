import React, { useState, useEffect } from 'react';

export default function ManageSupplier() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Static wholesaler ID for now
    const wholesalerId = '6857c852462871f5be84204c';

    // Fetch supplier data from the API
    const fetchSuppliers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/offline-provider/by-wholesaler/${wholesalerId}`);
        const data = await response.json();

        if (response.ok) {
          setSuppliers(data); // Assuming the API returns an array of suppliers
        } else {
          setError(data.message || 'Failed to load suppliers');
        }
      } catch (err) {
        setError('Failed to fetch supplier data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Helper function to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // You can customize the format as needed
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Manage Suppliers</h2>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {loading ? (
        <div className="text-center text-gray-600 dark:text-gray-300">Loading suppliers...</div>
      ) : (
        <table className="min-w-full mt-4 table-auto">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="py-2 px-4 text-left">Supplier Name</th>
              <th className="py-2 px-4 text-left">Notes</th>
              <th className="py-2 px-4 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 px-4 text-center text-gray-500">No suppliers found</td>
              </tr>
            ) : (
              suppliers.map((supplier: any) => (
                <tr key={supplier._id} className="border-t border-gray-200 dark:border-gray-600">
                  <td className="py-2 px-4">{supplier.name}</td>
                  <td className="py-2 px-4">{supplier.notes}</td>
                  <td className="py-2 px-4">{formatDate(supplier.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
