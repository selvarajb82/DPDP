import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper.jsx'
import { MeshBackground } from '../components/layout/MeshBackground.jsx'
import { GradientButton } from '../components/ui/GradientButton.jsx'
import { GlassCard } from '../components/ui/GlassCard.jsx'

const HOW_IT_WORKS = [
  { step: '01', title: 'Answer 15 Questions', desc: 'Tell us about your data practices — takes 3–5 minutes.' },
  { step: '02', title: 'Get Instant Risk Score', desc: 'Claude AI analyses your answers against the DPDP Act 2023.' },
  { step: '03', title: 'Unlock Full Report', desc: 'Pay ₹999 to get your complete action plan + PDF download.' },
]

const TRUST_SIGNALS = [
  { icon: '⚡', label: 'Results in 5 minutes' },
  { icon: '🔒', label: 'No account required' },
  { icon: '📄', label: 'PDF download included' },
  { icon: '♾️', label: 'Permanent re-access link' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <PageWrapper>
      <MeshBackground />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide"
          >
            DPDP Act activated November 14, 2025 — Fines up to ₹250 crore
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold text-gray-900 leading-tight mb-4"
          >
            Is your product<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              DPDP compliant?
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            Find out in 5 minutes. Our AI analyses your data practices against India's DPDP Act 2023 and gives you a risk score + action plan. Enterprise tools charge ₹5 lakhs/year. We charge ₹999.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <GradientButton onClick={() => navigate('/assessment')} className="text-lg px-10 py-4">
              Start Free Assessment →
            </GradientButton>
            <p className="text-sm text-gray-400 mt-3">No account required · Free risk score preview</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {TRUST_SIGNALS.map((t) => (
            <motion.div
              key={t.label}
              whileHover={{ y: -2 }}
              className="text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="text-2xl mb-1">{t.icon}</div>
              <p className="text-sm font-medium text-gray-700">{t.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <GlassCard key={item.step} className="text-center">
                <div className="text-4xl font-bold text-blue-100 mb-2">{item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-3">Don't wait for a fine to find out</h2>
          <p className="text-blue-100 mb-6">DPDP Act fines go up to ₹250 crore. A ₹999 report is the cheapest compliance investment you'll make.</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/assessment')}
            className="bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:shadow-lg transition-shadow"
          >
            Start Free Assessment →
          </motion.button>
        </div>
      </div>
    </PageWrapper>
  )
}
