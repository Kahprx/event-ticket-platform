import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import { formatDate, formatTime, formatVnd } from "../utils/format.js";
import { eventLocationName, minTicketPrice } from "../utils/events.js";

export default function RecommendationCard({ event, onSelect }) {
  return (
    <Link
      to={`/events/${event.id}`}
      onClick={onSelect}
      className="flex items-stretch gap-2.5 overflow-hidden rounded-lg border border-line bg-white transition hover:border-[#cfc8ba]"
    >
      <div className="h-auto w-16 shrink-0 bg-ink-900">
        <img
          src={event.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
      <div className="min-w-0 flex-1 py-2 pr-2">
        <p className="truncate text-[13px] font-semibold text-ink-900">{event.name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
          <CalendarDays size={11} />
          {formatDate(event.date)} · {formatTime(event.time)}
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted">
          <MapPin size={11} />
          {event.venue}, {eventLocationName(event)}
        </p>
        <p className="mt-1 text-[12px] font-semibold text-accent-dark">Từ {formatVnd(minTicketPrice(event))}</p>
      </div>
    </Link>
  );
}
