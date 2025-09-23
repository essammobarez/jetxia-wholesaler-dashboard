'use client';
import React, { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { Eye, Edit2, Trash2, Tag, UserPlus, Users, X } from 'lucide-react';
import { Registration, Agency as BaseAgency, AgencyModal } from './AgencyModal';
import AddCreditModal from './AddCreditModal';
import AssignModal from './AssignModal';
import { TbCreditCardPay } from 'react-icons/tb';
import { toast } from 'react-toastify';
import { SubAgencyModal } from './SubAgencyModal';

type Supplier = { id: string; name: string; enabled: boolean };

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
      isActive: boolean; // This property will be populated from partnerProvider
    };
    type: string;
    value: number;
    _id: string;
  }>;
};

type AgencyWithState = BaseAgency & {
  status: 'pending' | 'approved' | 'suspended';
  contactName: string;
  submittedAt: string;
  markupPlanName: string;
  markupPercentage: number;
  markupPlan: PlanType | null;
  suspended: boolean;
  displaySupplierName?: boolean;
  walletBalance: {
    mainBalance: number;
    availableCredit: number;
  };
  partnerProvider: PartnerProvider[]; // Keep the original partner provider data
};

export default function AgencyAdminPanel() {
  const [agencies, setAgencies] = useState<AgencyWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'markup' | null>(
    null
  );
  const [selected, setSelected] = useState<AgencyWithState | null>(null);
  const [formState, setFormState] = useState<Partial<Registration>>({});
  const [profileForm, setProfileForm] = useState<{
    markupPlanId: string;
    markupPlanName: string;
    markupPercentage: number;
  }>({
    markupPlanId: '',
    markupPlanName: '',
    markupPercentage: 0,
  });
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [agencyId, setAgencyId] = useState<string | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAgencyIdForAssign, setSelectedAgencyIdForAssign] = useState<
    string | null
  >(null);
  const [
    selectedAgencyNameForAssign,
    setSelectedAgencyNameForAssign,
  ] = useState<string | null>(null);

  const [selectedWalletBalance, setSelectedWalletBalance] = useState<{
    mainBalance: number;
    availableCredit: number;
  } | null>(null);

  const [plans, setPlans] = useState<PlanType[]>([]);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const [
    selectedAgencyForSubAgents,
    setSelectedAgencyForSubAgents,
  ] = useState<{ id: string; name: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('wholesalerId');
    if (stored) setWholesalerId(stored);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        event.target instanceof Element &&
        !event.target.closest('[data-tooltip-area]')
      ) {
        setActiveTooltip(null);
      }
    };

    if (activeTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeTooltip]);

  const fetchPlans = async (wid: string): Promise<PlanType[]> => {
    try {
      const res = await fetch(`${API_URL}markup/plans/wholesaler/${wid}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPlans(json.data);
        return json.data;
      } else {
        setPlans([]);
        return [];
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setPlans([]);
      return [];
    }
  };

  useEffect(() => {
    if (!API_URL || !wholesalerId) return;

    const fetchData = async () => {
      try {
        await fetchPlans(wholesalerId);

        const res = await fetch(`${API_URL}agency/wholesaler/${wholesalerId}`);
        const json = await res.json();
        if (!json.success || !Array.isArray(json.data)) return;

        const enriched: AgencyWithState[] = json.data.map((item: any) => {
          const contactName =
            `${item.title ?? ''} ${item.firstName ?? ''} ${
              item.lastName ?? ''
            }`.trim();
          const status =
            (item.status as 'pending' | 'approved' | 'suspended') || 'pending';
          const suspended = status !== 'approved';

          let markupPlanName = '—';
          let markupPercentage = 0;
          let processedMarkupPlan: PlanType | null = null;

          if (item.markupPlan && Array.isArray(item.markupPlan.markups)) {
            markupPlanName = item.markupPlan.name || '—';

            const firstMarkup = item.markupPlan.markups[0];
            if (
              firstMarkup &&
              firstMarkup.type === 'percentage' &&
              typeof firstMarkup.value === 'number'
            ) {
              markupPercentage = firstMarkup.value;
            }

            const processedMarkups = item.markupPlan.markups.map(
              (markup: any) => {
                if (!markup.provider) return markup;

                const partnerInfo = (item.partnerProvider || []).find(
                  (p: PartnerProvider) =>
                    p.providerId?._id === markup.provider._id
                );

                const updatedProvider = {
                  ...markup.provider,
                  // ## FIX: Explicitly convert status to a boolean ##
                  isActive: partnerInfo ? Boolean(partnerInfo.status) : false,
                };

                return { ...markup, provider: updatedProvider };
              }
            );

            processedMarkupPlan = {
              ...item.markupPlan,
              markups: processedMarkups,
            };
          }

          return {
            id: item._id,
            agencyName: item.agencyName,
            contactName,
            email: item.email,
            address: item.address,
            phone: item.phoneNumber,
            submittedAt: item.createdAt,
            status,
            markupPlanName,
            markupPercentage,
            markupPlan: processedMarkupPlan,
            suspended,
            displaySupplierName: item.displaySupplierName || false,
            walletBalance: item.walletBalance || {
              mainBalance: 0,
              availableCredit: 0,
            },
            partnerProvider: item.partnerProvider || [],
          };
        });

        setAgencies(enriched);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to fetch agency data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, wholesalerId]);

  const handleProviderToggle = async (
    agencyId: string,
    providerId: string,
    newStatus: boolean
  ) => {
    const originalAgencies = [...agencies];

    setAgencies(prevAgencies =>
      prevAgencies.map(agency => {
        if (agency.id === agencyId && agency.markupPlan) {
          const newMarkups = agency.markupPlan.markups.map(markup => {
            if (markup.provider?._id === providerId) {
              return {
                ...markup,
                provider: markup.provider
                  ? { ...markup.provider, isActive: newStatus }
                  : undefined,
              };
            }
            return markup;
          });
          return {
            ...agency,
            markupPlan: { ...agency.markupPlan, markups: newMarkups },
          };
        }
        return agency;
      })
    );

    try {
      const token =
        document.cookie
          .split('; ')
          .find(r => r.startsWith('authToken='))
          ?.split('=')[1] || localStorage.getItem('authToken');

      if (!token) {
        toast.error('Authentication error. Please log in again.');
        setAgencies(originalAgencies);
        return;
      }

      const res = await fetch(
        `${API_URL}agency/${agencyId}/partner-provider/${providerId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update provider status.');
      }
      
      const json = await res.json();
      if (!json.success) {
          throw new Error(json.message || 'An API error occurred.');
      }

      toast.success(
        `Provider status changed to ${newStatus ? 'Enabled' : 'Disabled'}.`
      );
    } catch (err) {
      console.error('Error updating provider status:', err);
      toast.error(
        err instanceof Error ? err.message : 'Could not update provider status.'
      );
      setAgencies(originalAgencies);
    }
  };

  const toggleStatus = async (agency: AgencyWithState) => {
    const token =
      document.cookie
        .split('; ')
        .find(r => r.startsWith('authToken='))
        ?.split('=')[1] || localStorage.getItem('authToken');

    if (!token) {
      console.error('Authorization failed. Please log in again.');
      return;
    }

    const newStatus = agency.suspended ? 'approved' : 'suspended';
    const agencyId = agency.id;

    try {
      const res = await fetch(`${API_URL}wholesaler/${agencyId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!json.success) {
        console.error('Failed to toggle status:', json.message || json);
        return;
      }

      setAgencies(prev =>
        prev.map(a =>
          a.id === agencyId
            ? { ...a, status: newStatus, suspended: newStatus !== 'approved' }
            : a
        )
      );
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const openModal = (
    mode: 'view' | 'edit' | 'markup',
    agency: AgencyWithState
  ) => {
    setSelected(agency);
    setModalMode(mode);

    const commonSetup = (fetchedPlans: any[]) => {
      const match = fetchedPlans.find(
        (p: any) => p.name === agency.markupPlanName
      );
      if (match) {
        setProfileForm({
          markupPlanId: match._id,
          markupPlanName: match.name,
          markupPercentage: (() => {
            const firstMarkup =
              Array.isArray(match.markups) && match.markups.length > 0
                ? match.markups[0]
                : null;
            return firstMarkup &&
              firstMarkup.type === 'percentage' &&
              typeof firstMarkup.value === 'number'
              ? firstMarkup.value
              : agency.markupPercentage;
          })(),
        });
      } else {
        setProfileForm({
          markupPlanId: '',
          markupPlanName: agency.markupPlanName,
          markupPercentage: agency.markupPercentage,
        });
      }
    };

    if (mode === 'view') {
      if (wholesalerId) fetchPlans(wholesalerId).then(commonSetup);
      else commonSetup([]);
    }

    if (mode === 'edit') {
      setFormState({
        agencyName: agency.agencyName,
        contactName: agency.contactName,
        email: agency.email,
        address: agency.address,
        phone: agency.phone,
        displaySupplierName: agency.displaySupplierName,
      });
    }

    if (mode === 'markup') {
      if (wholesalerId) fetchPlans(wholesalerId).then(commonSetup);
    }
  };

  const saveEdit = async () => {
    if (!selected) return;
    const token =
      document.cookie
        .split('; ')
        .find(r => r.startsWith('authToken='))
        ?.split('=')[1] || localStorage.getItem('authToken');
    try {
      const payload = {
        agencyName: formState.agencyName,
      };
      const res = await fetch(
        `${API_URL}agency/admin/agencies/${selected.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      await fetch(
        `${API_URL}agency/${selected.id}/display-supplier-name`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            displaySupplierName: formState.displaySupplierName,
          }),
        }
      );

      const json = await res.json();
      if (!json.success) return;

      setAgencies(prev =>
        prev.map(a =>
          a.id === selected.id
            ? {
                ...a,
                agencyName: formState.agencyName || a.agencyName,
                displaySupplierName: formState.displaySupplierName,
              }
            : a
        )
      );

      closeModal();
    } catch (err) {
      console.error('Error saving edit:', err);
    }
  };

  const saveProfile = async () => {
    if (!selected || !profileForm.markupPlanId) return;
    const { markupPlanId } = profileForm;
    const agencyId = selected.id;

    try {
      const res = await fetch(
        `${API_URL}markup/${markupPlanId}/assign/${agencyId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const json = await res.json();
      if (!json.success) return;

      setAgencies(prev =>
        prev.map(a =>
          a.id === selected.id
            ? {
                ...a,
                markupPlanName: profileForm.markupPlanName,
                markupPercentage: profileForm.markupPercentage,
              }
            : a
        )
      );
    } catch (err) {
      console.error('Error assigning plan:', err);
    }

    closeModal();
  };

  const deleteAgency = (agency: BaseAgency) => {
    if (confirm(`Delete agency "${agency.agencyName}" permanently?`)) {
      setAgencies(prev => prev.filter(a => a.id !== agency.id));
    }
    closeModal();
  };

  const closeModal = () => setModalMode(null);

  const openCreditModal = (id: string) => {
    const agency = agencies.find(a => a.id === id);
    if (agency) {
      setAgencyId(id);
      setSelectedWalletBalance(agency.walletBalance);
      setShowCreditModal(true);
    }
  };

  const closeCreditModal = () => {
    setShowCreditModal(false);
    setAgencyId(null);
    setSelectedWalletBalance(null);
  };

  const openAssignModal = (id: string, name: string) => {
    setSelectedAgencyIdForAssign(id);
    setSelectedAgencyNameForAssign(name);
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedAgencyIdForAssign(null);
    setSelectedAgencyNameForAssign(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-600">Loading agencies…</p>
      </div>
    );
  }

  const headerTitles = [
    'Agency',
    'Contact',
    'Submitted',
    'Markup Plan',
    'Status',
    'Actions',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-4 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-blue-800">
          Agency Management
        </h1>
        <p className="mt-2 text-blue-600">
          View, edit or manage agency registrations
        </p>
      </header>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <div className="lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto]">
          <div className="hidden lg:contents">
            {headerTitles.map(title => (
              <div
                key={title}
                className="lg:p-4 font-semibold text-sm text-blue-700 uppercase tracking-wider bg-blue-100 text-center"
              >
                {title}
              </div>
            ))}
          </div>

          <div className="p-4 space-y-4 lg:p-0 lg:space-y-0 lg:contents">
            {agencies.map((a, index) => {
              const words = a.markupPlanName.split(' ');
              const isPlanNameTruncated = words.length > 2;
              const planNameDisplayText = isPlanNameTruncated
                ? `${words.slice(0, 2).join(' ')}...`
                : a.markupPlanName;

              const isTopRow = index < 2;

              return (
                <div
                  key={a.id}
                  className="bg-white p-4 rounded-lg shadow-md space-y-4 lg:p-0 lg:shadow-none lg:rounded-none lg:bg-transparent lg:contents lg:group"
                >
                  <div className="flex justify-between items-center lg:items-center lg:justify-center lg:p-4 lg:border-b lg:border-gray-100 lg:group-hover:bg-blue-50">
                    <strong className="lg:hidden text-gray-600">Agency</strong>
                    <span className="relative text-center top-[8px]">
                      {a.agencyName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center lg:items-center lg:justify-center lg:p-4 lg:border-b lg:border-gray-100 lg:group-hover:bg-blue-50">
                    <strong className="lg:hidden text-gray-600">
                      Contact
                    </strong>
                    <span className="text-right lg:text-center">
                      {a.contactName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center lg:items-center lg:justify-center lg:p-4 lg:border-b lg:border-gray-100 lg:group-hover:bg-blue-50">
                    <strong className="lg:hidden text-gray-600">
                      Submitted
                    </strong>
                    <span className="text-right lg:text-center">
                      {new Date(a.submittedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center lg:items-center lg:justify-center lg:p-4 lg:border-b lg:border-gray-100 lg:group-hover:bg-blue-50">
                    <strong className="lg:hidden text-gray-600">
                      Markup Plan
                    </strong>
                    <div className="flex justify-end lg:justify-center">
                      {a.markupPlanName !== '—' ? (
                        <div className="flex items-center space-x-2">
                          <span
                            className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            title={
                              isPlanNameTruncated ? a.markupPlanName : undefined
                            }
                          >
                            {planNameDisplayText}
                          </span>
                          <div
                            className="group relative"
                            data-tooltip-area={a.id}
                          >
                            <Tag
                              className="w-5 h-5 text-blue-500 cursor-pointer"
                              onClick={() =>
                                setActiveTooltip(prev =>
                                  prev === a.id ? null : a.id
                                )
                              }
                            />
                            <div
                              className={`
                                                absolute left-1/2 -translate-x-1/2 w-max max-w-xs
                                                bg-gray-800 text-white text-sm rounded-lg shadow-lg p-3 z-50 transition-opacity
                                                ${
                                                  isTopRow
                                                    ? 'top-full mt-2'
                                                    : 'bottom-full mb-2'
                                                }
                                                ${
                                                  activeTooltip === a.id
                                                    ? 'visible opacity-100'
                                                    : 'invisible opacity-0'
                                                }
                                                lg:invisible lg:opacity-0 lg:group-hover:visible lg:group-hover:opacity-100
                                            `}
                            >
                              <h4 className="font-bold border-b border-gray-600 pb-1 mb-2">
                                Providers & Markups
                              </h4>
                              <ul className="space-y-2">
                                {(a.markupPlan?.markups ?? []).map(markup => (
                                  <li
                                    key={markup._id}
                                    className="flex justify-between items-center space-x-4"
                                  >
                                    <span className="flex-1 truncate">
                                      {markup.provider?.name ?? 'Default'}
                                    </span>
                                    <div className="flex items-center gap-x-3">
                                      <span className="font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
                                        {markup.value}%
                                      </span>
                                      <Switch
                                        checked={
                                          markup.provider?.isActive ?? false
                                        }
                                        onChange={newState => {
                                          if (markup.provider?._id) {
                                            handleProviderToggle(
                                              a.id,
                                              markup.provider._id,
                                              newState
                                            );
                                          }
                                        }}
                                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                                          markup.provider?.isActive
                                            ? 'bg-green-500'
                                            : 'bg-gray-400'
                                        }`}
                                      >
                                        <span
                                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            markup.provider?.isActive
                                              ? 'translate-x-5'
                                              : 'translate-x-1'
                                          }`}
                                        />
                                      </Switch>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                              <div
                                className={`
                                                    absolute left-1/2 -translate-x-1/2 w-0 h-0
                                                    border-x-8 border-x-transparent
                                                    ${
                                                      isTopRow
                                                        ? 'bottom-full border-b-8 border-b-gray-800'
                                                        : 'top-full border-t-8 border-t-gray-800'
                                                    }
                                                `}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center lg:items-center lg:justify-center lg:p-4 lg:border-b lg:border-gray-100 lg:group-hover:bg-blue-50">
                    <strong className="lg:hidden text-gray-600">
                      Status
                    </strong>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        a.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : a.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex justify-end items-center pt-2 lg:pt-0 lg:justify-center lg:p-4 lg:border-b lg:border-gray-100 lg:group-hover:bg-blue-50">
                    <div className="flex items-center justify-center flex-wrap lg:flex-nowrap gap-2">
                      <button
                        title="Add Credit"
                        onClick={() => openCreditModal(a.id)}
                        className="p-2 bg-green-300 text-white rounded-full hover:bg-green-700"
                      >
                        <TbCreditCardPay className="w-5 h-5" />
                      </button>
                      <button
                        title="View"
                        onClick={() => openModal('view', a)}
                        className="p-2 bg-blue-200 rounded-full hover:bg-blue-300 transition"
                      >
                        <Eye size={18} className="text-blue-700" />
                      </button>
                      <button
                        title="Edit"
                        onClick={() => openModal('edit', a)}
                        className="p-2 bg-indigo-200 rounded-full hover:bg-indigo-300 transition"
                      >
                        <Edit2 size={18} className="text-indigo-700" />
                      </button>
                      <button
                        title="Markup"
                        onClick={() => openModal('markup', a)}
                        className="p-2 bg-yellow-200 rounded-full hover:bg-yellow-300 transition"
                      >
                        <Tag size={18} className="text-yellow-700" />
                      </button>
                      <button
                        title="Assign"
                        onClick={() => openAssignModal(a.id, a.agencyName)}
                        className="p-2 bg-purple-200 rounded-full hover:bg-purple-300 transition"
                      >
                        <UserPlus size={18} className="text-purple-700" />
                      </button>
                      <button
                        title="View Sub-agencies"
                        onClick={() =>
                          setSelectedAgencyForSubAgents({
                            id: a.id,
                            name: a.agencyName,
                          })
                        }
                        className="p-2 bg-teal-200 rounded-full hover:bg-teal-300 transition"
                      >
                        <Users size={18} className="text-teal-700" />
                      </button>
                      <Switch
                        checked={!a.suspended}
                        onChange={() => toggleStatus(a)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          !a.suspended ? 'bg-green-400' : 'bg-red-300'
                        }`}
                      >
                        <span className="sr-only">
                          {a.suspended ? 'Unsuspend' : 'Suspend'}
                        </span>
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            !a.suspended ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </Switch>
                      <button
                        title="Delete"
                        onClick={() => deleteAgency(a)}
                        className="p-2 bg-red-200 rounded-full hover:bg-red-300 transition"
                      >
                        <Trash2 size={18} className="text-red-700" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AgencyModal
        mode={modalMode}
        agency={selected}
        formState={formState}
        setFormState={setFormState}
        profileForm={profileForm}
        setProfileForm={vals => setProfileForm(vals)}
        close={closeModal}
        onSave={saveEdit}
        onSaveProfile={saveProfile}
        onToggleSuspend={toggleStatus}
        onDelete={deleteAgency}
        plans={plans}
      />

      {showCreditModal && agencyId && selectedWalletBalance && (
        <AddCreditModal
          onClose={closeCreditModal}
          agencyId={agencyId}
          walletBalance={selectedWalletBalance}
        />
      )}

      <AssignModal
        isOpen={isAssignModalOpen}
        onClose={closeAssignModal}
        agencyId={selectedAgencyIdForAssign}
        agencyName={selectedAgencyNameForAssign}
      />

      <SubAgencyModal
        isOpen={!!selectedAgencyForSubAgents}
        onClose={() => setSelectedAgencyForSubAgents(null)}
        agencyId={selectedAgencyForSubAgents?.id}
        agencyName={selectedAgencyForSubAgents?.name}
      />
    </div>
  );
}