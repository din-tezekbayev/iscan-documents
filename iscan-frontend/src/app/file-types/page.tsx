import FileTypeManager from '@/components/FileTypeManager'

export default function FileTypesPage() {
  return (
    <div className="space-y-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">File Type Management</h1>
        <p className="mt-2 text-gray-600">
          Manage document types and their processing prompts for automated data extraction.
        </p>
      </div>
      
      <FileTypeManager />
    </div>
  )
}