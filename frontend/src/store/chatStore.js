import { create } from "zustand";
import { getChatbotReply } from "../data/chatbot.js";

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
      // Độ trễ nhỏ để người dùng thấy trạng thái "đang trả lời".
      await new Promise((resolve) => setTimeout(resolve, 650));
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new Error("offline");
      }
      const reply = getChatbotReply(text);
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
