// components/BackofficeRemarks.tsx

import React, { useState, ReactNode } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  ListItemText,
  ListItemIcon,
  Typography,
} from '@mui/material';
import { Plus } from 'lucide-react';

// Import FontAwesome icons
import {
  FaBed,
  FaSmokingBan,
  FaRegHeart,
  FaDoorOpen,
  FaSun,
  FaUtensils,
  FaMoon,
  FaWineGlassAlt,
  FaPlusCircle,
  FaExchangeAlt,
  FaConciergeBell,
  FaQuestionCircle,
} from 'react-icons/fa';

// Section wrapper
type SectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
  button?: ReactNode;
};

const FormSection: React.FC<SectionProps> = ({ title, children, className = '', button }) => (
  <div className={`bg-white shadow-md rounded-xl p-6 md:p-8 ${className}`}>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {button}
    </div>
    <div className="space-y-6">{children}</div>
  </div>
);

// Extended option type with icon
type RemarkOption = {
  code: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
};

// Props for enhanced select
type MuiSelectCheckboxProps = {
  label: string;
  placeholder: string;
  options: RemarkOption[];
  value: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

const FormSelectCheckbox: React.FC<MuiSelectCheckboxProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <TextField
      label={label}
      select
      value={value}
      onChange={onChange}
      SelectProps={{
        multiple: true,
        displayEmpty: true,
        renderValue: (selected: unknown) => {
          if (!Array.isArray(selected) || selected.length === 0) {
            return <span className="text-gray-400">{placeholder}</span>;
          }
          const selectedNames = options
            .filter(opt => selected.includes(opt.code))
            .map(opt => opt.name);
          return selectedNames.join(', ');
        },
        MenuProps: {
          PaperProps: {
            style: {
              maxHeight: 300,
              maxWidth: '100%',
            },
          },
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
          <ListItemIcon>
            <option.icon className="text-gray-600" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography component="span" variant="body2">
                {option.name}
              </Typography>
            }
          />
          <Checkbox checked={value.includes(option.code)} />
        </MenuItem>
      ))}
    </TextField>
  );
};

type BackofficeRemarksProps = {
  comments: string;
  setComments: (value: string) => void;
};

const BackofficeRemarks: React.FC<BackofficeRemarksProps> = ({
  comments,
  setComments,
}) => {
  // Define enhanced remarks with icons
  const remarksOptions: RemarkOption[] = [
    { code: 'KING_SIZE_BED', name: 'King Size Bed', icon: FaBed },
    { code: 'NON_SMOKING', name: 'Non Smoking Room', icon: FaSmokingBan },
    { code: 'TWIN_BEDS', name: 'Twin Beds', icon: FaBed },
    { code: 'HONEYMOONERS', name: 'Honeymooners', icon: FaRegHeart },
    { code: 'LATE_CHECK_IN', name: 'Late Check In', icon: FaDoorOpen },
    { code: 'EARLY_CHECK_IN', name: 'Early Check In', icon: FaSun },
    { code: 'DINNER', name: 'Dinner', icon: FaUtensils },
    { code: 'BREAKFAST', name: 'Breakfast', icon: FaMoon },
    { code: 'LUNCH_SUPPLEMENT', name: 'Lunch Supplement', icon: FaWineGlassAlt },
    { code: 'ROOM_UPGRADE', name: 'Room Upgrade', icon: FaPlusCircle },
    { code: 'CONNECT_ROOMS', name: 'Connect Rooms', icon: FaExchangeAlt },
    { code: 'HOTEL_MEMBERSHIP', name: 'Hotel Membership', icon: FaConciergeBell },
    { code: 'MISC', name: 'Misc', icon: FaQuestionCircle },
  ];

  const [openModal, setOpenModal] = useState(false);
  const [selectedRemarks, setSelectedRemarks] = useState<string[]>([]);
  const [addedRemarks, setAddedRemarks] = useState<string[]>([]);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRemarks([]);
  };

  const handleAddRemark = () => {
    if (selectedRemarks.length > 0) {
      setAddedRemarks(prev => {
        const newRemarks = selectedRemarks.filter(remark => !prev.includes(remark));
        return [...prev, ...newRemarks];
      });
      handleCloseModal();
    }
  };

  const addButton = (
    <Button
      variant="outlined"
      size="small"
      startIcon={<Plus size={16} />}
      onClick={handleOpenModal}
      sx={{ minWidth: 'auto', padding: '6px 12px' }}
    >
      Add Remark
    </Button>
  );

  return (
    <>
      <FormSection title="Backoffice Remarks" button={addButton}>
        <div className="flex flex-col gap-4">
          {addedRemarks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {addedRemarks.map((remarkCode, index) => {
                const option = remarksOptions.find(opt => opt.code === remarkCode);
                const remarkName = option?.name || remarkCode;
                return (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1"
                  >
                    {option && <option.icon className="text-blue-600" />}
                    {remarkName}
                  </span>
                );
              })}
            </div>
          )}

          <TextField
            label="Comments"
            placeholder="Enter comments"
            multiline
            rows={4}
            value={comments}
            onChange={e => setComments(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ placeholder: 'Enter comments' }}
            variant="outlined"
            fullWidth
            className="mt-4"
          />
        </div>
      </FormSection>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="xs"
        sx={{
          '& .MuiDialog-paper': {
            minHeight: '320px',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle>Add New Remarks</DialogTitle>
        <DialogContent sx={{ 
          minHeight: 150, 
          padding: '24px 24px 16px',
          overflowY: 'visible'
        }}>
          <FormSelectCheckbox
            label="Select Remarks"
            placeholder="Select remarks"
            options={remarksOptions}
            value={selectedRemarks}
            onChange={e => setSelectedRemarks(e.target.value as string[])}
            className="w-full mt-4"
          />
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center', 
          padding: '16px 24px', 
          gap: 1,
          borderTop: '1px solid #e0e0e0',
          bgcolor: '#fff'
        }}>
          <Button
            onClick={handleCloseModal}
            color="secondary"
            variant="outlined"
            sx={{ width: 'auto', minWidth: 80 }}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleAddRemark}
            color="primary"
            variant="contained"
            sx={{ width: 'auto', minWidth: 80 }}
            disabled={selectedRemarks.length === 0}
          >
            SUBMIT
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BackofficeRemarks;