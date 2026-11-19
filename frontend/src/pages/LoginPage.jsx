import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, LayoutDashboard, Music2, ShieldCheck } from "lucide-react";
import { api } from "../services/api.js";
import { useAuthStore } from "../store/authStore.js";
import { useAppStore } from "../store/appStore.js";
import { loginSchema, registerSchema } from "../validators/auth.js";
import { initialProfile } from "../data/bookings.js";
import { demoAccounts, findDemoAccount } from "../data/demoAccounts.js";
import Brand from "../components/Brand.jsx";
import ErrorState from "../components/ErrorState.jsx";

// API trả về createdAt, frontend dùng joinedAt/notifications cho hồ sơ demo.
const normalizeUser = (apiUser = {}) => ({
  ...initialProfile,
  ...apiUser,
  role: apiUser.role || "CUSTOMER",
  city: apiUser.city || initialProfile.city,
  joinedAt: apiUser.createdAt?.slice(0, 10) || initialProfile.joinedAt,
  notifications: initialProfile.notifications,
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const user = useAppStore((state) => state.user);
  const updateUser = useAppStore((state) => state.updateUser);
  const pushToast = useAppStore((state) => state.pushToast);

  const [mode, setMode] = useState("login");
  const [backendError, setBackendError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  const destination = location.state?.from || "/";
  const needAdmin = Boolean(location.state?.needAdmin);

  const resolvePath = (role) => {
    if (role === "ADMIN") return destination === "/" ? "/admin" : destination;
    return destination.startsWith("/admin") ? "/" : destination;
  };

  const applySession = ({ token, user: apiUser }) => {
    const profile = normalizeUser(apiUser);
    updateUser(profile);
    setSession({ token, user: profile });
    pushToast({
      type: "success",
      title: `Chào ${profile.name}!`,
      message: profile.role === "ADMIN" ? "Đăng nhập quản trị thành công." : "Đăng nhập thành công.",
    });
    navigate(resolvePath(profile.role));
  };

  // Dùng khi backend chưa chạy: vẫn cho xem demo bằng tài khoản có sẵn.
  const signInWithDemo = (account) => {
    const { password, ...profile } = account;
    applySession({ token: `demo-${account.id}`, user: profile });
  };

  const signInWithApi = async (payload, fallbackAccount) => {
    try {
      const response = await api.post("/auth/login", payload);
      const data = response.data?.data || response.data || {};
      if (!data.token) throw new Error("Phản hồi đăng nhập thiếu token");
      applySession(data);
      return true;
    } catch (error) {
      // Chỉ fallback khi không kết nối được server, không fallback khi sai mật khẩu.
      if (!error.response && fallbackAccount) {
        signInWithDemo(fallbackAccount);
        return true;
      }
      setBackendError(error.response?.data?.message || "Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
      return false;
    }
  };

  const registerWithApi = async (values) => {
    try {
      const response = await api.post("/auth/register", values);
      const data = response.data?.data || response.data || {};
      if (!data.token) throw new Error("Phản hồi đăng ký thiếu token");
      applySession(data);
      return true;
    } catch (error) {
      setBackendError(error.response?.data?.message || "Không thể tạo tài khoản lúc này. Vui lòng thử lại.");
      return false;
    }
  };

  const onSubmit = async (values) => {
    setBackendError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await signInWithApi(values, findDemoAccount(values.email, values.password));
      } else {
        await registerWithApi(values);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const quickSignIn = async (account) => {
    setBackendError(null);
    setSubmitting(true);
    try {
      await signInWithApi({ email: account.email, password: account.password }, account);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setBackendError(null);
    reset();
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      {/* Trái: giải thích ngắn, không dùng gradient hay hình trang trí */}
      <div className="hidden flex-col justify-between bg-ink-950 p-10 text-white lg:flex xl:p-14">
        <Brand variant="dark" />
        <div className="max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Soundpass</p>
          <h1 className="mt-3 font-display text-[36px] font-extrabold leading-tight xl:text-[42px]">
            Đêm nhạc tiếp theo của bạn chỉ còn vài cú chạm.
          </h1>
          <p className="mt-4 text-[14px] leading-7 text-white/60">
            Đăng nhập để lưu vé, nhận nhắc lịch và quản lý các đơn đặt của bạn.
            Vẫn có thể xem sự kiện và giá vé mà không cần tài khoản.
          </p>
          <ul className="mt-8 space-y-3 text-[13px] text-white/75">
            {[
              "Lưu toàn bộ vé và mã QR tại một nơi",
              "Nhận gợi ý sự kiện theo thành phố bạn chọn",
              "Hủy vé và cập nhật thông tin trong vài bước",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/20 text-accent">
                  <Check size={12} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[11px] text-white/40">Đồ án môn Công nghệ phần mềm · Nhóm 04</p>
      </div>

      {/* Phải: form */}
      <div className="flex flex-col bg-paper px-5 py-8 sm:px-10 lg:px-14 lg:py-12">
        <div className="lg:hidden"><Brand /></div>

        <div className="mx-auto w-full max-w-md flex-1 pt-10 lg:pt-16">
          <div className="mb-6 flex gap-1 border-b border-line">
            {[
              { id: "login", label: "Đăng nhập" },
              { id: "register", label: "Đăng ký" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => switchMode(item.id)}
                className={`border-b-2 px-4 py-2.5 text-[13px] font-semibold ${
                  mode === item.id
                    ? "border-accent text-accent-dark"
                    : "border-transparent text-muted hover:text-ink-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <h2 className="font-display text-2xl font-extrabold text-ink-900">
            {mode === "login" ? "Chào bạn trở lại" : "Tạo tài khoản"}
          </h2>
          <p className="mt-1.5 text-[13px] text-muted">
            {mode === "login"
              ? "Nhập email và mật khẩu để tiếp tục."
              : "Điền thông tin để lưu vé và nhận nhắc lịch."}
          </p>

          {needAdmin && (
            <p className="mt-4 rounded-md border border-accent/25 bg-accent-soft px-3 py-2.5 text-[12px] leading-5 text-accent-dark">
              Khu vực quản trị yêu cầu tài khoản có vai trò <strong>ADMIN</strong>. Chọn nút
              “Vào quản trị” bên dưới hoặc đăng nhập bằng tài khoản quản trị.
            </p>
          )}

          {backendError && (
            <div className="mt-5">
              <ErrorState
                title={mode === "login" ? "Chưa thể đăng nhập" : "Chưa thể đăng ký"}
                description={backendError}
                onRetry={() => setBackendError(null)}
              />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {mode === "register" && (
              <div className="field">
                <label className="field-label" htmlFor="auth-name">Họ và tên</label>
                <input id="auth-name" className={`input ${errors.name ? "border-danger" : ""}`} placeholder="Nguyễn Văn A" {...register("name")} />
                {errors.name && <p className="field-error">{errors.name.message}</p>}
              </div>
            )}
            <div className="field">
              <label className="field-label" htmlFor="auth-email">Email</label>
              <input id="auth-email" type="email" className={`input ${errors.email ? "border-danger" : ""}`} placeholder="email@example.com" {...register("email")} />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
            <div className="field">
              <label className="field-label" htmlFor="auth-password">Mật khẩu</label>
              <input id="auth-password" type="password" className={`input ${errors.password ? "border-danger" : ""}`} placeholder="Ít nhất 8 ký tự" {...register("password")} />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-block btn-lg">
              {submitting ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-2">
            <span className="h-px flex-1 bg-line" />
            hoặc dùng tài khoản demo
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => quickSignIn(demoAccounts[0])}
              className="btn btn-secondary justify-center"
            >
              <Music2 size={16} />
              Khách hàng
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => quickSignIn(demoAccounts[1])}
              className="btn btn-secondary justify-center"
            >
              <LayoutDashboard size={16} />
              Vào quản trị
            </button>
          </div>

          <div className="mt-3 space-y-1 rounded-md border border-line bg-white px-3 py-2.5 text-[11px] leading-5 text-muted">
            <p className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-success" />
              Khách hàng: {demoAccounts[0].email} · {demoAccounts[0].password}
            </p>
            <p className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-accent" />
              Quản trị: {demoAccounts[1].email} · {demoAccounts[1].password}
            </p>
            {user && (
              <p className="border-t border-line pt-1.5 text-muted-2">
                Đang đăng nhập: {user.name} ({user.role || "CUSTOMER"})
              </p>
            )}
          </div>

          <p className="mt-8 text-center text-[12px] text-muted">
            Chỉ để xem giao diện? <Link to="/events" className="link">Vào danh sách sự kiện</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
