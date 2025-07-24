'use client';

import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, TrendingDown, DollarSign, Users, Activity, Target } from 'lucide-react';
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
} from 'recharts';

// Define interfaces for our data structures for type safety
interface KpiData {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  gradient: string;
  description: string;
}

interface RevenueData {
  month: string;
  revenue: number;
  // Target is not in the API, so we can make it optional or remove it
  // For this example, let's remove it to match the API data.
  cumulative: number;
}

export default function Metrics() {
  // State for dark mode detection
  const [darkMode, setDarkMode] = useState(false);
  
  // State for API data
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for dark mode on mount
    setDarkMode(document.documentElement.classList.contains('dark'));

    // Function to fetch data from APIs
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // --- Token Retrieval ---
        const token =
          document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1] ||
          localStorage.getItem("authToken");

        if (!token) {
          throw new Error("Authorization failed. Please log in again.");
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // --- API Calls ---
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''; // Fallback to empty string if not set
        const revenuePromise = fetch(`${baseUrl}/metrics/revenue`, { headers });
        const monthlyRevenuePromise = fetch(`${baseUrl}/metrics/revenue-by-month`, { headers });

        const [revenueRes, monthlyRevenueRes] = await Promise.all([revenuePromise, monthlyRevenuePromise]);

        if (!revenueRes.ok || !monthlyRevenueRes.ok) {
          throw new Error('Failed to fetch metrics data.');
        }

        const revenueJson = await revenueRes.json();
        const monthlyRevenueJson = await monthlyRevenueRes.json();

        // --- Process KPI Data ---
        const totalRevenue = revenueJson.data?.totalRevenue || 0;
        const avgOrderValue = revenueJson.data?.averageOrderValue || 0;

        const initialKpiData: KpiData[] = [
          {
            title: 'Total Revenue',
            value: `$${totalRevenue.toFixed(2)}`,
            change: '', // API doesn't provide change, so it's left empty
            trend: 'neutral',
            icon: DollarSign,
            gradient: 'gradient-success',
            description: 'Total revenue generated'
          },
          {
            title: 'Active Customers',
            value: 'No data',
            change: '',
            trend: 'neutral',
            icon: Users,
            gradient: 'gradient-blue',
            description: 'Data not available'
          },
          {
            title: 'Conversion Rate',
            value: 'No data',
            change: '',
            trend: 'neutral',
            icon: Target,
            gradient: 'gradient-purple',
            description: 'Data not available'
          },
          {
            title: 'Avg. Order Value',
            value: `$${avgOrderValue.toFixed(2)}`,
            change: '', // API doesn't provide change, so it's left empty
            trend: 'neutral',
            icon: Activity,
            gradient: 'gradient-pink',
            description: 'Average transaction amount'
          },
        ];
        setKpiData(initialKpiData);

        // --- Process Chart Data ---
        let cumulativeRevenue = 0;
        const formattedRevenueData = monthlyRevenueJson.data.map((item: { month: string; totalRevenue: number }) => {
          cumulativeRevenue += item.totalRevenue;
          return {
            month: item.month.substring(0, 3), // e.g., "January" -> "Jan"
            revenue: item.totalRevenue,
            cumulative: cumulativeRevenue
          };
        });
        setRevenueData(formattedRevenueData);

      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        // Set empty data on error to clear the view
        setKpiData([]);
        setRevenueData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount

  // Render a loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render an error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">An Error Occurred</h2>
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-scale">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">
            Business Metrics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Track your performance and growth with detailed analytics
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-gradient">
            <BarChart2 className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button className="btn-modern bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            Filter Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map(({ title, value, change, trend, icon: Icon, gradient, description }, index) => (
          <div 
            key={title}
            className="card-modern p-6 relative overflow-hidden animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 ${gradient} opacity-10 rounded-full -mr-6 -mt-6`}></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${gradient} bg-opacity-20 rounded-xl`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              {change && (
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{change}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-3 card-modern p-6 animate-slide-right">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <BarChart2 className="mr-3 text-blue-600" />
                Revenue Analytics
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Monthly performance overview</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-lg">Monthly</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg">Quarterly</button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={revenueData} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} opacity={0.5} />
              <XAxis 
                dataKey="month" 
                stroke={darkMode ? '#9ca3af' : '#6b7280'} 
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
                tickLine={false}
                tickFormatter={(v) => `$${v >= 1000 ? `${v / 1000}k` : v}`}
              />
              <Tooltip
                contentStyle={{ 
                  background: darkMode ? '#1f2937' : '#ffffff', 
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: darkMode ? '#f3f4f6' : '#111827', fontWeight: 'bold' }}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
                wrapperStyle={{ color: darkMode ? '#f3f4f6' : '#111827', paddingBottom: '20px' }} 
              />
              <Bar 
                dataKey="revenue" 
                fill="url(#revenueGradient)" 
                name="Monthly Revenue" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 5, fill: '#f59e0b' }}
                activeDot={{ r: 7, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
                name="Cumulative Revenue"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
