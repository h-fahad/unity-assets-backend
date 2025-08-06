# Render.com Deployment Guide

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **PostgreSQL Database**: You'll need a database (Render provides PostgreSQL)

## Step 1: Set Up PostgreSQL Database on Render

1. Go to your Render dashboard
2. Click "New" → "PostgreSQL"
3. Choose a name (e.g., "unity-assets-db")
4. Select a plan (Free tier works for development)
5. Choose a region close to your users
6. Click "Create Database"
7. **Save the connection details** - you'll need them for the next step

## Step 2: Deploy Your Backend

### Option A: Using render.yaml (Recommended)

1. **Push your code to GitHub** (make sure it includes the `render.yaml` file)
2. Go to your Render dashboard
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file
6. Click "Apply"

### Option B: Manual Setup

1. Go to your Render dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `unity-assets-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Starter (Free)

## Step 3: Configure Environment Variables

In your Render service dashboard, go to "Environment" and add these variables:

### Required Variables:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=https://your-frontend-domain.onrender.com
```

### Optional Variables (if using Stripe):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Database URL Format:
Use the connection string from your PostgreSQL service:
```
postgresql://username:password@host:port/database_name
```

## Step 4: Database Setup

After deployment, you need to run migrations:

1. Go to your web service dashboard
2. Click "Shell"
3. Run these commands:
```bash
npx prisma migrate deploy
npx prisma generate
```

## Step 5: Create Admin Account

1. In the same shell, run:
```bash
npm run create-admin
```

2. Follow the prompts to create your admin account

## Step 6: Test Your Deployment

Your API will be available at:
```
https://your-service-name.onrender.com
```

Test endpoints:
- Health check: `GET /api`
- Swagger docs: `GET /api` (if Swagger is enabled)

## Step 7: Update Frontend Configuration

Update your frontend's API base URL to point to your Render backend:

```javascript
// In your frontend environment variables
NEXT_PUBLIC_API_URL=https://your-service-name.onrender.com
```

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify the build command is correct

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is correct
   - Check if the database is accessible from your service
   - Ensure migrations have been run

3. **CORS Issues**:
   - Update `CORS_ORIGIN` to match your frontend domain
   - For development, you can use `*` (not recommended for production)

4. **Environment Variables**:
   - Make sure all required variables are set
   - Check for typos in variable names
   - Restart the service after adding new variables

### Useful Commands:

```bash
# Check service logs
# (Available in Render dashboard)

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Check database connection
npx prisma db pull

# Create admin user
npm run create-admin
```

## Security Considerations

1. **JWT Secret**: Use a strong, random secret
2. **Database URL**: Keep it secure and don't commit to version control
3. **CORS**: Only allow necessary origins
4. **Environment Variables**: Never commit sensitive data to Git

## Monitoring

- Use Render's built-in logging to monitor your application
- Set up alerts for service downtime
- Monitor database performance and usage

## Scaling

- Start with the free tier for development
- Upgrade to paid plans for production use
- Consider using Render's auto-scaling features 