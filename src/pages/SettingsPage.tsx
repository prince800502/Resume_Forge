import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Button, Card, Input, Avatar, Divider, Badge, Toggle, Progress 
} from '@/components/ui'
import { 
  CameraIcon, TrashIcon, LockClosedIcon, EyeIcon, EyeSlashIcon,
  CheckCircleIcon, ExclamationTriangleIcon, UserIcon,
  PhotoIcon, PencilIcon
} from '@heroicons/react/24/outline'
import {
  CameraIcon as CameraIconSolid, TrashIcon as TrashIconSolid,
  LockClosedIcon as LockClosedIconSolid, CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  UserIcon as UserIconSolid, PhotoIcon as PhotoIconSolid, PencilIcon as PencilIconSolid
} from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { supabase } from '@/services/supabase'

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, session, updateProfile, updatePassword, uploadAvatar, deleteAvatar, deleteAccount, loading: authLoading } = useAuth()
  
  // Profile state
  const [displayName, setDisplayName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)
  
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
  
  // Delete Account state
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  
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
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cosmic-600 to-nebula-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            Manage your profile, security, and account preferences
          </p>
        </div>
        
        {/* Profile Section */}
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
        
        {/* Change Password Section */}
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
        
        {/* Delete Account Section */}
        <Card variant="default" padding="lg" className="border-red-500/20">
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
              />
            </div>
            
            {deleteError && (
              <div className="flex items-center gap-2 text-red-500 text-sm" role="alert">
                <ExclamationTriangleIconSolid className="w-4 h-4" />
                {deleteError}
              </div>
            )}
            
            <Button
              variant="danger"
              fullWidth
              onClick={handleDeleteAccount}
              disabled={deleteLoading || deleteConfirmation !== 'DELETE'}
              leftIcon={<TrashIcon className="w-4 h-4" />}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Account Permanently'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
    )
  }