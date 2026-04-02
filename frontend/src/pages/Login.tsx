import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import type { AppDispatch } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, Lock, Mail, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status } = useSelector((state: any) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const promise = dispatch(loginUser({ email, password })).unwrap();
      toast.promise(promise, {
        loading: 'Logging in...',
        success: 'Login successful!',
        error: 'Login failed. Check your email and password.'
      });
      await promise;
      navigate('/crm');
    } catch (err) {
      console.error('Failed to log in:', err);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0514',
      color: '#ffffff',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      overflow: 'hidden'
    }}>

      {/* Abstract Background Vectors */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', filter: 'blur(100px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', filter: 'blur(120px)' }}></div>

      <div className="glass-panel animate-fade-in" style={{
        background: 'rgba(20, 20, 30, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        padding: '48px',
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        zIndex: 10,
        borderRadius: '24px'
      }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'var(--accent-gradient)', marginBottom: '20px', boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)' }}>
            <img src="https://wheedletechnologies.ai/fevicon.png" alt="Wheedle" style={{ width: '48px', height: '48px', borderRadius: '12px', margin: '0 auto' }} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 700 }}>
            Welcome to <span className="text-gradient">Wheedle AI</span>
          </h2>
          <p style={{ color: '#a0aec0' }}>Log in to deploy your autonomous marketing teams.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group" style={{ marginBottom: '0' }}>
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#a0aec0" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '14px 24px 14px 44px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: '#a0aec0' }}>
              Password
              <a href="#" style={{ color: '#8b5cf6', fontSize: '0.8rem', textDecoration: 'none' }}>Forgot?</a>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#a0aec0" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '14px 24px 14px 44px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{ padding: '14px', width: '100%', fontSize: '1rem', marginTop: '8px', background: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            {status === 'loading' ? <><Activity size={18} className="animate-fade-in" style={{ animationIterationCount: 'infinite' }} /> Logging in...</> : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '28px', color: '#a0aec0', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
        </div>

      </div>
    </div>
  );
};
