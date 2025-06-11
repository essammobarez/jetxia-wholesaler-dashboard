'use client';

import React, { FC, useState, useEffect } from 'react';
import { ChevronDown, Eye, Edit2 } from 'lucide-react';
import AddProfileModal from './AddProfileModal';
import EditProfileModal from './EditProfileModal';
import ViewProfileModal from './ViewProfileModal';
import { useSearchParams } from 'next/navigation';

export interface Agency {
  _id: string;
  agencyName: string;
  country: string;
  city: string;
  postCode: string;
  address: string;
  website: string;
  phoneNumber: string;
  email: string;
  businessCurrency: string;
  vat: string;
  licenseUrl: string;
  title: string;
  firstName: string;
  lastName: string;
  emailId: string;
  designation: string;
  mobileNumber: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  _id: string;
  name: string;
  apiBaseUrl: string;
  authType: string;
  logoUrl: string;
  tokenExpiryHours: number;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Markup {
  _id: string;
  provider: Provider;
  type: string;
  value: number;
}

export interface Profile {
  _id: string;
  agency: Agency;
  name: string;
  type: string;
  providers: Provider[];
  markups: Markup[];
  createdAt: string;
  updatedAt: string;
  defaultModifier: string;
}

export interface ProfileSummary {
  id: string;
  name: string;
  type: string;
  modifiers: string[];
  modifiedAt: string;
  modifiedBy: string;
  action: string;
  raw: Profile;
}

// Use NEXT_PUBLIC_BACKEND_URL for client-side env
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
// Fetch existing plans
const GET_PLANS_URL = `${BASE_URL}/markup/agency`;
// Create new plan
const CREATE_PLAN_URL = `${BASE_URL}/markup/create-plan`;

const AGENCY_ID = '680e35505e268207d5076965';

const MarkupProfilePage: FC = () => {
  const searchParams = useSearchParams();
  const defaultModifierParam = searchParams.get('defaultModifier') || '';

  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // allow onSubmit to accept whatever shape AddProfileModal passes
  const AddProfileModalAny = AddProfileModal as React.ComponentType<any>;

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${GET_PLANS_URL}/${AGENCY_ID}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const json = (await res.json()) as { data: Profile[] };
        const mapped = json.data.map(plan => {
          const modifiers = plan.markups.map(m =>
            defaultModifierParam
              ? `${defaultModifierParam}%`
              : m.type === 'percentage'
                ? `${m.value}%`
                : `${m.value}`
          );
          const formattedDate = new Date(plan.updatedAt).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          return {
            id: plan._id,
            name: plan.name,
            type: plan.type,
            modifiers,
            modifiedAt: formattedDate,
            modifiedBy: plan.agency.userName,
            action: plan.markups[0]?.type || '—',
            raw: plan,
          } as ProfileSummary;
        });
        setProfiles(mapped);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [defaultModifierParam]);

  const handleAddProfile = async (input: any) => {
    try {
      const payload = {
        agencyId: AGENCY_ID,
        name: input.name,
        type: input.type,
        defaultModifier: parseFloat(input.defaultModifier),
        action: input.action,
      };
      const res = await fetch(CREATE_PLAN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Create failed: ${res.status}`);
      const { data: created } = (await res.json()) as { data: Profile };

      // map to summary
      const dm = defaultModifierParam ||
        (created.markups[0].type === 'percentage'
          ? `${created.markups[0].value}%`
          : `${created.markups[0].value}`);
      const formattedDate = new Date(created.updatedAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const summary: ProfileSummary = {
        id: created._id,
        name: created.name,
        type: created.type,
        modifiers: [dm],
        modifiedAt: formattedDate,
        modifiedBy: created.agency.userName,
        action: created.markups[0]?.type || '—',
        raw: created,
      };
      setProfiles(prev => [...prev, summary]);
      setAddModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create profile');
    }
  };

  const handleEditProfile = (updated: ProfileSummary) => {
    setProfiles(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    setEditModalOpen(false);
    setSelectedProfile(null);
  };

  const handleReset = () => setProfiles([]);

  const openView = (p: ProfileSummary) => {
    setSelectedProfile(p);
    setViewModalOpen(true);
  };
  const openEdit = (p: ProfileSummary) => {
    setSelectedProfile(p);
    setEditModalOpen(true);
  };
  const closeView = () => {
    setSelectedProfile(null);
    setViewModalOpen(false);
  };
  const closeEdit = () => {
    setSelectedProfile(null);
    setEditModalOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <div className="flex-1 bg-white">
        <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded">
          <p className="text-red-800 font-medium text-center">
            !! Configuring default or inheritable profiles will override any legacy configuration.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Markup Profile</h1>
          <div className="flex space-x-2 mt-3 sm:mt-0">
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Profile
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reset
            </button>
          </div>
        </div>

        {loading && <p className="text-center py-4">Loading profiles…</p>}
        {error && <p className="text-center py-4 text-red-600">Error: {error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto bg-white shadow rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['NO','Name','Modified','Actions'].map((col, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="inline-flex items-center space-x-1">
                        <span>{col}</span>
                        {i > 0 && i < 3 && <ChevronDown className="w-3 h-3 text-gray-400" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {profiles.map((p, idx) => (
                  <tr key={p.id} className="bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{p.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div>{p.modifiedAt}</div>
                      <div className="font-medium">{p.modifiedBy}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openView(p)}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AddProfileModalAny
          open={isAddModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddProfile}
        />

        {selectedProfile && (
          <EditProfileModal
            open={isEditModalOpen}
            profile={selectedProfile}
            onClose={closeEdit}
            onSubmit={handleEditProfile}
          />
        )}

        {selectedProfile && (
          <ViewProfileModal
            open={isViewModalOpen}
            profile={selectedProfile.raw}
            onClose={closeView}
          />
        )}
      </div>
    </div>
  );
};

export default MarkupProfilePage;
