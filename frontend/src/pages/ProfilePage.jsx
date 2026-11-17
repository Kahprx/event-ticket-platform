import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import { locations } from "../data/events.js";
import { formatDate } from "../utils/format.js";
import { useAppStore } from "../store/appStore.js";
import BookingCard from "../components/BookingCard.jsx";
import { getEventById } from "../data/events.js";

const notificationOptions = [
  { id: "emailReminder", label: "Nhắc lịch qua email", description: "Gửi email trước sự kiện 24 giờ." },
  { id: "smsReminder", label: "Nhắc lịch qua SMS", description: "Tin nhắn trước sự kiện 3 giờ." },
  { id: "promotions", label: "Ưu đãi và mã giảm giá", description: "Thông tin khuyến mãi từ Soundpass." },
  { id: "newEvents", label: "Sự kiện mới tại khu vực", description: "Nhận gợi ý theo thành phố bạn chọn." },
];

export default function ProfilePage() {
  const user = useAppStore((state) => state.user);
  const bookings = useAppStore((state) => state.bookings);
  const updateUser = useAppStore((state) => state.updateUser);
  const pushToast = useAppStore((state) => state.pushToast);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "hcm",
  });
  const [errors, setErrors] = useState({});
  const [notifications, setNotifications] = useState(user?.notifications || {});

  const recentBookings = bookings.slice(0, 3).map((booking) => ({
    booking,
    event: getEventById(booking.eventId),
  })).filter((item) => item.event);

  const saveProfile = (eventForm) => {
    eventForm.preventDefault();
    const foundErrors = {};
    if (!form.name.trim()) foundErrors.name = "Vui lòng nhập họ tên.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) foundErrors.email = "Email chưa hợp lệ.";
    if (!/^0\d{9}$/.test(form.phone.replace(/\s/g, ""))) foundErrors.phone = "Số điện thoại chưa đúng.";

    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;

    updateUser(form);
    pushToast({ type: "success", title: "Đã lưu hồ sơ", message: "Thông tin cá nhân của bạn đã được cập nhật." });
  };

  const toggleNotification = (id) => {
    setNotifications((current) => ({ ...current, [id]: !current[id] }));
  };

  const saveNotifications = () => {
    updateUser({ notifications });
    pushToast({ type: "success", title: "Đã lưu cài đặt", message: "Tùy chọn thông báo đã được cập nhật." });
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Tài khoản</p>
      <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900 sm:text-[30px]">Hồ sơ cá nhân</h1>
      <p className="mt-1.5 text-[13px] text-muted">Quản lý thông tin, thông báo và lịch sử đặt vé.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0 space-y-5">
          <section className="card p-5">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-ink-900 text-[15px] font-bold text-white">
                {user?.name?.split(" ").slice(-2).map((part) => part[0]).join("").toUpperCase() || "U"}
              </span>
              <div>
                <p className="text-[15px] font-bold text-ink-900">{user?.name}</p>
                <p className="text-[12px] text-muted">Tham gia từ {formatDate(user?.joinedAt || "2026-01-01")}</p>
              </div>
              <span className="badge badge-success ml-auto"><ShieldCheck size={11} /> Đã xác thực email</span>
            </div>

            <form onSubmit={saveProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="field sm:col-span-2">
                <label className="field-label" htmlFor="profile-name">Họ và tên</label>
                <div className="relative">
                  <UserRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
                  <input
                    id="profile-name"
                    className={`input pl-9 ${errors.name ? "border-danger" : ""}`}
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                </div>
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
              <div className="field">
                <label className="field-label" htmlFor="profile-email">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
                  <input
                    id="profile-email"
                    type="email"
                    className={`input pl-9 ${errors.email ? "border-danger" : ""}`}
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                  />
                </div>
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>
              <div className="field">
                <label className="field-label" htmlFor="profile-phone">Số điện thoại</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
                  <input
                    id="profile-phone"
                    type="tel"
                    className={`input pl-9 ${errors.phone ? "border-danger" : ""}`}
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  />
                </div>
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>
              <div className="field sm:col-span-2">
                <label className="field-label" htmlFor="profile-city">Thành phố mặc định</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
                  <select
                    id="profile-city"
                    className="select pl-9"
                    value={form.city}
                    onChange={(event) => setForm({ ...form, city: event.target.value })}
                  >
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
                <p className="field-hint">Khu vực này được dùng để gợi ý sự kiện khi bạn mở trang chủ.</p>
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
              </div>
            </form>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <Bell size={17} className="text-accent" />
              <h2 className="text-base font-bold text-ink-900">Cài đặt thông báo</h2>
            </div>
            <div className="mt-4 divide-y divide-line">
              {notificationOptions.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-start gap-3 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(notifications[option.id])}
                    onChange={() => toggleNotification(option.id)}
                    className="mt-1 h-4 w-4 accent-[#e4572e]"
                  />
                  <span>
                    <span className="block text-[13px] font-semibold text-ink-900">{option.label}</span>
                    <span className="block text-[12px] text-muted">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
            <button type="button" onClick={saveNotifications} className="btn btn-secondary btn-sm mt-2">
              <Check size={14} />
              Lưu cài đặt
            </button>
          </section>

          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink-900">Lịch sử đặt vé</h2>
                <p className="mt-0.5 text-[12px] text-muted">{bookings.length} đơn đặt vé</p>
              </div>
              <Link to="/my-tickets" className="link text-[13px]">Xem tất cả</Link>
            </div>
            {recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.map(({ booking, event }) => (
                  <BookingCard key={booking.id} booking={booking} event={event} />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-line bg-white/60 px-4 py-8 text-center text-[13px] text-muted">
                Bạn chưa có đơn đặt vé nào.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <div className="card p-4">
            <p className="text-[13px] font-bold text-ink-900">Tóm tắt tài khoản</p>
            <dl className="mt-3 space-y-2.5 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted">Tổng đơn</dt>
                <dd className="font-semibold text-ink-900">{bookings.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Đơn thành công</dt>
                <dd className="font-semibold text-ink-900">
                  {bookings.filter((item) => item.status === "confirmed").length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Vé đã sử dụng</dt>
                <dd className="font-semibold text-ink-900">
                  {bookings.filter((item) => item.status === "used").length}
                </dd>
              </div>
            </dl>
            <Link to="/my-tickets" className="btn btn-secondary btn-sm btn-block mt-4">Quản lý vé</Link>
          </div>

          <div className="rounded-lg border border-line bg-white p-4 text-[12px] leading-5 text-muted">
            <p className="font-semibold text-ink-900">Bảo mật tài khoản</p>
            <p className="mt-1.5">
              Không chia sẻ mã QR cho người khác. Nếu nghi ngờ tài khoản bị truy cập trái phép,
              hãy đổi mật khẩu và liên hệ hotro@soundpass.vn.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
