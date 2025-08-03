// FinancialOverviewChart.tsx
'use client';
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

// --- Type Definition for Props ---
interface ReportData {
  totalAmount: number;
  totalPaid: number;
  totalOutstanding: number;
  paymentPercentage: number;
  outstandingCount: number;
  settledCount: number;
}

interface FinancialOverviewChartProps {
  data: ReportData | null;
}

export default function FinancialOverviewChart({ data }: FinancialOverviewChartProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <TrendingUp className="w-8 h-8 mr-2" />
        No financial data to display.
      </div>
    );
  }

  const chartData: ChartData<'doughnut'> = {
    labels: ['Total Paid', 'Total Outstanding'],
    datasets: [
      {
        data: [data.totalPaid, data.totalOutstanding],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)', // Green for Paid
          'rgba(239, 68, 68, 0.7)',   // Red for Outstanding
        ],
        borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#6B7280',
          boxWidth: 12,
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 6,
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="h-64 sm:h-[360px] flex flex-col">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Financial Overview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Breakdown of paid vs. outstanding amounts.</p>
        <div className="flex-1 relative flex items-center justify-center">
            <div className="h-full w-full max-w-[280px] relative">
                <Doughnut options={chartOptions} data={chartData} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${data.totalAmount.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
}
