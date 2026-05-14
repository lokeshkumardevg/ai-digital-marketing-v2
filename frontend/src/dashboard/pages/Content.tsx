import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../api/axios';

import ContentTabs from '../components/content/ContentTabs';
import ContentActions from '../components/content/ContentActions';
import ContentFilters from '../components/content/ContentFilters';
import CreativesTable from '../components/content/CreativesTable';
import AiCreativeModal from '../components/content/AiCreativeModal';
import UploadByGroupModal from '../components/content/UploadByGroupModal';
// import AiCreativeWorkspace from '../components/content/AiCreativeWorkspace';
import { PageLoader } from '../components/Loader';

type CreativeItem = {

  id: string;
  name: string;
  type: string;
  platform: string;
  uploadDate: string;
  lifetime: string;
  status: string;
  createdAtRaw: string;
  scheduledForRaw: string;
   imageUrl: string;
  thumbnailUrl: string;
  lifetimeStartRaw?: string;
  lifetimeEndRaw?: string;
  isManualCreative?: boolean;
};

type UploadedGroupItem = {
  file: File;
  preview: string;
  uploadedUrl?: string;
};

export const Content: React.FC = () => {
    const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('All Creatives');
  const [search, setSearch] = useState('');
  const [creatives, setCreatives] = useState<CreativeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [previewCreative, setPreviewCreative] = useState<CreativeItem | null>(null);
const [watchCreative, setWatchCreative] = useState<CreativeItem | null>(null);
const [editingCreative, setEditingCreative] = useState<CreativeItem | null>(null);
const [editName, setEditName] = useState('');
const [editLifetimeStart, setEditLifetimeStart] = useState('');
const [editLifetimeEnd, setEditLifetimeEnd] = useState('');
const [isUpdatingCreative, setIsUpdatingCreative] = useState(false);
const [deletingCreativeId, setDeletingCreativeId] = useState<string | null>(null);

  // const [showGenModal, setShowGenModal] = useState(false);
  const [showAddCreativeMenu, setShowAddCreativeMenu] = useState(false);
  const [showUploadByGroupModal, setShowUploadByGroupModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showAiCreativePanel, setShowAiCreativePanel] = useState(false);
//   const [showAiCreativeWorkspace, setShowAiCreativeWorkspace] = useState(false);
// const [workspaceProductUrl, setWorkspaceProductUrl] = useState('');
// const [workspaceSelectedImages, setWorkspaceSelectedImages] = useState<string[]>([]);
// const [workspaceAllImages, setWorkspaceAllImages] = useState<string[]>([]);
  

  const [genTopic, setGenTopic] = useState('');
  const [genType, setGenType] = useState('blog');
  const [genTone, setGenTone] = useState('professional');
  const [generating, setGenerating] = useState(false);

  const [uploadDateStart, setUploadDateStart] = useState('');
  const [uploadDateEnd, setUploadDateEnd] = useState('');
  const [lifetimeStart, setLifetimeStart] = useState('');
  const [lifetimeEnd, setLifetimeEnd] = useState('');

  const [groupCreativeType, setGroupCreativeType] = useState('');
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);

  const [groupFiles, setGroupFiles] = useState<File[]>([]);
  const [groupUploading, setGroupUploading] = useState(false);
  const [groupSaving, setGroupSaving] = useState(false);
  const [groupUploaded, setGroupUploaded] = useState(false);
  const [groupLifetimeStart, setGroupLifetimeStart] = useState('');
  const [groupLifetimeEnd, setGroupLifetimeEnd] = useState('');
  const [uploadedGroupItems, setUploadedGroupItems] = useState<UploadedGroupItem[]>([]);

  const addCreativeMenuRef = useRef<HTMLDivElement | null>(null);
  const addCreativeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
  const state = location.state as
    | {
        reopenAiCreativeModal?: boolean;
        productUrl?: string;
        genType?: string;
      }
    | undefined;

  if (state?.reopenAiCreativeModal) {
    setGenTopic(state.productUrl || '');
    setGenType(state.genType || 'url_scrape');
    setShowAiCreativePanel(true);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }
}, [location, navigate]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        addCreativeMenuRef.current &&
        !addCreativeMenuRef.current.contains(target) &&
        addCreativeButtonRef.current &&
        !addCreativeButtonRef.current.contains(target)
      ) {
        setShowAddCreativeMenu(false);
      }
    };

    if (showAddCreativeMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showAddCreativeMenu]);

  const fetchCreatives = async () => {
    setLoading(true);
    try {
      const response = await api.get('/content');
      const json = Array.isArray(response.data) ? response.data : [];

     const mapped = json.map((c: any) => ({
  id: c._id,
  name: c.title || 'Untitled Creative',
  type:
    c.contentType === 'blog'
      ? 'text'
      : c.contentType === 'video'
      ? 'video'
      : 'image',
  platform: Array.isArray(c.platforms) ? c.platforms[0] || 'Meta' : 'Meta',
  uploadDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A',
  lifetime: c.scheduledFor
    ? `${new Date(c.scheduledFor).toLocaleDateString()} (Scheduled)`
    : 'Active Forever',
  status: c.status || 'draft',
  createdAtRaw: c.createdAt || '',
  scheduledForRaw: c.scheduledFor || '',
  imageUrl: c.imageUrl || '',
  thumbnailUrl: c.thumbnailUrl || c.imageUrl || '',
  lifetimeStartRaw: c.lifetimeStart || '',
  lifetimeEndRaw: c.lifetimeEnd || '',
  isManualCreative: !!c.isManualCreative,
}));

      setCreatives(mapped);
    } catch (err: any) {
      console.error('Content fetch failed:', err);
      setCreatives([]);
      toast.error(err?.response?.data?.message || 'Failed to load creatives.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCreativeContent = async () => {
    setContentLoaded(false);
    await fetchCreatives();
    setContentLoaded(true);
  };


  const handleGenerate = async () => {
    if (!genTopic.trim()) {
      toast.error('Please enter a topic for AI generation.');
      return;
    }

    setGenerating(true);
    toast.loading('AI Agents are drafting your content...', { id: 'gen-content' });

    try {
      await api.post('/content/generate', {
        topic: genTopic.trim(),
        contentType: genType,
        tone: genTone,
      });

      toast.success('AI Content Generated & Saved!', { id: 'gen-content' });
      setShowAiCreativePanel(false);
      setGenTopic('');
      await fetchCreatives();
    } catch (err: any) {
      console.error('AI Generation failed:', err);
      toast.error(
        err?.response?.data?.message || 'AI Generation failed. Check backend logs.',
        { id: 'gen-content' }
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleAddCreativeClick = () => {
    setShowAddCreativeMenu((prev) => !prev);
  };

  const resetUploadByGroupState = () => {
    setGroupCreativeType('');
    setGroupFiles([]);
    setGroupUploading(false);
    setGroupSaving(false);
    setGroupUploaded(false);
    setGroupLifetimeStart('');
    setGroupLifetimeEnd('');

    setUploadedGroupItems((prev) => {
      prev.forEach((item) => {
        if (item.preview?.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });
      return [];
    });
  };

  const handleUploadByGroup = () => {
    setShowAddCreativeMenu(false);
    resetUploadByGroupState();
    setShowUploadByGroupModal(true);
  };

  const handleBulkUploadByFilename = () => {
    setShowAddCreativeMenu(false);
    setShowBulkUploadModal(true);
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setBulkFiles(files);
  };

  const handleBulkDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    setBulkFiles(files);
  };

  const handleGroupCreativeTypeChange = (value: string) => {
    setGroupCreativeType(value);
    setGroupFiles([]);
    setGroupUploaded(false);
    setGroupLifetimeStart('');
    setGroupLifetimeEnd('');

    setUploadedGroupItems((prev) => {
      prev.forEach((item) => {
        if (item.preview?.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });
      return [];
    });
  };


 const handleOpenAiCreative = () => {
  setShowAiCreativePanel(true);
};

const handleCloseAiCreative = () => {
  setShowAiCreativePanel(false);
};

const handleContinueToAiWorkspace = (payload: {
  url: string;
  type: string;
  selectedImages: string[];
  allImages: string[];
}) => {
  setGenType(payload.type);
  setShowAiCreativePanel(false);

  navigate('/content/ai-workspace', {
    state: {
      productUrl: payload.url,
      selectedImages: payload.selectedImages,
      allImages: payload.allImages,
      genType: payload.type,
      workspaceType: payload.type,   // ✅ ADD THIS
    },
  });
};


const handlePreviewCreative = (creative: CreativeItem) => {
  if (!creative.imageUrl) {
    toast.error('Preview image not available for this creative.');
    return;
  }
  setPreviewCreative(creative);
};

const handleWatchCreative = (creative: CreativeItem) => {
  setWatchCreative(creative);
};

const handleOpenEditCreative = (creative: CreativeItem) => {
  setEditingCreative(creative);
  setEditName(creative.name || '');
  setEditLifetimeStart(
    creative.lifetimeStartRaw
      ? new Date(creative.lifetimeStartRaw).toISOString().slice(0, 10)
      : ''
  );
  setEditLifetimeEnd(
    creative.lifetimeEndRaw
      ? new Date(creative.lifetimeEndRaw).toISOString().slice(0, 10)
      : ''
  );
};

const handleCloseEditCreative = () => {
  setEditingCreative(null);
  setEditName('');
  setEditLifetimeStart('');
  setEditLifetimeEnd('');
};

const handleDeleteCreative = async (creative: CreativeItem) => {
  const confirmed = window.confirm(`Delete "${creative.name}" from Creative Hub?`);
  if (!confirmed) return;

  try {
    setDeletingCreativeId(creative.id);
    toast.loading('Deleting creative...', { id: 'delete-creative' });

    await api.delete(`/content/${creative.id}`);

    setCreatives((prev) => prev.filter((item) => item.id !== creative.id));

    if (previewCreative?.id === creative.id) setPreviewCreative(null);
    if (watchCreative?.id === creative.id) setWatchCreative(null);
    if (editingCreative?.id === creative.id) handleCloseEditCreative();

    toast.success('Creative deleted successfully.', { id: 'delete-creative' });
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message || 'Failed to delete creative.',
      { id: 'delete-creative' }
    );
  } finally {
    setDeletingCreativeId(null);
  }
};

const handleRepromptCreative = (creative: CreativeItem) => {
  navigate('/content/ai-workspace', {
    state: {
      selectedImages: [creative.imageUrl || ''],
      productUrl: creative.name || creative.title || 'Reprompt Creative',
      promptOnly: true,
    },
  });
};

const handleSaveCreativeEdit = async () => {
  if (!editingCreative) return;

  if (!editName.trim()) {
    toast.error('Creative name is required.');
    return;
  }

  if (editLifetimeStart && editLifetimeEnd) {
    if (new Date(editLifetimeEnd) < new Date(editLifetimeStart)) {
      toast.error('Limited lifetime end date must be after start date.');
      return;
    }
  }

  try {
    setIsUpdatingCreative(true);
    toast.loading('Updating creative...', { id: 'update-creative' });

    await api.patch(`/content/${editingCreative.id}`, {
      title: editName.trim(),
      lifetimeStart: editLifetimeStart || null,
      lifetimeEnd: editLifetimeEnd || null,
    });

    await fetchCreatives();
    handleCloseEditCreative();

    toast.success('Creative updated successfully.', { id: 'update-creative' });
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message || 'Failed to update creative.',
      { id: 'update-creative' }
    );
  } finally {
    setIsUpdatingCreative(false);
  }
};


const handleGroupFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith('image/')
    );

    if (!files.length) {
      toast.error('Please select valid image files.');
      return;
    }

    setGroupFiles(files);
    setGroupUploaded(false);

    setUploadedGroupItems((prev) => {
      prev.forEach((item) => {
        if (item.preview?.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });

      return files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
    });
  };

  const handleGroupDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files || []).filter((file) =>
      file.type.startsWith('image/')
    );

    if (!files.length) {
      toast.error('Only image files are allowed for Generic Creatives.');
      return;
    }

    setGroupFiles(files);
    setGroupUploaded(false);

    setUploadedGroupItems((prev) => {
      prev.forEach((item) => {
        if (item.preview?.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });

      return files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
    });
  };

  const handleGroupDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleGroupUpload = async () => {
    if (groupCreativeType !== 'image') {
      toast.error('Please select Generic Creatives first.');
      return;
    }

    if (!groupFiles.length) {
      toast.error('Please select at least one image.');
      return;
    }

    setGroupUploading(true);
    toast.loading('Uploading generic creatives...', { id: 'group-upload' });

    try {
      const uploadedItems = await Promise.all(
        groupFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          const response = await api.post('/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const imageUrl =
            response?.data?.url ||
            response?.data?.imageUrl ||
            response?.data?.fileUrl ||
            response?.data?.data?.url ||
            '';

          return {
            file,
            preview: URL.createObjectURL(file),
            uploadedUrl: imageUrl,
          };
        })
      );

      setUploadedGroupItems((prev) => {
        prev.forEach((item) => {
          if (item.preview?.startsWith('blob:')) {
            URL.revokeObjectURL(item.preview);
          }
        });
        return uploadedItems;
      });

      setGroupUploaded(true);
      toast.success('Creative uploaded successfully.', { id: 'group-upload' });
    } catch (err: any) {
      console.error('Group upload failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to upload creative.', {
        id: 'group-upload',
      });
    } finally {
      setGroupUploading(false);
    }
  };

  const handleRemoveGroupFile = (index: number) => {
    setGroupFiles((prev) => prev.filter((_, i) => i !== index));

    setUploadedGroupItems((prev) => {
      const item = prev[index];
      if (item?.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(item.preview);
      }

      const updated = prev.filter((_, i) => i !== index);
      if (!updated.length) {
        setGroupUploaded(false);
      }
      return updated;
    });
  };

  const handleConfirmGroupCreatives = async () => {
    if (!uploadedGroupItems.length) {
      toast.error('Please upload at least one creative first.');
      return;
    }

    if (!groupLifetimeStart || !groupLifetimeEnd) {
      toast.error('Please select limited lifetime start and end dates.');
      return;
    }

    if (new Date(groupLifetimeEnd) < new Date(groupLifetimeStart)) {
      toast.error('Lifetime end date must be after start date.');
      return;
    }

    setGroupSaving(true);
    toast.loading('Saving creatives...', { id: 'group-save' });

    try {
      await Promise.all(
        uploadedGroupItems.map(async (item, index) => {
          await api.post('/content', {
            title: item.file.name.replace(/\.[^/.]+$/, ''),
            contentType: 'image',
            body: '',
            imageUrl: item.uploadedUrl || item.preview,
            platforms: ['Meta'],
            status: 'active',
            scheduledFor: groupLifetimeEnd,
            lifetimeStart: groupLifetimeStart,
            lifetimeEnd: groupLifetimeEnd,
            creativeCategory: 'generic',
            creativeGroupType: 'group',
            creativeType: 'generic',
            order: index + 1,
          });
        })
      );

      toast.success('Generic creatives saved successfully.', { id: 'group-save' });
      setShowUploadByGroupModal(false);
      resetUploadByGroupState();
      await fetchCreatives();
    } catch (err: any) {
      console.error('Save group creative failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to save creatives.', {
        id: 'group-save',
      });
    } finally {
      setGroupSaving(false);
    }
  };

const filtered = creatives.filter((c) => {
  const matchesSearch = c.name
    .toLowerCase()
    .includes(search.toLowerCase());

  const createdAt = c.createdAtRaw
    ? new Date(c.createdAtRaw)
    : null;

  const lifetimeStartAt = c.lifetimeStartRaw
    ? new Date(c.lifetimeStartRaw)
    : null;

  const lifetimeEndAt = c.lifetimeEndRaw
    ? new Date(c.lifetimeEndRaw)
    : null;

  const matchesUploadStart = uploadDateStart
    ? createdAt
      ? createdAt >= new Date(`${uploadDateStart}T00:00:00`)
      : false
    : true;

  const matchesUploadEnd = uploadDateEnd
    ? createdAt
      ? createdAt <= new Date(`${uploadDateEnd}T23:59:59`)
      : false
    : true;

  const matchesLifetimeStart = lifetimeStart
    ? lifetimeStartAt
      ? lifetimeStartAt >= new Date(`${lifetimeStart}T00:00:00`)
      : false
    : true;

  const matchesLifetimeEnd = lifetimeEnd
    ? lifetimeEndAt
      ? lifetimeEndAt <= new Date(`${lifetimeEnd}T23:59:59`)
      : false
    : true;

  return (
    matchesSearch &&
    matchesUploadStart &&
    matchesUploadEnd &&
    matchesLifetimeStart &&
    matchesLifetimeEnd
  );
});
  return (
    <div style={{ minHeight: '100%', background: '#0f1117' }}>
      <ContentTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div style={{ padding: '20px 32px' }}>
       <ContentActions
  addCreativeButtonRef={addCreativeButtonRef}
  addCreativeMenuRef={addCreativeMenuRef}
  showAddCreativeMenu={showAddCreativeMenu}
  onAddCreativeClick={handleAddCreativeClick}
  onShowAiCreativePanel={handleOpenAiCreative}
  onUploadByGroup={handleUploadByGroup}
  onBulkUploadByFilename={handleBulkUploadByFilename}
/>

        <div style={{ marginTop: '18px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={handleLoadCreativeContent}
            style={{
              padding: '12px 22px',
              borderRadius: '999px',
              border: 'none',
              background: '#7c3aed',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Show Creative Content
          </button>
          {loading && (
            <div style={{ marginTop: '12px' }}>
              <PageLoader message="Loading creatives..." />
            </div>
          )}

        </div>

        {contentLoaded && (
          <>
            <ContentFilters
              uploadDateStart={uploadDateStart}
              uploadDateEnd={uploadDateEnd}
              lifetimeStart={lifetimeStart}
              lifetimeEnd={lifetimeEnd}
              search={search}
              setUploadDateStart={setUploadDateStart}
              setUploadDateEnd={setUploadDateEnd}
              setLifetimeStart={setLifetimeStart}
              setLifetimeEnd={setLifetimeEnd}
              setSearch={setSearch}
            />

            <CreativesTable
              creatives={filtered}
              onPreviewCreative={handlePreviewCreative}
              onWatchCreative={handleWatchCreative}
              onEditCreative={handleOpenEditCreative}
              onDeleteCreative={handleDeleteCreative}
              onRepromptCreative={handleRepromptCreative}
              deletingCreativeId={deletingCreativeId}
            />
          </>
        )}

{showAiCreativePanel && (
  <AiCreativeModal
    open={showAiCreativePanel}
    genTopic={genTopic}
    genType={genType}
    genTone={genTone}
    generating={generating}
    setGenTopic={setGenTopic}
    setGenType={setGenType}
    setGenTone={setGenTone}
    onClose={handleCloseAiCreative}
    onGenerate={handleGenerate}
    onContinueToWorkspace={handleContinueToAiWorkspace}

    onOpenPromptWorkspace={(payload) => {
      navigate('/content/ai-workspace', {
        state: {
          productUrl: payload.url,
          genType: payload.type,
          selectedImages: [],
          promptOnly: true,
          workspaceType: payload.type, // ✅ ADD
        },
      });

      handleCloseAiCreative();
    }}
  />
)}                                                                              
      </div>

      {/* <AiCreativeModal
        open={showGenModal}
        genTopic={genTopic}
        genType={genType}
        genTone={genTone}
        generating={generating}
        setGenTopic={setGenTopic}
        setGenType={setGenType}
        setGenTone={setGenTone}
        onClose={() => setShowGenModal(false)}
        onGenerate={handleGenerate}
      /> */}


      {previewCreative && (
  <div
    onClick={() => setPreviewCreative(null)}
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
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '100%',
        maxWidth: '860px',
        background: '#1a1d27',
        borderRadius: '32px',
        padding: '24px',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
        border: '1px solid #2a2d3a',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f0f0f5' }}>
            {previewCreative.name}
          </div>
          <div style={{ marginTop: '4px', fontSize: '0.9rem', color: '#6b7280' }}>
            {previewCreative.platform} • {previewCreative.uploadDate}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPreviewCreative(null)}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '999px',
            border: '1px solid #2e3141',
            background: '#22253a',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: '#a0a0b0',
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '20px',
          overflow: 'hidden',
          maxHeight: '70vh',
          background: '#12141e',
        }}
      >
        <img
          src={previewCreative.imageUrl}
          alt={previewCreative.name}
          style={{
            maxWidth: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    </div>
  </div>
)}

{watchCreative && (
  <div
    onClick={() => setWatchCreative(null)}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 1995,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '100%',
        maxWidth: '520px',
        background: '#1a1d27',
        borderRadius: '28px',
        padding: '24px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
        border: '1px solid #2a2d3a',
      }}
    >
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f0f0f5', marginBottom: '18px' }}>
        Creative Details
      </div>

      <div style={{ display: 'grid', gap: '12px', color: '#c9cad4' }}>    
        <div><strong style={{ color: '#f0f0f5' }}>Name:</strong> {watchCreative.name}</div>
        <div><strong style={{ color: '#f0f0f5' }}>Status:</strong> {watchCreative.status}</div>
        <div><strong style={{ color: '#f0f0f5' }}>Upload Date:</strong> {watchCreative.uploadDate}</div>
        <div><strong style={{ color: '#f0f0f5' }}>Lifetime Start:</strong> {watchCreative.lifetimeStartRaw ? new Date(watchCreative.lifetimeStartRaw).toLocaleDateString() : '-'}</div>
        <div><strong style={{ color: '#f0f0f5' }}>Lifetime End:</strong> {watchCreative.lifetimeEndRaw ? new Date(watchCreative.lifetimeEndRaw).toLocaleDateString() : '-'}</div>
      </div>
    </div>
  </div>
)}

{editingCreative && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.55)',
      zIndex: 2010,
      display: 'flex',
      justifyContent: 'flex-end',
    }}
    onClick={handleCloseEditCreative}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '100%',
        maxWidth: '520px',
        height: '100vh',
        background: '#1a1d27',
        boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.5)',
        padding: '28px 28px 24px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}
      >
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f0f5' }}>
          Edit
        </div>

        <button
          type="button"
          onClick={handleCloseEditCreative}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '999px',
            border: '1px solid #2e3141',
            background: '#22253a',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: '#a0a0b0',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '22px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#f0f0f5' }}>
          Creative Name
        </label>
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '999px',
            border: '1.5px solid #2e3141',
            padding: '0 18px',
            fontSize: '1rem',
            outline: 'none',
            background: '#12141e',
            color: '#f0f0f5',
          }}
        />
      </div>

      <div style={{ marginBottom: '22px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#f0f0f5' }}>
          Limited Lifetime
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input
            type="date"
            value={editLifetimeStart}
            onChange={(e) => setEditLifetimeStart(e.target.value)}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '999px',
              border: '1.5px solid #2e3141',
              padding: '0 18px',
              fontSize: '1rem',
              outline: 'none',
              background: '#12141e',
              color: '#f0f0f5',
              colorScheme: 'dark',
            }}
          />

          <input
            type="date"
            value={editLifetimeEnd}
            onChange={(e) => setEditLifetimeEnd(e.target.value)}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '999px',
              border: '1.5px solid #2e3141',
              padding: '0 18px',
              fontSize: '1rem',
              outline: 'none',
              background: '#12141e',
              color: '#f0f0f5',
              colorScheme: 'dark',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px' }}>
        <button
          type="button"
          onClick={handleCloseEditCreative}
          style={{
            height: '52px',
            minWidth: '120px',
            padding: '0 24px',
            borderRadius: '999px',
            border: '1px solid #2e3141',
            background: '#22253a',
            color: '#c9cad4',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveCreativeEdit}
          disabled={isUpdatingCreative}
          style={{
            height: '52px',
            minWidth: '120px',
            padding: '0 24px',
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(90deg, #8b5cf6 0%, #6d28d9 100%)',
            color: '#fff',
            fontWeight: 700,
            cursor: isUpdatingCreative ? 'not-allowed' : 'pointer',
            opacity: isUpdatingCreative ? 0.75 : 1,
          }}
        >
          {isUpdatingCreative ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  </div>
)}

      <UploadByGroupModal
        open={showUploadByGroupModal}
        groupCreativeType={groupCreativeType}
        groupFiles={groupFiles}
        groupUploading={groupUploading}
        groupSaving={groupSaving}
        groupUploaded={groupUploaded}
        groupLifetimeStart={groupLifetimeStart}
        groupLifetimeEnd={groupLifetimeEnd}
        uploadedGroupItems={uploadedGroupItems}
        onClose={() => {
          setShowUploadByGroupModal(false);
          resetUploadByGroupState();
        }}
        onCreativeTypeChange={handleGroupCreativeTypeChange}
        onFileChange={handleGroupFileChange}
        onDrop={handleGroupDrop}
        onDragOver={handleGroupDragOver}
        onUpload={handleGroupUpload}
        onRemoveFile={handleRemoveGroupFile}
        onLifetimeStartChange={setGroupLifetimeStart}
        onLifetimeEndChange={setGroupLifetimeEnd}
        onConfirm={handleConfirmGroupCreatives}
      />

      {showBulkUploadModal && (
        <div>
          {/* keep your existing Bulk Upload by Filename modal here exactly as it is */}
        </div>
      )}
    </div>
  );
};

export default Content;