import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, LoaderCircle, LockKeyhole, Mail, MapPin, Music2, UserRound } from "lucide-react";
import { api } from "./services/api.js";
import { useAuthStore } from "./store/authStore.js";
import { loginSchema, registerSchema } from "./validators/auth.js";

function Brand() {
  return <Link className="brand" to="/"><span className="brand-mark"><Music2 size={19} /></span><span>sound<span className="brand-accent">pass</span></span></Link>;
}

function Home() {
  const { user, logout } = useAuthStore();
  return <main className="page-shell">
    <nav className="topbar"><Brand/><div className="nav-links"><a href="#discover">Khám phá</a><a href="#regions">Khu vực</a></div><div className="nav-actions">{user ? <><Link className="login-link" to="/profile">{user.name}</Link><button className="text-button" onClick={logout}>Đăng xuất</button></> : <><Link className="login-link" to="/login">Đăng nhập</Link><Link className="button button-small" to="/register">Tạo tài khoản <ArrowRight size={15}/></Link></>}</div></nav>
    <section className="hero" id="discover"><div className="hero-copy"><div className="eyebrow"><span className="live-dot"/> ÂM NHẠC Ở GẦN BẠN</div><h1>Đêm nay,<br/>mình đi <span>đâu?</span></h1><p>Tìm những đêm nhạc đáng nhớ quanh bạn. Chọn sự kiện, chọn chỗ ngồi, để âm nhạc dẫn lối.</p><div className="hero-buttons"><a className="button" href="#regions">Khám phá sự kiện <ArrowRight size={17}/></a><span className="hero-note"><MapPin size={15}/> Thành phố của bạn</span></div></div><div className="hero-art" aria-label="Sân khấu âm nhạc trừu tượng"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-glow"/><div className="art-sun"/><div className="art-beam beam-one"/><div className="art-beam beam-two"/><div className="art-caption"><span>01 — LIVE TONIGHT</span><strong>Feel the<br/>frequency.</strong></div><div className="art-equalizer"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div></section>
    <section className="discovery" id="regions"><div><div className="eyebrow muted">BẮT ĐẦU TỪ ĐÂY</div><h2>Thành phố của bạn,<br/><span>thanh âm của bạn.</span></h2></div><div className="city-row"><button className="city-chip active">✳ &nbsp; TP. Hồ Chí Minh <ArrowRight size={15}/></button><button className="city-chip">Hà Nội <ArrowRight size={15}/></button><button className="city-chip">Đà Nẵng <ArrowRight size={15}/></button><button className="city-chip">Cần Thơ <ArrowRight size={15}/></button></div></section><footer><span>soundpass © 2026</span><span>Những khoảnh khắc bắt đầu bằng một tấm vé.</span></footer>
  </main>;
}

function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { token, setSession } = useAuthStore();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(isRegister ? registerSchema : loginSchema) });
  if (token) return <Navigate to="/profile" replace/>;
  const submit = async (values) => {
    setServerError("");
    try { const { data } = await api.post(`/auth/${mode}`, values); setSession(data.data); navigate("/profile", { replace: true }); }
    catch (error) { setServerError(error.response?.data?.message || "Không thể kết nối máy chủ. Hãy kiểm tra backend."); }
  };
  return <main className="auth-shell"><Brand/><section className="auth-card"><div className="eyebrow muted">SOUND PASS ACCOUNT</div><h1>{isRegister ? "Bắt đầu hành trình." : "Chào mừng trở lại."}</h1><p>{isRegister ? "Tạo tài khoản để lưu những đêm nhạc bạn yêu thích." : "Đăng nhập để tiếp tục khám phá âm nhạc."}</p><form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>{isRegister && <label><span>Họ và tên</span><div className="input-wrap"><UserRound size={17}/><input autoComplete="name" placeholder="Nguyễn Minh Anh" {...register("name")}/></div>{errors.name && <small>{errors.name.message}</small>}</label>}<label><span>Email</span><div className="input-wrap"><Mail size={17}/><input type="email" autoComplete="email" placeholder="ban@email.com" {...register("email")}/></div>{errors.email && <small>{errors.email.message}</small>}</label><label><span>Mật khẩu</span><div className="input-wrap"><LockKeyhole size={17}/><input type="password" autoComplete={isRegister ? "new-password" : "current-password"} placeholder={isRegister ? "Ít nhất 8 ký tự" : "Nhập mật khẩu"} {...register("password")}/></div>{errors.password && <small>{errors.password.message}</small>}</label>{serverError && <div className="form-error" role="alert">{serverError}</div>}<button className="button submit-button" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="spin" size={17}/>} {isRegister ? "Tạo tài khoản" : "Đăng nhập"}<ArrowRight size={16}/></button></form><div className="auth-switch">{isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Đăng nhập" : "Tạo tài khoản"}</Link></div><Link className="back-home" to="/">← Về trang chủ</Link></section></main>;
}

