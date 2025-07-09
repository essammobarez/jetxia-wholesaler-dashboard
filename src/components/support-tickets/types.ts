export interface Message {
  id: string;
  sender: {
    type: "Wholesaler" | "Agency";
    name: string;
  };
  content: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  subject: string;
  created: string;
  status: "Open" | "Closed" | "Pending";
  agency: string;
  agencyName: string;
  message: string;
  replies: number;
  avatarUrl?: string;
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

export type SortType = "Recent" | "Oldest";
export type StatusType = "All" | "Open" | "Closed" | "Pending"; 