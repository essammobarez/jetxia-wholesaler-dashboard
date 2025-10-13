'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import the useRouter hook

// --- Interfaces ---
interface Provider {
  _id: string;
  name: string;
}

interface Row {
  id: string;
  name: string;
  type: string;
  handle: string;
}

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

// Props for the main component
interface PromotionProps {
  name: string;
  service: string;
  createdBy: string;
  onCancel: () => void; // Callback to close the component
}

// --- Notification Component ---
const NotificationPopup: React.FC<{
  notification: Notification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  if (!notification.show) return null;

  const baseClasses =
    'fixed top-5 right-5 w-auto max-w-sm p-4 rounded-lg shadow-lg text-white flex items-center justify-between z-50';
  const typeClasses =
    notification.type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <span>{notification.message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:opacity-80">
        <X size={20} />
      </button>
    </div>
  );
};

// --- Main Component ---
const Promotion: React.FC<PromotionProps> = ({
  name,
  service,
  createdBy,
  onCancel, // Destructure props
}) => {
  // --- State ---
  const [rows, setRows] = useState<Row[]>([]);
  const [percentages, setPercentages] = useState<string[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [notification, setNotification] = useState<Notification>({
    show: false,
    message: '',
    type: 'success',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Initialize the router

  // --- Effects ---
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/provider`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${await res.text()}`);
        }

        const responseJson = await res.json();
        const providers: Provider[] = responseJson.data || [];

        const mapped = providers.map(p => ({
          id: p._id,
          name: p.name,
          handle: `@${p.name.replace(/\s+/g, '').toLowerCase()}`,
          type: 'percentage', // Default markup type
        }));

        setRows(mapped);
        setPercentages(new Array(mapped.length).fill(''));
        setSelected(new Array(mapped.length).fill(false));
      } catch (err) {
        console.error('Failed to load providers:', err);
        showNotification('Failed to load providers.', 'error');
      }
    })();
  }, []);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // --- Handlers ---
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
  };

  const onCheckbox = (index: number) => {
    setSelected(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const onPctChange = (i: number, v: string) => {
    const num = v.replace(/[^0-9.]/g, '');
    setPercentages(p => p.map((old, idx) => (idx === i ? num : old)));
  };

  const onBlurPct = (i: number) => {
    setPercentages(p =>
      p.map((old, idx) =>
        idx === i && old && !old.endsWith('%') ? `${parseFloat(old)}%` : old
      )
    );
  };

  const handleSave = async () => {
    setIsLoading(true);

    if (!createdBy) {
      showNotification('Error: Creator ID is missing.', 'error');
      setIsLoading(false);
      return;
    }

    const markupsToSubmit = rows
      .map((row, i) => {
        if (!selected[i] || !percentages[i]) return null;

        const value = parseFloat(percentages[i].replace('%', ''));
        if (isNaN(value)) return null;

        return {
          provider: row.id,
          type: row.type,
          value,
        };
      })
      .filter(Boolean) as { provider: string; type: string; value: number }[];

    if (!markupsToSubmit.length) {
      showNotification(
        'Please select a provider and set a valid markup value.',
        'error'
      );
      setIsLoading(false);
      return;
    }

    const payload = {
      name, // from props
      service, // from props
      createdBy, // from props
      markups: markupsToSubmit,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/markup/create-plan`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.text();
        console.error('API Error:', errorData);
        throw new Error(`Failed to save plan: ${errorData}`);
      }

      showNotification('Plan saved successfully!', 'success');

      // --- 🚀 ADDED: Automatic navigation after success ---
      // Wait for the notification to be visible, then navigate.
      setTimeout(() => {
        router.push('/wholesaler?page=Markup&tab=PlanList');
      }, 1500); // 1.5-second delay
      
    } catch (err) {
      console.error('Save error:', err);
      showNotification(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
        'error'
      );
      // Keep loading false if there is an error, to allow another attempt.
      setIsLoading(false);
    }
    // We remove setIsLoading(false) from the 'finally' block in the success case
    // because the page will navigate away, so resetting the state isn't necessary.
    // It remains in the error catch block.
  };

  return (
    <>
      <NotificationPopup
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-xl">
          {/* Header */}
          <div className="bg-blue-100 px-4 sm:px-6 md:px-8 py-5 rounded-t-2xl border-b border-blue-300">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-blue-800">
              Manage Promotion: {name}
            </h2>
          </div>

          {/* Column Labels */}
          <div className="hidden md:grid grid-cols-2 px-4 sm:px-6 md:px-8 py-4 bg-gray-50 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-700">Provider</div>
            <div className="text-sm font-semibold text-gray-700">Markup %</div>
          </div>

          {/* Provider Rows */}
          <div className="divide-y divide-gray-100">
            {rows.map((row, idx) => (
              <div
                key={row.id}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 sm:px-6 md:px-8 py-5 items-center hover:bg-gray-50 transition"
              >
                {/* Left: checkbox + info */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected[idx]}
                    onChange={() => onCheckbox(idx)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600 text-white flex items-center justify-center rounded-full font-bold">
                      {row.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        {row.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {row.handle}
                      </p>
                    </div>
                  </div>
                </label>

                {/* Right: percentage input */}
                <div className="flex items-center justify-start md:justify-end gap-2">
                  <input
                    type="text"
                    value={percentages[idx]}
                    onChange={e => onPctChange(idx, e.target.value)}
                    onBlur={() => onBlurPct(idx)}
                    placeholder="e.g. 20%"
                    disabled={!selected[idx] || isLoading}
                    className={`w-24 sm:w-28 px-3 py-2 text-right border rounded-md shadow-sm focus:outline-none ${
                      selected[idx]
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-400'
                        : 'bg-gray-100 cursor-not-allowed text-gray-400'
                    }`}
                  />
                  <button className="p-2 hover:bg-gray-100 rounded-full transition hidden sm:block">
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-end px-4 sm:px-6 md:px-8 py-5 bg-gray-50/70 border-t border-gray-200 rounded-b-2xl gap-3">
            <button
              onClick={onCancel} // Use the onCancel prop instead of router
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm disabled:opacity-50 disabled:bg-blue-400"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Promotion;