import axios from 'axios';
import { FileType, FileRecord, Batch, TaskStatus } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fileApi = {
  upload: async (file: File, fileTypeId: number, batchId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type_id', fileTypeId.toString());
    if (batchId) {
      formData.append('batch_id', batchId.toString());
    }

    const response = await api.post('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFiles: async (status?: string): Promise<FileRecord[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/api/v1/files/', { params });
    return response.data;
  },

  getFile: async (fileId: number): Promise<FileRecord> => {
    const response = await api.get(`/api/v1/files/${fileId}`);
    return response.data;
  },

  getFileResults: async (fileId: number) => {
    const response = await api.get(`/api/v1/files/${fileId}/results`);
    return response.data;
  },

  exportFileJSON: async (fileId: number) => {
    const response = await api.post(`/api/v1/files/${fileId}/export-json`);
    return response.data;
  },
};

export const fileTypeApi = {
  getFileTypes: async (): Promise<FileType[]> => {
    const response = await api.get('/api/v1/file-types/');
    return response.data;
  },

  getFileType: async (id: number) => {
    const response = await api.get(`/api/v1/file-types/${id}`);
    return response.data;
  },

  createFileType: async (data: {
    name: string;
    description: string;
    processing_prompts: any;
  }) => {
    const response = await api.post('/api/v1/file-types/', data);
    return response.data;
  },

  updateFileType: async (id: number, data: {
    name: string;
    description: string;
    processing_prompts: any;
  }) => {
    const response = await api.put(`/api/v1/file-types/${id}`, data);
    return response.data;
  },

  updateFileTypePrompts: async (id: number, processing_prompts: any) => {
    const response = await api.put(`/api/v1/file-types/${id}/prompts`, { processing_prompts });
    return response.data;
  },

  deleteFileType: async (id: number) => {
    const response = await api.delete(`/api/v1/file-types/${id}`);
    return response.data;
  },
};

export const batchApi = {
  getBatches: async (): Promise<Batch[]> => {
    const response = await api.get('/api/v1/batches/');
    return response.data;
  },

  createBatch: async (name: string): Promise<Batch> => {
    const response = await api.post('/api/v1/batches/', { name });
    return response.data;
  },

  getBatchResults: async (batchId: number) => {
    const response = await api.get(`/api/v1/batches/${batchId}/results`);
    return response.data;
  },
};

export const taskApi = {
  getTaskStatus: async (taskId: string): Promise<TaskStatus> => {
    const response = await api.get(`/api/v1/tasks/${taskId}/status`);
    return response.data;
  },

  cancelTask: async (taskId: string) => {
    const response = await api.delete(`/api/v1/tasks/${taskId}`);
    return response.data;
  },

  getQueueLength: async () => {
    const response = await api.get('/api/v1/tasks/queue/length');
    return response.data;
  },
};