import React, { useMemo, useState } from 'react';
import { X, ChevronDown, Info, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../GlassCard';

interface AiCreativeModalProps {
  open: boolean;
  genTopic: string;
  genType: string;
  genTone: string;
  generating: boolean;
  setGenTopic: (value: string) => void;
  setGenType: (value: string) => void;
  setGenTone: (value: string) => void;
  onClose: () => void;
  onGenerate: () => void;
  onContinueToWorkspace: (payload: {
    url: string;
    type: string;
    selectedImages: string[];
    allImages: string[];
  }) => void;

  onOpenPromptWorkspace: (payload: {
    url: string;
    type: string;
  }) => void;
}

type FetchImagesResponse =
  | string[]
  | {
      images?: string[];
      data?: string[] | { images?: string[] };
      result?: string[] | { images?: string[] };
      message?: string;
    };

const API_BASE_URL = 'http://localhost:3000';
const FETCH_IMAGES_ENDPOINT = `${API_BASE_URL}/content/fetch-url-images`;
const MAX_SELECTABLE_IMAGES = 4;

const isValidHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const extractImagesFromResponse = (payload: FetchImagesResponse): string[] => {
  if (Array.isArray(payload)) {
    return payload.filter((item) => typeof item === 'string' && item.trim().length > 0);
  }

  if (Array.isArray(payload?.images)) {
    return payload.images.filter((item) => typeof item === 'string' && item.trim().length > 0);
  }

  if (Array.isArray(payload?.data)) {
    return payload.data.filter((item) => typeof item === 'string' && item.trim().length > 0);
  }

  if (payload?.data && typeof payload.data === 'object' && Array.isArray(payload.data.images)) {
    return payload.data.images.filter((item) => typeof item === 'string' && item.trim().length > 0);
  }

  if (payload?.result && Array.isArray(payload.result)) {
    return payload.result.filter((item) => typeof item === 'string' && item.trim().length > 0);
  }

  if (payload?.result && typeof payload.result === 'object' && Array.isArray(payload.result.images)) {
    return payload.result.images.filter((item) => typeof item === 'string' && item.trim().length > 0);
  }

  return [];
};

const AiCreativeModal: React.FC<AiCreativeModalProps> = ({
  open,
  genTopic,
  genType,
  generating,
  setGenTopic,
  setGenType,
  onClose,
  onContinueToWorkspace,
  onOpenPromptWorkspace,
}) => {
  const [fetchedImages, setFetchedImages] = useState<string[]>([]);
  const [fetchingImages, setFetchingImages] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [heroImage, setHeroImage] = useState<string>('');
  const [selectionMessage, setSelectionMessage] = useState('');

  const normalizedUrl = useMemo(() => normalizeUrl(genTopic), [genTopic]);

  const canFetchImages = useMemo(
    () => Boolean(normalizedUrl) && isValidHttpUrl(normalizedUrl) && !fetchingImages,
    [normalizedUrl, fetchingImages]
  );

  const canContinue = selectedImages.length > 0 && selectedImages.length <= MAX_SELECTABLE_IMAGES;

  const resetModalState = () => {
    setFetchedImages([]);
    setFetchError('');
    setSelectedImages([]);
    setHeroImage('');
    setSelectionMessage('');
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const handleFetchImages = async () => {
    const finalUrl = normalizeUrl(genTopic);

    if (!finalUrl) {
      setFetchError('Please enter a website URL first.');
      setFetchedImages([]);
      return;
    }

    if (!isValidHttpUrl(finalUrl)) {
      setFetchError('Please enter a valid website URL.');
      setFetchedImages([]);
      return;
    }

    try {
      setFetchingImages(true);
      setFetchError('');
      setSelectionMessage('');
      setFetchedImages([]);
      setSelectedImages([]);
      setHeroImage('');

      const response = await fetch(FETCH_IMAGES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: finalUrl }),
      });

      let payload: FetchImagesResponse | null = null;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const message =
          payload &&
          typeof payload === 'object' &&
          'message' in payload &&
          typeof payload.message === 'string'
            ? payload.message
            : `Failed to fetch website images. (${response.status})`;

        throw new Error(message);
      }

      const images = extractImagesFromResponse(payload ?? []);

      if (!images.length) {
        setFetchError('Website opened successfully, but no usable images were found.');
        setFetchedImages([]);
        return;
      }

      setFetchedImages(images);
      setHeroImage(images[0] || '');
      setFetchError('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong while fetching images.';
      setFetchError(message);
      setFetchedImages([]);
      setSelectedImages([]);
      setHeroImage('');
    } finally {
      setFetchingImages(false);
    }
  };

  const handleImageError = (brokenSrc: string) => {
    setFetchedImages((prev) => prev.filter((img) => img !== brokenSrc));
    setSelectedImages((prev) => prev.filter((img) => img !== brokenSrc));
    setHeroImage((prev) => (prev === brokenSrc ? '' : prev));
  };

  const toggleImageSelection = (image: string) => {
    setSelectionMessage('');
    setHeroImage(image);

    setSelectedImages((prev) => {
      const alreadySelected = prev.includes(image);

      if (alreadySelected) {
        return prev.filter((img) => img !== image);
      }

      if (prev.length >= MAX_SELECTABLE_IMAGES) {
        setSelectionMessage(`You can select maximum ${MAX_SELECTABLE_IMAGES} images only.`);
        return prev;
      }

      return [...prev, image];
    });
  };

  const handleContinue = () => {
    if (selectedImages.length === 0) {
      setSelectionMessage('Please select at least 1 image to continue.');
      return;
    }

    if (selectedImages.length > MAX_SELECTABLE_IMAGES) {
      setSelectionMessage(`You can select maximum ${MAX_SELECTABLE_IMAGES} images only.`);
      return;
    }

    onContinueToWorkspace({
      url: normalizeUrl(genTopic),
      type: genType,
      selectedImages,
      allImages: fetchedImages,
    });

    resetModalState();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '1120px',
          height: 'min(760px, calc(100vh - 40px))',
          display: 'flex',
        }}
      >
        <GlassCard
          style={{
            padding: '22px',
            position: 'relative',
            borderRadius: '28px',
            background: '#1a1d27',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={handleClose}
            type="button"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '38px',
              height: '38px',
              borderRadius: '999px',
              border: 'none',
              background: '#22253a',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
            }}
          >
            <X size={22} />
          </button>

          <div
            className="ai-creative-modal-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '380px minmax(0, 1fr)',
              gap: '22px',
              alignItems: 'stretch',
              height: '100%',
              minHeight: 0,
            }}
          >
            <div
              style={{
                border: '1px solid #2a2d3a',
                borderRadius: '24px',
                padding: '20px 18px',
                background: '#12141e',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group">
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '10px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#f0f0f5',
                    }}
                  >
                    Select Type
                  </label>

                  <div style={{ position: 'relative', width: '100%' }}>
                    {/* <select
                      value={genType}
                      onChange={(e) => {
    const value = e.target.value;
    setGenType(value);

    if (value === 'ai_generate') {
      onOpenPromptWorkspace({
        url: normalizeUrl(genTopic),
        type: value,
      });

      resetModalState();
      onClose();
    }
  }}
                      // onChange={(e) => setGenType(e.target.value)}
                      style={{
                        width: '100%',
                        height: '50px',
                        borderRadius: '999px',
                        border: '1.5px solid #d4d4d8',
                        padding: '0 48px 0 18px',
                        fontSize: '0.96rem',
                        color: '#18181b',
                        background: '#fff',
                        outline: 'none',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                      }}
                    >
                      <option value="user_upload">User upload</option>
                      <option value="url_scrape">URL scrape</option>
                      <option value="ai_generate">AI generate</option>
                    </select> */}
                   

