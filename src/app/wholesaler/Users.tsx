'use client';

import React, { useEffect, useState, useCallback } from 'react';

// A more detailed User interface based on the API response
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  createdAt: string; // Used for the "Joined On" date
}

// Initial state for the new user form for easy resetting
const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

export default function Users() {
  // Component State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // Modal and Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  // 1. Get wholesalerId from localStorage on initial render
  useEffect(() => {
    const storedId = localStorage.getItem('wholesalerId');
    if (storedId) {
      setWholesalerId(storedId);
    } else {
      console.error('Wholesaler ID not found in localStorage.');
      setError('Could not identify the wholesaler. Please log in again.');
      setLoading(false);
    }
  }, []);

  // 2. Reusable data fetching function
  const fetchUsers = useCallback(async () => {
    if (!wholesalerId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/subuser/by-wholesaler/${wholesalerId}`
      );

      if (!res.ok) {
        throw new Error('Failed to fetch user data.');
      }

      const response = await res.json();

      const mappedUsers: User[] = (response.data || []).map((u: any) => ({
        id: u._id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.role,
        permissions: u.permissions || [],
        createdAt: u.createdAt,
      }));

      setUsers(mappedUsers);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [wholesalerId]);

  // 3. Fetch users when the component mounts or wholesalerId is updated
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- Modal and Form Handlers ---

  const handleOpenModal = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(initialFormState);
    setError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wholesalerId) {
      setError('Wholesaler ID is missing. Cannot submit.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/subuser`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            wholesaler: wholesalerId,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create moderator.');
      }

      handleCloseModal();
      await fetchUsers();
    } catch (err: any) {
      console.error('Failed to add moderator:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderUserDetails = (user: User) => (
    <>
      {/* Name */}
      <div className="flex justify-between items-center py-2">
        <p className="text-sm font-medium text-gray-500">Name</p>
        <p className="text-sm font-semibold text-gray-900 text-right">{user.name}</p>
      </div>
      {/* Email */}
      <div className="flex justify-between items-center py-2">
        <p className="text-sm font-medium text-gray-500">Email</p>
        <p className="text-sm text-gray-600 text-right truncate">{user.email}</p>
      </div>
      {/* Role */}
      <div className="flex justify-between items-center py-2">
        <p className="text-sm font-medium text-gray-500">Role</p>
        <span className="px-3 py-1 text-xs font-semibold leading-5 rounded-full bg-green-100 text-green-800">
          SubUser
        </span>
      </div>
      {/* Joined On */}
      <div className="flex justify-between items-center py-2">
        <p className="text-sm font-medium text-gray-500">Joined On</p>
        <p className="text-sm text-gray-500 text-right">
          {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>
    </>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-left">
            Manage Users
          </h1>
          <button
            onClick={handleOpenModal}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            + Add Moderator
          </button>
        </div>

        {/* User List Section */}
        <div>
          {/* Mobile View: List of Cards (Visible on small screens) */}
          <div className="lg:hidden space-y-4">
            {loading ? (
              <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500 font-medium">No users found.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click "Add Moderator" to get started.
                </p>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 divide-y divide-gray-100">
                  {renderUserDetails(user)}
                </div>
              ))
            )}
          </div>

          {/* Desktop View: Table (Visible on large screens) */}
          <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Joined On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 px-6">
                      <p className="text-gray-500">Loading users...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 px-6">
                      <p className="text-gray-500 font-medium">No users found.</p>
                      <p className="text-sm text-gray-400 mt-1">Click "Add Moderator" to get started.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          SubUser
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Moderator</h3>
                {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                      <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleFormChange} required placeholder="Enter first name" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                     <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                      <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleFormChange} required placeholder="Enter last name" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleFormChange} required placeholder="name@company.com" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                   <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input type="password" name="password" id="password" value={formData.password} onChange={handleFormChange} required placeholder="••••••••" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                <button type="button" onClick={handleCloseModal} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}