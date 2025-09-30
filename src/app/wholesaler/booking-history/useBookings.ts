// NOTE: Assuming the full 'Reservation' type is imported/defined elsewhere (e.g., in BookingModal).
// For internal use, we define minimal interfaces to allow the logic to be type-safe.

interface PriceDetails {
  originalPrice?: { value: number };
  markupApplied?: { type: string; value: number };
  price?: { value: number };
}

interface RoomGuest {
    paxId: number;
    type: string;
    lead: boolean;
    title: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    phonePrefix: string | null;
    nationality: string;
}

interface AllRoomData {
    status: string;
    cancellationPolicy: any;
    guests: RoomGuest[];
    priceNet: number;
    priceCommission: number;
}

export interface MinimalReservation {
  dbId: string;
  bookingId: string;
  topStatus: string;
  price: number;
  currency: string;
  agencyName: string;
  wholesalerName: string;
  checkIn: string;
  checkOut: string;
  hotelInfo: { name: string };
  passengers: RoomGuest[];
  priceDetails?: PriceDetails;
  priceIssueNet: number;
  priceIssueCommission: number;
  priceIssueSelling: number;
  paymentType: string;
  allRooms: AllRoomData[];
  source: string | null;
  // NOTE: This interface is minimal. The hook logic contains all the field mapping 
  // from the original file, ensuring full data is processed.
}

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// NOTE: These utility files were included in the original file and must be imported here now.
import { generateInvoiceNumber, generateInvoicePDF } from "./InvoiceGenerator";
import { generateVoucherPDF } from "./voucher";

// Importing the constants from the new constants file
import { navItems, statusMap } from "./BookingConstants";


export const useBookings = () => {
  const router = useRouter(); // MODIFIED: Import useRouter and initialize
  const [darkMode, setDarkMode] = useState(false);
  const [reservations, setReservations] = useState<MinimalReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNav, setSelectedNav] = useState(0);
  const [viewModalRes, setViewModalRes] = useState<MinimalReservation | null>(null);
  const [editModalRes, setEditModalRes] = useState<MinimalReservation | null>(null);
  const [editMarkup, setEditMarkup] = useState<string>("0.00");
  const [editCommission, setEditCommission] = useState<string>("0.00");
  const [editDiscount, setEditDiscount] = useState<string>("0.00");

  const [cancelModalRes, setCancelModalRes] = useState<MinimalReservation | null>(null);
  const [payModalRes, setPayModalRes] = useState<MinimalReservation | null>(null);

  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // State for tracking document generation
  const [generatingDocFor, setGeneratingDocFor] = useState<string | null>(null);
  // --- NEW: State for tracking which booking status is being updated ---
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

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
          const mapped: MinimalReservation[] = bookingsArray.map((item: any) => {
            // --- NEW: Process data for all rooms for the modal ---
            const allRoomsData: AllRoomData[] = (item.rooms || []).map((room: any) => {
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
                    ).replace(/[\s\u202F]+/g, " ");
                    // Handle regular and non-breaking spaces

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

              const roomGuests: RoomGuest[] = Array.isArray(room.guests)
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
            const detailedService = room.bookingData?.detailedInfo?.service || {};
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

  // --- NEW: Handler for "On Request" status changes (Accept/Reject) ---
  const handleOnRequestStatusChange = async (
    bookingId: string,
    newStatus: "confirmed" | "cancelled"
  ) => {
    if (!wholesalerId) {
      toast.error("Wholesaler ID is missing. Cannot update status.");
      return;
    }

    setUpdatingBookingId(bookingId); // Set loading state for this specific booking
    const toastId = toast.loading(`Updating status to ${newStatus}...`);
    const token =
      document.cookie
        .split("; ")
        .find((r) => r.startsWith("authToken="))
        ?.split("=")[1] ||
      localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authorization failed. Please log in again.", { id: toastId });
      setUpdatingBookingId(null);
      return;
    }

    const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}booking/wholesaler/${wholesalerId}/onrequest/${bookingId}/status`;

    try {
      const response = await fetch(endpoint, {
        method: "PUT", // Using PUT as we are updating the status resource
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        toast.success("Booking status updated successfully!", { id: toastId });
        fetchReservations(); // Refresh the data
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.message || `Failed to update status: ${response.statusText}`,
          { id: toastId }
        );
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        id: toastId,
      });
    } finally {
      setUpdatingBookingId(null); // Reset loading state
    }
  };

  const handleCancelClick = (reservation: MinimalReservation | null) => {
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
  const handleGenerateInvoice = (reservation: MinimalReservation) => {
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

  const handleGenerateVoucher = (reservation: MinimalReservation) => {
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
      const month = String(date.getMonth() + 1).padStart(2, "0");
      // Months are 0-indexed
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


  return {
    darkMode, setDarkMode,
    reservations, loading, error,
    selectedNav, setSelectedNav,
    viewModalRes, setViewModalRes,
    editModalRes, setEditModalRes,
    editMarkup, setEditMarkup,
    editCommission, setEditCommission,
    editDiscount, setEditDiscount,
    cancelModalRes, handleCancelClick, handleCancellationSuccess,
    payModalRes, setPayModalRes, handlePaymentSuccess,
    generatingDocFor,
    updatingBookingId,
    loaderProgress, isLoaderVisible, loaderMessage,
    searchHotelName, setSearchHotelName,
    searchBookingId, setSearchBookingId,
    searchCheckInDate, setSearchCheckInDate,
    searchCheckOutDate, setSearchCheckOutDate,
    searchGuestName, setSearchGuestName,
    searchAgencyName, setSearchAgencyName,
    searchStatus, setSearchStatus,
    expandedCardId, setExpandedCardId,
    filteredReservations,
    handleOnRequestStatusChange,
    handleGenerateInvoice,
    handleGenerateVoucher,
    handleSaveEdit,
    calculatePricesForEditModal,
    editModalCalculatedPrices,
    formatDate,
    formatDateTime,
    navItems, // Export constants for easy UI access
    statusMap, // Export constants for easy UI access
  };
};