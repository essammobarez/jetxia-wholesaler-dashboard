'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Search,
  Bell,
  LayoutGrid,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';

// Page imports
import DashboardPage from './DashboardPage';
import OverviewTab from './OverviewTab';
import HistoryTab from './HistoryTab';
import CompanyDetailsTab from './CompanyDetailsTab';
import ManualReservationsTab from './ManualReservationsTab';
import ManageAgentPage from './registration';    
import CreateAgent from './agency-panel';                // ← existing import
import Markup from '../(markup)/markup/page';                    // ← existing import for Markup
import Payment from './Payment';                        // ← existing import for Payment
import Metrics from './Metrics';
import ManageRequestPage from './admin-approve';     // ← new import for Manage Request

const menuItems = [
  'Dashboard',
  'Booking',
  'Customers',
  'Markup',
  'Metrics',           
  'Payment',          
  'Messages',
  'Masters',
  'Tools',
  'Visa',
  'Settings',
];

export default function MainPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string>('Dashboard');
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleMenuClick = (item: string) => {
    setActivePage(item);
    setExpandedMenu(item === expandedMenu ? null : item);
    setActiveTab(null);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-opacity-10 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-200 ease-in-out z-50
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:translate-x-0 sm:static sm:block
        `}
      >
        <div className="p-4 flex items-center space-x-3">
          <img src="/images/profile.png" className="w-8 h-8 rounded-full" alt="Profile" />
          <span className="font-medium text-gray-700 dark:text-gray-200">Dominique Ch.</span>
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>
        <nav className="px-2 space-y-1">
          {menuItems.map(item => (
            <div key={item}>
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  ${activePage === item ? 'bg-gray-200 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <div className="flex items-center space-x-2">
                  <LayoutGrid className="w-5 h-5" />
                  <span>{item}</span>
                </div>
                {['Booking', 'Customers', 'Agent'].includes(item) && (
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      expandedMenu === item ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Booking sub-menu */}
              {expandedMenu === 'Booking' && item === 'Booking' && (
                <div className="pl-8 space-y-1">
                  {['Overview', 'History', 'Company', 'ManualReservations'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="w-full flex items-center space-x-2 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>
                        {tab === 'Overview' && 'Overview'}
                        {tab === 'History' && 'History'}
                        {tab === 'Company' && 'Company Details'}
                        {tab === 'ManualReservations' && 'Manual Reservations'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Customers sub-menu */}
              {expandedMenu === 'Customers' && item === 'Customers' && (
                <div className="pl-8 space-y-1">
                  {['CreateAgent', 'ManageAgent', 'ManageRequest'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="w-full flex items-center space-x-2 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>
                        {tab === 'CreateAgent' && 'Create Agency'}
                        {tab === 'ManageAgent' && 'Manage Agency'}
                        {tab === 'ManageRequest' && 'Manage Request'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4 sm:space-x-6 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="sm:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="relative text-gray-500 dark:text-gray-400 w-full sm:w-auto">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Quick search"
                className="
                  pl-10 pr-4 py-2 w-full sm:w-64
                  border border-gray-200 dark:border-gray-700
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200
                  dark:bg-gray-700 dark:text-gray-100
                "
              />
            </div>
            <button className="hidden sm:flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100">
              <LayoutGrid className="w-5 h-5" />
              <span>News letters</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="hidden sm:flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100">
              <LayoutGrid className="w-5 h-5" />
              <span>Release Tracker</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            <Bell className="w-6 h-6 text-red-500" />
          </div>
        </header>

        {/* Body */}
        <main className="p-4 sm:p-6 overflow-y-auto">
          {activePage === 'Dashboard' && <DashboardPage />}

          {activePage === 'Booking' && (
            <>
              {activeTab === 'Overview' && <OverviewTab />}
              {activeTab === 'History' && <HistoryTab />}
              {activeTab === 'Company' && <CompanyDetailsTab />}
              {activeTab === 'ManualReservations' && <ManualReservationsTab />}
            </>
          )}

          {activePage === 'Customers' && (
            <>
              {activeTab === 'CreateAgent' && <ManageAgentPage />}
              {activeTab === 'ManageAgent' && <CreateAgent />}
              {activeTab === 'ManageRequest' && <ManageRequestPage />}
            </>
          )}

          {activePage === 'Markup' && <Markup />}
          {activePage === 'Metrics' && <Metrics />}
          {activePage === 'Payment' && <Payment />}

          {['Messages', 'Accounts', 'Reports', 'Contracts', 'Masters', 'Tools', 'Visa', 'Settings'].includes(activePage) && (
            <p className="text-gray-500 dark:text-gray-400">{activePage} page coming soon…</p>
          )}
        </main>
      </div>
    </div>
  );
}
