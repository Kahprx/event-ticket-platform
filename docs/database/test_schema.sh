#!/usr/bin/env bash
# Kiểm thử ràng buộc & đồng thời cho schema.sql (chạy sau queries.sql)
P="psql -h /tmp/pgtest -p 5433 -U postgres -d soundpass -qtA"
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then echo "  ĐẠT  $1 (=$2)"; pass=$((pass+1)); else echo "  LỖI  $1: được $2, kỳ vọng $3"; fail=$((fail+1)); fi; }

echo "T1. 40 người cùng giữ 1 vé GA khi chỉ còn 10 vé"
$P -c "UPDATE \"TicketType\" SET sold = quantity - 10, held = 0 WHERE id='tt_s_GA';"
( for i in $(seq 1 40); do
  $P -c "WITH g AS (UPDATE \"TicketType\" SET held=held+1 WHERE id='tt_s_GA' AND sold+held+1<=quantity RETURNING id)
         INSERT INTO \"TicketHold\"(id,\"userId\",\"ticketTypeId\",quantity,\"expiresAt\")
         SELECT 'race_$i','usr_c2',id,1,now()+interval '10 min' FROM g RETURNING 'OK';" > /tmp/pgtest/t1_$i.out 2>&1 &
  done; wait )
check "số lượt giữ thành công" "$(cat /tmp/pgtest/t1_*.out | grep -c OK)" 10
check "sold+held không vượt quantity" "$($P -c "select (sold+held<=quantity)::text from \"TicketType\" where id='tt_s_GA'")" true

echo "T2. 25 người cùng giữ ghế B2-07"
( for i in $(seq 1 25); do
  $P -c "WITH s AS (UPDATE \"Seat\" SET status='HELD' WHERE id='seat_B2_07' AND status='AVAILABLE' RETURNING id),
              t AS (UPDATE \"TicketType\" SET held=held+1 WHERE id='tt_n_B' AND sold+held+1<=quantity AND EXISTS(SELECT 1 FROM s) RETURNING id)
         INSERT INTO \"TicketHold\"(id,\"userId\",\"ticketTypeId\",\"seatId\",quantity,\"expiresAt\")
         SELECT 'seat_$i','usr_c1',t.id,s.id,1,now()+interval '10 min' FROM t, s RETURNING 'OK';" > /tmp/pgtest/t2_$i.out 2>&1 &
  done; wait )
check "số người giữ được ghế" "$(cat /tmp/pgtest/t2_*.out | grep -c OK)" 1
check "held của Khu B" "$($P -c "select held from \"TicketType\" where id='tt_n_B'")" 1

echo "T3. 30 người cùng dùng mã giảm giá chỉ còn 5 lượt"
$P -c "UPDATE \"PromoCode\" SET \"usageLimit\"=5, \"usedCount\"=0 WHERE code='SINHVIEN';"
( for i in $(seq 1 30); do
  $P -c "UPDATE \"PromoCode\" SET \"usedCount\"=\"usedCount\"+1 WHERE code='SINHVIEN' AND (\"usageLimit\" IS NULL OR \"usedCount\"<\"usageLimit\") RETURNING 'OK';" > /tmp/pgtest/t3_$i.out 2>&1 &
  done; wait )
check "số lượt dùng mã thành công" "$(cat /tmp/pgtest/t3_*.out | grep -c OK)" 5

