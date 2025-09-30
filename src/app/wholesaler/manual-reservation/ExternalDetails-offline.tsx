// path: ./manual-reservation/ExternalDetails.tsx

import React, { ReactNode, useState, useEffect } from 'react';
import { TextField, MenuItem } from '@mui/material';
import currencyCodes from 'currency-codes';
import isoCountries from 'i18n-iso-countries';

// Register English (you can add more locales if needed)
isoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'));

// Section wrapper and form component types and components
type SectionProps = {
    title: string;
    children: ReactNode;
    className?: string;
};

const FormSection: React.FC<SectionProps> = ({ title, children, className = '' }) => (
    <div className={`bg-white shadow-md rounded-xl p-6 md:p-8 ${className}`}>
        <h2 className="text-xl font-semibold mb-6 text-gray-800">{title}</h2>
        <div className="space-y-6">{children}</div>
    </div>
);

type MuiInputProps = {
    label: string;
    placeholder: string;
    type?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    multiline?: boolean;
    rows?: number;
    disabled?: boolean; // Added disabled prop
};

const FormInput: React.FC<MuiInputProps> = ({
    label,
    placeholder,
    type = 'text',
    value,
    onChange,
    className = '',
    multiline = false,
    rows,
    disabled = false,
}) => (
    <TextField
        label={label}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
        InputLabelProps={{ shrink: true }}
        inputProps={{ placeholder }}
        fullWidth
        variant="outlined"
        multiline={multiline}
        rows={rows}
        className={className}
        disabled={disabled} // Added disabled prop
    />
);

type MuiSelectSimpleProps = {
    label: string;
    placeholder: string;
    options: Array<{ code: string; name: string }>;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
};

const FormSelectSimple: React.FC<MuiSelectSimpleProps> = ({
    label,
    placeholder,
    options,
    value,
    onChange,
    className = '',
}) => (
    <TextField
        label={label}
        select
        value={value}
        onChange={onChange}
        SelectProps={{
            displayEmpty: true,
            renderValue: (selected: unknown) => {
                if (!selected) return <span className="text-gray-400">{placeholder}</span>;
                const selectedOption = options.find(opt => opt.code === selected);
                return selectedOption ? selectedOption.name : (selected as string);
            },
        }}
        InputLabelProps={{ shrink: true }}
        inputProps={{ 'aria-label': placeholder }}
        fullWidth
        variant="outlined"
        className={className}
    >
        <MenuItem value="" disabled>
            {placeholder}
        </MenuItem>
        {options.map(option => (
            <MenuItem key={option.code} value={option.code}>
                {option.name}
            </MenuItem>
        ))}
    </TextField>
);

// Define the type for the provider data
type Provider = {
    _id: string;
    name: string;
    // Add other fields from the fetch idea if needed, but _id and name are essential
};

// ExternalDetailsProps
type ExternalDetailsProps = {
    externalId: string;
    setExternalId: (value: string) => void;
    reservationStatus: string;
    setReservationStatus: (value: string) => void;
    supplierName: string;
    setSupplierName: (value: string) => void;
    currency: string;
    setCurrency: (value: string) => void;
    supplierCode: string;
    setSupplierCode: (value: string) => void;
    backofficeRef: string;
    setBackofficeRef: (value: string) => void;
    agentRef: string;
    setAgentRef: (value: string) => void;
    supplierConfirmation: string;
    setSupplierConfirmation: (value: string) => void;
    currencies: Array<{ code: string; name: string }>;
};

