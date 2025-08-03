// AgencyStatsChart.tsx
'use client';
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- Type Definition for Props ---
interface AgencyStatsChartProps {
  data: {
    confirmedBookingsCount: number;
    approvedAgenciesCount: number;
    newAgenciesCount: number;
  } | null;
}

export default function AgencyStatsChart({ data }: AgencyStatsChartProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <BarChart3 className="w-8 h-8 mr-2" />
        No data available to display chart.
      </div>
    );
  }

  const chartData: ChartData<'bar'> = {
    labels: ['Confirmed Bookings', 'Approved Agencies', 'New Agencies'],
    datasets: [
      {
        label: 'Count',
        data: [
          data.confirmedBookingsCount,
          data.approvedAgenciesCount,
          data.newAgenciesCount,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',  // Blue
          'rgba(139, 92, 246, 0.7)', // Purple
          'rgba(236, 72, 153, 0.7)', // Pink
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 1,
        borderRadius: 8,
        barPercentage: 0.6,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend as labels are clear
      },
      title: {
        display: false, // Main title is handled outside the canvas
      },
      tooltip: {
        backgroundColor: '#1F2937', // Dark background for tooltip
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 6,
        displayColors: false, // Hide color box in tooltip
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide vertical grid lines
        },
        ticks: {
          color: '#6B7280', // Gray color for x-axis labels
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#E5E7EB', // Lighter grid lines
        },
        ticks: {
          color: '#6B7280', // Gray color for y-axis labels
          // Ensure ticks are integers for counts
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="h-64 sm:h-[360px] flex flex-col">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Agency & Booking Stats</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">A quick look at key operational counts.</p>
      <div className="flex-1 relative">
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}