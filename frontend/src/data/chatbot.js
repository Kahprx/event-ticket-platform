import { events, locations, categories } from "./events.js";

// Bộ trả lời đơn giản dựa trên từ khóa. Đây là phần "AI" của đồ án: không gọi
// model bên ngoài, nhưng vẫn trả lời được các câu hỏi thường gặp và gợi ý sự kiện.

export const suggestedQuestions = [
  "Cuối tuần này có gì ở TP. Hồ Chí Minh?",
  "Tìm sự kiện EDM dưới 500.000 ₫",
  "Đêm nhạc acoustic nào đang mở bán?",
  "Sự kiện ở Đà Nẵng có gì?",
  "Có sự kiện của Suboi không?",
  "Làm sao để mua vé?",
  "Tôi có thể hủy vé không?",
];

const removeDiacritics = (text) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

const normalize = (text) => removeDiacritics(text).toLowerCase();

const now = () => new Date();

const eventDateTime = (event) => new Date(`${event.date}T${event.time}:00`);

const isUpcoming = (event) => eventDateTime(event) >= now() && event.status !== "ended";

const upcomingWeekendRange = () => {
  const today = now();
  const day = today.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  saturday.setHours(0, 0, 0, 0);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 0);
  return [saturday, sunday];
};

const findCity = (text) => {
  const t = normalize(text);
  if (/(ho chi minh|hcm|sai gon|saigon)/.test(t)) return "hcm";
  if (/(ha noi|hanoi)/.test(t)) return "hn";
  if (/(da nang|danang)/.test(t)) return "dn";
  if (/(can tho|cantho)/.test(t)) return "ct";
  if (/(hai phong|haiphong)/.test(t)) return "hp";
  if (/\bhue\b/.test(t)) return "hue";
  return null;
};

const findCategory = (text) => {
  const t = normalize(text);
  if (/(edm|electronic|house|techno|club)/.test(t)) return "edm";
  if (/(indie)/.test(t)) return "indie";
  if (/(acoustic|unplugged)/.test(t)) return "acoustic";
  if (/(rap|hip hop|hiphop)/.test(t)) return "rap";
  if (/(festival|le hoi)/.test(t)) return "festival";
  if (/(rock|metal)/.test(t)) return "live";
  if (/(live|concert|hoa nhac|nhac song)/.test(t)) return "live";
  return null;
};

const findBudget = (text) => {
  const t = normalize(text).replace(/\./g, "").replace(/,/g, "");
  const million = t.match(/(\d+(?:\.\d+)?)\s*trieu/);
  if (million) return Math.round(Number(million[1]) * 1000000);
  const thousand = t.match(/(\d+)\s*k\b/);
  if (thousand) return Number(thousand[1]) * 1000;
  const plain = t.match(/(\d{4,})/);
  if (plain) return Number(plain[1]);
  return null;
};

const formatPrice = (value) => `${value.toLocaleString("vi-VN")} ₫`;

const locationName = (id) => locations.find((location) => location.id === id)?.name || "";

const categoryName = (id) => categories.find((category) => category.id === id)?.name || "";

// Ghép tên nghệ sĩ từ dữ liệu sự kiện để AI hiểu cả câu hỏi kiểu “có show của Suboi không?”.
const cleanForMatch = (value) =>
  normalize(value).replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const artistNames = Array.from(
  new Set(
    events.flatMap((event) =>
      String(event.artist || "")
        .split(/[,/&]| và |\bft\.?\b|\bfeat\.?\b/i)
        .map((name) => name.trim())
        .filter((name) => cleanForMatch(name).length >= 3),
    ),
  ),
);

const findArtists = (text) => {
  const padded = ` ${cleanForMatch(text)} `;
  return artistNames.filter((name) => {
    const needle = cleanForMatch(name);
    return new RegExp(`(^|\\s)${escapeRegex(needle)}(\\s|$)`).test(padded);
  });
};

const matchesArtist = (event, artists) => {
  if (artists.length === 0) return true;
  const haystack = cleanForMatch(event.artist || "");
  return artists.some((name) => {
    const needle = cleanForMatch(name);
    return needle.length >= 3 && haystack.includes(needle);
  });
};

const pickEvents = ({ city, category, budget, artists = [], weekendOnly, limit = 3 }) => {
  let result = events.filter((event) => isUpcoming(event));
  if (city) result = result.filter((event) => event.locationId === city);
  if (category) result = result.filter((event) => event.category === category);
  if (budget) result = result.filter((event) => event.priceFrom <= budget);
  if (artists.length > 0) result = result.filter((event) => matchesArtist(event, artists));
  if (weekendOnly) {
    const [saturday, sunday] = upcomingWeekendRange();
    result = result.filter((event) => {
      const date = eventDateTime(event);
      return date >= saturday && date <= sunday;
    });
  }
  return result.sort((a, b) => eventDateTime(a) - eventDateTime(b)).slice(0, limit);
};

