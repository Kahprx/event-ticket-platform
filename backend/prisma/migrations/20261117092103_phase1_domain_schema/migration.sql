/*
  Warnings:

  - You are about to drop the column `provider` on the `Payment` table. All the data in the column will be lost.
  - The `status` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `subtotal` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TicketTypeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SOLD_OUT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('VALID', 'USED', 'CANCELLED', 'EXPIRED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED';
ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PAID';

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "subtotal" DECIMAL(12,2) NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "provider",
ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'MOCK';

-- AlterTable
ALTER TABLE "Region" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "qrCode" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "TicketStatus" NOT NULL DEFAULT 'VALID';

-- AlterTable
ALTER TABLE "TicketType" ADD COLUMN     "saleEnd" TIMESTAMP(3),
ADD COLUMN     "saleStart" TIMESTAMP(3),
ADD COLUMN     "status" "TicketTypeStatus" NOT NULL DEFAULT 'ACTIVE';
