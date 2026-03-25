import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

interface SocialState {
  posts: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  scheduling: boolean;
}

export const fetchSocialPosts = createAsyncThunk('social/fetchPosts', async (workspaceId?: string) => {
  const response = await api.get(`/social?workspaceId=${workspaceId || ''}`);
  return response.data.data;
});

export const scheduleSocialPost = createAsyncThunk('social/schedulePost', async (dto: any) => {
  const response = await api.post('/social', dto);
  return response.data.data;
});

const initialState: SocialState = {
  posts: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  scheduling: false
};

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSocialPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSocialPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.posts = action.payload;
      })
      .addCase(scheduleSocialPost.pending, (state) => {
        state.scheduling = true;
      })
      .addCase(scheduleSocialPost.fulfilled, (state, action) => {
        state.scheduling = false;
        state.posts.unshift(action.payload);
      })
      .addCase(scheduleSocialPost.rejected, (state) => {
        state.scheduling = false;
      });
  }
});

export const socialReducer = socialSlice.reducer;
