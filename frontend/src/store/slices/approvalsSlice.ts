import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

export interface ApprovalItem {
  _id?: string;
  approvalId: string;
  runId: string;
  agentId: string;
  coworker: 'max' | 'stella' | 'atlas' | 'echo';
  title: string;
  description: string;
  actionType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  proposedData: Record<string, any>;
  originalContext?: Record<string, any>;
  editedData?: Record<string, any>;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

interface ApprovalsState {
  items: ApprovalItem[];
  pendingCount: number;
  total: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  actionStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ApprovalsState = {
  items: [],
  pendingCount: 0,
  total: 0,
  status: 'idle',
  actionStatus: 'idle',
  error: null,
};

export const fetchApprovals = createAsyncThunk(
  'approvals/fetchApprovals',
  async (params?: { status?: string; coworker?: string; page?: number; limit?: number }) => {
    const response = await api.get('/v1/approvals', { params });
    return response.data;
  },
);

export const fetchPendingCount = createAsyncThunk(
  'approvals/fetchPendingCount',
  async () => {
    const response = await api.get('/v1/approvals/count');
    return response.data.pendingCount as number;
  },
);

export const approveApproval = createAsyncThunk(
  'approvals/approve',
  async ({ approvalId, editedData, notes }: { approvalId: string; editedData?: Record<string, any>; notes?: string }) => {
    const response = await api.post(`/v1/approvals/${approvalId}/approve`, { editedData, notes });
    return { approvalId, result: response.data };
  },
);

export const rejectApproval = createAsyncThunk(
  'approvals/reject',
  async ({ approvalId, reason }: { approvalId: string; reason: string }) => {
    const response = await api.post(`/v1/approvals/${approvalId}/reject`, { reason });
    return { approvalId, result: response.data, reason };
  },
);

export const simulateApprovalEvent = createAsyncThunk(
  'approvals/simulateEvent',
  async (payload: { type?: 'review' | 'budget'; rating?: number; reviewText?: string; reviewerName?: string }) => {
    const response = await api.post('/v1/approvals/simulate', payload);
    return response.data;
  },
);

const approvalsSlice = createSlice({
  name: 'approvals',
  initialState,
  reducers: {
    incrementPendingCount: (state) => {
      state.pendingCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch approvals
      .addCase(fetchApprovals.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchApprovals.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.pendingCount = action.payload.pendingCount ?? state.pendingCount;
      })
      .addCase(fetchApprovals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch approvals';
      })
      // Pending count
      .addCase(fetchPendingCount.fulfilled, (state, action) => {
        state.pendingCount = action.payload;
      })
      // Approve
      .addCase(approveApproval.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(approveApproval.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const index = state.items.findIndex((item) => item.approvalId === action.payload.approvalId);
        if (index !== -1) {
          state.items[index].status = 'approved';
        }
        if (state.pendingCount > 0) state.pendingCount -= 1;
      })
      .addCase(approveApproval.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.error.message || 'Approval failed';
      })
      // Reject
      .addCase(rejectApproval.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.approvalId === action.payload.approvalId);
        if (index !== -1) {
          state.items[index].status = 'rejected';
          state.items[index].rejectionReason = action.payload.reason;
        }
        if (state.pendingCount > 0) state.pendingCount -= 1;
      });
  },
});

export const { incrementPendingCount } = approvalsSlice.actions;
export const approvalsReducer = approvalsSlice.reducer;

