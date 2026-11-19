import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  Smartphone,
  Tag,
  Ticket,
  Wallet,
  X,
} from "lucide-react";
import { getEventById } from "../data/events.js";
import { eventLocationName } from "../utils/events.js";
import { createBookingCode, formatLongDate, formatTime, formatVnd } from "../utils/format.js";
import { calculateTotal, findPromo, getSelection } from "../utils/pricing.js";
import { useAppStore } from "../store/appStore.js";
import { useBookingStore } from "../store/bookingStore.js";
import Stepper from "../components/Stepper.jsx";
import PriceSummary from "../components/PriceSummary.jsx";
import EmptyState from "../components/EmptyState.jsx";

const paymentMethods = [
  { id: "MoMo", icon: Smartphone, description: "Quét mã QR trong ứng dụng MoMo" },
  { id: "VNPay", icon: Wallet, description: "Chuyển qua ví điện tử VNPay" },
  { id: "Thẻ ngân hàng", icon: CreditCard, description: "Visa, Mastercard, Napas" },
  { id: "Chuyển khoản", icon: Building2, description: "Chuyển khoản ngân hàng thủ công" },
];

const validateCustomer = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Vui lòng nhập họ tên.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Email chưa hợp lệ.";
  if (!/^0\d{9}$/.test(form.phone.replace(/\s/g, ""))) errors.phone = "Số điện thoại phải có 10 chữ số, bắt đầu bằng 0.";
  return errors;
};

