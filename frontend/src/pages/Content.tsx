import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { 
  FileText, Share2, Globe, FileCode2, Clock, 
  ThumbsUp, BarChart2, Hash, ArrowUpRight
} from 'lucide-react';
import { fetchContent, createContent } from '../store/slices/contentSlice';
import { addNotification } from '../store/slices/notificationSlice';
import type { AppDispatch } from '../store';
import toast from 'react-hot-toast';

export const Content: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: contents, status, generating } = useSelector((state: any) => state.content);

  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('seo-blog');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchContent());
    }
  }, [status, dispatch]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Content Topic is strictly required.');
      return;
    }

    try {
      const promise = dispatch(createContent({ topic, format })).unwrap();
      toast.promise(promise, {
        loading: 'Generating content...',
        success: 'Content created successfully!',
        error: 'Failed to generate content.'
      });
      await promise;
      dispatch(addNotification({ id: Date.now().toString(), title: 'AI Content Generated', message: `A new ${format.replace('-', ' ')} about "${topic.substring(0,30)}..." is ready for review.`, type: 'success', time: new Date().toISOString(), read: false }));
      setTopic('');
    } catch (err) {
      console.error(err);
      dispatch(addNotification({ id: Date.now().toString(), title: 'Generation Error', message: `AI Orchestrator failed compiling topic.`, type: 'error', time: new Date().toISOString(), read: false }));
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            <span className="text-gradient">Content Generator</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Create blog posts and social media content using AI.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1.2fr) 2fr', gap: '24px' }}>
        
        {/* Creator Panel */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content', position: 'sticky', top: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode2 size={20} color="var(--accent-primary)" /> Content Settings
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enter a topic and the AI will write the content for you.</p>
          </div>

          <div className="input-group">
            <label>Topic</label>
            <textarea 
              rows={3} 
              className="input-field" 
              placeholder="e.g. 5 Reasons Why Graph Databases Outperform SQL in 2026..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={generating}
            />
          </div>

          <div className="input-group">
            <label>Content Format</label>
            <select className="input-field" value={format} onChange={(e) => setFormat(e.target.value)} disabled={generating}>
              <option value="seo-blog">SEO Optimized Blog Post</option>
              <option value="linkedin-post">LinkedIn Viral Thought Leadership</option>
              <option value="twitter-thread">Twitter Thread Hook & Body</option>
            </select>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleGenerate} 
            disabled={generating}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            {generating ? 'Generating content...' : 'Generate Content'}
          </button>
        </GlassCard>

        {/* Content Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {status === 'loading' && contents.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading content...</div>
          ) : contents.length === 0 ? (
             <GlassCard style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                <h3>No Content Generated Yet</h3>
                <p>Use the generation node to start building out your organic pipeline.</p>
             </GlassCard>
          ) : (
            contents.map((content: any) => (
              <GlassCard key={content._id} className="animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--accent-primary)' }}>
                      {content.contentType === 'Blog Post' ? <Globe size={20} /> : <Share2 size={20} />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', textTransform: 'capitalize' }}>
                        {(content.title || '').substring(0, 45)}{(content.title || '').length > 45 ? '...' : ''}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(content.createdAt).toLocaleDateString()}</span>
                        <span style={{ textTransform: 'uppercase', fontWeight: 600, color: 'var(--info)' }}>{(content.contentType || 'social').replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {content.status === 'draft' && (
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Publish <ArrowUpRight size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                    </button>
                  )}
                  {content.status === 'published' && (
                     <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '12px', border: '1px solid var(--success)', fontWeight: 600 }}>
                        PUBLISHED
                     </div>
                  )}
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{ 
                    background: 'var(--bg-secondary)', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--glass-border)',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    color: 'var(--text-primary)',
                    maxHeight: '250px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {content.body}
                  </div>
                </div>

                {content.seoMetrics && (
                  <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--glass-border)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}><BarChart2 size={12} /> Readability</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{content.seoMetrics?.readabilityScore || 85}/100</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}><Hash size={12} /> Target SEO Rank</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)' }}>Top {content.seoMetrics?.estimatedRank || 3}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}><ThumbsUp size={12} /> Keyword Density</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--info)' }}>
                         {content.seoMetrics?.keywordDensity || 2}% Organic
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
