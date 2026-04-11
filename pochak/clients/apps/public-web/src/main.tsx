import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import './i18n/i18n' // Initialize i18n
import { Agentation } from 'agentation'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      {import.meta.env.DEV && <Agentation endpoint="http://localhost:4747" />}
    </BrowserRouter>
  </StrictMode>,
)
