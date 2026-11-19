"""Generate editable vector SVGs from the real Soundpass DOM.

Chay: python figma-export/generate_svg.py
Moi SVG gom rect (background/border) + text (font, size, weight, color) tu computed style.
Paste SVG vao Figma de co layer co the chinh sua.
"""

import json
import os
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
SCREENS_DIR = os.path.join(ROOT, "screens")
BASE = "http://localhost:5173"

ADMIN_USER = {
    "name": "Nguyễn Minh Anh",
    "email": "minhanh.nguyen@example.com",
    "phone": "0901 234 567",
    "role": "ADMIN",
    "city": "hcm",
    "joinedAt": "2025-09-08",
    "notifications": {"emailReminder": True, "smsReminder": False, "promotions": True, "newEvents": True},
}

CUSTOMER_ROUTES = [
    ("home", "/"),
    ("events", "/events"),
    ("event-detail", "/events/soundwave-festival-2026"),
    ("seat", "/events/soundwave-festival-2026/select"),
    ("checkout", "/checkout"),
    ("payment-result", "/payment-result"),
    ("my-tickets", "/my-tickets"),
    ("profile", "/profile"),
    ("chatbot", "/chatbot"),
    ("login", "/login"),
    ("404", "/not-a-real-page"),
]

ADMIN_ROUTES = [
    ("overview", "/admin"),
    ("events", "/admin/events"),
    ("tickets", "/admin/tickets"),
    ("orders", "/admin/orders"),
    ("accounts", "/admin/accounts"),
    ("roles", "/admin/roles"),
    ("customers", "/admin/customers"),
    ("locations", "/admin/locations"),
    ("chatbot", "/admin/chatbot"),
    ("reports", "/admin/reports"),
    ("404", "/admin/not-a-real-page"),
]

BREAKPOINTS = [
    ("desktop", 1440, 900),
    ("mobile", 390, 844),
    ("tablet", 834, 1112),
]

# 22 routes x 3 breakpoints = 66 frames, chia thanh 2 role ro het.
SCREENS = []
for role, routes, is_admin in [("customer", CUSTOMER_ROUTES, False), ("admin", ADMIN_ROUTES, True)]:
    for bp, width, height in BREAKPOINTS:
        for slug, route in routes:
            SCREENS.append((f"{role}-{bp}-{slug}", route, width, height, is_admin))

