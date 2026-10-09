import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import IsoQube from './IsoQube.jsx'
import CursorEffect from './CursorEffect.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <CursorEffect />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/isoqube" element={<IsoQube />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
