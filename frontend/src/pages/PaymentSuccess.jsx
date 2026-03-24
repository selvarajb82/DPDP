import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
      <div className="relative text-center max-w-md">
        {status === 'timeout' ? (
          <div>
            <div className="text-5xl mb-6">✅</div>
            <h1 className="text-3xl font-extrabold text-white mb-3">Payment confirmed!</h1>
            <p className="text-slate-400 mb-6">
              Your report is being generated. Check your email for the access link, or{' '}
              <button onClick={() => window.location.reload()} className="text-indigo-400 underline">
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
              className="w-16 h-16 border-4 border-indigo-800 border-t-indigo-400 rounded-full mx-auto mb-6"
            />
            <h1 className="text-3xl font-extrabold text-white mb-3">
              {status === 'generating' ? 'Generating your full report...' : 'Payment confirmed!'}
            </h1>
            <p className="text-slate-400">
              {status === 'generating'
                ? 'AI is analysing your complete answers against the DPDP Act. This takes about 30 seconds.'
                : 'Verifying your payment...'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
