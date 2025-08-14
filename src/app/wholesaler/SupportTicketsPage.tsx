import { AllTicketsSection, StatusType, Ticket, ViewTicketSection, CategoryType, Reply, SortType, TicketResponse, Agency, Wholesaler, AgencyState, WholesalerState } from "@/components/support-tickets";
import { mockTickets } from "@/components/support-tickets/mockTickets";
import CreateTicketModal from "@/components/support-tickets/CreateTicketModal";
import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import LoadingSpinner from "@/components/ui/loading-spinner";
import LoadingOverlay from "@/components/ui/loading-overlay";
import DeleteConfirmModal from "@/components/support-tickets/DeleteConfirmModal";
import StatusChangeModal from "@/components/support-tickets/StatusChangeModal";
import MessageEditModal from "@/components/support-tickets/MessageEditModal";
import { jwtDecode } from "jwt-decode";

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
  if (!token) return "wholesaler_admin"; // Default to wholesaler_admin for this page
  try {
    const decoded = jwtDecode<{ userType?: string }>(token);
    return (decoded.userType as "wholesaler_admin" | "agency_admin") ?? "wholesaler_admin";
  } catch (err) {
    console.error("Error decoding token:", err);
    return "wholesaler_admin"; // Default to wholesaler_admin for this page
  }
};

