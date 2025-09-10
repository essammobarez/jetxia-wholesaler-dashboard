import React, { useState, useEffect } from 'react';
import { TextField, CircularProgress, Typography, Autocomplete, Box } from '@mui/material';
import axios from 'axios';
import { FormSection } from '../ManualReservationsTab'; // Adjust path if needed

// --- TYPE UPDATED to include 'title' ---
type AgencyData = {
  _id: string;
  agencyName: string;
  title: string;
  firstName: string;
  lastName: string;
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

const AgencySelection: React.FC = () => {
  // --- State renamed for clarity ---
  const [selectedAgencyId, setSelectedAgencyId] = useState('');
  const [contactName, setContactName] = useState('');
  
  // Internal state for API data and UI
  const [agencies, setAgencies] = useState<AgencyData[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to fetch agencies from the API
  useEffect(() => {
    const fetchAgencies = async () => {
      setLoading(true);
      setError(null);
      const wholesalerId = localStorage.getItem('wholesalerId');
      if (!wholesalerId) {
        setError('Wholesaler ID not found.');
        setLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get(`agency/wholesaler/${wholesalerId}`);
        if (response.data?.success) {
          setAgencies(response.data.data);
        } else {
          setError('Failed to fetch agencies.');
        }
      } catch (err) {
        setError('An error occurred while loading agencies.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgencies();
  }, []);

  // Effect to update the contact name when an agency is selected
  useEffect(() => {
    const selected = agencies.find(a => a._id === selectedAgencyId);
    if (selected) {
      // --- LOGIC UPDATED to format the full name ---
      const fullName = `${selected.title} ${selected.firstName} ${selected.lastName}`;
      setContactName(fullName);
      
      setInputValue(selected.agencyName);
    } else {
      setContactName('');
      setInputValue('');
    }
  }, [selectedAgencyId, agencies]);

  const handleAutocompleteChange = (event: React.SyntheticEvent, value: AgencyData | null) => {
    setSelectedAgencyId(value ? value._id : '');
  };

  return (
    <FormSection title="Select Agency">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        <Autocomplete
          id="agency-autocomplete"
          options={agencies}
          getOptionLabel={(option) => option.agencyName || ""}
          value={agencies.find(a => a._id === selectedAgencyId) || null}
          onChange={handleAutocompleteChange}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Agency"
              placeholder="Search for an agency"
              InputLabelProps={{ shrink: true }} 
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <TextField
          // --- LABEL AND VALUE UPDATED ---
          label="Contact Name"
          value={contactName}
          fullWidth
          variant="outlined"
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Wholesaler"
          value="Booked By Wholesaler"
          fullWidth
          variant="outlined"
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
        />
        
        {error && (
          <Typography color="error" className="col-span-1 md:col-span-2">
            {error}
          </Typography>
        )}
      </div>
    </FormSection>
  );
};

export default AgencySelection;