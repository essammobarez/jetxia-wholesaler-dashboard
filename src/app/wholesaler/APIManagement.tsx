"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
    Edit,
    Trash2, // Added for delete button
    AlertTriangle, // Added for delete modal
} from 'lucide-react';

// --- TYPE DEFINITIONS (UPDATED) --- //

type CredentialStatus = 'Active' | 'Inactive';
type TestStatus = 'Success' | 'Failed' | 'Untested';
type TestModalStatus = 'Pending' | 'Success' | 'Failed';

// UPDATED: Credential interface is now flexible.
interface Credential {
    id: string; // This is the connectionId
    name: string;
    values: { [key: string]: string }; // DYNAMIC: Holds all credential key-value pairs
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

interface SupplierConnection {
    _id: string;
    supplier: ApiProvider; // --- MODIFIED: Was 'string', now is 'ApiProvider' to match your JSON data
    credentials: {
        [key: string]: string; // Flexible credentials object
    };
    active: boolean;
    valid: boolean;
    updatedAt: string;
}

interface TestResultInfo {
    status: TestModalStatus;
    endpoint: string;
    response: any;
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
                {lastTest.timestamp && <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {new Date(lastTest.timestamp).toLocaleString()}</p>}
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT --- //

const APIManagement: NextPage = () => {
    // Define the dynamic field configurations for each supplier
    const supplierFieldConfig: { [key: string]: { name: string; label: string; type: 'text' | 'password' | 'number' | 'select'; placeholder?: string; options?: string[] }[] } = {
        "Hyper Guest": [
            { name: "HG_STATIC_TOKEN", label: "Static Token", type: "password", placeholder: "Enter your HyperGuest Static Token" }
        ],
        "TourMind": [
            { name: "AGENTCODE_TM", label: "Agent Code", type: "text", placeholder: "e.g., tms_test" },
            { name: "USERNAME_TM", label: "Username", type: "text", placeholder: "e.g., tms_test" },
            { name: "PASSWORD_TM", label: "Password", type: "password", placeholder: "e.g., tms_test" }
        ],
        "Travelgate": [
            { name: "TRAVELGATEX_API_KEY", label: "API Key", type: "text", placeholder: "Enter TravelgateX API Key" },
            { name: "TRAVELGATEX_CLIENT", label: "Client", type: "text", placeholder: "Enter TravelgateX Client" },
            { name: "TRAVELGATEX_CONTEXT", label: "Context", type: "text", placeholder: "Enter TravelgateX Context" },
            { name: "TRAVELGATEX_TIMEOUT", label: "Timeout (ms)", type: "number", placeholder: "e.g., 25000" },
            { name: "TRAVELGATEX_TEST_MODE", label: "Test Mode", type: "select", options: ["false", "true"] }
        ],
        "Miki": [
            { name: "MIKI_AGENT_CODE", label: "Agent Code", type: "text", placeholder: "Enter Miki Agent Code" },
            { name: "MIKI_REQUEST_PASSWORD", label: "Request Password", type: "password", placeholder: "Enter Miki Request Password" }
        ],
        "iwtx": [
            { name: "YOUR_SUPPLIER_CODE", label: "Supplier Code", type: "text", placeholder: "Enter your Supplier Code" },
            { name: "YOUR_SUPPLIER_PASSWORD", label: "Supplier Password", type: "password", placeholder: "Enter your Supplier Password" }
        ],
        "Hotelbeds": [
            { name: "HOTELBEDS_API_KEY", label: "API Key", type: "text", placeholder: "Enter Hotelbeds API Key" },
            { name: "HOTELBEDS_SECRET_KEY", label: "Secret Key", type: "password", placeholder: "Enter Hotelbeds Secret Key" },
            { name: "HOTELBEDS_API_VERSION", label: "API Version", type: "text", placeholder: "e.g., 1.0" }
        ],
        "Welcomebeds": [
            { name: "Welcomebeds_USERNAME", label: "Username", type: "text", placeholder: "Enter Welcomebeds Username" },
            { name: "Welcomebeds_PASSWORD", label: "Password", type: "password", placeholder: "Enter Welcomebeds Password" },
            { name: "Welcomebeds_TOKEN", label: "Token", type: "password", placeholder: "Enter Welcomebeds Token" }
        ],
        // A default configuration for providers not explicitly listed
        // --- MODIFICATION START: Added 'E Booking' to match your JSON data ---
        "E Booking": [
            { name: "client_id", label: "Client ID", type: "text", placeholder: "Enter the client ID" },
            { name: "client_secret", label: "Client Secret", type: "password", placeholder: "Enter the client secret" },
            { name: "scope", label: "Scope", type: "text", placeholder: "e.g., read:hotels write:bookings" }
        ],
        // --- MODIFICATION END ---
        "Default": [
            { name: "client_id", label: "Client ID", type: "text", placeholder: "Enter the client ID" },
            { name: "client_secret", label: "Client Secret", type: "password", placeholder: "Enter the client secret" },
            { name: "scope", label: "Scope", type: "text", placeholder: "e.g., read:hotels write:bookings" }
        ]
    };

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [allProviders, setAllProviders] = useState<ApiProvider[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [activeSupplierId, setActiveSupplierId] = useState<string | null>(null);

    // --- Modal States ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isTestResultModalOpen, setIsTestResultModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // --- ADDED ---

    // --- Add Credential State ---
    const [selectedProviderId, setSelectedProviderId] = useState('');
    const [addCredentialValues, setAddCredentialValues] = useState<{ [key: string]: string }>({});
    const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
    const [addModalError, setAddModalError] = useState<string | null>(null);

    // --- Update Credential State (UPDATED) ---
    const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [updateCredentialValues, setUpdateCredentialValues] = useState<{ [key: string]: string }>({});
    const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
    const [updateModalError, setUpdateModalError] = useState<string | null>(null);

    // --- Test Connectivity State ---
    const [testResultInfo, setTestResultInfo] = useState<TestResultInfo | null>(null);

    // --- Delete Credential State ---
    const [deletingInfo, setDeletingInfo] = useState<{ credential: Credential, supplier: Supplier } | null>(null); // --- ADDED ---
    const [isDeleting, setIsDeleting] = useState(false); // --- ADDED ---
    const [deleteError, setDeleteError] = useState<string | null>(null); // --- ADDED ---


    // --- Helpers ---

    // --- MODIFICATION START: Updated getAuthToken function ---
    const getAuthToken = useCallback(() => {
        if (typeof window === "undefined") return ""; // Guard for SSR
        return document.cookie
            .split('; ')
            .find(r => r.startsWith('authToken='))
            ?.split('=')[1] || localStorage.getItem('authToken') || "";
    }, []);
    // --- MODIFICATION END ---

    const getWholesalerId = useCallback(() => {
        if (typeof window !== "undefined") return localStorage.getItem("wholesalerId") || "";
        return "";
    }, []);


    // --- Data Fetching Logic (UPDATED) ---
    const fetchAllData = useCallback(async () => {
        setPageLoading(true);
        setPageError(null);
        const wholesalerId = getWholesalerId();
        const authToken = getAuthToken();

        if (!wholesalerId || !authToken) {
            setPageError("Authentication details missing. Please log in again.");
            setPageLoading(false);
            return;
        }

        try {
            // --- MODIFICATION START: Updated API endpoint and added token ---
            const [providerResponse, connectionResponse] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wholesaler/supplier-connection`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                }),
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/supplier-connection/wholesaler/${wholesalerId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                })
            ]);
            // --- MODIFICATION END ---

            if (!providerResponse.ok) throw new Error('Failed to fetch the list of available suppliers.');
            if (!connectionResponse.ok) throw new Error('Failed to fetch your supplier connections.');

            const providerResult = await providerResponse.json();
            const connectionResult = await connectionResponse.json();

            
            if (!providerResult.success || !Array.isArray(providerResult.data)) {
                
                
                
                
                throw new Error('Invalid format for supplier list.');
            }
            if (!connectionResult.success || !Array.isArray(connectionResult.data)) throw new Error('Invalid format for connections data.');

            setAllProviders(providerResult.data);
            
            // This map is still needed for the 'Add' modal, but not for the loop below.
            const providerDetailsMap = new Map<string, { name: string, logo: string }>(
                providerResult.data.map((p: ApiProvider) => [p._id, { name: p.name, logo: p.logoUrl }])
            );
            // --- MODIFICATION END ---


            const suppliersMap = new Map<string, Supplier>();
            
            // --- MODIFICATION START: Updated loop to handle populated supplier object ---
            for (const connection of connectionResult.data as SupplierConnection[]) {
                // 'connection.supplier' is now an object, not a string ID
                const supplierId = connection.supplier._id;
                const providerInfo = {
                    name: connection.supplier.name,
                    logo: connection.supplier.logoUrl
                };
                // --- MODIFICATION END ---

                // UPDATED: Store credentials dynamically
                const newCredential: Credential = {
                    id: connection._id,
                    name: `${providerInfo.name} Credential`,
                    values: connection.credentials, // Store the entire credentials object
                    status: connection.active ? 'Active' : 'Inactive',
                    lastTest: {
                        status: connection.valid ? 'Success' : 'Failed',
                        timestamp: connection.updatedAt,
                    },
                };

                if (!suppliersMap.has(supplierId)) {
                    suppliersMap.set(supplierId, { id: supplierId, name: providerInfo.name, logo: providerInfo.logo, credentials: [] });
                }
                suppliersMap.get(supplierId)!.credentials.push(newCredential);
            }

            setSuppliers(Array.from(suppliersMap.values()));

        } catch (error) {
            setPageError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setPageLoading(false);
        }
    }, [getAuthToken, getWholesalerId]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // --- Add Credential Logic ---
    const handleAddNewCredential = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmittingAdd(true);
        setAddModalError(null);

        const wholesalerId = getWholesalerId();
        if (!wholesalerId) {
            setAddModalError("Authentication error: Could not identify wholesaler.");
            setIsSubmittingAdd(false);
            return;
        }

        if (!selectedProviderId) {
            setAddModalError("Please select a supplier.");
            setIsSubmittingAdd(false);
            return;
        }

        // --- START: MODIFICATION ---
        // Check if a supplier with this ID already exists in the user's list
        const alreadyExists = suppliers.some(s => s.id === selectedProviderId);
        if (alreadyExists) {
            setAddModalError("This supplier connection already added.");
            setIsSubmittingAdd(false);
            return;
        }
        // --- END: MODIFICATION ---

        const selectedProvider = allProviders.find(p => p._id === selectedProviderId);
        const fieldsToRender = (selectedProvider && supplierFieldConfig[selectedProvider.name])
            ? supplierFieldConfig[selectedProvider.name]
            : supplierFieldConfig["Default"];

        for (const field of fieldsToRender) {
            if (!addCredentialValues[field.name]) {
                setAddModalError(`Please fill all required fields. Missing: ${field.label}`);
                setIsSubmittingAdd(false);
                return;
            }
        }

        const payload = {
            wholesalerId,
            supplierId: selectedProviderId,
            credentials: addCredentialValues
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/supplier-connection/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to save credential.');

            setIsAddModalOpen(false);
            setSelectedProviderId('');
            setAddCredentialValues({});
            await fetchAllData();

        } catch (error) {
            setAddModalError(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            setIsSubmittingAdd(false);
        }
    };

    // --- Update Credential Logic (UPDATED) ---
    const openUpdateModal = (credential: Credential, supplier: Supplier) => {
        setEditingCredential(credential);
        setEditingSupplier(supplier);

        const initialValues: { [key: string]: string } = {};
        const fieldsConfig = supplierFieldConfig[supplier.name] || supplierFieldConfig.Default;
        
        fieldsConfig.forEach(field => {
            // Pre-fill non-password fields. Leave passwords blank for security.
            if (field.type !== 'password') {
                {/* --- ERROR FIX IS HERE --- */}
                initialValues[field.name] = credential.values?.[field.name] || '';
            } else {
                initialValues[field.name] = ''; 
            }
        });

        setUpdateCredentialValues(initialValues);
        setUpdateModalError(null);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateCredential = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!editingCredential || !editingSupplier) return;

        setIsSubmittingUpdate(true);
        setUpdateModalError(null);

        // Create a copy to manipulate
        const credentialsToUpdate = { ...updateCredentialValues };
        
        // Filter out empty password fields so they are not sent in the payload
        Object.keys(credentialsToUpdate).forEach(key => {
            const fieldConfig = (supplierFieldConfig[editingSupplier.name] || supplierFieldConfig.Default).find(f => f.name === key);
            if (fieldConfig?.type === 'password' && !credentialsToUpdate[key]) {
                delete credentialsToUpdate[key];
            }
        });
        
        // If no actual data is being sent, just close the modal.
        if (Object.keys(credentialsToUpdate).length === 0) {
            setIsUpdateModalOpen(false);
            setIsSubmittingUpdate(false);
            return;
        }
        
        const payload = { credentials: credentialsToUpdate };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}supplier-connection/update/${editingCredential.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update credential.');

            setIsUpdateModalOpen(false);
            setEditingCredential(null);
            setEditingSupplier(null);
            await fetchAllData(); // Refetch data to see changes

        } catch (error) {
            setUpdateModalError(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            setIsSubmittingUpdate(false);
        }
    };

    // --- Delete Credential Logic ---
    const openDeleteModal = (credential: Credential, supplier: Supplier) => {
        setDeletingInfo({ credential, supplier });
        setDeleteError(null);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingInfo(null);
        setDeleteError(null);
        setIsDeleting(false);
    };

    const handleDeleteCredential = async () => {
        if (!deletingInfo) return;

        setIsDeleting(true);
        setDeleteError(null);

        try {
            const connectionId = deletingInfo.credential.id;
            const authToken = getAuthToken();

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/supplier-connection/delete/${connectionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                let errorMsg = 'Failed to delete connection.';
                try {
                    const result = await response.json();
                    errorMsg = result.message || errorMsg;
                } catch (e) {
                    // response was not json
                }
                throw new Error(errorMsg);
            }

            closeDeleteModal();
            await fetchAllData(); // Refresh the list

        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Test Connectivity Logic ---
    const handleTestConnectivity = async (credentialId: string, supplierId: string) => {
        const supplier = suppliers.find(s => s.id === supplierId);
        const supplierName = supplier ? supplier.name : '';

        let endpointPath: string;
        if (supplierName === 'Hyper Guest') {
            endpointPath = 'connectivityTest/hyperguest/search-test';
        } else if (supplierName === 'Hotelbeds') {
            endpointPath = 'connectivityTest/hotelbeds/search-test';
        } else if (supplierName === 'TourMind') {
            endpointPath = 'connectivityTest/tourmind/search-test';
        } else if (supplierName === 'Travelgate') {
            endpointPath = 'connectivityTest/travelgate/search-test';
        } else if (supplierName === 'Miki') {
            endpointPath = 'connectivityTest/miki/search-test';
        } else if (supplierName === 'iwtx') {
            endpointPath = 'connectivityTest/ITWX/search-test';
        } else if (supplierName === 'Welcomebeds') {
            endpointPath = 'connectivityTest/welcomebeds/search-test';
        } else {
            endpointPath = 'connectivityTest/ebooking/token-test';
        }

        const fullEndpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${endpointPath}`;
        const displayEndpoint = endpointPath;

        setTestResultInfo({ status: 'Pending', endpoint: displayEndpoint, response: null });
        setIsTestResultModalOpen(true);

        const wholesalerId = getWholesalerId();
        const authToken = getAuthToken();
        let finalTestStatus: TestStatus = 'Failed';

        try {
            // --- MODIFICATION START: DYNAMIC PAYLOAD ---
            let payload: any;
            
            if (endpointPath === 'connectivityTest/ebooking/token-test') {
                // Use the payload specified by the user
                payload = {
                    "supplierId": supplierId,
                    "wholesalerId": wholesalerId,
                    "client_id": "114c416dd39e405d2cd8e137aa49",
                    "client_secret": "b4a6da5ba4464ddeb373507bf7359bf5",
                    "scope": "read:hotels-search write:hotels-book"
                };
            } else {
                // Default payload for other suppliers
                payload = { wholesalerId, supplierId };
            }
            // --- MODIFICATION END ---
            
            const response = await fetch(fullEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (response.ok && result.success) {
                finalTestStatus = 'Success';
                setTestResultInfo({ status: 'Success', endpoint: displayEndpoint, response: result });
            } else {
                setTestResultInfo({ status: 'Failed', endpoint: displayEndpoint, response: result });
            }
        } catch (error) {
            setTestResultInfo({ status: 'Failed', endpoint: displayEndpoint, response: error instanceof Error ? { error: error.message } : { error: 'An unknown client-side error occurred.' } });
        } finally {
            setSuppliers(prevSuppliers => prevSuppliers.map(s => {
                if (s.id === supplierId) {
                    return {
                        ...s,
                        credentials: s.credentials.map(cred => {
                            if (cred.id === credentialId) {
                                return { ...cred, lastTest: { status: finalTestStatus, timestamp: new Date().toISOString() } };
                            }
                            return cred;
                        }),
                    };
                }
                return s;
            }));
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleToggleSupplier = (supplierId: string) => {
        setActiveSupplierId(prevId => (prevId === supplierId ? null : supplierId));
    };

    if (pageLoading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;

    if (pageError) return (
        <div className="flex h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
            <div className="text-center">
                <XCircle className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-lg font-medium text-red-600">Failed to Load Data</h3>
                <p className="mt-1 text-sm text-gray-500">{pageError}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 text-gray-900 dark:bg-gray-900 dark:text-white sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <h1 className="text-3xl font-bold tracking-tight">API Management</h1>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                        <Plus className="h-5 w-5" />
                        <span>Add New Credential</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {suppliers.map(supplier => (
                        <div key={supplier.id} className="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
                            <div onClick={() => handleToggleSupplier(supplier.id)} className="flex cursor-pointer items-center justify-between p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div className="flex items-center space-x-4">
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
                                                <div className="flex flex-wrap items-center gap-2"> {/* --- MODIFIED: Added flex-wrap --- */}
                                                    <button onClick={() => openUpdateModal(cred, supplier)} className="flex items-center justify-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                                        <Edit className="h-4 w-4" /><span>Edit</span>
                                                    </button>
                                                    <button onClick={() => handleTestConnectivity(cred.id, supplier.id)} className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 sm:w-auto">
                                                        <Wifi className="h-4 w-4" /><span>Test</span>
                                                    </button>
                                                    {/* --- START: ADDED DELETE BUTTON --- */}
                                                    <button onClick={() => openDeleteModal(cred, supplier)} className="flex w-full items-center justify-center gap-2 rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 sm:w-auto">
                                                        <Trash2 className="h-4 w-4" /><span>Delete</span>
                                                    </button>
                                                    {/* --- END: ADDED DELETE BUTTON --- */}
                                                </div>
                                            </div>

                                            {/* DYNAMIC CREDENTIAL DISPLAY */}
                                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 border-t border-gray-200 pt-4 dark:border-gray-700 sm:grid-cols-2">
                                                {(() => {
                                                    const fieldsConfig = supplierFieldConfig[supplier.name] || supplierFieldConfig.Default;
                                                    return fieldsConfig.map(field => {
                                                        const value = cred.values?.[field.name] || '';
                                                        const isPassword = field.type === 'password';

                                                        return (
                                                            <div key={field.name} className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    {isPassword ? <Shield className="h-4 w-4 text-gray-400" /> : <KeyRound className="h-4 w-4 text-gray-400" />}
                                                                    <label className="text-sm font-medium text-gray-800 dark:text-gray-200">{field.label}</label>
                                                                </div>
                                                                <div className="flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
                                                                    <span className="flex-1 truncate font-mono text-sm text-gray-600 dark:text-gray-400">
                                                                        {isPassword ? '••••••••••••••••••••••••' : value}
                                                                    </span>
                                                                    {!isPassword && value && (
                                                                        <button onClick={() => copyToClipboard(value)} className="ml-auto p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                                                                            <Copy className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    });
                                                })()}
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
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="m-4 w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-gray-800">
                        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700"><h2 className="text-xl font-bold">Add New Supplier Credential</h2><button onClick={() => setIsAddModalOpen(false)} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"><X className="h-6 w-6 text-gray-600 dark:text-gray-300" /></button></div>
                        <form className="space-y-4 p-6" onSubmit={handleAddNewCredential}>
                            <div>
                                <label htmlFor="supplier" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
                                <select
                                    id="supplier"
                                    value={selectedProviderId}
                                    onChange={(e) => {
                                        setSelectedProviderId(e.target.value);
                                        setAddCredentialValues({}); // Reset fields on change
                                        setAddModalError(null);
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                >
                                    <option value="">Select a supplier...</option>
                                    {allProviders.map(provider => <option key={provider._id} value={provider._id}>{provider.name}</option>)}
                                </select>
                            </div>

                            {(() => {
                                if (!selectedProviderId) return null;

                                const selectedProvider = allProviders.find(p => p._id === selectedProviderId);
                                const fieldsToRender = (selectedProvider && supplierFieldConfig[selectedProvider.name])
                                    ? supplierFieldConfig[selectedProvider.name]
                                    : supplierFieldConfig["Default"];

                                const handleInputChange = (name: string, value: string) => {
                                    setAddCredentialValues(prev => ({ ...prev, [name]: value }));
                                };

                                return fieldsToRender.map(field => (
                                    <div key={field.name}>
                                        <label htmlFor={`add-${field.name}`} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                                        {field.type === 'select' ? (
                                            <select
                                                id={`add-${field.name}`}
                                                value={addCredentialValues[field.name] || (field.options?.[0] || '')}
                                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                required
                                            >
                                                {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                id={`add-${field.name}`}
                                                placeholder={field.placeholder}
                                                value={addCredentialValues[field.name] || ''}
                                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        )}
                                    </div>
                                ));
                            })()}

                            {addModalError && (<div className="rounded-md bg-red-50 p-4 dark:bg-red-900/3D"><div className="flex"><div className="flex-shrink-0"><XCircle className="h-5 w-5 text-red-400" aria-hidden="true" /></div><div className="ml-3"><p className="text-sm font-medium text-red-800 dark:text-red-300">{addModalError}</p></div></div></div>)}
                            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700"><button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button><button type="submit" className="flex w-36 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={isSubmittingAdd}>{isSubmittingAdd ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save "}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Credential Modal (DYNAMIC) */}
            {isUpdateModalOpen && editingCredential && editingSupplier && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="m-4 w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-gray-800">
                        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
                            <h2 className="text-xl font-bold">Update {editingSupplier.name} Credential</h2>
                            <button onClick={() => setIsUpdateModalOpen(false)} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"><X className="h-6 w-6 text-gray-600 dark:text-gray-300" /></button>
                        </div>
                        <form className="space-y-4 p-6" onSubmit={handleUpdateCredential}>
                            {(() => {
                                const fieldsConfig = supplierFieldConfig[editingSupplier.name] || supplierFieldConfig.Default;
                                const handleInputChange = (name: string, value: string) => {
                                    setUpdateCredentialValues(prev => ({ ...prev, [name]: value }));
                                };
                                
                                return fieldsConfig.map(field => (
                                    <div key={field.name}>
                                        <label htmlFor={`update-${field.name}`} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                                        {field.type === 'select' ? (
                                             <select
                                                id={`update-${field.name}`}
                                                value={updateCredentialValues[field.name] || (field.options?.[0] || '')}
                                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            >
                                                {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                id={`update-${field.name}`}
                                                placeholder={field.type === 'password' ? 'Leave blank to keep current' : field.placeholder}
                                                value={updateCredentialValues[field.name] || ''}
                                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                        )}
                                    </div>
                                ));
                            })()}

                            {updateModalError && (<div className="rounded-md bg-red-50 p-4 dark:bg-red-900/3D"><div className="flex"><div className="flex-shrink-0"><XCircle className="h-5 w-5 text-red-400" aria-hidden="true" /></div><div className="ml-3"><p className="text-sm font-medium text-red-800 dark:text-red-300">{updateModalError}</p></div></div></div>)}
                            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                                <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                                <button type="submit" className="flex w-40 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={isSubmittingUpdate}>{isSubmittingUpdate ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Credential"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Test Result Modal */}
            {isTestResultModalOpen && testResultInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="m-4 w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-gray-800">
                        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
                            <h2 className="text-xl font-bold">Connectivity Test Result</h2>
                            <button onClick={() => setIsTestResultModalOpen(false)} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"><X className="h-6 w-6 text-gray-600 dark:text-gray-300" /></button>
                        </div>
                        <div className="space-y-4 p-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Endpoint</label>
                                <p className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-200">{testResultInfo.endpoint}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                                <div className="mt-1 flex items-center gap-2">
                                    {testResultInfo.status === 'Pending' && <><Loader2 className="h-5 w-5 animate-spin text-blue-500" /> <span className="text-blue-500">Testing...</span></>}
                                    {testResultInfo.status === 'Success' && <><CheckCircle2 className="h-5 w-5 text-green-500" /> <span className="font-semibold text-green-500">Success</span></>}
                                    {testResultInfo.status === 'Failed' && <><XCircle className="h-5 w-5 text-red-500" /> <span className="font-semibold text-red-500">Failed</span></>}
                                </div>
                            </div>
                            {testResultInfo.response && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">API Response</label>
                                    <pre className={`mt-1 max-h-60 overflow-y-auto rounded-lg p-4 text-sm ${testResultInfo.status === 'Success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                        {JSON.stringify(testResultInfo.response, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
                            <button type="button" onClick={() => setIsTestResultModalOpen(false)} className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- START: ADDED DELETE MODAL --- */}
            {isDeleteModalOpen && deletingInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                    <div className="m-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" aria-hidden="true" />
                                </div>
                            </div>
                            <div className="ml-4 mt-0 flex-1 text-left">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white" id="modal-title">
                                    Delete Credential
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Are you sure you want to delete the <strong>{deletingInfo.credential.name}</strong> credential for <strong>{deletingInfo.supplier.name}</strong>?
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                                <button onClick={closeDeleteModal} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                                </button>
                            </div>
                        </div>

                        {deleteError && (
                            <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800 dark:text-red-300">{deleteError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="w-full rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 sm:w-auto"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteCredential}
                                className="flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Yes, Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* --- END: ADDED DELETE MODAL --- */}

        </div>
    );
};

export default APIManagement;