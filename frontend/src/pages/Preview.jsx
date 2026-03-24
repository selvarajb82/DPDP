import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScoreGauge } from '../components/ScoreGauge.jsx'
import { ReportPreview } from '../components/ReportPreview.jsx'
import { PaymentButton } from '../components/PaymentButton.jsx'

export default function Preview() {
  const navigate = useNavigate()
  const [previewData, setPreviewData] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('preview_data')
    if (!stored) {
      navigate('/')
      return
    }
    setPreviewData(JSON.parse(stored))
  }, [navigate])

  if (!previewData) return null

  const { risk_score, preview_data, is_paid, access_token } = previewData

  if (is_paid && access_token) {
    navigate(`/report/${access_token}`)
    return null
  }

  const email = localStorage.getItem('user_email') || null

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="font-bold text-white text-lg" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              DPDP Checker
            </span>
          </button>
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
            Step 2 of 3 · Risk Score
          </div>
        </div>
      </nav>

      <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />

      <div className="relative pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              Your DPDP Compliance Score
            </h1>
            <p className="text-slate-400">Based on your assessment answers</p>
          </div>

          {/* Score card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 mb-6">
            <div className="flex justify-center mb-8">
              <ScoreGauge
                score={risk_score}
                riskLevel={preview_data?.risk_level || 'Medium'}
              />
            </div>
            <ReportPreview
              previewData={preview_data}
              onUnlock={() => document.getElementById('payment-section').scrollIntoView({ behavior: 'smooth' })}
            />
          </div>

          {/* Payment card */}
          <div id="payment-section" className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/20 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-2">Step 3 of 3</div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Unlock Your Full Report</h2>
              <p className="text-slate-400 text-sm">Get the complete analysis, action plan, templates and PDF</p>
            </div>
            <PaymentButton email={email} />
          </div>
        </div>
      </div>
    </div>
  )
}
