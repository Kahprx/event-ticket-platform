// RAG knowledge base cho chatbot: dùng chung dữ liệu sự kiện với frontend/seed
// để ID sự kiện, tên ca sĩ, giờ diễn và địa điểm luôn khớp nhau.
import { categories, events, locations } from "../../../../frontend/src/data/events.js";

export const normalize = (text) =>
  String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();

export const compact = (text) =>
  normalize(text).replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hasWord = (text, pattern) => new RegExp(`(^|[^a-z0-9])${pattern}([^a-z0-9]|$)`).test(text);

const formatPrice = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const formatDate = (value) => {
  const [year, month, day] = String(value || "").split("-");
  return day && month && year ? `${day}/${month}/${year}` : String(value || "");
};

const locationName = (id) => locations.find((location) => location.id === id)?.name || "";

const categoryName = (id) => categories.find((category) => category.id === id)?.name || "";

const eventDateTime = (event) => new Date(`${event.date}T${event.time || "00:00"}:00`);

export const isUpcoming = (event, now = new Date()) =>
  event.status !== "ended" && eventDateTime(event) >= now;

const CITY_PATTERNS = [
  ["hcm", "(ho chi minh|hcm|sai gon|saigon|tp hcm|thanh pho ho chi minh)"],
  ["hn", "(ha noi|hanoi)"],
  ["dn", "(da nang|danang)"],
  ["ct", "(can tho|cantho)"],
  ["hp", "(hai phong|haiphong)"],
  ["hue", "hue"],
];

const CATEGORY_PATTERNS = [
  ["edm", "(edm|electronic|house|techno|club|dj)"],
  ["indie", "indie"],
  ["acoustic", "(acoustic|unplugged|nhac moc)"],
  ["rap", "(rap|hip hop|hiphop)"],
  ["festival", "(festival|le hoi)"],
  ["live", "(live|concert|hoa nhac|nhac song|rock|metal|giao huong)"],
];

const TOPIC_PATTERNS = {
  where: "(o dau|dia diem|dia chi|venues?|cho nao|vi tri|dat o|toa do|dien ra o|that hien o)",
  when: "(may gio|may h|luc may|gio|thoi gian|khi nao|ngay nao|bat dau|ket thuc|den may gio|vao luc)",
  schedule: "(lich dien|lich|schedule|nhung ngay|cac ngay|nhung show|cac show|danh sach|nhung su kien)",
  price: "(gia|bao nhieu|price|tien|re nhat|cao nhat|chiet khau)",
  buy: "(mua ve|dat ve|thanh toan|payment|checkout|quy trinh|muon ve|muon mua)",
  cancel: "(huy ve|huy|hoan tien|refund|cancel|khong di duoc)",
  exist: "(co hat|co dien|co tham gia|co mat|hang khong|co sanh|co show|line up|line-up|nghe si nao)",
  greeting: "(xin chao|chao ban|chao|hello|hi|hey)",
};

const REFERRAL_PATTERN = /(ca si nay|nghe si nay|ban ay|anh ay|co ay|show do|nguoi do|toi vua hoi|vua nhac)/;

const STOP_ALIASES = new Set(["khach moi", "nhom", "dan nhac", "cac nghi si", "nghi si", "nhac", "moi"]);

// Sinh alias từ chính dữ liệu sự kiện: "Vũ." → "vu", "Da LAB" → "da lab"/"dalab",
// "nhóm MTV" → "mtv". Ưu tiên alias đầy đủ để tránh khớp nhầm từ thông thường.
const ARTIST_ALIASES = new Map();
for (const event of events) {
  const parts = String(event.artist || "").split(/[,/]|&|\s+va\s+|\s+ft\.?\s+|\s+feat\.?\s+/i);
  for (const part of parts) {
    const canonical = part.trim().replace(/[.\s]+$/g, "").trim();
    if (!canonical) continue;
    const base = compact(canonical);
    if (base.length < 2 || STOP_ALIASES.has(base)) continue;
    if (!ARTIST_ALIASES.has(canonical)) ARTIST_ALIASES.set(canonical, new Set());
    const aliases = ARTIST_ALIASES.get(canonical);
    aliases.add(base);
    const squashed = base.replace(/\s+/g, "");
    if (squashed.length >= 3) aliases.add(squashed);
    if (base.startsWith("dj ")) {
      const withoutDj = base.slice(3);
      if (withoutDj.length >= 3) aliases.add(withoutDj);
    }
    if (base.startsWith("nhom ")) {
      const groupName = base.slice(5);
      if (groupName.length >= 3) aliases.add(groupName);
    }
  }
}

export const findArtists = (text) => {
  const source = compact(text);
  if (!source) return [];
  const found = [];
  for (const [canonical, aliases] of ARTIST_ALIASES.entries()) {
    const matched = [...aliases]
      .sort((a, b) => b.length - a.length)
      .some((alias) => hasWord(source, escapeRegex(alias)));
    if (matched) found.push(canonical);
  }
  return found;
};

// "Ca sĩ này có show gì?" → lấy nghệ sĩ đã nhắc ở lượt trước (do frontend gửi history).
export const resolveArtists = (message, history = []) => {
  const direct = findArtists(message);
  if (direct.length > 0) return direct;
  if (!REFERRAL_PATTERN.test(compact(message))) return [];
  for (const item of [...history].reverse()) {
    if (item?.artist) return [item.artist];
    const fromText = findArtists(item?.text || "");
    if (fromText.length > 0) return fromText;
  }
  return [];
};

const findCity = (text) => {
  const source = compact(text);
  for (const [id, pattern] of CITY_PATTERNS) {
    if (hasWord(source, pattern)) return id;
  }
  return null;
};

