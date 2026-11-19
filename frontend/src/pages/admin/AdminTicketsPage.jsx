import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Ticket } from "lucide-react";
import { events, locations } from "../../data/events.js";
import { formatVnd } from "../../utils/format.js";
import { ProgressBar, AdminCard, AdminPageHeader } from "./AdminParts.jsx";
import EmptyState from "../../components/EmptyState.jsx";

const statusOf = (sold, total) => {
  const remaining = total - sold;
  if (remaining <= 0) return { label: "Hết vé", className: "badge-danger" };
  if (remaining / total <= 0.15) return { label: "Sắp hết", className: "badge-warning" };
  return { label: "Còn vé", className: "badge-success" };
};

export default function AdminTicketsPage() {
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  const groups = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return events
      .filter((event) => event.status !== "ended")
      .filter((event) => !keyword || `${event.name} ${event.artist}`.toLowerCase().includes(keyword))
      .filter((event) => locationFilter === "all" || event.locationId === locationFilter)
      .map((event) => ({
        event,
        total: event.ticketTypes.reduce((sum, type) => sum + type.total, 0),
        sold: event.ticketTypes.reduce((sum, type) => sum + type.sold, 0),
      }));
  }, [query, locationFilter]);

  const totalTickets = groups.reduce((sum, group) => sum + group.total, 0);
  const soldTickets = groups.reduce((sum, group) => sum + group.sold, 0);
  const soldPercent = totalTickets ? Math.round((soldTickets / totalTickets) * 100) : 0;

  return (
    <>
      <AdminPageHeader
        eyebrow="Kho vé"
        title="Quản lý vé"
        description="Theo dõi số lượng vé đã bán và tình trạng từng khu vực."
        actions={[
          <Link key="events" to="/admin/events" className="btn btn-secondary btn-sm">Quản lý sự kiện</Link>,
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-[12px] text-muted">Tổng vé mở bán</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{totalTickets.toLocaleString("vi-VN")}</p>
        </div>
        <div className="card p-4">
          <p className="text-[12px] text-muted">Đã bán</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{soldTickets.toLocaleString("vi-VN")}</p>
        </div>
        <div className="card p-4">
          <p className="text-[12px] text-muted">Tỷ lệ lấp đầy</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{soldPercent}%</p>
          <div className="mt-2"><ProgressBar value={soldPercent} tone="success" /></div>
        </div>
      </div>

      <div className="mt-5">
        <AdminCard title="Tồn vé theo sự kiện" bodyClassName="">
          <div className="flex flex-wrap gap-2 border-b border-line p-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
              <input
                className="input h-9 pl-9"
                placeholder="Tìm sự kiện..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select className="select h-9 w-auto" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} aria-label="Lọc theo khu vực">
              <option value="all">Tất cả khu vực</option>
              {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
            </select>
          </div>

          {groups.length === 0 ? (
            <div className="p-4"><EmptyState icon={Ticket} title="Không có sự kiện nào" description="Thử đổi điều kiện lọc." /></div>
          ) : (
            <div className="divide-y divide-line">
              {groups.map(({ event, total, sold }) => {
                const percent = Math.round((sold / total) * 100);
                const location = locations.find((item) => item.id === event.locationId);
                return (
                  <div key={event.id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-bold text-ink-900">{event.name}</p>
                        <p className="mt-0.5 text-[12px] text-muted">{location?.name} · {event.venue}</p>
                      </div>
                      <span className="text-[12px] text-muted">
                        <strong className="text-ink-900">{sold.toLocaleString("vi-VN")}</strong> / {total.toLocaleString("vi-VN")} vé ({percent}%)
                      </span>
                    </div>

                    <div className="mt-3"><ProgressBar value={percent} tone={percent > 85 ? "warning" : "success"} /></div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {event.ticketTypes.map((type) => {
                        const status = statusOf(type.sold, type.total);
                        return (
                          <div key={type.id} className="rounded-lg border border-line bg-paper/50 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[12px] font-semibold text-ink-900">{type.name}</p>
                              <span className={`badge ${status.className}`}>{status.label}</span>
                            </div>
                            <p className="mt-1 text-[13px] font-bold text-ink-900">{formatVnd(type.price)}</p>
                            <p className="mt-0.5 text-[11px] text-muted">
                              Còn {Math.max(0, type.total - type.sold).toLocaleString("vi-VN")} / {type.total.toLocaleString("vi-VN")} vé
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AdminCard>
      </div>
    </>
  );
}
