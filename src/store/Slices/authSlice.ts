import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login, verifyLogin } from '@/services/authServices';

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<{ data: any }>) => {
      const { data } = action.payload;
      state.token = data.token || data.accessToken || null;
      state.user = data;
      state.isAuthenticated = !!state.token;
      
      // Store token in localStorage and cookie
      if (state.token) {
        localStorage.setItem('accessToken', state.token);
        localStorage.setItem('auth', JSON.stringify(data));
        
        // Set cookie
        const expires = new Date(Date.now() + 86400e3).toUTCString(); // 24 hours
        document.cookie = `authToken=${state.token}; expires=${expires}; path=/; SameSite=Lax; Secure`;
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('auth');
      localStorage.removeItem('justVerified');
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(login.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      // Verify Login
      .addCase(verifyLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyLogin.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data;
        state.token = data.token || data.accessToken || null;
        state.user = data;
        state.isAuthenticated = !!state.token;
      })
      .addCase(verifyLogin.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Verification failed';
      });
  },
});

export const { setToken, logout, clearError } = authSlice.actions;
export default authSlice.reducer;


