-- =====================================================================
--  SOUNDPASS – Website bán vé sự kiện âm nhạc theo khu vực (QL35-W)
--  Nhóm 12 "fix xơ" – Môn Quản lý dự án CNTT (MAN104)
--  CSDL: PostgreSQL 14+   |   Thiết kế v1.1 (19/11/2026)
--
--  Căn cứ thiết kế (đã đối chiếu toàn bộ repo Kahprx/event-ticket-platform @539ab67):
--   • backend/prisma/schema.prisma + 3 migration hiện có (14 bảng)
--   • dữ liệu mẫu frontend: data/events.js, bookings.js, admin.js, chatbot.js,
--     utils/pricing.js (phí 2%, mã giảm giá), CheckoutPage (giữ chỗ 10 phút,
--     4 phương thức thanh toán, thông tin người mua), SeatMap (ghế "A1-05",
--     tối đa 8 ghế/đơn), ProfilePage (cài đặt thông báo), AdminLocationsPage
--     (miền, tên ngắn), AdminChatbotPage (chủ đề, đã giải quyết)
--
--  Quy ước tên giữ ĐÚNG như Prisma sinh ra (bảng PascalCase, cột camelCase
--  trong ngoặc kép, khoá chính TEXT cuid do ứng dụng sinh).
--
--  Ký hiệu:  [MỚI] bảng/cột mới   [SỬA] thay đổi so với schema.prisma hiện tại
--  Tổng: 21 bảng = 14 bảng hiện có + 7 bảng mới
--        (Organizer, Area, Seat, PromoCode, TicketHold, CheckIn, KnowledgeDocument)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. KIỂU LIỆT KÊ
-- ---------------------------------------------------------------------
CREATE TYPE "UserStatus"       AS ENUM ('ACTIVE', 'BLOCKED');
CREATE TYPE "EventStatus"      AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');   -- UI: on-sale = PUBLISHED, ended = COMPLETED
CREATE TYPE "TicketTypeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SOLD_OUT');
CREATE TYPE "OrderStatus"      AS ENUM ('PENDING', 'CONFIRMED', 'PAID', 'CANCELLED', 'COMPLETED', 'REFUNDED', 'FAILED');
CREATE TYPE "PaymentStatus"    AS ENUM ('PENDING', 'PAID', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE "TicketStatus"     AS ENUM ('VALID', 'USED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "ChatMessageRole"  AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
CREATE TYPE "SeatingType"      AS ENUM ('STANDING', 'SEATED');                              -- [MỚI] khu đứng / khu ngồi chọn ghế
CREATE TYPE "SeatStatus"       AS ENUM ('AVAILABLE', 'HELD', 'SOLD', 'BLOCKED');            -- [MỚI]
CREATE TYPE "HoldStatus"       AS ENUM ('ACTIVE', 'CONVERTED', 'EXPIRED', 'RELEASED');      -- [MỚI]
CREATE TYPE "CheckInResult"    AS ENUM ('SUCCESS', 'ALREADY_USED', 'INVALID', 'WRONG_EVENT', 'CANCELLED');  -- [MỚI]
CREATE TYPE "DiscountType"     AS ENUM ('PERCENT', 'AMOUNT');                               -- [MỚI] SOUNDPASS10 = 10%, SINHVIEN = 50.000đ


-- =====================================================================
-- PHÂN HỆ 1. NGƯỜI DÙNG, PHÂN QUYỀN, BAN TỔ CHỨC
-- =====================================================================
CREATE TABLE "Role" (
    "key"         TEXT         NOT NULL,                       -- CUSTOMER / ORGANIZER / STAFF / ADMIN – đưa vào JWT
    "name"        TEXT         NOT NULL,
    "description" TEXT,
    "permissions" JSONB        NOT NULL,                       -- ["event:write:own","checkin:scan",…]
    "isSystem"    BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("key")
);

-- [MỚI] Đơn vị tổ chức (UI: event.organizer = {name, description, phone, email})
CREATE TABLE "Organizer" (
    "id"          TEXT         NOT NULL,
    "name"        TEXT         NOT NULL,
    "description" TEXT,
    "phone"       TEXT,
    "email"       TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Organizer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Organizer_name_key" ON "Organizer"("name");

CREATE TABLE "User" (
    "id"                TEXT         NOT NULL,
    "name"              TEXT         NOT NULL,
    "email"             TEXT         NOT NULL,
    "passwordHash"      TEXT         NOT NULL,                 -- bcrypt (12 rounds)
    "avatar"            TEXT,
    "phone"             TEXT,
    "city"              TEXT,
    "roleKey"           TEXT         NOT NULL DEFAULT 'CUSTOMER',
    "organizerId"       TEXT,                                  -- [MỚI] tài khoản ORGANIZER/STAFF thuộc ban tổ chức nào
    "notificationPrefs" JSONB,                                 -- [MỚI] {emailReminder, smsReminder, promotions, newEvents}
    "status"            "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "User_roleKey_fkey"     FOREIGN KEY ("roleKey")     REFERENCES "Role"("key")      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id")  ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "User_email_key"             ON "User"("email");
CREATE INDEX        "User_roleKey_createdAt_idx" ON "User"("roleKey", "createdAt");
CREATE INDEX        "User_status_idx"            ON "User"("status");


-- =====================================================================
-- PHÂN HỆ 2. SỰ KIỆN & SƠ ĐỒ KHU VỰC
-- =====================================================================
-- Thành phố (UI gọi là "location": hcm, hn, dn…). Bộ lọc "theo khu vực" ở trang chủ dùng bảng này.
CREATE TABLE "Region" (
    "id"          TEXT          NOT NULL,
    "name"        TEXT          NOT NULL,                      -- "TP. Hồ Chí Minh"
    "slug"        TEXT          NOT NULL,                      -- "hcm"
    "shortName"   TEXT,                                        -- [MỚI] "Hồ Chí Minh"
    "macroRegion" TEXT,                                        -- [MỚI] "Miền Nam" / "Miền Trung" / "Miền Bắc"
    "latitude"    DECIMAL(9,6),                                -- [MỚI] bản đồ ở trang chi tiết sự kiện
    "longitude"   DECIMAL(9,6),                                -- [MỚI]
    "description" TEXT,
    "createdAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");

CREATE TABLE "Category" (
    "id"          TEXT         NOT NULL,
    "name"        TEXT         NOT NULL,
    "slug"        TEXT         NOT NULL,
    "description" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

CREATE TABLE "Event" (
    "id"          TEXT          NOT NULL,
    "title"       TEXT          NOT NULL,                      -- UI: name
    "slug"        TEXT          NOT NULL,
    "artists"     TEXT[]        NOT NULL DEFAULT '{}',         -- [MỚI] UI: artist; chatbot tìm theo tên nghệ sĩ
    "description" TEXT          NOT NULL,
    "highlights"  TEXT[]        NOT NULL DEFAULT '{}',         -- [MỚI]
    "tags"        TEXT[]        NOT NULL DEFAULT '{}',         -- [MỚI]
    "imageUrl"    TEXT,
    "location"    TEXT          NOT NULL,                      -- UI: venue (tên địa điểm)
    "address"     TEXT          NOT NULL,
    "organizerId" TEXT          NOT NULL,                      -- [SỬA] thay cột text "organizer" bằng khoá ngoại
    "startDate"   TIMESTAMP(3)  NOT NULL,                      -- UI: date + time
    "endDate"     TIMESTAMP(3)  NOT NULL,                      -- UI: date + endTime
    "status"      "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "featured"    BOOLEAN       NOT NULL DEFAULT false,
    "regionId"    TEXT          NOT NULL,                      -- UI: locationId
    "categoryId"  TEXT          NOT NULL,
    "createdAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Event_regionId_fkey"    FOREIGN KEY ("regionId")    REFERENCES "Region"("id")    ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_categoryId_fkey"  FOREIGN KEY ("categoryId")  REFERENCES "Category"("id")  ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_date_check" CHECK ("endDate" > "startDate")                                                       -- [MỚI]
);
CREATE UNIQUE INDEX "Event_slug_key"                 ON "Event"("slug");
CREATE INDEX        "Event_status_startDate_idx"     ON "Event"("status", "startDate");
CREATE INDEX        "Event_regionId_startDate_idx"   ON "Event"("regionId", "startDate");
CREATE INDEX        "Event_categoryId_startDate_idx" ON "Event"("categoryId", "startDate");
CREATE INDEX        "Event_organizerId_idx"          ON "Event"("organizerId");
CREATE INDEX        "Event_artists_idx"              ON "Event" USING GIN ("artists");           -- [MỚI] tìm "có show của Suboi không?"

-- [MỚI] Khu vực trong sơ đồ địa điểm (UI: seating.zones – Khu A/B/C; hoặc khu đứng GA/VIP)
CREATE TABLE "Area" (
    "id"          TEXT          NOT NULL,
    "eventId"     TEXT          NOT NULL,
    "code"        TEXT          NOT NULL,                      -- "A", "B", "VIP", "GA"
    "name"        TEXT          NOT NULL,                      -- "Khu A — Gần sân khấu"
    "seatingType" "SeatingType" NOT NULL DEFAULT 'STANDING',
    "capacity"    INTEGER       NOT NULL,
    "rowCount"    INTEGER,                                     -- chỉ khu SEATED
    "seatsPerRow" INTEGER,                                     -- chỉ khu SEATED
    "color"       TEXT,
    "mapLayout"   JSONB,                                       -- vị trí/hình dạng khu trên sơ đồ
    "sortOrder"   INTEGER       NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Area_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Area_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Area_capacity_check" CHECK ("capacity" > 0),
    CONSTRAINT "Area_seated_check" CHECK (
        "seatingType" = 'STANDING'
        OR ("rowCount" > 0 AND "seatsPerRow" > 0 AND "capacity" = "rowCount" * "seatsPerRow"))
);
CREATE UNIQUE INDEX "Area_eventId_code_key" ON "Area"("eventId", "code");

-- [MỚI] Ghế của khu SEATED; mã ghế khớp SeatMap.jsx: "A1-05" = khu A, hàng 1, ghế 05
CREATE TABLE "Seat" (
    "id"         TEXT         NOT NULL,
    "areaId"     TEXT         NOT NULL,
    "rowLabel"   TEXT         NOT NULL,
    "seatNumber" INTEGER      NOT NULL,
    "code"       TEXT         NOT NULL,
    "status"     "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Seat_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Seat_areaId_code_key"   ON "Seat"("areaId", "code");
CREATE INDEX        "Seat_areaId_status_idx" ON "Seat"("areaId", "status");

-- Hạng vé = giá bán của một khu (UI: ticketTypes {name, price, total, sold, note})
CREATE TABLE "TicketType" (
    "id"          TEXT               NOT NULL,
    "eventId"     TEXT               NOT NULL,
    "areaId"      TEXT               NOT NULL,                 -- [MỚI]
    "name"        TEXT               NOT NULL,
    "description" TEXT,                                        -- UI: note
    "price"       DECIMAL(12,2)      NOT NULL,
    "quantity"    INTEGER            NOT NULL,                 -- UI: total
    "sold"        INTEGER            NOT NULL DEFAULT 0,
    "held"        INTEGER            NOT NULL DEFAULT 0,       -- [MỚI] đang giữ, chưa thanh toán
    "maxPerOrder" INTEGER            NOT NULL DEFAULT 8,       -- [MỚI] UI: MAX_SEATS_PER_ORDER = 8 – chống đầu cơ
    "saleStart"   TIMESTAMP(3),
    "saleEnd"     TIMESTAMP(3),
    "status"      "TicketTypeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt"   TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TicketType_areaId_fkey"  FOREIGN KEY ("areaId")  REFERENCES "Area"("id")  ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TicketType_stock_check"  CHECK ("sold" >= 0 AND "held" >= 0 AND "sold" + "held" <= "quantity"),   -- [MỚI] chốt chặn bán vượt
    CONSTRAINT "TicketType_price_check"  CHECK ("price" >= 0),
    CONSTRAINT "TicketType_maxPerOrder_check" CHECK ("maxPerOrder" > 0)
);
CREATE UNIQUE INDEX "TicketType_eventId_name_key" ON "TicketType"("eventId", "name");
CREATE INDEX        "TicketType_eventId_idx"      ON "TicketType"("eventId");
CREATE INDEX        "TicketType_areaId_idx"       ON "TicketType"("areaId");


-- =====================================================================
-- PHÂN HỆ 3. ĐẶT VÉ, THANH TOÁN, SOÁT VÉ
-- =====================================================================
-- [MỚI] Mã giảm giá (UI: utils/pricing.js PROMO_CODES)
CREATE TABLE "PromoCode" (
    "id"           TEXT           NOT NULL,
    "code"         TEXT           NOT NULL,                    -- "SOUNDPASS10"
    "label"        TEXT           NOT NULL,                    -- "Giảm 10% giá vé"
    "discountType" "DiscountType" NOT NULL,
    "value"        DECIMAL(12,2)  NOT NULL,                    -- 10 (%) hoặc 50000 (đ)
    "eventId"      TEXT,                                       -- NULL = áp dụng mọi sự kiện
    "usageLimit"   INTEGER,                                    -- NULL = không giới hạn
    "usedCount"    INTEGER        NOT NULL DEFAULT 0,
    "startsAt"     TIMESTAMP(3),
    "endsAt"       TIMESTAMP(3),
    "isActive"     BOOLEAN        NOT NULL DEFAULT true,
    "createdAt"    TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PromoCode_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PromoCode_value_check" CHECK ("value" > 0 AND ("discountType" = 'AMOUNT' OR "value" <= 100)),
    CONSTRAINT "PromoCode_usage_check" CHECK ("usageLimit" IS NULL OR "usedCount" <= "usageLimit")
);
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

CREATE TABLE "Order" (
    "id"             TEXT            NOT NULL,
    "orderCode"      TEXT            NOT NULL,                 -- UI: "BK-2611-0841"
    "userId"         TEXT            NOT NULL,
    "eventId"        TEXT            NOT NULL,
    "buyerName"      TEXT            NOT NULL,                 -- [MỚI] form người mua ở trang thanh toán
    "buyerEmail"     TEXT            NOT NULL,                 -- [MỚI] gửi vé QR
    "buyerPhone"     TEXT            NOT NULL,                 -- [MỚI]
    "subtotal"       DECIMAL(12,2)   NOT NULL,                 -- [MỚI] tổng giá vé
    "serviceFee"     DECIMAL(12,2)   NOT NULL DEFAULT 0,       -- [MỚI] 2% (SERVICE_FEE_RATE)
    "discountAmount" DECIMAL(12,2)   NOT NULL DEFAULT 0,       -- [MỚI]
    "promoCodeId"    TEXT,                                     -- [MỚI]
    "totalAmount"    DECIMAL(12,2)   NOT NULL,
    "status"         "OrderStatus"   NOT NULL DEFAULT 'PENDING',
    "paymentStatus"  "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "cancelledAt"    TIMESTAMP(3),                             -- [MỚI] huỷ trước 48h, phí 20%
    "createdAt"      TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Order_userId_fkey"      FOREIGN KEY ("userId")      REFERENCES "User"("id")      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_eventId_fkey"     FOREIGN KEY ("eventId")     REFERENCES "Event"("id")     ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_amount_check" CHECK (
        "subtotal" >= 0 AND "serviceFee" >= 0 AND "discountAmount" >= 0
        AND "totalAmount" = GREATEST(0, "subtotal" + "serviceFee" - "discountAmount"))
);
CREATE UNIQUE INDEX "Order_orderCode_key"            ON "Order"("orderCode");
CREATE INDEX        "Order_userId_createdAt_idx"     ON "Order"("userId", "createdAt");
CREATE INDEX        "Order_eventId_createdAt_idx"    ON "Order"("eventId", "createdAt");
CREATE INDEX        "Order_status_paymentStatus_idx" ON "Order"("status", "paymentStatus");

CREATE TABLE "OrderItem" (
    "id"           TEXT          NOT NULL,
    "orderId"      TEXT          NOT NULL,
    "ticketTypeId" TEXT          NOT NULL,
    "quantity"     INTEGER       NOT NULL,
    "price"        DECIMAL(12,2) NOT NULL,                     -- giá tại thời điểm mua
    "subtotal"     DECIMAL(12,2) NOT NULL,
    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OrderItem_orderId_fkey"      FOREIGN KEY ("orderId")      REFERENCES "Order"("id")      ON DELETE CASCADE  ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_quantity_check" CHECK ("quantity" > 0 AND "subtotal" = "quantity" * "price")
);
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- [MỚI] Giữ vé 10 phút (UI: đồng hồ đếm ngược ở CheckoutPage)
CREATE TABLE "TicketHold" (
    "id"           TEXT         NOT NULL,
    "userId"       TEXT         NOT NULL,
    "ticketTypeId" TEXT         NOT NULL,
    "seatId"       TEXT,                                       -- khu SEATED: 1 lượt giữ = 1 ghế
    "orderId"      TEXT,                                       -- gắn vào đơn khi bấm "Thanh toán"
    "quantity"     INTEGER      NOT NULL,
    "status"       "HoldStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt"    TIMESTAMP(3) NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketHold_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TicketHold_userId_fkey"       FOREIGN KEY ("userId")       REFERENCES "User"("id")       ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TicketHold_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TicketHold_seatId_fkey"       FOREIGN KEY ("seatId")       REFERENCES "Seat"("id")       ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TicketHold_orderId_fkey"      FOREIGN KEY ("orderId")      REFERENCES "Order"("id")      ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TicketHold_quantity_check" CHECK ("quantity" > 0 AND ("seatId" IS NULL OR "quantity" = 1))
);
CREATE UNIQUE INDEX "TicketHold_seatId_active_key"    ON "TicketHold"("seatId") WHERE "status" = 'ACTIVE' AND "seatId" IS NOT NULL;
CREATE INDEX        "TicketHold_status_expiresAt_idx" ON "TicketHold"("status", "expiresAt");
CREATE INDEX        "TicketHold_userId_idx"           ON "TicketHold"("userId");
CREATE INDEX        "TicketHold_orderId_idx"          ON "TicketHold"("orderId");

CREATE TABLE "Payment" (
    "id"           TEXT            NOT NULL,
    "orderId"      TEXT            NOT NULL,
    "providerRef"  TEXT,                                       -- mã giao dịch cổng thanh toán (Prisma: transactionCode)
    "amount"       DECIMAL(12,2)   NOT NULL,
    "method"       TEXT            NOT NULL DEFAULT 'MOCK',    -- MOMO / VNPAY / CARD / BANK_TRANSFER / MOCK
    "status"       "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt"       TIMESTAMP(3),
    "refundAmount" DECIMAL(12,2),                              -- [MỚI] = 80% giá vé khi huỷ (phí huỷ 20%)
    "refundedAt"   TIMESTAMP(3),                               -- [MỚI]
    "createdAt"    TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_refund_check" CHECK ("refundAmount" IS NULL OR ("refundAmount" >= 0 AND "refundAmount" <= "amount"))
);
CREATE UNIQUE INDEX "Payment_orderId_key"     ON "Payment"("orderId");
CREATE UNIQUE INDEX "Payment_providerRef_key" ON "Payment"("providerRef");     -- callback trùng bị chặn → idempotent

CREATE TABLE "Ticket" (
    "id"           TEXT           NOT NULL,
    "ticketCode"   TEXT           NOT NULL,
    "orderId"      TEXT           NOT NULL,
    "userId"       TEXT           NOT NULL,
    "eventId"      TEXT           NOT NULL,
    "ticketTypeId" TEXT           NOT NULL,
    "seatId"       TEXT,                                       -- [MỚI]
    "status"       "TicketStatus" NOT NULL DEFAULT 'VALID',
    "qrCode"       TEXT,                                       -- ticketCode + chữ ký HMAC
    "createdAt"    TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Ticket_orderId_fkey"      FOREIGN KEY ("orderId")      REFERENCES "Order"("id")      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_userId_fkey"       FOREIGN KEY ("userId")       REFERENCES "User"("id")       ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_eventId_fkey"      FOREIGN KEY ("eventId")      REFERENCES "Event"("id")      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_seatId_fkey"       FOREIGN KEY ("seatId")       REFERENCES "Seat"("id")       ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Ticket_ticketCode_key"       ON "Ticket"("ticketCode");
CREATE INDEX        "Ticket_userId_createdAt_idx" ON "Ticket"("userId", "createdAt");
CREATE INDEX        "Ticket_eventId_idx"          ON "Ticket"("eventId");
CREATE UNIQUE INDEX "Ticket_seatId_active_key"    ON "Ticket"("seatId") WHERE "seatId" IS NOT NULL AND "status" IN ('VALID', 'USED');  -- [MỚI] 1 ghế ≤ 1 vé hiệu lực

-- [MỚI] Nhật ký soát vé (ghi cả lượt quét bị từ chối để phát hiện vé giả)
CREATE TABLE "CheckIn" (
    "id"          TEXT            NOT NULL,
    "ticketId"    TEXT,                                        -- NULL khi mã không khớp vé nào
    "eventId"     TEXT            NOT NULL,
    "staffId"     TEXT            NOT NULL,
    "scannedCode" TEXT            NOT NULL,
    "result"      "CheckInResult" NOT NULL,
    "gate"        TEXT,
    "scannedAt"   TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CheckIn_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CheckIn_eventId_fkey"  FOREIGN KEY ("eventId")  REFERENCES "Event"("id")  ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CheckIn_staffId_fkey"  FOREIGN KEY ("staffId")  REFERENCES "User"("id")   ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CheckIn_ticketId_success_key"  ON "CheckIn"("ticketId") WHERE "result" = 'SUCCESS';   -- mỗi vé vào cổng đúng 1 lần
CREATE INDEX        "CheckIn_eventId_scannedAt_idx" ON "CheckIn"("eventId", "scannedAt");


-- =====================================================================
-- PHÂN HỆ 4. CHATBOT AI, NHẬT KÝ, THÔNG BÁO
-- =====================================================================
CREATE TABLE "ChatConversation" (
    "id"        TEXT         NOT NULL,
    "userId"    TEXT,                                          -- NULL: khách chưa đăng nhập
    "topic"     TEXT,                                          -- [MỚI] UI admin: "Hỏi cách thanh toán"
    "resolved"  BOOLEAN      NOT NULL DEFAULT false,           -- [MỚI] UI admin: Đã/Chưa giải quyết
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ChatConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "ChatConversation_userId_createdAt_idx" ON "ChatConversation"("userId", "createdAt");

CREATE TABLE "ChatMessage" (
    "id"             TEXT              NOT NULL,
    "conversationId" TEXT              NOT NULL,
    "role"           "ChatMessageRole" NOT NULL,
    "content"        TEXT              NOT NULL,
    "eventIds"       TEXT[]            NOT NULL DEFAULT '{}',  -- [MỚI] UI: thẻ sự kiện gợi ý kèm câu trả lời
    "toolName"       TEXT,                                     -- [MỚI] tool calling, vd "kiem_tra_con_ve"
    "tokenCount"     INTEGER,                                  -- [MỚI] theo dõi chi phí dịch vụ LLM
    "createdAt"      TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ChatMessage_conversationId_createdAt_idx" ON "ChatMessage"("conversationId", "createdAt");

-- [MỚI] Tài liệu nghiệp vụ cho chatbot (thay các câu trả lời đang viết cứng trong data/chatbot.js)
CREATE TABLE "KnowledgeDocument" (
    "id"        TEXT         NOT NULL,
    "eventId"   TEXT,                                          -- NULL = tài liệu chung
    "title"     TEXT         NOT NULL,
    "category"  TEXT         NOT NULL,                         -- POLICY / FAQ / GUIDE / EVENT_INFO
    "content"   TEXT         NOT NULL,
    "isActive"  BOOLEAN      NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "KnowledgeDocument_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "KnowledgeDocument_category_isActive_idx" ON "KnowledgeDocument"("category", "isActive");

CREATE TABLE "ActivityLog" (
    "id"          TEXT         NOT NULL,
    "userId"      TEXT,
    "action"      TEXT         NOT NULL,
    "entity"      TEXT         NOT NULL,
    "entityId"    TEXT,                                        -- đa hình, cố ý không có FK
    "description" TEXT         NOT NULL,
    "ipAddress"   TEXT,
    "userAgent"   TEXT,
    "metadata"    JSONB,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "ActivityLog_createdAt_idx"        ON "ActivityLog"("createdAt");
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");
CREATE INDEX "ActivityLog_action_createdAt_idx" ON "ActivityLog"("action", "createdAt");
CREATE INDEX "ActivityLog_entity_entityId_idx"  ON "ActivityLog"("entity", "entityId");

CREATE TABLE "Notification" (
    "id"        TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "type"      TEXT         NOT NULL,                         -- ORDER_PAID / EVENT_REMINDER / PROMOTION…
    "title"     TEXT         NOT NULL,
    "message"   TEXT         NOT NULL,
    "isRead"    BOOLEAN      NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");


-- =====================================================================
-- DỮ LIỆU MẪU (lấy theo dữ liệu mẫu của frontend để demo khớp giao diện)
-- passwordHash là chuỗi giữ chỗ; seed.js mới băm mật khẩu thật bằng bcrypt.
-- =====================================================================
INSERT INTO "Role" ("key", "name", "description", "permissions", "isSystem") VALUES
 ('CUSTOMER',  'Khách hàng',        'Đặt vé, xem vé và quản lý hồ sơ cá nhân',
  '["event:read","ticket:create","ticket:read","profile:update"]', true),
 ('ORGANIZER', 'Ban tổ chức',       'Quản lý sự kiện, khu vực, hạng vé của đơn vị mình; xem báo cáo bán vé',
  '["event:write:own","area:write:own","report:read:own"]', true),
 ('STAFF',     'Nhân viên soát vé', 'Quét QR và xác nhận vé tại cổng',
  '["checkin:scan"]', true),
 ('ADMIN',     'Quản trị viên',     'Toàn quyền quản lý sự kiện, đơn hàng, tài khoản và báo cáo',
  '["admin:access","event:write","order:write","account:write","report:read"]', true);

INSERT INTO "Organizer" ("id", "name", "description", "phone", "email") VALUES
 ('org_nhts',  'Nhà hát Thành phố',       'Nhà hát lâu đời tại trung tâm Quận 1.',            '028 3823 7419', 'info@hbsaigon.vn'),
 ('org_sw',    'Soundwave Entertainment', 'Tổ chức lễ hội âm nhạc quy mô lớn tại TP.HCM.',    '028 7300 2026', 'hello@soundwave.vn');

INSERT INTO "User" ("id", "name", "email", "passwordHash", "phone", "city", "roleKey", "organizerId", "notificationPrefs") VALUES
 ('usr_admin', 'Trần Quản Trị',   'admin@soundpass.vn',         '$2b$12$placeholder', '0902000001', 'TP. Hồ Chí Minh', 'ADMIN',     NULL,       NULL),
 ('usr_org',   'Lê Ban Tổ Chức',  'organizer@soundpass.vn',     '$2b$12$placeholder', '0902000002', 'TP. Hồ Chí Minh', 'ORGANIZER', 'org_sw',   NULL),
 ('usr_staff', 'Phạm Soát Vé',    'staff@soundpass.vn',         '$2b$12$placeholder', '0902000003', 'TP. Hồ Chí Minh', 'STAFF',     'org_sw',   NULL),
 ('usr_c1',    'Nguyễn Minh Anh', 'minhanh.nguyen@example.com', '$2b$12$placeholder', '0901234567', 'TP. Hồ Chí Minh', 'CUSTOMER',  NULL,
  '{"emailReminder":true,"smsReminder":false,"promotions":true,"newEvents":true}'),
 ('usr_c2',    'Trần Quốc Bảo',   'quocbao.tran@example.com',   '$2b$12$placeholder', '0903456789', 'Hà Nội',          'CUSTOMER',  NULL,       NULL);

INSERT INTO "Region" ("id", "name", "slug", "shortName", "macroRegion", "latitude", "longitude") VALUES
 ('reg_hcm', 'TP. Hồ Chí Minh', 'hcm', 'Hồ Chí Minh', 'Miền Nam',   10.776900, 106.700900),
 ('reg_hn',  'Hà Nội',          'hn',  'Hà Nội',      'Miền Bắc',   21.027800, 105.834200),
 ('reg_dn',  'Đà Nẵng',         'dn',  'Đà Nẵng',     'Miền Trung', 16.054400, 108.202200);

INSERT INTO "Category" ("id", "name", "slug") VALUES
 ('cat_live', 'Live music', 'live'), ('cat_festival', 'Festival', 'festival'), ('cat_acoustic', 'Acoustic', 'acoustic');

INSERT INTO "Event" ("id", "title", "slug", "artists", "description", "highlights", "tags", "location", "address",
                     "organizerId", "startDate", "endDate", "status", "featured", "regionId", "categoryId") VALUES
 ('evt_night', 'Ho Chi Minh City Music Night', 'hcm-music-night',
  ARRAY['Dàn nhạc Giao hưởng TP.HCM'], 'Đêm nhạc giao hưởng, chỗ ngồi đánh số theo khu vực.',
  ARRAY['Nhạc giao hưởng','Chỗ ngồi đánh số'], ARRAY['Giao hưởng','Trong nhà'],
  'Nhà hát Thành phố', '7 Công trường Lam Sơn, Quận 1', 'org_nhts',
  '2026-11-21 20:00', '2026-11-21 22:00', 'PUBLISHED', true, 'reg_hcm', 'cat_live'),
 ('evt_sw', 'Soundwave Festival 2026', 'soundwave-festival-2026',
  ARRAY['Đen Vâu','Suboi','Hồ Ngọc Hà','Chillies'], 'Lễ hội âm nhạc ngoài trời, hai sân khấu.',
  ARRAY['Hai sân khấu','Khu VIP riêng'], ARRAY['Ngoài trời','Festival'],
  'Khu đô thị Sala', '10 Mai Chí Thọ, Thủ Đức', 'org_sw',
  '2026-12-05 16:00', '2026-12-05 23:00', 'PUBLISHED', true, 'reg_hcm', 'cat_festival');

INSERT INTO "Area" ("id", "eventId", "code", "name", "seatingType", "capacity", "rowCount", "seatsPerRow", "color", "sortOrder") VALUES
 ('ar_n_A',  'evt_night', 'A',   'Khu A — Gần sân khấu', 'SEATED',   48,   4,    12,   '#E4572E', 1),
 ('ar_n_B',  'evt_night', 'B',   'Khu B — Trung tâm',    'SEATED',   70,   5,    14,   '#F3A712', 2),
 ('ar_n_C',  'evt_night', 'C',   'Khu C — Hàng sau',     'SEATED',   64,   4,    16,   '#29335C', 3),
 ('ar_s_GA', 'evt_sw',    'GA',  'Khu GA',               'STANDING', 9000, NULL, NULL, '#669BBC', 1),
 ('ar_s_VIP','evt_sw',    'VIP', 'Khu VIP',              'STANDING', 3000, NULL, NULL, '#A8C686', 2);

-- Sinh ghế cho khu SEATED, mã "A1-05" giống SeatMap.jsx
INSERT INTO "Seat" ("id", "areaId", "rowLabel", "seatNumber", "code")
SELECT 'seat_' || a."code" || r || '_' || lpad(s::text, 2, '0'), a."id", r::text, s,
       a."code" || r || '-' || lpad(s::text, 2, '0')
FROM "Area" a
CROSS JOIN LATERAL generate_series(1, a."rowCount")    AS r
CROSS JOIN LATERAL generate_series(1, a."seatsPerRow") AS s
WHERE a."seatingType" = 'SEATED';

INSERT INTO "TicketType" ("id", "eventId", "areaId", "name", "description", "price", "quantity") VALUES
 ('tt_n_A',  'evt_night', 'ar_n_A',  'Khu A',   'Hàng đầu, gần sân khấu',           899000,   48),
 ('tt_n_B',  'evt_night', 'ar_n_B',  'Khu B',   'Khu vực trung tâm',                599000,   70),
 ('tt_n_C',  'evt_night', 'ar_n_C',  'Khu C',   'Hàng sau, tiết kiệm',              399000,   64),
 ('tt_s_GA', 'evt_sw',    'ar_s_GA', 'Vé GA',   'Đứng tự do trước sân khấu chính',  599000, 9000),
 ('tt_s_VIP','evt_sw',    'ar_s_VIP','Vé VIP',  'Lối vào riêng, gần sân khấu',     1499000, 3000);

INSERT INTO "PromoCode" ("id", "code", "label", "discountType", "value", "usageLimit") VALUES
 ('promo_sp10', 'SOUNDPASS10', 'Giảm 10% giá vé',             'PERCENT', 10,    500),
 ('promo_sv',   'SINHVIEN',    'Giảm 50.000 ₫ cho sinh viên', 'AMOUNT',  50000, NULL);

INSERT INTO "KnowledgeDocument" ("id", "eventId", "title", "category", "content") VALUES
 ('kd_cancel', NULL, 'Chính sách huỷ vé', 'POLICY',
  'Có thể huỷ trước 48 giờ so với giờ diễn. Phí huỷ 20% giá vé; tiền hoàn trong 3–5 ngày làm việc.'),
 ('kd_hold',   NULL, 'Giữ chỗ khi thanh toán', 'GUIDE',
  'Hệ thống giữ chỗ trong 10 phút. Quá thời gian chưa thanh toán, vé được trả lại cho người khác.'),
 ('kd_pay',    NULL, 'Phương thức thanh toán', 'FAQ',
  'Hỗ trợ MoMo, VNPay, thẻ ngân hàng (Visa, Mastercard, Napas) và chuyển khoản. Phí dịch vụ 2%.'),
 ('kd_night',  'evt_night', 'Lưu ý Ho Chi Minh City Music Night', 'EVENT_INFO',
  'Thời lượng khoảng 110 phút, giải lao 15 phút. Vé chuyển nhượng một lần nếu báo trước 24 giờ.');
