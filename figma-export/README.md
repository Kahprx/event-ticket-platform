# Figma export — Soundpass

Bộ design assets tạo từ UI đang chạy (`http://localhost:5173`).

## File Figma trực tiếp

- **Tên file:** `Soundpass - Full Design`
- **URL:** https://www.figma.com/design/mWPjG7cLh9gt4OCxEfisTP/Soundpass---Full-Design?t=RE16t4soIVoMPtWH-0
- **Nội dung đã import:** 66 page. Mỗi page có **1 frame SVG** (layer Vector/Text sửa được) + **1 ảnh reference PNG** đặt bên cạnh frame tại `X=1600, Y=0` (33 customer + 33 admin = 11 route/role × 3 breakpoint). Tên page trùng tên frame: `customer-{desktop|mobile|tablet}-{slug}` và `admin-{desktop|mobile|tablet}-{slug}`.
- **Variables:** collection `Collection 1` với 20 biến màu (`accent`, `ink-950…ink-600`, `paper`, `paper-2`, `line`, `accent-dark/soft`, `success/success-soft`, `warning/warning-soft`, `danger/danger-soft`, `muted/muted-2`, `white`), giá trị đối chiếu `tokens/design-tokens.json`.

Lưu ý: file được tạo trong **Drafts** vì team Free/Starter đã đạt giới hạn 3 file ở Recents.

| Thư mục / file | Nội dung |
| --- | --- |
| `screens/*.png` | 66 screenshot full-page (desktop 1440, tablet 834, mobile 390) — đã chèn sẵn làm reference pixel-perfect trong từng page |
| `screens/*.svg` | 66 file vector cùng tên — paste vào Figma thành layer rect/text sửa được |
| `tokens/design-tokens.json` | Colors, typography, radius, shadow, spacing, component states — làm Figma Variables |
| `tokens/design-tokens.css` | Bản CSS trích từ `frontend/src/styles.css` |
| `DESIGN_SPEC.md` | Nguyên tắc thị giác, typography, grid, component library, danh sách màn hình |
| `generate_svg.py` | Script sinh lại SVG từ DOM thật (cần `npm run dev:frontend` và Python + Playwright + Chrome) |

## Sinh lại SVG

```powershell
# Terminal 1
npm run dev:frontend

# Terminal 2
python figma-export/generate_svg.py
```

Script dùng `channel="chrome"` nên cần Chrome cài sẵn. Mỗi SVG gồm các `<rect>` (background/border) và `<text>` (font, size, weight, color) lấy từ `getComputedStyle`. Màu `oklab` của Tailwind v4 được convert sang hex/rgba trước khi ghi.

## Import nhanh vào Figma

1. Mở file Figma mới.
2. Với mỗi màn hình: tạo page riêng đặt tên theo file, kéo `.svg` tương ứng vào → layer Vector/Text sửa được.
3. Kéo `.png` cùng tên vào page, đặt `X=1600, Y=0` để làm reference pixel-perfect không đè lên frame.
4. Import `tokens/design-tokens.json` làm Variables (hoặc đối chiếu với `design-tokens.css`).

Chi tiết: [`DESIGN_SPEC.md`](./DESIGN_SPEC.md).
