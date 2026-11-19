-- =====================================================================
--  SOUNDPASS – Truy vấn nghiệp vụ cốt lõi (QL35-W)   |   v1.1
--  Chạy sau schema.sql:   psql -d soundpass -f queries.sql
--  Tham số viết dạng biến psql (:'ten') – tương ứng tham số trong
--  prisma.$queryRaw / $executeRaw ở backend. Mỗi nghiệp vụ chạy trong 1 transaction.
-- =====================================================================
\set ON_ERROR_STOP on
\pset footer off


-- ---------------------------------------------------------------------
-- NV1. GIỮ VÉ KHU ĐỨNG – chọn 2 vé VIP
--   Điều kiện "sold + held + qty <= quantity" nằm trong chính câu UPDATE:
--   nhiều người bấm cùng lúc thì PostgreSQL khoá dòng, chỉ người còn đủ vé
--   mới cập nhật được. Trả về 0 dòng = hết vé hoặc vượt giới hạn mỗi đơn.
-- ---------------------------------------------------------------------
\set user_id     'usr_c1'
\set ticket_type 'tt_s_VIP'
\set qty         2

BEGIN;
WITH giu AS (
    UPDATE "TicketType"
       SET "held" = "held" + :qty, "updatedAt" = now()
     WHERE "id" = :'ticket_type' AND "status" = 'ACTIVE'
       AND :qty <= "maxPerOrder"
       AND "sold" + "held" + :qty <= "quantity"
    RETURNING "id"
)
INSERT INTO "TicketHold" ("id", "userId", "ticketTypeId", "quantity", "expiresAt")
SELECT 'hold_vip_1', :'user_id', "id", :qty, now() + interval '10 minutes' FROM giu
RETURNING "id" AS hold_id, "quantity", "expiresAt";
COMMIT;


-- ---------------------------------------------------------------------
-- NV2. GIỮ GHẾ KHU NGỒI – chọn ghế A1-05
--   Ghế chỉ đổi AVAILABLE → HELD đúng 1 lần; người bấm sau nhận 0 dòng.
-- ---------------------------------------------------------------------
\set user_id     'usr_c2'
\set ticket_type 'tt_n_A'
\set seat_id     'seat_A1_05'

BEGIN;
WITH ghe AS (
    UPDATE "Seat" SET "status" = 'HELD', "updatedAt" = now()
     WHERE "id" = :'seat_id' AND "status" = 'AVAILABLE'
    RETURNING "id", "areaId"
), hang_ve AS (
    UPDATE "TicketType" t SET "held" = t."held" + 1, "updatedAt" = now()
      FROM ghe
     WHERE t."id" = :'ticket_type' AND t."areaId" = ghe."areaId"
       AND t."status" = 'ACTIVE' AND t."sold" + t."held" + 1 <= t."quantity"
    RETURNING t."id", ghe."id" AS seat_id
)
INSERT INTO "TicketHold" ("id", "userId", "ticketTypeId", "seatId", "quantity", "expiresAt")
SELECT 'hold_seat_1', :'user_id', "id", seat_id, 1, now() + interval '10 minutes' FROM hang_ve
RETURNING "id" AS hold_id, "seatId", "expiresAt";
COMMIT;


-- ---------------------------------------------------------------------
-- NV3. TẠO ĐƠN TỪ VÉ ĐANG GIỮ: phí dịch vụ 2% + mã giảm giá + phiếu thanh toán
--   Lượt dùng mã giảm giá cũng được tăng nguyên tử (không vượt usageLimit).
-- ---------------------------------------------------------------------
\set user_id    'usr_c1'
\set event_id   'evt_sw'
\set order_id   'ord_demo_1'
\set promo_code 'SOUNDPASS10'

