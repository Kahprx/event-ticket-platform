import { create } from "zustand";
import { getChatbotReply } from "../data/chatbot.js";
import { askChatbot } from "../services/chatbot.js";

let messageId = 0;

const welcomeMessage = {
  id: ++messageId,
  from: "bot",
  text: "Chào bạn! Mình là trợ lý của Soundpass. Bạn muốn tìm sự kiện theo thành phố, thể loại hay mức giá nào?",
  eventIds: [],
};

export const useChatStore = create((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),

  messages: [welcomeMessage],
  pending: false,

  send: async (rawText) => {
    const text = String(rawText || "").trim();
    if (!text || get().pending) return;

    const userMessage = { id: ++messageId, from: "user", text };
    set((state) => ({ messages: [...state.messages, userMessage], pending: true }));

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new Error("offline");
      }
      const history = get()
        .messages.filter((item) => item.from === "user" || item.from === "bot")
        .slice(-8)
        .map((item) => ({
          role: item.from === "user" ? "user" : "assistant",
          text: item.text,
          ...(item.artist ? { artist: item.artist } : {}),
        }));

      let reply;
      try {
        reply = await askChatbot(text, history);
      } catch (apiError) {
        // Backend chưa chạy thì vẫn dùng fallback local để demo không bị chết.
        console.warn("[chatbot] API unavailable, dùng fallback local:", apiError.message);
        reply = { ...getChatbotReply(text), mode: "fallback" };
      }
      set((state) => ({
        messages: [...state.messages, { id: ++messageId, from: "bot", ...reply }],
        pending: false,
      }));
    } catch {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: ++messageId,
            from: "bot",
            text: "Mình chưa gửi được câu trả lời. Bạn kiểm tra kết nối mạng rồi thử lại nhé.",
            eventIds: [],
            isError: true,
            retryText: text,
          },
        ],
        pending: false,
      }));
    }
  },

  reset: () => set({ messages: [welcomeMessage], pending: false }),
}));
