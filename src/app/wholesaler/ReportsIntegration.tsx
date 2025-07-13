'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Search,
  Eye,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users
} from 'lucide-react';

// Import report components
import OutstandingReport from './OutstandingReport';
import LedgerReport from './LedgerReport';
import StatementOfAccount from './StatementOfAccount';
import PaymentReport from './PaymentReport';
import AdvancedAnalytics from './AdvancedAnalytics';
import ReportsDashboard from './ReportsDashboard';

// Import data services
import { 
  getOutstandingReportData, 
  getLedgerReportData, 
  getPaymentReportData,
  mockBookingsData 
} from './reportDataService';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  component: React.ComponentType<any>;
  metrics: {
    primary: string | number;
    secondary: string | number;
    trend: 'up' | 'down' | 'stable';
    trendValue: string;
  };
}

const ReportsIntegration: React.FC = () => {
  const [activeReport, setActiveReport] = useState<string>('dashboard');
  const [reportMetrics, setReportMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Calculate real-time metrics
  useEffect(() => {
    const calculateMetrics = () => {
      const outstandingData = getOutstandingReportData();
      const ledgerData = getLedgerReportData();
      const paymentData = getPaymentReportData();

      const totalOutstanding = outstandingData.reduce((sum, item) => sum + item.amount, 0);
      const overdueCount = outstandingData.filter(item => item.status === 'overdue').length;
      
      const totalCredits = ledgerData.reduce((sum, txn) => sum + txn.credit, 0);
      const totalDebits = ledgerData.reduce((sum, txn) => sum + txn.debit, 0);
      const netBalance = totalCredits - totalDebits;

      const completedPayments = paymentData.filter(p => p.paymentStatus === 'completed').length;
      const totalPayments = paymentData.length;
      const paymentSuccessRate = totalPayments > 0 ? (completedPayments / totalPayments * 100) : 0;

      const activeAgencies = new Set(mockBookingsData.map(b => b.agencyId)).size;

      setReportMetrics({
        outstanding: {
          total: totalOutstanding,
          count: outstandingData.length,
          overdue: overdueCount
        },
        ledger: {
          netBalance,
          totalCredits,
          totalDebits,
          transactions: ledgerData.length
        },
        payments: {
          successRate: paymentSuccessRate,
          completed: completedPayments,
          total: totalPayments
        },
        agencies: {
          active: activeAgencies,
          total: activeAgencies
        }
      });

      setLoading(false);
      setLastUpdated(new Date());
    };

    calculateMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(calculateMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const reportCards: ReportCard[] = [
    {
      id: 'outstanding',
      title: 'Outstanding Report',
      description: 'Track unpaid bookings and overdue amounts',
      icon: DollarSign,
      color: 'blue',
      component: OutstandingReport,
      metrics: {
        primary: `$${reportMetrics.outstanding?.total?.toLocaleString() || '0'}`,
        secondary: `${reportMetrics.outstanding?.count || 0} items`,
        trend: reportMetrics.outstanding?.overdue > 0 ? 'down' : 'stable',
        trendValue: `${reportMetrics.outstanding?.overdue || 0} overdue`
      }
    },
    {
      id: 'ledger',
      title: 'Ledger Report',
      description: 'Complete transaction history and balances',
      icon: FileText,
      color: 'purple',
      component: LedgerReport,
      metrics: {
        primary: `$${Math.abs(reportMetrics.ledger?.netBalance || 0).toLocaleString()}`,
        secondary: `${reportMetrics.ledger?.transactions || 0} transactions`,
        trend: (reportMetrics.ledger?.netBalance || 0) >= 0 ? 'up' : 'down',
        trendValue: (reportMetrics.ledger?.netBalance || 0) >= 0 ? 'Positive' : 'Negative'
      }
    },
    {
      id: 'statements',
      title: 'Statement of Account',
      description: 'Agency account statements and summaries',
      icon: TrendingUp,
      color: 'green',
      component: StatementOfAccount,
      metrics: {
        primary: `${reportMetrics.agencies?.active || 0}`,
        secondary: 'Active agencies',
        trend: 'stable',
        trendValue: 'All active'
      }
    },
    {
      id: 'payments',
      title: 'Payment Report',
      description: 'Payment status and transaction analytics',
      icon: CheckCircle,
      color: 'indigo',
      component: PaymentReport,
      metrics: {
        primary: `${Math.round(reportMetrics.payments?.successRate || 0)}%`,
        secondary: 'Success rate',
        trend: (reportMetrics.payments?.successRate || 0) > 90 ? 'up' : 'stable',
        trendValue: `${reportMetrics.payments?.completed || 0}/${reportMetrics.payments?.total || 0}`
      }
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Business insights and performance metrics',
      icon: BarChart3,
      color: 'emerald',
      component: AdvancedAnalytics,
      metrics: {
        primary: '+12.5%',
        secondary: 'Revenue growth',
        trend: 'up',
        trendValue: 'This month'
      }
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
      purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
      green: 'bg-green-100 text-green-600 dark:bg-green-900/30',
      indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30',
      emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const refreshData = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setLastUpdated(new Date());
      setLoading(false);
    }, 1000);
  };

  if (activeReport !== 'dashboard') {
    const activeCard = reportCards.find(card => card.id === activeReport);
    if (activeCard) {
      const Component = activeCard.component;
      return (
        <div className="h-full flex flex-col">
          {/* Header with back button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveReport('dashboard')}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{activeCard.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">{activeCard.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          
          {/* Report component */}
          <div className="flex-1 overflow-auto">
            <Component />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive financial and operational reporting dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Outstanding</p>
              <p className="text-2xl font-bold">${reportMetrics.outstanding?.total?.toLocaleString() || '0'}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
          <div className="mt-4 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span className="text-sm">{reportMetrics.outstanding?.overdue || 0} overdue items</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Net Balance</p>
              <p className="text-2xl font-bold">
                ${Math.abs(reportMetrics.ledger?.netBalance || 0).toLocaleString()}
              </p>
            </div>
            <FileText className="w-8 h-8 text-purple-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">{reportMetrics.ledger?.transactions || 0} transactions</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Agencies</p>
              <p className="text-2xl font-bold">{reportMetrics.agencies?.active || 0}</p>
            </div>
            <Users className="w-8 h-8 text-green-200" />
          </div>
          <div className="mt-4 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">All agencies active</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Payment Success</p>
              <p className="text-2xl font-bold">{Math.round(reportMetrics.payments?.successRate || 0)}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-indigo-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">{reportMetrics.payments?.completed || 0} completed</span>
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {reportCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => setActiveReport(card.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {card.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {card.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {card.metrics.primary}
                  </span>
                  <div className={`flex items-center text-sm ${
                    card.metrics.trend === 'up' ? 'text-green-600' :
                    card.metrics.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {card.metrics.trendValue}
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {card.metrics.secondary}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Dashboard Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Dashboard</h2>
          <button
            onClick={() => setActiveReport('dashboard-full')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            View Full Dashboard →
          </button>
        </div>
        
        <ReportsDashboard onSelectReport={setActiveReport} />
      </div>
    </div>
  );
};

export default ReportsIntegration; 