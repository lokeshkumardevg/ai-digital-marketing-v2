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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard Routes Monolith */}
        <Route path="/" element={<ProtectedRoute><DashboardLayout><Crm /></DashboardLayout></ProtectedRoute>} />
        <Route path="/crm" element={<ProtectedRoute><DashboardLayout><Crm /></DashboardLayout></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute><DashboardLayout><Campaigns /></DashboardLayout></ProtectedRoute>} />
        <Route path="/content" element={<ProtectedRoute><DashboardLayout><Content /></DashboardLayout></ProtectedRoute>} />
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
      </Routes>
    </Router>
  );
};

export default App;
