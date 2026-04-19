import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../api/axios';

import LoadingScreen from '../components/content/LoadingScreen';
import ContentTabs from '../components/content/ContentTabs';
import ContentActions from '../components/content/ContentActions';
import ContentFilters from '../components/content/ContentFilters';
import CreativesTable from '../components/content/CreativesTable';
import AiCreativeModal from '../components/content/AiCreativeModal';
import UploadByGroupModal from '../components/content/UploadByGroupModal';

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
};

type UploadedGroupItem = {
  file: File;
  preview: string;
  uploadedUrl?: string;
};

export const Content: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All Creatives');
  const [search, setSearch] = useState('');
  const [creatives, setCreatives] = useState<CreativeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // const [showGenModal, setShowGenModal] = useState(false);
  const [showAddCreativeMenu, setShowAddCreativeMenu] = useState(false);
  const [showUploadByGroupModal, setShowUploadByGroupModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showAiCreativePanel, setShowAiCreativePanel] = useState(false);
  

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
    fetchCreatives();
  }, []);

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
      setShowGenModal(false);
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
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());

    const createdAt = c.createdAtRaw ? new Date(c.createdAtRaw) : null;
    const scheduledAt = c.scheduledForRaw ? new Date(c.scheduledForRaw) : null;

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
      ? scheduledAt
        ? scheduledAt >= new Date(`${lifetimeStart}T00:00:00`)
        : false
      : true;

    const matchesLifetimeEnd = lifetimeEnd
      ? scheduledAt
        ? scheduledAt <= new Date(`${lifetimeEnd}T23:59:59`)
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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ minHeight: '100%', background: '#f5f6fa' }}>
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

       {showAiCreativePanel ? (
  <div style={{ marginTop: '24px' }}>
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
      onGenerate={handleOpenAiCreative}
    />
  </div>
) : (
  <CreativesTable creatives={filtered} />
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


// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import {
//   Plus,
//   Sparkles,
//   Image as ImageIcon,
//   Video,
//   AlignLeft,
//   Search,
//   Calendar,
//   Package,
//   MoreHorizontal,
//   Inbox,
//   X,
//   Wand2,
//   Globe,
//   Eye,
//   Trash2,
//   Copy,
//   UploadCloud,
//   ChevronDown,
// } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { api } from '../../api/axios';
// import toast from 'react-hot-toast';
// import { GlassCard } from '../components/GlassCard';

// type ItemOption = {
//   label: string;
//   value: string;
// };

// type CreativeRow = {
//   id: string;
//   name: string;
//   contentType: string;
//   type: string;
//   platform: string;
//   item: string;
//   uploadDate: string;
//   lifetime: string;
//   status: string;
//   body: string;
//   imageUrl: string;
//   isAiGenerated: boolean;
// };

// const typeIcon: Record<string, React.ElementType> = {
//   image: ImageIcon,
//   video: Video,
//   text: AlignLeft,
// };

// const defaultItemOptions: ItemOption[] = [
//   { label: 'Website', value: 'website' },
//   { label: 'Meta', value: 'meta' },
//   { label: 'LinkedIn', value: 'linkedin' },
//   { label: 'Instagram', value: 'instagram' },
//   { label: 'WordPress', value: 'wordpress' },
// ];

// const manualTypeOptions = [
//   { label: 'Text', value: 'text' },
//   { label: 'Image', value: 'image' },
//   { label: 'Video', value: 'video' },
// ];

// const aiTypeOptions = [
//   { label: 'SEO Blog Post', value: 'blog' },
//   { label: 'Viral Social Post', value: 'social_post' },
//   { label: 'Image Prompt Only', value: 'image' },
// ];

// const toneOptions = [
//   { label: 'Professional', value: 'professional' },
//   { label: 'Witty & Viral', value: 'witty' },
//   { label: 'Educational', value: 'educational' },
// ];

// const mapContentTypeToRowType = (contentType: string) => {
//   if (contentType === 'video') return 'video';
//   if (contentType === 'image') return 'image';
//   return 'text';
// };

// const formatTypeLabel = (type: string) => {
//   if (type === 'social_post') return 'Social Post';
//   if (type === 'blog') return 'Blog';
//   return type?.charAt(0)?.toUpperCase() + type?.slice(1);
// };

// const getSafeItemsFromStorage = (): ItemOption[] => {
//   try {
//     const saved = localStorage.getItem('creative-hub-items');
//     if (!saved) return defaultItemOptions;

//     const parsed = JSON.parse(saved);
//     if (!Array.isArray(parsed)) return defaultItemOptions;

//     const valid = parsed.filter(
//       (item) =>
//         item &&
//         typeof item.label === 'string' &&
//         item.label.trim() &&
//         typeof item.value === 'string' &&
//         item.value.trim(),
//     );

//     return valid.length ? valid : defaultItemOptions;
//   } catch {
//     return defaultItemOptions;
//   }
// };

// export const Content: React.FC = () => {
//   const [activeTab, setActiveTab] = useState('All Creatives');
//   const [search, setSearch] = useState('');
//   const [creatives, setCreatives] = useState<CreativeRow[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [items, setItems] = useState<ItemOption[]>(getSafeItemsFromStorage);
//   const [selectedHeaderItem, setSelectedHeaderItem] = useState('website');

//   const [uploadStart, setUploadStart] = useState('');
//   const [uploadEnd, setUploadEnd] = useState('');
//   const [lifeStart, setLifeStart] = useState('');
//   const [lifeEnd, setLifeEnd] = useState('');
//   const [selectedItem, setSelectedItem] = useState('all');

//   const [showGenModal, setShowGenModal] = useState(false);
//   const [showManualModal, setShowManualModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [showItemModal, setShowItemModal] = useState(false);

//   const [generating, setGenerating] = useState(false);
//   const [savingManual, setSavingManual] = useState(false);

//   const [genTopic, setGenTopic] = useState('');
//   const [genType, setGenType] = useState('blog');
//   const [genTone, setGenTone] = useState('professional');
//   const [genExpiresAt, setGenExpiresAt] = useState('');

//   const [manualTitle, setManualTitle] = useState('');
//   const [manualBody, setManualBody] = useState('');
//   const [manualType, setManualType] = useState('text');
//   const [manualItem, setManualItem] = useState('website');
//   const [manualExpiresAt, setManualExpiresAt] = useState('');
//   const [manualImageUrl, setManualImageUrl] = useState('');
//   const [manualImagePreview, setManualImagePreview] = useState('');

//   const [newItemName, setNewItemName] = useState('');
//   const [openMenuId, setOpenMenuId] = useState<string | null>(null);
//   const [selectedCreative, setSelectedCreative] = useState<CreativeRow | null>(null);
//   const [aiStatus, setAiStatus] = useState<{ ready: boolean; message: string } | null>(null);

//   const menuRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     localStorage.setItem('creative-hub-items', JSON.stringify(items));
//   }, [items]);

//   useEffect(() => {
//     if (!items.some((item) => item.value === selectedHeaderItem)) {
//       setSelectedHeaderItem(items[0]?.value || 'website');
//     }

//     if (selectedItem !== 'all' && !items.some((item) => item.value === selectedItem)) {
//       setSelectedItem('all');
//     }

//     if (!items.some((item) => item.value === manualItem)) {
//       setManualItem(items[0]?.value || 'website');
//     }
//   }, [items, selectedHeaderItem, selectedItem, manualItem]);

//   useEffect(() => {
//     fetchAiStatus();
//   }, []);

//   useEffect(() => {
//     fetchCreatives();
//   }, []);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchCreatives();
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [search, selectedItem, uploadStart, uploadEnd, lifeStart, lifeEnd]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setOpenMenuId(null);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const fetchAiStatus = async () => {
//     try {
//       const res = await api.get('/content/ai-status');
//       setAiStatus(res.data);
//     } catch {
//       setAiStatus({
//         ready: false,
//         message: 'AI not configured yet',
//       });
//     }
//   };

//   const fetchCreatives = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get('/content', {
//         params: {
//           search: search || undefined,
//           item: selectedItem !== 'all' ? selectedItem : undefined,
//           uploadStart: uploadStart || undefined,
//           uploadEnd: uploadEnd || undefined,
//           lifeStart: lifeStart || undefined,
//           lifeEnd: lifeEnd || undefined,
//         },
//       });

//       const json = response.data || [];
//       const mapped: CreativeRow[] = json.map((c: any) => ({
//         id: c._id,
//         name: c.title || 'Untitled Creative',
//         contentType: c.contentType,
//         type: mapContentTypeToRowType(c.contentType),
//         platform:
//           Array.isArray(c.platforms) && c.platforms.length > 0
//             ? c.platforms[0]
//             : c.item || 'website',
//         item: c.item || 'website',
//         uploadDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-',
//         lifetime: c.expiresAt
//           ? new Date(c.expiresAt).toLocaleDateString()
//           : 'Active Forever',
//         status: c.status || 'draft',
//         body: c.body || '',
//         imageUrl: c.imageUrl || '',
//         isAiGenerated: !!c.isAiGenerated,
//       }));

//       setCreatives(mapped);
//     } catch (err) {
//       console.error('Content fetch failed', err);
//       toast.error('Failed to load creatives');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetManualForm = () => {
//     setManualTitle('');
//     setManualBody('');
//     setManualType('text');
//     setManualItem(items[0]?.value || 'website');
//     setManualExpiresAt('');
//     setManualImageUrl('');
//     setManualImagePreview('');
//   };

//   const handleManualImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0];
//   if (!file) return;

//   if (!file.type.startsWith('image/')) {
//     toast.error('Please select a valid image file');
//     return;
//   }

//   const maxSizeInMb = 2;
//   if (file.size > maxSizeInMb * 1024 * 1024) {
//     toast.error(`Please upload an image smaller than ${maxSizeInMb}MB`);
//     return;
//   }

//   const reader = new FileReader();
//   reader.onloadend = () => {
//     const result = reader.result as string;
//     setManualImageUrl(result);
//     setManualImagePreview(result);

//     if (manualType !== 'image') {
//       setManualType('image');
//     }
//   };
//   reader.readAsDataURL(file);
// };

//   const handleGenerate = async () => {
//     if (!genTopic.trim()) {
//       return toast.error('Please enter topic');
//     }

//     if (!aiStatus?.ready) {
//       return toast.error('AI not configured. Add OpenAI key in backend .env', {
//         id: 'gen-content',
//       });
//     }

//     setGenerating(true);
//     toast.loading('Generating...', { id: 'gen-content' });

//     try {
//       await api.post('/content/generate', {
//         topic: genTopic,
//         contentType: genType,
//         tone: genTone,
//         item: selectedHeaderItem,
//         expiresAt: genExpiresAt || null,
//       });

//       toast.success('Generated successfully', { id: 'gen-content' });
//       setShowGenModal(false);
//       setGenTopic('');
//       setGenType('blog');
//       setGenTone('professional');
//       setGenExpiresAt('');
//       fetchCreatives();
//     } catch (err) {
//       console.error(err);
//       toast.error('AI failed. Check API key', { id: 'gen-content' });
//     } finally {
//       setGenerating(false);
//     }
//   };

//   const handleCreateManual = async () => {
//     if (!manualTitle.trim()) {
//       return toast.error('Please enter creative title');
//     }

//     if (manualType === 'image' && !manualImageUrl) {
//       return toast.error('Please upload an image');
//     }

//     setSavingManual(true);
//     toast.loading('Creating draft...', { id: 'manual-create' });

//     try {
//       await api.post('/content', {
//         title: manualTitle.trim(),
//         body: manualBody.trim(),
//         contentType: manualType,
//         imageUrl: manualImageUrl || '',
//         item: manualItem,
//         platforms: [manualItem],
//         expiresAt: manualExpiresAt || null,
//         status: 'draft',
//       });

//       toast.success('Creative draft created', { id: 'manual-create' });
//       setShowManualModal(false);
//       resetManualForm();
//       fetchCreatives();
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to create creative', { id: 'manual-create' });
//     } finally {
//       setSavingManual(false);
//     }
//   };

//   const handlePublish = async (row: CreativeRow) => {
//     toast.loading('Publishing creative...', { id: `publish-${row.id}` });
//     try {
//       await api.patch(`/content/${row.id}/publish`, {
//         platforms: [row.item || row.platform || 'website'],
//         item: row.item || row.platform || 'website',
//       });
//       toast.success('Creative published', { id: `publish-${row.id}` });
//       setOpenMenuId(null);
//       fetchCreatives();
//     } catch (err) {
//       console.error(err);
//       toast.error('Publish failed', { id: `publish-${row.id}` });
//     }
//   };

//   const handleUnpublish = async (row: CreativeRow) => {
//     toast.loading('Updating creative...', { id: `unpublish-${row.id}` });
//     try {
//       await api.patch(`/content/${row.id}/unpublish`);
//       toast.success('Creative moved to draft', { id: `unpublish-${row.id}` });
//       setOpenMenuId(null);
//       fetchCreatives();
//     } catch (err) {
//       console.error(err);
//       toast.error('Action failed', { id: `unpublish-${row.id}` });
//     }
//   };

//   const handleDuplicate = async (row: CreativeRow) => {
//     toast.loading('Duplicating creative...', { id: `duplicate-${row.id}` });
//     try {
//       await api.post(`/content/${row.id}/duplicate`);
//       toast.success('Creative duplicated', { id: `duplicate-${row.id}` });
//       setOpenMenuId(null);
//       fetchCreatives();
//     } catch (err) {
//       console.error(err);
//       toast.error('Duplicate failed', { id: `duplicate-${row.id}` });
//     }
//   };

//   const handleDelete = async (row: CreativeRow) => {
//     const confirmed = window.confirm(`Delete "${row.name}"?`);
//     if (!confirmed) return;

//     toast.loading('Deleting creative...', { id: `delete-${row.id}` });
//     try {
//       await api.delete(`/content/${row.id}`);
//       toast.success('Creative deleted', { id: `delete-${row.id}` });
//       setOpenMenuId(null);
//       fetchCreatives();
//     } catch (err) {
//       console.error(err);
//       toast.error('Delete failed', { id: `delete-${row.id}` });
//     }
//   };

//   const handleAddItem = () => {
//     const name = newItemName.trim();
//     if (!name) return toast.error('Enter item name');

//     const value = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

//     if (!value) return toast.error('Enter valid item name');

//     const exists = items.some((item) => item.value === value);
//     if (exists) return toast.error('Item already exists');

//     const updated = [...items, { label: name, value }];
//     setItems(updated);
//     setSelectedHeaderItem(value);
//     setSelectedItem(value);
//     setManualItem(value);
//     setNewItemName('');
//     setShowItemModal(false);
//     toast.success('Item added successfully');
//   };

//   const filtered = useMemo(() => creatives, [creatives]);

//   if (loading) {
//     return (
//       <div
//         style={{
//           height: '100vh',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           background: '#f5f6fa',
//         }}
//       >
//         <div
//           className="animate-fade-in"
//           style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}
//         >
//           Loading Creative Hub...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ minHeight: '100%', background: '#f5f6fa' }}>
//       <div
//         style={{
//           background: '#fff',
//           borderBottom: '1px solid #e8eaf0',
//           padding: '16px 32px',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           gap: '16px',
//           flexWrap: 'wrap',
//         }}
//       >
//         <div style={{ display: 'flex', gap: '0', padding: '0' }}>
//           {['All Creatives'].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               style={{
//                 padding: '14px 20px',
//                 border: 'none',
//                 background: 'none',
//                 cursor: 'pointer',
//                 fontSize: '0.88rem',
//                 fontWeight: 600,
//                 color: activeTab === tab ? '#7c3aed' : '#64748b',
//                 borderBottom:
//                   activeTab === tab ? '2px solid #7c3aed' : '2px solid transparent',
//               }}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '12px',
//             flexWrap: 'wrap',
//           }}
//         >
//           <div
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: '10px',
//               padding: '10px 14px',
//               borderRadius: '999px',
//               border: '1px solid #e5e7eb',
//               background: '#faf7ff',
//               minWidth: '260px',
//             }}
//           >
//             <Globe size={15} color="#7c3aed" />
//             <select
//               value={selectedHeaderItem}
//               onChange={(e) => {
//                 setSelectedHeaderItem(e.target.value);
//                 setSelectedItem(e.target.value);
//               }}
//               style={{
//                 border: 'none',
//                 background: 'transparent',
//                 outline: 'none',
//                 fontSize: '0.9rem',
//                 fontWeight: 600,
//                 color: '#1e293b',
//                 width: '100%',
//                 cursor: 'pointer',
//                 textTransform: 'capitalize',
//               }}
//             >
//               {items.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>

//             <button
//               type="button"
//               onClick={() => setShowItemModal(true)}
//               style={{
//                 background: 'transparent',
//                 border: 'none',
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 width: 24,
//                 height: 24,
//                 borderRadius: 999,
//               }}
//             >
//               <Plus size={16} color="#7c3aed" />
//             </button>
//           </div>

//           <button
//             onClick={() => setShowGenModal(true)}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px',
//               padding: '11px 18px',
//               borderRadius: '999px',
//               background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
//               color: '#fff',
//               border: 'none',
//               cursor: 'pointer',
//               fontWeight: 700,
//               boxShadow: '0 8px 20px rgba(124,58,237,0.25)',
//             }}
//           >
//             <Sparkles size={16} /> Ask AI
//           </button>
//         </div>
//       </div>

//       <div style={{ padding: '20px 32px' }}>
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '10px',
//             marginBottom: '20px',
//             flexWrap: 'wrap',
//           }}
//         >
//           <button
//             onClick={() => setShowManualModal(true)}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: '7px',
//               padding: '10px 18px',
//               borderRadius: '10px',
//               background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
//               color: '#fff',
//               border: 'none',
//               cursor: 'pointer',
//               fontWeight: 700,
//               fontSize: '0.9rem',
//               boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
//             }}
//           >
//             <Plus size={15} /> Add Creative
//           </button>

//           <button
//             onClick={() => setShowGenModal(true)}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: '7px',
//               padding: '10px 18px',
//               borderRadius: '10px',
//               border: '1.5px solid #c4b5fd',
//               background: '#fff',
//               color: '#7c3aed',
//               cursor: 'pointer',
//               fontWeight: 700,
//               fontSize: '0.9rem',
//             }}
//           >
//             <Sparkles size={15} /> AI Creative Generation
//           </button>
//         </div>

//         <div
//           style={{
//             background: '#fff',
//             border: '1px solid #e8eaf0',
//             borderRadius: '12px',
//             padding: '16px 20px',
//             marginBottom: '16px',
//           }}
//         >
//           <div
//             style={{
//               display: 'flex',
//               gap: '12px',
//               alignItems: 'end',
//               flexWrap: 'wrap',
//             }}
//           >
//             <div>
//               <div
//                 style={{
//                   fontSize: '0.72rem',
//                   fontWeight: 700,
//                   color: '#64748b',
//                   marginBottom: '5px',
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.05em',
//                 }}
//               >
//                 Upload Date
//               </div>
//               <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '6px',
//                     padding: '8px 12px',
//                     border: '1px solid #e2e8f0',
//                     borderRadius: '8px',
//                     background: '#fafafa',
//                   }}
//                 >
//                   <Calendar size={13} />
//                   <input
//                     type="date"
//                     value={uploadStart}
//                     onChange={(e) => setUploadStart(e.target.value)}
//                     style={{ border: 'none', outline: 'none', background: 'transparent' }}
//                   />
//                 </div>
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '6px',
//                     padding: '8px 12px',
//                     border: '1px solid #e2e8f0',
//                     borderRadius: '8px',
//                     background: '#fafafa',
//                   }}
//                 >
//                   <Calendar size={13} />
//                   <input
//                     type="date"
//                     value={uploadEnd}
//                     onChange={(e) => setUploadEnd(e.target.value)}
//                     style={{ border: 'none', outline: 'none', background: 'transparent' }}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div>
//               <div
//                 style={{
//                   fontSize: '0.72rem',
//                   fontWeight: 700,
//                   color: '#64748b',
//                   marginBottom: '5px',
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.05em',
//                 }}
//               >
//                 Limited Lifetime
//               </div>
//               <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '6px',
//                     padding: '8px 12px',
//                     border: '1px solid #e2e8f0',
//                     borderRadius: '8px',
//                     background: '#fafafa',
//                   }}
//                 >
//                   <Calendar size={13} />
//                   <input
//                     type="date"
//                     value={lifeStart}
//                     onChange={(e) => setLifeStart(e.target.value)}
//                     style={{ border: 'none', outline: 'none', background: 'transparent' }}
//                   />
//                 </div>
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '6px',
//                     padding: '8px 12px',
//                     border: '1px solid #e2e8f0',
//                     borderRadius: '8px',
//                     background: '#fafafa',
//                   }}
//                 >
//                   <Calendar size={13} />
//                   <input
//                     type="date"
//                     value={lifeEnd}
//                     onChange={(e) => setLifeEnd(e.target.value)}
//                     style={{ border: 'none', outline: 'none', background: 'transparent' }}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div>
//               <div
//                 style={{
//                   fontSize: '0.72rem',
//                   fontWeight: 700,
//                   color: '#64748b',
//                   marginBottom: '5px',
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.05em',
//                 }}
//               >
//                 Item
//               </div>
//               <div
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '6px',
//                   padding: '8px 12px',
//                   border: '1px solid #e2e8f0',
//                   borderRadius: '8px',
//                   background: '#fafafa',
//                   minWidth: '170px',
//                 }}
//               >
//                 <Package size={13} />
//                 <select
//                   value={selectedItem}
//                   onChange={(e) => setSelectedItem(e.target.value)}
//                   style={{
//                     border: 'none',
//                     outline: 'none',
//                     background: 'transparent',
//                     width: '100%',
//                     cursor: 'pointer',
//                     textTransform: 'capitalize',
//                   }}
//                 >
//                   <option value="all">Please select</option>
//                   {items.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div style={{ marginLeft: 'auto' }}>
//               <div
//                 style={{
//                   fontSize: '0.72rem',
//                   fontWeight: 700,
//                   color: '#64748b',
//                   marginBottom: '5px',
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.05em',
//                 }}
//               >
//                 Search
//               </div>
//               <div style={{ position: 'relative' }}>
//                 <Search
//                   size={13}
//                   style={{
//                     position: 'absolute',
//                     left: '10px',
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     color: '#94a3b8',
//                   }}
//                 />
//                 <input
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   placeholder="Search creatives..."
//                   style={{
//                     padding: '8px 12px 8px 30px',
//                     borderRadius: '8px',
//                     border: '1px solid #e2e8f0',
//                     fontSize: '0.82rem',
//                     color: '#334155',
//                     outline: 'none',
//                     background: '#fafafa',
//                     width: '220px',
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div
//           style={{
//             background: '#fff',
//             border: '1px solid #e8eaf0',
//             borderRadius: '12px',
//             overflow: 'hidden',
//           }}
//         >
//           {filtered.length === 0 ? (
//             <div
//               style={{
//                 padding: '80px 32px',
//                 textAlign: 'center',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 gap: '12px',
//               }}
//             >
//               <div
//                 style={{
//                   width: '64px',
//                   height: '64px',
//                   borderRadius: '50%',
//                   background: '#f1f5f9',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                 }}
//               >
//                 <Inbox size={28} color="#94a3b8" />
//               </div>
//               <div style={{ fontWeight: 700, color: '#475569' }}>No creatives found.</div>
//               <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
//                 Add creative to get started.
//               </div>
//             </div>
//           ) : (
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
//                   {['Creative', 'Type', 'Platform', 'Upload Date', 'Lifetime', 'Status', ''].map(
//                     (h) => (
//                       <th
//                         key={h}
//                         style={{
//                           padding: '11px 16px',
//                           textAlign: 'left',
//                           fontSize: '0.72rem',
//                           fontWeight: 700,
//                           color: '#94a3b8',
//                           textTransform: 'uppercase',
//                           letterSpacing: '0.05em',
//                         }}
//                       >
//                         {h}
//                       </th>
//                     ),
//                   )}
//                 </tr>
//               </thead>

//               <tbody>
//                 {filtered.map((c, i) => {
//                   const Icon = typeIcon[c.type] || ImageIcon;
//                   const isMenuOpen = openMenuId === c.id;

//                   return (
//                     <tr
//                       key={c.id}
//                       style={{
//                         borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
//                         cursor: 'pointer',
//                       }}
//                       onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
//                       onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
//                     >
//                       <td
//                         style={{
//                           padding: '13px 16px',
//                           display: 'flex',
//                           alignItems: 'center',
//                           gap: '10px',
//                         }}
//                       >
//                         <div
//                           style={{
//                             width: '36px',
//                             height: '36px',
//                             borderRadius: '8px',
//                             background: '#f1f5f9',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             flexShrink: 0,
//                           }}
//                         >
//                           <Icon size={16} color="#7c3aed" />
//                         </div>
//                         <div>
//                           <div
//                             style={{
//                               fontWeight: 700,
//                               fontSize: '0.875rem',
//                               color: '#0f172a',
//                             }}
//                           >
//                             {c.name}
//                           </div>
//                           {c.isAiGenerated && (
//                             <div
//                               style={{
//                                 fontSize: '0.72rem',
//                                 color: '#7c3aed',
//                                 fontWeight: 600,
//                               }}
//                             >
//                               AI Generated
//                             </div>
//                           )}
//                         </div>
//                       </td>

//                       <td style={{ padding: '13px 16px' }}>
//                         <span
//                           style={{
//                             padding: '3px 9px',
//                             borderRadius: '6px',
//                             background: '#f1f5f9',
//                             color: '#475569',
//                             fontSize: '0.75rem',
//                             fontWeight: 700,
//                             textTransform: 'capitalize',
//                           }}
//                         >
//                           {formatTypeLabel(c.contentType)}
//                         </span>
//                       </td>

//                       <td
//                         style={{
//                           padding: '13px 16px',
//                           fontSize: '0.85rem',
//                           color: '#475569',
//                           textTransform: 'capitalize',
//                         }}
//                       >
//                         {c.platform}
//                       </td>

//                       <td style={{ padding: '13px 16px', fontSize: '0.85rem', color: '#475569' }}>
//                         {c.uploadDate}
//                       </td>

//                       <td style={{ padding: '13px 16px', fontSize: '0.82rem', color: '#64748b' }}>
//                         {c.lifetime}
//                       </td>

//                       <td style={{ padding: '13px 16px' }}>
//                         <span
//                           style={{
//                             padding: '3px 9px',
//                             borderRadius: '99px',
//                             background:
//                               c.status === 'published'
//                                 ? '#f0fdf4'
//                                 : c.status === 'draft'
//                                   ? '#f8fafc'
//                                   : '#fff7ed',
//                             color:
//                               c.status === 'published'
//                                 ? '#16a34a'
//                                 : c.status === 'draft'
//                                   ? '#64748b'
//                                   : '#ea580c',
//                             fontSize: '0.75rem',
//                             fontWeight: 700,
//                             textTransform: 'capitalize',
//                           }}
//                         >
//                           {c.status}
//                         </span>
//                       </td>

//                       <td
//                         style={{
//                           padding: '13px 16px',
//                           position: 'relative',
//                         }}
//                       >
//                         <div ref={isMenuOpen ? menuRef : null}>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setOpenMenuId(isMenuOpen ? null : c.id);
//                             }}
//                             style={{
//                               background: 'none',
//                               border: 'none',
//                               cursor: 'pointer',
//                               color: '#94a3b8',
//                               padding: '6px',
//                               borderRadius: '6px',
//                             }}
//                           >
//                             <MoreHorizontal size={16} />
//                           </button>

//                           {isMenuOpen && (
//                             <div
//                               style={{
//                                 position: 'absolute',
//                                 right: '16px',
//                                 top: '42px',
//                                 width: '190px',
//                                 background: '#fff',
//                                 border: '1px solid #e5e7eb',
//                                 borderRadius: '12px',
//                                 boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
//                                 zIndex: 50,
//                                 overflow: 'hidden',
//                               }}
//                             >
//                               <button
//                                 onClick={() => {
//                                   setSelectedCreative(c);
//                                   setShowViewModal(true);
//                                   setOpenMenuId(null);
//                                 }}
//                                 style={menuItemStyle}
//                               >
//                                 <Eye size={15} /> View
//                               </button>

//                               {c.status !== 'published' ? (
//                                 <button onClick={() => handlePublish(c)} style={menuItemStyle}>
//                                   <UploadCloud size={15} /> Publish
//                                 </button>
//                               ) : (
//                                 <button onClick={() => handleUnpublish(c)} style={menuItemStyle}>
//                                   <ChevronDown size={15} /> Unpublish
//                                 </button>
//                               )}

//                               <button onClick={() => handleDuplicate(c)} style={menuItemStyle}>
//                                 <Copy size={15} /> Duplicate
//                               </button>

//                               <button
//                                 onClick={() => handleDelete(c)}
//                                 style={{ ...menuItemStyle, color: '#dc2626' }}
//                               >
//                                 <Trash2 size={15} /> Delete
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>

//       {showGenModal && (
//         <ModalShell onClose={() => setShowGenModal(false)} maxWidth={560}>
//           <GlassCard style={{ padding: '32px', position: 'relative' }}>
//             <CloseButton onClick={() => setShowGenModal(false)} />

//             <div
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 marginBottom: '24px',
//               }}
//             >
//               <div
//                 style={{
//                   width: '40px',
//                   height: '40px',
//                   borderRadius: '10px',
//                   background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   color: '#fff',
//                 }}
//               >
//                 <Wand2 size={20} />
//               </div>
//               <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
//                 AI Creative Draft
//               </h2>
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//               <div className="input-group">
//                 <label>Content Topic / Product Name</label>
//                 <input
//                   type="text"
//                   className="input-field"
//                   value={genTopic}
//                   onChange={(e) => setGenTopic(e.target.value)}
//                   placeholder="e.g. AI-Powered Marketing"
//                 />
//               </div>

//               <div
//                 style={{
//                   display: 'grid',
//                   gridTemplateColumns: '1fr 1fr',
//                   gap: '12px',
//                 }}
//               >
//                 <div className="input-group">
//                   <label>Content Type</label>
//                   <select
//                     className="input-field"
//                     value={genType}
//                     onChange={(e) => setGenType(e.target.value)}
//                     style={{ background: '#fff' }}
//                   >
//                     {aiTypeOptions.map((option) => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="input-group">
//                   <label>Tone of Voice</label>
//                   <select
//                     className="input-field"
//                     value={genTone}
//                     onChange={(e) => setGenTone(e.target.value)}
//                     style={{ background: '#fff' }}
//                   >
//                     {toneOptions.map((option) => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div
//                 style={{
//                   display: 'grid',
//                   gridTemplateColumns: '1fr 1fr',
//                   gap: '12px',
//                 }}
//               >
//                 <div className="input-group">
//                   <label>Item</label>
//                   <select
//                     className="input-field"
//                     value={selectedHeaderItem}
//                     onChange={(e) => setSelectedHeaderItem(e.target.value)}
//                     style={{ background: '#fff' }}
//                   >
//                     {items.map((option) => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="input-group">
//                   <label>Limited Lifetime</label>
//                   <input
//                     type="date"
//                     className="input-field"
//                     value={genExpiresAt}
//                     onChange={(e) => setGenExpiresAt(e.target.value)}
//                   />
//                 </div>
//               </div>

//               <button
//                 onClick={handleGenerate}
//                 disabled={generating}
//                 className="btn btn-primary"
//                 style={{
//                   width: '100%',
//                   padding: '16px',
//                   fontSize: '1rem',
//                   marginTop: '10px',
//                 }}
//               >
//                 {generating ? 'Drafting with AI...' : 'Generate New Creative'}
//               </button>
//             </div>
//           </GlassCard>
//         </ModalShell>
//       )}

//       {showManualModal && (
//         <ModalShell
//           onClose={() => {
//             setShowManualModal(false);
//             resetManualForm();
//           }}
//           maxWidth={560}
//         >
//           <GlassCard style={{ padding: '32px', position: 'relative' }}>
//             <CloseButton
//               onClick={() => {
//                 setShowManualModal(false);
//                 resetManualForm();
//               }}
//             />

//             <div
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 marginBottom: '24px',
//               }}
//             >
//               <div
//                 style={{
//                   width: '40px',
//                   height: '40px',
//                   borderRadius: '10px',
//                   background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   color: '#fff',
//                 }}
//               >
//                 <Plus size={20} />
//               </div>
//               <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
//                 Add Creative Draft
//               </h2>
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//               <div className="input-group">
//                 <label>Creative Title</label>
//                 <input
//                   type="text"
//                   className="input-field"
//                   value={manualTitle}
//                   onChange={(e) => setManualTitle(e.target.value)}
//                   placeholder="e.g. Summer Campaign Banner"
//                 />
//               </div>

//               <div className="input-group">
//                 <label>Content / Caption</label>
//                 <textarea
//                   className="input-field"
//                   value={manualBody}
//                   onChange={(e) => setManualBody(e.target.value)}
//                   placeholder="Write creative content here..."
//                   rows={5}
//                   style={{ resize: 'vertical', paddingTop: '12px' }}
//                 />
//               </div>

//               <div className="input-group">
//                 <label>Image</label>
//                 <div
//                   style={{
//                     border: '1px dashed #d8b4fe',
//                     borderRadius: '12px',
//                     padding: '14px',
//                     background: '#faf7ff',
//                   }}
//                 >
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleManualImageChange}
//                     style={{ width: '100%' }}
//                   />

//                   {manualImagePreview && (
//                     <div style={{ marginTop: 12 }}>
//                       <img
//                         src={manualImagePreview}
//                         alt="Manual creative preview"
//                         style={{
//                           width: '100%',
//                           maxHeight: 220,
//                           objectFit: 'cover',
//                           borderRadius: 12,
//                           border: '1px solid #ede9fe',
//                         }}
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div
//                 style={{
//                   display: 'grid',
//                   gridTemplateColumns: '1fr 1fr',
//                   gap: '12px',
//                 }}
//               >
//                 <div className="input-group">
//                   <label>Content Type</label>
//                   <select
//                     className="input-field"
//                     value={manualType}
//                     onChange={(e) => setManualType(e.target.value)}
//                     style={{ background: '#fff' }}
//                   >
//                     {manualTypeOptions.map((option) => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="input-group">
//                   <label>Item</label>
//                   <select
//                     className="input-field"
//                     value={manualItem}
//                     onChange={(e) => setManualItem(e.target.value)}
//                     style={{ background: '#fff' }}
//                   >
//                     {items.map((option) => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div className="input-group">
//                 <label>Limited Lifetime</label>
//                 <input
//                   type="date"
//                   className="input-field"
//                   value={manualExpiresAt}
//                   onChange={(e) => setManualExpiresAt(e.target.value)}
//                 />
//               </div>

//               <button
//                 onClick={handleCreateManual}
//                 disabled={savingManual}
//                 className="btn btn-primary"
//                 style={{
//                   width: '100%',
//                   padding: '16px',
//                   fontSize: '1rem',
//                   marginTop: '10px',
//                 }}
//               >
//                 {savingManual ? 'Saving...' : 'Create New Creative'}
//               </button>
//             </div>
//           </GlassCard>
//         </ModalShell>
//       )}

//       {showViewModal && selectedCreative && (
//         <ModalShell onClose={() => setShowViewModal(false)} maxWidth={860}>
//           <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
//             <div
//               style={{
//                 padding: '20px 24px',
//                 borderBottom: '1px solid #eef2f7',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 gap: 16,
//               }}
//             >
//               <div>
//                 <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
//                   {selectedCreative.name}
//                 </h2>
//                 <div
//                   style={{
//                     marginTop: 8,
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: 8,
//                     flexWrap: 'wrap',
//                   }}
//                 >
//                   <span style={metaPill}>
//                     {formatTypeLabel(selectedCreative.contentType)}
//                   </span>
//                   <span style={metaPill}>{selectedCreative.item}</span>
//                   <span style={metaPill}>{selectedCreative.status}</span>
//                 </div>
//               </div>

//               <CloseButton onClick={() => setShowViewModal(false)} />
//             </div>

//             <div
//               style={{
//                 padding: 24,
//                 display: 'grid',
//                 gridTemplateColumns: selectedCreative.imageUrl ? '1.1fr 1fr' : '1fr',
//                 gap: 24,
//               }}
//             >
//               {selectedCreative.imageUrl && (
//                 <div
//                   style={{
//                     borderRadius: 16,
//                     overflow: 'hidden',
//                     border: '1px solid #eef2f7',
//                     background: '#f8fafc',
//                     minHeight: 320,
//                   }}
//                 >
//                   <img
//                     src={selectedCreative.imageUrl}
//                     alt={selectedCreative.name}
//                     style={{
//                       width: '100%',
//                       height: '100%',
//                       objectFit: 'cover',
//                       display: 'block',
//                     }}
//                   />
//                 </div>
//               )}

//               <div style={{ minWidth: 0 }}>
//                 <div style={{ marginBottom: 16 }}>
//                   <div style={sectionTitle}>Creative Details</div>
//                   <div style={detailGrid}>
//                     <DetailItem label="Platform" value={selectedCreative.platform} />
//                     <DetailItem label="Item" value={selectedCreative.item} />
//                     <DetailItem label="Upload Date" value={selectedCreative.uploadDate} />
//                     <DetailItem label="Lifetime" value={selectedCreative.lifetime} />
//                   </div>
//                 </div>

//                 <div>
//                   <div style={sectionTitle}>Content</div>
//                   <div
//                     style={{
//                       border: '1px solid #eef2f7',
//                       background: '#f8fafc',
//                       borderRadius: 14,
//                       padding: 16,
//                       whiteSpace: 'pre-wrap',
//                       color: '#334155',
//                       lineHeight: 1.7,
//                       minHeight: 180,
//                     }}
//                   >
//                     {selectedCreative.body || 'No content added for this creative.'}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </GlassCard>
//         </ModalShell>
//       )}

//       {showItemModal && (
//         <ModalShell onClose={() => setShowItemModal(false)} maxWidth={460}>
//           <GlassCard style={{ padding: 28, position: 'relative' }}>
//             <CloseButton onClick={() => setShowItemModal(false)} />

//             <div
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 12,
//                 marginBottom: 20,
//               }}
//             >
//               <div
//                 style={{
//                   width: 40,
//                   height: 40,
//                   borderRadius: 12,
//                   background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   color: '#fff',
//                 }}
//               >
//                 <Plus size={18} />
//               </div>
//               <div>
//                 <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Add Item</h3>
//                 <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
//                   Add a new platform/item and use it everywhere in Creative Hub.
//                 </p>
//               </div>
//             </div>

//             <div className="input-group">
//               <label>Item Name</label>
//               <input
//                 className="input-field"
//                 value={newItemName}
//                 onChange={(e) => setNewItemName(e.target.value)}
//                 placeholder="e.g. Website"
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter') {
//                     e.preventDefault();
//                     handleAddItem();
//                   }
//                 }}
//               />
//             </div>

//             <button
//               onClick={handleAddItem}
//               className="btn btn-primary"
//               style={{
//                 width: '100%',
//                 padding: '15px',
//                 fontSize: '0.96rem',
//                 marginTop: 10,
//               }}
//             >
//               Save Item
//             </button>
//           </GlassCard>
//         </ModalShell>
//       )}
//     </div>
//   );
// };

// const ModalShell: React.FC<{
//   children: React.ReactNode;
//   onClose: () => void;
//   maxWidth?: number;
// }> = ({ children, onClose, maxWidth = 560 }) => {
//   return (
//     <div
//       onClick={onClose}
//       style={{
//         position: 'fixed',
//         inset: 0,
//         background: 'rgba(15, 23, 42, 0.45)',
//         backdropFilter: 'blur(8px)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: 1000,
//         padding: 20,
//       }}
//     >
//       <motion.div
//         onClick={(e) => e.stopPropagation()}
//         initial={{ opacity: 0, y: 18, scale: 0.97 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.2 }}
//         style={{ width: '100%', maxWidth }}
//       >
//         {children}
//       </motion.div>
//     </div>
//   );
// };

// const CloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
//   return (
//     <button
//       onClick={onClick}
//       style={{
//         position: 'absolute',
//         top: 16,
//         right: 16,
//         width: 34,
//         height: 34,
//         borderRadius: 999,
//         border: '1px solid #e5e7eb',
//         background: '#fff',
//         cursor: 'pointer',
//         color: '#64748b',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//       }}
//     >
//       <X size={18} />
//     </button>
//   );
// };

// const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => {
//   return (
//     <div
//       style={{
//         border: '1px solid #eef2f7',
//         borderRadius: 12,
//         padding: 14,
//         background: '#fff',
//       }}
//     >
//       <div
//         style={{
//           fontSize: '0.72rem',
//           textTransform: 'uppercase',
//           letterSpacing: '0.05em',
//           color: '#94a3b8',
//           fontWeight: 700,
//           marginBottom: 6,
//         }}
//       >
//         {label}
//       </div>
//       <div
//         style={{
//           color: '#0f172a',
//           fontWeight: 700,
//           textTransform: 'capitalize',
//         }}
//       >
//         {value || '-'}
//       </div>
//     </div>
//   );
// };

// const detailGrid: React.CSSProperties = {
//   display: 'grid',
//   gridTemplateColumns: '1fr 1fr',
//   gap: 12,
// };

// const metaPill: React.CSSProperties = {
//   padding: '5px 10px',
//   borderRadius: 999,
//   background: '#f5f3ff',
//   color: '#7c3aed',
//   fontSize: '0.75rem',
//   fontWeight: 700,
//   textTransform: 'capitalize',
// };

// const sectionTitle: React.CSSProperties = {
//   fontSize: '0.82rem',
//   fontWeight: 800,
//   color: '#64748b',
//   marginBottom: 12,
//   textTransform: 'uppercase',
//   letterSpacing: '0.05em',
// };

// const menuItemStyle: React.CSSProperties = {
//   width: '100%',
//   display: 'flex',
//   alignItems: 'center',
//   gap: '10px',
//   padding: '12px 14px',
//   background: '#fff',
//   border: 'none',
//   borderBottom: '1px solid #f1f5f9',
//   cursor: 'pointer',
//   fontSize: '0.88rem',
//   color: '#334155',
//   fontWeight: 600,
//   textAlign: 'left',
// };