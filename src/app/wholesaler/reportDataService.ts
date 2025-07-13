// Central booking data service for reports integration

export interface OutstandingItem {
  id: string;
  bookingId: string;
  agencyName: string;
  agencyId: string;
  amount: number;
  currency: string;
  dueDate: string;
  daysPastDue: number;
  serviceType: string;
  clientRef: string;
  status: "pending" | "overdue" | "critical";
  customerName: string;
  checkIn: string;
  checkOut: string;
}

export interface BookingData {
  id: string;
  bookingId: string;
  agencyId: string;
  agencyName: string;
  customerName: string;
  serviceType:
    | "Hotel"
    | "Flight"
    | "Transfer"
    | "Package"
    | "Car Rental"
    | "Train";
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  currency: string;
  status:
    | "upcoming"
    | "active"
    | "completed"
    | "cancelled"
    | "pending"
    | "confirmed";
  paymentStatus: "paid" | "pending" | "overdue" | "failed" | "partial";
  bookingDate: string;
  clientRef: string;
  commission: number;
  markup: number;
  supplier: string;
  destination: string;
  dueDate: string;
  paymentMethod: string;
  transactionId: string;
  notes: string;
}

export interface TransactionData {
  id: string;
  bookingId: string;
  agencyId: string;
  date: string;
  description: string;
  type:
    | "booking"
    | "payment"
    | "refund"
    | "commission"
    | "markup"
    | "adjustment";
  debit: number;
  credit: number;
  balance: number;
  reference: string;
  paymentMethod?: string;
  currency: string;
}

export interface AgencyFinancialData {
  agencyId: string;
  agencyName: string;
  currentBalance: number;
  creditLimit: number;
  totalOutstanding: number;
  totalPaid: number;
  totalBookings: number;
  averageBookingValue: number;
  paymentTerms: string;
  lastPayment: string;
  currency: string;
}

// Mock booking data that integrates with OverviewTab data structure
export const mockBookingsData: BookingData[] = [
  {
    id: "1",
    bookingId: "BK-2024-001",
    agencyId: "1",
    agencyName: "Global Travels Co.",
    customerName: "John Smith",
    serviceType: "Hotel",
    checkIn: "2024-02-01",
    checkOut: "2024-02-05",
    totalAmount: 1250.0,
    paidAmount: 0.0,
    outstandingAmount: 1250.0,
    currency: "USD",
    status: "confirmed",
    paymentStatus: "overdue",
    bookingDate: "2024-01-15",
    clientRef: "GT-REF-001",
    commission: 125.0,
    markup: 50.0,
    supplier: "Hilton Hotels",
    destination: "New York, USA",
    dueDate: "2024-01-20",
    paymentMethod: "Bank Transfer",
    transactionId: "TXN-001",
    notes: "VIP client - priority handling",
  },
  {
    id: "2",
    bookingId: "BK-2024-002",
    agencyId: "2",
    agencyName: "Sunrise Tours",
    customerName: "Sarah Wilson",
    serviceType: "Hotel",
    checkIn: "2024-01-25",
    checkOut: "2024-01-28",
    totalAmount: 850.0,
    paidAmount: 0.0,
    outstandingAmount: 850.0,
    currency: "USD",
    status: "pending",
    paymentStatus: "pending",
    bookingDate: "2024-01-10",
    clientRef: "ST-REF-002",
    commission: 85.0,
    markup: 30.0,
    supplier: "Marriott Hotels",
    destination: "Los Angeles, USA",
    dueDate: "2024-01-25",
    paymentMethod: "Credit Card",
    transactionId: "TXN-002",
    notes: "Standard booking",
  },
  {
    id: "3",
    bookingId: "BK-2024-003",
    agencyId: "3",
    agencyName: "Adventure Seekers",
    customerName: "Mike Johnson",
    serviceType: "Flight",
    checkIn: "2024-02-10",
    checkOut: "2024-02-17",
    totalAmount: 1850.0,
    paidAmount: 1850.0,
    outstandingAmount: 0.0,
    currency: "USD",
    status: "completed",
    paymentStatus: "paid",
    bookingDate: "2024-01-05",
    clientRef: "AS-REF-003",
    commission: 185.0,
    markup: 75.0,
    supplier: "Delta Airlines",
    destination: "Paris, France",
    dueDate: "2024-01-10",
    paymentMethod: "Bank Transfer",
    transactionId: "TXN-003",
    notes: "Business class upgrade",
  },
  {
    id: "4",
    bookingId: "BK-2024-004",
    agencyId: "4",
    agencyName: "City Break Experts",
    customerName: "Emma Davis",
    serviceType: "Package",
    checkIn: "2024-03-01",
    checkOut: "2024-03-07",
    totalAmount: 2100.0,
    paidAmount: 1050.0,
    outstandingAmount: 1050.0,
    currency: "USD",
    status: "active",
    paymentStatus: "partial",
    bookingDate: "2024-01-20",
    clientRef: "CBE-REF-004",
    commission: 210.0,
    markup: 100.0,
    supplier: "Tour Operator ABC",
    destination: "Rome, Italy",
    dueDate: "2024-02-15",
    paymentMethod: "Credit Card",
    transactionId: "TXN-004",
    notes: "Honeymoon package",
  },
  {
    id: "5",
    bookingId: "BK-2024-005",
    agencyId: "5",
    agencyName: "Luxury Escapes",
    customerName: "Robert Brown",
    serviceType: "Hotel",
    checkIn: "2024-02-15",
    checkOut: "2024-02-20",
    totalAmount: 3200.0,
    paidAmount: 3200.0,
    outstandingAmount: 0.0,
    currency: "USD",
    status: "confirmed",
    paymentStatus: "paid",
    bookingDate: "2024-01-08",
    clientRef: "LE-REF-005",
    commission: 320.0,
    markup: 150.0,
    supplier: "Ritz Carlton",
    destination: "Dubai, UAE",
    dueDate: "2024-01-15",
    paymentMethod: "Bank Transfer",
    transactionId: "TXN-005",
    notes: "Presidential suite booking",
  },
  {
    id: "6",
    bookingId: "BK-2024-006",
    agencyId: "1",
    agencyName: "Global Travels Co.",
    customerName: "Lisa Anderson",
    serviceType: "Transfer",
    checkIn: "2024-01-30",
    checkOut: "2024-01-30",
    totalAmount: 150.0,
    paidAmount: 0.0,
    outstandingAmount: 150.0,
    currency: "USD",
    status: "pending",
    paymentStatus: "overdue",
    bookingDate: "2024-01-25",
    clientRef: "GT-REF-006",
    commission: 15.0,
    markup: 10.0,
    supplier: "Airport Transfers Ltd",
    destination: "London, UK",
    dueDate: "2024-01-28",
    paymentMethod: "Credit Card",
    transactionId: "TXN-006",
    notes: "Airport pickup service",
  },
];

