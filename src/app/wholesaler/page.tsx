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

// Page imports
import DashboardPage from './DashboardPage';
import OverviewTab from './OverviewTab';
import HistoryTab from './HistoryTab';
import HistoryTabElite from './HistoryTabElite';
import CompanyDetailsTab from './CompanyDetailsTab';
import ManualReservationsTab from './ManualReservationsTab';
import ManageAgentPage from './registration';
import CreateAgent from './agency-panel';
import ManageRequestPage from './admin-approve';
import Metrics from './Metrics';
import Payment from './Payment';
import Permissions from './Permissions';
import Users from './Users';
import APIManagement from './APIManagement';
import MappedHotels from './MappedHotels';
// New imports for Markup submenu
import CreateMarkup from './CreateMarkup';
import AssignMarkup from './AssignMarkup';
import MarkupAgencyList from './MarkupAgencyList';
import PlanList from './PlanList';

// ✨ NEW: Import for Profile Settings
import ProfileSettingsPage from './ProfileSettingsPage';

// ✨ NEW: Import for Preferences Page
import PreferencesPage from './PreferencesPage';

// New imports for Supplier submenu
import CreateOfflineSupplier from './CreateOfflineSupplier';
import ManageSupplier from './ManageSupplier';
import SupportTicketsPage from './SupportTicketsPage';

// ✨ UPDATED: Imports for the new "Sales Person" sub-menus
import SalesPersonPage from './SalesPersonPage';
import AgencyListPage from './AgencyListPage';

// Existing sales-related imports for 'Customers' menu
import SalesAgencyPage from './salesAgency';
import GetSalesAgencyPage from './GetsalesAgency';

// New imports for Reports submenu
import OutstandingReport from './OutstandingReport';
import LedgerReport from './LedgerReport';
import StatementOfAccount from './StatementOfAccount';
import PaymentReport from './PaymentReport';
import ReportsDashboard from './ReportsDashboard';
import AdvancedAnalytics from './AdvancedAnalytics';
import AgencyOutstandingStatement from './AgencyOutstandingStatement';

// ✨ NEW: Import for Campaign Pages
import CreateCampaign from './CreateCampaign';

// This is the full list of all possible menu items
const allMenuItems = [
  'Dashboard',
  'Booking',
  'Customers',
  'Campaign', // ✨ NEW: Added Campaign menu
  'Markup',
  'Supplier',
  'Sales Person',
  'Metrics',
  // 'Payment',
  // 'History',
  // 'Messages',
  // 'Masters',
  "Support Tickets",
  // 'Tools',
  // 'Visa',
  // 'Settings',
  'Reports',
  // 'Analytics',
  'Users',
  'Permissions',
  // 'Notifications',
  // 'Integrations',
  'Mapped Hotels',
  'API Management',

  // 'Logs',
];