// New ExternalDetails component
export const ExternalDetails: React.FC<ExternalDetailsProps> = ({
    externalId,
    setExternalId,
    reservationStatus,
    setReservationStatus,
    supplierName,
    setSupplierName,
    currency,
    setCurrency,
    supplierCode,
    setSupplierCode,
    backofficeRef,
    setBackofficeRef,
    agentRef,
    setAgentRef,
    supplierConfirmation,
    setSupplierConfirmation,
    currencies,
}) => {
    const [wholesalerId, setWholesalerId] = useState<string | null>(null);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(true);
    // State to hold the _id of the selected provider
    const [selectedProviderId, setSelectedProviderId] = useState<string>('');

    const reservationStatusOptions = [
        { code: 'CONF', name: 'Confirmed' },
        { code: 'PEND', name: 'Pending' },
        { code: 'CANC', name: 'Cancelled' },
    ];

    // 1. Fetch wholesalerId from localStorage
    useEffect(() => {
        const storedId = localStorage.getItem("wholesalerId");
        if (storedId) {
            setWholesalerId(storedId);
        } else {
            setLoadingProviders(false); // No ID, stop loading
        }
    }, []);

    // 2. Fetch providers when wholesalerId is available
    useEffect(() => {
        const fetchProviders = async (id: string) => {
            setLoadingProviders(true);
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            const endpoint = `/offline-provider/by-wholesaler/${id}`;
            const url = `${baseUrl}${endpoint}`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Provider[] = await response.json();
                setProviders(data);
            } catch (error) {
                console.error('Error fetching offline providers:', error);
                setProviders([]); // Clear providers on error
            } finally {
                setLoadingProviders(false);
            }
        };

        if (wholesalerId) {
            fetchProviders(wholesalerId);
        }
    }, [wholesalerId]);

    // Handle supplier selection: set both the name and the _id
    const handleSupplierSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const providerId = e.target.value; // The value is the provider's _id
        setSelectedProviderId(providerId); // Set the selected ID
        
        // Find the selected provider object
        const selectedProvider = providers.find(p => p._id === providerId);
        
        // 3. Set supplierName and auto-fill supplierCode with _id
        if (selectedProvider) {
            setSupplierName(selectedProvider.name);
            setSupplierCode(selectedProvider._id); // Auto-fill with _id
        } else {
            setSupplierName('');
            setSupplierCode('');
        }
    };

    const providerOptions = providers.map(p => ({
        code: p._id, // Use _id as the code for the select value
        name: p.name, // Use name for display
    }));

    return (
        <FormSection title="External Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <FormSelectSimple
                    label="External ID"
                    placeholder="Select external ID"
                    options={[{ code: 'EXT1', name: 'External ID 1' }]}
                    value={externalId}
                    onChange={e => setExternalId(e.target.value)}
                />
                <FormSelectSimple
                    label="Reservation Status"
                    placeholder="Select reservation status"
                    options={reservationStatusOptions}
                    value={reservationStatus}
                    onChange={e => setReservationStatus(e.target.value)}
                />
                {/* Changed Supplier Name to Select Supplier using FormSelectSimple */}
                <FormSelectSimple
                    label={loadingProviders ? "Loading Suppliers..." : "Select Supplier"}
                    placeholder="Select a supplier"
                    options={providerOptions}
                    value={selectedProviderId} // Use selectedProviderId to manage the selection
                    onChange={handleSupplierSelect} // Use the new handler
                    className={loadingProviders ? 'opacity-50' : ''}
                />
                <FormSelectSimple
                    label="Currency"
                    placeholder="Select currency"
                    options={currencies}
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                />
                {/* Supplier Code input field has been removed from the UI */}
                <FormInput
                    label="Backoffice Ref"
                    placeholder="Enter backoffice ref"
                    value={backofficeRef}
                    onChange={e => setBackofficeRef(e.target.value)}
                />
                <FormInput
                    label="Agent Ref"
                    placeholder="Enter agent ref"
                    value={agentRef}
                    onChange={e => setAgentRef(e.target.value)}
                />
                <FormInput
                    label="Supplier Confirmation"
                    placeholder="Enter supplier confirmation"
                    value={supplierConfirmation}
                    onChange={e => setSupplierConfirmation(e.target.value)}
                />
            </div>
        </FormSection>
    );
};