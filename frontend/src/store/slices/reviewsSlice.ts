import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

// ─── Types ─────────────────────────────────────────────────
export interface Review {
  _id: string;
  brandId: string;
  platform: 'google' | 'facebook' | 'trustpilot' | 'website';
  reviewerName: string;
  reviewerAvatar: string;
  content: string;
  rating: number;
  status: 'pending' | 'replied' | 'ignored';
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  topics: string[];
  generatedReply: string;
  publishedReply: string;
  isReplied: boolean;
  isResolved: boolean;
  reviewDate: string;
  createdAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  positiveSentiment: number;
  negativeSentiment: number;
  responseRate: number;
  reviewGrowth: number;
  byPlatform: Record<string, number>;
  ratingDistribution: Record<string, number>;
  trend: Array<{ _id: string; count: number; avgRating: number }>;
}

interface ReviewsState {
  reviews: Review[];
  stats: ReviewStats | null;
  total: number;
  totalPages: number;
  currentPage: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  statsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  aiReplyStatus: Record<string, 'idle' | 'loading' | 'done'>;
  publishStatus: Record<string, 'idle' | 'loading' | 'done'>;
  activeReviewId: string | null;
  filters: {
    platform: string;
    sentiment: string;
    status: string;
    rating: string;
    search: string;
  };
  error: string | null;
}

const initialState: ReviewsState = {
  reviews: [],
  stats: null,
  total: 0,
  totalPages: 1,
  currentPage: 1,
  status: 'idle',
  statsStatus: 'idle',
  aiReplyStatus: {},
  publishStatus: {},
  activeReviewId: null,
  filters: { platform: 'all', sentiment: 'all', status: 'all', rating: '', search: '' },
  error: null,
};

// ─── Thunks ─────────────────────────────────────────────────
export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (params: Record<string, any>, { rejectWithValue }) => {
    try {
      const res = await api.get('/reviews', { params });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const fetchReviewStats = createAsyncThunk(
  'reviews/fetchStats',
  async (brandId: string, { rejectWithValue }) => {
    try {
      const res = await api.get('/reviews/dashboard/stats', { params: { brandId } });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const seedReviews = createAsyncThunk(
  'reviews/seed',
  async (brandId: string, { rejectWithValue }) => {
    try {
      const res = await api.post('/reviews/seed', { brandId });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to seed');
    }
  }
);

export const generateAiReply = createAsyncThunk(
  'reviews/generateAiReply',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/reviews/${reviewId}/generate-reply`);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to generate reply');
    }
  }
);

export const publishReply = createAsyncThunk(
  'reviews/publishReply',
  async ({ reviewId, replyText }: { reviewId: string; replyText: string }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/reviews/${reviewId}/publish-reply`, { replyText });
      return { ...res.data, replyText, reviewId };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to publish');
    }
  }
);

export const markReviewResolved = createAsyncThunk(
  'reviews/markResolved',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/reviews/${reviewId}/resolve`);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to resolve');
    }
  }
);

// ─── Slice ──────────────────────────────────────────────────
const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setActiveReview: (state, action) => { state.activeReviewId = action.payload; },
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    resetFilters: (state) => { state.filters = initialState.filters; },
    setPage: (state, action) => { state.currentPage = action.payload; },
    clearStatus: (state) => { state.status = 'idle'; state.statsStatus = 'idle'; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchReviews.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.reviews = a.payload.reviews;
        s.total = a.payload.total;
        s.totalPages = a.payload.totalPages;
        s.currentPage = a.payload.page;
      })
      .addCase(fetchReviews.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload as string; })

      .addCase(fetchReviewStats.pending, (s) => { s.statsStatus = 'loading'; })
      .addCase(fetchReviewStats.fulfilled, (s, a) => { s.statsStatus = 'succeeded'; s.stats = a.payload; })
      .addCase(fetchReviewStats.rejected, (s) => { s.statsStatus = 'failed'; })

      .addCase(generateAiReply.pending, (s, a) => { s.aiReplyStatus[a.meta.arg] = 'loading'; })
      .addCase(generateAiReply.fulfilled, (s, a) => {
        s.aiReplyStatus[a.payload.reviewId] = 'done';
        const review = s.reviews.find(r => r._id === a.payload.reviewId);
        if (review) review.generatedReply = a.payload.generatedReply;
      })
      .addCase(generateAiReply.rejected, (s, a) => { s.aiReplyStatus[a.meta.arg] = 'idle'; })

      .addCase(publishReply.pending, (s, a) => { s.publishStatus[a.meta.arg.reviewId] = 'loading'; })
      .addCase(publishReply.fulfilled, (s, a) => {
        s.publishStatus[a.payload.reviewId] = 'done';
        const review = s.reviews.find(r => r._id === a.payload.reviewId);
        if (review) {
          review.isReplied = true;
          review.status = 'replied';
          review.publishedReply = a.payload.replyText;
        }
      })
      .addCase(publishReply.rejected, (s, a) => { s.publishStatus[a.meta.arg.reviewId] = 'idle'; })

      .addCase(markReviewResolved.fulfilled, (s, a) => {
        const review = s.reviews.find(r => r._id === a.payload.reviewId);
        if (review) { review.isResolved = true; review.status = 'ignored'; }
      })

      .addCase(seedReviews.fulfilled, (s) => { s.status = 'idle'; s.statsStatus = 'idle'; });
  },
});

export const { setActiveReview, setFilter, resetFilters, setPage, clearStatus } = reviewsSlice.actions;
export default reviewsSlice.reducer;
