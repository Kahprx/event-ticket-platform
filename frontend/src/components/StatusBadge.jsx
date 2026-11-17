const styles = {
  confirmed: { label: "Đã xác nhận", className: "badge-success" },
  paid: { label: "Đã thanh toán", className: "badge-success" },
  used: { label: "Đã sử dụng", className: "badge-neutral" },
  cancelled: { label: "Đã hủy", className: "badge-danger" },
  pending: { label: "Chờ thanh toán", className: "badge-warning" },
  refunded: { label: "Đã hoàn tiền", className: "badge-warning" },
  active: { label: "Đang hoạt động", className: "badge-success" },
  locked: { label: "Đã khóa", className: "badge-danger" },
  "on-sale": { label: "Đang mở bán", className: "badge-success" },
  "sold-out": { label: "Hết vé", className: "badge-danger" },
  ended: { label: "Đã kết thúc", className: "badge-neutral" },
  draft: { label: "Bản nháp", className: "badge-warning" },
};

export default function StatusBadge({ status, label }) {
  const config = styles[status] || { label: status, className: "badge-neutral" };
  return <span className={`badge ${config.className}`}>{label || config.label}</span>;
}
