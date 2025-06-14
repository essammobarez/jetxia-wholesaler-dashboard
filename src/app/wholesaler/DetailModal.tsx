// components/DetailModal.tsx

import React from "react";
import { FiXCircle, FiGlobe, FiFile, FiHash } from "react-icons/fi";
import { format } from "date-fns";

// --- UPDATED TYPE: Includes all fields from the API response ---
export type Registration = {
  id: string;
  status: "pending" | "approved" | "suspended";
  agencyName: string;
  slug?: string;
  country?: string;
  city?: string;
  postCode?: string;
  address?: string;
  website?: string;
  phoneNumber?: string;
  agencyEmail: string; // Renamed from 'email' to avoid conflict
  businessCurrency?: string;
  vat?: string;
  licenseUrl?: string | null;
  
  // Contact Person
  title?: string;
  firstName: string;
  lastName: string;
  contactName: string; // Combined field for list view
  email: string; // Contact person's email
  designation?: string;
  mobileNumber?: string;
  
  submittedAt: string;
  
  // Markup Plan (optional)
  markupPlan?: {
    _id: string;
    name: string;
    service: string;
  } | null;
};

interface DetailModalProps {
  item: Registration;
  onClose: () => void;
}

// Helper component for displaying a detail item
const DetailItem: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  value ? <div><span className="font-semibold text-gray-600">{label}:</span> {value}</div> : null
);

const DetailModal: React.FC<DetailModalProps> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{item.agencyName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FiXCircle size={24} />
          </button>
        </div>

        {/* --- UPDATED BODY: Display real data --- */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Section: Agency Information */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">Agency Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800">
              <DetailItem label="Full Address" value={[item.address, item.city, item.country, item.postCode].filter(Boolean).join(', ')} />
              <DetailItem label="Agency Email" value={item.agencyEmail} />
              <DetailItem label="Phone Number" value={item.phoneNumber} />
              <DetailItem label="Business Currency" value={item.businessCurrency} />
              <DetailItem label="VAT Number" value={item.vat} />
              <DetailItem label="Submitted On" value={format(new Date(item.submittedAt), "EEEE, MMMM do, yyyy 'at' h:mm a")} />
              {item.website && (
                 <div className="flex items-center space-x-2">
                    <FiGlobe className="text-gray-500"/>
                    <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{item.website}</a>
                 </div>
              )}
               {item.licenseUrl && (
                 <div className="flex items-center space-x-2">
                    <FiFile className="text-gray-500"/>
                    <a href={item.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Trade License</a>
                 </div>
              )}
            </div>
          </div>
          
          {/* Section: Primary Contact */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">Primary Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800">
                <DetailItem label="Full Name" value={`${item.title || ''} ${item.firstName} ${item.lastName}`} />
                <DetailItem label="Designation" value={item.designation} />
                <DetailItem label="Contact Email" value={item.email} />
                <DetailItem label="Mobile Number" value={item.mobileNumber} />
            </div>
          </div>
          
           {/* Section: Status & Markup */}
           <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">Status & Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800 items-center">
                <div>
                    <span className="font-semibold text-gray-600">Status:</span>
                    <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${item.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                </div>
                {item.markupPlan && (
                    <div className="flex items-center space-x-2">
                      <FiHash className="text-gray-500"/>
                      <span className="font-semibold text-gray-600">Markup Plan:</span>
                      <span>{item.markupPlan.name}</span>
                    </div>
                )}
            </div>
           </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;