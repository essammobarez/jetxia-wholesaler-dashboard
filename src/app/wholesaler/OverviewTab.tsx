"use client";
import { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BiTransferAlt } from "react-icons/bi";
import {
  FaBuilding,
  FaCarSide,
  FaCheckCircle,
  FaChevronDown, // <-- Icon for the toggle button
  FaCommentAlt,
  FaTimesCircle,
  FaTrain,
} from "react-icons/fa";
import { FiLayout } from "react-icons/fi";
import { RiPlaneLine } from "react-icons/ri";
import BookingActions from "./BookingActions";
import { BookingModal, Reservation } from "./BookingModal";
import CancellationConfirmationModal from "./CancellationConfirmationModal";
import EditPriceModal from "./EditPriceModal";

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
  pending: { icon: FaCommentAlt, color: "text-yellow-500", label: "PR" },
  confirmed: { icon: FaCheckCircle, color: "text-green-500", label: "Paid" },
  ok: { icon: FaCheckCircle, color: "text-green-500", label: "OK" },
};

const BookingsPage: NextPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNav, setSelectedNav] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "All" | "Upcoming" | "Active" | "Completed" | "Cancelled"
  >("All");
  const [viewModalRes, setViewModalRes] = useState<Reservation | null>(null);
  const [editModalRes, setEditModalRes] = useState<Reservation | null>(null);
  const [editMarkup, setEditMarkup] = useState<string>("0.00");
  const [editCommission, setEditCommission] = useState<string>("0.00");
  const [editDiscount, setEditDiscount] = useState<string>("0.00");

  const [cancelModalRes, setCancelModalRes] = useState<Reservation | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

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

  const CANCELLATION_BASE_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}booking/cancellations`;

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

        // **MODIFIED**: Handle both direct array and nested { data: [...] } structures
        let bookingsArray: any[] = [];
        if (responseData && Array.isArray(responseData.data)) {
          bookingsArray = responseData.data; // For "sales" role
        } else if (Array.isArray(responseData)) {
          bookingsArray = responseData; // For other roles
        }

        if (bookingsArray.length > 0) {
          const mapped: Reservation[] = bookingsArray.map((item: any) => {
            const priceDetails = item.priceDetails || {};
            const bookingData = item.bookingData || {};
            const init = bookingData.initialResponse || {};
            const det = bookingData.detailedInfo?.service || {};
            const bookingId = String(item.bookingId ?? "");
            const sequenceNumber = Number(item.sequenceNumber ?? 0);
            const reservationId = Number(item.reservationId ?? 0);
            const topStatus = String(item.status ?? "").toLowerCase();
            const createdAt = String(item.createdAt ?? "");
            const dbId = String(item._id ?? "");
            const agencyName = item.agency?.agencyName ?? "N/A";
            
            // **MODIFIED**: Handle different data structures for wholesaler and provider
            const wholesaler = item.wholesaler;
            const wholesalerName = wholesaler?.wholesalerName ?? (typeof wholesaler === 'string' ? wholesaler : "N/A");
            const provider = item.provider;
            const providerId = typeof provider === 'string' ? provider : provider?._id ?? "N/A";
            const providerName = typeof provider === 'object' && provider !== null ? provider.name ?? "N/A" : "N/A";

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
            const priceIssueCommission = Number(
              det.prices?.issue?.commission?.value ?? 0
            );
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
            const remarks: {
              code: string;
              name: string;
              list: string[];
            }[] = Array.isArray(det.remarks)
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
              dbId,
              bookingId,
              sequenceNumber,
              reservationId,
              topStatus,
              createdAt,
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
              passengers,
              remarks,
              hotelInfo,
              rooms,
              freeCancellation,
              priceDetails: item.priceDetails,
            };
          });
          setReservations(mapped);
        } else {
          setReservations([]);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(
          errorData.message || `API request failed with status: ${res.status}`
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

  const filteredReservations = reservations.filter((r) => {
    const status = r.topStatus.toLowerCase();
    if (activeTab === "All") return true;
    if (activeTab === "Cancelled")
      return status === "cancelled" || status === "cancelled";
    return status === activeTab.toLowerCase();
  });

  const handleCancelClick = (reservation: Reservation) => {
    setCancelModalRes(reservation);
  };

  const handleConfirmCancellation = useCallback(
    async (dbId: string) => {
      setIsCanceling(true);
      try {
        const response = await fetch(`${CANCELLATION_BASE_ENDPOINT}/${dbId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        await response.json();
        toast.success("Booking successfully cancelled!");
        setCancelModalRes(null);
        fetchReservations();
      } catch (error: any) {
        toast.error(`Cancellation failed: ${error.message || "Unknown error"}`);
      } finally {
        setIsCanceling(false);
      }
    },
    [fetchReservations, CANCELLATION_BASE_ENDPOINT]
  );

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
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
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
                {reservations.length === 0
                  ? "No Booking Data"
                  : "No Bookings Found"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {reservations.length === 0
                  ? "There is no booking information to display at the moment."
                  : "No bookings match the selected filters. Try switching to a different tab."}
              </p>
            </div>
          </div>
        )}

        {filteredReservations.map((r) => {
          const isExpanded = expandedCardId === r.bookingId;
          const statusKey = r.topStatus.toLowerCase() as keyof typeof statusMap;
          const statusDetails = statusMap[statusKey] || statusMap.confirmed;
          const IconStatus = statusDetails.icon;
          const leadPassenger =
            r.passengers.find((p) => p.lead) || r.passengers[0];
          const guestName = leadPassenger
            ? `${leadPassenger.firstName} ${leadPassenger.lastName}`
            : "N/A";
          const S = r.priceDetails?.originalPrice?.value ?? r.priceIssueNet;
          const C = r.priceIssueCommission;
          const SP_from_api =
            r.priceDetails?.price?.value ?? r.priceIssueSelling;
          let M = 0;
          if (r.priceDetails?.markupApplied) {
            if (r.priceDetails.markupApplied.type === "percentage") {
              M = S * (r.priceDetails.markupApplied.value / 100);
            } else {
              M = r.priceDetails.markupApplied.value;
            }
          } else {
            const D = 0.0;
            M = SP_from_api - S + C + D;
          }
          const D = 0.0;
          const NP = S + M;
          const SP = NP - C - D;

          return (
            <div
              key={r.reservationId}
              className="bg-white dark:bg-gray-800 rounded-lg mb-4 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              {/* --- Card Header (Always Visible) --- */}
              <div
                className="p-4 flex justify-between items-start cursor-pointer lg:cursor-default"
                onClick={() =>
                  window.innerWidth < 1024 &&
                  setExpandedCardId((prev) =>
                    prev === r.bookingId ? null : r.bookingId
                  )
                }
              >
                <div className="flex items-center space-x-3 min-w-0">
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

              {/* --- Expandable Content --- */}
              <div
                className={`
                  transition-all duration-500 ease-in-out
                  ${isExpanded ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0"}
                  overflow-hidden
                  lg:max-h-full lg:opacity-100
                  lg:grid lg:grid-cols-7  
                `}
              >
                {/* Main Content Area */}
                <div className="lg:col-span-6 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 lg:border-t-0 space-y-6">
                  {/* First details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Guest</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{guestName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Provider Name</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{r.providerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created On</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatDate(r.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Second row: price/payment & dates */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-6 text-sm pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="md:col-span-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price ({r.currency})</p>
                      <div className="space-y-1 text-xs dark:text-gray-100">
                        <div className="flex justify-between"><span>S (Suppl.):</span> <span>{S.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>M (Markup):</span> <span>{M.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-600 pt-1"><span>NP (Net):</span> <span>{NP.toFixed(2)}</span></div>
                        <div className="flex justify-between text-red-500"><span>C (Comm.):</span> <span>{C.toFixed(2)}</span></div>
                        <div className="flex justify-between text-red-500"><span>D (Disc.):</span> <span>{D.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-indigo-600 dark:text-indigo-400 border-t border-gray-200 dark:border-gray-600 pt-1"><span>SP (Sell):</span> <span>{SP.toFixed(2)}</span></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:col-span-2">
                      <div><p className="text-xs text-gray-500 dark:text-gray-400">Check In</p><p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(r.checkIn)}</p></div>
                      <div><p className="text-xs text-gray-500 dark:text-gray-400">Check Out</p><p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(r.checkOut)}</p></div>
                      <div><p className="text-xs text-gray-500 dark:text-gray-400">Nights</p><p className="font-semibold text-gray-900 dark:text-gray-100">{r.nights || "—"}</p></div>
                      <div><p className="text-xs text-gray-500 dark:text-gray-400">Payment</p><p className="font-semibold text-gray-900 dark:text-gray-100">{r.paymentType || "—"}</p></div>
                    </div>
                  </div>

                  {/* Third row: location & cancellation */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div><p className="text-xs text-gray-500 dark:text-gray-400">Destination</p><p className="font-semibold text-gray-900 dark:text-gray-100">{r.destinationCity && r.destinationCountry ? `${r.destinationCity}, ${r.destinationCountry}` : "—"}</p></div>
                    <div><p className="text-xs text-gray-500 dark:text-gray-400">Nationality</p><p className="font-semibold text-gray-900 dark:text-gray-100">{r.nationality || "—"}</p></div>
                    <div><p className="text-xs text-gray-500 dark:text-gray-400">Cancel By</p><p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(r.cancellationDate)}</p></div>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="lg:col-span-1 border-t border-gray-200 dark:border-gray-700 lg:border-t-0 lg:border-l">
                  <BookingActions
                    reservation={r}
                    onViewDetails={() => setViewModalRes(r)}
                    onEditPrice={(reservationToEdit) => {
                      setEditModalRes(reservationToEdit);
                      const currentS = reservationToEdit.priceDetails?.originalPrice?.value ?? reservationToEdit.priceIssueNet;
                      const currentSP = reservationToEdit.priceDetails?.price?.value ?? reservationToEdit.priceIssueSelling;
                      const currentC = reservationToEdit.priceIssueCommission;
                      const currentD = 0.0;
                      let initialMarkup = 0;
                      if (reservationToEdit.priceDetails?.markupApplied) {
                        if (reservationToEdit.priceDetails.markupApplied.type === "percentage") {
                          initialMarkup = currentS * (reservationToEdit.priceDetails.markupApplied.value / 100);
                        } else {
                          initialMarkup = reservationToEdit.priceDetails.markupApplied.value;
                        }
                      } else {
                        initialMarkup = currentSP - currentS + currentC + currentD;
                      }
                      setEditMarkup(initialMarkup.toFixed(2));
                      setEditCommission(currentC.toFixed(2));
                      setEditDiscount(currentD.toFixed(2));
                    }}
                    onCancel={handleCancelClick}
                  />
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

      {cancelModalRes && (
        <CancellationConfirmationModal
          booking={{
            dbId: cancelModalRes.dbId || cancelModalRes.bookingId,
            bookingId: cancelModalRes.bookingId,
            hotel: cancelModalRes.hotelInfo.name,
            guestName:
              cancelModalRes.passengers.find((p) => p.lead)?.firstName +
                " " +
                cancelModalRes.passengers.find((p) => p.lead)?.lastName || "N/A",
            checkIn: formatDate(cancelModalRes.checkIn),
            checkOut: formatDate(cancelModalRes.checkOut),
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