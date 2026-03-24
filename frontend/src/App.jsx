import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Assessment from './pages/Assessment.jsx'
import Preview from './pages/Preview.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'
import Report from './pages/Report.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/report/:accessToken" element={<Report />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
