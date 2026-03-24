import { useState, useEffect } from 'react'
import api from '../api/client.js'

export function useReport(accessToken) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!accessToken) {
      setError('No access token provided')
      setLoading(false)
      return
    }

    let pollInterval

    const fetchReport = async () => {
      try {
        const res = await api.get(`/api/report/${accessToken}`)
        if (res.status === 202) {
          setIsGenerating(true)
          return
        }
        setData(res.data)
        setIsGenerating(false)
        if (pollInterval) clearInterval(pollInterval)
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Payment required to view this report.')
        } else if (err.response?.status === 404) {
          setError('Report not found.')
        } else {
          setError('Failed to load report. Please refresh.')
        }
        if (pollInterval) clearInterval(pollInterval)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
    pollInterval = setInterval(fetchReport, 5000)

    return () => clearInterval(pollInterval)
  }, [accessToken])

  return { data, loading, error, isGenerating }
}
