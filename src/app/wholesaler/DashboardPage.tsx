// DashboardPage.tsx
'use client';
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AreaChart from './AreaChart';
import DonutChart from './DonutChart';

interface Stat {
  label: string;
  value: string;
  pct: string;
  bg: string;
}

const stats: Stat[] = [
  { label: 'Views', value: '7,265', pct: '+11.01%', bg: 'bg-purple-50 dark:bg-purple-900' },
  { label: 'Visits', value: '3,671', pct: '-0.03%', bg: 'bg-blue-50 dark:bg-blue-900' },
  { label: 'New Users', value: '156', pct: '+15.03%', bg: 'bg-pink-50 dark:bg-pink-900' },
  { label: 'Active Users', value: '2,318', pct: '+6.08%', bg: 'bg-cyan-50 dark:bg-cyan-900' },
];

export default function DashboardPage() {
  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map(({ label, value, pct, bg }) => {
          const isUp = pct.startsWith('+');
          return (
            <div key={label} className={`${bg} rounded-2xl p-6 h-28 flex flex-col justify-between`}>
              <span className="text-gray-500 dark:text-gray-400">{label}</span>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold dark:text-gray-100">{value}</h3>
                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                  {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{pct}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AreaChart />
        <DonutChart />
      </div>

      {/* Placeholder panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {['There are no risks assigned.', 'There are no action items assigned.'].map(msg => (
          <div key={msg} className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-48 flex flex-col">
            <h4 className="text-lg font-semibold mb-2 dark:text-gray-100">Element Name</h4>
            <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">{msg}</div>
          </div>
        ))}
      </div>
    </>
  );
}
