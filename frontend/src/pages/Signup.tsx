import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/slices/authSlice';
import type { AppDispatch } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, Lock, Mail, Activity, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const Signup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status } = useSelector((state: any) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const promise = dispatch(registerUser({ name, email, password })).unwrap();
      toast.promise(promise, {
        loading: 'Creating your account...',
        success: 'Account created successfully!',
        error: 'Failed to create account. Email may already be registered.'
      });
      await promise;
      navigate('/');
    } catch (err) {
      console.error('Failed to register:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, overflow: 'hidden' }}>
      
      {/* Background Vectors */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(100px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', filter: 'blur(120px)' }}></div>

      <div className="glass-panel animate-fade-in" style={{ padding: '40px 48px', width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'var(--accent-gradient)', marginBottom: '16px', boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)' }}>
            <BrainCircuit size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Start building AI-powered marketing campaigns.</p>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="input-group" style={{ marginBottom: '0' }}>
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="text" 
                required
                className="input-field" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '44px' }}
                disabled={status === 'loading'}
              />
            </div>
          </div>

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

          <div className="input-group" style={{ marginBottom: '8px' }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="password" 
                required
                className="input-field" 
                placeholder="Strong Password"
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
            {status === 'loading' ? <><Activity size={18} className="animate-fade-in" style={{ animationIterationCount: 'infinite' }} /> Creating Account...</> : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
        </div>

      </div>
    </div>
  );
};
