import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import SplashScreen from './pages/SplashScreen'
import OnboardingScreen from './pages/OnboardingScreen'
import HomeScreen from './pages/HomeScreen'
import OCRReaderScreen from './pages/OCRReaderScreen'
import ObjectDetectionScreen from './pages/ObjectDetectionScreen'
import MedicineReaderScreen from './pages/MedicineReaderScreen'
import CurrencyReaderScreen from './pages/CurrencyReaderScreen'
import ColorOutfitScreen from './pages/ColorOutfitScreen'
import VoiceCompanionScreen from './pages/VoiceCompanionScreen'
import EmergencySOSScreen from './pages/EmergencySOSScreen'
import LanguageScreen from './pages/LanguageScreen'
import SettingsScreen from './pages/SettingsScreen'
import HistoryScreen from './pages/HistoryScreen'

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-surface-950">
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/ocr" element={<OCRReaderScreen />} />
            <Route path="/object-detection" element={<ObjectDetectionScreen />} />
            <Route path="/medicine" element={<MedicineReaderScreen />} />
            <Route path="/currency" element={<CurrencyReaderScreen />} />
            <Route path="/color-outfit" element={<ColorOutfitScreen />} />
            <Route path="/voice-companion" element={<VoiceCompanionScreen />} />
            <Route path="/emergency" element={<EmergencySOSScreen />} />
            <Route path="/language" element={<LanguageScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  )
}

export default App
