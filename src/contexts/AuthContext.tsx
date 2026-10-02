import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import type { User as UserType } from '../types'

interface AuthContextType {
  user: UserType | null
  session: Session | null
  loading: boolean
  signInWithOAuth: (provider: 'google' | 'microsoft') => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  continueAsGuest: () => Promise<void>
  updateProfile: (data: Partial<UserType>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
          avatar_url: data.avatar_url,
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

  const signInWithOAuth = useCallback(async (provider: 'google' | 'microsoft') => {
    const redirectUrl = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
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