"use client";

import React, { useState, useRef, useEffect } from "react";
import { Separator } from "../ui/separator";
import {
  ChevronRight,
  Edit,
  MoreVertical,
  Send,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { Image as ImageIcon } from "lucide-react";
import { Message, TicketDetails } from "./types";
import { mockTickets } from "./mockTickets";

interface ViewTicketSectionProps {
  selectedId: number | null;
  replyText: string;
  onReplyChange: (value: string) => void;
  onSendReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMessageEdit: (messageId: string) => void;
  onMessageDelete: (messageId: string) => void;
  onMessageReply: (messageId: string) => void;
}

// Subcomponents
const Breadcrumb: React.FC<{ subject: string }> = ({ subject }) => (
  <nav className="flex items-center text-sm font-medium text-gray-500 mb-6">
    <span className="hover:text-gray-900 transition-colors cursor-pointer">
      Support ticket
    </span>
    <ChevronRight className="h-4 w-4 mx-1" />
    <span className="text-gray-900 hover:text-gray-700 transition-colors cursor-pointer">
      {subject}
    </span>
    <ChevronRight className="h-4 w-4 mx-1" />
    <span className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
      Reply
    </span>
  </nav>
);

const TicketHeader: React.FC<{
  subject: string;
  createdAt: string;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ subject, createdAt, onEdit, onDelete }) => (
  <div className="flex justify-between items-start mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer">
        {subject}
      </h1>
      <p className="text-sm text-gray-500 mt-1">Created on {createdAt}</p>
    </div>
    <div className="flex gap-3">
      <button
        onClick={onEdit}
        className="group px-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200 flex items-center gap-2 hover:shadow-md active:scale-95"
      >
        <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
        Edit
      </button>
      <button
        onClick={onDelete}
        className="group px-4 py-2 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-all duration-200 flex items-center gap-2 hover:shadow-md active:scale-95"
      >
        <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
        Delete
      </button>
    </div>
  </div>
);

