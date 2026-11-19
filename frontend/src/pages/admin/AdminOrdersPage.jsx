import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { recentOrders } from "../../data/admin.js";
import { formatVnd } from "../../utils/format.js";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { AdminCard, AdminPageHeader, Currency, TableShell } from "./AdminParts.jsx";

export default function AdminOrdersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [detail, setDetail] = useState(null);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return recentOrders.filter((order) => {
      const matchQuery = !keyword || `${order.id} ${order.customer} ${order.event}`.toLowerCase().includes(keyword);
      const matchStatus = status === "all" || order.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, status]);

  const revenue = filtered.filter((order) => order.status === "paid").reduce((sum, order) => sum + order.amount, 0);

  return (
    <>
      <AdminPageHeader
        eyebrow="Bán hàng"
        title="Đơn hàng"
        description={`${filtered.length} đơn trong kết quả lọc · Doanh thu đã thu ${formatVnd(revenue)}.`}
      />

      <AdminCard title="Danh sách đơn hàng" bodyClassName="">
        <div className="flex flex-wrap gap-2 border-b border-line p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
            <input
              className="input h-9 pl-9"
              placeholder="Tìm mã đơn, khách hàng, sự kiện..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <select className="select h-9 w-auto" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Lọc theo trạng thái đơn">
            <option value="all">Mọi trạng thái</option>
            <option value="paid">Đã thanh toán</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4"><EmptyState icon={Search} title="Không có đơn hàng phù hợp" description="Thử đổi từ khóa hoặc trạng thái." /></div>
        ) : (
          <TableShell head={["Mã đơn", "Khách hàng", "Sự kiện", "Phương thức", "Tổng tiền", "Trạng thái", "Thời gian", ""]}>
            {filtered.map((order) => (
              <tr key={order.id} className="hover:bg-paper/60">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] font-semibold text-ink-900">{order.id}</td>
                <td className="whitespace-nowrap px-4 py-3">{order.customer}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-muted">{order.event}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{order.method}</td>
                <td className="whitespace-nowrap px-4 py-3"><Currency value={order.amount} /></td>
                <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={order.status} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-[12px] text-muted">{order.createdAt}</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => setDetail(order)} className="btn btn-ghost btn-sm px-2" aria-label={`Xem đơn ${order.id}`}>
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </AdminCard>

      <Modal
        open={Boolean(detail)}
        title="Chi tiết đơn hàng"
        description={detail?.id}
        size="sm"
        onClose={() => setDetail(null)}
        footer={<button type="button" className="btn btn-secondary btn-sm" onClick={() => setDetail(null)}>Đóng</button>}
      >
        {detail && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
            <div className="col-span-2">
              <dt className="text-muted">Sự kiện</dt>
              <dd className="mt-0.5 font-semibold text-ink-900">{detail.event}</dd>
            </div>
            <div>
              <dt className="text-muted">Khách hàng</dt>
              <dd className="mt-0.5 font-semibold text-ink-900">{detail.customer}</dd>
            </div>
            <div>
              <dt className="text-muted">Thời gian tạo</dt>
              <dd className="mt-0.5 font-semibold text-ink-900">{detail.createdAt}</dd>
            </div>
            <div>
              <dt className="text-muted">Phương thức</dt>
              <dd className="mt-0.5 font-semibold text-ink-900">{detail.method}</dd>
            </div>
            <div>
              <dt className="text-muted">Trạng thái</dt>
              <dd className="mt-0.5"><StatusBadge status={detail.status} /></dd>
            </div>
            <div className="col-span-2 border-t border-line pt-3">
              <dt className="text-muted">Tổng tiền</dt>
              <dd className="mt-0.5 font-display text-xl font-extrabold text-ink-900">{formatVnd(detail.amount)}</dd>
            </div>
          </dl>
        )}
      </Modal>
    </>
  );
}
