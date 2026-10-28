import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { HomePage } from '@/pages/HomePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ResumeBuilderPage } from '@/pages/ResumeBuilderPage'
import { ATSCheckerPage } from '@/pages/ATSCheckerPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ExportTestPage } from '@/pages/ExportTestPage'
import { PreviewPage } from '@/pages/PreviewPage'
import { useAuth } from '@/contexts/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="w-8 h-8 border-4 border-cosmic-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  // Allow guest users through (they have a user object but no session)
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="w-8 h-8 border-4 border-cosmic-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  // If authenticated, allow access to public pages too (user can visit homepage while logged in)
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public routes - accessible to everyone */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <HomePage />
          </PublicRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      
      {/* Protected routes - require authentication */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/builder/:id"
        element={
          <ProtectedRoute>
            <ResumeBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/preview/:id"
        element={
          <ProtectedRoute>
            <PreviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ats-checker/:id?"
        element={
          <ProtectedRoute>
            <ATSCheckerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/export-test"
        element={
          <ProtectedRoute>
            <ExportTestPage />
          </ProtectedRoute>
        }
      />
      
      {/* Catch-all redirects */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}