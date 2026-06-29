import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

// ─── Types ──────────────────────────────────────────────────────────────────

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

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  brandId: string;
  requestSent: boolean;
  createdAt: string;
}

export interface RatingTrendPoint {
  date: string;
  averageRating: number;
  count: number;
}

export interface SentimentTrendPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  mixed: number;
}

export interface TopicBreakdownItem {
  topic: string;
  count: number;
  sentiment: string;
}

export interface Analytics {
  ratingTrend: RatingTrendPoint[];
  sentimentTrend: SentimentTrendPoint[];
  topicBreakdown: TopicBreakdownItem[];
}

// ─── ReputationInsight ───────────────────────────────────────────────────────
export interface ReputationInsight {
  _id: string;
  userId: string;
  brandId: string;
  mostCommonComplaint: string;
  mostLovedFeature: string;
  reviewGrowthOpportunity: string;
  suggestedCampaign: string;
  suggestedSocialPosts: string[];
  suggestedEmailCampaign: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  _id: string;
  brandId: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  isApplied: boolean;
  createdAt: string;
}

// ─── State ──────────────────────────────────────────────────────────────────

interface LoadState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface ReputationState {
  // Dashboard
  dashboardStats: ReviewStats | null;
  dashboardLoad: LoadState;

  // Reviews
  reviews: Review[];
  reviewDetail: Review | null;
  reviewsTotal: number;
  reviewsTotalPages: number;
  reviewsCurrentPage: number;
  reviewsLoad: LoadState;
  reviewDetailLoad: LoadState;
  activeReviewId: string | null;
  filters: {
    platform: string;
    sentiment: string;
    status: string;
    rating: string;
    search: string;
  };

  // Per-review action statuses
  aiReplyStatus: Record<string, 'idle' | 'loading' | 'done'>;
  publishStatus: Record<string, 'idle' | 'loading' | 'done'>;
  resolveStatus: Record<string, 'idle' | 'loading' | 'done'>;

  // Customers
  customers: Customer[];
  customersTotal: number;
  customersTotalPages: number;
  customersCurrentPage: number;
  customersLoad: LoadState;
  addCustomerLoad: LoadState;
  importCustomersLoad: LoadState;
  sendRequestStatus: Record<string, 'idle' | 'loading' | 'done'>;

  // Analytics
  analytics: Analytics;
  analyticsLoad: LoadState;

  // Recommendations
  insight: ReputationInsight | null;
  recommendationsLoad: LoadState;
  generateRecsLoad: LoadState;
}

const mkLoad = (): LoadState => ({ status: 'idle', error: null });

const initialState: ReputationState = {
  // Dashboard
  dashboardStats: null,
  dashboardLoad: mkLoad(),

  // Reviews
  reviews: [],
  reviewDetail: null,
  reviewsTotal: 0,
  reviewsTotalPages: 1,
  reviewsCurrentPage: 1,
  reviewsLoad: mkLoad(),
  reviewDetailLoad: mkLoad(),
  activeReviewId: null,
  filters: { platform: 'all', sentiment: 'all', status: 'all', rating: '', search: '' },
  aiReplyStatus: {},
  publishStatus: {},
  resolveStatus: {},

  // Customers
  customers: [],
  customersTotal: 0,
  customersTotalPages: 1,
  customersCurrentPage: 1,
  customersLoad: mkLoad(),
  addCustomerLoad: mkLoad(),
  importCustomersLoad: mkLoad(),
  sendRequestStatus: {},

  // Analytics
  analytics: { ratingTrend: [], sentimentTrend: [], topicBreakdown: [] },
  analyticsLoad: mkLoad(),

  // Recommendations
  insight: null,
  recommendationsLoad: mkLoad(),
  generateRecsLoad: mkLoad(),
};

// ─── Helper: extract single insight from any response shape ─────────────────
const extractInsight = (payload: any): ReputationInsight | null => {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] ?? null;
  if (Array.isArray(payload?.data)) return payload.data[0] ?? null;
  if (payload._id) return payload;
  return null;
};

