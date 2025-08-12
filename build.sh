#!/bin/bash
set -e

echo "Starting build process..."
echo "Current directory: $(pwd)"
echo "Listing contents:"
ls -la

echo "Changing to frontend directory..."
cd frontend

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Build completed. Listing dist contents:"
ls -la dist/

echo "Build script completed successfully!"
