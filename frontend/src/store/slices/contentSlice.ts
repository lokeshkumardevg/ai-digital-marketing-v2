import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

export const fetchContent = createAsyncThunk('content/fetchContent', async () => {
  const response = await api.get('/content');
  return response.data;
});

export const createContent = createAsyncThunk('content/createContent', async (dto: any) => {
  const response = await api.post('/content/generate', dto);
  return response.data;
});

const contentSlice = createSlice({
  name: 'content',
  initialState: {
    items: [],
    status: 'idle', 
    error: null as string | null,
    generating: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(createContent.pending, (state) => {
        state.generating = true;
      })
      .addCase(createContent.fulfilled, (state, action) => {
        state.generating = false;
        state.items.unshift(action.payload as never);
      })
      .addCase(createContent.rejected, (state, action) => {
        state.generating = false;
        state.error = action.error.message || null;
      });
  },
});

export const contentReducer = contentSlice.reducer;
