import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2 } from "lucide-react";
import { adminRoles } from "../../data/admin.js";
import { adminApi, apiMessage } from "../../services/adminApi.js";
import { mapRole } from "../../utils/adminResource.js";
import { useAppStore } from "../../store/appStore.js";
import Modal from "../../components/Modal.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { AdminCard, AdminPageHeader, TableShell } from "./AdminParts.jsx";

const emptyForm = { key: "", name: "", description: "", permissionsText: "" };

export default function AdminRolesPage() {
  const pushToast = useAppStore((state) => state.pushToast);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listRoles();
      setRoles(data.map(mapRole));
      setOffline(false);
    } catch {
      setRoles(adminRoles.map(mapRole));
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return roles;
    return roles.filter((role) => `${role.key} ${role.name} ${role.description}`.toLowerCase().includes(keyword));
  }, [roles, query]);

  const openCreate = () => {
    setForm(emptyForm);
    setError(null);
    setDialog({ type: "create" });
  };

  const openEdit = (role) => {
    setForm({
      key: role.key,
      name: role.name,
      description: role.description,
      permissionsText: role.permissions.join(", "),
    });
    setError(null);
    setDialog({ type: "edit", role });
  };

  const openDelete = (role) => {
    setError(null);
    setDialog({ type: "delete", role });
  };

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const permissions = form.permissionsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      permissions,
    };
    if (dialog.type === "create") payload.key = form.key.trim();

    setSaving(true);
    setError(null);
    try {
      const saved = dialog.type === "create"
        ? await adminApi.createRole(payload)
        : await adminApi.updateRole(dialog.role.key, payload);
      const next = mapRole(saved);
      setRoles((current) => dialog.type === "create"
        ? [next, ...current]
        : current.map((role) => (role.key === next.key ? next : role)));
      pushToast({ type: "success", title: "Đã lưu vai trò", message: `${next.name} đã được cập nhật.` });
      setDialog(null);
    } catch (requestError) {
      setError(apiMessage(requestError));
      pushToast({ type: "error", title: "Chưa lưu được", message: apiMessage(requestError) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError(null);
    try {
      await adminApi.deleteRole(dialog.role.key);
      setRoles((current) => current.filter((role) => role.key !== dialog.role.key));
      pushToast({ type: "success", title: "Đã xoá vai trò", message: `${dialog.role.key} đã bị xoá.` });
      setDialog(null);
    } catch (requestError) {
      setError(apiMessage(requestError));
      pushToast({ type: "error", title: "Chưa xoá được", message: apiMessage(requestError) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Hệ thống"
        title="Vai trò"
        description="Định nghĩa quyền truy cập cho tài khoản trong hệ thống."
        actions={[
          <button key="refresh" type="button" onClick={load} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} />
            Làm mới
          </button>,
          <button key="create" type="button" onClick={openCreate} className="btn btn-primary btn-sm">
            <Plus size={14} />
            Tạo vai trò
          </button>,
        ]}
      />

      {offline && (
        <p className="mb-4 rounded-md border border-warning/30 bg-warning-soft px-3 py-2.5 text-[12px] text-warning">
          Không kết nối được API. Đang hiển thị dữ liệu mẫu; các thao tác sửa/xoá cần backend.
        </p>
      )}

      <AdminCard title="Danh sách vai trò" description={`${filtered.length} / ${roles.length} vai trò`} bodyClassName="">
        <div className="flex flex-wrap gap-2 border-b border-line p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
            <input
              className="input h-9 pl-9"
              placeholder="Tìm khoá hoặc tên vai trò..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[13px] text-muted">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4"><EmptyState icon={Search} title="Không tìm thấy vai trò" description="Thử đổi từ khoá tìm kiếm." /></div>
        ) : (
          <TableShell head={["Khoá", "Tên vai trò", "Mô tả", "Quyền", "Người dùng", "Thao tác"]}>
            {filtered.map((role) => (
              <tr key={role.key} className="hover:bg-paper/60">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-ink-900">{role.key}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-accent" />
                    <span className="font-semibold text-ink-900">{role.name}</span>
                    {role.isSystem && <span className="badge badge-neutral">Hệ thống</span>}
                  </div>
                </td>
                <td className="max-w-[280px] px-4 py-3 text-muted">{role.description || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <span key={permission} className="badge badge-neutral">{permission}</span>
                    ))}
                    {role.permissions.length > 3 && <span className="text-[11px] text-muted">+{role.permissions.length - 3}</span>}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{role.userCount}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(role)} className="btn btn-ghost btn-sm px-2" title="Sửa" aria-label="Sửa">
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDelete(role)}
                      disabled={role.isSystem || role.userCount > 0}
                      title={role.isSystem ? "Không thể xoá vai trò hệ thống" : role.userCount > 0 ? "Vai trò đang có người dùng" : "Xoá"}
                      aria-label="Xoá"
                      className="btn btn-ghost btn-sm px-2 text-danger disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </AdminCard>

      <Modal
        open={dialog?.type === "create" || dialog?.type === "edit"}
        title={dialog?.type === "create" ? "Tạo vai trò" : "Cập nhật vai trò"}
        description="Quyền được nhập dưới dạng danh sách cách nhau bằng dấu phẩy."
        onClose={() => setDialog(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDialog(null)}>Hủy</button>
            <button type="submit" form="role-form" disabled={saving} className="btn btn-primary btn-sm">
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </>
        }
      >
        {error && <p className="mb-3 rounded-md bg-danger-soft px-3 py-2 text-[12px] text-danger">{error}</p>}
        <form id="role-form" onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="field">
            <label className="field-label" htmlFor="role-key">Khoá vai trò</label>
            <input
              id="role-key"
              className="input font-mono uppercase"
              value={form.key}
              onChange={(event) => setField("key", event.target.value)}
              disabled={dialog?.type === "edit"}
              required
              placeholder="STAFF"
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="role-name">Tên hiển thị</label>
            <input id="role-name" className="input" value={form.name} onChange={(event) => setField("name", event.target.value)} required minLength={2} />
          </div>
          <div className="field sm:col-span-2">
            <label className="field-label" htmlFor="role-description">Mô tả</label>
            <input id="role-description" className="input" value={form.description} onChange={(event) => setField("description", event.target.value)} />
          </div>
          <div className="field sm:col-span-2">
            <label className="field-label" htmlFor="role-permissions">Quyền</label>
            <textarea
              id="role-permissions"
              className="input min-h-[90px] py-2"
              value={form.permissionsText}
              onChange={(event) => setField("permissionsText", event.target.value)}
              placeholder="event:read, order:write, report:read"
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={dialog?.type === "delete"}
        title="Xoá vai trò?"
        description="Chỉ xoá được vai trò không có tài khoản sử dụng."
        size="sm"
        onClose={() => setDialog(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDialog(null)}>Hủy</button>
            <button type="button" disabled={saving} onClick={handleDelete} className="btn btn-danger btn-sm">
              {saving ? "Đang xoá..." : "Xác nhận xoá"}
            </button>
          </>
        }
      >
        {error && <p className="mb-3 rounded-md bg-danger-soft px-3 py-2 text-[12px] text-danger">{error}</p>}
        <p className="text-[13px] leading-6 text-muted">
          Vai trò <strong className="text-ink-900">{dialog?.role?.key}</strong> sẽ bị xoá vĩnh viễn.
        </p>
      </Modal>
    </>
  );
}
