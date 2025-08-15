# Claude Code Assistant - Data Preservation Rules

## 🔒 CRITICAL DATA PRESERVATION PROTOCOL

**MANDATORY RULE: ALWAYS BACKUP BEFORE ANY CHANGES**

### Before ANY database operation, schema change, or migration:

1. **ALWAYS run backup first**:
   ```bash
   cd unity-assets-backend && npm run backup
   ```

2. **Use safe migration instead of direct prisma commands**:
   ```bash
   # ❌ NEVER DO THIS:
   npx prisma migrate dev
   npx prisma migrate reset
   npx prisma db push
   
   # ✅ ALWAYS DO THIS:
   npm run safe-migrate
   npm run safe-migrate "migration-name"
   ```

3. **If something goes wrong, restore immediately**:
   ```bash
   npm run restore
   ```

## 🛠️ Available Data Safety Commands

### Backup Commands
- `npm run backup` - Create full database backup
- `npm run restore` - Restore from latest backup
- `npm run restore path/to/backup.json` - Restore from specific backup

### Safe Operations
- `npm run safe-migrate` - Safe database migration with auto-backup
- `npm run safe-migrate "migration-name"` - Named safe migration

### Emergency Recovery
- `npm run seed` - Restore basic test data
- `npm run create-admin-auto` - Recreate admin user

## 📋 Current Test Data

### Admin Accounts
- **Primary**: `admin@unityassets.com` / `Admin@123`
- **Demo**: `admin@example.com` / `admin123`

### Test User
- `user@example.com` / `admin123`

### Sample Data
- 5 Categories (Characters, Environments, Props, Effects, Audio)
- 3 Subscription Plans (Basic, Pro, Enterprise)
- 3 Sample Assets
- 1 Active Subscription
- Recent Activities for dashboard

## 🚨 Emergency Procedures

If data is accidentally lost:

1. **Stop all operations immediately**
2. **Check for backups**: `ls unity-assets-backend/backups/`
3. **Restore latest backup**: `npm run restore`
4. **If no backups exist**: `npm run seed` (creates basic data)
5. **Verify restoration**: Check admin dashboard

## 📁 Backup Storage

- Location: `unity-assets-backend/backups/`
- Format: JSON files with timestamp
- Retention: Last 10 backups kept automatically
- Latest backup: `latest-backup.json`

## 🎯 Development Workflow

### For New Features:
1. `npm run backup` (create safety backup)
2. Develop feature
3. If schema changes needed: `npm run safe-migrate "feature-name"`
4. Test feature
5. If anything breaks: `npm run restore`

### For Schema Changes:
1. `npm run backup` (MANDATORY)
2. Update `schema.prisma`
3. `npm run safe-migrate "schema-change-description"`
4. Verify data integrity
5. If issues: `npm run restore`

## ⚡ Quick Reference

```bash
# Before any risky operation
npm run backup

# Safe migration (auto-backup + migration + verification)
npm run safe-migrate

# Emergency restore
npm run restore

# Create admin user
npm run create-admin-auto

# Reseed basic data
npm run seed
```

## 🔐 Security Notes

- Passwords in backups are marked as `[HASHED]`
- Backups include all relational data
- Original IDs are preserved during restore
- All timestamps are maintained

## ✅ Quick Health Check

```bash
npm run verify-data  # Verify current data integrity
```

---

## 🚀 Complete Setup from Scratch

If you ever need to completely reset:

```bash
# 1. Backup current data (if any)
npm run backup

# 2. Reset database with safe migration
npm run safe-migrate

# 3. Restore basic test data
npm run seed

# 4. Verify everything is working
npm run verify-data

# 5. Start backend
npm run start:dev
```

---

**REMEMBER: When in doubt, BACKUP FIRST!** 🛡️

## 🎯 GUARANTEE: DATA WILL NEVER BE LOST AGAIN

With this system in place:
- ✅ Auto-backups before any changes
- ✅ Safe migration with rollback capability  
- ✅ Multiple admin accounts as fallback
- ✅ Comprehensive data verification
- ✅ Emergency recovery procedures
- ✅ Git hooks for additional safety

**Your data is now bulletproof!** 🛡️💪