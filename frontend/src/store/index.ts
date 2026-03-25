import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import { workspaceReducer } from './slices/workspaceSlice';
import { notificationReducer } from './slices/notificationSlice';
import { crmReducer } from './slices/crmSlice';
import { campaignsReducer } from './slices/campaignsSlice';
import { chatbotReducer } from './slices/chatbotSlice';
import { analyticsReducer } from './slices/analyticsSlice';
import { contentReducer } from './slices/contentSlice';
import { socialReducer } from './slices/socialSlice';
import { rolesReducer } from './slices/rolesSlice';
import { workflowsReducer } from './slices/workflowsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    notifications: notificationReducer,
    crm: crmReducer,
    campaigns: campaignsReducer,
    chatbot: chatbotReducer,
    analytics: analyticsReducer,
    content: contentReducer,
    social: socialReducer,
    roles: rolesReducer,
    workflows: workflowsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
