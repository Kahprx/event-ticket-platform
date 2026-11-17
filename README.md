# Event Platform

Nền tảng bán vé sự kiện theo khu vực, xây dựng bằng React/Vite và Express/Prisma/PostgreSQL. Mã nguồn dùng JavaScript, không dùng TypeScript.

## Yêu cầu

- Node.js 20.19+ hoặc 22.12+
- npm 10+
- Docker Desktop (để chạy PostgreSQL bằng Compose) hoặc PostgreSQL 14+

## Khởi chạy lần đầu

1. Tạo file môi trường cho backend:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   ```

   Tạo `JWT_SECRET` ngẫu nhiên dài ít nhất 32 ký tự trước khi dùng ngoài máy cá nhân. Không commit file `.env`.

2. Bật PostgreSQL cục bộ (nếu dùng Docker):

   ```powershell
   docker compose up -d postgres
   ```

   Nếu đã có PostgreSQL, cập nhật `DATABASE_URL` trong `backend/.env`.

3. Cài dependencies và tạo Prisma Client:

   ```powershell
   npm install
   npm run db:generate
   ```

4. Tạo database schema và chạy ứng dụng:

   ```powershell
   npm run db:migrate -- --name phase1_init
   npm run dev
   ```

Frontend: http://localhost:5173  
Backend health: http://localhost:5000/api/health

## API Phase 1

- `POST /api/auth/register` — `{ "name": "...", "email": "...", "password": "..." }`
- `POST /api/auth/login` — `{ "email": "...", "password": "..." }`
- `POST /api/auth/logout` — yêu cầu Bearer token; client xóa token sau khi nhận phản hồi
- `GET /api/auth/me` — yêu cầu Bearer token
- `PUT /api/auth/profile` — yêu cầu Bearer token; cập nhật name, phone hoặc avatar
- `PUT /api/auth/change-password` — yêu cầu Bearer token; cần currentPassword và newPassword

Tài khoản mới luôn có role `USER`; role không thể gửi từ frontend. JWT chỉ được cấp sau khi xác thực thành công. `POST /logout` stateless nên frontend cần xóa token ở client.

Register luôn tạo tài khoản `USER`; không nhận role từ payload. Tạo ADMIN ban đầu bằng Prisma Studio hoặc thao tác quản trị DB trực tiếp; tuyệt đối không mở endpoint đăng ký admin công khai.

## Cấu trúc

- `frontend/` — React, Vite, Tailwind CSS, Router, Axios, TanStack Query, Zustand, Recharts, Lucide
- `backend/` — Express API, Prisma schema/client, auth và role middleware

Các entity lõi cho các phase kế tiếp đã được định nghĩa trong Prisma schema ngay từ đầu để ổn định quan hệ dữ liệu; Phase 1 chỉ cung cấp luồng User/Auth.
