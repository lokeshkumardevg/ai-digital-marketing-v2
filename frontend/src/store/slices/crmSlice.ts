import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

export const fetchAudiences = createAsyncThunk('crm/fetchAudiences', async () => {
  const response = await api.get('/crm/audiences');
  return response.data;
});

export const createAudience = createAsyncThunk('crm/createAudience', async (goal: string) => {
  const response = await api.post('/crm/audience/generate', { goal });
  return response.data;
});

const crmSlice = createSlice({
  name: 'crm',
  initialState: {
    audiences: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null as string | null,
    generating: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAudiences.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAudiences.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.audiences = action.payload;
      })
      .addCase(fetchAudiences.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(createAudience.pending, (state) => {
        state.generating = true;
      })
      .addCase(createAudience.fulfilled, (state, action) => {
        state.generating = false;
        state.audiences.unshift(action.payload as never);
      })
      .addCase(createAudience.rejected, (state, action) => {
        state.generating = false;
        state.error = action.error.message || null;
      });
  },
});

export const crmReducer = crmSlice.reducer;
