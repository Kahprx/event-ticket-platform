import { MessageCircle, Sparkles } from "lucide-react";
import { useChatStore } from "../store/chatStore.js";

export default function ChatbotButton() {
  const open = useChatStore((state) => state.open);
  const toggle = useChatStore((state) => state.toggle);

  if (open) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-ink-900 py-2.5 pl-2.5 pr-3.5 text-white shadow-pop transition hover:bg-ink-800 sm:bottom-6 sm:right-6 sm:py-3 sm:pl-3 sm:pr-4"
      aria-label="Mở trợ lý AI"
    >
      <span className="relative grid h-7 w-7 place-items-center rounded-full bg-accent">
        <MessageCircle size={15} />
        <Sparkles size={9} className="absolute -right-0.5 -top-0.5 text-white" />
      </span>
      <span className="text-[13px] font-semibold">Hỏi trợ lý</span>
    </button>
  );
}
