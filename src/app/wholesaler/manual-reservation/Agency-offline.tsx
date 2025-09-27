import React, { useState, useEffect, ReactNode } from 'react';
import { TextField, CircularProgress, Typography, Autocomplete, Box, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

// Assuming FormSection is exported from ManualReservationsTab
export const FormSection: React.FC<{ title: string; children: ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-white shadow-md rounded-xl p-6 md:p-8 ${className}`}>
        <h2 className="text-xl font-semibold mb-6 text-gray-800">{title}</h2>
        <div className="space-y-6">{children}</div>
    </div>
);

// UPDATE: Added a new prop 'onAgencyDataSelect' to pass data up to the parent component.
type AgencyProps = {
    selectedAgencyId: string;
    setSelectedAgencyId: (agencyId: string) => void;
    agencyName: string;
    setAgencyName: (value: string) => void;
    onAgencyDataSelect: (data: { walletBalance: number; markup: number }) => void;
};

// UPDATE: Expanded the AgencyData type to match the full API response structure.
type AgencyData = {
    _id: string;
    agencyName: string;
    firstName: string;
    lastName: string;
    walletBalance: {
        mainBalance: number;
    };
    markup: number;
    markupPlan?: {
        markups: {
            provider: { _id: string; name: string } | null;
            type: 'percentage' | 'fixed';
            value: number;
        }[];
    };
};


const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

const Agency: React.FC<AgencyProps> = ({
    selectedAgencyId,
    setSelectedAgencyId,
    agencyName,
    setAgencyName,
    onAgencyDataSelect, // UPDATE: Destructured the new prop.
}) => {
    const [agencies, setAgencies] = useState<AgencyData[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAgencies = async () => {
            setLoading(true);
            setError(null);
            const wholesalerId = localStorage.getItem('wholesalerId');

            if (!wholesalerId) {
                setError('Wholesaler ID not found in local storage.');
                setLoading(false);
                return;
            }

            try {
                const response = await axiosInstance.get(`agency/wholesaler/${wholesalerId}`);
                if (response.data && response.data.success) {
                    setAgencies(response.data.data);
                } else {
                    setError('Failed to fetch agencies. Invalid API response.');
                }
            } catch (err) {
                console.error('API Error:', err);
                setError('Failed to load agencies. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAgencies();
    }, []);

    useEffect(() => {
        const selected = agencies.find(a => a._id === selectedAgencyId);
        if (selected) {
            setAgencyName(`${selected.firstName} ${selected.lastName}`);
            setInputValue(selected.agencyName);
        } else {
            setAgencyName('');
            setInputValue('');
        }
    }, [selectedAgencyId, agencies, setAgencyName]);

    // UPDATE: This function now extracts wallet balance and markup and sends it to the parent.
    const handleAutocompleteChange = (event: React.SyntheticEvent, value: AgencyData | null) => {
        setSelectedAgencyId(value ? value._id : '');

        if (value) {
            const walletBalance = value.walletBalance?.mainBalance || 0;
            let markup = value.markup || 0; // Default to top-level markup

            // If a markup plan exists, find a general percentage markup
            if (value.markupPlan && value.markupPlan.markups) {
                const generalMarkup = value.markupPlan.markups.find(
                    m => m.provider === null && m.type === 'percentage'
                );
                if (generalMarkup) {
                    markup = generalMarkup.value;
                }
            }
            // Pass the extracted data to the parent component
            onAgencyDataSelect({ walletBalance, markup });
        } else {
            // Reset data when the selection is cleared
            onAgencyDataSelect({ walletBalance: 0, markup: 0 });
        }
    };


    const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
        setInputValue(newInputValue);
    };

    // UPDATE: The clear handler now also resets the wallet and markup data in the parent.
    const handleClear = () => {
        setSelectedAgencyId('');
        setInputValue('');
        onAgencyDataSelect({ walletBalance: 0, markup: 0 });
    };

    return (
        <FormSection title="Select Agency">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <Autocomplete
                    id="agency-autocomplete"
                    options={agencies}
                    getOptionLabel={(option) => option.agencyName || ""}
                    value={agencies.find(agency => agency._id === selectedAgencyId) || null}
                    onChange={handleAutocompleteChange}
                    inputValue={inputValue}
                    onInputChange={handleInputChange}
                    loading={loading}
                    sx={{ width: '100%' }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Select Agency"
                            variant="outlined"
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
                    renderOption={(props, option) => (
                        <Box component="li" {...props} key={option._id}>
                            {option.agencyName}
                        </Box>
                    )}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Box
                                key={option._id}
                                sx={{
                                    backgroundColor: '#e0f7fa',
                                    borderRadius: '16px',
                                    padding: '4px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                <Typography variant="body2">{option.agencyName}</Typography>
                                <IconButton
                                    size="small"
                                    onClick={handleClear}
                                    sx={{ p: 0 }}
                                >
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            </Box>
                        ))
                    }
                    noOptionsText={loading ? 'Loading agencies...' : 'No agencies found'}
                />

                <TextField
                    label="Agency Name"
                    value={agencyName}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                />

                <TextField
                    label="Wholesaler"
                    value="Booked by Wholesaler"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    variant="outlined"
                    InputProps={{ readOnly: true }}
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

export default Agency;