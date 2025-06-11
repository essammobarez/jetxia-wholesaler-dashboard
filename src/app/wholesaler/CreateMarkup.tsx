'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Promotion from './promotion';
import PlanList from './PlanList';

export default function CreateMarkup() {
  // State for form fields
  const [name, setName] = useState<string>('');
  const [service, setService] = useState<'hotel' | 'flight' | 'car'>('hotel');
  // State to control rendering of the promotion management component
  const [isManagingPromotion, setIsManagingPromotion] = useState<boolean>(false);
  // State to control modal visibility
  const [showModal, setShowModal] = useState<boolean>(false);
  // State to hold the wholesalerId fetched from localStorage
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // Load wholesalerId from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('wholesalerId');
    setWholesalerId(stored);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // After create, close modal and show promotion management
    setShowModal(false);
    setIsManagingPromotion(true);
  };

  // Callback to return to the list view
  const handleCancelPromotion = () => {
    setIsManagingPromotion(false);
    setName('');
    setService('hotel');
  };

  // When managing promotion, render Promotion component
  if (isManagingPromotion) {
    return (
      <div className="p-4">
        <Promotion
          name={name}
          service={service}
          createdBy={wholesalerId ?? ''}
          onCancel={handleCancelPromotion}
        />
      </div>
    );
  }

  // Default view: full-width container
  return (
    <>
      <div className="w-full px-4 mt-6">
        {/* Button aligned right, intrinsic width */}
        <div className="flex justify-end mr-8 mb-4">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2  bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Add Plan
          </button>
        </div>

        {/* Render PlanList full-width */}
        <div className="w-full">
          <PlanList />
        </div>
      </div>

      {/* Modal overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl mx-4 p-6 rounded-lg shadow-lg relative">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              aria-label="Close modal"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Create Markup
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="markupName" className="block text-gray-700 dark:text-gray-200">
                  Markup Name
                </label>
                <input
                  id="markupName"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label htmlFor="service" className="block text-gray-700 dark:text-gray-200">
                  Service
                </label>
                <select
                  id="service"
                  value={service}
                  onChange={e => {
                    const val = e.target.value as 'hotel' | 'flight' | 'car';
                    setService(val);
                  }}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="hotel">Hotel</option>
                  <option value="flight">Flight</option>
                  <option value="car">Car</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
