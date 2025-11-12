'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import axios from 'axios';
import { 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  ConciergeBell // <-- ADDED for Service Fee
} from 'lucide-react';

// ADDED: MUI Imports for Modal, Form, and Switch
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';

// --- Helper Function to Get Auth Token ---
const getAuthToken = () => {
  if (typeof document === 'undefined') {
    // Handle server-side or non-browser environments
    return localStorage.getItem('authToken');
  }
  return (
    document.cookie
      .split('; ')
      .find((r) => r.startsWith('authToken='))
      ?.split('=')[1] || localStorage.getItem('authToken')
  );
};

// --- TypeScript Interface for Visa Data ---
interface VisaData {
  _id: string;
  country: string;
  processingTime: string;
  visaFee?: number;
  serviceFee?: number;
  price?: number; // Fallback if visaFee/serviceFee not present
  wholesaler: {
    _id: string;
    email: string;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
  totalPrice: number | null;
  id: string;
}

// --- Visa Card Component (MODIFIED) ---

interface VisaCardProps {
  visa: VisaData;
  onToggleStatus: (visaId: string) => void;
  isToggling: boolean;
}

const VisaCard: React.FC<VisaCardProps> = ({ visa, onToggleStatus, isToggling }) => {
  const total = visa.totalPrice !== null ? visa.totalPrice : visa.price;

  return (
    <div className="card-modern rounded-lg p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Card Header: Country and Status */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {visa.country}
            </h3>
          </div>
          
          <FormControlLabel
            control={
              <Switch
                checked={visa.active}
                onChange={() => onToggleStatus(visa._id)}
                disabled={isToggling}
                color="primary"
              />
            }
            label={visa.active ? "Active" : "Inactive"}
            labelPlacement="start"
            className={`text-xs font-medium ml-2 ${
              visa.active 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}
          />
        </div>

        {/* Card Body: Details and Fees */}
        <div className="space-y-4">
          
          {/* --- MODIFIED: Processing Time with colorful icon --- */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 shadow-lg shadow-blue-500/30 mr-3">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            Processing: <strong>&nbsp;{visa.processingTime}</strong>
          </div>

          {/* --- MODIFIED: Fee Breakdown with colorful icons --- */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3 text-sm"> {/* Increased spacing */}
            
            {/* Visa Fee */}
            <div className="flex items-center justify-between">
              <span className="flex items-center text-gray-500 dark:text-gray-400">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 shadow-lg shadow-green-500/30 mr-3">
                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                Visa Fee:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                ${visa.visaFee || 'N/A'}
              </span>
            </div>

            {/* Service Fee (NEW Icon and layout) */}
            <div className="flex items-center justify-between">
              <span className="flex items-center text-gray-500 dark:text-gray-400">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 shadow-lg shadow-purple-500/30 mr-3">
                  <ConciergeBell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                Service Fee:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                ${visa.serviceFee || 'N/A'}
              </span>
            </div>
          </div>
          {/* --- END OF MODIFICATION --- */}
        </div>
      </div>

      {/* Card Footer: Total Price */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-6">
        <div className="text-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Price
          </span>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
            {total !== null && total !== undefined ? `$${total}` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main Visa Module Component (Unchanged) ---

export default function VisaModule() {
  const [visas, setVisas] = useState<VisaData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Modal and Form State ---
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [country, setCountry] = useState<string>('');
  const [processingTime, setProcessingTime] = useState<string>('');
  const [visaFee, setVisaFee] = useState<string>('');
  const [serviceFee, setServiceFee] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // --- State to track which visa is being toggled ---
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisas = async () => {
      setIsLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/visa/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.success) {
          setVisas(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch visa data.');
        }
      } catch (err: any) {
        console.error('Error fetching visas:', err);
        setError(err.response?.data?.message || err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisas();
  }, []);

  // --- Handle Create Visa Submission ---
  const handleCreateVisa = async (e: FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!country || !processingTime || !visaFee || !serviceFee) {
      setModalError('Country, Processing Time, Visa Fee, and Service Fee are required.');
      return;
    }

    setIsSubmitting(true);
    const token = getAuthToken();

    try {
      const payload = {
        country: country,
        processingTime: processingTime,
        visaFee: parseFloat(visaFee),
        serviceFee: parseFloat(serviceFee),
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/visa/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        setVisas([response.data.data, ...visas]);
        setIsModalOpen(false);
        setCountry('');
        setProcessingTime('');
        setVisaFee('');
        setServiceFee('');
      } else {
        setModalError(response.data.message || 'Failed to create visa.');
      }
    } catch (err: any)
 {
      console.error('Error creating visa:', err);
      if (err.response?.data?.message && Array.isArray(err.response.data.message)) {
         setModalError(err.response.data.message.join(', '));
      } else {
         setModalError(err.response?.data?.message || err.message || 'An unknown error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle Toggle Visa Status ---
  const handleToggleStatus = async (visaId: string) => {
    setTogglingId(visaId); // Disable the switch
    setError(null); // Clear previous main errors
    const token = getAuthToken();

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/visa/toggle-status/${visaId}`,
        {}, // Empty body for PATCH, token is in headers
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        // Update the visa in the state with the new data from the server
        setVisas((prevVisas) =>
          prevVisas.map((visa) =>
            visa._id === visaId ? response.data.data : visa
          )
        );
      } else {
        setError(response.data.message || 'Failed to toggle status.');
      }
    } catch (err: any) {
      console.error('Error toggling visa status:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while updating status.');
    } finally {
      setTogglingId(null); // Re-enable the switch
    }
  };


