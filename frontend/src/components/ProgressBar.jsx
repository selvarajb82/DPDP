import { motion } from 'framer-motion'

export function ProgressBar({ current, total }) {
  const percent = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>Question {current} of {total}</span>
        <span>{percent}% complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
