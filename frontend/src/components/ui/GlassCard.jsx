import { motion } from 'framer-motion'

export function GlassCard({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -3 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}
