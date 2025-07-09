'use client'

import React from 'react';
import FilterSection from './FilterSection';
import TicketList from './TicketList';
import { StatusType, SortType, Ticket } from './types';

interface AllTicketsSectionProps {
  search: string;
  onSearch: (value: string) => void;
  status: StatusType;
  onStatus: (value: StatusType) => void;
  sort: SortType;
  onSort: (value: SortType) => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
  tickets: Ticket[];
  onCreateTicket: () => void;
  isDropdownOpen: number | null;
  onDropdownToggle: (id: number | null) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const AllTicketsSection: React.FC<AllTicketsSectionProps> = ({
  search,
  onSearch,
  status,
  onStatus,
  sort,
  onSort,
  selectedId,
  onSelect,
  tickets,
  onCreateTicket,
  isDropdownOpen,
  onDropdownToggle,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-300">
      {/* Filter Section - Fixed at top */}
      <div className="px-4 py-2">
        <FilterSection
          search={search}
          onSearch={onSearch}
          status={status}
          onStatus={onStatus}
          sort={sort}
          onSort={onSort}
          totalTickets={tickets.length}
          onCreateTicket={onCreateTicket}
        />
      </div>

      {/* Ticket List - Scrollable */}
      <div className="flex-1 overflow-hidden mt-3">
        <div className="h-full overflow-y-auto">
          <TicketList
            tickets={tickets}
            selectedId={selectedId}
            onSelect={onSelect}
            isDropdownOpen={isDropdownOpen}
            onDropdownToggle={onDropdownToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default AllTicketsSection;