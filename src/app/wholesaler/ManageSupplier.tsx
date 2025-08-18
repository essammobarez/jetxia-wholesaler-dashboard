import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Globe,
  Link,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Server,
  Shield,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface OfflineSupplier {
  _id: string;
  name: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  address?: string;
  nationality?: string;
  phoneNumber?: string;
  isActive: boolean;
  offline: boolean;
  wholesaler: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  services?: string[];
  rating?: number;
}

interface OnlineProvider {
  _id: string;
  name: string;
  apiBaseUrl: string;
  authType: string;
  logoUrl: string;
  tokenExpiryHours: number;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProviderData {
  offline: OfflineSupplier[];
  online: OnlineProvider[];
}

export default function ManageSupplier() {
  const [providers, setProviders] = useState<ProviderData>({
    offline: [],
    online: [],
  });
  const [filteredProviders, setFilteredProviders] = useState<ProviderData>({
    offline: [],
    online: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);

  // New state for the active tab
  const [activeTab, setActiveTab] = useState<"offline" | "online">("offline");

  // Dynamic wholesalerId from localStorage
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // Load stored wholesaler ID on mount
  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  useEffect(() => {
    fetchAllProviders();
  }, [wholesalerId]);

  // Filter providers based on search and filters
  useEffect(() => {
    let filteredOffline = providers.offline;
    let filteredOnline = providers.online;

    if (searchTerm) {
      filteredOffline = filteredOffline.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      filteredOnline = filteredOnline.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filteredOffline = filteredOffline.filter(
        (provider) => (provider.status || "active") === statusFilter
      );
      filteredOnline = filteredOnline.filter((provider) =>
        statusFilter === "active" ? provider.isActive : !provider.isActive
      );
    }

    // The typeFilter is now handled by the tabs, but we'll keep the logic for backward compatibility
    // and for the "All Providers" view if it were to be re-added.
    if (typeFilter !== "all") {
      if (typeFilter === "offline") {
        filteredOnline = [];
      } else if (typeFilter === "online") {
        filteredOffline = [];
      }
    }

    setFilteredProviders({
      offline: filteredOffline,
      online: filteredOnline,
    });
  }, [providers, searchTerm, statusFilter, typeFilter]);

  const fetchAllProviders = async () => {
    if (!wholesalerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Fetch offline suppliers
      const offlineResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/offline-provider/by-wholesaler/${wholesalerId}`
      );
      const offlineData = await offlineResponse.json();
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
      // Fetch online providers
      const onlineResponse = await fetch(`${apiUrl}/provider`);
      const onlineData = await onlineResponse.json();

      if (offlineResponse.ok && onlineResponse.ok) {
        setProviders({
          offline: offlineData || [],
          online: onlineData.data || [],
        });
      } else {
        setError("Failed to load some provider data");
      }
    } catch (err) {
      setError("Failed to fetch provider data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = () => {
    setShowAddModal(true);
  };

  const handleEditProvider = (provider: any, type: "offline" | "online") => {
    setSelectedProvider({ ...provider, type });
    setShowEditModal(true);
  };

  const handleDeleteProvider = (provider: any, type: "offline" | "online") => {
    setSelectedProvider({ ...provider, type });
    setShowDeleteModal(true);
  };

  const handleViewProvider = (provider: any, type: "offline" | "online") => {
    setSelectedProvider({ ...provider, type });
    setShowViewModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status?: string, isActive?: boolean) => {
    if (status) {
      switch (status) {
        case "active":
          return "text-green-600 bg-green-100 dark:bg-green-900/30";
        case "inactive":
          return "text-red-600 bg-red-100 dark:bg-red-900/30";
        case "pending":
          return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
        default:
          return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
      }
    } else if (typeof isActive === "boolean") {
      return isActive
        ? "text-green-600 bg-green-100 dark:bg-green-900/30"
        : "text-red-600 bg-red-100 dark:bg-red-900/30";
    }
    return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
  };

  const getStatusIcon = (status?: string, isActive?: boolean) => {
    if (status) {
      switch (status) {
        case "active":
          return <CheckCircle className="w-4 h-4" />;
        case "inactive":
          return <AlertCircle className="w-4 h-4" />;
        case "pending":
          return <Clock className="w-4 h-4" />;
        default:
          return <Clock className="w-4 h-4" />;
      }
    } else if (typeof isActive === "boolean") {
      return isActive ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      );
    }
    return <Clock className="w-4 h-4" />;
  };

  const getTypeIcon = (type: "offline" | "online") => {
    return type === "offline" ? (
      <Building2 className="w-4 h-4" />
    ) : (
      <Globe className="w-4 h-4" />
    );
  };

  const getTypeColor = (type: "offline" | "online") => {
    return type === "offline"
      ? "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
      : "text-purple-600 bg-purple-100 dark:bg-purple-900/30";
  };

  const totalProviders = providers.offline.length + providers.online.length;
  const activeOffline = providers.offline.filter(
    (p) => (p.status || "active") === "active"
  ).length;
  const activeOnline = providers.online.filter((p) => p.isActive).length;
  const totalActive = activeOffline + activeOnline;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading providers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Providers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your offline suppliers and online service providers
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <button
            onClick={fetchAllProviders}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          {/* <button
            onClick={handleAddProvider}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Provider
          </button> */}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Providers
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Type Filter is now replaced by tabs */}
          <div className="flex items-end lg:col-span-2">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTypeFilter("all"); // Resetting typeFilter as well for a full reset
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Providers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalProviders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600">{totalActive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Offline
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {providers.offline.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
              <p className="text-2xl font-bold text-purple-600">
                {providers.online.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {providers.offline.filter((p) => p.status === "pending").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("offline")}
          className={`py-2 px-6 -mb-px text-sm font-medium transition-colors duration-200 focus:outline-none ${
            activeTab === "offline"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Offline Suppliers ({filteredProviders.offline.length})
        </button>
        <button
          onClick={() => setActiveTab("online")}
          className={`py-2 px-6 -mb-px text-sm font-medium transition-colors duration-200 focus:outline-none ${
            activeTab === "online"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Online Providers ({filteredProviders.online.length})
        </button>
      </div>

      {/* Providers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="hidden md:table-header-group bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Provider Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                {activeTab === "online" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    API Info
                  </th>
                )}
                {activeTab === "offline" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {/* Display based on active tab */}
              {activeTab === "offline" &&
                (filteredProviders.offline.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Building2 className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No offline suppliers found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search criteria or filters."
                            : "Get started by adding your first offline supplier."}
                        </p>
                        {!searchTerm && statusFilter === "all" && (
                          <button
                            onClick={handleAddProvider}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add First Supplier
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProviders.offline.map((supplier) => (
                    <tr
                      key={`offline-${supplier._id}`}
                      className="border-b border-gray-200 dark:border-gray-700 md:table-row"
                    >
                      {/* Mobile Card View */}
                      <td
                        colSpan={6}
                        className="block md:hidden p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {supplier.name}
                            </p>
                            {supplier.notes && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {supplier.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 flex-shrink-0">
                            <button
                              onClick={() => handleViewProvider(supplier, "offline")}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEditProvider(supplier, "offline")}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Edit Provider"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProvider(supplier, "offline")}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete Provider"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status || "active")}`}>
                              {getStatusIcon(supplier.status || "active")}
                              <span className="capitalize">{supplier.status || "active"}</span>
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor("offline")}`}>
                              <Building2 className="w-4 h-4" />
                              <span>Offline</span>
                            </span>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                            <p className="text-gray-700 dark:text-gray-300">{formatDate(supplier.createdAt)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Desktop Table View */}
                      <td className="hidden md:table-cell px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {supplier.name}
                          </div>
                          {supplier.notes && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {supplier.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor("offline")}`}>
                          <Building2 className="w-4 h-4" />
                          <span>Offline</span>
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status || "active")}`}>
                          {getStatusIcon(supplier.status || "active")}
                          <span className="capitalize">{supplier.status || "active"}</span>
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                         <div className="text-sm text-gray-500 dark:text-gray-400">
                          {supplier.phoneNumber || supplier.address || "N/A"}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(supplier.createdAt)}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <button onClick={() => handleViewProvider(supplier, "offline")} className="text-blue-600 hover:text-blue-900" title="View"><Eye className="w-5 h-5" /></button>
                          <button onClick={() => handleEditProvider(supplier, "offline")} className="text-green-600 hover:text-green-900" title="Edit"><Edit className="w-5 h-5" /></button>
                          <button onClick={() => handleDeleteProvider(supplier, "offline")} className="text-red-600 hover:text-red-900" title="Delete"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ))}

              {activeTab === "online" &&
                (filteredProviders.online.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Globe className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No online providers found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search criteria or filters."
                            : "Get started by adding your first online provider."}
                        </p>
                        {!searchTerm && statusFilter === "all" && (
                          <button
                            onClick={handleAddProvider}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add First Provider
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProviders.online.map((provider) => (
                    <tr
                      key={`online-${provider._id}`}
                      className="border-b border-gray-200 dark:border-gray-700 md:table-row"
                    >
                      {/* Mobile Card View */}
                      <td
                        colSpan={6}
                        className="block md:hidden p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {provider.name}
                            </p>
                            {provider.notes && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {provider.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 flex-shrink-0">
                             <button
                              onClick={() => handleViewProvider(provider, "online")}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEditProvider(provider, "online")}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Edit Provider"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProvider(provider, "online")}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete Provider"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(undefined, provider.isActive)}`}>
                              {getStatusIcon(undefined, provider.isActive)}
                              <span className="capitalize">{provider.isActive ? "active" : "inactive"}</span>
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor("online")}`}>
                              <Globe className="w-4 h-4" />
                              <span>Online</span>
                            </span>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">API URL</p>
                            <p className="text-gray-700 dark:text-gray-300 break-all">{provider.apiBaseUrl}</p>
                          </div>
                           <div className="col-span-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                            <p className="text-gray-700 dark:text-gray-300">{formatDate(provider.createdAt)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Desktop Table View */}
                      <td className="hidden md:table-cell px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {provider.name}
                          </div>
                          {provider.notes && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {provider.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor("online")}`}>
                          <Globe className="w-4 h-4" />
                          <span>Online</span>
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(undefined, provider.isActive)}`}>
                          {getStatusIcon(undefined, provider.isActive)}
                          <span className="capitalize">{provider.isActive ? "active" : "inactive"}</span>
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 break-all">
                          <div className="flex items-center gap-1 mb-1">
                            <Link className="w-3 h-3 flex-shrink-0" />
                            <span>{provider.apiBaseUrl}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3 flex-shrink-0" />
                            <span>{provider.authType}</span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(provider.createdAt)}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => handleViewProvider(provider, "online")} className="text-blue-600 hover:text-blue-900" title="View"><Eye className="w-5 h-5" /></button>
                            <button onClick={() => handleEditProvider(provider, "online")} className="text-green-600 hover:text-green-900" title="Edit"><Edit className="w-5 h-5" /></button>
                            <button onClick={() => handleDeleteProvider(provider, "online")} className="text-red-600 hover:text-red-900" title="Delete"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showViewModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Provider Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Name
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedProvider.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Type
                    </label>
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedProvider.type)}`}
                    >
                      {getTypeIcon(selectedProvider.type)}
                      <span className="capitalize">{selectedProvider.type}</span>
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedProvider.type === "offline"
                          ? getStatusColor(selectedProvider.status || "active")
                          : getStatusColor(undefined, selectedProvider.isActive)
                      }`}
                    >
                      {selectedProvider.type === "offline"
                        ? getStatusIcon(selectedProvider.status || "active")
                        : getStatusIcon(undefined, selectedProvider.isActive)}
                      <span className="capitalize">
                        {selectedProvider.type === "offline"
                          ? selectedProvider.status || "active"
                          : selectedProvider.isActive
                          ? "active"
                          : "inactive"}
                      </span>
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Created
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(selectedProvider.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedProvider.notes && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Notes
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedProvider.notes}
                  </p>
                </div>
              )}

              {/* Contact Information (Offline only) */}
              {selectedProvider.type === "offline" && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProvider.phoneNumber && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Phone Number
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedProvider.phoneNumber}
                        </p>
                      </div>
                    )}
                    {selectedProvider.nationality && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Nationality
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedProvider.nationality}
                        </p>
                      </div>
                    )}
                    {selectedProvider.address && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Address
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedProvider.address}
                        </p>
                      </div>
                    )}
                    {/* Legacy contact info fallback */}
                    {selectedProvider.contactInfo && (
                      <>
                        {selectedProvider.contactInfo.email && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Email (Legacy)
                            </label>
                            <p className="text-gray-900 dark:text-white">
                              {selectedProvider.contactInfo.email}
                            </p>
                          </div>
                        )}
                        {selectedProvider.contactInfo.phone &&
                          !selectedProvider.phoneNumber && (
                            <div>
                              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Phone (Legacy)
                              </label>
                              <p className="text-gray-900 dark:text-white">
                                {selectedProvider.contactInfo.phone}
                              </p>
                            </div>
                          )}
                        {selectedProvider.contactInfo.address &&
                          !selectedProvider.address && (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Address (Legacy)
                              </label>
                              <p className="text-gray-900 dark:text-white">
                                {selectedProvider.contactInfo.address}
                              </p>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Services (Offline only) */}
              {selectedProvider.type === "offline" &&
                selectedProvider.services &&
                selectedProvider.services.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Services
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProvider.services.map(
                        (service: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                          >
                            {service}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* API Information (Online only) */}
              {selectedProvider.type === "online" && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    API Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        API Base URL
                      </label>
                      <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                        {selectedProvider.apiBaseUrl}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Authentication Type
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedProvider.authType}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Token Expiry (Hours)
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedProvider.tokenExpiryHours}
                      </p>
                    </div>
                    {selectedProvider.logoUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Logo URL
                        </label>
                        <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                          {selectedProvider.logoUrl}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Additional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Provider ID
                    </label>
                    <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                      {selectedProvider._id}
                    </p>
                  </div>
                  {selectedProvider.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Last Updated
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(selectedProvider.updatedAt)}
                      </p>
                    </div>
                  )}
                  {selectedProvider.type === "offline" &&
                    selectedProvider.rating && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Rating
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedProvider.rating}/5
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Provider</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add provider functionality would be implemented here.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Provider
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Provider</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Edit {selectedProvider.type} provider functionality would be
              implemented here.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Delete Provider</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete "{selectedProvider.name}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}