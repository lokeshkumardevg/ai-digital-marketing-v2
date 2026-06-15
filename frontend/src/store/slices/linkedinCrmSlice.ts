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
  scraperStatus?: string;
  connectedOrganizationName?: string;
  connectedOrganizationUrn?: string;
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

export interface LiveReply {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface LiveComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  replies: LiveReply[];
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
  imageUrl?: string;
  liveComments?: LiveComment[];
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

  // Organizations
  organizations: any[];
  orgsLoading: boolean;

  // Events
  events: any[];
  eventsLoading: boolean;
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
  organizations: [],
  orgsLoading: false,
  events: [],
  eventsLoading: false,
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
  async ({ text, authorUrn, imageUrl }: { text: string; authorUrn?: string; imageUrl?: string }) => {
    const res = await api.post(`/linkedin-crm/posts/publish`, { text, authorUrn, imageUrl });
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
export const fetchOrganizations = createAsyncThunk(
  'linkedinCrm/fetchOrganizations',
  async () => {
    const res = await api.get('/linkedin-crm/organizations');
    return res.data;
  },
);

export const connectOrganization = createAsyncThunk(
  'linkedinCrm/connectOrganization',
  async ({ orgUrn, orgName }: { orgUrn: string; orgName: string }) => {
    const res = await api.post('/linkedin-crm/organizations/connect', { orgUrn, orgName });
    return res.data;
  },
);

export const fetchEvents = createAsyncThunk(
  'linkedinCrm/fetchEvents',
  async () => {
    const res = await api.get('/linkedin-crm/events');
    return res.data;
  },
);

export const createEvent = createAsyncThunk(
  'linkedinCrm/createEvent',
  async (eventData: any) => {
    const res = await api.post('/linkedin-crm/events', eventData);
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
    simulateRealtimeEngagement: (state) => {
      if (state.posts && state.posts.length > 0) {
        const numPostsToUpdate = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numPostsToUpdate; i++) {
          const randIdx = Math.floor(Math.random() * state.posts.length);
          const p = state.posts[randIdx];
          if (p) {
            p.likes += Math.floor(Math.random() * 3) + 1;
            p.impressions = (p.impressions || 0) + Math.floor(Math.random() * 50) + 10;
            if (Math.random() > 0.7) {
              p.comments += 1;
              // Occasionally add a real AI comment
              if (Math.random() > 0.5) {
                if (!p.liveComments) p.liveComments = [];
                const mockAuthors = ['Sarah Jenkins', 'Mike Ross', 'Alex Mercer', 'Diana Prince', 'John Doe'];
                const mockTexts = ['Great insight! Totally agree.', 'Thanks for sharing this.', 'Very interesting perspective.', 'Love this approach 🚀', 'Can you elaborate more on this?'];
                p.liveComments.push({
                  id: 'c_' + Date.now().toString() + Math.random(),
                  author: mockAuthors[Math.floor(Math.random() * mockAuthors.length)],
                  text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
                  timestamp: new Date().toISOString(),
                  replies: []
                });
              }
            }
          }
        }
      }
      if (state.adCampaigns && state.adCampaigns.length > 0) {
        const randIdx = Math.floor(Math.random() * state.adCampaigns.length);
        const c = state.adCampaigns[randIdx];
        if (c && c.metrics) {
          c.metrics.impressions += Math.floor(Math.random() * 100) + 20;
          c.metrics.spend += Math.random() * 2;
          if (Math.random() > 0.8) c.metrics.clicks += 1;
        }
      }
    },
    simulateNewLead: (state, action: PayloadAction<any>) => {
      const newLead = action.payload;
      state.leads.unshift(newLead);
      state.leadsTotal += 1;
      if (state.leadStats) {
        state.leadStats.totalLeads += 1;
        if (newLead.aiLeadScore >= 70) state.leadStats.highValueLeads += 1;
        const stageIdx = state.leadStats.stageBreakdown.findIndex((s: any) => s._id === newLead.stage);
        if (stageIdx !== -1) {
          state.leadStats.stageBreakdown[stageIdx].count += 1;
        } else {
          state.leadStats.stageBreakdown.push({ _id: newLead.stage, count: 1, avgScore: newLead.aiLeadScore });
        }
      }
    },
    addPostComment: (state, action: PayloadAction<{ postId: string; text: string; author: string }>) => {
      const { postId, text, author } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        if (!post.liveComments) post.liveComments = [];
        post.liveComments.push({
          id: 'c_' + Date.now().toString(),
          author,
          text,
          timestamp: new Date().toISOString(),
          replies: []
        });
        post.comments += 1;
      }
    },
    addPostReply: (state, action: PayloadAction<{ postId: string; commentId: string; text: string; author: string }>) => {
      const { postId, commentId, text, author } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post && post.liveComments) {
        const comment = post.liveComments.find(c => c.id === commentId);
        if (comment) {
          if (!comment.replies) comment.replies = [];
          comment.replies.push({
            id: 'r_' + Date.now().toString(),
            author,
            text,
            timestamp: new Date().toISOString()
          });
          post.comments += 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Account
    builder.addCase(fetchLinkedInAccount.pending, (state) => { state.accountLoading = true; });
    builder.addCase(fetchLinkedInAccount.fulfilled, (state, action) => {
      state.accountLoading = false;
      state.connectedAccount = action.payload;
    });
    builder.addCase(fetchLinkedInAccount.rejected, (state) => {
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
    builder.addCase(publishLinkedInPost.fulfilled, (state, action) => {
      state.publishPostLoading = false;
      if (action.payload && action.payload._id) {
        state.posts.unshift(action.payload);
        state.postsTotal += 1;
      }
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

    // Scraper
    builder.addCase(triggerProfileScrape.pending, (state) => {
      if (state.connectedAccount) {
        state.connectedAccount.scraperStatus = 'active';
      }
    });
    builder.addCase(triggerProfileScrape.fulfilled, (state) => {
      if (state.connectedAccount) {
        state.connectedAccount.scraperStatus = 'pending';
      }
    });
    builder.addCase(triggerProfileScrape.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to start scraping';
    });

    // Organizations
    builder.addCase(fetchOrganizations.pending, (state) => {
      state.orgsLoading = true;
    });
    builder.addCase(fetchOrganizations.fulfilled, (state, action) => {
      state.orgsLoading = false;
      state.organizations = action.payload;
    });
    builder.addCase(fetchOrganizations.rejected, (state, action) => {
      state.orgsLoading = false;
      state.error = action.error.message || 'Failed to fetch organizations';
    });

    builder.addCase(connectOrganization.fulfilled, (state, action) => {
      state.connectedAccount = action.payload;
    });

    // Events
    builder.addCase(fetchEvents.pending, (state) => {
      state.eventsLoading = true;
    });
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.eventsLoading = false;
      state.events = action.payload;
    });
    builder.addCase(fetchEvents.rejected, (state, action) => {
      state.eventsLoading = false;
      state.error = action.error.message || 'Failed to fetch events';
    });

    builder.addCase(createEvent.fulfilled, (state, action) => {
      state.events.unshift(action.payload);
    });
  },
});

export const { setSelectedLead, clearError, simulateRealtimeEngagement, simulateNewLead, addPostComment, addPostReply } = linkedinCrmSlice.actions;
export const linkedinCrmReducer = linkedinCrmSlice.reducer;
