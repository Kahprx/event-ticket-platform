# QUY TRÌNH & NHẬT KÝ DỰ ÁN — Soundpass Event Ticket Platform

Đây là tài liệu ghi chép duy nhất cho **quy trình làm việc, toàn bộ nhiệm vụ, thời gian, commit và pull request**. Mỗi khi có thay đổi thì cập nhật vào đây trước khi commit.

---

## 1. Quy trình làm việc (Workflow)

| Bước | Việc cần làm | Áp dụng trong dự án |
| --- | --- | --- |
| 1 | Nhận yêu cầu / chia nhiệm vụ | UI đặt vé, phân quyền `CUSTOMER`/`ADMIN`, CRUD admin, tài liệu, dọn bản cũ |
| 2 | Tạo branch làm việc | Stacked: `feat/soundpass-ui` ← `feat/auth-admin` ← `docs-cleanup`, tách từ `main` |
| 3 | Implement theo module | `frontend/src`, `backend/src`, `backend/prisma` |
| 4 | Kiểm tra trước khi commit | Build FE, kiểm tra import thừa, syntax BE, curl health, test browser CRUD |
| 5 | Commit theo convention | `feat:` / `fix:` / `docs:` kèm mô tả ngắn |
| 6 | Push lên remote | `git push upstream feat/soundpass-ui feat/auth-admin docs-cleanup` |
| 7 | Tạo / cập nhật Pull Request | PR #1 merged; PR #2 đã đóng (tách PR); PR #3/#4/#5/#6 đang mở. Các phương án fork/nhiều PR xem mục 9 |
| 8 | Review → merge → ghi log | Chưa merge #3/#4/#5; merge lần lượt #3 → #4 → #5 |

---

## 2. Phân chia nghiệp vụ (2 thành viên)

> Chưa có tên thật nên dùng placeholder `Dev 1` / `Dev 2`. Đổi tên ở bảng này và cột “Người làm” là đủ, không ảnh hưởng commit hay PR.

| Thành viên | Vai trò chính | Số nghiệp vụ | Đã xong | Chưa xong | PR phụ trách |
| --- | --- | --- | --- | --- | --- |
| **Dev 1** | Frontend / UI / Chatbot | 7 | 7 | 0 | #3, #6 |
| **Dev 2** | Backend / DB / Hạ tầng / Tài liệu | 6 | 5 | 1 (`T12` CI) | #1 (đã merge), #4, #5 |
| **Tổng** | — | **13** | **12** | **1** | 4 PR đang mở |

### Dev 1 — đã làm gì

- `T02` Dựng toàn bộ UI Soundpass: Home → location → events → detail → seat → checkout → payment → confirmation → My Tickets, Profile, Chatbot, Admin, Login, 404.
- `T03` Chặn route `/admin` theo role (sau được thay bằng auth thật ở `T05`).
- `T06` UI CRUD accounts/roles/customers; sửa lỗi runtime và dropdown role; test browser.
- `T07` Hướng dẫn chạy npm riêng BE/FE; bỏ nút demo, thay bằng “Vào trang chủ”.
- `T09` Sửa triệt để JSX demo còn sót trong `LoginPage.jsx`, bỏ fallback demo.
- `T11` Viết lại `PROJECT_LOG.md` thành quy trình + timeline + PR.
- `T13` Sửa AI chatbot: hiểu tên nghệ sĩ, gợi ý và thẻ kết quả đều hiện tên nghệ sĩ.

### Dev 2 — đã làm gì