const findCategory = (text) => {
  const source = compact(text);
  for (const [id, pattern] of CATEGORY_PATTERNS) {
    if (hasWord(source, pattern)) return id;
  }
  return null;
};

const findBudget = (text) => {
  const source = compact(text).replace(/\s+/g, "");
  const million = source.match(/(\d+(?:\.\d+)?)(trieu|tr)/);
  if (million) return Math.round(Number(million[1]) * 1000000);
  const thousand = source.match(/(\d+)k/);
  if (thousand) return Number(thousand[1]) * 1000;
  const plain = source.match(/(\d{4,})/);
  return plain ? Number(plain[1]) : null;
};

const findTopics = (text) => {
  const source = compact(text);
  const topics = {};
  for (const [topic, pattern] of Object.entries(TOPIC_PATTERNS)) {
    topics[topic] = hasWord(source, pattern);
  }
  const isDomainRelated =
    Object.entries(topics).some(([topic, active]) => active && topic !== "greeting") ||
    /(su kien|event|concert|nhac|festival|am nhac|ca si|nghe si|ve|dien|show)/.test(source);
  return { ...topics, isDomainRelated };
};

const weekendRange = (now) => {
  const day = now.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + daysUntilSaturday);
  saturday.setHours(0, 0, 0, 0);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 999);
  return [saturday, sunday];
};

const matchesArtistFilter = (event, artists) => {
  if (artists.length === 0) return true;
  const haystack = compact(event.artist || "");
  return artists.some((artist) => {
    const needle = compact(artist);
    return needle.length >= 2 && haystack.includes(needle);
  });
};

const STOP_WORDS = new Set([
  "may", "gio", "dau", "khi", "nao", "co", "khong", "su", "kien", "di", "ra", "lat",
  "tim", "goi", "cho", "minh", "ban", "nhu", "the", "nao", "cua", "vao", "ngay", "thang",
]);

const scoreEvent = (event, query, slots) => {
  let score = 0;
  if (slots.artists.some((artist) => compact(event.artist || "").includes(compact(artist)))) score += 100;
  if (slots.city && event.locationId === slots.city) score += 20;
  if (slots.category && event.category === slots.category) score += 15;
  if (slots.budget && event.priceFrom <= slots.budget) score += 10;
  if (slots.weekendOnly) {
    const [start, end] = weekendRange(slots.now);
    const date = eventDateTime(event);
    if (date >= start && date <= end) score += 15;
  }
  const haystack = compact(`${event.name} ${(event.tags || []).join(" ")} ${(event.description || []).join(" ")}`);
  for (const token of compact(query).split(" ")) {
    if (token.length >= 4 && !STOP_WORDS.has(token) && haystack.includes(token)) score += 1;
  }
  return score;
};

export function retrieve({ message, history = [], now = new Date() }) {
  const artists = resolveArtists(message, history);
  const topics = findTopics(message);
  const slots = {
    artists,
    city: findCity(message),
    category: findCategory(message),
    budget: findBudget(message),
    weekendOnly: /(cuoi tuan|weekend|thu 7|chu nhat)/.test(compact(message)),
    askedArtist: /(ca si|nghe si|ban nhac|dan nhac)/.test(compact(message)),
    now,
  };

  let pool = events.filter((event) => isUpcoming(event, now));
  if (pool.length === 0) pool = [...events];

  let matched = pool.filter(
    (event) =>
      matchesArtistFilter(event, artists) &&
      (!slots.city || event.locationId === slots.city) &&
      (!slots.category || event.category === slots.category) &&
      (!slots.budget || event.priceFrom <= slots.budget),
  );

  // Nếu lọc quá chặt (ví dụ hỏi ca sĩ + thành phố khác) thì nới dần để vẫn trả lời đúng chủ đề ca sĩ.
  if (matched.length === 0 && artists.length > 0) {
    matched = pool.filter((event) => matchesArtistFilter(event, artists));
  }
  if (matched.length === 0 && slots.city) {
    matched = pool.filter((event) => event.locationId === slots.city);
  }

  const ranked = matched
    .map((event) => ({ event, score: scoreEvent(event, message, slots) }))
    .sort((a, b) => b.score - a.score || eventDateTime(a.event) - eventDateTime(b.event))
    .map((item) => item.event);

  const limit = topics.schedule ? 5 : 3;
  return {
    artists,
    topics,
    slots,
    events: ranked.slice(0, limit),
    allUpcomingCount: ranked.length,
  };
}

export const describeEvent = (event, { where = false, when = false, price = false, full = false } = {}) => {
  const showWhere = where || full;
  const showWhen = when || full;
  const showPrice = price || full;
  const parts = [event.name];
  if (showWhen) parts.push(`${formatDate(event.date)}, ${event.time}${event.endTime ? `–${event.endTime}` : ""}`);
  if (showWhere) {
    parts.push(`tại ${event.venue}, ${locationName(event.locationId)}`);
    if (event.address) parts.push(`(${event.address})`);
  }
  if (showPrice) parts.push(`giá vé từ ${formatPrice(event.priceFrom)}`);
  return parts.join(" — ");
};

export const eventContext = (event) => ({
  id: event.id,
  title: event.name,
  artist: event.artist,
  date: formatDate(event.date),
  startTime: event.time,
  endTime: event.endTime || null,
  venue: event.venue,
  address: event.address,
  city: locationName(event.locationId),
  category: categoryName(event.category),
  priceFrom: event.priceFrom,
  priceTo: event.priceTo,
  status: event.status,
  tags: event.tags || [],
});

export { events as allEvents, formatPrice, formatDate, locationName, categoryName };
