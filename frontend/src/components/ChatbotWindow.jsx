import { useEffect, useRef, useState } from "react";
import { RotateCcw, Send, Sparkles, X } from "lucide-react";
import { suggestedQuestions } from "../data/chatbot.js";
import { useChatStore } from "../store/chatStore.js";
import ChatMessage from "./ChatMessage.jsx";

export default function ChatbotWindow({ inline = false }) {
  const open = useChatStore((state) => state.open);
  const setOpen = useChatStore((state) => state.setOpen);
  const messages = useChatStore((state) => state.messages);
  const pending = useChatStore((state) => state.pending);
  const send = useChatStore((state) => state.send);
  const reset = useChatStore((state) => state.reset);

  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open || inline) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages, pending, open, inline]);

  useEffect(() => {
    if (open && !inline) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open, inline]);

  useEffect(() => {
    if (inline) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inline, setOpen]);

  if (!inline && !open) return null;

  const submit = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    send(draft);
    setDraft("");
  };

  const pickSuggestion = (question) => {
    send(question);
  };

  const panel = (
    <div
      className={`relative flex flex-col overflow-hidden bg-white ${
        inline
          ? "h-[560px] rounded-xl border border-line shadow-card"
          : "h-[85vh] w-full rounded-t-2xl shadow-pop sm:h-[580px] sm:w-[384px] sm:rounded-xl sm:border sm:border-line"
      }`}
    >
      <div className="flex items-center gap-2.5 border-b border-line bg-white px-3.5 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-white">
          <Sparkles size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink-900">Trợ lý Soundpass</p>
          <p className="flex items-center gap-1.5 text-[11px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Trả lời tự động · có thể sai sót
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-paper-2"
          aria-label="Bắt đầu cuộc trò chuyện mới"
          title="Cuộc trò chuyện mới"
        >
          <RotateCcw size={14} />
        </button>
        {!inline && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-paper-2"
            aria-label="Đóng trợ lý"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-paper/60 px-3 py-3">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {pending && (
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-900 text-white">
              <Sparkles size={13} />
            </span>
            <span className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-line bg-white px-3 py-2.5">
              <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-2" style={{ animationDelay: "0ms" }} />
              <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-2" style={{ animationDelay: "120ms" }} />
              <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-2" style={{ animationDelay: "240ms" }} />
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-line bg-white px-3 pb-3 pt-2">
        <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto">
          {suggestedQuestions.slice(0, 4).map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => pickSuggestion(question)}
              className="chip shrink-0 text-[11px]"
            >
              {question}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Hỏi về sự kiện, giá vé..."
            aria-label="Nhập câu hỏi cho trợ lý"
            className="input h-10 flex-1"
          />
          <button
            type="submit"
            disabled={!draft.trim() || pending}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-white hover:bg-accent-dark disabled:opacity-45"
            aria-label="Gửi câu hỏi"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );

  if (inline) return panel;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:inset-auto sm:bottom-24 sm:right-6 sm:block">
      <div
        className="absolute inset-0 bg-ink-950/40 sm:hidden"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-full sm:w-auto">{panel}</div>
    </div>
  );
}
