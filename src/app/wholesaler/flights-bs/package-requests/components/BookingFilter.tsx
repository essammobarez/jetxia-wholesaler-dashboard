'use client';

import React from 'react';
import { Filter, Search, Info, AlertTriangle, X } from 'lucide-react';

interface BookingFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterPriority: string;
  setFilterPriority: (value: string) => void;
}

const BookingFilter: React.FC<BookingFilterProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
}) => {
  return (
    <div className="card-modern p-6 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Search & Filters
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600 dark:text-purple-400" />
          <input
            type="text"
            placeholder="Search by customer, email, ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base font-medium bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900/30 shadow-sm hover:shadow-md transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Info className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600 dark:text-blue-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/30 shadow-sm hover:shadow-md cursor-pointer transition-all"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600 dark:text-red-400" />
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base font-semibold bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 rounded-xl focus:border-red-500 dark:focus:border-red-400 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900/30 shadow-sm hover:shadow-md cursor-pointer transition-all"
          >
            <option value="all">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all') && (
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t-2 border-purple-200 dark:border-purple-700">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Active Filters:
          </span>
          {searchTerm && (
            <span className="px-3 py-1 bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 rounded-full text-sm font-semibold flex items-center">
              Search: {searchTerm}
              <X
                className="w-3 h-3 ml-2 cursor-pointer"
                onClick={() => setSearchTerm('')}
              />
            </span>
          )}
          {filterStatus !== 'all' && (
            <span className="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 rounded-full text-sm font-semibold flex items-center">
              Status: {filterStatus}
              <X
                className="w-3 h-3 ml-2 cursor-pointer"
                onClick={() => setFilterStatus('all')}
              />
            </span>
          )}
          {filterPriority !== 'all' && (
            <span className="px-3 py-1 bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 rounded-full text-sm font-semibold flex items-center">
              Priority: {filterPriority}
              <X
                className="w-3 h-3 ml-2 cursor-pointer"
                onClick={() => setFilterPriority('all')}
              />
            </span>
          )}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterPriority('all');
            }}
            className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingFilter;