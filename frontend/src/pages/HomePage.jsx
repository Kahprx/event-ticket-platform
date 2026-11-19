import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  MapPin,
  Music2,
  QrCode,
  Search,
  Sparkles,
  Ticket,
} from "lucide-react";
import { categories, events, locations } from "../data/events.js";
import { useAppStore } from "../store/appStore.js";
import { useMockLoad } from "../hooks/useMockLoad.js";
import EventGrid from "../components/EventGrid.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import SearchBar from "../components/SearchBar.jsx";
import LocationSelector from "../components/LocationSelector.jsx";
import { CompactEventCard } from "../components/EventCard.jsx";

const quickSearches = ["Soundwave", "Indie", "Acoustic", "EDM"];

export default function HomePage() {
  const navigate = useNavigate();
  const locationId = useAppStore((state) => state.locationId);
  const [query, setQuery] = useState("");
  const loading = useMockLoad(450, [locationId]);

  const currentLocation = locations.find((location) => location.id === locationId) || locations[0];

  const upcoming = events
    .filter((event) => event.status !== "ended")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const nearYou = upcoming.filter((event) => event.locationId === locationId).slice(0, 6);
  const fallbackNear = nearYou.length > 0 ? nearYou : upcoming.slice(0, 6);
  const featured = upcoming.filter((event) => event.featured).slice(0, 3);
  const heroPicks = upcoming
    .filter((event) => event.locationId === locationId)
    .slice(0, 2);

  const runSearch = (value) => {
    const keyword = (value || "").trim();
    navigate(keyword ? `/events?q=${encodeURIComponent(keyword)}` : "/events");
  };

  return (
    <>
      {/* Hero: phần tìm kiếm đặt ngay trong khu vực tối, không dùng hiệu ứng trang trí */}
      <section className="bg-ink-950 text-white">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-16">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
              <span className="h-px w-6 bg-accent" />
              Soundpass · Đặt vé âm nhạc
            </p>
            <h1 className="mt-3 max-w-xl font-display text-[32px] font-extrabold leading-[1.12] sm:text-[42px]">
              Tìm đêm nhạc gần bạn, giữ chỗ trong vài phút.
            </h1>
            <p className="mt-4 max-w-xl text-[14px] leading-7 text-white/65">
              Sự kiện theo thành phố, thể loại và mức giá. Chọn ghế hoặc vé đứng,
              thanh toán xong là có mã QR trong tay — không cần đăng ký để xem giá.
            </p>

            <div className="mt-7 max-w-2xl">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="min-w-0 flex-1">
                  <SearchBar value={query} onChange={setQuery} onSubmit={runSearch} large />
                </div>
                <div className="sm:w-56">
                  <LocationSelector variant="dark" full />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-white/45">
                <span>Tìm nhanh:</span>
                {quickSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => runSearch(item)}
                    className="rounded-md border border-white/15 px-2 py-0.5 text-white/70 hover:border-white/35 hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-[12px] text-white/55">
              <span><strong className="text-white">{events.length}</strong> sự kiện</span>
              <span><strong className="text-white">{locations.length}</strong> thành phố</span>
              <span><strong className="text-white">{categories.length - 1}</strong> thể loại âm nhạc</span>
              <span>Phí dịch vụ chỉ 2%</span>
            </div>
          </div>

          {/* Panel phải dùng dữ liệu thật của khu vực đang chọn */}
          <aside className="card border-white/10 bg-white p-4 text-ink-900 shadow-none">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-2">
                  Đang diễn ra tại
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[15px] font-bold">
                  <MapPin size={15} className="text-accent" />
                  {currentLocation.name}
                </p>
              </div>
              <span className="badge badge-accent">{heroPicks.length || upcoming.length} sự kiện</span>
            </div>

            <div className="mt-3 space-y-2">
              {(heroPicks.length > 0 ? heroPicks : upcoming.slice(0, 2)).map((event) => (
                <CompactEventCard key={event.id} event={event} />
              ))}
            </div>

            <Link
              to="/events"
              className="mt-3 flex items-center justify-between rounded-md bg-paper px-3 py-2.5 text-[13px] font-semibold text-ink-900 hover:bg-paper-2"
            >
              Xem tất cả sự kiện tại {currentLocation.shortName}
              <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      </section>

      {/* Sự kiện gần bạn */}
      <section className="section">
        <div className="container-page">
          <SectionHeader
            eyebrow="Theo khu vực"
            title={`Sắp diễn ra tại ${currentLocation.name}`}
            description="Sự kiện được cập nhật theo thành phố bạn chọn trên thanh điều hướng."
            actionLabel="Xem tất cả"
            actionTo="/events"
          />
          <EventGrid events={fallbackNear} loading={loading} skeletonCount={3} />
        </div>
      </section>

      {/* Thể loại — nền sáng, bố cục không đều để tránh cảm giác template */}
      <section className="border-y border-line bg-white section">
        <div className="container-page">
          <SectionHeader
            eyebrow="Khám phá"
            title="Chọn theo thể loại bạn thích"
            description="Từ đêm acoustic trong phòng trà đến festival ngoài trời."
            actionLabel="Tất cả sự kiện"
            actionTo="/events"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.filter((category) => category.id !== "all").map((category, index) => (
              <Link
                key={category.id}
                to={`/events?category=${category.id}`}
                className={`group flex min-h-[112px] flex-col justify-between rounded-xl border p-4 transition hover:border-[#cfc8ba] ${
                  index === 0 ? "bg-ink-900 text-white border-ink-900" : "card"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-md ${
                      index === 0 ? "bg-white/10 text-accent" : "bg-accent-soft text-accent-dark"
                    }`}
                  >
                    <Music2 size={16} />
                  </span>
                  <ArrowRight size={15} className={index === 0 ? "text-white/50" : "text-muted-2"} />
                </div>
                <div className="mt-3">
                  <p className="text-[14px] font-bold">{category.name}</p>
                  <p className={`mt-0.5 text-[12px] ${index === 0 ? "text-white/55" : "text-muted"}`}>
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Đang được quan tâm */}
      <section className="section">
        <div className="container-page">
          <SectionHeader
            eyebrow="Được quan tâm"
            title="Đêm nhạc đang cháy vé"
            description="Một vài sự kiện được nhiều người theo dõi nhất hiện tại."
            actionLabel="Xem lịch"
            actionTo="/events"
          />
          <EventGrid events={featured} />
        </div>
      </section>

      {/* AI chatbot entry point — gọn, nằm ngang, không che nội dung */}
      <section className="pb-12">
        <div className="container-page">
          <div className="grid gap-6 rounded-xl bg-ink-900 px-6 py-7 text-white md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                <Sparkles size={13} />
                Trợ lý Soundpass
              </p>
              <h2 className="mt-2 font-display text-xl font-bold sm:text-2xl">
                Chưa biết chọn đêm nào? Hỏi trợ lý một câu.
              </h2>
              <p className="mt-2 max-w-2xl text-[13px] leading-6 text-white/60">
                Ví dụ: “Cuối tuần này có gì ở TP. Hồ Chí Minh?” hoặc “Tìm sự kiện EDM dưới 500.000 ₫”.
                Trợ lý sẽ gợi ý sự kiện kèm giá và địa điểm.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:flex-col">
              <Link to="/chatbot" className="btn btn-primary">
                <Bot size={16} />
                Mở trợ lý AI
              </Link>
              <span className="hidden text-[11px] text-white/40 md:block">Có sẵn trên mọi trang</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quy trình đặt vé */}
      <section className="border-t border-line bg-white pb-16 pt-12">
        <div className="container-page">
          <SectionHeader
            eyebrow="Quy trình"
            title="Bốn bước là có vé"
            description="Thiết kế tối giản để đặt vé nhanh cả trên điện thoại."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Search, title: "Tìm sự kiện", text: "Lọc theo thành phố, ngày, thể loại và mức giá." },
              { icon: Ticket, title: "Chọn chỗ", text: "Chọn ghế trên sơ đồ hoặc số lượng vé đứng." },
              { icon: QrCode, title: "Thanh toán", text: "Điền thông tin, áp mã giảm giá nếu có." },
              { icon: CalendarDays, title: "Nhận vé", text: "Mã QR hiện ngay trong Vé của tôi." },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex gap-3 rounded-lg border border-line p-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-md bg-ink-900 text-white">
                      <Icon size={16} />
                    </span>
                    <span className="text-[10px] font-bold text-muted-2">0{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-ink-900">{step.title}</p>
                    <p className="mt-1 text-[12px] leading-5 text-muted">{step.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
