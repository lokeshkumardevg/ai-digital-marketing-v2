import { useCallback, useEffect, useRef, useState } from 'react';
import {
  loadWithMigration,
  saveGeneratedImages,
  type StoredGeneratedImage,
  type StoredHistoryEntry,
} from '../utils/aiCreativeStorage';

export function useAiCreativeWorkspaceStorage() {
  const [generatedImages, setGeneratedImages] = useState<StoredGeneratedImage[]>([]);
  const [history, setHistory] = useState<StoredHistoryEntry[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);

  // Avoid persisting on the initial hydration tick
  const didHydrateRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const state = await loadWithMigration();
        if (!mounted) return;
        setGeneratedImages(state.generatedImages);
        setHistory(state.history);
      } finally {
        if (mounted) {
          setIsHydrating(false);
          didHydrateRef.current = true;
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(
    async (nextGenerated: StoredGeneratedImage[], nextHistory: StoredHistoryEntry[]) => {
      await saveGeneratedImages(nextGenerated, nextHistory);
    },
    []
  );

  useEffect(() => {
    if (!didHydrateRef.current) return;
    // Persist whenever state changes
    persist(generatedImages, history);
  }, [generatedImages, history, persist]);

  const setAndPersistGenerated = useCallback(
    (updater: (prev: StoredGeneratedImage[]) => StoredGeneratedImage[]) => {
      setGeneratedImages((prev) => {
        const next = updater(prev);
        // persist will be triggered by effect
        return next;
      });
    },
    []
  );

  const setAndPersistHistory = useCallback(
    (updater: (prev: StoredHistoryEntry[]) => StoredHistoryEntry[]) => {
      setHistory((prev) => {
        const next = updater(prev);
        return next;
      });
    },
    []
  );

  return {
    generatedImages,
    setGeneratedImages,
    history,
    setHistory,
    isHydrating,
    setAndPersistGenerated,
    setAndPersistHistory,
  };
}

