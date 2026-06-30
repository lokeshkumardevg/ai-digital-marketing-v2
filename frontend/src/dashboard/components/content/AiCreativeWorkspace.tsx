import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { api } from "../../../api/axios";
import {
  RefreshCcw,
  Sparkles,
  Info,
  Bot,
  Loader2,
  ArrowLeft,
  X,
  Download,
  Plus,
} from 'lucide-react';





interface AiCreativeWorkspaceProps {
  open: boolean;
  productUrl: string;
  selectedImages: string[];
  onBackToSelection: () => void;
  onCloseWorkspace: () => void;
  workspaceType: 'scrape' | 'prompt' | 'upload';
}

interface GeneratedCreativeItem {
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
}

interface HistoryEntry {
  id: string;
  prompt: string;
  aspectRatio: string;
  imageCount: string;
  modelSource: string;
  createdAt: string;
  images: GeneratedCreativeItem[];
}

// const ratioOptions = [
//   { label: '1:1', value: '1:1' },
//   { label: '4:3', value: '4:3' },
//   { label: '3:4', value: '3:4' },
//   { label: '16:9', value: '16:9' },
//   { label: '9:16', value: '9:16' },
// ];
// 
// const imageCountOptions = ['1', '2', '3', '4'];
// 
// const modelOptions = ['Nano Banana Pro', 'Nano Banana Lite', 'Creative Studio'];

const LOCAL_STORAGE_HISTORY_KEY = 'ai-creative-history-v1';
const LOCAL_STORAGE_GENERATED_KEY = 'ai-creative-generated-v1';

