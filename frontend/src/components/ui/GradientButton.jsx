import { motion } from 'framer-motion'

export function GradientButton({ children, onClick, disabled = false, type = 'button', className = '' }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-shadow ${className}`}
    >
      {children}
    </motion.button>
  )
}