// Generate transaction data from bookings
export const generateTransactionData = (
  bookingsData: BookingData[]
): TransactionData[] => {
  const transactions: TransactionData[] = [];

  bookingsData.forEach((booking) => {
    // Booking transaction (debit)
    transactions.push({
      id: `txn-${booking.id}-booking`,
      bookingId: booking.bookingId,
      agencyId: booking.agencyId,
      date: booking.bookingDate,
      description: `${booking.serviceType} booking - ${booking.destination}`,
      type: "booking",
      debit: booking.totalAmount,
      credit: 0,
      balance: 0, // Will be calculated dynamically
      reference: booking.clientRef,
      currency: booking.currency,
    });

    // Payment transaction (credit) if paid
    if (booking.paidAmount > 0) {
      transactions.push({
        id: `txn-${booking.id}-payment`,
        bookingId: booking.bookingId,
        agencyId: booking.agencyId,
        date:
          booking.paymentStatus === "paid"
            ? booking.dueDate
            : new Date().toISOString().split("T")[0],
        description: `Payment received - ${booking.bookingId}`,
        type: "payment",
        debit: 0,
        credit: booking.paidAmount,
        balance: 0, // Will be calculated dynamically
        reference: booking.transactionId,
        paymentMethod: booking.paymentMethod,
        currency: booking.currency,
      });
    }

    // Commission transaction
    if (booking.commission > 0) {
      transactions.push({
        id: `txn-${booking.id}-commission`,
        bookingId: booking.bookingId,
        agencyId: booking.agencyId,
        date: booking.bookingDate,
        description: `Commission - ${booking.bookingId}`,
        type: "commission",
        debit: 0,
        credit: booking.commission,
        balance: 0,
        reference: booking.clientRef,
        currency: booking.currency,
      });
    }

    // Markup transaction
    if (booking.markup > 0) {
      transactions.push({
        id: `txn-${booking.id}-markup`,
        bookingId: booking.bookingId,
        agencyId: booking.agencyId,
        date: booking.bookingDate,
        description: `Markup - ${booking.bookingId}`,
        type: "markup",
        debit: booking.markup,
        credit: 0,
        balance: 0,
        reference: booking.clientRef,
        currency: booking.currency,
      });
    }
  });

  // Sort by date and calculate running balance
  transactions.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningBalance = 0;
  transactions.forEach((txn) => {
    runningBalance += txn.credit - txn.debit;
    txn.balance = runningBalance;
  });

  return transactions;
};

