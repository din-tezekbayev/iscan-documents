# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

iScan is a document processing system that combines FastAPI backend, Next.js frontend, and LangGraph-powered document analysis. The system processes PDF documents through AI-powered workflows to extract structured data from invoices, contracts, and receipts.

## Architecture

### Backend (iscan-backend/)
- **FastAPI** application with async support
- **LangGraph** workflows for document processing pipeline
- **Celery** task queue with Redis broker
- **SQLAlchemy** ORM with PostgreSQL database
- **Alembic** for database migrations

### Frontend (iscan-frontend/)
- **Next.js 14** with TypeScript and App Router
- **TanStack Query** for API state management
- **Tailwind CSS** for styling
- **React Dropzone** for file uploads

### Key Processing Flow
1. PDF upload → FTP storage
2. Celery task creation → Redis queue
3. LangGraph workflow: PDF text extraction → ChatGPT processing → validation
4. Results stored in PostgreSQL as JSON
5. CSV export generation

## Development Commands

### Full Stack (Docker)
```bash
# Start all services
docker-compose up --build

# Start infrastructure only
docker-compose up postgres redis -d
```

### Backend Development
```bash
cd iscan-backend

# Install dependencies
pip install -r requirements.txt

# Database setup
python init_db.py

# Run FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start Celery worker
celery -A app.celery_app worker --loglevel=info

# Database migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

### Frontend Development
```bash
cd iscan-frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build
npm run start

# Linting
npm run lint
```

## Key Components

### Document Processors
Located in `app/process_services/`, each processor extends `BaseProcessor`:
- Must implement `get_prompts()` returning system_prompt, extraction_prompt, required_fields
- Must implement `process_result()` for custom post-processing
- Automatically registered in `app/tasks.py` PROCESSORS dict

### LangGraph Workflow (app/langgraph/document_processor.py)
State-based processing pipeline:
1. `extract_text_node` - PyMuPDF PDF text extraction
2. `process_with_chatgpt_node` - GPT-4o analysis with JSON parsing
3. `validate_result_node` - Required field validation

### API Structure
- `app/api/v1/` - RESTful endpoints
- `app/models/` - SQLAlchemy models (File, FileType, Batch, ProcessingResult)
- `app/services/` - FTP and queue management services

### Frontend Routes & Architecture
- `/` (page.tsx) - Main dashboard with FileUpload and FilesDashboard components
- `/file-types` (file-types/page.tsx) - File type management with FileTypeManager component
- `src/components/` - Reusable React components
- `src/lib/api.ts` - Centralized API client with axios
- `src/types/` - TypeScript type definitions
- Navigation in layout.tsx with Dashboard and File Types links

## Environment Setup

Required environment variables:
- `OPENAI_API_KEY` - For ChatGPT document processing
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection for Celery
- `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD` - File storage

## Testing

Backend tests use pytest framework. Frontend uses Jest/React Testing Library (setup available via `npm test`).

## Database Schema

Core models:
- `File` - Uploaded documents with processing status
- `FileType` - Document type definitions with processing prompts
- `Batch` - Groups of files for batch processing
- `ProcessingResult` - Extracted structured data as JSON

## Adding New Document Types

1. Create processor class in `process_services/`
2. Define prompts with required_fields list
3. Register in `tasks.py` PROCESSORS dict
4. Optionally add custom CSV export logic in `process_result()`