echo "T4. Ràng buộc ở tầng CSDL (kể cả khi code backend sai)"
check "CHECK chặn bán vượt" "$($P -c "UPDATE \"TicketType\" SET sold=quantity+1 WHERE id='tt_n_C';" 2>&1 | grep -c TicketType_stock_check)" 1
check "UNIQUE chặn 2 vé hợp lệ cho 1 ghế" "$($P -c "INSERT INTO \"Ticket\"(id,\"ticketCode\",\"orderId\",\"userId\",\"eventId\",\"ticketTypeId\",\"seatId\") VALUES ('x1','X1','ord_demo_1','usr_c1','evt_night','tt_n_A','seat_A2_01'),('x2','X2','ord_demo_1','usr_c1','evt_night','tt_n_A','seat_A2_01');" 2>&1 | grep -c Ticket_seatId_active_key)" 1
check "CHECK tổng tiền đơn = tạm tính + phí − giảm" "$($P -c "UPDATE \"Order\" SET \"totalAmount\"=1 WHERE id='ord_demo_1';" 2>&1 | grep -c Order_amount_check)" 1
check "UNIQUE chặn 2 lượt soát thành công cho 1 vé" "$($P -c "INSERT INTO \"CheckIn\"(id,\"ticketId\",\"eventId\",\"staffId\",\"scannedCode\",result) SELECT 'dup',\"ticketId\",\"eventId\",\"staffId\",\"scannedCode\",'SUCCESS' FROM \"CheckIn\" WHERE result='SUCCESS' LIMIT 1;" 2>&1 | grep -c CheckIn_ticketId_success_key)" 1

echo "T5. Job trả vé giữ hết hạn"
$P -c "UPDATE \"TicketHold\" SET \"expiresAt\"=now()-interval '1 min' WHERE status='ACTIVE';"
sed -n '/^-- NV5/,/^-- NV6/p' /home/claude/erd-work/queries.sql | $P > /dev/null
check "held GA về 0" "$($P -c "select held from \"TicketType\" where id='tt_s_GA'")" 0
check "held Khu B về 0" "$($P -c "select held from \"TicketType\" where id='tt_n_B'")" 0
check "ghế B2-07 trống lại" "$($P -c "select status from \"Seat\" where id='seat_B2_07'")" AVAILABLE
check "ghế A1-05 trống lại" "$($P -c "select status from \"Seat\" where id='seat_A1_05'")" AVAILABLE

echo "T6. Huỷ đơn hợp lệ (đơn ghế ngồi đã thanh toán, chưa soát vé)"
$P -c "UPDATE \"TicketType\" SET sold=sold+2 WHERE id='tt_n_A';
       UPDATE \"Seat\" SET status='SOLD' WHERE id IN ('seat_A3_01','seat_A3_02');
       INSERT INTO \"Order\"(id,\"orderCode\",\"userId\",\"eventId\",\"buyerName\",\"buyerEmail\",\"buyerPhone\",subtotal,\"serviceFee\",\"totalAmount\",status,\"paymentStatus\")
         VALUES ('ord_c','BK-TEST-C','usr_c2','evt_night','Trần Quốc Bảo','quocbao.tran@example.com','0903456789',1798000,35960,1833960,'PAID','SUCCESS');
       INSERT INTO \"Payment\"(id,\"orderId\",amount,method,status,\"paidAt\") VALUES ('pay_c','ord_c',1833960,'VNPAY','SUCCESS',now());
       INSERT INTO \"Ticket\"(id,\"ticketCode\",\"orderId\",\"userId\",\"eventId\",\"ticketTypeId\",\"seatId\") VALUES
         ('tc1','SP-C1','ord_c','usr_c2','evt_night','tt_n_A','seat_A3_01'),('tc2','SP-C2','ord_c','usr_c2','evt_night','tt_n_A','seat_A3_02');"
sed -n '/^-- NV7/,/^-- NV8/p' /home/claude/erd-work/queries.sql | sed "s/'ord_demo_1'/'ord_c'/" | $P > /tmp/pgtest/t6.out 2>&1
check "đơn bị huỷ, hoàn 80%" "$(grep -E '^[0-9]' /tmp/pgtest/t6.out | head -1)" "1|1467168.00"
check "vé đã huỷ" "$($P -c "select count(*) from \"Ticket\" where \"orderId\"='ord_c' and status='CANCELLED'")" 2
check "ghế A3-01 trống lại" "$($P -c "select status from \"Seat\" where id='seat_A3_01'")" AVAILABLE
check "sold Khu A trả về 0" "$($P -c "select sold from \"TicketType\" where id='tt_n_A'")" 0

echo "-----"; echo "Tổng: $pass đạt, $fail lỗi"
