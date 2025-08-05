'use client'

import React, { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fileTypeApi } from '@/lib/api'
import { FileType, FileTypeDetail } from '@/types'
import PromptEditor from './PromptEditor'

interface FileTypeFormProps {
  fileType?: FileType | null
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  name: string
  description: string
  processing_prompts: any
}

export default function FileTypeForm({ fileType, onClose, onSuccess }: FileTypeFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    processing_prompts: {}
  })
  const [isPromptsOnly, setIsPromptsOnly] = useState(false)
  
  const queryClient = useQueryClient()
  const isEditing = !!fileType

  // Fetch detailed file type data if editing
  const { data: fileTypeDetail, isLoading } = useQuery({
    queryKey: ['fileType', fileType?.id],
    queryFn: () => fileTypeApi.getFileType(fileType!.id),
    enabled: isEditing,
  })

  useEffect(() => {
    if (isEditing && fileTypeDetail) {
      setFormData({
        name: fileTypeDetail.name,
        description: fileTypeDetail.description,
        processing_prompts: fileTypeDetail.processing_prompts
      })
    }
  }, [isEditing, fileTypeDetail])

  const createMutation = useMutation({
    mutationFn: fileTypeApi.createFileType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fileTypes'] })
      onSuccess()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => 
      fileTypeApi.updateFileType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fileTypes'] })
      queryClient.invalidateQueries({ queryKey: ['fileType', fileType?.id] })
      onSuccess()
    },
  })

  const updatePromptsMutation = useMutation({
    mutationFn: ({ id, prompts }: { id: number; prompts: any }) => 
      fileTypeApi.updateFileTypePrompts(id, prompts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fileTypes'] })
      queryClient.invalidateQueries({ queryKey: ['fileType', fileType?.id] })
      onSuccess()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditing) {
      if (isPromptsOnly) {
        updatePromptsMutation.mutate({
          id: fileType!.id,
          prompts: formData.processing_prompts
        })
      } else {
        updateMutation.mutate({
          id: fileType!.id,
          data: formData
        })
      }
    } else {
      createMutation.mutate(formData)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending || updatePromptsMutation.isPending
  const error = createMutation.error || updateMutation.error || updatePromptsMutation.error

  if (isEditing && isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-center text-gray-600">Loading file type details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? `Edit ${fileType?.name}` : 'Add New File Type'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {isEditing && (
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-md">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPromptsOnly}
                  onChange={(e) => setIsPromptsOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-blue-900">
                  Edit prompts only (faster update)
                </span>
              </label>
            </div>
          )}

          {!isPromptsOnly && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Invoice, Contract, Receipt"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this file type is used for..."
                />
              </div>
            </>
          )}

          <PromptEditor
            value={formData.processing_prompts}
            onChange={(prompts) => setFormData({ ...formData, processing_prompts: prompts })}
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                Error: {error.message}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending 
                ? (isPromptsOnly ? 'Updating Prompts...' : (isEditing ? 'Updating...' : 'Creating...'))
                : (isPromptsOnly ? 'Update Prompts' : (isEditing ? 'Update File Type' : 'Create File Type'))
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}