# Unity Assets Backend API

A robust NestJS backend for Unity asset marketplace with subscription-based downloads, daily limits, and file upload management.

## 🚀 Features

- **User Authentication** - JWT-based auth with admin/user roles
- **Asset Management** - Upload, categorize, and manage Unity packages
- **Subscription System** - Create plans with daily download limits
- **Download Tracking** - Monitor user downloads and enforce limits
- **File Upload** - Handle images/videos and .unitypackage files
- **Admin Panel Support** - Admin-only asset upload and management
- **Daily Limits** - Reset download counts daily per subscription plan

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd unity-assets-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/unity_assets_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
CORS_ORIGIN="http://localhost:3000"

# File Upload Configuration
MAX_FILE_SIZE=524288000  # 500MB in bytes
```

**⚠️ Important:** Replace the values with your actual configuration:
- `username:password` - Your PostgreSQL credentials
- `unity_assets_db` - Your database name
- `JWT_SECRET` - A strong, unique secret key

### 4. Database Setup

#### Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE unity_assets_db;

# Exit PostgreSQL
\q
```

#### Run Database Migrations
```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# (Optional) Seed database with sample data
npx prisma db seed
```

### 5. Create Upload Directory
```bash
mkdir uploads
```

### 6. Start the Server

#### Development Mode
```bash
npm run start:dev
```

#### Production Mode
```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:3001`

## 📖 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3001/api`
- **API Base URL**: `http://localhost:3001`

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

#### Assets
- `GET /assets` - List all assets
- `POST /assets` - Upload new asset (Admin only)
- `POST /assets/:id/download` - Download asset
- `GET /assets/download-status` - Check download status

#### Subscriptions
- `GET /subscriptions/plans` - List subscription plans
- `POST /subscriptions/plans` - Create plan (Admin only)
- `POST /subscriptions/assign` - Assign subscription to user

## 🗃️ Database Schema

### Key Tables
- **User** - User accounts with role-based access
- **Asset** - Unity packages with metadata
- **SubscriptionPlan** - Plans with daily download limits
- **UserSubscription** - User-plan relationships
- **Download** - Download tracking for daily limits

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Run production server
npm run start:prod

# Database operations
npx prisma migrate dev    # Create new migration
npx prisma migrate deploy # Apply migrations
npx prisma generate       # Generate client
npx prisma studio         # Open database GUI

# Testing
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
```

## 🚨 Common Issues & Solutions

### 1. Database Connection Issues

**Problem**: `Error: P1001: Can't reach database server`

**Solutions**:
- Ensure PostgreSQL is running: `sudo service postgresql start`
- Check DATABASE_URL in `.env` file
- Verify database exists: `psql -U postgres -l`
- Test connection: `psql -U username -d unity_assets_db`

### 2. Migration Failures

**Problem**: `Migration failed to apply`

**Solutions**:
```bash
# Reset database (⚠️ WILL DELETE DATA)
npx prisma migrate reset

# Apply specific migration
npx prisma migrate resolve --applied "migration_name"

# Check migration status
npx prisma migrate status
```

### 3. File Upload Issues

**Problem**: `ENOENT: no such file or directory, open 'uploads/...'`

**Solutions**:
```bash
# Create uploads directory
mkdir uploads
chmod 755 uploads

# Check disk space
df -h

# Verify file permissions
ls -la uploads/
```

### 4. JWT Token Issues

**Problem**: `JsonWebTokenError: invalid signature`

**Solutions**:
- Ensure JWT_SECRET is consistent across restarts
- Clear browser localStorage/cookies
- Check token expiration in JWT_EXPIRES_IN

### 5. CORS Issues

**Problem**: `Access to fetch blocked by CORS policy`

**Solutions**:
- Update CORS_ORIGIN in `.env`
- For multiple origins:
```typescript
// In main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
});
```

### 6. Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solutions**:
```bash
# Find process using port
lsof -i :3001
# or
netstat -tulpn | grep :3001

# Kill process
kill -9 <PID>

# Use different port
PORT=3002 npm run start:dev
```

### 7. Prisma Client Issues

**Problem**: `PrismaClientInitializationError`

**Solutions**:
```bash
# Regenerate Prisma client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use a strong, unique secret in production
3. **File Uploads**: Validate file types and sizes
4. **Database**: Use connection pooling in production
5. **CORS**: Restrict origins in production

## 📁 Project Structure

```
unity-assets-backend/
├── src/
│   ├── app.module.ts           # Main application module
│   ├── main.ts                 # Application entry point
│   ├── auth/                   # Authentication module
│   ├── assets/                 # Asset management
│   ├── subscriptions/          # Subscription system
│   ├── users/                  # User management
│   └── common/                 # Shared services
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── uploads/                    # File storage
├── .env                        # Environment variables
└── README.md                   # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
1. Check this README's troubleshooting section
2. Review the [Issues](../../issues) page
3. Create a new issue with detailed information

---

**Happy coding! 🚀**
