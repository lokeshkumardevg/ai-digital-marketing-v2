import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

// ==================== TYPES ====================

export interface LinkedInAccount {
  _id: string;
  linkedinId: string;
  profileName: string;
  headline?: string;
  profileImageUrl?: string;
  email?: string;
  status: string;
  lastSyncedAt?: string;
}

export interface LinkedInLead {
  _id: string;
  name: string;
  headline?: string;
  profileImageUrl?: string;
  linkedinProfileUrl?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  location?: string;
  industry?: string;
  skills: string[];
  bio?: string;
  stage: string;
  aiLeadScore: number;
  networkingScore: number;
  hiringScore: number;
  tags: string[];
  notes: Array<{ message: string; type: string; timestamp: string; author: string }>;
  activityLog: Array<{ action: string; timestamp: string; details: string }>;
  aiSummary?: string;
  aiSuggestedKeywords: string[];
  aiProfileImprovements: string[];
  assignedTo?: string;
  priority: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  status: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedInPost {
  _id: string;
  content: string;
  authorName?: string;
  authorLinkedinUrl?: string;
  postType: string;
  hashtags: string[];
  likes: number;
  comments: number;
  shares: number;
  viralScore: number;
  hookQuality?: string;
  ctaAnalysis?: string;
  aiRewriteSuggestion?: string;
  createdAt: string;
}

export interface LeadStats {
  totalLeads: number;
  highValueLeads: number;
  stageBreakdown: Array<{ _id: string; count: number; avgScore: number }>;
}

interface LinkedInCrmState {
  // Account
  connectedAccount: LinkedInAccount | null;
  accounts: LinkedInAccount[];
  accountLoading: boolean;

  // Leads
  leads: LinkedInLead[];
  selectedLead: LinkedInLead | null;
  leadStats: LeadStats | null;
  leadsTotal: number;
  leadsPage: number;
  leadsLoading: boolean;

  // Posts
  posts: LinkedInPost[];
  postsTotal: number;
  postsLoading: boolean;

  // General
  error: string | null;

  // New Additions
  leadPosts: any[];
  leadPostsLoading: boolean;
  publishPostLoading: boolean;