export default function WholesalerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userName, setUserName] = useState<string>('Guest');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string>('Dashboard');
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Added a loading state to prevent UI flash before auth check
  const [isLoading, setIsLoading] = useState(true);

  // State for user type and permissions
  const [userType, setUserType] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [visibleMenuItems, setVisibleMenuItems] = useState<string[]>(allMenuItems);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // 🔧 DEVELOPMENT BYPASS - Remove this section when authentication is needed
    const devBypass = searchParams.get('dev') === 'true' || localStorage.getItem('devMode') === 'true';

    if (devBypass) {
      console.log('🔧 Development mode: Authentication bypassed');
      localStorage.setItem('devMode', 'true');
      localStorage.setItem('wholesalerId', 'dev_wholesaler_123');
      setUserName('Developer User');
      setIsLoading(false);
      return;
    }
    // 🔧 END DEVELOPMENT BYPASS

    let authToken = null;

    // 1. Check for token in URL params first (highest priority for new logins)
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      authToken = tokenFromUrl;
      // Clear the token from the URL to keep it clean after processing
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      router.replace(url.pathname + url.search);
    } else {
      // 2. If no token in URL, check cookies
      const authTokenFromCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('authToken='))
        ?.split('=')[1];
      if (authTokenFromCookie) {
        authToken = authTokenFromCookie;
      } else {
        // 3. If no token in cookie, check localStorage
        const authTokenFromLocalStorage = localStorage.getItem('authToken');
        if (authTokenFromLocalStorage) {
          authToken = authTokenFromLocalStorage;
        }
      }
    }

    if (authToken) {
      try {
        const payloadBase64 = authToken.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);

        console.log('Decoded JWT payload:', payload);

        if (payload.name) {
          setUserName(payload.name);
        }
        if (payload.wholesalerId) {
          localStorage.setItem('wholesalerId', payload.wholesalerId);
        }

        // Decode userType and permissions from token
        if (payload.userType) {
            setUserType(payload.userType);
        }
        if (payload.permissions && Array.isArray(payload.permissions)) {
            setUserPermissions(payload.permissions);
        }
        if (payload.role) {
            setUserRole(payload.role);
        }

        // Ensure token is in localStorage and cookie for persistence
        localStorage.setItem('authToken', authToken);
        document.cookie = `authToken=${authToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
        setIsLoading(false); // Authentication successful, stop loading
      } catch (e) {
        console.error('Failed to decode or parse token:', e);
        // If token is invalid/corrupt, clear it and redirect
        localStorage.removeItem('authToken');
        localStorage.removeItem('wholesalerId');
        document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax';
        router.replace('/'); // Redirect to root if token is invalid
      }
    } else {
      // No valid token found anywhere, redirect to root
      router.replace('/');
    }
  }, [searchParams, router]);

  // Effect to filter menu items based on permissions
  useEffect(() => {
    if (userRole === 'sales') {
        const salesMenuItems = ['Dashboard', 'Booking', 'Customers', 'Markup'];
        setVisibleMenuItems(salesMenuItems);
        // Set a default page if the current one isn't allowed
        if (salesMenuItems.length > 0 && !salesMenuItems.includes(activePage)) {
            setActivePage(salesMenuItems[0]);
        }
    } else if (userType === 'subuser' && userPermissions.length > 0) {
      // Create a Set of unique menu names from permissions (e.g., "Dashboard:Read" -> "Dashboard")
      const allowedMenuSet = new Set(
        userPermissions.map(p => p.split(':')[0])
      );
      // Filter the main menu list to only include items present in the user's permissions
      const filteredItems = allMenuItems.filter(item => allowedMenuSet.has(item));
      setVisibleMenuItems(filteredItems);
      // Set the default active page to the first available item if the current one is not allowed
      if (filteredItems.length > 0 && !filteredItems.includes(activePage)) {
        setActivePage(filteredItems[0]);
      }
    } else {
      // If user is not a subuser or has no permissions, show all menu items
      setVisibleMenuItems(allMenuItems);
    }
  }, [userType, userPermissions, userRole, activePage]);


  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleMenuClick = (item: string) => {
    if (activePage === item) {
      // If clicking the same main menu, collapse submenu
      setExpandedMenu((prev) => (prev === item ? null : item));
      // Reset activeTab when toggling submenu
      setActiveTab(null);
    } else {
      setActivePage(item);
      setExpandedMenu(item);
      setActiveTab(null);
    }
  };

  const handleLogout = () => {
    // Remove local storage items
    localStorage.removeItem('authToken');
    localStorage.removeItem('wholesalerId');
    localStorage.removeItem('devMode'); // 🔧 Clear dev mode
    // Remove cookie by setting max-age=0
    document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax';
    // Redirect to home/login
    router.push('/');
  };

  // Render a loading state while authentication check is in progress
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading wholesaler dashboard...</p>
      </div>
    );
  }

  // If we reach here, it means isLoading is false and a valid token was found,
  // so the user is authenticated and the page can render.
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-64 glass border-r border-white/20 dark:border-gray-700/50
          transform transition-all duration-300 ease-in-out z-50 flex flex-col h-screen
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex
        `}
      >
        {/* Enhanced Profile Header */}
        <div
          className="relative p-6 flex items-center space-x-3 cursor-pointer group hover:bg-white/10 dark:hover:bg-gray-800/50 transition-all duration-300"
          onClick={() => setShowProfileMenu((p) => !p)}
        >
          <div className="relative">
            <img
              src="/images/profile.png"
              className="w-10 h-10 rounded-full ring-2 ring-white/20 group-hover:ring-blue-500/50 transition-all duration-300"
              alt="Profile"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
          <div className="flex-1">
            <span className="font-semibold text-gray-800 dark:text-gray-100 block">
              {userName}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {userRole === 'sales'
                ? 'Sales Person'
                : userType === 'subuser'
                ? 'Subuser Panel'
                : 'Wholesaler Admin'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors duration-300" />

          {showProfileMenu && (
            <div className="absolute top-full left-6 mt-2 w-48 card-modern py-2 z-50 animate-fade-scale">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">developer@example.com</p>
              </div>
              {/* Profile Settings Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePage('Profile Settings');
                  setShowProfileMenu(false);
                  setExpandedMenu(null);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200"
              >
                Profile Settings
              </button>
              {/* ✨ NEW: Preferences Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePage('Preferences');
                  setShowProfileMenu(false);
                  setExpandedMenu(null);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200"
              >
                Preferences
              </button>
              <hr className="my-2 border-gray-100 dark:border-gray-700" />
              {/* Sign Out Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Navigation with Scroll */}
        <div className="flex-1 overflow-y-auto">
          {/* Render the menu using the dynamically filtered 'visibleMenuItems' list */}
          <nav className="px-4 space-y-2 mt-4 sidebar-scroll pb-20">
          {visibleMenuItems.map((item, index) => (
            <div key={item} className="animate-slide-right" style={{ animationDelay: `${index * 0.05}s` }}>
              <button
                onClick={() => handleMenuClick(item)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl
                  transition-all duration-300 ease-in-out group
                  ${
                    activePage === item
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/50 hover:shadow-md'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    activePage === item
                      ? 'bg-white/20'
                      : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
                  }`}>
                    <LayoutGrid className={`w-4 h-4 ${
                      activePage === item
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600'
                    }`} />
                  </div>
                  <span className={`font-medium ${
                    activePage === item
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>{item}</span>
                </div>
                {['Booking', 'Customers', 'Campaign', 'Markup', 'Supplier', 'Reports', 'Sales Person'].includes(item) && (
                  <ChevronDown
                    className={`w-4 h-4 transform transition-all duration-300 ${
                      expandedMenu === item ? 'rotate-180' : ''
                    } ${activePage === item ? 'text-white' : 'text-gray-400'}`}
                  />
                )}
              </button>

              {/* --- SUB-MENUS --- */}

              {expandedMenu === 'Booking' && item === 'Booking' && (
                <div className="ml-6 mt-2 space-y-1 animate-slide-up">
                  {['Overview', 'History', 'Company', 'ManualReservations'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActivePage('Booking');
                        setActiveTab(tab);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        activeTab === tab
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                      <span className="text-sm">
                        {tab === 'Overview' && 'Overview'}
                        {tab === 'History' && 'History'}
                        {tab === 'Company' && 'Company Details'}
                        {tab === 'ManualReservations' && 'Manual Reservations'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {expandedMenu === 'Customers' && item === 'Customers' && (
                <div className="ml-6 mt-2 space-y-1 animate-slide-up">
                  {(userRole === 'sales'
                    ? ['SalesAgency', 'GetSalesAgency', 'ManageAgent', 'ManageRequest']
                    : ['CreateAgent', 'ManageAgent', 'ManageRequest']
                  ).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActivePage('Customers');
                        setActiveTab(tab);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        activeTab === tab
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                      <span className="text-sm">
                        {tab === 'CreateAgent' && 'Create Agency'}
                        {tab === 'SalesAgency' && 'Sales Agency'}
                         {tab === 'GetSalesAgency' && 'Get Sales Agency'}
                        {tab === 'ManageAgent' && 'Manage Agency'}
                        {tab === 'ManageRequest' && 'Manage Request'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {expandedMenu === 'Campaign' && item === 'Campaign' && (
                <div className="ml-6 mt-2 space-y-1 animate-slide-up">
                  {['CreateCampaign'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActivePage('Campaign');
                        setActiveTab(tab);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        activeTab === tab
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                      <span className="text-sm">
                        {tab === 'CreateCampaign' && 'Create Campaign'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {expandedMenu === 'Markup' && item === 'Markup' && (
                <div className="ml-6 mt-2 space-y-1 animate-slide-up">
                  {['CreateMarkup', 'PlanList'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActivePage('Markup');
                        setActiveTab(tab);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        activeTab === tab
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                      <span className="text-sm">
                        {tab === 'CreateMarkup' && 'Create Markup'}
                        {tab === 'PlanList' && 'Plan List'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {expandedMenu === 'Supplier' && item === 'Supplier' && (
                <div className="ml-6 mt-2 space-y-1 animate-slide-up">
                  {['CreateOfflineSupplier', 'ManageSupplier'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActivePage('Supplier');
                        setActiveTab(tab);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        activeTab === tab
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                      <span className="text-sm">
                        {tab === 'CreateOfflineSupplier' && 'Create Supplier'}
                        {tab === 'ManageSupplier' && 'Manage Supplier'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {expandedMenu === 'Sales Person' && item === 'Sales Person' && (
                  <div className="ml-6 mt-2 space-y-1 animate-slide-up">
                    {['SalesPerson', 'AgencyList'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setActivePage('Sales Person');
                          setActiveTab(tab);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                          activeTab === tab
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                        <span className="text-sm">
                          {tab === 'SalesPerson' && 'Sales Person'}
                          {tab === 'AgencyList' && 'Agency List'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}


              {expandedMenu === 'Reports' && item === 'Reports' && (
                <div className="ml-6 mt-2 space-y-1 animate-slide-up">
                  {['OutstandingReport', 'AgencyOutstandingStatement', 'LedgerReport', 'StatementOfAccount', 'PaymentReport', 'AdvancedAnalytics'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActivePage('Reports');
                        setActiveTab(tab);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        activeTab === tab
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                      <span className="text-sm">
                        {tab === 'OutstandingReport' && 'Outstanding Report'}
                        {tab === 'AgencyOutstandingStatement' && 'Agency Outstanding Statement'}
                        {tab === 'LedgerReport' && 'Ledger Report'}
                        {tab === 'StatementOfAccount' && 'Statement of Account'}
                        {tab === 'PaymentReport' && 'Payment Report'}
                        {tab === 'AdvancedAnalytics' && 'Advanced Analytics'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        </div>

        {/* Enhanced Footer - Fixed at bottom */}
        <div className="mt-auto p-4 border-t border-white/10 dark:border-gray-700/50">
          <div className="card-modern p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Need Help?</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Contact our support team</p>
            <button className="w-full btn-modern bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 dark:bg-gradient-to-r dark:from-blue-900 dark:to-purple-900 dark:text-blue-300 text-sm py-2 px-4 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800 dark:hover:to-purple-800">
              Get Support
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <header className="glass border-b border-white/20 dark:border-gray-700/50">
          {/* 🔧 Development Mode Notice */}
          {localStorage.getItem('devMode') === 'true' && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-center text-sm animate-pulse">
              🔧 DEVELOPMENT MODE - Authentication temporarily disabled
            </div>
          )}

          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-6 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar menu"
                className="lg:hidden p-2 rounded-xl hover:bg-white/10 dark:hover:bg-gray-800/50 transition-all duration-300"
              >
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>

              <div className="relative text-gray-500 dark:text-gray-400 w-full sm:w-auto">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="input-modern pl-10 pr-4 py-3 w-full sm:w-80 text-sm"
                />
              </div>

              <div className="hidden lg:flex items-center space-x-4">
                <button className="btn-modern bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 text-sm py-2 px-4">
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Newsletters
                </button>
                <button className="btn-modern bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 text-sm py-2 px-4">
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Release Tracker
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="p-3 rounded-xl hover:bg-white/10 dark:hover:bg-gray-800/50 transition-all duration-300 group"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 group-hover:rotate-180 transition-transform duration-500" />
                )}
              </button>

              <div className="relative">
                <button
                  aria-label="View notifications"
                  className="p-3 rounded-xl hover:bg-white/10 dark:hover:bg-gray-800/50 transition-all duration-300 relative"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Body */}
        <main className="p-6 overflow-y-auto flex-1 bg-gradient-to-br from-transparent to-white/30 dark:to-gray-800/30">
          {activePage === 'Dashboard' && <DashboardPage />}

          {/* ✨ NEW: Render Profile Settings Page */}
          {activePage === 'Profile Settings' && <ProfileSettingsPage />}
          
          {/* ✨ NEW: Render Preferences Page */}
          {activePage === 'Preferences' && <PreferencesPage />}

          {activePage === 'Booking' && (
            <div className="animate-fade-scale">
              {activeTab === 'Overview' && <OverviewTab />}
              {activeTab === 'History' && <HistoryTab />}
              {activeTab === 'Company' && <CompanyDetailsTab />}
              {activeTab === 'ManualReservations' && <ManualReservationsTab />}
              {!activeTab && (
                <div className="card-modern p-12 text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select Booking Option</h3>
                  <p className="text-gray-500 dark:text-gray-400">Choose a booking submenu from the sidebar to get started.</p>
                </div>
              )}
            </div>
          )}

          {activePage === 'Customers' && (
            <div className="animate-fade-scale">
              {activeTab === 'SalesAgency' && <SalesAgencyPage />}
                {activeTab === 'GetSalesAgency' && <GetSalesAgencyPage />}
              {activeTab === 'CreateAgent' && <ManageAgentPage />}
              {activeTab === 'ManageAgent' && <CreateAgent />}
              {activeTab === 'ManageRequest' && <ManageRequestPage />}
              {!activeTab && (
                <div className="card-modern p-12 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Customer Management</h3>
                  <p className="text-gray-500 dark:text-gray-400">Select a customer management option from the sidebar.</p>
                </div>
              )}
            </div>
          )}

          {activePage === 'Campaign' && (
            <div className="animate-fade-scale">
              {activeTab === 'CreateCampaign' && <CreateCampaign />}
              {!activeTab && (
                <div className="card-modern p-12 text-center">
                  <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Campaign Management</h3>
                  <p className="text-gray-500 dark:text-gray-400">Select an option to create or manage your campaigns.</p>
                </div>
              )}
            </div>
          )}

          {activePage === 'Markup' && (
            <div className="animate-fade-scale">
              {activeTab === 'CreateMarkup' && <CreateMarkup />}
              {activeTab === 'AssignMarkup' && <AssignMarkup />}
              {activeTab === 'MarkupAgencyList' && <MarkupAgencyList />}
              {activeTab === 'PlanList' && <PlanList />}
              {!activeTab && (
                <div className="card-modern p-12 text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Markup Configuration</h3>
                  <p className="text-gray-500 dark:text-gray-400">Choose a markup option to configure pricing.</p>
                </div>
              )}
            </div>
          )}

          {activePage === 'Supplier' && (
            <div className="animate-fade-scale">
              {activeTab === 'CreateOfflineSupplier' && <CreateOfflineSupplier />}
              {activeTab === 'ManageSupplier' && <ManageSupplier />}
              {!activeTab && (
                <div className="card-modern p-12 text-center">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Supplier Management</h3>
                  <p className="text-gray-500 dark:text-gray-400">Select a supplier management option from the sidebar.</p>
                </div>
              )}
            </div>
          )}

          {activePage === 'Sales Person' && (
            <div className="animate-fade-scale">
                {activeTab === 'SalesPerson' && <SalesPersonPage />}
                {activeTab === 'AgencyList' && <AgencyListPage />}
                {!activeTab && (
                    <div className="card-modern p-12 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LayoutGrid className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sales Management</h3>
                    <p className="text-gray-500 dark:text-gray-400">Choose a sales management option from the sidebar.</p>
                    </div>
                )}
            </div>
          )}

            {activePage === 'API Management' && <APIManagement />}
            {activePage === 'Mapped Hotels' && <MappedHotels />}

          {activePage === 'Metrics' && <Metrics />}
          {/* {activePage === 'Payment' && <Payment />} */}
          {/* {activePage === 'History' && <HistoryTab />} */}
          {activePage === 'Support Tickets' && <SupportTicketsPage />}
          {activePage === 'Permissions' && <Permissions />}
        {activePage === 'Users' && <Users />}
          {activePage === 'Reports' && (
            <div className="animate-fade-scale">
              {activeTab === 'OutstandingReport' && <OutstandingReport />}
              {activeTab === 'AgencyOutstandingStatement' && <AgencyOutstandingStatement />}
              {activeTab === 'LedgerReport' && <LedgerReport />}
              {activeTab === 'StatementOfAccount' && <StatementOfAccount />}
              {/* {activeTab === 'PaymentReport' && <PaymentReport />} */}
              {activeTab === 'PaymentReport' && <Payment />}
              {activeTab === 'AdvancedAnalytics' && <AdvancedAnalytics />}
              {!activeTab && (
                <ReportsDashboard onSelectReport={setActiveTab} />
              )}
            </div>
          )}

          {['Messages', 'Masters', 'Tools', 'Visa', 'Settings', 'Analytics', 'Notifications', 'Integrations', 'Logs'].includes(activePage) && (
            <div className="card-modern p-12 text-center animate-fade-scale">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <LayoutGrid className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{activePage}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">This feature is coming soon! We're working hard to bring you this functionality.</p>
              <button className="btn-gradient">
                Request Early Access
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}