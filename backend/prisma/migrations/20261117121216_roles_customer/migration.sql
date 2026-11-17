-- Create role table first so existing users can be migrated safely.
CREATE TABLE "Role" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("key")
);

INSERT INTO "Role" ("key", "name", "description", "permissions", "isSystem", "createdAt", "updatedAt")
VALUES
    ('CUSTOMER', 'Khách hàng', 'Đặt vé, xem vé và quản lý hồ sơ cá nhân', '["event:read","ticket:create","ticket:read","profile:update"]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ADMIN', 'Quản trị viên', 'Toàn quyền quản lý sự kiện, đơn hàng, tài khoản và báo cáo', '["admin:access","event:write","order:write","account:write","report:read"]'::jsonb, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Preserve existing roles while replacing the enum with a relation.
DROP INDEX "User_role_createdAt_idx";

ALTER TABLE "User"
    ADD COLUMN "city" TEXT,
    ADD COLUMN "roleKey" TEXT NOT NULL DEFAULT 'CUSTOMER';

UPDATE "User" SET "roleKey" = CASE WHEN "role" = 'ADMIN' THEN 'ADMIN' ELSE 'CUSTOMER' END;

ALTER TABLE "User" DROP COLUMN "role";

DROP TYPE "UserRole";

CREATE INDEX "User_roleKey_createdAt_idx" ON "User"("roleKey", "createdAt");

ALTER TABLE "User" ADD CONSTRAINT "User_roleKey_fkey" FOREIGN KEY ("roleKey") REFERENCES "Role"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