// Get agency financial summary
export const getAgencyFinancialData = (
  agencyId: string,
  bookingsData: BookingData[]
): AgencyFinancialData | null => {
  const agencyBookings = bookingsData.filter(
    (booking) => booking.agencyId === agencyId
  );

  if (agencyBookings.length === 0) return null;

  const totalOutstanding = agencyBookings.reduce(
    (sum, booking) => sum + booking.outstandingAmount,
    0
  );
  const totalPaid = agencyBookings.reduce(
    (sum, booking) => sum + booking.paidAmount,
    0
  );
  const totalBookings = agencyBookings.length;
  const averageBookingValue =
    agencyBookings.reduce((sum, booking) => sum + booking.totalAmount, 0) /
    totalBookings;

  const lastPaymentBooking = agencyBookings
    .filter((booking) => booking.paidAmount > 0)
    .sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    )[0];

  return {
    agencyId,
    agencyName: agencyBookings[0].agencyName,
    currentBalance: totalPaid - totalOutstanding,
    creditLimit: 10000, // Default credit limit
    totalOutstanding,
    totalPaid,
    totalBookings,
    averageBookingValue,
    paymentTerms: "30 days",
    lastPayment: lastPaymentBooking ? lastPaymentBooking.dueDate : "Never",
    currency: "USD",
  };
};

// Service functions for reports
// Note: getOutstandingReportData function removed - now using only API data
// export const getOutstandingReportData = () => { ... } - REMOVED

export const getLedgerReportData = (agencyId?: string) => {
  const transactions = generateTransactionData(mockBookingsData);
  return agencyId
    ? transactions.filter((txn) => txn.agencyId === agencyId)
    : transactions;
};

export const getPaymentReportData = () => {
  return mockBookingsData.map((booking) => ({
    id: booking.id,
    bookingId: booking.bookingId,
    agencyName: booking.agencyName,
    agencyId: booking.agencyId,
    amount: booking.totalAmount,
    paidAmount: booking.paidAmount,
    currency: booking.currency,
    paymentStatus: booking.paymentStatus,
    paymentMethod: booking.paymentMethod,
    transactionId: booking.transactionId,
    dueDate: booking.dueDate,
    serviceType: booking.serviceType,
    customerName: booking.customerName,
    processingFee: Math.round(booking.totalAmount * 0.025 * 100) / 100, // 2.5% processing fee
    netAmount:
      booking.paidAmount - Math.round(booking.totalAmount * 0.025 * 100) / 100,
  }));
};

export const getStatementData = (agencyId: string) => {
  const agencyBookings = mockBookingsData.filter(
    (booking) => booking.agencyId === agencyId
  );
  const agencyTransactions = generateTransactionData(agencyBookings);
  const financialData = getAgencyFinancialData(agencyId, mockBookingsData);

  if (!financialData) return null;

  return {
    agencyId,
    agencyName: financialData.agencyName,
    statementPeriod: {
      from: "2024-01-01",
      to: new Date().toISOString().split("T")[0],
    },
    openingBalance: 0,
    closingBalance: financialData.currentBalance,
    totalDebits: agencyTransactions.reduce((sum, txn) => sum + txn.debit, 0),
    totalCredits: agencyTransactions.reduce((sum, txn) => sum + txn.credit, 0),
    currency: "USD",
    entries: agencyTransactions.map((txn) => ({
      id: txn.id,
      date: txn.date,
      description: txn.description,
      bookingId: txn.bookingId,
      reference: txn.reference,
      debit: txn.debit,
      credit: txn.credit,
      runningBalance: txn.balance,
    })),
    paymentTerms: financialData.paymentTerms,
    creditLimit: financialData.creditLimit,
  };
};

// Enhanced analytics data service
export const getAnalyticsData = () => {
  const today = new Date();
  const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentBookings = mockBookingsData.filter(
    (booking) => new Date(booking.bookingDate) >= last30Days
  );

  const totalRevenue = mockBookingsData.reduce(
    (sum, booking) => sum + booking.totalAmount,
    0
  );
  const recentRevenue = recentBookings.reduce(
    (sum, booking) => sum + booking.totalAmount,
    0
  );

  const serviceStats = mockBookingsData.reduce((acc, booking) => {
    if (!acc[booking.serviceType]) {
      acc[booking.serviceType] = { count: 0, revenue: 0 };
    }
    acc[booking.serviceType].count++;
    acc[booking.serviceType].revenue += booking.totalAmount;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const agencyStats = mockBookingsData.reduce((acc, booking) => {
    if (!acc[booking.agencyName]) {
      acc[booking.agencyName] = { bookings: 0, revenue: 0 };
    }
    acc[booking.agencyName].bookings++;
    acc[booking.agencyName].revenue += booking.totalAmount;
    return acc;
  }, {} as Record<string, { bookings: number; revenue: number }>);

  return {
    overview: {
      totalRevenue,
      recentRevenue,
      totalBookings: mockBookingsData.length,
      recentBookings: recentBookings.length,
      averageBookingValue: totalRevenue / mockBookingsData.length,
      growthRate: (recentRevenue / totalRevenue) * 100 || 0,
    },
    serviceBreakdown: Object.entries(serviceStats).map(([service, stats]) => ({
      service,
      ...stats,
      percentage: (stats.revenue / totalRevenue) * 100,
    })),
    topAgencies: Object.entries(agencyStats)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([name, stats]) => ({ name, ...stats })),
    monthlyTrend: generateMonthlyTrend(),
    paymentAnalysis: getPaymentAnalysis(),
  };
};

const generateMonthlyTrend = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 50000) + 30000,
    bookings: Math.floor(Math.random() * 200) + 100,
  }));
};

