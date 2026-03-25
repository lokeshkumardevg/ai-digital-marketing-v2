import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

export const fetchWorkflows = createAsyncThunk('workflows/fetchWorkflows', async (websiteId?: string) => {
  const response = await api.get(`/workflows?websiteId=${websiteId || ''}`);
  return response.data.data;
});

export const toggleWorkflow = createAsyncThunk('workflows/toggleWorkflow', async (id: string) => {
  const response = await api.put(`/workflows/${id}/toggle`);
  return response.data.data;
});

interface WorkflowState {
  workflows: any[];
  loading: boolean;
}

const initialState: WorkflowState = {
  workflows: [],
  loading: false
};

const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkflows.pending, (state) => { state.loading = true; })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.loading = false;
        state.workflows = action.payload;
      })
      .addCase(toggleWorkflow.fulfilled, (state, action) => {
        state.workflows = state.workflows.map((w: any) => w._id === action.payload._id ? action.payload : w);
      });
  }
});

export const workflowsReducer = workflowsSlice.reducer;
