ALTER TABLE "Product"
ADD COLUMN "referencePrice" DECIMAL(12,2),
ADD COLUMN "referencePriceUrl" TEXT,
ADD COLUMN "referencePriceCheckedAt" TIMESTAMP(3);
