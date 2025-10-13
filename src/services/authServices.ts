import { createAsyncThunk } from '@reduxjs/toolkit';
import { getBaseUrl } from '@/helpers/config/envConfig';

interface LoginPayload {
  email: string;
  password: string;
  type: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const login = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await fetch(`${getBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue({ message: data.message || 'Login failed' });
      }

      return data;
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Network error occurred',
      });
    }
  }
);

export const verifyLogin = createAsyncThunk(
  'auth/verifyLogin',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${getBaseUrl()}/auth/verify-login?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue({ message: data.message || 'Verification failed' });
      }

      return data;
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Network error occurred',
      });
    }
  }
);