  // --- Render Logic ---

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Loading visa data...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="card-modern rounded-lg p-12 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Failed to Load Data
          </h4>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      );
    }

    if (visas.length === 0) {
      return (
        <div className="text-center p-12 card-modern rounded-lg">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            No Visa Packages Found
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            Click "Add Visa" to create your first one.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visas.map((visa) => (
          <VisaCard 
            key={visa._id} 
            visa={visa}
            onToggleStatus={handleToggleStatus}
            isToggling={togglingId === visa._id}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-scale space-y-6">
      {/* --- Header with Add Button --- */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Visa Management
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-gradient flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Visa
        </button>
      </div>

      {/* --- Main Content Area --- */}
      {renderContent()}

      {/* --- Create Visa Modal (FIXED) --- */}
      <Dialog
        open={isModalOpen}
        onClose={isSubmitting ? undefined : () => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { '& .MuiDialogTitle-root + .MuiDialogContent-root': { paddingTop: '20px' } } }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            paddingBottom: 2,
          }}
        >
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            Add New Visa Package
          </Typography>
        </DialogTitle>
        
        <Box component="form" onSubmit={handleCreateVisa} noValidate>
          <DialogContent>
              <TextField
                id="country"
                label="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States"
                fullWidth
                margin="normal"
                disabled={isSubmitting}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                id="processingTime"
                label="Processing Time"
                value={processingTime}
                onChange={(e) => setProcessingTime(e.target.value)}
                placeholder="e.g. 7-10 business days"
                fullWidth
                margin="normal"
                disabled={isSubmitting}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                id="visaFee"
                label="Visa Fee"
                type="number"
                value={visaFee}
                // --- FIX: Removed "e.g." ---
                onChange={(e) => setVisaFee(e.target.value)}
                placeholder="e.g. 100.00"
                fullWidth
                margin="normal"
                disabled={isSubmitting}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: 0, step: "0.01" }}
              />
              
              <TextField
                id="serviceFee"
                label="Service Fee"
                type="number"
                value={serviceFee}
                // --- FIX: Removed "e.g." ---
                onChange={(e) => setServiceFee(e.target.value)}
                placeholder="e.g. 50.00"
                fullWidth
                margin="normal"
                disabled={isSubmitting}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: 0, step: "0.01" }}
              />

              {modalError && (
                <Typography color="error" variant="body2" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                  {modalError}
                </Typography>
              )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isSubmitting ? 'Creating...' : 'Create Visa'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      {/* --- END: Create Visa Modal --- */}

    </div>
  );
}