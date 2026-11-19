import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { categories, getEventCountByCategory, locations } from "../data/events.js";
import CategoryChip from "./CategoryChip.jsx";
import { DATE_RANGES, PRICE_RANGES } from "../utils/filters.js";

export default function FilterPanel({ filters, onChange, onReset, className = "" }) {
  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <aside className={`card p-4 ${className}`} aria-label="Bộ lọc sự kiện">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
          <SlidersHorizontal size={16} />
          Bộ lọc
        </h2>
        <button type="button" onClick={onReset} className="text-[12px] font-medium text-muted hover:text-ink-900">
          <span className="inline-flex items-center gap-1">
            <RotateCcw size={12} />
            Đặt lại
          </span>
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted-2">Thể loại</p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                active={filters.category === category.id}
                onClick={() => update({ category: category.id })}
                count={category.id === "all" ? undefined : getEventCountByCategory(category.id)}
              >
                {category.name}
              </CategoryChip>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-muted-2" htmlFor="filter-location">
            Khu vực
          </label>
          <select
            id="filter-location"
            value={filters.locationId}
            onChange={(event) => update({ locationId: event.target.value })}
            className="select"
          >
            <option value="all">Tất cả khu vực</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-muted-2" htmlFor="filter-date">
            Thời gian
          </label>
          <select
            id="filter-date"
            value={filters.dateRange}
            onChange={(event) => update({ dateRange: event.target.value })}
            className="select"
          >
            {DATE_RANGES.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted-2">Mức giá</p>
          <div className="space-y-1.5">
            {PRICE_RANGES.map((range) => (
              <label
                key={range.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-[13px] text-ink-700 hover:bg-paper"
              >
                <input
                  type="radio"
                  name="price-range"
                  value={range.id}
                  checked={filters.priceRange === range.id}
                  onChange={() => update({ priceRange: range.id })}
                  className="h-3.5 w-3.5 accent-[#e4572e]"
                />
                {range.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
