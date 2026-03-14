#!/bin/bash

# PulseAI Railway Deployment Script

echo "🚀 Starting PulseAI Backend..."

# Navigate to backend
cd backend

# Install Python dependencies
pip install --no-cache-dir -r requirements.txt

# Start the FastAPI server with proper host and port binding
python run.py