// ─── Thunks ─────────────────────────────────────────────────────────────────

export const fetchDashboardStats = createAsyncThunk(
  'reputation/fetchDashboardStats',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/reputation/dashboard/stats', { params });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchReviews = createAsyncThunk(
  'reputation/fetchReviews',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/reputation/reviews', { params });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const fetchReviewDetail = createAsyncThunk(
  'reputation/fetchReviewDetail',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/reputation/reviews/${reviewId}`);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch review detail');
    }
  }
);

export const generateAiReply = createAsyncThunk(
  'reputation/generateAiReply',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/generate-reply/${reviewId}`);
      return { ...res.data, reviewId };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to generate AI reply');
    }
  }
);

export const publishReply = createAsyncThunk(
  'reputation/publishReply',
  async ({ reviewId, replyText }: { reviewId: string; replyText: string }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/reputation/reviews/${reviewId}/publish-reply`, { replyText });
      return { ...res.data, reviewId, replyText };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to publish reply');
    }
  }
);

export const resolveReview = createAsyncThunk(
  'reputation/resolveReview',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/reputation/reviews/${reviewId}/resolve`);
      return { ...res.data, reviewId };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to resolve review');
    }
  }
);

export const fetchCustomers = createAsyncThunk(
  'reputation/fetchCustomers',
  async (params: Record<string, any> & { brandId?: string } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/reputation/customers', { params });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const addCustomer = createAsyncThunk(
  'reputation/addCustomer',
  async (payload: Partial<Customer>, { rejectWithValue }) => {
    try {
      const res = await api.post('/reputation/customers', payload);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to add customer');
    }
  }
);

// ─── NEW: createLead thunk (matches POST /reputation/leads) ─────────────────
export const createLead = createAsyncThunk(
  'reputation/createLead',
  async (
    payload: {
      firstName: string;
      lastName:  string;
      email:     string;
      phone?:    string;
      source?:   string;
      brandId?:  string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post('/reputation/leads', payload);
      return res.data; // { success: true, customerId, data: Customer }
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to create lead');
    }
  }
);

// ─── NEW: createLeadsBulk thunk (POST /reputation/leads/bulk) ───────────────
export const createLeadsBulk = createAsyncThunk(
  'reputation/createLeadsBulk',
  async (
    leads: Array<{
      firstName: string;
      lastName:  string;
      email:     string;
      phone?:    string;
      source?:   string;
      brandId?:  string;
    }>,
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post('/reputation/leads/bulk', { leads });
      return res.data; // { success, inserted, customers: Customer[] }
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to bulk import leads');
    }
  }
);

export const importCustomersCSV = createAsyncThunk(
  'reputation/importCustomersCSV',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await api.post('/reputation/customers/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to import CSV');
    }
  }
);

export const sendReviewRequest = createAsyncThunk(
  'reputation/sendReviewRequest',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/reputation/customers/${customerId}/send-request`);
      return { ...res.data, customerId };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to send review request');
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'reputation/fetchAnalytics',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const [ratingRes, sentimentRes, topicRes] = await Promise.all([
        api.get('/reputation/analytics/rating-trend', { params }),
        api.get('/reputation/analytics/sentiment-trend', { params }),
        api.get('/reputation/analytics/topic-breakdown', { params }),
      ]);
      return {
        ratingTrend:    ratingRes.data,
        sentimentTrend: sentimentRes.data,
        topicBreakdown: topicRes.data,
      };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'reputation/fetchRecommendations',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/reputation/recommendations', { params });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch recommendations');
    }
  }
);

export const generateRecommendations = createAsyncThunk(
  'reputation/generateRecommendations',
  async (payload: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const res = await api.post('/reputation/recommendations/generate', payload);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to generate recommendations');
    }
  }
);

// ─── FIX: deleteCustomer — plain string arg (was { customerId, brandId }) ───
export const deleteCustomer = createAsyncThunk(
  'reputation/deleteCustomer',
  async ({ id, brandId }: { id: string; brandId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/reputation/customers/${id}`, {
        params: { brandId },  // → DELETE /reputation/customers/:id?brandId=xxx
      });
      return { id };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to delete customer');
    }
  }
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const setLoading   = (load: LoadState) => { load.status = 'loading';   load.error = null; };
const setSucceeded = (load: LoadState) => { load.status = 'succeeded'; load.error = null; };
const setFailed    = (load: LoadState, error: string) => { load.status = 'failed'; load.error = error; };

