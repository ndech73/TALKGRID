import { createContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { apiClient } from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...')

        // Get current session from Supabase
        const { data, error: sessionError } = await supabase.auth.getSession()

        if (!mounted) return

        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          setIsAuthenticated(false)
          setLoading(false)
          return
        }

        if (data.session) {
          console.log('✅ User has active session:', data.session.user.email)
          setSession(data.session)
          setIsAuthenticated(true)

          // Try to fetch full profile from backend
          try {
            const response = await apiClient.getCurrentUser()
            if (response.success && response.data) {
              console.log('✅ Fetched user profile from backend:', response.data)
              setUser(response.data)
            } else {
              // If backend doesn't have profile yet, use Supabase user
              console.log('⚠️ Backend profile not found, using Supabase data')
              setUser(data.session.user)
            }
          } catch (err) {
            console.warn('⚠️ Could not fetch profile:', err)
            setUser(data.session.user)
          }
        } else {
          console.log('❌ No active session')
          setIsAuthenticated(false)
        }

        setLoading(false)
      } catch (err) {
        console.error('❌ Auth initialization error:', err)
        if (mounted) {
          setError(err.message)
          setIsAuthenticated(false)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth event:', event, session?.user?.email)

      if (!mounted) return

      if (event === 'SIGNED_IN' && session) {
        console.log('✅ User signed in')
        setSession(session)
        setIsAuthenticated(true)

        // Sync with backend
        apiClient.loginUser().then(response => {
          if (response.success) {
            console.log('✅ Synced with backend')
            setUser(response.data?.user || session.user)
          } else {
            setUser(session.user)
          }
        }).catch(err => {
          console.warn('⚠️ Backend sync failed:', err)
          setUser(session.user)
        })
      } else if (event === 'SIGNED_OUT') {
        console.log('✅ User signed out')
        setSession(null)
        setUser(null)
        setIsAuthenticated(false)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('🔄 Token refreshed')
        setSession(session)
      }
    })

    // Cleanup
    return () => {
      mounted = false
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const register = useCallback(async (email, password, username) => {
    try {
      setError(null)
      setLoading(true)

      console.log('📝 Registering user:', email)

      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      })

      if (signUpError) {
        throw signUpError
      }

      if (!data.user) {
        throw new Error('Registration failed')
      }

      console.log('✅ User signed up with Supabase')

      // Create user profile in backend
      try {
        const response = await apiClient.registerUser(data.user, username)
        if (response.success) {
          console.log('✅ User profile created in backend')
          setUser(response.data)
        }
      } catch (err) {
        console.warn('⚠️ Backend registration failed, but Supabase signup succeeded')
      }

      return { success: true, message: 'Registration successful! Please verify your email.' }
    } catch (err) {
      const message = err.message || 'Registration failed'
      console.error('❌ Registration error:', message)
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // UPDATED: login now uses backend gateway /api/security/login
  const login = useCallback(async (email, password) => {
    try {
      setError(null)
      setLoading(true)

      console.log('🔑 Logging in (security gateway):', email)

      const response = await apiClient.securityLogin(email, password)

      if (!response.success) {
        // Backend returns meaningful messages for:
        // - 401 invalid credentials
        // - 423 locked (too many attempts)
        // - 429 rate limited (express-rate-limit)
        throw new Error(response.message || response.error || 'Login failed')
      }

      const backendSession = response?.data?.session
      if (!backendSession?.access_token || !backendSession?.refresh_token) {
        throw new Error('Login failed: missing session tokens')
      }

      // Set the session into Supabase client.
      // This triggers onAuthStateChange(SIGNED_IN) which updates state + syncs backend.
      const { data, error: setSessionError } = await supabase.auth.setSession({
        access_token: backendSession.access_token,
        refresh_token: backendSession.refresh_token
      })

      if (setSessionError) {
        throw setSessionError
      }

      if (!data?.session) {
        throw new Error('Login failed - no session created')
      }

      console.log('✅ Signed in via backend gateway + Supabase session set')

      // NOTE: We do not need to manually set user/session here because
      // onAuthStateChange will handle it. But returning success now is helpful.
      return { success: true }
    } catch (err) {
      const message = err.message || 'Login failed'
      console.error('❌ Login error:', message)
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const loginWithOAuth = useCallback(async (provider) => {
    try {
      setError(null)

      console.log('🔑 Logging in with OAuth:', provider)

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/home`
        }
      })

      if (oauthError) {
        throw oauthError
      }

      return { success: true }
    } catch (err) {
      const message = err.message || `${provider} login failed`
      console.error('❌ OAuth error:', message)
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setError(null)

      console.log('👋 Logging out')

      // Revoke session in backend
      if (session?.id) {
        try {
          await apiClient.logoutUser(session.id)
          console.log('✅ Backend logout successful')
        } catch (err) {
          console.warn('⚠️ Backend logout failed')
        }
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)
      setSession(null)
      setIsAuthenticated(false)

      console.log('✅ Logged out successfully')
      return { success: true }
    } catch (err) {
      const message = err.message || 'Logout failed'
      console.error('❌ Logout error:', message)
      setError(message)
      return { success: false, error: message }
    }
  }, [session])

  const updateProfile = useCallback(async (updates) => {
    try {
      setError(null)
      setLoading(true)

      const response = await apiClient.updateUserProfile(updates)

      if (!response.success) {
        throw new Error(response.error)
      }

      setUser(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      const message = err.message || 'Profile update failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const blockUser = useCallback(async (userId) => {
    try {
      setError(null)

      const response = await apiClient.blockUser(userId)

      if (!response.success) {
        throw new Error(response.error)
      }

      return { success: true }
    } catch (err) {
      const message = err.message || 'Failed to block user'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const unblockUser = useCallback(async (userId) => {
    try {
      setError(null)

      const response = await apiClient.unblockUser(userId)

      if (!response.success) {
        throw new Error(response.error)
      }

      return { success: true }
    } catch (err) {
      const message = err.message || 'Failed to unblock user'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    loginWithOAuth,
    logout,
    updateProfile,
    blockUser,
    unblockUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}