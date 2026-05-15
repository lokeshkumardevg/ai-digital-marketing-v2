/**
 * useBrands.ts
 *
 * Drop-in hook that loads brands from the API on first render and
 * exposes everything a component needs to display / switch brands.
 *
 * Usage:
 *   const { brands, activeBrand, activeBrandLogo, isLoading, setActive } = useBrands();
 */

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBrands,
  setActiveBrand,
  persistActiveBrand,
  upsertBrandLocally,
  removeBrandLocally,
  clearWorkspaceError,
  resetWorkspace,
  type BrandRecord,
} from './workspaceSlice';

import {
  selectAllBrands,
  selectActiveBrand,
  selectActiveBrandId,
  selectActiveBrandLogo,
  selectActiveBrandColors,
  selectIsFetchingBrands,
  selectBrandsLoaded,
  selectHasBrands,
  selectFetchStatus,
  selectSaveStatus,
  selectWorkspaceError,
} from './workspaceSelectors';

// Adjust to wherever your RootState is defined
type RootState = any;

export const useBrands = (userId?: string) => {
  const dispatch = useDispatch<any>();

  // ── Selectors ────────────────────────────────────────────
  const brands           = useSelector(selectAllBrands);
  const activeBrand      = useSelector(selectActiveBrand);
  const activeBrandId    = useSelector(selectActiveBrandId);
  const activeBrandLogo  = useSelector(selectActiveBrandLogo);
  const activeBrandColors = useSelector(selectActiveBrandColors);
  const isLoading        = useSelector(selectIsFetchingBrands);
  const brandsLoaded     = useSelector(selectBrandsLoaded);
  const hasBrands        = useSelector(selectHasBrands);
  const fetchStatus      = useSelector(selectFetchStatus);
  const saveStatus       = useSelector(selectSaveStatus);
  const error            = useSelector(selectWorkspaceError);

  // ── Auto-fetch on mount (once per userId) ────────────────
  useEffect(() => {
    if (!userId) return;
    // Only fetch if we haven't loaded yet
    if (fetchStatus === 'idle') {
      dispatch(fetchBrands(userId));
    }
  }, [userId, fetchStatus, dispatch]);

  // ── Actions ──────────────────────────────────────────────

  /** Switch the active brand locally and persist the choice to the backend */
  const setActive = useCallback(
    (brandId: string) => {
      dispatch(setActiveBrand(brandId));
      if (userId) {
        dispatch(persistActiveBrand({ userId, brandId }));
      }
    },
    [dispatch, userId],
  );

  /** Force a fresh fetch from the API */
  const refresh = useCallback(() => {
    if (userId) dispatch(fetchBrands(userId));
  }, [dispatch, userId]);

  /**
   * Upsert a brand locally (call this from Campaigns.tsx after its own
   * brand-save API call so Redux stays in sync without a round-trip).
   */
  const upsertLocal = useCallback(
    (brandDetails: any) => dispatch(upsertBrandLocally(brandDetails)),
    [dispatch],
  );

  /** Remove a brand from local state */
  const removeLocal = useCallback(
    (brandId: string) => dispatch(removeBrandLocally(brandId)),
    [dispatch],
  );

  /** Clear any error message */
  const clearError = useCallback(
    () => dispatch(clearWorkspaceError()),
    [dispatch],
  );

  /** Hard-reset workspace (e.g. on logout) */
  const reset = useCallback(
    () => dispatch(resetWorkspace()),
    [dispatch],
  );

  return {
    // Data
    brands,
    activeBrand,
    activeBrandId,
    activeBrandLogo,
    activeBrandColors,

    // Status
    isLoading,
    brandsLoaded,
    hasBrands,
    fetchStatus,
    saveStatus,
    error,

    // Actions
    setActive,
    refresh,
    upsertLocal,
    removeLocal,
    clearError,
    reset,
  };
};