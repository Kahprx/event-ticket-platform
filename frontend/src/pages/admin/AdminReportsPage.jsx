import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { categoryBreakdown, revenueByMonth } from "../../data/admin.js";
import { formatCompactVnd, formatVnd } from "../../utils/format.js";
import { AdminCard, AdminPageHeader } from "./AdminParts.jsx";

export default function AdminReportsPage() {
  const exportReport = () => {
    const rows = [
      ["Tháng", "Doanh thu", "Số đơn"],
      ...revenueByMonth
        .filter((item) => item.revenue > 0)
        .map((item) => [item.month, item.revenue, item.bookings]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "soundpass-bao-cao-2026.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeMonths = revenueByMonth.filter((item) => item.revenue > 0);
  const totalRevenue = activeMonths.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = activeMonths.reduce((sum, item) => sum + item.bookings, 0);
  const average = Math.round(totalRevenue / totalOrders);

  return (
    <>
      <AdminPageHeader
        eyebrow="Thống kê"
        title="Báo cáo & phân tích"
        description="Số liệu mô phỏng phục vụ demo. Có thể thay bằng aggregate query từ backend."
        actions={[
          <button key="download" type="button" onClick={exportReport} className="btn btn-primary btn-sm">
            <Download size={14} />
            Xuất báo cáo CSV
          </button>,
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-[12px] text-muted">Doanh thu 11 tháng</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{formatCompactVnd(totalRevenue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-[12px] text-muted">Tổng đơn đặt vé</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{totalOrders.toLocaleString("vi-VN")}</p>
        </div>
        <div className="card p-4">
          <p className="text-[12px] text-muted">Giá trị đơn trung bình</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{formatVnd(average)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <AdminCard title="Doanh thu và số đơn theo tháng" description="Cột cam là doanh thu, cột xanh là số đơn">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeMonths} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3ded2" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8b8f96" }} />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCompactVnd}
                  tick={{ fontSize: 11, fill: "#8b8f96" }}
                  width={48}
                />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8b8f96" }} width={36} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "Doanh thu" ? formatVnd(value) : `${value} đơn`,
                    name,
                  ]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e3ded2", fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="revenue" name="Doanh thu" fill="#e4572e" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="right" dataKey="bookings" name="Số đơn" fill="#1f3a5f" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard title="Cơ cấu vé bán theo thể loại" description="Tỷ trọng số vé trong năm">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="tickets"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={82}
                  paddingAngle={2}
                >
                  {categoryBreakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => [`${value.toLocaleString("vi-VN")} vé`, "Số vé"]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </div>

      <div className="mt-5">
        <AdminCard title="Bảng số liệu chi tiết" bodyClassName="">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-line bg-paper/70 text-[11px] uppercase tracking-wide text-muted-2">
                  <th className="px-4 py-2.5 font-semibold">Tháng</th>
                  <th className="px-4 py-2.5 font-semibold">Doanh thu</th>
                  <th className="px-4 py-2.5 font-semibold">Số đơn</th>
                  <th className="px-4 py-2.5 font-semibold">Trung bình/đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {activeMonths.map((item) => (
                  <tr key={item.month} className="hover:bg-paper/60">
                    <td className="px-4 py-2.5 font-semibold text-ink-900">Tháng {item.month}</td>
                    <td className="px-4 py-2.5 font-medium text-ink-900">{formatVnd(item.revenue)}</td>
                    <td className="px-4 py-2.5 text-muted">{item.bookings.toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-2.5 text-muted">{formatVnd(Math.round(item.revenue / item.bookings))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>
    </>
  );
}
