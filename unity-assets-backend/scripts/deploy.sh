#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting deployment..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "🔨 Building application..."
npm run build

# Start the application
echo "🚀 Starting application..."
npm run start:prod 