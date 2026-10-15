import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Button, Card, Input, Avatar, Badge, Toggle, Progress, Modal, Tabs, TabsList, TabsTrigger, TabsContent
} from '@/components/ui'
import { 
  CameraIcon, TrashIcon, LockClosedIcon, EyeIcon, EyeSlashIcon,
  CheckCircleIcon, ExclamationTriangleIcon, UserIcon,
  PhotoIcon, PencilIcon, EnvelopeIcon, PhoneIcon, BellIcon,
  ComputerDesktopIcon, DevicePhoneMobileIcon, ShieldCheckIcon,
  ArrowDownTrayIcon, Cog6ToothIcon, SunIcon, MoonIcon, CpuChipIcon, HomeIcon, Squares2X2Icon
} from '@heroicons/react/24/outline'
import {
  CameraIcon as CameraIconSolid, TrashIcon as TrashIconSolid,
  LockClosedIcon as LockClosedIconSolid, CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  UserIcon as UserIconSolid, PhotoIcon as PhotoIconSolid, PencilIcon as PencilIconSolid,
  EnvelopeIcon as EnvelopeIconSolid, PhoneIcon as PhoneIconSolid,
  SunIcon as SunIconSolid, MoonIcon as MoonIconSolid, CpuChipIcon as CpuChipIconSolid
} from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { supabase } from '@/services/supabase'

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, session, updateProfile, updatePassword, uploadAvatar, deleteAvatar, deleteAccount, updateEmail, updatePhone, verifyPhone, resendPhoneVerification, getSessions, revokeAllSessions, loading: authLoading } = useAuth()
  const { theme, setTheme: setThemePreference, resolvedTheme } = useTheme()
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'email' | 'phone' | 'sessions' | 'notifications' | 'appearance' | 'privacy' | 'danger'>('profile')

  // Profile state
  const [displayName, setDisplayName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)
  
  // Email state
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailPending, setEmailPending] = useState(false)
  
  // Phone state
  const [newPhone, setNewPhone] = useState('')
  const [phoneOTP, setPhoneOTP] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [phoneSuccess, setPhoneSuccess] = useState(false)
  const [phoneVerifying, setPhoneVerifying] = useState(false)
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  // Notifications state
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    resumeReminders: true,
    applicationNotifications: true,
  })
  
  // Sessions state
  const [sessions, setSessions] = useState<Array<{
    id: string
    device: string
    browser: string
    os: string
    ip: string
    location: string
    created_at: string
    last_active: string
    is_current: boolean
  }>>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsError, setSessionsError] = useState<string | null>(null)
  
  // Delete Account state
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'password'>('confirm')
  
  // Data Export state
  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Initialize profile data
  useEffect(() => {
    if (user) {
      setDisplayName(user.full_name || '')
      setFirstName(user.first_name || '')
      setLastName(user.last_name || '')
      setAvatarPreview(user.avatar_url || null)
    }
  }, [user])
  
  // Password strength calculation
  useEffect(() => {
    let strength = 0
    if (newPassword.length >= 8) strength += 25
    if (/[A-Z]/.test(newPassword)) strength += 25
    if (/[a-z]/.test(newPassword)) strength += 25
    if (/[0-9]/.test(newPassword)) strength += 25
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 10
    if (newPassword.length >= 12) strength += 5
    setPasswordStrength(Math.min(strength, 100))
  }, [newPassword])
  
  // Handle avatar file selection
  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setProfileError('Invalid file type. Please upload JPEG, PNG, WebP, or GIF.')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('File too large. Maximum size is 5MB.')
      return
    }
    
    setProfileError(null)
    setAvatarFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])
  
  // Trigger file input
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])
  
  // Remove avatar
  const handleRemoveAvatar = useCallback(async () => {
    if (!user || !session) return
    
    setProfileLoading(true)
    setProfileError(null)
    
    try {
      await deleteAvatar()
      setAvatarPreview(null)
      setAvatarFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setProfileSuccess(true)
      toast.success('Profile picture removed')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove profile picture'
      setProfileError(message)
      toast.error(message)
    } finally {
      setProfileLoading(false)
    }
  }, [user, session, deleteAvatar])
  
  // Save profile changes
  const handleSaveProfile = useCallback(async () => {
    if (!user || !session) return
    
    setProfileLoading(true)
    setProfileError(null)
    setProfileSuccess(false)
    
    try {
      // Upload avatar if new file selected
      let avatarUrl = user.avatar_url
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile)
      }
      
      // Update profile
      await updateProfile({
        full_name: displayName,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
      })
      
      setProfileSuccess(true)
      setAvatarFile(null)
      toast.success('Profile updated successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile'
      setProfileError(message)
      toast.error(message)
    } finally {
      setProfileLoading(false)
    }
  }, [user, session, avatarFile, displayName, firstName, lastName, uploadAvatar, updateProfile])
  
  // Validate password
  const validatePassword = useCallback((pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number'
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Password must contain at least one special character'
    return null
  }, [])
  
  // Handle password change
  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !session) return
    
    // Validate
    const pwdError = validatePassword(newPassword)
    if (pwdError) {
      setPasswordError(pwdError)
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password')
      return
    }
    
    setPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(false)
    
    try {
      await updatePassword(currentPassword, newPassword)
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password changed successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password'
      setPasswordError(message)
      toast.error(message)
    } finally {
      setPasswordLoading(false)
    }
  }, [user, session, currentPassword, newPassword, confirmPassword, validatePassword, updatePassword])
  
  // Handle delete account
  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirmation !== 'DELETE') return
    if (!user || !session) return
    
    setDeleteLoading(true)
    setDeleteError(null)
    
    try {
      await deleteAccount('DELETE')
      toast.success('Account deleted successfully')
      navigate('/', { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete account'
      setDeleteError(message)
      toast.error(message)
    } finally {
      setDeleteLoading(false)
    }
  }, [deleteConfirmation, user, session, deleteAccount, navigate])
  
  // Handle delete account with password verification
  const handleDeleteAccountWithPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !session) return
    
    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: deletePassword,
    })
    
    if (signInError) {
      setDeleteError('Current password is incorrect')
      toast.error('Current password is incorrect')
      return
    }
    
    // Close modal and proceed with deletion
    setShowDeleteModal(false)
    await handleDeleteAccount()
  }, [user, session, deletePassword, handleDeleteAccount])
  
