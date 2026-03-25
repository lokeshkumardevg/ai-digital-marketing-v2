import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { Activity, Zap } from 'lucide-react';
import { fetchAudiences, createAudience } from '../store/slices/crmSlice';
import { addNotification } from '../store/slices/notificationSlice';
import { SmartTable } from '../components/SmartTable';
import type { AppDispatch } from '../store';
import toast from 'react-hot-toast';

export const Crm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { audiences, status, generating } = useSelector((state: any) => state.crm);
  const { websites, activeWebsiteId } = useSelector((state: any) => state.workspace);
  
  const activeWebsite = websites.find((w: any) => w.id === activeWebsiteId);
  
  const [goalInput, setGoalInput] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAudiences());
    }
  }, [status, dispatch]);

  const handleGenerate = async () => {
    if (!goalInput.trim()) {
      toast.error('Please enter a marketing goal.', { icon: '⚠️' });
      return;
    }

    try {
      const promise = dispatch(createAudience(goalInput)).unwrap();
      toast.promise(promise, {
        loading: 'Generating audience...',
        success: 'Audience segment created successfully!',
        error: 'Failed to generate audience.'
      });
      await promise;
      dispatch(addNotification({ id: Date.now().toString(), title: 'Demographics Modeled', message: `Quantum Segment generated for "${goalInput.substring(0,30)}..."`, type: 'success', time: new Date().toISOString(), read: false }));
      setGoalInput('');
    } catch (err) {
      console.error(err);
      dispatch(addNotification({ id: Date.now().toString(), title: 'Generation Failed', message: `Audience AI generation timeout.`, type: 'error', time: new Date().toISOString(), read: false }));
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Target <span className="text-gradient">Audience Builder</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Build target audiences using AI for {activeWebsite?.name || 'your brand'}.</p>
        </div>
        <button className="btn btn-secondary">
          <Activity size={18} style={{ marginRight: '8px' }} /> Synchronize Data
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
        {/* Input Interface */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="var(--accent-primary)" /> AI Audience Builder
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Describe your target customer. The AI will generate demographics, interests, and pain points.</p>
          </div>

          <div className="input-group">
            <label>Marketing Goal</label>
            <textarea 
              rows={4} 
              className="input-field" 
              placeholder="e.g. Generate high-ticket leads for a SaaS CRM targeting real estate brokers in North America..."
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              disabled={generating}
            />
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleGenerate}
            disabled={generating}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            {generating ? (
              <><Activity size={18} className="animate-fade-in" style={{ animationIterationCount: 'infinite' }} /> Creating...</>
            ) : 'Create Audience'}
          </button>
        </GlassCard>

        {/* Audience List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowX: 'auto' }}>
          {status === 'loading' && audiences.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              <Activity size={32} className="animate-fade-in" style={{ animationIterationCount: 'infinite' }} />
            </div>
          ) : (
            <SmartTable 
              title="Target Segments"
              searchPlaceholder="Search audiences..."
              columns={[
                { 
                  key: 'name', 
                  label: 'Segment Name', 
                  sortable: true,
                  render: (row) => (
                    <div>
                       <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{(row.sourceGoal || row.description || 'Global Region').substring(0,40)}...</div>
                    </div>
                  )
                },
                { 
                  key: 'demographics', 
                  label: 'Demographics',
                  render: (row) => (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                       {row.generatedData?.demographics || row.description || 'Not set'}
                    </div>
                  )
                },
                {
                  key: 'interests',
                  label: 'Interests',
                  render: (row) => (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                       {row.generatedData?.interests || row.targetingCriteria?.interests?.join(', ') || 'Not set'}
                    </div>
                  )
                },
                {
                   key: 'size',
                   label: 'Est. Size',
                   sortable: true,
                   render: (row) => (
                    <div style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, width: 'fit-content' }}>
                       {row.estimatedSize ? (row.estimatedSize / 1000).toFixed(0) + 'k' : '850k'}
                    </div>
                   )
                }
              ]}
              data={audiences}
              actions={() => <button className="btn btn-secondary" style={{ padding: '6px' }}><Zap size={14} /></button>}
            />
          )}
        </div>
      </div>
    </div>
  );
};