<select
  value={genType}
  onChange={(e) => {
    const value = e.target.value;
    setGenType(value);

    // AI Generate -> Prompt Workspace
    if (value === 'ai_generate') {
      onOpenPromptWorkspace({
        url: normalizeUrl(genTopic),
        type: value,
      });

      resetModalState();
      onClose();
      return;
    }

    // USER UPLOAD -> Direct Workspace Open
    if (value === 'user_upload') {
  onContinueToWorkspace({
    url: '',
     type: 'user_upload',
    selectedImages: [],
    allImages: [],
  });

  resetModalState();
  onClose();
  return;
}

   
  }}
  style={{
    width: '100%',
    height: '50px',
    borderRadius: '999px',
    border: '1.5px solid #2e3141',
    padding: '0 48px 0 18px',
    fontSize: '0.96rem',
    color: '#f0f0f5',
    background: '#1a1d27',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    colorScheme: 'dark',
  }}
>
  <option value="user_upload">User upload</option>
  <option value="url_scrape">URL scrape</option>
  <option value="ai_generate">AI generate</option>
</select>

                    <ChevronDown
                      size={18}
                      style={{
                        position: 'absolute',
                        right: '18px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#f0f0f5',
                    }}
                  >
                    <span style={{ color: '#e11d48' }}>*</span>
                    Product URL
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '999px',
                        background: '#22253a',
                        color: '#6b7280',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Info size={12} />
                    </span>
                  </label>

                  <input
                    type="text"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    placeholder="Please enter product URL"
                    style={{
                      width: '100%',
                      height: '50px',
                      borderRadius: '999px',
                      border: '1.5px solid #2e3141',
                      padding: '0 18px',
                      fontSize: '0.96rem',
                      color: '#f0f0f5',
                      outline: 'none',
                      background: '#1a1d27',
                    }}
                  />

                  {!!fetchError && (
                    <p
                      style={{
                        margin: '10px 0 0',
                        fontSize: '0.88rem',
                        color: '#f87171',
                        lineHeight: 1.4,
                        minHeight: '20px',
                      }}
                    >
                      {fetchError}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleFetchImages}
                  disabled={!canFetchImages}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '999px',
                    border: '1.5px solid #4c2a7a',
                    background: '#22253a',
                    color: canFetchImages ? '#c084fc' : '#4b5563',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    cursor: canFetchImages ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  {fetchingImages ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Fetching Images...
                    </>
                  ) : (
                    'Fetch Images'
                  )}
                </button>

                <div
                  style={{
                    borderRadius: '18px',
                    background: '#1e1530',
                    border: '1px solid #3b2a5a',
                    padding: '12px 14px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#c084fc',
                      marginBottom: '4px',
                    }}
                  >
                    Selected Images: {selectedImages.length}/{MAX_SELECTABLE_IMAGES}
                  </div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: '#6b7280',
                      lineHeight: 1.45,
                    }}
                  >
                    Select minimum 1 and maximum 4 images to continue.
                  </div>
                </div>

                {!!selectionMessage && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.88rem',
                      color: '#f87171',
                      lineHeight: 1.4,
                    }}
                  >
                    {selectionMessage}
                  </p>
                )}
              </div>


              {/* <button
  type="button"
  onClick={() => {
    onOpenPromptWorkspace({
      url: normalizeUrl(genTopic),
      type: genType,
    });

    resetModalState();
    onClose();
  }}
  style={{
    width: '100%',
    height: '52px',
    borderRadius: '999px',
    border: '1.5px solid #d8b4fe',
    background: '#fff',
    color: '#7c3aed',
    fontWeight: 700,
    fontSize: '0.96rem',
    cursor: 'pointer',
    marginTop: '14px',
  }}
>
  Generate Without Reference Images
</button> */}
{genType !== 'ai_generate' && (
<button
  type="button"
  onClick={() => {
    onOpenPromptWorkspace({
      url: normalizeUrl(genTopic),
      type: genType,
    });

    resetModalState();
    onClose();
  }}
>
 Generate Without Reference Images
</button>
)}

              <button
                onClick={handleContinue}
                disabled={!canContinue || generating}
                type="button"
                style={{
                  width: '100%',
                  height: '56px',
                  borderRadius: '999px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #b794f6 0%, #1e035e 100%)',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: !canContinue || generating ? 'not-allowed' : 'pointer',
                  opacity: !canContinue || generating ? 0.6 : 1,
                  boxShadow: '0 16px 35px rgba(76, 29, 149, 0.4)',
                  marginTop: '22px',
                  flexShrink: 0,
                }}
              >
                Continue with Selected Images
              </button>
            </div>

            <div
              style={{
                border: '1px solid #2a2d3a',
                borderRadius: '24px',
                background: '#12141e',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '14px',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #2e2250, #3b2a5a)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#a78bfa',
                      flexShrink: 0,
                    }}
                  >
                    <ImageIcon size={17} />
                  </div>

                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#f0f0f5',
                      }}
                    >
                      Scraped Images Preview
                    </h3>
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: '0.88rem',
                        color: '#6b7280',
                      }}
                    >
                      Select up to 4 images to continue
                    </p>
                  </div>
                </div>

                {!!fetchedImages.length && (
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#a78bfa',
                      background: '#1e1530',
                      border: '1px solid #3b2a5a',
                      padding: '8px 12px',
                      borderRadius: '999px',
                    }}
                  >
                    {fetchedImages.length} images found
                  </div>
                )}
              </div>

              {heroImage && (
                <div
                  style={{
                    marginBottom: '14px',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    border: '1px solid #3b2a5a',
                    background: '#1a1d27',
                    height: '170px',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={heroImage}
                    alt="selected-preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      background: '#1a1d27',
                    }}
                    onError={() => handleImageError(heroImage)}
                  />
                </div>
              )}

              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  borderRadius: '20px',
                  border: '1px dashed #3b2a5a',
                  background: '#1a1d27',
                  padding: '16px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                {!fetchingImages && fetchedImages.length === 0 && (
                  <div
                    style={{
                      minHeight: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      color: '#4b5563',
                      padding: '20px',
                      fontSize: '0.95rem',
                    }}
                  >
                    Enter website URL and click Fetch Images to preview scraped website images here.
                  </div>
                )}

                {fetchingImages && (
                  <div
                    style={{
                      minHeight: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '12px',
                      color: '#a78bfa',
                    }}
                  >
                    <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                      Scraping website images...
                    </span>
                  </div>
                )}

                {!fetchingImages && fetchedImages.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '14px',
                      alignContent: 'start',
                    }}
                  >
                    {fetchedImages.map((img, index) => {
                      const isSelected = selectedImages.includes(img);

                      return (
                        <button
                          key={`${img}-${index}`}
                          type="button"
                          onClick={() => toggleImageSelection(img)}
                          style={{
                            position: 'relative',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            background: '#12141e',
                            border: isSelected ? '2px solid #7c3aed' : '1px solid #2e3141',
                            height: '120px',
                            padding: 0,
                            cursor: 'pointer',
                            boxShadow: isSelected
                              ? '0 10px 24px rgba(124, 58, 237, 0.3)'
                              : 'none',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={img}
                            alt={`scraped-${index}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                              background: '#1a1d27',
                            }}
                            onError={() => handleImageError(img)}
                          />

                          <div
                            style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              width: '24px',
                              height: '24px',
                              borderRadius: '999px',
                              background: isSelected ? '#7c3aed' : 'rgba(18,20,30,0.85)',
                              color: isSelected ? '#fff' : '#6b7280',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: isSelected ? 'none' : '1px solid #2e3141',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            }}
                          >
                            {isSelected ? <Check size={14} /> : <span style={{ width: 8, height: 8, borderRadius: '999px', background: '#374151' }} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <style>
            {`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }

              @media (max-width: 980px) {
                .ai-creative-modal-grid {
                  grid-template-columns: 1fr !important;
                }
              }
            `}
          </style>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AiCreativeModal;