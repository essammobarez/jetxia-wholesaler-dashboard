import { AllTicketsSection, ViewTicketSection } from "@/components/support-tickets";
import { mockTickets } from "@/components/support-tickets/mockTickets";
import { Message, StatusType, SortType, Ticket, TicketResponse } from "@/components/support-tickets/types";
import CreateTicketModal from "@/components/support-tickets/CreateTicketModal";
import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import LoadingSpinner from "@/components/ui/loading-spinner";
import EditTicketModal from "@/components/support-tickets/EditTicketModal";
import DeleteConfirmModal from "@/components/support-tickets/DeleteConfirmModal";

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken") || "";
  }
  return "";
};

const SupportTicketsPage = () => {
  // API States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  // States for ticket list
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusType>("all");
  const [sort, setSort] = useState<SortType>("Recent");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedEditTicket, setSelectedEditTicket] = useState<Ticket | null>(null);
  const [selectedDeleteTicket, setSelectedDeleteTicket] = useState<Ticket | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // States for ticket details
  const [replyText, setReplyText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);
  const [updated, setUpdated] = useState<boolean>(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // API configuration
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const token = getAuthToken();

  const fetchTickets = useCallback(async () => {
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
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch tickets"
      );
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Filter and sort tickets
  const filteredTickets = (tickets.length > 0 ? tickets : [])
    .filter((ticket) => {
      const matchesStatus = status === "all" || ticket.status === status;
      const matchesSearch =
        ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
        ticket.replies.some((reply) =>
          reply.message.toLowerCase().includes(search.toLowerCase())
        );
      return matchesStatus && matchesSearch;
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
    async (data: { subject: string; message: string }) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.post<TicketResponse>(
          `${apiUrl}support/create-ticket`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          await fetchTickets();
          setIsCreateModalOpen(false);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error("Error creating ticket:", error);
        setError(
          error instanceof Error ? error.message : "Failed to create ticket"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, token, fetchTickets]
  );

  const handleSendReply = useCallback(async () => {
    if (!replyText.trim() || !selectedTicket?._id) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.post<TicketResponse>(
        `${apiUrl}support/reply-ticket/${selectedTicket?._id}`,
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
        await fetchTickets();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      setError(
        error instanceof Error ? error.message : "Failed to send reply"
      );
    } finally {
      setIsLoading(false);
    }
  }, [replyText, selectedTicket, apiUrl, token, fetchTickets]);

  const handleEdit = useCallback((ticket: Ticket) => {
    setSelectedEditTicket(ticket);
    setIsEditModalOpen(true);
  }, []);

  const handleEditSubmit = useCallback(
    async (data: { id: string; subject: string; message: string }) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.patch<TicketResponse>(
          `${apiUrl}support/edit-tickets/${data.id}`,
          {
            subject: data.subject,
            message: data.message,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          await fetchTickets();
          setIsEditModalOpen(false);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error("Error editing ticket:", error);
        setError(
          error instanceof Error ? error.message : "Failed to edit ticket"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, token, fetchTickets]
  );

  const handleDelete = useCallback((ticket: Ticket) => {
    setSelectedDeleteTicket(ticket);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
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
          await fetchTickets();
          setIsDeleteModalOpen(false);
          setSelectedDeleteTicket(null);
          setSelectedTicket(null);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error("Error deleting ticket:", error);
        setError(
          error instanceof Error ? error.message : "Failed to delete ticket"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, token, fetchTickets]
  );

  const handleMessageEdit = useCallback((messageId: string) => {
    console.log("Edit message:", messageId);
  }, []);

  const handleMessageDelete = useCallback(
    async (messageId: string) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.delete<TicketResponse>(
          `${apiUrl}support/messages/${messageId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          await fetchTickets();
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error("Error deleting message:", error);
        setError(
          error instanceof Error ? error.message : "Failed to delete message"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, token, fetchTickets]
  );

  const handleMessageReply = useCallback(
    async (messageId: string) => {
      if (!selectedTicket?._id) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.post<TicketResponse>(
          `${apiUrl}support/tickets/agency`,
          {
            sender: "agency",
            message: replyText,
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
          await fetchTickets();
          setUpdated((prev) => !prev);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error("Error replying to message:", error);
        setError(
          error instanceof Error ? error.message : "Failed to reply to message"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTicket?._id, replyText, apiUrl, token, fetchTickets]
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
      {isLoading && (
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
                selectedTicket={selectedTicket}
                replyText={replyText}
                onReplyChange={setReplyText}
                onSendReply={handleSendReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMessageEdit={handleMessageEdit}
                onMessageDelete={handleMessageDelete}
                onMessageReply={handleMessageReply}
                updated={updated}
              />
            </div>
          </div>
        ) : (
          <AllTicketsSection
            search={search}
            onSearch={setSearch}
            status={status}
            onStatus={setStatus}
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
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:grid md:grid-cols-12 min-h-screen">
        <div className="col-span-5">
          <AllTicketsSection
            search={search}
            onSearch={setSearch}
            status={status}
            onStatus={setStatus}
            sort={sort}
            onSort={setSort}
            selectedTicket={selectedTicket}
            onSelect={setSelectedTicket}
            tickets={filteredTickets}
            onCreateTicket={handleCreateTicket}
            isDropdownOpen={isDropdownOpen}
            onDropdownToggle={handleDropdownToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
        <div className="col-span-7 overflow-auto">
          <ViewTicketSection
            selectedTicket={selectedTicket}
            replyText={replyText}
            onReplyChange={setReplyText}
            onSendReply={handleSendReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMessageEdit={handleMessageEdit}
            onMessageDelete={handleMessageDelete}
            onMessageReply={handleMessageReply}
            updated={updated}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTicketSubmit}
      />
      <EditTicketModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        ticket={selectedEditTicket}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        ticket={selectedDeleteTicket}
      />
    </div>
  );
};

export default SupportTicketsPage;