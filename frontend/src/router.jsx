import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute'
import Intro from './pages/Intro'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Forgotpassword from './pages/Forgotpassword'
import Resetpassword from './pages/Resetpassword'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Intro />} />
        
        {/* Guest-only routes (redirect if logged in) */}
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

        {/* Protected routes (require authentication) */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter