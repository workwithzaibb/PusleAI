# Railway Deployment Guide for PulseAI

## Architecture
This is a monorepo containing:
- **Backend**: Python FastAPI (in `backend/` directory)
- **Frontend**: React + Vite (in `frontend/` directory)

## Deployment Steps

### 1. Deploy Backend Service

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `workwithzaibb/PusleAI`
4. **Important**: Set Root Directory to `backend`
5. Railway will auto-detect Python and use the configuration files

**Environment Variables to Add:**
```
DATABASE_URL=<your-database-url>
SECRET_KEY=<your-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=False
```

**Optional Environment Variables:**
```
OPENAI_API_KEY=<your-openai-key>
ELEVENLABS_API_KEY=<your-elevenlabs-key>
```

### 2. Deploy Frontend Service

1. In Railway Dashboard, click "New Service"
2. Select "Deploy from GitHub repo"
3. Select `workwithzaibb/PusleAI`
4. **Important**: Set Root Directory to `frontend`
5. Railway will auto-detect Node.js and use the configuration files

**Environment Variables to Add:**
```
VITE_API_URL=<backend-service-url>
```

Replace `<backend-service-url>` with the URL of your deployed backend service (from step 1).

### 3. Database Setup

Railway offers PostgreSQL databases. To add a database:

1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway will automatically provide a `DATABASE_URL` environment variable
3. Add this to your backend service environment variables

**Note:** The backend uses SQLite by default. To use PostgreSQL, you'll need to:
1. Install `psycopg2-binary` in requirements.txt
2. Update database configuration to use the `DATABASE_URL` from Railway

### 4. Health Checks

The backend includes health check endpoints:
- `/` - Basic health check
- `/health` - Detailed health check with service status

Railway will automatically use the `/health` endpoint configured in `railway.json`.

### 5. Custom Domains

To add a custom domain:
1. Go to your service settings
2. Click "Settings" → "Domains"
3. Click "Custom Domain"
4. Add your domain and configure DNS as instructed

## Configuration Files

### Backend Configuration Files

- **railway.json**: Railway-specific deployment configuration
- **nixpacks.toml**: Nixpacks build configuration for Python
- **Procfile**: Process type definitions (fallback)

### Frontend Configuration Files

- **railway.json**: Railway-specific deployment configuration
- **nixpacks.toml**: Nixpacks build configuration for Node.js
- **Procfile**: Process type definitions (fallback)

## Troubleshooting

### Backend Issues

**Problem**: Build fails with dependency errors
- **Solution**: Ensure all dependencies in `requirements.txt` are compatible
- Check Python version (should be 3.11)

**Problem**: Application crashes on startup
- **Solution**: Check environment variables are set correctly
- Review logs in Railway dashboard
- Ensure `SECRET_KEY` is set

### Frontend Issues

**Problem**: Build fails
- **Solution**: Check Node.js version compatibility (should be 18.x)
- Ensure `package.json` has all required dependencies

**Problem**: Frontend can't connect to backend
- **Solution**: Verify `VITE_API_URL` environment variable is set correctly
- Check CORS settings in backend

## Monitoring

Railway provides:
- Real-time logs
- Metrics (CPU, Memory, Network)
- Deployment history

Access these from your service dashboard.

## Scaling

To scale your services:
1. Go to service settings
2. Adjust resources (Railway scales based on usage)
3. For high traffic, consider upgrading your Railway plan

## Support

For Railway-specific issues:
- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)

For PulseAI application issues:
- Check the main [README.md](./README.md)
- Open an issue on GitHub