const SupportTicketsPage = () => {
  // API States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  // ⬇️ ENHANCED: selectedTicket is now updated immediately after each API operation
  // and also refreshed from server to ensure data consistency

  // Granular loading states for different operations
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isDeletingTicket, setIsDeletingTicket] = useState(false);
  const [isRefreshingTickets, setIsRefreshingTickets] = useState(false);

  // States for ticket list
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusType>("all");
  const [category, setCategory] = useState<CategoryType>("all");
  const [sort, setSort] = useState<SortType>("Recent");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedDeleteTicket, setSelectedDeleteTicket] = useState<Ticket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [selectedStatusChangeTicket, setSelectedStatusChangeTicket] = useState<Ticket | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isMessageEditModalOpen, setIsMessageEditModalOpen] = useState(false);
  const [selectedEditMessage, setSelectedEditMessage] = useState<{ id: string; content: string } | null>(null);
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  // New states for agency and wholesaler
  const [agency, setAgency] = useState<AgencyState>(null);
  const [wholesaler, setWholesaler] = useState<WholesalerState>(null);

  // States for ticket details
  const [replyText, setReplyText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);

  // States for ticket details
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // API configuration
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const token = getAuthToken();
  const currentUserType = getCurrentUserType();

  // Helper function to update local state after API operations
  const updateLocalTicketState = useCallback((updatedTicket: Ticket) => {
    console.log("updateLocalTicketState called with:", updatedTicket._id, updatedTicket.status);
    
    // Update tickets list
    setTickets(prev => prev.map(ticket => 
      ticket._id === updatedTicket._id ? updatedTicket : ticket
    ));
    
    // Update selected ticket if it's the current one
    setSelectedTicket(prev => {
      if (prev && prev._id === updatedTicket._id) {
        console.log("Updating selectedTicket to:", updatedTicket._id, updatedTicket.status);
        return updatedTicket;
      }
      return prev;
    });
  }, []);

  // Helper function to refresh ticket data after operations
  const refreshTicketData = useCallback(async (ticketId: string) => {
    try {
      const response = await axios.get<TicketResponse>(
        `${apiUrl}support/tickets/${ticketId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const refreshedTicket = response.data.data[0];
        updateLocalTicketState(refreshedTicket);
      }
    } catch (error) {
      console.error("Error refreshing ticket data:", error);
    }
  }, [apiUrl, token]);

  // ⬇️ NEW: one-call refetch for BOTH list & detail after any successful operation
  const refetchAll = useCallback(
    async (focusTicketId?: string | null) => {
      await fetchTickets();                    // always refetch the list
      if (focusTicketId) {
        await refreshTicketData(focusTicketId); // and ensure the detail view is fresh
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // hook is filled after fetchTickets is defined below; do not inline dependencies to avoid re-creations
  );

  // Helper function to remove ticket from local state
  const removeLocalTicket = useCallback((ticketId: string) => {
    // Remove from tickets list
    setTickets(prev => prev.filter(ticket => ticket._id !== ticketId));
    
    // Clear selected ticket if it was the deleted one
    setSelectedTicket(prev => {
      if (prev && prev._id === ticketId) {
        return null;
      }
      return prev;
    });
  }, []); // Remove selectedTicket dependency to prevent recreation

  const fetchTickets = useCallback(async () => {
    const tokenExists = !!token;
    if (!tokenExists) {
      setError("Authentication required");
      setIsInitialLoading(false);
      return;
    }

    try {
      // Only show initial loading on first load
      if (tickets.length === 0) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshingTickets(true);
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
        
        // Update selected ticket if it still exists in the refreshed list
        if (selectedTicket) {
          const updatedSelectedTicket = response.data.data.find(ticket => ticket._id === selectedTicket._id);
          if (updatedSelectedTicket) {
            console.log("fetchTickets: Updating selectedTicket from list refresh:", updatedSelectedTicket._id, updatedSelectedTicket.status);
            setSelectedTicket(updatedSelectedTicket);
          } else {
            // If selected ticket no longer exists, clear it
            console.log("fetchTickets: Clearing selectedTicket as it no longer exists");
            setSelectedTicket(null);
            setShowMobileDetail(false);
          }
        }
        
        // Mirror reference: extract agency/wholesaler from first ticket if present
        if (response.data.data.length > 0) {
          setAgency(response.data.data[0].agency || null);
          setWholesaler(response.data.data[0].wholesaler || null);
        } else {
          setAgency(null);
          setWholesaler(null);
        }
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch tickets");
    } finally {
      setIsInitialLoading(false);
      setIsRefreshingTickets(false);
    }
  // ⬇️ include only essential deps for API calls
  }, [apiUrl, token, selectedTicket]);

  // Wire refetchAll now that fetchTickets is defined
  // (We assign after definition to keep refetchAll stable)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { (refetchAll as any).fetchTickets = fetchTickets; (refetchAll as any).refreshTicketData = refreshTicketData; }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshingTickets(true);
      setError(null);
      await fetchTickets();
    } catch (error) {
      console.error("Error refreshing tickets:", error);
      setError("Failed to refresh tickets");
    } finally {
      setIsRefreshingTickets(false);
    }
  }, []);

  useEffect(() => {
    setReplyText("");
  }, [selectedTicket?._id]);

  // Filter and sort tickets
  const filteredTickets = (tickets.length > 0 ? tickets : [])
    .filter((ticket) => {
      const matchesStatus = status === "all" || ticket.status === status;
      const matchesCategory = category === "all" || ticket.category === category;
      const matchesSearch =
        ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
        ticket.replies.some((reply) =>
          reply.message.toLowerCase().includes(search.toLowerCase())
        );
      return matchesStatus && matchesCategory && matchesSearch;
    })
    .sort((a, b) =>
      sort === "Recent"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  // Event handlers
  const handleCreateTicket = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateTicketSubmit = useCallback(
    async (data: { subject: string; message: string; category?: string }) => {
      try {
        setIsCreatingTicket(true);
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

        if (response.data.success) {
          // Add the new ticket to the local state instead of reloading
          if (response.data.data && response.data.data.length > 0) {
            const newTicket = response.data.data[0];
            setTickets(prev => [newTicket, ...prev]);
            // Set as selected ticket
            setSelectedTicket(newTicket);
            // ⬇️ ensure both list & detail are refreshed from server
            await refetchAll(newTicket._id);
          }
          setIsCreateModalOpen(false);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error("Error creating ticket:", error);
        setError(error instanceof Error ? error.message : "Failed to create ticket");
      } finally {
        setIsCreatingTicket(false);
      }
    },
    [apiUrl, token]
  );

  const handleSendReply = useCallback(async () => {
    if (!replyText.trim() || !selectedTicket?._id) return;
  
    try {
      setIsSendingReply(true);
      setError(null);
  
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
        setReplyText("");
        // Update the local ticket state with the response data
        if (response.data.data && response.data.data.length > 0) {
          const updatedTicket = response.data.data[0];
          console.log("updated ticket after post", updatedTicket);
          updateLocalTicketState(updatedTicket);
          
          // If this was the selected ticket, update it immediately
          if (selectedTicket && selectedTicket._id === updatedTicket._id) {
            console.log("Immediate selectedTicket update in handleSendReply:", updatedTicket._id, updatedTicket.status);
            setSelectedTicket(updatedTicket);
          }
        }
        // ⬇️ always refetch for both list & view
        await refetchAll(selectedTicket._id);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      setError(error instanceof Error ? error.message : "Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  }, [replyText, selectedTicket, apiUrl, token]);

  const handleDelete = useCallback((ticket: Ticket) => {
    console.log('Delete button clicked for ticket:', ticket._id);
    console.log('Ticket subject:', ticket.subject);
    setSelectedDeleteTicket(ticket);
    setIsDeleteModalOpen(true);
    console.log('Modal should now be open, isDeleteModalOpen:', true);
  }, []);

  const handleReopen = useCallback((ticket: Ticket) => {
    // Wholesalers cannot reopen tickets - this function is disabled
    console.log("Reopen functionality disabled for wholesalers");
  }, []);

  const handleStatusChange = useCallback((ticket: Ticket) => {
    setSelectedStatusChangeTicket(ticket);
    setIsStatusChangeModalOpen(true);
  }, []);

  const handleStatusChangeSubmit = useCallback(async (action: 'close') => {
    if (!selectedStatusChangeTicket) return;

    try {
      setIsChangingStatus(true);
      setError(null);

      // Only close action is supported for wholesalers
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

      if (response && response.data.success) {
        // Update the local ticket state with the response data
        if (response.data.data && response.data.data.length > 0) {
          const updatedTicket = response.data.data[0];
          updateLocalTicketState(updatedTicket);
          
          // If this was the selected ticket, update it immediately
          if (selectedTicket && selectedTicket._id === updatedTicket._id) {
            console.log("Immediate selectedTicket update in handleStatusChangeSubmit:", updatedTicket._id, updatedTicket.status);
            setSelectedTicket(updatedTicket);
          }
        }
        setIsStatusChangeModalOpen(false);
        setSelectedStatusChangeTicket(null);

        // ⬇️ always refetch for both list & view
        await refetchAll(response?.data?.data?.[0]?._id ?? selectedTicket?._id ?? null);
      } else {
        setError(response?.data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error changing status:", error);
      setError(error instanceof Error ? error.message : "Failed to change status");
    } finally {
      setIsChangingStatus(false);
    }
  }, [apiUrl, token, selectedStatusChangeTicket]);

  const handleDeleteConfirm = useCallback(
    async (id: string) => {
      try {
        setIsDeletingTicket(true);
        setError(null);
        
        console.log('Attempting to delete ticket with ID:', id);
        console.log('API URL:', `${apiUrl}support/delete-tickets/${id}`);
        
        const response = await axios.delete<TicketResponse>(
          `${apiUrl}support/delete-tickets/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        // console.log('Delete response:', response.data);
        
        if (response.data.success) {
          console.log('Ticket deleted successfully, updating local state');
          // Remove the ticket from local state instead of reloading
          removeLocalTicket(id);
          setIsDeleteModalOpen(false);
          setSelectedDeleteTicket(null);
          
          // Clear selected ticket if it was the deleted one
          if (selectedTicket && selectedTicket._id === id) {
            setSelectedTicket(null);
            setShowMobileDetail(false);
          }

          // ⬇️ refresh the list to stay in sync (no detail to refetch since ticket was deleted)
          await fetchTickets();
        } else {
          console.error('Delete failed:', response.data.message);
          setError(response.data.message);
        }
      } catch (error) {
        console.error("Error deleting ticket:", error);
        if (axios.isAxiosError(error)) {
          console.error('Axios error details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });
          setError(error.response?.data?.message || error.message);
        } else {
          setError(error instanceof Error ? error.message : "Failed to delete ticket");
        }
      } finally {
        setIsDeletingTicket(false);
      }
    },
    [apiUrl, token, selectedTicket]
  );

  const handleMessageEdit = useCallback((messageId: string) => {
    // Find the message content from the selected ticket
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
      setIsEditingMessage(true);
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
        // Update the local ticket state instead of reloading
        if (response.data.data && response.data.data.length > 0) {
          const updatedTicket = response.data.data[0];
          updateLocalTicketState(updatedTicket);
          
          // If this was the selected ticket, update it immediately
          if (selectedTicket && selectedTicket._id === updatedTicket._id) {
            console.log("Immediate selectedTicket update in handleMessageEditSubmit:", updatedTicket._id, updatedTicket.status);
            setSelectedTicket(updatedTicket);
          }
        }
        setIsMessageEditModalOpen(false);
        setSelectedEditMessage(null);

        // ⬇️ always refetch for both list & view
        await refetchAll(selectedTicket?._id ?? null);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error editing message:", error);
      setError(error instanceof Error ? error.message : "Failed to edit message");
    } finally {
      setIsEditingMessage(false);
    }
  }, [apiUrl, token, selectedTicket]);

  const handleMessageDelete = useCallback(
    async (messageId: string) => {
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
        if (response.data.success) {
          // Update the local ticket state with the response data
          if (response.data.data && response.data.data.length > 0) {
            const updatedTicket = response.data.data[0];
            updateLocalTicketState(updatedTicket);
            
            // If this was the selected ticket, update it immediately
            if (selectedTicket && selectedTicket._id === updatedTicket._id) {
              console.log("Immediate selectedTicket update in handleMessageDelete:", updatedTicket._id, updatedTicket.status);
              setSelectedTicket(updatedTicket);
            }
          }
          // ⬇️ always refetch for both list & view
          await refetchAll(selectedTicket._id);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error("Error deleting message:", error);
        setError(
          error instanceof Error ? error.message : "Failed to delete message"
        );
      }
    },
    [apiUrl, token, selectedTicket]
  );

  const handleMessageReply = useCallback(
    async (messageId: string) => {
      if (!selectedTicket?._id) return;
      try {
        setIsSendingReply(true);
        setError(null);
  
        const response = await axios.post<TicketResponse>(
          `${apiUrl}support/tickets/wholesaler`,
          {
            sender: "wholesaler",
            message: replyText,
            ticketId: selectedTicket._id,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.data.success) {
          setReplyText("");
          // Update the local ticket state with the response data
          if (response.data.data && response.data.data.length > 0) {
            const updatedTicket = response.data.data[0];
            updateLocalTicketState(updatedTicket);
            
            // If this was the selected ticket, update it immediately
            if (selectedTicket && selectedTicket._id === updatedTicket._id) {
              console.log("Immediate selectedTicket update in handleMessageReply:", updatedTicket._id, updatedTicket.status);
              setSelectedTicket(updatedTicket);
            }
          }
          // ⬇️ always refetch for both list & view
          await refetchAll(selectedTicket._id);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error("Error replying to message:", error);
        setError(error instanceof Error ? error.message : "Failed to reply to message");
      } finally {
        setIsSendingReply(false);
      }
    },
    [selectedTicket?._id, replyText, apiUrl, token]
  );

  const handleDropdownToggle = useCallback(
    (ticketId: string | null) => {
      setIsDropdownOpen(ticketId);
    },
    []
  );

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

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* ⬇️ Show full-page overlay ONLY on the very first load */}
      {isInitialLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}

      {/* Mobile View */}
      <div className="md:hidden">
        {showMobileDetail && selectedTicket ? (
          <div className="h-screen flex flex-col bg-white">
            {/* Sticky Back Button Bar */}
            <div className="sticky top-0 z-50 bg-white border-b flex items-center px-4 py-3 shadow-sm">
              <button
                onClick={() => setShowMobileDetail(false)}
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

            {/* Scrollable Content - Below the sticky bar */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <ViewTicketSection
                key={selectedTicket?._id || 'no-ticket'} // Force re-render when ticket changes
                selectedTicket={selectedTicket}
                replyText={replyText}
                onReplyChange={setReplyText}
                onSendReply={handleSendReply}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onMessageEdit={handleMessageEdit}
                onMessageDelete={handleMessageDelete}
                onMessageReply={handleMessageReply}
                currentUserType={currentUserType}
                onDeleteConfirm={handleDelete}
                onMessageEditConfirm={handleMessageEditSubmit}
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
            onSelect={(ticket) => {
              setSelectedTicket(ticket);
              setShowMobileDetail(true);
            }}
            tickets={filteredTickets}
            onCreateTicket={handleCreateTicket}
            isDropdownOpen={isDropdownOpen}
            onDropdownToggle={handleDropdownToggle}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onReopen={handleReopen}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshingTickets}
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
            onCreateTicket={handleCreateTicket}
            isDropdownOpen={isDropdownOpen}
            onDropdownToggle={handleDropdownToggle}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onReopen={handleReopen}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshingTickets}
          />
        </div>
        <div className="col-span-7 h-full overflow-hidden">
          <ViewTicketSection
            key={selectedTicket?._id || 'no-ticket'} // Force re-render when ticket changes
            selectedTicket={selectedTicket}
            replyText={replyText}
            onReplyChange={setReplyText}
            onSendReply={handleSendReply}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onMessageEdit={handleMessageEdit}
            onMessageDelete={handleMessageDelete}
            onMessageReply={handleMessageReply}
            currentUserType={currentUserType}
            onDeleteConfirm={handleDelete}
            onMessageEditConfirm={handleMessageEditSubmit}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTicketSubmit}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        ticket={selectedDeleteTicket}
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
        isLoading={isChangingStatus}
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
        isLoading={isEditingMessage}
      />

      {/* Loading Overlay for Refresh */}
      <LoadingOverlay 
        isVisible={isRefreshingTickets} 
        message="Refreshing tickets..." 
      />
    </div>
  );
};

export default SupportTicketsPage;
