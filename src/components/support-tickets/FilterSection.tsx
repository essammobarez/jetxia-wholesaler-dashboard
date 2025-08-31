import React from 'react';
import { StatusType, CategoryType, SortType } from './types';

type HeaderSectionProps = {
  totalTickets: number;
  onCreateTicket: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

const HeaderSection: React.FC<HeaderSectionProps> = ({ totalTickets, onCreateTicket, onRefresh, isRefreshing = false }) => (
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
    {onRefresh && (
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isRefreshing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Refreshing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </>
        )}
      </button>
    )}
  </div>
);

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </span>
    <input
      type="text"
      placeholder="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-0 shadow-sm placeholder-gray-400 text-sm"
      style={{ boxShadow: '0 1px 2px 0 rgba(16, 24, 40, 0.03)' }}
    />
  </div>
);

type StatusTabsProps = {
  status: StatusType;
  onStatus: (status: StatusType) => void;
};

export const statusOptions: { value: StatusType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' }
];

const StatusTabs: React.FC<StatusTabsProps> = ({ status, onStatus }) => {
  return (
    <div className="bg-white rounded-full p-1 border border-gray-200">
      <div className="flex space-x-0.5">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatus(option.value)}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${status === option.value
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

type CategoryTabsProps = {
  category: CategoryType;
  onCategory: (category: CategoryType) => void;
};

export const categoryOptions: { value: CategoryType; label: string; icon: string }[] = [
  { value: 'all', label: 'All Categories', icon: '📋' },
  { value: 'Operation', label: 'Operation', icon: '⚙️' },
  { value: 'Technical', label: 'Technical', icon: '🔧' },
  { value: 'Finance', label: 'Finance', icon: '💰' },
  { value: 'Sales', label: 'Sales', icon: '📈' }
];

const CategoryTabs: React.FC<CategoryTabsProps> = ({ category, onCategory }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categoryOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onCategory(option.value)}
          className={`inline-flex items-center px-4 py-2 rounded-md border transition-all duration-200 text-sm font-medium ${category === option.value
              ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
        >
          <span className="mr-2 text-base">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
};

type MetricsBarProps = {
  totalTickets: number;
  sort: SortType;
  onSort: (value: SortType) => void;
};

const MetricsBar: React.FC<MetricsBarProps> = ({ totalTickets, sort, onSort }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="text-gray-600">
      {totalTickets > 1 ? `${totalTickets} Tickets` : `${totalTickets} Ticket`}
    </div>
    <div className="flex items-center space-x-1.5">
      <span className="text-gray-600">Sort by:</span>
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value as SortType)}
        className="border-0 bg-transparent outline-none focus:ring-0 text-blue-600 cursor-pointer"
      >
        <option className="text-gray-900 hover:bg-gray-100" value="Recent">
          Most Recent
        </option>
        <option className="text-gray-900 hover:bg-gray-100" value="Oldest">
          Oldest First
        </option>
      </select>
    </div>
  </div>
);

type FilterSectionProps = {
  search: string;
  onSearch: (v: string) => void;
  status: StatusType;
  onStatus: (v: StatusType) => void;
  category: CategoryType;
  onCategory: (v: CategoryType) => void;
  sort: SortType;
  onSort: (v: SortType) => void;
  totalTickets: number;
  onCreateTicket: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

const FilterSection: React.FC<FilterSectionProps> = ({
  search,
  onSearch,
  status,
  onStatus,
  category,
  onCategory,
  sort,
  onSort,
  totalTickets,
  onCreateTicket,
  onRefresh,
  isRefreshing,
}) => (
  <div className="space-y-4">
    <HeaderSection totalTickets={totalTickets} onCreateTicket={onCreateTicket} onRefresh={onRefresh} isRefreshing={isRefreshing} />
    <SearchBar value={search} onChange={onSearch} />
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <StatusTabs status={status} onStatus={onStatus} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <CategoryTabs category={category} onCategory={onCategory} />
      </div>
    </div>
    <MetricsBar totalTickets={totalTickets} sort={sort} onSort={onSort} />
  </div>
);

export default FilterSection; 