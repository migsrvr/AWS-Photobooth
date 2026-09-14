import { Routes, Route } from 'react-router-dom'
import IdlePage from './pages/IdlePage'
import InitialCapturePage from './pages/InitialCapturePage'
import CapturePage from './pages/CapturePage'
import VideoPreviewPage from './pages/VideoPreviewPage'
import PreviewPage from './pages/PreviewPage'
import ThankYouPage from './pages/ThankYouPage'

export default function App() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<IdlePage />} />
        <Route path="/ready" element={<InitialCapturePage />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/video" element={<VideoPreviewPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
    </div>
  )
}
