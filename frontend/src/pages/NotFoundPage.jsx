import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-paper px-5 py-16">
      <div className="max-w-md text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-ink-900 text-white">
          <Compass size={24} />
        </span>
        <p className="mt-5 font-display text-5xl font-extrabold text-ink-900">404</p>
        <h1 className="mt-2 text-lg font-bold text-ink-900">Không tìm thấy trang</h1>
        <p className="mt-2 text-[13px] leading-6 text-muted">
          Đường dẫn có thể đã thay đổi hoặc sự kiện không còn tồn tại. Quay lại trang chủ để tiếp tục.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={15} />
            Về trang chủ
          </Link>
          <Link to="/events" className="btn btn-secondary">Xem sự kiện</Link>
        </div>
      </div>
    </div>
  );
}
