import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }).map((_, index) => index + 1);

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Phân trang">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="grid h-8 w-8 place-items-center rounded-md border border-line bg-white text-ink-700 disabled:opacity-40"
        aria-label="Trang trước"
      >
        <ChevronLeft size={15} />
      </button>
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          aria-current={item === page ? "page" : undefined}
          className={`h-8 min-w-8 rounded-md border px-2 text-[13px] font-medium ${
            item === page
              ? "border-ink-900 bg-ink-900 text-white"
              : "border-line bg-white text-ink-700 hover:border-[#c9c2b4]"
          }`}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="grid h-8 w-8 place-items-center rounded-md border border-line bg-white text-ink-700 disabled:opacity-40"
        aria-label="Trang sau"
      >
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}
