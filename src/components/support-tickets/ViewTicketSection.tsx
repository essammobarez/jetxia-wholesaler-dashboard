"use client";

import React, { useState, useRef, useEffect } from "react";
import { Separator } from "../ui/separator";
import { ChevronRight, Edit, MoreVertical, Send, Trash2 } from "lucide-react";
import { Message, Ticket, TicketDetails } from "./types";
import axios from "axios";

interface ViewTicketSectionProps {
  selectedTicket: Ticket | null;
  replyText: string;
  onReplyChange: (value: string) => void;
  onSendReply: () => void;
  onDelete: (ticket: Ticket) => void;
  onStatusChange: (ticket: Ticket) => void;
  onMessageEdit: (messageId: string) => void;
  onMessageDelete: (messageId: string) => void;
  onMessageReply: (messageId: string) => void;
  currentUserType: "wholesaler_admin" | "agency_admin";
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
  onDelete: (ticket: Ticket) => void;
  onStatusChange: (ticket: Ticket) => void;
  ticket: Ticket;
}> = ({ subject, createdAt, onDelete, onStatusChange, ticket }) => (
  <div className="flex justify-between items-start mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer">
        {subject}
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Created on {createdAt ? new Date(createdAt).toLocaleString() : ""}
      </p>
    </div>
    <div className="flex gap-3">
      <button
        onClick={() => onStatusChange(ticket)}
        className="group px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200 flex items-center gap-2 hover:shadow-md active:scale-95"
      >
        <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Change Status
      </button>
      <button
        onClick={() => onDelete(ticket)}
        className="group px-4 py-2 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-all duration-200 flex items-center gap-2 hover:shadow-md active:scale-95"
      >
        <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>
    </div>
  </div>
);

