import { useState } from "react";
import { Edit2, MapPin, Plus } from "lucide-react";
import { events, locations as initialLocations } from "../../data/events.js";
import { useAppStore } from "../../store/appStore.js";
import Modal from "../../components/Modal.jsx";
import { AdminCard, AdminPageHeader, TableShell } from "./AdminParts.jsx";

export default function AdminLocationsPage() {
  const pushToast = useAppStore((state) => state.pushToast);
  const [rows, setRows] = useState(initialLocations);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", shortName: "", region: "" });
  const [error, setError] = useState("");

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", shortName: "", region: "" });
    setError("");
    setOpen(true);
  };

  const openEdit = (location) => {
    setEditingId(location.id);
    setForm({ name: location.name, shortName: location.shortName, region: location.region });
    setError("");
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      setError("Nhập tên khu vực.");
      return;
    }
    if (editingId) {
      setRows((current) => current.map((location) => (
        location.id === editingId ? { ...location, ...form } : location
      )));
      pushToast({ type: "success", title: "Đã cập nhật khu vực", message: form.name });
    } else {
      const id = form.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || `loc-${Date.now()}`;
      setRows((current) => [...current, { id, ...form, lat: 0, lng: 0 }]);
      pushToast({ type: "success", title: "Đã thêm khu vực", message: form.name });
    }
    setOpen(false);
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Cấu hình"
        title="Địa điểm & khu vực"
        description="Danh sách thành phố hiển thị trong bộ lọc và thanh chọn khu vực."
        actions={[
          <button key="add" type="button" onClick={openCreate} className="btn btn-primary btn-sm">
            <Plus size={14} />
            Thêm khu vực
          </button>,
        ]}
      />

      <AdminCard title={`${rows.length} khu vực đang hỗ trợ`} bodyClassName="">
        <TableShell head={["Khu vực", "Tên ngắn", "Miền", "Sự kiện", "Thao tác"]}>
          {rows.map((location) => {
            const count = events.filter((event) => event.locationId === location.id && event.status !== "ended").length;
            return (
              <tr key={location.id} className="hover:bg-paper/60">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 font-semibold text-ink-900">
                    <span className="grid h-8 w-8 place-items-center rounded-md bg-ink-900 text-white">
                      <MapPin size={14} />
                    </span>
                    {location.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{location.shortName}</td>
                <td className="px-4 py-3 text-muted">{location.region}</td>
                <td className="px-4 py-3 text-muted">{count} sự kiện</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => openEdit(location)} className="btn btn-ghost btn-sm px-2" aria-label={`Sửa ${location.name}`}>
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </TableShell>
      </AdminCard>

      <div className="mt-4 rounded-lg border border-line bg-white p-4 text-[12px] leading-6 text-muted">
        <p className="font-semibold text-ink-900">Lưu ý khi thêm khu vực mới</p>
        <p className="mt-1">
          Khu vực mới sẽ xuất hiện trong bộ lọc ngay sau khi lưu. Để hiển thị sự kiện, cần tạo sự kiện
          gắn với khu vực đó từ trang Quản lý sự kiện. Tọa độ bản đồ cần được cập nhật bởi quản trị viên.
        </p>
      </div>

      <Modal
        open={open}
        title={editingId ? "Chỉnh sửa khu vực" : "Thêm khu vực"}
        size="sm"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>Hủy</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={save}>Lưu</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="field">
            <label className="field-label" htmlFor="loc-name">Tên khu vực</label>
            <input id="loc-name" className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="TP. Hồ Chí Minh" />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="loc-short">Tên ngắn</label>
            <input id="loc-short" className="input" value={form.shortName} onChange={(event) => setForm({ ...form, shortName: event.target.value })} placeholder="Hồ Chí Minh" />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="loc-region">Miền</label>
            <select id="loc-region" className="select" value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })}>
              <option value="Miền Bắc">Miền Bắc</option>
              <option value="Miền Trung">Miền Trung</option>
              <option value="Miền Nam">Miền Nam</option>
            </select>
          </div>
          {error && <p className="field-error">{error}</p>}
        </div>
      </Modal>
    </>
  );
}
