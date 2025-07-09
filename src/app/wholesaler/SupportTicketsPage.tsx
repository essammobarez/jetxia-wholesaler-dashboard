import { AllTicketsSection, ViewTicketSection } from "@/components/support-tickets";
import { mockTickets } from "@/components/support-tickets/mockTickets";
import { Message, StatusType, SortType, Ticket } from "@/components/support-tickets/types";
import CreateTicketModal from "@/components/support-tickets/CreateTicketModal";
import React, { useState, useCallback } from "react";

const SupportTicketsPage = () => {
  // States for ticket list
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusType>("All");
  const [sort, setSort] = useState<SortType>("Recent");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // States for ticket details
  const [replyText, setReplyText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null);

  // Filter and sort tickets
  const filteredTickets = mockTickets
    .filter((ticket) => {
      const matchesStatus = status === "All" || ticket.status === status;
      const matchesSearch =
        ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
        ticket.message.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) =>
      sort === "Recent"
        ? new Date(b.created).getTime() - new Date(a.created).getTime()
        : new Date(a.created).getTime() - new Date(b.created).getTime()
    );

  // Event handlers
  const handleCreateTicket = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateTicketSubmit = useCallback((data: { subject: string; message: string }) => {
    // TODO: Implement actual ticket creation API call
    console.log("Creating ticket:", data);
  }, []);

  const handleSendReply = useCallback(() => {
    if (!replyText.trim()) return;
    // TODO: Implement send reply
    console.log("Sending reply:", replyText);
    setReplyText("");
  }, [replyText]);

  const handleEdit = useCallback(() => {
    // TODO: Implement edit
    console.log("Edit clicked");
  }, []);

  const handleDelete = useCallback(() => {
    // TODO: Implement delete
    console.log("Delete clicked");
  }, []);

  const handleMessageEdit = useCallback((messageId: string) => {
    // TODO: Implement message edit
    console.log("Edit message:", messageId);
  }, []);

  const handleMessageDelete = useCallback((messageId: string) => {
    // TODO: Implement message delete
    console.log("Delete message:", messageId);
  }, []);

  const handleMessageReply = useCallback((messageId: string) => {
    // TODO: Implement message reply
    console.log("Reply to message:", messageId);
  }, []);

  const handleDropdownToggle = useCallback((ticketId: number | null) => {
    setIsDropdownOpen(ticketId);
  }, []);

  // Click outside handler for dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-menu')) {
          setIsDropdownOpen(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div className="grid grid-cols-12 min-h-screen bg-gray-50">
      {/* Left Panel - Ticket List */}
      <div className="col-span-5">
        <AllTicketsSection
          search={search}
          onSearch={setSearch}
          status={status}
          onStatus={setStatus}
          sort={sort}
          onSort={setSort}
          selectedId={selectedId}
          onSelect={setSelectedId}
          tickets={filteredTickets}
          onCreateTicket={handleCreateTicket}
          isDropdownOpen={isDropdownOpen}
          onDropdownToggle={handleDropdownToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Right Panel - Ticket Detail */}
      <div className="col-span-7 overflow-auto">
        <ViewTicketSection
          selectedId={selectedId}
          replyText={replyText}
          onReplyChange={setReplyText}
          onSendReply={handleSendReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMessageEdit={handleMessageEdit}
          onMessageDelete={handleMessageDelete}
          onMessageReply={handleMessageReply}
        />
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTicketSubmit}
      />
    </div>
  );
};

export default SupportTicketsPage;
