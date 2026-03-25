import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

export const fetchCampaigns = createAsyncThunk('campaigns/fetchCampaigns', async () => {
  const response = await api.get('/campaigns');
  return response.data;
});

export const createCampaign = createAsyncThunk('campaigns/createCampaign', async (dto: any) => {
  const response = await api.post('/campaigns/auto-generate', dto);
  return response.data;
});

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState: {
    campaigns: [],
    status: 'idle', 
    error: null as string | null,
    generating: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(createCampaign.pending, (state) => {
        state.generating = true;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.generating = false;
        state.campaigns.unshift(action.payload as never);
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.generating = false;
        state.error = action.error.message || null;
      });
  },
});

export const campaignsReducer = campaignsSlice.reducer;
