// app/promotion/PromotionClient.tsx
'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

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

const ManagePromotionValue: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [rows, setRows] = useState<Row[]>([]);
  const [percentages, setPercentages] = useState<string[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);

  // Promotion metadata from query
  const name = searchParams.get('name') || 'Plan A';
  const type = searchParams.get('type') || 'markup';
  const service = searchParams.get('service') || 'Hotel';

  // Fetch providers on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.API_URL}provider`);
if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const { data: providers }: { data: Provider[] } = await res.json();
        const mapped = providers.map(p => ({
          id: p._id,
          name: p.name,
          handle: `@${p.name.replace(/\s+/g, '').toLowerCase()}`,
          type: 'additive',
        }));
        setRows(mapped);
        setPercentages(mapped.map(() => ''));
        setSelected(mapped.map(() => false));
      } catch (err) {
        console.error('Failed to load providers:', err);
      }
    })();
  }, []);

  // Handlers
  const onCheckbox = (index: number) => {
    setSelected(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const onPctChange = (i: number, v: string) => {
    const num = v.replace(/%/g, '');
    setPercentages(p => p.map((old, idx) => (idx === i ? num : old)));
  };

  const onBlurPct = (i: number) => {
    setPercentages(p =>
      p.map((old, idx) =>
        idx === i && old && !old.endsWith('%') ? `${old}%` : old
      )
    );
  };

  const handleSave = async () => {
    // Build entries only for selected with a value
    const entries = rows
      .map((r, i) => {
        if (!selected[i] || !percentages[i]) return null;
        const raw = percentages[i].endsWith('%')
          ? percentages[i]
          : `${percentages[i]}%`;
        return {
          providerId: r.id,
          numeric: parseFloat(raw.replace('%', '')),
        };
      })
      .filter(Boolean) as { providerId: string; numeric: number }[];

    if (!entries.length) {
      alert('Select at least one provider and enter a percentage.');
      return;
    }

    // Payload
    const payload = {
      agency: '680e35505e268207d5076965',
      name,
      type,
      service,
      providers: entries.map(e => e.providerId),
      markups: entries.map(e => ({
        provider: e.providerId,
        value: e.numeric,
      })),
    };

    try {
      const res = await fetch(
        'http://185.8.154.152:5000/api/v1/markup/add-plan',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        console.error('API error:', await res.text());
        alert('Failed to save. Try again.');
        return;
      }
      router.push('/markup');
    } catch (err) {
      console.error('Save error:', err);
      alert('Unexpected error. Try again.');
    }
  };

  return (
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
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected[idx]}
                  onChange={() => onCheckbox(idx)}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600 text-white flex items-center justify-center rounded-full">
                    {row.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">{row.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{row.handle}</p>
                  </div>
                </div>
              </label>

              {/* Right: percentage input */}
              <div className="flex items-center justify-between md:justify-end gap-2">
                <input
                  type="text"
                  value={percentages[idx]}
                  onChange={e => onPctChange(idx, e.target.value)}
                  onBlur={() => onBlurPct(idx)}
                  placeholder="e.g. 20%"
                  disabled={!selected[idx]}
                  className={`w-20 sm:w-24 px-3 py-2 text-right border rounded shadow-sm focus:outline-none ${
                    selected[idx]
                      ? 'border-gray-300 focus:ring focus:border-blue-400'
                      : 'bg-gray-100 cursor-not-allowed'
                  }`}
                />
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end px-4 sm:px-6 md:px-8 py-5 bg-gray-50 border-t border-gray-200 gap-3">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagePromotionValue;
