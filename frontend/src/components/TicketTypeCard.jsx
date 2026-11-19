import { formatVnd } from "../utils/format.js";
import { ticketStatus } from "../utils/events.js";
import QuantityStepper from "./QuantityStepper.jsx";

export default function TicketTypeCard({ type, quantity = 0, onQuantityChange, onSelect, ctaLabel }) {
  const status = ticketStatus(type);
  const remaining = Math.max(0, type.total - type.sold);
  const disabled = status === "sold-out";

  return (
    <div className={`rounded-lg border p-3.5 ${disabled ? "border-line bg-paper/70" : "border-line bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${disabled ? "text-muted" : "text-ink-900"}`}>{type.name}</p>
          {type.note && <p className="mt-0.5 text-[12px] text-muted">{type.note}</p>}
          <p className={`mt-1 text-[11px] ${status === "low" ? "text-warning" : "text-muted-2"}`}>
            {disabled ? "Đã bán hết" : status === "low" ? `Chỉ còn ${remaining} vé` : `Còn ${remaining} vé`}
          </p>
        </div>
        <p className={`shrink-0 text-[15px] font-bold ${disabled ? "text-muted" : "text-ink-900"}`}>
          {formatVnd(type.price)}
        </p>
      </div>

      {onQuantityChange && !disabled && (
        <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3">
          <span className="text-[12px] text-muted">Số lượng</span>
          <QuantityStepper
            value={quantity}
            max={Math.min(10, remaining)}
            onChange={(value) => onQuantityChange(Math.max(0, Math.min(value, remaining)))}
          />
        </div>
      )}

      {onSelect && (
        <button
          type="button"
          onClick={onSelect}
          disabled={disabled}
          className="btn btn-secondary btn-sm mt-3 w-full"
        >
          {disabled ? "Hết vé" : ctaLabel || "Chọn khu vực này"}
        </button>
      )}
    </div>
  );
}
