import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCompactVnd, formatVnd } from "../../utils/format.js";

export function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900">{title}</h1>
        {description && <p className="mt-1.5 text-[13px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ stat }) {
  const positive = stat.trend !== "down";
  const Icon = positive ? TrendingUp : TrendingDown;
  const value = stat.isCurrency ? formatCompactVnd(stat.value) : stat.value.toLocaleString("vi-VN");

  return (
    <div className="card p-4">
      <p className="text-[12px] font-medium text-muted">{stat.label}</p>
      <p className="mt-2 font-display text-[26px] font-extrabold leading-none text-ink-900">{value}</p>
      <p className={`mt-2.5 flex items-center gap-1.5 text-[11px] ${positive ? "text-success" : "text-danger"}`}>
        <Icon size={13} />
        {stat.change}
      </p>
    </div>
  );
}

export function AdminCard({ title, description, actions, children, className = "", bodyClassName = "" }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5">
          <div>
            <h2 className="text-[14px] font-bold text-ink-900">{title}</h2>
            {description && <p className="mt-0.5 text-[12px] text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={bodyClassName || "p-4"}>{children}</div>
    </section>
  );
}

export function TableShell({ children, head }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-line bg-paper/70">
            {head.map((column) => (
              <th key={column} className="whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-2">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Currency({ value }) {
  return <span className="whitespace-nowrap font-medium text-ink-900">{formatVnd(value)}</span>;
}

export function ProgressBar({ value, tone = "accent" }) {
  const color = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-accent";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-2">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
