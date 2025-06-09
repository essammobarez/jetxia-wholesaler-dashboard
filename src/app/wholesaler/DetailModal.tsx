// components/DetailModal.tsx

import React from "react";
import { FiXCircle } from "react-icons/fi";
import { format } from "date-fns";

export type Registration = {
  status: "pending" | "approved" | "suspended";
  id: string;
  agencyName: string;
  contactName: string;
  email: string;
  submittedAt: string;
};

interface DetailModalProps {
  item: Registration;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/10 bg-opacity-40 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{item.agencyName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FiXCircle size={24} />
          </button>
        </div>

        {/* Main Details */}
        <div className="space-y-3 text-gray-700">
          <p>
            <span className="font-semibold">Contact Person:</span> {item.contactName}
          </p>
          <p>
            <span className="font-semibold">Email Address:</span> {item.email}
          </p>
          <p>
            <span className="font-semibold">Submitted On:</span>{" "}
            {format(new Date(item.submittedAt), "EEEE, MMMM do, yyyy 'at' h:mm a")}
          </p>
        </div>

        {/* Dummy Agency Info Section */}
        <div className="mt-6 space-y-4 text-gray-600">
          <h3 className="text-xl font-semibold text-gray-800">Agency Profile</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.
            Praesent libero. Sed cursus ante dapibus diam.
          </p>
          <p>
            Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.
            Praesent mauris. Fusce nec tellus sed augue semper porta.
          </p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Established: 2010</li>
            <li>Headquarters: 123 Main St, Suite 400, Springfield</li>
            <li>Employees: 150+</li>
            <li>Services: Consulting, Implementation, Support</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;