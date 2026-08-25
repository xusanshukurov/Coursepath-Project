import React, { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainPage from './pages/MainPage'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import Resourses from './pages/Resourses'
import Progress from './pages/Progress'
import Profile from './pages/Profile'
import AuthPage from './components/AuthPage'
import AdminDashboard from './pages/AdminDashboard'
import CourseManagement from './pages/CourseManagement'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import AdminRoute from './components/AdminRoute'
import VideoPlayer from './components/VideoPlayer'
import { VideoManagement } from './components/videoManagement'

function App() {
  const { profile } = useAuth()
    

  return (
    <>
      <Routes>
        <Route path='/login' element={<AuthPage />} />
        <Route path='/' element={<ProtectedRoute><MainPage /></ProtectedRoute>}>
          <Route index element={profile?.role === 'admin' ? <AdminDashboard /> : <Dashboard />} />
          <Route path='kurslar' element={<Courses />}/>
          <Route path='kurslar/:slug' element={<VideoPlayer/>}/>
          <Route path='manbalar' element={<Resourses />} />
          <Route path='jarayon' element={<Progress />} />
          <Route path='profil' element={<Profile />} />
          <Route path='boshqaruv' element={
            <AdminRoute>
              <CourseManagement />
            </AdminRoute>} />
          <Route path='boshqaruv/:slug' element={<VideoManagement/>} />
        </Route>
      </Routes>
    </>
  )
}

export default App