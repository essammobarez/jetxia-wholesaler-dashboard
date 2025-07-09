import type { Ticket } from './TicketCard';

export const mockTickets: Ticket[] = [
  {
    id: 1,
    subject: 'Need assistance with bulk hotel booking',
    created: '2025-06-20',
    status: 'Open',
    agency: 'WS',
    agencyName: 'Wanderlust Solutions',
    message: 'Hi, we need to book 50 rooms for a corporate event in Dubai next month. Could you help us with getting the best rates and availability?',
    replies: 2,
    // avatarUrl: 'https://example.com/avatar1.jpg' // Optional: Remove if not using real avatars
  },
  {
    id: 2,
    subject: 'Flight booking cancellation request',
    created: '2025-06-19',
    status: 'Pending',
    agency: 'GT',
    agencyName: 'Global Travels',
    message: 'Due to unforeseen circumstances, we need to cancel the group booking for flight AB123 scheduled for July 15th. Please advise on the cancellation process and any applicable fees.',
    replies: 3
  },
  {
    id: 3,
    subject: 'Package customization inquiry',
    created: '2025-06-18',
    status: 'Open',
    agency: 'VE',
    agencyName: 'Voyage Express',
    message: 'We have a client interested in the Thailand package, but they want to extend the stay in Phuket and add some additional activities. Can we discuss the possibilities?',
    replies: 1
  },
  {
    id: 4,
    subject: 'Technical issue with booking portal',
    created: '2025-06-17',
    status: 'Closed',
    agency: 'TM',
    agencyName: 'Travel Masters',
    message: 'We are experiencing issues with the online booking portal. The system keeps timing out when we try to process payments. This is affecting our operations.',
    replies: 5
  },
]; 