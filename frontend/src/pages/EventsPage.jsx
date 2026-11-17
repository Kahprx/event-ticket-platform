import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarDays, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { categories, events } from "../data/events.js";
import { useAppStore } from "../store/appStore.js";
import { useMockLoad } from "../hooks/useMockLoad.js";
import {
  SORT_OPTIONS,
  isWithinDateRange,
  matchesPriceRange,
  sortEvents,
} from "../utils/filters.js";
import EventGrid from "../components/EventGrid.jsx";
import FilterPanel from "../components/FilterPanel.jsx";
import SearchBar from "../components/SearchBar.jsx";
import CategoryChip from "../components/CategoryChip.jsx";
import Pagination from "../components/Pagination.jsx";
import EmptyState from "../components/EmptyState.jsx";

const PAGE_SIZE = 6;

const defaultFilters = {
  category: "all",
  locationId: "all",
  dateRange: "all",
  priceRange: "all",
};

export default function EventsPage() {
  const [params, setParams] = useSearchParams();
  const storeLocation = useAppStore((state) => state.locationId);

  const [query, setQuery] = useState(params.get("q") || "");
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    category: params.get("category") || "all",
    locationId: params.get("location") || storeLocation,
  }));
  const [sort, setSort] = useState("soonest");
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Khi đổi khu vực ở thanh điều hướng, cập nhật bộ lọc nếu chưa chọn từ URL.
  useEffect(() => {
    if (!params.get("location")) {
      setFilters((current) => ({ ...current, locationId: storeLocation }));
    }
  }, [storeLocation]);

  useEffect(() => {
    setQuery(params.get("q") || "");
    setFilters((current) => ({
      ...current,
      category: params.get("category") || "all",
      locationId: params.get("location") || storeLocation,
    }));
    setPage(1);
  }, [params.get("q"), params.get("category"), params.get("location")]);

  const result = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    let list = events.filter((event) => event.status !== "ended");

    if (keyword) {
      list = list.filter((event) =>
        [event.name, event.artist, event.venue, event.address, ...(event.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(keyword),
      );
    }
    if (filters.category !== "all") {
      list = list.filter((event) => event.category === filters.category);
    }
    if (filters.locationId !== "all") {
      list = list.filter((event) => event.locationId === filters.locationId);
    }
    list = list.filter(
      (event) =>
        isWithinDateRange(event, filters.dateRange) &&
        matchesPriceRange(event, filters.priceRange),
    );

    return sortEvents(list, sort);
  }, [query, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(result.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = result.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const loading = useMockLoad(380, [query, JSON.stringify(filters), sort, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query, filters, sort]);

  const resetAll = () => {
    setQuery("");
    setFilters(defaultFilters);
    setSort("soonest");
    setParams({});
  };

  const changeCategory = (id) => {
    setFilters((current) => ({ ...current, category: id }));
    const next = new URLSearchParams(params);
    if (id === "all") next.delete("category");
    else next.set("category", id);
    setParams(next, { replace: true });
  };

  const activeFilterCount =
    (filters.locationId !== "all" ? 1 : 0) +
    (filters.dateRange !== "all" ? 1 : 0) +
    (filters.priceRange !== "all" ? 1 : 0);

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Khám phá</p>
        <h1 className="mt-1.5 font-display text-2xl font-extrabold text-ink-900 sm:text-[30px]">
          Sự kiện âm nhạc
        </h1>
        <p className="mt-2 text-[13px] text-muted">
          Tìm đêm nhạc phù hợp với thành phố, thời gian và ngân sách của bạn.
        </p>
      </div>

      <SearchBar value={query} onChange={setQuery} onSubmit={setQuery} className="max-w-3xl" />

      <div className="no-scrollbar -mx-5 mt-4 flex gap-1.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            active={filters.category === category.id}
            onClick={() => changeCategory(category.id)}
          >
            {category.name}
          </CategoryChip>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
        {/* Bộ lọc cố định trên desktop */}
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onReset={resetAll}
          className="hidden self-start lg:block"
        />

        <div className="min-w-0">
          {/* Bộ lọc gập trên tablet / mobile */}
          <div className="mb-4 lg:hidden">
            <button
              type="button"
              onClick={() => setShowMobileFilters((value) => !value)}
              className="btn btn-secondary btn-block"
              aria-expanded={showMobileFilters}
            >
              <SlidersHorizontal size={15} />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="ml-1 grid h-5 w-5 place-items-center rounded-full bg-accent text-[11px] text-white">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown size={14} className={`ml-auto ${showMobileFilters ? "rotate-180" : ""}`} />
            </button>
            {showMobileFilters && (
              <div className="mt-2">
                <FilterPanel filters={filters} onChange={setFilters} onReset={resetAll} />
              </div>
            )}
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-muted" aria-live="polite">
              {loading ? "Đang tìm sự kiện..." : (
                <>
                  <strong className="text-ink-900">{result.length}</strong> sự kiện
                  {query && <> cho “{query}”</>}
                </>
              )}
            </p>
            <label className="flex items-center gap-2 text-[12px] text-muted">
              Sắp xếp
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="select h-9 w-auto py-0 text-[12px]"
                aria-label="Sắp xếp sự kiện"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!loading && result.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Không tìm thấy sự kiện phù hợp"
              description="Thử bỏ bớt một vài bộ lọc hoặc tìm với từ khóa khác."
              actionLabel="Xóa bộ lọc"
              onAction={resetAll}
            />
          ) : (
            <EventGrid events={pageItems} loading={loading} />
          )}

          {!loading && totalPages > 1 && (
            <div className="mt-7">
              <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </div>
      </div>

      <p className="mt-10 border-t border-line pt-4 text-[11px] text-muted-2">
        Dữ liệu sự kiện trong bản demo được lưu cục bộ. Khi có API, chỉ cần thay mảng
        <code className="mx-1 rounded bg-paper-2 px-1 py-0.5">events</code>
        bằng dữ liệu trả về.
      </p>
    </div>
  );
}
