import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { Toaster } from 'sonner'
import { BrowserRouter } from 'react-router-dom'
import { DashboardProvider } from './context/DashboardContext.jsx'
import { CourseContex } from './context/CourseContex.jsx'
import { CourseManagementProvider } from './context/CourseManagementContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <DashboardProvider>
          <CourseContex>
            <CourseManagementProvider>
              <App />
            </CourseManagementProvider>
          </CourseContex>
        </DashboardProvider>
        <Toaster position="top-right" richColors />
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
