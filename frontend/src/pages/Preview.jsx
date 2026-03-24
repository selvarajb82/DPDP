import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper.jsx'
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
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your DPDP Compliance Score</h1>
          <p className="text-gray-500 mt-1">Based on your assessment answers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
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

        <div id="payment-section" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <PaymentButton email={email} />
        </div>
      </div>
    </PageWrapper>
  )
}
