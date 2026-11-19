import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorState({ title = "Không tải được dữ liệu", description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-danger/20 bg-danger-soft/40 px-6 py-12 text-center">
      <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-white text-danger">
        <AlertTriangle size={20} />
      </span>
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">
        {description || "Đã có lỗi xảy ra. Vui lòng thử lại sau ít phút."}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm mt-5">
          <RefreshCw size={14} />
          Thử lại
        </button>
      )}
    </div>
  );
}
