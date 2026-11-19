import AdminAccountManager from "./AdminAccountManager.jsx";

export default function AdminCustomersPage() {
  return (
    <AdminAccountManager
      resource="customers"
      eyebrow="Khách hàng"
      title="Khách hàng"
      description="Quản lý thông tin khách hàng đã đăng ký và lịch sử đặt vé của họ."
      allowRoleChange={false}
    />
  );
}