  // Ads
  adCampaigns: any[];
  adsLoading: boolean;
}

const initialState: LinkedInCrmState = {
  connectedAccount: null,
  accounts: [],
  accountLoading: false,
  leads: [],
  selectedLead: null,
  leadStats: null,
  leadsTotal: 0,
  leadsPage: 1,
  leadsLoading: false,
  posts: [],
  postsTotal: 0,
  postsLoading: false,
  error: null,
  leadPosts: [],
  leadPostsLoading: false,
  publishPostLoading: false,
  adCampaigns: [],
  adsLoading: false,
};

// ==================== ASYNC THUNKS ====================

export const fetchLinkedInAccount = createAsyncThunk(
  'linkedinCrm/fetchAccount',
  async () => {
    const res = await api.get('/linkedin-crm/accounts/connected');
    return res.data;
  },
);

export const fetchLinkedInAccounts = createAsyncThunk(
  'linkedinCrm/fetchAccounts',
  async () => {
    const res = await api.get('/linkedin-crm/accounts');
    return res.data;
  },
);

export const getLinkedInOAuthUrl = createAsyncThunk(
  'linkedinCrm/getOAuthUrl',
  async () => {
    const res = await api.get('/linkedin-crm/oauth/url');
    return res.data.url;
  },
);

export const disconnectLinkedInAccount = createAsyncThunk(
  'linkedinCrm/disconnect',
  async (accountId: string) => {
    const res = await api.post(`/linkedin-crm/accounts/${accountId}/disconnect`);
    return res.data;
  },
);

export const fetchLeads = createAsyncThunk(
  'linkedinCrm/fetchLeads',
  async (filters?: { stage?: string; tag?: string; search?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.stage) params.set('stage', filters.stage);
    if (filters?.tag) params.set('tag', filters.tag);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const res = await api.get(`/linkedin-crm/leads?${params.toString()}`);
    return res.data;
  },
);

export const fetchLeadStats = createAsyncThunk(
  'linkedinCrm/fetchLeadStats',
  async () => {
    const res = await api.get('/linkedin-crm/leads/stats');
    return res.data;
  },
);

export const createLead = createAsyncThunk(
  'linkedinCrm/createLead',
  async (data: Partial<LinkedInLead>) => {
    const res = await api.post('/linkedin-crm/leads', data);
    return res.data;
  },
);

export const updateLead = createAsyncThunk(
  'linkedinCrm/updateLead',
  async ({ leadId, data }: { leadId: string; data: Partial<LinkedInLead> }) => {
    const res = await api.put(`/linkedin-crm/leads/${leadId}`, data);
    return res.data;
  },
);

export const updateLeadStage = createAsyncThunk(
  'linkedinCrm/updateLeadStage',
  async ({ leadId, stage }: { leadId: string; stage: string }) => {
    const res = await api.put(`/linkedin-crm/leads/${leadId}/stage`, { stage });
    return res.data;
  },
);

export const addLeadNote = createAsyncThunk(
  'linkedinCrm/addNote',
  async ({ leadId, message, type }: { leadId: string; message: string; type: string }) => {
    const res = await api.post(`/linkedin-crm/leads/${leadId}/notes`, { message, type });
    return res.data;
  },
);

export const deleteLead = createAsyncThunk(
  'linkedinCrm/deleteLead',
  async (leadId: string) => {
    await api.delete(`/linkedin-crm/leads/${leadId}`);
    return leadId;
  },
);

export const fetchPosts = createAsyncThunk(
  'linkedinCrm/fetchPosts',
  async (filters?: { search?: string; postType?: string; page?: number }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.postType) params.set('postType', filters.postType);
    if (filters?.page) params.set('page', String(filters.page));
    const res = await api.get(`/linkedin-crm/posts?${params.toString()}`);
    return res.data;
  },
);

export const fetchLeadPosts = createAsyncThunk(
  'linkedinCrm/fetchLeadPosts',
  async (leadId: string) => {
    const res = await api.get(`/linkedin-crm/leads/${leadId}/posts`);
    return res.data;
  },
);

export const publishLinkedInPost = createAsyncThunk(
  'linkedinCrm/publishLinkedInPost',
  async (text: string) => {
    const res = await api.post(`/linkedin-crm/posts/publish`, { text });
    return res.data;
  },
);

export const fetchAdCampaigns = createAsyncThunk(
  'linkedinCrm/fetchAdCampaigns',
  async () => {
    const res = await api.get(`/linkedin-crm/ads`);
    return res.data;
  },
);

export const triggerProfileScrape = createAsyncThunk(
  'linkedinCrm/triggerProfileScrape',
  async (liAtCookie: string) => {
    const res = await api.post(`/linkedin-scraper/trigger-profile-scrape`, { liAtCookie });
    return res.data;
  },
);

// ==================== SLICE ====================

