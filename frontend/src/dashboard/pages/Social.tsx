import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { Share2, Clock, Send, Image as ImageIcon, Link, X } from 'lucide-react';
import {
  connectPlatform,
  disconnectPlatform,
  fetchConnections,
  fetchSocialPosts,
  publishPost,
  schedulePost,
} from '../../store/slices/socialSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { SmartTable } from '../components/SmartTable';
import type { AppDispatch, RootState } from '../../store';
import toast from 'react-hot-toast';

export const Social: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, status, scheduling, publishing, connections, connecting, lastPublishResults } = useSelector(
    (state: RootState) => state.social,
  );
  const { activeWebsiteId } = useSelector((state: RootState) => state.workspace);

  const [content, setContent] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    dispatch(fetchConnections())
      .unwrap()
      .then((connected) => {
        const initialSelection = Object.entries(connected)
          .filter(([, isConnected]) => isConnected)
          .map(([platform]) => platform);
        setSelectedPlatforms(initialSelection);
      })
      .catch(() => undefined);
    dispatch(fetchSocialPosts(activeWebsiteId));
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
  ];

  const handleConnect = async (platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram') => {
    try {
      const result = await dispatch(connectPlatform(platform)).unwrap();
      window.location.assign(result.url);
    } catch {
      toast.error(`Unable to start ${platform} connection.`);
    }
  };

  const handleDisconnect = async (platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram') => {
    await dispatch(disconnectPlatform(platform));
    toast.success(`${platform} disconnected.`);
  };

  const togglePlatform = (platform: string) => {
    if (!connections[platform as keyof typeof connections]) {
      return;
    }
    setSelectedPlatforms((current) =>
      current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform],
    );
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        }),
    );

    Promise.all(readers)
      .then((urls) => setMedia((current) => [...current, ...urls]))
      .catch(() => toast.error('Could not load one or more images.'));
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

    const payload = {
      content,
      media,
      platforms: selectedPlatforms,
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
      dispatch(fetchSocialPosts(activeWebsiteId));
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <GlassCard>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc'}}>
              <Share2 size={20} color="#6366f1" /> Platform Connections
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Connect OAuth accounts and choose destinations for each post.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#f8fafc' }}>
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
                        color: '#fff',
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
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem'}}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDisconnect(platform.id as 'linkedin' | 'twitter' | 'facebook' | 'instagram');
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
                        handleConnect(platform.id as 'linkedin' | 'twitter' | 'facebook' | 'instagram');
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
                    <img
                      src={url}
                      alt={`uploaded-${index}`}
                      style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                    />
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label className="btn-primary" style={{ padding: '8px 12px', cursor: 'pointer' }} title="Attach Image">
                  <ImageIcon size={18} />
                  <input type="file" accept="image/*" multiple onChange={handleMediaUpload} style={{ display: 'none' }} />
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
                    style={{ padding: '6px 12px', height: 'auto', background: 'rgba(255,255,255,0.05)', fontSize: '0.85rem' }}
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
                {Object.entries(lastPublishResults as Record<string, { success: boolean; error?: string; postId?: string }>).map(([platform, result]) => (
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
                    {result.success ? `Published (ID: ${result.postId || 'ok'})` : result.error || 'Failed'}
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
            {media.length > 0 && (
              <img
                src={media[0]}
                alt="preview"
                style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '10px' }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
