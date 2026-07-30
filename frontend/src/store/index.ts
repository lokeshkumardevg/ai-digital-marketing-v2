import { configureStore } from '@reduxjs/toolkit';
import reputationReducer from './slices/Reputationslice';
import { authReducer } from './slices/authSlice';
import { workspaceReducer, fetchBrands, resetWorkspace } from './slices/workspaceSlice';
import { notificationReducer } from './slices/notificationSlice';
import { crmReducer } from './slices/crmSlice';
import { campaignsReducer, resetCampaigns } from './slices/campaignsSlice';
import { chatbotReducer } from './slices/chatbotSlice';
import { analyticsReducer } from './slices/analyticsSlice';
import { contentReducer } from './slices/contentSlice';
import { socialReducer } from './slices/socialSlice';
import { rolesReducer } from './slices/rolesSlice';
import { workflowsReducer } from './slices/workflowsSlice';
import { linkedinCrmReducer } from './slices/linkedinCrmSlice';
import reviewsReducer from './slices/reviewsSlice';
import themeReducer from './slices/themeSlice';

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
    reputation: reputationReducer,
    reviews: reviewsReducer,
    theme: themeReducer,
  },
});

// ✅ Auto-dispatch fetchBrands when auth user changes (login or workspace impersonation)
// Clears all cached data for previous user before loading new user's workspace.
// This prevents data leakage when admin "View Workspace" switches between clients.
let lastFetchedUserId: string | null = null;

store.subscribe(() => {
  const state = store.getState();
  const userId = state.auth?.user?._id || state.auth?.user?.id;

  if (userId && userId !== lastFetchedUserId) {
    lastFetchedUserId = userId;
    // 1. Clear stale workspace brands from previous user
    store.dispatch(resetWorkspace());
    // 2. Clear stale cached campaigns from previous user
    store.dispatch(resetCampaigns());
    // 3. Fetch fresh brands for this new user
    store.dispatch(fetchBrands(userId));
  } else if (!userId) {
    lastFetchedUserId = null;
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;