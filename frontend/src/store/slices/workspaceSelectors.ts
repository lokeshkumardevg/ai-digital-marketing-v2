/**
 * workspaceSelectors.ts
 *
 * Memoised selectors for the workspace slice.
 * Import and use these in components instead of raw useSelector calls.
 */

import { createSelector } from '@reduxjs/toolkit';

// Adjust this path to wherever your store's RootState is defined
type RootState = any;

// ─────────────────────────────────────────────
// BASE SELECTORS
// ─────────────────────────────────────────────

export const selectWorkspace       = (state: RootState) => state.workspace;
export const selectAllBrands       = (state: RootState) => state.workspace.brands;
export const selectActiveBrandId   = (state: RootState) => state.workspace.activeBrandId;
export const selectFetchStatus     = (state: RootState) => state.workspace.fetchStatus;
export const selectSaveStatus      = (state: RootState) => state.workspace.saveStatus;
export const selectWorkspaceError  = (state: RootState) => state.workspace.error;

// ─────────────────────────────────────────────
// DERIVED SELECTORS
// ─────────────────────────────────────────────

/** The full BrandRecord for the currently active brand */
export const selectActiveBrand = createSelector(
  selectAllBrands,
  selectActiveBrandId,
  (brands, activeId) => brands.find(b => b.id === activeId) ?? null,
);

/** Is a fetch currently in flight? */
export const selectIsFetchingBrands = createSelector(
  selectFetchStatus,
  status => status === 'loading',
);

/** Has the first fetch completed (successfully or not)? */
export const selectBrandsLoaded = createSelector(
  selectFetchStatus,
  status => status === 'succeeded' || status === 'failed',
);

/** Does the user have at least one brand saved? */
export const selectHasBrands = createSelector(
  selectAllBrands,
  brands => brands.length > 0,
);

/** Active brand's logo — checks assets.logoPreview, assets.logoUrl, assets.favicon in order */
export const selectActiveBrandLogo = createSelector(
  selectActiveBrand,
  brand =>
    brand?.assets?.logoPreview ||
    brand?.assets?.logoUrl     ||
    brand?.assets?.favicon     ||
    null,
);

/** Active brand's color palette */
export const selectActiveBrandColors = createSelector(
  selectActiveBrand,
  brand => brand?.assets?.brandColors ?? [],
);