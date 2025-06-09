'use client';
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const donutData: ChartData<'doughnut'> = {
  labels: [
    'KFC',
    'FIAT-Chrysler LLC',
    'KLM',
    'Aeroflot',
    'Lukoil',
    'American Express',
    'Daimler',
  ],
  datasets: [
    {
      data: [12, 9, 7, 5, 4, 6, 10],
      backgroundColor: [
        '#EF4444',
        '#F59E0B',
        '#C026D3',
        '#14B8A6',
        '#3B82F6',
        '#8B5CF6',
        '#10B981',
      ],
      borderColor: '#FFFFFF',
      borderWidth: 2,
      hoverOffset: 4,
    },
  ],
};

const donutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 8,
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
  },
};

export default function DonutChart() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-80 sm:h-[360px] flex flex-col w-full">
      <h4 className="text-lg font-semibold mb-1 dark:text-gray-100">Statistics</h4>
      <div className="flex-1 flex items-center justify-center relative">
        {/* mobile: larger donut, PC stays at sm:h-80 sm:w-80 */}
        <div className="h-64 w-64 sm:h-80 sm:w-80 relative">
          <Doughnut data={donutData} options={donutOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-20">
            <span className="text-sm text-gray-500 dark:text-gray-400">Projects by</span>
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
              account
            </span>
          </div>
        </div>
        <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white dark:bg-gray-700 shadow">
          <ChevronsLeft className="w-5 h-5 text-gray-400 dark:text-gray-300" />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white dark:bg-gray-700 shadow">
          <ChevronsRight className="w-5 h-5 text-gray-400 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
}
