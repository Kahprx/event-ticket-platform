import { useEffect, useMemo, useState } from "react";
import {
  LockKeyhole,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UnlockKeyhole,
} from "lucide-react";
import { adminRoles, adminUsers } from "../../data/admin.js";
import { adminApi, apiMessage } from "../../services/adminApi.js";
import { mapAccount, roleLabel } from "../../utils/adminResource.js";
import { useAppStore } from "../../store/appStore.js";
import Modal from "../../components/Modal.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { AdminCard, AdminPageHeader, TableShell } from "./AdminParts.jsx";

const endpointsByResource = {
  accounts: {
    list: adminApi.listAccounts,
    create: adminApi.createAccount,
    update: adminApi.updateAccount,
    remove: adminApi.deleteAccount,
    noun: "tài khoản",
  },
  customers: {
    list: adminApi.listCustomers,
    create: adminApi.createCustomer,
    update: adminApi.updateCustomer,
    remove: adminApi.deleteCustomer,
    noun: "khách hàng",
  },
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  city: "",
  roleKey: "CUSTOMER",
  status: "active",
};

export default function AdminAccountManager({
  resource = "accounts",
  eyebrow = "Hệ thống",
  title,
  description,
  allowRoleChange = true,
}) {
  const endpoints = endpointsByResource[resource];
  const pushToast = useAppStore((state) => state.pushToast);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleOptions, setRoleOptions] = useState(["CUSTOMER", "ADMIN"].map((key) => ({ value: key, label: key })));
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [data, rolesData] = await Promise.all([
        endpoints.list(),
        adminApi.listRoles().catch(() => null),
      ]);
      setRows(data.map(mapAccount));
      const options = rolesData?.length ? rolesData : adminRoles;
      setRoleOptions(options.map((role) => ({ value: role.key, label: role.key })));
      setOffline(false);
    } catch {
      const fallback = resource === "customers"
        ? adminUsers.filter((user) => user.role === "CUSTOMER")
        : adminUsers;
      setRows(fallback.map(mapAccount));
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchQuery = !keyword || `${row.name} ${row.email} ${row.city}`.toLowerCase().includes(keyword);
      const matchRole = !allowRoleChange || roleFilter === "all" || row.role === roleFilter;
      const matchStatus = statusFilter === "all" || row.status === statusFilter;
      return matchQuery && matchRole && matchStatus;
    });
  }, [rows, query, roleFilter, statusFilter, allowRoleChange]);

  const openCreate = () => {
    setForm({ ...emptyForm, roleKey: allowRoleChange ? "CUSTOMER" : "CUSTOMER" });
    setError(null);
    setDialog({ type: "create" });
  };

  const openEdit = (row) => {
    setForm({
      name: row.name,
      email: row.email,
      password: "",
      phone: row.phone === "—" ? "" : row.phone,
      city: row.city === "—" ? "" : row.city,
      roleKey: row.role,
      status: row.status,
    });
    setError(null);
    setDialog({ type: "edit", row });
  };

  const openConfirm = (type, row) => {
    setError(null);
    setDialog({ type, row });
  };

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!dialog) return;

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      city: form.city.trim() || null,
      status: form.status,
    };
    if (dialog.type === "create") {
      payload.email = form.email.trim();
      payload.password = form.password;
    }
    if (allowRoleChange) payload.roleKey = form.roleKey;

    setSaving(true);
    setError(null);
    try {
      if (dialog.type === "create") {
        const created = await endpoints.create(payload);
        setRows((current) => [mapAccount(created), ...current]);
        pushToast({ type: "success", title: "Đã tạo", message: `Đã thêm ${endpoints.noun} mới.` });
      } else {
        const updated = await endpoints.update(dialog.row.id, payload);
        setRows((current) => current.map((row) => (row.id === dialog.row.id ? mapAccount(updated) : row)));
        pushToast({ type: "success", title: "Đã lưu", message: `Cập nhật ${endpoints.noun} thành công.` });
      }
      setDialog(null);
    } catch (requestError) {
      setError(apiMessage(requestError));
      pushToast({ type: "error", title: "Chưa lưu được", message: apiMessage(requestError) });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (!dialog?.row) return;
    const row = dialog.row;
    setSaving(true);
    setError(null);
    try {
      if (dialog.type === "delete") {
        await endpoints.remove(row.id);
        setRows((current) => current.filter((item) => item.id !== row.id));
        pushToast({ type: "success", title: "Đã xoá", message: `Đã xoá ${endpoints.noun} ${row.name}.` });
      } else {
        const nextStatus = row.status === "active" ? "locked" : "active";
        const updated = await endpoints.update(row.id, { status: nextStatus });
        setRows((current) => current.map((item) => (item.id === row.id ? mapAccount(updated) : item)));
        pushToast({
          type: "success",
          title: nextStatus === "locked" ? "Đã khóa" : "Đã mở khóa",
          message: `${row.name} ${nextStatus === "locked" ? "không thể đăng nhập." : "có thể đăng nhập lại."}`,
        });
      }
      setDialog(null);
    } catch (requestError) {
      setError(apiMessage(requestError));
      pushToast({ type: "error", title: "Chưa thực hiện được", message: apiMessage(requestError) });
    } finally {
      setSaving(false);
    }
  };

  const isFormDialog = dialog?.type === "create" || dialog?.type === "edit";
  const confirmTitle = dialog?.type === "delete"
    ? `Xoá ${endpoints.noun}?`
    : dialog?.row?.status === "active" ? `Khóa ${endpoints.noun}?` : `Mở khóa ${endpoints.noun}?`;

  return (
    <>
      <AdminPageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={[
          <button key="refresh" type="button" onClick={load} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} />
            Làm mới
          </button>,
          <button key="create" type="button" onClick={openCreate} className="btn btn-primary btn-sm">
            <Plus size={14} />
            {resource === "customers" ? "Tạo khách hàng" : "Tạo tài khoản"}
          </button>,
        ]}
      />

      {offline && (
        <p className="mb-4 rounded-md border border-warning/30 bg-warning-soft px-3 py-2.5 text-[12px] text-warning">
          Không kết nối được API. Đang hiển thị dữ liệu mẫu; các thao tác sửa/xoá cần backend.
        </p>
      )}

      <AdminCard title="Danh sách" description={`${filtered.length} / ${rows.length} bản ghi`} bodyClassName="">
        <div className="flex flex-wrap gap-2 border-b border-line p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
            <input
              className="input h-9 pl-9"
              placeholder="Tìm tên, email, thành phố..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          {allowRoleChange && (
            <select className="select h-9 w-auto" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Lọc theo vai trò">
              <option value="all">Mọi vai trò</option>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          )}
          <select className="select h-9 w-auto" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Lọc theo trạng thái">
            <option value="all">Mọi trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã khóa</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[13px] text-muted">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={Search} title="Không tìm thấy bản ghi" description="Thử đổi điều kiện lọc." />
          </div>
        ) : (
          <TableShell head={["ID", "Người dùng", "Vai trò", "Khu vực", "Ngày tham gia", "Đơn", "Trạng thái", "Thao tác"]}>
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-paper/60">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-muted">{row.id.slice(-8)}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{row.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{row.email}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={`badge ${row.role === "ADMIN" ? "badge-accent" : "badge-neutral"}`}>{roleLabel(row.role)}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{row.city}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{row.joinedAt}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{row.bookings}</td>
                <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={row.status} /></td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(row)} className="btn btn-ghost btn-sm px-2" title="Sửa" aria-label="Sửa">
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openConfirm("status", row)}
                      className={`btn btn-ghost btn-sm px-2 ${row.status === "active" ? "text-danger" : "text-success"}`}
                      title={row.status === "active" ? "Khóa" : "Mở khóa"}
                      aria-label={row.status === "active" ? "Khóa" : "Mở khóa"}
                    >
                      {row.status === "active" ? <LockKeyhole size={14} /> : <UnlockKeyhole size={14} />}
                    </button>
                    <button type="button" onClick={() => openConfirm("delete", row)} className="btn btn-ghost btn-sm px-2 text-danger" title="Xoá" aria-label="Xoá">
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
        open={isFormDialog}
        title={dialog?.type === "create" ? (resource === "customers" ? "Tạo khách hàng" : "Tạo tài khoản") : "Cập nhật thông tin"}
        description={dialog?.row ? dialog.row.email : "Tài khoản mới sẽ có thể đăng nhập ngay."}
        size="md"
        onClose={() => setDialog(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDialog(null)}>Hủy</button>
            <button type="submit" form="account-form" disabled={saving} className="btn btn-primary btn-sm">
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </>
        }
      >
        {error && <p className="mb-3 rounded-md bg-danger-soft px-3 py-2 text-[12px] text-danger">{error}</p>}
        <form id="account-form" onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="field sm:col-span-2">
            <label className="field-label" htmlFor="account-name">Họ và tên</label>
            <input id="account-name" className="input" value={form.name} onChange={(e) => setField("name", e.target.value)} required minLength={2} />
          </div>
          {dialog?.type === "create" && (
            <>
              <div className="field sm:col-span-2">
                <label className="field-label" htmlFor="account-email">Email</label>
                <input id="account-email" type="email" className="input" value={form.email} onChange={(e) => setField("email", e.target.value)} required />
              </div>
              <div className="field sm:col-span-2">
                <label className="field-label" htmlFor="account-password">Mật khẩu</label>
                <input id="account-password" type="password" className="input" value={form.password} onChange={(e) => setField("password", e.target.value)} required minLength={8} placeholder="Ít nhất 8 ký tự" />
              </div>
            </>
          )}
          <div className="field">
            <label className="field-label" htmlFor="account-phone">Điện thoại</label>
            <input id="account-phone" className="input" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="account-city">Thành phố</label>
            <input id="account-city" className="input" value={form.city} onChange={(e) => setField("city", e.target.value)} />
          </div>
          {allowRoleChange && (
            <div className="field">
              <label className="field-label" htmlFor="account-role">Vai trò</label>
              <select id="account-role" className="select" value={form.roleKey} onChange={(e) => setField("roleKey", e.target.value)}>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label className="field-label" htmlFor="account-status">Trạng thái</label>
            <select id="account-status" className="select" value={form.status} onChange={(e) => setField("status", e.target.value)}>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Đã khóa</option>
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(dialog && !isFormDialog)}
        title={confirmTitle}
        description="Thao tác này được ghi nhận ngay trong hệ thống."
        size="sm"
        onClose={() => setDialog(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDialog(null)}>Hủy</button>
            <button type="button" disabled={saving} onClick={handleConfirm} className={`btn btn-sm ${dialog?.type === "delete" ? "btn-danger" : "btn-primary"}`}>
              {saving ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </>
        }
      >
        {error && <p className="mb-3 rounded-md bg-danger-soft px-3 py-2 text-[12px] text-danger">{error}</p>}
        <p className="text-[13px] leading-6 text-muted">
          {dialog?.type === "delete"
            ? <>Bạn sắp xoá <strong className="text-ink-900">{dialog?.row?.name}</strong>. Hành động này không thể hoàn tác.</>
            : dialog?.row?.status === "active"
              ? <><strong className="text-ink-900">{dialog?.row?.name}</strong> sẽ không thể đăng nhập cho đến khi được mở lại.</>
              : <><strong className="text-ink-900">{dialog?.row?.name}</strong> sẽ có thể đăng nhập bình thường trở lại.</>}
        </p>
      </Modal>
    </>
  );
}
