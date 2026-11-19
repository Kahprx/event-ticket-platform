// Các hàm định dạng dùng chung. Giữ đơn giản để người mới đọc hiểu nhanh.

const vnd = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

export const formatVnd = (value) => `${vnd.format(Number(value) || 0)} ₫`;

export const formatCompactVnd = (value) => {
  const number = Number(value) || 0;
  if (number >= 1000000000) return `${(number / 1000000000).toFixed(1).replace(".", ",")} tỷ`;
  if (number >= 1000000) return `${(number / 1000000).toFixed(1).replace(".", ",")} tr`;
  if (number >= 1000) return `${Math.round(number / 1000)}k`;
  return String(number);
};

const weekdayNames = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

export const parseEventDate = (date, time = "00:00") => new Date(`${date}T${time}:00`);

export const formatDate = (date, time) => {
  const value = typeof date === "string" ? parseEventDate(date, time) : date;
  if (Number.isNaN(value.getTime())) return "";
  return `${value.getDate()}/${value.getMonth() + 1}/${value.getFullYear()}`;
};

export const formatDateTime = (date, time) => {
  const value = typeof date === "string" ? parseEventDate(date, time) : date;
  if (Number.isNaN(value.getTime())) return "";
  return `${formatDate(value)} · ${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
};

export const formatLongDate = (date, time) => {
  const value = typeof date === "string" ? parseEventDate(date, time) : date;
  if (Number.isNaN(value.getTime())) return "";
  return `${weekdayNames[value.getDay()]}, ${value.getDate()} tháng ${value.getMonth() + 1}, ${value.getFullYear()}`;
};

export const formatTime = (value) => String(value).slice(0, 5);

export const formatRelative = (isoString) => {
  const value = new Date(isoString);
  const diff = Date.now() - value.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return formatDate(value);
};

export const isPastDate = (date, time) => parseEventDate(date, time) < new Date();

export const createBookingCode = () => {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BK-${stamp}-${random}`;
};
