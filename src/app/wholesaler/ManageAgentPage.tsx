'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { TextField, InputAdornment, Tooltip } from '@mui/material';
import { Person, Email, Phone, Lock, Visibility, VisibilityOff } from '@mui/icons-material';

interface AgentForm {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
}

export default function CreateAgentPage() {
  const [form, setForm] = useState<AgentForm>({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);  // For showing/hiding password

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.API_URL}agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to create agent');
      toast.success('Agent created successfully!');
      setForm({ firstName: '', lastName: '', email: '', mobileNumber: '', password: '' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(password);
    setShowGeneratedPassword(true);
  };

  const handlePasswordClick = () => {
    if (generatedPassword) {
      setForm({ ...form, password: generatedPassword });
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Create Agent (Dummy data)</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* First Name and Last Name in One Row (using flexbox) */}
        <div className="flex gap-4">
          <TextField
            name="firstName"
            label="First Name"
            value={form.firstName}
            onChange={handleChange}
            fullWidth
            required
            placeholder="Enter First Name"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
            className="transition-transform duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <TextField
            name="lastName"
            label="Last Name"
            value={form.lastName}
            onChange={handleChange}
            fullWidth
            required
            placeholder="Enter Last Name"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
            className="transition-transform duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email Field */}
        <TextField
          name="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          required
          placeholder="Enter Email"
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
          className="transition-transform duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Mobile Number Field */}
        <TextField
          name="mobileNumber"
          label="Mobile Number"
          value={form.mobileNumber}
          onChange={handleChange}
          fullWidth
          required
          placeholder="Enter Mobile Number"
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone />
              </InputAdornment>
            ),
          }}
          className="transition-transform duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Password Field */}
        <div className="relative">
          <TextField
            name="password"
            label="Password"
            type={passwordVisible ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
            placeholder="Enter Password"
            onClick={generatePassword}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={passwordVisible ? 'Hide Password' : 'Show Password'}>
                    <span
                      onClick={togglePasswordVisibility}
                      className="cursor-pointer text-gray-500 hover:text-gray-700"
                    >
                      {passwordVisible ? <VisibilityOff /> : <Visibility />}
                    </span>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            className="transition-transform duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Display Generated Password */}
          {showGeneratedPassword && generatedPassword && (
            <div className="mt-3 p-2 border rounded-md shadow-md bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <span className="font-semibold text-gray-600">Generated Password: </span>
              <span
                onClick={handlePasswordClick}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                {generatedPassword}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
        >
          {submitting ? 'Creating...' : 'Create Agent'}
        </button>
      </form>
    </div>
  );
}
