import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Info, MapPin, ShieldCheck } from "lucide-react";
import { getEventById } from "../data/events.js";
import { eventLocationName } from "../utils/events.js";
import { formatLongDate, formatTime, formatVnd } from "../utils/format.js";
import { calculateTotal, getSelection } from "../utils/pricing.js";
import { MAX_SEATS_PER_ORDER, useBookingStore } from "../store/bookingStore.js";
import { useAppStore } from "../store/appStore.js";
import EmptyState from "../components/EmptyState.jsx";
import Stepper from "../components/Stepper.jsx";
import SeatMap from "../components/SeatMap.jsx";
import TicketTypeCard from "../components/TicketTypeCard.jsx";
import PriceSummary from "../components/PriceSummary.jsx";

export default function SeatSelectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = getEventById(id);

  const eventId = useBookingStore((state) => state.eventId);
  const seats = useBookingStore((state) => state.seats);
  const quantities = useBookingStore((state) => state.quantities);
  const promoApplied = useBookingStore((state) => state.promoApplied);
  const startBooking = useBookingStore((state) => state.startBooking);
  const toggleSeat = useBookingStore((state) => state.toggleSeat);
  const setQuantity = useBookingStore((state) => state.setQuantity);
  const pushToast = useAppStore((state) => state.pushToast);

  // Chỉ khởi tạo lại khi đổi sự kiện; quay lại từ thanh toán vẫn giữ lựa chọn cũ.
  useEffect(() => {
    if (event && eventId !== event.id) startBooking(event.id);
  }, [event, eventId, startBooking]);

  if (!event || event.status === "ended") {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={ShieldCheck}
          title="Sự kiện không khả dụng"
          description="Sự kiện này đã kết thúc hoặc không còn mở bán vé."
          actionLabel="Về danh sách sự kiện"
          actionTo="/events"
        />
      </div>
    );
  }

  const active = eventId === event.id;
  const selectedSeats = active ? seats : [];
  const activeQuantities = active ? quantities : {};
  const selection = getSelection(event, selectedSeats, activeQuantities);
  const { discount, total } = calculateTotal(selection.subtotal, selection.fee, promoApplied);
  const isSeated = event.seating?.type === "seated";

  const handleToggleSeat = (seatId) => {
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= MAX_SEATS_PER_ORDER) {
      pushToast({
        type: "error",
        title: "Đã đạt giới hạn",
        message: `Bạn chỉ có thể chọn tối đa ${MAX_SEATS_PER_ORDER} ghế trong một đơn.`,
      });
      return;
    }
    toggleSeat(seatId);
  };

  const continueToCheckout = () => {
    if (selection.count === 0) {
      pushToast({ type: "error", title: "Chưa chọn vé", message: "Vui lòng chọn ít nhất một vé để tiếp tục." });
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="container-page pb-36 pt-7 sm:pt-9 md:pb-12">
      <Link to={`/events/${event.id}`} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-ink-900">
        <ArrowLeft size={14} />
        Về chi tiết sự kiện
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Bước 1 / 3</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900 sm:text-[30px]">
            Chọn {isSeated ? "ghế" : "loại vé"}
          </h1>
          <p className="mt-1 text-[13px] text-muted">{event.name}</p>
        </div>
        <Stepper current={0} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
        <div className="min-w-0">
          <div className="card mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 p-3.5 text-[12px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {formatLongDate(event.date)} · {formatTime(event.time)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} /> {event.venue}, {eventLocationName(event)}
            </span>
          </div>

          <section className="card p-4 sm:p-5">
            <div className="mb-4 flex items-start gap-2 rounded-md bg-paper px-3 py-2.5 text-[12px] leading-5 text-muted">
              <Info size={15} className="mt-0.5 shrink-0 text-ink-600" />
              {isSeated
                ? `Ghế màu xám đã bán hoặc đang được người khác giữ. Bạn có thể chọn tối đa ${MAX_SEATS_PER_ORDER} ghế.`
                : "Số lượng vé có hạn. Vé đã bán hết không thể chọn; quay lại trang sự kiện nếu muốn đổi loại vé."}
            </div>

            {isSeated ? (
              <>
                <SeatMap event={event} selectedSeats={selectedSeats} onToggle={handleToggleSeat} />
                <div className="mt-4 rounded-lg border border-line bg-paper/60 p-3">
                  <p className="text-[12px] font-semibold text-ink-900">
                    Ghế đang chọn ({selectedSeats.length}/{MAX_SEATS_PER_ORDER})
                  </p>
                  {selectedSeats.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedSeats.map((seat) => (
                        <button
                          key={seat}
                          type="button"
                          onClick={() => toggleSeat(seat)}
                          className="chip h-7 border-accent bg-accent-soft text-[11px] text-accent-dark"
                          title="Bấm để bỏ ghế"
                        >
                          {seat} ×
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-[12px] text-muted">Chưa có ghế nào được chọn.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2.5">
                {event.ticketTypes.map((type) => {
                  const remaining = Math.max(0, type.total - type.sold);
                  return (
                    <TicketTypeCard
                      key={type.id}
                      type={type}
                      quantity={activeQuantities[type.id] || 0}
                      onQuantityChange={(value) => setQuantity(type.id, value, Math.min(10, remaining))}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-20">
          <PriceSummary
            items={selection.items}
            subtotal={selection.subtotal}
            fee={selection.fee}
            discount={discount}
            total={total}
            count={selection.count}
            onContinue={continueToCheckout}
            continueDisabled={selection.count === 0}
            continueLabel="Tiếp tục thanh toán"
            note="Bước tiếp theo bạn sẽ điền thông tin và chọn phương thức thanh toán."
          />
          <p className="mt-2 text-center text-[11px] text-muted-2">
            Tổng tiền đã gồm phí dịch vụ 2%
            {discount > 0 && " và mã giảm giá từ bước trước"}
          </p>
        </aside>
      </div>

      {/* CTA cố định trên mobile — không chồng lên thanh điều hướng dưới cùng */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-white px-4 py-2.5 shadow-[0_-6px_20px_-16px_rgba(11,18,27,0.5)] md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted">{selection.count} vé · Tổng cộng</p>
            <p className="truncate text-[15px] font-bold text-ink-900">{formatVnd(total)}</p>
          </div>
          <button
            type="button"
            onClick={continueToCheckout}
            disabled={selection.count === 0}
            className="btn btn-primary shrink-0"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}
