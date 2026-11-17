import { Minus, Plus } from "lucide-react";

export default function QuantityStepper({ value = 0, min = 0, max = 10, onChange }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-line bg-white">
      <button
        type="button"
        onClick={() => onChange?.(value - 1)}
        disabled={value <= min}
        className="grid h-8 w-8 place-items-center rounded-l-lg text-ink-700 hover:bg-paper disabled:opacity-35"
        aria-label="Giảm số lượng"
      >
        <Minus size={14} />
      </button>
      <span className="w-9 text-center text-[13px] font-semibold text-ink-900" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange?.(value + 1)}
        disabled={value >= max}
        className="grid h-8 w-8 place-items-center rounded-r-lg text-ink-700 hover:bg-paper disabled:opacity-35"
        aria-label="Tăng số lượng"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
