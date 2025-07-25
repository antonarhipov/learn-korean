import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import LessonsList from './pages/LessonsList'
import LessonDetail from './pages/LessonDetail'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import './styles/App.css'

function App() {
  return (
    <div className="App">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lessons" element={<LessonsList />} />
          <Route path="/lessons/:lessonId" element={<LessonDetail />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App