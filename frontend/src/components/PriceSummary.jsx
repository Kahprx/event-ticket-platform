import { formatVnd } from "../utils/format.js";

export default function PriceSummary({
  items = [],
  subtotal = 0,
  fee = 0,
  discount = 0,
  total = 0,
  count = 0,
  onContinue,
  continueLabel = "Tiếp tục",
  continueDisabled = false,
  note,
  children,
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-900">Tóm tắt đơn hàng</h2>
        <span className="text-[12px] text-muted">{count} vé</span>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 rounded-md bg-paper px-3 py-4 text-center text-[13px] text-muted">
          Chưa chọn vé nào.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.id || item.name} className="flex items-start justify-between gap-3 text-[13px]">
              <div className="min-w-0">
                <p className="font-medium text-ink-900">{item.name}</p>
                <p className="text-[11px] text-muted">
                  {item.quantity} × {formatVnd(item.price)}
                </p>
                {item.seats && item.seats.length > 0 && (
                  <p className="mt-0.5 break-words text-[11px] text-muted-2">Ghế: {item.seats.join(", ")}</p>
                )}
              </div>
              <span className="shrink-0 font-semibold text-ink-900">{formatVnd(item.amount)}</span>
            </li>
          ))}
        </ul>
      )}

      <hr className="divider my-3" />

      <dl className="space-y-1.5 text-[13px]">
        <div className="flex justify-between">
          <dt className="text-muted">Tạm tính</dt>
          <dd className="text-ink-800">{formatVnd(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Phí dịch vụ (2%)</dt>
          <dd className="text-ink-800">{formatVnd(fee)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <dt>Giảm giá</dt>
            <dd>-{formatVnd(discount)}</dd>
          </div>
        )}
      </dl>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <span className="text-sm font-semibold text-ink-900">Tổng cộng</span>
        <span className="text-lg font-bold text-ink-900">{formatVnd(total)}</span>
      </div>

      {note && <p className="mt-2 text-[11px] leading-4 text-muted">{note}</p>}

      {children}

      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled}
          className="btn btn-primary btn-block mt-4"
        >
          {continueLabel}
        </button>
      )}
    </div>
  );
}
