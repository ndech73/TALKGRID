import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Intro from './pages/Intro'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter