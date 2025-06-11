'use client';

import React, { useState, useEffect } from 'react';
import {
  FaBuilding,
  FaCarSide,
  FaTrain,
  FaCheckCircle,
  FaCommentAlt,
  FaTimesCircle,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';
import { RiPlaneLine } from 'react-icons/ri';
import { BiTransferAlt } from 'react-icons/bi';
import { FiMoreVertical, FiLayout } from 'react-icons/fi';

// Nav and tab definitions
const navItems = [
  { label: 'Hotels & Apartments', Icon: FaBuilding, active: true },
  { label: 'Air Ticket', Icon: RiPlaneLine, active: false },
  { label: 'Transfer', Icon: BiTransferAlt, active: false },
  { label: 'Car Rentals', Icon: FaCarSide, active: false },
  { label: 'Train Tickets', Icon: FaTrain, active: false },
];
const tabs = ['All', 'Upcoming', 'Active', 'Completed', 'Canceled'];

// Helpers for date formatting
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}
function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Map a full reservationDetails object to our UI shape
function mapReservationToBooking(res: any) {
  const service = res.service || {};
  const pax = Array.isArray(service.passengers) && service.passengers.length > 0
    ? service.passengers[0]
    : null;

  // Determine status
  let status = res.status || '';
  if (!status && service.serviceDates) {
    const now = new Date();
    const start = new Date(service.serviceDates.startDate);
    const end = new Date(service.serviceDates.endDate);
    if (now < start) status = 'Upcoming';
    else if (now >= start && now <= end) status = 'Active';
    else if (now > end) status = 'Completed';
  }
  if (service.status === 'Canceled' || res.canceled === true) {
    status = 'Canceled';
  }

  // Free cancellation
  const freeCancellationDate = service.cancellationPolicy?.date || null;
  const freeCancellation = !!freeCancellationDate;
  const freeCancellationUntil = freeCancellation
    ? formatDateTime(freeCancellationDate)
    : '';

  // Icon & color
  let Icon = FaCommentAlt;
  let colorClass = 'text-gray-500';
  if (status === 'Completed') {
    Icon = FaCheckCircle;
    colorClass = 'text-green-500';
  } else if (status === 'Canceled') {
    Icon = FaTimesCircle;
    colorClass = 'text-red-500';
  } else if (status === 'Active') {
    Icon = FaCommentAlt;
    colorClass = 'text-yellow-500';
  } else if (status === 'Upcoming') {
    Icon = FaCommentAlt;
    colorClass = 'text-yellow-500';
  }

  // Guest name
  const guestName = pax
    ? [pax.firstName, pax.lastName].filter(Boolean).join(' ')
    : '';

  // Paid On
  const paidOn = res.added?.time ? formatDate(res.added.time) : formatDate(res.added?.time || '');

  // Hotel info
  const hotelName = service.hotel?.name || '';
  const country = service.destination?.country?.name || '';
  const city = service.destination?.city?.name || '';

  // Price
  const priceValue =
    service.prices?.total?.selling?.value ??
    res.price?.selling?.value ??
    null;
  const price = priceValue !== null ? Number(priceValue) : '';

  // Order ID
  const orderId = res.clientRef || res.reference?.external || '';

  // Supplier ID
  const supplierId = res.reseller?.id?.toString() || '';

  // Title & tag
  const title = 'Booking desk Travel';
  const tag =
    status === 'Canceled'
      ? 'Canceled'
      : status === 'Completed'
      ? 'Credit'
      : status === 'Active'
      ? 'Pay Later'
      : 'Pay Later';

  return {
    id: res.id,
    orderId,
    supplierId,
    price,
    guestName,
    paidOn,
    status,
    checkIn: service.serviceDates?.startDate
      ? formatDate(service.serviceDates.startDate)
      : '',
    checkOut: service.serviceDates?.endDate
      ? formatDate(service.serviceDates.endDate)
      : '',
    hotelName,
    country,
    city,
    freeCancellation,
    freeCancellationUntil,
    Icon,
    colorClass,
    title,
    tag,
  };
}

// Map a top-level entry without bookingData.reservationDetails to a minimal booking
function mapEntryMinimal(entry: any) {
  const statusRaw = entry.status || '';
  // Capitalize first letter
  const status =
    statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase();
  // Icon & color based on status
  let Icon = FaCommentAlt;
  let colorClass = 'text-gray-500';
  if (status === 'Completed' || status === 'Confirmed') {
    Icon = FaCheckCircle;
    colorClass = 'text-green-500';
  } else if (status === 'Canceled') {
    Icon = FaTimesCircle;
    colorClass = 'text-red-500';
  } else if (status === 'Active' || status === 'Confirmed') {
    Icon = FaCommentAlt;
    colorClass = 'text-yellow-500';
  } else if (status === 'Upcoming') {
    Icon = FaCommentAlt;
    colorClass = 'text-yellow-500';
  }
  // Paid On from createdAt
  const paidOn = formatDate(entry.createdAt);
  // Order ID from bookingId
  const orderId = entry.bookingId || '';
  const supplierId = entry.wholesaler || '';
  const title = 'Booking desk Travel';
  const tag = status === 'Canceled' ? 'Canceled' : 'Pay Later';
  return {
    id: entry.reservationId || entry._id,
    orderId,
    supplierId,
    price: '',
    guestName: '',
    paidOn,
    status,
    checkIn: '',
    checkOut: '',
    hotelName: '',
    country: '',
    city: '',
    freeCancellation: false,
    freeCancellationUntil: '',
    Icon,
    colorClass,
    title,
    tag,
  };
}

