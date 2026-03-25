import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

// Login User
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  localStorage.setItem('access_token', response.data.access_token);
  return response.data.user;
});

// Register User
export const registerUser = createAsyncThunk('auth/registerUser', async (dto: any) => {
  const response = await api.post('/auth/register', dto);
  localStorage.setItem('access_token', response.data.access_token);
  return response.data.user;
});

// Hydrate Session on Reload
export const hydrateSession = createAsyncThunk('auth/hydrateSession', async () => {
  const response = await api.get('/auth/profile');
  return response.data; // Server verifies token and returns user
});

// Update User Profile
export const updateUser = createAsyncThunk('auth/updateUser', async (dto: any) => {
  const response = await api.post('/auth/update', dto);
  return response.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null as any | null,
    isAuthenticated: false,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null as string | null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('access_token');
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = { ...action.payload, permissions: ['*'] }; // Grant '*' permission locally
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = { ...action.payload, permissions: ['*'] };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      // Hydrate Session
      .addCase(hydrateSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(hydrateSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = { ...action.payload, permissions: ['*'] };
      })
      .addCase(hydrateSession.rejected, (state) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.user = null;
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
