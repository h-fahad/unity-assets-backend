# 🚀 Render Deployment Checklist

## Pre-Deployment
- [ ] Code is pushed to GitHub repository
- [ ] All environment variables are documented
- [ ] Database migrations are ready
- [ ] Build commands work locally

## Render Setup
- [ ] Create PostgreSQL database on Render
- [ ] Save database connection string
- [ ] Create web service
- [ ] Connect GitHub repository

## Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `DATABASE_URL` (from PostgreSQL service)
- [ ] `JWT_SECRET` (strong random string)
- [ ] `CORS_ORIGIN` (your frontend domain)
- [ ] `STRIPE_SECRET_KEY` (if using Stripe)
- [ ] `STRIPE_WEBHOOK_SECRET` (if using Stripe)

## Post-Deployment
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Create admin account: `npm run create-admin`
- [ ] Test API endpoints
- [ ] Update frontend API URL
- [ ] Test admin panel access

## Testing Checklist
- [ ] Health check endpoint works
- [ ] Database connection successful
- [ ] Admin login works
- [ ] File uploads work (if applicable)
- [ ] CORS is configured correctly
- [ ] All API endpoints respond

## Security Checklist
- [ ] Environment variables are secure
- [ ] JWT secret is strong
- [ ] CORS origin is specific
- [ ] Database credentials are protected
- [ ] No sensitive data in logs

## Monitoring
- [ ] Check Render logs for errors
- [ ] Monitor database performance
- [ ] Set up alerts (if needed)
- [ ] Test application under load 