export default function BookingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    supplierId: '',
    orderId: '',
    cityCountry: '',
    hotel: '',
    guest: '',
    status: '',
    cancellation: '',
  });

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}booking/wholesaler/68456a9acc455a60d8aaf71a`
        );
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.warn('Expected array response, got:', data);
          setBookings([]);
        } else {
          const mapped = data.map((entry) => {
            if (entry.bookingData?.reservationDetails) {
              return mapReservationToBooking(entry.bookingData.reservationDetails);
            } else {
              return mapEntryMinimal(entry);
            }
          });
          setBookings(mapped);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({
      supplierId: '',
      orderId: '',
      cityCountry: '',
      hotel: '',
      guest: '',
      status: '',
      cancellation: '',
    });
  };

  const filteredBookings = bookings.filter((b) => {
    if (filters.supplierId && !b.supplierId.includes(filters.supplierId))
      return false;
    if (filters.orderId && !b.orderId.includes(filters.orderId)) return false;
    if (
      filters.cityCountry &&
      !(
        b.city.toLowerCase().includes(filters.cityCountry.toLowerCase()) ||
        b.country.toLowerCase().includes(filters.cityCountry.toLowerCase())
      )
    )
      return false;
    if (
      filters.hotel &&
      !b.hotelName.toLowerCase().includes(filters.hotel.toLowerCase())
    )
      return false;
    if (
      filters.guest &&
      !b.guestName.toLowerCase().includes(filters.guest.toLowerCase())
    )
      return false;
    if (filters.status && b.status !== filters.status) return false;
    if (filters.cancellation) {
      const wantsFree = filters.cancellation === 'Yes';
      if (b.freeCancellation !== wantsFree) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Top nav */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-8 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-12">
          {navItems.map(({ label, Icon, active }, i) => (
            <button
              key={i}
              className={`flex items-center space-x-2 pb-2 ${
                active
                  ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={20} />
              <span className="text-base font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        {showFilters && (
          <aside className="w-1/4 bg-white dark:bg-gray-800 p-6 border-r border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold dark:text-gray-100">
                Filter
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FaTimes />
              </button>
            </div>

            {[
              { name: 'supplierId', label: 'Search supplier ID' },
              { name: 'orderId', label: 'Search order ID' },
              { name: 'cityCountry', label: 'Search City / Country' },
              { name: 'hotel', label: 'Hotel' },
              { name: 'guest', label: 'Guest' },
            ].map(({ name, label }) => (
              <div key={name} className="mb-4">
                <label
                  htmlFor={name}
                  className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                  {label}
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id={name}
                    name={name}
                    type="text"
                    value={(filters as any)[name]}
                    onChange={handleChange}
                    placeholder={label}
                    className="pl-8 pr-3 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}

            <div className="mb-4">
              <label
                htmlFor="status"
                className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Any</option>
                {tabs.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="cancellation"
                className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
              >
                Cancellation without penalty
              </label>
              <select
                id="cancellation"
                name="cancellation"
                value={filters.cancellation}
                onChange={handleChange}
                className="w-full py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Any</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="mt-6 w-full py-2 text-sm font-medium text-red-500 hover:underline"
            >
              Clear filters
            </button>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowFilters(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              Filter
            </button>
            <div className="flex space-x-4">
              {tabs.map((t, i) => (
                <button
                  key={t}
                  className={`px-5 py-2 text-sm font-medium rounded-full ${
                    i === 0
                      ? 'bg-indigo-600 text-white'
                      : 'text-indigo-600 bg-indigo-50 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Loading bookings...
            </p>
          )}
          {error && (
            <p className="text-center text-red-500">
              Error fetching bookings: {error}
            </p>
          )}

          <div className="space-y-6">
            {!loading && filteredBookings.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No bookings match your filters.
              </p>
            )}

            {!loading &&
              filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <b.Icon className={b.colorClass} size={18} />
                      <h3 className="text-lg font-semibold dark:text-gray-100">
                        {b.id}. {b.title}
                        <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
                          ({b.tag})
                        </span>
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-400 dark:text-gray-500">
                      <FiMoreVertical size={18} />
                      <FiLayout size={18} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-y-3 gap-x-6 text-sm">
                    {[
                      ['Order ID', b.orderId],
                      ['Supplier ID', b.supplierId],
                      ['Price', b.price !== '' ? `$ ${b.price}` : ''],
                      ['Guest', b.guestName],
                      ['Paid On', b.paidOn],
                      ['Status', b.status],
                      ['Check in', b.checkIn],
                      ['Check out', b.checkOut],
                      ['Hotel', b.hotelName],
                      ['Country', b.country],
                      ['City', b.city],
                      ['Free cancellation', b.freeCancellationUntil],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {label}
                        </p>
                        <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}
