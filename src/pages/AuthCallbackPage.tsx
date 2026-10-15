import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button, Card } from '@/components/ui'
import { FloatingParticles, MorphingBlobs, PageTransition } from '@/components/animations/BlackHoleAnimation'
import toast from 'react-hot-toast'
import { supabase } from '@/services/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { loading: authLoading } = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Completing sign in...')

  const containerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()
    
    tl.fromTo(containerRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    )
  }, [])

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Let Supabase process the OAuth callback (code in URL hash/query params)
        // This exchanges the auth code for a session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          throw error
        }

        // Wait for auth context to sync
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (!authLoading) {
          if (session) {
            setStatus('success')
            setMessage('Sign in successful! Redirecting...')
            
            setTimeout(() => {
              navigate('/dashboard', { replace: true })
            }, 1500)
          } else {
            // No session yet, wait a bit more and check again
            await new Promise(resolve => setTimeout(resolve, 2000))
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession) {
              setStatus('success')
              setMessage('Sign in successful! Redirecting...')
              setTimeout(() => {
                navigate('/dashboard', { replace: true })
              }, 1500)
            } else {
              throw new Error('No session established after OAuth callback')
            }
          }
        }
      } catch (error: any) {
        console.error('OAuth callback failed:', error)
        setStatus('error')
        setMessage(error.message || 'Authentication failed. Please try again.')
        toast.error(error.message || 'Authentication failed. Please try again.')
      }
    }

    handleAuthCallback()
  }, [authLoading, navigate])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading') {
        setStatus('error')
        setMessage('Authentication timed out. Please try again.')
        toast.error('Authentication timed out. Please try again.')
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [status])

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative flex items-center justify-center px-3 py-6 sm:p-6 lg:p-8 overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <MorphingBlobs />
        <FloatingParticles count={80} />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-cosmic-500/20 via-transparent to-nebula-500/20 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-nebula-500/20 via-transparent to-cyan-500/20 blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gradient-to-r from-cosmic-500/10 to-nebula-500/10 blur-3xl animate-pulse-slow" />
      </div>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <Toggle
          checked={resolvedTheme === 'dark'}
          onChange={toggleTheme}
          label="Dark Mode"
          description={resolvedTheme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'}
        />
      </div>

      <PageTransition>
        <Card
          variant="glass"
          padding="lg"
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-500 to-nebula-500 mb-4 animate-float">
              {status === 'loading' && <ArrowPathIcon className="w-8 h-8 text-white animate-spin" />}
              {status === 'success' && <CheckCircleIcon className="w-8 h-8 text-white" />}
              {status === 'error' && <XCircleIcon className="w-8 h-8 text-white" />}
            </div>
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cosmic-600 via-nebula-600 to-cosmic-600 bg-clip-text text-transparent">
              ResumeForge
            </h1>
            
            <p className="mt-4 text-[var(--muted-foreground)]">{message}</p>
            
            {status === 'loading' && (
              <div className="mt-6">
                <div className="w-full h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cosmic-500 to-nebula-500 rounded-full animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mt-6">
                <Button variant="primary" onClick={() => navigate('/login', { replace: true })}>
                  Return to Sign In
                </Button>
              </div>
            )}
          </div>
        </Card>
      </PageTransition>
    </div>
  )
}

import { Toggle } from '@/components/ui'