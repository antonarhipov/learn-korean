import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePerformanceMonitor } from '../utils/performanceMonitor'

const Layout = ({ children }) => {
  const location = useLocation()
  const { measureRender, measureAsync } = usePerformanceMonitor('Layout')

  const isActive = (path) => {
    return location.pathname === path
  }

  // Monitor navigation performance
  useEffect(() => {
    measureAsync('navigation', async () => {
      // Simulate navigation completion
      await new Promise(resolve => setTimeout(resolve, 0))
      return `Navigated to ${location.pathname}`
    })
  }, [location.pathname, measureAsync])

  return (
    <div className="layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Learn Korean</h1>
          <p className="sidebar-subtitle">Interactive Language Learning</p>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h2 className="nav-section-title">Main</h2>
            <Link 
              to="/" 
              className={`nav-item ${isActive('/') ? 'active' : ''}`}
            >
              <span className="nav-item-icon">🏠</span>
              Home
            </Link>
            <Link 
              to="/lessons" 
              className={`nav-item ${isActive('/lessons') ? 'active' : ''}`}
            >
              <span className="nav-item-icon">📚</span>
              Lessons
            </Link>
            <Link 
              to="/progress" 
              className={`nav-item ${isActive('/progress') ? 'active' : ''}`}
            >
              <span className="nav-item-icon">📊</span>
              Progress
            </Link>
          </div>
          
          <div className="nav-section">
            <h2 className="nav-section-title">Settings</h2>
            <Link 
              to="/settings" 
              className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
            >
              <span className="nav-item-icon">⚙️</span>
              Settings
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="main-body">
          <div className="page-container">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout