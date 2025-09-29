// PriceInformation.tsx
import React from 'react';
import { TextField } from '@mui/material';

// --- SHARED COMPONENTS (Simplified for context) ---

type MuiInputProps = {
  label: string;
  placeholder: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
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
    disabled={disabled}
  />
);

type FormSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

const FormSection: React.FC<FormSectionProps> = ({ title, children, className = '' }) => (
  <div className={`bg-white shadow-md rounded-xl p-6 md:p-8 ${className}`}>
    <h2 className="text-xl font-semibold mb-6 text-gray-800">{title}</h2>
    <div className="space-y-6 md:space-y-0">{children}</div>
  </div>
);


// Component Props
type PriceInformationProps = {
  supplierPrice: string;
  markup: string;
  setMarkup: (value: string) => void;
  commission: string;
  setCommission: (value: string) => void;
  totalPrice: string;
};

/**
 * Component for managing Price Information fields.
 * Uses a FOUR-COLUMN layout and now uses FULL WIDTH.
 */
export const PriceInformation: React.FC<PriceInformationProps> = ({
  supplierPrice,
  markup,
  setMarkup,
  commission,
  setCommission,
  totalPrice,
}) => {
  return (
    // Removed max-w-xl to allow full width
    <FormSection title="Price Information"> 
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-8">
        
        {/* Supplier Price - Spans 1 column */}
        <FormInput
          label="Supplier Price"
          placeholder="Calculated price"
          value={supplierPrice}
          type="number"
          className="md:col-span-1" 
          disabled
        />
        
        {/* Markup - Spans 1 column */}
        <FormInput
          label="Markup (%)"
          placeholder="Enter markup"
          value={markup}
          type="number"
          onChange={e => setMarkup(e.target.value)}
          className="md:col-span-1"
        />
        
        {/* Commission - Spans 1 column */}
        <FormInput
          label="Commission"
          placeholder="Enter commission"
          value={commission}
          type="number"
          onChange={e => setCommission(e.target.value)}
          className="md:col-span-1"
        />
        
        {/* Total Price - Spans 1 column */}
        <FormInput
          label="Total Price"
          placeholder="Calculated total price"
          value={totalPrice}
          type="number"
          className="md:col-span-1"
          disabled
        />
      </div>
    </FormSection>
  );
};