'use client';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';

interface Passenger {
  paxId: number;
  type: string;
  lead: boolean;
  title: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  phonePrefix?: string | null;
}

interface RoomData {
  roomNumber: string;
  roomType: string;
}

export interface Reservation {
  orderId: number;
  supplierId: string;
  price: number;
  currency: string;
  passengers: Passenger[];
  Rooms: RoomData[];
  nights: number;
  paidOn: string;
  paymentType: string;
  status: string;
  checkIn: string;
  checkOut: string;
  hotel: string;
  country: string;
  city: string;
  freeCancellation: string;
}

interface BookingModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ reservation: r, isOpen, onClose }) => {
  const modalRoot = typeof document !== 'undefined'
    ? document.getElementById('modal-root') || (() => {
        const el = document.createElement('div');
        el.id = 'modal-root';
        document.body.appendChild(el);
        return el;
      })()
    : null;

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !modalRoot) return null;

  const passengers = r.passengers || [];
  const lead = passengers.find(p => p.lead) || passengers[0] || ({} as Passenger);
  const guestName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || '-';

  const fmtDate = (d: string, opts?: Intl.DateTimeFormatOptions) =>
    new Date(d).toLocaleDateString(undefined, opts);
  const fmtDateTime = (d: string) =>
    new Date(d).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 p-4 border-b dark:border-gray-700">
          <FaCheckCircle className="text-green-500 text-xl" />
          <h2 className="text-lg font-semibold dark:text-white">
            1. Booking desk Travel <span className="text-sm text-gray-500 dark:text-gray-300">(Credit)</span>
          </h2>
          <div className="ml-auto">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 space-y-6">

          <section>
            <h3 className="text-blue-600 font-medium text-sm mb-1">Order information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-blue-50 p-3 rounded-md">
              <div>
                <p className="text-[10px] text-gray-500">Order ID</p>
                <p className="font-semibold">{r.orderId}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Confirmation No</p>
                <p className="font-semibold">-</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Supplier ID</p>
                <p className="font-semibold">{r.supplierId}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Price</p>
                <p className="font-semibold">{r.currency} {r.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Guest</p>
                <p className="font-semibold">{guestName}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Paid On</p>
                <p className="font-semibold">{r.paidOn !== 'N/A' ? fmtDate(r.paidOn, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-blue-600 font-medium text-sm mb-1">Hotel information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-blue-50 p-3 rounded-md">
              <div>
                <p className="text-[10px] text-gray-500">Check in</p>
                <p className="font-semibold">{fmtDate(r.checkIn)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Check out</p>
                <p className="font-semibold">{fmtDate(r.checkOut)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-gray-500">Hotel</p>
                <p className="font-semibold">{r.hotel}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Country</p>
                <p className="font-semibold">{r.country}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">City</p>
                <p className="font-semibold">{r.city}</p>
              </div>
              <div className="sm:col-span-3">
                <p className="text-[10px] text-gray-500">Free cancellation</p>
                <p className="font-semibold">{fmtDateTime(r.freeCancellation)}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-blue-600 font-medium text-sm mb-1">Room information</h3>
            {r.Rooms.map((room, idx) => (
              <div key={idx} className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-blue-50 p-3 rounded-md mb-2">
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500">Room type</p>
                  <p className="font-semibold">{room.roomType}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Night(s)</p>
                  <p className="font-semibold">{r.nights}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Rooms</p>
                  <p className="font-semibold">1</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">City</p>
                  <p className="font-semibold">{r.city}</p>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h3 className="text-blue-600 font-medium text-sm mb-1">Guest information</h3>
            {passengers.map((g, idx) => {
              const email = g.email || '-';
              const phone = g.phonePrefix && g.phone ? `${g.phonePrefix}${g.phone}` : '-';
              return (
                <div key={idx} className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-blue-50 p-3 rounded-md mb-2">
                  <div>
                    <p className="text-[10px] text-gray-500">Name</p>
                    <p className="font-semibold">{g.firstName} {g.lastName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Email</p>
                    <p className="font-semibold truncate">{email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Contact Number</p>
                    <p className="font-semibold">{phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Invoice ID</p>
                    <p className="font-semibold">-</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Country</p>
                    <p className="font-semibold">{r.country}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">City</p>
                    <p className="font-semibold">{r.city}</p>
                  </div>
                </div>
              );
            })}
          </section>

        </div>
      </div>
    </div>,
    modalRoot
  );
};