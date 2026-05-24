-- CreateTable
CREATE TABLE "alert" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "url" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "priceTarget" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alert_userId_createdAt_idx" ON "alert"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "produtos_historico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
