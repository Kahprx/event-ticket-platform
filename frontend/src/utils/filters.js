import { parseEventDate } from "./format.js";

export const PRICE_RANGES = [
  { id: "all", label: "Tất cả mức giá" },
  { id: "under-300", label: "Dưới 300.000 ₫", min: 0, max: 300000 },
  { id: "300-500", label: "300.000 – 500.000 ₫", min: 300000, max: 500000 },
  { id: "500-1000", label: "500.000 – 1.000.000 ₫", min: 500000, max: 1000000 },
  { id: "over-1000", label: "Trên 1.000.000 ₫", min: 1000000, max: Infinity },
];

export const DATE_RANGES = [
  { id: "all", label: "Mọi thời điểm" },
  { id: "weekend", label: "Cuối tuần này" },
  { id: "month", label: "Trong 30 ngày tới" },
  { id: "quarter", label: "Trong 3 tháng tới" },
];

export const SORT_OPTIONS = [
  { id: "soonest", label: "Sắp diễn ra" },
  { id: "price-asc", label: "Giá thấp đến cao" },
  { id: "price-desc", label: "Giá cao đến thấp" },
  { id: "popular", label: "Bán chạy" },
];

const upcomingWeekendRange = () => {
  const today = new Date();
  const day = today.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  saturday.setHours(0, 0, 0, 0);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 0);
  return [saturday, sunday];
};

export const isWithinDateRange = (event, rangeId) => {
  if (rangeId === "all") return true;
  const eventDate = parseEventDate(event.date, event.time);
  const today = new Date();

  if (rangeId === "weekend") {
    const [saturday, sunday] = upcomingWeekendRange();
    return eventDate >= saturday && eventDate <= sunday;
  }

  if (rangeId === "month") {
    const limit = new Date(today);
    limit.setDate(today.getDate() + 30);
    return eventDate >= today && eventDate <= limit;
  }

  if (rangeId === "quarter") {
    const limit = new Date(today);
    limit.setDate(today.getDate() + 90);
    return eventDate >= today && eventDate <= limit;
  }

  return true;
};

export const matchesPriceRange = (event, rangeId) => {
  if (rangeId === "all") return true;
  const range = PRICE_RANGES.find((entry) => entry.id === rangeId);
  if (!range) return true;
  return event.priceFrom >= range.min && event.priceFrom < range.max;
};

export const sortEvents = (list, sortId) => {
  const copy = [...list];
  if (sortId === "price-asc") return copy.sort((a, b) => a.priceFrom - b.priceFrom);
  if (sortId === "price-desc") return copy.sort((a, b) => b.priceFrom - a.priceFrom);
  if (sortId === "popular") return copy.sort((a, b) => b.sold - a.sold);
  return copy.sort((a, b) => parseEventDate(a.date, a.time) - parseEventDate(b.date, b.time));
};
