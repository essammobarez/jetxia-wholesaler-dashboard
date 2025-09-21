"use client";
import { NextPage } from "next";
import { useRouter } from "next/navigation"; // MODIFIED: Import useRouter
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BiTransferAlt } from "react-icons/bi";
import {
  FaBan,
  FaBuilding,
  FaCarSide,
  FaCheckCircle,
  FaChevronDown,
  FaCommentAlt,
  FaCreditCard,
  FaEye,
  FaFileInvoiceDollar,
  FaPlus,
  FaTicketAlt,
  FaTimesCircle,
  FaTrain,
} from "react-icons/fa";
import { FiLayout } from "react-icons/fi";
import { RiPlaneLine } from "react-icons/ri";
import { BookingModal, Reservation } from "./BookingModal";
import EditPriceModal from "./EditPriceModal";
// NOTE: Assuming these utility files exist based on the original code.
import { generateInvoiceNumber, generateInvoicePDF } from "./InvoiceGenerator";
import { generateVoucherPDF } from "./voucher";
// --- Import the cancellation modal ---
import React from "react";
import RoomCancellationModal from "./RoomCancellationModal";
// --- NEW: Import the PayOptionsModal ---
import PayOptionsModal from "./payoptionsmodal";
// --- NEW: Import the separated loading modal component ---
import PercentageLoaderModal from "./LoadingModal";

const navItems = [
  { label: "Hotels & Apartments", Icon: FaBuilding },
  { label: "Air Ticket", Icon: RiPlaneLine },
  { label: "Transfer", Icon: BiTransferAlt },
  { label: "Car Rentals", Icon: FaCarSide },
  { label: "Train Tickets", Icon: FaTrain },
];

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
  // --- MODIFIED HERE ---
  pending: { icon: FaCommentAlt, color: "text-yellow-500", label: "PayLater" },
  confirmed: { icon: FaCheckCircle, color: "text-green-500", label: "Paid" },
  // --- END MODIFICATION ---
  ok: { icon: FaCheckCircle, color: "text-green-500", label: "OK" },
};