const buildReply = (text, eventList) => {
  if (eventList.length === 0) {
    return "Mình chưa tìm thấy sự kiện nào khớp với yêu cầu đó. Bạn thử đổi địa điểm, thể loại, tên nghệ sĩ hoặc mức giá xem sao. Bạn cũng có thể bấm “Xem tất cả sự kiện” để tự lọc.";
  }
  if (eventList.length === 1) {
    const event = eventList[0];
    return `${event.name} — ${event.artist} — là lựa chọn phù hợp. Sự kiện diễn ra lúc ${event.time} ngày ${event.date.split("-").reverse().join("/")} tại ${event.venue}, ${locationName(event.locationId)}. Giá vé từ ${formatPrice(event.priceFrom)}.`;
  }
  const names = eventList.map((event) => event.name).join(", ");
  return `Mình tìm thấy ${eventList.length} sự kiện phù hợp: ${names}. Bạn xem thẻ gợi ý bên dưới để biết giá và địa điểm nhé.`;
};

export const getChatbotReply = (message) => {
  const text = message.trim();
  const t = normalize(text);
  const artists = findArtists(text);

  if (!text) {
    return {
      text: "Bạn muốn tìm sự kiện ở thành phố nào, theo thể loại hay tên nghệ sĩ nào?",
      eventIds: [],
    };
  }

  // Câu hỏi về cách mua vé / thanh toán
  if (/(mua ve|dat ve|thanh toan|payment|checkout|quy trinh)/.test(t)) {
    return {
      text:
        "Để mua vé: chọn sự kiện → chọn khu vực hoặc ghế → bấm “Tiếp tục”. Ở bước thanh toán, bạn điền thông tin, chọn phương thức (MoMo, VNPay, thẻ hoặc chuyển khoản) rồi xác nhận. Hệ thống giữ chỗ 10 phút trong lúc bạn thanh toán.",
      eventIds: [],
      links: [{ label: "Xem sự kiện đang mở bán", to: "/events" }],
    };
  }

  // Hủy vé / hoàn tiền
  if (/(huy ve|huy|hoan tien|refund|cancel)/.test(t)) {
    return {
      text:
        "Bạn có thể hủy vé trước 48 giờ so với giờ diễn tại trang “Vé của tôi”. Phí hủy là 20% giá trị vé; tiền hoàn về trong 3–5 ngày làm việc. Vé đã dùng hoặc đã qua giờ diễn thì không hủy được.",
      eventIds: [],
      links: [{ label: "Mở Vé của tôi", to: "/my-tickets" }],
    };
  }

  // Hỏi địa điểm của một sự kiện cụ thể
  if (/(o dau|dia chi|where|cho nao|vi tri)/.test(t)) {
    const city = findCity(text);
    const found = city || artists.length > 0
      ? events
          .filter(
            (event) =>
              (!city || event.locationId === city) &&
              matchesArtist(event, artists) &&
              isUpcoming(event),
          )
          .slice(0, 2)
      : [];
    if (found.length > 0) {
      const first = found[0];
      return {
        text: `${first.name} (${first.artist}) diễn ra tại ${first.venue}, ${first.address}. Bạn có thể xem bản đồ ở phần cuối trang chi tiết sự kiện.`,
        eventIds: found.map((event) => event.id),
      };
    }
    return {
      text: "Bạn đang hỏi địa điểm của sự kiện nào? Bạn gửi tên sự kiện, tên nghệ sĩ hoặc thành phố giúp mình nhé.",
      eventIds: [],
    };
  }

  const city = findCity(text);
  const category = findCategory(text);
  const budget = findBudget(text);
  const weekendOnly = /(cuoi tuan|weekend|thu 7|chu nhat)/.test(t) || /(tuan nay|this week)/.test(t);
  const eventList = pickEvents({ city, category, budget, artists, weekendOnly });

  // Câu chào
  if (/(xin chao|chao|hello|hi\b|hey)/.test(t) && !city && !category && !budget && artists.length === 0) {
    return {
      text:
        "Chào bạn! Mình là trợ lý của Soundpass. Bạn có thể hỏi mình về sự kiện theo thành phố, thể loại, tên nghệ sĩ, mức giá, hoặc cách mua và hủy vé.",
      eventIds: [],
    };
  }

  // Câu hỏi tìm sự kiện
  if (city || category || budget || artists.length > 0 || weekendOnly || /(su kien|event|concert|nhac|goi y|tim|co gi)/.test(t)) {
    const filters = [];
    if (city) filters.push(`ở ${locationName(city)}`);
    if (category) filters.push(`thể loại ${categoryName(category)}`);
    if (artists.length > 0) filters.push(`nghệ sĩ ${artists.join(", ")}`);
    if (budget) filters.push(`giá dưới ${formatPrice(budget)}`);
    if (weekendOnly) filters.push("vào cuối tuần");
    const intro = filters.length > 0 ? `Mình tìm sự kiện ${filters.join(", ")}. ` : "";
    return {
      text: intro + buildReply(text, eventList),
      eventIds: eventList.map((event) => event.id),
    };
  }

  // Mặc định
  return {
    text:
      "Mình có thể giúp bạn tìm sự kiện theo thành phố, thể loại, tên nghệ sĩ và mức giá; giải thích cách mua vé và chính sách hủy vé. Bạn thử hỏi: “Cuối tuần này có gì ở Đà Nẵng?” hoặc “Có show của Suboi không?”",
    eventIds: [],
    links: [{ label: "Xem tất cả sự kiện", to: "/events" }],
  };
};
