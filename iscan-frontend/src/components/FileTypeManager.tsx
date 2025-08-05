'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fileTypeApi } from '@/lib/api'
import { FileType } from '@/types'
import FileTypeForm from './FileTypeForm'

export default function FileTypeManager() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingFileType, setEditingFileType] = useState<FileType | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  const { data: fileTypes = [], isLoading } = useQuery({
    queryKey: ['fileTypes'],
    queryFn: fileTypeApi.getFileTypes,
  })

  const deleteMutation = useMutation({
    mutationFn: fileTypeApi.deleteFileType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fileTypes'] })
    },
  })

  const filteredFileTypes = fileTypes.filter(ft => 
    ft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ft.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (fileType: FileType) => {
    setEditingFileType(fileType)
    setIsFormOpen(true)
  }

  const handleDelete = (fileType: FileType) => {
    if (window.confirm(`Are you sure you want to delete "${fileType.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(fileType.id)
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingFileType(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">File Type Management</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add File Type
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search file types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFileTypes.map((fileType) => (
                <tr key={fileType.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{fileType.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-md">
                      {fileType.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(fileType)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(fileType)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFileTypes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No file types found.</p>
            </div>
          )}
        </div>

        {deleteMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              Error deleting file type: {deleteMutation.error?.message}
            </p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <FileTypeForm
          fileType={editingFileType}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}
    </div>
  )
}