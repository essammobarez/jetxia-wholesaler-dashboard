'use client';

import React, { useState, useEffect, useMemo } from 'react';

const PaymentReport = () => {
  const [bookings, setBookings] = useState([]);
  const [wholesalerId, setWholesalerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to retrieve wholesalerId from local storage
  useEffect(() => {
    const storedId = localStorage.getItem('wholesalerId');
    if (storedId) {
      setWholesalerId(storedId);
    } else {
      setError('Wholesaler ID not found in local storage.');
      setLoading(false);
    }
  }, []);

  // Effect to fetch booking data when wholesalerId is available
  useEffect(() => {
    if (!wholesalerId) return;

    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/wholesaler/${wholesalerId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError(err.message);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [wholesalerId]);

  // Calculate totals using useMemo for performance
  const reportSummary = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        const netValue = booking.rooms?.[0]?.cancellationPolicy?.policies?.[0]?.charge?.components?.net?.value || 0;
        acc.totalNet += netValue;
        return acc;
      },
      { totalNet: 0 }
    );
  }, [bookings]);


  if (loading) {
    return (
      <div className="card-modern p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading payment report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-modern p-6 text-center bg-red-50 dark:bg-red-900/20">
        <h3 className="font-semibold text-red-700 dark:text-red-400">An Error Occurred</h3>
        <p className="mt-2 text-red-600 dark:text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="card-modern animate-fade-scale overflow-x-hidden">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Supplier Payment Report
        </h2>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-2 gap-4 p-6">
          <div className="text-center md:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{bookings.length}</p>
          </div>
          <div className="text-center md:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Net</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">${reportSummary.totalNet.toFixed(2)}</p>
          </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-600 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">SL</th>
              <th scope="col" className="px-6 py-3">Agency</th>
              <th scope="col" className="px-6 py-3">Check-in Date</th>
              <th scope="col" className="px-6 py-3 text-right">Net Price</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {bookings.map((booking, index) => {
               const netPrice = booking.rooms?.[0]?.cancellationPolicy?.policies?.[0]?.charge?.components?.net?.value || 0;

               return (
                <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.agency?.agencyName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(booking.serviceDates?.startDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-gray-900 dark:text-white">${netPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              )}
            )}
            {bookings.length === 0 && (
                <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-500 dark:text-gray-400">
                        No booking records found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentReport;