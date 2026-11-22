const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  );

// Mọi giá trị đưa vào email đều đi qua đây để tránh HTML injection.
export const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export function buildPaymentSuccessMessage({
  customerName,
  orderCode,
  eventName,
  eventDate,
  venue,
  totalAmount,
  paymentMethod,
  transactionCode,
  ticketCodes = [],
}) {
  const name = escapeHtml(customerName || "Khách hàng");
  const code = escapeHtml(orderCode);
  const event = escapeHtml(eventName);
  const date = escapeHtml(eventDate);
  const place = escapeHtml(venue);
  const amount = escapeHtml(money(totalAmount));
  const method = escapeHtml(paymentMethod || "—");
  const transaction = escapeHtml(transactionCode || code);
  const codes = ticketCodes.length
    ? `<ul>${ticketCodes.map((ticket) => `<li><strong>${escapeHtml(ticket)}</strong></li>`).join("")}</ul>`
    : "<p>Mã soát vé được hiển thị trong ứng dụng Soundpass.</p>";

  const subject = `Soundpass — Thanh toán thành công đơn ${orderCode}`;

  const text = [
    `Xin chào ${customerName || "Khách hàng"},`,
    "",
    "Thanh toán cho đơn đặt vé Soundpass đã hoàn tất.",
    `Mã đơn hàng: ${orderCode}`,
    `Sự kiện: ${eventName}`,
    `Thời gian: ${eventDate}`,
    `Địa điểm: ${venue}`,
    `Phương thức: ${paymentMethod}`,
    `Mã giao dịch: ${transactionCode || orderCode}`,
    `Tổng thanh toán: ${money(totalAmount)}`,
    "",
    "Mã soát vé:",
    ...(ticketCodes.length ? ticketCodes.map((ticket) => `- ${ticket}`) : ["- Xem trong ứng dụng Soundpass"]),
    "",
    "Vui lòng xuất trình mã QR tại cổng soát vé. Không chia sẻ mã này cho người khác.",
    "",
    "Trân trọng,",
    "Soundpass",
  ].join("\n");

  const html = `<!doctype html>
<html lang="vi">
  <body style="margin:0;padding:24px;background:#f7f5f0;font-family:Arial,sans-serif;color:#101a26;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e3ded2;border-radius:12px;padding:28px;">
      <p style="margin:0;font-size:12px;font-weight:bold;letter-spacing:2px;color:#e4572e;">SOUNDPASS</p>
      <h1 style="margin:12px 0 8px;font-size:22px;">Thanh toán thành công</h1>
      <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">Xin chào ${name}, vé điện tử của bạn đã sẵn sàng.</p>
      <div style="border:1px solid #e3ded2;border-radius:8px;padding:16px;background:#f7f5f0;">
        <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">Mã đơn hàng</p>
        <p style="margin:0 0 16px;font-size:18px;font-weight:bold;font-family:monospace;">${code}</p>
        <p style="margin:0 0 4px;font-size:14px;"><strong>Sự kiện:</strong> ${event}</p>
        <p style="margin:0 0 4px;font-size:14px;"><strong>Thời gian:</strong> ${date}</p>
        <p style="margin:0 0 4px;font-size:14px;"><strong>Địa điểm:</strong> ${place}</p>
        <p style="margin:0 0 4px;font-size:14px;"><strong>Thanh toán:</strong> ${method}</p>
        <p style="margin:0 0 4px;font-size:14px;"><strong>Mã giao dịch:</strong> ${transaction}</p>
        <p style="margin:12px 0 0;font-size:16px;font-weight:bold;color:#e4572e;">${amount}</p>
      </div>
      <h2 style="margin:22px 0 8px;font-size:15px;">Mã soát vé</h2>
      <div style="font-size:14px;">${codes}</div>
      <p style="margin:22px 0 0;font-size:12px;color:#6b7280;">Xuất trình mã QR tại cổng soát vé. Không chia sẻ mã này cho người khác.</p>
      <hr style="margin:22px 0;border:0;border-top:1px solid #e3ded2;" />
      <p style="margin:0;font-size:12px;color:#8b8f96;">Soundpass · Hỗ trợ 028 7300 2026</p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}
