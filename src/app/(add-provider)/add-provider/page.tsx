'use client';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Box
} from '@mui/material';

interface ToastProps {
  message: string;
  onClose: () => void;
}

function Toast({ message, onClose }: ToastProps): React.ReactElement {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-2xl shadow-lg">
      {message}
    </div>
  );
}

export default function AddSupplierPage(): React.ReactElement {
  const [formData, setFormData] = useState<{
    name: string;
    apiBaseUrl: string;
    authType: string;
    logoUrl: string;
    tokenExpiryHours: number;
    isActive: boolean;
    notes: string;
  }>({
    name: '',
    apiBaseUrl: '',
    authType: 'Basic',
    logoUrl: '',
    tokenExpiryHours: 24,
    isActive: true,
    notes: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
const res = await fetch(
  `${process.env.API_URL}provider/register`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  }
);

      if (!res.ok) throw new Error(`Status ${res.status}`);
      await res.json();
      setSuccess('Supplier added successfully');
      setShowToast(true);
      setFormData({
        name: '',
        apiBaseUrl: '',
        authType: 'Basic',
        logoUrl: '',
        tokenExpiryHours: 24,
        isActive: true,
        notes: ''
      });
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 bg-white rounded-2xl shadow">
      {showToast && success && (
        <Toast message={success} onClose={() => setShowToast(false)} />
      )}
      <h2 className="text-xl font-semibold mb-4">Add New Supplier</h2>
      
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2  // vertical gap between fields
        }}
      >
        {/* Name */}
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
          placeholder="Enter supplier name"
          InputLabelProps={{ shrink: true }}
        />

        {/* API Base URL */}
        <TextField
          label="API Base URL"
          name="apiBaseUrl"
          value={formData.apiBaseUrl}
          onChange={handleChange}
          required
          fullWidth
          placeholder="https://api.example.com"
          InputLabelProps={{ shrink: true }}
        />

        {/* Auth Type */}
        <TextField
          select
          label="Auth Type"
          name="authType"
          value={formData.authType}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value="Basic">Basic</MenuItem>
          <MenuItem value="Bearer">Bearer</MenuItem>
          <MenuItem value="APIKey">APIKey</MenuItem>
        </TextField>

        {/* Logo URL */}
        <TextField
          label="Logo URL"
          name="logoUrl"
          type="url"
          value={formData.logoUrl}
          onChange={handleChange}
          fullWidth
          placeholder="https://cdn.example.com/logo.png"
          InputLabelProps={{ shrink: true }}
        />

        {/* Token Expiry Hours */}
        <TextField
          label="Token Expiry (Hours)"
          name="tokenExpiryHours"
          type="number"
          value={formData.tokenExpiryHours}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: 1 }}
        />

        {/* Active Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
          }
          label="Active"
        />

        {/* Notes */}
        <TextField
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          placeholder="Any additional notes..."
          InputLabelProps={{ shrink: true }}
        />

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Supplier'}
          </Button>
        </Box>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </Box>
    </div>
  );
}
