import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SectionHeader({ eyebrow, title, description, actionLabel, actionTo, actionOnClick }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
        )}
        <h2 className="text-2xl font-bold text-ink-900 sm:text-[28px]">{title}</h2>
        {description && <p className="mt-2 text-sm leading-6 text-muted">{description}</p>}
      </div>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-secondary btn-sm">
          {actionLabel}
          <ArrowRight size={14} />
        </Link>
      )}
      {actionLabel && actionOnClick && (
        <button type="button" onClick={actionOnClick} className="btn btn-secondary btn-sm">
          {actionLabel}
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
