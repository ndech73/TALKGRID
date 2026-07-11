// frontend/src/router.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from './shared/components/ProtectedRoute'
import Intro from './features/auth/pages/Intro'
import HomeIntro from './features/auth/pages/HomeIntro'
import Home from './features/chat/pages/HomePage'
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import Forgotpassword from './features/auth/pages/Forgotpassword'
import Resetpassword from './features/auth/pages/Resetpassword'
import ProfilePage from './features/profile/pages/ProfilePage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <GuestRoute>
              <Intro />
            </GuestRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <GuestRoute>
              <Forgotpassword />
            </GuestRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <GuestRoute>
              <Resetpassword />
            </GuestRoute>
          } 
        />
        <Route 
          path="/home-intro" 
          element={
            <ProtectedRoute>
              <HomeIntro />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/:username" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter