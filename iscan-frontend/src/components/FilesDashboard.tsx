'use client'

import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fileApi } from '@/lib/api'
import { FileRecord } from '@/types'

const statusColors = {
  uploaded: 'bg-gray-100 text-gray-800',
  queued: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

interface BatchGroup {
  batch_id: number | null;
  batch_name: string;
  files: FileRecord[];
}

export default function FilesDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedResults, setSelectedResults] = useState<any>(null)
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set())

  const { data: files = [], isLoading, refetch } = useQuery({
    queryKey: ['files', statusFilter],
    queryFn: () => fileApi.getFiles(statusFilter || undefined),
    refetchInterval: 15000, // Auto-refresh every 15 seconds
  })

  const exportMutation = useMutation({
    mutationFn: (fileId: number) => fileApi.exportFileJSON(fileId),
    onSuccess: (data) => {
      alert(`JSON export started! Task ID: ${data.task_id}`)
    },
    onError: (error: any) => {
      alert('Export failed: ' + (error?.response?.data?.detail || error.message))
    }
  })

  const handleDownloadResults = async (file: FileRecord) => {
    try {
      const results = await fileApi.getFileResults(file.id)
      setSelectedResults(results)
    } catch (error: any) {
      alert('Failed to fetch results: ' + (error?.response?.data?.detail || error.message))
    }
  }

  const handleExportJSON = (fileId: number) => {
    exportMutation.mutate(fileId)
  }

  const statusCounts = files.reduce((acc, file) => {
    acc[file.status] = (acc[file.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Group files by batch
  const batchGroups: BatchGroup[] = React.useMemo(() => {
    const groups = new Map<string, BatchGroup>()
    
    files.forEach(file => {
      const batchKey = file.batch_id?.toString() || 'individual'
      
      if (!groups.has(batchKey)) {
        groups.set(batchKey, {
          batch_id: file.batch_id || null,
          batch_name: file.batch_name || 'Individual Files',
          files: []
        })
      }
      
      groups.get(batchKey)!.files.push(file)
    })

    // Sort files within each batch by ID descending (already sorted from backend, but ensuring)
    groups.forEach(group => {
      group.files.sort((a, b) => b.id - a.id)
    })
    
    // Convert to array and sort batches by newest file in each batch
    return Array.from(groups.values()).sort((a, b) => {
      const aNewestId = Math.max(...a.files.map(f => f.id))
      const bNewestId = Math.max(...b.files.map(f => f.id))
      return bNewestId - aNewestId
    })
  }, [files])

  const toggleBatchExpansion = (batchKey: string) => {
    const newExpanded = new Set(expandedBatches)
    if (newExpanded.has(batchKey)) {
      newExpanded.delete(batchKey)
    } else {
      newExpanded.add(batchKey)
    }
    setExpandedBatches(newExpanded)
  }

  // Auto-expand batches on first load
  React.useEffect(() => {
    if (batchGroups.length > 0 && expandedBatches.size === 0) {
      const allBatchKeys = batchGroups.map(bg => bg.batch_id?.toString() || 'individual')
      setExpandedBatches(new Set(allBatchKeys))
    }
  }, [batchGroups.length])

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Processing Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div
              key={status}
              className="text-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
            >
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Files by Batch */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Files by Batch {statusFilter && `(${statusFilter})`}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                !statusFilter
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {batchGroups.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">
              {statusFilter ? `No files with status "${statusFilter}"` : 'No files uploaded yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {batchGroups.map((batchGroup) => {
              const batchKey = batchGroup.batch_id?.toString() || 'individual'
              const isExpanded = expandedBatches.has(batchKey)
              
              return (
                <div key={batchKey} className="p-4">
                  {/* Batch Header */}
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => toggleBatchExpansion(batchKey)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {batchGroup.batch_name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {batchGroup.files.length} file{batchGroup.files.length !== 1 ? 's' : ''}
                          {batchGroup.batch_id && ` • Batch ID: ${batchGroup.batch_id}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {/* Status distribution for this batch */}
                      {Object.entries(
                        batchGroup.files.reduce((acc, file) => {
                          acc[file.status] = (acc[file.status] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      ).map(([status, count]) => (
                        <span 
                          key={status}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}
                        >
                          {count}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Batch Files */}
                  {isExpanded && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              File Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Uploaded
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {batchGroup.files.map((file: FileRecord) => (
                            <tr key={file.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {file.original_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {file.id}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    statusColors[file.status]
                                  }`}
                                >
                                  {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(file.created_at).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {(file.status === 'completed' || file.status === 'failed') && (
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => handleDownloadResults(file)}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      View Results
                                    </button>
                                    <button 
                                      onClick={() => handleExportJSON(file.id)}
                                      disabled={exportMutation.isPending}
                                      className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                                    >
                                      {exportMutation.isPending ? 'Exporting...' : 'Export JSON'}
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Results Modal */}
      {selectedResults && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Processing Results - {selectedResults.file_name}
              </h3>
              <button
                onClick={() => setSelectedResults(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              {selectedResults.error_message ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h4 className="text-red-800 font-medium mb-2">Error Message:</h4>
                  <p className="text-red-700">{selectedResults.error_message}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Extracted Data:</h4>
                    <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
                      {JSON.stringify(selectedResults.result_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              <div className="mt-4 text-sm text-gray-500">
                <p>Processed: {new Date(selectedResults.created_at).toLocaleString()}</p>
                <p>Batch ID: {selectedResults.batch_id}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => handleExportJSON(selectedResults.file_id)}
                disabled={exportMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                Export JSON
              </button>
              <button
                onClick={() => setSelectedResults(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
