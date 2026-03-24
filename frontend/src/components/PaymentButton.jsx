import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import api from '../api/client.js'

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function PaymentButton({ email }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handlePayment() {
    setLoading(true)
    setError(null)

    try {
      // Load Razorpay SDK
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        setError('Failed to load payment SDK. Check your connection and try again.')
        setLoading(false)
        return
      }

      // Create order on backend
      const { data: orderData } = await api.post('/api/payment/create-order', { email })

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'DPDP Compliance Checker',
        description: 'Full Compliance Report',
        order_id: orderData.order_id,
        prefill: {
          email: orderData.email || email || '',
        },
        theme: {
          color: '#4F46E5',
        },
        handler: async function (response) {
          // Verify payment on backend
          try {
            const { data: verifyData } = await api.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            if (verifyData.access_token) {
              localStorage.setItem('access_token', verifyData.access_token)
              navigate(`/report/${verifyData.access_token}`)
            } else {
              setError('Payment verified but report not ready. Please refresh in a moment.')
            }
          } catch (err) {
            setError('Payment verification failed. Contact support with your payment ID: ' + response.razorpay_payment_id)
          }
          setLoading(false)
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        setError('Payment failed: ' + (response.error?.description || 'Unknown error'))
        setLoading(false)
      })
      rzp.open()

    } catch (err) {
      const msg = err?.response?.data?.error || 'Could not initiate payment. Please try again.'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="text-center">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-4 rounded-full font-bold text-white text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
      >
        {loading ? 'Opening Payment...' : 'Unlock Full Report — ₹999'}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <p className="text-center text-xs text-gray-400 mt-3">
        Secured by Razorpay · UPI · Cards · Net Banking · Wallets
      </p>
    </div>
  )
}

PaymentButton.propTypes = {
  email: PropTypes.string,
}
