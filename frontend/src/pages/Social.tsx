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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  
  // Dummy state for connected networks
  const [connectedNetworks, setConnectedNetworks] = useState({
    linkedin: false,
    twitter: true,
    facebook: false
  });

  const handleConnect = (network: 'linkedin' | 'twitter' | 'facebook') => {
    // In a real app, this would redirect to backend OAuth routes: window.location.href = `/api/auth/${network}`
    toast.success(`Redirecting to ${network.charAt(0).toUpperCase() + network.slice(1)} authorization gateway...`);
    setTimeout(() => {
      setConnectedNetworks(prev => ({ ...prev, [network]: true }));
      toast.success(`${network.charAt(0).toUpperCase() + network.slice(1)} Successfully Linked!`);
    }, 1500);
  };

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
        workspaceId: activeWebsiteId,
        scheduledFor: scheduledTime || undefined
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
      setScheduledTime('');
      setShowDatePicker(false);
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
        
        {/* Composer and Connections Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Network Connections */}
          <GlassCard>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Share2 size={20} color="var(--accent-primary)" /> Linked Networks
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Authorize AI agents to post directly to your social endpoints.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* LinkedIn */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#0077b5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>in</div>
                  <span style={{ fontWeight: 600 }}>LinkedIn Profile</span>
                </div>
                {connectedNetworks.linkedin ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px' }}>Connected</span>
                ) : (
                  <button onClick={() => handleConnect('linkedin')} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Link Account</button>
                )}
              </div>
              
              {/* Twitter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#1da1f2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>X</div>
                  <span style={{ fontWeight: 600 }}>Twitter / X</span>
                </div>
                {connectedNetworks.twitter ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px' }}>Connected</span>
                ) : (
                  <button onClick={() => handleConnect('twitter')} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Link Account</button>
                )}
              </div>

              {/* Facebook */}
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#1877f2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>f</div>
                  <span style={{ fontWeight: 600 }}>Facebook Page</span>
                </div>
                {connectedNetworks.facebook ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px' }}>Connected</span>
                ) : (
                  <button onClick={() => handleConnect('facebook')} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Link Account</button>
                )}
              </div>
            </div>
          </GlassCard>

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
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button className="btn-secondary" style={{ padding: '8px 12px' }} title="Attach Image"><ImageIcon size={18} /></button>
              <button 
                className="btn-secondary" 
                style={{ 
                  padding: '8px 12px', 
                  background: showDatePicker ? 'var(--accent-primary)' : '', 
                  color: showDatePicker ? '#fff' : '', 
                  border: showDatePicker ? 'none' : '' 
                }} 
                title="Schedule Later" 
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Clock size={18} />
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
              className="btn btn-primary" 
              onClick={handlePost} 
              disabled={scheduling}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {scheduling ? 'Broadcasting...' : <><Send size={16} /> {scheduledTime ? 'Schedule Post' : 'Publish Now'}</>}
            </button>
          </div>
        </GlassCard>
        </div>

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