const formatCountdown = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const addBooking = useAppStore((state) => state.addBooking);
  const pushToast = useAppStore((state) => state.pushToast);

  const eventId = useBookingStore((state) => state.eventId);
  const seats = useBookingStore((state) => state.seats);
  const quantities = useBookingStore((state) => state.quantities);
  const storedCustomer = useBookingStore((state) => state.customer);
  const promoCode = useBookingStore((state) => state.promoCode);
  const promoApplied = useBookingStore((state) => state.promoApplied);
  const setCustomer = useBookingStore((state) => state.setCustomer);
  const setPromo = useBookingStore((state) => state.setPromo);
  const resetBooking = useBookingStore((state) => state.resetBooking);

  const event = getEventById(eventId);
  const selection = getSelection(event, seats, quantities);
  const { discount, total } = calculateTotal(selection.subtotal, selection.fee, promoApplied);

  const [form, setForm] = useState(() => ({
    name: storedCustomer.name || user?.name || "",
    email: storedCustomer.email || user?.email || "",
    phone: storedCustomer.phone || user?.phone || "",
  }));
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("MoMo");
  const [promoInput, setPromoInput] = useState(promoCode || "");
  const [promoError, setPromoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(600);

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!event || selection.count === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={Ticket}
          title="Chưa có vé để thanh toán"
          description="Lựa chọn vé của bạn có thể đã hết hạn. Vui lòng chọn lại trước khi thanh toán."
          actionLabel="Chọn vé"
          actionTo={event ? `/events/${event.id}/select` : "/events"}
        />
      </div>
    );
  }

  const updateField = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    setCustomer(next);
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const applyPromo = () => {
    const promo = findPromo(promoInput);
    if (!promo) {
      setPromoError("Mã không hợp lệ. Thử SOUNDPASS10 hoặc SINHVIEN.");
      setPromo("", null);
      return;
    }
    setPromoError("");
    setPromo(promo.code, promo);
    setPromoInput(promo.code);
    pushToast({ type: "success", title: "Áp dụng mã thành công", message: promo.label });
  };

  const removePromo = () => {
    setPromo("", null);
    setPromoInput("");
    setPromoError("");
  };

  const submit = (eventForm) => {
    eventForm?.preventDefault?.();
    if (submitting) return;

    const foundErrors = validateCustomer(form);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) {
      pushToast({ type: "error", title: "Kiểm tra thông tin", message: "Vui lòng sửa các trường được đánh dấu đỏ." });
      return;
    }
    if (secondsLeft === 0) {
      pushToast({ type: "error", title: "Chỗ giữ đã hết hạn", message: "Vui lòng quay lại chọn vé." });
      return;
    }

    setSubmitting(true);

    // Giả lập cổng thanh toán. Khi có backend, thay bằng axios.post('/bookings').
    setTimeout(() => {
      const firstItem = selection.items[0];
      const bookingId = createBookingCode();
      const booking = {
        id: bookingId,
        eventId: event.id,
        status: "confirmed",
        bookedAt: new Date().toISOString(),
        seats,
        zone: firstItem?.id || "",
        zoneName: firstItem?.name || "",
        unitPrice: firstItem?.price || event.priceFrom,
        quantity: selection.count,
        subtotal: selection.subtotal,
        fee: selection.fee,
        discount,
        total,
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.replace(/\s/g, ""),
        },
        paymentMethod,
        // Mã QR phải trùng mã đặt vé.
        qrValue: `SOUNDPASS|${bookingId}|${event.id}|${seats.length ? seats.join(",") : `${firstItem?.id}x${selection.count}`}`,
      };

      addBooking(booking);
      resetBooking();
      navigate(`/payment/success?booking=${bookingId}`, { replace: true });
    }, 1100);
  };

  const fieldClass = (field) => `input ${errors[field] ? "border-danger" : ""}`;

  return (
    <div className="container-page pb-14 pt-7 sm:pt-9">
      <Link to={`/events/${event.id}/select`} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-ink-900">
        <ArrowLeft size={14} />
        Đổi vé / ghế
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Bước 2 / 3</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900 sm:text-[30px]">Thanh toán</h1>
          <p className="mt-1 text-[13px] text-muted">{event.name}</p>
        </div>
        <Stepper current={1} />
      </div>

      <div
        className={`mt-5 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-[12px] ${
          secondsLeft === 0
            ? "border-danger/25 bg-danger-soft text-danger"
            : "border-warning/25 bg-warning-soft text-warning"
        }`}
      >
        <span className="flex items-center gap-2">
          <LockKeyhole size={14} />
          {secondsLeft === 0
            ? "Thời gian giữ chỗ đã hết. Vui lòng chọn lại vé."
            : "Ghế/vé được giữ trong lúc bạn thanh toán."}
        </span>
        <strong className="font-mono text-[13px]">{formatCountdown(secondsLeft)}</strong>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
        <div className="min-w-0 space-y-5">
          {/* Thông tin khách hàng */}
          <section className="card p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-bold text-ink-900">Thông tin người đặt</h2>
              <p className="mt-1 text-[12px] text-muted">Vé điện tử sẽ được gửi đến email này.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="field sm:col-span-2">
                <label className="field-label" htmlFor="customer-name">Họ và tên *</label>
                <input
                  id="customer-name"
                  className={fieldClass("name")}
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Nguyễn Văn A"
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
              <div className="field">
                <label className="field-label" htmlFor="customer-email">Email *</label>
                <input
                  id="customer-email"
                  type="email"
                  className={fieldClass("email")}
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="email@example.com"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>
              <div className="field">
                <label className="field-label" htmlFor="customer-phone">Số điện thoại *</label>
                <input
                  id="customer-phone"
                  type="tel"
                  className={fieldClass("phone")}
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="0901234567"
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>
            </div>
          </section>

          {/* Vé đã chọn */}
          <section className="card p-4 sm:p-5">
            <h2 className="text-base font-bold text-ink-900">Vé đã chọn</h2>
            <div className="mt-3 flex flex-wrap items-start gap-3 rounded-lg bg-paper p-3">
              <img
                src={event.image}
                alt=""
                className="h-14 w-14 shrink-0 rounded-md object-cover"
                onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ink-900">{event.name}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {formatLongDate(event.date)} · {formatTime(event.time)}
                </p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {event.venue}, {eventLocationName(event)}
                </p>
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-[13px]">
              {selection.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="text-muted">
                    {item.name} × {item.quantity}
                    {item.seats?.length > 0 && (
                      <span className="block text-[11px]">Ghế {item.seats.join(", ")}</span>
                    )}
                  </span>
                  <span className="font-semibold text-ink-900">{formatVnd(item.amount)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Mã giảm giá */}
          <section className="card p-4 sm:p-5">
            <h2 className="text-base font-bold text-ink-900">Mã giảm giá</h2>
            <p className="mt-1 text-[12px] text-muted">Demo: SOUNDPASS10 (giảm 10%) hoặc SINHVIEN (giảm 50.000 ₫).</p>
            {promoApplied ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-success/25 bg-success-soft px-3 py-2.5">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-success">
                  <BadgeCheck size={16} />
                  {promoApplied.code} — {promoApplied.label}
                </span>
                <button type="button" onClick={removePromo} className="grid h-7 w-7 place-items-center rounded-md text-success hover:bg-white" aria-label="Xóa mã giảm giá">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
                  <input
                    value={promoInput}
                    onChange={(event) => { setPromoInput(event.target.value.toUpperCase()); setPromoError(""); }}
                    placeholder="Nhập mã"
                    className="input pl-9"
                    aria-label="Mã giảm giá"
                  />
                </div>
                <button type="button" onClick={applyPromo} className="btn btn-secondary shrink-0">Áp dụng</button>
              </div>
            )}
            {promoError && <p className="field-error mt-1.5">{promoError}</p>}
          </section>

          {/* Phương thức thanh toán */}
          <section className="card p-4 sm:p-5">
            <h2 className="text-base font-bold text-ink-900">Phương thức thanh toán</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const active = paymentMethod === method.id;
                return (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                      active ? "border-accent bg-accent-soft/40" : "border-line hover:border-[#cfc8ba]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={method.id}
                      checked={active}
                      onChange={() => setPaymentMethod(method.id)}
                      className="mt-0.5 h-4 w-4 accent-[#e4572e]"
                    />
                    <Icon size={17} className={`mt-0.5 shrink-0 ${active ? "text-accent" : "text-muted"}`} />
                    <span>
                      <span className="block text-[13px] font-semibold text-ink-900">{method.id}</span>
                      <span className="block text-[11px] text-muted">{method.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
              <AlertCircle size={13} />
              Demo không kết nối cổng thanh toán thật. Không nhập thông tin thẻ.
            </p>
          </section>

          <button
            type="submit"
            disabled={submitting || secondsLeft === 0}
            className="btn btn-primary btn-lg w-full lg:hidden"
          >
            {submitting ? "Đang xử lý..." : `Xác nhận thanh toán · ${formatVnd(total)}`}
          </button>
        </div>

        <aside className="lg:sticky lg:top-20">
          <PriceSummary
            items={selection.items}
            subtotal={selection.subtotal}
            fee={selection.fee}
            discount={discount}
            total={total}
            count={selection.count}
            onContinue={submit}
            continueDisabled={submitting || secondsLeft === 0}
            continueLabel={submitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
            note="Bằng cách xác nhận, bạn đồng ý với điều khoản sử dụng và chính sách hủy vé."
          />
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-2">
            <CheckCircle2 size={13} className="text-success" />
            Thông tin được bảo mật · không lưu thông tin thẻ
          </p>
        </aside>
      </form>
    </div>
  );
}
