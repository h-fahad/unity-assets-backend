# Unity Assets Marketplace

A complete Unity asset marketplace application with subscription-based downloads, daily limits, and admin management capabilities.

## 🚀 Overview

This is a full-stack marketplace where:
- **Admins** upload Unity assets with images/videos and .unitypackage files
- **Users** create accounts and subscribe to plans to download assets
- **Subscriptions** have daily download limits (e.g., 8 downloads per day)
- **System** tracks downloads and enforces limits automatically

## 🏗️ Architecture

- **Backend**: NestJS + PostgreSQL + Prisma ORM
- **Frontend**: Next.js + Tailwind CSS + TypeScript
- **Authentication**: JWT-based with role management
- **File Storage**: Local storage with static file serving
- **State Management**: Zustand for client state

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12+) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd unity-assets-next-app
```

### 2. Backend Setup
```bash
cd unity-assets-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Setup database
createdb unity_assets_db
npx prisma migrate deploy
npx prisma generate

# Create uploads directory
mkdir uploads

# Start backend server
npm run start:dev
```

Backend runs on: `http://localhost:3001`

### 3. Frontend Setup
```bash
cd ../unity-assets-next-app

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start frontend server
npm run dev
```

Frontend runs on: `http://localhost:3000`

### 4. Create Admin Account

Visit `http://localhost:3000/register` and create an account, then manually update the database to make it admin:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

## 📚 Detailed Setup Guides

For detailed setup instructions with troubleshooting:

- **Backend**: See [unity-assets-backend/README.md](./unity-assets-backend/README.md)
- **Frontend**: See [unity-assets-next-app/README.md](./unity-assets-next-app/README.md)

## 🎯 Usage Flow

### For Admins
1. **Login** with admin account
2. **Create Subscription Plans** with daily download limits
   - Basic Plan: 5 downloads/day
   - Premium Plan: 15 downloads/day
   - Enterprise Plan: 50 downloads/day
3. **Upload Assets** via `/admin/upload`
   - Add title, description, category
   - Upload thumbnail image/video
   - Upload .unitypackage file
4. **Assign Subscriptions** to users

### For Users
1. **Register** account at `/register`
2. **Browse Assets** on home page
3. **Subscribe** to a plan at `/packages`
4. **Download Assets** (respecting daily limits)
5. **Track Usage** in `/account`

## 🔧 Key Features

### ✅ Implemented
- **User Authentication** - JWT with admin/user roles
- **Asset Management** - Upload with images/videos + Unity packages
- **Subscription System** - Plans with daily download limits
- **Download Tracking** - Enforces daily limits per user
- **File Upload** - Handles multiple file types securely
- **Admin Panel** - Asset upload and management
- **Daily Reset** - Download limits reset automatically

### 🔄 Database Schema
```
User (id, email, password, role, subscriptions, downloads)
├── UserSubscription (subscription plans assigned to users)
├── Download (tracks daily download counts)

Asset (id, name, description, thumbnail, fileUrl, category)
├── Uploaded by admin users
├── Downloaded by subscribed users

SubscriptionPlan (id, name, price, dailyDownloadLimit)
├── Created by admins
├── Assigned to users
```

## 🚨 Common Issues & Solutions

### Backend Issues

**Database Connection**
```bash
# Ensure PostgreSQL is running
sudo service postgresql start
# or on Windows
net start postgresql-x64-14

# Test connection
psql -U postgres -d unity_assets_db
```

**Migration Issues**
```bash
# Reset database (⚠️ DELETES DATA)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Frontend Issues

**API Connection**
```bash
# Check backend is running
curl http://localhost:3001/assets

# Clear browser cache
localStorage.clear()
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
rm -rf node_modules
npm install
```

## 📁 Project Structure

```
unity-assets-next-app/
├── unity-assets-backend/          # NestJS Backend
│   ├── src/
│   │   ├── auth/                  # JWT Authentication
│   │   ├── assets/                # Asset CRUD + Downloads
│   │   ├── subscriptions/         # Subscription Management
│   │   ├── users/                 # User Management
│   │   └── common/                # Shared Services
│   ├── prisma/                    # Database Schema & Migrations
│   ├── uploads/                   # File Storage
│   └── README.md                  # Backend Setup Guide
│
├── unity-assets-next-app/         # Next.js Frontend
│   ├── app/                       # App Router Pages
│   │   ├── admin/                 # Admin-only Pages
│   │   ├── account/               # User Profile
│   │   └── subscriptions/         # Subscription Management
│   ├── components/                # Reusable Components
│   ├── services/                  # API Services
│   ├── store/                     # State Management
│   └── README.md                  # Frontend Setup Guide
│
├── start-backend.bat             # Windows Backend Starter
├── start-frontend.bat            # Windows Frontend Starter
├── start-both.bat               # Start Both Servers
└── README.md                    # This File
```

## 🔐 Environment Variables

### Backend `.env`
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/unity_assets_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="Unity Assets Marketplace"
```

## 🚀 Deployment

### Development
Use the provided batch files:
- `start-backend.bat` - Start backend only
- `start-frontend.bat` - Start frontend only  
- `start-both.bat` - Start both servers

### Production

**Backend** (Node.js hosting):
```bash
npm run build
npm run start:prod
```

**Frontend** (Vercel/Netlify):
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

Having issues? Check:

1. **Setup Guides**: Individual README files in each directory
2. **Common Issues**: Solutions listed above
3. **Issues**: Create a GitHub issue with details
4. **Logs**: Check console output for error details

## 🎉 Success Indicators

✅ Backend running on port 3001  
✅ Frontend running on port 3000  
✅ Database connected and migrated  
✅ Admin can upload assets  
✅ Users can register/login  
✅ Subscriptions enforce download limits  
✅ Files upload and serve correctly  

---

**Ready to build your Unity asset marketplace! 🚀**