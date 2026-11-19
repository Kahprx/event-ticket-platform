import { MAX_SEATS_PER_ORDER } from "../store/bookingStore.js";
import { formatVnd } from "../utils/format.js";

// Băm chuỗi thành số để mọi lần tải lại, cùng một ghế vẫn ở trạng thái đã bán
// hoặc còn trống. Đây là dữ liệu mô phỏng, không phải trạng thái thật từ server.
const hash = (value) => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return Math.abs(result);
};

const buildZones = (event) =>
  event.seating.zones.map((zone) => {
    const rows = [];
    for (let rowNumber = 1; rowNumber <= zone.rows; rowNumber += 1) {
      const seats = [];
      for (let seatNumber = 1; seatNumber <= zone.seatsPerRow; seatNumber += 1) {
        const id = `${zone.id}${rowNumber}-${String(seatNumber).padStart(2, "0")}`;
        const sold = (hash(`${event.id}-${id}`) % 100) / 100 < zone.soldRatio;
        const held = !sold && hash(`held-${event.id}-${id}`) % 100 < 4;
        seats.push({ id, number: seatNumber, sold, held });
      }
      rows.push({ rowNumber, seats });
    }
    return { ...zone, rows };
  });

export default function SeatMap({ event, selectedSeats, onToggle }) {
  const zones = buildZones(event);

  return (
    <div>
      <div className="no-scrollbar overflow-x-auto pb-2">
        <div className="mx-auto min-w-[440px] max-w-[660px]">
          <div className="mx-auto mb-5 flex h-9 w-4/5 items-center justify-center rounded-b-[70px] border border-line bg-paper-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">Sân khấu</span>
          </div>

          {zones.map((zone) => (
            <section key={zone.id} className="mb-5">
              <div className="mb-2 flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-[13px] font-semibold text-ink-900">{zone.name}</h3>
                  <p className="text-[11px] text-muted-2">Hàng 1–{zone.rows.length}</p>
                </div>
                <span className="text-[12px] font-semibold text-ink-700">{formatVnd(zone.price)}</span>
              </div>

              <div className="space-y-1.5">
                {zone.rows.map((row) => (
                  <div key={row.rowNumber} className="flex items-center gap-2">
                    <span className="w-3 shrink-0 text-right text-[10px] text-muted-2">{row.rowNumber}</span>
                    <div className="flex gap-1">
                      {row.seats.map((seat) => {
                        const selected = selectedSeats.includes(seat.id);
                        const unavailable = seat.sold || seat.held;
                        const limitReached = !selected && selectedSeats.length >= MAX_SEATS_PER_ORDER;
                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => onToggle(seat.id)}
                            disabled={unavailable || limitReached}
                            aria-pressed={selected}
                            aria-label={`Ghế ${seat.id}${seat.sold ? " đã bán" : seat.held ? " đang được giữ" : ""}`}
                            title={`${seat.id}${seat.sold ? " · Đã bán" : seat.held ? " · Đang giữ" : ` · ${formatVnd(zone.price)}`}`}
                            className={`seat ${
                              selected ? "seat-selected" : seat.sold ? "seat-sold" : seat.held ? "seat-held" : ""
                            } ${limitReached ? "opacity-45" : ""}`}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-[12px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="seat" aria-hidden="true" /> Còn trống
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="seat seat-selected" aria-hidden="true" /> Đang chọn
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="seat seat-sold" aria-hidden="true" /> Đã bán
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="seat seat-held" aria-hidden="true" /> Đang giữ
        </span>
        <span className="ml-auto text-[11px] text-muted-2">Tối đa {MAX_SEATS_PER_ORDER} ghế mỗi đơn</span>
      </div>
    </div>
  );
}
