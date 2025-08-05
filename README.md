# iScan Document Processing System

A comprehensive document scanning and processing system built with FastAPI, LangGraph, and Next.js.

## Features

- **PDF Document Upload**: Drag & drop interface for PDF file uploads
- **Automated Processing**: LangGraph workflows with ChatGPT integration
- **Queue Management**: Redis-based job queue with Celery workers
- **Real-time Dashboard**: Live status updates and processing monitoring
- **FTP Integration**: Secure file storage and retrieval
- **Multiple Document Types**: Support for invoices, contracts, receipts, and custom types
- **CSV Export**: Batch processing results exported to CSV format

## Architecture

```
scan-documents/
├── iscan-backend/           # FastAPI + LangGraph backend
│   ├── app/
│   │   ├── api/v1/         # REST API endpoints
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── services/       # FTP, Redis, and queue services
│   │   ├── process_services/ # File type-specific processors
│   │   ├── langgraph/      # Document processing workflows
│   │   └── core/           # Configuration and database
│   └── alembic/            # Database migrations
├── iscan-frontend/         # Next.js TypeScript frontend
│   └── src/
│       ├── app/            # Next.js app router
│       ├── components/     # React components
│       ├── lib/            # API client and utilities
│       └── types/          # TypeScript definitions
└── docker-compose.yml     # Infrastructure services
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- OpenAI API key
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, and FTP server
docker-compose up postgres redis ftp -d
```

### 3. Backend Setup

```bash
cd iscan-backend

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Start FastAPI server
uvicorn app.main:app --reload

# In another terminal, start Celery worker
celery -A app.celery_app worker --loglevel=info
```

### 4. Frontend Setup

```bash
cd iscan-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Usage

### Document Upload

1. Access the web interface at http://localhost:3000
2. Select document type (Invoice, Contract, Receipt)
3. Drag & drop PDF files or click to upload
4. Monitor processing status in real-time dashboard

### File Types

The system supports three default document types:

- **Invoice**: Extracts invoice number, vendor, amounts, line items
- **Contract**: Extracts parties, dates, terms, contract value
- **Receipt**: Extracts merchant, date, total, tax, items

### Processing Workflow

1. **Upload**: Files uploaded to FTP server with unique names
2. **Queue**: Processing jobs added to Redis queue
3. **Extract**: PDF text extraction using PyMuPDF
4. **Process**: LangGraph workflow with ChatGPT analysis
5. **Store**: Results saved as JSON in PostgreSQL
6. **Export**: CSV files generated and saved to FTP

### API Endpoints

- `POST /api/v1/files/upload` - Upload PDF files
- `GET /api/v1/files/` - List files with status filtering
- `GET /api/v1/file-types/` - Get available document types
- `POST /api/v1/batches/` - Create processing batches
- `GET /api/v1/tasks/{task_id}/status` - Check processing status

## Development

### Adding Custom Document Types

1. Create a new processor in `process_services/`:

```python
from .base_processor import BaseProcessor

class CustomProcessor(BaseProcessor):
    def get_prompts(self):
        return {
            "system_prompt": "Your system prompt",
            "extraction_prompt": "Your extraction prompt", 
            "required_fields": ["field1", "field2"]
        }
    
    def process_result(self, result):
        # Custom post-processing logic
        return result
```

2. Register in `tasks.py`:

```python
PROCESSORS = {
    "custom": CustomProcessor(),
    # ... other processors
}
```

### Database Migrations

```bash
cd iscan-backend

# Create migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head
```

### Testing

```bash
# Backend tests
cd iscan-backend
pytest

# Frontend tests
cd iscan-frontend
npm test
```

## Production Deployment

### Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d
```

### Manual Deployment

1. **Database**: Setup PostgreSQL with provided schema
2. **Redis**: Configure Redis for queue management
3. **FTP**: Setup FTP server for file storage
4. **Backend**: Deploy FastAPI with gunicorn
5. **Frontend**: Build and deploy with nginx
6. **Workers**: Start Celery workers for processing

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `FTP_HOST` | FTP server hostname | localhost |
| `FTP_USER` | FTP username | iscan_ftp |
| `FTP_PASSWORD` | FTP password | - |
| `OPENAI_API_KEY` | OpenAI API key for ChatGPT | - |
| `NEXT_PUBLIC_API_URL` | Frontend API URL | http://localhost:8000 |

### File Processing Limits

- Maximum file size: 10MB
- Supported formats: PDF only
- Processing timeout: 5 minutes per file
- Queue capacity: 1000 jobs

## Troubleshooting

### Common Issues

1. **FTP Connection Failed**
   - Check FTP server is running
   - Verify credentials in .env file
   - Ensure FTP ports are accessible

2. **Celery Worker Not Processing**
   - Check Redis connection
   - Restart Celery worker
   - Verify task registration

3. **PDF Processing Failed**
   - Ensure file is valid PDF
   - Check OpenAI API key
   - Review processing prompts

4. **Frontend API Errors**
   - Verify backend is running
   - Check CORS settings
   - Confirm API URL configuration

### Logs

- Backend: FastAPI logs to stdout
- Celery: Worker logs with `--loglevel=info`
- Frontend: Browser console and Next.js logs
- Database: PostgreSQL logs in Docker

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation at `/docs`
3. Create an issue with detailed logs and steps to reproduce# iscan-documents
# iscan-documents
# iscan-documents
