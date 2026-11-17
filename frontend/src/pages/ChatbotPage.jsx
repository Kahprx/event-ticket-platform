import { ArrowRight, CircleHelp, Info, MessageSquareText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { suggestedQuestions } from "../data/chatbot.js";
import { useChatStore } from "../store/chatStore.js";
import ChatbotWindow from "../components/ChatbotWindow.jsx";

export default function ChatbotPage() {
  const send = useChatStore((state) => state.send);
  const pending = useChatStore((state) => state.pending);

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
          <Sparkles size={13} />
          Trợ lý Soundpass
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-extrabold text-ink-900 sm:text-[30px]">
          Hỏi trợ lý để tìm sự kiện nhanh hơn
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-muted">
          Trợ lý tìm theo thành phố, thể loại, mức giá và ngày diễn; đồng thời giải đáp các câu hỏi
          về cách mua vé, thanh toán và hủy vé. Câu trả lời được tạo từ dữ liệu sự kiện trong demo,
          nên đôi khi sẽ cần bạn kiểm tra lại thông tin trên trang chi tiết.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <ChatbotWindow inline />

        <aside className="space-y-4">
          <div className="card p-4">
            <p className="flex items-center gap-2 text-[13px] font-bold text-ink-900">
              <CircleHelp size={16} className="text-accent" />
              Gợi ý câu hỏi
            </p>
            <p className="mt-1 text-[12px] text-muted">Bấm để hỏi ngay.</p>
            <div className="mt-3 space-y-1.5">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={pending}
                  onClick={() => send(question)}
                  className="flex w-full items-start gap-2 rounded-md border border-line px-2.5 py-2 text-left text-[12px] leading-5 text-ink-800 hover:border-[#cfc8ba] hover:bg-paper disabled:opacity-50"
                >
                  <MessageSquareText size={13} className="mt-0.5 shrink-0 text-muted-2" />
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4 text-[12px] leading-6 text-muted">
            <p className="flex items-center gap-2 text-[13px] font-bold text-ink-900">
              <Info size={16} className="text-ink-600" />
              Trợ lý có thể giúp gì?
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Gợi ý sự kiện theo khu vực và ngân sách.</li>
              <li>Tìm đêm nhạc cuối tuần.</li>
              <li> Cho biết giá vé, địa điểm, thời gian.</li>
              <li>Hướng dẫn quy trình đặt và hủy vé.</li>
            </ul>
            <p className="mt-3 border-t border-line pt-3 text-[11px] text-muted-2">
              Trợ lý không thay thế được thông tin từ ban tổ chức. Luôn kiểm tra trang chi tiết
              sự kiện trước khi thanh toán.
            </p>
          </div>

          <Link to="/events" className="btn btn-secondary btn-block">
            Tự xem tất cả sự kiện
            <ArrowRight size={14} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
