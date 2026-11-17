import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import Brand from "./Brand.jsx";
import { useAppStore } from "../store/appStore.js";

export default function Footer() {
  const user = useAppStore((state) => state.user);

  return (
    <footer className="mt-auto border-t border-white/10 bg-ink-950 pb-24 text-white/70 md:pb-0">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Brand />
          <p className="mt-3 max-w-xs text-[13px] leading-6">
            Nền tảng đặt vé sự kiện âm nhạc theo khu vực. Tìm đêm nhạc gần bạn, chọn chỗ và nhận vé điện tử.
          </p>
          <p className="mt-3 text-[11px] text-white/40">Đồ án môn Công nghệ phần mềm · Nhóm 04</p>
        </div>

        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-white">Khám phá</h3>
          <ul className="mt-3 space-y-2 text-[13px]">
            <li><Link to="/events" className="hover:text-white">Tất cả sự kiện</Link></li>
            <li><Link to="/my-tickets" className="hover:text-white">Vé của tôi</Link></li>
            <li><Link to="/chatbot" className="hover:text-white">Trợ lý AI</Link></li>
            {user?.role === "ADMIN" && (
              <li><Link to="/admin" className="hover:text-white">Khu vực quản trị</Link></li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-white">Hỗ trợ</h3>
          <ul className="mt-3 space-y-2 text-[13px]">
            <li><Link to="/my-tickets" className="hover:text-white">Chính sách hủy vé</Link></li>
            <li><Link to="/chatbot" className="hover:text-white">Câu hỏi thường gặp</Link></li>
            <li><Link to="/profile" className="hover:text-white">Tài khoản và bảo mật</Link></li>
            <li><a href="mailto:hotro@soundpass.vn" className="hover:text-white">hotro@soundpass.vn</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-white">Liên hệ</h3>
          <ul className="mt-3 space-y-2.5 text-[13px]">
            <li className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0 text-white/40" />
              26 Lý Tự Trọng, Quận 1, TP. Hồ Chí Minh
            </li>
            <li className="flex items-center gap-2">
              <Phone size={15} className="shrink-0 text-white/40" />
              028 7300 2026
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="shrink-0 text-white/40" />
              hotro@soundpass.vn
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-4 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Soundpass. Dự án học tập, không dùng cho mục đích thương mại.</p>
          <p>Điều khoản sử dụng · Chính sách bảo mật</p>
        </div>
      </div>
    </footer>
  );
}