const BookingsPage: NextPage = () => {
  const router = useRouter(); // MODIFIED: Initialize the router
  const [darkMode, setDarkMode] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNav, setSelectedNav] = useState(0);
  const [viewModalRes, setViewModalRes] = useState<Reservation | null>(null);
  const [editModalRes, setEditModalRes] = useState<Reservation | null>(null);
  const [editMarkup, setEditMarkup] = useState<string>("0.00");
  const [editCommission, setEditCommission] = useState<string>("0.00");
  const [editDiscount, setEditDiscount] = useState<string>("0.00");

  const [cancelModalRes, setCancelModalRes] = useState<Reservation | null>(
    null
  );
  const [payModalRes, setPayModalRes] = useState<Reservation | null>(null);

  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // State for tracking document generation
  const [generatingDocFor, setGeneratingDocFor] = useState<string | null>(null);

  // --- NEW: State for the percentage loader ---
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [isLoaderVisible, setIsLoaderVisible] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("");

  // Search and filter states
  const [searchHotelName, setSearchHotelName] = useState("");
  const [searchBookingId, setSearchBookingId] = useState("");
  const [searchCheckInDate, setSearchCheckInDate] = useState("");
  const [searchCheckOutDate, setSearchCheckOutDate] = useState("");
  const [searchGuestName, setSearchGuestName] = useState("");
  const [searchAgencyName, setSearchAgencyName] = useState("");
  const [searchStatus, setSearchStatus] = useState(""); // Empty string means "All"

  // State to manage which card is expanded on mobile
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const userPhoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token =
      document.cookie
        .split("; ")
        .find((r) => r.startsWith("authToken="))
        ?.split("=")[1] || localStorage.getItem("authToken");

    let userRole: string | null = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userRole = payload.role;
      } catch (e) {
        console.error("Failed to decode token:", e);
        setError("Your session is invalid. Please log in again.");
        setLoading(false);
        return;
      }
    }

    let endpoint = "";
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (userRole === "sales") {
      if (!token) {
        setError("Authorization failed. Please log in again.");
        setLoading(false);
        return;
      }
      endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}sales/agency-bookings`;
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    } else {
      // Original logic for non-sales roles
      if (wholesalerId) {
        endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}booking/wholesaler/${wholesalerId}`;
      } else {
        setReservations([]);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(endpoint, options);
      if (res.ok) {
        const responseData = await res.json();

        // Handle both direct array and nested { data: [...] } structures
        let bookingsArray: any[] = [];
        if (responseData && Array.isArray(responseData.data)) {
          bookingsArray = responseData.data; // For "sales" role
        } else if (Array.isArray(responseData)) {
          bookingsArray = responseData; // For other roles
        }

        if (bookingsArray.length > 0) {
          const mapped: Reservation[] = bookingsArray.map((item: any) => {
            // --- NEW: Process data for all rooms for the modal ---
            const allRoomsData = (item.rooms || []).map((room: any) => {
              const detailedService =
                room.bookingData?.detailedInfo?.service || {};

              // --- START: Cancellation Policy Update ---
              const cancellationDetails =
                room.bookingData?.initialResponse?.HotelDetails
                  ?.RoomDetails?.[0]?.CancellationPolicyDetails?.Cancellation;

              let finalCancellationPolicy = room.cancellationPolicy ?? null;

              if (cancellationDetails && Array.isArray(cancellationDetails)) {
                const parsedPolicies = cancellationDetails
                  .map((policy: any) => {
                    const fromDateStr = String(policy.FromDate);
                    if (fromDateStr.length !== 8) return null;

                    const year = parseInt(fromDateStr.substring(0, 4), 10);
                    const month = parseInt(fromDateStr.substring(4, 6), 10);
                    const day = parseInt(fromDateStr.substring(6, 8), 10);

                    const timeStr = String(
                      policy.FromTime || "12:00 AM"
                    ).replace(/[\s\u202F]+/g, " "); // Handle regular and non-breaking spaces

                    const timeParts = timeStr.match(
                      /(\d+):(\d+)\s*(AM|PM)/i
                    );
                    let hours = 0;
                    let minutes = 0;

                    if (timeParts) {
                      hours = parseInt(timeParts[1], 10);
                      minutes = parseInt(timeParts[2], 10);
                      const modifier = timeParts[3].toUpperCase();
                      if (modifier === "PM" && hours < 12) {
                        hours += 12;
                      }
                      if (modifier === "AM" && hours === 12) {
                        hours = 0; // Midnight case
                      }
                    }
                    const startDate = new Date(
                      Date.UTC(year, month - 1, day, hours, minutes)
                    ).toISOString();

                    return {
                      startDate,
                      percentOrAmt: policy.PercentOrAmt,
                      value: policy.Value,
                    };
                  })
                  .filter((p: any) => p !== null);

                if (parsedPolicies.length > 0) {
                  finalCancellationPolicy = {
                    date: parsedPolicies[0].startDate,
                    policies: parsedPolicies,
                  };
                } else {
                  finalCancellationPolicy = null;
                }
              }
              // --- END: Cancellation Policy Update ---

              const roomGuests = Array.isArray(room.guests)
                ? room.guests.map((p: any) => ({
                    paxId: 0,
                    type: String(p.type ?? ""),
                    lead: !!p.lead,
                    title: "",
                    firstName: String(p.firstName ?? ""),
                    lastName: String(p.lastName ?? ""),
                    email: p.email ?? null,
                    phone: p.phone ?? null,
                    phonePrefix: p.phonePrefix ?? null,
                    nationality: String(p.nationality ?? ""),
                  }))
                : [];

              const roomInfo = detailedService.rooms?.[0] || {};
              const firstGuestInRoom = room.guests?.[0];

              // --- START: Room Name Fix ---
              // Fetch room name exclusively from the response, no static fallback
              const descriptiveRoomName =
                room.bookingData?.initialResponse?.HotelDetails
                  ?.RoomDetails?.[0]?.RoomType;
              const genericRoomName = room.name;
              const finalRoomName = String(
                descriptiveRoomName || genericRoomName || ""
              );
              // --- END: Room Name Fix ---

              return {
                reservationId: Number(room.reservationId ?? 0),
                status: String(room.status ?? "N/A").toLowerCase(),
                rateDescription: String(
                  detailedService.rateDetails?.name ?? room.board ?? ""
                ),
                priceNet: Number(
                  room.price?.value ??
                    detailedService.prices?.total?.net?.value ??
                    0
                ),
                priceCommission: Number(
                  detailedService.prices?.total?.commission?.value ?? 0
                ),
                cancellationPolicy: finalCancellationPolicy, // Use the processed policy
                guests: roomGuests,
                remarks: [],
                roomName: finalRoomName, // Use the fixed room name
                board: String(roomInfo.board ?? room.board ?? "N/A"),
                boardBasis: String(roomInfo.boardBasis ?? "N/A"),
                info: String(roomInfo.info ?? ""),
                nationality: firstGuestInRoom?.nationality ?? "",
              };
            });

            // Aggregate all passengers from all rooms for the main passenger list
            const allPassengers = allRoomsData.flatMap((r) => r.guests);

            // --- Use the first room's data for the main list view ---
            // Create a modified first room object that has the processed cancellation policy
            const rawFirstRoom = item.rooms?.[0] || {};
            const room = {
              ...rawFirstRoom,
              cancellationPolicy:
                allRoomsData[0]?.cancellationPolicy ??
                rawFirstRoom.cancellationPolicy,
            };

            const detailedService =
              room.bookingData?.detailedInfo?.service || {};

            const bookingId = String(item.bookingId ?? "");
            const sequenceNumber = Number(item.sequenceNumber ?? 0);
            const reservationId = Number(room.reservationId ?? 0);
            const topStatus = String(item.status ?? "").toLowerCase();
            const createdAt = String(item.createdAt ?? "");
            const dbId = String(item._id ?? "");
            const agency = item.agency;
            const agencyName = item.agency?.agencyName ?? "N/A";

            // --- MODIFICATION START: Extract Source ---
            const source =
              item.rooms?.[0]?.bookingData?.initialResponse?.BookingDetails
                ?.Source ?? null;
            // --- MODIFICATION END ---

            const wholesaler = item.wholesaler;
            const wholesalerName =
              typeof wholesaler === "object" && wholesaler !== null
                ? wholesaler.wholesalerName
                : typeof wholesaler === "string"
                ? wholesaler
                : "N/A";

            const providerId = room.provider?._id ?? "N/A";
            const providerName = room.provider?.name ?? "N/A";

            const clientRef = String(item.clientReference ?? "");
            const serviceType = "hotel";
            const initStatus = String(room.status ?? "").toLowerCase();

            const addedTime = String(detailedService.added?.time ?? "");
            const addedUser = String(
              detailedService.added?.user?.name ?? ""
            );

            const paymentType = String(item.bookingType ?? "");
            const paymentStatus = String(item.status ?? "");

            const rateDescription = String(
              detailedService.rateDetails?.name ?? room.board ?? ""
            );

            const priceIssueSelling = Number(item.totalPrice?.value ?? 0);
            const priceIssueNet = Number(
              detailedService.prices?.total?.net?.value ?? 0
            );
            const priceIssueCommission = Number(
              detailedService.prices?.total?.commission?.value ?? 0
            );

            const price = priceIssueSelling;
            const currency = String(item.totalPrice?.currency ?? "USD");

            const cancellationDate = String(
              room.cancellationPolicy?.date ?? ""
            );

            const checkIn = String(item.serviceDates?.startDate ?? "");
            const checkOut = String(item.serviceDates?.endDate ?? "");
            let nights = Number(item.serviceDates?.duration ?? 0);
            if ((!nights || nights <= 0) && checkIn && checkOut) {
              const d1 = new Date(checkIn);
              const d2 = new Date(checkOut);
              const diffMs = d2.getTime() - d1.getTime();
              nights =
                diffMs > 0
                  ? Math.round(diffMs / (1000 * 60 * 60 * 24))
                  : 0;
            }

            const destinationCity = item.hotel?.city ?? "";
            const destinationCountry = item.hotel?.country ?? "";

            const firstGuest = room.guests?.[0];
            const nationality = firstGuest?.nationality ?? "";

            const remarks: any[] = [];

            const hotelInfo = {
              id: String(detailedService.hotel?.id ?? ""),
              name: String(item.hotel?.name ?? "N/A"),
              stars: Number(item.hotel?.stars ?? 0),
              lastUpdated: String(
                detailedService.hotel?.lastUpdated ?? ""
              ),
              cityId: String(detailedService.hotel?.cityId ?? ""),
              countryId: String(
                detailedService.hotel?.countryId ?? ""
              ),
            };

            const detailedRooms = Array.isArray(detailedService.rooms)
              ? detailedService.rooms.map((rm: any) => ({
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
              dbId,
              bookingId,
              sequenceNumber,
              reservationId,
              topStatus,
              createdAt,
              agency,
              agencyName,
              wholesaler,
              wholesalerName,
              providerId,
              providerName,
              clientRef,
              serviceType,
              initStatus,
              price,
              currency,
              addedTime,
              addedUser,
              paymentType,
              paymentStatus,
              rateDescription,
              priceIssueNet,
              priceIssueCommission,
              priceIssueSelling,
              cancellationDate,
              checkIn,
              checkOut,
              nights,
              destinationCity,
              destinationCountry,
              nationality,
              passengers: allPassengers,
              remarks,
              hotelInfo,
              rooms: detailedRooms,
              freeCancellation,
              priceDetails: item.priceDetails,
              allRooms: allRoomsData,
              source, // --- MODIFICATION: Added source to the final object
            };
          });
          setReservations(mapped);
        } else {
          setReservations([]);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(
          errorData.message ||
            `API request failed with status: ${res.status}`
        );
        console.error(`API request failed with status: ${res.status}`);
        setReservations([]);
      }
    } catch (err) {
      console.error("Error fetching bookings from API:", err);
      setError("An unexpected error occurred while fetching bookings.");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [wholesalerId]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // --- Start of Filtering Logic ---
  const filteredReservations = reservations.filter((r) => {
    // Hotel Name Filter
    const hotelNameMatch =
      !searchHotelName ||
      r.hotelInfo.name.toLowerCase().includes(searchHotelName.toLowerCase());

    // Booking ID Filter
    const bookingIdMatch =
      !searchBookingId ||
      r.bookingId.toLowerCase().includes(searchBookingId.toLowerCase());

    // Check-in Date Filter
    const checkInDateMatch =
      !searchCheckInDate || r.checkIn.startsWith(searchCheckInDate);

    // Check-out Date Filter
    const checkOutDateMatch =
      !searchCheckOutDate || r.checkOut.startsWith(searchCheckOutDate);

    // Guest Name Filter
    const guestNameMatch =
      !searchGuestName ||
      r.passengers.some((p) =>
        `${p.firstName} ${p.lastName}`
          .toLowerCase()
          .includes(searchGuestName.toLowerCase())
      );

    // Agency Name Filter
    const agencyNameMatch =
      !searchAgencyName ||
      r.agencyName.toLowerCase().includes(searchAgencyName.toLowerCase());

    // Status Filter for PAYLATER, Credit, and cancelled
    const statusMatch = (() => {
      if (!searchStatus) {
        return true; // "All Statuses" selected, so no filter is applied
      }
      const status = searchStatus.toLowerCase();
      if (status === "cancelled") {
        const isAnyRoomCancelled = r.allRooms.some(
          (room) => room.status.toLowerCase() === "cancelled"
        );
        return isAnyRoomCancelled || r.topStatus.toLowerCase() === "cancelled";
      }
      // For PAYLATER and Credit, we check the separate paymentType field
      if (status === "paylater" || status === "credit") {
        return r.paymentType.toLowerCase() === status;
      }
      return true; // Fallback to not filter if status is unrecognized
    })();

    return (
      hotelNameMatch &&
      bookingIdMatch &&
      checkInDateMatch &&
      checkOutDateMatch &&
      guestNameMatch &&
      agencyNameMatch &&
      statusMatch
    );
  });
  // --- End of Filtering Logic ---

  const handleCancelClick = (reservation: Reservation) => {
    setCancelModalRes(reservation);
  };

  // --- Handler for successful cancellation from the modal ---
  const handleCancellationSuccess = () => {
    setCancelModalRes(null); // Close the modal
    fetchReservations(); // Refresh the list of reservations
  };

  // --- Handler for successful payment from the modal ---
  const handlePaymentSuccess = () => {
    setPayModalRes(null); // Close the modal
    fetchReservations(); // Refresh the list of reservations
  };

  // --- NEW: Helper for simulating loader progress ---
  const simulateProgress = (callback: () => Promise<void>) => {
    setIsLoaderVisible(true);
    setLoaderProgress(0);

    // Simulate a gradual progress increase
    const interval = setInterval(() => {
      setLoaderProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        // Increment randomly for a more natural feel
        return prev + Math.floor(Math.random() * 5) + 5;
      });
    }, 200);

    // Execute the actual document generation
    callback()
      .then(() => {
        // On success, jump to 100% and close after a short delay
        clearInterval(interval);
        setLoaderProgress(100);
        setTimeout(() => {
          setIsLoaderVisible(false);
        }, 500);
      })
      .catch(() => {
        // On error, immediately hide the loader
        clearInterval(interval);
        setIsLoaderVisible(false);
      });
  };

  // --- UPDATED: Handlers for Voucher and Invoice generation ---
  const handleGenerateInvoice = (reservation: Reservation) => {
    if (generatingDocFor || isLoaderVisible) return;
    setGeneratingDocFor(reservation.bookingId);
    setLoaderMessage("Generating Invoice...");

    const generationTask = async () => {
      try {
        const invoiceNumber = generateInvoiceNumber();
        const invoiceDate = new Date().toLocaleDateString();
        const dueDate = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toLocaleDateString();

        await generateInvoicePDF({
          invoiceNumber,
          invoiceDate,
          dueDate,
          reservation,
        });

        toast.success("Invoice generated successfully!");
      } catch (error) {
        console.error("Error generating invoice:", error);
        toast.error("Failed to generate invoice. Please try again.");
        throw error; // Re-throw to be caught by simulateProgress
      } finally {
        setGeneratingDocFor(null);
      }
    };

    simulateProgress(generationTask);
  };

  const handleGenerateVoucher = (reservation: Reservation) => {
    if (generatingDocFor || isLoaderVisible) return;
    setGeneratingDocFor(reservation.bookingId);
    setLoaderMessage("Generating Voucher...");

    const generationTask = async () => {
      try {
        await generateVoucherPDF(reservation);
        toast.success("Voucher generated!");
      } catch (e) {
        toast.error("Failed to generate voucher");
        throw e; // Re-throw to be caught by simulateProgress
      } finally {
        setGeneratingDocFor(null);
      }
    };

    simulateProgress(generationTask);
  };

  const handleSaveEdit = () => {
    if (!editModalRes) return;
    setEditModalRes(null);
    setEditMarkup("0.00");
    setEditCommission("0.00");
    setEditDiscount("0.00");
    fetchReservations();
  };

  const calculatePricesForEditModal = () => {
    if (!editModalRes) return { s: 0, m: 0, np: 0, c: 0, d: 0, sp: 0 };
    const s =
      editModalRes.priceDetails?.originalPrice?.value ??
      editModalRes.priceIssueNet;
    let m = 0;
    if (editModalRes.priceDetails?.markupApplied) {
      if (editModalRes.priceDetails.markupApplied.type === "percentage") {
        m = s * (editModalRes.priceDetails.markupApplied.value / 100);
      } else {
        m = editModalRes.priceDetails.markupApplied.value;
      }
    }
    m = parseFloat(editMarkup) || m;
    const c = editModalRes.priceIssueCommission;
    const d = parseFloat(editDiscount) || 0;
    const np = s + m;
    const sp = np - c - d;
    return { s, m, np, c, d, sp };
  };

  const editModalCalculatedPrices = editModalRes
    ? calculatePricesForEditModal()
    : null;

  // Helper function to format dates to DD/MM/YYYY
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "—";
      }
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "—";
    }
  };

  // Helper function to format dates and times to DD/MM/YYYY at HH:MM
  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "—";
      }
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      // Format: DD/MM/YYYY at HH:MM
      return `${day}/${month}/${year} at ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date and time:", dateString, error);
      return "—";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            An Error Occurred
          </h2>
          <p className="text-red-500 dark:text-red-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <p className="text-lg dark:text-gray-200">Loading bookings…</p>
      </div>
    );
  }

  const baseButtonStyles =
    "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg shadow-sm border transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  const defaultButtonStyles =
    "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600";
  const cancelButtonStyles =
    "bg-red-500 hover:bg-red-600 text-white border-red-600";
  const payButtonStyles =
    "bg-green-500 hover:bg-green-600 text-white border-green-600";
  const viewButtonStyles =
    "bg-blue-500 hover:bg-blue-600 text-white border-blue-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans">
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
                {reservations.length} Bookings
              </div>
            </div>
          </div>
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
        {/* Search and Filter Form */}
        <div className="mb-8 p-6 bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Search & Filter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by Hotel Name"
              value={searchHotelName}
              onChange={(e) => setSearchHotelName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Search by Booking ID"
              value={searchBookingId}
              onChange={(e) => setSearchBookingId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
            />
            <input
              type="date"
              placeholder="Check-in Date"
              value={searchCheckInDate}
              onChange={(e) => setSearchCheckInDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
            />
            <input
              type="date"
              placeholder="Check-out Date"
              value={searchCheckOutDate}
              onChange={(e) => setSearchCheckOutDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Search by Guest Name"
              value={searchGuestName}
              onChange={(e) => setSearchGuestName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Search by Agency Name"
              value={searchAgencyName}
              onChange={(e) => setSearchAgencyName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
            />
            <select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="PAYLATER">PAYLATER</option>
              <option value="Credit">Credit</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredReservations.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-12 border border-white/50 dark:border-gray-700/50 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiLayout className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {reservations.length === 0
                  ? "No Booking Data"
                  : "No Bookings Found"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {reservations.length === 0
                  ? "There is no booking information to display at the moment."
                  : "No bookings match the selected filters. Try clearing your search."}
              </p>
            </div>
          </div>
        )}

        {filteredReservations.map((r) => {
          const isExpanded = expandedCardId === r.bookingId;

          // Determine the overall status. If any room is cancelled, the whole booking is considered cancelled for the UI.
          const isAnyRoomCancelled = r.allRooms.some(
            (room) => room.status.toLowerCase() === "cancelled"
          );
          const overallStatusKey = isAnyRoomCancelled
            ? "cancelled"
            : r.topStatus.toLowerCase();
          const statusKey = overallStatusKey as keyof typeof statusMap;

          // --- NEW: Check if the booking is cancelled ---
          const isCancelled = overallStatusKey === "cancelled";

          const statusDetails = statusMap[statusKey] || statusMap.pending;
          const IconStatus = statusDetails.icon;
          const leadPassenger =
            r.passengers.find((p) => p.lead) || r.passengers[0];
          const guestName = leadPassenger
            ? `${leadPassenger.firstName} ${leadPassenger.lastName}`
            : "N/A";

          // --- MODIFIED PRICE CALCULATION ---
          let S, C, M, D, NP, SP;

          if (isCancelled) {
            S = 0;
            C = 0;
            M = 0;
            D = 0;
            NP = 0;
            SP = 0;
          } else {
            S = r.priceDetails?.originalPrice?.value ?? r.priceIssueNet;
            C = r.priceIssueCommission;
            const SP_from_api =
              r.priceDetails?.price?.value ?? r.priceIssueSelling;
            M = 0;
            if (r.priceDetails?.markupApplied) {
              if (r.priceDetails.markupApplied.type === "percentage") {
                M = S * (r.priceDetails.markupApplied.value / 100);
              } else {
                M = r.priceDetails.markupApplied.value;
              }
            } else {
              const tempD = 0.0;
              M = SP_from_api - S + C + tempD;
            }
            D = 0.0;
            NP = S + M;
            SP = NP - C - D;
          }

          // --- NEW: Create a modified reservation object for props if cancelled ---
          const reservationForModals = isCancelled
            ? {
                ...r,
                price: 0,
                priceIssueNet: 0,
                priceIssueCommission: 0,
                priceIssueSelling: 0,
                priceDetails: {
                  ...(r.priceDetails ?? {}),
                  originalPrice: {
                    ...(r.priceDetails?.originalPrice ?? {}),
                    value: 0,
                  },
                  price: { ...(r.priceDetails?.price ?? {}), value: 0 },
                  markupApplied: {
                    ...(r.priceDetails?.markupApplied ?? {}),
                    value: 0,
                  },
                },
                allRooms: r.allRooms.map((room) => ({
                  ...room,
                  status: "cancelled", // Set room status to cancelled
                  priceNet: 0,
                  priceCommission: 0,
                })),
              }
            : r;

          const isGenerating = generatingDocFor === r.bookingId;

          return (
            <div
              key={r.bookingId}
              className="bg-white dark:bg-gray-800 rounded-lg mb-4 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              {/* --- Card Header with Actions --- */}
              <div className="p-4 flex flex-col lg:flex-row lg:justify-between lg:items-center">
                {/* Left side: Hotel Info & Mobile Toggle */}
                <div className="flex items-start justify-between w-full lg:w-auto">
                  <div
                    className="flex items-center space-x-3 min-w-0 cursor-pointer lg:cursor-default"
                    onClick={() =>
                      window.innerWidth < 1024 &&
                      setExpandedCardId((prev) =>
                        prev === r.bookingId ? null : r.bookingId
                      )
                    }
                  >
                    <IconStatus
                      className={`${statusDetails.color} mt-1 flex-shrink-0`}
                      size={18}
                    />
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {r.hotelInfo.name || "Hotel details not available"}
                        <span className="text-gray-400 dark:text-gray-500 text-sm font-normal ml-2">
                          ({statusDetails.label})
                        </span>
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Booking ID:{" "}
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {r.bookingId || "—"}
                        </span>
                      </p>
                    </div>
                  </div>
                  {/* --- Mobile Toggle Button --- */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCardId((prev) =>
                        prev === r.bookingId ? null : r.bookingId
                      );
                    }}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                    aria-label="Toggle details"
                  >
                    <FaChevronDown
                      className={`transform transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                </div>
                {/* Right side: Action Buttons */}
                <div className="flex items-center flex-wrap gap-2 mt-4 lg:mt-0 shrink-0 lg:pl-4">
                  <button
                    onClick={() =>
                      router.push(
                        "/wholesaler?page=Booking&tab=ManualReservationsOnline"
                      )
                    }
                    className={`${baseButtonStyles} ${defaultButtonStyles}`}
                  >
                    <FaPlus />
                    <span>Add Service</span>
                  </button>
                  <button
                    onClick={() => handleCancelClick(reservationForModals)}
                    disabled={overallStatusKey === "cancelled"}
                    className={`${baseButtonStyles} ${cancelButtonStyles}`}
                  >
                    <FaBan />
                    <span>Cancel</span>
                  </button>

                  {r.paymentType.toLowerCase() === "paylater" && (
                    <button
                      onClick={() => setPayModalRes(reservationForModals)}
                      disabled={overallStatusKey === "cancelled"}
                      className={`${baseButtonStyles} ${payButtonStyles}`}
                    >
                      <FaCreditCard />
                      <span>PayNow</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleGenerateVoucher(reservationForModals)}
                    disabled={isGenerating || isLoaderVisible}
                    className={`${baseButtonStyles} ${defaultButtonStyles}`}
                  >
                    <FaTicketAlt />
                    <span>Voucher</span>
                  </button>
                  <button
                    onClick={() => handleGenerateInvoice(reservationForModals)}
                    disabled={isGenerating || isLoaderVisible}
                    className={`${baseButtonStyles} ${defaultButtonStyles}`}
                  >
                    <FaFileInvoiceDollar />
                    <span>Invoice</span>
                  </button>
                  <button
                    onClick={() => setViewModalRes(reservationForModals)}
                    className={`${baseButtonStyles} ${viewButtonStyles}`}
                  >
                    <FaEye />
                    <span>View</span>
                  </button>
                </div>
              </div>

              {/* --- Expandable Content --- */}
              <div
                className={`
                  transition-all duration-500 ease-in-out
                  ${
                    isExpanded
                      ? "max-h-[1500px] opacity-100"
                      : "max-h-0 opacity-0"
                  }
                  overflow-hidden
                  lg:max-h-full lg:opacity-100
                `}
              >
                {/* --- Main Content Area with Full-Height Rooms Column --- */}
                <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-x-8">
                    {/* --- LEFT SIDE: All details except rooms (takes up 3 of 4 columns) --- */}
                    <div className="lg:col-span-3 space-y-6">
                      {/* Section 1: Guest, Agency, Created On */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                        <div>
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            Guest
                          </p>
                          <p className="text-gray-800 dark:text-gray-200">
                            {guestName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            Agency
                          </p>
                          <p className="text-gray-800 dark:text-gray-200">
                            {r.agencyName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            Created On
                          </p>
                          <p className="text-gray-800 dark:text-gray-200">
                            {formatDate(r.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Section 2: Price & Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-6 text-sm pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="md:col-span-1">
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                            Price ({r.currency})
                          </p>
                          <div className="space-y-1 text-sm dark:text-gray-100">
                            <div className="flex justify-between">
                              <span>S (Suppl.):</span>{" "}
                              <span>{S.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>M (Markup):</span>{" "}
                              <span>{M.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-600 pt-1">
                              <span>NP (Net):</span> <span>{NP.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-red-500">
                              <span>C (Comm.):</span>{" "}
                              <span>{C.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-red-500">
                              <span>D (Disc.):</span>{" "}
                              <span>{D.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-indigo-600 dark:text-indigo-400 border-t border-gray-200 dark:border-gray-600 pt-1">
                              <span>SP (Sell):</span>{" "}
                              <span>{SP.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:col-span-2">
                          <div>
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                              Check In
                            </p>
                            <p className="text-gray-800 dark:text-gray-200">
                              {formatDate(r.checkIn)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                              Check Out
                            </p>
                            <p className="text-gray-800 dark:text-gray-200">
                              {formatDate(r.checkOut)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                              Nights
                            </p>
                            <p className="text-gray-800 dark:text-gray-200">
                              {r.nights || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                              Payment
                            </p>
                            <p className="text-gray-800 dark:text-gray-200">
                              {r.paymentType || "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Destination, Nationality & Provider */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            Destination
                          </p>
                          <p className="text-gray-800 dark:text-gray-200">
                            {r.destinationCity && r.destinationCountry
                              ? `${r.destinationCity}, ${r.destinationCountry}`
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            Nationality
                          </p>
                          <p className="text-gray-800 dark:text-gray-200">
                            {r.nationality || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            Provider
                          </p>
                          <p className="text-gray-800 dark:text-gray-200">
                            {r.providerName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* --- RIGHT SIDE: Rooms column (takes up 1 of 4 columns) --- */}
                    <div className="lg:col-span-1 mt-6 lg:mt-0 pt-6 lg:pt-0 border-t lg:border-t-0 lg:pl-8 lg:border-l border-gray-200 dark:border-gray-700">
                      <div className="text-sm">
                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                          Rooms
                        </p>
                        <div className="mt-1">
                          {reservationForModals.allRooms.map((room, index) => {
                            let cancellationDateString = null;
                            if (
                              Array.isArray(room.cancellationPolicy?.policies) &&
                              room.cancellationPolicy.policies.length > 0 &&
                              room.cancellationPolicy.policies[0].startDate
                            ) {
                              cancellationDateString =
                                room.cancellationPolicy.policies[0].startDate;
                            } else if (room.cancellationPolicy?.date) {
                              cancellationDateString =
                                room.cancellationPolicy.date;
                            }

                            return (
                              <React.Fragment
                                key={room.reservationId || index}
                              >
                                <div className="py-2">
                                  <p
                                    className="font-semibold text-sm text-gray-900 dark:text-gray-100"
                                    title={`${room.roomName} (${room.status})`}
                                  >
                                    {room.roomName}
                                    <span
                                      className={`ml-2 capitalize font-medium ${
                                        room.status === "cancelled"
                                          ? "text-red-500"
                                          : room.status === "pending"
                                          ? "text-yellow-500"
                                          : "text-green-600"
                                      }`}
                                    >
                                      (
                                      {room.status === "pending"
                                        ? "Payment Pending"
                                        : room.status === "confirmed"
                                        ? "Paid"
                                        : room.status}
                                      )
                                    </span>
                                  </p>
                                  {cancellationDateString && (
                                    <p className="text-sm font-medium mt-0.5">
                                      <span className="text-red-600 dark:text-red-500">
                                        Auto cancellation by---{" "}
                                      </span>
                                      <span className="text-red-600 dark:text-red-500">
                                        {formatDateTime(cancellationDateString)}
                                      </span>
                                    </p>
                                  )}
                                </div>
                                {index < r.allRooms.length - 1 && (
                                  <hr className="border-gray-200 dark:border-gray-600" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

      {/* --- UPDATED: Props for RoomCancellationModal have changed --- */}
      {cancelModalRes && (
        <RoomCancellationModal
          reservation={cancelModalRes}
          onSuccess={handleCancellationSuccess}
          onClose={() => setCancelModalRes(null)}
        />
      )}

      {/* --- NEW: Render the payment modal --- */}
      {payModalRes && (
        <PayOptionsModal
          reservation={payModalRes}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPayModalRes(null)}
        />
      )}

      {/* --- NEW: Render the Percentage Loader Modal --- */}
      <PercentageLoaderModal
        isOpen={isLoaderVisible}
        progress={loaderProgress}
        message={loaderMessage}
      />
    </div>
  );
};

export default BookingsPage;