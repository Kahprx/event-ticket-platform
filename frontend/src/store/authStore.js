import { create } from "zustand";

const TOKEN_KEY = "event-platform-token";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  setSession: ({ user, token }) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  },
}));