// ─── Slice ───────────────────────────────────────────────────────────────────

const reputationSlice = createSlice({
  name: 'reputation',
  initialState,
  reducers: {
    setActiveReview: (state, action: PayloadAction<string | null>) => {
      state.activeReviewId = action.payload;
    },
    setFilter: (state, action: PayloadAction<Partial<ReputationState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.reviewsCurrentPage = 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setReviewsPage: (state, action: PayloadAction<number>) => {
      state.reviewsCurrentPage = action.payload;
    },
    setCustomersPage: (state, action: PayloadAction<number>) => {
      state.customersCurrentPage = action.payload;
    },
    clearReviewDetail: (state) => {
      state.reviewDetail = null;
      state.reviewDetailLoad = mkLoad();
    },
  },
  extraReducers: (builder) => {
    builder

      // ── Dashboard Stats ──────────────────────────────────────────────────
      .addCase(fetchDashboardStats.pending,   (s)    => setLoading(s.dashboardLoad))
      .addCase(fetchDashboardStats.fulfilled, (s, a) => { setSucceeded(s.dashboardLoad); s.dashboardStats = a.payload; })
      .addCase(fetchDashboardStats.rejected,  (s, a) => setFailed(s.dashboardLoad, a.payload as string))

      // ── Reviews List ─────────────────────────────────────────────────────
      .addCase(fetchReviews.pending,   (s)    => setLoading(s.reviewsLoad))
      .addCase(fetchReviews.fulfilled, (s, a) => {
        setSucceeded(s.reviewsLoad);
        s.reviews            = a.payload.reviews ?? a.payload;
        s.reviewsTotal       = a.payload.total      ?? s.reviews.length;
        s.reviewsTotalPages  = a.payload.totalPages ?? 1;
        s.reviewsCurrentPage = a.payload.page       ?? 1;
      })
      .addCase(fetchReviews.rejected,  (s, a) => setFailed(s.reviewsLoad, a.payload as string))

      // ── Review Detail ────────────────────────────────────────────────────
      .addCase(fetchReviewDetail.pending,   (s)    => setLoading(s.reviewDetailLoad))
      .addCase(fetchReviewDetail.fulfilled, (s, a) => { setSucceeded(s.reviewDetailLoad); s.reviewDetail = a.payload; })
      .addCase(fetchReviewDetail.rejected,  (s, a) => setFailed(s.reviewDetailLoad, a.payload as string))

      // ── Generate AI Reply ────────────────────────────────────────────────
      .addCase(generateAiReply.pending,   (s, a) => { s.aiReplyStatus[a.meta.arg] = 'loading'; })
      .addCase(generateAiReply.fulfilled, (s, a) => {
        s.aiReplyStatus[a.payload.reviewId] = 'done';
        const review = s.reviews.find((r) => r._id === a.payload.reviewId);
        if (review) review.generatedReply = a.payload.generatedReply;
        if ((s.reviewDetail as any)?._id === a.payload.reviewId) (s.reviewDetail as any).generatedReply = a.payload.generatedReply;
      })
      .addCase(generateAiReply.rejected,  (s, a) => { s.aiReplyStatus[a.meta.arg] = 'idle'; })

      // ── Publish Reply ────────────────────────────────────────────────────
      .addCase(publishReply.pending,   (s, a) => { s.publishStatus[a.meta.arg.reviewId] = 'loading'; })
      .addCase(publishReply.fulfilled, (s, a) => {
        s.publishStatus[a.payload.reviewId] = 'done';
        const review = s.reviews.find((r) => r._id === a.payload.reviewId);
        if (review) { review.isReplied = true; review.status = 'replied'; review.publishedReply = a.payload.replyText; }
        if ((s.reviewDetail as any)?._id === a.payload.reviewId) {
          (s.reviewDetail as any).isReplied     = true;
          (s.reviewDetail as any).status        = 'replied';
          (s.reviewDetail as any).publishedReply = a.payload.replyText;
        }
      })
      .addCase(publishReply.rejected,  (s, a) => { s.publishStatus[a.meta.arg.reviewId] = 'idle'; })

      // ── Resolve Review ───────────────────────────────────────────────────
      .addCase(resolveReview.pending,   (s, a) => { s.resolveStatus[a.meta.arg] = 'loading'; })
      .addCase(resolveReview.fulfilled, (s, a) => {
        s.resolveStatus[a.payload.reviewId] = 'done';
        const review = s.reviews.find((r) => r._id === a.payload.reviewId);
        if (review) { review.isResolved = true; review.status = 'ignored'; }
        if ((s.reviewDetail as any)?._id === a.payload.reviewId) {
          (s.reviewDetail as any).isResolved = true;
          (s.reviewDetail as any).status     = 'ignored';
        }
      })
      .addCase(resolveReview.rejected,  (s, a) => { s.resolveStatus[a.meta.arg] = 'idle'; })

      // ── Customers List ───────────────────────────────────────────────────
      .addCase(fetchCustomers.pending,   (s)    => setLoading(s.customersLoad))
      .addCase(fetchCustomers.fulfilled, (s, a) => {
        setSucceeded(s.customersLoad);
        const payload = a.payload;
        const list: Customer[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.customers)
            ? payload.customers
            : Array.isArray(payload?.data)
              ? payload.data
              : [];
        s.customers            = list;
        s.customersTotal       = payload?.total      ?? list.length;
        s.customersTotalPages  = payload?.totalPages ?? 1;
        s.customersCurrentPage = payload?.page       ?? 1;
      })
      .addCase(fetchCustomers.rejected,  (s, a) => setFailed(s.customersLoad, a.payload as string))

      // ── Add Customer (legacy) ─────────────────────────────────────────────
      .addCase(addCustomer.pending,   (s)    => setLoading(s.addCustomerLoad))
      .addCase(addCustomer.fulfilled, (s, a) => {
        setSucceeded(s.addCustomerLoad);
        s.customers.unshift(a.payload);
        s.customersTotal += 1;
      })
      .addCase(addCustomer.rejected,  (s, a) => setFailed(s.addCustomerLoad, a.payload as string))

      // ── Create Lead (POST /reputation/leads) ─────────────────────────────
      .addCase(createLead.pending,   (s)    => setLoading(s.addCustomerLoad))
      .addCase(createLead.fulfilled, (s, a) => {
        setSucceeded(s.addCustomerLoad);
        // backend returns { success, customerId, data: Customer }
        const customer: Customer = a.payload.data ?? a.payload;
        s.customers.unshift(customer);
        s.customersTotal += 1;
      })
      .addCase(createLead.rejected,  (s, a) => setFailed(s.addCustomerLoad, a.payload as string))

      // ── Create Leads Bulk (POST /reputation/leads/bulk) ──────────────────
      .addCase(createLeadsBulk.pending,   (s)    => setLoading(s.importCustomersLoad))
      .addCase(createLeadsBulk.fulfilled, (s, a) => {
        setSucceeded(s.importCustomersLoad);
        // prepend all newly created customers to the list
        const incoming: Customer[] = a.payload.customers ?? [];
        s.customers      = [...incoming, ...s.customers];
        s.customersTotal = s.customersTotal + incoming.length;
      })
      .addCase(createLeadsBulk.rejected,  (s, a) => setFailed(s.importCustomersLoad, a.payload as string))

      // ── Import CSV ───────────────────────────────────────────────────────
      .addCase(importCustomersCSV.pending,   (s)    => setLoading(s.importCustomersLoad))
      .addCase(importCustomersCSV.fulfilled, (s)    => setSucceeded(s.importCustomersLoad))
      .addCase(importCustomersCSV.rejected,  (s, a) => setFailed(s.importCustomersLoad, a.payload as string))

      // ── Send Review Request ──────────────────────────────────────────────
      .addCase(sendReviewRequest.pending,   (s, a) => { s.sendRequestStatus[a.meta.arg] = 'loading'; })
      .addCase(sendReviewRequest.fulfilled, (s, a) => {
        s.sendRequestStatus[a.payload.customerId] = 'done';
        const customer = s.customers.find((c) => c._id === a.payload.customerId);
        if (customer) customer.requestSent = true;
      })
      .addCase(sendReviewRequest.rejected,  (s, a) => { s.sendRequestStatus[a.meta.arg] = 'idle'; })

      // ── Delete Customer ──────────────────────────────────────────────────
     .addCase(deleteCustomer.fulfilled, (state, action) => {
  state.customers = state.customers.filter(
    (c: any) => c._id !== action.payload.id  // ✅ was customerId, now id
  );
})

      // ── Analytics ────────────────────────────────────────────────────────
      .addCase(fetchAnalytics.pending,   (s)    => setLoading(s.analyticsLoad))
      .addCase(fetchAnalytics.fulfilled, (s, a) => {
        setSucceeded(s.analyticsLoad);

        const rawRating = a.payload.ratingTrend;
        s.analytics.ratingTrend = Array.isArray(rawRating)
          ? rawRating
          : Array.isArray(rawRating?.data) ? rawRating.data : [];

        const rawSentiment  = a.payload.sentimentTrend;
        const sentimentRows: any[] = Array.isArray(rawSentiment)
          ? rawSentiment
          : Array.isArray(rawSentiment?.data) ? rawSentiment.data : [];

        const sentimentMap: Record<string, Record<string, number>> = {};
        sentimentRows.forEach((row: any) => {
          if (row._id?.year !== undefined) {
            const key = `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;
            if (!sentimentMap[key]) sentimentMap[key] = { month: key as any, positive: 0, negative: 0, neutral: 0, mixed: 0 };
            sentimentMap[key][row._id.sentiment] = row.count;
          } else {
            const key = row.month ?? row._id;
            sentimentMap[key] = { ...sentimentMap[key], ...row };
          }
        });
        s.analytics.sentimentTrend = Object.values(sentimentMap) as any;

        const rawTopics  = a.payload.topicBreakdown;
        const topicRows: any[] = Array.isArray(rawTopics)
          ? rawTopics
          : Array.isArray(rawTopics?.data) ? rawTopics.data : [];
        s.analytics.topicBreakdown = topicRows.map((t: any) => ({
          ...t,
          topic:    t.topic ?? t._id,
          positive: t.positive !== undefined
            ? (t.total ? Math.round((t.positive / t.total) * 100) : t.positive)
            : 0,
        }));
      })
      .addCase(fetchAnalytics.rejected,  (s, a) => setFailed(s.analyticsLoad, a.payload as string))

      // ── Fetch Recommendations ────────────────────────────────────────────
      .addCase(fetchRecommendations.pending,   (s)    => setLoading(s.recommendationsLoad))
      .addCase(fetchRecommendations.fulfilled, (s, a) => {
        setSucceeded(s.recommendationsLoad);
        s.insight = extractInsight(a.payload);
      })
      .addCase(fetchRecommendations.rejected,  (s, a) => setFailed(s.recommendationsLoad, a.payload as string))

      // ── Generate Recommendations ─────────────────────────────────────────
      .addCase(generateRecommendations.pending,   (s)    => setLoading(s.generateRecsLoad))
      .addCase(generateRecommendations.fulfilled, (s, a) => {
        setSucceeded(s.generateRecsLoad);
        s.insight = extractInsight(a.payload);
      })
      .addCase(generateRecommendations.rejected,  (s, a) => setFailed(s.generateRecsLoad, a.payload as string));
  },
});

export const {
  setActiveReview,
  setFilter,
  resetFilters,
  setReviewsPage,
  setCustomersPage,
  clearReviewDetail,
} = reputationSlice.actions;

export default reputationSlice.reducer;