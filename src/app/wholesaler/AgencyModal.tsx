// AgencyModal.tsx
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export type Registration = {
  id: string;
  agencyName: string;
  contactName: string;
  email: string;
  submittedAt: string;
  address: string;
  phone: string;
};

export type Agency = Registration & {
  suspended: boolean;
  profileName: string;
  percentage: number;
};

type AgencyModalProps = {
  mode: 'view' | 'edit' | 'markup' | null;
  agency: Agency | null;
  formState: Partial<Registration>;
  setFormState: (s: Partial<Registration>) => void;
  profileForm: { profileName: string; percentage: number };
  setProfileForm: (s: { profileName: string; percentage: number }) => void;
  close: () => void;
  onSave: () => void;
  onSaveProfile: () => void;
  onToggleSuspend: (a: Agency) => void;
  onDelete: (a: Agency) => void;
};

export function AgencyModal({
  mode,
  agency,
  formState,
  setFormState,
  profileForm,
  setProfileForm,
  close,
  onSave,
  onSaveProfile,
  onToggleSuspend,
  onDelete,
}: AgencyModalProps) {
  if (!mode || !agency) return null;

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-30"
          leave="ease-in duration-150"
          leaveFrom="opacity-30"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/10" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-4">
              <Dialog.Title className="text-2xl font-bold text-gray-800">
                {mode === 'view'
                  ? 'Agency Profile'
                  : mode === 'edit'
                  ? 'Edit Agency & Plan'
                  : 'Edit Plan & Percentage'}
              </Dialog.Title>

              {mode === 'view' && (
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">Agency:</span> {agency.agencyName}</p>
                  <p><span className="font-medium">Contact:</span> {agency.contactName}</p>
                  <p><span className="font-medium">Email:</span> {agency.email}</p>
                  <p>
                    <span className="font-medium">Submitted:</span>{' '}
                    {new Date(agency.submittedAt).toLocaleString()}
                  </p>
                  <p><span className="font-medium">Address:</span> {agency.address}</p>
                  <p><span className="font-medium">Phone:</span> {agency.phone}</p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    {agency.suspended ? 'Suspended' : 'Active'}
                  </p>
                  <p><span className="font-medium">Plan:</span> {agency.profileName}</p>
                  <p><span className="font-medium">Percentage:</span> {agency.percentage}%</p>
                  <div className="pt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => onToggleSuspend(agency)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                      {agency.suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                    <button
                      onClick={() => onDelete(agency)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={close}
                      className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {mode === 'edit' && (
                <form className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    {(['agencyName','contactName','email','address','phone'] as const).map(field => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {field === 'agencyName'
                            ? 'Agency Name'
                            : field === 'contactName'
                            ? 'Contact Name'
                            : field === 'address'
                            ? 'Address'
                            : field === 'phone'
                            ? 'Phone'
                            : 'Email'}
                        </label>
                        <input
                          type="text"
                          value={(formState as any)[field] || ''}
                          onChange={e => setFormState({ ...formState, [field]: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                      <input
                        type="text"
                        value={profileForm.profileName}
                        onChange={e => setProfileForm({ ...profileForm, profileName: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Percentage</label>
                      <input
                        type="number"
                        value={profileForm.percentage}
                        onChange={e => setProfileForm({ ...profileForm, percentage: +e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onSave}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={close}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {mode === 'markup' && (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                    <input
                      type="text"
                      value={profileForm.profileName}
                      onChange={e => setProfileForm({ ...profileForm, profileName: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Percentage</label>
                    <input
                      type="number"
                      value={profileForm.percentage}
                      onChange={e => setProfileForm({ ...profileForm, percentage: +e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    />
                  </div>
                  <div className="pt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onSaveProfile}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={close}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}