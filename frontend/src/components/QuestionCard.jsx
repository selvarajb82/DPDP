import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const QUESTION_OPTIONS = {
  business_type: ['Startup / SaaS', 'E-commerce', 'Mobile App', 'Website / Blog', 'Healthcare', 'Fintech', 'Other'],
  country: ['India', 'United States', 'United Kingdom', 'Singapore', 'UAE', 'Other'],
  data_storage_location: ['India only', 'Outside India (AWS/GCP/Azure global)', 'Both India and overseas', 'Not sure'],
  cloud_provider: ['AWS', 'Google Cloud', 'Azure', 'DigitalOcean / Linode', 'Own servers', 'Not sure'],
  retention_period: ['Less than 1 year', '1–3 years', 'More than 3 years', 'No defined policy'],
  third_party_sharing: ['Yes, we share with partners', 'Yes, with analytics providers only', 'No third-party sharing', 'Not sure'],
}

const TEXT_INPUT_QUESTIONS = ['product_description']

export function QuestionCard({ question, questionIndex, onAnswer }) {
  const options = QUESTION_OPTIONS[question.key]
  const isText = TEXT_INPUT_QUESTIONS.includes(question.key)

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
          <span className="text-sm font-medium text-indigo-400 uppercase tracking-wide">
            {question.category}
          </span>
          <h2 className="text-xl font-semibold text-white mt-2">{question.text}</h2>
          {question.hint && <p className="text-sm text-slate-400 mt-1">{question.hint}</p>}
        </div>

        {isText ? (
          <TextQuestion questionKey={question.key} onAnswer={onAnswer} placeholder={question.hint} />
        ) : options ? (
          <div className="grid gap-3">
            {options.map((option) => (
              <motion.button
                key={option}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onAnswer(question.key, option)}
                className="w-full text-left px-4 py-3 rounded-xl border-2 border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all font-medium text-slate-200 bg-slate-800"
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

function TextQuestion({ questionKey, onAnswer, placeholder }) {
  const [value, setValue] = useState('')
  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || 'Type your answer here...'}
        rows={3}
        className="w-full px-4 py-3 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 resize-none text-slate-200 bg-slate-800 placeholder-slate-500"
      />
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => { if (value.trim()) onAnswer(questionKey, value.trim()) }}
        disabled={!value.trim()}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue →
      </motion.button>
    </div>
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
          className="flex-1 py-3 rounded-xl border-2 border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/10 font-semibold text-slate-200 bg-slate-800 transition-all"
        >
          {opt}
        </motion.button>
      ))}
    </div>
  )
}
