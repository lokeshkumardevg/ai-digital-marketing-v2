import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Crm } from './pages/Crm';
import { Campaigns } from './pages/Campaigns';
import { Content } from './pages/Content';
import { ChatbotBuilder } from './pages/Chatbot';
import { Analytics } from './pages/Analytics';
import { Billing } from './pages/Billing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Settings } from './pages/Settings';
import { Seo } from './pages/Seo';
import { Social } from './pages/Social';
import { Agents } from './pages/Agents';
import { Roles } from './pages/Roles';
import { Workflows } from './pages/Workflows';
import { Messaging } from './pages/Messaging';
import { AdsManager } from './pages/AdsManager';
import { DraftAiRecs } from './pages/DraftAiRecs';
import { AdInsights } from './pages/AdInsights';
import { AiAnalysis } from './pages/AiAnalysis';
import { OptimizeGoal } from './pages/OptimizeGoal';
import { BrandProfile } from './pages/BrandProfile';
import { Products } from './pages/Products';
import { LandingPage } from './pages/LandingPage';
import { Templates } from './pages/Templates';
import { hydrateSession } from './store/slices/authSlice';
import { addNotification } from './store/slices/notificationSlice';
import io from 'socket.io-client';
import type { AppDispatch } from './store';
import { Activity } from 'lucide-react';

const ProtectedRoute = ({ children, requiredPermission }: { children: React.ReactNode, requiredPermission?: string }) => {
  const { isAuthenticated, status, user } = useSelector((state: any) => state.auth);

  if (status === 'loading' || (status === 'idle' && localStorage.getItem('access_token'))) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <Activity size={32} color="var(--accent-primary)" className="animate-fade-in" style={{ animationIterationCount: 'infinite' }} />
      </div>
    );
  }

  if (!isAuthenticated && (status === 'failed' || (status === 'idle' && !localStorage.getItem('access_token')))) {
    return <Navigate to="/login" replace />;
  }

  // RBAC Engine Validation
  if (requiredPermission && user) {
     const perms = user.permissions || [];
     if (!perms.includes('*') && !perms.includes(requiredPermission)) {
        return <Navigate to="/" replace />; // Bounce unauthorized access to User Dashboard natively
     }
  }

  return <>{children}</>;
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-container">
          {children}
        </div>
      </div>
    </div>
  );
};

// Full-bleed layout: no padding wrapper, pages manage their own spacing
const DashboardLayoutFull = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Campaign page gets no sidebar/header — pure full-screen wizard
const CampaignLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  useEffect(() => {
    // Only attempt hydration if a token exists to avoid race condition on boot
    const token = localStorage.getItem('access_token');
    if (token) {
      dispatch(hydrateSession());
    }
  }, [dispatch]);

  // Connect Real-Time Matrix Socket.IO
  useEffect(() => {
    if (isAuthenticated) {
      const socket = io('http://localhost:3000', {
        auth: { token: localStorage.getItem('access_token') }
      });

      socket.on('connect', () => {
        console.log('🔗 Live AI WebSockets Established');
      });

      // Listen for Global App Notifications emitted by Backend logic
      socket.on('notification', (data) => {
        dispatch(addNotification({
          id: Date.now().toString(),
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          time: new Date().toISOString(),
          read: false
        }));
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard Routes — AdsGo full-bleed pages */}
        <Route path="/crm" element={<ProtectedRoute><DashboardLayoutFull><Crm /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute><CampaignLayout><Campaigns /></CampaignLayout></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><DashboardLayoutFull><Templates /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/content" element={<ProtectedRoute><DashboardLayoutFull><Content /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute><DashboardLayout><ChatbotBuilder /></DashboardLayout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><DashboardLayout><Billing /></DashboardLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
        <Route path="/seo" element={<ProtectedRoute><DashboardLayout><Seo /></DashboardLayout></ProtectedRoute>} />
        <Route path="/social" element={<ProtectedRoute><DashboardLayout><Social /></DashboardLayout></ProtectedRoute>} />
        <Route path="/ai-agents" element={<ProtectedRoute><DashboardLayout><Agents /></DashboardLayout></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute requiredPermission="settings"><DashboardLayout><Roles /></DashboardLayout></ProtectedRoute>} />
        <Route path="/workflows" element={<ProtectedRoute><DashboardLayout><Workflows /></DashboardLayout></ProtectedRoute>} />
        <Route path="/messaging" element={<ProtectedRoute><DashboardLayout><Messaging /></DashboardLayout></ProtectedRoute>} />

        {/* AI Optimize Sub-routes */}
        <Route path="/ai/ads-manager" element={<ProtectedRoute requiredPermission="ads"><DashboardLayoutFull><AdsManager /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/ai/draft-recs" element={<ProtectedRoute requiredPermission="ads"><DashboardLayoutFull><DraftAiRecs /></DashboardLayoutFull></ProtectedRoute>} />

        {/* Analytics Sub-routes */}
        <Route path="/analytics/insights" element={<ProtectedRoute requiredPermission="analytics"><DashboardLayoutFull><AdInsights /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/analytics/ai-analysis" element={<ProtectedRoute requiredPermission="analytics"><DashboardLayoutFull><AiAnalysis /></DashboardLayoutFull></ProtectedRoute>} />

        {/* Brand Center Sub-routes */}
        <Route path="/brand/goal" element={<ProtectedRoute requiredPermission="settings"><DashboardLayoutFull><OptimizeGoal /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/brand/profile" element={<ProtectedRoute requiredPermission="settings"><DashboardLayoutFull><BrandProfile /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/brand/products" element={<ProtectedRoute requiredPermission="settings"><DashboardLayoutFull><Products /></DashboardLayoutFull></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
