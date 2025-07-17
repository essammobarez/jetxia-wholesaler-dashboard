"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

// --- Types ---
export type PermissionKey =
  | 'Dashboard'
  | 'Booking'
  | 'Customers'
  | 'Markup'
  | 'Supplier'
  | 'Sales Person'
  | 'Payment'
  | 'Support Tickets'
  | 'Reports';
export interface Subuser {
  _id: string;
  firstName: string;
  lastName: string;
  permissions: string[];
}
interface PermissionsState {
  [key: string]: {
    expanded: boolean;
    modes: { ReadOnly: boolean; ReadWrite: boolean };
  };
}
const moduleList: PermissionKey[] = [
  'Dashboard',
  'Booking',
  'Customers',
  'Markup',
  'Supplier',
  'Sales Person',
  'Payment',
  'Support Tickets',
  'Reports',
];

export default function PermissionsPage() {
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);
  const [subusers, setSubusers] = useState<Subuser[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [perms, setPerms] = useState<PermissionsState>({});

  const loadSubusers = useCallback(() => {
    if (!wholesalerId) return;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/subuser/by-wholesaler/${wholesalerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSubusers(data.data);
      })
      .catch(err => console.error('Error fetching subusers:', err));
  }, [wholesalerId]);

  // Load wholesalerId
  useEffect(() => {
    const stored = localStorage.getItem('wholesalerId');
    if (stored) setWholesalerId(stored);
  }, []);

  // Fetch subusers when wholesalerId changes
  useEffect(() => {
    loadSubusers();
  }, [wholesalerId, loadSubusers]);

  // Initialize permissions when selecting user or subusers list changes
  useEffect(() => {
    const user = subusers.find(u => u._id === selectedId);
    const base = moduleList.reduce<PermissionsState>((acc, m) => {
      acc[m] = {
        expanded: false,
        modes: {
          ReadOnly: user?.permissions.includes(`${m}:Read`) || false,
          ReadWrite: user?.permissions.includes(`${m}:Write`) || false,
        },
      };
      return acc;
    }, {});
    setPerms(base);
  }, [selectedId, subusers]);

  const filtered = useMemo(
    () =>
      subusers.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(filter.toLowerCase())
      ),
    [filter, subusers]
  );

  const toggleExpand = (mod: PermissionKey) =>
    setPerms(prev => ({ ...prev, [mod]: { ...prev[mod], expanded: !prev[mod].expanded } }));

  const toggleMode = (mod: PermissionKey, mode: 'ReadOnly' | 'ReadWrite') =>
    setPerms(prev => ({
      ...prev,
      [mod]: {
        ...prev[mod],
        modes: { ...prev[mod].modes, [mode]: !prev[mod].modes[mode] },
      },
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    const updatedPerms = Object.entries(perms).flatMap(([mod, cfg]) => {
      const arr: string[] = [];
      if (cfg.modes.ReadOnly) arr.push(`${mod}:Read`);
      if (cfg.modes.ReadWrite) arr.push(`${mod}:Write`);
      return arr;
    });

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/subuser/assign-permissions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subuserId: selectedId, permissions: updatedPerms }),
      }
    )
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          toast.success('Permissions updated');
          // Refresh subusers/permissions state
          loadSubusers();
        } else {
          toast.error(data.message || 'Update failed');
        }
      })
      .catch(err => {
        console.error('Network error:', err);
        toast.error('Network error');
      });
  };

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit} className="flex h-full gap-6 p-6 bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="relative mb-4">
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              type="search"
              placeholder="Search users..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-10 pr-3 py-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none"
            />
          </div>
          <ul className="space-y-2 overflow-y-auto max-h-[60vh]">
            {filtered.map(u => (
              <li key={u._id}>
  <button
    type="button"
    onClick={() => setSelectedId(u._id)}
    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex justify-between items-center
      ${u._id === selectedId
        ? 'bg-purple-600 text-white'
        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
  >
    {u.firstName} {u.lastName}
    <span
      className={`text-sm font-semibold 
        ${u._id === selectedId
          ? 'text-white'
          : 'text-gray-500 dark:text-gray-400'}`}
    >
      ({u.permissions.length})
    </span>
  </button>
</li>

            ))}
          </ul>
        </aside>

        {/* Main */}
        <section className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6 overflow-auto">
          <header className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permissions</h1>
            <button
              type="submit"
              disabled={!selectedId}
              className="px-6 py-2 bg-green-500 disabled:opacity-50 text-white rounded-full hover:bg-green-600 transition"
            >Save Changes</button>
          </header>

          {!selectedId ? (
            <p className="text-gray-600 dark:text-gray-300">Select a user to manage permissions.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moduleList.map(mod => {
                const cfg = perms[mod];
                if (!cfg) return null;
                const anyActive = cfg.modes.ReadOnly || cfg.modes.ReadWrite;
                return (
                  <div key={mod} className="bg-gray-100 dark:bg-gray-700 rounded-2xl shadow">
                    <motion.button
                      type="button"
                      onClick={() => toggleExpand(mod)}
                      initial={false}
                      animate={{ backgroundColor: cfg.expanded ? '#E0E7FF' : 'transparent' }}
                      className="w-full px-4 py-3 flex justify-between items-center rounded-t-2xl"
                    >
                      <span className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                        {mod}
                        {!cfg.expanded && anyActive && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${cfg.expanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.button>

                    <AnimatePresence initial={false}>
                      {cfg.expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: 'tween' }}
                          className="px-4 py-4 space-y-4"
                        >
                          {(['ReadOnly', 'ReadWrite'] as const).map(mode => (
                            <label key={mode} className="flex justify-between items-center">
                              <span className="text-gray-700 dark:text-gray-300">{mode}</span>
                              <div
                                onClick={() => toggleMode(mod, mode)}
                                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                                  perms[mod].modes[mode] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                                    perms[mod].modes[mode] ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                                />
                              </div>
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </form>
    </>
  );
}
