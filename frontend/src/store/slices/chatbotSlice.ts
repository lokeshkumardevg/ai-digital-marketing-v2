import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

export const fetchBots = createAsyncThunk('chatbot/fetchBots', async () => {
  const response = await api.get('/chatbot');
  return response.data;
});

export const createBot = createAsyncThunk('chatbot/createBot', async (dto: any) => {
  const response = await api.post('/chatbot', dto);
  return response.data;
});

export const fetchBotById = createAsyncThunk('chatbot/fetchBotById', async (id: string) => {
  const response = await api.get(`/chatbot/${id}`);
  return response.data;
});

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState: {
    bots: [],
    status: 'idle', 
    error: null as string | null,
    saving: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBots.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBots.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bots = action.payload;
      })
      .addCase(fetchBots.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(createBot.pending, (state) => {
        state.saving = true;
      })
      .addCase(createBot.fulfilled, (state, action) => {
        state.saving = false;
        state.bots.push(action.payload as never);
      })
      .addCase(createBot.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || null;
      })
      .addCase(fetchBotById.fulfilled, (state, action) => {
        const index = state.bots.findIndex((b: any) => b._id === action.payload._id);
        if (index !== -1) {
          state.bots[index] = action.payload as never;
        } else {
          state.bots.push(action.payload as never);
        }
      });
  },
});

export const chatbotReducer = chatbotSlice.reducer;
