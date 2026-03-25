import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { Share2, Clock, Send, Image as ImageIcon } from 'lucide-react';
import { fetchSocialPosts, scheduleSocialPost } from '../store/slices/socialSlice';
import { addNotification } from '../store/slices/notificationSlice';
import { SmartTable } from '../components/SmartTable';
import type { AppDispatch } from '../store';
import toast from 'react-hot-toast';

export const Social: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, status, scheduling } = useSelector((state: any) => state.social);
  const { activeWebsiteId } = useSelector((state: any) => state.workspace);
  
  const [content, setContent] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSocialPosts(activeWebsiteId));
    }
  }, [status, dispatch, activeWebsiteId]);

  const handlePost = async () => {
    if (!content.trim()) return toast.error('Post content cannot be empty.');

    try {
      const promise = dispatch(scheduleSocialPost({ 
        content, 
        workspaceId: activeWebsiteId 
      })).unwrap();

      toast.promise(promise, {
        loading: 'Agents scheduling content to Networks...',
        success: 'Post scheduled successfully!',
        error: 'Failed to schedule post.'
      });

      await promise;
      dispatch(addNotification({ 
        id: Date.now().toString(), 
        title: 'Social Stream Active', 
        message: `Cross-network broadcast successfully queued via AI agents.`, 
        type: 'success', 
        time: new Date().toISOString(), 
        read: false 
      }));
      setContent('');
    } catch (err) {
      console.error(err);
      dispatch(addNotification({ 
        id: Date.now().toString(), 
        title: 'Social Broadcast Failed', 
        message: `Network API handshake timeout.`, 
        type: 'error', 
        time: new Date().toISOString(), 
        read: false 
      }));
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
          Social <span className="text-gradient">Auto-Posting</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Draft and sync social updates across all platforms simultaneously.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '24px' }}>
        
        {/* Composer */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Share2 size={20} color="var(--accent-primary)" /> Network Composer
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Type your message below. AI Agents will distribute and optimize the text limits per platform.</p>
          </div>

          <div className="input-group">
            <textarea 
              rows={6} 
              className="input-field" 
              placeholder="What do you want to share with your audience?..."
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={scheduling}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" style={{ padding: '8px 12px' }} title="Attach Image"><ImageIcon size={18} /></button>
              <button className="btn-secondary" style={{ padding: '8px 12px' }} title="Schedule Later"><Clock size={18} /></button>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handlePost} 
              disabled={scheduling}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {scheduling ? 'Broadcasting...' : <><Send size={16} /> Publish Now</>}
            </button>
          </div>
        </GlassCard>

        {/* Recent & Upcoming Posts Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowX: 'auto' }}>
           {status === 'loading' && posts.length === 0 ? (
             <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Syncing social feeds...</div>
           ) : (
             <SmartTable 
               title="Live Network Activity"
               searchPlaceholder="Search posts..."
               columns={[
                 {
                   key: 'platform',
                   label: 'Network',
                   sortable: true,
                   render: (row) => <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{row.platform || 'TWITTER'}</span>
                 },
                 {
                   key: 'content',
                   label: 'Post Content',
                   render: (row) => <div style={{ fontSize: '0.85rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.content}</div>
                 },
                 {
                   key: 'time',
                   label: 'Timestamp',
                   sortable: true,
                   render: (row) => <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.time || new Date(row.createdAt).toLocaleTimeString()}</div>
                 },
                 {
                   key: 'status',
                   label: 'Status',
                   sortable: true,
                   render: (row) => (
                    <span style={{ 
                      fontSize: '0.7rem', fontWeight: 700, 
                      background: row.status === 'Scheduled' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                      color: row.status === 'Scheduled' ? 'var(--warning)' : 'var(--success)', 
                      padding: '4px 10px', borderRadius: '12px' 
                    }}>
                      {row.status.toUpperCase()}
                    </span>
                   )
                 }
               ]}
               data={posts}
               actions={() => <button className="btn btn-secondary" style={{ padding: '6px' }}><Share2 size={14} /></button>}
             />
           )}
        </div>

      </div>
    </div>
  );
};
