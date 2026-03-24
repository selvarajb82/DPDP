import { useNavigate } from 'react-router-dom'
import { AssessmentForm } from '../components/AssessmentForm.jsx'

export default function Assessment() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="font-bold text-white text-lg" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              DPDP Checker
            </span>
          </button>
          <span className="text-slate-500 text-sm">Free Assessment</span>
        </div>
      </nav>

      {/* Dot pattern background */}
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />

      <div className="relative pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
              Step 1 of 3 · Free
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              DPDP Compliance Assessment
            </h1>
            <p className="text-slate-400">Answer 15 questions about your data practices — takes 3–5 minutes</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
            <AssessmentForm />
          </div>
        </div>
      </div>
    </div>
  )
}
