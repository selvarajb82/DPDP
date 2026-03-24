import { useState } from 'react'
import api from '../api/client.js'

export function useAssessment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submitAssessment = async ({ answers, email, businessName }) => {
    setLoading(true)
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

      const previewRes = await api.post('/api/assessment/preview')
      localStorage.setItem('preview_data', JSON.stringify(previewRes.data))

      return { success: true, previewData: previewRes.data }
    } catch (err) {
      const msg = err.response?.data?.error || 'Assessment failed. Please try again.'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  return { submitAssessment, loading, error }
}
