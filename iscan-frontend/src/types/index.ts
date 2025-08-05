export interface FileType {
  id: number;
  name: string;
  description: string;
}

export interface FileTypeDetail {
  id: number;
  name: string;
  description: string;
  processing_prompts: {
    system_prompt?: string;
    extraction_prompt?: string;
    required_fields?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface FileRecord {
  id: number;
  original_name: string;
  unique_name: string;
  file_type_id: number;
  status: 'uploaded' | 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  batch_id?: number;
  batch_name?: string;
}

export interface Batch {
  id: number;
  name: string;
  status: 'created' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export interface ProcessingResult {
  id: number;
  file_id: number;
  result_data: any;
  error_message?: string;
  created_at: string;
}

export interface TaskStatus {
  id: string;
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY';
  result?: any;
  traceback?: string;
}