# Event Platform

Nền tảng bán vé sự kiện theo khu vực, xây dựng bằng React/Vite và Express/Prisma/PostgreSQL. Mã nguồn dùng JavaScript, không dùng TypeScript.

> Quy trình làm việc, nhật ký thời gian, danh sách nhiệm vụ, commit và pull request: xem [`PROJECT_LOG.md`](./PROJECT_LOG.md) hoặc bản Word [`QUY_TRINH_DU_AN.docx`](./QUY_TRINH_DU_AN.docx).

## Trạng thái dự án

- 4 PR từ fork `ka31203` (#8 → #9 → #10 → #7) đã merged vào `main`; review chéo bởi `Kahprx`.
- CI GitHub Actions chạy `npm ci` → `prisma generate` → build FE → `node --check` backend: ✅ pass.
- Quản lý task trên Jira project **F5 (fixxo_5)**: https://kaquach62.atlassian.net/jira/software/projects/F5/boards/2/backlog

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

4. Tạo database schema, seed vai trò/tài khoản mẫu và chạy ứng dụng:

   ```powershell
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

   `db:seed` tạo 2 vai trò (`CUSTOMER`, `ADMIN`) và 4 tài khoản demo. Chạy lại lệnh này nếu cần đặt lại dữ liệu mẫu.

Frontend: http://localhost:5173 (hoặc 5174)  
Backend health: http://localhost:5000/api/health

### Tài khoản demo

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Quản trị | `admin@soundpass.vn` | `Admin@123` |
| Khách hàng | `minhanh.nguyen@example.com` | `User@123` |

Backend hỗ trợ nhiều origin qua `CLIENT_URL` (phân cách bằng dấu phẩy), mặc định là `http://localhost:5173,http://localhost:5174`.

## Chạy riêng backend và frontend bằng npm

Mở **2 terminal riêng** từ thư mục gốc dự án. Chạy backend trước, giữ nguyên terminal đó, rồi mới chạy frontend.

### Terminal 1 — Backend (API)

```powershell
cd C:\Users\kaqua\Downloads\web

# Cài dependencies (chạy 1 lần; dùng npm ci nếu có sẵn package-lock.json)
npm install

# Khởi tạo DB (chạy 1 lần, hoặc sau khi đổi schema)
npm run db:generate
npm run db:migrate
npm run db:seed

# Chạy API
npm run dev:backend
```

→ API ở **http://localhost:5000**, kiểm tra: http://localhost:5000/api/health

### Terminal 2 — Frontend (UI)

```powershell
cd C:\Users\kaqua\Downloads\web

# Cài dependencies (chạy 1 lần)
npm install

# Chạy UI
npm run dev:frontend
```

→ UI ở **http://localhost:5173** (tự sang 5174 nếu 5173 bận).

### Chạy từ thư mục con (tuỳ chọn)

Không cần `cd` về gốc, vào thẳng từng workspace:

```powershell
cd backend  ; npm install  ; npm run dev    # API :5000
cd frontend ; npm install  ; npm run dev    # UI  :5173/:5174
```

### Gộp 2 lệnh vào 1 terminal (tuỳ chọn)

```powershell
npm run dev
```

Script này dùng `concurrently` để chạy cả backend lẫn frontend.

### Lưu ý & lỗi thường gặp

- `CLIENT_URL` trong `backend/.env` phải chứa đúng port frontend (`5173,5174`), nếu không trình duyệt sẽ báo CORS.
- Frontend mặc định gọi `http://localhost:5000/api`. Nếu đổi port backend, tạo `frontend/.env` với `VITE_API_URL=http://localhost:<port>/api`.
- PowerShell báo `npm.ps1 cannot be loaded`: chạy `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` rồi thử lại, hoặc dùng `npm.cmd`.
- `npm install` lỗi mạng: `npm config set registry https://registry.npmjs.org/`, xoá `node_modules` rồi `npm ci`.
- Lỗi build native (bcrypt / Prisma engine): cài Node 20.19+ hoặc 22.12+ và Visual Studio Build Tools (workload C++).
- Chạy frontend mà không có backend: UI vẫn lên với dữ liệu mẫu, nhưng đăng nhập/đăng ký và CRUD quản trị cần API. Chatbot có fallback local; có backend thì dùng luồng RAG bên dưới.

## Chatbot RAG

Trợ lý Soundpass dùng luồng **retrieval-augmented generation** để trả lời đúng chủ đề thay vì đoán theo từ khóa:

1. **Retrieve** — `backend/src/modules/chatbot/knowledge.js` đọc chung dữ liệu `frontend/src/data/events.js`, nhận diện tên ca sĩ (kể cả `Vũ.`, `Da LAB`, `nhóm MTV`, `Suboi`), thành phố, thể loại, ngân sách và ý định (ở đâu / mấy giờ / lịch diễn / giá vé / có show không).
2. **Generate** — `chatbot.service.js` tạo câu trả lời chỉ từ các sự kiện vừa truy xuất. Câu hỏi gộp như “Suboi có hát ở đâu không? Có lịch diễn ở đâu và mấy giờ diễn?” được trả lời đủ tên sự kiện, ngày, giờ, địa điểm. Câu hỏi “ca sĩ này…” dùng lại nghệ sĩ ở lượt trước qua `history`. Câu ngoài chủ đề bị từ chối, không bịa.
3. **LLM (tuỳ chọn)** — nếu có `GEMINI_API_KEY` trong `backend/.env`, sự kiện truy xuất được đưa vào prompt dưới dạng context và Gemini chỉ được phép trả lời dựa trên context đó. Không có key hoặc Gemini lỗi thì hệ thống tự dùng câu trả lời bám dữ liệu. Không có endpoint public nào cho phép gửi mail hay ghi dữ liệu.

API: `POST /api/chatbot/ask` với body `{ "message": "...", "history": [{ "role": "user"|"assistant", "text": "...", "artist": "..." }] }`. Route có rate limit 60 request/15 phút, không cần đăng nhập.

Ví dụ:

```powershell
Invoke-RestMethod http://localhost:5000/api/chatbot/ask -Method Post -ContentType 'application/json' -Body '{"message":"Suboi có lịch diễn ở đâu và mấy giờ?"}'
```

Test: `npm run test -w @event-platform/backend` (6 ca, gồm ca hỏi gộp ở đâu + mấy giờ và ca “ca sĩ này”).

## API Phase 1

- `POST /api/auth/register` — `{ "name": "...", "email": "...", "password": "..." }`
- `POST /api/auth/login` — `{ "email": "...", "password": "..." }`
- `POST /api/auth/logout` — yêu cầu Bearer token; client xóa token sau khi nhận phản hồi
- `GET /api/auth/me` — yêu cầu Bearer token
- `PUT /api/auth/profile` — yêu cầu Bearer token; cập nhật name, phone hoặc avatar
- `PUT /api/auth/change-password` — yêu cầu Bearer token; cần currentPassword và newPassword

Vai trò được lưu trong bảng `Role` với khoá `CUSTOMER` / `ADMIN`. `POST /register` luôn tạo tài khoản `CUSTOMER`; không nhận role từ payload. JWT chứa khoá vai trò và chỉ được cấp sau khi xác thực thành công. `POST /logout` stateless nên frontend cần xóa token ở client.

## API quản trị (yêu cầu Bearer token của ADMIN)

- `GET /api/admin/accounts` · `POST /api/admin/accounts` · `PUT /api/admin/accounts/:id` · `DELETE /api/admin/accounts/:id`
- `GET /api/admin/customers` · `POST /api/admin/customers` · `PUT /api/admin/customers/:id` · `DELETE /api/admin/customers/:id`
- `GET /api/admin/roles` · `POST /api/admin/roles` · `PUT /api/admin/roles/:key` · `DELETE /api/admin/roles/:key`

Frontend tương ứng tại `/admin/accounts`, `/admin/customers`, `/admin/roles`. Vai trò hệ thống (`isSystem`) và vai trò đang có tài khoản không thể xoá; không thể xoá chính tài khoản đang đăng nhập hoặc quản trị viên cuối cùng.

Server chạy offline: frontend tự chuyển sang dữ liệu mẫu để xem giao diện, nhưng đăng nhập/đăng ký và các thao tác quản trị vẫn yêu cầu backend.

## CI

`.github/workflows/ci.yml` chạy trên push vào `main` và trên mọi pull request:

1. `npm ci` (cài toàn bộ workspace từ `package-lock.json`)
2. `npm run db:generate` (Prisma Client)
3. `npm run build -w @event-platform/frontend`
4. `node --check` cho mọi file trong `backend/src`
5. `npm run test -w @event-platform/backend` (test chatbot RAG)

Không cần DATABASE_URL thật để chạy CI vì workflow chỉ generate client, không migrate hay seed.

## Cấu trúc

- `frontend/` — React, Vite, Tailwind CSS, Router, Axios, TanStack Query, Zustand, Recharts, Lucide
- `backend/` — Express API, Prisma schema/client, auth và role middleware

Các entity lõi cho các phase kế tiếp đã được định nghĩa trong Prisma schema ngay từ đầu để ổn định quan hệ dữ liệu; Phase 1 chỉ cung cấp luồng User/Auth.
