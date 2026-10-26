import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import {
  Send,
  Sparkles,
  Clock,
  Calendar,
  RefreshCw,
  Trash2,
  Play,
  Pause,
  Share2,
  Image as ImageIcon,
  Video,
  X,
  Plus,
  Eye,
  Zap,
  Check,
  Images,
  ExternalLink,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  ThumbsUp,
  Hash,
} from 'lucide-react';
import {
  fetchConnections,
  fetchSocialPosts,
  publishPost,
  schedulePost,
  connectPlatform,
} from '../../store/slices/socialSlice';
import { uploadSocialMedia, isVideoUrl, mediaSrc } from '../../services/socialMediaApi';
import {
  getAutoPostTopics,
  createAutoPostTopic,
  toggleAutoPostTopic,
  deleteAutoPostTopic,
  previewAutoPostTopic,
  triggerAutoPostTopic,
  generateAiContent,
  generatePostFromImage,
} from '../../services/autoPostApi';
import type { AutoPostTopic } from '../../services/autoPostApi';
import { api } from '../../api/axios';
import type { AppDispatch, RootState } from '../../store';
import toast from 'react-hot-toast';
import { SectionLoader } from '../components/Loader';

export const PostPublisher: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { posts, connections, publishing, scheduling } = useSelector(
    (state: RootState) => state.social,
  );
  const { activeWebsiteId } = useSelector((state: RootState) => state.workspace);
  const { user } = useSelector((state: RootState) => state.auth);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'compose' | 'autopilot' | 'history'>('compose');

  // ── COMPOSE STATE ──
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postMode, setPostMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledTime, setScheduledTime] = useState('');
  const [previewPlatform, setPreviewPlatform] = useState<string>('linkedin');

  // YouTube specific
  const [ytTitle, setYtTitle] = useState('');
  const [ytPrivacy, setYtPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [ytTags, setYtTags] = useState('');
  const [ytCategory, setYtCategory] = useState('22'); // 22 = People & Blogs
  const [ytKids, setYtKids] = useState(false);

  // AI Prompt Assistant in Compose
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState('');
  const [aiTone, setAiTone] = useState('engaging & viral');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Creative Hub Picker Modal
  const [creativePickerOpen, setCreativePickerOpen] = useState(false);
  const [hubCreatives, setHubCreatives] = useState<any[]>([]);
  const [loadingHubCreatives, setLoadingHubCreatives] = useState(false);

  // ── AUTO-POST TOPICS STATE ──
  const [autoTopics, setAutoTopics] = useState<AutoPostTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTopicContent, setPreviewTopicContent] = useState('');
  const [previewingTopicName, setPreviewingTopicName] = useState('');
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [testingAiSample, setTestingAiSample] = useState(false);
  const [sampleAiResult, setSampleAiResult] = useState('');

  // Trending Hashtags for quick insertion
  const trendingHashtags = [
    '#AI',
    '#DigitalMarketing',
    '#GrowthHacks',
    '#Innovation',
    '#BusinessTips',
    '#TechTrends',
    '#StartupLife',
    '#MarketingStrategy',
  ];

  // New Auto-Post Form
  const [newTopic, setNewTopic] = useState({
    topic: '',
    context: '',
    tone: 'professional',
    platforms: ['linkedin', 'twitter'] as string[],
    frequency: 'daily',
    preferredTime: '09:00',
    timezone: 'Asia/Kolkata',
    hashtags: '',
    language: 'english',
  });

  // Load initial data
  useEffect(() => {
    dispatch(fetchConnections())
      .unwrap()
      .then((conn) => {
        const connectedKeys = Object.entries(conn)
          .filter(([platform, isConn]) => ['linkedin', 'twitter', 'facebook', 'instagram'].includes(platform) && Boolean(isConn))
          .map(([p]) => p);
        setSelectedPlatforms(connectedKeys);
      })
      .catch(() => undefined);

    dispatch(fetchSocialPosts(activeWebsiteId || undefined));
    loadAutoTopics();

    // Check OAuth return query parameters
    const params = new URLSearchParams(window.location.search);
    const statusVal = params.get('status');
    const plat = params.get('social_connect');
    if (statusVal && plat) {
      if (statusVal === 'success') {
        toast.success(`🎉 ${plat.toUpperCase()} account connected successfully!`);
        dispatch(fetchConnections())
          .unwrap()
          .then(() => {
            setSelectedPlatforms((prev) => (prev.includes(plat) ? prev : [...prev, plat]));
          })
          .catch(() => undefined);
      } else {
        toast.error(`Failed to connect ${plat}. Please try again.`);
      }
      params.delete('status');
      params.delete('social_connect');
      const next = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${next ? `?${next}` : ''}`);
    }
  }, [dispatch, activeWebsiteId]);

  const loadAutoTopics = async () => {
    setLoadingTopics(true);
    try {
      const data = await getAutoPostTopics(activeWebsiteId || undefined);
      setAutoTopics(data);
    } catch (err: any) {
      console.error('Failed to load auto-post topics', err);
    } finally {
      setLoadingTopics(false);
    }
  };

  // Open Creative Hub Picker and fetch user's saved creatives
  const handleOpenCreativePicker = async () => {
    setCreativePickerOpen(true);
    setLoadingHubCreatives(true);
    try {
      const res = await api.get('/content');
      const list = Array.isArray(res.data) ? res.data : [];
      setHubCreatives(list);
    } catch (err) {
      toast.error('Failed to load Creative Hub items.');
      setHubCreatives([]);
    } finally {
      setLoadingHubCreatives(false);
    }
  };

  const handleSelectHubCreative = (item: any) => {
    const url = item.imageUrl || item.thumbnailUrl;
    if (!url) {
      toast.error('This creative does not have an image URL.');
      return;
    }
    if (!media.includes(url)) {
      setMedia((prev) => [...prev, url]);
      toast.success('Creative attached to post!');
    } else {
      toast('Creative already attached.');
    }
    setCreativePickerOpen(false);
  };

  const handleAddHashtag = (tag: string) => {
    setContent((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tag;
      if (trimmed.includes(tag)) return prev;
      return `${trimmed} ${tag}`;
    });
  };

  const platformsConfig = [
    { id: 'linkedin', name: 'LinkedIn', color: '#0077b5', maxChars: 3000, iconBg: 'rgba(0, 119, 181, 0.2)', iconColor: '#38bdf8' },
    { id: 'twitter', name: 'Twitter / X', color: '#1da1f2', maxChars: 280, iconBg: 'rgba(29, 161, 242, 0.2)', iconColor: '#38bdf8' },
    { id: 'facebook', name: 'Facebook', color: '#1877f2', maxChars: 63206, iconBg: 'rgba(24, 119, 242, 0.2)', iconColor: '#60a5fa' },
    { id: 'instagram', name: 'Instagram', color: '#e1306c', maxChars: 2200, iconBg: 'rgba(225, 48, 108, 0.2)', iconColor: '#f43f5e' },
    { id: 'youtube', name: 'YouTube', color: '#ff0000', maxChars: 5000, iconBg: 'rgba(255, 0, 0, 0.2)', iconColor: '#ef4444' },
  ];

  const handleConnectPlatform = async (e: React.MouseEvent, pid: string) => {
    e.stopPropagation();
    try {
      const result = await dispatch(connectPlatform(pid as any)).unwrap();
      if (result?.url) {
        window.location.assign(result.url);
      }
    } catch {
      toast.error(`Could not initiate ${pid} connection.`);
    }
  };

  const togglePlatform = (pid: string) => {
    if (!connections[pid as keyof typeof connections]) {
      dispatch(connectPlatform(pid as any))
        .unwrap()
        .then((res: any) => {
          if (res?.url) window.location.assign(res.url);
        })
        .catch(() => {
          toast.error(`Please connect ${pid} first in your Social Settings.`);
        });
      return;
    }
    setSelectedPlatforms((prev) =>
      prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]
    );
  };

  const selectAllConnected = () => {
    const all = platformsConfig
      .filter((p) => connections[p.id as keyof typeof connections])
      .map((p) => p.id);
    setSelectedPlatforms(all);
  };

  // Media Upload handler
  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      if (isVideo && media.some(isVideoUrl)) {
        toast.error('Only one video can be attached per post.');
        continue;
      }
      try {
        setUploadPercent(0);
        const uploaded = await uploadSocialMedia(file, setUploadPercent);
        setMedia((curr) => [...curr, uploaded.url]);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || `${file.name} upload failed.`);
      } finally {
        setUploadPercent(null);
      }
    }
  };

  // AI Content Generator for Composer
  const handleGenerateAiPost = async () => {
    if (!aiTopicInput.trim()) {
      return toast.error('Please enter a topic or theme.');
    }
    setIsGeneratingAi(true);
    try {
      const prompt = `Write a viral, high-converting social media post for ${selectedPlatforms.join(', ') || 'LinkedIn and Twitter'}.
Topic: ${aiTopicInput}
Tone: ${aiTone}
Requirements:
- Catchy first hook
- Clear spacing and bullet points if helpful
- Relevant emojis
- High engagement CTA at the bottom
- 3-5 relevant hashtags
- Return ONLY the post text with no commentary or quotes.`;

      const generated = await generateAiContent(prompt);
      setContent(generated.trim());
      setAiPromptOpen(false);
      toast.success('AI post generated successfully!');
    } catch (err: any) {
      toast.error('Failed to generate AI content.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Multimodal AI: Generate relevant post directly from attached image
  const handleGenerateFromAttachedImage = async () => {
    if (!media.length) {
      toast.error('Attach an image first to generate caption from.');
      return;
    }
    const firstImage = media.find((m) => !isVideoUrl(m));
    if (!firstImage) {
      toast.error('Please attach an image (not a video) for visual AI generation.');
      return;
    }

    setIsAnalyzingImage(true);
    const toastId = toast.loading('AI is analyzing your creative image & writing copy...');
    try {
      const generated = await generatePostFromImage(
        firstImage,
        aiTopicInput ? `Additional context: ${aiTopicInput}` : '',
        aiTone,
        selectedPlatforms.length ? selectedPlatforms : ['linkedin', 'twitter'],
      );
      setContent(generated);
      toast.success('Viral post generated directly from your image!', { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to analyze image.', { id: toastId });
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Publish or Schedule
  const handlePublishOrSchedule = async () => {
    if (!content.trim()) return toast.error('Please write some content for your post.');
    if (!selectedPlatforms.length) return toast.error('Please select at least one target platform.');
    if (uploadPercent !== null) return toast.error('Please wait for media upload to finish.');

    const hasVideo = media.some(isVideoUrl);
    const toYoutube = selectedPlatforms.includes('youtube');
    if (toYoutube && !hasVideo) return toast.error('YouTube requires a video attachment.');
    if (selectedPlatforms.includes('instagram') && !media.some((m) => !isVideoUrl(m))) {
      return toast.error('Instagram requires at least one image attachment.');
    }

    if (postMode === 'scheduled') {
      if (!scheduledTime) return toast.error('Please select a date and time to schedule.');
      const scheduleDate = new Date(scheduledTime);
      if (scheduleDate.getTime() <= Date.now()) {
        return toast.error('Scheduled time must be in the future.');
      }
    }

    const payload = {
      content,
      media,
      platforms: selectedPlatforms,
      ...(toYoutube
        ? {
            youtube: {
              title: (ytTitle.trim() || content.split('\n')[0]).slice(0, 100),
              privacy: ytPrivacy,
              tags: ytTags.split(',').map((t) => t.trim()).filter(Boolean),
              categoryId: ytCategory,
              madeForKids: ytKids,
            },
          }
        : {}),
      workspaceId: activeWebsiteId || 'default',
    };

    try {
      if (postMode === 'scheduled') {
        await dispatch(
          schedulePost({
            ...payload,
            scheduledFor: new Date(scheduledTime).toISOString(),
          }),
        ).unwrap();
        toast.success(`Post scheduled successfully across ${selectedPlatforms.length} platform(s)!`);
      } else {
        await dispatch(publishPost(payload)).unwrap();
        toast.success(`Post published instantly across ${selectedPlatforms.length} platform(s)!`);
      }

      setContent('');
      setMedia([]);
      setYtTitle('');
      setYtTags('');
      setScheduledTime('');
      setPostMode('immediate');
      dispatch(fetchSocialPosts(activeWebsiteId || undefined));
    } catch (err: any) {
      toast.error(err?.message || 'Publishing failed. Check account credentials.');
    }
  };

  // ── AUTO-POST HANDLERS ──

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.topic.trim()) return toast.error('Topic name is required.');
    if (!newTopic.platforms.length) return toast.error('Select at least one platform.');

    try {
      const hashtagsArr = newTopic.hashtags
        .split(' ')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith('#') ? t : `#${t}`));

      await createAutoPostTopic({
        topic: newTopic.topic,
        context: newTopic.context,
        tone: newTopic.tone,
        platforms: newTopic.platforms,
        frequency: newTopic.frequency,
        preferredTime: newTopic.preferredTime,
        timezone: newTopic.timezone,
        hashtags: hashtagsArr,
        language: newTopic.language,
        workspaceId: activeWebsiteId || 'default',
      });

      toast.success('AI Auto-Post schedule created successfully!');
      setCreateModalOpen(false);
      setNewTopic({
        topic: '',
        context: '',
        tone: 'professional',
        platforms: ['linkedin', 'twitter'],
        frequency: 'daily',
        preferredTime: '09:00',
        timezone: 'Asia/Kolkata',
        hashtags: '',
        language: 'english',
      });
      setSampleAiResult('');
      loadAutoTopics();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create auto-post topic.');
    }
  };

  const handleToggleTopic = async (id: string) => {
    try {
      const updated = await toggleAutoPostTopic(id);
      setAutoTopics((prev) => prev.map((t) => (t._id === id ? updated : t)));
      toast.success(updated.isActive ? 'Auto-post activated!' : 'Auto-post paused.');
    } catch (err: any) {
      toast.error('Failed to toggle auto-post topic.');
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AI auto-post schedule?')) return;
    try {
      await deleteAutoPostTopic(id);
      setAutoTopics((prev) => prev.filter((t) => t._id !== id));
      toast.success('Auto-post schedule deleted.');
    } catch (err: any) {
      toast.error('Failed to delete.');
    }
  };

  const handlePreviewTopic = async (topic: AutoPostTopic) => {
    setPreviewingTopicName(topic.topic);
    setPreviewTopicContent('Generating live AI preview...');
    setPreviewModalOpen(true);
    try {
      const res = await previewAutoPostTopic(topic._id);
      setPreviewTopicContent(res.content);
    } catch (err: any) {
      setPreviewTopicContent('Failed to generate preview. Please try again.');
    }
  };

  const handleTriggerTopic = async (id: string) => {
    setTriggeringId(id);
    try {
      await triggerAutoPostTopic(id);
      toast.success('AI generated and published post successfully!');
      loadAutoTopics();
      dispatch(fetchSocialPosts(activeWebsiteId || undefined));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to trigger auto-post.');
    } finally {
      setTriggeringId(null);
    }
  };

  const handleTestAiSampleInForm = async () => {
    if (!newTopic.topic.trim()) return toast.error('Enter topic first to test sample.');
    setTestingAiSample(true);
    try {
      const prompt = `Generate a sample social media post for topic: "${newTopic.topic}".
Tone: ${newTopic.tone}
Language: ${newTopic.language}
Platforms: ${newTopic.platforms.join(', ')}
${newTopic.context ? `Extra context: ${newTopic.context}` : ''}
${newTopic.hashtags ? `Hashtags to include: ${newTopic.hashtags}` : ''}
Return ONLY the post content.`;

      const res = await generateAiContent(prompt);
      setSampleAiResult(res.trim());
    } catch (err: any) {
      toast.error('Could not generate sample.');
    } finally {
      setTestingAiSample(false);
    }
  };

  const connectedCount = Object.values(connections).filter(Boolean).length;
  const activeTopicsCount = autoTopics.filter((t) => t.isActive).length;
  const totalAutoPosts = autoTopics.reduce((acc, t) => acc + (t.totalPostsGenerated || 0), 0);
  const hasImageAttached = media.some((m) => !isVideoUrl(m));
  const hasVideo = media.some(isVideoUrl);

  return (
    <div className="section-shell" style={{ paddingBottom: '4rem', paddingTop: '1.5rem' }}>
      {/* ── HEADER BANNER (Wheedle.ai Theme) ── */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--bg-card)',
          borderColor: 'var(--glass-border)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(6, 101, 255, 0.15)',
                border: '1px solid rgba(6, 101, 255, 0.3)',
                marginBottom: '10px',
              }}
            >
              <Sparkles size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8', letterSpacing: '0.5px' }}>
                SOCIAL BROADCASTER & AI AUTO-PILOT
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
              Multi-Platform Post Publisher & AI Auto-Pilot
            </h1>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '650px' }}>
              Publish simultaneously across LinkedIn, Twitter/X, Facebook, Instagram & YouTube. Or configure topics to let Gemini AI generate and post daily on auto-pilot.
            </p>
          </div>

          {/* Metrics */}
          <div style={{ display: 'flex', gap: '14px' }}>
            <div style={{ background: 'var(--bg-elevated)', padding: '12px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-primary)' }}>{connectedCount}/5</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Connected</div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '12px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>{activeTopicsCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Auto-Pilots</div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '12px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#38bdf8' }}>{totalAutoPosts}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Posts Made</div>
            </div>
          </div>
        </div>

        {/* ── TABS NAVIGATION ── */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
          <button
            onClick={() => setActiveTab('compose')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'compose' ? '1px solid var(--accent-primary)' : '1px solid transparent',
              background: activeTab === 'compose' ? 'rgba(6, 101, 255, 0.2)' : 'var(--bg-elevated)',
              color: activeTab === 'compose' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Send size={16} color={activeTab === 'compose' ? 'var(--accent-primary)' : 'currentColor'} />
            Publish & Schedule
          </button>

          <button
            onClick={() => setActiveTab('autopilot')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'autopilot' ? '1px solid var(--success)' : '1px solid transparent',
              background: activeTab === 'autopilot' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-elevated)',
              color: activeTab === 'autopilot' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Zap size={16} color={activeTab === 'autopilot' ? 'var(--success)' : 'currentColor'} />
            AI Auto-Pilot (Topic-Based)
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', background: 'var(--success)', color: '#000', fontWeight: 800 }}>NEW</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'history' ? '1px solid var(--info)' : '1px solid transparent',
              background: activeTab === 'history' ? 'rgba(6, 101, 255, 0.2)' : 'var(--bg-elevated)',
              color: activeTab === 'history' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Clock size={16} color={activeTab === 'history' ? 'var(--info)' : 'currentColor'} />
            Post History ({posts.length})
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: COMPOSE (Instant & Scheduled Multi-Platform Post)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.95fr)', gap: '24px' }}>
          {/* LEFT: Composer & Settings */}
          <div>
            <GlassCard>
              {/* Platform Selector Banner */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Share2 size={16} color="var(--accent-primary)" />
                    Target Platforms (Post simultaneously)
                  </label>
                  <button
                    onClick={selectAllConnected}
                    style={{ fontSize: '12px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Select All Connected
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  {platformsConfig.map((p) => {
                    const isConnected = Boolean(connections[p.id as keyof typeof connections]);
                    const isSelected = selectedPlatforms.includes(p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? `1px solid ${p.color}` : '1px solid var(--glass-border)',
                          background: isSelected ? p.iconBg : 'var(--bg-elevated)',
                          cursor: 'pointer',
                          opacity: isConnected ? 1 : 0.75,
                          transition: 'all var(--transition-fast)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: p.iconBg,
                            color: p.iconColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {p.id === 'linkedin' ? 'in' : p.id === 'twitter' ? 'X' : p.id === 'facebook' ? 'f' : p.id === 'instagram' ? 'IG' : '▶'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.name}
                          </div>
                          {isConnected ? (
                            <div style={{ fontSize: '10px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)' }} />
                              Connected
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleConnectPlatform(e, p.id)}
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '1px 7px',
                                borderRadius: '4px',
                                background: 'rgba(6, 101, 255, 0.2)',
                                border: '1px solid rgba(6, 101, 255, 0.4)',
                                color: '#38bdf8',
                                cursor: 'pointer',
                                marginTop: '2px',
                                display: 'inline-block',
                              }}
                            >
                              + Connect
                            </button>
                          )}
                        </div>
                        {isSelected && <Check size={16} color={p.color} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Tools Bar (Text Prompts + Vision Multimodal) */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <button
                  onClick={() => setAiPromptOpen(!aiPromptOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(6, 101, 255, 0.12)',
                    border: '1px solid rgba(6, 101, 255, 0.35)',
                    color: '#38bdf8',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Sparkles size={15} />
                  Write with AI Assistant
                </button>

                {hasImageAttached && (
                  <button
                    onClick={handleGenerateFromAttachedImage}
                    disabled={isAnalyzingImage}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 101, 255, 0.2) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: 'var(--success)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: isAnalyzingImage ? 'not-allowed' : 'pointer',
                      boxShadow: '0 0 14px rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    {isAnalyzingImage ? <RefreshCw size={14} className="animate-spin" /> : <Eye size={14} />}
                    {isAnalyzingImage ? 'Analyzing Image with AI...' : '✨ Write Post from Attached Image'}
                  </button>
                )}
              </div>

              {/* AI Drawer (Inline) */}
              {aiPromptOpen && (
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} /> AI Post Generator
                    </span>
                    <button
                      onClick={() => setAiPromptOpen(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="What do you want to post about? (e.g. 5 productivity tips, product feature spotlight)"
                      value={aiTopicInput}
                      onChange={(e) => setAiTopicInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerateAiPost()}
                    />
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    >
                      <option value="engaging & viral">Viral Hook</option>
                      <option value="professional & authoritative">Professional</option>
                      <option value="witty & conversational">Witty / Casual</option>
                      <option value="direct sales & high conversion">Sales Pitch</option>
                      <option value="storytelling">Storytelling</option>
                    </select>
                  </div>
                  <button
                    onClick={handleGenerateAiPost}
                    disabled={isGeneratingAi}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-gradient)',
                      color: '#fff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: isGeneratingAi ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isGeneratingAi ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {isGeneratingAi ? 'Generating Post...' : 'Generate & Insert'}
                  </button>
                </div>
              )}

              {/* Main Content Area */}
              <div style={{ marginBottom: '12px' }}>
                <textarea
                  placeholder="What's happening? Write your post caption here or click an AI generator..."
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Trending Hashtags 1-Click Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Hash size={12} /> Add:
                  </span>
                  {trendingHashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddHashtag(tag)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        background: content.includes(tag) ? 'rgba(6, 101, 255, 0.25)' : 'var(--bg-elevated)',
                        border: '1px solid var(--glass-border)',
                        color: content.includes(tag) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Platform Character Progress Meters */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--text-dim)', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {selectedPlatforms.includes('twitter') && (
                      <span style={{ color: content.length > 280 ? 'var(--error)' : content.length > 240 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                        Twitter: {content.length}/280 {content.length > 280 && '⚠️ Exceeded'}
                      </span>
                    )}
                    {selectedPlatforms.includes('instagram') && (
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Instagram: {content.length}/2200
                      </span>
                    )}
                    {selectedPlatforms.includes('linkedin') && (
                      <span style={{ color: 'var(--text-secondary)' }}>
                        LinkedIn: {content.length}/3000
                      </span>
                    )}
                  </div>
                  <span>Total {content.length} characters</span>
                </div>
              </div>

              {/* Media Attachments Preview */}
              {media.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {media.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', width: 90, height: 90, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                      {isVideoUrl(url) ? (
                        <video src={mediaSrc(url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src={mediaSrc(url)} alt="Media preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <button
                        onClick={() => setMedia((prev) => prev.filter((_, i) => i !== idx))}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'rgba(0, 0, 0, 0.75)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* YouTube Specific Settings */}
              {selectedPlatforms.includes('youtube') && (
                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 0, 0, 0.08)', border: '1px solid rgba(255, 0, 0, 0.25)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--error)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Video size={15} /> YouTube Video Configuration (YouTube Data API v3)
                  </div>
                  <input
                    type="text"
                    placeholder="Video Title (required, max 100 chars)"
                    value={ytTitle}
                    onChange={(e) => setYtTitle(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '13px', marginBottom: '8px', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                    <select
                      value={ytPrivacy}
                      onChange={(e: any) => setYtPrivacy(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '13px' }}
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted (Hidden)</option>
                      <option value="private">Private (Restricted)</option>
                    </select>
                    <select
                      value={ytCategory}
                      onChange={(e) => setYtCategory(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '13px' }}
                    >
                      <option value="22">Category: People & Blogs</option>
                      <option value="28">Category: Science & Technology</option>
                      <option value="27">Category: Education</option>
                      <option value="24">Category: Entertainment</option>
                      <option value="26">Category: Howto & Style</option>
                      <option value="20">Category: Gaming</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Tags (comma separated e.g. ai, marketing, tutorial)"
                      value={ytTags}
                      onChange={(e) => setYtTags(e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '13px' }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={ytKids} onChange={(e) => setYtKids(e.target.checked)} />
                      Made for Kids
                    </label>
                  </div>
                  {!hasVideo && (
                    <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#fca5a5', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Video size={14} />
                      <span>Video required: Please attach a video file (.mp4, .mov, .webm) below to publish to YouTube.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Media & Creative Hub Integration Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Local Upload */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <ImageIcon size={15} color="var(--accent-primary)" />
                    <span>Upload Media</span>
                    <input type="file" multiple accept="image/*,video/*" onChange={handleMediaUpload} style={{ display: 'none' }} />
                  </label>

                  {/* Pick from Creative Hub (Existing Code Integration) */}
                  <button
                    type="button"
                    onClick={handleOpenCreativePicker}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(6, 101, 255, 0.1)',
                      border: '1px solid rgba(6, 101, 255, 0.3)',
                      color: '#38bdf8',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Images size={15} />
                    <span>Creative Hub</span>
                  </button>

                  {/* Jump to AI Creative Workspace */}
                  <button
                    type="button"
                    onClick={() => navigate('/content/ai-workspace', { state: { promptOnly: true } })}
                    title="Generate graphics in AI Creative Workspace"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: 'transparent',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <span>Generate in Hub</span>
                    <ExternalLink size={12} />
                  </button>

                  {uploadPercent !== null && (
                    <span style={{ fontSize: '12px', color: 'var(--accent-primary)' }}>Uploading: {uploadPercent}%</span>
                  )}
                </div>

                {/* Immediate vs Schedule Mode Selector */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setPostMode('immediate')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: postMode === 'immediate' ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                      background: postMode === 'immediate' ? 'rgba(6, 101, 255, 0.25)' : 'transparent',
                      color: postMode === 'immediate' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    Publish Now
                  </button>
                  <button
                    onClick={() => setPostMode('scheduled')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: postMode === 'scheduled' ? '1px solid #38bdf8' : '1px solid var(--glass-border)',
                      background: postMode === 'scheduled' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                      color: postMode === 'scheduled' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <Calendar size={14} /> Schedule
                  </button>
                </div>
              </div>

              {/* Date & Time Picker */}
              {postMode === 'scheduled' && (
                <div style={{ marginTop: '16px', padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(6, 101, 255, 0.08)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={16} color="var(--accent-primary)" />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>Pick Date & Time:</span>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  />
                </div>
              )}

              {/* Action Button */}
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={handlePublishOrSchedule}
                  disabled={publishing || scheduling}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-gradient)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: publishing || scheduling ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 16px rgba(6, 101, 255, 0.4)',
                  }}
                >
                  {publishing || scheduling ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      {postMode === 'scheduled' ? 'Scheduling Post...' : 'Publishing Across Platforms...'}
                    </>
                  ) : postMode === 'scheduled' ? (
                    <>
                      <Calendar size={18} />
                      Schedule Post ({selectedPlatforms.length} Platforms)
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Publish Now ({selectedPlatforms.length} Platforms)
                    </>
                  )}
                </button>
              </div>
            </GlassCard>
          </div>

          {/* RIGHT: Live Authentic Platform Previews */}
          <div>
            <GlassCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <Eye size={16} color="var(--accent-primary)" />
                  Live Platform Preview
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['linkedin', 'twitter', 'instagram', 'facebook'].map((pid) => (
                    <button
                      key={pid}
                      onClick={() => setPreviewPlatform(pid)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        border: previewPlatform === pid ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                        background: previewPlatform === pid ? 'rgba(6, 101, 255, 0.25)' : 'transparent',
                        color: previewPlatform === pid ? 'var(--text-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {pid}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── PREVIEW CARD: LINKEDIN ── */}
              {previewPlatform === 'linkedin' && (
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    minHeight: '260px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#0a66c2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: '#fff',
                        fontSize: '16px',
                      }}
                    >
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {user?.name || 'Your Brand'} <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 400 }}>• 1st</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        Digital Marketing & AI Growth • Just now • 🌐
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap', minHeight: '60px', wordBreak: 'break-word' }}>
                    {content.trim() ? content : <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Type in composer to see LinkedIn post preview...</span>}
                  </div>

                  {media.length > 0 && (
                    <div style={{ marginTop: '12px', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: 220, border: '1px solid var(--glass-border)' }}>
                      {isVideoUrl(media[0]) ? (
                        <video src={mediaSrc(media[0])} controls style={{ width: '100%', maxHeight: 220, objectFit: 'contain' }} />
                      ) : (
                        <img src={mediaSrc(media[0])} alt="Mockup attachment" style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }} />
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', marginTop: '14px', paddingTop: '10px', fontSize: '12px', color: 'var(--text-dim)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ThumbsUp size={14} /> Like</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageCircle size={14} /> Comment</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Repeat2 size={14} /> Repost</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Send size={14} /> Send</span>
                  </div>
                </div>
              )}

              {/* ── PREVIEW CARD: TWITTER / X ── */}
              {previewPlatform === 'twitter' && (
                <div
                  style={{
                    background: '#000000',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    minHeight: '260px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#000' }}>
                      {user?.name ? user.name[0].toUpperCase() : 'X'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{user?.name || 'Your Brand'}</span>
                        <span style={{ fontSize: '12px', color: '#1d9bf0' }}>✓</span>
                        <span style={{ fontSize: '12px', color: '#71767b' }}>@brand · now</span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#e7e9ea', lineHeight: '1.5', marginTop: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {content.trim() ? content : <span style={{ color: '#71767b', fontStyle: 'italic' }}>Tweet preview appears here...</span>}
                      </div>

                      {media.length > 0 && (
                        <div style={{ marginTop: '10px', borderRadius: '12px', overflow: 'hidden', maxHeight: 200, border: '1px solid #2f3336' }}>
                          {isVideoUrl(media[0]) ? (
                            <video src={mediaSrc(media[0])} controls style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }} />
                          ) : (
                            <img src={mediaSrc(media[0])} alt="Tweet media" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: '#71767b', fontSize: '12px', maxWidth: '300px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageCircle size={14} /> 12</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Repeat2 size={14} /> 4</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={14} /> 89</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bookmark size={14} /></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PREVIEW CARD: INSTAGRAM ── */}
              {previewPlatform === 'instagram' && (
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                        {user?.name ? user.name[0].toUpperCase() : 'IG'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name?.toLowerCase().replace(/\s+/g, '') || 'your_brand'}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Sponsored / Original Post</div>
                    </div>
                  </div>

                  <div style={{ background: '#000', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {media.length > 0 ? (
                      isVideoUrl(media[0]) ? (
                        <video src={mediaSrc(media[0])} controls style={{ width: '100%', maxHeight: 220, objectFit: 'contain' }} />
                      ) : (
                        <img src={mediaSrc(media[0])} alt="Instagram media" style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }} />
                      )
                    ) : (
                      <div style={{ color: 'var(--text-dim)', fontSize: '12px', padding: '40px 20px', textAlign: 'center' }}>
                        📸 Attach an image to preview Instagram photo layout
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <Heart size={18} />
                        <MessageCircle size={18} />
                        <Send size={18} />
                      </div>
                      <Bookmark size={18} />
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      <b>{user?.name?.toLowerCase().replace(/\s+/g, '') || 'your_brand'}</b>{' '}
                      {content.trim() ? content.slice(0, 160) + (content.length > 160 ? '... more' : '') : 'Caption appears here...'}
                    </div>
                  </div>
                </div>
              )}

              {/* ── PREVIEW CARD: FACEBOOK ── */}
              {previewPlatform === 'facebook' && (
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                      f
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name || 'Your Brand'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Just now · 🌍 Public</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '50px' }}>
                    {content.trim() ? content : <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Facebook post preview appears here...</span>}
                  </div>

                  {media.length > 0 && (
                    <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', maxHeight: 200, border: '1px solid var(--glass-border)' }}>
                      {isVideoUrl(media[0]) ? (
                        <video src={mediaSrc(media[0])} controls style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }} />
                      ) : (
                        <img src={mediaSrc(media[0])} alt="Facebook attachment" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--glass-border)', marginTop: '12px', paddingTop: '10px', fontSize: '12px', color: 'var(--text-dim)' }}>
                    <span>👍 Like</span>
                    <span>💬 Comment</span>
                    <span>↪️ Share</span>
                  </div>
                </div>
              )}

              {/* Supported Platforms Notice */}
              <div style={{ marginTop: '18px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                💡 <b>Tip:</b> Attach images from your computer or choose directly from your <b>Creative Hub</b>. Posts are dispatched securely through official OAuth platform integrations.
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: AI AUTO-PILOT (Topic-Based Daily Post Setup)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'autopilot' && (
        <div>
          {/* Top Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                AI Topic Auto-Pilots
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Set your business topics once. Gemini AI writes fresh, relevant posts and publishes them daily to your selected platforms.
              </p>
            </div>

            <button
              onClick={() => setCreateModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-gradient)',
                color: '#fff',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(6, 101, 255, 0.35)',
              }}
            >
              <Plus size={16} /> Create New Topic Auto-Pilot
            </button>
          </div>

          {/* Topics Grid */}
          {loadingTopics ? (
            <SectionLoader message="Loading AI Auto-Post Schedules..." submessage="Fetching recurring topics, frequency rules & platform syncs" />
          ) : autoTopics.length === 0 ? (
            <GlassCard style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(6, 101, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Zap size={28} color="var(--accent-primary)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                No AI Auto-Post Schedules Configured Yet
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 20px auto' }}>
                Set topics related to your industry (e.g. "Tech Tips", "Real Estate Advice", "Fitness Motivation"). AI will automatically craft and publish daily posts on schedule!
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-gradient)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add Your First Topic
              </button>
            </GlassCard>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {autoTopics.map((topic) => (
                <GlassCard key={topic._id} style={{ padding: '20px' }}>
                  {/* Topic Title & Active Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{topic.topic}</span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: topic.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            color: topic.isActive ? 'var(--success)' : 'var(--text-dim)',
                            border: topic.isActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                          }}
                        >
                          {topic.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      {topic.context && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {topic.context}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleTopic(topic._id)}
                      title={topic.isActive ? 'Click to Pause' : 'Click to Activate'}
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-md)',
                        background: topic.isActive ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-elevated)',
                        border: '1px solid var(--glass-border)',
                        color: topic.isActive ? 'var(--success)' : 'var(--text-dim)',
                        cursor: 'pointer',
                      }}
                    >
                      {topic.isActive ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  </div>

                  {/* Platforms */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    {topic.platforms.map((p) => (
                      <span
                        key={p}
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--glass-border)',
                          color: p === 'linkedin' ? '#38bdf8' : p === 'twitter' ? '#7dd3fc' : p === 'instagram' ? '#f43f5e' : 'var(--accent-primary)',
                          textTransform: 'capitalize',
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Schedule Details */}
                  <div style={{ background: 'var(--bg-elevated)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Schedule:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {topic.frequency.replace('_', ' ').toUpperCase()} at {topic.preferredTime}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Tone & Language:</span>
                      <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                        {topic.tone} ({topic.language || 'English'})
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Posts Made:</span>
                      <strong style={{ color: 'var(--success)' }}>{topic.totalPostsGenerated || 0}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleTriggerTopic(topic._id)}
                      disabled={triggeringId === topic._id}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(6, 101, 255, 0.15)',
                        border: '1px solid rgba(6, 101, 255, 0.35)',
                        color: '#38bdf8',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: triggeringId === topic._id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      {triggeringId === topic._id ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                      {triggeringId === topic._id ? 'Posting...' : 'Trigger Now'}
                    </button>

                    <button
                      onClick={() => handlePreviewTopic(topic)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Eye size={13} /> Preview
                    </button>

                    <button
                      onClick={() => handleDeleteTopic(topic._id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: 'var(--error)',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: POST HISTORY & SCHEDULED QUEUE
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div>
          <GlassCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Published & Scheduled Posts ({posts.length})
                </h2>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Track all social media broadcasts and their live status across platforms.
                </p>
              </div>
              <button
                onClick={() => dispatch(fetchSocialPosts(activeWebsiteId || undefined))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
                No posts published or scheduled yet. Use the "Publish & Schedule" tab to post!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {posts.map((post: any, idx: number) => {
                  const isScheduled = post.status === 'scheduled';
                  const isPublished = post.status === 'published';

                  return (
                    <div
                      key={post._id || idx}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '16px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                              background: isPublished ? 'rgba(16, 185, 129, 0.2)' : isScheduled ? 'rgba(6, 101, 255, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: isPublished ? 'var(--success)' : isScheduled ? '#38bdf8' : 'var(--error)',
                            }}
                          >
                            {post.status}
                          </span>

                          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                            {post.scheduledFor
                              ? `Scheduled for: ${new Date(post.scheduledFor).toLocaleString()}`
                              : `Created: ${new Date(post.createdAt || Date.now()).toLocaleString()}`}
                          </span>
                        </div>

                        <div style={{ fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5', marginBottom: '10px' }}>
                          {post.content}
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          {(post.platforms || []).map((p: string) => (
                            <span
                              key={p}
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.06)',
                                color: '#38bdf8',
                                textTransform: 'capitalize',
                              }}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      {post.media?.length > 0 && (
                        <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--glass-border)', flexShrink: 0 }}>
                          <img src={mediaSrc(post.media[0])} alt="media thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: PICK FROM CREATIVE HUB (Existing Code Integration)
      ───────────────────────────────────────────────────────────── */}
      {creativePickerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'var(--glass-blur)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(6, 101, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Images size={20} color="var(--accent-primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Select from Creative Hub
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Pick any previously generated image to attach to this post.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreativePickerOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingHubCreatives ? (
              <SectionLoader message="Loading Creative Hub Assets..." submessage="Fetching your saved graphics and visual ad assets" />
            ) : hubCreatives.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
                <p>No creative assets found in your Creative Hub yet.</p>
                <button
                  onClick={() => {
                    setCreativePickerOpen(false);
                    navigate('/content/ai-workspace', { state: { promptOnly: true } });
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-gradient)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '8px',
                  }}
                >
                  Create in AI Creative Workspace
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', maxHeight: '450px', overflowY: 'auto' }}>
                {hubCreatives
                  .filter((c: any) => c.imageUrl || c.thumbnailUrl)
                  .map((c: any) => (
                    <div
                      key={c._id || c.id}
                      onClick={() => handleSelectHubCreative(c)}
                      style={{
                        position: 'relative',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--bg-elevated)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <img
                        src={mediaSrc(c.imageUrl || c.thumbnailUrl)}
                        alt={c.title || c.name || 'Creative'}
                        style={{ width: '100%', height: '110px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '6px 8px', fontSize: '11px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title || c.name || 'Creative Asset'}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
              <button
                onClick={() => {
                  setCreativePickerOpen(false);
                  navigate('/content/ai-workspace', { state: { promptOnly: true } });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <span>Generate new image in Workspace</span>
                <ExternalLink size={13} />
              </button>

              <button
                onClick={() => setCreativePickerOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: CREATE AUTO-POST SCHEDULE
      ───────────────────────────────────────────────────────────── */}
      {createModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'var(--glass-blur)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(6, 101, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={20} color="var(--accent-primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Create AI Auto-Pilot Schedule
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Tell Gemini AI what industry topic to post about, and when to publish.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTopic}>
              {/* Topic Field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Topic or Niche * (e.g. "Digital Marketing Growth Hacks", "Real Estate Advice")
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI tools for productivity & business scaling"
                  value={newTopic.topic}
                  onChange={(e) => setNewTopic({ ...newTopic, topic: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Context / Instructions Field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Special Instructions / Brand Context (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Mention our AI software Wheedle. Keep tone punchy and focus on practical steps."
                  value={newTopic.context}
                  onChange={(e) => setNewTopic({ ...newTopic, context: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Platforms */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Platforms to Auto-Post To *
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {platformsConfig.filter(p => p.id !== 'youtube').map((p) => {
                    const isSelected = newTopic.platforms.includes(p.id);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          const updated = isSelected
                            ? newTopic.platforms.filter((id) => id !== p.id)
                            : [...newTopic.platforms, p.id];
                          setNewTopic({ ...newTopic, platforms: updated });
                        }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '13px',
                          fontWeight: 600,
                          border: isSelected ? `1px solid ${p.color}` : '1px solid var(--glass-border)',
                          background: isSelected ? p.iconBg : 'var(--bg-elevated)',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tone & Frequency Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Tone of Voice
                  </label>
                  <select
                    value={newTopic.tone}
                    onChange={(e) => setNewTopic({ ...newTopic, tone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  >
                    <option value="professional">Professional & Insightful</option>
                    <option value="engaging">Engaging & Conversational</option>
                    <option value="viral">Viral Hook & Catchy</option>
                    <option value="inspirational">Motivational & Inspirational</option>
                    <option value="educational">Educational & Step-by-Step</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Frequency
                  </label>
                  <select
                    value={newTopic.frequency}
                    onChange={(e) => setNewTopic({ ...newTopic, frequency: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  >
                    <option value="daily">Once Daily</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="every_3_days">Every 3 Days</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              {/* Preferred Time & Language */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Preferred Daily Post Time
                  </label>
                  <input
                    type="time"
                    value={newTopic.preferredTime}
                    onChange={(e) => setNewTopic({ ...newTopic, preferredTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Language
                  </label>
                  <select
                    value={newTopic.language}
                    onChange={(e) => setNewTopic({ ...newTopic, language: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="hinglish">Hinglish</option>
                    <option value="spanish">Spanish</option>
                  </select>
                </div>
              </div>

              {/* Hashtags */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Mandatory Hashtags (Optional)
                </label>
                <input
                  type="text"
                  placeholder="#ai #marketing #growth"
                  value={newTopic.hashtags}
                  onChange={(e) => setNewTopic({ ...newTopic, hashtags: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Live AI Sample Tester Button */}
              <div style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={handleTestAiSampleInForm}
                  disabled={testingAiSample}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: testingAiSample ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Sparkles size={14} />
                  {testingAiSample ? 'Generating AI sample...' : 'Test AI Generation (Preview Sample)'}
                </button>

                {sampleAiResult && (
                  <div style={{ marginTop: '10px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {sampleAiResult}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--glass-border)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-gradient)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Save & Activate Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: PREVIEW POST CONTENT
      ───────────────────────────────────────────────────────────── */}
      {previewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'var(--glass-blur)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '550px',
              width: '100%',
              padding: '24px',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--accent-primary)" />
                AI Post Preview: {previewingTopicName}
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--glass-border)',
                fontSize: '14px',
                color: 'var(--text-primary)',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                maxHeight: '350px',
                overflowY: 'auto',
                marginBottom: '16px',
              }}
            >
              {previewTopicContent}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setPreviewModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-gradient)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPublisher;
