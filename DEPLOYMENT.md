# Railway Deployment Guide

This guide explains how to deploy the iScan application to Railway as separate services.

## Overview

The application is deployed as **3 separate Railway services**:
1. **Backend Service** - FastAPI + Celery
2. **Frontend Service** - Next.js
3. **Database Services** - PostgreSQL + Redis (Railway managed)

## Deployment Steps

### 1. Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### 2. Deploy Backend Service

1. **Create new service** in Railway
2. **Connect GitHub repo** 
   - **IMPORTANT**: Set **Root Directory** to `iscan-backend` in Railway settings
   - This ensures Railway only deploys the backend folder, not the entire repo
3. **Add environment variables**:

```env
# Database (Railway will provide these)
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://username:password@host:port

# OpenAI API Key (Required)
OPENAI_API_KEY=your_openai_api_key_here

# Optional Railway settings
PORT=8000
RAILWAY_ENVIRONMENT=production
```

4. **Add PostgreSQL database**:
   - Go to your Railway project
   - Click "New" → "Database" → "PostgreSQL"
   - Copy the DATABASE_URL to your backend service

5. **Add Redis database**:
   - Click "New" → "Database" → "Redis"
   - Copy the REDIS_URL to your backend service

6. **Deploy**: Railway will auto-deploy from the `iscan-backend/` folder

### 3. Deploy Frontend Service

1. **Create another service** in Railway
2. **Connect GitHub repo**
   - **IMPORTANT**: Set **Root Directory** to `iscan-frontend` in Railway settings
   - This ensures Railway only deploys the frontend folder
3. **Add environment variables**:

```env
# Backend API URL (use your deployed backend URL)
NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app

# Optional Railway settings
PORT=3000
```

4. **Deploy**: Railway will auto-deploy from the `iscan-frontend/` folder

### 4. Deploy Celery Worker (Optional)

For background processing, create a third service:

1. **Create another service** in Railway
2. **Connect same GitHub repo**
   - **Set Root Directory** to `iscan-backend`
3. **Use same environment variables** as backend
4. **Override start command** in Railway settings:
   ```bash
   python wait-for-db.py && celery -A app.celery_app worker --loglevel=info
   ```

## Access URLs

After deployment, you'll get:
- **Frontend**: `https://your-frontend-service.railway.app`
- **Backend API**: `https://your-backend-service.railway.app`
- **API Docs**: `https://your-backend-service.railway.app/docs`

## Environment Variables Reference

### Backend Service
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection from Railway | ✅ |
| `REDIS_URL` | Redis connection from Railway | ✅ |
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ |
| `PORT` | Server port (Railway sets automatically) | ❌ |
| `RAILWAY_ENVIRONMENT` | Set to "production" | ❌ |

### Frontend Service
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend service URL | ✅ |
| `PORT` | Server port (Railway sets automatically) | ❌ |

## Troubleshooting

### Deployment Issues
1. **"Nixpacks was unable to generate a build plan"**: 
   - Ensure **Root Directory** is set to `iscan-backend` or `iscan-frontend`
   - Don't deploy from the root directory (contains docker-compose.yml)
   - Each service should have its own Dockerfile

2. **"No such file or directory"**:
   - Verify Root Directory setting in Railway
   - Check that the specified folder contains the correct files

### Backend Issues
1. **Build fails**: Check `requirements.txt` is present in `iscan-backend/`
2. **Database connection**: Verify DATABASE_URL is correct
3. **OpenAI errors**: Check API key and rate limits
4. **Start script fails**: Ensure start.sh is executable

### Frontend Issues
1. **API calls fail**: Verify NEXT_PUBLIC_API_URL is correct
2. **CORS errors**: Backend allows Railway domains in CORS settings
3. **Build fails**: Check package.json is present in `iscan-frontend/`

### Database Issues
1. **Connection refused**: Ensure database services are running
2. **Permission errors**: Check DATABASE_URL has correct credentials

## Cost Estimation

Railway free tier includes:
- **$5/month credit** (usually sufficient for small apps)
- **512MB RAM** per service
- **1GB storage** per database

For production use, expect:
- Backend service: ~$5-10/month
- Frontend service: ~$5/month  
- PostgreSQL: ~$5/month
- Redis: ~$5/month

## Monitoring

- **Logs**: Available in Railway dashboard for each service
- **Metrics**: CPU, memory, and network usage
- **Health checks**: Automatic via `/health` endpoint

## Scaling

- **Horizontal**: Add more replicas in Railway dashboard
- **Vertical**: Upgrade to higher RAM/CPU plans
- **Database**: Railway offers managed database scaling