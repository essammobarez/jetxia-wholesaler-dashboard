import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

// Reusable Input Field Component for Email and Password
interface InputFieldProps {
  type: 'email' | 'password';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  showPassword?: boolean;
  toggleShowPassword?: () => void;
}

export function InputField({
  type,
  value,
  onChange,
  label,
  showPassword,
  toggleShowPassword,
}: InputFieldProps) {
  if (type === 'password') {
    return (
      <TextField
        label={label}
        variant="outlined"
        fullWidth
        type={showPassword ? 'text' : 'password'}
        InputLabelProps={{ shrink: true, style: { fontWeight: 'bold', fontSize: '1.1rem' } }}
        InputProps={{
          style: { fontSize: '1.1rem' },
          endAdornment: (
            <InputAdornment position="end">
              <button type="button" onClick={toggleShowPassword}>
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </InputAdornment>
          ),
        }}
        placeholder="••••••••"
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      InputLabelProps={{
        shrink: true,
        style: { fontWeight: 'bold', fontSize: '1.1rem' },
      }}
      InputProps={{ style: { fontSize: '1.1rem' } }}
      placeholder="john.doe@gmail.com"
      value={value}
      onChange={onChange}
    />
  );
}