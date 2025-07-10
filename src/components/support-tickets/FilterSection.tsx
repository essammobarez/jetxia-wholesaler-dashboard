import React from 'react';
import { StatusType, SortType } from './types';

type HeaderSectionProps = {
  totalTickets: number;
  onCreateTicket: () => void;
};

const HeaderSection: React.FC<HeaderSectionProps> = ({ totalTickets, onCreateTicket }) => (
  <div className="flex items-center justify-start">
    <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
    {/* <button
      className="flex items-center px-3 py-1.5 border-2 border-blue-500 hover:bg-gray-50 text-blue-500 hover:text-blue-600 rounded-full transition-colors text-sm"
      onClick={onCreateTicket}
    >
      <svg
        className="w-4 h-4 mr-1.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      Create New Ticket
    </button> */}
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

const StatusTabs: React.FC<StatusTabsProps> = ({ status, onStatus }) => {
  const statusOptions: StatusType[] = ['All', 'Open', 'Closed', 'Pending'];

  return (
    <div className="bg-white rounded-full p-1 border border-gray-200">
      <div className="flex space-x-0.5">
        {statusOptions.map((option) => (
          <button
            key={option}
            onClick={() => onStatus(option.toLowerCase())}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
              status === option.toLowerCase()
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
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
  sort: SortType;
  onSort: (v: SortType) => void;
  totalTickets: number;
  onCreateTicket: () => void;
};

const FilterSection: React.FC<FilterSectionProps> = ({
  search,
  onSearch,
  status,
  onStatus,
  sort,
  onSort,
  totalTickets,
  onCreateTicket,
}) => (
  <div className="space-y-4">
    <HeaderSection totalTickets={totalTickets} onCreateTicket={onCreateTicket} />
    <SearchBar value={search} onChange={onSearch} />
    <StatusTabs status={status} onStatus={onStatus} />
    <MetricsBar totalTickets={totalTickets} sort={sort} onSort={onSort} />
  </div>
);

export default FilterSection; 