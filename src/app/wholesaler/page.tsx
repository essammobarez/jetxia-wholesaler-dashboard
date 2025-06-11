'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronDown,
  Search,
  Bell,
  LayoutGrid,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';

// Page imports (add the new submenu components here)
import DashboardPage from './DashboardPage';
import OverviewTab from './OverviewTab';
import HistoryTab from './HistoryTab';
import CompanyDetailsTab from './CompanyDetailsTab';
import ManualReservationsTab from './ManualReservationsTab';
import ManageAgentPage from './registration';
import CreateAgent from './agency-panel';
import ManageRequestPage from './admin-approve';
import Metrics from './Metrics';
import Payment from './Payment';

// New imports for Markup submenu
import CreateMarkup from './CreateMarkup';
import AssignMarkup from './AssignMarkup';
import MarkupAgencyList from './MarkupAgencyList';
import PlanList from './PlanList';

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
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userName, setUserName] = useState<string>('Guest');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string>('Dashboard');
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Decode JWT from URL to extract name & wholesalerId, store token
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);

        console.log('Decoded JWT payload:', payload);

        if (payload.name) {
          setUserName(payload.name);
        }
        if (payload.wholesalerId) {
          localStorage.setItem('wholesalerId', payload.wholesalerId);
        }
        // Store the token itself for API calls
        localStorage.setItem('authToken', token);
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
  }, [searchParams]);

  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleMenuClick = (item: string) => {
    if (activePage === item) {
      // If clicking the same main menu, collapse submenu
      setExpandedMenu(prev => (prev === item ? null : item));
      // Reset activeTab when toggling submenu
      setActiveTab(null);
    } else {
      setActivePage(item);
      setExpandedMenu(item);
      setActiveTab(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('wholesalerId');
    router.push('/');
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
        {/* Profile Header */}
        <div
          className="relative p-4 flex items-center space-x-3 cursor-pointer"
          onClick={() => setShowProfileMenu(p => !p)}
        >
          <img
            src="/images/profile.png"
            className="w-8 h-8 rounded-full"
            alt="Profile"
          />
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {userName}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          {showProfileMenu && (
            <div className="absolute top-full left-4 mt-2 w-40 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-2 space-y-1">
          {menuItems.map(item => (
            <div key={item}>
              <button
                onClick={() => handleMenuClick(item)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  ${activePage === item
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-300'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <LayoutGrid className="w-5 h-5" />
                  <span>{item}</span>
                </div>
                {['Booking', 'Customers', 'Markup'].includes(item) && (
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
                      onClick={() => {
                        setActivePage('Booking');
                        setActiveTab(tab);
                      }}
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
                      onClick={() => {
                        setActivePage('Customers');
                        setActiveTab(tab);
                      }}
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

              {/* Markup sub-menu */}
              {expandedMenu === 'Markup' && item === 'Markup' && (
                <div className="pl-8 space-y-1">
                  {['CreateMarkup', 'AssignMarkup', 'MarkupAgencyList', 'PlanList'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActivePage('Markup');
                        setActiveTab(tab);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>
                        {tab === 'CreateMarkup' && 'Create Markup'}
                        {tab === 'AssignMarkup' && 'Assign Markup'}
                        {tab === 'MarkupAgencyList' && 'Markup Agency List'}
                        {tab === 'PlanList' && 'Plan List'}
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
              {!activeTab && (
                <p className="text-gray-500 dark:text-gray-400">Select a Booking submenu above.</p>
              )}
            </>
          )}

          {activePage === 'Customers' && (
            <>
              {activeTab === 'CreateAgent' && <ManageAgentPage />}
              {activeTab === 'ManageAgent' && <CreateAgent />}
              {activeTab === 'ManageRequest' && <ManageRequestPage />}
              {!activeTab && (
                <p className="text-gray-500 dark:text-gray-400">Select a Customers submenu above.</p>
              )}
            </>
          )}

          {activePage === 'Markup' && (
            <>
              {activeTab === 'CreateMarkup' && <CreateMarkup />}
              {activeTab === 'AssignMarkup' && <AssignMarkup />}
              {activeTab === 'MarkupAgencyList' && <MarkupAgencyList />}
              {activeTab === 'PlanList' && <PlanList />}
              {!activeTab && (
                <p className="text-gray-500 dark:text-gray-400">Select a Markup submenu above.</p>
              )}
            </>
          )}

          {activePage === 'Metrics' && <Metrics />}
          {activePage === 'Payment' && <Payment />}

          {['Messages', 'Masters', 'Tools', 'Visa', 'Settings'].includes(activePage) && (
            <p className="text-gray-500 dark:text-gray-400">{activePage} page coming soon…</p>
          )}
        </main>
      </div>
    </div>
  );
}
