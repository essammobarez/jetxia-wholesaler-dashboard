"use client";

import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import {
  Plus,
  KeyRound,
  Shield,
  Wifi,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Building,
  Copy,
  ChevronDown,
} from 'lucide-react';

// --- TYPE DEFINITIONS --- //

type CredentialStatus = 'Active' | 'Inactive';
type TestStatus = 'Success' | 'Failed' | 'Untested';

interface Credential {
  id: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  status: CredentialStatus;
  lastTest: {
    status: TestStatus;
    timestamp: string | null;
  };
}

interface Supplier {
  id: string;
  name: string;
  logo: string;
  credentials: Credential[];
}

interface ApiProvider {
  _id: string;
  name: string;
  logoUrl: string;
}


// --- HELPER COMPONENTS --- //

const StatusBadge: React.FC<{ status: CredentialStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block";
  const statusClasses = {
    Active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const TestStatusIndicator: React.FC<{ lastTest: Credential['lastTest'] }> = ({ lastTest }) => {
    const statusInfo = {
        Success: { Icon: CheckCircle2, color: "text-green-500", text: "Connection Successful" },
        Failed: { Icon: XCircle, color: "text-red-500", text: "Connection Failed" },
        Untested: { Icon: Wifi, color: "text-gray-400", text: "Not Tested Yet" },
    };
    const { Icon, color, text } = statusInfo[lastTest.status];
    return (
        <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${color}`} />
            <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">{text}</p>
                {lastTest.timestamp && <p className="text-xs text-gray-500 dark:text-gray-400">Last tested: {new Date(lastTest.timestamp).toLocaleString()}</p>}
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT --- //

const APIManagement: NextPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  // --- UPDATED --- State to track progress percentage
  const [testingProgress, setTestingProgress] = useState<{ [key: string]: number | null }>({});
  
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  
  const [activeSupplierId, setActiveSupplierId] = useState<string | null>(null);

  const generateMockCredentials = (providerId: string, providerName: string): Credential[] => {
    const nameSlug = providerName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return [
      {
        id: `cred-${providerId}-prod`,
        name: 'Production Account',
        apiKey: `key_live_${nameSlug}_${Math.random().toString(36).slice(8)}`,
        apiSecret: `secret_live_${nameSlug}_${Math.random().toString(36).slice(2)}`,
        status: 'Active',
        lastTest: { status: 'Untested', timestamp: null },
      },
    ];
  };

  useEffect(() => {
    const fetchAndBuildSuppliers = async () => {
      setPageLoading(true);
      setPageError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/provider`);
        if (!response.ok) throw new Error('Failed to fetch providers');
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          const suppliersFromApi = result.data.map((provider: ApiProvider) => ({
            id: provider._id,
            name: provider.name,
            logo: provider.logoUrl,
            credentials: generateMockCredentials(provider._id, provider.name),
          }));
          setSuppliers(suppliersFromApi);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        setPageError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setPageLoading(false);
      }
    };
    fetchAndBuildSuppliers();
  }, []);

  const handleProviderChange = (providerId: string) => {
    setSelectedProviderId(providerId);
    if (providerId) {
      const provider = suppliers.find(p => p.id === providerId);
      if (provider) {
        const providerName = provider.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        setApiKey(`key_live_${providerName}_${Date.now().toString(36)}`);
        setApiSecret(`secret_live_${providerName}_${Math.random().toString(36).slice(2)}`);
      }
    } else {
      setApiKey('');
      setApiSecret('');
    }
  };
  
  // --- UPDATED --- Test connectivity with progress bar simulation
  const handleTestConnectivity = (credentialId: string) => {
    setTestingProgress(prev => ({ ...prev, [credentialId]: 0 }));

    const interval = setInterval(() => {
      setTestingProgress(prev => {
        const currentProgress = prev[credentialId] ?? 0;
        const nextProgress = currentProgress + 20; // Increment progress

        if (nextProgress >= 100) {
          clearInterval(interval);
          // --- Finalize the test ---
          setSuppliers(prevSuppliers => prevSuppliers.map(supplier => ({
            ...supplier,
            credentials: supplier.credentials.map(cred => {
              if (cred.id === credentialId) {
                return {
                  ...cred,
                  lastTest: {
                    status: Math.random() > 0.3 ? 'Success' : 'Failed',
                    timestamp: new Date().toISOString(),
                  },
                };
              }
              return cred;
            }),
          })));
          // Reset progress state
          return { ...prev, [credentialId]: null };
        }
        return { ...prev, [credentialId]: nextProgress };
      });
    }, 300); // Update every 300ms
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleToggleSupplier = (supplierId: string) => {
    setActiveSupplierId(prevId => (prevId === supplierId ? null : supplierId));
  };
  
  if (pageLoading) {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600"/>
        </div>
    );
  }
  
  if (pageError) {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
              <div className="text-center">
                  <XCircle className="mx-auto h-12 w-12 text-red-500"/>
                  <h3 className="mt-2 text-lg font-medium text-red-600">Failed to Load Data</h3>
                  <p className="mt-1 text-sm text-gray-500">{pageError}</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-900 dark:bg-gray-900 dark:text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h1 className="text-3xl font-bold tracking-tight">API Management</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Credential</span>
          </button>
        </div>

        <div className="space-y-4">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
              <div
                onClick={() => handleToggleSupplier(supplier.id)}
                className="flex cursor-pointer items-center justify-between p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <Building className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold">{supplier.name}</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <span className='text-sm text-gray-500 dark:text-gray-400'>{supplier.credentials.length} credential(s)</span>
                    <ChevronDown className={`h-6 w-6 text-gray-400 transition-transform ${activeSupplierId === supplier.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {activeSupplierId === supplier.id && (
                 <div className="divide-y divide-gray-200 border-t border-gray-200 bg-gray-50/50 dark:divide-gray-700 dark:border-gray-700 dark:bg-black/20">
                    {supplier.credentials.map(cred => (
                        <div key={cred.id} className="p-6 space-y-4">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cred.name}</h3>
                                    <StatusBadge status={cred.status} />
                                </div>
                                <div className="w-full sm:w-48">
                                    {typeof testingProgress[cred.id] === 'number' ? (
                                        // --- NEW --- Progress Bar UI
                                        <div>
                                            <div className="mb-1 flex justify-between">
                                                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Connecting...</span>
                                                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{testingProgress[cred.id]}%</span>
                                            </div>
                                            <div className="w-full rounded-full bg-gray-200 dark:bg-gray-700 h-2.5">
                                                <div className="h-2.5 rounded-full bg-blue-600 transition-all duration-300" style={{width: `${testingProgress[cred.id]}%`}}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Original Button
                                        <button
                                            onClick={() => handleTestConnectivity(cred.id)}
                                            className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                        >
                                            <Wifi className="h-4 w-4" />
                                            <span>Test Connectivity</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-gray-200 pt-4 dark:border-gray-700 md:grid-cols-2">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                      <KeyRound className="h-5 w-5 text-gray-400"/>
                                      <label className="font-medium">API Key</label>
                                  </div>
                                  <div className="flex items-center gap-2 rounded-md bg-white p-2 dark:bg-gray-900">
                                      <span className="truncate font-mono text-sm text-gray-600 dark:text-gray-400">{cred.apiKey}</span>
                                      <button onClick={() => copyToClipboard(cred.apiKey)} className="ml-auto p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                                          <Copy className="h-4 w-4"/>
                                      </button>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                      <Shield className="h-5 w-5 text-gray-400"/>
                                      <label className="font-medium">API Secret</label>
                                  </div>
                                  <div className="flex items-center gap-2 rounded-md bg-white p-2 dark:bg-gray-900">
                                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">••••••••••••••••••••••••</span>
                                      <button onClick={() => copyToClipboard(cred.apiSecret)} className="ml-auto p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                                          <Copy className="h-4 w-4"/>
                                      </button>
                                  </div>
                                </div>
                                <div className="flex items-center rounded-lg bg-white p-4 dark:bg-gray-900/50">
                                    <TestStatusIndicator lastTest={cred.lastTest} />
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add New Credential Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="m-4 w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <h2 className="text-xl font-bold">Add New Supplier Credential</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <form className="space-y-4 p-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="supplier" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
                <select 
                  id="supplier" 
                  value={selectedProviderId}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a supplier...</option>
                  {suppliers.map(provider => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="credName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Credential Name</label>
                <input type="text" id="credName" placeholder="e.g., Production Account" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label htmlFor="apiKey" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">API Key</label>
                <input 
                  type="text" 
                  id="apiKey" 
                  placeholder="Auto-filled on supplier selection" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label htmlFor="apiSecret" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">API Secret</label>
                <input 
                  type="password" 
                  id="apiSecret" 
                  placeholder="Auto-filled on supplier selection" 
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                    Cancel
                 </button>
                 <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                    Save and Connect
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIManagement;