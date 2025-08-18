'use client'

import React from 'react';
import FilterSection from './FilterSection';
import TicketList from './TicketList';
import { StatusType, SortType, Ticket, CategoryType } from './types';

interface AllTicketsSectionProps {
  search: string;
  onSearch: (value: string) => void;
  status: StatusType;
  onStatus: (value: StatusType) => void;
  category: CategoryType;
  onCategory: (value: CategoryType) => void;
  sort: SortType;
  onSort: (value: SortType) => void;
  onSelect: (id: string | null) => void;
  tickets: Ticket[];
  onCreateTicket: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  selectedTicketId: string | null;
  refreshLoad: boolean;
}

const AllTicketsSection: React.FC<AllTicketsSectionProps> = ({
  search,
  onSearch,
  status,
  onStatus,
  category,
  onCategory,
  sort,
  onSort,
  onSelect,
  tickets,
  onCreateTicket,
  onRefresh,
  isRefreshing,
  selectedTicketId,
  refreshLoad,
}) => {
  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-300 relative">
      {/* Filter Section - Fixed at top */}
      <div className="px-4 py-2">
        <FilterSection
          search={search}
          onSearch={onSearch}
          status={status}
          onStatus={onStatus}
          category={category}
          onCategory={onCategory}
          sort={sort}
          onSort={onSort}
          totalTickets={tickets.length}
          onCreateTicket={onCreateTicket}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Ticket List - Scrollable */}
      <div className="flex-1 overflow-hidden mt-3">
        <div className="h-full overflow-y-auto">
          <TicketList
            tickets={tickets}
            onSelect={onSelect}
            selectedTicketId={selectedTicketId}
          />
        </div>
      </div>

      {/* Refresh indicator - positioned at top center with smooth animation */}
      <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out ${refreshLoad
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
        }`}>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Refreshing tickets...
        </div>
      </div>
    </div>
  );
};

export default AllTicketsSection;