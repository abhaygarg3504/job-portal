-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "companyId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_companyId_idx" ON "Comment"("companyId");
