import { motion } from 'framer-motion'

const riskColors = {
  Critical: { text: 'text-red-600', badge: 'bg-red-100 text-red-700' },
  High:     { text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  Medium:   { text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
  Low:      { text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
}

export function ScoreGauge({ score, riskLevel }) {
  const colors = riskColors[riskLevel] || riskColors.Medium
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <motion.circle
            cx="60" cy="60" r="54"
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            className={`stroke-current ${colors.text}`}
            style={{ strokeDasharray: circumference }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-4xl font-bold ${colors.text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-gray-500 font-medium">/ 100</span>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
        {riskLevel} Risk
      </span>
      <p className="text-sm text-gray-500 text-center">
        {score >= 75 ? 'Significant compliance gaps found.' :
         score >= 50 ? 'Moderate compliance gaps found.' :
         score >= 25 ? 'Minor compliance gaps found.' : 'Good compliance posture.'}
      </p>
    </div>
  )
}