BEGIN;
WITH giu AS (               -- vé đang giữ của khách cho sự kiện này
    SELECT h."id", h."ticketTypeId", h."quantity", t."price"
    FROM "TicketHold" h JOIN "TicketType" t ON t."id" = h."ticketTypeId"
    WHERE h."userId" = :'user_id' AND t."eventId" = :'event_id'
      AND h."status" = 'ACTIVE' AND h."orderId" IS NULL AND h."expiresAt" > now()
), tong AS (
    SELECT sum("quantity" * "price") AS subtotal FROM giu
), ma AS (                  -- dùng mã: chỉ thành công nếu còn hạn và còn lượt
    UPDATE "PromoCode" p SET "usedCount" = p."usedCount" + 1
     WHERE p."code" = :'promo_code' AND p."isActive"
       AND (p."eventId" IS NULL OR p."eventId" = :'event_id')
       AND (p."startsAt" IS NULL OR p."startsAt" <= now()) AND (p."endsAt" IS NULL OR p."endsAt" > now())
       AND (p."usageLimit" IS NULL OR p."usedCount" < p."usageLimit")
    RETURNING p."id", p."discountType", p."value"
), tinh AS (
    SELECT tong.subtotal,
           round(tong.subtotal * 0.02) AS fee,
           COALESCE(CASE WHEN ma."discountType" = 'PERCENT' THEN round(tong.subtotal * ma."value" / 100)
                         ELSE LEAST(ma."value", tong.subtotal) END, 0) AS discount,
           ma."id" AS promo_id
    FROM tong LEFT JOIN ma ON true
)
INSERT INTO "Order" ("id", "orderCode", "userId", "eventId", "buyerName", "buyerEmail", "buyerPhone",
                     "subtotal", "serviceFee", "discountAmount", "promoCodeId", "totalAmount")
SELECT :'order_id', 'BK-' || to_char(now(), 'YYMM-HH24MISS'), :'user_id', :'event_id',
       'Nguyễn Minh Anh', 'minhanh.nguyen@example.com', '0901234567',
       subtotal, fee, discount, promo_id, GREATEST(0, subtotal + fee - discount)
FROM tinh;

INSERT INTO "OrderItem" ("id", "orderId", "ticketTypeId", "quantity", "price", "subtotal")
SELECT 'oi_' || h."id", :'order_id', h."ticketTypeId", h."quantity", t."price", h."quantity" * t."price"
FROM "TicketHold" h JOIN "TicketType" t ON t."id" = h."ticketTypeId"
WHERE h."userId" = :'user_id' AND t."eventId" = :'event_id' AND h."status" = 'ACTIVE' AND h."orderId" IS NULL;

UPDATE "TicketHold" h SET "orderId" = :'order_id', "updatedAt" = now()
  FROM "TicketType" t
 WHERE t."id" = h."ticketTypeId" AND h."userId" = :'user_id' AND t."eventId" = :'event_id'
   AND h."status" = 'ACTIVE' AND h."orderId" IS NULL;

INSERT INTO "Payment" ("id", "orderId", "amount", "method")
SELECT 'pay_' || "id", "id", "totalAmount", 'MOMO' FROM "Order" WHERE "id" = :'order_id';
COMMIT;

SELECT "orderCode", "subtotal", "serviceFee", "discountAmount", "totalAmount", "status"
FROM "Order" WHERE "id" = :'order_id';


-- ---------------------------------------------------------------------
-- NV4. CỔNG THANH TOÁN BÁO THÀNH CÔNG (IPN) – IDEMPOTENT
--   Chỉ xử lý khi Payment còn PENDING; callback gửi lại lần 2 → 0 dòng → không
--   xuất thêm vé. Chuyển held → sold, ghế HELD → SOLD, sinh vé QR.
-- ---------------------------------------------------------------------
\set order_id     'ord_demo_1'
\set provider_ref 'MOMO-20261205-0001'

BEGIN;
WITH tt AS (
    UPDATE "Payment" SET "status" = 'SUCCESS', "providerRef" = :'provider_ref', "paidAt" = now(), "updatedAt" = now()
     WHERE "orderId" = :'order_id' AND "status" = 'PENDING'
    RETURNING "orderId"
), don AS (
    UPDATE "Order" o SET "status" = 'PAID', "paymentStatus" = 'SUCCESS', "updatedAt" = now()
      FROM tt WHERE o."id" = tt."orderId"
    RETURNING o."id", o."userId", o."eventId"
), giu AS (
    UPDATE "TicketHold" h SET "status" = 'CONVERTED', "updatedAt" = now()
      FROM don WHERE h."orderId" = don."id" AND h."status" = 'ACTIVE'
    RETURNING h."id", h."orderId", h."ticketTypeId", h."seatId", h."quantity"
), kho AS (
    UPDATE "TicketType" t SET "held" = t."held" - x.q, "sold" = t."sold" + x.q, "updatedAt" = now()
      FROM (SELECT "ticketTypeId", sum("quantity") AS q FROM giu GROUP BY 1) x
     WHERE t."id" = x."ticketTypeId"
    RETURNING t."id"
), ghe AS (
    UPDATE "Seat" s SET "status" = 'SOLD', "updatedAt" = now()
      FROM giu WHERE s."id" = giu."seatId"
    RETURNING s."id"
)
INSERT INTO "Ticket" ("id", "ticketCode", "orderId", "userId", "eventId", "ticketTypeId", "seatId")
SELECT 'tk_' || giu."id" || '_' || n,
       'SP-' || upper(substr(md5(giu."id" || '-' || n), 1, 10)),        -- backend: mã ngẫu nhiên + chữ ký HMAC
       giu."orderId", don."userId", don."eventId", giu."ticketTypeId", giu."seatId"