- `T01` Nền tảng Phase 1: monorepo, Prisma schema, Express skeleton, React/Vite base (PR #1 đã merge).
- `T04` Đổi `USER` → `CUSTOMER`; tạo bảng `Role`; migration + seed 2 role / 4 tài khoản.
- `T05` Auth thật bcrypt/JWT, API login/register/me/profile, CORS multi-origin, API CRUD admin.
- `T08` Ghi nhật ký dự án lần đầu vào `PROJECT_LOG.md`.
- `T10` Xoá UI cũ, dời toàn bộ repo về `C:\Users\kaqua\Downloads\web`.
- `T12` ⏳ Chưa làm: GitHub Actions CI (`npm ci` → `prisma generate` → build FE → syntax BE).

### Quy ước

- Mỗi nghiệp vụ có **đúng 1 người chịu trách nhiệm chính** — xem cột “Người làm” trong bảng task bên dưới.
- PR stacked: **Dev 1** giữ #3/#6, **Dev 2** giữ #4/#5. Merge theo thứ tự **#3 → #4 → #5 → #6**.
- Đổi tên thành viên chỉ cần sửa bảng này + cột “Người làm”; commit/PR giữ nguyên.

---

## 3. Danh sách nhiệm vụ (Tasks)

| ID | Người làm | Nhiệm vụ | Thời gian | Commit | PR | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- |
| T01 | Dev 2 | Khởi tạo nền tảng: monorepo, Prisma schema, Express skeleton, React/Vite base | 17/11 16:36 | `b2f8dd3` | #1 | ✅ Đã merge |
| T02 | Dev 1 | Dựng toàn bộ UI Soundpass: Home → location → events → filter/search → detail → seat → checkout → payment → confirmation → My Tickets, Profile, Chatbot, Admin, Login, 404 | 17/11 18:46 | `ce3540f` | #3 | ✅ Xong |
| T03 | Dev 1 | Phân quyền khu vực `ADMIN`, chặn route `/admin`, greeting theo role, sign-out clear token | 17/11 19:01 | `28e62cf` | #4 | ✅ Xong (sau thay bằng auth thật) |
| T04 | Dev 2 | Đổi `USER` → `CUSTOMER`; tạo bảng `Role`; migration bảo toàn dữ liệu; seed 2 role + 4 tài khoản | 17/11 ~19:05–19:12 | `fac11ce` | #4 | ✅ Xong |
| T05 | Dev 2 | Auth thật: bcrypt + JWT, API login/register/me/profile; CORS multi-origin; admin CRUD accounts/roles/customers | 17/11 ~19:12–19:20 | `fac11ce` | #4 | ✅ Xong |
| T06 | Dev 1 | UI CRUD `/admin/accounts`, `/admin/roles`, `/admin/customers`; sửa lỗi runtime + role dropdown; test browser tạo/sửa/xoá | 17/11 ~19:20–19:40 | `fac11ce` | #4 | ✅ Xong |
| T07 | Dev 1 | Thêm hướng dẫn chạy npm riêng BE/FE vào README; bỏ nút demo quick-login + danh sách tài khoản, thay bằng "Vào trang chủ" | 17/11 19:57 | `1a2ac6d` | #5 | ✅ Xong (lần 1, còn sót JSX) |
| T08 | Dev 2 | Ghi nhật ký dự án lần đầu vào `PROJECT_LOG.md` | 17/11 19:58 | `03ca592` | #5 | ✅ Xong |
| T09 | Dev 1 | Sửa triệt để lỗi còn sót: đoạn JSX nút demo vẫn nằm trong `LoginPage.jsx` gây runtime error; bỏ hoàn toàn fallback demo | 18/11 11:04 | `5c3ad7a` | #5 | ✅ Xong |
| T10 | Dev 2 | Xoá toàn bộ file UI cũ trong `C:\Users\kaqua\Downloads\web`, rồi dời repo Soundpass từ `QuanLyNhanVien\event-ticket-platform` về đúng folder `web` | 18/11 11:15 | `ebc3d1a` | #5 | ✅ Xong |
| T11 | Dev 1 | Viết lại tài liệu thành QUY TRÌNH đầy đủ: nhiệm vụ + thời gian + commit + PR | 18/11 11:17 | xem commit cuối PR #5 | #5 | ✅ Xong |
| T12 | Dev 2 | Thêm GitHub Actions CI (`npm ci` → `prisma generate` → build FE → syntax BE) | — | — | #5 | ⏳ Chưa làm |
| T13 | Dev 1 | Sửa AI chatbot: hiểu tên nghệ sĩ, câu hỏi gợi ý có nghệ sĩ, hiển thị nghệ sĩ trong câu trả lời và thẻ gợi ý | 18/11 11:32 | xem commit cuối PR #6 | #6 | ✅ Xong |

---

## 4. Nhật ký thời gian (làm lại theo mốc Git)

### 17/11/2026

| Giờ | Việc đã làm | Commit |
| --- | --- | --- |
| **16:36** | Merge PR #1 — nền tảng Phase 1 | `b2f8dd3` |
| **18:46** | Dựng xong toàn bộ UI Soundpass + mock data | `ce3540f` |
| **19:01** | Khoá khu vực admin theo role `ADMIN` (demo role) | `28e62cf` |
| **~19:05–19:20** | Đổi role sang `CUSTOMER`, tạo bảng `Role`, migration + seed; auth thật bcrypt/JWT; CORS; admin CRUD API | `fac11ce` |
| **~19:20–19:40** | Hoàn thiện UI CRUD admin, sửa lỗi dropdown role, test browser đầy đủ | `fac11ce` |
| **19:44** | Push commit auth + CRUD lên `upstream/soundpass-ui` | `fac11ce` |
| **19:50** | Tạo Pull Request #2 "Soundpass UI" (`soundpass-ui` → `main`), sau này đóng để tách thành #3/#4/#5 | PR #2 |
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
| **11:17** | Viết lại tài liệu thành quy trình đầy đủ (file này) | xem commit cuối PR #5 |

---

## 5. Pull Request

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
| Trạng thái | 🔴 **CLOSED** (đóng lúc 18/11 11:27, tách thành #3/#4/#5) |
| Branch | `soundpass-ui` → `main` |
| Tạo lúc | 17/11/2026 19:50 |
| Cập nhật lần cuối | 18/11/2026 11:15 |
| Author | `Kahprx` |
| Review | Chưa có review |
| CI / status check | Chưa có (repo chưa có `.github/workflows`) |
| Link | https://github.com/Kahprx/event-ticket-platform/pull/2 |
| Ghi chú | Đã đóng để tránh trùng diff với 3 PR stacked |

**Commit từng nằm trong PR #2 (giờ phân bổ ở #3/#4/#5):**

| Giờ | Commit | Nội dung |
| --- | --- | --- |
| 17/11 18:46 | `ce3540f` | feat(frontend): build complete Soundpass booking UI with mock data and admin |
| 17/11 19:01 | `28e62cf` | feat(auth): gate admin area behind demo role login |
| 17/11 19:44 | `fac11ce` | feat(auth): add customer roles and admin CRUD with real API |
| 17/11 19:57 | `1a2ac6d` | docs: add npm run guide and replace demo login with homepage link |
| 17/11 19:58 | `03ca592` | docs: add project timeline log |
| 18/11 11:04 | `5c3ad7a` | fix(frontend): replace demo login block with homepage link |
| 18/11 11:15 | `ebc3d1a` | docs: move project root to web folder and update log |
| 18/11 11:17 | (xem PR #5) | docs: rewrite project log as full workflow and task record |
| 18/11 11:18 | (xem PR #5) | docs: correct self-references in workflow log |
| **11:27** | Đóng PR #2, tạo 3 branch stacked và mở PR #3/#4/#5 | PR #3/#4/#5 |
| **11:32** | Fix AI chatbot: nhận diện tên nghệ sĩ, hỏi/gợi ý theo nghệ sĩ, hiển thị tên nghệ sĩ trong thẻ gợi ý | PR #6 |

---

### PR #3 — `feat: Soundpass booking UI`

| Trường | Giá trị |
| --- | --- |
| Trạng thái | 🟢 **OPEN** |
| Branch | `feat/soundpass-ui` → `main` |
| Tạo lúc | 18/11/2026 11:27 |
| Nội dung | UI Soundpass + mock data (`ce3540f`) |
| Link | https://github.com/Kahprx/event-ticket-platform/pull/3 |

### PR #4 — `feat: real auth, customer role and admin CRUD`

| Trường | Giá trị |
| --- | --- |
| Trạng thái | 🟢 **OPEN** |
| Branch | `feat/auth-admin` → `feat/soundpass-ui` |
| Tạo lúc | 18/11/2026 11:27 |
| Nội dung | `28e62cf`, `fac11ce` — auth thật, role `CUSTOMER`/`ADMIN`, admin CRUD |
| Link | https://github.com/Kahprx/event-ticket-platform/pull/4 |

### PR #5 — `docs: workflow log, login cleanup and project relocation`

| Trường | Giá trị |
| --- | --- |
| Trạng thái | 🟢 **OPEN** |
| Branch | `docs-cleanup` → `feat/auth-admin` |
| Tạo lúc | 18/11/2026 11:27 |
| Nội dung | Fix login, dọn UI cũ, dời repo về `web`, tài liệu + file Word |
| Link | https://github.com/Kahprx/event-ticket-platform/pull/5 |

### PR #6 — `fix: chatbot understands artist names`

| Trường | Giá trị |
| --- | --- |
| Trạng thái | 🟢 **OPEN** |
| Branch | `fix/chatbot-artist` → `docs-cleanup` |
| Tạo lúc | 18/11/2026 11:32 |
| Nội dung | Nhận diện tên nghệ sĩ từ dữ liệu sự kiện; hỏi/gợi ý theo nghệ sĩ; câu trả lời và thẻ gợi ý đều hiện tên nghệ sĩ |
| Link | https://github.com/Kahprx/event-ticket-platform/pull/6 |

> Thứ tự merge: **PR #3 → PR #4 → PR #5 → PR #6**. Mỗi PR chỉ chứa phần của mình vì branch sau dùng branch trước làm base.

---

## 6. Trạng thái hiện tại

- **Root repo:** `C:\Users\kaqua\Downloads\web`
- **Source FE:** `C:\Users\kaqua\Downloads\web\frontend\src` (84 files)
- **Source BE:** `C:\Users\kaqua\Downloads\web\backend\src` (18 files)
- **Branch làm việc:** stacked `feat/soundpass-ui` → `feat/auth-admin` → `docs-cleanup` → `fix/chatbot-artist` (`soundpass-ui` là branch tổng cũ, PR #2 đã đóng)
- **HEAD / remote:** luôn là commit mới nhất của `upstream/fix/chatbot-artist` (`git log -1`)
- **PR đang mở:** #3, #4, #5, #6 (xem mục 5)
- **Remote:** `upstream` → `https://github.com/Kahprx/event-ticket-platform.git`
- **Đang chạy:** UI `http://localhost:5173/login`, API `http://localhost:5000/api/health`, PostgreSQL `:5432`
- **Build FE:** pass (còn chunk-size warning >500 kB, không blocking)
- **Tài khoản seed:**

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| ADMIN | `admin@soundpass.vn` | `Admin@123` |
| CUSTOMER | `minhanh.nguyen@example.com` | `User@123` |

---

## 7. Checklist trước khi merge các PR

- [x] Build frontend thành công
- [x] Kiểm tra import thừa / syntax backend
- [x] Test luồng đặt vé và CRUD admin trên browser
- [x] Xoá UI cũ, thống nhất một đường dẫn source
- [ ] Thêm CI GitHub Actions nếu yêu cầu
- [ ] Review bởi người khác
- [x] Tách PR #2 thành 3 PR stacked (#3/#4/#5)
- [x] Ghi phương án fork và nhiều PR vào mục 9
- [ ] Merge lần lượt PR #3 → PR #4 → PR #5 → PR #6 vào `main`

---

## 8. Ghi chú đường dẫn

| Thời gian | Đường dẫn | Ghi chú |
| --- | --- | --- |
| đến 18/11 11:10 | `C:\Users\kaqua\Downloads\QuanLyNhanVien\event-ticket-platform` | Đã dời đi, hiện để trống |
| từ 18/11 11:10 | `C:\Users\kaqua\Downloads\web` | **Đường dẫn source hợp lệ hiện tại** |
| cũ (đã xoá) | `C:\Users\kaqua\Downloads\web` (bản clone UI phase 1) | File đã xoá sạch, thay bằng repo mới |

> Mọi thao tác từ nay về sau thực hiện tại `C:\Users\kaqua\Downloads\web`.

---

## 9. Phương án Fork và nhiều Pull Request

### 9.1. Ba cách mở PR

| Cách | Khi nào dùng | Ưu điểm | Nhược điểm | Dự án này |
| --- | --- | --- | --- | --- |
| Branch trong cùng repo | Có quyền push | Đơn giản, push là PR tự cập nhật | Cần quyền write | ✅ Đang dùng (#3/#4/#5/#6) |
| Fork + PR | Không có quyền push repo gốc (người ngoài đóng góp) | Không cần quyền write vào repo gốc | Phải đồng bộ fork; push nhầm chỗ là PR không update | ❌ Không cần vì `Kahprx` là owner |
| Draft PR | Muốn review sớm, code chưa xong | Comment sớm, tránh merge nhầm | Phải `gh pr ready` trước khi merge | Có thể dùng cho PR #6 |

### 9.2. Fork — quy trình chuẩn

1. Fork repo: `gh repo fork Kahprx/event-ticket-platform --clone=false`
2. Thêm remote fork: `git remote add myfork https://github.com/<user>/event-ticket-platform.git`
3. Tạo branch: `git checkout -b feat/xyz`
4. Push lên **fork**: `git push myfork feat/xyz`
5. Mở PR: `gh pr create --repo Kahprx/event-ticket-platform --head <user>:feat/xyz --base main`

Lưu ý khi dùng fork:

- Đồng bộ định kỳ: `git fetch upstream` rồi `git merge upstream/main`.
- PR từ fork lấy head từ `<user>:<branch>`; push vào branch cùng tên trên repo gốc sẽ **không** cập nhật PR đó.
- Stacked PR qua fork phức tạp hơn vì branch base cũng phải tồn tại trên fork hoặc upstream.

### 9.3. Nhiều PR — 3 kiểu chia

| Kiểu | Cách làm | Dùng khi |
| --- | --- | --- |
| Stacked PR (đang dùng) | Branch sau lấy branch trước làm base | Các phần phụ thuộc nhau: UI → auth → docs → fix |
| Independent PR | Mỗi branch tách từ `main`, `cherry-pick` commit | Các phần độc lập, merge thứ tự tuỳ |
| Draft PR | `gh pr create --draft`, sau đó `gh pr ready` | Muốn review sớm trong lúc vẫn đang code |

### 9.4. Áp dụng cho repo này

- Đang dùng **stacked branch trong cùng repo**: `main ← #3 ← #4 ← #5 ← #6`.
- Không dùng fork vì tài khoản `Kahprx` là chủ repo, đã có quyền push.
- Nếu sau này có người ngoài đóng góp: áp dụng mục 9.2, head PR là `<user>:<branch>`.
- Merge luôn từ dưới lên: **#3 → #4 → #5 → #6**; PR #1 đã merge, PR #2 đã đóng.
