/**
 * workspaceSlice.ts
 *
 * Replaces demo hardcoded brands with real API-backed state.
 *
 * API endpoints used:
 *   GET  /campaign/brands/:userId          → list all saved brands for user
 *   POST /campaign/brand-save/:userId      → save / replace a brand (same as Campaigns.tsx uses)
 *   POST /campaign/brand-active/:userId    → persist which brand is currently active
 *
 * Shape returned by GET /campaign/brands/:userId  (expected):
 *   { brands: BrandRecord[] }
 *
 * BrandRecord mirrors what brand-save stores in the session model so
 * the same data can be read back without a separate brands collection.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type BrandStatus = 'active' | 'syncing' | 'offline';

export interface BrandAssets {
  logoUrl?:           string;
  logoPreview?:       string;
  favicon?:           string;
  websiteScreenshot?: string;
  websiteImages?:     string[];
  brandColors?:       string[];
}

export interface BrandRecord {
  /** Unique identifier — could be MongoDB _id, campaignId, or a generated id */
  id:     string;
  name:   string;
  url:    string;
  status: BrandStatus;

  // Rich data (populated when brand-save is called from Campaigns.tsx)
  industry?:     string;
  tagline?:      string;
  overallScore?: number;
  assets?:       BrandAssets;

  /** ISO timestamp of when the brand was saved / last updated */
  savedAt?: string;
}

interface WorkspaceState {
  brands:          BrandRecord[];
  activeBrandId:   string | null;

  // Backward-compat mirrors — always equal to brands / activeBrandId
  websites:        BrandRecord[];
  activeWebsiteId: string | null;

