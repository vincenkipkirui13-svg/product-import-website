CREATE TABLE IF NOT EXISTS "PaymentSettings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "publicKey" TEXT,
  "secretKeyEncrypted" TEXT,
  "secretKeyLast4" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentSettings_pkey" PRIMARY KEY ("id")
);
