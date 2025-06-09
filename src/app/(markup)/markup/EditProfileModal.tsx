'use client';

import React, { FC, useState, useEffect } from 'react';
import { ProfileSummary } from './MarkupProfileClient';

export interface EditInput {
  id: string;
  name: string;
  type: string;
  defaultModifier: string;
  action: string;
}

interface Props {
  open: boolean;
  profile: ProfileSummary;
  onClose: () => void;
  onSubmit: (updated: ProfileSummary) => void;
}

const EditProfileModal: FC<Props> = ({ open, profile, onClose, onSubmit }) => {
  const [form, setForm] = useState<EditInput>({
    id: '',
    name: '',
    type: '',
    defaultModifier: '',
    action: '',
  });

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      const currentModifier = profile.modifiers[0] ?? '';
      setForm({
        id: profile.id,
        name: profile.name,
        type: profile.type,
        defaultModifier: currentModifier.replace('%', ''),
        action: profile.action || '',
      });
    }
  }, [open, profile]);

  const handleChange = (field: keyof EditInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
  };

  const handleSave = () => {
    const now = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const updatedModifiers = [
      form.defaultModifier.includes('%')
        ? form.defaultModifier
        : `${form.defaultModifier}%`,
    ];

    onSubmit({
      ...profile,
      name: form.name,
      type: form.type,
      modifiers: updatedModifiers,
      modifiedAt: now,
      modifiedBy: form.name,
      action: form.action || '—',
    });
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>

          <h2 className="text-xl font-semibold mb-4 px-6 pt-6">
            Edit Profile
          </h2>

          <div className="px-6 space-y-4">
            <label className="block">
              <span className="text-sm">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                className="mt-1 block w-full border rounded p-2"
              />
            </label>

            <label className="block">
              <span className="text-sm">Type</span>
              <select
                value={form.type}
                onChange={handleChange('type')}
                className="mt-1 block w-full border rounded p-2"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm">Default Modifier</span>
              <input
                type="number"
                value={form.defaultModifier}
                onChange={handleChange('defaultModifier')}
                className="mt-1 block w-full border rounded p-2"
              />
            </label>

            <label className="block">
              <span className="text-sm">Action</span>
              <input
                type="text"
                value={form.action}
                onChange={handleChange('action')}
                className="mt-1 block w-full border rounded p-2"
              />
            </label>
          </div>

          <div className="mt-6 px-6 pb-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;
