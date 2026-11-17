import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { getEventCountByLocation, locations } from "../data/events.js";
import { useAppStore } from "../store/appStore.js";

export default function LocationSelector({ variant = "light", full = false, align = "right" }) {
  const locationId = useAppStore((state) => state.locationId);
  const setLocation = useAppStore((state) => state.setLocation);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = locations.find((location) => location.id === locationId) || locations[0];
  const isDark = variant === "dark";

  return (
    <div className={`relative ${full ? "w-full" : ""}`} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`inline-flex h-9 w-full items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition ${
          isDark
            ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
            : "border-line bg-white text-ink-800 hover:border-[#c9c2b4]"
        }`}
      >
        <MapPin size={15} className={isDark ? "text-white/70" : "text-accent"} />
        <span className="truncate">{current.name}</span>
        <ChevronDown size={14} className={`ml-auto shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className={`absolute z-40 mt-1.5 w-64 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-pop ${
            align === "left" ? "left-0" : "right-0"
          }`}
          role="listbox"
        >
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">
            Chọn khu vực
          </p>
          {locations.map((location) => (
            <button
              key={location.id}
              type="button"
              role="option"
              aria-selected={location.id === locationId}
              onClick={() => {
                setLocation(location.id);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-paper"
            >
              <span>
                <span className="block text-[13px] font-medium text-ink-900">{location.name}</span>
                <span className="block text-[11px] text-muted-2">{location.region}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[11px] text-muted-2">{getEventCountByLocation(location.id)} sự kiện</span>
                {location.id === locationId && <Check size={14} className="text-accent" />}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
