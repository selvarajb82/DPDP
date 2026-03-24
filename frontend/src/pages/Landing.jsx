import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  {
    step: '01',
    icon: '📋',
    title: 'Answer 15 Questions',
    desc: 'Tell us about your data collection, storage, sharing, and user rights practices. Takes 3–5 minutes.',
  },
  {
    step: '02',
    icon: '🤖',
    title: 'Get Instant Risk Score',
    desc: 'Our AI analyses your answers against every section of the DPDP Act 2023 and generates a risk score.',
  },
  {
    step: '03',
    icon: '📑',
    title: 'Unlock Full Report',
    desc: 'Pay ₹999 to get your complete compliance gap analysis, action plan, templates, and PDF download.',
  },
]

const FEATURES = [
  { icon: '⚡', title: 'Results in 5 minutes', desc: 'No waiting. Get your risk score instantly after answering.' },
  { icon: '🔒', title: 'No account required', desc: 'Anonymous by default. No sign-up, no lock-in.' },
  { icon: '📄', title: 'PDF download', desc: 'Share your compliance report with your team or legal advisor.' },
  { icon: '♾️', title: 'Permanent access link', desc: 'Your report link never expires. Access it anytime.' },
  { icon: '⚖️', title: 'DPDP Act 2023 specific', desc: 'Built specifically for India\'s DPDP Act — not a generic tool.' },
  { icon: '🎯', title: 'Actionable steps', desc: 'Not just a score — a prioritised action plan you can act on today.' },
]

const STATS = [
  { value: '₹250 Cr', label: 'Maximum fine under DPDP Act' },
  { value: '5 min', label: 'Time to get your risk score' },
  { value: '₹999', label: 'vs ₹5–10 lakhs enterprise tools' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="font-bold text-white text-lg" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              DPDP Checker
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/assessment')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
          >
            Start Free Assessment
          </motion.button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative bg-slate-950 pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-widest"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            DPDP Act Activated · Nov 14, 2025 · Fines up to ₹250 Crore
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6"
          >
            Is your product<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
              DPDP compliant?
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Our AI analyses your data practices against India's DPDP Act 2023 and gives you a
            risk score + full action plan. Enterprise tools charge ₹5 lakhs/year.
            <span className="text-white font-semibold"> We charge ₹999.</span>
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/assessment')}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg shadow-indigo-500/25 transition-all"
            >
              Start Free Assessment →
            </motion.button>
            <p className="text-slate-500 text-sm">No account required · Free risk score preview</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="grid grid-cols-3 gap-6 mt-16 pt-16 border-t border-slate-800"
          >
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{s.value}</div>
                <div className="text-slate-500 text-sm">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">How it works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className="relative p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="text-5xl font-extrabold text-indigo-50 mb-4">{item.step}</div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 text-gray-200 text-2xl">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-slate-950 py-24 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">Everything included</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">Built for Indian startups</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="bg-white py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Simple Pricing</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">One report. One price.</h2>
          <p className="text-gray-500 mb-12">No subscriptions. No hidden fees. Pay once, access forever.</p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-950 to-indigo-950 rounded-3xl p-10 text-white shadow-2xl"
          >
            <div className="text-6xl font-extrabold mb-2">₹999</div>
            <div className="text-slate-400 mb-8">one-time · instant access</div>
            <ul className="text-left space-y-3 mb-10">
              {[
                'Full DPDP Act 2023 compliance gap analysis',
                'Prioritised action plan with deadlines',
                'Ready-to-use consent & privacy templates',
                'Score breakdown by category',
                'PDF download for your team',
                'Permanent re-access link',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-300">
                  <span className="text-indigo-400 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/assessment')}
              className="w-full py-4 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 font-bold text-lg transition-all shadow-lg shadow-indigo-500/25"
            >
              Start Free Assessment →
            </motion.button>
            <p className="text-slate-500 text-sm mt-4">Free risk score preview · Pay only to unlock full report</p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Don't wait for a fine to find out</h2>
          <p className="text-indigo-100 text-lg mb-8">
            DPDP Act fines go up to ₹250 crore. A ₹999 report is the cheapest compliance investment you'll make.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/assessment')}
            className="bg-white text-indigo-600 font-bold text-lg px-10 py-4 rounded-full hover:shadow-xl transition-all"
          >
            Start Free Assessment →
          </motion.button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 py-10 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="font-bold text-white" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              DPDP Checker
            </span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 DPDP Checker · Built for Indian startups</p>
          <p className="text-slate-600 text-xs">Powered by AI · Not legal advice</p>
        </div>
      </footer>

    </div>
  )
}
