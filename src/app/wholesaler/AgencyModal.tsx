// AgencyModal.tsx
import { Fragment } from 'react';
import { Dialog, Switch, Transition } from '@headlessui/react';
import { Tag, X } from 'lucide-react';

export type Registration = {
  id: string;
  agencyName: string;
  contactName: string;
  email: string;
  submittedAt: string;
  address: string;
  phone: string;
  displaySupplierName?: boolean;
};

export type Agency = Registration & {
  suspended: boolean;
};

type PartnerProvider = {
  _id: string;
  providerId: {
    _id: string;
    name: string;
  };
  status: boolean;
};

type PlanType = {
  _id: string;
  name: string;
  service: string;
  markups: Array<{
    provider?: {
      _id: string;
      name: string;
    };
    type: string;
    value: number;
    _id:string;
  }>;
};

type AgencyModalProps = {
  mode: 'view' | 'edit' | 'markup' | null;
  agency: (Agency & { partnerProvider?: PartnerProvider[] }) | null;
  formState: Partial<Registration>;
  setFormState: (s: Partial<Registration>) => void;
  profileForm: { markupPlanId: string; markupPlanName: string; markupPercentage: number };
  setProfileForm: (s: { markupPlanId: string; markupPlanName: string; markupPercentage: number }) => void;
  close: () => void;
  onSave: () => void;
  onSaveProfile: () => void;
  onToggleSuspend: (a: Agency) => void;
  onDelete: (a: Agency) => void;
  plans: PlanType[];
  onTogglePartnerProvider: (agencyId: string, providerId: string) => void;
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
  plans,
  onTogglePartnerProvider,
}: AgencyModalProps) {

  if (!mode || !agency) return null;

  const getPlanById = (planId: string) => plans.find(p => p._id === planId);
  const getPlanByName = (planName: string) => plans.find(p => p.name === planName);

  const handlePlanSelect = (planId: string) => {
    const plan = getPlanById(planId);
    if (plan) {
      const firstMarkup = Array.isArray(plan.markups) && plan.markups.length > 0
        ? plan.markups[0]
        : null;
      const pct = firstMarkup && firstMarkup.type === 'percentage' && typeof firstMarkup.value === 'number'
        ? firstMarkup.value
        : 0;
      setProfileForm({
        markupPlanId: plan._id,
        markupPlanName: plan.name,
        markupPercentage: pct,
      });
    } else {
      setProfileForm({
        markupPlanId: '',
        markupPlanName: '',
        markupPercentage: 0,
      });
    }
  };

  const MarkupTooltip = ({ plan }: { plan: PlanType | undefined }) => {
    if (!plan || !plan.markups || !plan.markups.length === 0) {
      return null;
    }
    return (
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs
                      invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity
                      bg-gray-800 text-white text-sm rounded-lg shadow-lg p-3 z-50">
        <h4 className="font-bold border-b border-gray-600 pb-1 mb-1">Providers & Markups</h4>
        <ul className="space-y-1">
          {plan.markups.map(markup => (
            <li key={markup._id} className="flex justify-between items-center space-x-4">
              <span>{markup.provider?.name ?? 'Default'}</span>
              <span className="font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">{markup.value}%</span>
            </li>
          ))}
        </ul>
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[-1px] w-0 h-0
                        border-x-8 border-x-transparent border-t-8 border-t-gray-800" />
      </div>
    );
  };

  const SupplierSidePanel = () => (
    // FIX: Changed to a fixed width and adjusted padding
    <div className="w-56 flex-shrink-0 border-l border-gray-200 pl-5">
      <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
        Supplier Status
      </h4>
      <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {agency?.partnerProvider && agency.partnerProvider.length > 0 ? (
          agency.partnerProvider.map(partner => (
            <li key={partner._id} className="flex justify-between items-center space-x-3">
              <span className="flex-1 text-sm text-gray-700 truncate">{partner.providerId.name}</span>
              <Switch
                checked={partner.status}
                onChange={() => onTogglePartnerProvider(agency.id, partner.providerId._id)}
                className={`${partner.status ? 'bg-blue-600' : 'bg-gray-300'}
                  relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
              >
                <span className="sr-only">Toggle {partner.providerId.name}</span>
                <span
                  aria-hidden="true"
                  className={`${partner.status ? 'translate-x-5' : 'translate-x-0'}
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-sm">No suppliers connected.</li>
        )}
      </ul>
    </div>
  );

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
            {/* FIX: Reduced max-width for a tighter layout */}
            <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 relative">
              <button
                onClick={close}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>

              <Dialog.Title className="text-2xl font-bold text-gray-800 pr-8">
                {mode === 'view'
                  ? 'Agency Profile'
                  : mode === 'edit'
                    ? 'Edit Agency Info'
                    : 'Assign Markup Plan'}
              </Dialog.Title>

              <div className="pt-4">
                {mode === 'view' && (
                  // FIX: Reduced gap between columns
                  <div className="flex flex-row gap-x-5">
                    <div className="flex-grow space-y-2 text-gray-700">
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
                      <div className="flex items-center space-x-2 pt-1">
                        <span className="font-medium">Plan:</span>
                        <span>{profileForm.markupPlanName || '—'}</span>
                        {profileForm.markupPlanName !== '—' && (
                          <div className="group relative">
                            <Tag className="w-5 h-5 text-blue-500 cursor-pointer" />
                            <MarkupTooltip plan={getPlanByName(profileForm.markupPlanName)} />
                          </div>
                        )}
                      </div>
                    </div>
                    <SupplierSidePanel />
                  </div>
                )}
                {mode === 'edit' && (
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {(['agencyName', 'contactName', 'email', 'address', 'phone'] as const).map(
                        field => (
                          <div key={field}>
                            <label className="block text-sm font-medium text-gray-700 capitalize">
                              {field.replace(/([A-Z])/g, ' $1').replace(/^./, str =>
                                str.toUpperCase()
                              )}
                            </label>
                            <input
                              type="text"
                              value={(formState as any)[field] || ''}
                              onChange={e =>
                                setFormState({ ...formState, [field]: e.target.value })
                              }
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                            />
                          </div>
                        )
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Show suppliers
                        </label>
                        <div className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-0 p-2 bg-white">
                          <div className="flex items-center justify-start gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setFormState({ ...formState, displaySupplierName: !formState.displaySupplierName })
                              }
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-0 focus:ring-blue-500 focus:ring-offset-0 ${formState.displaySupplierName ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formState.displaySupplierName ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                              />
                            </button>
                            <span className="text-sm text-gray-700">
                              {formState.displaySupplierName ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
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
                    </div>
                  </form>
                )}
                {mode === 'markup' && (
                  <div className="flex flex-row gap-x-5">
                    <form className="flex-grow space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Select Plan</label>
                        <select
                          value={profileForm.markupPlanId}
                          onChange={e => handlePlanSelect(e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        >
                          <option value="">-- Select a plan --</option>
                          {plans.map(plan => (
                            <option key={plan._id} value={plan._id}>
                              {plan.name} - {plan.service}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Selected Plan</label>
                        <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md">
                          <span className="flex-1">{profileForm.markupPlanName || '—'}</span>
                          {profileForm.markupPlanId && (
                            <div className="group relative">
                              <Tag className="w-5 h-5 text-blue-500 cursor-pointer" />
                              <MarkupTooltip plan={getPlanById(profileForm.markupPlanId)} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={onSaveProfile}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Save Assignment
                        </button>
                      </div>
                    </form>
                    <SupplierSidePanel />
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}