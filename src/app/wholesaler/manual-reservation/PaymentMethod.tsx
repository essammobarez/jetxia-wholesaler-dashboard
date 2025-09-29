import React from 'react';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl
} from '@mui/material';
import { FormSection } from '../ManualReservation'; // Import shared component

// --- TYPE DEFINITIONS ---
interface PaymentMethodProps {
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
}

// --- COMPONENT ---
export const PaymentMethod: React.FC<PaymentMethodProps> = ({
  paymentMethod,
  setPaymentMethod,
}) => {

  // --- HANDLERS ---
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod((event.target as HTMLInputElement).value);
  };

  // --- RENDER ---
  return (
    <FormSection title="Payment Method">
      <FormControl component="fieldset">
        <RadioGroup
          row
          aria-label="payment-method"
          name="payment-method-group"
          value={paymentMethod}
          onChange={handleChange}
        >
          <FormControlLabel value="paylater" control={<Radio />} label="Paylater" />
          <FormControlLabel value="credit" control={<Radio />} label="Credit" />
        </RadioGroup>
      </FormControl>
    </FormSection>
  );
};