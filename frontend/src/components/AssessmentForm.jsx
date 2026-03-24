import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ProgressBar } from './ProgressBar.jsx'
import { QuestionCard } from './QuestionCard.jsx'
import { GradientButton } from './ui/GradientButton.jsx'
import api from '../api/client.js'

const QUESTIONS = [
  { key: 'business_type', category: 'Business Identity', text: 'What type of business are you?', hint: 'This helps us tailor the DPDP analysis to your industry.' },
  { key: 'product_description', category: 'Business Identity', text: 'What does your app or website do?', hint: 'Briefly describe the core purpose (e.g., "We help users book appointments").' },
  { key: 'country', category: 'Business Identity', text: 'Where is your business registered?', hint: 'DPDP Act applies to any business collecting data of Indian citizens.' },
  { key: 'pii_collected', category: 'Data Collection', text: 'Do you collect names, emails, phone numbers, Aadhaar, or PAN numbers?', hint: 'This is "personal data" under the DPDP Act.' },
  { key: 'location_data', category: 'Data Collection', text: 'Do you collect location data from users?', hint: 'GPS, IP-based location, delivery addresses, etc.' },
  { key: 'sensitive_data', category: 'Data Collection', text: 'Do you collect health, financial, or biometric data?', hint: 'This is "sensitive personal data" with stricter rules under DPDP.' },
  { key: 'data_storage_location', category: 'Data Storage', text: 'Where is your user data stored?', hint: 'DPDP Act has data localisation requirements for certain categories.' },
  { key: 'cloud_provider', category: 'Data Storage', text: 'Which cloud provider do you use?', hint: 'This affects data residency compliance.' },
  { key: 'retention_period', category: 'Data Storage', text: 'How long do you retain user data?', hint: 'DPDP requires you to delete data when its purpose is fulfilled.' },
  { key: 'third_party_sharing', category: 'Data Sharing', text: 'Do you share user data with third parties?', hint: 'Partners, vendors, or data processors.' },
  { key: 'analytics_tools', category: 'Data Sharing', text: 'Do you use Google Analytics, Mixpanel, or similar analytics tools?', hint: 'These tools transfer data to third-party servers.' },
  { key: 'ad_platforms', category: 'Data Sharing', text: 'Do you use advertising platforms (Google Ads, Meta, etc.)?', hint: 'Ad tracking involves significant data sharing.' },
  { key: 'deletion_requests', category: 'User Rights', text: 'Can users request deletion of their personal data?', hint: 'Right to erasure is a core DPDP requirement.' },
  { key: 'privacy_policy', category: 'User Rights', text: 'Do you have a privacy policy?', hint: 'DPDP mandates a clear, accessible privacy notice.' },
  { key: 'consent_mechanism', category: 'User Rights', text: 'Do you obtain explicit consent before collecting personal data?', hint: 'Consent must be free, specific, informed, and unambiguous.' },
]

export function AssessmentForm() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [showIntro, setShowIntro] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleAnswer = (key, value) => {
    const newAnswers = { ...answers, [key]: value }
    setAnswers(newAnswers)
    if (currentIndex < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 200)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const startRes = await api.post('/api/assessment/start', {
        answers,
        email: email || null,
        business_name: businessName || null,
      })
      const { session_token, assessment_id } = startRes.data
      localStorage.setItem('session_token', session_token)
      localStorage.setItem('assessment_id', assessment_id)
      if (email) localStorage.setItem('user_email', email)

      const previewRes = await api.post('/api/assessment/preview')
      localStorage.setItem('preview_data', JSON.stringify(previewRes.data))
      navigate('/preview')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const isLastQuestion = currentIndex === QUESTIONS.length - 1
  const allAnswered = Object.keys(answers).length === QUESTIONS.length

  if (showIntro) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <h2 className="text-2xl font-bold text-white">Before we start</h2>
        <p className="text-slate-400">This takes about 3–5 minutes. We'll ask 15 questions about your data practices.</p>
        <div className="space-y-4 text-left max-w-sm mx-auto">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Business Name <span className="text-slate-500">(optional)</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Acme Technologies"
              className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email <span className="text-slate-500">(to receive your report link)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <GradientButton onClick={() => setShowIntro(false)}>
          Start Assessment →
        </GradientButton>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <ProgressBar current={currentIndex + 1} total={QUESTIONS.length} />
      <QuestionCard
        question={QUESTIONS[currentIndex]}
        questionIndex={currentIndex}
        onAnswer={handleAnswer}
      />
      {isLastQuestion && allAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}
          <GradientButton
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full justify-center"
          >
            {submitting ? 'Analysing your answers...' : 'Get My DPDP Risk Score →'}
          </GradientButton>
        </motion.div>
      )}
    </div>
  )
}
