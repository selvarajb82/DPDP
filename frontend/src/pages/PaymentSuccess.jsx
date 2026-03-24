import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageWrapper } from '../components/layout/PageWrapper.jsx'
import api from '../api/client.js'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    const assessmentId = localStorage.getItem('assessment_id')
    if (!assessmentId) {
      navigate('/')
      return
    }

    let attempts = 0
    const maxAttempts = 20

    const poll = setInterval(async () => {
      attempts++
      try {
        const res = await api.get(`/api/assessment/${assessmentId}`)
        const { is_paid, access_token, status: assessmentStatus } = res.data

        if (is_paid && access_token) {
          clearInterval(poll)
          navigate(`/report/${access_token}`)
        } else if (assessmentStatus === 'paid') {
          setStatus('generating')
        }
      } catch {
        // keep polling
      }

      if (attempts >= maxAttempts) {
        clearInterval(poll)
        setStatus('timeout')
      }
    }, 5000)

    return () => clearInterval(poll)
  }, [navigate])

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        {status === 'timeout' ? (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Your report is being generated. Check your email for the access link, or{' '}
              <button onClick={() => window.location.reload()} className="text-blue-600 underline">
                refresh this page
              </button>.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {status === 'generating' ? 'Generating your full report...' : 'Payment confirmed!'}
            </h1>
            <p className="text-gray-600">
              {status === 'generating'
                ? 'Claude AI is analysing your complete answers against the DPDP Act. This takes about 30 seconds.'
                : 'Verifying your payment...'}
            </p>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}