const MessageCard: React.FC<{
  sender: Message["sender"];
  content: string;
  createdAt: string;
  onMessageEdit?: (messageId: string) => void;
  onMessageDelete?: (messageId: string) => void;
  onMessageReply?: (messageId: string) => void;
  currentUserType: "wholesaler_admin" | "agency_admin";
  ticketData?: Ticket; // Add ticket data to access agency/wholesaler info
  messageId?: string; // Add messageId prop
}> = ({
  sender,
  content,
  createdAt,
  onMessageEdit,
  onMessageDelete,
  onMessageReply,
  currentUserType,
  ticketData,
  messageId,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Permissions (visual only; does not change underlying handlers)
    const canEdit = currentUserType === "wholesaler_admin" && sender.type === "Wholesaler";
    const canDelete = currentUserType === "wholesaler_admin" && sender.type === "Wholesaler";

    // Get avatar and name based on sender type
    const isAgency = sender.type === "Agency";
    const avatar = isAgency ? ticketData?.agency?.avatar : ticketData?.wholesaler?.avatar;
    const name = isAgency ? ticketData?.agency?.agencyName : ticketData?.wholesaler?.wholesalerName;
    const initials = (name?.[0] || "?").toUpperCase();

    return (
      <div className="space-y-4">
        <div className="group rounded-xl transition-all duration-200">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            {avatar ? (
              <img
                src={avatar}
                alt={name || "User"}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div
                className={`
                w-12 h-12
                rounded-full 
                flex items-center justify-center 
                text-white font-medium
                bg-gray-500
              `}
              >
                {initials}
              </div>
            )}

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
                  {canEdit && onMessageEdit && messageId ? (<button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                  </button>) : null}

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        {canEdit && onMessageEdit && messageId ? (
                          <button
                            onClick={() => onMessageEdit(messageId)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-400 cursor-not-allowed flex items-center gap-2 bg-gray-50">
                            <Edit className="h-4 w-4" />
                            Edit (Not allowed)
                          </div>
                        )}
                        {canDelete && onMessageDelete && messageId ? (
                          <button
                            onClick={() => onMessageDelete(messageId)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-400 cursor-not-allowed flex items-center gap-2 bg-gray-50">
                            <Trash2 className="h-4 w-4" />
                            Delete (Not allowed)
                          </div>
                        )}
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
  onDelete: (ticket: Ticket) => void;
  onMessageEdit: (messageId: string) => void;
  onMessageDelete: (messageId: string) => void;
  onMessageReply: (messageId: string) => void;
  currentUserType: "wholesaler_admin" | "agency_admin";
}> = ({
  ticketData,
  onDelete,
  onMessageEdit,
  onMessageDelete,
  onMessageReply,
  currentUserType,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const mainMessage = ticketData.replies[0];
    const replies = ticketData.replies.slice(1);

    const agencyName = ticketData.agency?.agencyName || "Agency";
    const wholesalerName = ticketData.wholesaler?.wholesalerName || "Wholesaler";

    const mainSenderIsAgency = mainMessage?.sender === "agency_admin";
    const mainSenderName = mainSenderIsAgency ? agencyName : wholesalerName;
    const mainSenderInitial = (mainSenderName?.[0] || "?").toUpperCase();
    const mainSenderAvatar = mainSenderIsAgency ? ticketData.agency?.avatar : ticketData.wholesaler?.avatar;

    const canEditMainMessage =
      currentUserType === "wholesaler_admin" && mainMessage?.sender === "wholesaler_admin";

    if (!mainMessage) {
      return (
        <div className="text-center text-gray-500 py-8">
          <p>No messages found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="group rounded-xl transition-all duration-200">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            {mainSenderAvatar ? (
              <img
                src={mainSenderAvatar}
                alt={mainSenderName || "User"}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div
                className={`
                w-12 h-12
                rounded-full 
                flex items-center justify-center 
                text-white font-medium
                bg-gray-500
              `}
              >
                {mainSenderInitial}
              </div>
            )}

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                    {mainSenderName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(mainMessage.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Category Badge */}
                  <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {ticketData.category}
                  </div>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`
                      text-gray-400 hover:text-gray-600 
                      p-1.5 rounded-full 
                      hover:bg-gray-50 
                      transition-all duration-200 
                      ${isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                    `}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onDelete(ticketData);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-2 text-gray-700 break-words">{mainMessage.message}</p>

              {/* Removed edit and reply buttons from first message */}
            </div>
          </div>
        </div>

        {/* Nested Replies */}
        {replies.length > 0 && (
          <div className="space-y-4 pl-8 border-l-2 border-gray-200 ml-6">
            {replies.map((reply) => {
              const senderName = reply.sender === "agency_admin" ? agencyName : wholesalerName;
              return (
                <React.Fragment key={reply._id}>
                  <Separator className="my-3" />
                  <MessageCard
                    sender={{
                      type: reply.sender === "agency_admin" ? "Agency" : "Wholesaler",
                      name: senderName,
                    }}
                    content={reply.message}
                    createdAt={reply.createdAt}
                    onMessageEdit={onMessageEdit}
                    onMessageDelete={onMessageDelete}
                    onMessageReply={onMessageReply}
                    currentUserType={currentUserType}
                    ticketData={ticketData}
                    messageId={reply._id}
                  />
                </React.Fragment>
              );
            })}
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
  onDelete,
  onStatusChange,
  onMessageEdit,
  onMessageDelete,
  onMessageReply,
  currentUserType,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ticketData, setTicketData] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const token = getAuthToken();

  useEffect(() => {
    const fetchTicketData = async () => {
      if (!selectedTicket?._id) return;

      // Only show loading if we don't have data for this ticket
      if (!ticketData || ticketData._id !== selectedTicket._id) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await axios.get(`${apiUrl}support/tickets/${selectedTicket._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTicketData(response.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch ticket data");
        console.error("Error fetching ticket:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketData();
  }, [selectedTicket?._id, apiUrl, token]); // Removed 'updated' dependency to prevent unnecessary reloads

  if (!selectedTicket) {
    return (
      <div className="flex flex-col items-center justify-start h-full text-gray-500 pt-32">
        <div className="bg-gray-50 rounded-full p-4 mb-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">Select a ticket</h3>
        <p className="text-sm text-center max-w-sm">Choose a ticket from the list to view its details</p>
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

  // Convert ticket data to TicketDetails format (if ever needed elsewhere)
  const ticketDetails: TicketDetails = {
    subject: ticketData.subject,
    createdAt: ticketData.createdAt,
    messages: ticketData.replies.map((reply) => ({
      id: reply._id,
      sender: {
        type: reply.sender === "agency_admin" ? "Agency" : "Wholesaler",
        name:
          reply.sender === "agency_admin"
            ? ticketData.agency?.agencyName || "Agency"
            : ticketData.wholesaler?.wholesalerName || "Wholesaler",
      },
      content: reply.message,
      createdAt: reply.createdAt,
    })),
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
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />

      {/* Messages Container */}
      <div className="bg-gray-50 rounded-2xl p-6 flex-1 overflow-y-auto space-y-6 mb-3 min-h-[250px]">
        <NewMessageCard
          ticketData={ticketData}
          onDelete={onDelete}
          onMessageEdit={onMessageEdit}
          onMessageDelete={onMessageDelete}
          onMessageReply={onMessageReply}
          currentUserType={currentUserType}
        />
      </div>

      {/* Reply Box */}
      <ReplyBox value={replyText} onChange={onReplyChange} onSend={onSendReply} isLoading={isLoading} />
    </div>
  );
};

export default ViewTicketSection;