FROM giu JOIN don ON don."id" = giu."orderId"
CROSS JOIN LATERAL generate_series(1, giu."quantity") AS n
RETURNING "ticketCode", "ticketTypeId", "seatId";
COMMIT;


-- ---------------------------------------------------------------------
-- NV5. JOB MỖI PHÚT: TRẢ LẠI VÉ GIỮ ĐÃ HẾT HẠN
--   Lượt giữ đã gắn với đơn đang chờ thanh toán được ân hạn thêm 5 phút,
--   để callback đến trễ vẫn xuất vé được.
-- ---------------------------------------------------------------------
BEGIN;
WITH het_han AS (
    UPDATE "TicketHold" h SET "status" = 'EXPIRED', "updatedAt" = now()
     WHERE h."status" = 'ACTIVE'
       AND h."expiresAt" < now() - CASE WHEN h."orderId" IS NULL THEN interval '0' ELSE interval '5 minutes' END
    RETURNING h."ticketTypeId", h."seatId", h."quantity"
), tra_kho AS (
    UPDATE "TicketType" t SET "held" = t."held" - x.q, "updatedAt" = now()
      FROM (SELECT "ticketTypeId", sum("quantity") AS q FROM het_han GROUP BY 1) x
     WHERE t."id" = x."ticketTypeId"
    RETURNING t."id"
)
UPDATE "Seat" s SET "status" = 'AVAILABLE', "updatedAt" = now()
  FROM het_han WHERE s."id" = het_han."seatId" AND s."status" = 'HELD';
COMMIT;


-- ---------------------------------------------------------------------
-- NV6. SOÁT VÉ TẠI CỔNG
--   Bước 1: vé VALID đúng sự kiện → USED + CheckIn SUCCESS (nguyên tử).
--   Bước 2 (chỉ khi bước 1 trả 0 dòng): ghi lý do từ chối.
-- ---------------------------------------------------------------------
\set event_id 'evt_sw'
\set staff_id 'usr_staff'
SELECT "ticketCode" AS code FROM "Ticket" WHERE "orderId" = 'ord_demo_1' ORDER BY "id" LIMIT 1 \gset

WITH ve AS (
    UPDATE "Ticket" SET "status" = 'USED'
     WHERE "ticketCode" = :'code' AND "eventId" = :'event_id' AND "status" = 'VALID'
    RETURNING "id"
)
INSERT INTO "CheckIn" ("id", "ticketId", "eventId", "staffId", "scannedCode", "result", "gate")
SELECT gen_random_uuid()::text, ve."id", :'event_id', :'staff_id', :'code', 'SUCCESS', 'Cổng 1' FROM ve
RETURNING "result";

-- Bước 2 (minh hoạ: quét lại đúng vé đó)
INSERT INTO "CheckIn" ("id", "ticketId", "eventId", "staffId", "scannedCode", "result", "gate")
SELECT gen_random_uuid()::text, t."id", :'event_id', :'staff_id', :'code',
       (CASE WHEN t."id" IS NULL             THEN 'INVALID'
             WHEN t."eventId" <> :'event_id' THEN 'WRONG_EVENT'
             WHEN t."status" = 'USED'        THEN 'ALREADY_USED'
             ELSE 'CANCELLED' END)::"CheckInResult",
       'Cổng 1'
FROM (SELECT :'code'::text AS c) q LEFT JOIN "Ticket" t ON t."ticketCode" = q.c
RETURNING "result";


-- ---------------------------------------------------------------------
-- NV7. HUỶ VÉ (trước 48 giờ, phí 20%) – UI: MyTicketsPage
-- ---------------------------------------------------------------------
--   Điều kiện: đơn đã thanh toán, còn > 48 giờ đến giờ diễn, chưa vé nào vào cổng.
--   Hoàn 80% tổng tiền; trả vé về kho; ghế trở lại AVAILABLE.
--   Chạy với ord_demo_1 sẽ trả 0 dòng vì vé đã được soát ở NV6 → đúng quy tắc.
\set order_id 'ord_demo_1'

