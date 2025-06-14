'use client';
import { NextPage } from 'next';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaBuilding,
  FaCarSide,
  FaTrain,
  FaCommentAlt,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { FiMoreVertical, FiLayout } from 'react-icons/fi';
import { RiPlaneLine } from 'react-icons/ri';
import { BiTransferAlt } from 'react-icons/bi';
import BookingActions from './BookingActions';
import { BookingModal, Reservation } from './BookingModal';

const navItems = [
  { label: 'Hotels & Apartments', Icon: FaBuilding },
  { label: 'Air Ticket', Icon: RiPlaneLine },
  { label: 'Transfer', Icon: BiTransferAlt },
  { label: 'Car Rentals', Icon: FaCarSide },
  { label: 'Train Tickets', Icon: FaTrain },
];
const tabs = ['All', 'Upcoming', 'Active', 'Completed', 'Canceled'];
const statusMap = {
  upcoming:   { icon: FaCommentAlt,  color: 'text-yellow-500', label: 'Upcoming' },
  active:     { icon: FaCheckCircle, color: 'text-green-500',  label: 'Active' },
  prepaid:    { icon: FaCheckCircle, color: 'text-green-500',  label: 'Paid' },
  canceled:   { icon: FaTimesCircle, color: 'text-red-500',    label: 'Canceled' },
  cancelled:  { icon: FaTimesCircle, color: 'text-red-500',    label: 'Canceled' },
  completed:  { icon: FaCheckCircle, color: 'text-green-500',  label: 'Completed' },
  pending:    { icon: FaCommentAlt,  color: 'text-yellow-500', label: 'Pending' },
  confirmed:  { icon: FaCheckCircle, color: 'text-green-500',  label: 'Confirmed' },
  ok:         { icon: FaCheckCircle, color: 'text-green-500',  label: 'OK' },
};

