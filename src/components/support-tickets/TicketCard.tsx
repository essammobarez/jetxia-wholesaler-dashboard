"use client"

import React from 'react';
import { FiMoreVertical, FiMessageCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { Ticket, StatusColors } from './types';

const statusColors: StatusColors = {
  Open: {
    bg: 'bg-green-50',
    text: 'text-green-700',
  },
  Closed: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
  },
  Pending: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
  },
};

const getRandomColor = () => {
  const colors = [
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-indigo-600',
    'bg-orange-600',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

interface TicketCardProps {
  ticket: Ticket;
  selected?: boolean;
  onClick?: () => void;
  isDropdownOpen: boolean;
  onDropdownToggle: () => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  selected,
  onClick,
  isDropdownOpen,
  onDropdownToggle,
  onEdit,
  onDelete
}) => {
  const status = statusColors[ticket.status] || { bg: 'bg-gray-50', text: 'text-gray-700' };
  const randomBgColor = React.useMemo(() => getRandomColor(), []);

  const formattedDate = React.useMemo(() => {
    try {
      return format(new Date(ticket.createdAt), 'dd MMMM, yyyy');
    } catch (error) {
      return ticket.createdAt;
    }
  }, [ticket.createdAt]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={`
        w-full transition-all duration-200 ease-in-out
        border border-gray-100 rounded-2xl p-3
        flex flex-col gap-3
        cursor-pointer focus:outline-none
        ${selected ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}
      `}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-0">
          <h3 className="font-medium text-gray-900 text-lg">
            {ticket.subject}
          </h3>
          <p className="text-xs text-gray-800">
            Created on {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`
              px-2.5 py-1 rounded-full text-xs font-medium
              border border-gray-200
              ${status.bg} ${status.text}
            `}
          >
            {ticket.status}
          </div>

          <div className="relative dropdown-menu">
            <button
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onDropdownToggle();
              }}
              aria-label="More options"
            >
              <FiMoreVertical className="w-4 h-4" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(ticket);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(ticket);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300" />

      {/* Body Section */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">
          {/* {ticket.agencyName} */}
        </div>

        <div className="flex items-start gap-3">
          {/* Avatar */}
          {ticket.wholesalerId?.email ? (
            <img
              src={ticket.wholesalerId.email}
              alt={ticket.wholesalerId.email}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className={`
                w-10 h-10
                rounded-full 
                flex items-center justify-center 
                text-white font-medium
                ${randomBgColor}
              `}
            >
              {/* Fallback initials from agency email or generic 'NA' */}
              {ticket.agencyId?.email
                ? ticket.agencyId.email.slice(0, 2).toUpperCase()
                : 'NA'}
            </div>
          )}

          {/* Message */}
          <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 line-clamp-2">{ticket.replies[0]?.message}</p>
          </div>

          {/* Replies */}
          {ticket.replies?.length > 0 && (
            <div className="flex items-center gap-1.5 text-blue-600 text-sm">
              <FiMessageCircle className="w-4 h-4" />
              <span className="font-medium">{ticket.replies.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
