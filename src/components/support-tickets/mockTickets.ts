import { Ticket } from "@/types/supportTypes";

export const mockTickets: Ticket[] = [
  {
    _id: "1",
    agencyId: "agency1",
    wholesalerId: {
      _id: "wholesaler1",
      email: "contact@wholesaler1.com"
    },
    subject: "Need help with booking",
    status: "open",
    replies: [
      {
        _id: "reply1",
        sender: "agency_admin",
        message: "I need assistance with a booking issue",
        createdAt: "2024-01-01T10:00:00.000Z"
      }
    ],
    ticketNumber: "TCK-1234-5678",
    createdAt: "2024-01-01T10:00:00.000Z",
    updatedAt: "2024-01-01T10:00:00.000Z"
  },
  {
    _id: "2",
    agencyId: "agency1",
    wholesalerId: {
      _id: "wholesaler2",
      email: "contact@wholesaler2.com"
    },
    subject: "Payment issue",
    status: "pending",
    replies: [
      {
        _id: "reply2",
        sender: "agency_admin",
        message: "Having trouble with payment processing",
        createdAt: "2024-01-02T10:00:00.000Z"
      }
    ],
    ticketNumber: "TCK-1234-5679",
    createdAt: "2024-01-02T10:00:00.000Z",
    updatedAt: "2024-01-02T10:00:00.000Z"
  },
  {
    _id: "3",
    agencyId: "agency1",
    wholesalerId: {
      _id: "wholesaler1",
      email: "contact@wholesaler1.com"
    },
    subject: "Refund request",
    status: "closed",
    replies: [
      {
        _id: "reply3",
        sender: "agency_admin",
        message: "Need to process a refund for booking",
        createdAt: "2024-01-03T10:00:00.000Z"
      }
    ],
    ticketNumber: "TCK-1234-5680",
    createdAt: "2024-01-03T10:00:00.000Z",
    updatedAt: "2024-01-03T10:00:00.000Z"
  }
]; 