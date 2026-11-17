import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useAppStore } from "../store/appStore.js";

const tone = {
  success: { icon: CheckCircle2, color: "text-success", bar: "bg-success" },
  error: { icon: AlertTriangle, color: "text-danger", bar: "bg-danger" },
  info: { icon: Info, color: "text-ink-600", bar: "bg-ink-600" },
};

export default function ToastStack() {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-20 z-[60] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-80 sm:items-end">
      {toasts.map((toast) => {
        const config = tone[toast.type] || tone.info;
        const Icon = config.icon;
        return (
          <div
            key={toast.id}
            className="animate-in pointer-events-auto flex items-start gap-3 rounded-lg border border-line bg-white p-3 shadow-pop"
            role="status"
          >
            <span className={`mt-0.5 ${config.color}`}>
              <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              {toast.title && <p className="text-sm font-semibold text-ink-900">{toast.title}</p>}
              {toast.message && <p className="text-[13px] leading-5 text-muted">{toast.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted-2 hover:bg-paper-2"
              aria-label="Đóng thông báo"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