const AiCreativeWorkspace: React.FC<AiCreativeWorkspaceProps> = ({
  // NOTE: localStorage persistence removed to prevent QuotaExceededError.

  open,
  productUrl,
  selectedImages,
  onBackToSelection,
  onCloseWorkspace,
  workspaceType,
}) => {
  const [creativeSource, setCreativeSource] = useState<'generator' | 'reference'>('generator');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('4:3');
  const [imageCount, setImageCount] = useState('1');
  const [modelSource, setModelSource] = useState('Nano Banana Pro');
  const [generatedImages, setGeneratedImages] = useState<GeneratedCreativeItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [previewImage, setPreviewImage] = useState<GeneratedCreativeItem | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingToHub, setIsSavingToHub] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedPreviews, setUploadedPreviews] = useState<string[]>([]);

  const canSubmit = useMemo(() => {
    return prompt.trim().length > 0;
  }, [prompt]);

  const ratioToSizeMap: Record<string, string> = {
    '1:1': '1024x1024',
    '4:3': '1536x1024',
    '3:4': '1024x1536',
    '16:9': '1536x1024',
    '9:16': '1024x1536',
  };

  const compressImageFile = async (file: File): Promise<File> => {
    if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
      return file;
    }

    const imageBitmap = await createImageBitmap(file);
    const maxDimension = 2048;
    const scale = Math.min(1, maxDimension / Math.max(imageBitmap.width, imageBitmap.height));
    const width = Math.round(imageBitmap.width * scale);
    const height = Math.round(imageBitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return file;

    context.drawImage(imageBitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.75),
    );

    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
      type: 'image/jpeg',
    });
  };

  const handleOpenPreview = (item: GeneratedCreativeItem) => {
    setPreviewImage(item);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleAddToCreativeHub = async (item: GeneratedCreativeItem) => {
    try {
      setIsSavingToHub(true);
      toast.loading('Saving creative to Creative Hub...', { id: 'save-ai-creative' });

      await api.post('/content', {
        title: (item.prompt || prompt.trim() || 'AI Creative')
        .split(' ')
        .slice(0, 4)
        .join(' '),
        contentType: 'image',
        imageUrl: item.imageUrl,
        thumbnailUrl: item.imageUrl,
        platforms: ['Meta'],
      });

      setGeneratedImages((prev) =>
        prev.map((entry) =>
          entry.id === item.id ? { ...entry, savedToHub: true } : entry,
        ),
      );

      toast.success('Creative saved to Creative Hub successfully.', {
        id: 'save-ai-creative',
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to save creative to Creative Hub.',
        { id: 'save-ai-creative' }
      );
    } finally {
      setIsSavingToHub(false);
    }
  };

  const handleDownloadImage = async (imageUrl: string, fileName?: string) => {
    try {
      setIsDownloading(true);

      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.download = fileName || `creative-${Date.now()}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started.');
    } catch (error) {
      toast.error('Failed to download image.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUploadImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setUploadedPreviews(previews);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedHistory = window.localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      const storedGenerated = window.localStorage.getItem(LOCAL_STORAGE_GENERATED_KEY);

      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }

      if (storedGenerated) {
        const parsed = JSON.parse(storedGenerated);
        if (Array.isArray(parsed)) {
          setGeneratedImages(parsed);
        }
      }
    } catch {
      // ignore invalid local storage data
    }
  }, []);


  const handleGenerateCreative = async (options?: {
  prompt?: string;
  aspectRatio?: string;
  imageCount?: string;
  modelSource?: string;
  selectedImages?: string[];
  uploadedFiles?: File[];
}) => {
  const promptValue = options?.prompt ?? prompt;
  const aspectRatioValue = options?.aspectRatio ?? aspectRatio;
  const imageCountValue = options?.imageCount ?? imageCount;
  const modelSourceValue = options?.modelSource ?? modelSource;

  const uploadFiles =
    options?.uploadedFiles ?? uploadedFiles;

  if (!promptValue.trim() || isGenerating) return;

  try {
    setIsGenerating(true);
    setGenerateError('');

    const formData = new FormData();

    formData.append('prompt', promptValue.trim());
    formData.append('productUrl', productUrl || '');
    formData.append('aspectRatio', aspectRatioValue);
    formData.append('imageCount', imageCountValue);
    formData.append(
      'size',
      ratioToSizeMap[aspectRatioValue] || '1024x1024',
    );

    formData.append('quality', 'medium');

    if (
      workspaceType === 'upload' &&
      uploadFiles &&
      uploadFiles.length > 0
    ) {
      const compressedFiles = await Promise.all(
        uploadFiles
          .slice(0, 4)
          .map((file) => compressImageFile(file)),
      );

      compressedFiles.forEach((file) => {
        formData.append('referenceFiles', file);
      });
    }

    const response = await api.post(
      '/content/generate-reference-creative',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    const apiImages = Array.isArray(response?.data?.images)
      ? response.data.images
      : [];

    const mapped: GeneratedCreativeItem[] =
      apiImages.map((item: any, index: number) => ({
        id: item.id || `${Date.now()}-${index}`,
        prompt: promptValue.trim(),
        imageUrl: item.imageUrl,
        label: 'OpenAI Creative Expert',
        sizeLabel: `${aspectRatioValue} (${
          item.size ||
          ratioToSizeMap[aspectRatioValue] ||
          '1024x1024'
        })`,
        createdAt: 'Just now',
        savedToHub: false,
        aspectRatio: aspectRatioValue,
        imageCount: imageCountValue,
        modelSource: modelSourceValue,
      }));

    setGeneratedImages((prev) => [...mapped, ...prev]);

    setHistory((prev) => [
      {
        id: `history-${Date.now()}`,
        prompt: promptValue.trim(),
        aspectRatio: aspectRatioValue,
        imageCount: imageCountValue,
        modelSource: modelSourceValue,
        createdAt: 'Just now',
        images: mapped,
      },
      ...prev,
    ]);
  } catch (error: any) {
    setGenerateError(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to generate creative',
    );
  } finally {
    setIsGenerating(false);
  }
};

  if (!open) return null;

  // ─── Dark theme tokens ───────────────────────────────────────────────────────
  const dk = {
    bg: 'var(--bg-secondary)',
    surface: 'var(--bg-card)',
    surfaceElevated: 'var(--glass-border)',
    border: 'var(--glass-border)',
    borderSubtle: 'var(--bg-elevated)',
    borderAccent: 'var(--accent-primary)',
    text: 'var(--text-primary)',
    textMuted: 'var(--text-secondary)',
    textDim: 'var(--text-dim)',
    accent: 'var(--accent-primary)',
    accentDeep: 'var(--accent-primary)',
    accentBg: 'var(--glass-bg)',
    accentBgHover: 'var(--bg-elevated)',
    danger: 'var(--error)',
    inputBg: 'var(--bg-elevated)',
    inputBorder: 'var(--glass-border)',
    skeletonBg: 'var(--glass-border)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    borderRadius: '999px',
    border: `1.5px solid ${dk.inputBorder}`,
    padding: '0 18px',
    fontSize: '0.96rem',
    color: dk.text,
    outline: 'none',
    background: dk.inputBg,
  };

  // const selectStyle: React.CSSProperties = {
  //   width: '100%',
  //   height: '50px',
  //   borderRadius: '999px',
  //   border: `1.5px solid ${dk.border}`,
  //   background: dk.inputBg,
  //   padding: '0 42px 0 16px',
  //   color: dk.text,
  //   fontWeight: 600,
  //   fontSize: '0.96rem',
  //   outline: 'none',
  //   appearance: 'none',
  //   cursor: 'pointer',
  // };

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedHistory = window.localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      const storedGenerated = window.localStorage.getItem(LOCAL_STORAGE_GENERATED_KEY);

      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }

      if (storedGenerated) {
        const parsed = JSON.parse(storedGenerated);
        if (Array.isArray(parsed)) {
          setGeneratedImages(parsed);
        }
      }
    } catch {
      // ignore invalid local storage data
    }
  }, []);

useEffect(() => {
  if (typeof window === 'undefined') return;

  const safeHistory = history.map((h) => ({
    id: h.id,
    prompt: h.prompt,
    aspectRatio: h.aspectRatio,
    imageCount: h.imageCount,
    modelSource: h.modelSource,
    createdAt: h.createdAt,
    images: h.images.map((img) => ({
      id: img.id,
      imageUrl: '', // ❌ remove image
    })),
  }));

  try {
    localStorage.setItem(
      LOCAL_STORAGE_HISTORY_KEY,
      JSON.stringify(safeHistory),
    );
  } catch (e) {
    console.warn('History storage skipped (quota safe)');
  }
}, [history]);

useEffect(() => {
  if (typeof window === 'undefined') return;

  const safeHistory = history.map((h) => ({
    id: h.id,
    prompt: h.prompt,
    aspectRatio: h.aspectRatio,
    imageCount: h.imageCount,
    modelSource: h.modelSource,
    createdAt: h.createdAt,
    images: h.images.map((img) => ({
      id: img.id,
      imageUrl: '', // ❌ remove image
    })),
  }));

  try {
    localStorage.setItem(
      LOCAL_STORAGE_HISTORY_KEY,
      JSON.stringify(safeHistory),
    );
  } catch (e) {
    console.warn('History storage skipped (quota safe)');
  }
}, [history]);

  React.useEffect(() => {
    if (workspaceType === 'prompt' && productUrl && !prompt) {
      setPrompt(productUrl);
    }
  }, [workspaceType, productUrl, prompt]);


  return (
    <div
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 180px)',
        background: dk.bg,
        borderRadius: '28px',
        border: `1px solid ${dk.border}`,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        padding: '22px',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '18px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onBackToSelection}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '999px',
              border: `1px solid ${dk.border}`,
              background: dk.surface,
              color: dk.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h2 style={{ margin: 0, fontSize: '1.42rem', fontWeight: 800, color: dk.text }}>
              {selectedImages.length > 0 ? 'Reference Creative Workspace' : 'AI Creative Workspace'}
            </h2>
            <p style={{ margin: '6px 0 0', color: dk.textMuted, fontSize: '0.92rem' }}>
              {selectedImages.length > 0
                ? 'Create creative using selected reference images.'
                : 'Create AI generated creative using prompt settings.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onBackToSelection}
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: '999px',
              border: `1px solid ${dk.borderAccent}`,
              background: dk.accentBg,
              color: dk.accent,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back to Image Selection
          </button>

          <button
            type="button"
            onClick={onCloseWorkspace}
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: '999px',
              border: `1px solid ${dk.border}`,
              background: dk.surface,
              color: dk.textMuted,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div
        className="ai-creative-workspace-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.95fr) minmax(360px, 0.68fr)',
          gap: '22px',
          alignItems: 'start',
        }}
      >
        {/* ── Left Panel ── */}
        <div
          style={{
            minWidth: 0,
            borderRight: `1px solid ${dk.borderSubtle}`,
            paddingRight: '18px',
          }}
        >
          {/* Product URL card */}
          <div
            style={{
              border: `1px solid ${dk.border}`,
              borderRadius: '22px',
              padding: '18px',
              background: dk.surface,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: dk.text,
                  }}
                >
                  <span style={{ color: dk.danger }}>*</span> Product URL
                  <span
                    style={{
                      marginLeft: '8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '999px',
                      background: dk.surfaceElevated,
                      color: dk.textMuted,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      verticalAlign: 'middle',
                    }}
                  >
                    <Info size={12} />
                  </span>
                </label>

                <input
                  type="text"
                  value={productUrl}
                  readOnly
                  style={inputStyle}
                />
              </div>

              <button
                type="button"
                onClick={onBackToSelection}
                style={{
                  height: '48px',
                  padding: '0 24px',
                  borderRadius: '999px',
                  border: `1.5px solid ${dk.accentDeep}`,
                  background: dk.accentBg,
                  color: dk.accent,
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Fetch Images
              </button>
            </div>

            {/* Upload section */}
            {workspaceType === "upload" && (
              <div style={{ marginTop: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: dk.text,
                  }}
                >
                  Upload Product Images
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleUploadImages}
                  style={{ color: dk.textMuted }}
                />

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '14px' }}>
                  {uploadedPreviews.map((img, i) => (
                    <div
                      key={i}
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: `1px solid ${dk.border}`,
                      }}
                    >
                      <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Creative source + prompt section */}
          <div style={{ borderTop: `1px solid ${dk.borderSubtle}`, paddingTop: '18px', marginTop: '18px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
                fontSize: '0.98rem',
                fontWeight: 600,
                color: dk.text,
              }}
            >
              <span style={{ color: dk.danger }}>*</span> Select Your Creative Source
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '999px',
                  background: dk.surfaceElevated,
                  color: dk.textMuted,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Info size={12} />
              </span>
            </label>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                {/* AI Creative Generator toggle */}
                <button
                  type="button"
                  onClick={() => setCreativeSource('generator')}
                  style={{
                    minWidth: '250px',
                    height: '52px',
                    borderRadius: '999px',
                    border: creativeSource === 'generator' ? `1.5px solid ${dk.accentDeep}` : `1.5px solid ${dk.border}`,
                    background: creativeSource === 'generator' ? dk.accentBg : dk.surface,
                    color: dk.text,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '12px',
                    padding: '0 18px',
                  }}
                >
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '999px',
                      border: `2px solid ${dk.accentDeep}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {creativeSource === 'generator' && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: dk.accentDeep, display: 'block' }} />
                    )}
                  </span>
                  <Sparkles size={16} color={dk.accent} />
                  AI Creative Generator
                </button>

                {/* Select or Upload Reference toggle */}
                <button
                  type="button"
                  onClick={() => setCreativeSource('reference')}
                  style={{
                    minWidth: '250px',
                    height: '52px',
                    borderRadius: '999px',
                    border: creativeSource === 'reference' ? `1.5px solid ${dk.accentDeep}` : `1.5px solid ${dk.border}`,
                    background: creativeSource === 'reference' ? dk.accentBg : dk.surface,
                    color: dk.text,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '12px',
                    padding: '0 18px',
                  }}
                >
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '999px',
                      border: creativeSource === 'reference' ? `2px solid ${dk.accentDeep}` : `2px solid ${dk.border}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {creativeSource === 'reference' && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: dk.accentDeep, display: 'block' }} />
                    )}
                  </span>
                  Select or Upload Reference
                </button>
              </div>

              <div
                style={{
                  height: '40px',
                  borderRadius: '999px',
                  border: `1px solid ${dk.border}`,
                  background: dk.surfaceElevated,
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: dk.textMuted,
                  fontWeight: 600,
                  fontSize: '0.92rem',
                }}
              >
                Inspiration
                <span style={{ color: '#3b82f6', fontWeight: 800 }}>◎</span>
                <span style={{ color: '#ec4899', fontWeight: 800 }}>∞</span>
                <span style={{ color: '#ef4444', fontWeight: 800 }}>G</span>
              </div>
            </div>

            {/* Prompt input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.98rem', fontWeight: 600, color: dk.text }}>
                Prompt
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="i want poster for diwali"
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '999px',
                    border: `1.5px solid ${dk.inputBorder}`,
                    padding: '0 54px 0 18px',
                    fontSize: '1rem',
                    color: dk.text,
                    outline: 'none',
                    background: dk.inputBg,
                  }}
                />

                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '34px',
                    height: '34px',
                    borderRadius: '999px',
                    border: `1px solid ${dk.border}`,
                    background: dk.surfaceElevated,
                    color: dk.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCcw size={15} />
                </button>
              </div>
            </div>

            {/* Dropdowns row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              
            </div>

            {/* Submit button */}
            <button
              type="button"
onClick={() => handleGenerateCreative()}
              disabled={!canSubmit || isGenerating}
              style={{
                width: '100%',
                maxWidth: '320px',
                height: '56px',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-glow) 100%)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: canSubmit && !isGenerating ? 'pointer' : 'not-allowed',
                opacity: canSubmit && !isGenerating ? 1 : 0.45,
                boxShadow: '0 16px 35px rgba(109, 40, 217, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="spin-loader" />
                  Generating...
                </>
              ) : (
                'Submit Now'
              )}
            </button>

            {generateError ? (
              <div style={{ marginTop: '12px', color: dk.danger, fontSize: '0.9rem', fontWeight: 500 }}>
                {generateError}
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div style={{ minWidth: 0, position: 'sticky', top: '12px', alignSelf: 'start' }}>
          <div
            style={{
              border: `1px solid ${dk.border}`,
              borderRadius: '24px',
              background: dk.surface,
              height: 'calc(100vh - 240px)',
              minHeight: '620px',
              maxHeight: '780px',
              padding: '18px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Panel header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '16px',
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ fontSize: '1.02rem', fontWeight: 800, color: dk.text }}>
                  AI Generated Posters
                </div>
                <div style={{ marginTop: '4px', fontSize: '0.86rem', color: dk.textMuted }}>
                  Only generated creatives will appear here
                </div>
              </div>

              <button
                type="button"
                disabled={isGenerating}
                style={{
                  height: '40px',
                  padding: '0 16px',
                  borderRadius: '999px',
                  border: `1px solid ${dk.border}`,
                  background: dk.surfaceElevated,
                  color: dk.text,
                  fontWeight: 700,
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  flexShrink: 0,
                  opacity: isGenerating ? 0.5 : 1,
                }}
              >
                {isGenerating ? 'Generating...' : 'Regenerate'}
              </button>
            </div>

            {/* Scrollable content */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                paddingRight: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  borderRadius: '20px',
                  border: `1px solid ${dk.border}`,
                  background: dk.surfaceElevated,
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: dk.text }}>Creative history</div>
                    <div style={{ marginTop: '4px', fontSize: '0.82rem', color: dk.textMuted }}>
                      Review previous prompts and reuse or repeat any generated creative session.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const latest = history[0];
                      if (latest) {
                        handleGenerateCreative({
                          prompt: latest.prompt,
                          aspectRatio: latest.aspectRatio,
                          imageCount: latest.imageCount,
                          modelSource: latest.modelSource,
                        });
                      }
                    }}
                    disabled={isGenerating || history.length === 0}
                    style={{
                      height: '38px',
                      padding: '0 14px',
                      borderRadius: '999px',
                      border: `1px solid ${dk.border}`,
                      background: dk.surface,
                      color: dk.text,
                      fontWeight: 700,
                      cursor: isGenerating || history.length === 0 ? 'not-allowed' : 'pointer',
                      opacity: isGenerating || history.length === 0 ? 0.5 : 1,
                    }}
                  >
                    Repeat last prompt
                  </button>
                </div>

                {history.length === 0 ? (
                  <div style={{ color: dk.textMuted, fontSize: '0.88rem' }}>
                    Your prompt history will appear here after each generation. Use it to reprompt or view earlier image results.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '14px' }}>
                    {history.map((entry) => (
                      <div
                        key={entry.id}
                        style={{
                          borderRadius: '20px',
                          border: `1px solid ${dk.borderSubtle}`,
                          background: dk.surface,
                          padding: '14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: dk.text }}>{entry.prompt}</div>
                            <div style={{ marginTop: '6px', fontSize: '0.82rem', color: dk.textMuted }}>
                              {entry.imageCount} image{entry.imageCount !== '1' ? 's' : ''} · {entry.aspectRatio} · {entry.modelSource}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '0.78rem', color: dk.textDim }}>{entry.createdAt}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          {entry.images.slice(0, 3).map((img) => (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => handleOpenPreview(img)}
                              style={{
                                width: '82px',
                                height: '82px',
                                borderRadius: '18px',
                                overflow: 'hidden',
                                border: `1px solid ${dk.border}`,
                                background: dk.inputBg,
                                padding: 0,
                                cursor: 'pointer',
                              }}
                            >
                              <img src={img.imageUrl} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </button>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setPrompt(entry.prompt);
                              setAspectRatio(entry.aspectRatio);
                              setImageCount(entry.imageCount);
                              setModelSource(entry.modelSource);
                              setCreativeSource('generator');
                            }}
                            style={{
                              flex: 1,
                              minWidth: '120px',
                              height: '40px',
                              borderRadius: '999px',
                              border: `1px solid ${dk.border}`,
                              background: dk.surfaceElevated,
                              color: dk.text,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Use prompt
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenerateCreative({
                              prompt: entry.prompt,
                              aspectRatio: entry.aspectRatio,
                              imageCount: entry.imageCount,
                              modelSource: entry.modelSource,
                            })}
                            disabled={isGenerating}
                            style={{
                              flex: 1,
                              minWidth: '120px',
                              height: '40px',
                              borderRadius: '999px',
                              border: `1px solid ${dk.borderAccent}`,
                              background: dk.accentBg,
                              color: dk.accent,
                              fontWeight: 700,
                              cursor: isGenerating ? 'not-allowed' : 'pointer',
                              opacity: isGenerating ? 0.6 : 1,
                            }}
                          >
                            Repeat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isGenerating && generatedImages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Array.from({ length: Number(imageCount || '1') }).map((_, index) => (
                    <div
                      key={index}
                      style={{
                        borderRadius: '20px',
                        border: `1px solid ${dk.border}`,
                        background: dk.surfaceElevated,
                        padding: '16px',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ height: '18px', width: '160px', borderRadius: '999px', background: dk.skeletonBg, marginBottom: '14px' }} />
                      <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '18px', background: dk.skeletonBg }} />
                    </div>
                  ))}
                </div>
              ) : generatedImages.length > 0 ? (
                generatedImages.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: '20px',
                      border: `1px solid ${dk.border}`,
                      background: dk.surfaceElevated,
                      padding: '16px',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        marginBottom: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '999px',
                            background: 'linear-gradient(135deg, var(--glass-bg) 0%, var(--accent-primary) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: dk.accent,
                            flexShrink: 0,
                          }}
                        >
                          <Bot size={20} />
                        </div>

                        <div>
                          <div style={{ fontWeight: 800, color: dk.text, fontSize: '0.96rem' }}>{item.label}</div>
                          <div style={{ marginTop: '2px', fontSize: '0.84rem', color: dk.textMuted }}>{item.sizeLabel}</div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: dk.textDim, whiteSpace: 'nowrap' }}>{item.createdAt}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPreview(item)}
                      style={{
                        width: '100%',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        background: dk.bg,
                        border: `1px solid ${dk.border}`,
                        padding: 0,
                        cursor: 'pointer',
                        display: 'block',
                      }}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.label}
                        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                      />
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPrompt(item.prompt);
                          setAspectRatio(item.aspectRatio);
                          setImageCount(item.imageCount);
                          setModelSource(item.modelSource);
                          setCreativeSource('reference');
                          handleGenerateCreative({
                            prompt: item.prompt,
                            aspectRatio: item.aspectRatio,
                            imageCount: item.imageCount,
                            modelSource: item.modelSource,
                            selectedImages: [item.imageUrl],
                          });
                        }}
                        disabled={isGenerating}
                        style={{
                          width: '100%',
                          height: '48px',
                          borderRadius: '999px',
                          border: `1px solid ${dk.border}`,
                          background: dk.surfaceElevated,
                          color: dk.text,
                          fontWeight: 700,
                          cursor: isGenerating ? 'not-allowed' : 'pointer',
                          opacity: isGenerating ? 0.7 : 1,
                        }}
                      >
                        Reprompt
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddToCreativeHub(item)}
                        disabled={isSavingToHub || item.savedToHub}
                        style={{
                          width: '100%',
                          height: '48px',
                          borderRadius: '999px',
                          border: `1px solid ${item.savedToHub ? dk.border : dk.borderAccent}`,
                          background: item.savedToHub ? dk.surfaceElevated : dk.accentBg,
                          color: item.savedToHub ? dk.textMuted : dk.accent,
                          fontWeight: 700,
                          cursor: isSavingToHub || item.savedToHub ? 'not-allowed' : 'pointer',
                          opacity: isSavingToHub || item.savedToHub ? 0.65 : 1,
                        }}
                      >
                        {item.savedToHub ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    flex: 1,
                    minHeight: '100%',
                    borderRadius: '20px',
                    border: `1px dashed ${dk.borderAccent}`,
                    background: dk.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '28px',
                    textAlign: 'center',
                    color: dk.textMuted,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: dk.text, marginBottom: '8px' }}>
                      No generated images yet
                    </div>
                    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                      Prompt do, ratio select karo, image count choose karo,
                      then generated posters yahin right panel me show honge.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {previewImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={handleClosePreview}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '860px',
              background: dk.surface,
              borderRadius: '32px',
              padding: '24px 24px 18px',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
              border: `1px solid ${dk.border}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                marginBottom: '18px',
              }}
            >
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: dk.text }}>
                AI Image Preview
              </div>

              <button
                type="button"
                onClick={handleClosePreview}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '999px',
                  border: `1px solid ${dk.border}`,
                  background: dk.surfaceElevated,
                  color: dk.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={22} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: dk.bg,
                borderRadius: '20px',
                overflow: 'hidden',
                marginBottom: '18px',
                maxHeight: '65vh',
              }}
            >
              <img
                src={previewImage.imageUrl}
                alt={previewImage.label}
                style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', display: 'block' }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setPrompt(previewImage.prompt);
                  setAspectRatio(previewImage.aspectRatio);
                  setImageCount(previewImage.imageCount);
                  setModelSource(previewImage.modelSource);
                  setCreativeSource('reference');
                  handleClosePreview();
                  handleGenerateCreative({
                    prompt: previewImage.prompt,
                    aspectRatio: previewImage.aspectRatio,
                    imageCount: previewImage.imageCount,
                    modelSource: previewImage.modelSource,
                    selectedImages: [previewImage.imageUrl],
                  });
                }}
                disabled={isGenerating}
                style={{
                  height: '56px',
                  padding: '0 28px',
                  borderRadius: '999px',
                  border: `1px solid ${dk.border}`,
                  background: dk.surfaceElevated,
                  color: dk.text,
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  opacity: isGenerating ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <RefreshCcw size={18} />
                {isGenerating ? 'Reprompting...' : 'Re-prompt'}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownloadImage(
                    previewImage.imageUrl,
                    `${previewImage.label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`
                  )
                }
                disabled={isDownloading}
                style={{
                  height: '56px',
                  padding: '0 28px',
                  borderRadius: '999px',
                  border: `1px solid ${dk.border}`,
                  background: dk.surfaceElevated,
                  color: dk.text,
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  cursor: isDownloading ? 'not-allowed' : 'pointer',
                  opacity: isDownloading ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Download size={18} />
                {isDownloading ? 'Downloading...' : 'Download images'}
              </button>

              <button
                type="button"
                onClick={() => handleAddToCreativeHub(previewImage)}
                disabled={isSavingToHub}
                style={{
                  height: '56px',
                  padding: '0 28px',
                  borderRadius: '999px',
                  border: 'none',
                  background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-glow) 100%)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  cursor: isSavingToHub ? 'not-allowed' : 'pointer',
                  opacity: isSavingToHub ? 0.75 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 16px 35px rgba(76, 29, 149, 0.4)',
                }}
              >
                <Plus size={18} />
                {isSavingToHub ? 'Saving...' : 'Add to Creative Hub'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          .ai-creative-workspace-grid {
            width: 100%;
          }

          .ai-creative-workspace-grid select::-ms-expand {
            display: none;
          }

          .ai-creative-workspace-grid * {
            box-sizing: border-box;
          }

          @media (max-width: 1180px) {
            .ai-creative-workspace-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 768px) {
            .ai-creative-workspace-grid {
              gap: 16px !important;
            }
          }

          .spin-loader {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          input::placeholder {
            color: var(--text-dim);
          }

          select option {
            background: var(--bg-card);
            color: var(--text-primary);
          }
        `}
      </style>
    </div>
  );
};

export default AiCreativeWorkspace;