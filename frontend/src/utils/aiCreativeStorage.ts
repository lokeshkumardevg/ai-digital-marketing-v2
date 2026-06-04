import localforage from 'localforage';

export type StoredGeneratedImage = {
  id: string;
  imageUrl: string;
  prompt: string;
  label: string;
  sizeLabel: string;
  createdAt: string;
  savedToHub?: boolean;
  aspectRatio: string;
  imageCount: string;
  modelSource: string;
};

export type StoredHistoryEntry = {
  id: string;
  prompt: string;
  aspectRatio: string;
  imageCount: string;
  modelSource: string;
  createdAt: string;
  images: StoredGeneratedImage[];
};

export type AiCreativeStorageState = {
  generatedImages: StoredGeneratedImage[];
  history: StoredHistoryEntry[];
  updatedAt: string;
};

const STORAGE_NAMESPACE = 'ai-creative-workspace';
const GENERATED_IMAGES_TABLE = 'generatedImages';
const HISTORY_TABLE = 'history';
const STATE_TABLE = 'state';

// Old localStorage keys used by AiCreativeWorkspace.tsx
const OLD_HISTORY_KEY = 'ai-creative-history-v1';
const OLD_GENERATED_KEY = 'ai-creative-generated-v1';

const MAX_GENERATED_IMAGES = 24; // keep UI responsive + avoid unbounded growth
const MAX_HISTORY_ENTRIES = 12;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function pruneImages(images: StoredGeneratedImage[]): StoredGeneratedImage[] {
  // New items are prepended by the UI; keep latest first
  return images.slice(0, MAX_GENERATED_IMAGES);
}

function pruneHistory(history: StoredHistoryEntry[]): StoredHistoryEntry[] {
  // New items are prepended by the UI; keep latest first
  const trimmed = history.slice(0, MAX_HISTORY_ENTRIES);
  return trimmed.map((entry) => ({
    ...entry,
    images: pruneImages(entry.images),
  }));
}

// function getStore(): typeof localforage {
//   return localforage;
// }

// function createStores() {
//   const lf = getStore();
//   lf.config({
//     name: STORAGE_NAMESPACE,
//     storeName: GENERATED_IMAGES_TABLE,
//   });
// }

// localforage instances
const generatedImagesStore = localforage.createInstance({
  name: STORAGE_NAMESPACE,
  storeName: GENERATED_IMAGES_TABLE,
});

const historyStore = localforage.createInstance({
  name: STORAGE_NAMESPACE,
  storeName: HISTORY_TABLE,
});

const stateStore = localforage.createInstance({
  name: STORAGE_NAMESPACE,
  storeName: STATE_TABLE,
});

const GENERATED_KEY = 'generatedImages';
const HISTORY_KEY = 'history';

export async function loadGeneratedImages(): Promise<StoredGeneratedImage[]> {
  if (!isBrowser()) return [];
  try {
    const data = (await generatedImagesStore.getItem<StoredGeneratedImage[]>(GENERATED_KEY)) || [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function loadHistory(): Promise<StoredHistoryEntry[]> {
  if (!isBrowser()) return [];
  try {
    const data = (await historyStore.getItem<StoredHistoryEntry[]>(HISTORY_KEY)) || [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function clearOldImages(): Promise<void> {
  if (!isBrowser()) return;
  try {
    const [generated, history] = await Promise.all([
      loadGeneratedImages(),
      loadHistory(),
    ]);

    const prunedGenerated = pruneImages(generated);
    const prunedHistory = pruneHistory(history);

    await Promise.all([
      generatedImagesStore.setItem(GENERATED_KEY, prunedGenerated),
      historyStore.setItem(HISTORY_KEY, prunedHistory),
      stateStore.setItem('lastCleanupAt', new Date().toISOString()),
    ]);
  } catch {
    // ignore cleanup failures
  }
}

export async function saveGeneratedImages(
  images: StoredGeneratedImage[],
  history: StoredHistoryEntry[]
): Promise<void> {
  if (!isBrowser()) return;

  try {
    const prunedGenerated = pruneImages(images);
    const prunedHistory = pruneHistory(history);

    await Promise.all([
      generatedImagesStore.setItem(GENERATED_KEY, prunedGenerated),
      historyStore.setItem(HISTORY_KEY, prunedHistory),
      stateStore.setItem('updatedAt', new Date().toISOString()),
    ]);
  } catch {
    // localforage errors should never crash the UI
  }
}

// function migrateFromLocalStorageIfNeeded(): boolean {
//   if (!isBrowser()) return false;
// 
//   const alreadyMigrated = stateStore.getItem('migrationDone');
//   // note: we can't await here; we'll check during load
//   return true;
// }

export async function loadWithMigration(): Promise<AiCreativeStorageState> {
  if (!isBrowser()) {
    return { generatedImages: [], history: [], updatedAt: new Date(0).toISOString() };
  }

  // 1) Try localforage first
  const [generatedImages, history, migrationFlag] = await Promise.all([
    loadGeneratedImages(),
    loadHistory(),
    stateStore.getItem<boolean>('migrationDone').catch(() => false),
  ]);

  // 2) If no data in indexedDB and we haven't migrated, attempt migration
  const hasIndexedDbData = generatedImages.length > 0 || history.length > 0;

  if (!hasIndexedDbData && !migrationFlag) {
    try {
      const oldGeneratedRaw = window.localStorage.getItem(OLD_GENERATED_KEY);
      const oldHistoryRaw = window.localStorage.getItem(OLD_HISTORY_KEY);

      const oldGeneratedParsed = oldGeneratedRaw ? safeJsonParse<StoredGeneratedImage[]>(oldGeneratedRaw) : null;
      const oldHistoryParsed = oldHistoryRaw ? safeJsonParse<StoredHistoryEntry[]>(oldHistoryRaw) : null;

      const migratedGenerated = pruneImages(oldGeneratedParsed && Array.isArray(oldGeneratedParsed) ? oldGeneratedParsed : []);
      const migratedHistory = pruneHistory(oldHistoryParsed && Array.isArray(oldHistoryParsed) ? oldHistoryParsed : []);

      await Promise.all([
        generatedImagesStore.setItem(GENERATED_KEY, migratedGenerated),
        historyStore.setItem(HISTORY_KEY, migratedHistory),
        stateStore.setItem('migrationDone', true),
      ]);

      // If migration succeeded, we can safely clear localStorage to free space.
      // Guarded: localStorage can throw quota errors.
      try {
        window.localStorage.removeItem(OLD_GENERATED_KEY);
        window.localStorage.removeItem(OLD_HISTORY_KEY);
      } catch {
        // ignore
      }

      return {
        generatedImages: migratedGenerated,
        history: migratedHistory,
        updatedAt: new Date().toISOString(),
      };
    } catch {
      // ignore migration failures
    }
  }

  await clearOldImages();

  return {
    generatedImages,
    history,
    updatedAt: (await stateStore.getItem<string>('updatedAt')) || new Date().toISOString(),
  };
}

