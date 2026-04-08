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

  /**
   * Initialize auth state on app load
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)

        // Check if user is logged in with Supabase
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth error:', error)
          setIsAuthenticated(false)
          setLoading(false)
          return
        }

        if (data.session) {
          // User is logged in - fetch profile from backend
          const response = await apiClient.getCurrentUser()

          if (response.success) {
            setUser(response.data)
            setSession(data.session)
            setIsAuthenticated(true)
          } else {
            setIsAuthenticated(false)
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Error initializing auth:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User just signed in
          const response = await apiClient.loginUser()
          if (response.success) {
            setUser(response.data.user)
            setSession(response.data.session)
            setIsAuthenticated(true)
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          setUser(null)
          setSession(null)
          setIsAuthenticated(false)
        } else if (event === 'TOKEN_REFRESHED') {
          // Token was refreshed
          setSession(session)
        }
      }
    )

    // Listen for unauthorized events
    const handleUnauthorized = () => {
      setUser(null)
      setSession(null)
      setIsAuthenticated(false)
      setError('Your session has expired. Please login again.')
    }

    window.addEventListener('unauthorized', handleUnauthorized)

    // Cleanup
    return () => {
      listener?.subscription.unsubscribe()
      window.removeEventListener('unauthorized', handleUnauthorized)
    }
  }, [])

  /**
   * Register with email and password
   */
  const register = useCallback(async (email, password, username) => {
    try {
      setError(null)
      setLoading(true)

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

      // Create user profile in backend
      const response = await apiClient.registerUser(data.user, username)

      if (!response.success) {
        throw new Error(response.error)
      }

      setUser(response.data)
      setIsAuthenticated(true)

      return { success: true, message: 'Registration successful! Please verify your email.' }
    } catch (err) {
      const message = err.message || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Login with email and password
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null)
      setLoading(true)

      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        throw signInError
      }

      if (!data.session) {
        throw new Error('Login failed')
      }

      // Create session in backend
      const response = await apiClient.loginUser()

      if (!response.success) {
        throw new Error(response.error)
      }

      setUser(response.data.user)
      setSession(data.session)
      setIsAuthenticated(true)

      return { success: true }
    } catch (err) {
      const message = err.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Login with OAuth provider (Google, etc.)
   */
  const loginWithOAuth = useCallback(async (provider) => {
    try {
      setError(null)

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
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setError(null)

      // Revoke session in backend
      if (session?.id) {
        await apiClient.logoutUser(session.id)
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)
      setSession(null)
      setIsAuthenticated(false)

      return { success: true }
    } catch (err) {
      const message = err.message || 'Logout failed'
      setError(message)
      return { success: false, error: message }
    }
  }, [session])

  /**
   * Update user profile
   */
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

  /**
   * Block a user
   */
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

  /**
   * Unblock a user
   */
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