const MessageCard: React.FC<{
  sender: Message["sender"];
  content: string;
  createdAt: string;
  isReply?: boolean;
  replies?: Message[];
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMessageEdit?: (messageId: string) => void;
  onMessageDelete?: (messageId: string) => void;
  onMessageReply?: (messageId: string) => void;
}> = ({
  sender,
  content,
  createdAt,
  isReply = false,
  replies = [],
  onReply,
  onEdit,
  onDelete,
  onMessageEdit,
  onMessageDelete,
  onMessageReply,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRandomColor = () => {
    const colors = [
      "bg-blue-600",
      "bg-green-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-indigo-600",
      "bg-orange-600",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const randomColor = React.useMemo(() => getRandomColor(), []);

  return (
    <div className="space-y-4">
      <div className="group rounded-xl transition-all duration-200">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={`
            w-12 h-12
            rounded-full 
            flex items-center justify-center 
            text-white font-medium
            transform group-hover:scale-105 transition-transform duration-200
            ${randomColor}
          `}
          >
            {sender.name[0]}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                  {sender.name}
                </h3>
                <p className="text-sm text-gray-500">{createdAt}</p>
              </div>
            </div>
            <div>
              <p className="mt-2 text-gray-700 break-words">{content}</p>
              {isReply && (
                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={onReply}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors hover:underline"
                  >
                    Reply
                  </button>
                  <button
                    onClick={onEdit}
                    className="text-sm text-gray-500 hover:text-gray-600 transition-colors hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
          <div ref={dropdownRef} className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`
                text-gray-400 hover:text-gray-600 
                p-1.5 rounded-full 
                hover:bg-gray-50 
                transition-all duration-200 
                ${isDropdownOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              `}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onEdit?.();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {replies.length > 0 && (
        <div className="space-y-4 pl-8 border-l-2 border-gray-200 ml-6">
          {replies.map((reply) => (
            <>
            <Separator className="my-3" />
            <MessageCard
              key={reply.id}
              sender={reply.sender}
              content={reply.content}
              createdAt={reply.createdAt}
              isReply
              onReply={() => onMessageReply?.(reply.id)}
              onEdit={() => onMessageEdit?.(reply.id)}
              onDelete={() => onMessageDelete?.(reply.id)}
            />
            </>
          ))}
        </div>
      )}
    </div>
  );
};



const ReplyBox: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}> = ({ value, onChange, onSend }) => (
  <div className="w-full">
    <div className="flex items-center px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-blue-200 transition-all">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Reply to"
        className="flex-1 bg-transparent outline-none border-none text-gray-700 placeholder-gray-500 text-base px-2"
      />
      {/* <button
        type="button"
        className="mx-1 text-gray-500 hover:text-blue-500 p-1 rounded-full transition-colors"
        tabIndex={-1}
        aria-label="Attach image"
      >
        <ImageIcon className="h-5 w-5" />
      </button> */}
      <button
        onClick={onSend}
        disabled={!value.trim()}
        className="flex items-center gap-1 px-4 py-1 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-150 active:scale-95 disabled:opacity-60"
      >
        Send
        <Send className="h-5 w-5 ml-1" />
      </button>
    </div>
  </div>
);

// Main Component
const ViewTicketSection: React.FC<ViewTicketSectionProps> = ({
  selectedId,
  replyText,
  onReplyChange,
  onSendReply,
  onEdit,
  onDelete,
  onMessageEdit,
  onMessageDelete,
  onMessageReply,
}) => {
  // Find selected ticket
  const selectedTicket = mockTickets.find((t) => t.id === selectedId);

  if (!selectedTicket) {
    return (
      <div className="flex flex-col items-center justify-start h-full text-gray-500 pt-32">
        <div className="bg-gray-50 rounded-full p-4 mb-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">Select a ticket</h3>
        <p className="text-sm text-center max-w-sm">
          Choose a ticket from the list to view its details
        </p>
      </div>
    );
  }

  // Mock ticket details - replace with actual data from your API
  const ticketDetails: TicketDetails = {
    subject: selectedTicket.subject,
    createdAt: selectedTicket.created,
    messages: [
      {
        id: "1",
        sender: {
          type: "Wholesaler",
          name: "Wholesaler",
        },
        content: selectedTicket.message,
        createdAt: selectedTicket.created,
      },
      {
        id: "2",
        sender: {
          type: "Agency",
          name: selectedTicket.agencyName,
        },
        content: "Yes, I do. Can you provide me more details.",
        createdAt: "1 day ago",
      },
      {
        id: "3",
        sender: {
          type: "Agency",
          name: selectedTicket.agencyName,
        },
        content: "And I'm looking for the other opportunities.",
        createdAt: "1 day ago",
      },
    ],
  };

  return (
    <div className="flex flex-col h-fit p-4 lg:p-6 xl:p-8 bg-white shadow-xs border border-gray-200 border-l-0 rounded-r-2xl">
      {/* Breadcrumb */}
      <Breadcrumb subject={ticketDetails.subject} />

      {/* Header */}
      <TicketHeader
        subject={ticketDetails.subject}
        createdAt={ticketDetails.createdAt}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Messages Container */}
      <div className="bg-gray-50 rounded-2xl p-6 flex-1 overflow-y-auto space-y-6 mb-3">
        <MessageCard
          sender={ticketDetails.messages[0].sender}
          content={ticketDetails.messages[0].content}
          createdAt={ticketDetails.messages[0].createdAt}
          onEdit={() => onMessageEdit(ticketDetails.messages[0].id)}
          onDelete={() => onMessageDelete(ticketDetails.messages[0].id)}
          replies={ticketDetails.messages.slice(1)}
          onMessageEdit={onMessageEdit}
          onMessageDelete={onMessageDelete}
          onMessageReply={onMessageReply}
        />
      </div>

      {/* Reply Box */}
      <ReplyBox
        value={replyText}
        onChange={onReplyChange}
        onSend={onSendReply}
      />
    </div>
  );
};

export default ViewTicketSection;
