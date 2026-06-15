import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';
import { hydrateSession } from './authSlice';

interface PlatformConnections {
  linkedin: boolean;
  twitter: boolean;
  facebook: boolean;
  instagram: boolean;
}

interface SocialState {
  posts: Record<string, unknown>[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  scheduling: boolean;
  publishing: boolean;
  connections: PlatformConnections;
  connecting: Record<string, boolean>;
  lastPublishResults: Record<string, { success: boolean; error?: string; postId?: string }>;
  error: string | null;
}

interface SocialPublishPayload {
  content: string;
  media?: string[];
  platforms: string[];
  workspaceId?: string;
}

interface SocialSchedulePayload extends SocialPublishPayload {
  scheduledFor: string;
}

export const fetchSocialPosts = createAsyncThunk('social/fetchPosts', async (workspaceId?: string) => {
  const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
  const response = await api.get(`/social${query}`);
  return response.data.data;
});

export const fetchConnections = createAsyncThunk('social/fetchConnections', async () => {
  const response = await api.get('/social/connections');
  return response.data.data as PlatformConnections;
});

export const connectPlatform = createAsyncThunk(
  'social/connectPlatform',
  async (platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram') => {
    const response = await api.get(`/social/auth/${platform}`);
    return { platform, url: response.data.data.url as string };
  },
);

export const disconnectPlatform = createAsyncThunk(
  'social/disconnectPlatform',
  async (platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram', thunkAPI) => {
    await api.post(`/social/auth/${platform}/disconnect`);
    thunkAPI.dispatch(hydrateSession());
    return platform;
  },
);

export const publishPost = createAsyncThunk('social/publishPost', async (dto: SocialPublishPayload) => {
  const response = await api.post('/social/publish', dto);
  return response.data.data;
});

export const schedulePost = createAsyncThunk('social/schedulePost', async (dto: SocialSchedulePayload) => {
  const response = await api.post('/social/schedule', dto);
  return response.data.data;
});

const initialState: SocialState = {
  posts: [],
  status: 'idle',
  scheduling: false,
  publishing: false,
  connections: {
    linkedin: false,
    twitter: false,
    facebook: false,
    instagram: false,
  },
  connecting: {},
  lastPublishResults: {},
  error: null,
};

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSocialPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSocialPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.posts = action.payload;
      })
      .addCase(fetchSocialPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load social posts.';
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.connections = action.payload;
      })
      .addCase(connectPlatform.pending, (state, action) => {
        state.connecting[action.meta.arg] = true;
      })
      .addCase(connectPlatform.fulfilled, (state, action) => {
        state.connecting[action.payload.platform] = false;
      })
      .addCase(connectPlatform.rejected, (state, action) => {
        state.connecting[action.meta.arg] = false;
        state.error = action.error.message || 'Failed to connect platform.';
      })
      .addCase(disconnectPlatform.fulfilled, (state, action) => {
        state.connections[action.payload] = false;
      })
      .addCase(publishPost.pending, (state) => {
        state.publishing = true;
        state.error = null;
      })
      .addCase(publishPost.fulfilled, (state, action) => {
        state.publishing = false;
        state.posts.unshift(action.payload);
        state.lastPublishResults = action.payload.results || {};
      })
      .addCase(publishPost.rejected, (state, action) => {
        state.publishing = false;
        state.error = action.error.message || 'Publishing failed.';
      })
      .addCase(schedulePost.pending, (state) => {
        state.scheduling = true;
        state.error = null;
      })
      .addCase(schedulePost.fulfilled, (state, action) => {
        state.scheduling = false;
        state.posts.unshift(action.payload);
      })
      .addCase(schedulePost.rejected, (state, action) => {
        state.scheduling = false;
        state.error = action.error.message || 'Scheduling failed.';
      });
  }
});

export const socialReducer = socialSlice.reducer;
