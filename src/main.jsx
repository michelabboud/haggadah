import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './App.jsx'
import './index.css'

async function clearNativeWebViewCache() {
  if (!Capacitor.isNativePlatform() || typeof window === 'undefined') {
    return
  }

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.allSettled(registrations.map((registration) => registration.unregister()))
  }

  if ('caches' in window) {
    const cacheKeys = await window.caches.keys()
    await Promise.allSettled(cacheKeys.map((cacheKey) => window.caches.delete(cacheKey)))
  }
}

clearNativeWebViewCache().catch((error) => {
  console.error('Failed to clear native web caches.', error)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
