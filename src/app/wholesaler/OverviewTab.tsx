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

const navItems = [
  { label: 'Hotels & Apartments', Icon: FaBuilding, active: true },
  { label: 'Air Ticket', Icon: RiPlaneLine, active: false },
  { label: 'Transfer', Icon: BiTransferAlt, active: false },
  { label: 'Car Rentals', Icon: FaCarSide, active: false },
  { label: 'Train Tickets', Icon: FaTrain, active: false },
];

const tabs = ['All', 'Upcoming', 'Active', 'Completed', 'Canceled'];

const bookings = [
  {
    id: 1,
    orderId: '123123132',
    supplierId: '2111345',
    price: 200,
    guestName: 'Saud Alsamari',
    paidOn: 'Nov 10, 2024',
    status: 'Completed',
    checkIn: 'Apr 13, 2025',
    checkOut: 'Apr 18, 2025',
    hotelName: 'Royal Palace Hotel',
    country: 'England',
    city: 'London',
    freeCancellationUntil: 'Apr 16, 2025, 12:00',
    freeCancellation: true,
    Icon: FaCheckCircle,
    colorClass: 'text-green-500',
    title: 'Booking desk Travel',
    tag: 'Credit',
  },
  {
    id: 2,
    orderId: '987654321',
    supplierId: '5566778',
    price: 350,
    guestName: 'Jane Doe',
    paidOn: 'Dec 01, 2024',
    status: 'Active',
    checkIn: 'May 01, 2025',
    checkOut: 'May 05, 2025',
    hotelName: 'Grand Downtown Hotel',
    country: 'USA',
    city: 'New York',
    freeCancellationUntil: 'Apr 29, 2025, 18:00',
    freeCancellation: false,
    Icon: FaCommentAlt,
    colorClass: 'text-yellow-500',
    title: 'Booking desk Travel',
    tag: 'Pay Later',
  },
  {
    id: 3,
    orderId: '555444333',
    supplierId: '9988776',
    price: 120,
    guestName: 'John Smith',
    paidOn: 'Jan 20, 2025',
    status: 'Canceled',
    checkIn: 'Feb 10, 2025',
    checkOut: 'Feb 12, 2025',
    hotelName: 'Seaside Resort',
    country: 'Spain',
    city: 'Barcelona',
    freeCancellationUntil: 'Feb 08, 2025, 12:00',
    freeCancellation: true,
    Icon: FaTimesCircle,
    colorClass: 'text-red-500',
    title: 'Booking desk Travel',
    tag: 'Canceled',
  },
  {
    id: 4,
    orderId: '222333444',
    supplierId: '1237890',
    price: 275,
    guestName: 'Alice Johnson',
    paidOn: 'Feb 14, 2025',
    status: 'Upcoming',
    checkIn: 'Jun 05, 2025',
    checkOut: 'Jun 10, 2025',
    hotelName: 'Mountain View Lodge',
    country: 'Canada',
    city: 'Vancouver',
    freeCancellationUntil: 'Jun 03, 2025, 12:00',
    freeCancellation: true,
    Icon: FaCommentAlt,
    colorClass: 'text-yellow-500',
    title: 'Booking desk Travel',
    tag: 'Pay Later',
  },
  {
    id: 5,
    orderId: '333444555',
    supplierId: '4561237',
    price: 150,
    guestName: 'Carlos Mendez',
    paidOn: 'Mar 02, 2025',
    status: 'Active',
    checkIn: 'May 20, 2025',
    checkOut: 'May 22, 2025',
    hotelName: 'Beachside Bungalows',
    country: 'Australia',
    city: 'Sydney',
    freeCancellationUntil: 'May 18, 2025, 18:00',
    freeCancellation: false,
    Icon: FaCheckCircle,
    colorClass: 'text-green-500',
    title: 'Booking desk Travel',
    tag: 'Credit',
  },
  {
    id: 6,
    orderId: '444555666',
    supplierId: '7894561',
    price: 420,
    guestName: 'Fatima Al-Zahra',
    paidOn: 'Apr 01, 2025',
    status: 'Upcoming',
    checkIn: 'Jul 10, 2025',
    checkOut: 'Jul 15, 2025',
    hotelName: 'Desert Oasis Resort',
    country: 'UAE',
    city: 'Dubai',
    freeCancellationUntil: 'Jul 08, 2025, 12:00',
    freeCancellation: true,
    Icon: FaCheckCircle,
    colorClass: 'text-green-500',
    title: 'Booking desk Travel',
    tag: 'Credit',
  },
  {
    id: 7,
    orderId: '555666777',
    supplierId: '3216549',
    price: 305,
    guestName: 'Liu Wei',
    paidOn: 'Apr 15, 2025',
    status: 'Active',
    checkIn: 'May 25, 2025',
    checkOut: 'May 30, 2025',
    hotelName: 'City Central Hotel',
    country: 'China',
    city: 'Beijing',
    freeCancellationUntil: 'May 23, 2025, 12:00',
    freeCancellation: false,
    Icon: FaCommentAlt,
    colorClass: 'text-yellow-500',
    title: 'Booking desk Travel',
    tag: 'Pay Later',
  },
  {
    id: 8,
    orderId: '666777888',
    supplierId: '8527413',
    price: 95,
    guestName: 'Maria Rossi',
    paidOn: 'Mar 28, 2025',
    status: 'Canceled',
    checkIn: 'Apr 05, 2025',
    checkOut: 'Apr 07, 2025',
    hotelName: 'Historic Center Inn',
    country: 'Italy',
    city: 'Rome',
    freeCancellationUntil: 'Apr 03, 2025, 18:00',
    freeCancellation: true,
    Icon: FaTimesCircle,
    colorClass: 'text-red-500',
    title: 'Booking desk Travel',
    tag: 'Canceled',
  },
];

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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

          <div className="space-y-6">
            {filteredBookings.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No bookings match your filters.
              </p>
            )}

            {filteredBookings.map((b) => (
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
                    ['Price', `$ ${b.price}`],
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
