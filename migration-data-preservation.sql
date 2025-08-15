-- Data preservation migration for restructured schema
-- This migration handles the schema changes while preserving existing data

BEGIN;

-- Create new tables with the updated structure
CREATE TABLE IF NOT EXISTS "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Create users table (will replace User table)
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create subscription_plans table (will replace SubscriptionPlan table)  
CREATE TABLE IF NOT EXISTS "subscription_plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "yearlyDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyDownloadLimit" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- Create user_subscriptions table (will replace UserSubscription table)
CREATE TABLE IF NOT EXISTS "user_subscriptions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- Create assets table (will replace Asset table)
CREATE TABLE IF NOT EXISTS "assets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fileUrl" TEXT NOT NULL,
    "thumbnail" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "uploadedById" INTEGER NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- Create downloads table (will replace Download table)
CREATE TABLE IF NOT EXISTS "downloads" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "assetId" INTEGER NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS "analytics" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metric" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- Create enums if they don't exist
DO $$ BEGIN
    CREATE TYPE "BillingCycle" AS ENUM ('WEEKLY', 'MONTHLY', 'YEARLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create a default category for existing assets
INSERT INTO "categories" ("name", "description", "slug", "createdAt", "updatedAt")
VALUES ('General', 'General category for uncategorized assets', 'general', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Migrate existing users data
INSERT INTO "users" ("id", "name", "email", "password", "role", "isActive", "createdAt", "updatedAt")
SELECT "id", "name", "email", "password", "role", true, "createdAt", "updatedAt"
FROM "User"
ON CONFLICT ("id") DO NOTHING;

-- Migrate existing subscription plans data
INSERT INTO "subscription_plans" ("id", "name", "basePrice", "billingCycle", "dailyDownloadLimit", "isActive", "createdAt", "updatedAt")
SELECT 
    "id", 
    "name", 
    "price", 
    CASE 
        WHEN "durationInDays" <= 7 THEN 'WEEKLY'::BillingCycle
        WHEN "durationInDays" <= 31 THEN 'MONTHLY'::BillingCycle
        ELSE 'YEARLY'::BillingCycle
    END,
    "dailyDownloadLimit", 
    true, 
    "createdAt", 
    "updatedAt"
FROM "SubscriptionPlan"
ON CONFLICT ("id") DO NOTHING;

-- Migrate existing user subscriptions data
INSERT INTO "user_subscriptions" ("id", "userId", "planId", "startDate", "endDate", "isActive", "createdAt")
SELECT "id", "userId", "planId", "startDate", "endDate", true, "createdAt"
FROM "UserSubscription"
ON CONFLICT ("id") DO NOTHING;

-- Migrate existing assets data
INSERT INTO "assets" ("id", "name", "description", "price", "fileUrl", "thumbnail", "isActive", "downloadCount", "createdAt", "updatedAt", "categoryId", "uploadedById")
SELECT 
    "id", 
    "name", 
    "description", 
    "price", 
    "fileUrl", 
    "thumbnail", 
    true, 
    0, 
    "createdAt", 
    "updatedAt",
    (SELECT id FROM "categories" WHERE slug = 'general' LIMIT 1),
    "uploadedById"
FROM "Asset"
ON CONFLICT ("id") DO NOTHING;

-- Migrate existing downloads data
INSERT INTO "downloads" ("id", "userId", "assetId", "downloadedAt")
SELECT "id", "userId", "assetId", "downloadedAt"
FROM "Download"
ON CONFLICT ("id") DO NOTHING;

COMMIT;