// Handle delete account - Step 1: Show confirmation modal
  const handleDeleteAccountClick = useCallback(() => {
    setDeleteStep('confirm')
    setDeleteConfirmation('')
    setDeleteError(null)
    setShowDeleteModal(true)
  }, [])

  // Handle confirmation text verification - Step 2: Verify "DELETE" text
  const handleConfirmDeletion = useCallback(() => {
    if (deleteConfirmation !== 'DELETE') return
    setDeleteStep('password')
    setDeletePassword('')
    setShowDeletePassword(false)
    setDeleteError(null)
  }, [deleteConfirmation])

  // Handle password verification - Step 3: Verify current password
  const handleVerifyPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !session) return
    
    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: deletePassword,
    })
    
    if (signInError) {
      setDeleteError('Current password is incorrect')
      toast.error('Current password is incorrect')
      return
    }
    
    // Password verified, proceed with deletion
    setShowDeleteModal(false)
    await performAccountDeletion()
  }, [user, session, deletePassword])

  // Perform the actual account deletion
  const performAccountDeletion = useCallback(async () => {
    if (!user || !session) return
    
    setDeleteLoading(true)
    setDeleteError(null)
    
    try {
      await deleteAccount('DELETE')
      toast.success('Account deleted successfully')
      navigate('/', { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete account'
      setDeleteError(message)
      toast.error(message)
    } finally {
      setDeleteLoading(false)
    }
  }, [user, session, deleteAccount, navigate])

  // Handle email change
  const handleEmailChange = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !session || !newEmail.trim()) return
    
    setEmailLoading(true)
    setEmailError(null)
    setEmailSuccess(false)
    
    try {
      await updateEmail(newEmail.trim())
      setEmailSuccess(true)
      setEmailPending(true)
      toast.success('Verification email sent. Please check your inbox to confirm the new email address.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update email'
      setEmailError(message)
      toast.error(message)
    } finally {
      setEmailLoading(false)
    }
  }, [user, session, newEmail, updateEmail])

  // Handle phone number update
  const handlePhoneUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !session || !newPhone.trim()) return
    
    setPhoneLoading(true)
    setPhoneError(null)
    setPhoneSuccess(false)
    
    try {
      await updatePhone(newPhone.trim())
      setPhoneVerifying(true)
      setPhoneSuccess(true)
      toast.success('Verification code sent via SMS')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update phone number'
      setPhoneError(message)
      toast.error(message)
    } finally {
      setPhoneLoading(false)
    }
  }, [user, session, newPhone, updatePhone])

  // Handle phone verification
  const handlePhoneVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !session || !phoneOTP.trim()) return
    
    setPhoneLoading(true)
    setPhoneError(null)
    
    try {
      await verifyPhone(phoneOTP.trim())
      setPhoneVerifying(false)
      setPhoneOTP('')
      toast.success('Phone number verified successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify phone number'
      setPhoneError(message)
      toast.error(message)
    } finally {
      setPhoneLoading(false)
    }
  }, [user, session, phoneOTP, verifyPhone])

  // Handle resend phone verification
  const handleResendPhoneVerification = useCallback(async () => {
    if (!user || !session) return
    
    try {
      await resendPhoneVerification()
      toast.success('Verification code resent')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend verification code'
      toast.error(message)
    }
  }, [user, session, resendPhoneVerification])

  // Load notification preferences
  const loadNotifications = useCallback(async () => {
    if (!user || !session) return
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single()
      
      if (data?.preferences?.notifications) {
        setNotifications(data.preferences.notifications)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }, [user, session])

  // Save notification preferences
  const handleNotificationChange = useCallback(async (key: string, value: boolean) => {
    if (!user || !session) return
    
    setNotificationLoading(true)
    
    try {
      const updatedNotifications = { ...notifications, [key]: value }
      setNotifications(updatedNotifications)
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          preferences: { 
            ...(user.preferences || {}), 
            notifications: updatedNotifications 
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (error) throw error
      
      toast.success('Notification preferences updated')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update notifications'
      toast.error(message)
      // Revert on error
      setNotifications({ ...notifications, [key]: !value })
    } finally {
      setNotificationLoading(false)
    }
  }, [user, session, notifications])

  // Load sessions
  const loadSessions = useCallback(async () => {
    if (!user || !session) return
    
    setSessionsLoading(true)
    setSessionsError(null)
    
    try {
      const data = await getSessions()
      // Mark current session
      const currentToken = session.access_token
      const formattedSessions = data.map(s => ({
        ...s,
        is_current: false // Frontend will determine current session
      }))
      setSessions(formattedSessions)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load sessions'
      setSessionsError(message)
      toast.error(message)
    } finally {
      setSessionsLoading(false)
    }
  }, [user, session, getSessions])

  // Revoke a specific session
  const handleRevokeSession = useCallback(async (sessionId: string) => {
    if (!user || !session) return
    
    try {
      await revokeAllSessions() // Note: API only supports revoke all for now
      toast.success('All other sessions revoked')
      loadSessions()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to revoke session'
      toast.error(message)
    }
  }, [user, session, revokeAllSessions, loadSessions])

  // Handle theme change
  const handleThemeChange = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setThemePreference(newTheme)
    
    // Also save to user preferences in database
    if (user && session) {
      supabase
        .from('profiles')
        .update({ 
          preferences: { 
            ...(user.preferences || {}), 
            theme: newTheme 
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) console.error('Failed to save theme preference:', error)
        })
    }
  }, [user, session, setThemePreference])

  // Handle data export
  const handleExportData = useCallback(async () => {
    if (!user || !session) return
    
    setExportLoading(true)
    setExportError(null)
    
    try {
      // Fetch all user data
      const [profileRes, resumesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('resumes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
      ])
      
      if (profileRes.error) throw profileRes.error
      if (resumesRes.error) throw resumesRes.error
      
      // Prepare export data
      const exportData = {
        exportedAt: new Date().toISOString(),
        profile: profileRes.data ? {
          id: profileRes.data.id,
          email: profileRes.data.email,
          full_name: profileRes.data.full_name,
          first_name: profileRes.data.first_name,
          last_name: profileRes.data.last_name,
          avatar_url: profileRes.data.avatar_url,
          phone: profileRes.data.phone,
          phone_verified: profileRes.data.phone_verified,
          provider: profileRes.data.provider,
          created_at: profileRes.data.created_at,
          updated_at: profileRes.data.updated_at,
          preferences: profileRes.data.preferences,
        } : null,
        resumes: resumesRes.data || [],
        settings: {
          theme,
          notifications,
        }
      }
      
      // Create and trigger download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resumeforge-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Data exported successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export data'
      setExportError(message)
      toast.error(message)
    } finally {
      setExportLoading(false)
    }
  }, [user, session, theme, notifications])

  // Load initial data
  useEffect(() => {
    if (user && session) {
      loadNotifications()
      loadSessions()
    }
  }, [user, session, loadNotifications, loadSessions])
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="w-8 h-8 border-4 border-cosmic-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <Card variant="glass" padding="lg" className="w-full max-w-md text-center">
          <ExclamationTriangleIconSolid className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-[var(--muted-foreground)] mb-6">
            Please sign in to access your settings.
          </p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </Card>
      </div>
    )
  }
  
  const getStrengthLabel = (strength: number) => {
    if (strength < 30) return 'Very Weak'
    if (strength < 50) return 'Weak'
    if (strength < 70) return 'Fair'
    if (strength < 90) return 'Strong'
    return 'Very Strong'
  }
  
  const getStrengthColor = (strength: number) => {
    if (strength < 30) return 'danger'
    if (strength < 50) return 'warning'
    if (strength < 70) return 'info'
    if (strength < 90) return 'success'
    return 'cosmic'
  }
  
