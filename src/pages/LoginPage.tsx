import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { 
  EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon,
  ArrowRightIcon, SparklesIcon
} from '@heroicons/react/24/outline'
import { 
  EnvelopeIcon as EnvelopeIconSolid, LockClosedIcon as LockClosedIconSolid,
  EyeIcon as EyeIconSolid, EyeSlashIcon as EyeSlashIconSolid,
  ArrowRightIcon as ArrowRightIconSolid, SparklesIcon as SparklesIconSolid
} from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button, Input, Card, Badge, Toggle, Divider } from '@/components/ui'
import { FloatingParticles, MorphingBlobs, PageTransition } from '@/components/animations/BlackHoleAnimation'
import toast from 'react-hot-toast'

export function LoginPage() {
  const navigate = useNavigate()
  const { signInWithOAuth, signInWithEmail, signUpWithEmail, continueAsGuest, loading: authLoading, user } = useAuth()
  const { toggleTheme, resolvedTheme } = useTheme()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    const container = containerRef.current
    const form = formRef.current
    if (!container || !form) return

    gsap.fromTo(container, 
      { opacity: 0 }, 
      { opacity: 1, duration: 1, ease: 'power3.out' }
    )

    gsap.fromTo(form, 
      { opacity: 0, y: 50, scale: 0.95 }, 
      { opacity: 1, y: 0, scale: 1, duration: 1, delay: 0.3, ease: 'power3.out' }
    )

    gsap.fromTo(particlesRef.current, 
      { opacity: 0 }, 
      { opacity: 1, duration: 1.5, delay: 0.5, ease: 'power2.out' }
    )
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (isSignUp) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSubmitting(true)
    try {
      if (isSignUp) {
        await signUpWithEmail(formData.email, formData.password, formData.fullName)
        toast.success('Account created! Please check your email to verify.')
      } else {
        await signInWithEmail(formData.email, formData.password)
        toast.success('Welcome back!')
      }
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed')
      if (error.message?.includes('Email not confirmed')) {
        setErrors({ email: 'Please verify your email address' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'microsoft') => {
    try {
      setSubmitting(true)
      await signInWithOAuth(provider)
    } catch (error: any) {
      toast.error(error.message || `${provider} login failed`)
      setSubmitting(false)
    }
  }

  const handleGuestLogin = async () => {
    try {
      setSubmitting(true)
      await continueAsGuest()
      toast.success('Continuing as guest. Your data will be saved locally.')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to continue as guest')
      setSubmitting(false)
    }
  }

  const toggleAuthMode = () => {
    setIsSignUp(prev => !prev)
    setErrors({})
    setFormData({ email: '', password: '', confirmPassword: '', fullName: '' })
    
    const form = formRef.current
    if (form) {
      gsap.to(form, { opacity: 0, y: 20, duration: 0.2, ease: 'power2.in', onComplete: () => {
        gsap.fromTo(form, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
      }})
    }
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      {/* Animated Background */}
      <div ref={particlesRef} className="absolute inset-0 z-0 overflow-hidden">
        <MorphingBlobs />
        <FloatingParticles count={80} />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-cosmic-500/20 via-transparent to-nebula-500/20 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-nebula-500/20 via-transparent to-cyan-500/20 blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gradient-to-r from-cosmic-500/10 to-nebula-500/10 blur-3xl animate-pulse-slow" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <Toggle
          checked={resolvedTheme === 'dark'}
          onChange={toggleTheme}
          label="Dark Mode"
          description={resolvedTheme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'}
        />
      </div>

      {/* Main Card */}
      <PageTransition>
        <Card ref={formRef} variant="glass" padding="lg" className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-500 to-nebula-500 mb-4 animate-float">
              <SparklesIconSolid className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cosmic-600 via-nebula-600 to-cosmic-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              ResumeForge
            </h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              {isSignUp ? 'Create your account to start building' : 'Sign in to continue building your resume'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                error={errors.fullName}
                leftIcon={<EnvelopeIconSolid className="w-5 h-5" />}
                autoComplete="name"
                autoFocus
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={errors.email}
              leftIcon={<EnvelopeIcon className="w-5 h-5" />}
              autoComplete="email"
              autoFocus={!isSignUp}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              error={errors.password}
              leftIcon={<LockClosedIcon className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              }
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />

            {isSignUp && (
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                error={errors.confirmPassword}
                leftIcon={<LockClosedIcon className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                }
                autoComplete="new-password"
              />
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting || authLoading} className="mt-2">
              {isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRightIconSolid className="w-4 h-4" />
            </Button>
          </form>

          <Divider label="Or continue with" className="my-6" />

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => handleOAuthLogin('google')}
              disabled={submitting || authLoading}
              className="gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleOAuthLogin('microsoft')}
              disabled={submitting || authLoading}
              className="gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#F25022" d="M0 0h12v12H0z"/>
                <path fill="#7FBA00" d="M12 0h12v12H12z"/>
                <path fill="#00A4EF" d="M0 12h12v12H0z"/>
                <path fill="#FFB900" d="M12 12h12v12H12z"/>
              </svg>
              Microsoft
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="ml-2 text-cosmic-500 hover:text-cosmic-400 font-medium transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <Button
              variant="ghost"
              fullWidth
              onClick={handleGuestLogin}
              disabled={submitting || authLoading}
              className="gap-2"
            >
              <span className="w-5 h-5 rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500" />
              Continue as Guest
              <span className="text-xs text-[var(--muted-foreground)]">No account needed</span>
            </Button>
          </div>

          <div className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
            <p>By continuing, you agree to our </p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="#" className="text-cosmic-500 hover:text-cosmic-400 transition-colors">Terms of Service</a>
              <span className="text-[var(--border)]">•</span>
              <a href="#" className="text-cosmic-500 hover:text-cosmic-400 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </Card>
      </PageTransition>

      {/* Feature highlights */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-8 z-10" style={{ opacity: 0.6 }}>
        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
          <Badge variant="cosmic" size="sm">ATS Optimized</Badge>
        </div>
        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
          <Badge variant="success" size="sm">Real-time Preview</Badge>
        </div>
        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
          <Badge variant="info" size="sm">Multiple Templates</Badge>
        </div>
      </div>
    </div>
  )
}