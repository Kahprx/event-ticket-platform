import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  ReceiptText,
  Ticket,
  Users,
  X,
} from "lucide-react";
import Brand from "../components/Brand.jsx";
import ToastStack from "../components/Toast.jsx";
import { useAppStore } from "../store/appStore.js";

const links = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/admin/events", label: "Sự kiện", icon: CalendarDays },
  { to: "/admin/tickets", label: "Quản lý vé", icon: Ticket },
  { to: "/admin/orders", label: "Đơn hàng", icon: ReceiptText },
  { to: "/admin/users", label: "Người dùng", icon: Users },
  { to: "/admin/locations", label: "Địa điểm", icon: MapPin },
  { to: "/admin/chatbot", label: "Chatbot", icon: Bot },
  { to: "/admin/reports", label: "Báo cáo", icon: BarChart3 },
];

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="px-4 py-5">
        <Brand />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
          Khu vực quản trị
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 px-2" aria-label="Điều hướng quản trị">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition ${
                  isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={16} strokeWidth={1.9} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-3 border-t border-white/10 p-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md px-2 py-2 text-[12px] font-medium text-white/60 hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft size={14} />
          Về trang người dùng
        </Link>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const user = useAppStore((state) => state.user);
  const signOut = useAppStore((state) => state.signOut);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-ink-950 lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-ink-950">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/10"
              aria-label="Đóng menu"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-md border border-line text-ink-700 lg:hidden"
            aria-label="Mở menu quản trị"
          >
            <Menu size={17} />
          </button>
          <p className="text-[13px] text-muted">
            Quản trị <span className="mx-1 text-muted-2">/</span>
            <span className="font-medium text-ink-900">Soundpass</span>
          </p>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="badge badge-accent hidden sm:inline-flex">ADMIN</span>
            <span className="hidden text-[12px] text-muted sm:inline">{user?.name}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-[11px] font-bold text-white">
              {user?.name ? user.name.split(" ").slice(-1)[0][0] : "A"}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="btn btn-ghost btn-sm px-2"
              aria-label="Đăng xuất"
              title="Đăng xuất"
            >
              <LogOut size={15} />
              <span className="hidden lg:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <ToastStack />
    </div>
  );
}
