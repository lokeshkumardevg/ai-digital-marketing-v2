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
import { linkedinCrmReducer } from './slices/linkedinCrmSlice';
import reviewsReducer from './slices/reviewsSlice';
import { fetchBrands } from './slices/workspaceSlice';

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
    workflows: workflowsReducer,
    linkedinCrm: linkedinCrmReducer,
    reviews: reviewsReducer,
  },
});

// ✅ Auto-dispatch fetchBrands when auth state changes (on login)
store.subscribe(() => {
  const state = store.getState();
  const userId = state.auth?.user?._id || state.auth?.user?.id;
  const fetchStatus = state.workspace?.fetchStatus;

  // Only fetch once when user logs in and brands haven't been fetched yet
  if (userId && fetchStatus === 'idle') {
    store.dispatch(fetchBrands(userId));
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;