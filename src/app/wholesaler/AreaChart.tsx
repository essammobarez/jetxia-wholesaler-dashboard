'use client';
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChevronsLeft, ChevronsRight, Circle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const areaData: ChartData<'line'> = {
  labels: ['2016', '2017', '2018', '2019'],
  datasets: [
    {
      label: 'Paris',
      data: [40, 200, 200, 350],
      fill: true,
      backgroundColor: '#997df0',
      borderColor: '#ffffff',
      borderWidth: 2,
      tension: 0.8,
      stack: 'combined',
    },
    {
      label: 'Bangkok',
      data: [140, 100, 120, 120],
      fill: true,
      backgroundColor: '#4daea3',
      borderColor: '#ffffff',
      borderWidth: 2,
      tension: 0.8,
      stack: 'combined',
    },
    {
      label: 'San Francisco',
      data: [20, 230, 230, 237, 400],
      fill: true,
      backgroundColor: '#f4a26c',
      borderColor: '#ffffff',
      borderWidth: 2,
      tension: 0.8,
      stack: 'combined',
    },
  ],
};

const areaOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      stacked: true,
      ticks: { color: '#6B7280' },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grid: {
        // @ts-ignore: allow custom dash pattern
        borderDash: [4, 4],
      },
      ticks: { color: '#6B7280' },
    },
  },
};

export default function AreaChart() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-64 sm:h-[360px] flex flex-col">
      <h4 className="text-lg font-semibold mb-1 dark:text-gray-100">Company Facts</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Employees</p>
      <div className="flex-1 relative">
        <Line data={areaData} options={areaOptions} />
        <button className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white dark:bg-gray-700 shadow">
          <ChevronsLeft className="w-5 h-5 text-gray-400 dark:text-gray-300" />
        </button>
        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white dark:bg-gray-700 shadow">
          <ChevronsRight className="w-5 h-5 text-gray-400 dark:text-gray-300" />
        </button>
      </div>
      <div className="mt-4">
        <div className="flex justify-center space-x-6 mb-2">
          {[
            { label: 'Paris', color: '#f4a26c' },
            { label: 'Bangkok', color: '#4daea3' },
            { label: 'San Francisco', color: '#997df0' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-2">
          <Circle className="w-2 h-2 text-gray-400 dark:text-gray-600" />
          <Circle className="w-2 h-2 text-gray-400 dark:text-gray-600" />
          <Circle className="w-2 h-2 text-gray-400 dark:text-gray-600" />
        </div>
      </div>
    </div>
  );
}
