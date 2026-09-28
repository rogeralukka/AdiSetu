import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import SchemesScreen from './screens/SchemesScreen';
import UpdatesScreen from './screens/UpdatesScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import SchemeDetailScreen from './screens/SchemeDetailScreen';
import ApplyFlowScreen from './screens/ApplyFlowScreen';
import ProfileScreen from './screens/ProfileScreen';
import LandingScreen from './screens/LandingScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';

function AppRoutes() {
  const { isLoggedIn } = useApp();

  return (
    <Routes>
      {/* Admin Verification Dashboard Surface (Desktop, independent of student login) */}
      <Route path="/admin" element={<AdminDashboardScreen />} />

      {/* Student App Routes */}
      <Route
        path="/"
        element={isLoggedIn ? <SchemesScreen /> : <Navigate to="/landing" replace />}
      />
      <Route
        path="/updates"
        element={isLoggedIn ? <UpdatesScreen /> : <Navigate to="/landing" replace />}
      />
      <Route
        path="/documents"
        element={isLoggedIn ? <DocumentsScreen /> : <Navigate to="/landing" replace />}
      />
      <Route
        path="/scheme/:id"
        element={isLoggedIn ? <SchemeDetailScreen /> : <Navigate to="/landing" replace />}
      />
      <Route
        path="/apply/:id"
        element={isLoggedIn ? <ApplyFlowScreen /> : <Navigate to="/landing" replace />}
      />
      <Route
        path="/apply-batch"
        element={isLoggedIn ? <ApplyFlowScreen /> : <Navigate to="/landing" replace />}
      />
      <Route
        path="/profile"
        element={isLoggedIn ? <ProfileScreen /> : <Navigate to="/landing" replace />}
      />
      <Route path="/landing" element={<LandingScreen />} />
      <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/landing"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
