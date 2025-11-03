"use client";
import { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BiTransferAlt } from "react-icons/bi";
import {
  FaBuilding,
  FaCarSide,
  FaCheckCircle,
  FaCommentAlt,
  FaTimesCircle,
  FaTrain,
} from "react-icons/fa";
import { FiLayout } from "react-icons/fi";
import { RiPlaneLine } from "react-icons/ri";
import React from "react";

import AddConfirmationModal from "./AddConfirmationModal";
import BookingCard from "./BookingCard";
import BookingFilter from "./BookingFilter";
import { BookingModal, Reservation } from "./BookingModal";
import EditPriceModal from "./EditPriceModal";
import { generateInvoicePDF } from "./InvoiceGenerator";
import PercentageLoaderModal from "./LoadingModal";
import RoomCancellationModal from "./RoomCancellationModal";
import PayOptionsModal from "./payoptionsmodal";
import {
  generateVoucherPDF,
  Reservation as VoucherReservationData,
} from "./voucher";

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
  pending: { icon: FaCommentAlt, color: "text-yellow-500", label: "PayLater" },
  confirmed: { icon: FaCheckCircle, color: "text-green-500", label: "Paid" },
  onrequest: {
    icon: FaCommentAlt,
    color: "text-blue-500",
    label: "On Request",
  },
  ok: { icon: FaCheckCircle, color: "text-green-500", label: "OK" },
};