const BookingsPage: NextPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNav, setSelectedNav] = useState(0);
  const [activeTab, setActiveTab] =
    useState<'All' | 'Upcoming' | 'Active' | 'Completed' | 'Canceled'>('All');
  const [viewModalRes, setViewModalRes] = useState<Reservation | null>(null);
  const [editModalRes, setEditModalRes] = useState<Reservation | null>(null);
  const [editMarkup, setEditMarkup] = useState<string>('0.00');
  const [editCommission, setEditCommission] = useState<string>('0.00');
  const [editDiscount, setEditDiscount] = useState<string>('0.00');

  // Dynamic wholesalerId from localStorage
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const userPhoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Load stored wholesaler ID on mount
  useEffect(() => {
    const stored = localStorage.getItem('wholesalerId');
    setWholesalerId(stored);
  }, []);

  const BOOKING_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}booking/wholesaler/${wholesalerId}`;

  const fetchReservations = useCallback(async () => {
    if (!wholesalerId) {
      console.warn("No wholesalerId found");
      setReservations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(BOOKING_ENDPOINT);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      console.log('booking API response:', data);
      if (Array.isArray(data)) {
        const mapped: Reservation[] = data.map((item: any) => {
          const init = item.bookingData?.initialResponse || {};
          const det = item.bookingData?.reservationDetails || {};

          const bookingId = String(item.bookingId ?? '');
          const sequenceNumber = Number(item.sequenceNumber ?? 0);
          const reservationId = Number(item.reservationId ?? 0);
          const topStatus = String(item.status ?? '').toLowerCase();
          const createdAt = String(item.createdAt ?? '');

          const agencyName = item.agency?.agencyName ?? 'N/A';
          const wholesalerId = item.wholesaler ?? 'N/A';

          const clientRef = String(init.clientRef ?? '');
          const serviceType = String(init.type ?? '');
          const initStatus = String(init.status ?? '').toLowerCase();
          const price = Number(init.price?.selling?.value ?? 0);
          const currency = String(init.price?.selling?.currency ?? 'USD');
          const addedTime = String(init.added?.time ?? '');
          const addedUser = String(init.added?.user?.name ?? '');

          const paymentType = String(det.service?.payment?.type ?? '');
          const paymentStatus = String(det.service?.payment?.status ?? '');
          const rateDescription = String(det.service?.rateDetails?.description ?? '');

          const priceIssueNet = Number(det.service?.prices?.issue?.net?.value ?? 0);
          const priceIssueCommission = Number(det.service?.prices?.issue?.commission?.value ?? 0);
          const priceIssueSelling = Number(det.service?.prices?.issue?.selling?.value ?? 0);

          const cancellationDate = String(det.service?.cancellationPolicy?.date ?? '');

          const checkIn = String(det.service?.serviceDates?.startDate ?? '');
          const checkOut = String(det.service?.serviceDates?.endDate ?? '');
          const durationNights = Number(det.service?.serviceDates?.duration ?? 0);
          let nights = durationNights;
          if ((!nights || nights <= 0) && checkIn && checkOut) {
            const d1 = new Date(checkIn);
            const d2 = new Date(checkOut);
            const diffMs = d2.getTime() - d1.getTime();
            nights = diffMs > 0 ? Math.round(diffMs / (1000 * 60 * 60 * 24)) : 0;
          }

          const destinationCity = det.service?.destination?.city?.name ?? '';
          const destinationCountry = det.service?.destination?.country?.name ?? '';
          const nationality = det.service?.nationality?.name ?? '';

          const passengers = Array.isArray(det.service?.passengers)
            ? det.service.passengers.map((p: any) => ({
                paxId: Number(p.paxId ?? 0),
                type: String(p.type ?? ''),
                lead: !!p.lead,
                title: String(p.title ?? ''),
                firstName: String(p.firstName ?? ''),
                lastName: String(p.lastName ?? ''),
                email: p.email ?? null,
                phone: p.phone ?? null,
                phonePrefix: p.phonePrefix ?? null,
              }))
            : [];

          const remarks: { code: string; name: string; list: string[] }[] =
            Array.isArray(det.service?.remarks)
              ? det.service.remarks.map((r: any) => ({
                  code: String(r.code ?? ''),
                  name: String(r.name ?? ''),
                  list: Array.isArray(r.list) ? r.list.map((s: any) => String(s)) : [],
                }))
              : [];

          const hotelInfo = {
            id: String(det.service?.hotel?.id ?? ''),
            name: String(det.service?.hotel?.name ?? 'N/A'),
            stars: Number(det.service?.hotel?.stars ?? 0),
            lastUpdated: String(det.service?.hotel?.lastUpdated ?? ''),
            cityId: String(det.service?.hotel?.cityId ?? ''),
            countryId: String(det.service?.hotel?.countryId ?? ''),
          };

          const rooms: {
            id: string;
            name: string;
            board: string;
            boardBasis: string;
            info: string;
            passengerIds: number[];
          }[] = Array.isArray(det.service?.rooms)
            ? det.service.rooms.map((rm: any) => ({
                id: String(rm.id ?? ''),
                name: String(rm.name ?? ''),
                board: String(rm.board ?? ''),
                boardBasis: String(rm.boardBasis ?? ''),
                info: String(rm.info ?? ''),
                passengerIds: Array.isArray(rm.passengers)
                  ? rm.passengers.map((pid: any) => Number(pid))
                  : [],
              }))
            : [];

          const freeCancellation = cancellationDate;

          return {
            bookingId,
            sequenceNumber,
            reservationId,
            topStatus,
            createdAt,
            agencyName,
            wholesaler: wholesalerId,
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
          };
        });
        setReservations(mapped);
      } else {
        console.error('Expected array from booking endpoint, got:', data);
        setReservations([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [BOOKING_ENDPOINT, wholesalerId]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const filteredReservations = reservations.filter(r => {
    const status = r.topStatus.toLowerCase();
    if (activeTab === 'All') return true;
    if (activeTab === 'Canceled')
      return status === 'canceled' || status === 'cancelled';
    return status === activeTab.toLowerCase();
  });

  const handleCancel = async (reservation: Reservation) => {
    console.warn('Cancel not implemented for this endpoint');
  };

  const handleSaveEdit = () => {
    if (!editModalRes) return;
    setEditModalRes(null);
    setEditMarkup('0.00');
    setEditCommission('0.00');
    setEditDiscount('0.00');
  };

  const calculatePricesForEditModal = () => {
    if (!editModalRes) return { s: 0, m: 0, np: 0, c: 0, d: 0, sp: 0 };
    const s = editModalRes.price;
    const m = parseFloat(editMarkup) || 0;
    const c = parseFloat(editCommission) || 0;
    const d = parseFloat(editDiscount) || 0;
    const np = s + m;
    const sp = np - c - d;
    return { s, m, np, c, d, sp };
  };

  const editModalCalculatedPrices = editModalRes ? calculatePricesForEditModal() : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <p className="text-lg dark:text-gray-200">Loading bookings…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <header className="flex flex-wrap items-center justify-between bg-white dark:bg-gray-800 px-4 sm:px-8 py-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex flex-wrap space-x-4 sm:space-x-12">
          {navItems.map(({ label, Icon }, i) => (
            <button
              key={i}
              onClick={() => setSelectedNav(i)}
              className={`flex items-center space-x-2 pb-2 ${
                selectedNav === i
                  ? 'border-b-2 border-indigo-600 text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={20} />
              <span className="text-base font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </header>
      <main className="px-4 sm:px-8 py-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex flex-wrap space-x-2 sm:space-x-4">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t as any)}
                className={`px-4 sm:px-5 py-2 text-sm font-medium rounded-full ${
                  activeTab === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {filteredReservations.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No bookings found for this category.
            </p>
          </div>
        )}
        {filteredReservations.map((r, idx, arr) => {
          const statusKey = r.topStatus.toLowerCase() as keyof typeof statusMap;
          const statusDetails = statusMap[statusKey] || statusMap.confirmed;
          const IconStatus = statusDetails.icon;
          const leadPassenger = r.passengers.find(p => p.lead) || r.passengers[0];
          const guestName = leadPassenger
            ? `${leadPassenger.firstName} ${leadPassenger.lastName}`
            : 'N/A';
          const isCurrentRowEdited = false;
          let dynamicCardStyles = '';
          const baseCardStyles =
            'grid grid-cols-1 lg:grid-cols-7 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm';
          if (isCurrentRowEdited) {
            dynamicCardStyles = 'rounded-b-lg ml-2 mt-0 border-l-4 border-indigo-600 dark:border-indigo-400';
          } else {
            const nextItem = arr[idx + 1];
            if (nextItem && String(nextItem.reservationId) === `${r.reservationId}-edit`) {
              dynamicCardStyles = 'rounded-t-lg mb-0';
            } else {
              dynamicCardStyles = 'rounded-lg mb-6';
            }
          }
          const S = r.price;
          const M = 0;
          const C = 0;
          const D = 0;
          const NP = S + M;
          const SP = NP - C - D;
          return (
            <div key={r.reservationId} className={`${baseCardStyles} ${dynamicCardStyles}`}>
              <div className="col-span-1 lg:col-span-6 p-4 sm:p-6 space-y-4">
                <div className="flex flex-wrap justify-between items-center">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
                    <IconStatus className={statusDetails.color} size={18} />
                    <h3 className="text-lg font-semibold dark:text-gray-100 flex items-center">
                      {r.hotelInfo.name || 'Hotel details not available'}
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Booking ID</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{r.bookingId || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reservation ID</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{r.reservationId || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Agency</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{r.agencyName}</p>
                  </div>
                  {/* --- MODIFIED CODE START --- */}
                  {/* Wholesaler ID column is removed to hide it, placeholder keeps grid alignment */}
                  <div />
                  {/* --- MODIFIED CODE END --- */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Guest</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{guestName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Created On</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>

                {/* Second row: price/payment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-y-3 gap-x-4 sm:gap-x-6 text-sm pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                  <div>
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
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Payment Type</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{r.paymentType || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Check In</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.checkIn ? new Date(r.checkIn).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Check Out</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.checkOut ? new Date(r.checkOut).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nights</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{r.nights || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Hotel</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{r.hotelInfo.name || '—'}</p>
                  </div>
                </div>

                {/* Third row: location & cancellation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-y-3 gap-x-4 sm:gap-x-6 text-sm pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Destination</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.destinationCity && r.destinationCountry ? `${r.destinationCity}, ${r.destinationCountry}` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nationality</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{r.nationality || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cancellation By</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.cancellationDate
                        ? new Date(r.cancellationDate).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <p className={`font-semibold ${statusDetails.color}`}>{statusDetails.label}</p>
                  </div>
                  <div />
                  <div />
                </div>
              </div>
              <BookingActions
                reservation={r}
                onViewDetails={() => setViewModalRes(r)}
                onEditPrice={reservationToEdit => {
                  setEditModalRes(reservationToEdit);
                  setEditMarkup('0.00');
                  setEditCommission('0.00');
                  setEditDiscount('0.00');
                }}
                onCancel={handleCancel}
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
      {editModalRes && editModalCalculatedPrices && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl w-full max-w-lg shadow-2xl my-8">
            <button onClick={() => setEditModalRes(null)}>Close Edit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;