import React, { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast/headless';
import { api } from "../../../api/axios";
import {

  RefreshCcw,
  Sparkles,
  ImagePlus,
  Info,
  Bot,
  ChevronDown,
   Loader2,
    ArrowLeft,
     X,
  Download,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';


interface AiCreativeWorkspaceProps {
  open: boolean;
  productUrl: string;
  selectedImages: string[];
  onBackToSelection: () => void;
  onCloseWorkspace: () => void;
}

interface GeneratedCreativeItem {
  id: string;
  imageUrl: string;
  label: string;
  sizeLabel: string;
  createdAt: string;
}

const ratioOptions = [
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
];

const imageCountOptions = ['1', '2', '3', '4'];

const modelOptions = ['Nano Banana Pro', 'Nano Banana Lite', 'Creative Studio'];

// const mockGeneratedImages: GeneratedCreativeItem[] = [
//   {
//     id: '1',
//     imageUrl:
//       'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
//     label: 'AdsGo Creative Expert',
//     sizeLabel: '1:1 (1024×1024)',
//     createdAt: 'Just now',
//   },
//   {
//     id: '2',
//     imageUrl:
//       'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
//     label: 'AdsGo Creative Expert',
//     sizeLabel: '4:3 (1280×960)',
//     createdAt: '2 min ago',
//   },
//   {
//     id: '3',
//     imageUrl:
//       'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
//     label: 'AdsGo Creative Expert',
//     sizeLabel: '16:9 (1600×900)',
//     createdAt: '5 min ago',
//   },
// ];

const AiCreativeWorkspace: React.FC<AiCreativeWorkspaceProps> = ({
  open,
  productUrl,
  selectedImages,
  onBackToSelection,
  onCloseWorkspace,
}) => {
  const [creativeSource, setCreativeSource] = useState<'generator' | 'reference'>('generator');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('4:3');
  const [imageCount, setImageCount] = useState('1');
  const [modelSource, setModelSource] = useState('Nano Banana Pro');
    const [generatedImages, setGeneratedImages] = useState<GeneratedCreativeItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [previewImage, setPreviewImage] = useState<GeneratedCreativeItem | null>(null);
const [isDownloading, setIsDownloading] = useState(false);
const [isSavingToHub, setIsSavingToHub] = useState(false);

  // const canSubmit = useMemo(() => {
  //   return prompt.trim().length > 0 && selectedImages.length > 0;
  // }, [prompt, selectedImages]);

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

  const handleOpenPreview = (item: GeneratedCreativeItem) => {
  setPreviewImage(item);
};

const handleClosePreview = () => {
  setPreviewImage(null);
};

// const handleDownloadImage = async (imageUrl: string, fileName?: string) => {
//   try {
//     setIsDownloading(true);

//     const response = await fetch(imageUrl);
//     const blob = await response.blob();

//     const objectUrl = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = objectUrl;
//     link.download = fileName || `creative-${Date.now()}.png`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     window.URL.revokeObjectURL(objectUrl);

//     toast.success('Image downloaded successfully.');
//   } catch {
//     toast.error('Failed to download image.');
//   } finally {
//     setIsDownloading(false);
//   }
// };

const handleAddToCreativeHub = async (item: GeneratedCreativeItem) => {
  try {
    setIsSavingToHub(true);
    toast.loading('Saving creative to Creative Hub...', { id: 'save-ai-creative' });

    await api.post('/content', {
      title: `${prompt.trim() || 'AI Creative'} - ${item.sizeLabel}`,
      contentType: 'image',
      imageUrl: item.imageUrl,
      thumbnailUrl: item.imageUrl,
      platforms: ['Meta'],
    });

    toast.success('Creative saved to Creative Hub successfully.', {
      id: 'save-ai-creative',
    });

    setPreviewImage(null);
    onCloseWorkspace();
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message || 'Failed to save creative to Creative Hub.',
      { id: 'save-ai-creative' }
    );
  } finally {
    setIsSavingToHub(false);
  }
};

//   const handleOpenPreview = (item: GeneratedCreativeItem) => {
//   setPreviewImage(item);
// };

// const handleClosePreview = () => {
//   setPreviewImage(null);
// };

const handleDownloadImage = async (imageUrl: string, fileName?: string) => {
  try {
    setIsDownloading(true);

    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName || `creative-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);

    toast.success('Image downloaded successfully.');
  } catch (error) {
    toast.error('Failed to download image.');
  } finally {
    setIsDownloading(false);
  }
};

  const handleGenerateCreative = async () => {
    if (!canSubmit || isGenerating) return;

    try {
      setIsGenerating(true);
      setGenerateError('');

//     const response = await api.post('/content/generate-reference-creative', {
//   prompt: prompt.trim(),
//   referenceImages: selectedImages.slice(0, 4),
//   productUrl,
//   aspectRatio,
//   imageCount,
//   size: ratioToSizeMap[aspectRatio] || '1024x1024',
//   quality: 'high',
// });


const payload: any = {
  prompt: prompt.trim(),
  productUrl,
  aspectRatio,
  imageCount,
  size: ratioToSizeMap[aspectRatio] || '1024x1024',
  quality: 'high',
};

if (selectedImages.length > 0) {
  payload.referenceImages = selectedImages.slice(0, 4);
}

const response = await api.post(
  '/content/generate-reference-creative',
  payload
);

      const apiImages = Array.isArray(response?.data?.images) ? response.data.images : [];

      const mapped: GeneratedCreativeItem[] = apiImages.map((item: any, index: number) => ({
        id: item.id || `${Date.now()}-${index}`,
        imageUrl: item.imageUrl,
        label: 'OpenAI Creative Expert',
        sizeLabel: `${aspectRatio} (${item.size || ratioToSizeMap[aspectRatio] || '1024x1024'})`,
        createdAt: 'Just now',
      }));

      setGeneratedImages((prev) => [...mapped, ...prev]);
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

//   const generatedImages = mockGeneratedImages;

  if (!open) return null;

  return (
    <div
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 180px)',
        background: 'rgba(10, 15, 30, 0.95)',
        borderRadius: '28px',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        padding: '22px',
      }}
    >
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
      border: '1px solid var(--glass-border)',
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
      transition: 'all 0.2s ease',
    }}
  >
    <ArrowLeft size={18} />
  </button>

  <div>
    <h2
      style={{
        margin: 0,
        fontSize: '1.42rem',
        fontWeight: 800,
        color: 'var(--text-primary)',
      }}
    >
      AI Creative Workspace
    </h2>

    <p
      style={{
        margin: '6px 0 0',
        color: 'var(--text-secondary)',
        fontSize: '0.92rem',
      }}
    >
      Create your creative using selected reference images and prompt settings.
    </p>
  </div>
</div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={onBackToSelection}
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: '999px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary)',
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
              border: '1px solid var(--glass-border)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-secondary)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>

      <div
        className="ai-creative-workspace-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.95fr) minmax(360px, 0.68fr)',
          gap: '22px',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            minWidth: 0,
            borderRight: '1px solid #f1ecfb',
            paddingRight: '18px',
          }}
        >
          <div
            style={{
              border: '1px solid var(--glass-border)',
              borderRadius: '22px',
              padding: '18px',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '12px',
                alignItems: 'end',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  <span style={{ color: '#e11d48' }}>*</span> Product URL
                  <span
                    style={{
                      marginLeft: '8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '999px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-secondary)',
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
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '999px',
                    border: '1px solid var(--glass-border)',
                    padding: '0 18px',
                    fontSize: '0.96rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={onBackToSelection}
                style={{
                  height: '48px',
                  padding: '0 24px',
                  borderRadius: '999px',
                  border: '1.5px solid #2631d6',
                  background: 'rgba(38, 49, 214, 0.1)',
                  color: '#2631d6',
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Fetch Images
              </button>
            </div>

            <div style={{ marginTop: '18px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                Upload product images
              </label>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '18px',
                  padding: '14px',
                  minHeight: '118px',
                }}
              >
                {selectedImages.map((img, index) => (
                  <div
                    key={`${img}-${index}`}
                    style={{
                      width: '98px',
                      height: '98px',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      border: '1px solid var(--glass-border)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={img}
                      alt={`selected-${index}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={onBackToSelection}
                  style={{
                    width: '98px',
                    height: '98px',
                    borderRadius: '14px',
                    border: '1.5px dashed var(--glass-border)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: '#2631d6',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '6px',
                    flexShrink: 0,
                  }}
                >
                  <ImagePlus size={24} />
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid #ede9fe',
              paddingTop: '18px',
              marginTop: '18px',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
                fontSize: '0.98rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              <span style={{ color: '#e11d48' }}>*</span> Select Your Creative Source
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  flex: 1,
                }}
              >
                <button
                  type="button"
                  onClick={() => setCreativeSource('generator')}
                  style={{
                    minWidth: '250px',
                    height: '52px',
                    borderRadius: '999px',
                        border:
                          creativeSource === 'generator'
                            ? '1.5px solid #2631d6'
                            : '1px solid var(--glass-border)',
                        background: creativeSource === 'generator' ? 'rgba(38, 49, 214, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        color: 'var(--text-primary)',
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
                      border: '2px solid #2631d6',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {creativeSource === 'generator' && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '999px',
                          background: '#2631d6',
                          display: 'block',
                        }}
                      />
                    )}
                  </span>
                  <Sparkles size={16} />
                  AI Creative Generator
                </button>

                <button
                  type="button"
                  onClick={() => setCreativeSource('reference')}
                  style={{
                    minWidth: '250px',
                    height: '52px',
                    borderRadius: '999px',
                        border:
                          creativeSource === 'reference'
                            ? '1.5px solid #2631d6'
                            : '1px solid var(--glass-border)',
                        background: creativeSource === 'reference' ? 'rgba(38, 49, 214, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        color: 'var(--text-primary)',
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
                      border:
                        creativeSource === 'reference'
                          ? '2px solid #2631d6'
                          : '2px solid #d4d4d8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {creativeSource === 'reference' && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '999px',
                          background: '#2631d6',
                          display: 'block',
                        }}
                      />
                    )}
                  </span>
                  Select or Upload Reference
                </button>
              </div>

              <div
                style={{
                  height: '40px',
                  borderRadius: '999px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                }}
              >
                Inspiration
                <span style={{ color: '#2563eb', fontWeight: 800 }}>◎</span>
                <span style={{ color: '#db2777', fontWeight: 800 }}>∞</span>
                <span style={{ color: '#ea4335', fontWeight: 800 }}>G</span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
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
                    border: '1px solid var(--glass-border)',
                    padding: '0 54px 0 18px',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    background: 'rgba(255, 255, 255, 0.05)',
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
                    border: '1px solid #e5e7eb',
                    background: '#fff',
                    color: '#71717a',
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

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ position: 'relative' }}>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  style={{
                    width: '100%',
                    height: '50px',
                    borderRadius: '999px',
                    border: '1.5px solid #e5e7eb',
                    background: '#fff',
                    padding: '0 42px 0 16px',
                    color: '#18181b',
                    fontWeight: 600,
                    fontSize: '0.96rem',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {ratioOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#52525b',
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <select
                  value={imageCount}
                  onChange={(e) => setImageCount(e.target.value)}
                  style={{
                    width: '100%',
                    height: '50px',
                    borderRadius: '999px',
                    border: '1.5px solid #e5e7eb',
                    background: '#fff',
                    padding: '0 42px 0 16px',
                    color: '#18181b',
                    fontWeight: 600,
                    fontSize: '0.96rem',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {imageCountOptions.map((count) => (
                    <option key={count} value={count}>
                      {count} image{count !== '1' ? 's' : ''}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#52525b',
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <select
                  value={modelSource}
                  onChange={(e) => setModelSource(e.target.value)}
                  style={{
                    width: '100%',
                    height: '50px',
                    borderRadius: '999px',
                    border: '1.5px solid #e5e7eb',
                    background: '#fff',
                    padding: '0 42px 0 16px',
                    color: '#18181b',
                    fontWeight: 600,
                    fontSize: '0.96rem',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {modelOptions.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#52525b',
                  }}
                />
              </div>
            </div>

            <button
  type="button"
  onClick={handleGenerateCreative}
  disabled={!canSubmit || isGenerating}
  style={{
    width: '100%',
    maxWidth: '320px',
    height: '56px',
    borderRadius: '999px',
    border: 'none',
    background: 'linear-gradient(90deg, #d8b4fe 0%, #4c1d95 100%)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: canSubmit && !isGenerating ? 'pointer' : 'not-allowed',
    opacity: canSubmit && !isGenerating ? 1 : 0.55,
    boxShadow: '0 16px 35px rgba(76, 29, 149, 0.16)',
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
  <div
    style={{
      marginTop: '12px',
      color: '#dc2626',
      fontSize: '0.9rem',
      fontWeight: 500,
    }}
  >
    {generateError}
  </div>
) : null}
          </div>
        </div>

        <div
          style={{
            minWidth: 0,
            position: 'sticky',
            top: '12px',
            alignSelf: 'start',
          }}
        >
          <div
            style={{
              border: '1px solid #ece7f9',
              borderRadius: '24px',
              background: '#fbfaff',
              height: 'calc(100vh - 240px)',
              minHeight: '620px',
              maxHeight: '780px',
              padding: '18px',
              boxShadow: '0 10px 30px rgba(124, 58, 237, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
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
                <div
                  style={{
                    fontSize: '1.02rem',
                    fontWeight: 800,
                    color: '#18181b',
                  }}
                >
                  AI Generated Posters
                </div>
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '0.86rem',
                    color: '#71717a',
                  }}
                >
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
    border: '1px solid #e5e7eb',
    background: '#fff',
    color: '#18181b',
    fontWeight: 700,
    cursor: isGenerating ? 'not-allowed' : 'pointer',
    flexShrink: 0,
    opacity: isGenerating ? 0.6 : 1,
  }}
>
  {isGenerating ? 'Generating...' : 'Regenerate'}
</button>
            </div>

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
              {isGenerating && generatedImages.length === 0 ? (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}
  >
    {Array.from({ length: Number(imageCount || '1') }).map((_, index) => (
      <div
        key={index}
        style={{
          borderRadius: '20px',
          border: '1px solid #eee7fb',
          background: '#fff',
          padding: '16px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: '18px',
            width: '160px',
            borderRadius: '999px',
            background: '#f3f4f6',
            marginBottom: '14px',
          }}
        />
        <div
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: '18px',
            background: '#f3f4f6',
          }}
        />
      </div>
    ))}
  </div>
) : generatedImages.length > 0 ? (
  generatedImages.map((item) => (
    <div
      key={item.id}
      style={{
        borderRadius: '20px',
        border: '1px solid #eee7fb',
        background: '#fff',
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5b21b6',
              flexShrink: 0,
            }}
          >
            <Bot size={20} />
          </div>

          <div>
            <div
              style={{
                fontWeight: 800,
                color: '#18181b',
                fontSize: '0.96rem',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                marginTop: '2px',
                fontSize: '0.84rem',
                color: '#71717a',
              }}
            >
              {item.sizeLabel}
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: '0.82rem',
            color: '#71717a',
            whiteSpace: 'nowrap',
          }}
        >
          {item.createdAt}
        </div>
      </div>

     <button
  type="button"
  onClick={() => handleOpenPreview(item)}
  style={{
    width: '100%',
    borderRadius: '18px',
    overflow: 'hidden',
    background: '#f5f3ff',
    border: '1px solid #efe9ff',
    padding: 0,
    cursor: 'pointer',
    display: 'block',
  }}
>
  <img
    src={item.imageUrl}
    alt={item.label}
    style={{
      width: '100%',
      height: 'auto',
      display: 'block',
      objectFit: 'cover',
    }}
  />
</button>

      <button
        type="button"
        onClick={handleGenerateCreative}
        disabled={isGenerating}
        style={{
          marginTop: '14px',
          width: '100%',
          height: '48px',
          borderRadius: '999px',
          border: '1px solid #e5e7eb',
          background: '#fff',
          color: '#18181b',
          fontWeight: 700,
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          opacity: isGenerating ? 0.7 : 1,
        }}
      >
        Regenerate
      </button>
    </div>
  ))
) : (
  <div
    style={{
      flex: 1,
      minHeight: '100%',
      borderRadius: '20px',
      border: '1px dashed #d8b4fe',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '28px',
      textAlign: 'center',
      color: '#6b7280',
    }}
  >
    <div>
      <div
        style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: '#18181b',
          marginBottom: '8px',
        }}
      >
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



      {previewImage && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(17, 24, 39, 0.45)',
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
        background: '#fff',
        borderRadius: '32px',
        padding: '24px 24px 18px',
        boxShadow: '0 30px 80px rgba(15, 23, 42, 0.18)',
        border: '1px solid #f1eafe',
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
        <div
          style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#18181b',
          }}
        >
          AI Image Preview
        </div>

        <button
          type="button"
          onClick={handleClosePreview}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '999px',
            border: '1px solid #ece7f9',
            background: '#fafafa',
            color: '#52525b',
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
          background: '#fff',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '18px',
          maxHeight: '65vh',
        }}
      >
        <img
          src={previewImage.imageUrl}
          alt={previewImage.label}
          style={{
            maxWidth: '100%',
            maxHeight: '65vh',
            objectFit: 'contain',
            display: 'block',
          }}
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
            border: '1px solid #e5e7eb',
            background: '#fff',
            color: '#18181b',
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
            background: 'linear-gradient(90deg, #8b5cf6 0%, #1e27a8 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.98rem',
            cursor: isSavingToHub ? 'not-allowed' : 'pointer',
            opacity: isSavingToHub ? 0.75 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 16px 35px rgba(109, 40, 217, 0.18)',
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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
        `}
      </style>
    </div>
  );
};

export default AiCreativeWorkspace;