const BookingsPage: NextPage = () => {
  const router = useRouter();
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

  const [confirmationModalData, setConfirmationModalData] = useState<{
    reservation: Reservation;
    reservationId: number;
  } | null>(null);

  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  const [generatingDocFor, setGeneratingDocFor] = useState<string | null>(null);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
    null
  );

  const [loaderProgress, setLoaderProgress] = useState(0);
  const [isLoaderVisible, setIsLoaderVisible] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("");

  const [searchHotelName, setSearchHotelName] = useState("");
  const [searchBookingId, setSearchBookingId] = useState("");
  const [searchCheckInDate, setSearchCheckInDate] = useState("");
  const [searchCheckOutDate, setSearchCheckOutDate] = useState("");
  const [searchGuestName, setSearchGuestName] = useState("");
  const [searchAgencyName, setSearchAgencyName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

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
        let bookingsArray: any[] = [];
        if (responseData && Array.isArray(responseData.data)) {
          bookingsArray = responseData.data;
        } else if (Array.isArray(responseData)) {
          bookingsArray = responseData;
        }

        if (bookingsArray.length > 0) {
          const mapped: Reservation[] = bookingsArray.map((item: any) => {
            const dbId = String(item._id ?? "");
            const bookingId = String(item.bookingId ?? "");
            const sequenceNumber = Number(item.sequenceNumber ?? 0);
            const topStatus = String(item.status ?? "").toLowerCase();
            const createdAt = String(item.createdAt ?? "");

            // --- MODIFICATION: Get agency object directly from response ---
            const agency = item.agency;
            const agencyName = item.agency?.agencyName ?? "N/A";

            const wholesaler = item.wholesaler;
            const wholesalerName = "N/A";
            const clientRef = String(item.clientReference ?? "");
            const serviceType = "hotel";
            const paymentType = String(item.bookingType ?? "");
            const price = Number(item.totalPrice?.value ?? 0);
            const currency = String(item.totalPrice?.currency ?? "USD");
            const checkIn = String(item.serviceDates?.startDate ?? "");
            const checkOut = String(item.serviceDates?.endDate ?? "");
            const nights = Number(item.serviceDates?.duration ?? 0);
            const destinationCity = item.hotel?.city ?? "";
            const destinationCountry = item.hotel?.country ?? "";
            const priceDetails = item.priceDetails;
            const topLevelHotelInfo = item.hotel;

            // --- MODIFICATION: Get special requests from first room ---
            const firstRawRoom = item.rooms?.[0] || {};
            const specialRequests = (firstRawRoom.specialRequests || []).map(
              (req: any) => String(req.request ?? "")
            );

            const allRoomsData = (item.rooms || []).map((room: any) => {
              const detailedService =
                room.bookingData?.detailedInfo?.service || {};
              const roomInfo = detailedService.rooms?.[0] || {};
              const firstGuestInRoom = room.guests?.[0];

              const roomGuests = (room.guests || []).map((p: any) => ({
                paxId: 0,
                type: String(p.type ?? "adult"),
                lead: !!p.lead,
                title: "",
                firstName: String(p.firstName ?? ""),
                lastName: String(p.lastName ?? ""),
                email: p.email ?? null,
                phone: p.phone ?? null,
                phonePrefix: p.phonePrefix ?? null,
                nationality: String(p.nationality ?? ""),
              }));

              return {
                reservationId: Number(room.reservationId ?? 0),
                status: String(room.status ?? "N/A").toLowerCase(),
                rateDescription: String(
                  detailedService.rateDetails?.name ?? room.board ?? ""
                ),
                priceNet: Number(
                  detailedService.prices?.total?.net?.value ?? 0
                ),
                priceCommission: Number(
                  detailedService.prices?.total?.commission?.value ?? 0
                ),
                cancellationPolicy: room.cancellationPolicy ?? null,
                guests: roomGuests,
                remarks: [],
                roomName: String(roomInfo.name || room.name || "N/A"),
                board: String(room.board ?? roomInfo.board ?? "N/A"),
                boardBasis: String(roomInfo.boardBasis ?? "N/A"),
                info: String(roomInfo.info ?? ""),
                nationality: firstGuestInRoom?.nationality ?? "",
                reference: room.reference ?? {
                  external: null,
                  confirmation: null,
                },
                confirmationNo: room.reference?.confirmation ?? null,
              };
            });

            const allPassengers = allRoomsData.flatMap((r) => r.guests);
            const firstRoomData = allRoomsData[0] || {};
            // const firstRawRoom = item.rooms?.[0] || {}; // Already defined above
            const firstDetailedService =
              firstRawRoom.bookingData?.detailedInfo?.service || {};

            const priceIssueNet = firstRoomData.priceNet ?? 0;
            const priceIssueCommission = firstRoomData.priceCommission ?? 0;
            const priceIssueSelling = price;

            const hotelInfo = {
              id: String(firstDetailedService.hotel?.id ?? ""),
              name: String(
                topLevelHotelInfo?.name ??
                  firstDetailedService.hotel?.name ??
                  "N/A"
              ),
              stars: Number(
                topLevelHotelInfo?.stars ??
                  firstDetailedService.hotel?.stars ??
                  0
              ),
              lastUpdated: String(
                firstDetailedService.hotel?.lastUpdated ?? ""
              ),
              cityId: String(firstDetailedService.hotel?.cityId ?? ""),
              countryId: String(firstDetailedService.hotel?.countryId ?? ""),
            };

            return {
              dbId,
              bookingId,
              sequenceNumber,
              reservationId: firstRoomData.reservationId ?? 0,
              topStatus,
              createdAt,
              agency, // --- MODIFICATION: Pass the full agency object ---
              agencyName,
              wholesaler,
              wholesalerName,
              providerId: String(firstRawRoom.provider?._id ?? ""),
              providerName: String(firstRawRoom.provider?.name ?? ""),
              clientRef,
              serviceType,
              initStatus: firstRoomData.status ?? topStatus,
              price,
              currency,
              addedTime: String(firstDetailedService.added?.time ?? ""),
              addedUser: String(firstDetailedService.added?.user?.name ?? ""),
              paymentType,
              paymentStatus: topStatus,
              rateDescription: firstRoomData.rateDescription ?? "",
              priceIssueNet,
              priceIssueCommission,
              priceIssueSelling,
              cancellationDate: String(
                firstRoomData.cancellationPolicy?.date ?? ""
              ),
              checkIn,
              checkOut,
              nights,
              destinationCity,
              destinationCountry,
              nationality: firstRoomData.nationality ?? "",
              passengers: allPassengers,
              remarks: [],
              hotelInfo,
              rooms: (firstDetailedService.rooms || []).map((rm: any) => ({
                id: String(rm.id ?? ""),
                name: String(rm.name ?? ""),
                board: String(rm.board ?? ""),
                boardBasis: String(rm.boardBasis ?? ""),
                info: String(rm.info ?? ""),
                passengerIds: Array.isArray(rm.passengers)
                  ? rm.passengers.map((pid: any) => Number(pid))
                  : [],
              })),
              freeCancellation: String(
                firstRoomData.cancellationPolicy?.date ?? ""
              ),
              priceDetails,
              allRooms: allRoomsData,
              source: null,
              specialRequests, // --- MODIFICATION: Add special requests to reservation object ---
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

  const filteredReservations = reservations.filter((r) => {
    const hotelNameMatch =
      !searchHotelName ||
      r.hotelInfo.name.toLowerCase().includes(searchHotelName.toLowerCase());
    const bookingIdMatch =
      !searchBookingId ||
      r.bookingId.toLowerCase().includes(searchBookingId.toLowerCase());
    const checkInDateMatch =
      !searchCheckInDate || r.checkIn.startsWith(searchCheckInDate);
    const checkOutDateMatch =
      !searchCheckOutDate || r.checkOut.startsWith(searchCheckOutDate);
    const guestNameMatch =
      !searchGuestName ||
      r.passengers.some((p) =>
        `${p.firstName} ${p.lastName}`
          .toLowerCase()
          .includes(searchGuestName.toLowerCase())
      );
    const agencyNameMatch =
      !searchAgencyName ||
      r.agencyName.toLowerCase().includes(searchAgencyName.toLowerCase());
    const statusMatch = (() => {
      if (!searchStatus) {
        return true;
      }
      const status = searchStatus.toLowerCase();
      if (status === "cancelled") {
        const isAnyRoomCancelled = r.allRooms.some(
          (room) => room.status.toLowerCase() === "cancelled"
        );
        return isAnyRoomCancelled || r.topStatus.toLowerCase() === "cancelled";
      }
      if (status === "paylater" || status === "credit") {
        return r.paymentType.toLowerCase() === status;
      }
      return true;
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

  const handleOnRequestStatusChange = async (
    bookingId: string,
    newStatus: "confirmed" | "cancelled"
  ) => {
    if (!wholesalerId) {
      toast.error("Wholesaler ID is missing. Cannot update status.");
      return;
    }
    setUpdatingBookingId(bookingId);
    const toastId = toast.loading(`Updating status to ${newStatus}...`);
    const token =
      document.cookie
        .split("; ")
        .find((r) => r.startsWith("authToken="))
        ?.split("=")[1] || localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authorization failed. Please log in again.", { id: toastId });
      setUpdatingBookingId(null);
      return;
    }
    const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}booking/wholesaler/${wholesalerId}/onrequest/${bookingId}/status`;
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        toast.success("Booking status updated successfully!", { id: toastId });
        fetchReservations();
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
      setUpdatingBookingId(null);
    }
  };

  const handleCancelClick = (reservation: Reservation) => {
    setCancelModalRes(reservation);
  };

  const handleAddConfirmationClick = (
    reservation: Reservation,
    reservationId: number
  ) => {
    setConfirmationModalData({ reservation, reservationId });
  };

  const handleCancellationSuccess = () => {
    setCancelModalRes(null);
    fetchReservations();
  };
  const handlePaymentSuccess = () => {
    setPayModalRes(null);
    fetchReservations();
  };

  const simulateProgress = (callback: () => Promise<void>) => {
    setIsLoaderVisible(true);
    setLoaderProgress(0);
    const interval = setInterval(() => {
      setLoaderProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 5) + 5;
      });
    }, 200);
    callback()
      .then(() => {
        clearInterval(interval);
        setLoaderProgress(100);
        setTimeout(() => {
          setIsLoaderVisible(false);
        }, 500);
      })
      .catch(() => {
        clearInterval(interval);
        setIsLoaderVisible(false);
      });
  };

  const handleGenerateInvoice = (reservation: Reservation) => {
    if (generatingDocFor || isLoaderVisible) return;
    setGeneratingDocFor(reservation.bookingId);
    setLoaderMessage("Generating Invoice...");
    const generationTask = async () => {
      try {
        await generateInvoicePDF({
          reservation,
        });
        toast.success("Invoice generated successfully!");
      } catch (error) {
        console.error("Error generating invoice:", error);
        toast.error("Failed to generate invoice. Please try again.");
        throw error;
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
        // --- MODIFICATION: Pass the entire reservation object ---
        // The reservation object now contains .agency and .specialRequests
        // as defined in the Reservation interface in voucher.tsx
        await generateVoucherPDF(reservation as VoucherReservationData);
        toast.success("Voucher generated!");
      } catch (e) {
        toast.error("Failed to generate voucher");
        throw e;
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

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "-";
    }
  };

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} at ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date and time:", dateString, error);
      return "-";
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
      <main className="px-6 py-8">
        <BookingFilter
          reservationsCount={reservations.length}
          searchHotelName={searchHotelName}
          setSearchHotelName={setSearchHotelName}
          searchBookingId={searchBookingId}
          setSearchBookingId={setSearchBookingId}
          searchCheckInDate={searchCheckInDate}
          setSearchCheckInDate={setSearchCheckInDate}
          searchCheckOutDate={searchCheckOutDate}
          setSearchCheckOutDate={setSearchCheckOutDate}
          searchGuestName={searchGuestName}
          setSearchGuestName={setSearchGuestName}
          searchAgencyName={searchAgencyName}
          setSearchAgencyName={setSearchAgencyName}
          searchStatus={searchStatus}
          setSearchStatus={setSearchStatus}
        />

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
          // --- START: ADDED UPDATE ---
          // Check if the booking is considered 'cancelled'
          const isCancelled =
            r.topStatus.toLowerCase() === "cancelled" ||
            r.allRooms.some((room) => room.status.toLowerCase() === "cancelled");
          // --- END: ADDED UPDATE ---

          return (
            <BookingCard
              key={r.bookingId}
              reservation={r}
              statusMap={statusMap}
              expandedCardId={expandedCardId}
              setExpandedCardId={setExpandedCardId}
              generatingDocFor={generatingDocFor}
              updatingBookingId={updatingBookingId}
              isLoaderVisible={isLoaderVisible}
              formatDate={formatDate}
              formatDateTime={formatDateTime}
              // --- START: MODIFIED PROPS ---
              // Conditionally pass props based on isCancelled status
              onOnRequestStatusChange={
                isCancelled ? undefined : handleOnRequestStatusChange
              }
              onAddServiceClick={
                isCancelled
                  ? undefined
                  : () =>
                      router.push(
                        "/wholesaler?page=Booking&tab=ManualReservationsOnline"
                      )
              }
              onCancelClick={handleCancelClick} // Always show
              onPayNowClick={isCancelled ? undefined : setPayModalRes}
              onAddConfirmationClick={
                isCancelled ? undefined : handleAddConfirmationClick
              }
              onGenerateVoucherClick={
                isCancelled ? undefined : handleGenerateVoucher
              }
              onGenerateInvoiceClick={
                isCancelled ? undefined : handleGenerateInvoice
              }
              onViewClick={setViewModalRes} // Always show
              // --- END: MODIFIED PROPS ---
            />
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
        <RoomCancellationModal
          reservation={cancelModalRes}
          onSuccess={handleCancellationSuccess}
          onClose={() => setCancelModalRes(null)}
        />
      )}

      {payModalRes && (
        <PayOptionsModal
          reservation={payModalRes}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPayModalRes(null)}
        />
      )}

      {confirmationModalData && (
        <AddConfirmationModal
          isOpen={!!confirmationModalData}
          onClose={() => setConfirmationModalData(null)}
          onSuccess={() => {
            setConfirmationModalData(null);
            fetchReservations();
          }}
          bookingId={confirmationModalData.reservation.dbId}
          reservationId={confirmationModalData.reservationId}
        />
      )}

      <PercentageLoaderModal
        isOpen={isLoaderVisible}
        progress={loaderProgress}
        message={loaderMessage}
      />
    </div>
  );
};

export default BookingsPage;