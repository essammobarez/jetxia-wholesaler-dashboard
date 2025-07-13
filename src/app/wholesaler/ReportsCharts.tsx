'use client';

import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface SimpleBarChartProps {
  data: ChartData[];
  title: string;
  height?: string;
  currency?: boolean;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  data, 
  title, 
  height = 'h-64',
  currency = false 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${height}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="flex items-end justify-between space-x-2 h-48">
        {data.map((item, index) => {
          const heightPercent = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center mb-2">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 hover:opacity-80 ${
                    item.color || 'bg-blue-500'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                  title={`${currency ? '$' : ''}${item.value.toLocaleString()}`}
                />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                {item.label}
              </div>
              <div className="text-xs font-medium text-gray-900 dark:text-white">
                {currency ? '$' : ''}{item.value.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface SimpleDonutChartProps {
  data: ChartData[];
  title: string;
  centerText?: string;
}

export const SimpleDonutChart: React.FC<SimpleDonutChartProps> = ({ 
  data, 
  title, 
  centerText 
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const createPath = (value: number) => {
    const percentage = (value / total) * 100;
    const angle = (percentage / 100) * 360;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const x1 = 50 + 35 * Math.cos(startAngleRad);
    const y1 = 50 + 35 * Math.sin(startAngleRad);
    const x2 = 50 + 35 * Math.cos(endAngleRad);
    const y2 = 50 + 35 * Math.sin(endAngleRad);

    return `M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <PieChart className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 100 100" className="transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="10"
            />
            {data.map((item, index) => (
              <path
                key={index}
                d={createPath(item.value)}
                fill={item.color || `hsl(${index * 137.5}, 70%, 50%)`}
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </svg>
          {centerText && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {centerText}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || `hsl(${index * 137.5}, 70%, 50%)` }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface TrendCardProps {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  icon: React.ComponentType<any>;
  color: string;
}

export const TrendCard: React.FC<TrendCardProps> = ({
  title,
  value,
  trend,
  trendValue,
  icon: Icon,
  color
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'down':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </p>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1">{trendValue}</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

interface ProgressRingProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  label: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size,
  strokeWidth,
  color,
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {percentage}%
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
        {label}
      </p>
    </div>
  );
};

// Sample data generators for testing
export const generateSampleBarData = (): ChartData[] => [
  { label: 'Hotel', value: 45200, color: 'bg-blue-500' },
  { label: 'Flight', value: 32100, color: 'bg-purple-500' },
  { label: 'Package', value: 28900, color: 'bg-green-500' },
  { label: 'Transfer', value: 15400, color: 'bg-orange-500' }
];

export const generateSampleDonutData = (): ChartData[] => [
  { label: 'Completed', value: 156, color: '#10b981' },
  { label: 'Pending', value: 67, color: '#f59e0b' },
  { label: 'Failed', value: 24, color: '#ef4444' },
  { label: 'Cancelled', value: 12, color: '#6b7280' }
]; 