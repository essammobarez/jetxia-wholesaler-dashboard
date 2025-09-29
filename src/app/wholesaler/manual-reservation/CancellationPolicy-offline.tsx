// components/CancellationPolicy.tsx

import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  useTheme,
} from '@mui/material';
import { Trash2, Edit, Plus } from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; 
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';

interface Policy {
  id: number;
  type: string;
  date: Dayjs | null;
  price: string;
}

// Hardcode the two required policy options
const POLICY_OPTIONS = [
  { code: 'flexible', name: 'Flexible' },
  { code: 'non_refundable', name: 'Non-Refundable' },
];

interface CancellationPolicyProps {
  policies: Policy[];
  setPolicies: React.Dispatch<React.SetStateAction<Policy[]>>;
  totalPrice: string; // e.g., "1250.00"
}

export const CancellationPolicy: React.FC<CancellationPolicyProps> = ({
  policies,
  setPolicies,
  totalPrice,
}) => {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [policyType, setPolicyType] = useState('');
  const [policyDate, setPolicyDate] = useState<Dayjs | null>(dayjs());

  const handleOpenModal = (policy?: Policy) => {
    if (policy) {
      setCurrentPolicy(policy);
      setPolicyType(policy.type);
      setPolicyDate(policy.date);
    } else {
      setCurrentPolicy(null);
      setPolicyType('');
      setPolicyDate(dayjs());
    }
    setOpenModal(true);
    setIsCalendarOpen(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setIsCalendarOpen(false);
  };

  const handleSavePolicy = () => {
    const finalPolicyDate = policyType === 'Flexible' ? policyDate : null;
    const displayPrice = `$${totalPrice}`;

    if (currentPolicy) {
      setPolicies(prevPolicies =>
        prevPolicies.map(p =>
          p.id === currentPolicy.id
            ? { ...p, type: policyType, date: finalPolicyDate, price: displayPrice }
            : p
        )
      );
    } else {
      const newPolicy: Policy = {
        id: Date.now(),
        type: policyType,
        date: finalPolicyDate,
        price: displayPrice,
      };
      setPolicies(prevPolicies => [...prevPolicies, newPolicy]);
    }
    handleCloseModal();
  };

  const handleRemovePolicy = (id: number) => {
    setPolicies(prevPolicies => prevPolicies.filter(policy => policy.id !== id));
  };

  useEffect(() => {
    if (openModal && policyType === 'Flexible') {
      setTimeout(() => {
        setIsCalendarOpen(true);
      }, 100);
    } else {
      setIsCalendarOpen(false);
    }
  }, [policyType, openModal]);

  const isFlexible = policyType === 'Flexible';
  const today = dayjs().startOf('day');

  return (
    <>
      <div className="bg-white shadow-md rounded-xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Cancellation Policy</h2>
          <Button
            variant="outlined"
            startIcon={<Plus />}
            onClick={() => handleOpenModal()}
            sx={{
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            Add New Cancellation Policy
          </Button>
        </div>
        <div className="space-y-6">
          {policies.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead>
                  <tr className="text-gray-600 bg-gray-100">
                    <th className="p-3 font-medium text-center">SL</th>
                    <th className="p-3 font-medium text-center">Type</th>
                    <th className="p-3 font-medium text-center">Date</th>
                    <th className="p-3 font-medium text-center">Price</th>
                    <th className="p-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy, index) => (
                    <tr
                      key={policy.id}
                      className="text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <td className="p-3 text-center">{index + 1}</td>
                      <td className="p-3 text-center">{policy.type}</td>
                      <td className="p-3 text-center">
                        {policy.date?.format('YYYY-MM-DD') || 'N/A'}
                      </td>
                      <td className="p-3 text-center font-medium">{policy.price}</td>
                      <td className="p-3">
                        <div className="flex justify-center items-center space-x-2">
                          <IconButton
                            onClick={() => handleOpenModal(policy)}
                            size="small"
                            color="primary"
                            sx={{
                              '&:hover': {
                                backgroundColor: theme.palette.primary.lighter || 'rgba(0, 123, 255, 0.1)',
                              },
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleRemovePolicy(policy.id)}
                            size="small"
                            color="error"
                            sx={{
                              '&:hover': {
                                backgroundColor: theme.palette.error.lighter || 'rgba(255, 0, 0, 0.1)',
                              },
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-md w-full"
          sx={{
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom fontWeight="600">
            {currentPolicy ? 'Edit Cancellation Policy' : 'Add New Cancellation Policy'}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="space-y-5 mt-4">
              <TextField
                select
                label="Policy Type"
                InputLabelProps={{ shrink: true }}
                SelectProps={{ displayEmpty: true }}
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Select Cancellation Policy
                </MenuItem>
                {POLICY_OPTIONS.map((option) => (
                  <MenuItem key={option.code} value={option.name}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>

              {isFlexible && (
                <DatePicker
                  label="Cancellation Date"
                  value={policyDate}
                  onChange={(newValue) => setPolicyDate(newValue)}
                  format="YYYY-MM-DD"
                  open={isCalendarOpen}
                  onOpen={() => setIsCalendarOpen(true)}
                  onClose={() => setIsCalendarOpen(false)}
                  minDate={today} // 🔒 Blocks previous dates
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      InputLabelProps: { shrink: true },
                    },
                    actionBar: {
                      actions: ['today', 'cancel'],
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              )}

              {/* ✅ Non-editable Cancellation Price showing totalPrice */}
              <TextField
                label="Cancellation Price"
                value={totalPrice}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  readOnly: true,
                }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.action.hover,
                    '& fieldset': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.divider,
                    },
                  },
                  '& .MuiInputBase-input': {
                    cursor: 'not-allowed',
                    color: theme.palette.text.primary,
                  },
                }}
              />
            </div>
          </LocalizationProvider>
          <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePolicy}
              variant="contained"
              color="primary"
              disabled={!policyType}
              sx={{
                fontWeight: '600',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};