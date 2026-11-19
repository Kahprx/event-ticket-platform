import AdminAccountManager from "./AdminAccountManager.jsx";

export default function AdminAccountsPage() {
  return (
    <AdminAccountManager
      resource="accounts"
      eyebrow="Hệ thống"
      title="Tài khoản"
      description="Quản lý tài khoản đăng nhập, vai trò và trạng thái truy cập."
      allowRoleChange
    />
  );
}
