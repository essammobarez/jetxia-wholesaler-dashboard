'use client';

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
  Brush,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Metrics() {
  const darkMode = document.documentElement.classList.contains('dark');

  const revenueData = [
    { month: 'Jan', revenue: 4000, target: 4500 },
    { month: 'Feb', revenue: 3500, target: 4200 },
    { month: 'Mar', revenue: 5000, target: 4800 },
    { month: 'Apr', revenue: 4500, target: 5000 },
    { month: 'May', revenue: 6000, target: 5500 },
    { month: 'Jun', revenue: 5500, target: 6000 },
    { month: 'Jul', revenue: 6500, target: 6200 },
    { month: 'Aug', revenue: 7000, target: 6800 },
    { month: 'Sep', revenue: 6200, target: 6500 },
    { month: 'Oct', revenue: 5800, target: 6000 },
    { month: 'Nov', revenue: 6300, target: 6200 },
    { month: 'Dec', revenue: 7200, target: 7000 },
  ].reduce<{ month: string; revenue: number; target: number; cumulative: number }[]>((acc, cur) => {
    const prev = acc.length ? acc[acc.length - 1].cumulative : 0;
    acc.push({ ...cur, cumulative: prev + cur.revenue });
    return acc;
  }, []);

  const conversionData = [
    { name: 'Direct Bookings', value: 45, color: '#3b82f6' },
    { name: 'Agent Bookings', value: 30, color: '#8b5cf6' },
    { name: 'Online Platform', value: 15, color: '#06b6d4' },
    { name: 'Other Sources', value: 10, color: '#10b981' },
  ];

  const kpiData = [
    {
      title: 'Total Revenue',
      value: '$124,580',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'gradient-success',
      description: 'Monthly revenue growth'
    },
    {
      title: 'Active Customers',
      value: '2,847',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      gradient: 'gradient-blue',
      description: 'Engaged customer base'
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: '-0.3%',
      trend: 'down',
      icon: Target,
      gradient: 'gradient-purple',
      description: 'Visitor to customer ratio'
    },
    {
      title: 'Avg. Order Value',
      value: '$186',
      change: '+15.7%',
      trend: 'up',
      icon: Activity,
      gradient: 'gradient-pink',
      description: 'Average transaction amount'
    },
  ];

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
            {/* Background Pattern */}
            <div className={`absolute top-0 right-0 w-20 h-20 ${gradient} opacity-10 rounded-full -mr-6 -mt-6`}></div>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${gradient} bg-opacity-20 rounded-xl`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{change}</span>
              </div>
            </div>
            
            {/* Content */}
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
        <div className="lg:col-span-2 card-modern p-6 animate-slide-right">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <BarChart2 className="mr-3 text-blue-600" />
                Revenue Analytics
      </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Monthly performance vs targets</p>
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
                <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
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
            tickFormatter={(v) => `$${v / 1000}k`}
          />
          <Tooltip
                contentStyle={{ 
                  background: darkMode ? '#1f2937' : '#ffffff', 
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: darkMode ? '#f3f4f6' : '#111827', fontWeight: 'bold' }}
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
                name="Actual Revenue" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar 
                dataKey="target" 
                fill="url(#targetGradient)" 
                name="Target Revenue" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                opacity={0.7}
              />
          <Line
            type="monotone"
            dataKey="cumulative"
                stroke="#f59e0b"
            strokeWidth={3}
                dot={{ r: 5, fill: '#f59e0b' }}
                activeDot={{ r: 7, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
            name="Cumulative"
          />
        </ComposedChart>
      </ResponsiveContainer>
        </div>

        {/* Conversion Pie Chart */}
        <div className="card-modern p-6 animate-slide-right" style={{ animationDelay: '0.2s' }}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Revenue Sources
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Distribution breakdown</p>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={conversionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {conversionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: darkMode ? '#1f2937' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-3 mt-4">
            {conversionData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Performance */}
        <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            System Performance
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Server Uptime', value: '99.9%', status: 'excellent', progress: 99.9 },
              { label: 'API Response Time', value: '125ms', status: 'excellent', progress: 95 },
              { label: 'Database Performance', value: '98.5%', status: 'good', progress: 98.5 },
              { label: 'Cache Hit Rate', value: '94.2%', status: 'good', progress: 94.2 },
            ].map(({ label, value, status, progress }, index) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                      status === 'excellent' ? 'bg-green-500' : 
                      status === 'good' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ 
                      width: `${progress}%`,
                      animationDelay: `${index * 0.2}s`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Growth Metrics
          </h3>
          <div className="space-y-6">
            {[
              { metric: 'Monthly Recurring Revenue', current: '$45,230', growth: '+18.5%', trend: 'up' },
              { metric: 'Customer Acquisition Cost', current: '$24', growth: '-12.3%', trend: 'down' },
              { metric: 'Customer Lifetime Value', current: '$1,250', growth: '+8.7%', trend: 'up' },
              { metric: 'Churn Rate', current: '2.1%', growth: '-0.8%', trend: 'down' },
            ].map(({ metric, current, growth, trend }) => (
              <div key={metric} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{current}</p>
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  (trend === 'up' && metric !== 'Churn Rate') || (trend === 'down' && metric === 'Churn Rate') || (trend === 'down' && metric === 'Customer Acquisition Cost')
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{growth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
