import { AllTicketsSection, StatusType, Ticket, ViewTicketSection, CategoryType, SortType, TicketResponse, AgencyState, WholesalerState } from "@/components/support-tickets";
import CreateTicketModal from "@/components/support-tickets/CreateTicketModal";
import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import LoadingSpinner from "@/components/ui/loading-spinner";
import DeleteConfirmModal from "@/components/support-tickets/DeleteConfirmModal";
import StatusChangeModal from "@/components/support-tickets/StatusChangeModal";
import MessageEditModal from "@/components/support-tickets/MessageEditModal";
import { jwtDecode } from "jwt-decode";

// Utility functions
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken") || "";
  }
  return "";
};

const getWholesalerId = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode<{ wholesalerId?: string }>(token);
    return decoded.wholesalerId ?? null;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};

const getCurrentUserType = (): "wholesaler_admin" | "agency_admin" => {
  const token = getAuthToken();
  if (!token) return "wholesaler_admin";
  try {
    const decoded = jwtDecode<{ userType?: string }>(token);
    return (decoded.userType as "wholesaler_admin" | "agency_admin") ?? "wholesaler_admin";
  } catch (err) {
    console.error("Error decoding token:", err);
    return "wholesaler_admin";
  }
};

const SupportTicketsPage = () => {
  // Core states
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [refreshLoad, setRefreshLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusType>("all");
  const [category, setCategory] = useState<CategoryType>("all");
  const [sort, setSort] = useState<SortType>("Recent");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [isMessageEditModalOpen, setIsMessageEditModalOpen] = useState(false);

  // Action states
  const [selectedDeleteTicket, setSelectedDeleteTicket] = useState<Ticket | null>(null);
  const [selectedStatusChangeTicket, setSelectedStatusChangeTicket] = useState<Ticket | null>(null);
  const [selectedEditMessage, setSelectedEditMessage] = useState<{ id: string; content: string } | null>(null);

  // Loading states for operations
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isDeletingTicket, setIsDeletingTicket] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState("");

  // Mobile view state
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);

  // API configuration
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const token = getAuthToken();
  const currentUserType = getCurrentUserType();

  // Fetch tickets from API - removed selectedTicket dependency to prevent infinite loop
  const fetchTickets = useCallback(async (refresh: boolean = false) => {
    if (!token) {
      setError("Authentication required");
      setIsLoading(false);
      setRefreshLoad(false);
      return;
    }

    try {
      // Only set refreshLoad if this is a refresh operation
      if (refresh) {
        setRefreshLoad(true);
      }
      setError(null);

      const response = await axios.get<TicketResponse>(
        `${apiUrl}support/tickets/wholesaler`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setTickets(response.data.data);

        // Only update selected ticket if we're not in the middle of a refresh operation
        if (selectedTicketId && !refresh) {
          const updatedSelectedTicket = response.data.data.find(ticket => ticket._id === selectedTicketId);
          if (updatedSelectedTicket?._id) {
            setSelectedTicket(updatedSelectedTicket);
          }
        }
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch tickets");
    } finally {
      if (refresh) {
        setRefreshLoad(false);
      }
      setIsLoading(false);
    }
  }, [apiUrl, token]);

  // Initial fetch
  useEffect(() => {
    setInterval(() => {
      fetchTickets();
    }, 10000);
    // fetchTickets();
  }, []);

  // Reset reply text when selected ticket changes
  useEffect(() => {
    setReplyText("");
  }, [selectedTicketId]);

  // Filter and sort tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = status === "all" || ticket.status === status;
    const matchesCategory = category === "all" || ticket.category === category;
    const matchesSearch =
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.replies.some((reply) =>
        reply.message.toLowerCase().includes(search.toLowerCase())
      );
    return matchesStatus && matchesCategory && matchesSearch;
  }).sort((a, b) =>
    sort === "Recent"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Send reply handler
  const handleSendReply = useCallback(async () => {
    setRefreshLoad(true);
    if (!replyText.trim() || !selectedTicket?._id) return;

    try {
      setIsSendingReply(true);
      setError(null); // Commented out - no error display

      const response = await axios.post<TicketResponse>(
        `${apiUrl}support/reply-ticket/${selectedTicket._id}`,
        { message: replyText },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Clear reply text first
        setReplyText("");

        // Fetch updated tickets with refresh flag
        await fetchTickets(true);
      } else {
        setRefreshLoad(false);
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      setRefreshLoad(false);
      setError(error instanceof Error ? error.message : "Failed to send reply");
    } finally {
      setIsSendingReply(false);
      setRefreshLoad(false);
    }
  }, [replyText, selectedTicket, apiUrl, token, fetchTickets]);

  // Delete ticket handler
  const handleDelete = useCallback((ticket: Ticket) => {
    setSelectedDeleteTicket(ticket);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async (id: string) => {
    setRefreshLoad(true);
    try {
      setIsDeletingTicket(true);
      setError(null);

      const response = await axios.delete<TicketResponse>(
        `${apiUrl}support/delete-tickets/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Remove from tickets list
        setTickets(prev => {
          const newTickets = prev.filter(ticket => ticket._id !== id);
          return newTickets;
        });

        // Clear selected ticket if it was the deleted one
        if (selectedTicket && selectedTicket._id === id) {
          setSelectedTicket(null);
          setShowMobileDetail(false);
        }

        // Close modal
        setIsDeleteModalOpen(false);
        setSelectedDeleteTicket(null);
      } else {
        console.log('Delete failed:', response.data.message);
        setError(response.data.message);
      }
    } catch (error) {
      setRefreshLoad(false);
      // setError(error instanceof Error ? error.message : "Failed to delete ticket"); // Commented out - no error display
    } finally {
      setIsDeletingTicket(false);
    }
  }, [apiUrl, token, selectedTicketId]);

  // Status change handler
  const handleStatusChange = useCallback((ticket: Ticket) => {
    setSelectedStatusChangeTicket(ticket);
    setIsStatusChangeModalOpen(true);
  }, []);

  const handleStatusChangeSubmit = useCallback(async (action: 'close') => {
    setRefreshLoad(true);
    if (!selectedTicketId) return;

    try {
      setError(null);

      const response = await axios.patch<TicketResponse>(
        `${apiUrl}support/close/${selectedTicketId}`,
        { "status": "closed" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsStatusChangeModalOpen(false);
        setSelectedStatusChangeTicket(null);
        await fetchTickets(true);
      } else {
        setRefreshLoad(false);
        setError(response.data.message || "Failed to update status");
      }
    } catch (error) {
      setRefreshLoad(false);
      setError(error instanceof Error ? error.message : "Failed to change status");
    }
  }, [apiUrl, token, selectedTicketId]);

  // Message edit handler
  const handleMessageEdit = useCallback((messageId: string) => {
    if (selectedTicket) {
      const message = selectedTicket.replies.find(reply => reply._id === messageId);
      if (message) {
        setSelectedEditMessage({ id: messageId, content: message.message });
        setIsMessageEditModalOpen(true);
      }
    }
  }, [selectedTicket]);

  const handleMessageEditSubmit = useCallback(async (messageId: string, newContent: string) => {
    setRefreshLoad(true);
    try {
      setError(null);

      const response = await axios.patch<TicketResponse>(
        `${apiUrl}support/messages/${messageId}`,
        { message: newContent },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await fetchTickets(true);

        setIsMessageEditModalOpen(false);
        setSelectedEditMessage(null);
      } else {
        setError(response.data.message);
        setRefreshLoad(false);
      }
    } catch (error) {
      setRefreshLoad(false);
      setError(error instanceof Error ? error.message : "Failed to edit message");
    }
  }, [apiUrl, token, selectedTicketId]);

  // Message delete handler
  const handleMessageDelete = useCallback(async (messageId: string) => {
    if (!selectedTicketId) return;

    setRefreshLoad(true);

    try {
      setRefreshLoad(true);
      setError(null);
      
      const response = await axios.delete<TicketResponse>(
        `${apiUrl}support/delete-Reply/${selectedTicketId}/${messageId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await fetchTickets(true);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setRefreshLoad(false);
      setError(error instanceof Error ? error.message : "Failed to delete message");
    } finally {
      setRefreshLoad(false);
    }
  }, [apiUrl, token, selectedTicketId]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await fetchTickets();
  }, []);

  const handleMobileBack = useCallback(() => {
    setShowMobileDetail(false);
  }, []);

  useEffect(() => {
    if (selectedTicketId) {
      setSelectedTicket(filteredTickets.find(ticket => ticket._id === selectedTicketId) || null);
    }
  }, [selectedTicketId, tickets]);


  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest(".dropdown-menu")) {
          setIsDropdownOpen(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Loading overlay
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 relative">

      {/* Mobile View */}
      <div className="lg:hidden">
        {showMobileDetail && selectedTicket ? (
          <div className="h-screen flex flex-col bg-white">
            {/* Back Button Bar */}
            <div className="sticky top-0 z-50 bg-white border-b flex items-center px-4 py-3 shadow-sm">
              <button
                onClick={handleMobileBack}
                className="text-blue-600 font-medium flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
              <h2 className="ml-3 text-lg font-semibold truncate">
                {selectedTicket.subject}
              </h2>
            </div>

            {/* Ticket Details */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <ViewTicketSection
                key={`${selectedTicket._id}-${selectedTicket.replies.length}`}
                selectedTicket={selectedTicket}
                replyText={replyText}
                onReplyChange={setReplyText}
                onSendReply={handleSendReply}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onMessageEdit={handleMessageEdit}
                onMessageDelete={handleMessageDelete}
                onMessageReply={() => { }} // Not implemented for wholesalers
                currentUserType={currentUserType}
                onDeleteConfirm={handleDelete}
                onMessageEditConfirm={handleMessageEditSubmit}
                isSendingReply={isSendingReply}
                refreshLoad={refreshLoad}
              />
            </div>
          </div>
        ) : (
          <AllTicketsSection
            search={search}
            onSearch={setSearch}
            status={status}
            onStatus={setStatus}
            category={category}
            onCategory={setCategory}
            sort={sort}
            onSort={setSort}
            tickets={filteredTickets}
            onCreateTicket={() => setIsCreateModalOpen(true)}
            onRefresh={handleRefresh}
            isRefreshing={false}
            refreshLoad={refreshLoad}
            onSelect={setSelectedTicketId}
            selectedTicketId={selectedTicketId}
          />
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:grid lg:grid-cols-12">
        <div className="col-span-5 h-full min-h-screen">
          <AllTicketsSection
            search={search}
            onSearch={setSearch}
            status={status}
            onStatus={setStatus}
            category={category}
            onCategory={setCategory}
            sort={sort}
            onSort={setSort}
            onSelect={setSelectedTicketId}
            tickets={filteredTickets}
            selectedTicketId={selectedTicketId}
            onCreateTicket={() => setIsCreateModalOpen(true)}
            onRefresh={handleRefresh}
            isRefreshing={false}
            refreshLoad={refreshLoad}
          />
        </div>
        <div className="col-span-7 h-full overflow-hidden">
          <ViewTicketSection
            key={selectedTicket ? `${selectedTicket._id}-${selectedTicket.replies.length}` : 'no-ticket'}
            selectedTicket={selectedTicket}
            replyText={replyText}
            onReplyChange={setReplyText}
            onSendReply={handleSendReply}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onMessageEdit={handleMessageEdit}
            onMessageDelete={handleMessageDelete}
            onMessageReply={() => { }} // Not implemented for wholesalers
            currentUserType={currentUserType}
            onDeleteConfirm={handleDelete}
            onMessageEditConfirm={handleMessageEditSubmit}
            isSendingReply={isSendingReply}
            refreshLoad={refreshLoad}
          />
        </div>
      </div>


      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        ticket={selectedDeleteTicket}
        isLoading={isDeletingTicket}
      />
      <StatusChangeModal
        isOpen={isStatusChangeModalOpen}
        onClose={() => {
          setIsStatusChangeModalOpen(false);
          setSelectedStatusChangeTicket(null);
        }}
        onSubmit={handleStatusChangeSubmit}
        currentStatus={selectedStatusChangeTicket?.status || 'open'}
        ticketSubject={selectedStatusChangeTicket?.subject || ''}
        isLoading={false}
      />
      <MessageEditModal
        isOpen={isMessageEditModalOpen}
        onClose={() => {
          setIsMessageEditModalOpen(false);
          setSelectedEditMessage(null);
        }}
        onSubmit={handleMessageEditSubmit}
        messageId={selectedEditMessage?.id || ''}
        currentContent={selectedEditMessage?.content || ''}
        isLoading={false}
      />
    </div>
  );
};

export default SupportTicketsPage;
