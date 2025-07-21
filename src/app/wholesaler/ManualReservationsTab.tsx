// pages/manual-reservation.tsx

import React, { ReactNode } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

type SectionProps = {
  title: string;
  children: ReactNode;
};

const FormSection: React.FC<SectionProps> = ({ title, children }) => (
  <div className="bg-white shadow-md rounded-xl p-8">
    <h2 className="text-xl font-semibold mb-6">{title}</h2>
    <div className="space-y-6">{children}</div>
  </div>
);

const ManualReservation: NextPage = () => {
  return (
    <>
      <Head>
        <title>Manual reservations hotel</title>
      </Head>
     <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center md:text-left">
  Manual Reservations
</h1>

      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto flex space-x-8 px-4">
          {/* Sidebar */}
         


          {/* Main */}
          <main className="flex-1 space-y-8">
            {/* 1. Reseller & Agent */}
            <FormSection title="Reseller & Agent">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Reseller', placeholder: 'Enter reseller name' },
                  { label: 'Supervisor', placeholder: 'Enter supervisor name' },
                  { label: 'Agent', placeholder: 'Enter agent name' },
                ].map(({ label, placeholder }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </FormSection>

            {/* 2. Destination */}
            <FormSection title="Destination">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Destination', type: 'select', placeholder: 'Enter reseller name' },
                  { label: 'Hotel', type: 'select', placeholder: 'Enter supervisor name' },
                ].map(({ label, type, placeholder }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    {type === 'select' ? (
                      <select className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                        <option>{placeholder}</option>
                      </select>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-6 items-end">
                {[
                  { label: 'Check in', type: 'date' },
                  { label: 'Check out', type: 'date' },
                  { label: 'Night', type: 'number', defaultValue: 0 },
                ].map(({ label, type, defaultValue }) => (
                  <div key={label} className={label === 'Night' ? 'w-24' : 'flex-1'}>
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <input
                      type={type}
                      defaultValue={defaultValue as any}
                      className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </FormSection>

            {/* 3. External Details */}
            <FormSection title="External Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'External ID', type: 'select', placeholder: 'Enter reseller name' },
                  { label: 'Hotel', type: 'select', placeholder: 'Enter supervisor name' },
                ].map(({ label, type, placeholder }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <select className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                      <option>{placeholder}</option>
                    </select>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-gray-700">Check out</label>
                    <input
                      type="date"
                      className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </FormSection>

            {/* 4. Travellers */}
            <FormSection title="Travellers">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nationality</label>
                  <select className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                    <option>Enter reseller name</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Board</label>
                  <input
                    type="text"
                    placeholder="Enter agent name"
                    className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Name</label>
                  <select className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                    <option>Enter supervisor name</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Type</label>
                  <input
                    type="text"
                    placeholder="Enter agent name"
                    className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="text"
                    placeholder="Enter agent name"
                    className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <button className="h-11 px-5 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition">
                  + Add Room
                </button>
              </div>
            </FormSection>

            {/* 5. Price Information */}
            <FormSection title="Price Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier Price</label>
                  <select className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                    <option>Enter reseller name</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Markup</label>
                  <select className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                    <option>Enter supervisor name</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Commission</label>
                  <input
                    type="text"
                    placeholder="Enter agent name"
                    className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total price</label>
                  <input
                    type="text"
                    placeholder="Enter agent name"
                    className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <button className="h-11 px-5 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition">
                  Suggest Price
                </button>
              </div>
            </FormSection>

            {/* 6. Rate */}
            <FormSection title="Rate">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Name', placeholder: 'Enter reseller name' },
                  { label: 'Description', placeholder: 'Enter supervisor name' },
                ].map(({ label, placeholder }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <select className="mt-2 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                      <option>{placeholder}</option>
                    </select>
                  </div>
                ))}
              </div>
            </FormSection>

            {/* 7. Cancellation policy */}
            <FormSection title="Cancellation policy">
              <div className="flex flex-wrap gap-6">
                <select className="flex-1 h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                  <option>Standard policy</option>
                </select>
                <button className="h-11 px-5 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition">
                  + Add New Cancellation policy
                </button>
              </div>
            </FormSection>

            {/* 8. Remarks */}
            <FormSection title="Remarks">
              <div className="space-y-6">
                <div className="flex gap-6">
                  <select className="flex-1 h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                    <option>Promotion</option>
                  </select>
                  <button className="h-11 px-5 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition">
                    + Add New Remark
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Backoffice Remarks</h3>
                  <div className="flex gap-6">
                    <select className="flex-1 h-11 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                      <option>Promotion</option>
                    </select>
                    <button className="h-11 px-5 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition">
                      + Add New Remark
                    </button>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Footer */}
            <div className="flex justify-end items-center space-x-4 pt-6">
              <button className="h-12 px-6 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition">
                Reset
              </button>
              <button className="h-12 px-6 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
                Create Reservation
              </button>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default ManualReservation;
