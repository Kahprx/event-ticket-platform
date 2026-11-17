import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Ticket,
  UserRound,
  X,
} from "lucide-react";
import Brand from "./Brand.jsx";
import LocationSelector from "./LocationSelector.jsx";
import { useAppStore } from "../store/appStore.js";

const navItems = [
  { to: "/events", label: "Sự kiện" },
  { to: "/my-tickets", label: "Vé của tôi" },
  { to: "/chatbot", label: "Trợ lý AI" },
];

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function Navbar() {
  const user = useAppStore((state) => state.user);
  const signOut = useAppStore((state) => state.signOut);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const linkClass = ({ isActive }) =>
    `relative py-2 text-[13px] font-medium transition ${
      isActive ? "text-white" : "text-white/60 hover:text-white"
    }`;

  const handleSignOut = () => {
    signOut();
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950">
      <div className="container-page flex h-16 items-center gap-5">
        <Brand />

        <nav className="ml-4 hidden items-center gap-6 md:flex" aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-accent" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <div className="hidden md:block">
            <LocationSelector variant="dark" />
          </div>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1 pl-1 pr-2.5 text-white hover:bg-white/10"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-[11px] font-bold">
                  {initials(user.name)}
                </span>
                <span className="hidden max-w-[110px] truncate text-[12px] font-medium lg:inline">{user.name}</span>
                <ChevronDown size={13} className={`hidden transition lg:block ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-pop"
                  role="menu"
                >
                  <div className="border-b border-line px-3 py-2.5">
                    <p className="truncate text-[13px] font-semibold text-ink-900">{user.name}</p>
                    <p className="truncate text-[11px] text-muted">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-ink-800 hover:bg-paper"
                    role="menuitem"
                  >
                    <UserRound size={15} className="text-muted" />
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/my-tickets"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-ink-800 hover:bg-paper"
                    role="menuitem"
                  >
                    <Ticket size={15} className="text-muted" />
                    Vé của tôi
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-ink-800 hover:bg-paper"
                      role="menuitem"
                    >
                      <LayoutDashboard size={15} className="text-muted" />
                      Khu vực quản trị
                    </Link>
                  )}
                  <div className="my-1 border-t border-line" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-ink-800 hover:bg-paper"
                    role="menuitem"
                  >
                    <LogOut size={15} className="text-muted" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Đăng nhập
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white hover:bg-white/10 md:hidden"
            aria-label="Mở menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 md:hidden">
          <div className="container-page space-y-3 py-4">
            <LocationSelector variant="dark" full align="left" />
            <nav className="grid gap-1" aria-label="Điều hướng di động">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-[14px] font-medium ${
                      isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-[14px] font-medium text-white/70 hover:bg-white/5"
              >
                Hồ sơ cá nhân
              </NavLink>
              {user?.role === "ADMIN" && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-[14px] font-medium text-white/70 hover:bg-white/5"
                >
                  Khu vực quản trị
                </NavLink>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