EXTRACT_JS = r"""
() => {
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const num = v => Math.round(Number(v) * 10) / 10;
  const clamp = v => Math.max(0, Math.min(1, v));
  const gamma = c => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(c, 0), 1 / 2.4) - 0.055;
  const hex = v => Math.round(clamp(v) * 255).toString(16).padStart(2, '0');

  function normColor(input) {
    const c = String(input || '').trim();
    let m = c.match(/^oklab\(([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)(?:\s*\/\s*([-\d.]+))?\)$/);
    if (m) {
      const L = +m[1], a = +m[2], bb = +m[3], alpha = m[4] !== undefined ? +m[4] : 1;
      const l_ = L + 0.3963377774 * a + 0.2158037573 * bb;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * bb;
      const s_ = L - 0.0894841775 * a - 1.2914855480 * bb;
      const l = l_ ** 3, mm = m_ ** 3, s = s_ ** 3;
      const r = gamma(clamp(4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s));
      const g = gamma(clamp(-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s));
      const b2 = gamma(clamp(-0.0041960863 * l - 0.7034186147 * mm + 1.7076147010 * s));
      if (alpha < 0.999) return 'rgba(' + Math.round(r*255) + ',' + Math.round(g*255) + ',' + Math.round(b2*255) + ',' + num(alpha) + ')';
      return '#' + hex(r) + hex(g) + hex(b2);
    }
    m = c.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:\s*[,\/]\s*([\d.]+))?\s*\)$/);
    if (m) {
      const alpha = m[4] !== undefined ? +m[4] : 1;
      if (alpha < 0.999) return 'rgba(' + (+m[1]) + ',' + (+m[2]) + ',' + (+m[3]) + ',' + num(alpha) + ')';
      return '#' + hex((+m[1])/255) + hex((+m[2])/255) + hex((+m[3])/255);
    }
    return c;
  }

  const H = document.documentElement.scrollHeight;
  const W = document.documentElement.scrollWidth;
  const out = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">',
    '<rect width="100%" height="100%" fill="#f7f5f0"/>'
  ];
  let count = 0;
  const skip = ['script','style','noscript','svg','path','circle','line','polyline','polygon','rect','img','iframe','br','hr','html','body'];

  for (const el of document.body.querySelectorAll('*')) {
    if (count > 1200) break;
    const tag = el.tagName.toLowerCase();
    if (skip.includes(tag)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    const x = num(r.left + scrollX), y = num(r.top + scrollY), w = num(r.width), h = num(r.height);
    const bg = normColor(cs.backgroundColor);
    const bw = parseFloat(cs.borderTopWidth) || 0;
    const bc = normColor(cs.borderTopColor);
    const rx = parseFloat(cs.borderTopLeftRadius) || 0;
    const hasFill = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && bg !== 'none';
    if (hasFill || bw > 0) {
      out.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + num(rx) +
               '" fill="' + (hasFill ? bg : 'none') + '" stroke="' + (bw > 0 ? bc : 'none') + '" stroke-width="' + num(bw) + '"/>');
      count++;
    }
    if (el.children.length === 0 && el.textContent.trim()) {
      const text = (el.innerText || el.textContent).trim().replace(/\s+/g, ' ').slice(0, 160);
      const fs = parseFloat(cs.fontSize) || 14;
      const lh = parseFloat(cs.lineHeight) || fs * 1.4;
      const lines = (el.innerText || text).split('\n').map(s => s.trim().replace(/\s+/g, ' ')).filter(Boolean).slice(0, 6);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      const family = /Manrope/.test(cs.fontFamily) ? 'Manrope' : 'DM Sans';
      const fill = normColor(cs.color);
      lines.forEach((line, i) => {
        out.push('<text x="' + num(x + 2) + '" y="' + num(y + fs * 0.85 + i * lh) + '" fill="' + fill +
                 '" font-family="' + family + '" font-size="' + num(fs) + '" font-weight="' + weight + '">' + esc(line) + '</text>');
      });
      count++;
    }
  }
  out.push('</svg>');
  return { svg: out.join(''), width: W, height: H, elements: count };
}
"""


def main():
    os.makedirs(SCREENS_DIR, exist_ok=True)
    summary = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        for name, route, width, height, admin in SCREENS:
            context = browser.new_context(viewport={"width": width, "height": height}, device_scale_factor=1)
            if admin:
                context.add_init_script(
                    "localStorage.setItem('sp-user', " + json.dumps(json.dumps(ADMIN_USER, ensure_ascii=False)) + ");"
                )
            page = context.new_page()
            page.goto(BASE + route, wait_until="domcontentloaded")
            page.wait_for_timeout(900)
            try:
                data = page.evaluate(EXTRACT_JS)
            except Exception as exc:  # pragma: no cover
                print("SKIP", name, exc)
                context.close()
                continue
            path = os.path.join(SCREENS_DIR, name + ".svg")
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(data["svg"])
            page.screenshot(path=os.path.join(SCREENS_DIR, name + ".png"), full_page=True)
            summary.append({"name": name, "elements": data["elements"], "bytes": len(data["svg"].encode("utf-8"))})
            context.close()
        browser.close()
    for row in summary:
        print(f"{row['name']:<34} {row['elements']:>5} layers  {row['bytes']:>8} bytes")
    print(f"TOTAL: {len(summary)} SVGs")


if __name__ == "__main__":
    main()
