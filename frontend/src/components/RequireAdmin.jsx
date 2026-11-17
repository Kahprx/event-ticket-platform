import { Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/appStore.js";

// Chặn toàn bộ route /admin nếu người dùng hiện tại không có vai trò ADMIN.
export default function RequireAdmin({ children }) {
  const user = useAppStore((state) => state.user);
  const location = useLocation();

  if (user?.role !== "ADMIN") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, needAdmin: true }}
      />
    );
  }

  return children;
}