function PasswordForm() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const submit = async (event) => {
    event.preventDefault(); setError(""); setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const currentPassword = form.get("currentPassword");
    const newPassword = form.get("newPassword");
    if (newPassword !== form.get("confirmPassword")) { setError("Mật khẩu mới nhập lại chưa khớp."); return; }
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      formElement.reset(); setMessage("Đã đổi mật khẩu.");
    } catch (e) { setError(e.response?.data?.message || "Không thể đổi mật khẩu."); }
  };
  return <form className="auth-form password-form" onSubmit={submit}><div className="eyebrow muted">BẢO MẬT</div><label><span>Mật khẩu hiện tại</span><div className="input-wrap"><input name="currentPassword" type="password" autoComplete="current-password" required/></div></label><label><span>Mật khẩu mới</span><div className="input-wrap"><input name="newPassword" type="password" autoComplete="new-password" minLength="8" required/></div></label><label><span>Nhập lại mật khẩu mới</span><div className="input-wrap"><input name="confirmPassword" type="password" autoComplete="new-password" minLength="8" required/></div></label>{message && <div className="form-success">{message}</div>}{error && <div className="form-error" role="alert">{error}</div>}<button className="button submit-button">Đổi mật khẩu</button></form>;
}

function ProfilePage() {
  const { user, token, setUser, logout } = useAuthStore();
  const [error, setError] = useState(""); const [message, setMessage] = useState("");
  useEffect(() => { if (token && !user) api.get("/auth/me").then(({ data }) => setUser(data.data.user)).catch(() => logout()); }, [token, user, setUser, logout]);
  if (!token) return <Navigate to="/login" replace/>;
  if (!user) return <main className="auth-shell"><div className="auth-card">Đang tải hồ sơ…</div></main>;
  const update = async (event) => {
    event.preventDefault(); setError(""); setMessage(""); const form = new FormData(event.currentTarget);
    try { const { data } = await api.put("/auth/profile", { name: form.get("name"), phone: form.get("phone") || null }); setUser(data.data.user); setMessage("Đã cập nhật hồ sơ."); }
    catch (e) { setError(e.response?.data?.message || "Không thể cập nhật hồ sơ."); }
  };
  return <main className="auth-shell"><Brand/><section className="auth-card"><div className="eyebrow muted">TÀI KHOẢN CỦA BẠN</div><h1>Xin chào, {user.name}.</h1><p>{user.email} · {user.role}</p><form className="auth-form" onSubmit={update}><label><span>Họ và tên</span><div className="input-wrap"><UserRound size={17}/><input name="name" defaultValue={user.name} required minLength="2"/></div></label><label><span>Số điện thoại</span><div className="input-wrap"><input name="phone" defaultValue={user.phone || ""} placeholder="Chưa cập nhật"/></div></label>{message && <div className="form-success">{message}</div>}{error && <div className="form-error" role="alert">{error}</div>}<button className="button submit-button">Lưu hồ sơ <ArrowRight size={16}/></button></form><PasswordForm/><button className="text-button logout-button" onClick={logout}>Đăng xuất</button><Link className="back-home" to="/">← Về trang chủ</Link></section></main>;
}

export default function App() {
  return <Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<AuthPage mode="login"/>}/><Route path="/register" element={<AuthPage mode="register"/>}/><Route path="/profile" element={<ProfilePage/>}/><Route path="*" element={<Home/>}/></Routes>;
}
