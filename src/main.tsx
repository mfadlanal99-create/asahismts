import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Handle Vite dynamic import / chunk load failures when a new release hash is deployed
const PRELOAD_RETRY_KEY = 'asahi_vite_preload_retry';

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const hasRetried = sessionStorage.getItem(PRELOAD_RETRY_KEY);
  if (!hasRetried) {
    sessionStorage.setItem(PRELOAD_RETRY_KEY, 'true');
    window.location.reload();
  }
});

// Clear retry flag after successful initial load
try {
  sessionStorage.removeItem(PRELOAD_RETRY_KEY);
} catch {
  // ignore storage errors
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
