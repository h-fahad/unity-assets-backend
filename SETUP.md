# Unity Assets Marketplace - Setup Instructions

This is a complete Unity assets marketplace application with a NestJS backend and Next.js frontend.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
```bash
cd unity-assets-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
   - Create a PostgreSQL database named `unity_assets_db`
   - Update the `DATABASE_URL` in `.env` if needed

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Seed the database with sample data:
```bash
npm run seed
```

6. Start the backend server:
```bash
npm run start:dev
```

The backend will run on http://localhost:3001

### 2. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd unity-assets-next-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on http://localhost:3000

## Test Accounts

After seeding, you can use these test accounts:

### Admin Account
- Email: `admin@example.com`
- Password: `admin123`
- Can manage assets and subscriptions

### User Account
- Email: `user@example.com`
- Password: `user123`
- Can browse and download assets

## Features

### Backend (NestJS + Prisma + PostgreSQL)
- User authentication with JWT
- Asset management (CRUD operations)
- Subscription plan management
- File download tracking
- Search functionality
- Swagger API documentation at http://localhost:3001/api

### Frontend (Next.js + Tailwind CSS + Zustand)
- User registration and login
- Asset browsing and filtering
- Asset search
- Download functionality
- Subscription management
- Admin panel for asset management
- Responsive design

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Assets
- `GET /assets` - Get all assets
- `GET /assets/:id` - Get specific asset
- `GET /assets/search/:query` - Search assets
- `POST /assets` - Create asset (admin only)
- `PATCH /assets/:id` - Update asset (admin only)
- `DELETE /assets/:id` - Delete asset (admin only)
- `POST /assets/:id/download` - Download asset (authenticated)

### Users
- `GET /users/profile` - Get current user profile
- `GET /users` - Get all users (admin only)
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Subscriptions
- `GET /subscriptions` - Get all subscription plans
- `POST /subscriptions` - Create plan (admin only)
- `PATCH /subscriptions/:id` - Update plan (admin only)
- `DELETE /subscriptions/:id` - Delete plan (admin only)
- `POST /subscriptions/assign` - Assign plan to user (admin only)

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/unity_assets_db?scheme=public"
JWT_SECRET=supersecretkey
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Troubleshooting

1. **Database connection issues**: Make sure PostgreSQL is running and the connection string is correct
2. **CORS errors**: Verify the backend CORS_ORIGIN matches the frontend URL
3. **API connection issues**: Check that both servers are running on the correct ports
4. **Build errors**: Make sure all dependencies are installed with `npm install`

## Development Notes

- The application uses Prisma for database ORM
- Frontend state management is handled by Zustand
- Authentication uses JWT tokens stored in localStorage
- File uploads are handled via URLs (implement actual file storage as needed)
- Payment processing is not implemented (placeholder functionality)

## Next Steps

To complete the application for production:
1. Implement actual file upload and storage (AWS S3, etc.)
2. Add payment processing (Stripe, PayPal)
3. Implement email verification
4. Add more comprehensive error handling
5. Set up proper logging and monitoring
6. Configure for production deployment