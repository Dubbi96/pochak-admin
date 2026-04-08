import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { SidebarProvider } from './contexts/SidebarContext'
import { NaverMapProvider } from './components/naver-map'
import pochakTheme from './lib/muiTheme'
import App from './App.tsx'
import './styles/globals.css'

const NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID ?? ''

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={pochakTheme}>
      <CssBaseline enableColorScheme />
      <BrowserRouter>
        <NaverMapProvider clientId={NAVER_MAP_CLIENT_ID} submodules={['geocoder']}>
          <SidebarProvider>
            <App />
          </SidebarProvider>
        </NaverMapProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