const getPaymentAnalysis = () => {
  const payments = getPaymentReportData();
  const statusCounts = payments.reduce((acc, payment) => {
    acc[payment.paymentStatus] = (acc[payment.paymentStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    statusDistribution: statusCounts,
    averageProcessingTime: 2.3,
    successRate: ((statusCounts.completed || 0) / payments.length) * 100,
  };
};

// Real-time dashboard metrics
export const getDashboardMetrics = () => {
  return {
    activeSessions: Math.floor(Math.random() * 30) + 15,
    processingQueue: Math.floor(Math.random() * 15) + 3,
    systemHealth: 95 + Math.random() * 5,
    lastUpdated: new Date().toISOString(),
  };
};

// API function to fetch real booking data
export const fetchRealBookingData = async (wholesalerId: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const response = await fetch(
      `${apiUrl}/booking/wholesaler/${wholesalerId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data.bookings && Array.isArray(data.bookings)) {
      return data.bookings;
    } else {
      console.warn("Unexpected API response format:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching booking data:", error);
    throw error;
  }
};

// API function to fetch agency data
export const fetchAgencyData = async (wholesalerId: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const response = await fetch(`${apiUrl}/agency/wholesaler/${wholesalerId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Handle different response formats
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.warn("Unexpected agency API response format:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching agency data:", error);
    throw error;
  }
};

// Transform API data to OutstandingItem format
export const transformApiDataToOutstandingItems = (
  apiData: any[]
): OutstandingItem[] => {
  if (!Array.isArray(apiData)) {
    console.warn("API data is not an array:", apiData);
    return [];
  }

  return apiData
    .map((booking, index) => {
      const bookingData = booking.bookingData?.detailedInfo;
      const customerName = bookingData?.passengers?.[0]
        ? `${bookingData.passengers[0].firstName || ""} ${
            bookingData.passengers[0].lastName || ""
          }`.trim()
        : "N/A";

      const checkIn = bookingData?.serviceDates?.startDate
        ? new Date(bookingData.serviceDates.startDate).toLocaleDateString()
        : "N/A";

      const checkOut = bookingData?.serviceDates?.endDate
        ? new Date(bookingData.serviceDates.endDate).toLocaleDateString()
        : "N/A";

      const dueDate = booking.modificationDetails?.modifiedAt
        ? new Date(booking.modificationDetails.modifiedAt).toLocaleDateString()
        : "N/A";

      const daysPastDue = booking.modificationDetails?.modifiedAt
        ? Math.floor(
            (new Date().getTime() -
              new Date(booking.modificationDetails.modifiedAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      const amount =
        booking.priceDetails?.price?.value ||
        booking.bookingData?.detailedInfo?.service?.prices?.total?.selling
          ?.value ||
        0;
      const currency =
        booking.priceDetails?.price?.currency ||
        booking.bookingData?.detailedInfo?.service?.prices?.total?.selling
          ?.currency ||
        "USD";

      // Determine status based on payment and due date
      let status: "pending" | "overdue" | "critical" = "pending";
      if (daysPastDue > 30) {
        status = "critical";
      } else if (daysPastDue > 7) {
        status = "overdue";
      }

      return {
        id: booking._id || `booking-${index}`,
        bookingId: booking.bookingId || "N/A",
        agencyName: booking.agency?.agencyName || "N/A",
        agencyId: booking.agency?._id || "N/A",
        amount: amount,
        currency: currency,
        dueDate: dueDate,
        daysPastDue: daysPastDue,
        serviceType: bookingData?.service?.type || "hotel",
        clientRef: bookingData?.clientRef || "N/A",
        status: status,
        customerName: customerName,
        checkIn: checkIn,
        checkOut: checkOut,
      };
    })
    .filter((item) => item.amount > 0); // Only show items with outstanding amounts
};
