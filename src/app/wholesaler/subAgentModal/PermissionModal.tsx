'use client';
import { Dialog, RadioGroup } from '@headlessui/react';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { SubAgency } from '../SubAgencyModal'; // Assuming SubAgency type is exported from the main modal

// Mock data based on the provided image
const permissionGroups = [
  {
    name: 'Supervisor',
    description: 'This will activate all the privileges of agency primary user',
    isSpecial: true,
  },
  {
    name: 'Hotel Booking',
    description: 'Search Hotels, Veiw details, Guest details, Prebook, Book, Invoice',
  },
  {
    name: 'Booking History',
    description: 'View booking history, Confirm Booking, Cancel Booking',
  },
  {
    name: 'Accounts History',
    description: 'Payments, Programs, Ledger, Vouchers',
  },
  {
    name: 'Booking & History',
    description: 'Search, Book, Issue Voucher, Invoice, Ledger, Sales Report, Make Payment, Payment History, Credit Note',
  },
  {
    name: 'Booking & Accounts',
    description: 'Search, Book, Issue Voucher, Invoice, Ledger, Sales Report, Make Payment, Payment History, Credit Note',
  },
];

type PermissionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  subAgent: SubAgency | null;
};

export const PermissionModal = ({ isOpen, onClose, subAgent }: PermissionModalProps) => {
  // In a real app, you would initialize this state with the subAgent's current permission group
  const [selected, setSelected] = useState(permissionGroups[0]);

  if (!isOpen || !subAgent) return null;
  
  const handleUpdate = () => {
    toast.success(`Permissions for ${subAgent.firstName} updated to ${selected.name}.`);
    onClose();
    // TODO: Add API call to update permissions
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white shadow-xl flex flex-col max-h-[90vh]">
           <header className="flex justify-between items-center p-4 border-b">
            <div>
                 <Dialog.Title className="text-xl font-bold text-gray-800">Sub User Details</Dialog.Title>
                 <p className="text-sm text-gray-500">
                    Editing permissions for <span className="font-semibold text-blue-600">{subAgent.firstName} {subAgent.lastName}</span>
                </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </header>

          <main className="p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">User Group</h3>
            <RadioGroup value={selected} onChange={setSelected}>
              <RadioGroup.Label className="sr-only">User Group</RadioGroup.Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissionGroups.map((group) => (
                  <RadioGroup.Option
                    key={group.name}
                    value={group}
                    className={({ active, checked }) =>
                      `relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none 
                      ${checked ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-300'}
                      ${active ? 'ring-2 ring-blue-500' : ''}`
                    }
                  >
                    {({ checked }) => (
                      <div className="flex w-full items-start space-x-3">
                        <div className="flex h-5 items-center">
                          {group.isSpecial ? (
                             <AlertCircle className={`h-5 w-5 ${checked ? 'text-red-600' : 'text-gray-400'}`} />
                          ) : (
                            <div className={`h-5 w-5 flex justify-center items-center rounded-full border ${checked ? 'border-blue-600' : 'border-gray-400'}`}>
                                {checked && <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                            </div>
                          )}
                        </div>
                        <div className="text-sm">
                          <RadioGroup.Label as="p" className="font-semibold text-gray-900">
                            {group.name}
                          </RadioGroup.Label>
                          <RadioGroup.Description as="span" className="text-gray-500">
                            {group.description}
                          </RadioGroup.Description>
                        </div>
                      </div>
                    )}
                  </RadioGroup.Option>
                ))}
              </div>
            </RadioGroup>
          </main>

          <footer className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
             <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Close
              </button>
             <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Update Permission
              </button>
          </footer>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};