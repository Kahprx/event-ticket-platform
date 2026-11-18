# QUY TRÌNH & NHẬT KÝ DỰ ÁN — Soundpass Event Ticket Platform

Đây là tài liệu ghi chép duy nhất cho **quy trình làm việc, toàn bộ nhiệm vụ, thời gian, commit và pull request**. Mỗi khi có thay đổi thì cập nhật vào đây trước khi commit.

---

## 1. Quy trình làm việc (Workflow)

| Bước | Việc cần làm | Áp dụng trong dự án |
| --- | --- | --- |
| 1 | Nhận yêu cầu / chia nhiệm vụ | UI đặt vé, phân quyền `CUSTOMER`/`ADMIN`, CRUD admin, tài liệu, dọn bản cũ |
| 2 | Tạo branch làm việc | `soundpass-ui` tách từ `main` |
| 3 | Implement theo module | `frontend/src`, `backend/src`, `backend/prisma` |
| 4 | Kiểm tra trước khi commit | Build FE, kiểm tra import thừa, syntax BE, curl health, test browser CRUD |
| 5 | Commit theo convention | `feat:` / `fix:` / `docs:` kèm mô tả ngắn |
| 6 | Push lên remote | `git push upstream soundpass-ui` |
| 7 | Tạo / cập nhật Pull Request | PR #1 đã merge, PR #2 đang mở |
| 8 | Review → merge → ghi log | Chưa merge PR #2; file này được cập nhật sau mỗi commit |

---

## 2. Danh sách nhiệm vụ (Tasks)

| ID | Nhiệm vụ | Thời gian | Commit | PR | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| T01 | Khởi tạo nền tảng: monorepo, Prisma schema, Express skeleton, React/Vite base | 17/11 16:36 | `b2f8dd3` | #1 | ✅ Đã merge |
| T02 | Dựng toàn bộ UI Soundpass: Home → location → events → filter/search → detail → seat → checkout → payment → confirmation → My Tickets, Profile, Chatbot, Admin, Login, 404 | 17/11 18:46 | `ce3540f` | #2 | ✅ Xong |
| T03 | Phân quyền khu vực `ADMIN`, chặn route `/admin`, greeting theo role, sign-out clear token | 17/11 19:01 | `28e62cf` | #2 | ✅ Xong (sau thay bằng auth thật) |
| T04 | Đổi `USER` → `CUSTOMER`; tạo bảng `Role`; migration bảo toàn dữ liệu; seed 2 role + 4 tài khoản | 17/11 ~19:05–19:12 | `fac11ce` | #2 | ✅ Xong |
| T05 | Auth thật: bcrypt + JWT, API login/register/me/profile; CORS multi-origin; admin CRUD accounts/roles/customers | 17/11 ~19:12–19:20 | `fac11ce` | #2 | ✅ Xong |
| T06 | UI CRUD `/admin/accounts`, `/admin/roles`, `/admin/customers`; sửa lỗi runtime + role dropdown; test browser tạo/sửa/xoá | 17/11 ~19:20–19:40 | `fac11ce` | #2 | ✅ Xong |
| T07 | Thêm hướng dẫn chạy npm riêng BE/FE vào README; bỏ nút demo quick-login + danh sách tài khoản, thay bằng "Vào trang chủ" | 17/11 19:57 | `1a2ac6d` | #2 | ✅ Xong (lần 1, còn sót JSX) |
| T08 | Ghi nhật ký dự án lần đầu vào `PROJECT_LOG.md` | 17/11 19:58 | `03ca592` | #2 | ✅ Xong |
| T09 | Sửa triệt để lỗi còn sót: đoạn JSX nút demo vẫn nằm trong `LoginPage.jsx` gây runtime error; bỏ hoàn toàn fallback demo | 18/11 11:04 | `5c3ad7a` | #2 | ✅ Xong |
| T10 | Xoá toàn bộ file UI cũ trong `C:\Users\kaqua\Downloads\web`, rồi dời repo Soundpass từ `QuanLyNhanVien\event-ticket-platform` về đúng folder `web` | 18/11 11:15 | `ebc3d1a` | #2 | ✅ Xong |
| T11 | Viết lại tài liệu thành QUY TRÌNH đầy đủ: nhiệm vụ + thời gian + commit + PR | 18/11 11:17 | xem commit cuối PR #2 | #2 | ✅ Xong |
| T12 | Thêm GitHub Actions CI (`npm ci` → `prisma generate` → build FE → syntax BE) | — | — | #2 | ⏳ Chưa làm |

---

## 3. Nhật ký thời gian (làm lại theo mốc Git)

### 17/11/2026

| Giờ | Việc đã làm | Commit |
| --- | --- | --- |
| **16:36** | Merge PR #1 — nền tảng Phase 1 | `b2f8dd3` |
| **18:46** | Dựng xong toàn bộ UI Soundpass + mock data | `ce3540f` |
| **19:01** | Khoá khu vực admin theo role `ADMIN` (demo role) | `28e62cf` |
| **~19:05–19:20** | Đổi role sang `CUSTOMER`, tạo bảng `Role`, migration + seed; auth thật bcrypt/JWT; CORS; admin CRUD API | `fac11ce` |
| **~19:20–19:40** | Hoàn thiện UI CRUD admin, sửa lỗi dropdown role, test browser đầy đủ | `fac11ce` |
| **19:44** | Push commit auth + CRUD lên `upstream/soundpass-ui` | `fac11ce` |
| **19:50** | Tạo Pull Request #2 "Soundpass UI" (`soundpass-ui` → `main`) | PR #2 |
| **19:57** | Cập nhật README + thay nút demo bằng "Vào trang chủ" (lần 1) | `1a2ac6d` |
| **19:58** | Commit file nhật ký lần đầu | `03ca592` |

