-- CreateTable
CREATE TABLE "produtos_historico" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "price" TEXT,
    "method" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "produtos_historico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "produtos_historico" ADD CONSTRAINT "produtos_historico_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
