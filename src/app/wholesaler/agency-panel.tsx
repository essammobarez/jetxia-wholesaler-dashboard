// page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { Eye, Edit2, Trash2, Tag, List } from 'lucide-react';
import {
  Registration,
  Agency as BaseAgency,
  AgencyModal,
} from './AgencyModal';

type Supplier = { id: string; name: string; enabled: boolean };

type AgencyWithState = BaseAgency & {
  status: 'pending' | 'approved' | 'suspended';
  profileName: string;   // comma-separated plan names
  percentage: number;
  suspended: boolean;
};

export default function AgencyAdminPanel() {
  const [agencies, setAgencies] = useState<AgencyWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'markup' | null>(null);
  const [selected, setSelected] = useState<AgencyWithState | null>(null);
  const [formState, setFormState] = useState<Partial<Registration>>({});
  const [profileForm, setProfileForm] = useState({ profileName: '', percentage: 0 });

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
const res = await fetch(`${process.env.API_URL}agency/agency`);
        const json = await res.json();
        if (!json.success || !Array.isArray(json.data)) return;

        const enriched = await Promise.all(
          json.data.map(async (item: any) => {
            let planNames = '—';
            try {
const planRes = await fetch(
  `${process.env.API_URL}markup/agency/${item._id}`
);
              const planJson = await planRes.json();
              if (planJson.success && planJson.data.length) {
                planNames = planJson.data.map((p: any) => p.name).join(', ');
              }
            } catch {}

            const status = item.status as 'pending' | 'approved' | 'suspended';
            return {
              id: item._id,
              agencyName: item.agencyName,
              contactName: `${item.title} ${item.firstName} ${item.lastName}`,
              email: item.email,
              address: item.address,
              phone: item.phoneNumber,
              submittedAt: item.createdAt,
              status,
              profileName: planNames,
              percentage: 0,
              suspended: status !== 'approved',
            } as AgencyWithState;
          })
        );

        setAgencies(enriched);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchAgencies();
  }, []);

  async function toggleStatus(agency: AgencyWithState) {
    const newStatus = agency.suspended ? 'approved' : 'suspended';
    try {
      const res = await fetch(
  `${process.env.API_URL}agency/admin/agencies/${agency.id}`,
  {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  }
);

      const json = await res.json();
      if (!json.success) return;
      setAgencies(prev =>
        prev.map(a =>
          a.id === agency.id
            ? { ...a, status: newStatus, suspended: newStatus !== 'approved' }
            : a
        )
      );
    } catch {
      // handle error if needed
    }
  }

  function openModal(mode: 'view' | 'edit' | 'markup', agency: AgencyWithState) {
    setSelected(agency);
    setModalMode(mode);
    if (mode === 'edit') {
      setFormState({
        agencyName: agency.agencyName,
        contactName: agency.contactName,
        email: agency.email,
        address: agency.address,
        phone: agency.phone,
      });
    }
    if (mode === 'markup') {
      setProfileForm({ profileName: agency.profileName, percentage: agency.percentage });
    }
  }

  const openSupplierModal = async (agency: AgencyWithState) => {
    try {
// Using your existing API_URL env var:
const res = await fetch(
  `${process.env.API_URL}markup/agency/${agency.id}`
);

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const all = json.data.flatMap((plan: any) =>
          Array.isArray(plan.providers) ? plan.providers : []
        );
        const unique = Array.from(
          new Map(all.map((p: any) => [p._id, p])).values()
        );
        setSuppliers(unique.map((p: any) => ({ id: p._id, name: p.name, enabled: p.isActive })));
      } else {
        setSuppliers([]);
      }
    } catch {
      setSuppliers([]);
    }
    setShowSupplierModal(true);
  };

  const closeModal = () => setModalMode(null);

  const saveEdit = async () => {
    if (!selected) return;
    try {
      const res = await fetch(
  `${process.env.API_URL}agency/admin/agencies/${selected.id}`,
  {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agencyName: formState.agencyName }),
  }
);

      const json = await res.json();
      if (!json.success) return;
    } catch {
      return;
    }

    setAgencies(prev =>
      prev.map(a =>
        a.id === selected.id ? { ...a, ...formState, submittedAt: a.submittedAt } : a
      )
    );
    closeModal();
  };

  const saveProfile = () => {
    if (!selected) return;
    setAgencies(prev =>
      prev.map(a =>
        a.id === selected.id
          ? { ...a, profileName: profileForm.profileName, percentage: profileForm.percentage }
          : a
      )
    );
    closeModal();
  };

  const deleteAgency = (agency: BaseAgency) => {
    if (confirm(`Delete agency "${agency.agencyName}" permanently?`)) {
      setAgencies(prev => prev.filter(a => a.id !== agency.id));
    }
    closeModal();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-600">Loading agencies…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-800">Agency Management</h1>
        <p className="mt-2 text-blue-600">View, edit or manage agency registrations</p>
      </header>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-100">
            <tr>
              {['Agency','Contact','Submitted','Profile','Status','Actions'].map(h => (
                <th
                  key={h}
                  className="px-6 py-4 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {agencies.map(a => (
              <tr key={a.id} className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4">{a.agencyName}</td>
                <td className="px-6 py-4">{a.contactName}</td>
                <td className="px-6 py-4">
                  {new Date(a.submittedAt).toLocaleDateString(undefined,{
                    year:'numeric', month:'short', day:'numeric',
                  })}
                </td>
                <td className="px-6 py-4">
                  <div
                    className="grid grid-cols-3 gap-1 max-w-sm text-sm font-medium text-gray-800"
                    title={a.profileName}
                  >
                    {a.profileName !== '—'
                      ? a.profileName.split(',').map((plan, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {plan.trim()}
                          </span>
                        ))
                      : <span className="text-gray-500">—</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {/* Status badge colors */}
                  <span
                    className={
                      `px-3 py-1 text-xs font-medium rounded-full ` +
                      (a.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : a.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800')
                    }
                  >
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center space-x-2">
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

                  {/* Status Toggle */}
                  <Switch
                    checked={!a.suspended}
                    onChange={() => toggleStatus(a)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      !a.suspended ? 'bg-green-400' : 'bg-red-300'
                    }`}
                  >
                    <span className="sr-only">{a.suspended ? 'Unsuspend' : 'Suspend'}</span>
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
                  <button
                    title="Suppliers"
                    onClick={() => openSupplierModal(a)}
                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                  >
                    <List size={18} className="text-gray-700" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AgencyModal
        mode={modalMode}
        agency={selected}
        formState={formState}
        setFormState={setFormState}
        profileForm={profileForm}
        setProfileForm={setProfileForm}
        close={closeModal}
        onSave={saveEdit}
        onSaveProfile={saveProfile}
        onToggleSuspend={() => {}}
        onDelete={deleteAgency}
      />

      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
            <h3 className="text-xl font-semibold mb-4">Provider List</h3>
            <ul className="space-y-2">
              {suppliers.map(s => (
                <li key={s.id} className="flex items-center justify-between">
                  <span>{s.name}</span>
                  <Switch
                    checked={s.enabled}
                    onChange={() =>
                      setSuppliers(prev =>
                        prev.map(x => (x.id === s.id ? { ...x, enabled: !x.enabled } : x))
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      s.enabled ? 'bg-green-500' : 'bg-red-300'
                    }`}
                  >
                    <span className="sr-only">Toggle Provider</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        s.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </Switch>
                </li>
              ))}
            </ul>
            <div className="text-right mt-6">
              <button
                onClick={() => setShowSupplierModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}