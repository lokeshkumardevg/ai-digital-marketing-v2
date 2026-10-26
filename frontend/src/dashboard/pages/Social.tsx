import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { Share2, Clock, Send, Image as ImageIcon, Link, X, Video, Sparkles, Zap } from 'lucide-react';
import {
  connectPlatform,
  disconnectPlatform,
  fetchConnections,
  fetchSocialPosts,
  publishPost,
  schedulePost,
} from '../../store/slices/socialSlice';
import type { SocialPlatformId } from '../../store/slices/socialSlice';
import { uploadSocialMedia, isVideoUrl, mediaSrc } from '../../services/socialMediaApi';
import { addNotification } from '../../store/slices/notificationSlice';
import { SmartTable } from '../components/SmartTable';
import type { AppDispatch, RootState } from '../../store';
import toast from 'react-hot-toast';

export const Social: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { posts, status, scheduling, publishing, connections, connecting, lastPublishResults } = useSelector(
    (state: RootState) => state.social,
  );
  const { activeWebsiteId } = useSelector((state: RootState) => state.workspace);
  const { user } = useSelector((state: RootState) => state.auth);

  const [content, setContent] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  // YouTube-only settings
  const [ytTitle, setYtTitle] = useState('');
  const [ytPrivacy, setYtPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [ytTags, setYtTags] = useState('');
  const [ytKids, setYtKids] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    dispatch(fetchConnections())
      .unwrap()
      .then((connected) => {
        // pre-select connected text/image platforms. YouTube is left out on purpose: it needs a video,
        // so the user picks it only when they attach one. (Also skips non-platform keys like youtubeChannel.)
        const initialSelection = Object.entries(connected)
          .filter(([platform, isConnected]) => ['linkedin', 'twitter', 'facebook', 'instagram'].includes(platform) && Boolean(isConnected))
          .map(([platform]) => platform);
        setSelectedPlatforms(initialSelection);
      })
      .catch(() => undefined);
    dispatch(fetchSocialPosts(activeWebsiteId || undefined));
  }, [dispatch, activeWebsiteId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusValue = params.get('status');
    const platform = params.get('social_connect');
    if (!statusValue || !platform) {
      return;
    }
    if (statusValue === 'success') {
      toast.success(`${platform} connected successfully.`);
      dispatch(fetchConnections());
    } else {
      toast.error(`${platform} connection failed.`);
    }
    params.delete('status');
    params.delete('social_connect');
    const next = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${next ? `?${next}` : ''}`);
  }, [dispatch]);

  const platformCards = [
    { id: 'linkedin', label: 'LinkedIn', badge: 'in', color: '#0077b5' },
    { id: 'twitter', label: 'Twitter / X', badge: 'X', color: '#1da1f2' },
    { id: 'facebook', label: 'Facebook', badge: 'f', color: '#1877f2' },
    { id: 'instagram', label: 'Instagram', badge: 'ig', color: '#ec4899' },
    { id: 'youtube', label: 'YouTube', badge: '▶', color: '#ff0000' },
  ];

  const [linkedinStatus, setLinkedinStatus] = useState<any>(null);
  const [checkingLinkedin, setCheckingLinkedin] = useState(false);

  const handleConnect = async (platform: SocialPlatformId) => {
    try {
      const result = await dispatch(connectPlatform(platform)).unwrap();
      window.location.assign(result.url);
    } catch {
      toast.error(`Unable to start ${platform} connection.`);
    }
  };

  const handleDisconnect = async (platform: SocialPlatformId) => {
    await dispatch(disconnectPlatform(platform));
    if (platform === 'linkedin') setLinkedinStatus(null);
    toast.success(`${platform} disconnected.`);
  };

  const checkLinkedinStatus = async () => {
    const uid = user?._id || user?.id;
    if (!uid) { toast.error('Please log in first.'); return; }
    setCheckingLinkedin(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_BASE}/campaign/linkedin/status/${uid}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token') || ''}`
        }
      });
      const data = await res.json();
      setLinkedinStatus(data);
      if (data.readyToPublish) {
        toast.success(`✅ LinkedIn OK! Logged in as: ${data.liveUserInfo?.name || 'User'}`);
      } else if (data.liveError) {
        toast.error(`❌ LinkedIn token error: ${data.liveError}`);
      } else if (!data.hasUrn) {
        toast.error('❌ LinkedIn URN missing. Disconnect then reconnect LinkedIn!');
      } else {
        toast.error('❌ LinkedIn not ready to publish.');
      }
    } catch (e: any) {
      toast.error(`Status check failed: ${e.message}`);
    } finally {
      setCheckingLinkedin(false);
    }
  };

  const togglePlatform = (platform: string) => {
    if (!connections[platform as keyof typeof connections]) {
      return;
    }
    setSelectedPlatforms((current) =>
      current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform],
    );
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = ''; // lets the same file be picked again
    if (!files.length) return;

    for (const file of files) {
      const video = file.type.startsWith('video/');
      if (video && media.some(isVideoUrl)) {
        toast.error('Ek post mein sirf ek video attach ho sakti hai.');
        continue;
      }
      try {
        setUploadPercent(0);
        const uploaded = await uploadSocialMedia(file, setUploadPercent);
        setMedia((current) => [...current, uploaded.url]);
      } catch (err: any) {
        const msg = err?.response?.data?.message;
        toast.error(`${file.name}: ${Array.isArray(msg) ? msg.join(', ') : msg || 'upload fail ho gaya.'}`);
      } finally {
        setUploadPercent(null);
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setMedia((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const handleEditImage = () => {
    toast('Image editor is coming soon.');
  };

  const handlePost = async () => {
    if (!content.trim()) return toast.error('Post content cannot be empty.');
    if (!selectedPlatforms.length) return toast.error('Select at least one connected platform.');
    if (uploadPercent !== null) return toast.error('Upload poora hone do, phir post karo.');

    const hasVideo = media.some(isVideoUrl);
    const toYoutube = selectedPlatforms.includes('youtube');
    if (toYoutube && !hasVideo) return toast.error('YouTube par post karne ke liye ek video attach karo.');
    if (toYoutube && !(ytTitle.trim() || content.trim())) return toast.error('YouTube video ka title likho.');
    if (selectedPlatforms.includes('instagram') && !media.some((m) => !isVideoUrl(m))) {
      return toast.error('Instagram ke liye ek image attach karo.');
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
              madeForKids: ytKids,
            },
          }
        : {}),
      workspaceId: activeWebsiteId || 'default',
    };

    try {
      const promise = scheduledTime
        ? dispatch(
            schedulePost({
              ...payload,
              scheduledFor: new Date(scheduledTime).toISOString(),
            }),
          ).unwrap()
        : dispatch(publishPost(payload)).unwrap();

      toast.promise(promise, {
        loading: scheduledTime ? 'Scheduling post...' : 'Publishing post...',
        success: scheduledTime ? 'Post scheduled successfully!' : 'Post published.',
        error: scheduledTime ? 'Failed to schedule post.' : 'Failed to publish post.',
      });

      await promise;
      dispatch(fetchSocialPosts(activeWebsiteId || undefined));
      dispatch(fetchConnections());
      dispatch(addNotification({
        id: Date.now().toString(),
        title: scheduledTime ? 'Social Post Scheduled' : 'Social Post Published',
        message: scheduledTime
          ? 'Your post is queued and will publish automatically.'
          : `Publish attempt completed on ${selectedPlatforms.length} platform(s).`,
        type: 'success',
        time: new Date().toISOString(),
        read: false,
      }));
      setContent('');
      setMedia([]);
      setYtTitle('');
      setYtTags('');
      setScheduledTime('');
      setShowDatePicker(false);
      setPreviewOpen(false);
    } catch (err) {
      console.error(err);
      dispatch(addNotification({
        id: Date.now().toString(),
        title: 'Social Broadcast Failed',
        message: 'Publishing failed. Review platform connection states.',
        type: 'error',
        time: new Date().toISOString(),
        read: false,
      }));
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
          Social <span className="text-gradient">Hub</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Connect channels, publish instantly, and schedule future social drops.</p>
      </div>

      {/* NEW FEATURE HIGHLIGHT BANNER */}
      <div
        className="glass-card"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(6, 101, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="var(--accent-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Multi-Platform Post Publisher & AI Auto-Pilot
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', background: 'var(--accent-primary)', color: '#fff', fontWeight: 800 }}>NEW</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Want to auto-post daily on your industry topics with AI or broadcast simultaneously to all channels?
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/post-publisher')}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            color: '#fff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(6, 101, 255, 0.35)',
          }}
        >
          <Sparkles size={15} /> Launch Post & Auto-Pilot
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <GlassCard>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)'}}>
              <Share2 size={20} color="#6366f1" /> Platform Connections
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Connect OAuth accounts and choose destinations for each post.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-primary)' }}>
              {platformCards.map((platform) => (
                <div
                  key={platform.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: selectedPlatforms.includes(platform.id) ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: selectedPlatforms.includes(platform.id)
                      ? '1px solid rgba(99, 102, 241, 0.5)'
                      : '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    cursor: connections[platform.id as keyof typeof connections] ? 'pointer' : 'default',
                  }}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: platform.color,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                      }}
                    >
                      {platform.badge}
                    </div>
                    <span style={{ fontWeight: 600 }}>{platform.label}</span>
                  </div>
                  {connections[platform.id as keyof typeof connections] ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--success)',
                          fontWeight: 600,
                          padding: '4px 12px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: '16px',
                        }}
                      >
                        Connected
                      </span>
                      {platform.id === 'linkedin' && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.72rem', background: 'rgba(0,119,181,0.1)', color: '#0077b5', border: '1px solid #0077b5' }}
                          onClick={(event) => { event.stopPropagation(); checkLinkedinStatus(); }}
                          disabled={checkingLinkedin}
                        >
                          {checkingLinkedin ? 'Checking...' : '🔍 Check Status'}
                        </button>
                      )}
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem'}}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDisconnect(platform.id as SocialPlatformId);
                        }}
                        title="Disconnect"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleConnect(platform.id as SocialPlatformId);
                      }}
                      className="btn-primary"
                      style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                      disabled={connecting[platform.id]}
                    >
                      {connecting[platform.id] ? 'Linking...' : 'Link Account'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* LinkedIn Status Debug Panel */}
          {linkedinStatus && (
            <GlassCard style={{ border: linkedinStatus.readyToPublish ? '1.5px solid #10b981' : '1.5px solid #f59e0b', background: linkedinStatus.readyToPublish ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.05)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                {linkedinStatus.readyToPublish ? '✅' : '⚠️'} LinkedIn Status Check
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                <div>Access Token: <strong style={{ color: linkedinStatus.hasToken ? '#10b981' : '#ef4444' }}>{linkedinStatus.hasToken ? '✅ Present' : '❌ Missing'}</strong></div>
                <div>Person URN: <strong style={{ color: linkedinStatus.hasUrn ? '#10b981' : '#ef4444' }}>{linkedinStatus.hasUrn ? `✅ ${linkedinStatus.urnValue}` : '❌ Missing'}</strong></div>
                <div>Token Valid: <strong style={{ color: linkedinStatus.tokenValid ? '#10b981' : '#ef4444' }}>{linkedinStatus.tokenValid ? '✅ Yes' : '❌ No'}</strong></div>
                <div>Logged in as: <strong>{linkedinStatus.liveUserInfo?.name || '—'}</strong></div>
              </div>
              {linkedinStatus.liveError && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: '0.8rem', color: '#ef4444' }}>
                  Error: {linkedinStatus.liveError}
                </div>
              )}
              {!linkedinStatus.readyToPublish && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, fontSize: '0.82rem', color: '#f59e0b', lineHeight: 1.6 }}>
                  <strong>Action Required:</strong> Please click <strong>✕ Disconnect</strong> on LinkedIn above, then click <strong>Link Account</strong> again to reconnect. This will save your correct account details.
                </div>
              )}
            </GlassCard>
          )}

          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={20} color="#0665ff" />
                 Post Composer
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Create one message and deliver to selected connected platforms.
              </p>
            </div>

            <div className="input-group">
              <textarea
                rows={6}
                className="input-field"
                placeholder="What do you want to share with your audience?..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={scheduling || publishing}
              ></textarea>
            </div>

            {media.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                {media.map((url, index) => (
                  <div key={`${url}-${index}`} style={{ position: 'relative' }}>
                    {isVideoUrl(url) ? (
                      <video
                        src={mediaSrc(url)}
                        muted
                        preload="metadata"
                        style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', background: '#000' }}
                      />
                    ) : (
                      <img
                        src={mediaSrc(url)}
                        alt={`uploaded-${index}`}
                        style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        padding: '6px',
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0))',
                        borderRadius: '8px',
                      }}
                    >
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 6px', fontSize: '0.68rem' }}
                        onClick={handleEditImage}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 6px', fontSize: '0.68rem', color: '#ef4444' }}
                        onClick={() => handleRemoveImage(index)}
                        type="button"
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {uploadPercent !== null && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Uploading… {uploadPercent}%
                <div style={{ height: 4, borderRadius: 4, background: 'var(--glass-border)', marginTop: 6 }}>
                  <div style={{ width: `${uploadPercent}%`, height: '100%', borderRadius: 4, background: 'var(--accent-primary)', transition: 'width .2s' }} />
                </div>
              </div>
            )}

            {media.some(isVideoUrl) && selectedPlatforms.some((p) => p !== 'youtube') && (
              <div style={{ fontSize: '0.78rem', color: 'var(--warning, #f59e0b)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 10px' }}>
                Video abhi sirf <strong>YouTube</strong> par jayegi. LinkedIn, X, Facebook aur Instagram par sirf image post hoti hai.
              </div>
            )}

            {selectedPlatforms.includes('youtube') && (
              <div style={{ border: '1px solid var(--glass-border)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,0,0,0.04)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Video size={16} color="#ff0000" /> YouTube settings
                  {connections.youtubeChannel && <span style={{ fontWeight: 500, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>· {connections.youtubeChannel}</span>}
                </div>
                <input
                  className="input-field"
                  placeholder="Video title (max 100 characters)"
                  maxLength={100}
                  value={ytTitle}
                  onChange={(e) => setYtTitle(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <select className="input-field" style={{ flex: 1, minWidth: 140 }} value={ytPrivacy} onChange={(e) => setYtPrivacy(e.target.value as 'public' | 'unlisted' | 'private')} aria-label="Visibility">
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                  <input className="input-field" style={{ flex: 2, minWidth: 160 }} placeholder="Tags, comma separated" value={ytTags} onChange={(e) => setYtTags(e.target.value)} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={ytKids} onChange={(e) => setYtKids(e.target.checked)} />
                  Ye video bachon ke liye bani hai (Made for kids)
                </label>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Post ka text video ka description banega. Agar tumhare Google API project ka YouTube audit pass nahi hua hai, to YouTube video ko apne aap <strong>private</strong> rakhta hai.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label className="btn-primary" style={{ padding: '8px 12px', cursor: uploadPercent === null ? 'pointer' : 'wait', opacity: uploadPercent === null ? 1 : 0.6 }} title="Attach image or video">
                  <ImageIcon size={18} />
                  <input type="file" accept="image/*,video/*" multiple onChange={handleMediaUpload} disabled={uploadPercent !== null} style={{ display: 'none' }} />
                </label>
                <button
                  className="btn-primary"
                  style={{
                    padding: '8px 12px',
                    background: showDatePicker ? 'var(--accent-primary)' : '',
                    color: showDatePicker ? '#fff' : '',
                    border: showDatePicker ? 'none' : '',
                  }}
                  title="Schedule Later"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <Clock size={18} />
                </button>
                <button
                  className="btn-primary"
                  style={{ padding: '8px 12px' }}
                  title="Preview Post"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Link size={18} />
                </button>

                {showDatePicker && (
                  <input
                    type="datetime-local"
                    className="input-field"
                    style={{ padding: '6px 12px', height: 'auto', background: 'var(--bg-card)', fontSize: '0.85rem' }}
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                )}
              </div>
              <button
                className="btn-primary"
                onClick={handlePost}
                disabled={scheduling || publishing}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {scheduling || publishing ? (
                  'Processing...'
                ) : (
                  <>
                    <Send size={16} /> {scheduledTime ? 'Schedule Post' : 'Publish Now'}
                  </>
                )}
              </button>
            </div>

            {Object.keys(lastPublishResults).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(lastPublishResults).map(([platform, result]) => (
                  <div
                    key={platform}
                    style={{
                      borderRadius: '8px',
                      padding: '8px 10px',
                      background: result.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <strong style={{ textTransform: 'capitalize' }}>{platform}</strong>:{' '}
                    {result.success ? (
                      <>
                        Published{' '}
                        {result.url ? (
                          <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                            View post
                          </a>
                        ) : (
                          `(ID: ${result.postId || 'ok'})`
                        )}
                        {result.note && <div style={{ marginTop: 4, opacity: 0.85 }}>{result.note}</div>}
                      </>
                    ) : (
                      result.error || 'Failed'
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowX: 'auto' }}>
          {status === 'loading' && posts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Syncing social feeds...</div>
          ) : (
            <SmartTable
              title="Live Network Activity"
              searchPlaceholder="Search posts..."
              columns={[
                {
                  key: 'platforms',
                  label: 'Platforms',
                  sortable: false,
                  render: (row) => (
                    <span style={{ fontWeight: 600, color: '#0665ff' }}>
                      {(row.platforms || []).join(', ') || 'none'}
                    </span>
                  ),
                },
                {
                  key: 'content',
                  label: 'Post Content',
                  render: (row) => (
                    <div
                      style={{
                        fontSize: '0.85rem',
                        maxWidth: '320px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {row.content}
                    </div>
                  ),
                },
                {
                  key: 'scheduledFor',
                  label: 'Execution Time',
                  sortable: true,
                  render: (row) => (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {row.scheduledFor
                        ? new Date(row.scheduledFor).toLocaleString()
                        : new Date(row.createdAt).toLocaleString()}
                    </div>
                  ),
                },
                {
                  key: 'status',
                  label: 'Status',
                  sortable: true,
                  render: (row) => (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: row.status === 'scheduled' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: row.status === 'scheduled' ? 'var(--warning)' : 'var(--success)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {row.status}
                    </span>
                  ),
                },
              ]}
              data={posts}
              actions={() => (
                <button className="btn btn-primary" style={{ padding: '6px' }}>
                  <Share2 size={14} />
                </button>
              )}
            />
          )}
        </div>
      </div>

      {previewOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            style={{
              width: 'min(560px, 95vw)',
              background: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid var(--glass-border)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 style={{ marginBottom: '12px' }}>Post Preview</h3>
            <p style={{ marginBottom: '12px', whiteSpace: 'pre-wrap' }}>{content || 'No content yet.'}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Platforms: {selectedPlatforms.join(', ') || 'none selected'}
            </p>
            {media.length > 0 && (isVideoUrl(media[0]) ? (
              <video src={mediaSrc(media[0])} controls style={{ width: '100%', maxHeight: '280px', borderRadius: '10px', background: '#000' }} />
            ) : (
              <img
                src={mediaSrc(media[0])}
                alt="preview"
                style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '10px' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
