-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "model" SET DEFAULT 'llama-3.3-70b-versatile';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileType" TEXT;
