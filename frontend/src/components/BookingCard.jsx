import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, MapPin, QrCode, XCircle } from "lucide-react";
import { formatLongDate, formatTime, formatVnd } from "../utils/format.js";
import { eventLocationName } from "../utils/events.js";
import StatusBadge from "./StatusBadge.jsx";
import QRCodeTicket from "./QRCodeTicket.jsx";

export const downloadTicketFile = (booking, event) => {
  const content = [
    "SOUNDPASS — VÉ ĐIỆN TỬ",
    "--------------------------------",
    `Mã đặt vé: ${booking.id}`,
    `Sự kiện: ${event.name}`,
    `Thời gian: ${formatTime(event.time)} · ${formatLongDate(event.date)}`,
    `Địa điểm: ${event.venue}, ${eventLocationName(event)}`,
    `Khu vực: ${booking.zoneName}`,
    booking.seats.length > 0 ? `Ghế: ${booking.seats.join(", ")}` : `Số lượng: ${booking.quantity} vé`,
    `Tổng tiền: ${formatVnd(booking.total)}`,
    `Phương thức: ${booking.paymentMethod}`,
    "",
    "Xuất trình mã QR trong ứng dụng khi soát vé.",
    "Mỗi mã chỉ sử dụng một lần.",
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `soundpass-${booking.id}.txt`;
  link.click();
  URL.revokeObjectURL(url);
};

function Info({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-2">{label}</p>
      <p className={`mt-0.5 truncate text-[12px] font-semibold text-ink-900 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

export default function BookingCard({ booking, event, onCancel }) {
  const [showQr, setShowQr] = useState(false);

  if (!event) return null;

  const eventDate = new Date(`${event.date}T${event.time}:00`);
  const canCancel = booking.status === "confirmed" && eventDate.getTime() - Date.now() > 48 * 60 * 60 * 1000;
  const isPast = eventDate < new Date() || booking.status === "used";

  return (
    <article className="card overflow-hidden">
      <div className="flex gap-3 p-3.5">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-ink-900">
          <img
            src={event.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-bold text-ink-900">{event.name}</h3>
              <p className="mt-0.5 text-[12px] text-muted">
                {formatLongDate(event.date)} · {formatTime(event.time)}
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-1.5 flex items-center gap-1 truncate text-[12px] text-muted">
            <MapPin size={12} className="shrink-0" />
            {event.venue}, {eventLocationName(event)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-line bg-paper/50 px-3.5 py-2.5 sm:grid-cols-4">
        <Info label="Mã đặt vé" value={booking.id} mono />
        <Info label="Khu vực" value={booking.zoneName} />
        <Info
          label={booking.seats.length > 0 ? "Ghế" : "Số lượng"}
          value={booking.seats.length > 0 ? booking.seats.join(", ") : `${booking.quantity} vé`}
        />
        <Info label="Tổng tiền" value={formatVnd(booking.total)} />
      </div>

      {showQr && (
        <div className="flex flex-col items-start gap-3 border-t border-line px-3.5 py-3 sm:flex-row sm:items-center">
          <QRCodeTicket value={booking.qrValue} size={112} />
          <div className="text-[12px] text-muted">
            <p className="font-semibold text-ink-900">Đưa mã này cho nhân viên soát vé</p>
            <p className="mt-1 max-w-xs">
              Mỗi mã chỉ dùng một lần. Không chụp màn hình và chia sẻ mã cho người khác.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 border-t border-line px-3.5 py-2">
        <button type="button" onClick={() => setShowQr((value) => !value)} className="btn btn-secondary btn-sm">
          <QrCode size={14} />
          {showQr ? "Ẩn QR" : "Xem QR"}
        </button>
        <button type="button" onClick={() => downloadTicketFile(booking, event)} className="btn btn-ghost btn-sm">
          <Download size={14} />
          Tải vé
        </button>
        <Link to={`/events/${event.id}`} className="btn btn-ghost btn-sm">
          Chi tiết
        </Link>
        {canCancel && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(booking)}
            className="btn btn-ghost btn-sm ml-auto text-danger hover:bg-danger-soft"
          >
            <XCircle size={14} />
            Hủy vé
          </button>
        )}
        {isPast && booking.status === "used" && (
          <span className="ml-auto text-[11px] text-muted-2">Vé đã sử dụng</span>
        )}
      </div>
    </article>
  );
}
