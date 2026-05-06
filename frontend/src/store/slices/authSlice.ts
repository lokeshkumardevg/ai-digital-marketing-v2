import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';
import { saveAuthUser, clearAuthUser } from '../../landing/lib/auth'; // ← adjust path if needed

// ─── Thunks ──────────────────────────────────────────────────

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  localStorage.setItem('access_token', response.data.access_token);
  return response.data.user;
});

export const registerUser = createAsyncThunk('auth/registerUser', async (dto: any) => {
  const response = await api.post('/auth/register', dto);
  localStorage.setItem('access_token', response.data.access_token);
  return response.data.user;
});

export const hydrateSession = createAsyncThunk('auth/hydrateSession', async () => {
  const response = await api.get('/auth/profile');
  return response.data;
});

export const updateUser = createAsyncThunk('auth/updateUser', async (dto: any) => {
  const response = await api.post('/auth/update', dto);
  return response.data;
});

// ─── Helper: sync user to localStorage ───────────────────────
// Called after every successful login / register / hydrate.
// This keeps auth.ts (used by Campaigns) always up to date.
const syncUserToStorage = (user: any) => {
  if (!user) return;
  saveAuthUser({
    _id:   user._id || user.id || '',
    name:  user.name  || '',
    email: user.email || '',
  });
};

// ─── Slice ───────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            null as any | null,
    isAuthenticated: false,
    status:          'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    error:           null as string | null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('access_token');
      clearAuthUser();          // ← wipe user from localStorage too
      state.user            = null;
      state.isAuthenticated = false;
      state.status          = 'idle';
      state.error           = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Login ──────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status          = 'succeeded';
        state.isAuthenticated = true;
        state.user            = { ...action.payload, permissions: ['*'] };
        syncUserToStorage(action.payload);   // ← save to localStorage
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.error.message || null;
      })

      // ── Register ───────────────────────────────────────────
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status          = 'succeeded';
        state.isAuthenticated = true;
        state.user            = { ...action.payload, permissions: ['*'] };
        syncUserToStorage(action.payload);   // ← save to localStorage
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.error.message || null;
      })

      // ── Hydrate Session (page reload) ──────────────────────
      .addCase(hydrateSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(hydrateSession.fulfilled, (state, action) => {
        state.status          = 'succeeded';
        state.isAuthenticated = true;
        state.user            = { ...action.payload, permissions: ['*'] };
        syncUserToStorage(action.payload);   // ← save to localStorage
      })
      .addCase(hydrateSession.rejected, (state) => {
        state.status          = 'failed';
        state.isAuthenticated = false;
        state.user            = null;
        clearAuthUser();                     // ← token invalid, wipe storage
      })

      // ── Update Profile ─────────────────────────────────────
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        syncUserToStorage(state.user);       // ← keep localStorage in sync
      });
  },
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;