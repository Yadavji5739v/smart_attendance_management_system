import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login      from './components/Login'
import QRGenerator from './components/QRGenerator'
import QRScanner  from './components/QRScanner'
import Analytics  from './components/Analytics'

// Guard: redirect to login if not logged in
function Protected({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) return <Navigate to="/" replace />
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Login />} />

        {/* Faculty routes */}
        <Route path="/faculty"  element={
          <Protected allowedRoles={['faculty', 'admin']}>
            <QRGenerator />
          </Protected>
        } />

        {/* Student routes */}
        <Route path="/student"  element={
          <Protected allowedRoles={['student']}>
            <QRScanner />
          </Protected>
        } />

        {/* Analytics - all roles */}
        <Route path="/analytics" element={
          <Protected>
            <Analytics />
          </Protected>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
