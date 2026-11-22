import { env } from "../../config/env.js";
import {
  allEvents,
  compact,
  eventContext,
  formatDate,
  formatPrice,
  locationName,
  retrieve,
} from "./knowledge.js";

const reply = (text, extra = {}) => ({
  text,
  eventIds: [],
  artist: null,
  topics: [],
  intent: "static",
  sources: [],
  ...extra,
});

const STATIC = {
  buy: reply(
    "Để mua vé: chọn sự kiện → chọn khu vực hoặc ghế → bấm “Tiếp tục”. Ở bước thanh toán, bạn điền họ tên, email, số điện thoại rồi chọn phương thức (MoMo, VNPay, thẻ hoặc chuyển khoản) và xác nhận. Hệ thống giữ chỗ 10 phút trong lúc thanh toán.",
    { links: [{ label: "Xem sự kiện đang mở bán", to: "/events" }] },
  ),
  cancel: reply(
    "Bạn có thể hủy vé trước 48 giờ so với giờ diễn tại trang “Vé của tôi”. Phí hủy là 20% giá trị vé; tiền hoàn về trong 3–5 ngày làm việc. Vé đã dùng hoặc đã qua giờ diễn thì không hủy được.",
    { links: [{ label: "Mở Vé của tôi", to: "/my-tickets" }] },
  ),
  greeting: reply(
    "Chào bạn! Mình là trợ lý của Soundpass. Mình có thể cho biết ca sĩ đang diễn ở đâu, lịch diễn và mấy giờ, giá vé, hoặc hướng dẫn đặt/hủy vé.",
  ),
  offtopic: reply(
    "Mình là trợ lý Soundpass, chỉ hỗ trợ thông tin sự kiện, ca sĩ, lịch diễn, địa điểm, giờ diễn, giá vé và quy trình đặt/hủy vé. Bạn thử hỏi ví dụ: “Suboi có lịch diễn ở đâu và mấy giờ?” nhé.",
    { intent: "offtopic" },
  ),
  empty: reply("Bạn muốn hỏi về ca sĩ, sự kiện hay lịch diễn nào? Mình sẵn sàng hỗ trợ.", { intent: "help" }),
};

