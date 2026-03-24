import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageWrapper } from '../components/layout/PageWrapper.jsx'
import { ScoreGauge } from '../components/ScoreGauge.jsx'
import { GradientButton } from '../components/ui/GradientButton.jsx'
import { useReport } from '../hooks/useReport.js'

const SEVERITY_COLORS = {
  Critical: 'border-red-200 bg-red-50',
  High: 'border-orange-200 bg-orange-50',
  Medium: 'border-yellow-200 bg-yellow-50',
  Low: 'border-green-200 bg-green-50',
}
const SEVERITY_BADGE = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
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
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
      />
    </div>
  )

  if (isGenerating) return (
    <PageWrapper>
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
        />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Generating your full report...</h1>
        <p className="text-gray-500">Claude AI is analysing all 15 answers. Check back in 30 seconds.</p>
      </div>
    </PageWrapper>
  )

  if (error) return (
    <PageWrapper>
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <GradientButton onClick={() => navigate('/')}>Go Home</GradientButton>
      </div>
    </PageWrapper>
  )

  const fullData = data?.full_data || {}
  const scoreBreakdown = fullData.score_breakdown || {}
  const allGaps = fullData.all_gaps || []
  const actionPlan = fullData.action_plan || []
  const compliantAreas = fullData.compliant_areas || []

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DPDP Compliance Report</h1>
            {data?.business_name && <p className="text-gray-500">{data.business_name}</p>}
          </div>
          <GradientButton onClick={handleDownloadPdf}>Download PDF ↓</GradientButton>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 mb-6 flex justify-center">
          <ScoreGauge score={data?.risk_score} riskLevel={data?.preview_data?.risk_level || 'Medium'} />
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-2">Executive Summary</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{fullData.executive_summary}</p>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Score by Category</h2>
          <div className="space-y-3">
            {Object.entries(scoreBreakdown).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-40 capitalize">{key.replace(/_/g, ' ')}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-10 text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">All Compliance Gaps ({allGaps.length})</h2>
          <div className="space-y-4">
            {allGaps.map((gap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`border rounded-xl p-4 ${SEVERITY_COLORS[gap.severity] || 'border-gray-200 bg-white'}`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SEVERITY_BADGE[gap.severity] || 'bg-gray-100 text-gray-700'}`}>
                    {gap.severity}
                  </span>
                  <span className="text-xs text-gray-500">{gap.dpdp_clause}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{gap.title}</h3>
                <p className="text-sm text-gray-700 mb-2">{gap.description}</p>
                <p className="text-xs text-gray-500 mb-2"><strong>Impact:</strong> {gap.business_impact}</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {(gap.remediation_steps || []).map((s, j) => (
                    <li key={j} className="flex gap-2"><span className="text-blue-500">→</span>{s}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Prioritised Action Plan</h2>
          <div className="space-y-3">
            {actionPlan.map((action, i) => (
              <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {action.priority}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{action.action}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-gray-500">Due: {action.deadline}</span>
                    <span className="text-xs text-gray-500">Effort: {action.effort}</span>
                    <span className="text-xs text-gray-400">{action.dpdp_clause}</span>
                  </div>
                  {action.template_text && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">View template text</summary>
                      <p className="text-xs text-gray-600 mt-1 p-2 bg-white rounded border">{action.template_text}</p>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {compliantAreas.length > 0 && (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">What You're Doing Right</h2>
            <div className="space-y-3">
              {compliantAreas.map((area, i) => (
                <div key={i} className="flex gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                  <span className="text-green-600 font-bold">✓</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{area.area}</p>
                    <p className="text-xs text-gray-600">{area.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center py-8">
          <GradientButton onClick={handleDownloadPdf} className="text-lg px-10">
            Download Full Report as PDF ↓
          </GradientButton>
          <p className="text-xs text-gray-400 mt-2">This link works forever — bookmark it for re-access</p>
        </div>
      </div>
    </PageWrapper>
  )
}
