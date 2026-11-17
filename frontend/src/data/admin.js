// Số liệu mẫu cho khu vực quản trị. Trong đồ án thật, các con số này sẽ được
// tổng hợp từ bảng bookings / events thay vì khai báo sẵn.

export const overviewStats = [
  { id: "events", label: "Sự kiện đang mở bán", value: 48, change: "+6 so với tháng trước", trend: "up" },
  { id: "bookings", label: "Đơn đặt vé", value: 1284, change: "+12,4% so với tháng trước", trend: "up" },
  { id: "revenue", label: "Doanh thu tháng 11", value: 486250000, change: "+8,1% so với tháng trước", trend: "up", isCurrency: true },
  { id: "users", label: "Khách hàng hoạt động", value: 3462, change: "+214 tài khoản mới", trend: "up" },
];

export const revenueByMonth = [
  { month: "T1", revenue: 218000000, bookings: 640 },
  { month: "T2", revenue: 264000000, bookings: 712 },
  { month: "T3", revenue: 241000000, bookings: 688 },
  { month: "T4", revenue: 298000000, bookings: 801 },
  { month: "T5", revenue: 326000000, bookings: 874 },
  { month: "T6", revenue: 381000000, bookings: 962 },
  { month: "T7", revenue: 354000000, bookings: 918 },
  { month: "T8", revenue: 402000000, bookings: 1043 },
  { month: "T9", revenue: 438000000, bookings: 1121 },
  { month: "T10", revenue: 449000000, bookings: 1168 },
  { month: "T11", revenue: 486250000, bookings: 1284 },
  { month: "T12", revenue: 0, bookings: 0 },
];

export const categoryBreakdown = [
  { name: "Festival", tickets: 4120, color: "#e4572e" },
  { name: "Live music", tickets: 3180, color: "#1f3a5f" },
  { name: "EDM", tickets: 2640, color: "#3f7cac" },
  { name: "Indie", tickets: 1420, color: "#b98b3e" },
  { name: "Acoustic", tickets: 980, color: "#6b8f71" },
  { name: "Rap / Hip-hop", tickets: 860, color: "#8a5a83" },
];

export const recentOrders = [
  { id: "BK-2611-1042", customer: "Trần Quốc Bảo", event: "Soundwave Festival 2026", amount: 2998000, status: "paid", method: "MoMo", createdAt: "17/11/2026 09:14" },
  { id: "BK-2611-1041", customer: "Lê Thu Hà", event: "Ho Chi Minh City Music Night", amount: 1833960, status: "paid", method: "VNPay", createdAt: "17/11/2026 08:52" },
  { id: "BK-2611-1040", customer: "Phạm Đức Long", event: "Saigon Indie Live", amount: 1197000, status: "pending", method: "Chuyển khoản", createdAt: "17/11/2026 08:31" },
  { id: "BK-2611-1039", customer: "Nguyễn Minh Anh", event: "Electronic Night #03", amount: 998000, status: "paid", method: "Thẻ ngân hàng", createdAt: "16/11/2026 21:08" },
  { id: "BK-2611-1038", customer: "Đỗ Hoàng Nam", event: "Hà Nội Rock City", amount: 1798000, status: "refunded", method: "MoMo", createdAt: "16/11/2026 19:45" },
  { id: "BK-2611-1037", customer: "Vũ Khánh Linh", event: "Đà Nẵng Beach Party", amount: 598000, status: "paid", method: "VNPay", createdAt: "16/11/2026 18:20" },
];

