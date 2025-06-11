'use client';

import React, { useState } from 'react';

export default function AssignMarkup() {
  // Placeholder static lists
  const agencies = [
    { id: 'a1', name: 'Agency One' },
    { id: 'a2', name: 'Agency Two' },
    { id: 'a3', name: 'Agency Three' },
  ];
  const markups = [
    { id: 'm1', name: 'Markup A' },
    { id: 'm2', name: 'Markup B' },
    { id: 'm3', name: 'Markup C' },
  ];

  const [selectedAgency, setSelectedAgency] = useState<string>('');
  const [selectedMarkup, setSelectedMarkup] = useState<string>('');

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Assigning markup', selectedMarkup, 'to agency', selectedAgency);
    alert(`Assigned markup "${selectedMarkup}" to agency "${selectedAgency}" (static demo).`);
    setSelectedAgency('');
    setSelectedMarkup('');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Assign Markup to Agency</h2>
      <form onSubmit={handleAssign} className="space-y-4">
        <div>
          <label htmlFor="agencySelect" className="block text-gray-700 dark:text-gray-200">
            Select Agency
          </label>
          <select
            id="agencySelect"
            value={selectedAgency}
            onChange={e => setSelectedAgency(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="" disabled>
              -- Choose an agency --
            </option>
            {agencies.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="markupSelect" className="block text-gray-700 dark:text-gray-200">
            Select Markup
          </label>
          <select
            id="markupSelect"
            value={selectedMarkup}
            onChange={e => setSelectedMarkup(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="" disabled>
              -- Choose a markup --
            </option>
            {markups.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
        >
          Assign
        </button>
      </form>
    </div>
);
}
