# Soundpass — Design Spec (đối chiếu UI đang chạy)

Bộ spec này trich từ source thật `frontend/src/styles.css`, `frontend/src/components/*`, `frontend/src/pages/*` và các ảnh chụp/SVG trong thư mục này. Dùng để dựng lại hoặc kiểm tra design trong Figma.

## 1. Nguyên tắc thị giác

- Nền **paper** `#f7f5f0`, chữ **ink** `#101a26`. Thanh điều hướng/sidebar dùng **ink-950** `#0b121b`.
- Accent duy nhất: **cam `#e4572e`**, chỉ dùng cho hành động chính, trạng thái active, giá tiền nhấn mạnh.
- Bo góc trung bình: card `12px`, control/chip `8px`, badge `4px`, seat `5px`.
- Shadow thật, rất nhẹ: `0 1px 2px rgba(16,26,38,.05), 0 10px 26px -18px rgba(16,26,38,.35)`. Popover dùng shadow đậm hơn.
- **Không dùng** gradient trang trí, glassmorphism, glow, shape ngẫu nhiên hay animation thừa. Chỉ có shimmer skeleton khi tải.
- Contrast: chữ trên nền ink dùng `#f7f5f0`; chữ phụ trên nền sáng dùng `#6b7280`. Không đặt text xám nhạt lên nền cam.

## 2. Typography

| Vai trò | Font | Size | Weight | Ghi chú |
| --- | --- | --- | --- | --- |
| H1 trang | Manrope | 24 → 30 (desktop) | 800 | `letter-spacing: -0.02em` |
| H2 section | Manrope | 20 → 28 | 700 | `line-height: 1.12` |
| Tiêu đề card | Manrope | 16 → 18 | 700 | |
| Body | DM Sans | 15 | 400 | `line-height: 1.55` |
| Label/Nhỏ | DM Sans | 13 → 14 | 500–600 | Chip, meta, bảng |
| 404 | Manrope | 48 | 800 | |

## 3. Layout & grid

| Breakpoint | Width | Container | Gutter | Ghi chú |
| --- | --- | --- | --- | --- |
| Mobile | 390 | full-width | 16 | Navbar thu gọn, card xếp dọc, sidebar thành drawer |
| Tablet | 834 | full-width | 20 | Grid 2 cột cho event card |
| Desktop | 1440 | 1200 | 24 | Navbar 64px; admin sidebar 248px |

## 4. Component library

### Button
- Height: `sm 32` / `md 40` / `lg 44`, radius `8`.
- `primary`: nền `#e4572e`, chữ trắng, hover `#c44722`.
- `secondary`: nền trắng, viền `#e3ded2`, chữ `#101a26`, hover `#fbfaf7`.
- `danger`: `#b93b2f`; `dark`: `#101a26`; `ghost`: trong suốt.
- Trạng thái: default / hover / disabled / loading.

### Input & form
- Height `40`, radius `8`, viền `#e3ded2`, nền trắng.
- Focus: viền accent + ring `0 0 0 3px rgba(228,87,46,.14)`.
- Error: viền/chữ `#b93b2f`; helper text `#6b7280`.

### Card & surface
- Nền trắng, viền `#e3ded2`, radius `12`, shadow `card`. Card ảnh sự kiện bo `12`, overlay chữ trắng.

### Chip / Badge
- Chip lọc: radius `8`, viền line; active = nền ink, chữ trắng.
- Badge: radius `4`; tone accent/success/warning/danger/neutral với nền soft tương ứng.

### Table (admin)
- Header nền paper, chữ 13px bold; row border `#e3ded2`; radius `12`; action icon ở cuối row.

### Seat map
- Available: trắng + viền line, text `#8b8578`; selected: accent + chữ trắng; held: `#f6edcf`; sold: `#e7e3da`, text `#a8a294`.

### Navbar / Sidebar
- Navbar ink-950, logo cam, link chữ paper/60%, active chữ trắng.
- Admin sidebar ink-950 width 248, active bg `#182430` + thanh accent, footerinfo tài khoản ADMIN.

### Khác
- Modal: card trắng radius 12 + shadow pop; overlay ink/50%.
- Toast: card trắng, icon trạng thái, tự ẩn.
- EmptyState / ErrorState: icon line, title 16 bold, description 14 muted.

## 5. Danh sách màn hình trong bộ export

Bộ export gồm **66 màn hình**. Trong file Figma, **mỗi màn hình là 1 page riêng**, gồm 1 frame vector cùng tên + 1 ảnh reference PNG đặt bên cạnh (`X=1600, Y=0`) — không dồn nhiều màn hình chung một page.

| Role | 11 slug | Breakpoint | Tên page = tên frame |
| --- | --- | --- | --- |
| Customer | `home`, `events`, `event-detail`, `seat`, `checkout`, `payment-result`, `my-tickets`, `profile`, `chatbot`, `login`, `404` | `desktop` 1440×900 · `mobile` 390×844 · `tablet` 834×1112 | `customer-{breakpoint}-{slug}` |
| Admin | `overview`, `events`, `tickets`, `orders`, `accounts`, `roles`, `customers`, `locations`, `chatbot`, `reports`, `404` | `desktop` 1440×900 · `mobile` 390×844 · `tablet` 834×1112 | `admin-{breakpoint}-{slug}` |

Mỗi màn hình có 2 file cùng tên: `.png` (reference pixel-perfect) và `.svg` (layer vector/text sửa được).

## 6. Import vào Figma

File Figma đã tạo và import sẵn: **Soundpass - Full Design** — https://www.figma.com/design/mWPjG7cLh9gt4OCxEfisTP/Soundpass---Full-Design?t=RE16t4soIVoMPtWH-0 (66 page × [1 frame SVG + 1 PNG reference] + 20 color variables trong `Collection 1`).

Nếu tự import thủ công:

1. Tạo file Figma mới.
2. Với mỗi trong 66 file `.svg`: tạo 1 page mới đặt tên theo file, rồi kéo thả SVG vào page đó. Figma tạo layer vector/text; giữ nguyên tên frame trùng tên page.
3. Kéo `.png` cùng tên vào page, đặt `X=1600, Y=0` để làm reference pixel-perfect.
4. Tạo Variables từ `tokens/design-tokens.json`: Color (ink/paper/accent/status), Typography (Manrope/DM Sans), Radius, Shadow. Nếu dùng plugin token, import JSON trực tiếp.
5. Đối chiếu màu bằng `tokens/design-tokens.css` nếu plugin không đọc được JSON.

## 7. Lưu ý khi paste SVG

- SVG được sinh từ DOM thật: mọi rect có fill/stroke, mọi text có font-size/weight/color đúng computed style. Icon dạng `<svg>` của app không được export (dùng icon có sẵn trong Figma thay thế).
- Ảnh Unsplash không nhúng trong SVG để tránh file lớn; dùng file PNG làm reference hoặc place ảnh gốc vào khung tương ứng.
- Text có thể bị gộp dòng; nếu Figma hiển thị sai, chia lại theo từng dòng trong reference PNG.
