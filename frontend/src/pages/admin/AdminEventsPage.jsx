import { useMemo, useState } from "react";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { categories, events as initialEvents, locations } from "../../data/events.js";
import { formatDate, formatVnd } from "../../utils/format.js";
import { remainingTickets } from "../../utils/events.js";
import { useAppStore } from "../../store/appStore.js";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { AdminCard, AdminPageHeader, TableShell } from "./AdminParts.jsx";

const emptyForm = {
  name: "",
  artist: "",
  locationId: "hcm",
  category: "live",
  venue: "",
  date: "",
  time: "19:00",
  priceFrom: "",
  status: "on-sale",
};

export default function AdminEventsPage() {
  const pushToast = useAppStore((state) => state.pushToast);
  const [rows, setRows] = useState(initialEvents);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return rows.filter((event) => {
      const matchQuery = !keyword || `${event.name} ${event.artist} ${event.venue}`.toLowerCase().includes(keyword);
      const matchStatus = statusFilter === "all" || event.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [rows, query, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setEditorOpen(true);
  };

  const openEdit = (event) => {
    setEditingId(event.id);
    setForm({
      name: event.name,
      artist: event.artist,
      locationId: event.locationId,
      category: event.category,
      venue: event.venue,
      date: event.date,
      time: event.time,
      priceFrom: String(event.priceFrom),
      status: event.status,
    });
    setFormErrors({});
    setEditorOpen(true);
  };

  const save = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Nhập tên sự kiện.";
    if (!form.artist.trim()) errors.artist = "Nhập nghệ sĩ / performer.";
    if (!form.venue.trim()) errors.venue = "Nhập địa điểm diễn ra.";
    if (!form.date) errors.date = "Chọn ngày diễn.";
    if (!form.priceFrom || Number(form.priceFrom) <= 0) errors.priceFrom = "Nhập giá vé hợp lệ.";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      ...form,
      priceFrom: Number(form.priceFrom),
      priceTo: Number(form.priceFrom),
    };

    if (editingId) {
      setRows((current) => current.map((event) => (
        event.id === editingId
          ? {
              ...event,
              ...payload,
              ticketTypes: event.ticketTypes.map((type, index) =>
                index === 0 ? { ...type, price: payload.priceFrom } : type,
              ),
            }
          : event
      )));
      pushToast({ type: "success", title: "Đã cập nhật sự kiện", message: form.name });
    } else {
      setRows((current) => [
        {
          id: `event-${Date.now()}`,
          ...payload,
          address: payload.venue,
          endTime: "22:00",
          image: "",
          tone: "#1f3040",
          featured: false,
          capacity: 1000,
          sold: 0,
          rating: 0,
          tags: [],
          organizer: { name: "Ban tổ chức", description: "Đang cập nhật", phone: "", email: "" },
          description: ["Thông tin sự kiện đang được cập nhật."],
          highlights: [],
          seating: { type: "standing" },
          ticketTypes: [{ id: "ga", name: "Vé GA", price: payload.priceFrom, total: 1000, sold: 0, note: "Vé vào cửa" }],
        },
        ...current,
      ]);
      pushToast({ type: "success", title: "Đã tạo sự kiện", message: "Sự kiện mới ở trạng thái bản nháp." });
    }
    setEditorOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setRows((current) => current.filter((event) => event.id !== deleting.id));
    pushToast({ type: "success", title: "Đã xóa sự kiện", message: deleting.name });
    setDeleting(null);
  };

  const field = (name, label, props = {}) => (
    <div className="field">
      <label className="field-label" htmlFor={`event-${name}`}>{label}</label>
      <input
        id={`event-${name}`}
        className={`input ${formErrors[name] ? "border-danger" : ""}`}
        value={form[name]}
        onChange={(event) => setForm({ ...form, [name]: event.target.value })}
        {...props}
      />
      {formErrors[name] && <p className="field-error">{formErrors[name]}</p>}
    </div>
  );

  return (
    <>
      <AdminPageHeader
        eyebrow="Quản lý"
        title="Sự kiện"
        description={`${rows.length} sự kiện trong hệ thống. Có thể tạo, chỉnh sửa hoặc xóa bản ghi.`}
        actions={[
          <button key="add" type="button" onClick={openCreate} className="btn btn-primary btn-sm">
            <Plus size={14} />
            Tạo sự kiện
          </button>,
        ]}
      />

      <AdminCard title="Danh sách sự kiện" bodyClassName="">
        <div className="flex flex-wrap gap-2 border-b border-line p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
            <input
              className="input h-9 pl-9"
              placeholder="Tìm tên sự kiện, nghệ sĩ, địa điểm..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <select className="select h-9 w-auto" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Lọc theo trạng thái">
            <option value="all">Mọi trạng thái</option>
            <option value="on-sale">Đang mở bán</option>
            <option value="draft">Bản nháp</option>
            <option value="ended">Đã kết thúc</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={Search} title="Không có sự kiện phù hợp" description="Thử đổi từ khóa hoặc trạng thái lọc." />
          </div>
        ) : (
          <TableShell head={["Sự kiện", "Khu vực", "Ngày diễn", "Giá từ", "Vé còn", "Trạng thái", "Thao tác"]}>
            {filtered.map((event) => {
              const location = locations.find((item) => item.id === event.locationId);
              return (
                <tr key={event.id} className="hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink-900">{event.name}</p>
                    <p className="mt-0.5 max-w-[220px] truncate text-[11px] text-muted">{event.artist}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{location?.shortName || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(event.date)} · {event.time}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-ink-900">{formatVnd(event.priceFrom)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {event.seating?.type === "seated" ? "Theo ghế" : remainingTickets(event).toLocaleString("vi-VN")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={event.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => openEdit(event)} className="btn btn-ghost btn-sm px-2" aria-label={`Sửa ${event.name}`}>
                        <Edit2 size={14} />
                      </button>
                      <button type="button" onClick={() => setDeleting(event)} className="btn btn-ghost btn-sm px-2 text-danger hover:bg-danger-soft" aria-label={`Xóa ${event.name}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </TableShell>
        )}
      </AdminCard>

      {/* Tạo / chỉnh sửa */}
      <Modal
        open={editorOpen}
        title={editingId ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
        description="Các trường có dấu * là bắt buộc."
        size="lg"
        onClose={() => setEditorOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditorOpen(false)}>Hủy</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={save}>Lưu sự kiện</button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{field("name", "Tên sự kiện *")}</div>
          <div className="sm:col-span-2">{field("artist", "Nghệ sĩ / performer *")}</div>
          <div className="field">
            <label className="field-label" htmlFor="event-locationId">Khu vực</label>
            <select id="event-locationId" className="select" value={form.locationId} onChange={(event) => setForm({ ...form, locationId: event.target.value })}>
              {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="event-category">Thể loại</label>
            <select id="event-category" className="select" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              {categories.filter((item) => item.id !== "all").map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">{field("venue", "Địa điểm diễn ra *")}</div>
          <div>{field("date", "Ngày diễn *", { type: "date" })}</div>
          <div>{field("time", "Giờ bắt đầu", { type: "time" })}</div>
          <div>{field("priceFrom", "Giá vé thấp nhất (VND) *", { type: "number", min: "0" })}</div>
          <div className="field">
            <label className="field-label" htmlFor="event-status">Trạng thái</label>
            <select id="event-status" className="select" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="on-sale">Đang mở bán</option>
              <option value="draft">Bản nháp</option>
              <option value="ended">Đã kết thúc</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Xác nhận xóa */}
      <Modal
        open={Boolean(deleting)}
        title="Xóa sự kiện này?"
        description="Hành động này không thể hoàn tác."
        size="sm"
        onClose={() => setDeleting(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDeleting(null)}>Giữ lại</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={confirmDelete}>Xóa sự kiện</button>
          </>
        }
      >
        {deleting && (
          <p className="text-[13px] leading-6 text-muted">
            Bạn đang xóa <strong className="text-ink-900">{deleting.name}</strong>. Các vé và đơn hàng
            liên quan trong bản demo sẽ không bị xóa theo.
          </p>
        )}
      </Modal>
    </>
  );
}
