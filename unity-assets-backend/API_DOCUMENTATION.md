# Unity Assets Subscription Platform - API Documentation

## 🚀 Base URL
```
http://localhost:3001
```

## 🔐 Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📊 Test Credentials
```
Admin: admin@unityassets.com / admin123
User:  user@example.com / admin123
```

---

## 📁 Categories API

### Get Active Categories
```http
GET /categories/active
```
Returns all active categories for public use.

### Get All Categories (Admin)
```http
GET /categories?includeInactive=true
```

### Create Category (Admin)
```http
POST /categories
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "name": "Characters",
  "description": "Character models and animations",
  "slug": "characters" // optional, auto-generated from name
}
```

### Update Category (Admin)
```http
PATCH /categories/:id
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "name": "Updated Name",
  "isActive": true
}
```

### Delete Category (Admin)
```http
DELETE /categories/:id
Authorization: Bearer <admin-token>
```

---

## 🎨 Assets API

### Get Featured Assets
```http
GET /assets/featured?limit=8
```
Returns popular assets for homepage.

### Get All Assets
```http
GET /assets?categoryId=1&page=1&limit=20&includeInactive=false
```

### Get Popular Assets
```http
GET /assets/popular?limit=10
```

### Get Recent Assets
```http
GET /assets/recent?limit=10
```

### Search Assets
```http
GET /assets/search?q=knight&categoryId=1&page=1&limit=20
```

### Get Assets by Category
```http
GET /assets/category/:categoryId?page=1&limit=20
```

### Get Single Asset
```http
GET /assets/:id
```

### Create Asset (Admin)
```http
POST /assets
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>

Form Data:
- name: "Medieval Knight"
- description: "High-quality character"
- categoryId: 1
- price: 0
- tags: ["character", "medieval"]
- thumbnail: <file>
- assetFile: <file>
```

### Download Asset (Authenticated)
```http
POST /assets/:id/download
Authorization: Bearer <user-token>
```

### Get Download Status (Authenticated)
```http
GET /assets/download-status
Authorization: Bearer <user-token>
```

---

## 💳 Subscription Plans API

### Get All Plans
```http
GET /subscriptions/plans?includeInactive=false
```

### Get Single Plan
```http
GET /subscriptions/plans/:id
```

### Create Plan (Admin)
```http
POST /subscriptions/plans
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "name": "Pro",
  "description": "Great for small teams",
  "basePrice": 19.99,
  "billingCycle": "MONTHLY",
  "yearlyDiscount": 10,
  "dailyDownloadLimit": 20,
  "features": ["20 downloads per day", "Priority support"]
}
```

### Update Plan (Admin)
```http
PATCH /subscriptions/plans/:id
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "basePrice": 24.99,
  "dailyDownloadLimit": 25
}
```

### Assign Plan to User (Admin)
```http
POST /subscriptions/assign
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "userId": 2,
  "planId": 1,
  "startDate": "2024-01-01T00:00:00Z"
}
```

### Get My Subscriptions (User)
```http
GET /subscriptions/my-subscriptions
Authorization: Bearer <user-token>
```

### Get My Active Subscription (User)
```http
GET /subscriptions/my-active-subscription
Authorization: Bearer <user-token>
```

---

## 👥 Users API

### Get All Users (Admin)
```http
GET /users?includeInactive=false&page=1&limit=50
Authorization: Bearer <admin-token>
```

### Search Users (Admin)
```http
GET /users/search?q=john&page=1&limit=20
Authorization: Bearer <admin-token>
```

### Get User Stats (Admin)
```http
GET /users/stats
Authorization: Bearer <admin-token>
```

### Get My Profile (User)
```http
GET /users/profile
Authorization: Bearer <user-token>
```

### Update My Profile (User)
```http
PATCH /users/profile
Content-Type: application/json
Authorization: Bearer <user-token>

{
  "name": "Updated Name"
}
```

### Get User Details (Admin)
```http
GET /users/:id
Authorization: Bearer <admin-token>
```

### Deactivate User (Admin)
```http
PATCH /users/:id/deactivate
Authorization: Bearer <admin-token>
```

### Change User Role (Admin)
```http
PATCH /users/:id/role
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "role": "ADMIN"
}
```

---

## 📊 Analytics API (Admin Only)

### Dashboard Stats
```http
GET /analytics/dashboard
Authorization: Bearer <admin-token>
```

### Recent Downloads
```http
GET /analytics/downloads/recent?days=30
Authorization: Bearer <admin-token>
```

### Top Assets
```http
GET /analytics/assets/top?limit=10
Authorization: Bearer <admin-token>
```

### Subscription Statistics
```http
GET /analytics/subscriptions/stats
Authorization: Bearer <admin-token>
```

### Revenue Stats
```http
GET /analytics/revenue
Authorization: Bearer <admin-token>
```

### User Analytics
```http
GET /analytics/users/:id
Authorization: Bearer <admin-token>
```

---

## ⬇️ Downloads API

### Download Asset (User)
```http
POST /downloads/asset/:assetId
Authorization: Bearer <user-token>
```

### Check Download Limit (User)
```http
GET /downloads/check-limit
Authorization: Bearer <user-token>
```

### My Download History (User)
```http
GET /downloads/my-history?page=1&limit=20
Authorization: Bearer <user-token>
```

### My Download Stats (User)
```http
GET /downloads/my-stats
Authorization: Bearer <user-token>
```

### All Downloads (Admin)
```http
GET /downloads/all?page=1&limit=50
Authorization: Bearer <admin-token>
```

---

## 🔐 Authentication API

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 📈 Response Examples

### Asset Response
```json
{
  "id": 1,
  "name": "Medieval Knight Character",
  "description": "High-quality medieval knight character with animations",
  "price": 0,
  "fileUrl": "/uploads/knight.unitypackage",
  "thumbnail": "/uploads/knight-thumb.png",
  "tags": ["character", "medieval", "knight", "animated"],
  "isActive": true,
  "downloadCount": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "categoryId": 1,
  "uploadedById": 1,
  "category": {
    "id": 1,
    "name": "Characters",
    "slug": "characters"
  },
  "uploadedBy": {
    "id": 1,
    "email": "admin@unityassets.com",
    "name": "Admin User"
  },
  "_count": {
    "downloads": 0
  }
}
```

### Subscription Plan Response
```json
{
  "id": 1,
  "name": "Pro",
  "description": "Great for small teams",
  "basePrice": 19.99,
  "billingCycle": "MONTHLY",
  "yearlyDiscount": 0,
  "dailyDownloadLimit": 20,
  "features": ["20 downloads per day", "Priority support"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🚦 HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## 🛡️ Rate Limiting & Security

### Download Limits
- Users can only download assets within their daily limit
- Limits reset at midnight
- Admin users have unlimited downloads

### Role-Based Access
- `USER`: Can view assets, download (with limits), manage own profile
- `ADMIN`: Full access to all resources, user management, analytics

### Data Validation
- All inputs are validated using class-validator
- File uploads are restricted by type and size
- SQL injection protection via Prisma ORM

---

## 🔧 Development Notes

### Database Schema
- PostgreSQL with Prisma ORM
- Automatic migrations
- Seeded with sample data

### File Uploads
- Stored in `/uploads` directory
- Supports `.unitypackage` and image files
- Random filename generation for security

### Testing
Run the seed script to populate test data:
```bash
npm run seed
```

This will create:
- Admin user: `admin@unityassets.com / admin123`
- Test user: `user@example.com / admin123`
- 5 categories
- 3 subscription plans
- 3 sample assets
- 1 active subscription for test user