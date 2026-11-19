# Thiết kế cơ sở dữ liệu – Soundpass (QL35-W)

Thiết kế CSDL PostgreSQL gồm 21 bảng: 14 bảng đang có trong `backend/prisma/schema.prisma` và 7 bảng mới
(Organizer, Area, Seat, PromoCode, TicketHold, CheckIn, KnowledgeDocument). Thiết kế đã được đối chiếu với
dữ liệu mẫu và các trang đang dùng ở frontend (giá vé, phí 2%, mã giảm giá, giữ chỗ 10 phút, sơ đồ ghế,
huỷ vé trước 48 giờ, cài đặt thông báo, log chatbot).

| File | Nội dung |
| --- | --- |
| `erd/ERD_0_tong_quan.png` | ERD tổng quan 21 bảng (khoá chính, khoá ngoại, quan hệ) |
| `erd/ERD_1..4_*.png` | ERD chi tiết từng phân hệ, đủ cột và kiểu dữ liệu |
| `erd/*.svg` | Bản vector của các ERD (phóng to không vỡ nét) |
| `schema.sql` | Script tạo bảng, ràng buộc, chỉ mục và dữ liệu mẫu |
| `queries.sql` | 9 truy vấn nghiệp vụ: giữ vé, giữ ghế, tạo đơn, thanh toán, trả vé hết hạn, soát vé, huỷ vé, báo cáo, tool chatbot |
| `test_schema.sh` | 17 kiểm thử: đồng thời, ràng buộc CSDL, trả vé hết hạn, huỷ vé |

## Chạy thử

```bash
createdb soundpass
psql -d soundpass -f docs/database/schema.sql
psql -d soundpass -f docs/database/queries.sql
```

`test_schema.sh` kết nối tới PostgreSQL ở `-h /tmp/pgtest -p 5433`; sửa biến `P` ở đầu file cho đúng máy của bạn.

## Ghi chú

- Tên bảng/cột giữ đúng quy ước Prisma (PascalCase, camelCase) để khớp CSDL thật.
- Bước tiếp theo: cập nhật `schema.prisma` + migration theo thiết kế này (cột `Event.organizer` dạng chữ
  đổi thành khoá ngoại `organizerId`).
