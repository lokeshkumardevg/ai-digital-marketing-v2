import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Header } from './dashboard/components/Header';
import { Sidebar } from './dashboard/components/Sidebar';
import { Crm } from './dashboard/pages/Crm';
import { Campaigns } from './dashboard/pages/Campaigns';
import { Content } from './dashboard/pages/Content';
import { ChatbotBuilder } from './dashboard/pages/Chatbot';
import { Analytics } from './dashboard/pages/Analytics';
import Billing from './dashboard/pages/Billing';
// @ts-ignore
import Home from './landing/pages/Home';
// @ts-ignore
import Features from './landing/pages/Features';
// @ts-ignore
import Tutorial from "./landing/pages/tutorial";
import Help from './landing/pages/Help';
import PricingPage from './landing/pages/PricingPage';
import Resources from './landing/pages/Resources';
import Register from './landing/pages/Register';
import { Settings } from './dashboard/pages/Settings';
import { Seo } from './dashboard/pages/Seo';
import { Social } from './dashboard/pages/Social';
import { Agents } from './dashboard/pages/Agents';
import { Roles } from './dashboard/pages/Roles';
import { Users } from './dashboard/pages/Users';
import { Workflows } from './dashboard/pages/Workflows';
import { Messaging } from './dashboard/pages/Messaging';
import { AdsManager } from './dashboard/pages/AdsManager';
import { DraftAiRecs } from './dashboard/pages/DraftAiRecs';
import { AdInsights } from './dashboard/pages/AdInsights';
import { AiAnalysis } from './dashboard/pages/AiAnalysis';
import { OptimizeGoal } from './dashboard/pages/OptimizeGoal';
import { BrandProfile } from './dashboard/pages/BrandProfile';
import { Products } from './dashboard/pages/Products';
import { ChatEmbed } from './dashboard/pages/ChatEmbed';
import { Presentation } from './dashboard/pages/Presentation';
import { LinkedInCrm } from './dashboard/pages/LinkedInCrm';

import { Templates } from './dashboard/pages/Templates';
import { hydrateSession } from './store/slices/authSlice';
import { addNotification, fetchNotifications } from './store/slices/notificationSlice';
import AiCreativeWorkspacePage from './dashboard/pages/AiCreativeWorkspacePage';
import { Notifications } from './dashboard/pages/Notifications';

import io from 'socket.io-client';
import type { AppDispatch } from './store';
import { Activity } from 'lucide-react';
import RecommendationsPage from './dashboard/pages/RecommendationsPage';
import AnalyticsPage from './dashboard/pages/AnalyticsPage';
import CustomersPage from './dashboard/pages/CustomersPage';
import InboxPage from './dashboard/pages/InboxPage';
import DashboardPage from './dashboard/pages/DashboardPage';
import GoogleBusinessTester from './dashboard/pages/Googlebusinesstester';
import PostsPage from './dashboard/pages/PostsPage';

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
    const canViewUsers = requiredPermission === 'view_users' && perms.includes('manage_users');
    if (user.role !== 'superadmin' && !perms.includes('*') && !perms.includes(requiredPermission) && !canViewUsers) {
      return <Navigate to="/crm" replace />;
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
      <div className="main-content" style={{ minWidth: 0 }}>
        <Header />
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Dark theme version for CRM
const DarkDashboardLayoutFull = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="app-container dark-theme">
      <Sidebar />
      <div className="main-content" style={{ minWidth: 0 }}>
        <Header />
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, minWidth: 0 }}>
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
      <div className="main-content" style={{ minWidth: 0 }}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, minWidth: 0 }}>
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
      const socket = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
        auth: { token: localStorage.getItem('access_token') }
      });

      socket.on('connect', () => {
        console.log('🔗 Live AI WebSockets Established');
      });

      // Listen for Global App Notifications emitted by Backend logic
      socket.on('notification', (data) => {
        dispatch(addNotification({
          id: data.id || Date.now().toString(),
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          category: data.category || 'general',
          time: data.time || new Date().toISOString(),
          read: false,
          actionUrl: data.actionUrl || null,
          actionLabel: data.actionLabel || null,
        }));
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications({ limit: 50 }));
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/help" element={<Help />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/chatbot-embed/:id" element={<ChatEmbed />} />
        <Route path="/presentation" element={<Presentation />} />

        {/* Dashboard Routes — AdsGo full-bleed pages */}
        <Route path="/crm" element={<ProtectedRoute><DarkDashboardLayoutFull><Crm /></DarkDashboardLayoutFull></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute><CampaignLayout><Campaigns /></CampaignLayout></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><DashboardLayoutFull><Templates /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/content" element={<ProtectedRoute><DashboardLayoutFull><Content /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/content/ai-workspace" element={<ProtectedRoute><DashboardLayoutFull><AiCreativeWorkspacePage /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute><DashboardLayout><ChatbotBuilder /></DashboardLayout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><DashboardLayout><Billing /></DashboardLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
        <Route path="/seo" element={<ProtectedRoute><DashboardLayout><Seo /></DashboardLayout></ProtectedRoute>} />
        <Route path="/seo/:view" element={<ProtectedRoute><DashboardLayout><Seo /></DashboardLayout></ProtectedRoute>} />
        <Route path="/social" element={<ProtectedRoute><DashboardLayout><Social /></DashboardLayout></ProtectedRoute>} />
        <Route path="/ai-agents" element={<ProtectedRoute><DashboardLayout><Agents /></DashboardLayout></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute requiredPermission="superadmin"><DashboardLayout><Roles /></DashboardLayout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><DashboardLayout><Users /></DashboardLayout></ProtectedRoute>} />
        <Route path="/workflows" element={<ProtectedRoute><DashboardLayout><Workflows /></DashboardLayout></ProtectedRoute>} />
        <Route path="/messaging" element={<ProtectedRoute><DashboardLayout><Messaging /></DashboardLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><DashboardLayout><Notifications /></DashboardLayout></ProtectedRoute>} />

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

        {/* LinkedIn AI CRM */}
        <Route path="/linkedin-crm" element={<ProtectedRoute><DarkDashboardLayoutFull><LinkedInCrm /></DarkDashboardLayoutFull></ProtectedRoute>} />
        {/* Reviews & Reputation Management */}
        <Route path="/reputation/dashboard" element={<ProtectedRoute><DashboardLayoutFull><DashboardPage /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/reputation/inbox" element={<ProtectedRoute><DashboardLayoutFull><InboxPage /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/reputation/posts" element={<ProtectedRoute><DashboardLayoutFull><PostsPage /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/reputation/customers" element={<ProtectedRoute><DashboardLayoutFull><CustomersPage /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/reputation/analytics" element={<ProtectedRoute><DashboardLayoutFull><AnalyticsPage /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/reputation/recommendations" element={<ProtectedRoute><DashboardLayoutFull><RecommendationsPage /></DashboardLayoutFull></ProtectedRoute>} />
        <Route path="/google-business/tester" element={<ProtectedRoute><DashboardLayoutFull><GoogleBusinessTester /></DashboardLayoutFull></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
