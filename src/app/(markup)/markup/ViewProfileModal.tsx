'use client';

import React, { FC } from 'react';
import {
  X,
  User,
  Tag,
  Database,
  Calendar,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Profile } from './MarkupProfileClient';

interface Props {
  open: boolean;
  profile: Profile;
  onClose: () => void;
}

const ViewProfileModal: FC<Props> = ({ open, profile, onClose }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative overflow-auto max-h-[90vh] mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <header className="mb-6 border-b pb-4 flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">{profile.name}</h2>
          </header>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Profile Info */}
            <section className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-2xl shadow-inner grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {/* <h3 className="flex items-center text-lg font-medium text-gray-700 mb-2">
                  <Tag className="w-5 h-5 mr-2 text-gray-600" />
                  Type
                </h3>
                <p className="text-xl font-semibold text-gray-900">{profile.type}</p> */}
                <h3 className="flex items-center text-lg font-medium text-gray-700 mb-2">
                  <Tag className="w-5 h-5 mr-2 font-extrabold text-gray-600" />
                  Markup summary
                </h3>

              </div>
              <div>
                <h3 className="flex items-center text-lg font-medium text-gray-700 mb-2">
                  <Database className="w-5 h-5 mr-2 text-gray-600" />
                  Associated Providers
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.providers.map((prov, idx) => {
                    const mark = profile.markups.find(m => m.provider._id === prov._id);
                    const pct = mark?.type === 'percentage' ? `${mark.value}%` : mark?.value;
                    return (
                      <div
                        key={`${prov._id}-${idx}`}
                        className="flex items-center space-x-2 bg-blue-100/50 px-3 py-1 rounded-full shadow-sm"
                      >
                        <span className="text-gray-800 font-medium">{prov.name}</span>
                        <span className="text-sm font-semibold text-blue-800">{pct ?? '—'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Timestamps */}
            <section className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl shadow-inner">
              <h3 className="flex items-center text-lg font-medium mb-4 text-gray-700">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                Timestamps
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <GridField
                  icon={<Activity />}
                  label="Created At"
                  value={new Date(profile.createdAt).toLocaleString('en-GB')}
                />
                <GridField
                  icon={<Activity />}
                  label="Updated At"
                  value={new Date(profile.updatedAt).toLocaleString('en-GB')}
                />
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

interface GridFieldProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const GridField: FC<GridFieldProps> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <div className="text-gray-500 mt-1">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

export default ViewProfileModal;
