import { FaBuilding, FaCarSide, FaCommentAlt, FaCheckCircle, FaTimesCircle, FaTrain } from "react-icons/fa";
import { BiTransferAlt } from "react-icons/bi";
import { RiPlaneLine } from "react-icons/ri";

export const navItems = [
  { label: "Hotels & Apartments", Icon: FaBuilding },
  { label: "Air Ticket", Icon: RiPlaneLine },
  { label: "Transfer", Icon: BiTransferAlt },
  { label: "Car Rentals", Icon: FaCarSide },
  { label: "Train Tickets", Icon: FaTrain },
];

export const statusMap = {
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
  onrequest: {
    icon: FaCommentAlt,
    color: "text-blue-500",
    label: "On Request",
  },
  // --- END MODIFICATION ---
  ok: { icon: FaCheckCircle, color: "text-green-500", label: "OK" },
};