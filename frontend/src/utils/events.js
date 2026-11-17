import { getCategory, getLocation } from "../data/events.js";

export const eventLocationName = (event) => getLocation(event.locationId)?.name || "Đang cập nhật";

export const eventCategoryName = (event) => getCategory(event.category)?.name || "Khác";

export const remainingTickets = (event) =>
  (event.ticketTypes || []).reduce((sum, type) => sum + Math.max(0, type.total - type.sold), 0);

export const isSoldOut = (event) => remainingTickets(event) === 0;

export const soldPercent = (event) => {
  if (!event.capacity) return 0;
  return Math.min(100, Math.round((event.sold / event.capacity) * 100));
};

export const minTicketPrice = (event) =>
  (event.ticketTypes || []).reduce(
    (min, type) => (type.price < min ? type.price : min),
    event.ticketTypes?.[0]?.price ?? event.priceFrom,
  );

export const ticketStatus = (type) => {
  const remaining = Math.max(0, type.total - type.sold);
  if (remaining === 0) return "sold-out";
  if (remaining <= type.total * 0.15) return "low";
  return "available";
};
