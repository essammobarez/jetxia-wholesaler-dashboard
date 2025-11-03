import React from "react";

type BookingFilterProps = {
  reservationsCount: number;
  searchHotelName: string;
  setSearchHotelName: (value: string) => void;
  searchBookingId: string;
  setSearchBookingId: (value: string) => void;
  searchCheckInDate: string;
  setSearchCheckInDate: (value: string) => void;
  searchCheckOutDate: string;
  setSearchCheckOutDate: (value: string) => void;
  searchGuestName: string;
  setSearchGuestName: (value: string) => void;
  searchAgencyName: string;
  setSearchAgencyName: (value: string) => void;
  searchStatus: string;
  setSearchStatus: (value: string) => void;
};

const BookingFilter: React.FC<BookingFilterProps> = ({
  reservationsCount,
  searchHotelName,
  setSearchHotelName,
  searchBookingId,
  setSearchBookingId,
  searchCheckInDate,
  setSearchCheckInDate,
  searchCheckOutDate,
  setSearchCheckOutDate,
  searchGuestName,
  setSearchGuestName,
  searchAgencyName,
  setSearchAgencyName,
  searchStatus,
  setSearchStatus,
}) => {
  return (
    <div className="mb-8 p-6 bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Search & Filter
        </h3>
        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          {reservationsCount} Bookings
        </div>
      </div>
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
  );
};

export default BookingFilter;