'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fileApi, fileTypeApi } from '@/lib/api'
import { FileType } from '@/types'

export default function FileUpload() {
  const [selectedFileType, setSelectedFileType] = useState<number>(1)
  const queryClient = useQueryClient()

  const { data: fileTypes = [] } = useQuery({
    queryKey: ['fileTypes'],
    queryFn: fileTypeApi.getFileTypes,
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => fileApi.upload(file, selectedFileType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        uploadMutation.mutate(file)
      } else {
        alert('Please upload PDF files only')
      }
    })
  }, [uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  })

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h2>
        
        <div className="mb-4">
          <label htmlFor="fileType" className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            id="fileType"
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(Number(e.target.value))}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {fileTypes.map((type: FileType) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              {uploadMutation.isPending ? (
                <p className="text-blue-600">Uploading...</p>
              ) : isDragActive ? (
                <p className="text-blue-600">Drop the files here...</p>
              ) : (
                <>
                  <p>
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs">PDF files only</p>
                </>
              )}
            </div>
          </div>
        </div>

        {uploadMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              Upload failed: {uploadMutation.error?.message}
            </p>
          </div>
        )}

        {uploadMutation.isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              File uploaded successfully and queued for processing!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}