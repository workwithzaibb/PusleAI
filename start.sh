#!/bin/bash

# PulseAI Railway Deployment Script

echo "🚀 Starting PulseAI Backend..."

# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python run.py
