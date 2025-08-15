-- Add dailyDownloadLimit to SubscriptionPlan
ALTER TABLE "SubscriptionPlan" ADD COLUMN "dailyDownloadLimit" INTEGER NOT NULL DEFAULT 0;

-- Create Download table
CREATE TABLE "Download" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "assetId" INTEGER NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
);

-- Create index on userId and downloadedAt for efficient queries
CREATE INDEX "Download_userId_downloadedAt_idx" ON "Download"("userId", "downloadedAt");

-- Add Foreign Key Constraints
ALTER TABLE "Download" ADD CONSTRAINT "Download_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Download" ADD CONSTRAINT "Download_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;