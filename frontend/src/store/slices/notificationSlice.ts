import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  category?: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationState {
  items: AppNotification[];
  unreadCount: number;
  total: number;
  loading: boolean;
  synced: boolean;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  total: 0,
  loading: false,
  synced: false,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (params?: { category?: string; unreadOnly?: boolean; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.category && params.category !== 'all') q.set('category', params.category);
    if (params?.unreadOnly) q.set('unreadOnly', 'true');
    if (params?.limit) q.set('limit', String(params.limit));
    const res = await api.get(`/notifications?${q.toString()}`);
    return res.data;
  },
);

export const markOneReadAsync = createAsyncThunk('notifications/markOneRead', async (id: string) => {
  await api.patch(`/notifications/${id}/read`);
  return id;
});

export const markAllReadAsync = createAsyncThunk('notifications/markAllRead', async () => {
  await api.patch('/notifications/read-all');
});

export const deleteOneAsync = createAsyncThunk('notifications/deleteOne', async (id: string) => {
  await api.delete(`/notifications/${id}`);
  return id;
});

export const clearReadAsync = createAsyncThunk('notifications/clearRead', async () => {
  await api.delete('/notifications/clear-read');
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<AppNotification>) => {
      if (!state.items.find((n) => n.id === action.payload.id)) {
        state.items.unshift(action.payload);
        if (!action.payload.read) state.unreadCount += 1;
        state.total += 1;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      const idx = state.items.findIndex((n) => n.id === action.payload);
      if (idx !== -1) {
        if (!state.items[idx].read) state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.items.splice(idx, 1);
        state.total = Math.max(0, state.total - 1);
      }
    },
    clearReadNotifications: (state) => {
      state.items = state.items.filter((n) => !n.read);
      state.total = state.items.length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.synced = true;
        state.items = (action.payload.notifications || []).map((n: any) => ({
          id: n._id,
          title: n.title,
          message: n.message,
          type: n.type,
          category: n.category,
          time: n.createdAt,
          read: n.read,
          actionUrl: n.actionUrl,
          actionLabel: n.actionLabel,
        }));
        state.total = action.payload.total || 0;
        state.unreadCount = action.payload.unread || 0;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markOneReadAsync.fulfilled, (state, action) => {
        const n = state.items.find((item) => item.id === action.payload);
        if (n && !n.read) {
          n.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllReadAsync.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(deleteOneAsync.fulfilled, (state, action) => {
        const idx = state.items.findIndex((n) => n.id === action.payload);
        if (idx !== -1) {
          if (!state.items[idx].read) state.unreadCount = Math.max(0, state.unreadCount - 1);
          state.items.splice(idx, 1);
          state.total = Math.max(0, state.total - 1);
        }
      })
      .addCase(clearReadAsync.fulfilled, (state) => {
        state.items = state.items.filter((n) => !n.read);
        state.total = state.items.length;
      });
  },
});

export const { addNotification, markAllAsRead, deleteNotification, clearReadNotifications } =
  notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
