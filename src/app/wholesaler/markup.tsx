'use client';

import { BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Brush,
} from 'recharts';

export default function Metrics() {
  const darkMode = document.documentElement.classList.contains('dark');

  const revenueData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3500 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 5500 },
    { month: 'Jul', revenue: 6500 },
    { month: 'Aug', revenue: 7000 },
    { month: 'Sep', revenue: 6200 },
    { month: 'Oct', revenue: 5800 },
    { month: 'Nov', revenue: 6300 },
    { month: 'Dec', revenue: 7200 },
  ].reduce<{ month: string; revenue: number; cumulative: number }[]>((acc, cur) => {
    const prev = acc.length ? acc[acc.length - 1].cumulative : 0;
    acc.push({ ...cur, cumulative: prev + cur.revenue });
    return acc;
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition">
      <h2 className="flex items-center text-2xl font-semibold text-blue-600 mb-4">
        <BarChart2 className="mr-2" /> Monthly Revenue &amp; Cumulative
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={revenueData} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2d3748' : '#e5e7eb'} />
          <XAxis dataKey="month" stroke={darkMode ? '#edf2f7' : '#4b5563'} />
          <YAxis
            yAxisId="left"
            stroke={darkMode ? '#edf2f7' : '#4b5563'}
            tickFormatter={(v) => `$${v / 1000}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={darkMode ? '#edf2f7' : '#4b5563'}
            tickFormatter={(v) => `$${v / 1000}k`}
          />
          <Tooltip
            contentStyle={{ background: darkMode ? '#2d3748' : '#fff', borderRadius: 8 }}
            labelStyle={{ color: darkMode ? '#edf2f7' : '#111827' }}
            itemStyle={{ color: darkMode ? '#edf2f7' : '#111827' }}
          />
          <Legend verticalAlign="top" wrapperStyle={{ color: darkMode ? '#edf2f7' : '#111827' }} />
          <Bar yAxisId="left" dataKey="revenue" fill="url(#barGrad)" name="Monthly" radius={[6, 6, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            stroke="url(#lineGrad)"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Cumulative"
          />
          <Brush dataKey="month" height={30} stroke="#8884d8" travellerWidth={10} tickFormatter={(m) => m.slice(0, 3)} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
