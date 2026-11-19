import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  Share2,
  Star,
  Ticket,
  UserRound,
} from "lucide-react";
import { events, getEventById, getLocation } from "../data/events.js";
import { eventCategoryName, eventLocationName, minTicketPrice, remainingTickets } from "../utils/events.js";
import { formatLongDate, formatTime, formatVnd } from "../utils/format.js";
import { useMockLoad } from "../hooks/useMockLoad.js";
import { useAppStore } from "../store/appStore.js";
import EventGrid from "../components/EventGrid.jsx";
import EmptyState from "../components/EmptyState.jsx";
import TicketTypeCard from "../components/TicketTypeCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

function Cover({ event }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative h-48 w-full overflow-hidden bg-ink-900 sm:h-64 lg:h-80" style={{ backgroundColor: event.tone }}>
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent" />
      {!failed && (
        <img
          src={event.image}
          alt=""
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

function MapPanel({ event }) {
  const location = getLocation(event.locationId);
  const lat = location?.lat || 10.7769;
  const lng = location?.lng || 106.7009;
  const span = 0.012;
  const bbox = `${lng - span},${lat - span * 0.65},${lng + span},${lat + span * 0.65}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div>
      <div className="h-64 overflow-hidden rounded-lg border border-line bg-paper-2">
        <iframe
          title={`Bản đồ ${event.venue}`}
          src={src}
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-ink-900">{event.venue}</p>
          <p className="mt-0.5 text-[12px] text-muted">{event.address}</p>
        </div>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
        >
          Mở bản đồ lớn
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = getEventById(id);
  const locationId = useAppStore((state) => state.locationId);
  const pushToast = useAppStore((state) => state.pushToast);
  const loading = useMockLoad(300, [id]);

  if (!event) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={Ticket}
          title="Không tìm thấy sự kiện"
          description="Sự kiện có thể đã bị xóa hoặc đường dẫn không đúng."
          actionLabel="Về danh sách sự kiện"
          actionTo="/events"
        />
      </div>
    );
  }

  const soldOut = remainingTickets(event) === 0;
  const ended = event.status === "ended";
  const related = events
    .filter((item) => item.id !== event.id && item.status !== "ended" && item.locationId === event.locationId)
    .slice(0, 3);
  const fallbackRelated = related.length > 0 ? related : [];

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: event.name, text: `Xem ${event.name} trên Soundpass`, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        pushToast({ type: "success", title: "Đã sao chép liên kết", message: "Bạn có thể dán vào tin nhắn để chia sẻ." });
      }
    } catch {
      // Người dùng hủy chia sẻ hoặc trình duyệt chặn clipboard — không cần báo lỗi.
    }
  };

  return (
    <>
      <div className="relative">
        <Cover event={event} />
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-page pb-5">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/70">
              <Link to="/events" className="inline-flex items-center gap-1 hover:text-white">
                <ArrowLeft size={12} /> Sự kiện
              </Link>
              <span>/</span>
              <span>{eventCategoryName(event)}</span>
            </div>
            <h1 className="mt-2 max-w-3xl font-display text-[26px] font-extrabold text-white sm:text-[36px]">
              {event.name}
            </h1>
            <p className="mt-1.5 text-[13px] text-white/75 sm:text-sm">{event.artist}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="badge badge-accent bg-white/95 text-accent-dark">{eventCategoryName(event)}</span>
              <span className="badge bg-white/15 text-white">
                <Star size={11} fill="currentColor" /> {event.rating}
              </span>
              {ended && <span className="badge badge-neutral">Đã kết thúc</span>}
              {soldOut && !ended && <span className="badge badge-danger">Hết vé</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="min-w-0">
            {loading ? (
              <div className="space-y-4">
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-32 w-full" />
                <div className="skeleton h-4 w-60" />
              </div>
            ) : (
              <>
                <section>
                  <h2 className="text-lg font-bold text-ink-900">Về sự kiện</h2>
                  <div className="mt-3 space-y-3 text-[14px] leading-7 text-ink-700">
                    {event.description.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {event.highlights.map((item) => (
                      <span key={item} className="chip text-[12px]">{item}</span>
                    ))}
                  </div>
                </section>

                <hr className="divider my-7" />

                <section>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-ink-900">Vé và khu vực</h2>
                      <p className="mt-1 text-[12px] text-muted">
                        Giá chưa gồm phí dịch vụ 2%. Còn {remainingTickets(event)} vé.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {event.ticketTypes.map((type) => (
                      <TicketTypeCard
                        key={type.id}
                        type={type}
                        onSelect={() => navigate(`/events/${event.id}/select`)}
                        ctaLabel="Chọn vé này"
                      />
                    ))}
                  </div>
                  {event.seating?.type === "seated" && (
                    <p className="mt-2 text-[12px] text-muted">
                      Bạn sẽ chọn ghế cụ thể trên sơ đồ ở bước tiếp theo.
                    </p>
                  )}
                </section>

                <hr className="divider my-7" />

                <section>
                  <h2 className="text-lg font-bold text-ink-900">Địa điểm</h2>
                  <div className="mt-3">
                    <MapPanel event={event} />
                  </div>
                </section>

                <hr className="divider my-7" />

                <section>
                  <h2 className="text-lg font-bold text-ink-900">Ban tổ chức</h2>
                  <div className="card mt-3 flex flex-wrap items-start gap-4 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ink-900 text-white">
                      <UserRound size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-ink-900">{event.organizer.name}</p>
                      <p className="mt-1 text-[12px] leading-5 text-muted">{event.organizer.description}</p>
                      <p className="mt-2 text-[12px] text-muted">
                        {event.organizer.phone} · {event.organizer.email}
                      </p>
                    </div>
                  </div>
                </section>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button type="button" onClick={share} className="btn btn-secondary btn-sm">
                    <Share2 size={14} /> Chia sẻ
                  </button>
                  <Link to="/chatbot" className="btn btn-ghost btn-sm">
                    Hỏi trợ lý về sự kiện này
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Thông tin đặt vé luôn nổi trên desktop */}
          <aside className="lg:sticky lg:top-20">
            <div className="card overflow-hidden">
              <div className="border-b border-line bg-ink-900 p-4 text-white">
                <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">Giá vé từ</p>
                <p className="mt-0.5 font-display text-2xl font-extrabold">{formatVnd(minTicketPrice(event))}</p>
                <p className="mt-1 text-[11px] text-white/55">Đến {formatVnd(event.priceTo || event.priceFrom)}</p>
              </div>
              <div className="p-4">
                <ul className="space-y-3 text-[13px]">
                  <li className="flex gap-2.5">
                    <CalendarDays size={16} className="mt-0.5 shrink-0 text-accent" />
                    <span>
                      <span className="block font-semibold text-ink-900">{formatLongDate(event.date)}</span>
                      <span className="text-muted">Bắt đầu {formatTime(event.time)}</span>
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <Clock3 size={16} className="mt-0.5 shrink-0 text-accent" />
                    <span>
                      <span className="block font-semibold text-ink-900">
                        {formatTime(event.time)} – {formatTime(event.endTime)}
                      </span>
                      <span className="text-muted">Thời gian dự kiến</span>
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />
                    <span>
                      <span className="block font-semibold text-ink-900">{event.venue}</span>
                      <span className="text-muted">{eventLocationName(event)}</span>
                    </span>
                  </li>
                </ul>

                <button
                  type="button"
                  disabled={ended || soldOut}
                  onClick={() => navigate(`/events/${event.id}/select`)}
                  className="btn btn-primary btn-block btn-lg mt-5"
                >
                  <Ticket size={17} />
                  {ended ? "Sự kiện đã kết thúc" : soldOut ? "Tạm hết vé" : "Chọn vé"}
                </button>
                <p className="mt-2 text-center text-[11px] leading-4 text-muted">
                  Chỗ được giữ 10 phút sau khi bạn bấm tiếp tục.
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-line bg-white p-3 text-[12px] text-muted">
              <p className="font-semibold text-ink-900">Lưu ý khi tham dự</p>
              <ul className="mt-1.5 list-inside list-disc space-y-1">
                <li>Xuất trình mã QR tại cổng soát vé.</li>
                <li>Đến trước giờ diễn 20–30 phút.</li>
                <li>Vé đã mua không hoàn lại, trừ trường hợp hủy sớm.</li>
              </ul>
            </div>
          </aside>
        </div>

        {fallbackRelated.length > 0 && (
          <div className="mt-14 border-t border-line pt-8">
            <SectionHeader
              eyebrow="Có thể bạn thích"
              title={`Sự kiện khác tại ${getLocation(locationId)?.shortName || "khu vực của bạn"}`}
              actionLabel="Xem thêm"
              actionTo="/events"
            />
            <EventGrid events={fallbackRelated} />
          </div>
        )}
      </div>
    </>
  );
}
