# Deployment Checklist

## Backend (Railway/Render)
- [ ] PostgreSQL database created
- [ ] Environment variables configured:
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET (generate new for production)
  - [ ] CORS_ORIGIN (frontend URL)
  - [ ] PORT (3001 or $PORT)
  - [ ] NODE_ENV=production
- [ ] Prisma migrations applied
- [ ] Backend deployed and accessible

## Frontend (Vercel/Netlify)
- [ ] Environment variables configured:
  - [ ] NEXT_PUBLIC_API_URL (backend URL)
- [ ] Frontend built and deployed
- [ ] API connection working

## Database
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Seed data created (optional): `npm run seed`
- [ ] Admin user created: `npm run create-admin`

## Testing
- [ ] Backend health check: GET /assets
- [ ] Frontend loads correctly
- [ ] Login/register works
- [ ] Asset upload works (admin)
- [ ] Asset download works
- [ ] Subscription system works

## Security
- [ ] JWT_SECRET changed from development
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database credentials secured

## File Storage (Production Ready)
- [ ] Replace local file storage with cloud storage:
  - [ ] AWS S3 + CloudFront
  - [ ] Cloudinary
  - [ ] Google Cloud Storage

## Domain (Optional)
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] DNS records updated