### 18/11/2026

| Giờ | Việc đã làm | Commit |
| --- | --- | --- |
| **~09:00** | Phát hiện người dùng thấy UI cũ: port 5173 là bản clone khác + `LoginPage.jsx` còn sót JSX demo gây crash | — |
| **10:xx** | Tắt server bản cũ, xoá sạch file `Downloads\web`, khởi động lại UI mới ở 5173 | — |
| **11:04** | Sửa triệt để `LoginPage.jsx`: bỏ hoàn toàn demo/fallback, chỉ còn form + "Vào trang chủ"; build FE pass | `5c3ad7a` |
| **~11:10** | Dời toàn bộ repo từ `QuanLyNhanVien\event-ticket-platform` về `C:\Users\kaqua\Downloads\web` theo yêu cầu; restart FE/BE từ path mới | — |
| **11:15** | Cập nhật log và commit thay đổi đường dẫn | `ebc3d1a` |
| **11:17** | Viết lại tài liệu thành quy trình đầy đủ (file này) | xem commit cuối PR #2 |

---

## 4. Pull Request

### PR #1 — `feat: add phase 1 project foundation`

| Trường | Giá trị |
| --- | --- |
| Trạng thái | ✅ **MERGED** |
| Branch | `codex/phase-1-foundation` → `main` |
| Thời gian merge | 17/11/2026 16:36 |
| Commit | `b2f8dd3` |
| Link | https://github.com/Kahprx/event-ticket-platform/pull/1 |

### PR #2 — `Soundpass UI`

| Trường | Giá trị |
| --- | --- |
| Trạng thái | 🟢 **OPEN** (chưa merge) |
| Branch | `soundpass-ui` → `main` |
| Tạo lúc | 17/11/2026 19:50 |
| Cập nhật lần cuối | 18/11/2026 11:15 |
| Author | `Kahprx` |
| Review | Chưa có review |
| CI / status check | Chưa có (repo chưa có `.github/workflows`) |
| Link | https://github.com/Kahprx/event-ticket-platform/pull/2 |

**Commit trong PR #2 (7 commit):**

| Giờ | Commit | Nội dung |
| --- | --- | --- |
| 17/11 18:46 | `ce3540f` | feat(frontend): build complete Soundpass booking UI with mock data and admin |
| 17/11 19:01 | `28e62cf` | feat(auth): gate admin area behind demo role login |
| 17/11 19:44 | `fac11ce` | feat(auth): add customer roles and admin CRUD with real API |
| 17/11 19:57 | `1a2ac6d` | docs: add npm run guide and replace demo login with homepage link |
| 17/11 19:58 | `03ca592` | docs: add project timeline log |
| 18/11 11:04 | `5c3ad7a` | fix(frontend): replace demo login block with homepage link |
| 18/11 11:15 | `ebc3d1a` | docs: move project root to web folder and update log |
| 18/11 11:17 | (commit cuối PR #2) | docs: rewrite project log as full workflow and task record |

---

## 5. Trạng thái hiện tại

- **Root repo:** `C:\Users\kaqua\Downloads\web`
- **Source FE:** `C:\Users\kaqua\Downloads\web\frontend\src` (84 files)
- **Source BE:** `C:\Users\kaqua\Downloads\web\backend\src` (18 files)
- **Branch:** `soundpass-ui`
- **HEAD / remote:** luôn là commit mới nhất của `upstream/soundpass-ui` (`git log -1`)
- **Remote:** `upstream` → `https://github.com/Kahprx/event-ticket-platform.git`
- **Đang chạy:** UI `http://localhost:5173/login`, API `http://localhost:5000/api/health`, PostgreSQL `:5432`
- **Build FE:** pass (còn chunk-size warning >500 kB, không blocking)
- **Tài khoản seed:**

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| ADMIN | `admin@soundpass.vn` | `Admin@123` |
| CUSTOMER | `minhanh.nguyen@example.com` | `User@123` |

---

## 6. Checklist trước khi merge PR #2

- [x] Build frontend thành công
- [x] Kiểm tra import thừa / syntax backend
- [x] Test luồng đặt vé và CRUD admin trên browser
- [x] Xoá UI cũ, thống nhất một đường dẫn source
- [ ] Thêm CI GitHub Actions nếu yêu cầu
- [ ] Review bởi người khác
- [ ] Merge PR #2 vào `main` và đóng PR

---

## 7. Ghi chú đường dẫn

| Thời gian | Đường dẫn | Ghi chú |
| --- | --- | --- |
| đến 18/11 11:10 | `C:\Users\kaqua\Downloads\QuanLyNhanVien\event-ticket-platform` | Đã dời đi, hiện để trống |
| từ 18/11 11:10 | `C:\Users\kaqua\Downloads\web` | **Đường dẫn source hợp lệ hiện tại** |
| cũ (đã xoá) | `C:\Users\kaqua\Downloads\web` (bản clone UI phase 1) | File đã xoá sạch, thay bằng repo mới |

> Mọi thao tác từ nay về sau thực hiện tại `C:\Users\kaqua\Downloads\web`.
