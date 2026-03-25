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
      navigate('/');
    } catch (err) {
      console.error('Failed to log in:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, overflow: 'hidden' }}>
      
      {/* Abstract Background Vectors */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', filter: 'blur(100px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', filter: 'blur(120px)' }}></div>

      <div className="glass-panel animate-fade-in" style={{ padding: '48px', width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'var(--accent-gradient)', marginBottom: '20px', boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)' }}>
            <img src="https://wheedletechnologies.ai/fevicon.png" alt="Wheedle" style={{ width: '48px', height: '48px', borderRadius: '12px', margin: '0 auto' }} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 700 }}>
            Welcome to <span className="text-gradient">Wheedle AI</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Log in to deploy your autonomous marketing teams.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group" style={{ marginBottom: '0' }}>
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="email" 
                required
                className="input-field" 
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              Password
              <a href="#" style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', textDecoration: 'none' }}>Forgot?</a>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="password" 
                required
                className="input-field" 
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={status === 'loading'}
            style={{ padding: '14px', width: '100%', fontSize: '1rem', marginTop: '8px' }}
          >
            {status === 'loading' ? <><Activity size={18} className="animate-fade-in" style={{ animationIterationCount: 'infinite' }} /> Logging in...</> : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '28px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
        </div>

      </div>
    </div>
  );
};