function buildEventAnswer(query, retrieval) {
  const { artists, topics, events, slots, allUpcomingCount } = retrieval;
  const artistLabel = artists.join(", ");
  const hasArtistFilter = artists.length > 0;
  const hasEventFilter = Boolean(slots.city || slots.category || slots.budget || slots.weekendOnly);

  // Hỏi về ca sĩ nhưng không có tên (và không có ngữ cảnh) thì hỏi lại thay vì gợi ý bừa.
  if (slots.askedArtist && !hasArtistFilter) {
    return reply(
      "Mình chưa thấy tên ca sĩ trong câu hỏi. Bạn gửi tên ca sĩ giúp mình để kiểm tra lịch diễn, địa điểm và giờ diễn nhé.",
      { intent: "event", links: [{ label: "Xem sự kiện đang mở bán", to: "/events" }] },
    );
  }

  // Chỉ trả lời static khi user không hỏi dữ liệu sự kiện, tránh "nhảy chủ đề".
  if (events.length === 0) {
    if (hasArtistFilter) {
      const past = allEvents.find((event) => {
        const ended = event.status === "ended" || new Date(`${event.date}T${event.time || "00:00"}:00`) < slots.now;
        const hasArtist = artists.some((artist) => compact(event.artist || "").includes(compact(artist)));
        return ended && hasArtist;
      });
      const suffix = past
        ? ` Trong dữ liệu có "${past.name}" vào ngày ${formatDate(past.date)}, nhưng sự kiện đó đã kết thúc.`
        : "";
      return reply(
        `Mình chưa thấy ${artistLabel || "ca sĩ bạn hỏi"} có lịch diễn sắp tới trong hệ thống Soundpass.${suffix} Bạn thử hỏi tên nghệ sĩ khác hoặc xem các sự kiện đang mở bán nhé.`,
        {
          artist: artistLabel,
          topics: Object.keys(topics).filter((key) => topics[key]),
          intent: "event",
          links: [{ label: "Xem tất cả sự kiện", to: "/events" }],
        },
      );
    }
    return reply(
      "Mình chưa tìm thấy sự kiện nào khớp với yêu cầu đó. Bạn thử đổi thành phố, thể loại, tên ca sĩ hoặc mức giá xem sao.",
      {
        topics: Object.keys(topics).filter((key) => topics[key]),
        intent: "event",
        links: [{ label: "Xem tất cả sự kiện", to: "/events" }],
      },
    );
  }

  const needsWhere = Boolean(topics.where || topics.schedule || (hasArtistFilter && (topics.exist || topics.when)));
  const needsWhen = Boolean(topics.when || topics.schedule || (hasArtistFilter && topics.exist));
  const needsPrice = Boolean(topics.price);
  const full = needsWhere && needsWhen;

  const lines = events.map((event, index) => {
    const pieces = [event.name];
    if (needsWhen) {
      pieces.push(`${formatDate(event.date)}, ${event.time}${event.endTime ? `–${event.endTime}` : ""}`);
    }
    if (needsWhere) {
      pieces.push(`tại ${event.venue}, ${locationName(event.locationId)}`);
      if (full && event.address) pieces.push(`(${event.address})`);
    }
    if (needsPrice) pieces.push(`giá từ ${formatPrice(event.priceFrom)}`);
    return `${index + 1}. ${pieces.join(" — ")}`;
  });

  let intro;
  if (hasArtistFilter) {
    const verb = topics.exist ? "góp mặt trong" : "có";
    intro = `Có, ${artistLabel} ${verb} ${events.length === 1 ? "1 sự kiện" : `${events.length} sự kiện`} trong hệ thống Soundpass.`;
  } else if (hasEventFilter) {
    intro = `Mình tìm thấy ${events.length === 1 ? "1 sự kiện phù hợp" : `${events.length} sự kiện phù hợp`}.`;
  } else {
    intro = "Mình gợi ý một số sự kiện đang mở bán:";
  }

  const note =
    topics.schedule && allUpcomingCount > events.length
      ? ` Mình liệt kê ${events.length} lịch diễn gần nhất trong tổng số ${allUpcomingCount} sự kiện tìm được.`
      : "";
  const closing = " Bạn bấm vào thẻ bên dưới để xem chi tiết và đặt vé nhé.";

  return reply(`${intro}\n${lines.join("\n")}${note}${closing}`, {
    eventIds: events.map((event) => event.id),
    artist: artistLabel || null,
    topics: Object.keys(topics).filter((key) => topics[key]),
    intent: "event",
    sources: events.map((event) => ({ type: "event", id: event.id, label: event.name })),
  });
}

function shouldUseLLM(answer) {
  return answer.intent === "event" && answer.eventIds.length > 0;
}

async function askGemini(query, retrieval) {
  const key = env.GEMINI_API_KEY;
  if (!key) return null;
  const context = retrieval.events.map(eventContext);
  const prompt = [
    "Bạn là trợ lý đặt vé Soundpass. CHỈ dùng thông tin trong CONTEXT để trả lời, tuyệt đối không bịa thêm sự kiện, ca sĩ, giờ hoặc địa điểm.",
    "Trả lời tiếng Việt, ngắn gọn, đúng đúng những gì người dùng hỏi (địa điểm, ngày, giờ, giá nếu có).",
    "Nếu context không có thông tin, hãy nói rõ là hệ thống chưa có thông tin đó.",
    `CÂU HỎI: ${query}`,
    `CONTEXT: ${JSON.stringify(context)}`,
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
      }),
      signal: AbortSignal.timeout(9000),
    },
  );
  if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  return text || null;
}

export async function answerQuestion({ message, history = [] } = {}) {
  const query = String(message || "").trim();
  if (!query) return { ...STATIC.empty, mode: "local" };

  const retrieval = retrieve({ message: query, history });
  const { topics, slots, artists } = retrieval;

  let grounded;
  if (topics.buy) grounded = STATIC.buy;
  else if (topics.cancel) grounded = STATIC.cancel;
  else if (topics.greeting && !artists.length && !slots.city && !slots.category && !slots.budget) grounded = STATIC.greeting;
  else if (!topics.isDomainRelated && !artists.length && !slots.city && !slots.category && !slots.budget) grounded = STATIC.offtopic;
  else grounded = buildEventAnswer(query, retrieval);

  if (!shouldUseLLM(grounded) || !env.GEMINI_API_KEY) return { ...grounded, mode: "local" };

  try {
    const generated = await askGemini(query, retrieval);
    if (generated) return { ...grounded, text: generated, mode: "llm" };
  } catch (error) {
    console.error("[chatbot] Gemini thất bại, dùng câu trả lời bám dữ liệu:", error.message);
  }
  return { ...grounded, mode: "local" };
}
