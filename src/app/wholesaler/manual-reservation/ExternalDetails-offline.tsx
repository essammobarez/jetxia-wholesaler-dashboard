// path: ./manual-reservation/ExternalDetails.tsx

import React from 'react';
import { ReactNode } from 'react';
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
  language: string;
  setLanguage: (value: string) => void;
  agentRef: string;
  setAgentRef: (value: string) => void;
  supplierConfirmation: string;
  setSupplierConfirmation: (value: string) => void;
  currencies: Array<{ code: string; name: string }>;
  languages: Array<{ code: string; name: string }>;
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
  language,
  setLanguage,
  agentRef,
  setAgentRef,
  supplierConfirmation,
  setSupplierConfirmation,
  currencies,
  languages,
}) => {
  const reservationStatusOptions = [
    { code: 'CONF', name: 'Confirmed' },
    { code: 'PEND', name: 'Pending' },
    { code: 'CANC', name: 'Cancelled' },
  ];

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
        <FormInput
          label="Supplier Name"
          placeholder="Enter supplier name"
          value={supplierName}
          onChange={e => setSupplierName(e.target.value)}
        />
        <FormSelectSimple
          label="Currency"
          placeholder="Select currency"
          options={currencies}
          value={currency}
          onChange={e => setCurrency(e.target.value)}
        />
        <FormInput
          label="Supplier Code"
          placeholder="Enter supplier code"
          value={supplierCode}
          onChange={e => setSupplierCode(e.target.value)}
        />
        <FormInput
          label="Backoffice Ref"
          placeholder="Enter backoffice ref"
          value={backofficeRef}
          onChange={e => setBackofficeRef(e.target.value)}
        />
        <FormSelectSimple
          label="Language"
          placeholder="Select language"
          options={languages}
          value={language}
          onChange={e => setLanguage(e.target.value)}
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