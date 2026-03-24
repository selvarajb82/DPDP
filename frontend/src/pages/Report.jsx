import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ScoreGauge } from '../components/ScoreGauge.jsx'
import { useReport } from '../hooks/useReport.js'

const SEVERITY_COLORS = {
  Critical: 'border-red-500/30 bg-red-500/10',
  High: 'border-orange-500/30 bg-orange-500/10',
  Medium: 'border-yellow-500/30 bg-yellow-500/10',
  Low: 'border-green-500/30 bg-green-500/10',
}
const SEVERITY_BADGE = {
  Critical: 'bg-red-500/20 text-red-400',
  High: 'bg-orange-500/20 text-orange-400',
  Medium: 'bg-yellow-500/20 text-yellow-400',
  Low: 'bg-green-500/20 text-green-400',
}

export default function Report() {
  const { accessToken } = useParams()
  const navigate = useNavigate()
  const { data, loading, error, isGenerating } = useReport(accessToken)

  const handleDownloadPdf = () => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    window.open(`${base}/api/report/${accessToken}/pdf`, '_blank')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-indigo-800 border-t-indigo-400 rounded-full"
      />
    </div>
  )

  if (isGenerating) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-indigo-800 border-t-indigo-400 rounded-full mx-auto mb-6"
        />
        <h1 className="text-2xl font-extrabold text-white mb-2">Generating your full report...</h1>
        <p className="text-slate-400">AI is analysing all 15 answers. Check back in 30 seconds.</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-full hover:bg-indigo-500 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  )

  const fullData = data?.full_data || {}
  const scoreBreakdown = fullData.score_breakdown || {}
  const allGaps = fullData.all_gaps || []
  const actionPlan = fullData.action_plan || []
  const compliantAreas = fullData.compliant_areas || []

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
          <button
            onClick={handleDownloadPdf}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
          >
            Download PDF ↓
          </button>
        </div>
      </nav>

      <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />

      <div className="relative pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
              ✓ Payment Confirmed · Full Report Unlocked
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">DPDP Compliance Report</h1>
            {data?.business_name && <p className="text-slate-400">{data.business_name}</p>}
          </div>

          {/* Score */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6 flex justify-center">
            <ScoreGauge score={data?.risk_score} riskLevel={data?.preview_data?.risk_level || 'Medium'} />
          </div>

          {/* Executive Summary */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-white mb-2">Executive Summary</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{fullData.executive_summary}</p>
          </div>

          {/* Score Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-white mb-4">Score by Category</h2>
            <div className="space-y-3">
              {Object.entries(scoreBreakdown).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 w-44 capitalize">{key.replace(/_/g, ' ')}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-2.5">
                    <motion.div
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white w-10 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* All Gaps */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-white mb-4">All Compliance Gaps ({allGaps.length})</h2>
            <div className="space-y-4">
              {allGaps.map((gap, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`border rounded-xl p-4 ${SEVERITY_COLORS[gap.severity] || 'border-slate-700 bg-slate-800'}`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SEVERITY_BADGE[gap.severity] || 'bg-slate-700 text-slate-300'}`}>
                      {gap.severity}
                    </span>
                    <span className="text-xs text-slate-500">{gap.dpdp_clause}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{gap.title}</h3>
                  <p className="text-sm text-slate-300 mb-2">{gap.description}</p>
                  <p className="text-xs text-slate-400 mb-2"><strong className="text-slate-300">Impact:</strong> {gap.business_impact}</p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    {(gap.remediation_steps || []).map((s, j) => (
                      <li key={j} className="flex gap-2"><span className="text-indigo-400">→</span>{s}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-white mb-4">Prioritised Action Plan</h2>
            <div className="space-y-3">
              {actionPlan.map((action, i) => (
                <div key={i} className="flex gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {action.priority}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{action.action}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-slate-400">Due: {action.deadline}</span>
                      <span className="text-xs text-slate-400">Effort: {action.effort}</span>
                      <span className="text-xs text-slate-500">{action.dpdp_clause}</span>
                    </div>
                    {action.template_text && (
                      <details className="mt-2">
                        <summary className="text-xs text-indigo-400 cursor-pointer">View template text</summary>
                        <p className="text-xs text-slate-400 mt-1 p-2 bg-slate-900 rounded border border-slate-700">{action.template_text}</p>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliant Areas */}
          {compliantAreas.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <h2 className="font-bold text-white mb-4">What You're Doing Right ✓</h2>
              <div className="space-y-3">
                {compliantAreas.map((area, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <span className="text-green-400 font-bold">✓</span>
                    <div>
                      <p className="font-medium text-white text-sm">{area.area}</p>
                      <p className="text-xs text-slate-400">{area.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDF Download */}
          <div className="text-center py-8">
            <button
              onClick={handleDownloadPdf}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg shadow-indigo-500/25 transition-all"
            >
              Download Full Report as PDF ↓
            </button>
            <p className="text-xs text-slate-500 mt-3">This link works forever — bookmark it for re-access</p>
          </div>

        </div>
      </div>
    </div>
  )
}
