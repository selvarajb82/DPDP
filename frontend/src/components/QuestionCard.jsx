import { motion, AnimatePresence } from 'framer-motion'

const QUESTION_OPTIONS = {
  business_type: ['Startup / SaaS', 'E-commerce', 'Mobile App', 'Website / Blog', 'Healthcare', 'Fintech', 'Other'],
  data_storage_location: ['India only', 'Outside India (AWS/GCP/Azure global)', 'Both India and overseas', 'Not sure'],
  cloud_provider: ['AWS', 'Google Cloud', 'Azure', 'DigitalOcean / Linode', 'Own servers', 'Not sure'],
  retention_period: ['Less than 1 year', '1–3 years', 'More than 3 years', 'No defined policy'],
  third_party_sharing: ['Yes, we share with partners', 'Yes, with analytics providers only', 'No third-party sharing', 'Not sure'],
}

export function QuestionCard({ question, questionIndex, onAnswer }) {
  const options = QUESTION_OPTIONS[question.key]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={questionIndex}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="mb-6">
          <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
            {question.category}
          </span>
          <h2 className="text-xl font-semibold text-gray-900 mt-2">{question.text}</h2>
          {question.hint && <p className="text-sm text-gray-500 mt-1">{question.hint}</p>}
        </div>

        {options ? (
          <div className="grid gap-3">
            {options.map((option) => (
              <motion.button
                key={option}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onAnswer(question.key, option)}
                className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all font-medium text-gray-700"
              >
                {option}
              </motion.button>
            ))}
          </div>
        ) : (
          <YesNoQuestion questionKey={question.key} onAnswer={onAnswer} />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

function YesNoQuestion({ questionKey, onAnswer }) {
  return (
    <div className="flex gap-4">
      {['Yes', 'No', 'Not sure'].map((opt) => (
        <motion.button
          key={opt}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onAnswer(questionKey, opt)}
          className="flex-1 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 font-semibold text-gray-700 transition-all"
        >
          {opt}
        </motion.button>
      ))}
    </div>
  )
}