BEGIN;
WITH don AS (
    UPDATE "Order" o SET "status" = 'CANCELLED', "paymentStatus" = 'REFUNDED',
                         "cancelledAt" = now(), "updatedAt" = now()
      FROM "Event" e
     WHERE o."id" = :'order_id' AND e."id" = o."eventId"
       AND o."status" = 'PAID'
       AND e."startDate" > now() + interval '48 hours'
       AND NOT EXISTS (SELECT 1 FROM "Ticket" t WHERE t."orderId" = o."id" AND t."status" = 'USED')
    RETURNING o."id", o."totalAmount"
), hoan AS (
    UPDATE "Payment" p SET "status" = 'REFUNDED', "refundAmount" = round(don."totalAmount" * 0.8),
                           "refundedAt" = now(), "updatedAt" = now()
      FROM don WHERE p."orderId" = don."id"
    RETURNING p."refundAmount"
), ve AS (
    UPDATE "Ticket" t SET "status" = 'CANCELLED'
      FROM don WHERE t."orderId" = don."id" AND t."status" = 'VALID'
    RETURNING t."ticketTypeId", t."seatId"
), kho AS (
    UPDATE "TicketType" tt SET "sold" = tt."sold" - x.q, "updatedAt" = now()
      FROM (SELECT "ticketTypeId", count(*) AS q FROM ve GROUP BY 1) x
     WHERE tt."id" = x."ticketTypeId"
    RETURNING tt."id"
), ghe AS (
    UPDATE "Seat" s SET "status" = 'AVAILABLE', "updatedAt" = now()
      FROM ve WHERE s."id" = ve."seatId"
    RETURNING s."id"
)
SELECT (SELECT count(*) FROM don) AS don_da_huy, (SELECT "refundAmount" FROM hoan) AS so_tien_hoan;
COMMIT;


-- ---------------------------------------------------------------------
-- NV8. BÁO CÁO BÁN VÉ THEO KHU VỰC (Ban tổ chức chỉ thấy sự kiện của mình)
-- ---------------------------------------------------------------------
\set organizer_id 'org_sw'
SELECT e."title"                                   AS su_kien,
       a."code"                                    AS khu,
       tt."quantity"                               AS tong_ve,
       tt."sold"                                   AS da_ban,
       tt."held"                                   AS dang_giu,
       tt."quantity" - tt."sold" - tt."held"       AS con_lai,
       round(100.0 * tt."sold" / tt."quantity", 1) AS ty_le_ban_pct,
       tt."sold" * tt."price"                      AS doanh_thu_vnd,
       count(c."id")                               AS da_vao_cong
FROM "TicketType" tt
JOIN "Area"  a ON a."id" = tt."areaId"
JOIN "Event" e ON e."id" = tt."eventId"
LEFT JOIN "Ticket"  t ON t."ticketTypeId" = tt."id"
LEFT JOIN "CheckIn" c ON c."ticketId" = t."id" AND c."result" = 'SUCCESS'
WHERE e."organizerId" = :'organizer_id'
GROUP BY e."title", a."code", a."sortOrder", tt."quantity", tt."sold", tt."held", tt."price"
ORDER BY e."title", a."sortOrder";


-- ---------------------------------------------------------------------
-- NV9. TOOL CHO CHATBOT – tìm sự kiện theo tên nghệ sĩ, còn bao nhiêu vé
--   ("Có sự kiện của Suboi không?") – chỉ đọc, chỉ sự kiện PUBLISHED.
-- ---------------------------------------------------------------------
\set artist 'Suboi'
SELECT e."title", e."startDate", r."name" AS thanh_pho, a."name" AS khu_vuc, tt."price",
       tt."quantity" - tt."sold" - tt."held" AS con_lai
FROM "Event" e
JOIN "Region" r      ON r."id" = e."regionId"
JOIN "TicketType" tt ON tt."eventId" = e."id" AND tt."status" = 'ACTIVE'
JOIN "Area" a        ON a."id" = tt."areaId"
WHERE e."status" = 'PUBLISHED'
  AND EXISTS (SELECT 1 FROM unnest(e."artists") x WHERE x ILIKE '%' || :'artist' || '%')
ORDER BY e."startDate", a."sortOrder";
