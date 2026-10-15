import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import type { User as UserType, SessionInfo } from '../types'

interface AuthContextType {
  user: UserType | null
  session: Session | null
  loading: boolean
  signInWithOAuth: (provider: 'google' | 'azure') => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  continueAsGuest: () => Promise<void>
  updateProfile: (data: Partial<UserType>) => Promise<void>
  updateEmail: (newEmail: string) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
  updatePhone: (phone: string) => Promise<void>
  verifyPhone: (token: string) => Promise<void>
  resendPhoneVerification: () => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
  deleteAvatar: () => Promise<void>
  deleteAccount: (confirmation: string) => Promise<void>
  getSessions: () => Promise<SessionInfo[]>
  revokeAllSessions: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        // Check for guest user in localStorage
        try {
          const storedGuest = localStorage.getItem('guest_user')
          if (storedGuest) {
            const guestUser = JSON.parse(storedGuest)
            setUser(guestUser)
          }
        } catch (e) {
          console.error('Failed to restore guest user:', e)
        }
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          first_name: data.first_name,
          last_name: data.last_name,
          avatar_url: data.avatar_url,
          phone: data.phone,
          phone_verified: data.phone_verified,
          provider: data.provider,
          created_at: data.created_at,
          updated_at: data.updated_at,
          preferences: data.preferences,
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signInWithOAuth = useCallback(async (provider: 'google' | 'azure') => {
    const redirectUrl = `${window.location.origin}/auth/callback`
    
    // Provider-specific options
    const providerOptions: Record<string, { scopes?: string; queryParams?: Record<string, string> }> = {
      google: {
        scopes: 'email profile',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
      azure: {
        scopes: 'email',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }
    
    const options = providerOptions[provider] || {}
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        scopes: options.scopes,
        queryParams: options.queryParams,
      },
    })
    if (error) throw error
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setSession(null)
  }, [])

  const continueAsGuest = useCallback(async () => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const guestUser: UserType = {
      id: guestId,
      email: `guest_${guestId}@resumeforge.local`,
      full_name: 'Guest User',
      provider: 'guest',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      preferences: {
        theme: 'dark',
        auto_save: true,
        notifications: false,
      },
    }
    setUser(guestUser)
    setSession(null)
    localStorage.setItem('guest_user', JSON.stringify(guestUser))
  }, [])

  const updateProfile = useCallback(async (data: Partial<UserType>) => {
    if (!session?.user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        ...data,
        updated_at: new Date().toISOString(),
      })

    if (error) throw error
    
    setUser(prev => prev ? { ...prev, ...data } : null)
  }, [session])

  const updateEmail = useCallback(async (newEmail: string) => {
    if (!session?.user) throw new Error('No active session')

    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) throw error

    // Update profile table as well
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ email: newEmail, updated_at: new Date().toISOString() })
      .eq('id', session.user.id)
    
    if (profileError) throw profileError

    setUser(prev => prev ? { ...prev, email: newEmail } : null)
  }, [session])

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!session?.user) throw new Error('No active session')
    if (!session.user.email) throw new Error('No email associated with account')

    // First verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword,
    })
    if (signInError) throw new Error('Current password is incorrect')

    // Update password
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }, [session])

  const updatePhone = useCallback(async (phone: string) => {
    if (!session?.user) throw new Error('No active session')

    const { error } = await supabase.auth.updateUser({ phone })
    if (error) throw error

    // Update profile table as well
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ phone, phone_verified: false, updated_at: new Date().toISOString() })
      .eq('id', session.user.id)
    
    if (profileError) throw profileError

    setUser(prev => prev ? { ...prev, phone, phone_verified: false } : null)
  }, [session])

  const verifyPhone = useCallback(async (token: string) => {
    if (!session?.user) throw new Error('No active session')

    const { error } = await supabase.auth.verifyOtp({
      phone: session.user.phone || '',
      token,
      type: 'sms',
    })
    if (error) throw error

    // Update profile table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ phone_verified: true, updated_at: new Date().toISOString() })
      .eq('id', session.user.id)
    
    if (profileError) throw profileError

    setUser(prev => prev ? { ...prev, phone_verified: true } : null)
  }, [session])

  const resendPhoneVerification = useCallback(async () => {
    if (!session?.user || !session.user.phone) throw new Error('No phone number set')

    const { error } = await supabase.auth.signInWithOtp({
      phone: session.user.phone,
    })
    if (error) throw error
  }, [session])

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    if (!session?.user) throw new Error('No active session')

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPEG, PNG, WebP, or GIF.')
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 5MB.')
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${session.user.id}/avatar-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Update profile with new avatar URL
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', session.user.id)
    
    if (profileError) throw profileError

    setUser(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
    return publicUrl
  }, [session])

  const deleteAvatar = useCallback(async () => {
    if (!session?.user) throw new Error('No active session')

    // Delete from storage
    const { data: files } = await supabase.storage
      .from('avatars')
      .list(session.user.id)
    
    if (files && files.length > 0) {
      const filePaths = files.map(f => `${session.user.id}/${f.name}`)
      await supabase.storage.from('avatars').remove(filePaths)
    }

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq('id', session.user.id)
    
    if (error) throw error

    setUser(prev => prev ? { ...prev, avatar_url: undefined } : null)
  }, [session])

  const deleteAccount = useCallback(async (confirmation: string) => {
    if (!session?.user) throw new Error('No active session')
    if (confirmation !== 'DELETE') throw new Error('Invalid confirmation')

    const response = await fetch(`${EDGE_FUNCTION_URL}/delete-account`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ confirmation }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to delete account')

    // Sign out locally
    setUser(null)
    setSession(null)
  }, [session])

  const getSessions = useCallback(async (): Promise<SessionInfo[]> => {
    if (!session?.user) throw new Error('No active session')

    const response = await fetch(`${EDGE_FUNCTION_URL}/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to fetch sessions')
    return data.sessions || []
  }, [session])

  const revokeAllSessions = useCallback(async () => {
    if (!session?.user) throw new Error('No active session')

    const response = await fetch(`${EDGE_FUNCTION_URL}/sessions`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ revokeAll: true }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to revoke sessions')
    return data
  }, [session])

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithOAuth,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      continueAsGuest,
      updateProfile,
      updateEmail,
      updatePassword,
      updatePhone,
      verifyPhone,
      resendPhoneVerification,
      uploadAvatar,
      deleteAvatar,
      deleteAccount,
      getSessions,
      revokeAllSessions,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}