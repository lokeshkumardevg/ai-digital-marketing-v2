import { createSlice } from '@reduxjs/toolkit';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  time: string;
  read: boolean;
}

interface NotificationState {
  items: AppNotification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  items: [
    { 
      id: 'demo-1', 
      title: 'AI Swarm Online', 
      message: 'Nexus orchestration node initialized.', 
      type: 'info', 
      time: new Date().toISOString(), 
      read: false 
    }
  ],
  unreadCount: 1
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAllAsRead: (state) => {
      state.items.forEach(n => n.read = true);
      state.unreadCount = 0;
    },
    clearReadNotifications: (state) => {
      state.items = state.items.filter(n => !n.read);
    }
  }
});

export const { addNotification, markAllAsRead, clearReadNotifications } = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
