import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  MessageCircle, 
  Mail, 
  Send, 
  CheckCircle,
  Users,
  Smartphone,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Messaging: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>('whatsapp');
  const [message, setMessage] = useState('');

  const demos = activeTab === 'whatsapp' ? [
    { id: 1, to: '+1 234 567 890', status: 'delivered', time: '2m ago', content: 'Hey! Your cart is waiting. Use code AI20 for 20% off.' },
    { id: 2, to: '+1 987 654 321', status: 'read', time: '1h ago', content: 'Your order #882 has been shipped! Tracking: WH-992' }
  ] : [
    { id: 1, to: 'alex@growth.com', status: 'opened', time: '12m ago', content: 'Subject: Unlock 10x ROI with our new AI Segment Modeling...' },
    { id: 2, to: 'sarah@tech.io', status: 'sent', time: '5h ago', content: 'Subject: Subscription Renewed - Wheedle AI Marketing Hub' }
  ];

  const handleSend = () => {
     if(!message) return;
     toast.success('Omni-channel broadcast scheduled!');
     setMessage('');
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Omni-Channel <span className="text-gradient">Automation</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>AI-personalized WhatsApp & Email automated sequences.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '24px' }}>
        
        {/* Compose Box */}
        <GlassCard style={{ height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px' }}>
              <button 
                onClick={() => setActiveTab('whatsapp')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'whatsapp' ? 'var(--accent-primary)' : 'transparent', color: '#fff', cursor: 'pointer' }}
              >
                <Smartphone size={16} /> WhatsApp
              </button>
              <button 
                onClick={() => setActiveTab('email')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'email' ? 'var(--accent-primary)' : 'transparent', color: '#fff', cursor: 'pointer' }}
              >
                <Mail size={16} /> Email
              </button>
           </div>

           <div className="input-group">
              <label>Broadcasting to Audience Segment</label>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <Users size={16} color="var(--info)" /> <strong>Segment:</strong> Q4 Early Adopters (1,240 users)
              </div>
           </div>

           <div className="input-group">
              <label>Message Content (AI drafting enabled)</label>
              <textarea 
                className="input-field" 
                rows={6} 
                value={message} 
                onChange={e => setMessage(e.target.value)}
                placeholder={activeTab === 'whatsapp' ? 'Enter WhatsApp message...' : 'Enter Email body...'}
              ></textarea>
           </div>

           <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setMessage('AI suggested: "Hi [Name], your dashboard has been updated with new 2026 predictions. Check it out!"')}>
                 <Sparkles size={16} color="var(--warning)" /> AI Write
              </button>
              <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleSend}>
                 <Send size={16} /> Send Hub
              </button>
           </div>
        </GlassCard>

        {/* Live Status Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
               {activeTab === 'whatsapp' ? <MessageCircle size={20} color="var(--success)" /> : <Mail size={20} color="var(--info)" />} Recent Cloud Broadcasts
            </h3>

            {demos.map(d => (
              <GlassCard key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <span style={{ fontWeight: 600 }}>{d.to}</span>
                       <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{d.time}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                       {d.content}
                    </div>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} color={d.status === 'read' || d.status === 'opened' ? 'var(--success)' : 'var(--text-secondary)'} />
                    <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{d.status}</span>
                 </div>
              </GlassCard>
            ))}
        </div>

      </div>
    </div>
  );
};
