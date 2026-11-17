import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Download, Plus } from "lucide-react";
import {
  categoryBreakdown,
  overviewStats,
  recentOrders,
  revenueByMonth,
} from "../../data/admin.js";
import { formatCompactVnd, formatVnd } from "../../utils/format.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import { AdminCard, AdminPageHeader, Currency, ProgressBar, StatCard, TableShell } from "./AdminParts.jsx";

export default function AdminOverviewPage() {
  const exportSummary = () => {
    const rows = [
      ["Tháng", "Doanh thu (VND)", "Đơn hàng"],
      ...revenueByMonth.filter((item) => item.revenue > 0).map((item) => [item.month, item.revenue, item.bookings]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "soundpass-revenue.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxTickets = Math.max(...categoryBreakdown.map((item) => item.tickets));

  return (
    <>
      <AdminPageHeader
        eyebrow="Tổng quan"
        title="Chào buổi sáng, Minh Anh"
        description="Tình hình bán vé của Soundpass trong tháng 11/2026."
        actions={[
          <button key="export" type="button" onClick={exportSummary} className="btn btn-secondary btn-sm">
            <Download size={14} />
            Xuất CSV
          </button>,
          <Link key="new" to="/admin/events" className="btn btn-primary btn-sm">
            <Plus size={14} />
            Tạo sự kiện
          </Link>,
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat) => <StatCard key={stat.id} stat={stat} />)}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <AdminCard
          title="Doanh thu theo tháng"
          description="Đơn vị: triệu đồng · cập nhật đến 17/11/2026"
          actions={<span className="badge badge-success">Năm 2026</span>}
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e4572e" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#e4572e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3ded2" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8b8f96" }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCompactVnd}
                  tick={{ fontSize: 11, fill: "#8b8f96" }}
                  width={48}
                />
                <Tooltip
                  formatter={(value) => [formatVnd(value), "Doanh thu"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e3ded2", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#e4572e" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard title="Vé bán theo thể loại" description="Lũy kế từ đầu năm">
          <div className="space-y-3.5">
            {categoryBreakdown.map((item) => (
              <div key={item.name}>
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="font-medium text-ink-800">{item.name}</span>
                  <span className="text-muted">{item.tickets.toLocaleString("vi-VN")} vé</span>
                </div>
                <ProgressBar value={(item.tickets / maxTickets) * 100} tone="accent" />
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <div className="mt-5">
        <AdminCard
          title="Đơn hàng gần đây"
          description="6 đơn mới nhất trên hệ thống"
          actions={
            <Link to="/admin/orders" className="link inline-flex items-center gap-1 text-[12px]">
              Xem tất cả
              <ArrowRight size={13} />
            </Link>
          }
          bodyClassName=""
        >
          <TableShell head={["Mã đơn", "Khách hàng", "Sự kiện", "Thanh toán", "Tổng tiền", "Trạng thái", "Thời gian"]}>
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-paper/60">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] font-semibold text-ink-900">{order.id}</td>
                <td className="whitespace-nowrap px-4 py-3">{order.customer}</td>
                <td className="max-w-[220px] truncate px-4 py-3 text-muted">{order.event}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{order.method}</td>
                <td className="whitespace-nowrap px-4 py-3"><Currency value={order.amount} /></td>
                <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={order.status} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-[12px] text-muted">{order.createdAt}</td>
              </tr>
            ))}
          </TableShell>
        </AdminCard>
      </div>
    </>
  );
}
