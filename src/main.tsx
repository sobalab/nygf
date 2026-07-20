import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import { applySeason } from './lib/season'
import App from './App.tsx'

// Stamp the current season before the first render so the seasonal palette is
// in place from the start (no flash).
applySeason()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
