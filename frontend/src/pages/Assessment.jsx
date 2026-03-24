import { PageWrapper } from '../components/layout/PageWrapper.jsx'
import { MeshBackground } from '../components/layout/MeshBackground.jsx'
import { AssessmentForm } from '../components/AssessmentForm.jsx'

export default function Assessment() {
  return (
    <PageWrapper>
      <MeshBackground />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">DPDP Compliance Assessment</h1>
          <p className="text-gray-500 mt-1">Answer 15 questions about your data practices</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <AssessmentForm />
        </div>
      </div>
    </PageWrapper>
  )
}
