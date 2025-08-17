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

  // Fetch tickets from API - REMOVED selectedTicket dependency to prevent infinite loop
  const fetchTickets = useCallback(async () => {
    if (!token) {
      setError("Authentication required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
        
        // Update selected ticket if it still exists
        if (selectedTicket) {
          const updatedSelectedTicket = response.data.data.find(ticket => ticket._id === selectedTicket._id);
          if (updatedSelectedTicket) {
            setSelectedTicket(updatedSelectedTicket);
          } else {
            setSelectedTicket(null);
            setShowMobileDetail(false);
          }
        }
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch tickets");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, token]); // Removed selectedTicket dependency

  // Initial fetch
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Reset reply text when selected ticket changes
  useEffect(() => {
    setReplyText("");
  }, [selectedTicket?._id]);

  // Debug: Monitor tickets state changes
  useEffect(() => {
    console.log('Tickets state updated:', tickets.length, 'tickets');
    if (selectedTicket) {
      console.log('Selected ticket:', selectedTicket._id, 'with', selectedTicket.replies.length, 'replies');
    }
  }, [tickets, selectedTicket]);

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

  // Create ticket handler
  const handleCreateTicket = useCallback(async (data: { subject: string; message: string; category?: string }) => {
    try {
        setError(null);

        const wholesalerId = getWholesalerId();
        const payload: Record<string, any> = { ...data };
        if (wholesalerId) payload.wholesalerId = wholesalerId;

        const response = await axios.post<TicketResponse>(
          `${apiUrl}support/create-ticket`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

      if (response.data.success && response.data.data && response.data.data.length > 0) {
            const newTicket = response.data.data[0];
            setTickets(prev => [newTicket, ...prev]);
            setSelectedTicket(newTicket);
        setShowMobileDetail(true);
          setIsCreateModalOpen(false);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error("Error creating ticket:", error);
        setError(error instanceof Error ? error.message : "Failed to create ticket");
      }
  }, [apiUrl, token]);

  // Send reply handler
  const handleSendReply = useCallback(async () => {
    if (!replyText.trim() || !selectedTicket?._id) return;
  
    try {
      setIsSendingReply(true);
      // setError(null); // Commented out - no error display
  
      console.log('Sending reply for ticket:', selectedTicket._id);
      console.log('Reply text:', replyText);
  
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
  
      console.log('Reply response:', response.data);
  
      if (response.data.success) {
        // Create a new reply object
        const newReply = {
          _id: Date.now().toString(), // Temporary ID
          sender: 'wholesaler_admin' as const,
          message: replyText,
          createdAt: new Date().toISOString(),
        };
        
        // Create updated ticket with new reply
        const updatedTicket = {
          ...selectedTicket,
          replies: [...selectedTicket.replies, newReply],
        };
        
        console.log('Updated ticket with new reply:', updatedTicket);
        
        // Update tickets list
        setTickets(prev => {
          const newTickets = prev.map(ticket => 
            ticket._id === updatedTicket._id ? updatedTicket : ticket
          );
          console.log('New tickets list:', newTickets);
          return newTickets;
        });
        
        // Update selected ticket
        setSelectedTicket(updatedTicket);
        console.log('Updated selected ticket');
        
        // Clear reply text
        setReplyText("");
      } else {
        console.log('Reply failed:', response.data.message);
        // setError(response.data.message); // Commented out - no error display
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      // setError(error instanceof Error ? error.message : "Failed to send reply"); // Commented out - no error display
    } finally {
      setIsSendingReply(false);
    }
  }, [replyText, selectedTicket, apiUrl, token]);

  // Delete ticket handler
  const handleDelete = useCallback((ticket: Ticket) => {
    setSelectedDeleteTicket(ticket);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async (id: string) => {
    try {
      setIsDeletingTicket(true);
      // setError(null); // Commented out - no error display
      
      console.log('Deleting ticket:', id);
      
      const response = await axios.delete<TicketResponse>(
        `${apiUrl}support/delete-tickets/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Delete response:', response.data);
      
      if (response.data.success) {
        console.log('Ticket deleted successfully');
        
        // Remove from tickets list
        setTickets(prev => {
          const newTickets = prev.filter(ticket => ticket._id !== id);
          console.log('New tickets list after delete:', newTickets);
          return newTickets;
        });
        
        // Clear selected ticket if it was the deleted one
        if (selectedTicket && selectedTicket._id === id) {
          console.log('Clearing selected ticket');
          setSelectedTicket(null);
          setShowMobileDetail(false);
        }
        
        // Close modal
        setIsDeleteModalOpen(false);
        setSelectedDeleteTicket(null);
      } else {
        console.log('Delete failed:', response.data.message);
        // setError(response.data.message); // Commented out - no error display
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      // setError(error instanceof Error ? error.message : "Failed to delete ticket"); // Commented out - no error display
    } finally {
      setIsDeletingTicket(false);
    }
  }, [apiUrl, token, selectedTicket]);

  // Status change handler
  const handleStatusChange = useCallback((ticket: Ticket) => {
    setSelectedStatusChangeTicket(ticket);
    setIsStatusChangeModalOpen(true);
  }, []);

  const handleStatusChangeSubmit = useCallback(async (action: 'close') => {
    if (!selectedStatusChangeTicket) return;

    try {
      setError(null);

      const response = await axios.patch<TicketResponse>(
        `${apiUrl}support/close/${selectedStatusChangeTicket._id}`,
        {"status":"closed"},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.data && response.data.data.length > 0) {
          const updatedTicket = response.data.data[0];
        setTickets(prev => prev.map(ticket => 
          ticket._id === updatedTicket._id ? updatedTicket : ticket
        ));
          
          if (selectedTicket && selectedTicket._id === updatedTicket._id) {
            setSelectedTicket(updatedTicket);
        }
        
        setIsStatusChangeModalOpen(false);
        setSelectedStatusChangeTicket(null);
      } else {
        setError(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error changing status:", error);
      setError(error instanceof Error ? error.message : "Failed to change status");
    }
  }, [apiUrl, token, selectedTicket]);

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

      if (response.data.success && response.data.data && response.data.data.length > 0) {
          const updatedTicket = response.data.data[0];
        setTickets(prev => prev.map(ticket => 
          ticket._id === updatedTicket._id ? updatedTicket : ticket
        ));
          
          if (selectedTicket && selectedTicket._id === updatedTicket._id) {
            setSelectedTicket(updatedTicket);
        }
        
        setIsMessageEditModalOpen(false);
        setSelectedEditMessage(null);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error editing message:", error);
      setError(error instanceof Error ? error.message : "Failed to edit message");
    }
  }, [apiUrl, token, selectedTicket]);

  // Message delete handler
  const handleMessageDelete = useCallback(async (messageId: string) => {
      if (!selectedTicket?._id) return;
      
      try {
        setError(null);
        const response = await axios.delete<TicketResponse>(
          `${apiUrl}support/delete-Reply/${selectedTicket._id}/${messageId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
            const updatedTicket = response.data.data[0];
        setTickets(prev => prev.map(ticket => 
          ticket._id === updatedTicket._id ? updatedTicket : ticket
        ));
            
            if (selectedTicket && selectedTicket._id === updatedTicket._id) {
              setSelectedTicket(updatedTicket);
            }
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error("Error deleting message:", error);
      setError(error instanceof Error ? error.message : "Failed to delete message");
    }
  }, [apiUrl, token, selectedTicket]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await fetchTickets();
  }, [fetchTickets]);

  // Mobile handlers
  const handleMobileSelect = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowMobileDetail(true);
  }, []);

  const handleMobileBack = useCallback(() => {
    setShowMobileDetail(false);
  }, []);

  // Dropdown handlers
  const handleDropdownToggle = useCallback((ticketId: string | null) => {
      setIsDropdownOpen(ticketId);
  }, []);

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
    <div className="min-h-screen bg-gray-50 relative">
      {/* Error Display - Commented out */}
      {/* {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="sr-only">Close</span>
            <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 0 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 0 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )} */}

      {/* Mobile View */}
      <div className="md:hidden">
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
                onMessageReply={() => {}} // Not implemented for wholesalers
                currentUserType={currentUserType}
                onDeleteConfirm={handleDelete}
                onMessageEditConfirm={handleMessageEditSubmit}
                isSendingReply={isSendingReply}
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
            selectedTicket={selectedTicket}
            onSelect={handleMobileSelect}
            tickets={filteredTickets}
            onCreateTicket={() => setIsCreateModalOpen(true)}
            isDropdownOpen={isDropdownOpen}
            onDropdownToggle={handleDropdownToggle}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onReopen={() => {}} // Not available for wholesalers
            onRefresh={handleRefresh}
            isRefreshing={false}
          />
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:grid md:grid-cols-12 h-screen overflow-hidden">
        <div className="col-span-5 h-full">
          <AllTicketsSection
            search={search}
            onSearch={setSearch}
            status={status}
            onStatus={setStatus}
            category={category}
            onCategory={setCategory}
            sort={sort}
            onSort={setSort}
            selectedTicket={selectedTicket}
            onSelect={setSelectedTicket}
            tickets={filteredTickets}
            onCreateTicket={() => setIsCreateModalOpen(true)}
            isDropdownOpen={isDropdownOpen}
            onDropdownToggle={handleDropdownToggle}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onReopen={() => {}} // Not available for wholesalers
            onRefresh={handleRefresh}
            isRefreshing={false}
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
            onMessageReply={() => {}} // Not implemented for wholesalers
            currentUserType={currentUserType}
            onDeleteConfirm={handleDelete}
            onMessageEditConfirm={handleMessageEditSubmit}
            isSendingReply={isSendingReply}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
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
