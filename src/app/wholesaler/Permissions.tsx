"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaChevronDown } from 'react-icons/fa';
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
  
  // State to handle mobile view for user list
  const [isUserListOpen, setIsUserListOpen] = useState(false);


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

  const selectedUserName = useMemo(() => {
    const user = subusers.find(u => u._id === selectedId);
    return user ? `${user.firstName} ${user.lastName}` : 'Select a User';
  }, [selectedId, subusers]);


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

  const handleSelectUser = (id: string) => {
    setSelectedId(id);
    setIsUserListOpen(false); // Close dropdown on selection
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      toast.error('Please select a user first.');
      return;
    };

    const updatedPerms = Object.entries(perms).flatMap(([mod, cfg]) => {
      const arr: string[] = [];
      if (cfg.modes.ReadOnly) arr.push(`${mod}:Read`);
      if (cfg.modes.ReadWrite) arr.push(`${mod}:Write`);
      return arr;
    });
    
    const promise = fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/subuser/assign-permissions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subuserId: selectedId, permissions: updatedPerms }),
      }
    ).then(res => {
        if (!res.ok) throw new Error('Update failed');
        return res.json();
    }).then(data => {
        if (data.success) {
          loadSubusers(); // Refresh permissions count
          return 'Permissions updated successfully!';
        } else {
          throw new Error(data.message || 'Update failed');
        }
    });

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: (message) => message,
      error: (err) => err.message,
    });
  };

  return (
    <>
      <Toaster position="top-right" />
      {/* On mobile, layout is flex-col. On lg+, it's flex-row */}
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row h-full gap-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
        
        {/* --- Sidebar (Desktop) --- */}
        <aside className="hidden lg:block w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="relative mb-4">
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              type="search"
              placeholder="Search users..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-10 pr-3 py-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <ul className="space-y-2 overflow-y-auto max-h-[calc(100vh-12rem)]">
            {filtered.map(u => (
              <li key={u._id}>
                <button
                  type="button"
                  onClick={() => handleSelectUser(u._id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex justify-between items-center
                  ${u._id === selectedId
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                >
                  <span className="truncate">{u.firstName} {u.lastName}</span>
                  <span
                    className={`text-sm font-semibold px-2 py-0.5 rounded-full
                    ${u._id === selectedId
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}
                  >
                    {u.permissions.length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* --- User Dropdown (Mobile) --- */}
        <div className="relative lg:hidden">
            <button
                type="button"
                onClick={() => setIsUserListOpen(!isUserListOpen)}
                className="w-full flex items-center justify-between text-left px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-gray-800 dark:text-gray-200"
            >
                <span className="font-semibold">{selectedUserName}</span>
                <FaChevronDown className={`transition-transform duration-200 ${isUserListOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isUserListOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg z-10 p-2"
                    >
                        <div className="relative p-2">
                            <FaSearch className="absolute top-5 left-5 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search users..."
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                className="pl-10 pr-3 py-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none"
                            />
                        </div>
                        <ul className="space-y-1 overflow-y-auto max-h-60 p-2">
                            {filtered.map(u => (
                                <li key={u._id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectUser(u._id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg ${u._id === selectedId ? 'bg-purple-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        {u.firstName} {u.lastName}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>


        {/* --- Main Content --- */}
        <section className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 space-y-6 overflow-auto">
          {/* Header stacks on mobile */}
          <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permissions</h1>
            <button
              type="submit"
              disabled={!selectedId}
              className="w-full sm:w-auto px-6 py-2 bg-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
                Save Changes
            </button>
          </header>

          {!selectedId ? (
            <div className="flex items-center justify-center h-full min-h-[40vh]">
                <p className="text-gray-600 dark:text-gray-300 text-center">
                    Please select a user to manage their permissions.
                </p>
            </div>
          ) : (
            // Responsive grid for permission cards
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {moduleList.map(mod => {
                const cfg = perms[mod];
                if (!cfg) return null;
                const anyActive = cfg.modes.ReadOnly || cfg.modes.ReadWrite;
                return (
                  <div key={mod} className="bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleExpand(mod)}
                      className={`w-full px-4 py-3 flex justify-between items-center transition-colors
                        ${cfg.expanded ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''}`}
                    >
                      <span className="flex items-center gap-3 font-semibold text-gray-800 dark:text-gray-100">
                        {mod}
                        {!cfg.expanded && anyActive && <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />}
                      </span>
                      <FaChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${cfg.expanded ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {cfg.expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: 'tween', duration: 0.2 }}
                          className="px-4 pb-4 pt-2 space-y-4 border-t border-gray-200 dark:border-gray-600"
                        >
                          {(['ReadOnly', 'ReadWrite'] as const).map(mode => (
                            <label key={mode} className="flex justify-between items-center cursor-pointer">
                              <span className="text-gray-700 dark:text-gray-300">{mode === 'ReadOnly' ? 'Read Only' : 'Read & Write'}</span>
                              <div
                                onClick={() => toggleMode(mod, mode)}
                                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                                  perms[mod].modes[mode] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
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