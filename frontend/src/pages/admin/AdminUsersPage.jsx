import { useMemo, useState } from "react";
import { LockKeyhole, Search, UnlockKeyhole } from "lucide-react";
import { adminUsers } from "../../data/admin.js";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { AdminCard, AdminPageHeader, TableShell } from "./AdminParts.jsx";

export default function AdminUsersPage() {
  const [rows, setRows] = useState(adminUsers);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [target, setTarget] = useState(null);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return rows.filter((user) => {
      const matchQuery = !keyword || `${user.name} ${user.email} ${user.city}`.toLowerCase().includes(keyword);
      const matchRole = role === "all" || user.role === role;
      return matchQuery && matchRole;
    });
  }, [rows, query, role]);

  const confirmToggle = () => {
    if (!target) return;
    const nextStatus = target.status === "active" ? "locked" : "active";
    setRows((current) => current.map((user) => (
      user.id === target.id ? { ...user, status: nextStatus } : user
    )));
    setTarget(null);
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Hệ thống"
        title="Người dùng"
        description={`${rows.length} tài khoản · ${rows.filter((user) => user.status === "locked").length} đang bị khóa.`}
      />

      <AdminCard title="Danh sách người dùng" bodyClassName="">
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
          <select className="select h-9 w-auto" value={role} onChange={(event) => setRole(event.target.value)} aria-label="Lọc theo vai trò">
            <option value="all">Mọi vai trò</option>
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4"><EmptyState icon={Search} title="Không tìm thấy người dùng" description="Thử đổi điều kiện lọc." /></div>
        ) : (
          <TableShell head={["ID", "Người dùng", "Vai trò", "Khu vực", "Ngày tham gia", "Đơn", "Trạng thái", "Thao tác"]}>
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-paper/60">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-muted">{user.id}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{user.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{user.email}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={`badge ${user.role === "ADMIN" ? "badge-accent" : "badge-neutral"}`}>{user.role}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{user.city}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{user.joinedAt}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{user.bookings}</td>
                <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={user.status} /></td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setTarget(user)}
                    className={`btn btn-ghost btn-sm px-2 ${user.status === "active" ? "text-danger hover:bg-danger-soft" : "text-success hover:bg-success-soft"}`}
                  >
                    {user.status === "active" ? <LockKeyhole size={14} /> : <UnlockKeyhole size={14} />}
                    {user.status === "active" ? "Khóa" : "Mở"}
                  </button>
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </AdminCard>

      <Modal
        open={Boolean(target)}
        title={target?.status === "active" ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
        description="Thay đổi này ảnh hưởng ngay đến khả năng đăng nhập."
        size="sm"
        onClose={() => setTarget(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTarget(null)}>Hủy</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={confirmToggle}>
              {target?.status === "active" ? "Xác nhận khóa" : "Xác nhận mở"}
            </button>
          </>
        }
      >
        {target && (
          <p className="text-[13px] leading-6 text-muted">
            {target.status === "active"
              ? <>Tài khoản <strong className="text-ink-900">{target.name}</strong> sẽ không thể đăng nhập cho đến khi được mở lại.</>
              : <>Tài khoản <strong className="text-ink-900">{target.name}</strong> sẽ có thể đăng nhập bình thường trở lại.</>}
          </p>
        )}
      </Modal>
    </>
  );
}
