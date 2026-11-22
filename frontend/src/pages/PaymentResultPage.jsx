import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Download,
  MapPin,
  QrCode,
  Ticket,
} from "lucide-react";
import { getEventById } from "../data/events.js";
import { eventLocationName } from "../utils/events.js";
import { formatDateTime, formatVnd } from "../utils/format.js";
import { api } from "../services/api.js";
import { useAppStore } from "../store/appStore.js";
import { downloadTicketFile } from "../components/BookingCard.jsx";
import QRCodeTicket from "../components/QRCodeTicket.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import Stepper from "../components/Stepper.jsx";

export default function PaymentResultPage() {
  const { result = "success" } = useParams();
  const [params] = useSearchParams();
  const bookings = useAppStore((state) => state.bookings);
  const bookingId = params.get("booking");
  const orderCode = params.get("order");
  const [remoteBooking, setRemoteBooking] = useState(null);

  // Nếu localStorage bị xoá thì vẫn lấy đơn đã thanh toán từ API.
  useEffect(() => {
    if (!orderCode) return undefined;
    let active = true;
    api
      .get(`/payments/orders/${encodeURIComponent(orderCode)}`)
      .then(({ data }) => {
        if (!active) return;
        const order = data?.data;
        if (!order || order.paymentStatus !== "PAID") return;
        const seats = [
          ...new Set(
            (order.tickets || [])
              .map((ticket) => String(ticket.qrCode || "").split("|")[3])
              .filter((seat) => seat && !seat.includes("x")),
          ),
        ];
        setRemoteBooking({
          id: order.orderCode,
          orderCode: order.orderCode,
          eventId: order.eventId,
          status: "confirmed",
          bookedAt: order.paidAt,
          seats,
          zoneName: (order.items || []).map((item) => item.name).join(", "),
          quantity: (order.items || []).reduce((sum, item) => sum + item.quantity, 0),
          total: order.totalAmount,
          paymentMethod: order.paymentMethod,
          tickets: order.tickets || [],
          customer: order.customer,
          emailSent: order.emailSent,
          qrValue: order.tickets?.[0]?.qrCode || `SOUNDPASS|${order.orderCode}`,
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [orderCode]);

  const booking = remoteBooking || bookings.find((item) => item.id === bookingId);
  const event = booking ? getEventById(booking.eventId) : null;

  if (result === "failed") {
    return (
      <div className="container-page max-w-2xl py-12">
        <ErrorState
          title="Thanh toán chưa hoàn tất"
          description="Giao dịch không thành công hoặc đã bị hủy. Chỗ giữ sẽ được giải phóng sau 10 phút."
          onRetry={() => window.history.back()}
        />
        <div className="mt-4 flex justify-center gap-2">
          <Link to="/events" className="btn btn-secondary btn-sm">Về danh sách sự kiện</Link>
          <Link to="/my-tickets" className="btn btn-ghost btn-sm">Xem vé của tôi</Link>
        </div>
      </div>
    );
  }

  if (!booking || !event) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={Ticket}
          title="Không tìm thấy đơn đặt vé"
          description="Liên kết này có thể đã hết hạn hoặc mã đặt vé không đúng."
          actionLabel="Về trang chủ"
          actionTo="/"
        />
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-9 sm:py-12">
      <div className="mb-7 flex justify-center">
        <Stepper current={2} />
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col items-center border-b border-line bg-success-soft/60 px-6 py-8 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-success text-white">
            <CheckCircle2 size={28} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-900 sm:text-[28px]">
            Đặt vé thành công!
          </h1>
          <p className="mt-2 max-w-md text-[13px] leading-6 text-muted">
            {booking.emailSent === false
              ? "Thanh toán thành công. Email chưa được gửi (SMTP chưa cấu hình) — vé vẫn có trong ứng dụng."
              : `Vé điện tử đã được gửi tới ${booking.customer?.email || "email của bạn"}. Xuất trình mã QR tại cổng soát vé.`}
          </p>
          <div className="mt-4 rounded-lg border border-success/25 bg-white px-4 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-2">Mã đặt vé</p>
            <p className="mt-0.5 font-mono text-[16px] font-bold text-ink-900">{booking.id}</p>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_150px] sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-2">Thông tin sự kiện</p>
            <h2 className="mt-1.5 text-[17px] font-bold text-ink-900">{event.name}</h2>
            <p className="mt-1 text-[13px] text-muted">{event.artist}</p>

            <ul className="mt-4 space-y-2.5 text-[13px]">
              <li className="flex gap-2.5">
                <CalendarDays size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>{formatDateTime(event.date, event.time)}</span>
              </li>
              <li className="flex gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>
                  {event.venue}, {eventLocationName(event)}
                  <span className="block text-[12px] text-muted">{event.address}</span>
                </span>
              </li>
            </ul>

            <hr className="divider my-4" />

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
              <div>
                <dt className="text-muted">Khu vực / loại vé</dt>
                <dd className="mt-0.5 font-semibold text-ink-900">{booking.zoneName}</dd>
              </div>
              <div>
                <dt className="text-muted">Số lượng</dt>
                <dd className="mt-0.5 font-semibold text-ink-900">{booking.quantity} vé</dd>
              </div>
              {booking.seats.length > 0 && (
                <div className="col-span-2">
                  <dt className="text-muted">Ghế</dt>
                  <dd className="mt-0.5 font-mono font-semibold text-ink-900">{booking.seats.join(", ")}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted">Thanh toán</dt>
                <dd className="mt-0.5 font-semibold text-ink-900">{booking.paymentMethod}</dd>
              </div>
              <div>
                <dt className="text-muted">Tổng tiền</dt>
                <dd className="mt-0.5 font-bold text-ink-900">{formatVnd(booking.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col items-center justify-start border-t border-line pt-5 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Mã soát vé</p>
            <QRCodeTicket value={booking.qrValue} size={128} />
            <p className="mt-2 text-center text-[11px] leading-4 text-muted">
              Mỗi mã dùng một lần. Không chia sẻ mã QR.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-line bg-paper/60 px-5 py-4">
          <button type="button" onClick={() => downloadTicketFile(booking, event)} className="btn btn-primary btn-sm">
            <Download size={14} />
            Tải vé
          </button>
          <Link to="/my-tickets" className="btn btn-secondary btn-sm">
            <QrCode size={14} />
            Xem trong Vé của tôi
          </Link>
          <Link to="/" className="btn btn-ghost btn-sm ml-auto">
            Về trang chủ
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <p className="mt-4 text-center text-[12px] text-muted">
        Cần hỗ trợ? <Link to="/chatbot" className="link">Hỏi trợ lý Soundpass</Link> hoặc gọi 028 7300 2026.
      </p>
    </div>
  );
}
