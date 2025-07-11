import React, { useState, useEffect } from 'react';

export default function ManageSupplier() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const wholesalerId = '6857c852462871f5be84204c';

    const fetchAllSuppliers = async () => {
      setLoading(true);
      setError('');
      try {
        const [offlineResponse, onlineResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/offline-provider/by-wholesaler/${wholesalerId}`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/provider`)
        ]);

        let combinedSuppliers: any[] = [];
        let hasError = false;
        let errorMessage = '';

        // Process offline suppliers
        if (offlineResponse.ok) {
          const offlineData = await offlineResponse.json();
          const taggedOfflineSuppliers = offlineData.map((supplier: any) => ({
            ...supplier,
            type: 'Offline'
          }));
          combinedSuppliers = combinedSuppliers.concat(taggedOfflineSuppliers);
        } else {
          const errorData = await offlineResponse.json();
          errorMessage += `Failed to load offline suppliers: ${errorData.message || 'Unknown error'}. `;
          hasError = true;
        }

        // Process online suppliers
        if (onlineResponse.ok) {
          const onlineData = await onlineResponse.json();
          if (onlineData.success) {
            const taggedOnlineSuppliers = onlineData.data.map((supplier: any) => ({
              ...supplier,
              type: 'Online'
            }));
            combinedSuppliers = combinedSuppliers.concat(taggedOnlineSuppliers);
          } else {
            errorMessage += `Failed to load online suppliers: ${onlineData.message || 'Unknown error'}. `;
            hasError = true;
          }
        } else {
          const errorData = await onlineResponse.json();
          errorMessage += `Failed to load online suppliers: ${errorData.message || 'Unknown error'}. `;
          hasError = true;
        }

        setSuppliers(combinedSuppliers);
        if (hasError) {
          setError(errorMessage.trim());
        }

      } catch (err) {
        setError('Failed to fetch supplier data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllSuppliers();
  }, []);

  // Helper function to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    // Changed max-w-4xl to max-w-7xl for a wider container
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8 text-center">Manage Suppliers</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div className="text-center text-gray-600 dark:text-gray-300">Loading suppliers...</div>
      ) : (
        <table className="min-w-full mt-4 table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-300 font-medium">Supplier Name</th>
              <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-300 font-medium">Notes</th>
              <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-300 font-medium">Type</th>
              <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-300 font-medium">Created At</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">No suppliers found</td>
              </tr>
            ) : (
              suppliers.map((supplier: any) => (
                <tr key={supplier._id} className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-2 px-4 text-gray-800 dark:text-gray-200">{supplier.name}</td>
                  <td className="py-2 px-4 text-gray-800 dark:text-gray-200">{supplier.notes}</td>
                  <td className="py-2 px-4 text-gray-800 dark:text-gray-200">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      supplier.type === 'Online' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    }`}>
                      {supplier.type}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-gray-800 dark:text-gray-200">{formatDate(supplier.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}