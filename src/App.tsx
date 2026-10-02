import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
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

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-2">Resume Builder</h2>
                <p className="text-[var(--muted-foreground)]">Coming soon - /builder/:id route</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/preview/:id"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-2">Resume Preview</h2>
                <p className="text-[var(--muted-foreground)]">Coming soon - /preview/:id route</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ats-checker"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-2">ATS Checker</h2>
                <p className="text-[var(--muted-foreground)]">Coming soon - /ats-checker route</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="/auth/callback" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}