const linkedinCrmSlice = createSlice({
  name: 'linkedinCrm',
  initialState,
  reducers: {
    setSelectedLead: (state, action: PayloadAction<LinkedInLead | null>) => {
      state.selectedLead = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Account
    builder.addCase(fetchLinkedInAccount.pending, (state) => { state.accountLoading = true; });
    builder.addCase(fetchLinkedInAccount.fulfilled, (state, action) => {
      state.accountLoading = false;
      state.connectedAccount = action.payload;
    });
    builder.addCase(fetchLinkedInAccount.rejected, (state, action) => {
      state.accountLoading = false;
      state.connectedAccount = null;
    });

    builder.addCase(fetchLinkedInAccounts.fulfilled, (state, action) => {
      state.accounts = action.payload;
    });

    builder.addCase(disconnectLinkedInAccount.fulfilled, (state, action) => {
      state.connectedAccount = null;
      state.accounts = state.accounts.map(a =>
        a._id === action.payload._id ? { ...a, status: 'disconnected' } : a,
      );
    });

    // Leads
    builder.addCase(fetchLeads.pending, (state) => { state.leadsLoading = true; });
    builder.addCase(fetchLeads.fulfilled, (state, action) => {
      state.leadsLoading = false;
      state.leads = action.payload.leads;
      state.leadsTotal = action.payload.total;
      state.leadsPage = action.payload.page;
    });
    builder.addCase(fetchLeads.rejected, (state, action) => {
      state.leadsLoading = false;
      state.error = action.error.message || 'Failed to fetch leads';
    });

    builder.addCase(fetchLeadStats.fulfilled, (state, action) => {
      state.leadStats = action.payload;
    });

    builder.addCase(createLead.fulfilled, (state, action) => {
      state.leads.unshift(action.payload);
      state.leadsTotal += 1;
    });

    builder.addCase(updateLead.fulfilled, (state, action) => {
      const idx = state.leads.findIndex(l => l._id === action.payload._id);
      if (idx !== -1) state.leads[idx] = action.payload;
      if (state.selectedLead?._id === action.payload._id) state.selectedLead = action.payload;
    });

    builder.addCase(updateLeadStage.fulfilled, (state, action) => {
      const idx = state.leads.findIndex(l => l._id === action.payload._id);
      if (idx !== -1) state.leads[idx] = action.payload;
      if (state.selectedLead?._id === action.payload._id) state.selectedLead = action.payload;
    });

    builder.addCase(addLeadNote.fulfilled, (state, action) => {
      const idx = state.leads.findIndex(l => l._id === action.payload._id);
      if (idx !== -1) state.leads[idx] = action.payload;
      if (state.selectedLead?._id === action.payload._id) state.selectedLead = action.payload;
    });

    builder.addCase(deleteLead.fulfilled, (state, action) => {
      state.leads = state.leads.filter(l => l._id !== action.payload);
      state.leadsTotal -= 1;
      if (state.selectedLead?._id === action.payload) state.selectedLead = null;
    });

    // Posts
    builder.addCase(fetchPosts.pending, (state) => { state.postsLoading = true; });
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
      state.postsLoading = false;
      state.posts = action.payload.posts;
      state.postsTotal = action.payload.total;
    });
    builder.addCase(fetchPosts.rejected, (state) => {
      state.postsLoading = false;
    });

    // Lead Posts
    builder.addCase(fetchLeadPosts.pending, (state) => { state.leadPostsLoading = true; });
    builder.addCase(fetchLeadPosts.fulfilled, (state, action) => {
      state.leadPostsLoading = false;
      state.leadPosts = action.payload;
    });
    builder.addCase(fetchLeadPosts.rejected, (state) => {
      state.leadPostsLoading = false;
    });

    // Publish Post
    builder.addCase(publishLinkedInPost.pending, (state) => { state.publishPostLoading = true; });
    builder.addCase(publishLinkedInPost.fulfilled, (state) => {
      state.publishPostLoading = false;
    });
    builder.addCase(publishLinkedInPost.rejected, (state) => {
      state.publishPostLoading = false;
    });

    // Ads
    builder.addCase(fetchAdCampaigns.pending, (state) => { state.adsLoading = true; });
    builder.addCase(fetchAdCampaigns.fulfilled, (state, action) => {
      state.adsLoading = false;
      state.adCampaigns = action.payload;
    });
    builder.addCase(fetchAdCampaigns.rejected, (state) => {
      state.adsLoading = false;
    });
  },
});

export const { setSelectedLead, clearError } = linkedinCrmSlice.actions;
export const linkedinCrmReducer = linkedinCrmSlice.reducer;
