export const roleLabel = (key) => {
  const labels = { CUSTOMER: "Khách hàng", ADMIN: "Quản trị" };
  return labels[key] || key;
};

export const formatJoinedDate = (value) => {
  if (!value) return "—";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
};

// Đổi dữ liệu API sang shape mà bảng quản trị đang dùng.
export const mapAccount = (account = {}) => ({
  id: account.id,
  name: account.name,
  email: account.email,
  role: account.role || "CUSTOMER",
  phone: account.phone || "",
  city: account.city || "—",
  joinedAt: formatJoinedDate(account.joinedAt || account.createdAt),
  bookings: account.bookings ?? 0,
  tickets: account.tickets ?? 0,
  status: account.status === "BLOCKED" ? "locked" : "active",
});

export const mapRole = (role = {}) => ({
  key: role.key,
  name: role.name || role.key,
  description: role.description || "",
  permissions: Array.isArray(role.permissions) ? role.permissions : [],
  isSystem: Boolean(role.isSystem),
  userCount: role.userCount || 0,
});
