import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Overview from './pages/Overview.jsx'
import Benchmarks from './pages/Benchmarks.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div
        className="flex min-h-screen flex-col"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        <Navbar />

        <div className="flex-1">
          <Routes>
            <Route path="/"            element={<Overview />}   />
            <Route path="/benchmarks"  element={<Benchmarks />} />
            {/* Catch-all — redirect unknown routes to Overview */}
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  )
}
