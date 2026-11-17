import { useMemo, useState } from "react";
import { Bot, Eye, Search } from "lucide-react";
import { chatbotLogs } from "../../data/admin.js";
import Modal from "../../components/Modal.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { AdminCard, AdminPageHeader, TableShell } from "./AdminParts.jsx";

export default function AdminChatbotPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return chatbotLogs.filter((log) => {
      const matchQuery = !keyword || `${log.user} ${log.topic} ${log.id}`.toLowerCase().includes(keyword);
      const matchFilter = filter === "all" || (filter === "resolved" ? log.resolved : !log.resolved);
      return matchQuery && matchFilter;
    });
  }, [query, filter]);

  const resolvedCount = chatbotLogs.filter((log) => log.resolved).length;
  const totalMessages = chatbotLogs.reduce((sum, log) => sum + log.messages, 0);

  return (
    <>
      <AdminPageHeader
        eyebrow="AI hỗ trợ"
        title="Nhật ký chatbot"
        description="Xem lại các cuộc hội thoại để cải thiện câu trả lời của trợ lý."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-[12px] text-muted">Cuộc hội thoại</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{chatbotLogs.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[12px] text-muted">Đã giải quyết</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">
            {resolvedCount}/{chatbotLogs.length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[12px] text-muted">Tổng tin nhắn</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{totalMessages}</p>
        </div>
      </div>

      <div className="mt-5">
        <AdminCard title="Cuộc hội thoại gần đây" bodyClassName="">
          <div className="flex flex-wrap gap-2 border-b border-line p-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
              <input
                className="input h-9 pl-9"
                placeholder="Tìm theo ID, người dùng, chủ đề..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select className="select h-9 w-auto" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Lọc theo kết quả">
              <option value="all">Tất cả</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="unresolved">Chưa giải quyết</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="p-4"><EmptyState icon={Bot} title="Không có cuộc hội thoại" description="Thử đổi điều kiện lọc." /></div>
          ) : (
            <TableShell head={["ID", "Người dùng", "Chủ đề", "Bắt đầu", "Tin nhắn", "Kết quả", ""]}>
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-paper/60">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-muted">{log.id}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-ink-900">{log.user}</td>
                  <td className="px-4 py-3 text-muted">{log.topic}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[12px] text-muted">{log.startedAt}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{log.messages}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`badge ${log.resolved ? "badge-success" : "badge-warning"}`}>
                      {log.resolved ? "Đã giải quyết" : "Chưa xong"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setSelected(log)} className="btn btn-ghost btn-sm px-2" aria-label={`Xem ${log.id}`}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </TableShell>
          )}
        </AdminCard>
      </div>

      <Modal
        open={Boolean(selected)}
        title="Nội dung hội thoại"
        description={selected ? `${selected.id} · ${selected.user} · ${selected.startedAt}` : ""}
        size="lg"
        onClose={() => setSelected(null)}
        footer={<button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>Đóng</button>}
      >
        {selected && (
          <div className="space-y-3">
            {selected.transcript.map((message, index) => (
              <div key={index} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-5 ${
                    message.from === "user" ? "bg-accent text-white" : "border border-line bg-paper text-ink-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {!selected.resolved && (
              <p className="rounded-md bg-warning-soft px-3 py-2 text-[12px] text-warning">
                Cuộc hội thoại này chưa có kết quả cuối. Cần nhân viên hỗ trợ theo dõi thêm.
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
