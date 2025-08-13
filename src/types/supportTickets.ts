export type StatusType = "all" | "open" | "in_progress" | "closed";
export type CategoryType = "all" | "Operation" | "Technical" | "Finance" | "Sales";
export type SortType = "Recent" | "Oldest";
export type SenderType = "agency_admin" | "wholesaler_admin";

export interface Agency {
  _id: string;
  agencyName: string;
  email: string;
  avatar: string;
}

export interface Wholesaler {
  _id: string;
  wholesalerName: string;
  email: string;
  avatar: string;
}

export interface Reply {
  sender: SenderType;
  message: string;
  _id: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  agency: Agency;
  wholesaler: Wholesaler;
  subject: string;
  status: Exclude<StatusType, "all">;
  category: Exclude<CategoryType, "all">;
  replies: Reply[];
  ticketNumber: string;
  createdAt: string;
  updatedAt: string;
  createdBy: SenderType;
}

export interface TicketResponse {
  success: boolean;
  message: string;
  data: Ticket[];
}

// New types for agency and wholesaler state in SupportTicketsLogic
export type AgencyState = Agency | null;
export type WholesalerState = Wholesaler | null;

export interface StatusColors {
  [key: string]: {
    bg: string;
    text: string;
  };
} 