export const adminUsers = [
  { id: "U-1001", name: "Nguyễn Minh Anh", email: "minhanh.nguyen@example.com", role: "CUSTOMER", city: "TP. Hồ Chí Minh", joinedAt: "08/09/2025", status: "active", bookings: 6 },
  { id: "U-1002", name: "Trần Quốc Bảo", email: "quocbao.tran@example.com", role: "CUSTOMER", city: "TP. Hồ Chí Minh", joinedAt: "14/10/2025", status: "active", bookings: 11 },
  { id: "U-1003", name: "Lê Thu Hà", email: "thuha.le@example.com", role: "CUSTOMER", city: "Hà Nội", joinedAt: "02/01/2026", status: "active", bookings: 4 },
  { id: "U-1004", name: "Phạm Đức Long", email: "duclong.pham@example.com", role: "CUSTOMER", city: "Đà Nẵng", joinedAt: "21/02/2026", status: "active", bookings: 2 },
  { id: "U-1005", name: "Đỗ Hoàng Nam", email: "hoangnam.do@example.com", role: "CUSTOMER", city: "Hải Phòng", joinedAt: "05/03/2026", status: "locked", bookings: 7 },
  { id: "U-1006", name: "Vũ Khánh Linh", email: "khanhlinh.vu@example.com", role: "CUSTOMER", city: "TP. Hồ Chí Minh", joinedAt: "19/04/2026", status: "active", bookings: 9 },
  { id: "U-1007", name: "Ngô Thanh Tùng", email: "thanhtung.ngo@example.com", role: "ADMIN", city: "TP. Hồ Chí Minh", joinedAt: "08/09/2025", status: "active", bookings: 0 },
  { id: "U-1008", name: "Hoàng Mai Chi", email: "maichi.hoang@example.com", role: "ADMIN", city: "Hà Nội", joinedAt: "11/11/2025", status: "active", bookings: 0 },
];

export const adminRoles = [
  {
    key: "CUSTOMER",
    name: "Khách hàng",
    description: "Đặt vé, xem vé và quản lý hồ sơ cá nhân",
    permissions: ["event:read", "ticket:create", "ticket:read", "profile:update"],
    isSystem: true,
    userCount: 3462,
  },
  {
    key: "ADMIN",
    name: "Quản trị viên",
    description: "Toàn quyền quản lý sự kiện, đơn hàng, tài khoản và báo cáo",
    permissions: ["admin:access", "event:write", "order:write", "account:write", "report:read"],
    isSystem: true,
    userCount: 2,
  },
];

export const chatbotLogs = [
  {
    id: "CH-2041",
    user: "Nguyễn Minh Anh",
    startedAt: "17/11/2026 09:32",
    messages: 6,
    topic: "Tìm sự kiện cuối tuần",
    resolved: true,
    transcript: [
      { from: "user", text: "Cuối tuần này có gì ở TP. Hồ Chí Minh?" },
      { from: "bot", text: "Cuối tuần này tại TP. Hồ Chí Minh có Ho Chi Minh City Music Night vào 21/11 và Saigon Indie Live vào 28/11. Bạn muốn xem sự kiện nào?" },
      { from: "user", text: "Cái đầu tiên giá bao nhiêu?" },
      { from: "bot", text: "Ho Chi Minh City Music Night có vé từ 399.000 ₫ đến 899.000 ₫ tùy khu vực." },
    ],
  },
  {
    id: "CH-2040",
    user: "Trần Quốc Bảo",
    startedAt: "17/11/2026 08:58",
    messages: 4,
    topic: "Hỏi cách thanh toán",
    resolved: true,
    transcript: [
      { from: "user", text: "Thanh toán bằng MoMo được không?" },
      { from: "bot", text: "Có. Ở bước thanh toán, bạn chọn MoMo và quét mã QR để hoàn tất. Hệ thống giữ chỗ trong 10 phút." },
    ],
  },
  {
    id: "CH-2039",
    user: "Lê Thu Hà",
    startedAt: "16/11/2026 21:14",
    messages: 8,
    topic: "Sự kiện EDM",
    resolved: true,
    transcript: [
      { from: "user", text: "Tìm event EDM ở Hà Nội" },
      { from: "bot", text: "Hiện chưa có đêm EDM nào ở Hà Nội trong 2 tuần tới. Bạn có muốn xem Electronic Night #03 ở TP.HCM không?" },
      { from: "user", text: "Thôi để dịp khác" },
      { from: "bot", text: "Không sao. Mình sẽ thông báo khi có sự kiện mới ở Hà Nội." },
    ],
  },
  {
    id: "CH-2038",
    user: "Đỗ Hoàng Nam",
    startedAt: "16/11/2026 19:40",
    messages: 3,
    topic: "Hủy vé",
    resolved: false,
    transcript: [
      { from: "user", text: "Tôi muốn hủy vé đã mua" },
      { from: "bot", text: "Vé có thể hủy trước 48 giờ so với giờ diễn. Bạn vào Vé của tôi, chọn vé và bấm Hủy. Phí hủy là 20%." },
      { from: "user", text: "Phí cao vậy à" },
    ],
  },
];
