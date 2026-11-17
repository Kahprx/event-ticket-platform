import { Check } from "lucide-react";

export default function Stepper({ current = 0, steps = ["Chọn vé", "Thanh toán", "Hoàn tất"] }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-3">
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${
                done ? "bg-ink-900 text-white" : active ? "bg-accent text-white" : "bg-paper-2 text-muted"
              }`}
            >
              {done ? <Check size={14} /> : index + 1}
            </span>
            <span
              className={`truncate text-[11px] font-medium sm:text-[12px] ${
                active ? "text-ink-900" : done ? "text-ink-700" : "text-muted"
              }`}
            >
              {label}
            </span>
            {index < steps.length - 1 && <span className="mx-0.5 h-px w-5 bg-line sm:mx-1 sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}
