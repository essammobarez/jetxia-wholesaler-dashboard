"use client";
import { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast"; // Import toast for notifications
import { BiTransferAlt } from "react-icons/bi";
import {
  FaBuilding,
  FaCarSide,
  FaCheckCircle,
  FaCommentAlt,
  FaTimesCircle,
  FaTrain,
} from "react-icons/fa";
import { FiLayout, FiMoreVertical } from "react-icons/fi";
import { RiPlaneLine } from "react-icons/ri";
import BookingActions from "./BookingActions";
import { BookingModal, Reservation } from "./BookingModal"; // Ensure Reservation type is correctly imported
import CancellationConfirmationModal from "./CancellationConfirmationModal"; // Import the new cancellation modal
import EditPriceModal from "./EditPriceModal"; // Import the new EditPriceModal

const navItems = [
  { label: "Hotels & Apartments", Icon: FaBuilding },
  { label: "Air Ticket", Icon: RiPlaneLine },
  { label: "Transfer", Icon: BiTransferAlt },
  { label: "Car Rentals", Icon: FaCarSide },
  { label: "Train Tickets", Icon: FaTrain },
];
const tabs = ["All", "Upcoming", "Active", "Completed", "Cancelled"];
const statusMap = {
  upcoming: { icon: FaCommentAlt, color: "text-yellow-500", label: "Upcoming" },
  active: { icon: FaCheckCircle, color: "text-green-500", label: "Active" },
  prepaid: { icon: FaCheckCircle, color: "text-green-500", label: "Paid" },
  cancelled: { icon: FaTimesCircle, color: "text-red-500", label: "Cancelled" },
  completed: {
    icon: FaCheckCircle,
    color: "text-green-500",
    label: "Completed",
  },
  pending: { icon: FaCommentAlt, color: "text-yellow-500", label: "PR" }, // Changed from 'Pending' to 'PR'
  confirmed: { icon: FaCheckCircle, color: "text-green-500", label: "Paid" }, // Changed from 'Confirmed' to 'Paid'
  ok: { icon: FaCheckCircle, color: "text-green-500", label: "OK" },
};

const BookingsPage: NextPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNav, setSelectedNav] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "All" | "Upcoming" | "Active" | "Completed" | "Cancelled"
  >("All");
  const [viewModalRes, setViewModalRes] = useState<Reservation | null>(null);
  const [editModalRes, setEditModalRes] = useState<Reservation | null>(null);
  const [editMarkup, setEditMarkup] = useState<string>("0.00");
  const [editCommission, setEditCommission] = useState<string>("0.00");
  const [editDiscount, setEditDiscount] = useState<string>("0.00");

  // State for cancellation modal
  const [cancelModalRes, setCancelModalRes] = useState<Reservation | null>(
    null
  );
  const [isCanceling, setIsCanceling] = useState(false);

  // Dynamic wholesalerId from localStorage
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const userPhoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Load stored wholesaler ID on mount
  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  const BOOKING_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}booking/wholesaler/${wholesalerId}`;
  const CANCELLATION_BASE_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}booking/cancellations`;

  const fetchReservations = useCallback(async () => {
    setLoading(true);

    try {
      if (wholesalerId && BOOKING_ENDPOINT) {
        const res = await fetch(BOOKING_ENDPOINT);
        if (res.ok) {
          const data = await res.json();
          console.log("booking API response:", data);
          if (Array.isArray(data) && data.length > 0) {
            const mapped: Reservation[] = data.map((item: any) => {
              // *** NEW STRUCTURE PARSING ***
              const priceDetails = item.priceDetails || {}; // New object for price info
              const bookingData = item.bookingData || {}; // Existing object for other details

              const init = bookingData.initialResponse || {};
              const det = bookingData.detailedInfo?.service || {}; // Use detailedInfo.service for most service details

              const bookingId = String(item.bookingId ?? "");
              const sequenceNumber = Number(item.sequenceNumber ?? 0);
              const reservationId = Number(item.reservationId ?? 0);
              const topStatus = String(item.status ?? "").toLowerCase();
              const createdAt = String(item.createdAt ?? "");
              const dbId = String(item._id ?? ""); // Extract the MongoDB _id

              const agencyName = item.agency?.agencyName ?? "N/A";
              const wholesaler = item.wholesaler ?? "N/A";
              const wholesalerName = item.wholesaler ?? "N/A"; // Add wholesalerName property
              const providerId = item.provider?._id ?? "N/A"; // Extract provider ID
              const providerName = item.provider?.name ?? "N/A"; // Extract provider name

              const clientRef = String(init.clientRef ?? "");
              const serviceType = String(init.type ?? "");
              const initStatus = String(init.status ?? "").toLowerCase();

              const addedTime = String(init.added?.time ?? "");
              const addedUser = String(init.added?.user?.name ?? "");

              const paymentType = String(det.payment?.type ?? "");
              const paymentStatus = String(det.payment?.status ?? "");
              const rateDescription = String(
                det.rateDetails?.description ?? ""
              );

              // Prioritize the new `priceDetails` structure for price values
              const priceIssueSelling = Number(
                priceDetails.price?.value ??
                  det.prices?.issue?.selling?.value ??
                  0
              );
              const priceIssueNet = Number(
                priceDetails.originalPrice?.value ??
                  det.prices?.issue?.net?.value ??
                  0
              );
              // Commission is still available under det.prices.issue or can be derived if needed
              const priceIssueCommission = Number(
                det.prices?.issue?.commission?.value ?? 0
              );

              // For the display, the base price `S` should be the supplier's net price.
              // This `price` variable might be redundant if you're using priceIssueNet/Selling consistently
              const price =
                priceIssueSelling > 0
                  ? priceIssueSelling
                  : Number(init.price?.selling?.value ?? 0);
              const currency = String(
                priceDetails.price?.currency ||
                  det.prices?.issue?.selling?.currency ||
                  init.price?.selling?.currency ||
                  "USD"
              );

              const cancellationDate = String(
                det.cancellationPolicy?.date ?? ""
              );

              const checkIn = String(det.serviceDates?.startDate ?? "");
              const checkOut = String(det.serviceDates?.endDate ?? "");
              let durationNights = Number(det.serviceDates?.duration ?? 0);
              let nights = durationNights;
              if ((!nights || nights <= 0) && checkIn && checkOut) {
                const d1 = new Date(checkIn);
                const d2 = new Date(checkOut);
                const diffMs = d2.getTime() - d1.getTime();
                nights =
                  diffMs > 0 ? Math.round(diffMs / (1000 * 60 * 60 * 24)) : 0;
              }

              const destinationCity = det.destination?.city?.name ?? "";
              const destinationCountry = det.destination?.country?.name ?? "";
              const nationality = det.nationality?.name ?? "";

              const passengers = Array.isArray(det.passengers)
                ? det.passengers.map((p: any) => ({
                    paxId: Number(p.paxId ?? 0),
                    type: String(p.type ?? ""),
                    lead: !!p.lead,
                    title: String(p.title ?? ""),
                    firstName: String(p.firstName ?? ""),
                    lastName: String(p.lastName ?? ""),
                    email: p.email ?? null,
                    phone: p.phone ?? null,
                    phonePrefix: p.phonePrefix ?? null,
                  }))
                : [];

              const remarks: { code: string; name: string; list: string[] }[] =
                Array.isArray(det.remarks)
                  ? det.remarks.map((r: any) => ({
                      code: String(r.code ?? ""),
                      name: String(r.name ?? ""),
                      list: Array.isArray(r.list)
                        ? r.list.map((s: any) => String(s))
                        : [],
                    }))
                  : [];

              const hotelInfo = {
                id: String(det.hotel?.id ?? ""),
                name: String(det.hotel?.name ?? "N/A"),
                stars: Number(det.hotel?.stars ?? 0),
                lastUpdated: String(det.hotel?.lastUpdated ?? ""),
                cityId: String(det.hotel?.cityId ?? ""),
                countryId: String(det.hotel?.countryId ?? ""),
              };

              const rooms: {
                id: string;
                name: string;
                board: string;
                boardBasis: string;
                info: string;
                passengerIds: number[];
              }[] = Array.isArray(det.rooms)
                ? det.rooms.map((rm: any) => ({
                    id: String(rm.id ?? ""),
                    name: String(rm.name ?? ""),
                    board: String(rm.board ?? ""),
                    boardBasis: String(rm.boardBasis ?? ""),
                    info: String(rm.info ?? ""),
                    passengerIds: Array.isArray(rm.passengers)
                      ? rm.passengers.map((pid: any) => Number(pid))
                      : [],
                  }))
                : [];

              const freeCancellation = cancellationDate;

              return {
                dbId, // Include dbId here
                bookingId,
                sequenceNumber,
                reservationId,
                topStatus,
                createdAt,
                agencyName,
                wholesaler,
                wholesalerName, // Add the missing wholesalerName property
                providerId,
                providerName,
                clientRef,
                serviceType,
                initStatus,
                price, // This will be priceDetails.price.value
                currency,
                addedTime,
                addedUser,
                paymentType,
                paymentStatus,
                rateDescription,
                priceIssueNet, // This is priceDetails.originalPrice.value
                priceIssueCommission, // This is from the old path, still relevant
                priceIssueSelling, // This is priceDetails.price.value
                cancellationDate,
                checkIn,
                checkOut,
                nights,
                destinationCity,
                destinationCountry,
                nationality,
                passengers,
                remarks,
                hotelInfo,
                rooms,
                freeCancellation,
                priceDetails: item.priceDetails, // Store the entire priceDetails object for easier access
              };
            });
            setReservations(mapped);
            setLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Error fetching bookings from API:", err);
    }

    // Fallback to mock data
    console.log("🔧 Development mode: Using mock booking data");
    const mockReservations: Reservation[] = [
      {
        dbId: "book_001",
        bookingId: "BK-2024-001",
        sequenceNumber: 1,
        reservationId: 1001,
        topStatus: "confirmed",
        createdAt: "2024-01-15T10:30:00Z",
        agencyName: "Global Travels Co.",
        wholesaler: "Wholesaler123",
        wholesalerName: "Wholesaler123",
        providerId: "prov_001",
        providerName: "Hotel Provider Inc.",
        clientRef: "GT-REF-001",
        serviceType: "hotel",
        initStatus: "confirmed",
        price: 1250.0,
        currency: "USD",
        addedTime: "2024-01-15T10:30:00Z",
        addedUser: "Alice Johnson",
        paymentType: "credit_card",
        paymentStatus: "paid",
        rateDescription: "Standard Double Room",
        priceIssueNet: 1000.0,
        priceIssueCommission: 150.0,
        priceIssueSelling: 1250.0,
        cancellationDate: "2024-01-20T00:00:00Z",
        checkIn: "2024-02-01",
        checkOut: "2024-02-05",
        nights: 4,
        destinationCity: "New York",
        destinationCountry: "USA",
        nationality: "American",
        passengers: [
          {
            paxId: 1,
            type: "adult",
            lead: true,
            title: "Mr",
            firstName: "John",
            lastName: "Smith",
            email: "john.smith@email.com",
            phone: "+1-555-0123",
            phonePrefix: "+1",
          },
        ],
        remarks: [],
        hotelInfo: {
          id: "hotel_001",
          name: "Grand Plaza Hotel",
          stars: 4,
          lastUpdated: "2024-01-15T10:30:00Z",
          cityId: "NYC001",
          countryId: "US001",
        },
        rooms: [
          {
            id: "room_001",
            name: "Standard Double Room",
            board: "BB",
            boardBasis: "Bed & Breakfast",
            info: "City view, free WiFi",
            passengerIds: [1],
          },
        ],
        freeCancellation: "2024-01-20T00:00:00Z",
        priceDetails: {
          price: { value: 1250.0, currency: "USD" },
          originalPrice: { value: 1000.0, currency: "USD" },
          markupApplied: { type: "amount", value: 100.0 },
        },
      },
      {
        dbId: "book_002",
        bookingId: "BK-2024-002",
        sequenceNumber: 2,
        reservationId: 1002,
        topStatus: "pending",
        createdAt: "2024-01-14T15:45:00Z",
        agencyName: "Sunrise Tours",
        wholesaler: "Wholesaler123",
        wholesalerName: "Wholesaler123",
        providerId: "prov_002",
        providerName: "City Hotels Ltd.",
        clientRef: "ST-REF-002",
        serviceType: "hotel",
        initStatus: "pending",
        price: 850.0,
        currency: "USD",
        addedTime: "2024-01-14T15:45:00Z",
        addedUser: "Mohammad Karim",
        paymentType: "bank_transfer",
        paymentStatus: "pending",
        rateDescription: "Superior Single Room",
        priceIssueNet: 700.0,
        priceIssueCommission: 100.0,
        priceIssueSelling: 850.0,
        cancellationDate: "2024-01-19T00:00:00Z",
        checkIn: "2024-01-25",
        checkOut: "2024-01-28",
        nights: 3,
        destinationCity: "Los Angeles",
        destinationCountry: "USA",
        nationality: "Canadian",
        passengers: [
          {
            paxId: 2,
            type: "adult",
            lead: true,
            title: "Ms",
            firstName: "Sarah",
            lastName: "Wilson",
            email: "sarah.wilson@email.com",
            phone: "+1-555-0234",
            phonePrefix: "+1",
          },
        ],
        remarks: [],
        hotelInfo: {
          id: "hotel_002",
          name: "City Center Hotel",
          stars: 3,
          lastUpdated: "2024-01-14T15:45:00Z",
          cityId: "LA001",
          countryId: "US001",
        },
        rooms: [
          {
            id: "room_002",
            name: "Superior Single Room",
            board: "RO",
            boardBasis: "Room Only",
            info: "Street view, air conditioning",
            passengerIds: [2],
          },
        ],
        freeCancellation: "2024-01-19T00:00:00Z",
        priceDetails: {
          price: { value: 850.0, currency: "USD" },
          originalPrice: { value: 700.0, currency: "USD" },
          markupApplied: { type: "percentage", value: 15 },
        },
      },
      {
        dbId: "book_003",
        bookingId: "BK-2024-003",
        sequenceNumber: 3,
        reservationId: 1003,
        topStatus: "confirmed",
        createdAt: "2024-01-13T09:15:00Z",
        agencyName: "Adventure Seekers Ltd.",
        wholesaler: "Wholesaler123",
        wholesalerName: "Wholesaler123",
        providerId: "prov_003",
        providerName: "Mountain Resorts",
        clientRef: "AS-REF-003",
        serviceType: "hotel",
        initStatus: "confirmed",
        price: 2100.0,
        currency: "USD",
        addedTime: "2024-01-13T09:15:00Z",
        addedUser: "Rebecca Lee",
        paymentType: "credit_card",
        paymentStatus: "paid",
        rateDescription: "Deluxe Suite with Mountain View",
        priceIssueNet: 1800.0,
        priceIssueCommission: 200.0,
        priceIssueSelling: 2100.0,
        cancellationDate: "2024-01-18T00:00:00Z",
        checkIn: "2024-02-10",
        checkOut: "2024-02-17",
        nights: 7,
        destinationCity: "Denver",
        destinationCountry: "USA",
        nationality: "British",
        passengers: [
          {
            paxId: 3,
            type: "adult",
            lead: true,
            title: "Mr",
            firstName: "David",
            lastName: "Brown",
            email: "david.brown@email.com",
            phone: "+44-7700-900123",
            phonePrefix: "+44",
          },
          {
            paxId: 4,
            type: "adult",
            lead: false,
            title: "Mrs",
            firstName: "Emma",
            lastName: "Brown",
            email: "emma.brown@email.com",
            phone: "+44-7700-900124",
            phonePrefix: "+44",
          },
        ],
        remarks: [],
        hotelInfo: {
          id: "hotel_003",
          name: "Mountain View Resort",
          stars: 5,
          lastUpdated: "2024-01-13T09:15:00Z",
          cityId: "DEN001",
          countryId: "US001",
        },
        rooms: [
          {
            id: "room_003",
            name: "Deluxe Suite with Mountain View",
            board: "HB",
            boardBasis: "Half Board",
            info: "Mountain view, spa access, balcony",
            passengerIds: [3, 4],
          },
        ],
        freeCancellation: "2024-01-18T00:00:00Z",
        priceDetails: {
          price: { value: 2100.0, currency: "USD" },
          originalPrice: { value: 1800.0, currency: "USD" },
          markupApplied: { type: "amount", value: 300.0 },
        },
      },
    ];

    setReservations(mockReservations);
    setLoading(false);
  }, [BOOKING_ENDPOINT, wholesalerId]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const filteredReservations = reservations.filter((r) => {
    const status = r.topStatus.toLowerCase();
    if (activeTab === "All") return true;
    if (activeTab === "Cancelled")
      return status === "cancelled" || status === "cancelled";
    return status === activeTab.toLowerCase();
  });

  const handleCancelClick = (reservation: Reservation) => {
    setCancelModalRes(reservation); // Open the cancellation confirmation modal
  };

  const handleConfirmCancellation = useCallback(
    async (dbId: string) => {
      setIsCanceling(true);
      try {
        const response = await fetch(`${CANCELLATION_BASE_ENDPOINT}/${dbId}`, {
          method: "PUT", // Or 'POST' or 'DELETE' depending on your API design
          headers: {
            "Content-Type": "application/json",
          },
          // You might need to send a body with cancellation reason or other data
          // body: JSON.stringify({ reason: 'User requested cancellation' }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();
        console.log("Cancellation successful:", result);
        toast.success("Booking successfully cancelled!"); // Success toast
        setCancelModalRes(null); // Close the modal
        fetchReservations(); // Refresh the booking list
      } catch (error: any) {
        console.error("Error during cancellation:", error);
        toast.error(`Cancellation failed: ${error.message || "Unknown error"}`); // Error toast
      } finally {
        setIsCanceling(false);
      }
    },
    [fetchReservations, CANCELLATION_BASE_ENDPOINT]
  );

  const handleSaveEdit = () => {
    if (!editModalRes) return;
    // Here you would typically send the updated price data to your backend
    console.log(
      "Saving edited prices for reservation:",
      editModalRes.reservationId
    );
    console.log(
      "Markup:",
      editMarkup,
      "Commission:",
      editCommission,
      "Discount:",
      editDiscount
    );
    // You would likely make an API call here to update the reservation prices
    setEditModalRes(null);
    setEditMarkup("0.00");
    setEditCommission("0.00");
    setEditDiscount("0.00");
    // After saving, consider refetching reservations to update the UI
    fetchReservations();
  };

  const calculatePricesForEditModal = () => {
    if (!editModalRes) return { s: 0, m: 0, np: 0, c: 0, d: 0, sp: 0 };

    // S (Supplier Price) = The net price from the supplier (originalPrice from new structure)
    const s =
      editModalRes.priceDetails?.originalPrice?.value ??
      editModalRes.priceIssueNet;

    // M (Markup) can be derived from priceDetails.markupApplied.value or calculated.
    // Assuming markupApplied.value is directly the markup in monetary terms if type is 'amount',
    // or a percentage to be applied to originalPrice.value if type is 'percentage'.
    let m = 0;
    if (editModalRes.priceDetails?.markupApplied) {
      if (editModalRes.priceDetails.markupApplied.type === "percentage") {
        m = s * (editModalRes.priceDetails.markupApplied.value / 100);
      } else {
        // Assuming 'amount' or default
        m = editModalRes.priceDetails.markupApplied.value;
      }
    }
    // If not from new structure, use the existing editMarkup state.
    m = parseFloat(editMarkup) || m;

    // C (Commission) - Use the existing commission from the fetched data
    const c = editModalRes.priceIssueCommission; // Or from a new field if added to priceDetails

    // D (Discount) - For now, still assume 0 or from state
    const d = parseFloat(editDiscount) || 0;

    const np = s + m; // Net Price = Supplier Price + Markup
    const sp = np - c - d; // Selling Price = Net Price - Commission - Discount

    return { s, m, np, c, d, sp };
  };

  const editModalCalculatedPrices = editModalRes
    ? calculatePricesForEditModal()
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <p className="text-lg dark:text-gray-200">Loading bookings…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans">
      {/* Modern Header with Glass Effect */}
      <header className="glass backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-b border-white/20 dark:border-gray-700/50">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Booking Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your reservations and bookings
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                {filteredReservations.length} Active Bookings
              </div>
            </div>
          </div>

          {/* Navigation Pills */}
          <nav className="flex flex-wrap gap-3">
            {navItems.map(({ label, Icon }, i) => (
              <button
                key={i}
                onClick={() => setSelectedNav(i)}
                className={`group flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all duration-300 ${
                  selectedNav === i
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-105"
                    : "bg-white/60 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-md hover:scale-105 border border-white/50 dark:border-gray-600/50"
                }`}
              >
                <div
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    selectedNav === i
                      ? "bg-white/20"
                      : "bg-blue-50 dark:bg-gray-600 group-hover:bg-blue-100 dark:group-hover:bg-gray-500"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      selectedNav === i
                        ? "text-white"
                        : "text-blue-600 dark:text-blue-400"
                    }
                  />
                </div>
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="px-6 py-8">
        {/* Modern Tab System */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t as any)}
                className={`relative px-6 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ${
                  activeTab === t
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-105"
                    : "bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:scale-105 border border-white/50 dark:border-gray-700/50"
                }`}
              >
                {t}
                {activeTab === t && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 -z-10"></div>
                )}
              </button>
            ))}
          </div>

          {/* Status Summary Cards */}
          <div className="flex gap-4 mt-4 lg:mt-0">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/50 dark:border-gray-700/50">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total Revenue
              </div>
              <div className="text-lg font-bold text-green-600">$52,420</div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/50 dark:border-gray-700/50">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                This Month
              </div>
              <div className="text-lg font-bold text-blue-600">+12.5%</div>
            </div>
          </div>
        </div>

        {filteredReservations.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-12 border border-white/50 dark:border-gray-700/50 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiLayout className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No bookings match the selected category. Try switching to a
                different tab.
              </p>
            </div>
          </div>
        )}

        {filteredReservations.map((r, idx, arr) => {
          const statusKey = r.topStatus.toLowerCase() as keyof typeof statusMap;
          const statusDetails = statusMap[statusKey] || statusMap.confirmed;
          const IconStatus = statusDetails.icon;
          const leadPassenger =
            r.passengers.find((p) => p.lead) || r.passengers[0];
          const guestName = leadPassenger
            ? `${leadPassenger.firstName} ${leadPassenger.lastName}`
            : "N/A";
          const isCurrentRowEdited = false;
          let dynamicCardStyles = "";
          const baseCardStyles =
            "grid grid-cols-1 lg:grid-cols-7 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm";
          if (isCurrentRowEdited) {
            dynamicCardStyles =
              "rounded-b-lg ml-2 mt-0 border-l-4 border-indigo-600 dark:border-indigo-400";
          } else {
            const nextItem = arr[idx + 1];
            if (
              nextItem &&
              String(nextItem.reservationId) === `${r.reservationId}-edit`
            ) {
              dynamicCardStyles = "rounded-t-lg mb-0";
            } else {
              dynamicCardStyles = "rounded-lg mb-6";
            }
          }

          // Calculate price breakdown based on fetched reservation data.
          // S (Supplier Price) = The net price from the supplier.
          // In your new JSON, this is `priceDetails.originalPrice.value`.
          const S = r.priceDetails?.originalPrice?.value ?? r.priceIssueNet;

          // C (Commission) = Commission from the API.
          // This is from `det.service.prices.issue.commission.value` in the old structure,
          // and assumed to be 0 or derived if a new commission field is not directly in priceDetails.
          const C = r.priceIssueCommission; // Still using the extracted one, assuming it's correct or 0

          // SP (Selling Price) from the API.
          // In your new JSON, this is `priceDetails.price.value`.
          const SP_from_api =
            r.priceDetails?.price?.value ?? r.priceIssueSelling;

          // M (Markup) Calculation:
          // Prefer markup from `priceDetails.markupApplied` if available.
          let M = 0;
          if (r.priceDetails?.markupApplied) {
            if (r.priceDetails.markupApplied.type === "percentage") {
              M = S * (r.priceDetails.markupApplied.value / 100);
            } else {
              // Assuming 'amount' or default
              M = r.priceDetails.markupApplied.value;
            }
          } else {
            // Fallback for old structure or if markupApplied is missing
            // This calculation (SP_from_api - S + C + D) is essentially deriving markup.
            // If D is always 0 for display, then it's SP_from_api - S + C.
            const D = 0.0; // As per existing code, D is assumed 0 for display
            M = SP_from_api - S + C + D;
          }

          // For display purposes on the card, we assume Discount (D) is 0
          const D = 0.0; // You can adjust this if discount is available in your new JSON
          const NP = S + M; // NP (Net Price) = Supplier Price + Markup.
          const SP = NP - C - D; // SP (Selling Price) = Net Price - Commission - Discount.

          return (
            <div
              key={r.reservationId}
              className={`${baseCardStyles} ${dynamicCardStyles}`}
            >
              <div className="col-span-1 lg:col-span-6 p-4 sm:p-6 space-y-4">
                <div className="flex flex-wrap justify-between items-center">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
                    <IconStatus className={statusDetails.color} size={18} />
                    <h3 className="text-lg font-semibold dark:text-gray-100 flex items-center">
                      {r.hotelInfo.name || "Hotel details not available"}
                    </h3>
                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                      ({statusDetails.label})
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      aria-label="More options"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <FiMoreVertical size={18} />
                    </button>
                    <button
                      aria-label="View details"
                      onClick={() => setViewModalRes(r)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <FiLayout size={18} />
                    </button>
                  </div>
                </div>

                {/* Main details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-y-4 gap-x-4 sm:gap-x-6 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Booking ID
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.bookingId || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Provider Name
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.providerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Guest
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {guestName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created On
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Second row: price/payment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-y-3 gap-x-4 sm:gap-x-6 text-sm pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Price ({r.currency})
                    </p>
                    <div className="space-y-1 text-xs dark:text-gray-100">
                      <div className="flex justify-between">
                        <span>S (Suppl.):</span> <span>{S.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>M (Markup):</span> <span>{M.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-600 pt-1">
                        <span>NP (Net):</span> <span>{NP.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-500">
                        <span>C (Comm.):</span> <span>{C.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-500">
                        <span>D (Disc.):</span> <span>{D.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-indigo-600 dark:text-indigo-400 border-t border-gray-200 dark:border-gray-600 pt-1">
                        <span>SP (Sell):</span> <span>{SP.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Payment Type
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.paymentType || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Check In
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.checkIn
                        ? new Date(r.checkIn).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Check Out
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.checkOut
                        ? new Date(r.checkOut).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Nights
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.nights || "—"}
                    </p>
                  </div>
                </div>

                {/* Third row: location & cancellation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-y-3 gap-x-4 sm:gap-x-6 text-sm pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Destination
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.destinationCity && r.destinationCountry
                        ? `${r.destinationCity}, ${r.destinationCountry}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Nationality
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.nationality || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Cancellation By
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.cancellationDate
                        ? new Date(r.cancellationDate).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <p className={`font-semibold ${statusDetails.color}`}>
                      {statusDetails.label}
                    </p>
                  </div>
                  <div />
                  <div />
                </div>
              </div>
              <BookingActions
                reservation={r}
                onViewDetails={() => setViewModalRes(r)}
                onEditPrice={(reservationToEdit) => {
                  setEditModalRes(reservationToEdit);
                  // Initialize editMarkup, editCommission, editDiscount based on the fetched data
                  const currentS =
                    reservationToEdit.priceDetails?.originalPrice?.value ??
                    reservationToEdit.priceIssueNet;
                  const currentSP =
                    reservationToEdit.priceDetails?.price?.value ??
                    reservationToEdit.priceIssueSelling;
                  const currentC = reservationToEdit.priceIssueCommission;
                  const currentD = 0.0; // Assuming 0 for now unless there's a discount field

                  let initialMarkup = 0;
                  if (reservationToEdit.priceDetails?.markupApplied) {
                    if (
                      reservationToEdit.priceDetails.markupApplied.type ===
                      "percentage"
                    ) {
                      initialMarkup =
                        currentS *
                        (reservationToEdit.priceDetails.markupApplied.value /
                          100);
                    } else {
                      initialMarkup =
                        reservationToEdit.priceDetails.markupApplied.value;
                    }
                  } else {
                    // Fallback for old structure or if markupApplied is missing
                    initialMarkup = currentSP - currentS + currentC + currentD;
                  }

                  setEditMarkup(initialMarkup.toFixed(2));
                  setEditCommission(currentC.toFixed(2));
                  setEditDiscount(currentD.toFixed(2));
                }}
                onCancel={handleCancelClick} // Use the new handler here
              />
            </div>
          );
        })}
      </main>

      {viewModalRes && (
        <BookingModal
          reservation={viewModalRes}
          isOpen={!!viewModalRes}
          onClose={() => setViewModalRes(null)}
        />
      )}

      <EditPriceModal
        isOpen={!!editModalRes}
        onClose={() => setEditModalRes(null)}
        onSave={handleSaveEdit}
        reservation={editModalRes}
        calculatedPrices={editModalCalculatedPrices}
      />

      {/* Cancellation Confirmation Modal */}
      {cancelModalRes && (
        <CancellationConfirmationModal
          booking={{
            dbId: cancelModalRes.dbId || cancelModalRes.bookingId,
            bookingId: cancelModalRes.bookingId,
            hotel: cancelModalRes.hotelInfo.name,
            guestName:
              cancelModalRes.passengers.find((p) => p.lead)?.firstName +
                " " +
                cancelModalRes.passengers.find((p) => p.lead)?.lastName ||
              "N/A",
            checkIn: cancelModalRes.checkIn
              ? new Date(cancelModalRes.checkIn).toLocaleDateString()
              : "—",
            checkOut: cancelModalRes.checkOut
              ? new Date(cancelModalRes.checkOut).toLocaleDateString()
              : "—",
            cancelUntil: cancelModalRes.cancellationDate,
            paymentStatus: cancelModalRes.paymentStatus,
          }}
          onConfirm={handleConfirmCancellation}
          onClose={() => setCancelModalRes(null)}
          isCanceling={isCanceling}
        />
      )}
    </div>
  );
};

export default BookingsPage;
