import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

export const fetchDashboardData = createAsyncThunk('analytics/fetchDashboardData', async () => {
  const response = await api.get('/analytics/dashboard');
  
  const historical = response.data.historical || [];
  const predictions = response.data.predictions || [];

  let combined = [];
  
  if (historical.length > 0) {
    combined.push(...historical.map((d: any) => ({ ...d, histTraffic: d.traffic, histRevenue: d.revenue })));
    
    if (predictions.length > 0) {
      const lastHistorical = historical[historical.length - 1];
      const firstPrediction = { 
        ...predictions[0], 
        ...lastHistorical, 
        isPrediction: true,
        predTraffic: predictions[0].traffic || lastHistorical.traffic,
        predRevenue: predictions[0].revenue || lastHistorical.revenue
      };
      
      combined.push(firstPrediction);
      combined.push(...predictions.slice(1).map((d: any) => ({ 
        ...d, 
        predTraffic: d.traffic, 
        predRevenue: d.revenue 
      })));
    }
  } else if (predictions.length > 0) {
    combined.push(...predictions.map((d: any) => ({ ...d, predTraffic: d.traffic, predRevenue: d.revenue })));
  }
  
  return { chartData: combined, summary: response.data.summary };
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    data: null as any | null,
    status: 'idle', 
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export const analyticsReducer = analyticsSlice.reducer;
