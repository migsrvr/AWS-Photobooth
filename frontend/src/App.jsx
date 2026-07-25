import { useLocation } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import IdlePage from './pages/IdlePage'
import CapturePage from './pages/CapturePage'
import PreviewPage from './pages/PreviewPage'
import ThankYouPage from './pages/ThankYouPage'
import ClaimPage from './pages/ClaimPage'
import FaultyTerminal from './components/background/FaultyTerminal'

function ViewfinderFrame() {
  return (
    <div className="viewfinder-frame" aria-hidden="true">
      <div className="viewfinder-corner viewfinder-corner--tl" />
      <div className="viewfinder-corner viewfinder-corner--tr" />
      <div className="viewfinder-corner viewfinder-corner--bl" />
      <div className="viewfinder-corner viewfinder-corner--br" />
    </div>
  )
}

function FilmGrain() {
  return <div className="film-grain" aria-hidden="true" />
}

export default function App() {
  const location = useLocation()

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <FaultyTerminal
        scale={1}
        gridMul={[4, 2]}
        digitSize={2.2}
        scanlineIntensity={0.5}
        glitchAmount={1}
        flickerAmount={0.7}
        noiseAmp={0}
        chromaticAberration={0}
        dither={0}
        curvature={0}
        tint="#1c3466"
        mouseReact={true}
        mouseStrength={0.15}
        brightness={0.8}
        pageLoadAnimation={true}
        timeScale={0.6}
      />
      <ViewfinderFrame />
      <FilmGrain />
      <div className="absolute inset-0 z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<IdlePage />} />
            <Route path="/capture" element={<CapturePage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/claim/:sessionId" element={<ClaimPage />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  )
}
