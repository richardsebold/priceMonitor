-- DropIndex
DROP INDEX "produtos_historico_url_key";

-- CreateIndex
CREATE UNIQUE INDEX "produtos_historico_userId_url_key" ON "produtos_historico"("userId", "url");
