import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { Helmet } from 'react-helmet-async';

// Debug utilities (development only)
import './utils/debug';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import VideoDetailPage from './pages/Video/VideoDetailPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import VideoUploadPage from './pages/Dashboard/VideoUploadPage';
import MyVideosPage from './pages/Dashboard/MyVideosPage';
import ExplorePage from './pages/ExplorePage';
import SubscriptionsPage from './pages/Dashboard/SubscriptionsPage';
import ProfilePage from './pages/Dashboard/ProfilePage';
import VerificationPage from './pages/Dashboard/VerificationPage';
import SettingsPage from './pages/Dashboard/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <div className="App">
      <Helmet>
        <title>Firehub - Premium Content Platform</title>
        <meta name="description" content="Firehub is a premium content platform for creators and viewers. Share, discover, and monetize content safely and securely." />
        <meta name="keywords" content="content platform, video platform, creator monetization, entertainment" />
        <meta property="og:title" content="Firehub - Premium Content Platform" />
        <meta property="og:description" content="Share, discover, and monetize content safely and securely." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Routes>
        {/* Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="video/:videoId" element={<VideoDetailPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="dashboard/upload" element={
            <ProtectedRoute>
              <VideoUploadPage />
            </ProtectedRoute>
          } />
          <Route path="dashboard/videos" element={
            <ProtectedRoute>
              <MyVideosPage />
            </ProtectedRoute>
          } />
          <Route path="dashboard/subscriptions" element={
            <ProtectedRoute>
              <SubscriptionsPage />
            </ProtectedRoute>
          } />
          <Route path="dashboard/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="dashboard/verification" element={
            <ProtectedRoute>
              <VerificationPage />
            </ProtectedRoute>
          } />
          <Route path="dashboard/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Auth routes without Layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App; 