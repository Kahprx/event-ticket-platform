import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { getEventById } from "../data/events.js";
import { useChatStore } from "../store/chatStore.js";
import RecommendationCard from "./RecommendationCard.jsx";

export default function ChatMessage({ message }) {
  const setOpen = useChatStore((state) => state.setOpen);

  // Đọc action lúc bấm nút để selector luôn trả về cùng một giá trị ổn định.
  const retry = (text) => {
    const { retry: retryAction, send } = useChatStore.getState();
    if (retryAction) retryAction(text);
    else send(text);
  };

  if (message.from === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3 py-2 text-[13px] leading-5 text-white">
          {message.text}
        </div>
      </div>
    );
  }

  const events = (message.eventIds || []).map((id) => getEventById(id)).filter(Boolean);

  return (
    <div className="flex gap-2">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-900 text-white">
        <Sparkles size={13} />
      </span>
      <div className="min-w-0 max-w-[88%]">
        <div
          className={`rounded-2xl rounded-tl-md border px-3 py-2 text-[13px] leading-5 ${
            message.isError
              ? "border-danger/25 bg-danger-soft text-danger"
              : "border-line bg-white text-ink-800"
          }`}
        >
          {message.text}
        </div>

        {events.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-2">Sự kiện gợi ý</p>
            {events.map((event) => (
              <RecommendationCard key={event.id} event={event} onSelect={() => setOpen(false)} />
            ))}
          </div>
        )}

        {(message.links || []).map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-[12px] font-semibold text-ink-800 hover:border-[#c9c2b4]"
          >
            {link.label}
            <ArrowRight size={12} />
          </Link>
        ))}

        {message.isError && message.retryText && (
          <button
            type="button"
            onClick={() => retry(message.retryText)}
            className="mt-1.5 text-[12px] font-semibold text-danger underline underline-offset-2"
          >
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
}
