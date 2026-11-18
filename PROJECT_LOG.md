# Nhật ký dự án — Soundpass Event Ticket Platform

Ghi lại tiến độ theo thời gian để cả nhóm dễ theo dõi. Các mốc có commit được lấy từ `git log`.

## Tiến độ

| Time (17/11/2026) | Việc đã làm | Trạng thái / Commit |
| --- | --- | --- |
| **16:36** | Khởi tạo nền tảng Phase 1: cấu trúc monorepo, Prisma schema, Express auth skeleton, React/Vite base | `b2f8dd3` ✅ |
| **18:46** | Dựng toàn bộ UI Soundpass: Home → location → events → detail → seat → checkout → payment → confirmation → My Tickets, Profile, Chatbot, Admin, Login, 404 + mock data | `ce3540f` ✅ |
| **19:01** | Phân quyền khu vực `ADMIN`, chặn route `/admin`, đăng nhập theo role, dynamic greeting, sign-out clear token | `28e62cf` ✅ |
| **~19:05–19:12** | Đổi role `USER` → `CUSTOMER`; tạo bảng `Role` trong Postgres; migration bảo toàn dữ liệu; seed 2 role + 4 tài khoản | gộp trong `fac11ce` ✅ |
| **~19:12–19:20** | Auth thật: bcrypt + JWT, API login/register/me/profile; CORS multi-origin; admin API CRUD accounts/roles/customers | `fac11ce` ✅ |
| **~19:20–19:40** | UI CRUD: `/admin/accounts`, `/admin/roles`, `/admin/customers`; sửa lỗi runtime + role dropdown; test browser đầy đủ (tạo/sửa/khoá/xoá) | `fac11ce` ✅ |
| **19:44** | Push commit auth + CRUD lên `upstream/soundpass-ui` | ✅ |
| **~19:45–19:55** | Tắt sạch dev server (BE :5000, FE :5174/5175/5176), giữ Postgres | ✅ |
| **19:57** | Thêm hướng dẫn chạy npm riêng BE/FE vào README; bỏ nút demo quick-login + danh sách tài khoản, thay bằng nút "Vào trang chủ"; bỏ fallback demo trong code | `1a2ac6d` ✅ |

## 18/11/2026

| Time | Việc đã làm | Trạng thái / Commit |
| --- | --- | --- |
| ~09:00 | Sửa lỗi còn sót trong `LoginPage.jsx`: đoạn JSX nút demo quick-login vẫn giữ lại dù import/hàm đã xoá (gây lỗi runtime). Thay bằng liên kết "Vào trang chủ", bỏ hoàn toàn fallback demo | `5c3ad7a` ✅ |
| ~09:30 | Xoá toàn bộ file UI cũ trong `C:\Users\kaqua\Downloads\web`, rồi dời toàn bộ repo Soundpass từ `QuanLyNhanVien\event-ticket-platform` về đúng thư mục `C:\Users\kaqua\Downloads\web` theo yêu cầu | commit tiếp theo ✅ |

> Lưu ý: repo hiện nằm tại `C:\Users\kaqua\Downloads\web`. UI mới chạy ở `http://localhost:5173` (bản cũ đã bị xoá nên port 5173 đã trống).

## Trạng thái hiện tại

- Remote `upstream/soundpass-ui` = `5c3ad7ab1b13ff9a02dba810b5095b567c69cf9b`.

- Đường dẫn source hiện tại: `C:\Users\kaqua\Downloads\web\frontend\src` và `C:\Users\kaqua\Downloads\web\backend\src`.
- Working tree sạch, không còn file chưa commit.
- Build frontend pass; không còn import thừa. Còn chunk-size warning (không blocking).
- Dev server đã tắt; PostgreSQL vẫn chạy ở `localhost:5432` để lần sau khởi động backend ngay.

## Việc có thể làm tiếp

1. Code-split để hết chunk-size warning.
2. Thêm Dockerfile + compose cả app (hiện `docker-compose.yml` mới chỉ có Postgres).
3. Bổ sung test tự động cho auth và admin CRUD.

## Chạy lại dự án

Xem mục **"Chạy riêng backend và frontend bằng npm"** trong `README.md`.

Tài khoản để đăng nhập (đã seed trong DB):

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| ADMIN | `admin@soundpass.vn` | `Admin@123` |
| CUSTOMER | `minhanh.nguyen@example.com` | `User@123` |
