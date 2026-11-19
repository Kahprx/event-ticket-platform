import { create } from "zustand";
import { initialBookings, initialProfile } from "../data/bookings.js";

const readLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Bỏ qua nếu trình duyệt chặn localStorage (chế độ riêng tư).
  }
};

let toastId = 0;

// Store dùng chung cho dữ liệu nhỏ: khu vực đang chọn, hồ sơ demo, vé và toast.
export const useAppStore = create((set, get) => ({
  locationId: localStorage.getItem("sp-location") || "hcm",
  setLocation: (locationId) => {
    localStorage.setItem("sp-location", locationId);
    set({ locationId });
  },

  user: readLocal("sp-user", initialProfile),
  updateUser: (patch) =>
    set((state) => {
      const user = { ...state.user, ...patch };
      writeLocal("sp-user", user);
      return { user };
    }),

  bookings: readLocal("sp-bookings", initialBookings),
  addBooking: (booking) =>
    set((state) => {
      const bookings = [booking, ...state.bookings];
      writeLocal("sp-bookings", bookings);
      return { bookings };
    }),
  cancelBooking: (id) =>
    set((state) => {
      const bookings = state.bookings.map((booking) =>
        booking.id === id ? { ...booking, status: "cancelled" } : booking,
      );
      writeLocal("sp-bookings", bookings);
      return { bookings };
    }),

  toasts: [],
  pushToast: (toast) => {
    const id = ++toastId;
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }));
    setTimeout(() => get().removeToast(id), toast.duration || 3800);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
