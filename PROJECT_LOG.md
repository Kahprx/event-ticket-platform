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
| 7 | Tạo / cập nhật Pull Request | PR #1 merged; PR #2/#3/#4/#5/#6 đã đóng; **4 PR #8/#9/#10/#7 từ fork `ka31203` đều đã merged**. Fork thật + nhiều PR ở mục 9 |
| 8 | Review → merge → ghi log | Review chéo xong; merge lần lượt **#8 → #9 → #10 → #7** vào `main` (4 PR từ fork) |

---

## 2. Phân chia nghiệp vụ (2 thành viên)

> Chưa có tên thật nên dùng placeholder `Dev 1` / `Dev 2`. Đổi tên ở bảng này và cột “Người làm” là đủ, không ảnh hưởng commit hay PR.

| Thành viên | Vai trò chính | Số nghiệp vụ | Đã xong | Chưa xong | PR phụ trách |
| --- | --- | --- | --- | --- | --- |
| **Dev 1** | Frontend / UI / Chatbot | 7 | 7 | 0 | #8, #7 (đều từ fork) |
| **Dev 2** | Backend / DB / Hạ tầng / Tài liệu | 6 | 6 | 0 | #1, #9, #10 (đều đã merge) |
| **Tổng** | — | **13** | **13** | **0** | 4 PR từ fork đã merge |

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
- `T12` ✅ Đã làm: GitHub Actions CI (`npm ci` → `prisma generate` → build FE → syntax BE), commit `3bdf01b` trong PR #10.

### Quy ước

- Mỗi nghiệp vụ có **đúng 1 người chịu trách nhiệm chính** — xem cột “Người làm” trong bảng task bên dưới.
- PR stacked: **Dev 1** giữ #8/#7, **Dev 2** giữ #9/#10. **Cả 4 PR đều từ fork `ka31203`**. Đã merge theo thứ tự **#8 → #9 → #10 → #7** (retarget từng PR về `main` ngay trước khi merge).
- Đổi tên thành viên chỉ cần sửa bảng này + cột “Người làm”; commit/PR giữ nguyên.

---

## 3. Danh sách nhiệm vụ (Tasks)

