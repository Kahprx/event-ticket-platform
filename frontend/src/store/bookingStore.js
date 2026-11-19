import { create } from "zustand";

const emptyCustomer = { name: "", email: "", phone: "" };

export const MAX_SEATS_PER_ORDER = 8;

// Giữ lựa chọn vé giữa trang chọn chỗ và trang thanh toán.
export const useBookingStore = create((set) => ({
  eventId: null,
  seats: [],
  quantities: {},
  customer: emptyCustomer,
  promoCode: "",
  promoApplied: null,

  startBooking: (eventId) =>
    set({
      eventId,
      seats: [],
      quantities: {},
      promoCode: "",
      promoApplied: null,
    }),

  toggleSeat: (seatId) =>
    set((state) => {
      if (state.seats.includes(seatId)) {
        return { seats: state.seats.filter((seat) => seat !== seatId) };
      }
      if (state.seats.length >= MAX_SEATS_PER_ORDER) return state;
      return { seats: [...state.seats, seatId] };
    }),

  clearSeats: () => set({ seats: [] }),

  setQuantity: (ticketId, quantity, max = 10) =>
    set((state) => ({
      quantities: {
        ...state.quantities,
        [ticketId]: Math.max(0, Math.min(quantity, max)),
      },
    })),

  setCustomer: (patch) => set((state) => ({ customer: { ...state.customer, ...patch } })),

  setPromo: (promoCode, promoApplied) => set({ promoCode, promoApplied }),

  resetBooking: () =>
    set({
      eventId: null,
      seats: [],
      quantities: {},
      customer: emptyCustomer,
      promoCode: "",
      promoApplied: null,
    }),
}));
