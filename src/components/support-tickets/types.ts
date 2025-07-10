export type StatusType = "all" | "open" | "closed" | "pending";
export type SortType = "Recent" | "Oldest";
export type SenderType = "agency_admin" | "wholesaler_admin";

export interface Agency {
  _id: string;
  agencyName: string;
  email: string;
}

export interface Wholesaler {
  _id: string;
  wholesalerName: string;
  email: string;
}

export interface Reply {
  _id: string;
  sender: SenderType;
  message: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  agencyId: Agency;
  wholesalerId: Wholesaler;
  subject: string;
  status: Exclude<StatusType, "all">;
  replies: Reply[];
  ticketNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketResponse {
  success: boolean;
  message: string;
  data: Ticket[];
}

export interface Message {
  id: string;
  sender: {
    type: "Wholesaler" | "Agency";
    name: string;
  };
  content: string;
  createdAt: string;
}

export interface TicketDetails {
  subject: string;
  createdAt: string;
  messages: Message[];
}

export interface StatusColors {
  [key: string]: {
    bg: string;
    text: string;
  };
} 