| ID | Người làm | Nhiệm vụ | Thời gian | Commit | PR | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- |
| T01 | Dev 2 | Khởi tạo nền tảng: monorepo, Prisma schema, Express skeleton, React/Vite base | 17/11 16:36 | `b2f8dd3` | #1 | ✅ Đã merge |
| T02 | Dev 1 | Dựng toàn bộ UI Soundpass: Home → location → events → filter/search → detail → seat → checkout → payment → confirmation → My Tickets, Profile, Chatbot, Admin, Login, 404 | 17/11 18:46 | `ce3540f` | #8 | ✅ Xong |
| T03 | Dev 1 | Phân quyền khu vực `ADMIN`, chặn route `/admin`, greeting theo role, sign-out clear token | 17/11 19:01 | `28e62cf` | #9 | ✅ Xong (sau thay bằng auth thật) |
| T04 | Dev 2 | Đổi `USER` → `CUSTOMER`; tạo bảng `Role`; migration bảo toàn dữ liệu; seed 2 role + 4 tài khoản | 17/11 ~19:05–19:12 | `fac11ce` | #9 | ✅ Xong |
| T05 | Dev 2 | Auth thật: bcrypt + JWT, API login/register/me/profile; CORS multi-origin; admin CRUD accounts/roles/customers | 17/11 ~19:12–19:20 | `fac11ce` | #9 | ✅ Xong |
| T06 | Dev 1 | UI CRUD `/admin/accounts`, `/admin/roles`, `/admin/customers`; sửa lỗi runtime + role dropdown; test browser tạo/sửa/xoá | 17/11 ~19:20–19:40 | `fac11ce` | #9 | ✅ Xong |
| T07 | Dev 1 | Thêm hướng dẫn chạy npm riêng BE/FE vào README; bỏ nút demo quick-login + danh sách tài khoản, thay bằng "Vào trang chủ" | 17/11 19:57 | `1a2ac6d` | #10 | ✅ Xong (lần 1, còn sót JSX) |
| T08 | Dev 2 | Ghi nhật ký dự án lần đầu vào `PROJECT_LOG.md` | 17/11 19:58 | `03ca592` | #10 | ✅ Xong |
| T09 | Dev 1 | Sửa triệt để lỗi còn sót: đoạn JSX nút demo vẫn nằm trong `LoginPage.jsx` gây runtime error; bỏ hoàn toàn fallback demo | 18/11 11:04 | `5c3ad7a` | #10 | ✅ Xong |
| T10 | Dev 2 | Xoá toàn bộ file UI cũ trong `C:\Users\kaqua\Downloads\web`, rồi dời repo Soundpass từ `QuanLyNhanVien\event-ticket-platform` về đúng folder `web` | 18/11 11:15 | `ebc3d1a` | #10 | ✅ Xong |
| T11 | Dev 1 | Viết lại tài liệu thành QUY TRÌNH đầy đủ: nhiệm vụ + thời gian + commit + PR | 18/11 11:17 | xem commit cuối PR #10 | #10 | ✅ Xong |
| T12 | Dev 2 | Thêm GitHub Actions CI (`npm ci` → `prisma generate` → build FE → syntax BE) | 19/11 ~12:53 | `3bdf01b` | #10 | ✅ Đã merge, CI pass |
| T13 | Dev 1 | Sửa AI chatbot: hiểu tên nghệ sĩ, câu hỏi gợi ý có nghệ sĩ, hiển thị nghệ sĩ trong câu trả lời và thẻ gợi ý | 18/11 11:32 | `c4e04fa`, `32b66ec`, `463a8a9` | #7 (từ fork) | ✅ Xong |

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
| **19:50** | Tạo Pull Request #2 "Soundpass UI" (`soundpass-ui` → `main`), sau này đóng để tách stack (ban đầu #3/#4/#5, cuối cùng thay bằng #8/#9/#10 từ fork) | PR #2 |
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
| **11:17** | Viết lại tài liệu thành quy trình đầy đủ (file này) | xem commit cuối PR #10 |

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
| Trạng thái | 🔴 **CLOSED** (đóng lúc 18/11 11:27, tách stack; 3 PR cũ sau đó thay bằng #8/#9/#10 từ fork) |
| Branch | `soundpass-ui` → `main` |
| Tạo lúc | 17/11/2026 19:50 |
| Cập nhật lần cuối | 18/11/2026 11:15 |
| Author | `Kahprx` |
| Review | Chưa có review |
| CI / status check | Chưa có (repo chưa có `.github/workflows`) |
| Link | https://github.com/Kahprx/event-ticket-platform/pull/2 |
| Ghi chú | Đã đóng để tránh trùng diff với 3 PR stacked |

**Commit từng nằm trong PR #2 (giờ phân bổ ở #8/#9/#10, đều từ fork):**

| Giờ | Commit | Nội dung |
| --- | --- | --- |
| 17/11 18:46 | `ce3540f` | feat(frontend): build complete Soundpass booking UI with mock data and admin |
| 17/11 19:01 | `28e62cf` | feat(auth): gate admin area behind demo role login |
| 17/11 19:44 | `fac11ce` | feat(auth): add customer roles and admin CRUD with real API |
| 17/11 19:57 | `1a2ac6d` | docs: add npm run guide and replace demo login with homepage link |
| 17/11 19:58 | `03ca592` | docs: add project timeline log |
| 18/11 11:04 | `5c3ad7a` | fix(frontend): replace demo login block with homepage link |
| 18/11 11:15 | `ebc3d1a` | docs: move project root to web folder and update log |
| 18/11 11:17 | (xem PR #10) | docs: rewrite project log as full workflow and task record |
| 18/11 11:18 | (xem PR #10) | docs: correct self-references in workflow log |
| **11:27** | Đóng PR #2, tạo 3 branch stacked và mở PR #3/#4/#5 (sau thay bằng #8/#9/#10) | PR #3/#4/#5 → #8/#9/#10 |
| **11:32** | Fix AI chatbot: nhận diện tên nghệ sĩ, hỏi/gợi ý theo nghệ sĩ, hiển thị tên nghệ sĩ trong thẻ gợi ý | PR #6 (đã đóng) |
| **18/11 (sau device flow)** | Thêm `ka31203` vào gh CLI, push 4 branch lên fork. Đóng PR #3/#4/#5/#6, mở lại **#7/#8/#9/#10 đều từ fork** | PR #7/#8/#9/#10 |

---

### PR #8 — `feat: Soundpass booking UI`

| Trường | Giá trị |
| --- | --- |
| Trạng thái | ✅ **MERGED** |
| Branch | `ka31203:feat/soundpass-ui` → `main` |
| Tạo lúc | 18/11/2026 11:27 |
| Merge lúc | 19/11/2026 12:53 |
| Merge commit | `a719002` |
| Nội dung | UI Soundpass + mock data (`ce3540f`) |
| Review | `Kahprx` approved (review chéo) |
| CI | Không có check lúc merge (workflow thêm ở PR #10) |
| Link | https://github.com/Kahprx/event-ticket-platform/pull/8 |

### PR #9 — `feat: real auth, customer role and admin CRUD`

| Trường | Giá trị |
| --- | --- |
| Trạng thái | ✅ **MERGED** |
| Branch | `ka31203:feat/auth-admin` → `main` (retarget từ `feat/soundpass-ui`) |
| Tạo lúc | 18/11/2026 11:27 |
| Merge lúc | 19/11/2026 12:54 |
| Merge commit | `07474ce` |
| Nội dung | `28e62cf`, `fac11ce` — auth thật, role `CUSTOMER`/`ADMIN`, admin CRUD |
| Review | `Kahprx` approved (review chéo) |
| Link | https://github.com/Kahprx/event-ticket-platform/pull/9 |

### PR #10 — `docs: workflow log, login cleanup and project relocation`

| Trường | Giá trị |
| --- | --- |
| Trạng thái | ✅ **MERGED** |
| Branch | `ka31203:docs-cleanup` → `main` (retarget từ `feat/auth-admin`) |
| Tạo lúc | 18/11/2026 11:27 |
| Merge lúc | 19/11/2026 12:55 |
| Merge commit | `2700533` |
| Nội dung | Fix login, dọn UI cũ, dời repo về `web`, tài liệu + file Word + CI `3bdf01b` |
| Review | `Kahprx` approved (review chéo); merge bằng token `ka31203` có scope `workflow` |
| Link | https://github.com/Kahprx/event-ticket-platform/pull/10 |

### PR #6 — `fix: chatbot understands artist names` (ĐÃ ĐÓNG)

| Trường | Giá trị |
| --- | --- |
| Trạng thái | 🔴 **CLOSED** — thay bằng PR #7 từ fork |
| Branch | `fix/chatbot-artist` → `docs-cleanup` (cùng repo) |
| Tạo lúc | 18/11/2026 11:32 |
| Link | https://github.com/Kahprx/event-ticket-platform/pull/6 |

### PR #7 — `fix: chatbot artist names (PR tu fork ka31203)`

| Trường | Giá trị |
| --- | --- |
| Trạng thái | ✅ **MERGED** |
| Branch | `ka31203:fix/chatbot-artist` → `main` (retarget từ `docs-cleanup`) |
| Fork | https://github.com/ka31203/event-ticket-platform |
| Tạo lúc | 18/11/2026 (sau khi xác thực device flow) |
| Merge lúc | 19/11/2026 12:55 |
| Merge commit | `c6fc00f` |
| Nội dung | Cùng nội dung PR #6 + ghi nhận fork thật, phân chia 2 thành viên và phương án nhiều PR |
| Review | `Kahprx` approved (review chéo) |
| Link | https://github.com/Kahprx/event-ticket-platform/pull/7 |

> Đã merge theo thứ tự **PR #8 → PR #9 → PR #10 → PR #7**. Cả 4 đều từ fork; PR #3/#4/#5/#6 đã đóng để tránh trùng nội dung. Trước mỗi lần merge, PR tiếp theo được `gh pr edit --base main` để code landed thẳng vào `main`.

---

## 6. Trạng thái hiện tại

- **Root repo:** `C:\Users\kaqua\Downloads\web`
- **Source FE:** `C:\Users\kaqua\Downloads\web\frontend\src` (84 files)
- **Source BE:** `C:\Users\kaqua\Downloads\web\backend\src` (18 files)
- **Branch làm việc:** `main` đã chứa toàn bộ 4 PR; bản cập nhật trạng thái sau merge nằm trên `docs/post-merge`.
- **HEAD / remote:** `upstream/main` = `c6fc00f` (merge PR #7), fork `ka31203/main` đồng bộ trước merge.
- **PR đang mở:** không còn; #8/#9/#10/#7 đã MERGED (xem mục 5).
- **Remote:** `upstream` → `https://github.com/Kahprx/event-ticket-platform.git`
- **Đang chạy:** UI `http://localhost:5173/login`, API `http://localhost:5000/api/health`, PostgreSQL `:5432`
- **Build FE:** pass (còn chunk-size warning >500 kB, không blocking)
- **CI:** `.github/workflows/ci.yml` — `npm ci` → `prisma generate` → build FE → `node --check` backend; run trên `main` ✅ pass (run `44468475158`).
- **Jira:** project **F5 (fixxo_5)** — thành viên `hanminh2709@gmail.com` Active, `F5 Sprint 1` đang **active**, 4 action item + 6 backlog + 1 Epic + 4 Story + form `Feature request` (xem mục 10).
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
- [x] Thêm CI GitHub Actions (`.github/workflows/ci.yml`, commit `3bdf01b`, run pass)
- [x] Review bởi người khác (`Kahprx` review chéo cả 4 PR từ fork `ka31203`)
- [x] Tách PR #2 thành stack; chuyển toàn bộ sang 4 PR từ fork (#8/#9/#10/#7)
- [x] Ghi phương án fork và nhiều PR vào mục 9
- [x] Fork thật sang `ka31203`, push 4 branch, đóng #3/#4/#5/#6, mở #7/#8/#9/#10 từ fork
- [x] Merge lần lượt PR #8 → PR #9 → PR #10 → PR #7 vào `main` (4 PR từ fork)
- [x] Start `F5 Sprint 1` trên Jira và đưa backlog/action/Epic/Story/Form vào project F5

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
| Branch trong cùng repo | Có quyền push | Đơn giản, push là PR tự cập nhật | Cần quyền write | ⚠️ Đã dùng lúc đầu (#3/#4/#5/#6), hiện đều đóng |
| Fork + PR | Muốn đóng góp từ account khác / không có quyền write repo gốc | Không cần quyền write vào repo gốc; vẫn mở PR được | Phải đồng bộ fork; push nhầm chỗ là PR không update | ✅ **Đang dùng 4 PR #7/#8/#9/#10 từ `ka31203`** |
| Draft PR | Muốn review sớm, code chưa xong | Comment sớm, tránh merge nhầm | Phải `gh pr ready` trước khi merge | Có thể dùng cho PR #7/#8/#9/#10 |

### 9.2. Fork — quy trình chuẩn

1. Fork repo: `gh repo fork Kahprx/event-ticket-platform --clone=false`
2. Thêm remote fork: `git remote add myfork https://github.com/<user>/event-ticket-platform.git`
3. Tạo branch: `git checkout -b feat/xyz`
4. Push lên **fork**: `git push myfork feat/xyz`
5. Mở PR: `gh pr create --repo Kahprx/event-ticket-platform --head <user>:feat/xyz --base main`

> Thực tế: `gh repo fork` bằng `Kahprx` bị chặn (`A single user account cannot own both a parent and fork`) nên fork được tạo bằng account `ka31203`. Thêm account thứ 2 vào gh CLI bằng device flow: `gh auth login --web -p https`, rồi `gh auth switch -u <user>`.

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

### 9.4. Áp dụng cho repo này (fork thật)

- **Fork:** https://github.com/ka31203/event-ticket-platform — parent là `Kahprx/event-ticket-platform`, tạo 17/11/2026.
- **gh CLI:** đã lưu cả 2 account — `Kahprx` (owner, push `upstream`) và `ka31203` (push `fork`). Chuyển bằng `gh auth switch -u <user>`.
- **Remote local:** `upstream` → repo gốc `Kahprx`; `fork` / `origin` → repo fork `ka31203`.
- **4 branch đã push lên fork:** `feat/soundpass-ui`, `feat/auth-admin`, `docs-cleanup`, `fix/chatbot-artist`.
- **Stacked PR:** `main ← #8 ← #9 ← #10 ← #7`. Ban đầu base của #9/#10/#7 là branch ngay trước; trước mỗi lần merge dùng `gh pr edit --base main` nên cả 4 landed thẳng vào `main`: `ka31203:feat/soundpass-ui`, `ka31203:feat/auth-admin`, `ka31203:docs-cleanup`, `ka31203:fix/chatbot-artist`.
- **PR #3/#4/#5/#6 đã đóng** để tránh trùng nội dung với #8/#9/#10/#7. PR #1 đã merge, PR #2 đã đóng.
- Đã merge từ dưới lên: **#8 (`a719002`) → #9 (`07474ce`) → #10 (`2700533`) → #7 (`c6fc00f`)**. Merge #10 dùng token `ka31203` vì token `Kahprx` thiếu scope `workflow` cho file `.github/workflows/ci.yml`.
- ⚠️ Số Fork trên GitHub vẫn là **1**: GitHub chỉ đếm số repo fork, mỗi account chỉ fork được 1 lần/repo (`Kahprx` là owner nên không tự fork được). Muốn tăng số Fork cần account thứ 3 fork repo. "Nhiều PR" không cần nhiều fork — 1 fork đã tạo được 4 PR như trên.

---

## 10. Quản lý dự án trên Jira

| Hạng mục | Giá trị |
| --- | --- |
| Site | `kaquach62.atlassian.net` |
| Project | **F5 (fixxo_5)** |
| Board | https://kaquach62.atlassian.net/jira/software/projects/F5/boards/2/backlog |
| Thành viên | `kaquach62@gmail.com` (org admin) và `hanminh2709@gmail.com` — đã accept invite, status **Active**, quyền **Jira User** |
| Sprint | **F5 Sprint 1** — đã **Start sprint** ngày 19/11/2026, goal “Merge 4 PR tu fork, CI GitHub Actions va review cheo” |

### Action item (trong Sprint 1)

| Key | Việc | Trạng thái |
| --- | --- | --- |
| F5-2 | Merge 4 PR từ fork `#8 → #9 → #10 → #7` | Done |
| F5-3 | T12: GitHub Actions CI | Done |
| F5-4 | Review chéo PR bởi thành viên thứ 2 | Done |
| F5-5 | Cập nhật README / PROJECT_LOG / Word sau merge | Done |

### Backlog

| Key | Việc |
| --- | --- |
| F5-6 | Seed dữ liệu events/orders vào Postgres |
| F5-7 | Thay mock data bằng API events/orders thật |
| F5-8 | Tách chunk frontend (cảnh báo build >500 kB) |
| F5-9 | Test E2E luồng đặt vé + CRUD admin |
| F5-10 | Hoàn thiện hủy vé / thanh toán thật |
| F5-11 | CORS multi-origin cho production |

### Epic / Story / Form

- **Epic F5-12:** `Soundpass - Nen tang dat ve su kien`.
- **Story F5-13** luồng đặt vé API thật; **F5-14** auth/role; **F5-15** chatbot tên nghệ sĩ; **F5-16** CI/CD, CORS, tài liệu.
- Toàn bộ 14 issue F5-2…F5-11, F5-13…F5-16 đã gán `parent = F5-12`.
- Form **`Feature request`** đã tạo trong F5: `/jira/software/projects/F5/form/1/builder`.

> Git và Jira dùng chung một danh sách việc: commit/PR ở mục 3–5 tương ứng với F5-2…F5-5; backlog F5-6…F5-11 là việc làm sau khi merge.
