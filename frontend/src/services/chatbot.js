import { api } from "./api.js";

// Gọi luồng RAG ở backend. Backend trả về { text, eventIds, artist, topics, sources, mode }.
export async function askChatbot(message, history = []) {
  const { data } = await api.post("/chatbot/ask", { message, history });
  return data.data;
}
