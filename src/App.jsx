import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import LessonsList from './pages/LessonsList'
import LessonDetail from './pages/LessonDetail'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import './styles/App.css'

function App() {
  return (
    <div className="App">
      <ErrorBoundary
        componentName="Layout"
        title="Navigation Error"
        message="There was an error with the application layout. Please try refreshing the page."
      >
        <Layout>
          <Routes>
            <Route 
              path="/" 
              element={
                <ErrorBoundary
                  componentName="Home Page"
                  title="Home Page Error"
                  message="There was an error loading the home page. Please try again."
                >
                  <Home />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/lessons" 
              element={
                <ErrorBoundary
                  componentName="Lessons List"
                  title="Lessons List Error"
                  message="There was an error loading the lessons list. Please try again."
                >
                  <LessonsList />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/lessons/:lessonId" 
              element={
                <ErrorBoundary
                  componentName="Lesson Detail"
                  title="Lesson Error"
                  message="There was an error loading this lesson. Please try selecting a different lesson or go back to the lessons list."
                >
                  <LessonDetail />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/progress" 
              element={
                <ErrorBoundary
                  componentName="Progress Page"
                  title="Progress Tracking Error"
                  message="There was an error loading your progress data. Please try again."
                >
                  <Progress />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ErrorBoundary
                  componentName="Settings Page"
                  title="Settings Error"
                  message="There was an error loading the settings page. Please try again."
                >
                  <Settings />
                </ErrorBoundary>
              } 
            />
          </Routes>
        </Layout>
      </ErrorBoundary>
    </div>
  )
}

export default App