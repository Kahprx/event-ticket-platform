import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import { formatDate, formatTime, formatVnd } from "../utils/format.js";
import {
  eventCategoryName,
  eventLocationName,
  isSoldOut,
  minTicketPrice,
  remainingTickets,
} from "../utils/events.js";

function EventCover({ event, className = "" }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-full w-full" style={{ backgroundColor: event.tone }}>
      <div className="absolute inset-0 grid place-items-center px-4 text-center">
        <span className="font-display text-base font-bold leading-tight text-white/75">{event.name}</span>
      </div>
      {!failed && (
        <img
          src={event.image}
          alt={event.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover ${className}`}
        />
      )}
    </div>
  );
}

export function CompactEventCard({ event, onSelect }) {
  return (
    <Link
      to={`/events/${event.id}`}
      onClick={onSelect}
      className="flex items-center gap-3 rounded-lg border border-line bg-white p-2 transition hover:border-[#cfc8ba]"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md">
        <EventCover event={event} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink-900">{event.name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
          <CalendarDays size={11} />
          {formatDate(event.date)} · {formatTime(event.time)}
        </p>
        <p className="mt-0.5 text-[12px] font-semibold text-accent-dark">Từ {formatVnd(minTicketPrice(event))}</p>
      </div>
    </Link>
  );
}

export default function EventCard({ event, variant = "default" }) {
  if (variant === "compact") return <CompactEventCard event={event} />;

  const soldOut = isSoldOut(event);
  const remaining = remainingTickets(event);

  return (
    <article className="card group flex flex-col overflow-hidden transition hover:border-[#cfc8ba]">
      <Link to={`/events/${event.id}`} className="relative block aspect-[16/10] overflow-hidden bg-ink-900">
        <EventCover
          event={event}
          className="transition duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2 py-1 text-[12px] font-semibold text-ink-900 shadow-sm">
          <CalendarDays size={13} />
          {formatDate(event.date)}
        </span>
        {soldOut ? (
          <span className="badge badge-danger absolute right-3 top-3">Hết vé</span>
        ) : (
          <span className="absolute right-3 top-3 rounded-md bg-ink-950/75 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {eventCategoryName(event)}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[16px] font-bold leading-snug text-ink-900">
          <Link to={`/events/${event.id}`} className="hover:text-accent-dark">
            {event.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-1 text-[13px] text-muted">{event.artist}</p>

        <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-muted">
          <MapPin size={13} className="shrink-0 text-muted-2" />
          <span className="truncate">
            {event.venue}, {eventLocationName(event)}
          </span>
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-[11px] text-muted-2">Giá từ</p>
            <p className="text-[15px] font-bold text-ink-900">{formatVnd(minTicketPrice(event))}</p>
          </div>
          {soldOut ? (
            <span className="text-[12px] font-medium text-danger">Tạm hết vé</span>
          ) : (
            <Link to={`/events/${event.id}`} className="btn btn-primary btn-sm">
              Xem vé
            </Link>
          )}
        </div>

        {!soldOut && remaining <= 120 && (
          <p className="mt-2 text-[11px] font-medium text-warning">Chỉ còn {remaining} vé</p>
        )}
      </div>
    </article>
  );
}
