import { motion } from 'framer-motion'

const severityColors = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

export function ReportPreview({ previewData, onUnlock }) {
  const { top_gaps = [], first_actions = [], preview_summary = '' } = previewData || {}

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-gray-700 text-sm leading-relaxed">{preview_summary}</p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Your Top 3 Compliance Gaps</h3>
        <div className="space-y-3">
          {top_gaps.map((gap, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border rounded-xl p-4 bg-white"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${severityColors[gap.severity] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {gap.severity}
                    </span>
                    <span className="text-xs text-gray-500">{gap.dpdp_clause}</span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{gap.title}</p>
                  <p className="text-gray-600 text-xs mt-1">{gap.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">First Steps to Take</h3>
        <div className="space-y-2">
          {first_actions.map((action, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{action.action}</p>
                <p className="text-xs text-green-700 mt-0.5">Deadline: {action.deadline}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blurred section + CTA */}
      <div className="relative">
        <div className="blur-overlay space-y-3 pointer-events-none" aria-hidden="true">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-xl p-4 bg-white">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-2 bg-gray-100 rounded w-full mb-1" />
              <div className="h-2 bg-gray-100 rounded w-5/6" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 text-center max-w-sm mx-4"
          >
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock Full Report</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get your complete action plan, all compliance gaps, consent templates, and PDF download.
            </p>
            <p className="text-3xl font-bold text-blue-600 mb-4">₹999</p>
            <ul className="text-left text-sm text-gray-600 space-y-1 mb-6">
              <li>✓ Full compliance gap analysis</li>
              <li>✓ Prioritised action plan</li>
              <li>✓ Ready-to-use consent templates</li>
              <li>✓ PDF download</li>
              <li>✓ Permanent re-access link</li>
            </ul>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onUnlock}
              className="w-full py-3 rounded-full font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transition-shadow"
            >
              Unlock Full Report — ₹999
            </motion.button>
            <p className="text-xs text-gray-400 mt-3">UPI · Cards · Net Banking · International</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
