import FileUpload from '@/components/FileUpload'
import FilesDashboard from '@/components/FilesDashboard'

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Document Processing</h1>
        <p className="mt-2 text-gray-600">
          Upload PDF documents for automated processing and data extraction.
        </p>
      </div>
      
      <FileUpload />
      <FilesDashboard />
    </div>
  )
}