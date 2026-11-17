import { NavLink } from "react-router-dom";
import { CalendarDays, Home, MessageCircle, Ticket, UserRound } from "lucide-react";

const items = [
  { to: "/", label: "Trang chủ", icon: Home, end: true },
  { to: "/events", label: "Sự kiện", icon: CalendarDays },
  { to: "/my-tickets", label: "Vé", icon: Ticket },
  { to: "/chatbot", label: "Trợ lý", icon: MessageCircle },
  { to: "/profile", label: "Tài khoản", icon: UserRound },
];

export default function MobileNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Điều hướng nhanh"
    >
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                  isActive ? "text-accent" : "text-muted"
                }`
              }
            >
              <Icon size={19} strokeWidth={1.9} />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
