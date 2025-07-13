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
import { Message, Ticket, TicketDetails } from "./types";
import { mockTickets } from "./mockTickets";
import axios from "axios";

interface ViewTicketSectionProps {
  selectedTicket: Ticket | null;
  replyText: string;
  onReplyChange: (value: string) => void;
  onSendReply: () => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onMessageEdit: (messageId: string) => void;
  onMessageDelete: (messageId: string) => void;
  onMessageReply: (messageId: string) => void;
  updated: boolean;
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
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  ticket: Ticket;
}> = ({ subject, createdAt, onEdit, onDelete, ticket }) => (
  <div className="flex justify-between items-start mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer">
        {subject}
      </h1>
      <p className="text-sm text-gray-500 mt-1">Created on {createdAt ? new Date(createdAt).toLocaleString() : ''}</p>
    </div>
    <div className="flex gap-3">
      <button
        onClick={() => onEdit(ticket)}
        className="group px-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200 flex items-center gap-2 hover:shadow-md active:scale-95"
      >
        <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
        Edit
      </button>
      <button
        onClick={() => onDelete(ticket)}
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
  onEdit?: () => void;
  onDelete?: () => void;
  onMessageEdit?: (messageId: string) => void;
  onMessageDelete?: (messageId: string) => void;
  onMessageReply?: (messageId: string) => void;
}> = ({
  sender,
  content,
  createdAt,
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
                  <p className="text-sm text-gray-500">{new Date(createdAt).toLocaleString()}</p>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button
                          onClick={onEdit}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={onDelete}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="mt-2 text-gray-700 break-words">{content}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

const NewMessageCard: React.FC<{
  ticketData: Ticket;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onMessageEdit: (messageId: string) => void;
  onMessageDelete: (messageId: string) => void;
  onMessageReply: (messageId: string) => void;
}> = ({ ticketData, onEdit, onDelete, onMessageEdit, onMessageDelete, onMessageReply }) => {
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

  const mainMessage = ticketData.replies[0];
  const replies = ticketData.replies.slice(1, ticketData.replies.length);

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
            {mainMessage.sender === "agency_admin" ? ticketData.agencyId.agencyName[0] : ticketData.wholesalerId.wholesalerName[0]}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                  {mainMessage.sender === "agency_admin" ? ticketData.agencyId.agencyName : ticketData.wholesalerId.wholesalerName}
                </h3>
                <p className="text-sm text-gray-500">{new Date(mainMessage.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="mt-2 text-gray-700 break-words">{mainMessage.message}</p>
                {replies.length > 0 && (
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={() => onMessageReply(mainMessage._id)}
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors hover:underline"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => onMessageEdit(mainMessage._id)}
                      className="text-sm text-gray-500 hover:text-gray-600 transition-colors hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

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
                      onEdit(ticketData);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(ticketData);
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
              key={reply._id}
              sender={{
                type: reply.sender === "agency_admin" ? "Agency" : "Wholesaler",
                name: reply.sender === "agency_admin" ? ticketData.agencyId.agencyName : ticketData.wholesalerId.wholesalerName
              }}
              content={reply.message}
              createdAt={reply.createdAt}
              onEdit={() => onMessageEdit(reply._id)}
              onDelete={() => onMessageDelete(reply._id)}
              onMessageEdit={onMessageEdit}
              onMessageDelete={onMessageDelete}
              onMessageReply={onMessageReply}
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
  isLoading?: boolean;
}> = ({ value, onChange, onSend, isLoading }) => (
  <div className="w-full">
    <div className="flex items-center px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-blue-200 transition-all">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your reply here..."
        className="flex-1 bg-transparent outline-none border-none text-gray-700 placeholder-gray-500 text-base px-2"
        disabled={isLoading}
      />
      <button
        onClick={onSend}
        disabled={!value.trim() || isLoading}
        className="flex items-center gap-1 px-4 py-1 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            Send
            <Send className="h-5 w-5 ml-1" />
          </>
        )}
      </button>
    </div>
  </div>
);

 const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || "";
    }
    return "";
  };

// Main Component
const ViewTicketSection: React.FC<ViewTicketSectionProps> = ({
  selectedTicket,
  replyText,
  onReplyChange,
  onSendReply,
  onEdit,
  onDelete,
  onMessageEdit,
  onMessageDelete,
  onMessageReply,
  updated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ticketData, setTicketData] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const token = getAuthToken();

  useEffect(() => {
    const fetchTicketData = async () => {
      if (!selectedTicket?._id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${apiUrl}support/tickets/${selectedTicket?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTicketData(response.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ticket data');
        console.error('Error fetching ticket:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketData();
  }, [selectedTicket?._id, updated]);

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

  if (isLoading && !ticketData) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading ticket details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600">
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!ticketData) return null;

  console.log("ticketData: ", ticketData);

  // Convert ticket data to TicketDetails format
  const ticketDetails: TicketDetails = {
    subject: ticketData.subject,
    createdAt: ticketData.createdAt,
    messages: ticketData.replies.map(reply => ({
      id: reply._id,
      sender: {
        type: reply.sender === "agency_admin" ? "Agency" : "Wholesaler",
        name: reply.sender === "agency_admin"
          ? ticketData.agencyId.agencyName
          : ticketData.wholesalerId.wholesalerName
      },
      content: reply.message,
      createdAt: reply.createdAt,
    }))
  };

  return (
    <div className="flex flex-col h-fit p-4 lg:p-6 xl:p-8 bg-white shadow-xs border border-gray-200 border-l-0 rounded-r-2xl">
      {/* Breadcrumb */}
      <Breadcrumb subject={ticketDetails.subject} />

      {/* Header */}
      <TicketHeader
        subject={ticketDetails.subject}
        createdAt={ticketDetails.createdAt}
        ticket={selectedTicket}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Messages Container */}
      {/* <div className="bg-gray-50 rounded-2xl p-6 flex-1 overflow-y-auto space-y-6 mb-3 min-h-[250px]">
        {ticketDetails.messages.map((message, index) => (
          <MessageCard
            key={message.id}
            sender={message.sender}
            content={message.content}
            createdAt={message.createdAt}
            onEdit={() => onMessageEdit(message.id)}
            onDelete={() => onMessageDelete(message.id)}
            onMessageEdit={onMessageEdit}
            onMessageDelete={onMessageDelete}
            onMessageReply={onMessageReply}
          />
        ))}
      </div> */}

      <div className="bg-gray-50 rounded-2xl p-6 flex-1 overflow-y-auto space-y-6 mb-3 min-h-[250px]">
        <NewMessageCard
          ticketData={ticketData}
          onEdit={onMessageEdit}
          onDelete={onMessageDelete}
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
        isLoading={isLoading}
      />
    </div>
  );
};

export default ViewTicketSection;
