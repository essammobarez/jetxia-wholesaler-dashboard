import React from 'react';
import TicketCard from './TicketCard';
import { Ticket } from './types';

type TicketListProps = {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  onSelect: (ticket: Ticket) => void;
  isDropdownOpen: string | null;
  onDropdownToggle: (id: string | null) => void;
  onStatusChange: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onReopen: (ticket: Ticket) => void;
};

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  selectedTicket,
  onSelect,
  isDropdownOpen,
  onDropdownToggle,
  onStatusChange,
  onDelete,
  onReopen
}) => {
  if (!tickets.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-gray-50 rounded-full p-4 mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets found</h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Try adjusting your search or filter criteria to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-1 overflow-y-auto max-h-fit">
      {tickets.map(ticket => (
        <TicketCard
          key={ticket._id}
          ticket={ticket}
          selected={ticket._id === selectedTicket?._id}
          onClick={() => onSelect(ticket)}
          isDropdownOpen={isDropdownOpen === ticket._id}
          onDropdownToggle={() => onDropdownToggle(isDropdownOpen === ticket._id ? null : ticket._id)}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onReopen={onReopen}
        />
      ))}
    </div>
  );
};

export default TicketList; 