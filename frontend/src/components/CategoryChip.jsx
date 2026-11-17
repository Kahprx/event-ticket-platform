export default function CategoryChip({ active, children, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip ${active ? "chip-active" : ""}`}
      aria-pressed={active}
    >
      {children}
      {typeof count === "number" && (
        <span className={`text-[11px] ${active ? "text-white/70" : "text-muted-2"}`}>{count}</span>
      )}
    </button>
  );
}
