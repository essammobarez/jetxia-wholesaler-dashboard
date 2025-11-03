import React from "react";
import { FaChevronDown } from "react-icons/fa";

import BookingActions from "./BookingActions";
import { Reservation } from "./BookingModal";

// Define a more specific type for statusMap keys if possible
type StatusMap = {
  [key: string]: {
    icon: React.ElementType;
    color: string;
    label: string;
  };
};

type RoomNeedingConfirmation = {
  reservationId: number;
  reference?: {
    confirmation: string | null;
  } | null;
  status: string;
  // Add other properties if needed, or use 'any' if type is complex
  [key: string]: any;
};

type BookingCardProps = {
  reservation: Reservation;
  statusMap: StatusMap;
  expandedCardId: string | null;
  setExpandedCardId: (
    fn: (prev: string | null) => string | null
  ) => void;
  generatingDocFor: string | null;
  updatingBookingId: string | null;
  isLoaderVisible: boolean;
  formatDate: (dateString: string | null | undefined) => string;
  formatDateTime: (dateString: string | null | undefined) => string;
  // Handlers for BookingActions
  onOnRequestStatusChange: (
    bookingId: string,
    newStatus: "confirmed" | "cancelled"
  ) => void;
  onAddServiceClick: () => void;
  onCancelClick: (reservation: Reservation) => void;
  onPayNowClick: (reservation: Reservation) => void;
  onAddConfirmationClick: (
    reservation: Reservation,
    reservationId: number
  ) => void;
  onGenerateVoucherClick: (reservation: Reservation) => void;
  onGenerateInvoiceClick: (reservation: Reservation) => void;
  onViewClick: (reservation: Reservation) => void;
};

const BookingCard: React.FC<BookingCardProps> = ({
  reservation,
  statusMap,
  expandedCardId,
  setExpandedCardId,
  generatingDocFor,
  updatingBookingId,
  isLoaderVisible,
  formatDate,
  formatDateTime,
  onOnRequestStatusChange,
  onAddServiceClick,
  onCancelClick,
  onPayNowClick,
  onAddConfirmationClick,
  onGenerateVoucherClick,
  onGenerateInvoiceClick,
  onViewClick,
}) => {
  const r = reservation; // Use 'r' for brevity, matching original logic
  const isExpanded = expandedCardId === r.bookingId;
  const isAnyRoomCancelled = r.allRooms.some(
    (room) => room.status.toLowerCase() === "cancelled"
  );
  const overallStatusKey = isAnyRoomCancelled
    ? "cancelled"
    : r.topStatus.toLowerCase();
  const statusKey = overallStatusKey as keyof typeof statusMap;
  const isCancelled = overallStatusKey === "cancelled";
  const statusDetails = statusMap[statusKey] || statusMap.pending;
  const IconStatus = statusDetails.icon;
  const leadPassenger =
    r.passengers.find((p) => p.lead) || r.passengers[0];
  const guestName = leadPassenger
    ? `${leadPassenger.firstName} ${leadPassenger.lastName}`
    : "N/A";

  const firstRoomNeedingConfirmation = r.allRooms.find(
    (room) =>
      room.reference?.confirmation === null &&
      room.status.toLowerCase() !== "cancelled"
  ) as RoomNeedingConfirmation | undefined;

  let S, C, M, D, NP, SP;
  if (isCancelled) {
    S = C = M = D = NP = SP = 0;
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
      M = SP_from_api - S + C;
    }
    D = 0.0;
    NP = S + M;
    SP = NP - C - D;
  }

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
          status: "cancelled",
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
      <div className="p-4">
        {/* Row 1: Hotel Name and Status */}
        <div className="flex items-start justify-between">
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
                {r.hotelInfo.name?.split("(")[0].trim() ||
                  "Hotel details not available"}
                <span className="text-gray-400 dark:text-gray-500 text-sm font-normal ml-2">
                  ({statusDetails.label})
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Booking ID:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {r.bookingId || "-"}
                </span>
              </p>
            </div>
          </div>
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

        {/* Row 2: Action Buttons */}
        <BookingActions
          reservation={r}
          reservationForModals={reservationForModals}
          overallStatusKey={overallStatusKey}
          isCancelled={isCancelled}
          isGenerating={isGenerating}
          isLoaderVisible={isLoaderVisible}
          updatingBookingId={updatingBookingId}
          firstRoomNeedingConfirmation={firstRoomNeedingConfirmation}
          onOnRequestStatusChange={onOnRequestStatusChange}
          onAddServiceClick={onAddServiceClick}
          onCancelClick={onCancelClick}
          onPayNowClick={onPayNowClick}
          onAddConfirmationClick={onAddConfirmationClick}
          onGenerateVoucherClick={onGenerateVoucherClick}
          onGenerateInvoiceClick={onGenerateInvoiceClick}
          onViewClick={onViewClick}
        />
      </div>

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
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-x-8">
            <div className="lg:col-span-3 space-y-6">
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
                      <span>C (Comm.):</span> <span>{C.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>D (Disc.):</span> <span>{D.toFixed(2)}</span>
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
                      {r.nights || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      Payment
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {r.paymentType || "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    Destination
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {r.destinationCity && r.destinationCountry
                      ? `${r.destinationCity}, ${r.destinationCountry}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    Nationality
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {r.nationality || "-"}
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
                      room.cancellationPolicy.policies[0].date
                    ) {
                      cancellationDateString =
                        room.cancellationPolicy.policies[0].date;
                    } else if (room.cancellationPolicy?.date) {
                      cancellationDateString =
                        room.cancellationPolicy.date;
                    }
                    return (
                      <React.Fragment key={room.reservationId || index}>
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
                          {room.confirmationNo && (
                            <p className="text-sm font-medium mt-5">
                              <span className="text-gray-800 dark:text-gray-200">
                                Confirmation No:{" "}
                              </span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {room.confirmationNo}
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
};

export default BookingCard;