return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Permanent desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-[var(--card-border)] bg-[var(--card)]">
        <div className="flex h-20 items-center gap-3 border-b border-[var(--card-border)] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-500">
            <Cog6ToothIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-cosmic-400 to-nebula-400 bg-clip-text text-transparent">ResumeForge</h1>
            <p className="text-xs text-[var(--muted-foreground)]">Settings</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          <button type="button" onClick={() => navigate('/')} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
            <HomeIcon className="h-5 w-5" /> Homepage
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
            <Squares2X2Icon className="h-5 w-5" /> Dashboard
          </button>
          <button type="button" onClick={() => navigate('/ats-checker')} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
            <ShieldCheckIcon className="h-5 w-5" /> ATS Checker
          </button>
          <div className="my-4 border-t border-[var(--card-border)]" />
          <div className="rounded-xl bg-gradient-to-r from-cosmic-500/15 to-nebula-500/15 px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
            <div className="flex items-center gap-3"><Cog6ToothIcon className="h-5 w-5 text-cosmic-400" /> Settings</div>
          </div>
        </nav>

        <div className="border-t border-[var(--card-border)] p-4">
          <div className="truncate text-sm font-medium text-[var(--foreground)]">{user.full_name || user.email}</div>
          <div className="mt-1 truncate text-xs text-[var(--muted-foreground)]">{user.email}</div>
        </div>
      </aside>

      <main className="min-w-0 w-full lg:ml-64">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--card-border)] bg-[var(--background)]/95 px-4 py-3 backdrop-blur lg:hidden">
          <span className="font-bold text-[var(--foreground)]">ResumeForge</span>
          <button type="button" onClick={() => navigate('/dashboard')} className="rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]">Dashboard</button>
        </div>
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cosmic-600 to-nebula-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            Manage your profile, security, and account preferences
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-6">
          <TabsList className="flex h-auto w-full items-center justify-start gap-2 overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-2">
            <TabsTrigger value="profile" className="shrink-0">
              <UserIcon className="w-4 h-4 mr-1" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="shrink-0">
              <LockClosedIcon className="w-4 h-4 mr-1" />
              Account & Security
            </TabsTrigger>
            <TabsTrigger value="email" className="shrink-0">
              <EnvelopeIcon className="w-4 h-4 mr-1" />
              Email
            </TabsTrigger>
            <TabsTrigger value="phone" className="shrink-0">
              <PhoneIcon className="w-4 h-4 mr-1" />
              Phone
            </TabsTrigger>
            <TabsTrigger value="sessions" className="shrink-0">
              <ComputerDesktopIcon className="w-4 h-4 mr-1" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="notifications" className="shrink-0">
              <BellIcon className="w-4 h-4 mr-1" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="shrink-0">
              <Cog6ToothIcon className="w-4 h-4 mr-1" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="privacy" className="shrink-0">
              <ShieldCheckIcon className="w-4 h-4 mr-1" />
              Privacy & Data
            </TabsTrigger>
            <TabsTrigger value="danger" className="shrink-0">
              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="mt-4">
              <Card variant="default" padding="lg" className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-500 flex items-center justify-center">
                      <UserIconSolid className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Profile</h2>
                      <p className="text-sm text-[var(--muted-foreground)]">Manage your personal information and avatar</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Avatar */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <div className="relative">
                        <Avatar
                          src={avatarPreview || undefined}
                          name={displayName || user.email}
                          size="xl"
                          shape="circle"
                        />
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          disabled={profileLoading}
                          className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-cosmic-500 text-white flex items-center justify-center hover:bg-cosmic-600 transition-colors shadow-lg"
                          aria-label="Change profile picture"
                        >
                          <CameraIconSolid className="w-5 h-5" />
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleAvatarChange}
                            className="sr-only"
                            disabled={profileLoading}
                          />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="secondary"
                          fullWidth
                          onClick={triggerFileInput}
                          disabled={profileLoading || !avatarFile}
                          leftIcon={<PhotoIconSolid className="w-4 h-4" />}
                        >
                          {avatarFile ? 'Change Photo' : 'Upload Photo'}
                        </Button>

                        {avatarPreview && (
                          <Button
                            variant="ghost"
                            fullWidth
                            onClick={handleRemoveAvatar}
                            disabled={profileLoading}
                            leftIcon={<TrashIconSolid className="w-4 h-4" />}
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            Remove Photo
                          </Button>
                        )}
                      </div>

                      {profileError && (
                        <p className="text-sm text-red-500" role="alert">{profileError}</p>
                      )}
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="lg:col-span-2 space-y-4">
                    <Input
                      label="Display Name"
                      placeholder="Enter your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={profileLoading}
                      leftIcon={<UserIcon className="w-4 h-4" />}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="First Name"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={profileLoading}
                      />
                      <Input
                        label="Last Name"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={profileLoading}
                      />
                    </div>

                    <Input
                      label="Email"
                      type="email"
                      value={user.email}
                      disabled
                      helperText="Email cannot be changed from here"
                      leftIcon={<LockClosedIcon className="w-4 h-4" />}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setDisplayName(user.full_name || '')
                          setFirstName(user.first_name || '')
                          setLastName(user.last_name || '')
                          setAvatarPreview(user.avatar_url || null)
                          setAvatarFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                          setProfileError(null)
                          setProfileSuccess(false)
                        }}
                        disabled={profileLoading}
                      >
                        Reset
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleSaveProfile}
                        loading={profileLoading}
                        disabled={profileLoading}
                        rightIcon={<CheckCircleIcon className="w-4 h-4" />}
                      >
                        Save Changes
                      </Button>
                    </div>

                    {profileSuccess && (
                      <div className="flex items-center gap-2 text-green-500 text-sm">
                        <CheckCircleIconSolid className="w-4 h-4" />
                        Profile saved successfully
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Account & Security Tab */}
          <TabsContent value="account">
            <div className="mt-4">
              <Card variant="default" padding="lg" className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                      <LockClosedIconSolid className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Change Password</h2>
                      <p className="text-sm text-[var(--muted-foreground)]">Update your password to keep your account secure</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="relative">
                    <Input
                      label="Current Password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={passwordLoading}
                      required
                      leftIcon={<LockClosedIcon className="w-4 h-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                        >
                          {showCurrentPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>

                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={passwordLoading}
                      required
                      leftIcon={<LockClosedIcon className="w-4 h-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                      }
                      helperText="At least 8 characters with uppercase, lowercase, number, and special character"
                    />
                  </div>

                  {newPassword && (
                    <div className="space-y-2">
                      <Progress
                        value={passwordStrength}
                        max={100}
                        size="sm"
                        variant={getStrengthColor(passwordStrength) as any}
                        showLabel
                      />
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Password strength: <span className="font-medium capitalize">{getStrengthLabel(passwordStrength)}</span>
                      </p>
                    </div>
                  )}

                  <div className="relative">
                    <Input
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={passwordLoading}
                      required
                      leftIcon={<LockClosedIcon className="w-4 h-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                      }
                      error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : undefined}
                    />
                  </div>

                  {passwordError && (
                    <div className="flex items-center gap-2 text-red-500 text-sm" role="alert">
                      <ExclamationTriangleIconSolid className="w-4 h-4" />
                      {passwordError}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                        setPasswordError(null)
                        setPasswordSuccess(false)
                      }}
                      disabled={passwordLoading}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      loading={passwordLoading}
                      disabled={passwordLoading}
                      rightIcon={<CheckCircleIcon className="w-4 h-4" />}
                    >
                      Update Password
                    </Button>
                  </div>

                  {passwordSuccess && (
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                      <CheckCircleIconSolid className="w-4 h-4" />
                      Password updated successfully
                    </div>
                  )}
                </form>
              </Card>
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <div className="mt-4">
              <Card variant="default" padding="lg" className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <EnvelopeIconSolid className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Email Address</h2>
                      <p className="text-sm text-[var(--muted-foreground)]">Manage your account email address</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-w-md">
                  <div className="p-4 bg-[var(--muted)] rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--card)] flex items-center justify-center">
                          <EnvelopeIcon className="w-5 h-5 text-[var(--muted-foreground)]" />
                        </div>
                        <div>
                          <p className="text-sm text-[var(--muted-foreground)]">Current Email</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                      </div>
                      {emailPending && (
                        <Badge variant="warning" dot>Pending Verification</Badge>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleEmailChange} className="space-y-4">
                    <Input
                      label="New Email Address"
                      type="email"
                      placeholder="Enter new email address"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={emailLoading}
                      required
                      leftIcon={<EnvelopeIcon className="w-4 h-4" />}
                      helperText="A verification email will be sent to the new address"
                    />

                    {emailError && (
                      <div className="flex items-center gap-2 text-red-500 text-sm" role="alert">
                        <ExclamationTriangleIconSolid className="w-4 h-4" />
                        {emailError}
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                      <Button
                        variant="primary"
                        type="submit"
                        loading={emailLoading}
                        disabled={emailLoading || !newEmail.trim()}
                        rightIcon={<CheckCircleIcon className="w-4 h-4" />}
                      >
                        {emailPending ? 'Verification Pending' : 'Update Email'}
                      </Button>
                    </div>

                    {emailSuccess && !emailPending && (
                      <div className="flex items-center gap-2 text-green-500 text-sm">
                        <CheckCircleIconSolid className="w-4 h-4" />
                        Verification email sent successfully
                      </div>
                    )}
                  </form>

                  {emailPending && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-blue-300 mb-1">Verification Email Sent</h3>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            A verification link has been sent to <strong>{newEmail}</strong>.
                            Please check your inbox and click the link to confirm your new email address.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Phone Tab */}
          <TabsContent value="phone">
            <div className="mt-4">
              <Card variant="default" padding="lg" className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <PhoneIconSolid className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Phone Number</h2>
                      <p className="text-sm text-[var(--muted-foreground)]">Add or update your phone number for account security</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-w-md">
                  <div className="p-4 bg-[var(--muted)] rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--card)] flex items-center justify-center">
                          <PhoneIcon className="w-5 h-5 text-[var(--muted-foreground)]" />
                        </div>
                        <div>
                          <p className="text-sm text-[var(--muted-foreground)]">Current Phone</p>
                          <p className="font-medium">
                            {user.phone ? (
                              <>
                                {user.phone}
                                {user.phone_verified && (
                                  <Badge variant="success" dot className="ml-2" size="sm">Verified</Badge>
                                )}
                                {!user.phone_verified && (
                                  <Badge variant="warning" dot className="ml-2" size="sm">Unverified</Badge>
                                )}
                              </>
                            ) : (
                              <span className="text-[var(--muted-foreground)]">Not set</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!phoneVerifying ? (
                    <form onSubmit={handlePhoneUpdate} className="space-y-4">
                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="Enter phone number (e.g., +1 555 123 4567)"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        disabled={phoneLoading}
                        required
                        leftIcon={<PhoneIcon className="w-4 h-4" />}
                        helperText="A verification code will be sent via SMS"
                      />

                      {phoneError && (
                        <div className="flex items-center gap-2 text-red-500 text-sm" role="alert">
                          <ExclamationTriangleIconSolid className="w-4 h-4" />
                          {phoneError}
                        </div>
                      )}

                      <Button
                        variant="primary"
                        type="submit"
                        loading={phoneLoading}
                        disabled={phoneLoading || !newPhone.trim()}
                        rightIcon={<CheckCircleIcon className="w-4 h-4" />}
                      >
                        {user.phone ? 'Update Phone Number' : 'Add Phone Number'}
                      </Button>

                      {phoneSuccess && (
                        <div className="flex items-center gap-2 text-green-500 text-sm">
                          <CheckCircleIconSolid className="w-4 h-4" />
                          Verification code sent successfully
                        </div>
                      )}
                    </form>
                  ) : (
                    <form onSubmit={handlePhoneVerify} className="space-y-4">
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                          <ExclamationTriangleIconSolid className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-amber-300 mb-1">Verify Your Phone Number</h3>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              Enter the 6-digit code sent via SMS to <strong>{newPhone}</strong>
                            </p>
                          </div>
                        </div>
                      </div>

                      <Input
                        label="Verification Code"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={phoneOTP}
                        onChange={(e) => setPhoneOTP(e.target.value)}
                        disabled={phoneLoading}
                        required
                        maxLength={6}
                        leftIcon={<ShieldCheckIcon className="w-4 h-4" />}
                      />

                      {phoneError && (
                        <div className="flex items-center gap-2 text-red-500 text-sm" role="alert">
                          <ExclamationTriangleIconSolid className="w-4 h-4" />
                          {phoneError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          variant="primary"
                          type="submit"
                          loading={phoneLoading}
                          disabled={phoneLoading || !phoneOTP.trim()}
                          rightIcon={<CheckCircleIcon className="w-4 h-4" />}
                        >
                          Verify
                        </Button>
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={handleResendPhoneVerification}
                          disabled={phoneLoading}
                        >
                          Resend Code
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <div className="mt-4">
              <Card variant="default" padding="lg" className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                      <ComputerDesktopIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Active Sessions</h2>
                      <p className="text-sm text-[var(--muted-foreground)]">Manage devices signed into your account</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={loadSessions}
                    loading={sessionsLoading}
                    leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                  >
                    Refresh
                  </Button>
                </div>

                <div className="space-y-4">
                  {sessionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-cosmic-500 border-t-transparent rounded-full animate-spin" />
                      <span className="ml-3 text-[var(--muted-foreground)]">Loading sessions...</span>
                    </div>
                  ) : sessionsError ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <ExclamationTriangleIconSolid className="w-5 h-5 text-red-400" />
                        <div>
                          <h3 className="font-semibold text-red-300 mb-1">Failed to Load Sessions</h3>
                          <p className="text-sm text-[var(--muted-foreground)]">{sessionsError}</p>
                        </div>
                      </div>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="p-8 text-center">
                      <DevicePhoneMobileIcon className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No Active Sessions</h3>
                      <p className="text-[var(--muted-foreground)]">No other devices are currently signed in.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((sessionItem) => (
                        <div
                          key={sessionItem.id}
                          className="p-4 bg-[var(--muted)] rounded-xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-[var(--card)] flex items-center justify-center flex-shrink-0">
                              <ComputerDesktopIcon className="w-6 h-6 text-[var(--muted-foreground)]" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{sessionItem.device}</p>
                                {sessionItem.is_current && (
                                  <Badge variant="cosmic" dot size="sm">Current</Badge>
                                )}
                              </div>
                              <p className="text-sm text-[var(--muted-foreground)] truncate">
                                {sessionItem.browser} on {sessionItem.os}
                              </p>
                              <p className="text-xs text-[var(--muted-foreground)]">
                                {sessionItem.location} &bull; {sessionItem.ip}
                              </p>
                              <p className="text-xs text-[var(--muted-foreground)]">
                                Created: {new Date(sessionItem.created_at).toLocaleDateString()} &bull;
                                Last active: {new Date(sessionItem.last_active).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {!sessionItem.is_current && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeSession(sessionItem.id)}
                              disabled={sessionsLoading}
                              className="text-red-400 hover:bg-red-500/10"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {sessions.length > 0 && (
                    <div className="pt-4 border-t border-[var(--border)]">
                      <p className="text-sm text-[var(--muted-foreground)] mb-3">
                        <strong>Note:</strong> The current Supabase configuration only supports revoking all sessions at once.
                        Revoking a session will sign you out on all other devices.
                      </p>
                      <Button
                        variant="danger"
                        onClick={() => handleRevokeSession('all')}
                        loading={sessionsLoading}
                        disabled={sessionsLoading}
                        leftIcon={<ShieldCheckIcon className="w-4 h-4" />}
                      >
                        Revoke All Other Sessions
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="mt-4">
              <Card variant="default" padding="lg" className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                      <BellIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Notifications</h2>
                      <p className="text-sm text-[var(--muted-foreground)]">Choose what notifications you want to receive</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'productUpdates', label: 'Product Updates', description: 'Receive updates about new features, improvements, and announcements' },
                    { key: 'resumeReminders', label: 'Resume Reminders', description: 'Get reminded to update your resume periodically' },
                    { key: 'applicationNotifications', label: 'Application Notifications', description: 'Notifications about your job applications and saved searches' },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-xl">
                      <div className="flex items-center gap-4">
                        <BellIcon className="w-6 h-6 text-[var(--muted-foreground)]" />
                        <div>
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
                        </div>
                      </div>
                      <Toggle
                        checked={notifications[key]}
                        onChange={(e) => handleNotificationChange(key, e.target.checked)}
                        disabled={notificationLoading}
                      />
                    </div>
                  ))}

                  {notificationLoading && (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 border-3 border-cosmic-500 border-t-transparent rounded-full animate-spin" />
                      <span className="ml-3 text-[var(--muted-foreground)]">Saving preferences...</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <div className="mt-4">
              <Card variant="default" padding="lg" className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                      <CpuChipIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Appearance</h2>
                      <p className="text-sm text-[var(--muted-foreground)]">Customize how ResumeForge looks on your device</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { value: 'light', label: 'Light', icon: SunIconSolid, description: 'Always use light mode' },
                      { value: 'dark', label: 'Dark', icon: MoonIconSolid, description: 'Always use dark mode' },
                      { value: 'system', label: 'System', icon: CpuChipIconSolid, description: 'Match your system preference' },
                    ].map(({ value, label, icon: Icon, description }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleThemeChange(value as 'light' | 'dark' | 'system')}
                        className={`relative p-6 rounded-xl border-2 transition-all ${
                          theme === value
                            ? 'border-cosmic-500 bg-cosmic-500/10 shadow-lg shadow-cosmic-500/10'
                            : 'border-[var(--border)] hover:border-cosmic-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Icon className={`w-6 h-6 ${theme === value ? 'text-cosmic-500' : 'text-[var(--muted-foreground)]'}`} />
                          <span className="font-semibold text-lg">{label}</span>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] text-center">{description}</p>
                        {theme === value && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cosmic-500 flex items-center justify-center">
                            <CheckCircleIconSolid className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-[var(--muted)] rounded-xl">
                    <div className="flex items-center gap-3">
                      <Cog6ToothIcon className="w-5 h-5 text-[var(--muted-foreground)]" />
                      <div>
                        <p className="font-medium">Current Theme</p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Resolved: <strong>{resolvedTheme}</strong> &bull;
                          Preference: <strong>{theme}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy & Data Tab */}
          <TabsContent value="privacy">
            <div className="mt-4">
              <Card variant="default" padding="lg" className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                      <ShieldCheckIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Privacy & Data</h2>
                      <p className="text-sm text-[var(--muted-foreground)]">Manage your data and privacy settings</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Export Data */}
                  <div className="p-4 bg-[var(--muted)] rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--card)] flex items-center justify-center">
                          <ArrowDownTrayIcon className="w-6 h-6 text-[var(--muted-foreground)]" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Export All Data</h3>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            Download a JSON file containing your profile, resumes, and settings
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        onClick={handleExportData}
                        loading={exportLoading}
                        disabled={exportLoading}
                        leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                      >
                        Export Data
                      </Button>
                    </div>

                    {exportError && (
                      <div className="mt-3 flex items-center gap-2 text-red-500 text-sm" role="alert">
                        <ExclamationTriangleIconSolid className="w-4 h-4" />
                        {exportError}
                      </div>
                    )}
                  </div>

                  {/* Data Info */}
                  <div className="p-4 border border-[var(--border)] rounded-xl">
                    <h3 className="font-semibold mb-3">What's Included in Export</h3>
                    <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                      <li className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Profile information (name, email, phone, preferences)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        All saved resumes with complete content
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Theme and notification preferences
                      </li>
                      <li className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="font-medium">Excluded:</span> Passwords, authentication tokens, and secret keys
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger">
            <div className="mt-4">
              <Card variant="default" padding="lg" className="border-red-500/20 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                      <ExclamationTriangleIconSolid className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
                      <p className="text-sm text-[var(--muted-foreground)]">Irreversible and destructive actions</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIconSolid className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-red-300 mb-2">Delete Your Account</h3>
                        <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
                          <li>This action is <strong>permanent and cannot be undone</strong></li>
                          <li>All your resumes, profile data, and settings will be deleted</li>
                          <li>Your profile picture will be removed from storage</li>
                          <li>You will be signed out and redirected to the homepage</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    fullWidth
                    onClick={handleDeleteAccountClick}
                    disabled={deleteLoading}
                    leftIcon={<TrashIcon className="w-4 h-4" />}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Account Permanently'}
                  </Button>
                </div>
              </Card>

              {/* Delete Account Confirmation Modal */}
              <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmation('')
                  setDeletePassword('')
                  setDeleteError(null)
                  setDeleteStep('confirm')
                }}
                title="Delete Account"
                description="This action is permanent and cannot be undone."
                size="md"
              >
                {deleteStep === 'confirm' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <ExclamationTriangleIconSolid className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-red-300 mb-2">Delete Your Account</h3>
                          <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
                            <li>This action is <strong>permanent and cannot be undone</strong></li>
                            <li>All your resumes, profile data, and settings will be deleted</li>
                            <li>Your profile picture will be removed from storage</li>
                            <li>You will be signed out and redirected to the homepage</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="label">Type <span className="font-mono text-red-400">DELETE</span> to confirm</label>
                      <Input
                        type="text"
                        placeholder="DELETE"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
                        disabled={deleteLoading}
                        error={deleteConfirmation && deleteConfirmation !== 'DELETE' ? 'Must type DELETE exactly' : undefined}
                        className="font-mono text-center text-lg tracking-widest"
                        autoFocus
                      />
                    </div>

                    {deleteError && (
                      <div className="flex items-center gap-2 text-red-500 text-sm" role="alert">
                        <ExclamationTriangleIconSolid className="w-4 h-4" />
                        {deleteError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => {
                          setShowDeleteModal(false)
                          setDeleteConfirmation('')
                          setDeleteError(null)
                        }}
                        disabled={deleteLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        fullWidth
                        onClick={handleConfirmDeletion}
                        disabled={deleteLoading || deleteConfirmation !== 'DELETE'}
                        leftIcon={<TrashIcon className="w-4 h-4" />}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {deleteStep === 'password' && (
                  <form onSubmit={handleVerifyPassword} className="space-y-4">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <ExclamationTriangleIconSolid className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-amber-300 mb-2">Password Verification Required</h3>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            For security, please enter your current password to confirm this action.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <Input
                        label="Current Password"
                        type={showDeletePassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        disabled={deleteLoading}
                        required
                        leftIcon={<LockClosedIcon className="w-4 h-4" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowDeletePassword(!showDeletePassword)}
                            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                          >
                            {showDeletePassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                          </button>
                        }
                        autoFocus
                      />
                    </div>

                    {deleteError && (
                      <div className="flex items-center gap-2 text-red-500 text-sm" role="alert">
                        <ExclamationTriangleIconSolid className="w-4 h-4" />
                        {deleteError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        fullWidth
                        onClick={() => {
                          setDeleteStep('confirm')
                          setDeletePassword('')
                          setDeleteError(null)
                        }}
                        disabled={deleteLoading}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="danger"
                        fullWidth
                        loading={deleteLoading}
                        disabled={deleteLoading || !deletePassword}
                        leftIcon={<TrashIcon className="w-4 h-4" />}
                      >
                        Delete Account Permanently
                      </Button>
                    </div>
                  </form>
                )}
              </Modal>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </main>
    </div>
  )
}
