import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, CalendarDays, History, Ticket, XCircle } from "lucide-react";
import { getEventById } from "../data/events.js";
import { useAppStore } from "../store/appStore.js";
import BookingCard from "../components/BookingCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Modal from "../components/Modal.jsx";

const tabs = [
  { id: "upcoming", label: "Sắp diễn ra", icon: CalendarDays },
  { id: "past", label: "Đã qua", icon: History },
  { id: "cancelled", label: "Đã hủy", icon: XCircle },
];

export default function MyTicketsPage() {
  const bookings = useAppStore((state) => state.bookings);
  const cancelBooking = useAppStore((state) => state.cancelBooking);
  const pushToast = useAppStore((state) => state.pushToast);
  const [tab, setTab] = useState("upcoming");
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const groups = useMemo(() => {
    const result = { upcoming: [], past: [], cancelled: [] };
    const now = Date.now();

    bookings.forEach((booking) => {
      const event = getEventById(booking.eventId);
      if (!event) return;
      const item = { booking, event };

      if (booking.status === "cancelled") {
        result.cancelled.push(item);
      } else if (new Date(`${event.date}T${event.time}:00`).getTime() < now || booking.status === "used") {
        result.past.push(item);
      } else {
        result.upcoming.push(item);
      }
    });

    result.upcoming.sort((a, b) => new Date(a.event.date) - new Date(b.event.date));
    result.past.sort((a, b) => new Date(b.event.date) - new Date(a.event.date));
    return result;
  }, [bookings]);

  const confirmCancel = () => {
    if (!bookingToCancel) return;
    cancelBooking(bookingToCancel.id);
    pushToast({
      type: "success",
      title: "Đã hủy vé",
      message: `Đơn ${bookingToCancel.id} đã được hủy. Phí hủy 20% sẽ được hoàn trong 3–5 ngày làm việc.`,
    });
    setBookingToCancel(null);
    setTab("cancelled");
  };

  const current = groups[tab];

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Tài khoản</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900 sm:text-[30px]">Vé của tôi</h1>
          <p className="mt-1.5 text-[13px] text-muted">Lưu trữ vé điện tử và mã QR của các đơn đã đặt.</p>
        </div>
        <Link to="/events" className="btn btn-primary btn-sm">Đặt vé khác</Link>
      </div>

      <div className="mb-5 flex gap-1.5 border-b border-line">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13px] font-semibold transition ${
                active
                  ? "border-accent text-accent-dark"
                  : "border-transparent text-muted hover:text-ink-900"
              }`}
              aria-pressed={active}
            >
              <Icon size={15} />
              {item.label}
              <span className={`text-[11px] ${active ? "text-accent" : "text-muted-2"}`}>
                {groups[item.id].length}
              </span>
            </button>
          );
        })}
      </div>

      {current.length === 0 ? (
        <EmptyState
          icon={tab === "upcoming" ? Ticket : CalendarClock}
          title={
            tab === "upcoming"
              ? "Chưa có vé nào sắp diễn ra"
              : tab === "past"
                ? "Chưa có vé đã sử dụng"
                : "Không có vé nào bị hủy"
          }
          description={
            tab === "upcoming"
              ? "Tìm một đêm nhạc phù hợp và đặt vé để xem mã QR tại đây."
              : "Các vé đã qua hoặc đã hủy sẽ được lưu lại ở đây."
          }
          actionLabel={tab === "upcoming" ? "Khám phá sự kiện" : undefined}
          actionTo={tab === "upcoming" ? "/events" : undefined}
        />
      ) : (
        <div className="space-y-3">
          {current.map(({ booking, event }) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              event={event}
              onCancel={setBookingToCancel}
            />
          ))}
        </div>
      )}

      <div className="mt-6 rounded-lg border border-line bg-white p-4 text-[12px] leading-6 text-muted">
        <p className="font-semibold text-ink-900">Chính sách hủy vé</p>
        <p className="mt-1">
          Có thể hủy trước 48 giờ so với giờ diễn. Phí hủy 20% giá vé; tiền hoàn trong 3–5 ngày làm việc.
          Sau thời điểm này vé không hoàn tiền, nhưng bạn vẫn có thể chuyển nhượng cho người khác.
        </p>
      </div>

      <Modal
        open={Boolean(bookingToCancel)}
        title="Hủy đơn đặt vé?"
        description="Hành động này không thể hoàn tác."
        onClose={() => setBookingToCancel(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setBookingToCancel(null)}>
              Giữ vé
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={confirmCancel}>
              Xác nhận hủy
            </button>
          </>
        }
      >
        {bookingToCancel && (
          <div className="space-y-3 text-[13px]">
            <p className="text-muted">
              Đơn <strong className="font-mono text-ink-900">{bookingToCancel.id}</strong> sẽ bị hủy.
              Bạn sẽ được hoàn lại 80% giá trị vé sau khi trừ phí hủy.
            </p>
            <div className="flex justify-between rounded-md bg-danger-soft px-3 py-2.5">
              <span className="text-danger">Phí hủy (20%)</span>
              <span className="font-semibold text-danger">
                {new Intl.NumberFormat("vi-VN").format(Math.round(bookingToCancel.total * 0.2))} ₫
              </span>
            </div>
            <p className="text-[12px] text-muted-2">
              Nếu bạn chỉ muốn đổi thông tin người nhận, vui lòng liên hệ ban tổ chức thay vì hủy vé.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