  // Async status
  fetchStatus:  'idle' | 'loading' | 'succeeded' | 'failed';
  saveStatus:   'idle' | 'loading' | 'succeeded' | 'failed';
  error:        string | null;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Convert any brand-detail object (from session) into a flat BrandRecord */
const normaliseBrand = (raw: any): BrandRecord => {
  const id =
    raw.id          ||
    raw._id         ||
    raw.campaignId  ||
    raw.brandId     ||
    String(Date.now());

  const name =
    raw.name            ||
    raw.brandName       ||
    raw.brand?.name     ||
    'Unknown Brand';

  const url =
    raw.url             ||
    raw.website         ||
    raw.finalUrl        ||
    '';

  const status: BrandStatus =
    raw.status === 'syncing' || raw.status === 'offline'
      ? raw.status
      : 'active';

  const industry =
    raw.industry        ||
    raw.brand?.industry ||
    raw.auditData?.brand?.industry ||
    undefined;

  const tagline =
    raw.tagline         ||
    raw.brand?.tagline  ||
    undefined;

  const overallScore =
    raw.overallScore        ||
    raw.brand?.overallScore ||
    undefined;

  // Assets: handle both top-level and nested
  const assets: BrandAssets | undefined =
    raw.assets
      ? {
          logoUrl:           raw.assets.logoUrl           || raw.logoPreview || undefined,
          logoPreview:       raw.assets.logoPreview       || raw.assets.logoUrl || raw.logoPreview || undefined,
          favicon:           raw.assets.favicon           || undefined,
          websiteScreenshot: raw.assets.websiteScreenshot || undefined,
          websiteImages:     Array.isArray(raw.assets.websiteImages) ? raw.assets.websiteImages : [],
          brandColors:       Array.isArray(raw.assets.brandColors)   ? raw.assets.brandColors   : [],
        }
      : undefined;

  return { id, name, url, status, industry, tagline, overallScore, assets, savedAt: raw.savedAt };
};

// ─────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────

/**
 * Fetch all brands saved for this user.
 * GET /campaign/brands/:userId
 * Expected response: { brands: any[] }  OR  { session: { brandDetails: any } }
 * (handles both a dedicated brands endpoint and the existing session endpoint as fallback)
 */
export const fetchBrands = createAsyncThunk<
  BrandRecord[],        // return type
  string,               // arg: userId
  { rejectValue: string }
>(
  'workspace/fetchBrands',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/campaign/brands/${userId}`);

      // Shape 1: { brands: [...] }
      if (Array.isArray(data?.brands)) {
        return data.brands.map(normaliseBrand);
      }

      // Shape 2: { brand: {...} }  — single brand returned
      if (data?.brand) {
        return [normaliseBrand(data.brand)];
      }

      // Shape 3: session model returned directly — pull brandDetails
      if (data?.brandDetails) {
        return [normaliseBrand({ ...data.brandDetails, savedAt: data.savedAt })];
      }

      // Shape 4: array at root
      if (Array.isArray(data)) {
        return data.map(normaliseBrand);
      }

      return [];
    } catch (err: any) {
      // 404 just means no brands yet — not an error state
      if (err?.response?.status === 404) return [];
      return rejectWithValue(
        err?.response?.data?.message || err?.message || 'Failed to fetch brands',
      );
    }
  },
);

/**
 * Save / replace a brand for this user.
 * POST /campaign/brand-save/:userId
 *
 * This thunk is called from any place outside Campaigns.tsx that needs to
 * persist a brand (e.g. a brand-picker sidebar).  Campaigns.tsx has its own
 * inline call but dispatches `upsertBrandLocally` afterwards to keep Redux in sync.
 */
export const saveBrand = createAsyncThunk<
  { brand: BrandRecord; replaced: boolean },
  { userId: string; brandDetails: any; session?: any; forceReplace?: boolean },
  { rejectValue: string }
>(
  'workspace/saveBrand',
  async ({ userId, brandDetails, session, forceReplace = false }, { rejectWithValue }) => {
    try {
      const url = forceReplace
        ? `${API_BASE}/campaign/brand-save/${userId}?forceReplace=true`
        : `${API_BASE}/campaign/brand-save/${userId}`;

      const payload = session ?? { brandDetails };
      const { data } = await axios.post(url, payload);

      if (data.ok === false && data.replaceRequired) {
        return rejectWithValue(data.message || 'Replace required');
      }

      return {
        brand:    normaliseBrand(brandDetails),
        replaced: !!data.replaced,
      };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || 'Failed to save brand',
      );
    }
  },
);

/**
 * Tell the backend which brand is currently active.
 * POST /campaign/brand-active/:userId   body: { brandId }
 * Fire-and-forget — we update Redux optimistically regardless of response.
 */
export const persistActiveBrand = createAsyncThunk<
  void,
  { userId: string; brandId: string },
  { rejectValue: string }
>(
  'workspace/persistActiveBrand',
  async ({ userId, brandId }) => {
    try {
      await axios.post(`${API_BASE}/campaign/brand-active/${userId}`, { brandId });
    } catch (err: any) {
      // Non-fatal — just log
      console.warn('[workspace] persistActiveBrand failed:', err?.message);
    }
  },
);

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────

const initialState: WorkspaceState = {
  brands:          [],    // populated from API, no demo data
  activeBrandId:   null,
  // Backward-compat mirrors (Header.tsx reads these)
  websites:        [],
  activeWebsiteId: null,
  fetchStatus:     'idle',
  saveStatus:      'idle',
  error:           null,
};

// ─────────────────────────────────────────────
// COMPAT SYNC HELPER
// Keeps websites / activeWebsiteId mirrors in sync with brands / activeBrandId
// so components that haven't been migrated yet still work.
// ─────────────────────────────────────────────
const syncCompat = (state: WorkspaceState) => {
  state.websites        = state.brands;
  state.activeWebsiteId = state.activeBrandId;
};

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    /**
     * Switch the active brand locally (+ call persistActiveBrand thunk separately
     * if you want to persist to backend).
     */
    setActiveBrand: (state, action: PayloadAction<string>) => {
      state.activeBrandId = action.payload;
      state.brands = state.brands.map(b => ({
        ...b,
        status: b.id === action.payload ? 'active' : b.status,
      }));
      syncCompat(state);
    },

    /**
     * Upsert a brand locally (used by Campaigns.tsx after its own brand-save call
     * so Redux stays in sync without an extra round-trip).
     */
    upsertBrandLocally: (state, action: PayloadAction<any>) => {
      const incoming = normaliseBrand(action.payload);
      const idx = state.brands.findIndex(
        b => b.id === incoming.id || b.url === incoming.url,
      );
      if (idx >= 0) {
        state.brands[idx] = { ...state.brands[idx], ...incoming };
      } else {
        state.brands.push(incoming);
      }
      state.activeBrandId = incoming.id;
      syncCompat(state);
    },

    /**
     * Remove a brand from local state.
     */
    removeBrandLocally: (state, action: PayloadAction<string>) => {
      state.brands = state.brands.filter(b => b.id !== action.payload);
      if (state.activeBrandId === action.payload) {
        state.activeBrandId = state.brands[0]?.id ?? null;
      }
      syncCompat(state);
    },

    /** Reset error after displaying it */
    clearWorkspaceError: (state) => {
      state.error = null;
    },

    /** Hard-reset (e.g. on logout) */
    resetWorkspace: () => ({ ...initialState }),
  },

  extraReducers: (builder) => {
    // ── fetchBrands ──────────────────────────────────────────
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.fetchStatus = 'loading';
        state.error       = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        state.brands      = action.payload;

        // Auto-select first brand if nothing is active yet
        if (!state.activeBrandId && action.payload.length > 0) {
          state.activeBrandId = action.payload[0].id;
        }
        syncCompat(state);
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error       = action.payload ?? 'Unknown error';
      });

    // ── saveBrand ────────────────────────────────────────────
    builder
      .addCase(saveBrand.pending, (state) => {
        state.saveStatus = 'loading';
        state.error      = null;
      })
      .addCase(saveBrand.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        const { brand, replaced } = action.payload;

        if (replaced) {
          const idx = state.brands.findIndex(
            b => b.id === brand.id || b.url === brand.url,
          );
          if (idx >= 0) state.brands[idx] = brand;
          else           state.brands.push(brand);
        } else {
          const exists = state.brands.some(b => b.id === brand.id || b.url === brand.url);
          if (!exists) state.brands.push(brand);
        }

        state.activeBrandId = brand.id;
        syncCompat(state);
      })
      .addCase(saveBrand.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error      = action.payload ?? 'Save failed';
      });

    // ── persistActiveBrand — no state changes needed ─────────
    builder.addCase(persistActiveBrand.fulfilled, () => { /* optimistic, nothing to do */ });
  },
});

export const {
  setActiveBrand,
  upsertBrandLocally,
  removeBrandLocally,
  clearWorkspaceError,
  resetWorkspace,
} = workspaceSlice.actions;

export const workspaceReducer = workspaceSlice.reducer;

// ─────────────────────────────────────────────
// BACKWARD-COMPATIBLE ALIASES
// Keeps any file that still imports the old Website-era names working
// without needing a mass find-and-replace across the codebase.
// ─────────────────────────────────────────────

/** @deprecated use setActiveBrand */
export const setActiveWebsite = setActiveBrand;

/** @deprecated use upsertBrandLocally */
export const addWebsite = upsertBrandLocally;

// Old Website type alias so imports like `import type { Website }` still compile
export type Website = BrandRecord;

// Old state shape — no re-export needed; WorkspaceState is already declared above.

// ─────────────────────────────────────────────
// SELECTOR ALIASES
// Components that read state.workspace.websites or state.workspace.activeWebsiteId
// should use these until they're migrated to the new field names.
// ─────────────────────────────────────────────

/** @deprecated use state.workspace.brands */
export const selectWebsites       = (state: any): BrandRecord[] => state.workspace.brands;
/** @deprecated use state.workspace.activeBrandId */
export const selectActiveWebsiteId = (state: any): string | null => state.workspace.activeBrandId;
/** @deprecated use state.workspace.activeBrandId */
export const selectActiveWebsite  = (state: any): BrandRecord | null =>
  state.workspace.brands.find((b: BrandRecord) => b.id === state.workspace.activeBrandId) ?? null;